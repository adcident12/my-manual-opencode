/**
 * Graft deep-integration plugin for OpenCode 2 (global, cross-platform).
 * Ports the auto-inject-context behavior that graft only ships natively
 * for Claude Code, using graft's public CLI (`graft ask --json`) instead
 * of internal modules.
 *
 * No manual auto-rebuild-on-edit: the graft CLI refreshes the graph itself
 * before answering any query, so a separate `graft build` hook only races it.
 *
 * Injection gate mirrors graft's own Claude prompt hook (`relevantRetrieval`):
 *   1. strength — lexical results inject only if the top hit matched a
 *      symbol NAME (`coverageStrong` >= STRONG_FLOOR) or matched the query
 *      broadly (`coverage` >= HIGH_FLOOR); otherwise a short nudge is
 *      injected instead (at most NUDGE_CAP per session). Structural results
 *      carry no coverage score and always pass.
 *   2. novelty — pointers already injected this session are dropped; if
 *      none remain, nothing is injected.
 *
 * OpenCode 2 specifics (plugin API docs, opencode v2.0.26):
 * - V1 plugin functions do not load on V2; this file default-exports a V2
 *   definition ({ id, setup }).
 * - The context is appended in the `prompt` hook, which runs once when a
 *   user prompt is admitted and whose edits become the persisted user
 *   message. That matches Claude Code, where hook output stays in the
 *   transcript: the context is asked once per turn, survives later agent
 *   steps, and keeps the prompt prefix cache-stable. The `context` hook
 *   would instead run before every model call and change nothing durable.
 * - Synthetic messages, compaction and shell messages do not run the
 *   prompt hook, so no extra guard is needed for them.
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

export default {
  id: 'graft-deep',
  async setup(ctx) {
    const directory = ctx.location.directory;
    const spawnFn = isWin ? (await import('cross-spawn')).default : spawn;
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

    await ctx.session.hook('prompt', async (event) => {
      if (process.env.GRAFT_AUTO_CONTEXT === '0') return;
      const text = (event.prompt?.text ?? '').trim();
      if (text.length < MIN_PROMPT_CHARS) return;
      const result = await graftAsk(text);
      const context = result && formatContext(result, sessionState(event.sessionID ?? 'default'));
      if (context) event.prompt.text = `${event.prompt.text}\n\n${context}`;
    });
  },
};
