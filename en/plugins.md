---
tags: [project-doc, plugins, opencode, reference]
updated: 2026-10-03
summary: superpowers (skill library), grill-me/grilling (a batch-interview skill complementing superpowers), graft-deep (a hand-written custom plugin), ponytail (a code-minimization ruleset), and i-have-adhd (forces terse, to-the-point replies) — how to install each, and OpenCode's Plugin Hook API
---

# Plugins

Overview at [[index]] · MCP servers at [[mcp-servers]]

> [!note] Before you start
> Git must already be installed (for plugins that come from `git+https://`) — see [[setup]] Part 0.

---

## superpowers — skill library

[obra/superpowers](https://github.com/obra/superpowers) is a set of "skills" — instructions that force the agent to follow good workflows, like brainstorming, systematic-debugging, test-driven-development, writing-plans. Originally built for Claude Code, but with a dedicated OpenCode integration.

### Standard install

```jsonc
{ "plugin": ["superpowers@git+https://github.com/obra/superpowers.git"] }
```

Restart OpenCode then check:

```bash
opencode debug skill
```

You should see all 14 skills: brainstorming, systematic-debugging, writing-plans, test-driven-development, executing-plans, using-git-worktrees, verification-before-completion, receiving-code-review, requesting-code-review, subagent-driven-development, finishing-a-development-branch, dispatching-parallel-agents, writing-skills, and using-superpowers.

> [!info] How superpowers injects context
> superpowers injects a "bootstrap" into the **first** user message of a session (not a system message) — done intentionally to cut token bloat and avoid problems some models (e.g. Qwen) have with multiple system messages. There's no ready-made flag to turn this behavior off.

### How to fix GitHub being blocked by the network

If `git+https://github.com/...` fails to install, always check the error message first — there are 2 distinct causes with different fixes:

**Case 1 — you get an outright block page** (e.g. FortiGate's "Application Blocked") when visiting github.com in a browser — the network really is blocking it as IT policy.

> [!warning] Don't try to bypass network policy
> If it's an outright block page, don't try to get around it — that's a deliberate IT policy. Use the method below instead, or ask IT for an allowlist.

How to install without going through GitHub:

1. **Use a local path where the source already exists** — if Claude Code already has superpowers installed (through some other, unblocked channel like a plugin marketplace), point `plugin` at that path directly instead of a git URL:

   ```jsonc
   { "plugin": ["C:/Users/<user>/.claude/plugins/cache/claude-plugins-official/superpowers/<version>"] }
   ```

   This works because the package already has `main` pointing at `.opencode/plugins/superpowers.js` built in — no network needed at all.

2. **Another option if Claude Code isn't installed** — download the repo as a zip from the GitHub web page (works even if `git clone` doesn't, as long as you can reach github.com in a browser), extract it anywhere, then point `plugin` at that path instead.

**Case 2 — the error is an SSL certificate issue, not a block page:**

```
fatal: unable to access 'https://github.com/...': unable to get local issuer certificate
```

This usually means the organization does SSL inspection (MITM with a corporate root CA), but `git` doesn't trust that CA — a browser trusts it because Windows/the OS has the CA installed, but git uses its own certificate store. This is a signal that **the network allows it, but git doesn't trust the cert** — different from an outright block.

> [!caution] Always ask the user before fixing this
> This can be fixed by configuring git to use the Windows certificate store (`git config http.sslBackend schannel`), but **always ask the user first** — technically, this means trusting the organization's MITM cert, which isn't a decision to make unilaterally.

**Once IT allows GitHub**, switch back to the normal git URL (so it auto-updates to new versions going forward) — don't forget to clear the old cache left over from a failed clone, or opencode may not re-clone it fresh:

```bash
rm -rf ~/.cache/opencode/packages/<plugin-name>@git+https_
```

---

## grill-me / grilling — batch-interview skill (complements superpowers, not a plugin)

[mattpocock/skills](https://github.com/mattpocock/skills) is a community skill by Matt Pocock (Total TypeScript / AI Hero), distributed as standalone `SKILL.md` files following the open **Agent Skills** standard (the same spec Claude Code uses, and OpenCode supports natively with no changes needed) — **not a plugin**, so nothing needs to be added to the `plugin` array in `opencode.jsonc` at all. See the full standalone-skill mechanism at [[setup]], the "Standalone skills following the Agent Skills open standard" section.

Works as a pair of 2 files:

- `grill-me` — just an entry point (has the frontmatter field `disable-model-invocation: true`, which is Claude-Code-specific — OpenCode doesn't recognize this field and will **silently ignore it, no harm done**; see [[setup]]). It just forwards to `grilling`.
- `grilling` — the real logic: interviews the user as a "design tree" — every decision branches into sub-decisions. Asks in **rounds**, firing every question that's ready to be asked at once (called the frontier); each question always comes with a recommended answer (`➡️`). Ends when there are no questions left and the user confirms shared understanding.

> [!info] How it differs from `superpowers brainstorming`
> `brainstorming` (section above) also asks clarifying questions, but one at a time, and for bounded/architectural work it ends by writing a spec file under `docs/superpowers/specs/`. `grilling` asks in a batch instead (firing several questions per round) and writes no file at all — good for a local model where every turn is slow (fewer turns is better). See "Wiring it to superpowers brainstorming" below for why these two need to be wired together instead of left to collide.

### Install (vendor the files directly, not through a plugin manager)

Create these 2 files in OpenCode's **global skills folder** (works immediately in every project, nothing to set up per repo):

```
~/.config/opencode/skills/grill-me/SKILL.md
~/.config/opencode/skills/grilling/SKILL.md
```

`~/.config/opencode/skills/grill-me/SKILL.md`:

```markdown
---
name: grill-me
description: A relentless interview to sharpen a plan or design.
disable-model-invocation: true
---

Call the Skill tool with "grilling".
```

`~/.config/opencode/skills/grilling/SKILL.md` — the version adjusted for this setup (see "Adjusting it for this setup" below for exactly what differs from the original):

````markdown
---
name: grilling
description: Grill the user relentlessly about a plan, decision, or idea. Use when the user wants to stress-test their thinking, or uses any 'grill' trigger phrases.
---

Interview the user relentlessly until you reach a shared understanding. Map this as a **design tree**: every decision branches into the decisions that hang off it.

Work the tree in **rounds**. The **frontier** is every decision whose prerequisites are already settled: the questions you can ask _now_ without guessing at answers you haven't heard yet. Ask the whole frontier in one round: number each question and give your recommended answer. Then wait for the user's answers before the next round.

Format a round like so:

```
❓ **Q1** - **<question title>**: <question body, might be multiple paragraphs, including multiple choices>

➡️ <your recommended answer>

---

❓ **Q2** - **<question title>**: <question body, might be multiple paragraphs, including multiple choices>

➡️ <your recommended answer>
```

Each round the user answers reshapes the tree: settled decisions push the frontier outward and unblock questions that depended on them. Recompute the frontier and ask the next round. A question whose answer depends on another question still open in this round belongs to a _later_ round, not this one.

Finding _facts_ is your job, never the user's. When a frontier question needs a fact from the environment (filesystem, tools, etc.), look it up yourself inline before asking the user anything you could find out yourself: if the project has a `graft/` index, run `graft ask "<question>"` first; otherwise fall back to grep or reading files directly. Do this synchronously while preparing each round — only dispatch a sub-agent for it if one is available and the lookup is heavy enough to warrant it. The _decisions_ are the user's: put each to them and wait.

The session is done when the frontier is empty: every branch of the design tree visited, nothing left silently assumed. Do not act on it until the user confirms you have reached a shared understanding.
````

No need to restart OpenCode — file-based skills load through the native skill tool and can be called immediately after saving the file (unlike a plugin, which only loads when a session starts). Test it directly in a session with a sentence containing "grill," e.g. `grill me about <an idea>`.

> [!note] The unmodified original is at
> - https://raw.githubusercontent.com/mattpocock/skills/main/skills/productivity/grill-me/SKILL.md
> - https://raw.githubusercontent.com/mattpocock/skills/main/skills/productivity/grilling/SKILL.md

### Adjusting it for this setup (important — don't skip)

The original `grilling` uses the phrase "dispatch a sub-agent to find [a fact]" in the "Finding facts is your job" paragraph — if your workflow relies little on subagents / mostly executes inline (like this setup), that paragraph should be changed to **always look up facts yourself, inline first**: call `graft ask` if the project has a graft index (see [[mcp-servers]], the "graft" section), then fall back to grep/reading files directly if not — only dispatch a sub-agent when one is actually available and the task is heavy enough to warrant it (the code block above is already the adjusted version).

> [!tip] Why bother changing it
> `graft`/subagents are optional — not every setup has or wants to use them the same way. Always adjust the instructions to match your actual tools/working style rather than copying the original verbatim. Every time you update from upstream, this adjustment has to be merged back in too (see [[updating]]).

### Wiring it to superpowers brainstorming (must do this if superpowers is already installed)

`brainstorming` (section above) already has its own hard gate: **"MUST use this before any creative work"** — add `grilling` without writing a reconciliation rule first, and you get **two gates fighting over the same moment** ("before starting new work"), which is a high risk for a small/local model to pick the wrong one or ask two overlapping rounds.

The fix is writing a rule in the **global** `~/.config/opencode/AGENTS.md` (see [[setup]], "AGENTS.md — global vs project instructions," for why it must be global, not project-level) so that `grilling` **complements** `brainstorming` instead of competing with it:

```markdown
## Grill me — complements superpowers brainstorming, doesn't duplicate it

This setup also runs the `superpowers` plugin. Its `brainstorming` skill is
the primary gate before creative work (new features, new subsystems,
behavior changes) — it already classifies scope, asks clarifying
questions, proposes approaches, and for bounded/architectural work writes
a spec under `docs/superpowers/specs/` before any implementation plan.
Do not add a second gate on top of it: if brainstorming has already run
(or is running) for a piece of work, do not also invoke `grilling` as a
separate pre-check for that same work.

Use `grilling` in exactly two situations instead:

1. **Inside** brainstorming's "ask clarifying questions" step: instead of
   asking one question at a time, batch the current frontier into
   `grilling`'s round format — numbered questions with a recommended
   answer each, resolved via the design-tree/frontier method — then fold
   the answers back into the brainstorming flow. This is a formatting
   upgrade to that one step, not a separate skill invocation cycle.
2. **Standalone**, outside any SDD/brainstorming flow: when the user
   explicitly wants to stress-test an idea or decision quickly (e.g. says
   "grill me about X"), with no spec file produced — this is a
   spike-level conversation, not project planning.

When a `grilling` round needs a fact from the codebase rather than a
user decision, look it up yourself inline before asking: if the project
has a `graft/` index, run `graft ask "<question>"` first; otherwise fall
back to grep or reading files directly. Only dispatch a sub-agent for it
if one is available and the lookup is heavy enough to warrant it.
```

> [!warning] Why it has to be global, not a project AGENTS.md
> Writing this rule only in a project-level AGENTS.md (the file `graft init` writes automatically — see [[mcp-servers]]) would only work in that one repo. Any other project that hasn't run `graft init` yet, or has no `AGENTS.md`, would have no reconciliation rule at all — and `grilling` would go right back to colliding with `brainstorming` the moment you switch projects.

### Confirmed working in practice (2 live test cases)

> [!info] Real test results on a small browser-game project (local model, not cloud)
> **Case 1 — calling `grilling` directly** ("grill me about ...") → the model correctly identified this as the standalone case and never called `brainstorming` at all; found facts via `graft ask` inline (no subagent); asked 2 rounds (8 questions total) in the specified format; no spec file was created; waited for a go-ahead before implementing; ended with the feature implemented + browser-verified + committed successfully.
>
> **Case 2 — asking for a feature directly, without saying "grill"** ("please add ... for me") → the model called `brainstorming` first per the main gate, classified scope (bounded/architectural), explored the code with graft, then **used grilling's question format instead of asking one at a time** (exactly matching the rule written in the global AGENTS.md — visible directly in the reasoning trace quoting that rule verbatim). `grilling` was never invoked as a second, separate skill call, and there was no duplicate round of questions. Also ended with implementation + tests + a successful commit (no spec file, since it was classified as bounded).
>
> Neither case dispatched a subagent at any point during the session, exactly as intended.

> [!warning] Re-tested 2026-10-03 — case 2 doesn't always use graft
> A second headless end-to-end run (a small feature in a copy of the same game) found `brainstorming` called correctly, but during exploration the agent followed the skill's *"Explore project context — check files, docs, recent commits"* and `read` files one by one instead of using graft — the grill-me rule above only covers fact-finding during grilling, not brainstorming's exploration step. So a "Exploring a codebase — graft first, even inside a skill" rule was added to the global AGENTS.md (full text and before/after in [[tuning]] sections 4–5, [[gotchas]] item 12).

---

## graft-deep — custom plugin (auto-inject context)

graft (see [[mcp-servers]]) has no "deep integration" for OpenCode — auto-injecting relevant context into each prompt — that feature only ships for Claude Code (auto-rebuild after edits, meanwhile, is now done by the graft CLI itself for every agent; see the box below). This plugin ports the auto-inject behavior using graft's public CLI (`graft ask --json`) instead of importing internal modules — safer, and it doesn't break when graft updates.

> [!info] There used to be an auto-rebuild hook too — removed (2026-09-13)
> The first version of this plugin had a `tool.execute.after` hook that debounced 3 seconds and then ran `graft build` in the background after every file edit. A live test confirmed that's **no longer needed**: editing a file and immediately calling `graft ask`, without running `graft build` at all, printed `[graft] refreshed the graph (1 file changed) before answering` — the current graft CLI auto-refreshes the graph before answering every query on its own (see [[mcp-servers]]). The removed hook wasn't just redundant — it was the cause of the race condition documented in [[gotchas]] item 6, so removing it removed the cause instead of patching the symptom.

> [!info] Updated 2026-09-25 — graft 0.19.0's new injection gate + fixes for how OpenCode actually runs this hook
> Two separate reasons, both verified against source code rather than guessed:
> 1. **graft 0.19.0 changed its own injection rule** (the Claude Code hook this plugin ports) — details under "Injection gate" below.
> 2. **The previous version was written as if OpenCode behaved like Claude Code — it doesn't.** Reading the OpenCode 1.18.32 source showed that edits made in `experimental.chat.messages.transform` are never saved, so the injected context disappeared from the second agent step onward. Details under "How OpenCode runs this hook" below.

> [!info] Re-checked 2026-10-03 — graft 0.20.0 / 0.21.1 + OpenCode 1.18.34: no code change needed
> `STRONG_FLOOR = 0.1`, `HIGH_FLOOR = 0.5`, `relevantRetrieval`, and the `ask … --json -n 3` arguments in graft's hook are all unchanged from 0.19, and `graft ask --json` still returns `hits[].title`, `hits[].pointer`, `coverage`, `coverageStrong` — a multi-step hook simulation still keeps the context attached on every step.
>
> Worth knowing: the "use graft first" hint this plugin injects isn't enough to stop the model reading files one by one when a loaded skill tells it to — that needs a rule in the global AGENTS.md too ([[gotchas]] item 12)

### Install

1. Put the file at `~/.config/opencode/plugin/graft-deep.js` (create the `plugin` folder if it doesn't exist)
2. Add that path to the `plugin` array in the global config
3. No per-project setup needed — except `graft build`, which still has to run once per repo as before (see [[mcp-servers]]); after that, graft keeps the graph fresh itself every time it's queried, nothing else needs to rebuild it

> [!note] Listed in the `plugin` array *and* sitting in the `plugin/` folder — it still loads only once
> OpenCode auto-loads every `{plugin,plugins}/*.{ts,js}` in the config dir **and** everything in the `plugin` array, then de-duplicates by exact file URL (`deduplicatePluginOrigins` in `config/plugin.ts`). Confirmed with `opencode debug config`: `graft-deep.js` appears once.

### OpenCode Plugin Hook API used

A plugin returns an object of hooks, typed as `Hooks` from `@opencode-ai/plugin` — the only one used here:

| Hook | When it fires | What graft-deep does with it |
| --- | --- | --- |
| `experimental.chat.messages.transform` | Before **every** LLM call — every agent step of a turn, and also during compaction | On the first step of a new user turn: runs `graft ask` once and caches the result by message ID. On every call: re-attaches every cached context to its message |

Other hooks are available but unused here: `tool.execute.before`, `tool.execute.after`, `chat.message`, `command.execute.before`, `session.compacting`, `event`, `tool.definition` — see the full types in `node_modules/@opencode-ai/plugin/dist/index.d.ts`

### How OpenCode runs this hook (verified in the opencode 1.18.32 source)

> [!important] Edits made in `messages.transform` are **temporary** — they last for one LLM call only
> The prompt loop reloads every message from storage at the start of each step (`session/prompt.ts`, `MessageV2.filterCompactedEffect` inside the `while (true)` loop) and only then calls the hook. Whatever the hook adds is sent to the model once and then thrown away. This is the opposite of Claude Code, whose `UserPromptSubmit` hook output is written into the transcript permanently.

What that meant for the previous version, and how this one handles it:

| OpenCode behavior | Previous version | Now |
| --- | --- | --- |
| Messages are reloaded fresh every step | Injected on step 1, then `injected.has(key)` returned early on step 2+ → **the context vanished as soon as the agent called its first tool** | The pack is computed once per message, cached by message ID, and **re-attached on every call** — it stays visible on later steps and later turns, like Claude Code's transcript |
| Compaction also calls this hook, on a copy of older history (`session/compaction.ts`) | Ran a pointless `graft ask` against an old message | `graft ask` runs only when the **last** message is the user's (the first step of a fresh turn); compaction just gets the cached contexts re-attached |
| OpenCode's own reminders push `synthetic` text parts into the user message before the hook runs (`session/reminders.ts` — plan-mode prompts etc.) | That boilerplate was mixed into the graft query | The query uses only text parts that aren't `synthetic`/`ignored`; the injected part is itself marked `synthetic: true`, OpenCode's own convention |
| Plugins run in the same process as the TUI | `crossSpawn.sync` froze OpenCode for up to 8 seconds | `graft ask` runs through an async `spawn` — the event loop keeps running |

Side effects of re-attaching: the prompt prefix stays identical from step to step (prompt-cache friendly), and the "novelty" gate below becomes honest — a pointer already shown really is still in front of the model. The cache lives in memory: after restarting OpenCode, older messages lose their pack, and the novelty memory resets along with it, so the two stay consistent.

### Injection gate (mirrors graft 0.19's own Claude Code hook)

graft 0.19.0 replaced its single `coverage` threshold (this plugin used `0.12`; graft itself used `0.15`) after finding that a borderline pack "reads as orientation and suppresses the very retrieval call it should have triggered" (`dist/claude/format.js`). The plugin now uses the same two gates as graft's `relevantRetrieval`:

1. **Strength** — a lexical result is injected only if the top hit matched a real symbol **name** (`coverageStrong ≥ 0.1`) or matched the query broadly (`coverage ≥ 0.5`). Otherwise, a one-line hint is injected instead, pointing at the graft tools — at most 2 times per session. Structural results (e.g. "who calls X") carry no coverage score and always pass — the previous version treated a missing `coverage` as `0` and silently dropped them.
2. **Novelty** — hits whose `pointer` was already injected this session are dropped (the last 40 are remembered); if none are left, nothing is injected.

A measured example (graft 0.19.0, a real Next.js repo): the prompt "who calls the api client" came back with `coverage 0.20`, `coverageStrong 0` — no hit matched a symbol name. The old `0.12` threshold would have injected those 3 unrelated hits; now it injects the hint instead. "where is createTicket defined" matched the symbol name and injected the pack.

> [!tip] Re-checking after every graft upgrade
> graft-deep has no upstream of its own, but it mirrors graft's hook, so compare it whenever graft changes version:
> ```bash
> G="$(npm root -g)/@nanonets/graft/dist"
> grep -n "STRONG_FLOOR =\|HIGH_FLOOR =" "$G/ask/fuse.js"               # the two thresholds
> grep -n "function relevantRetrieval" -A 25 "$G/claude/format.js"       # the gate itself
> grep -n "'ask', prompt" "$G/claude/hooks.js"                           # the ask flags graft itself uses
> graft ask --help                                                       # --json / -n still exist?
> ```
> Also check that `graft ask ... --json` still returns `hits[].title`, `hits[].pointer`, `coverage` and `coverageStrong` (`dist/ask/ask.d.ts`, `AskResult`).

### Key lessons from writing it (Windows-specific)

**1. `execFileSync('npx.cmd', args, {shell:false})` breaks on Windows** — throws `EINVAL`, because Windows can't spawn a `.cmd` file directly without going through a shell

**2. `shell:true` + manually concatenated strings = command injection risk** — the prompt is free text from the user's chat message; splicing it straight into a shell string isn't safe

> [!danger] Security
> Never splice free text from a user into a shell command string, even with a hand-written escape function — it's easy to get wrong and rarely covers every edge case

**3. The correct approach** is `cross-spawn` (a dependency OpenCode already has in its own `node_modules`), which handles Windows argv quoting correctly without going through a shell — imported dynamically only when `process.platform === 'win32'`. macOS/Linux use Node's built-in `spawn` directly since POSIX doesn't have this problem, so this file has no extra dependency on non-Windows at all. Both have the same async API (`spawn`, not `.sync`), so the rest of the code doesn't care which one it got.

### Full code

```js
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
 * single `coverage` floor:
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
```

### Temporarily disabling it if it's too slow

`graft ask` no longer blocks OpenCode (it's async now), but the first step of each new user turn still waits for it — at most 8 seconds, typically 2-3 (including `npx` startup). Later steps don't ask again. To turn it off without editing code, use an env var:

```bash
GRAFT_AUTO_CONTEXT=0 opencode
```

### Testing the plugin without waiting on a slow agent loop

Call the hook function directly from a node script instead of going through the LLM (very useful when the model is slow). To test it the way OpenCode really runs it, give every step a **fresh copy** of the stored messages:

```js
import { pathToFileURL } from "node:url";
const { GraftDeepPlugin } = await import(pathToFileURL("<path-to-graft-deep.js>").href);
const hooks = await GraftDeepPlugin({ directory: "<project-path>" });
const transform = hooks["experimental.chat.messages.transform"];

const storage = [{ info: { id: "u1", role: "user", sessionID: "S1" }, parts: [{ type: "text", text: "where is createTicket defined" }] }];
const step = async () => { const msgs = structuredClone(storage); await transform({}, { messages: msgs }); return msgs; };

console.log((await step())[0].parts.length);  // step 1 (asks graft): 2 if a pack/hint was injected
storage.push({ info: { id: "a1", role: "assistant", sessionID: "S1" }, parts: [{ type: "text", text: "..." }] });
console.log((await step())[0].parts.length);  // step 2 (after a tool call): still 2 — re-attached, no new graft call
```

On Windows, run it with `NODE_PATH` pointing at the folder that has `cross-spawn` (e.g. `NODE_PATH=~/.config/opencode/node_modules`), since the plugin imports it by name.

> [!info] There used to be a race-condition warning here — no longer relevant since the auto-rebuild hook was removed
> The plugin previously still had a `tool.execute.after` hook running `graft build` itself, so testing it alongside `graft ask` could collide (`graft ask` failing silently). That hook has now been removed (see the box above) since the graft CLI auto-refreshes before answering every query anyway, so this problem went away along with its cause — see [[gotchas]] item 6

---

## ponytail — code-minimization ruleset

[dietrichgebert/ponytail](https://github.com/dietrichgebert/ponytail) is a ruleset/skill that makes the agent think like "the laziest senior dev in the room" — before writing any new code, it must walk a decision ladder in order: don't write it if it's not needed → reuse what's already in the project → is there a standard library for this → a native platform feature → an already-installed dependency → can it be a one-liner → only then write as little new code as truly necessary (validation/security/accessibility still always apply, never cut for the sake of minimalism).

### Install on OpenCode

Add the plugin to `opencode.json`/`opencode.jsonc` (can sit in the same list as other plugins already there):

```jsonc
{ "plugin": ["@dietrichgebert/ponytail"] }
```

Restart OpenCode and try running `/ponytail-help` to confirm it activated.

> [!note] Requirement
> Node.js must be on PATH for the full lifecycle hooks — without it, the core skill still works, but some activation features go quiet (see how to install Node at [[setup]] Part 0).

### Available commands

| Command | What it does |
| --- | --- |
| `/ponytail [lite\|full\|ultra\|off]` | Adjust intensity or turn it off |
| `/ponytail-review` | Check the current diff for over-engineering |
| `/ponytail-audit` | Scan the whole repo for unnecessary code |
| `/ponytail-debt` | Record spots where a simplification was deferred |
| `/ponytail-gain` | View benchmark results |
| `/ponytail-help` | Quick command reference |

### Extra config (optional)

- Env var: `PONYTAIL_DEFAULT_MODE=lite|full|ultra|off`
- Or a config file: `~/.config/ponytail/config.json` (Windows: `%APPDATA%\ponytail\config.json`) — set the `defaultMode` field
- To limit ruleset injection to only certain subagents: set `PONYTAIL_SUBAGENT_MATCHER` to a regex (unset = injected into every subagent)

### Uninstall

Run the uninstall script before removing the plugin so its config gets fully cleaned up — otherwise config files are left behind:

```bash
node scripts/uninstall.js
```

> [!info] Benchmark claimed by the developer in the README
> Tested on a real FastAPI + React repo: ~54% less code (up to 94% on some individual tasks), ~20% lower cost, ~27% faster, security unchanged at 100% — these are the developer's own numbers, not independently re-verified here in real work.

---

## i-have-adhd — forces terse, to-the-point replies

[ayghri/i-have-adhd](https://github.com/ayghri/i-have-adhd) (39k+ stars, MIT) is a skill that changes the agent's **reply style**, not a code ruleset like ponytail — enforces 10 rules: always state the next action first, number steps clearly, end with one concrete next step, cut tangents/preamble/closers ("Hope this helps!"), lists capped at 5 items, give real numeric time estimates, state errors plainly with no fluff. Supports Claude Code, Cursor, Gemini, Kimi, Qwen, and OpenCode all in one package.

### Install on OpenCode

Not on npm — clone the source locally and point `plugin` directly at the `.opencode/plugins/i-have-adhd.mjs` file:

```bash
git clone https://github.com/ayghri/i-have-adhd ~/.config/opencode/vendor/i-have-adhd
```

```jsonc
{ "plugin": ["C:/Users/<user>/.config/opencode/vendor/i-have-adhd/.opencode/plugins/i-have-adhd.mjs"] }
```

Restart OpenCode and type `/i-have-adhd` in a session to turn it on (a per-session toggle only — type `stop adhd mode` or `normal mode` to turn it off).

> [!note] What this plugin actually does
> The `config` hook just registers the repo's skill directory (`skills/i-have-adhd/SKILL.md`) and the `/i-have-adhd` command with OpenCode — purely reads files inside the repo itself, no network calls/exec/eval. Checked the code and it's safe.

### Always-on (turned on automatically every session)

Normally you have to type `/i-have-adhd` at the start of every new session to toggle it. If you want the ruleset appended to the system prompt on every turn without typing it yourself, create an empty flag file:

```bash
touch ~/.config/opencode/.i-have-adhd-always
```

Turn it off permanently by deleting that flag file:

```bash
rm ~/.config/opencode/.i-have-adhd-always
```

> [!warning] Always-on changes behavior immediately for every session
> Unlike the toggle, which is limited to one session — before turning on always-on, make sure you actually want the agent replying this short/to-the-point **for every task**, not just when you're in a hurry.

### Update / remove

```bash
# Update to match the latest repo
git -C ~/.config/opencode/vendor/i-have-adhd pull

# Remove — just take the path out of the plugin array in opencode.jsonc
# (no uninstall script needed, unlike ponytail)
```
