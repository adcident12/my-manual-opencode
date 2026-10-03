/**
 * Graft deep-integration plugin for OpenCode (global, cross-platform).
 * Ports the auto-inject-context behavior that graft only ships natively
 * for Claude Code, using graft's public CLI (`graft ask --json`) instead
 * of internal modules.
 *
 * No longer does a manual auto-rebuild-on-edit: current graft CLI versions
 * refresh the graph themselves before answering any query (verified live —
 * an edit followed immediately by `graft ask`, no `graft build` in between,
 * printed "[graft] refreshed the graph (1 file changed) before answering").
 * The old debounced `graft build` hook here was therefore redundant, and
 * was the direct cause of the rebuild/ask race condition documented in
 * gotchas.md #6 — removing it fixes that race by removing its cause.
 *
 * Injection gate mirrors graft 0.19's own Claude prompt hook
 * (dist/claude/format.js `relevantRetrieval`), which replaced the old
 * single `coverage` floor (unchanged through graft 0.21.1):
 *   1. strength — lexical results inject only if the top hit matched a
 *      symbol NAME (`coverageStrong` >= STRONG_FLOOR) or matched the query
 *      broadly (`coverage` >= HIGH_FLOOR); otherwise a short nudge is
 *      injected instead (at most NUDGE_CAP per session). Structural results
 *      carry no coverage score and always pass.
 *   2. novelty — pointers already injected this session are dropped; if
 *      none remain, nothing is injected.
 *
 * OpenCode specifics (verified against opencode v1.18.32 source):
 * - `experimental.chat.messages.transform` edits are NOT persisted — the
 *   prompt loop reloads messages from storage on every agent step
 *   (session/prompt.ts). Claude Code keeps hook output in the transcript,
 *   so to match that (and to keep the novelty gate honest and the prompt
 *   prefix cache-stable) each message's context is computed once, cached by
 *   message ID, and re-attached to that message on every call.
 * - Compaction also fires this hook (session/compaction.ts) on older
 *   history, so a new `graft ask` runs only when the last message is the
 *   user's — i.e. the first step of a fresh turn.
 * - OpenCode's own reminders push `synthetic` text parts into the user
 *   message (plan mode etc.); those are excluded from the query.
 */
import { spawn } from 'node:child_process';

const isWin = process.platform === 'win32';
const MIN_PROMPT_CHARS = 12;
const ASK_TIMEOUT_MS = 8000;
const STRONG_FLOOR = 0.1; // graft dist/ask/fuse.js
const HIGH_FLOOR = 0.5; // graft dist/ask/fuse.js
const PACK_CAP = 3;
const NUDGE_CAP = 2;
const INJECTED_POINTERS_CAP = 40;

export const GraftDeepPlugin = async ({ directory }) => {
  const spawnFn = isWin ? (await import('cross-spawn')).default : spawn;

  const contexts = new Map(); // messageID -> injected text, or null (asked, nothing to inject)
  const sessions = new Map(); // sessionID -> { injectedPointers, nudges }

  function sessionState(id) {
    let s = sessions.get(id);
    if (!s) sessions.set(id, (s = { injectedPointers: [], nudges: 0 }));
    return s;
  }

  // Async so a slow ask never blocks OpenCode's event loop (TUI, other sessions).
  function graftAsk(prompt) {
    const args = ['-y', '@nanonets/graft', 'ask', prompt, '.', '--json', '-n', String(PACK_CAP)];
    return new Promise((resolve) => {
      let out = '';
      let child;
      try {
        child = spawnFn('npx', args, { cwd: directory, stdio: ['ignore', 'pipe', 'ignore'], windowsHide: true });
      } catch {
        return resolve(null);
      }
      const timer = setTimeout(() => {
        child.kill();
        resolve(null);
      }, ASK_TIMEOUT_MS);
      child.stdout.setEncoding('utf8');
      child.stdout.on('data', (c) => (out += c));
      child.on('error', () => {
        clearTimeout(timer);
        resolve(null);
      });
      child.on('close', (code) => {
        clearTimeout(timer);
        try {
          resolve(code === 0 && out ? JSON.parse(out) : null);
        } catch {
          resolve(null);
        }
      });
    });
  }

  function weakMatchNudge(s, strong) {
    if (s.nudges >= NUDGE_CAP) return null;
    s.nudges += 1;
    return `[graft] no strong match for this prompt (name-field match ${strong.toFixed(2)}) — the graph ` +
      'has more than this probe found. Use the graft MCP tools (or `graft ask "<your task>" --source`) before grepping.';
  }

  function formatContext(result, s) {
    const hits = result?.hits;
    if (!Array.isArray(hits) || hits.length === 0) return null;

    const lexical = typeof result.coverage === 'number' || typeof result.coverageStrong === 'number';
    if (lexical) {
      const strong = result.coverageStrong ?? 0;
      const broad = result.coverage ?? 0;
      if (strong < STRONG_FLOOR && broad < HIGH_FLOOR) return weakMatchNudge(s, strong);
    }

    const seen = new Set(s.injectedPointers);
    const fresh = hits.filter((h) => !seen.has(h.pointer)).slice(0, PACK_CAP);
    if (fresh.length === 0) return null;
    s.injectedPointers = [...s.injectedPointers, ...fresh.map((h) => h.pointer)].slice(-INJECTED_POINTERS_CAP);

    const lines = fresh.map((h) => `- ${h.title} — ${(h.pointer ?? '').split(',')[0].trim()}`);
    return `[graft] possibly relevant code for this request:\n${lines.join('\n')}\n(use the graft MCP tools for full detail if needed)`;
  }

  function attach(msg, text) {
    msg.parts.push({
      id: `${msg.info.id}-graft`,
      messageID: msg.info.id,
      sessionID: msg.info.sessionID,
      type: 'text',
      text,
      synthetic: true,
    });
  }

  return {
    'experimental.chat.messages.transform': async (_input, output) => {
      if (process.env.GRAFT_AUTO_CONTEXT === '0') return;
      const messages = output?.messages;
      if (!messages?.length) return;

      // Fresh turn: the user's message is the last one (not a later agent step,
      // not a compaction pass over older history). Ask graft once for it.
      const last = messages[messages.length - 1];
      if (last.info.role === 'user' && last.info.id && !contexts.has(last.info.id)) {
        const text = last.parts
          .filter((p) => p.type === 'text' && !p.synthetic && !p.ignored)
          .map((p) => p.text)
          .join(' ')
          .trim();
        if (text.length >= MIN_PROMPT_CHARS) {
          contexts.set(last.info.id, null); // claim it; a failed ask is not retried
          const result = await graftAsk(text);
          if (result) contexts.set(last.info.id, formatContext(result, sessionState(last.info.sessionID || 'default')));
        }
      }

      // Re-attach every cached context so it stays visible on later steps and turns.
      for (const m of messages) {
        if (m.info.role !== 'user') continue;
        const ctx = contexts.get(m.info.id);
        if (ctx) attach(m, ctx);
      }
    },
  };
};
