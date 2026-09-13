---
tags: [user-manual, getting-started, opencode, vibe-coding]
updated: 2026-09-13
summary: Day-to-day OpenCode usage manual — vibe coding, the graft workflow, grill-me/grilling, and the OpenDesign workflow
---

# 📘 OpenCode Usage Manual for Vibe Coding

> Finished setup? See [setup.md](setup.md) · MCP/Plugin details in [mcp-servers.md](mcp-servers.md) and [plugins.md](plugins.md) · Common problems in [gotchas.md](gotchas.md) · Updating/upgrading in [updating.md](updating.md)

---

## 📋 Table of Contents

- Overview — this setup's architecture + the project-level and agent-level workflow cycles
- Starting a new project — a 6-step checklist
- General vibe coding with opencode — including a full worked example (one real request through to a commit) and how to use grill-me/grilling
- Using graft to understand code faster — with real output examples to recognize
- Building a website with OpenDesign (then pulling it into opencode)
- Choosing the right model for the job
- Common problems

> [!tip] Beginners, read in this order
> Section 1 (understand the overview first) → 2 (follow the real checklist on your first project) → 3 (try real requests using the example) — do these first 3 sections and you'll be set for day-to-day use. Sections 4–7 are reference material — open them when you actually need them.

---

## 1. Overview

```mermaid
graph LR
    A[OpenDesign App<br/>Studio - chat + live preview] -->|spawns as engine| B[OpenCode]
    B -->|MCP| C[context7 / playwright / chrome-devtools]
    B -->|MCP| D[graft - code graph]
    B -->|MCP| E[open-design - pulls files]
    B -->|plugin| F[superpowers - skills]
    B -->|plugin| G[graft-deep - inject context]
    B -->|plugin| L[ponytail - code minimization]
    B -->|plugin, opt-in| M["i-have-adhd - terse output<br/>(/i-have-adhd per session)"]
    B -->|provider| H[home-llamacpp<br/>self-hosted model]
    E -.->|pulls generated files| I[real project frontend+backend]
```

Two main entry points:

1. **Open the opencode terminal directly** in a real code project — for full backend/full-stack development.
2. **Open the OpenDesign app** — for when you want a web page/prototype fast with live preview (OpenDesign calls opencode as its "engine" behind the scenes for you, no need to type into an opencode terminal yourself).

### Project-level workflow cycle (macro)

The full loop, from a brief to deployment and back around to the next brief/improvement:

```mermaid
graph LR
    A["Brief<br/>what you want"] --> B["Design/prototype<br/>OpenDesign Studio"]
    B --> C["Pull into a real project<br/>open-design MCP"]
    C --> D["Develop backend/DB<br/>opencode + postgres/mysql MCP"]
    D --> E["Test<br/>playwright / chrome-devtools MCP"]
    E --> Q["Check quality/security<br/>sonarqube + trivy MCP (quality gate)"]
    Q --> F["Deploy"]
    F -->|new brief / improvement| A
```

Use this to see which tools "one piece of work" should flow through, in order — details on each step are in section 5 below.

### The agent's per-request workflow cycle (micro)

What happens behind the scenes within each turn you type a command to opencode (based on [plugins.md](plugins.md) and [mcp-servers.md](mcp-servers.md)):

```mermaid
graph LR
    A["User types a command"] --> B["graft-deep<br/>injects relevant context"]
    B --> C["superpowers<br/>picks the right skill"]
    C --> D{"Need an extra tool?"}
    D -->|search docs| E["context7"]
    D -->|understand code structure| F["graft"]
    D -->|test/debug UI| G["playwright /<br/>chrome-devtools"]
    D -->|recall old context| H["memory"]
    D -->|check quality/security| K["sonarqube /<br/>trivy"]
    E --> L["ponytail<br/>checks the decision ladder before writing code"]
    F --> L
    G --> L
    H --> L
    K --> L
    L --> I["Edit/write code"]
    I -->|next command| A
```

> [!note] No separate "auto-rebuild graph" step anymore
> graft-deep used to have a hook that would rebuild the graph itself after an edit — removed, because the current graft CLI version already refreshes the graph itself before answering any query (verified — see [plugins.md](plugins.md), the graft-deep section). There's nothing to wait for, so there's no separate node for it in this diagram anymore — graph freshness is graft's own job now, not opencode's.

> [!note] Not every turn goes through every step
> If a command is short/unrelated to code (e.g. "explain X to me"), some nodes get skipped — this diagram shows **every possible path**, not a route every single turn takes in full.

> [!note] Plugin ponytail
> The ponytail plugin (see [plugins.md](plugins.md)) is the last gate before actually writing code (node L) — it forces the agent to walk the decision ladder (don't write it if unnecessary → reuse what's there → is there a standard library → a native feature → an already-installed dependency → a one-liner → only then write minimal new code). Works alongside superpowers/graft-deep without overlapping (superpowers picks the workflow, graft-deep finds context, ponytail controls how much code gets written).

> [!note] Plugin i-have-adhd — deliberately not in the per-turn cycle above
> Unlike superpowers/graft-deep/ponytail, which run automatically every turn — i-have-adhd (see [plugins.md](plugins.md)) is **opt-in per session**: you have to type `/i-have-adhd` yourself before it takes effect (it only changes reply style to be terse/to-the-point, it doesn't touch tool orchestration). Good for when you want a fast answer, not a long explanation — turn it off any time with `stop adhd mode`.

> [!note] Skill grill-me / grilling — not a separate plugin, wired into node C
> Not a separate node in the diagram, because it's a skill (a standalone `SKILL.md` file following the Agent Skills open standard — see [setup.md](setup.md)), not a plugin — but it works at the same node C as superpowers: when the agent picks `brainstorming` for building a new feature, it uses `grilling`'s batch question format instead of asking one at a time (or calls `grilling` on its own if the user just wants to interview an idea, not implement it right away). Real usage is in section 3 below; full install/reconciliation detail is in [plugins.md](plugins.md).

---

## 2. Starting a new project — follow these steps in order

Do this once per project (no need to repeat it every time you open opencode). Each step has a checkpoint attached — if a step doesn't behave as described, **stop there first** before moving on; later steps depend on earlier ones.

**Step 1 — go into the project folder**

```bash
cd my-new-project
# if the folder/repo doesn't exist yet: mkdir my-new-project && cd my-new-project && git init
```

**Step 2 — build a context graph with graft** (skip this step if graft isn't installed — see [mcp-servers.md](mcp-servers.md) first if you haven't installed it yet)

```bash
graft build
```

✅ **You should see:** `parsing 1/N: ...` counting up to `N/N`, finishing with no errors — you get a new `graft/` folder in the project (added to `.gitignore` automatically, don't commit it)

```bash
graft init --agents agents --no-global
```

✅ **You should see:** an `AGENTS.md` file and `opencode.json` (with `mcp.graft`) created/edited at the project root — open them to confirm the `<!-- graft:start -->...<!-- graft:end -->` block is actually there

**Step 3 — confirm graft is wired up to opencode**

```bash
opencode mcp list
```

✅ **You should see:** the `graft` row with status `connected`. If not, check [gotchas.md](gotchas.md) first.

```bash
graft map
```

✅ **You should see:** a summary like `repo map — N files · N symbols · N edges · <main language>` with dir clusters/hubs — if this command works, the CLI itself is ready regardless of whether the MCP connected successfully (this helps separate a graft problem from an MCP-connection problem).

**Step 4 — (only if needed) enable a project-specific MCP**

If this project needs a database, create a config specific to this repo (won't affect other projects):

```jsonc
// my-new-project/opencode.jsonc
{ "mcp": { "postgres": { "enabled": true } } }
```

Set the env var **before** opening opencode every time (set it once in a shell profile and you won't have to type it each time):

```bash
export POSTGRES_CONNECTION_STRING="postgresql://user:pass@host/db"
```

**Step 5 — open opencode for the first time in this project**

```bash
opencode
```

Try asking something that needs real code references, e.g. `summarize this project's structure` or `which file is this project's entry point`.

✅ **You should see:** an answer referencing actual file/function names in the project (not a generic, floating answer) — if so, graft/context is working end to end.

**Step 6 — (recommended) confirm skills/plugins loaded correctly**

```bash
opencode debug skill
```

✅ **You should see:** all 14 `superpowers` skills (`brainstorming`, `systematic-debugging`, `writing-plans`, ...), `ponytail`'s skills (`ponytail`, `ponytail-review`, ...), `i-have-adhd`, and `grill-me`/`grilling` if installed (see [plugins.md](plugins.md) for what each one is).

> [!tip] Done all 6 steps? Go straight to section 3
> No need to repeat this checklist for the same project again — just open `opencode` and use it per section 3. Only redo this checklist when starting a genuinely new project.

---

## 3. General Vibe Coding with opencode

Open the TUI and chat in plain language:

```bash
opencode
```

Or run it non-interactively (headless, usable from scripts/automation):

```bash
opencode run "write a reverse-string function as a python one-liner"
opencode run -m home-llamacpp/qwen3.8-27b "..."   # specify a particular model
```

While chatting, the agent picks its own tools (context7 for docs, playwright/chrome-devtools for browser debugging, graft for understanding code structure) — no need to say "use tool X" unless you want to force it.

### A full worked example (from a request to a commit)

The "agent's per-request workflow" diagram in section 1 is an abstract overview — this example is a real cycle that actually happened (summarized from a real tested session, not made up), to show what each box in the diagram turns into on screen in practice:

1. **Type a command:** `please add level 3 to the game`
2. **superpowers picks a skill** — recognizes this is building a new feature → calls `brainstorming` (visible from the agent talking about "classifying scope" as bounded/architectural first)
3. **graft finds relevant code** — the agent calls graft itself (`graft_find_code`/`graft_file_api` via MCP) to find out how the current level system works, instead of opening every file itself — visible from a fact summary citing real `file:line` references
4. **Asks clarifying questions in a batch (grilling format)** — fires several questions at once, each with a `➡️` recommendation attached (see the next section for where this format comes from)
5. **Answer the questions** — a short reply, e.g. `go with your recommendations`
6. **ponytail checks the decision ladder** — before writing new code, checks whether there's something existing to reuse (visible in the resulting code usually editing an existing file/adding a field to an existing data structure, rather than building a parallel new system)
7. **Write/edit code**, with a todo list tracking progress
8. **Run tests + verify in the browser** (via the playwright/chrome-devtools MCP, for a web project)
9. **Commit** as one scoped commit, with a short, to-the-point message

> [!tip] It's normal not to see every step
> Small requests (fixing a typo, a general question) skip straight past steps 2–6 and go directly to steps 7–9 — going through every step like this only happens for work that's genuinely "building a new feature."

### Using grill-me / grilling before starting a new feature (if installed)

If the `grill-me`/`grilling` skill is installed (install steps in [plugins.md](plugins.md)), there are 2 ways to invoke it:

**1. Interview standalone (not implementing right away, no spec file):**

```
grill me about <an idea/decision you want to stress-test>
```

**2. Let it happen on its own when asking for a new feature (no need to say "grill" at all):**

```
please add <feature> for me
```

If `superpowers` is also installed (normally installed as a pair), case 2 will call `brainstorming` first per its main gate, then **borrow grilling's question format** (asked as a batch, numbered, each with a `➡️` recommendation attached) instead of asking one at a time — recognizable from:

```
❓ Q1 - <question title>: <details/options>
➡️ <recommendation>

---

❓ Q2 - ...
```

You can reply with short options/letters directly (e.g. `A A A A` or `go with all recommendations`) — the agent won't start writing code until every question is answered and the frontier is empty (no questions left).

> [!info] Confirmed not to collide
> Tested for real that calling `grilling` standalone versus letting `brainstorming` borrow its format both work correctly down their own separate paths without colliding (no duplicate rounds of questions, no spec file appearing when it shouldn't). Full details are in [plugins.md](plugins.md), the grill-me/grilling section.

---

## 4. Using graft to understand code faster

No need to call `graft` yourself at all — once the MCP is wired up (see [mcp-servers.md](mcp-servers.md)), opencode calls graft's tools (`graft_find_code`/`graft_file_api`/`graft_trace_calls`/`graft_find_all`/`graft_repo_map`/`graft_check_freshness`) automatically whenever needed, just like playwright/chrome-devtools. This section is about calling the CLI directly yourself, in case you want to explore code quickly before talking to the agent.

**Step 1 — see the project overview**

```bash
graft map
```

Example real output you should get something like this (numbers/filenames vary by project):

```
repo map — 15 files · 312 symbols · 540 edges · javascript

src/                12 files · 280 symbols   hubs: SG.config (config.js, 9←), GameScene (GameScene.js, 7←)
test/               1 files · 12 symbols     hubs: runTest (logic.test.js, 2←)

hotspots: SG.config · object · src/config.js:L3-L18 · 9←  GameScene.create · method · src/scenes/GameScene.js:L14-L111 · 7←
```

How to read this: **hubs**/**hotspots** = the most-referenced code (the `←` number = how many times it's called) — starting to understand a project from these spots is usually the most worthwhile approach.

**Step 2 — ask for relevant code in plain language**

```bash
graft ask "where does auth happen"
```

Example real output (from asking about a ring-collection system in a sample game):

```
graft ask — "ring collection overlap handler addRings ring cap"  (lexical)

1. addRings · method  [symbol]
   src/entities/Sonic.js:L43-L45
   addRings(n)

   addRings(n) {
     this.rings = Math.min(SG.config.ringCap, this.rings + n);
   }
```

You get **file:line + the actual code inlined** — no need to go open the file yourself. If a question is too broad and gives a single/off-target result, try a different command instead: `graft grep "<exact term>"` (find every occurrence of that term) or `graft skeleton <file>` (see a whole file's API with no bodies).

**Step 3 — check whether the graph still matches the real code** (normally not needed, since every command above already refreshes itself before answering — use this just to confirm, or in CI)

```bash
graft check
```

✅ exit code `0` = the graph matches the current code, nothing else to do.

> [!note] Plugin graft-deep
> The graft-deep plugin (see [plugins.md](plugins.md)) auto-injects relevant context into every new prompt — runs in the background with nothing extra to do, though it doesn't guarantee 100% that the model will always use the injected context (depends on each model's own ability). Graph freshness itself no longer needs this plugin at all — the current graft CLI refreshes itself before answering any query.

---

## 5. Building a website with OpenDesign, then pulling it into opencode

### Phase 1 — Design/prototype in OpenDesign

1. Open the OpenDesign app → the **Home** page
2. Type a brief (the website's brief) as plain text
3. Choose the artifact type as **Prototype**
4. Choose a design system (151 to choose from) or leave it on auto
5. Launch → enter **Studio** (chat + generated files + live preview, all in one window)
6. Keep chatting to refine it — Studio writes real HTML/CSS/JS files to disk immediately, not just a mockup
7. Once happy, export from the Download menu (HTML/PDF/PPTX)

> [!tip] You don't always need to come back to opencode
> If it's a simple single-page website, exporting here can be the end of it — no need to move on to opencode.

### Phase 2 — Pull it into a real project (when you want a backend/to build further)

```bash
cd my-real-project    # a real full-stack project with opencode's MCPs fully set up
opencode
```

```
Use the open-design tool list_projects to see what projects exist,
then pull files from project <name> into this folder, and add a backend API next.
```

opencode will call `list_projects` → `get_project`/`get_artifact`/`get_file` on the open-design MCP itself, pull in the file contents, then write them into the real project using its own write tool — and then keep working as a normal full-stack session (wiring up a DB via the postgres/mysql MCP, testing via playwright/chrome-devtools, etc.).

> [!info] Summary of roles
> **OpenDesign** = the design/fast-frontend phase with a live preview · **opencode** (a separate session) = the real development phase, building it out into a full system, connected via the `open-design` MCP.

> [!warning] The daemon must be running
> Before using the `open-design` MCP, OpenDesign's daemon must be running (leave the app open, or run `od --no-open` headless) — full details/problems hit are in [gotchas.md](gotchas.md), item 4.

---

## 6. Choosing the right model for the job

| Situation | Recommended model |
| --- | --- |
| Real work, want quality/privacy, no rush | `home-llamacpp/qwen3.8-27b` (self-hosted) |
| Trying an idea quickly, a smoke test, an external tool with a short timeout | `opencode/deepseek-v4-flash-free` (built-in, no key to set up) |

Specify it with `-m provider/model`:

```bash
opencode run -m opencode/deepseek-v4-flash-free "..."
```

---

## 7. Common Problems

Full list with fixes at [gotchas.md](gotchas.md) — the short version:

- **An external tool connects to opencode then times out** → check whether the default model is too slow (item 1 in gotchas)
- **Set a new env var/PATH but it's not taking effect** → fully restart the relevant app, not just close its window (item 2)
- **The `open-design` MCP is connected but calling a tool fails** → check whether OpenDesign's daemon is actually running on port 7456 (item 4)
- **The same command gives different results between terminals** → try PowerShell instead of Git Bash on Windows (item 5)
- **The `sonarqube` MCP shows connected but calling a tool gives 401/403** → check whether the token used is a "User Token," not a "Global/Project Analysis Token" (see [mcp-servers.md](mcp-servers.md), the sonarqube section) — the connection check only confirms it can reach the server, it doesn't check the token's permissions at that point
- **`trivy` shows `command not found` even though winget said it installed successfully** → restart the terminal (VS Code needs the whole app closed) — the same PATH staleness as item 2 (see [mcp-servers.md](mcp-servers.md), the trivy section)
