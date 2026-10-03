---
tags: [user-manual, getting-started, opencode, vibe-coding]
updated: 2026-10-03
summary: OpenCode usage manual, start to finish (open a session, ask, approve, check, commit) and day to day — vibe coding, the graft workflow, grill-me/grilling, and the OpenDesign workflow
---

# 📘 OpenCode Usage Manual for Vibe Coding

> Finished setup? See [[setup]] · MCP/Plugin details in [[mcp-servers]] and [[plugins]] · Common problems in [[gotchas]] · Updating/upgrading in [[updating]]

---

## 📋 Table of Contents

- **⭐ Start to finish** — read this first: what you do once, and how each piece of work is started, discussed, approved, checked, and finished
- Overview — this setup's architecture + the project-level and agent-level workflow cycles
- Starting a new project — a 6-step checklist
- General vibe coding with opencode — including a full worked example (one real request through to a commit) and how to use grill-me/grilling
- Using graft to understand code faster — with real output examples to recognize
- Building a website with OpenDesign (then pulling it into opencode)
- Choosing the right model for the job
- Common problems

> [!tip] Beginners, read in this order
> **⭐ Start to finish** (right below — what to do, and when) → section 2 (follow the real checklist on your first project) → section 3 (try real requests using the example). Sections 1 and 4–7 are reference material — open them when you actually need them.

---

## ⭐ Start to finish

Setup per [[setup]] is done — this section answers one question: **you sit down at the machine; what do you do, in what order, until the work is finished?** There are three levels, done at very different frequencies:

| When | What | Takes |
| --- | --- | --- |
| **A. Once per machine** | Check the setup is ready | ~2 min |
| **B. Once per project** | Build the graft index + the project's AGENTS.md | ~5 min (section 2) |
| **C. Every piece of work** | The 7-step loop: open → ask → approve → agent works → check → commit → close | depends on the work |

```mermaid
graph TD
    S["Setup done (setup)"] --> A["A. Check the machine<br/>once"]
    A --> B["B. Prepare the project<br/>once per repo (section 2)"]
    B --> C1["1. Open a session<br/>opencode / opencode -c"]
    C1 --> C2["2. Ask in plain language"]
    C2 --> K{"What kind of work?"}
    K -->|question / small fix| C4
    K -->|new feature / bug / large work| C3["3. Answer questions + approve the design<br/>(no code written yet)"]
    C3 --> C4["4. The agent works<br/>edit → tests → browser check"]
    C4 --> C5{"5. You check the result<br/>summary + git diff"}
    C5 -->|not right yet| C2
    C5 -->|good| C6["6. Commit<br/>(the agent doesn't commit by itself)"]
    C6 --> C7["7. Close the work<br/>/new for the next one"]
    C7 -->|next piece of work| C2
```

### A. Once per machine — check the setup is ready

Open a **new** terminal (env vars you just set aren't visible in an old one — [[gotchas]] item 2) and run:

```bash
opencode --version       # the CLI is installed
opencode mcp list        # enabled MCP servers must show connected
opencode debug skill     # the skills that loaded
opencode run "say hi"    # the model answers
```

✅ **You should see:**
- `mcp list`: `context7`, `chrome-devtools`, `graft`, `memory`, `sonarqube`, `trivy` as `connected` · `open-design`, `playwright`, `github`, `postgres`, `mysql` as `disabled` (normal — they're turned on per project)
- `debug skill`: 27 skills — 15 from superpowers, 6 from ponytail, 3 from caveman, `grill-me`, `grilling`, `customize-opencode`. Many more than that means another tool's skills are leaking in ([[gotchas]] item 15)
- `run "say hi"`: a reply. If it takes more than 1–2 minutes see [[gotchas]] item 1

### B. Once per project — prepare the repo

Follow **section 2** (6 steps): `graft build` → `graft init --agents agents --no-global` → enable project-specific MCP servers if needed (a database, `open-design`, `playwright`) → ask one question that needs real code references. Once done, never again for that repo.

### C. Every piece of work — the 7-step loop

**Step 1 — Open a session**

```bash
cd my-project
git status          # should be clean, or on this work's branch — so it's obvious what the agent changed
opencode            # a new session
opencode -c         # or: continue the last session
```

Inside the TUI: `/sessions` picks an older session · `/new` starts a fresh one · `/models` switches model · `/help` lists every command

> [!tip] One piece of work = one session
> The base prompt already weighs ~34k tokens of the 131k context ([[tuning]]) — always `/new` for new work. A session that spans several tasks compacts often, and the agent has to re-read the same files.

**Step 2 — Ask in plain language**

Say **what you want to end up with**, not how to do it and not which tool to use — the agent picks its path from the kind of request:

| You type something like | The agent will | You need to |
| --- | --- | --- |
| `how does ring collection work` (a question / explain) | find the code with graft and answer with `file:line` references | read — done at this step |
| `fix the typo on the menu screen` (a small fix) | just edit → run tests | skip to step 5 |
| `please add a pause feature to the game` (a new feature) | call `brainstorming` → explore with graft → ask questions or propose a design → **stop and wait** | go to step 3 |
| `the game freezes when I jump` (a bug) | call `systematic-debugging` — find the cause before fixing | confirm the cause, then let it fix |
| `move the level system to zones` (large, multi-file work) | write a spec under `docs/superpowers/specs/` + a plan (`writing-plans`) | read the spec, then approve |
| `grill me about <idea>` (not building yet, just thinking it through) | ask in `grilling` rounds — no spec, no code | answer the questions |

**Step 3 — Answer questions and approve the design** (new features / large work only)

The agent writes **no code** until this step is done. It arrives in one of two shapes:

- **A batch of questions** (`❓ Q1 … ➡️ recommendation`) — answer briefly with the options, e.g. `A B A` or `go with all recommendations`
- **One design ending in "Approve?"** (when the work is narrow enough) — reply `go ahead`, or say what to change, e.g. `no touch button needed`

Read the design carefully here — this is the cheapest point to change direction, before the model spends many minutes implementing.

**Step 4 — The agent works** (you just wait)

What happens, in order: ponytail checks whether something existing can be reused before writing new code → edits with a todo list → runs tests → **for anything visible in a browser, opens Chrome through chrome-devtools and checks it once** (a rule in the global AGENTS.md — [[tuning]]) → summarizes.

- `Esc` stops it mid-way · `/undo` reverts the last message together with its file changes (the project must be a git repo) · `/redo` re-applies
- **The browser check is the slowest step** — measured at ~30–36 minutes for a small feature on a local model, but it's the step that finds bugs the tests don't cover ([[tuning]] sections 4 and 8). Work with no UI skips it
- If the agent stops silently with no summary, the model usually hit its output ceiling ([[gotchas]] item 8) — type `continue`

**Step 5 — Check the result before accepting it**

Read the agent's closing summary — it should say which files changed, the test result, the browser check result, and what it **deliberately left out**. Then look at the real thing:

```bash
git diff            # does it match the summary? any file touched that shouldn't be?
```

Want a second opinion? Ask in the same session:

| Command | What you get |
| --- | --- |
| `/caveman-review` | a one-line-per-finding review of the diff, with severity |
| `/ponytail-review` | code in the diff that's more than needed |
| `scan this project with sonarqube and trivy` | quality / vulnerability checks — for work touching dependencies, auth, or data (the agent does **not** run these on every task) |

Not right yet → say what to fix in the same session (back to step 2).

**Step 6 — Commit**

The agent does **not** commit by itself (tested — the work ends with the files left in the working tree). Pick one:

```bash
git add -A
```

```
/caveman-commit          ← gives you a Conventional Commits message (it does not run git commit)
commit this for me        ← or have the agent commit, then check the message
```

Push yourself when ready — nothing runs automatically in CI in this setup ([[sdlc]]).

**Step 7 — Close the work**

- Next piece of work → `/new` (or `/exit` and reopen)
- A preference or decision you want remembered across sessions → type `remember that <thing>` — the agent saves it to memory, and the next session searches memory before asking again
- A long session nearing the context limit with work still unfinished → `/compact`
- No need to rebuild graft yourself — the CLI refreshes the graph before every answer

### Commands you'll use most

| To | Type |
| --- | --- |
| Open a new session / continue the last one | `opencode` / `opencode -c` |
| Start new work in the same TUI | `/new` |
| Go back to an older session | `/sessions` |
| Stop the agent / revert the last message | `Esc` / `/undo` |
| Shrink a long session's context | `/compact` |
| Get full, uncompressed replies / go back to terse | `/caveman off` (or `normal mode`) / `/caveman` |
| A commit message / a review of the diff | `/caveman-commit` / `/caveman-review` |
| Turn ponytail's intensity down or up | `/ponytail lite\|full\|ultra\|off` |
| Think an idea through without building it | `grill me about <topic>` |
| Run without opening the TUI | `opencode run "<request>"`, then `opencode run -c "<answer>"` |

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
    B -->|plugin| M["caveman - terse output<br/>(on by itself, /caveman off to stop)"]
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

What happens behind the scenes within each turn you type a command to opencode (based on [[plugins]] and [[mcp-servers]]):

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
> graft-deep used to have a hook that would rebuild the graph itself after an edit — removed, because the current graft CLI version already refreshes the graph itself before answering any query (verified — see [[plugins]], the graft-deep section). There's nothing to wait for, so there's no separate node for it in this diagram anymore — graph freshness is graft's own job now, not opencode's.

> [!note] Not every turn goes through every step
> If a command is short/unrelated to code (e.g. "explain X to me"), some nodes get skipped — this diagram shows **every possible path**, not a route every single turn takes in full.

> [!note] Plugin ponytail
> The ponytail plugin (see [[plugins]]) is the last gate before actually writing code (node L) — it forces the agent to walk the decision ladder (don't write it if unnecessary → reuse what's there → is there a standard library → a native feature → an already-installed dependency → a one-liner → only then write minimal new code). Works alongside superpowers/graft-deep without overlapping (superpowers picks the workflow, graft-deep finds context, ponytail controls how much code gets written).

> [!note] Plugin caveman — deliberately not in the per-turn cycle above
> caveman (see [[plugins]]) only changes the **reply style** to short and to the point; it doesn't touch tool orchestration, so it isn't a node in the diagram. It turns on by itself every session (unlike i-have-adhd, which it replaced and which had to be typed on). Turn it off with `/caveman off` or `normal mode` when you want a full explanation. Code, commands, and error text are always written out in full.

> [!note] Skill grill-me / grilling — not a separate plugin, wired into node C
> Not a separate node in the diagram, because it's a skill (a standalone `SKILL.md` file following the Agent Skills open standard — see [[setup]]), not a plugin — but it works at the same node C as superpowers: when the agent picks `brainstorming` for building a new feature, it uses `grilling`'s batch question format instead of asking one at a time (or calls `grilling` on its own if the user just wants to interview an idea, not implement it right away). Real usage is in section 3 below; full install/reconciliation detail is in [[plugins]].

---

## 2. Starting a new project — follow these steps in order

Do this once per project (no need to repeat it every time you open opencode). Each step has a checkpoint attached — if a step doesn't behave as described, **stop there first** before moving on; later steps depend on earlier ones.

**Step 1 — go into the project folder**

```bash
cd my-new-project
# if the folder/repo doesn't exist yet: mkdir my-new-project && cd my-new-project && git init
```

**Step 2 — build a context graph with graft** (skip this step if graft isn't installed — see [[mcp-servers]] first if you haven't installed it yet)

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

✅ **You should see:** the `graft` row with status `connected`. If not, check [[gotchas]] first. `open-design` and `playwright` showing `disabled` is normal (off by default to keep the prompt small — turn them on per project in step 4, see [[tuning]]).

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

The same goes for the other servers that are off by default — `open-design` (when pulling work in from OpenDesign, section 5) and `playwright` (if you want it instead of / alongside chrome-devtools):

```jsonc
{ "mcp": { "open-design": { "enabled": true }, "playwright": { "enabled": true } } }
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

✅ **You should see:** 15 `superpowers` skills (`brainstorming`, `systematic-debugging`, `writing-plans`, ...), `ponytail`'s 6 skills (`ponytail`, `ponytail-review`, ...), `caveman`/`caveman-commit`/`caveman-review`, and `grill-me`/`grilling` if installed — 27 in total with OpenCode's own `customize-opencode` (see [[plugins]] for what each one is).

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
8. **Run tests + verify in the browser** (via the chrome-devtools MCP, for work visible in a browser — the "Verifying UI changes" rule in the global AGENTS.md)
9. **Commit** as one scoped commit, with a short, to-the-point message — in the re-test the agent did **not** commit by itself; you have to ask (`/caveman-commit` for a message, or type `commit this for me`). See step 6 of "Start to finish"

> [!tip] It's normal not to see every step
> Small requests (fixing a typo, a general question) skip straight past steps 2–6 and go directly to steps 7–9 — going through every step like this only happens for work that's genuinely "building a new feature."

> [!info] Re-tested headless (2026-10-03) — real result per step
> A small feature ("add a pause feature …") in a copy of the sample game: step 2 ✅ · step 3 ❌ on the first run (the agent followed brainstorming's "check files" step instead of using graft) → ✅ after adding a rule to the global AGENTS.md · step 4 skipped because the task was narrow enough for one design + approval · steps 6–7 ✅ · step 8 ✅ once the "Verifying UI changes" rule is in place (with a rule set that only optimizes for fewer steps, the agent skips the browser check — [[gotchas]] item 19) · step 9 ⚠️ didn't commit on its own — test procedure, result images, and open items in [[tuning]] sections 4 and 8

### Using grill-me / grilling before starting a new feature (if installed)

If the `grill-me`/`grilling` skill is installed (install steps in [[plugins]]), there are 2 ways to invoke it:

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
> Tested for real that calling `grilling` standalone versus letting `brainstorming` borrow its format both work correctly down their own separate paths without colliding (no duplicate rounds of questions, no spec file appearing when it shouldn't). Full details are in [[plugins]], the grill-me/grilling section.

---

## 4. Using graft to understand code faster

No need to call `graft` yourself at all — once the MCP is wired up (see [[mcp-servers]]), opencode calls graft's tools (`graft_find_code`/`graft_file_api`/`graft_trace_calls`/`graft_find_all`/`graft_repo_map`/`graft_check_freshness`) automatically whenever needed, just like playwright/chrome-devtools. This section is about calling the CLI directly yourself, in case you want to explore code quickly before talking to the agent.

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
> The graft-deep plugin (see [[plugins]]) auto-injects relevant context into every new prompt — runs in the background with nothing extra to do, though it doesn't guarantee 100% that the model will always use the injected context (depends on each model's own ability). Graph freshness itself no longer needs this plugin at all — the current graft CLI refreshes itself before answering any query.

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

> [!important] Turn `open-design` on for this project first
> The `open-design` MCP is off by default (it costs ~6.6k tokens every turn) — put `{ "mcp": { "open-design": { "enabled": true } } }` in `my-real-project/opencode.json`, reopen opencode, and check `opencode mcp list` shows `open-design` as `connected`.

```
Use the open-design tool list_projects to see what projects exist,
then pull files from project <name> into this folder, and add a backend API next.
```

opencode will call `list_projects` → `get_project`/`get_artifact`/`get_file` on the open-design MCP itself, pull in the file contents, then write them into the real project using its own write tool — and then keep working as a normal full-stack session (wiring up a DB via the postgres/mysql MCP, testing via playwright/chrome-devtools, etc.).

> [!info] Summary of roles
> **OpenDesign** = the design/fast-frontend phase with a live preview · **opencode** (a separate session) = the real development phase, building it out into a full system, connected via the `open-design` MCP.

> [!warning] The daemon must be running
> Before using the `open-design` MCP, OpenDesign's daemon must be running (leave the app open, or run `od --no-open` headless) — full details/problems hit are in [[gotchas]], item 4.

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

Full list with fixes at [[gotchas]] — the short version:

- **An external tool connects to opencode then times out** → check whether the default model is too slow (item 1 in gotchas)
- **Set a new env var/PATH but it's not taking effect** → fully restart the relevant app, not just close its window (item 2)
- **The `open-design` MCP is connected but calling a tool fails** → the config must be plain `["od", "mcp"]` with no `--daemon-url` — since OpenDesign 0.22 the daemon uses a random port, not 7456 (item 4)
- **The same command gives different results between terminals** → try PowerShell instead of Git Bash on Windows (item 5)
- **The `sonarqube` MCP shows connected but calling a tool gives 401/403** → check whether the token used is a "User Token," not a "Global/Project Analysis Token" (see [[mcp-servers]], the sonarqube section) — the connection check only confirms it can reach the server, it doesn't check the token's permissions at that point
- **`trivy` shows `command not found` even though winget said it installed successfully** → restart the terminal (VS Code needs the whole app closed) — the same PATH staleness as item 2 (see [[mcp-servers]], the trivy section)
- **Every turn is slow / compactions are frequent / the agent keeps re-reading the same files** → measure the prompt size and the tool-call history with the scripts in [[tuning]] (items 11 and 13)
- **The agent doesn't use graft even though there's a `graft/` index** → the global AGENTS.md needs the "graft first, even inside a skill" rule (item 12)
- **`opencode debug skill` lists Claude Code's skills too** → set `OPENCODE_DISABLE_EXTERNAL_SKILLS=1` (item 15)
