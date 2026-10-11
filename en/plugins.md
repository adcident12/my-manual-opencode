---
tags: [project-doc, plugins, opencode, reference]
updated: 2026-10-11
summary: superpowers (skill library), grill-me/grilling (a batch-interview skill complementing superpowers), graft-deep (a hand-written custom plugin), ponytail (a code-minimization ruleset), caveman (terse replies, used instead of i-have-adhd) — how to install each on OpenCode 2, and the OpenCode 2 plugin API
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

Run `opencode service restart`, then check:

```bash
opencode plugin list     # superpowers  <commit>  superpowers@git+https://...
```

superpowers 7.0.0 brings 15 skills: brainstorming, diagnosing-superpowers, dispatching-parallel-agents, executing-plans, finishing-a-development-branch, receiving-code-review, requesting-code-review, subagent-driven-development, systematic-debugging, test-driven-development, using-git-worktrees, using-superpowers, verification-before-completion, writing-plans, writing-skills. On OpenCode 2 each one also needs an `allow` line in the `permissions` list ([[gotchas]] item 15).

> [!warning] superpowers 7.0.0 changed `brainstorming` (2026-10)
> It now sizes the work first. A "quick, clear task" (*"everything that matters is in the request"*) goes straight to code with no design to approve; a "small change" is described in chat and waits for approval; a "project" gets a written design and a plan. For unclear work it asks **one** open question per message. This setup keeps its own workflow with two global AGENTS.md rules: "Approval before building" (every behavior change waits for approval) and the grill-me rule below (questions in batched rounds) — [[gotchas]] item 23, [[tuning]] section 9.

> [!info] OpenCode 2 tool names
> superpowers' bootstrap maps its instructions to OpenCode 2's tools by itself: `shell` instead of `bash`, `subagent` instead of `task`. There is **no todo tool** on OpenCode 2 — a plan is tracked in its markdown file instead.

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

> [!important] Rewritten for OpenCode 2 (2026-10-11)
> OpenCode 2 doesn't run V1 plugins ([[gotchas]] item 20), so the plugin now default-exports `{ id: 'graft-deep', setup(ctx) }`. The context is appended in the **`prompt` hook**: it runs once when your prompt is admitted, and whatever it adds is saved as part of your message. That is the Claude Code behavior this plugin was always trying to copy — the cache-and-re-attach workaround OpenCode 1 needed is gone. The injection gate and the async, injection-safe `graft ask` call are unchanged.
>
> Visible difference: the `[graft] possibly relevant code…` lines now appear under your message in the session history.

### Install

1. Put the file at `~/.config/opencode/plugin/graft-deep.js` (create the `plugin` folder if it doesn't exist). On Windows, also run `npm install cross-spawn` in `~/.config/opencode` once.
2. Nothing to add to the `plugin` array — OpenCode 2 loads `.js` files in that folder by itself, and a file path in the array is rejected ([[gotchas]] item 21)
3. `opencode service restart`, then `opencode api GET /api/plugin` should list `graft-deep` as `active`
4. No per-project setup needed — except `graft build`, which still has to run once per repo as before (see [[mcp-servers]]); after that, graft keeps the graph fresh itself every time it's queried, nothing else needs to rebuild it

### OpenCode 2 plugin API used

A V2 plugin default-exports a definition; `setup(ctx)` registers hooks on the domain that owns them. graft-deep uses one:

| Hook | When it fires | What graft-deep does with it |
| --- | --- | --- |
| `ctx.session.hook("prompt", …)` | Once per user prompt, before it is saved — not for synthetic messages, shell commands or compaction | Runs `graft ask` on `event.prompt.text` and appends the pack (or the hint) to it; the edit becomes the saved user message |

Other hooks used in this setup: `ctx.session.hook("context", …)` (runs before **every** model call; caveman pushes its rule set into `event.system` there) and `ctx.event.subscribe()` (caveman watches `session.created`). The full list is in OpenCode's [plugin docs](https://opencode.ai/v2/docs/build/plugins/); the V1 → V2 mapping is in [[gotchas]] item 20.

> [!note] OpenCode 1 history
> On OpenCode 1 the plugin used `experimental.chat.messages.transform`, whose edits were thrown away after every model call, so it had to cache each pack by message ID and re-attach it on every step ([[gotchas]] item 9). The `prompt` hook makes all of that unnecessary.

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

> [!tip] Ready-to-copy file: [`config/plugin/graft-deep.js`](../config/plugin/graft-deep.js)
> The code below is the same file — treat the one in `config/` as the source when copying it to `~/.config/opencode/plugin/`.

```js
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
```

### Temporarily disabling it if it's too slow

`graft ask` no longer blocks OpenCode (it's async now), but the first step of each new user turn still waits for it — at most 8 seconds, typically 2-3 (including `npx` startup). Later steps don't ask again. To turn it off without editing code, use an env var:

```bash
GRAFT_AUTO_CONTEXT=0 opencode
```

### Testing the plugin without waiting on a slow agent loop

Call `setup` with a minimal fake `ctx` from a node script, then run the captured `prompt` hook directly — no model, no OpenCode:

```js
import { pathToFileURL } from "node:url";
const plugin = (await import(pathToFileURL("<path-to-graft-deep.js>").href)).default;
let onPrompt;
await plugin.setup({
  location: { directory: "<project-path>" },
  session: { hook: async (name, fn) => { if (name === "prompt") onPrompt = fn; } },
});
for (const text of ["where is drawTrack defined", "where is drawTrack defined"]) {
  const event = { sessionID: "S1", prompt: { text } };
  await onPrompt(event);
  console.log(event.prompt.text);   // 1st: the prompt + "[graft] possibly relevant code…"; 2nd: unchanged (novelty gate)
}
```

On Windows, run it with `NODE_PATH` pointing at the folder that has `cross-spawn` (e.g. `NODE_PATH=~/.config/opencode/node_modules`).

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

## caveman — short, to-the-point replies (used instead of i-have-adhd)

[JuliusBrussee/caveman](https://github.com/JuliusBrussee/caveman) (Apache-2.0) has two parts: a **skill** that makes the agent reply shorter, and a **proxy** that shrinks tool output before it reaches the model. This setup uses **only the skill** (why not the proxy: end of this section).

The skill's rules: answer first, then the reason · no greeting, recap, or closer · short words · one idea per sentence · reply in the user's language · **code, commands, paths, numbers, and error text are always written out in full** · it drops back to full sentences on its own for security warnings and irreversible actions.

> [!info] Why it replaced i-have-adhd (2026-10-03)
> Both do the same job (control reply style); running both stacks two rule sets. caveman turns on by itself every session, can be toggled (`/caveman off`), and brings `/caveman-commit` / `/caveman-review`. i-have-adhd still works as an alternative (next section) — but **don't run both**.

### Install on OpenCode — by hand, not with the installer

> [!warning] Don't run `bin/install.js --only opencode` if your config is a commented `.jsonc`
> The installer rewrites `opencode.jsonc` as plain JSON — **every comment is lost** (it keeps a `.bak`) — and installs 9 skills + 3 `cavecrew` subagents + a rule block in the global AGENTS.md, which is more than this setup needs ([[gotchas]] item 18).

Download only the files that are used, from a pinned tag:

```bash
T=v3.1.0; R=https://raw.githubusercontent.com/JuliusBrussee/caveman/$T; C=~/.config/opencode
mkdir -p $C/plugins/caveman $C/commands
curl -fsSL $R/src/plugins/opencode/plugin.js    -o $C/plugins/caveman/plugin.js
curl -fsSL $R/src/plugins/opencode/package.json -o $C/plugins/caveman/package.json
curl -fsSL $R/src/hooks/caveman-config.js       -o $C/plugins/caveman/caveman-config.cjs   # the extension must become .cjs
curl -fsSL $R/src/hooks/caveman-parse.js        -o $C/plugins/caveman/caveman-parse.cjs
for s in caveman caveman-commit caveman-review; do
  mkdir -p $C/skills/$s
  curl -fsSL $R/skills/$s/SKILL.md                  -o $C/skills/$s/SKILL.md
  curl -fsSL $R/src/plugins/opencode/commands/$s.md -o $C/commands/$s.md
done
```

Then port it to OpenCode 2 — upstream's `plugin.js` is still a V1 plugin (v3.2.0 too), which OpenCode 2 silently ignores ([[gotchas]] item 20):

```bash
node scripts/port-caveman-opencode2.mjs     # from this repo; keeps the original as plugin.v1.js
```

[`port-caveman-opencode2.mjs`](../scripts/port-caveman-opencode2.mjs) keeps every helper in `plugin.js` and replaces only the exported function: `chat.message` → `ctx.session.hook("prompt")`, `experimental.chat.system.transform` → `ctx.session.hook("context")`, the `event` hook → `ctx.event.subscribe()`. It also writes `~/.config/opencode/plugin/caveman.js`, a one-line shim that loads `plugins/caveman/plugin.js`. OpenCode 2 loads `.js` files in `plugin/` by itself. It skipped the `plugins/caveman` folder without saying why, and a file path in the `plugin` array is rejected ([[gotchas]] item 21). So **don't add caveman to the `plugin` array**.

> [!note] No rule block in the global AGENTS.md
> While a mode is active, the plugin puts the whole `skills/caveman/SKILL.md` (~1.07k tokens) into the system prompt of every model call (the `context` hook). The AGENTS.md block the installer writes would duplicate it and keep applying after `/caveman off`. The plugin makes no network calls and spawns no processes (it only reads/writes the flag file `~/.config/opencode/.caveman-active`).

Check: `opencode service restart` → `opencode api GET /api/plugin` lists `caveman` as `active`, `opencode api GET /api/command` lists `caveman`, `caveman-commit`, `caveman-review`, and `~/.config/opencode/.caveman-active` contains `caveman`. The three skills also need `allow` lines (`caveman*`) in `permissions`.

### Commands

| Command | What it does |
| --- | --- |
| `/caveman` · `/caveman off` · `/caveman status` | turn on / off / show the mode (typing `normal mode` or `stop caveman` also turns it off) |
| `/caveman-commit` | writes a Conventional Commits message for the staged changes — it does **not** run `git commit` |
| `/caveman-review [files]` | reviews the diff, one line per finding, with a 🔴/🟡/🟢 severity |

Set the default mode with the env var `CAVEMAN_DEFAULT_MODE`.

### What was measured on this setup

- **Cost:** ~1.2k more prompt tokens per turn (the ~1,070-token rule set + 3 skill entries) — from ~32.6k to ~34.0k
- **Effect:** the final reply got slightly shorter (~9% in the test) and easier to read, but the turn's **total output tokens did not drop measurably** — in coding work most output is tool calls and code, which the skill doesn't touch (JetBrains measured 8.5% over 86 real tasks). Use it because it reads better, not because it saves — details in [[tuning]] section 8

> [!note] Why not caveman's proxy
> (1) When it wraps OpenCode it only redirects the `openai` and `anthropic` providers' `baseURL` — a custom provider (e.g. a self-hosted llama.cpp) doesn't go through it (2) the CLI sends telemetry by default, including the IP (`caveman telemetry off` disables it) (3) it adds 5 MCP tools to every prompt — not tested here

### Remove

Delete `~/.config/opencode/plugin/caveman.js`, `~/.config/opencode/plugins/caveman/`, `skills/caveman*/`, `commands/caveman*.md`, and the `.caveman-active` file.

### Update

Change `T=` to the new tag, re-run the download block, then run `port-caveman-opencode2.mjs` again — see [[updating]].

---

## i-have-adhd — forces terse, to-the-point replies

> [!warning] An alternative — this setup now uses caveman instead (2026-10-03)
> This section is kept for anyone who prefers opt-in per session over always-on. Install one or the other, not both.

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
