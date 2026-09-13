---
tags: [project-doc, plugins, opencode, reference]
updated: 2026-09-13
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

---

## graft-deep — custom plugin (auto-inject context)

graft (see [[mcp-servers]]) has no "deep integration" for OpenCode — meaning automatically injecting relevant context into a prompt. This feature only exists for Claude Code (auto-rebuilding the graph after an edit is now graft CLI's own job for every agent — see the box below). This plugin ports the auto-inject behavior using graft's public CLI (`graft ask --json`) instead of importing an internal module — safer, and won't break when graft updates its version.

> [!info] Used to have an auto-rebuild hook too — removed (2026-09-13)
> The first version of this plugin had a `tool.execute.after` hook that would debounce for 3 seconds then run `graft build` itself in the background after every file edit. Confirmed by a live test that this is **no longer necessary**: editing a file then immediately calling `graft ask`, with no manual `graft build` in between, printed `[graft] refreshed the graph (1 file changed) before answering` — meaning the current graft CLI already auto-refreshes the graph itself before answering any query (see [[mcp-servers]]). The removed hook wasn't just redundant — it was also the direct cause of the race condition documented in [[gotchas]], item 6. The cause was removed instead of just working around the symptom.

### Install

1. Put the file at `~/.config/opencode/plugin/graft-deep.js` (create the `plugin` folder yourself if it doesn't exist)
2. Add that path to the `plugin` array in the global config
3. Nothing extra needed per project — except `graft build` still needs to run once per repo as before (see [[mcp-servers]]). After that, graft keeps the graph fresh itself on every query; nothing needs to rebuild it anymore.

### OpenCode Plugin Hook API used

A plugin returns an object of hooks matching the `Hooks` type from `@opencode-ai/plugin` — just one is used here now:

| Hook | Fires when | What graft-deep does with it |
| --- | --- | --- |
| `experimental.chat.messages.transform` | Every agent step (not just once per turn — fires more often than you'd think) | Runs `graft ask` against the user's latest message → appends the top 3 results to the prompt if coverage passes a threshold |

Other hooks available but not used here: `tool.execute.before`, `tool.execute.after`, `chat.message`, `command.execute.before`, `session.compacting`, `event`, `tool.definition` — see the full types at `node_modules/@opencode-ai/plugin/dist/index.d.ts`.

### Key lessons learned while writing it (Windows-specific)

**1. `execFileSync('npx.cmd', args, {shell:false})` breaks on Windows** — throws `EINVAL` because Windows can't spawn a `.cmd` file directly without going through a shell.

**2. `shell:true` + concatenating a string yourself = a command-injection risk** — the prompt is free text from the user's chat message, going straight into a shell string is unsafe.

> [!danger] Security
> Never concatenate user-supplied free text into a shell command string, even with a hand-written escaping function — it's too easy to get wrong and usually doesn't cover every edge case.

**3. The correct fix** is `cross-spawn` (a dependency OpenCode already ships in its own `node_modules`), which handles Windows argv quoting correctly without going through a shell — imported dynamically only when `process.platform === 'win32'`. macOS/Linux just use Node's built-in `execFileSync` directly, since POSIX has no such problem — so this file has zero extra dependencies on non-Windows.

### Full source

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
 */
import { execFileSync } from 'node:child_process';

const isWin = process.platform === 'win32';
const MIN_PROMPT_CHARS = 12;
const ASK_TIMEOUT_MS = 8000;
const MIN_COVERAGE = 0.12;

export const GraftDeepPlugin = async ({ directory }) => {
  const crossSpawn = isWin ? (await import('cross-spawn')).default : null;

  const injected = new Set();

  function graftAsk(prompt) {
    const args = ['-y', '@nanonets/graft', 'ask', prompt, '.', '--json', '-n', '3'];
    try {
      if (isWin) {
        const r = crossSpawn.sync('npx', args, { cwd: directory, encoding: 'utf8', timeout: ASK_TIMEOUT_MS });
        if (r.error || r.status !== 0 || !r.stdout) return null;
        return JSON.parse(r.stdout);
      }
      const out = execFileSync('npx', args, {
        cwd: directory, encoding: 'utf8', timeout: ASK_TIMEOUT_MS,
        stdio: ['ignore', 'pipe', 'ignore'],
      });
      return JSON.parse(out);
    } catch {
      return null;
    }
  }

  function formatContext(result) {
    const hits = result?.hits;
    if (!Array.isArray(hits) || hits.length === 0) return null;
    if ((result.coverage ?? 0) < MIN_COVERAGE) return null;
    const lines = hits.map((h) => `- ${h.title} — ${h.pointer}`);
    return `[graft] possibly relevant code for this request:\n${lines.join('\n')}\n(use the graft MCP tools for full detail if needed)`;
  }

  return {
    'experimental.chat.messages.transform': async (_input, output) => {
      if (process.env.GRAFT_AUTO_CONTEXT === '0') return;
      if (!output?.messages?.length) return;

      const lastUser = [...output.messages].reverse().find((m) => m.info.role === 'user');
      if (!lastUser || !lastUser.parts.length) return;

      const text = lastUser.parts.filter((p) => p.type === 'text').map((p) => p.text).join(' ').trim();
      if (text.length < MIN_PROMPT_CHARS) return;

      const key = lastUser.info.id || text; // dedupe per message across agent steps
      if (injected.has(key)) return;

      const result = graftAsk(text);
      const ctx = result && formatContext(result);
      if (!ctx) return;

      injected.add(key);
      const ref = lastUser.parts[0];
      lastUser.parts.push({ ...ref, type: 'text', text: ctx });
    },
  };
};
```

### How to turn it off temporarily if it's too slow

The auto-inject-context part runs **synchronously (blocking)** on every new user message — if it feels slow on a local model, turn it off with an env var, no code changes needed:

```bash
GRAFT_AUTO_CONTEXT=0 opencode
```

### How to test the plugin without waiting on a slow agent loop

Call the hook function directly via a node script instead of waiting on the LLM (very useful while the model is slow):

```js
import { pathToFileURL } from "node:url";
const { GraftDeepPlugin } = await import(pathToFileURL("<path-to-graft-deep.js>").href);
const hooks = await GraftDeepPlugin({ directory: "<project-path>" });

// test auto-inject context (the only hook there is now)
const output = { messages: [{ info: { id: "msg1", role: "user" }, parts: [{ type: "text", text: "a real question" }] }] };
await hooks["experimental.chat.messages.transform"]({}, output);
console.log(output.messages[0].parts); // should have 2 parts if injection succeeded
```

> [!info] There used to be a race-condition warning here — no longer relevant since removing the auto-rebuild hook
> This plugin previously also had a `tool.execute.after` hook running `graft build` itself, which could collide with a test running `graft ask` at the same time (`graft ask` failing silently). That hook is now removed (see the box above), since graft CLI itself already auto-refreshes before answering any query — so this problem went away along with its cause. See [[gotchas]], item 6.

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
