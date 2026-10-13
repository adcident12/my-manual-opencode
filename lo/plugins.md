---
tags: [project-doc, plugins, opencode, reference]
updated: 2026-10-13
summary: superpowers (skill library), grill-me/grilling (batch-interview skill ເສີມ superpowers), graft-deep (custom plugin ທີ່ຂຽນເອງ), ponytail (code-minimization ruleset) ແລະ caveman (ຕອບສັ້ນ ໃຊ້ແທນ i-have-adhd) — ວິທີຕິດຕັ້ງແຕ່ລະໂຕເທິງ OpenCode 2 ແລະ plugin API ຂອງ OpenCode 2
---

# Plugins

ພາບລວມທີ [[index]] · MCP servers ທີ [[mcp-servers]]

> [!note] ກ່ອນເລີ່ມ
> ຕ້ອງມີ Git ຕິດຕັ້ງໃນເຄື່ອງກ່ອນ (ສຳລັບ plugin ທີ່ມາຈາກ `git+https://`) — ເບິ່ງວິທີຕິດຕັ້ງທີ່ [[setup]] Part 0

---

## superpowers — skill library

[obra/superpowers](https://github.com/obra/superpowers) ເປັນຊຸດ "skills" ຄືຄຳສັ່ງທີ່ບັງຄັບໃຫ້ agent ເຮັດຕາມ workflow ທີ່ດີ ເຊັ່ນ brainstorming, systematic-debugging, test-driven-development, writing-plans ເດີມເຮັດມາສຳລັບ Claude Code ແຕ່ມີ integration ໃຫ້ OpenCode ໂດຍສະເພາະ

### ຕິດຕັ້ງແບບມາດຕະຖານ

```jsonc
{ "plugin": ["superpowers@git+https://github.com/obra/superpowers.git"] }
```

ແລ່ນ `opencode service restart` ແລ້ວກວດສອບ:

```bash
opencode plugin list     # superpowers  <commit>  superpowers@git+https://...
```

superpowers 7.0.0 ມີ 15 skill: brainstorming, diagnosing-superpowers, dispatching-parallel-agents, executing-plans, finishing-a-development-branch, receiving-code-review, requesting-code-review, subagent-driven-development, systematic-debugging, test-driven-development, using-git-worktrees, using-superpowers, verification-before-completion, writing-plans, writing-skills ເທິງ OpenCode 2 ແຕ່ລະໂຕຕ້ອງມີແຖວ `allow` ໃນລາຍການ `permissions` ນຳ ([[gotchas]] ຂໍ້ 15)

> [!warning] superpowers 7.0.0 ປ່ຽນ `brainstorming` (2026-10)
> ຕອນນີ້ມັນປະເມີນຂະໜາດວຽກກ່ອນ "quick, clear task" (*"everything that matters is in the request"*) ໄປຂຽນ code ເລີຍໂດຍບໍ່ມີການອອກແບບໃຫ້ອະນຸມັດ "small change" ອະທິບາຍໃນແຊັດແລ້ວລໍຖ້າອະນຸມັດ "project" ໄດ້ design document ແລະ plan ສຳລັບວຽກທີ່ຍັງບໍ່ຊັດ ມັນຖາມຄຳຖາມປາຍເປີດ **ທີລະຂໍ້** ຕໍ່ຂໍ້ຄວາມ setup ນີ້ຮັກສາ workflow ຂອງຕົນເອງໄວ້ດ້ວຍກົດ 2 ຂໍ້ໃນ global AGENTS.md: "Approval before building" (ທຸກການປ່ຽນພຶດຕິກຳຕ້ອງລໍອະນຸມັດ) ແລະກົດ grill-me ຂ້າງລຸ່ມ (ຄຳຖາມເປັນຊຸດ) — [[gotchas]] ຂໍ້ 23, [[tuning]] ຫົວຂໍ້ 9

> [!info] ຊື່ tool ເທິງ OpenCode 2
> bootstrap ຂອງ superpowers ແປງຄຳສັ່ງຂອງມັນເປັນ tool ຂອງ OpenCode 2 ໃຫ້ເອງ: `shell` ແທນ `bash`, `subagent` ແທນ `task` OpenCode 2 **ບໍ່ມີ todo tool** — plan ຈະຖືກຕິດຕາມໃນໄຟລ໌ markdown ຂອງມັນແທນ

> [!info] ວິທີທີ່ superpowers ຝັງ context
> superpowers ຝັງ "bootstrap" ເຂົ້າ user message **ທຳອິດ** ຂອງ session (ບໍ່ແມ່ນ system message) — ຕັ້ງໃຈເຮັດແບບນີ້ເພື່ອຫຼຸດ token bloat ແລະປ້ອງກັນບັນຫາກັບບາງໂມເດວ (ເຊັ່ນ Qwen) ທີ່ມີບັນຫາກັບ multiple system messages ບໍ່ມີ flag ສຳເລັດຮູບສຳລັບປິດພຶດຕິກຳນີ້

### ວິທີແກ້ບັນຫາ GitHub ຖືກບລັອກເຄືອຂ່າຍ

ຖ້າ `git+https://github.com/...` ຕິດຕັ້ງບໍ່ໄດ້ ໃຫ້ກວດ error message ກ່ອນສະເໝີ — ສາເຫດມີ 2 ແບບທີ່ແກ້ຕ່າງກັນ:

**ກໍລະນີທີ 1 — ພົບໜ້າ block page ໂດຍກົງ** (ເຊັ່ນ FortiGate "Application Blocked") ຕອນເຂົ້າ github.com ຜ່ານ browser ແປວ່າເຄືອຂ່າຍບລັອກຈິງຕາມນະໂຍບາຍ IT

> [!warning] ຢ່າພະຍາຍາມຫຼີກລ່ຽງນະໂຍບາຍເຄືອຂ່າຍ
> ຖ້າເປັນ block page ໂດຍກົງ ບໍ່ຄວນພະຍາຍາມຫຼີກລ່ຽງ ເພາະເປັນນະໂຍບາຍທີ່ IT ຕັ້ງໃຈ ໃຫ້ໃຊ້ວິທີລຸ່ມນີ້ແທນ ຫຼືຂໍ IT allowlist

ວິທີຕິດຕັ້ງໂດຍບໍ່ຕ້ອງຜ່ານ GitHub:

1. **ໃຊ້ path ໃນເຄື່ອງທີ່ມີ source ຢູ່ແລ້ວ** — ຖ້າມີ Claude Code ຕິດຕັ້ງ superpowers ໄວ້ກ່ອນໜ້າ (ຜ່ານຊ່ອງທາງອື່ນທີ່ບໍ່ຖືກບລັອກ ເຊັ່ນ plugin marketplace) ໃຫ້ຊີ້ `plugin` ໄປທີ່ path ນັ້ນໂດຍກົງແທນ git URL:

   ```jsonc
   { "plugin": ["C:/Users/<user>/.claude/plugins/cache/claude-plugins-official/superpowers/<version>"] }
   ```

   ໃຊ້ໄດ້ເພາະ package ມີ `main` ຊີ້ໄປທີ່ `.opencode/plugins/superpowers.js` ຢູ່ແລ້ວໃນຕົວ — ບໍ່ຕ້ອງເພິ່ງ network ເລີຍ

2. **ທາງເລືອກອື່ນຖ້າບໍ່ມີ Claude Code** — ດາວໂຫຼດ zip ຂອງ repo ຈາກໜ້າ GitHub (ຖ້າເຂົ້າເວັບ github.com ໄດ້ ເຖິງແມ່ນ `git clone` ຈະໃຊ້ບໍ່ໄດ້) ແຕກ zip ໄວ້ບ່ອນໃດກໍໄດ້ ແລ້ວຊີ້ `plugin` ໄປທີ່ path ນັ້ນແທນ

**ກໍລະນີທີ 2 — error ເປັນ SSL certificate ບໍ່ແມ່ນ block page:**

```
fatal: unable to access 'https://github.com/...': unable to get local issuer certificate
```

ມັກໝາຍຄວາມວ່າອົງກອນເຮັດ SSL inspection (MITM ດ້ວຍ corporate root CA) ແຕ່ `git` ບໍ່ trust CA ນັ້ນ — browser trust ເພາະ Windows/OS ມີ CA ຕິດຕັ້ງໄວ້ ແຕ່ git ໃຊ້ certificate store ຂອງຕົນເອງ

> [!caution] ຖາມຜູ້ໃຊ້ກ່ອນແກ້ສະເໝີ
> ແກ້ໄດ້ດ້ວຍການຕັ້ງຄ່າ git ໃຫ້ໃຊ້ Windows certificate store (`git config http.sslBackend schannel`) ແຕ່ **ຄວນຖາມຜູ້ໃຊ້ກ່ອນເຮັດສະເໝີ** ເພາະທາງເທັກນິກແລ້ວມັນຄືການ trust MITM cert ຂອງອົງກອນ ບໍ່ແມ່ນການຕັດສິນໃຈທີ່ຄວນເຮັດເອງໂດຍພົນລະການ

**ເມື່ອ IT ອະນຸຍາດ GitHub ແລ້ວ** ໃຫ້ປ່ຽນກັບໄປໃຊ້ git URL ຕາມປົກກະຕິ (ຈະໄດ້ອັບເດດເວີຊັນໃໝ່ອັດຕະໂນມັດໃນອະນາຄົດ) — ຢ່າລືມລົບ cache ເກົ່າທີ່ຄ້າງຈາກຕອນ clone ບໍ່ສຳເລັດກ່ອນໜ້ານຳ:

```bash
rm -rf ~/.cache/opencode/packages/<plugin-name>@git+https_
```

---

## grill-me / grilling — batch-interview skill (ເສີມ superpowers, ບໍ່ແມ່ນ plugin)

[mattpocock/skills](https://github.com/mattpocock/skills) ເປັນ community skill ຂອງ Matt Pocock (Total TypeScript / AI Hero) ແຈກເປັນໄຟລ໌ `SKILL.md` ດ່ຽວໆ ຕາມມາດຕະຖານເປີດ **Agent Skills** (spec ດຽວກັນກັບທີ່ Claude Code ໃຊ້ ແລະ OpenCode ຮອງຮັບ native ໂດຍບໍ່ຕ້ອງດັດແປງ) — **ບໍ່ແມ່ນ plugin** ຈຶ່ງບໍ່ຕ້ອງເພີ່ມຫຍັງໃນ `plugin` array ຂອງ `opencode.jsonc` ເລີຍ ເບິ່ງກົນໄກ skill ແບບໄຟລ໌ເຕັມໆ ທີ່ [[setup]] ຫົວຂໍ້ "Skill ດ່ຽວໆ ຕາມ Agent Skills open standard"

ເຮັດວຽກເປັນຄູ່ 2 ໄຟລ໌:

- `grill-me` — entry point ເສີຍໆ (ມີ frontmatter field `disable-model-invocation: true` ຊຶ່ງເປັນຂອງສະເພາະ Claude Code — OpenCode ບໍ່ຮູ້ຈັກ field ນີ້ ຈະ **ignore ງຽບໆ ບໍ່ມີຜົນເສຍ** ເບິ່ງ [[setup]]) ພຽງ forward ໄປເອີ້ນ `grilling`
- `grilling` — ໂຕ logic ຈິງ: ສຳພາດຜູ້ໃຊ້ແບບ "design tree" — ທຸກການຕັດສິນໃຈແຕກເປັນການຕັດສິນໃຈຍ່ອຍ ຖາມເປັນ**ຮອບ** (round) ໂດຍຍິງທຸກຄຳຖາມທີ່ພ້ອມຖາມໄດ້ພ້ອມກັນ (ເອີ້ນວ່າ frontier) ແຕ່ລະຂໍ້ມີຄຳແນະນຳຄຳຕອບ (`➡️`) ແນບມານຳສະເໝີ ຈົບເມື່ອບໍ່ມີຄຳຖາມເຫຼືອແລະຜູ້ໃຊ້ຢືນຢັນວ່າເຂົ້າໃຈກົງກັນແລ້ວ

> [!info] ຕ່າງຈາກ `superpowers brainstorming` ແນວໃດ
> `brainstorming` (ຫົວຂໍ້ຂ້າງເທິງ) ກໍຖາມຄຳຖາມຊີ້ແຈງເໝືອນກັນ ແຕ່ຖາມເທື່ອລະຂໍ້ ແລະສຳລັບວຽກ bounded/architectural ຈະຈົບດ້ວຍການຂຽນ spec file ທີ່ `docs/superpowers/specs/` — `grilling` ຖາມເປັນ batch ໄວກວ່າ (ຍິງຫຼາຍຂໍ້ພ້ອມກັນຕໍ່ຮອບ) ແລະບໍ່ຂຽນໄຟລ໌ຫຍັງເລີຍ ເໝາະກັບ local model ທີ່ແຕ່ລະ turn ໃຊ້ເວລານານ

### ຕິດຕັ້ງ (vendor ໄຟລ໌ໂດຍກົງ ບໍ່ຜ່ານ plugin manager)

ສ້າງ 2 ໄຟລ໌ນີ້ທີ່ **global skills folder** ຂອງ OpenCode (ໃຊ້ໄດ້ທຸກ project ທັນທີ ບໍ່ຕ້ອງຕັ້ງຫຍັງຕໍ່ repo):

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

`~/.config/opencode/skills/grilling/SKILL.md` — ເວີຊັນທີ່ປັບສຳລັບ setup ນີ້ແລ້ວ (ເບິ່ງຫົວຂໍ້ "ປັບໃຫ້ເຂົ້າກັບ setup ນີ້" ຖັດໄປວ່າຕ່າງຈາກຕົ້ນສະບັບບ່ອນໃດ):

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

ບໍ່ຕ້ອງຣີສະຕາດ OpenCode — skill ແບບໄຟລ໌ໂຫຼດຜ່ານ native skill tool ເອີ້ນໃຊ້ໄດ້ທັນທີຫຼັງບັນທຶກໄຟລ໌ (ຕ່າງຈາກ plugin ທີ່ໂຫຼດຕອນ session ເລີ່ມເທົ່ານັ້ນ) ທົດສອບເອີ້ນໂດຍກົງໃນ session ດ້ວຍປະໂຫຍກທີ່ມີຄຳວ່າ "grill" ເຊັ່ນ `grill me about <ໄອເດຍ>`

> [!note] ຕົ້ນສະບັບບໍ່ໄດ້ປັບແຕ່ງຫຍັງຢູ່ທີ່
> - https://raw.githubusercontent.com/mattpocock/skills/main/skills/productivity/grill-me/SKILL.md
> - https://raw.githubusercontent.com/mattpocock/skills/main/skills/productivity/grilling/SKILL.md

### ປັບໃຫ້ເຂົ້າກັບ setup ນີ້ (ສຳຄັນ — ຢ່າຂ້າມ)

ຕົ້ນສະບັບຂອງ `grilling` ໃຊ້ຄຳວ່າ "dispatch a sub-agent to find [a fact]" ບ່ອນຫຍໍ້ໜ້າ "Finding facts is your job" — ຖ້າ workflow ຂອງເຈົ້າເພິ່ງ subagent ໜ້ອຍ/execute inline ເປັນຫຼັກ (ຄື setup ນີ້) ຄວນແກ້ຫຍໍ້ໜ້ານັ້ນໃຫ້ **ຫາ fact ເອງ inline ກ່ອນສະເໝີ**: ເອີ້ນ `graft ask` ຖ້າ project ມີ graft index (ເບິ່ງ [[mcp-servers]] ຫົວຂໍ້ "graft") ແລ້ວຄ່ອຍ fallback ເປັນ grep/ອ່ານໄຟລ໌ໂດຍກົງຖ້າບໍ່ມີ — dispatch sub-agent ສະເພາະຕອນມີໃຫ້ໃຊ້ຈິງແລະໜັກພຽງພໍເທົ່ານັ້ນ (code block ຂ້າງເທິງເປັນເວີຊັນທີ່ແກ້ແລ້ວ)

> [!tip] ເປັນຫຍັງຕ້ອງແກ້
> `graft`/subagent ເປັນທາງເລືອກ ບໍ່ແມ່ນທຸກ setup ຈະມີຫຼືຢາກໃຊ້ເໝືອນກັນ ປັບ instruction ໃຫ້ຕົງກັບເຄື່ອງມື/ສະໄຕລ໌ການເຮັດວຽກຈິງຂອງເຈົ້າສະເໝີ ແທນທີ່ຈະ copy ຕົ້ນສະບັບໂດຍກົງ ທຸກຄັ້ງທີ່ອັບເດດຈາກຕົ້ນທາງ ຕ້ອງ merge ການແກ້ນີ້ກັບຄືນເຂົ້າໄປນຳ (ເບິ່ງ [[updating]])

### ຜູກເຂົ້າກັບ superpowers brainstorming (ຕ້ອງເຮັດ ຖ້າຕິດຕັ້ງ superpowers ໄວ້ຢູ່ແລ້ວ)

`brainstorming` (ຫົວຂໍ້ຂ້າງເທິງ) ມີ hard gate ຂອງຕົນເອງຢູ່ແລ້ວ: **"MUST use this before any creative work"** — ຖ້າເພີ່ມ `grilling` ເຂົ້າໄປໂດຍບໍ່ຂຽນກົດ reconcile ໄວ້ກ່ອນ ຈະໄດ້ **gate ສອງອັນທີ່ແກ່ງແຍ່ງກັນຄວບຄຸມຈັງຫວະດຽວກັນ**

ວິທີແກ້ຄືຂຽນກົດໄວ້ໃນ **global** `~/.config/opencode/AGENTS.md` (ເບິ່ງ [[setup]] ຫົວຂໍ້ "AGENTS.md — global vs project" ວ່າເປັນຫຍັງຕ້ອງເປັນ global ບໍ່ແມ່ນ project) ໃຫ້ `grilling` **ເສີມ** `brainstorming` ແທນທີ່ຈະແຂ່ງກັນ:

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

> [!warning] ເປັນຫຍັງຕ້ອງເປັນ global ບໍ່ແມ່ນ project AGENTS.md
> ຖ້າຂຽນກົດນີ້ພຽງໃນ AGENTS.md ລະດັບ project (ໄຟລ໌ທີ່ `graft init` ຂຽນໃຫ້ອັດຕະໂນມັດ — ເບິ່ງ [[mcp-servers]]) ຈະໃຊ້ໄດ້ພຽງ repo ດຽວ project ອື່ນທີ່ຍັງບໍ່ໄດ້ແລ່ນ `graft init` ຫຼືຍັງບໍ່ມີ `AGENTS.md` ຈະບໍ່ມີກົດ reconcile ນີ້ເລີຍ ເຮັດໃຫ້ `grilling` ກັບໄປຂັດແຍ້ງກັບ `brainstorming` ຄືເດີມທັນທີທີ່ປ່ຽນ project

### ຢືນຢັນແລ້ວວ່າໃຊ້ງານໄດ້ຈິງ (ທົດສອບສົດ 2 ກໍລະນີ)

> [!info] ຜົນທົດສອບຈິງເທິງ project ເກມ browser ນ້ອຍໆ (local model, ບໍ່ແມ່ນ cloud)
> **ກໍລະນີ 1 — ເອີ້ນ `grilling` ໂດຍກົງ** ("grill me about ...") → ໂມເດວແຍກອອກໄດ້ເອງວ່າເປັນ standalone case ບໍ່ເອີ້ນ `brainstorming` ເລີຍ, ຫາ fact ດ້ວຍ `graft ask` inline (ບໍ່ມີ subagent), ຖາມເປັນ 2 ຮອບ (ລວມ 8 ຂໍ້) ຕາມ format ທີ່ກຳນົດ, ບໍ່ມີ spec file ຖືກສ້າງ, ລໍຄຳສັ່ງເລີ່ມກ່ອນລົງມື, ຈົບດ້ວຍ feature ທີ່ implement + browser-verify + commit ສຳເລັດ
>
> **ກໍລະນີ 2 — ຂໍ feature ໂດຍກົງ ບໍ່ເວົ້າຄຳວ່າ grill** ("ຊ່ວຍເພີ່ມ... ໃຫ້ແດ່") → ໂມເດວເອີ້ນ `brainstorming` ກ່ອນຕາມ gate ຫຼັກ, classify scope (bounded/architectural), ສຳຫຼວດໂຄ້ດດ້ວຍ graft, ແລ້ວ**ເອົາ format ຄຳຖາມຂອງ grilling ມາໃຊ້ແທນການຖາມເທື່ອລະຂໍ້** (ຕົງຕາມກົດທີ່ຂຽນໄວ້ໃນ global AGENTS.md ຢ່າງແທ້ຈິງ) ບໍ່ມີການເອີ້ນ `grilling` ຊ້ອນເປັນ skill call ທີ 2 ບໍ່ມີການຖາມສອງຮອບຊ້ຳກັນ ຈົບດ້ວຍ implement + test + commit ສຳເລັດເຊັ່ນກັນ (ບໍ່ມີ spec file ເພາະ classify ເປັນ bounded)
>
> ທັງສອງກໍລະນີບໍ່ມີການ dispatch subagent ເລີຍຕະຫຼອດທັງ session ຕົງກັບທີ່ຕັ້ງໃຈໄວ້

> [!warning] ທົດສອບຊ້ຳ 2026-10-03 — ກໍລະນີ 2 ບໍ່ໄດ້ໃຊ້ graft ທຸກເທື່ອ
> ທົດສອບຄົບວົງຈອນແບບ headless ອີກຮອບ (ຂໍ feature ນ້ອຍໃນສຳເນົາຂອງເກມດຽວກັນ) ພົບວ່າ `brainstorming` ຖືກເອີ້ນຖືກຕ້ອງ ແຕ່ໃນຂັ້ນສຳຫຼວດ code agent ເຮັດຕາມປະໂຫຍກ *"Explore project context — check files, docs, recent commits"* ຂອງ skill ແລ້ວ `read` ໄຟລ໌ເທື່ອລະອັນແທນການໃຊ້ graft — ກົດ grill-me ຂ້າງເທິງຄອບຄຸມພຽງຕອນຫາ fact ລະຫວ່າງ grilling ບໍ່ໄດ້ຄອບຄຸມຂັ້ນສຳຫຼວດຂອງ brainstorming ຈຶ່ງເພີ່ມກົດ "Exploring a codebase — graft first, even inside a skill" ໃນ global AGENTS.md (ຂໍ້ຄວາມເຕັມແລະຜົນກ່ອນ/ຫຼັງທີ່ [[tuning]] ຂໍ້ 4–5, [[gotchas]] ຂໍ້ 12)

---

## graft-deep — custom plugin (auto-inject context)

graft (ເບິ່ງ [[mcp-servers]]) ບໍ່ມີ "deep integration" ໃຫ້ OpenCode — ຄື auto-inject context ທີ່ກ່ຽວຂ້ອງຕໍ່ prompt — feature ນີ້ມີໃຫ້ພຽງ Claude Code ເທົ່ານັ້ນ (ສ່ວນ auto-rebuild ຫຼັງແກ້ໄຟລ໌ ຕອນນີ້ graft CLI ເອງເຮັດໃຫ້ທຸກ agent ຢູ່ແລ້ວ ເບິ່ງກ່ອງລຸ່ມນີ້) plugin ນີ້ port ພຶດຕິກຳ auto-inject ມາໂດຍໃຊ້ public CLI ຂອງ graft (`graft ask --json`) ແທນການ import internal module — ປອດໄພກວ່າແລະບໍ່ພັງຕອນ graft ອັບເດດເວີຊັນ

> [!info] ເຄີຍມີ hook auto-rebuild ນຳ — ຕັດອອກແລ້ວ (2026-09-13)
> ເວີຊັນທຳອິດຂອງ plugin ນີ້ມີ `tool.execute.after` hook ຄອຍ debounce 3 ວິນາທີແລ້ວສັ່ງ `graft build` ເອງໃນພື້ນຫຼັງທຸກຄັ້ງທີ່ແກ້ໄຟລ໌ ຢືນຢັນດ້ວຍການທົດສອບສົດແລ້ວວ່າ**ບໍ່ຈຳເປັນອີກຕໍ່ໄປ**: ແກ້ໄຟລ໌ແລ້ວເອີ້ນ `graft ask` ທັນທີໂດຍບໍ່ແລ່ນ `graft build` ເອງເລີຍ ໄດ້ຜົນລັບ `[graft] refreshed the graph (1 file changed) before answering` — ແປວ່າ graft CLI ປັດຈຸບັນ auto-refresh ກຣາຟກ່ອນຕອບທຸກຄຳຖາມໃນຕົວຢູ່ແລ້ວ (ເບິ່ງ [[mcp-servers]]) hook ທີ່ຕັດອອກບໍ່ພຽງແຕ່ຊ້ຳຊ້ອນເສີຍໆ ແຕ່ຍັງເປັນຕົ້ນເຫດຂອງ race condition ທີ່ເຄີຍບັນທຶກໄວ້ທີ່ [[gotchas]] ຂໍ້ 6 ນຳ — ຕັດສາເຫດຖິ້ມແທນທີ່ຈະແກ້ປາຍເຫດ

> [!info] ອັບເດດ 2026-09-25 — ເກນການ inject ໃໝ່ຂອງ graft 0.19.0 + ແກ້ໃຫ້ກົງກັບວິທີທີ່ OpenCode ເອີ້ນ hook ນີ້ແທ້
> ມີສອງເຫດຜົນແຍກກັນ ທັງສອງກວດຈາກ source code ແທ້ ບໍ່ໄດ້ເດົາ:
> 1. **graft 0.19.0 ປ່ຽນກົດການ inject ຂອງຕົນເອງ** (hook ຂອງ Claude Code ທີ່ plugin ນີ້ port ມາ) — ລາຍລະອຽດຢູ່ຫົວຂໍ້ "ເກນການ inject" ລຸ່ມນີ້
> 2. **ເວີຊັນກ່ອນຂຽນໂດຍຄິດວ່າ OpenCode ເຮັດວຽກຄື Claude Code — ຊຶ່ງບໍ່ແມ່ນ** ອ່ານ source ຂອງ OpenCode 1.18.32 ແລ້ວພົບວ່າສິ່ງທີ່ແກ້ໃນ `experimental.chat.messages.transform` ບໍ່ຖືກບັນທຶກເລີຍ context ທີ່ inject ຈຶ່ງຫາຍໄປຕັ້ງແຕ່ agent step ທີ 2 — ລາຍລະອຽດຢູ່ຫົວຂໍ້ "OpenCode ເອີ້ນ hook ນີ້ແນວໃດ" ລຸ່ມນີ້

> [!info] ກວດຊ້ຳ 2026-10-03 — graft 0.20.0 / 0.21.1 + OpenCode 1.18.34: ບໍ່ຕ້ອງແກ້ code
> `STRONG_FLOOR = 0.1`, `HIGH_FLOOR = 0.5`, `relevantRetrieval` ແລະ argument `ask … --json -n 3` ໃນ hook ຂອງ graft ຍັງຄືກັບ 0.19 ທຸກຈຸດ ແລະ `graft ask --json` ຍັງສົ່ງຄືນ `hits[].title`, `hits[].pointer`, `coverage`, `coverageStrong` ຄົບ — ຈຳລອງການເອີ້ນ hook ຫຼາຍ step ແລ້ວ context ຍັງຕິດຢູ່ທຸກ step ຕາມເດີມ
>
> ຂໍ້ຄວນຮູ້: hint "use graft first" ທີ່ plugin inject ໃຫ້ ບໍ່ພໍຈະເຮັດໃຫ້ໂມເດວເຊົາອ່ານໄຟລ໌ເທື່ອລະອັນຖ້າ skill ທີ່ໂຫຼດຢູ່ສັ່ງໃຫ້ເຮັດແບບນັ້ນ — ຕ້ອງມີກົດໃນ global AGENTS.md ນຳ ([[gotchas]] ຂໍ້ 12)

> [!important] ຂຽນໃໝ່ສຳລັບ OpenCode 2 (2026-10-11)
> OpenCode 2 ບໍ່ແລ່ນ plugin ແບບ V1 ([[gotchas]] ຂໍ້ 20) ຕອນນີ້ plugin ຈຶ່ງ default-export `{ id: 'graft-deep', setup(ctx) }` ແລະຕໍ່ context ໃນ **hook `prompt`**: ເຮັດວຽກເທື່ອດຽວຕອນ prompt ຂອງທ່ານຖືກຮັບເຂົ້າ ແລະສິ່ງທີ່ເພີ່ມຈະຖືກບັນທຶກເປັນສ່ວນໜຶ່ງຂອງຂໍ້ຄວາມທ່ານ ຊຶ່ງຄືພຶດຕິກຳແບບ Claude Code ທີ່ plugin ນີ້ພະຍາຍາມຮຽນແບບມາຕະຫຼອດ — ວິທີເກັບ cache ແລ້ວແປະຊ້ຳທີ່ OpenCode 1 ຕ້ອງໃຊ້ຈຶ່ງຫາຍໄປ ເກນການ inject ແລະການເອີ້ນ `graft ask` ແບບ async ທີ່ກັນ injection ຍັງຄືເດີມ
>
> ຄວາມຕ່າງທີ່ເຫັນໄດ້: ແຖວ `[graft] possibly relevant code…` ຈະຂຶ້ນລຸ່ມຂໍ້ຄວາມຂອງທ່ານໃນປະຫວັດ session

### ຕິດຕັ້ງ

1. ວາງໄຟລ໌ໄວ້ທີ່ `~/.config/opencode/plugin/graft-deep.js` (ສ້າງ folder `plugin` ຖ້າຍັງບໍ່ມີ) ເທິງ Windows ໃຫ້ແລ່ນ `npm install cross-spawn` ໃນ `~/.config/opencode` ໜຶ່ງເທື່ອນຳ
2. ບໍ່ຕ້ອງເພີ່ມຫຍັງໃນ array `plugin` — OpenCode 2 ໂຫຼດໄຟລ໌ `.js` ໃນ folder ນັ້ນເອງ ແລະ path ທີ່ເປັນໄຟລ໌ໃນ array ຈະຖືກປະຕິເສດ ([[gotchas]] ຂໍ້ 21)
3. `opencode service restart` ແລ້ວ `opencode api GET /api/plugin` ຕ້ອງສະແດງ `graft-deep` ເປັນ `active`
4. ບໍ່ຕ້ອງຕັ້ງຄ່າລາຍໂປຣເຈັກ — ຍົກເວັ້ນ `graft build` ທີ່ຍັງຕ້ອງແລ່ນເທື່ອດຽວຕໍ່ repo ຄືເດີມ (ເບິ່ງ [[mcp-servers]]) ຫຼັງຈາກນັ້ນ graft ດູແລໃຫ້ graph ສົດໃໝ່ເອງທຸກເທື່ອທີ່ຖືກຖາມ

### Plugin API ຂອງ OpenCode 2 ທີ່ໃຊ້

plugin ແບບ V2 default-export definition ແລ້ວ `setup(ctx)` ລົງທະບຽນ hook ເທິງ domain ທີ່ເປັນເຈົ້າຂອງ graft-deep ໃຊ້ໂຕດຽວ:

| Hook | ເຮັດວຽກຕອນໃດ | graft-deep ໃຊ້ເຮັດຫຍັງ |
| --- | --- | --- |
| `ctx.session.hook("prompt", …)` | ເທື່ອດຽວຕໍ່ prompt ຂອງຜູ້ໃຊ້ ກ່ອນຖືກບັນທຶກ — ບໍ່ເຮັດວຽກກັບ synthetic message, ຄຳສັ່ງ shell ຫຼື compaction | ແລ່ນ `graft ask` ກັບ `event.prompt.text` ແລ້ວຕໍ່ pack (ຫຼືຄຳແນະນຳ) ທ້າຍຂໍ້ຄວາມ ສິ່ງທີ່ແກ້ກາຍເປັນຂໍ້ຄວາມຜູ້ໃຊ້ທີ່ຖືກບັນທຶກ |

hook ອື່ນທີ່ setup ນີ້ໃຊ້: `ctx.session.hook("context", …)` (ເຮັດວຽກກ່ອນເອີ້ນໂມເດວ **ທຸກເທື່ອ** caveman push ຊຸດກົດຂອງມັນເຂົ້າ `event.system` ບ່ອນນີ້) ແລະ `ctx.event.subscribe()` (caveman ເຝົ້າ `session.created`) ລາຍການເຕັມຢູ່ໃນ [plugin docs](https://opencode.ai/v2/docs/build/plugins/) ຂອງ OpenCode ສ່ວນການຈັບຄູ່ V1 → V2 ຢູ່ໃນ [[gotchas]] ຂໍ້ 20

> [!note] ປະຫວັດເທິງ OpenCode 1
> ເທິງ OpenCode 1 plugin ໃຊ້ `experimental.chat.messages.transform` ຊຶ່ງສິ່ງທີ່ແກ້ຈະຖືກຖິ້ມຫຼັງເອີ້ນໂມເດວທຸກເທື່ອ ຈຶ່ງຕ້ອງ cache pack ຕາມ message ID ແລ້ວແປະຊ້ຳທຸກ step ([[gotchas]] ຂໍ້ 9) hook `prompt` ເຮັດໃຫ້ບໍ່ຕ້ອງເຮັດທັງໝົດນັ້ນແລ້ວ

### ເກນການ inject (ຕາມແບບ hook ຂອງ Claude Code ໃນ graft 0.19)

graft 0.19.0 ເລີກໃຊ້ threshold `coverage` ຄ່າດຽວ (plugin ນີ້ເຄີຍໃຊ້ `0.12` ສ່ວນ graft ເອງໃຊ້ `0.15`) ຫຼັງພົບວ່າ pack ທີ່ກ້ຳກຶ່ງ "reads as orientation and suppresses the very retrieval call it should have triggered" (`dist/claude/format.js`) ຕອນນີ້ plugin ໃຊ້ສອງເກນດຽວກັບ `relevantRetrieval` ຂອງ graft:

1. **Strength** — ຜົນແບບ lexical ຈະຖືກ inject ກໍຕໍ່ເມື່ອ hit ອັນດັບທຳອິດກົງກັບ**ຊື່** symbol ແທ້ (`coverageStrong ≥ 0.1`) ຫຼືກົງກັບ query ແບບກວ້າງພໍ (`coverage ≥ 0.5`) ບໍ່ດັ່ງນັ້ນຈະ inject hint ແຖວດຽວຊີ້ໄປທີ່ graft tools ແທນ — ບໍ່ເກີນ 2 ຄັ້ງຕໍ່ session ຜົນແບບ structural (ເຊັ່ນ "ໃຜເອີ້ນ X") ບໍ່ມີຄະແນນ coverage ແລະຜ່ານສະເໝີ — ເວີຊັນກ່ອນນັບ `coverage` ທີ່ບໍ່ມີເປັນ `0` ແລ້ວຕັດຖິ້ມງຽບໆ
2. **Novelty** — hit ທີ່ `pointer` ເຄີຍ inject ໄປແລ້ວໃນ session ນີ້ຈະຖືກຕັດອອກ (ຈຳຫຼ້າສຸດ 40 ໂຕ) ຖ້າບໍ່ເຫຼືອເລີຍກໍບໍ່ inject ຫຍັງ

ຕົວຢ່າງທີ່ວັດແທ້ (graft 0.19.0, repo Next.js ແທ້): prompt "who calls the api client" ໄດ້ `coverage 0.20`, `coverageStrong 0` — ບໍ່ມີ hit ໃດກົງກັບຊື່ symbol ເລີຍ threshold ເດີມ `0.12` ຈະ inject hit ທີ່ບໍ່ກ່ຽວຂ້ອງ 3 ໂຕນັ້ນໄປທັງໝົດ ຕອນນີ້ inject hint ແທນ ສ່ວນ "where is createTicket defined" ກົງກັບຊື່ symbol ຈຶ່ງ inject pack ຕາມປົກກະຕິ

> [!tip] ກວດຊ້ຳທຸກຄັ້ງທີ່ອັບເກຣດ graft
> graft-deep ບໍ່ມີຕົ້ນທາງຂອງຕົນເອງ ແຕ່ລອກແບບ hook ຂອງ graft ມາ ຄວນທຽບທຸກຄັ້ງທີ່ graft ປ່ຽນເວີຊັນ:
> ```bash
> G="$(npm root -g)/@nanonets/graft/dist"
> grep -n "STRONG_FLOOR =\|HIGH_FLOOR =" "$G/ask/fuse.js"               # threshold ສອງໂຕ
> grep -n "function relevantRetrieval" -A 25 "$G/claude/format.js"       # ໂຕເກນເອງ
> grep -n "'ask', prompt" "$G/claude/hooks.js"                           # flag ຂອງ ask ທີ່ graft ໃຊ້ເອງ
> graft ask --help                                                       # --json / -n ຍັງຢູ່ບໍ່
> ```
> ແລະກວດວ່າ `graft ask ... --json` ຍັງຄືນ `hits[].title`, `hits[].pointer`, `coverage` ແລະ `coverageStrong` ຢູ່ (`dist/ask/ask.d.ts` — `AskResult`)

### ບົດຮຽນສຳຄັນຕອນຂຽນ (Windows-specific)

**1. `execFileSync('npx.cmd', args, {shell:false})` ພັງເທິງ Windows** — throw `EINVAL` ເພາະ Windows spawn ໄຟລ໌ `.cmd` ໂດຍກົງໂດຍບໍ່ຜ່ານ shell ບໍ່ໄດ້

**2. `shell:true` + ຕໍ່ string ເອງ = command injection risk** — prompt ເປັນ free text ຈາກຂໍ້ຄວາມແຊັດຂອງ user ໄປຕໍ່ເປັນ shell string ໂດຍກົງບໍ່ປອດໄພ

> [!danger] Security
> ຫ້າມເອົາ free text ທີ່ມາຈາກ user ໄປຕໍ່ເປັນ shell command string ເດັດຂາດ ເຖິງແມ່ນຈະຂຽນຟັງຊັນ escape ເອງກໍຕາມ

**3. ວິທີທີ່ຖືກຕ້ອງ** ໃຊ້ `cross-spawn` (dependency ທີ່ OpenCode ມີຢູ່ແລ້ວໃນ `node_modules` ຂອງຕົນເອງ) ຊຶ່ງຈັດການ argv quoting ຂອງ Windows ຖືກຕ້ອງໂດຍບໍ່ຜ່ານ shell — import ແບບ dynamic ສະເພາະຕອນ `process.platform === 'win32'` ເທົ່ານັ້ນ ຝັ່ງ macOS/Linux ໃຊ້ `spawn` ທີ່ built-in ໃນ Node ໂດຍກົງໄດ້ເລີຍເພາະ POSIX ບໍ່ມີບັນຫານີ້ ທັງສອງໂຕມີ API ແບບ async ຄືກັນ (`spawn` ບໍ່ແມ່ນ `.sync`) ໂຄ້ດສ່ວນອື່ນຈຶ່ງບໍ່ຕ້ອງສົນວ່າໄດ້ໂຕໃດມາ

### ໂຄ້ດເຕັມ

> [!tip] ໄຟລ໌ພ້ອມ copy: [`config/plugin/graft-deep.js`](../config/plugin/graft-deep.js)
> ໂຄ້ດຂ້າງລຸ່ມຄືໄຟລ໌ດຽວກັນ — ໃຊ້ໄຟລ໌ໃນ `config/` ເປັນຕົ້ນສະບັບເວລາ copy ໄປວາງທີ່ `~/.config/opencode/plugin/`

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

### ວິທີປິດຊົ່ວຄາວຖ້າຊ້າເກີນໄປ

`graft ask` ບໍ່ blocking OpenCode ແລ້ວ (ເປັນ async) ແຕ່ step ທຳອິດຂອງ user turn ໃໝ່ຍັງຕ້ອງລໍຜົນຢູ່ — ດົນສຸດ 8 ວິນາທີ ປົກກະຕິ 2-3 ວິນາທີ (ລວມເວລາເລີ່ມ `npx`) step ຕໍ່ໄປບໍ່ຖາມຊ້ຳ ຖ້າຢາກປິດໂດຍບໍ່ແກ້ໂຄ້ດ ໃຊ້ env var:

```bash
GRAFT_AUTO_CONTEXT=0 opencode
```

### ວິທີທົດສອບ plugin ໂດຍບໍ່ຕ້ອງລໍ agent loop ຊ້າໆ

ເອີ້ນ `setup` ດ້ວຍ `ctx` ປອມແບບນ້ອຍທີ່ສຸດຈາກ node script ແລ້ວແລ່ນ hook `prompt` ທີ່ຈັບໄວ້ໄດ້ໂດຍກົງ — ບໍ່ຕ້ອງມີໂມເດວ ບໍ່ຕ້ອງມີ OpenCode:

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
  console.log(event.prompt.text);   // ເທື່ອທຳອິດ: prompt + "[graft] possibly relevant code…"; ເທື່ອທີສອງ: ບໍ່ປ່ຽນ (novelty gate)
}
```

ເທິງ Windows ໃຫ້ແລ່ນພ້ອມ `NODE_PATH` ທີ່ຊີ້ໄປ folder ທີ່ມີ `cross-spawn` (ເຊັ່ນ `NODE_PATH=~/.config/opencode/node_modules`)

---

## execute-guard — ຢຸດສະຄຣິບ Code Mode ທີ່ບໍ່ມີວັນຈົບ (custom, OpenCode 2)

Code Mode ບໍ່ມີໂຕຈັບເວລາ ແລະ `execute` ບໍ່ມີ timeout ລວມ ເວລາໂມເດວຢາກ "ລໍຖ້າ" ມັກຂຽນ `await new Promise(() => {})` ເຊິ່ງບໍ່ມີວັນຈົບ session ຈຶ່ງຄ້າງຢູ່ບ່ອນນັ້ນຈົນກວ່າຈະມີຄົນກົດຢຸດ ([[gotchas]] ຂໍ້ 29)

ກ່ອນ `execute` ທຸກຄັ້ງ plugin ນີ້ຈະຊອກ `new Promise(` ທີ່ executor ບໍ່ຮັບພາຣາມິເຕີ (ເຊິ່ງຈົບເອງບໍ່ໄດ້) ແລ້ວແລ່ນ executor ໂຕເດີມ ແລະໃຫ້ promise ຈົບດ້ວຍຄ່າທີ່ executor return ພ້ອມພິມໜຶ່ງແຖວບອກໂມເດວໃຫ້ໃຊ້ `tools["chrome-devtools"].wait_for` ແທນ promise ທີ່ executor ຮັບ `resolve` ຈະບໍ່ຖືກແຕະ ແລະສ່ວນອື່ນຂອງສະຄຣິບບໍ່ປ່ຽນ

- **ໄຟລ໌:** [`config/plugin/execute-guard.js`](../config/plugin/execute-guard.js) → `~/.config/opencode/plugin/execute-guard.js` ບໍ່ຕ້ອງໃສ່ໃນ config ເພາະ OpenCode 2 ໂຫຼດໄຟລ໌ `.js` ໃນໂຟນເດີນັ້ນເອງ ແລະໂຫຼດໃໝ່ເມື່ອໄຟລ໌ປ່ຽນ
- **API ທີ່ໃຊ້:** `ctx.tool.hook("execute.before", event => { event.input.code = ... })` OpenCode 2 ໃຫ້ hook `before` ປ່ຽນ input ຂອງ tool ໄດ້
- **ຜົນທີ່ວັດໄດ້:** ກ່ອນມີ plugin ເກີດ `execute` ດົນເກີນ 120 ວິນາທີ 4 ຄັ້ງໃນຄືນດຽວ (265–849 ວິນາທີ) ຫຼັງໃສ່ 3 ມື້ບໍ່ເກີດເລີຍ plugin ແກ້ສະຄຣິບໄປ 2 ຄັ້ງ ແລະທັງສອງຄັ້ງເຮັດວຽກຕໍ່ໄດ້ຕາມປົກກະຕິ

## compaction-keep — ໃຫ້ສະຫຼຸບຕອນ compaction ເກັບສະຖານະວຽກໄວ້ (custom, OpenCode 2)

ສະຫຼຸບແບບຄ່າເລີ່ມຕົ້ນເກັບໃຈຄວາມຂອງບົດສົນທະນາ ແຕ່ບໍ່ເກັບຂໍ້ເທັດຈິງທີ່ຂັ້ນຕໍ່ໄປຕ້ອງໃຊ້ agent ຈຶ່ງອ່ານໄຟລ໌ເດີມຊ້ຳຫຼັງ compaction ທຸກຄັ້ງ plugin ນີ້ເພີ່ມຄຳສັ່ງເຂົ້າໄປໃນ prompt ຂອງການສະຫຼຸບເທົ່ານັ້ນ (hook `compaction` ບໍ່ເຮັດວຽກໃນ turn ປົກກະຕິ) ໃຫ້ສະຫຼຸບຕ້ອງເກັບ:

1. ຄຳຂໍແລະການອະນຸມັດທຸກຄັ້ງ ແບບຄຳຕໍ່ຄຳ
2. plan file ແລະສະຖານະຂອງແຕ່ລະຂໍ້
3. ໄຟລ໌ທີ່ແກ້
4. ຂໍ້ເທັດຈິງຈາກໄຟລ໌ທີ່ອ່ານ (ຊື່, signature, ຊ່ວງແຖວ)
5. ຄຳສັ່ງກວດວຽກ ລວມເຖິງ dev server ແລະພອດທີ່ຍັງແລ່ນຢູ່
6. ບັນຫາທີ່ຍັງຄ້າງ

- **ໄຟລ໌:** [`config/plugin/compaction-keep.js`](../config/plugin/compaction-keep.js) → `~/.config/opencode/plugin/compaction-keep.js`
- **API ທີ່ໃຊ້:** `ctx.session.hook("compaction", event => event.system.push({ type: "text", text: KEEP }))`
- **ຜົນທີ່ວັດໄດ້:** ຫຼັງຈາກນັ້ນທຸກສະຫຼຸບລະບຸໄຟລ໌ແລະຂໍ້ເທັດຈິງ (ຍາວປະມານ 7,000 ໂຕອັກສອນຕໍ່ຄັ້ງ) ແຕ່ການອ່ານຊ້ຳຫຼັງ compaction ບໍ່ໄດ້ຫຼຸດລົງເພາະ plugin ນີ້ຢ່າງດຽວ ທີ່ຊ່ວຍຄືຄືນ `keep.tokens` ເປັນ 15000 ເຮັດໃຫ້ compact ໜ້ອຍລົງ ([[tuning]] ຂໍ້ 10)

## ponytail — code-minimization ruleset

[dietrichgebert/ponytail](https://github.com/dietrichgebert/ponytail) ເປັນ ruleset/skill ທີ່ບັງຄັບໃຫ້ agent ຄິດແບບ "senior dev ຂີ້ຄ້ານທີ່ສຸດໃນຫ້ອງ" ກ່ອນຂຽນໂຄ້ດໃໝ່ທຸກຄັ້ງຕ້ອງໄລ່ decision ladder ຕາມລຳດັບ: ບໍ່ຈຳເປັນກໍບໍ່ຂຽນ → ມີຢູ່ແລ້ວໃນ project ກໍ reuse → standard library ມີບໍ່ → native platform feature ມີບໍ່ → dependency ທີ່ຕິດຕັ້ງຢູ່ແລ້ວມີບໍ່ → ຂຽນແຖວດຽວໄດ້ບໍ່ → ຈຶ່ງຄ່ອຍຂຽນໂຄ້ດໃໝ່ເທົ່າທີ່ຈຳເປັນຈິງໆ (validation/security/accessibility ຍັງຕ້ອງເຮັດສະເໝີ ບໍ່ຫຼຸດຜ່ອນເພາະ minimal)

### ຕິດຕັ້ງເທິງ OpenCode

ເພີ່ມ plugin ເຂົ້າ `opencode.json`/`opencode.jsonc`:

```jsonc
{ "plugin": ["@dietrichgebert/ponytail"] }
```

ຣີສະຕາດ OpenCode ແລ້ວລອງແລ່ນ `/ponytail-help` ເພື່ອກວດວ່າ activate ສຳເລັດ

> [!note] Requirement
> ຕ້ອງມີ Node.js ຢູ່ເທິງ PATH ສຳລັບ lifecycle hooks ເຕັມຮູບແບບ — ຖ້າບໍ່ມີ core skill ຍັງເຮັດວຽກໄດ້ ແຕ່ບາງ activation feature ຈະງຽບໄປ (ເບິ່ງວິທີຕິດຕັ້ງ Node ທີ່ [[setup]] Part 0)

### ຄຳສັ່ງທີ່ໃຊ້ໄດ້

| ຄຳສັ່ງ | ໜ້າທີ່ |
| --- | --- |
| `/ponytail [lite\|full\|ultra\|off]` | ປັບຄວາມເຂັ້ມ/ປິດການເຮັດວຽກ |
| `/ponytail-review` | ກວດ diff ປັດຈຸບັນວ່າ over-engineer ບໍ່ |
| `/ponytail-audit` | ສະແກນທັງ repo ຫາໂຄ້ດທີ່ບໍ່ຈຳເປັນ |
| `/ponytail-debt` | ບັນທຶກຈຸດທີ່ເລື່ອນການ simplify ໄວ້ |
| `/ponytail-gain` | ເບິ່ງ benchmark ຜົນລັບ |
| `/ponytail-help` | ອ້າງອິງຄຳສັ່ງໄວ |

### Config ເພີ່ມເຕີມ (optional)

- Env var: `PONYTAIL_DEFAULT_MODE=lite|full|ultra|off`
- ຫຼືໄຟລ໌ config: `~/.config/ponytail/config.json` (Windows: `%APPDATA%\ponytail\config.json`) — ໃສ່ field `defaultMode`
- ຈຳກັດການ inject ruleset ເຂົ້າສະເພາະ subagent ບາງໂຕ: ຕັ້ງ `PONYTAIL_SUBAGENT_MATCHER` ເປັນ regex

### Uninstall

ຕ້ອງແລ່ນ uninstall script ກ່ອນຖອດ plugin ເພື່ອລ້າງ config ໃຫ້ໝົດ:

```bash
node scripts/uninstall.js
```

> [!info] Benchmark ທີ່ຜູ້ພັດທະນາອ້າງໄວ້ໃນ README
> ທົດສອບເທິງ FastAPI + React repo ຈິງ: ໂຄ້ດໜ້ອຍລົງ ~54% (ສູງສຸດເຖິງ 94% ໃນບາງ task ດ່ຽວ), cost ຫຼຸດລົງ ~20%, ໄວຂຶ້ນ ~27%, ຄວາມປອດໄພຄົງເດີມທີ່ 100% — ເປັນຕົວເລກຈາກຝັ່ງຜູ້ພັດທະນາ ຍັງບໍ່ໄດ້ verify ຊ້ຳເອງໃນວຽກຈິງ

---

## caveman — ຕອບສັ້ນ ກົງປະເດັນ (ໃຊ້ແທນ i-have-adhd)

[JuliusBrussee/caveman](https://github.com/JuliusBrussee/caveman) (Apache-2.0) ມີສອງສ່ວນ: **skill** ທີ່ເຮັດໃຫ້ agent ຕອບສັ້ນລົງ ກັບ **proxy** ທີ່ບີບຜົນຂອງ tool ກ່ອນສົ່ງໃຫ້ໂມເດວ — setup ນີ້ໃຊ້**ສະເພາະ skill** (ເຫດຜົນທີ່ບໍ່ໃຊ້ proxy ຢູ່ທ້າຍຫົວຂໍ້)

ກົດຂອງ skill: ຕອບຄຳຕອບກ່ອນແລ້ວຈຶ່ງເຫດຜົນ · ບໍ່ມີຄຳທັກທາຍ/ຄຳທວນ/ຄຳປິດທ້າຍ · ໃຊ້ຄຳສັ້ນ · ໜຶ່ງປະໂຫຍກໜຶ່ງຄວາມຄິດ · ຕອບເປັນພາສາດຽວກັບຜູ້ໃຊ້ · **code, ຄຳສັ່ງ, path, ຕົວເລກ ແລະຂໍ້ຄວາມ error ຂຽນເຕັມສະເໝີ** · ກັບໄປຂຽນເຕັມປະໂຫຍກເອງເມື່ອເປັນຄຳເຕືອນດ້ານຄວາມປອດໄພ ຫຼືການກະທຳທີ່ຍ້ອນບໍ່ໄດ້

> [!info] ເປັນຫຍັງຈຶ່ງແທນ i-have-adhd (2026-10-03)
> ສອງໂຕເຮັດໜ້າທີ່ດຽວກັນ (ຄຸມ style ການຕອບ) ເປີດພ້ອມກັນຈະມີກົດສອງຊຸດຊ້ອນກັນ caveman ເປີດເອງທຸກ session, ສະຫຼັບໂໝດໄດ້ (`/caveman off`) ແລະມີ `/caveman-commit` / `/caveman-review` ມານຳ — i-have-adhd ຍັງໃຊ້ໄດ້ເປັນທາງເລືອກ (ຫົວຂໍ້ຕໍ່ໄປ) ແຕ່**ຢ່າເປີດທັງສອງ**

### ຕິດຕັ້ງເທິງ OpenCode — ເຮັດເອງ ບໍ່ໃຊ້ installer

> [!warning] ຢ່າແລ່ນ `bin/install.js --only opencode` ຖ້າ config ເປັນ `.jsonc` ທີ່ມີ comment
> installer ຂຽນ `opencode.jsonc` ໃໝ່ເປັນ JSON ທຳມະດາ — **comment ທັງໝົດຫາຍ** (ມັນເກັບ `.bak` ໄວ້ໃຫ້) ແລະລົງ skill 9 ໂຕ + subagent `cavecrew` 3 ໂຕ + ບລັອກກົດໃນ global AGENTS.md ຊຶ່ງເກີນທີ່ setup ນີ້ຕ້ອງໃຊ້ ([[gotchas]] ຂໍ້ 18)

ດາວໂຫຼດສະເພາະໄຟລ໌ທີ່ໃຊ້ ຈາກ tag ທີ່ລັອກໄວ້:

```bash
T=v3.1.0; R=https://raw.githubusercontent.com/JuliusBrussee/caveman/$T; C=~/.config/opencode
mkdir -p $C/plugins/caveman $C/commands
curl -fsSL $R/src/plugins/opencode/plugin.js    -o $C/plugins/caveman/plugin.js
curl -fsSL $R/src/plugins/opencode/package.json -o $C/plugins/caveman/package.json
curl -fsSL $R/src/hooks/caveman-config.js       -o $C/plugins/caveman/caveman-config.cjs   # ຕ້ອງປ່ຽນນາມສະກຸນເປັນ .cjs
curl -fsSL $R/src/hooks/caveman-parse.js        -o $C/plugins/caveman/caveman-parse.cjs
for s in caveman caveman-commit caveman-review; do
  mkdir -p $C/skills/$s
  curl -fsSL $R/skills/$s/SKILL.md                  -o $C/skills/$s/SKILL.md
  curl -fsSL $R/src/plugins/opencode/commands/$s.md -o $C/commands/$s.md
done
```

ຈາກນັ້ນ port ເປັນ OpenCode 2 — `plugin.js` ຈາກຕົ້ນທາງຍັງເປັນ plugin ແບບ V1 (v3.2.0 ກໍເຊັ່ນກັນ) ຊຶ່ງ OpenCode 2 ຂ້າມໄປງຽບໆ ([[gotchas]] ຂໍ້ 20):

```bash
node scripts/port-caveman-opencode2.mjs     # ຈາກ repo ນີ້; ເກັບຕົ້ນສະບັບໄວ້ເປັນ plugin.v1.js
```

[`port-caveman-opencode2.mjs`](../scripts/port-caveman-opencode2.mjs) ເກັບ helper ທຸກໂຕໃນ `plugin.js` ໄວ້ ແລະແທນສະເພາະຟັງຊັນທີ່ export: `chat.message` → `ctx.session.hook("prompt")`, `experimental.chat.system.transform` → `ctx.session.hook("context")`, hook `event` → `ctx.event.subscribe()` ແລະຍັງຂຽນ `~/.config/opencode/plugin/caveman.js` ຊຶ່ງເປັນ shim ແຖວດຽວທີ່ໂຫຼດ `plugins/caveman/plugin.js` OpenCode 2 ໂຫຼດໄຟລ໌ `.js` ໃນ `plugin/` ເອງ ແຕ່ຂ້າມ folder `plugins/caveman` ໄປໂດຍບໍ່ບອກເຫດຜົນ ແລະ path ທີ່ເປັນໄຟລ໌ໃນ array `plugin` ຈະຖືກປະຕິເສດ ([[gotchas]] ຂໍ້ 21) ສະນັ້ນ **ຢ່າໃສ່ caveman ໃນ array `plugin`**

> [!note] ບໍ່ຕ້ອງຕໍ່ກົດເຂົ້າ global AGENTS.md
> ເມື່ອໂໝດເປີດຢູ່ plugin ໃສ່ `skills/caveman/SKILL.md` ທັງໄຟລ໌ (~1.07k tokens) ເຂົ້າ system prompt ຂອງການເອີ້ນໂມເດວທຸກເທື່ອ (hook `context`) — ບລັອກໃນ AGENTS.md ທີ່ installer ຂຽນໃຫ້ຈະຊ້ຳ ແລະຍັງເຮັດວຽກຕໍ່ເຖິງວ່າສັ່ງ `/caveman off` plugin ບໍ່ມີ network call ແລະບໍ່ spawn process (ອ່ານ/ຂຽນພຽງໄຟລ໌ flag `~/.config/opencode/.caveman-active`)

ກວດ: `opencode service restart` → `opencode api GET /api/plugin` ສະແດງ `caveman` ເປັນ `active`, `opencode api GET /api/command` ມີ `caveman`, `caveman-commit`, `caveman-review` ແລະໄຟລ໌ `~/.config/opencode/.caveman-active` ມີຄຳວ່າ `caveman` skill ທັງສາມຕ້ອງມີແຖວ `allow` (`caveman*`) ໃນ `permissions` ນຳ

### ຄຳສັ່ງ

| ຄຳສັ່ງ | ເຮັດຫຍັງ |
| --- | --- |
| `/caveman` · `/caveman off` · `/caveman status` | ເປີດ / ປິດ / ເບິ່ງໂໝດ (ພິມ `normal mode` ຫຼື `stop caveman` ກໍປິດໄດ້) |
| `/caveman-commit` | ຂຽນຂໍ້ຄວາມ commit ແບບ Conventional Commits ສຳລັບໄຟລ໌ທີ່ stage ໄວ້ — **ບໍ່ໄດ້ແລ່ນ `git commit` ໃຫ້** |
| `/caveman-review [files]` | ຣີວິວ diff ແບບໜຶ່ງແຖວຕໍ່ປະເດັນ ພ້ອມລະດັບ 🔴/🟡/🟢 |

ຕັ້ງໂໝດເລີ່ມຕົ້ນດ້ວຍ env var `CAVEMAN_DEFAULT_MODE`

### ຜົນທີ່ວັດໄດ້ເທິງ setup ນີ້

- **ຕົ້ນທຶນ:** prompt ຕໍ່ turn ເພີ່ມ ~1.2k tokens (ruleset ~1,070 + ລາຍການ skill 3 ໂຕ) — ຈາກ ~32.6k ເປັນ ~34.0k
- **ຜົນ:** ຄຳຕອບສຸດທ້າຍສັ້ນລົງເລັກນ້ອຍ (~9% ໃນການທົດສອບ) ແລະອ່ານງ່າຍຂຶ້ນ ແຕ່ **output tokens ລວມຂອງທັງ turn ບໍ່ຫຼຸດລົງແບບວັດໄດ້** — ໃນວຽກຂຽນ code output ສ່ວນໃຫຍ່ຄື tool call ກັບ code ຊຶ່ງ skill ບໍ່ແຕະ (JetBrains ວັດໄດ້ 8.5% ໃນວຽກແທ້ 86 ວຽກ) ໃຊ້ເພາະອ່ານງ່າຍ ບໍ່ແມ່ນເພາະປະຢັດ — ລາຍລະອຽດທີ່ [[tuning]] ຂໍ້ 8

> [!note] ເປັນຫຍັງບໍ່ໃຊ້ proxy ຂອງ caveman
> (1) ຕອນ wrap OpenCode ມັນປ່ຽນ `baseURL` ສະເພາະ provider `openai` ແລະ `anthropic` — provider ແບບກຳນົດເອງ (ເຊັ່ນ llama.cpp ທີ່ host ເອງ) ບໍ່ຜ່ານ proxy (2) CLI ສົ່ງ telemetry ເປັນຄ່າເລີ່ມຕົ້ນ ລວມ IP (`caveman telemetry off` ປິດໄດ້) (3) ເພີ່ມ MCP tool 5 ໂຕເຂົ້າ prompt ທຸກ turn — ຍັງບໍ່ໄດ້ທົດສອບ

### ຖອດ

ລຶບ `~/.config/opencode/plugin/caveman.js`, `~/.config/opencode/plugins/caveman/`, `skills/caveman*/`, `commands/caveman*.md` ແລະໄຟລ໌ `.caveman-active`

### ອັບເດດ

ປ່ຽນ `T=` ເປັນ tag ໃໝ່ ແລ່ນບລັອກດາວໂຫຼດຊ້ຳ ແລ້ວແລ່ນ `port-caveman-opencode2.mjs` ອີກເທື່ອ — ເບິ່ງ [[updating]]

---

## i-have-adhd — ບັງຄັບຕອບກົງປະເດັນ ບໍ່ອ້ອມແອ້ມ

> [!warning] ທາງເລືອກ — setup ນີ້ໃຊ້ caveman ແທນແລ້ວ (2026-10-03)
> ຫົວຂໍ້ນີ້ເກັບໄວ້ສຳລັບຄົນທີ່ຢາກໄດ້ແບບ opt-in ຕໍ່ session ແທນແບບເປີດຕະຫຼອດ ຕິດຕັ້ງໂຕໃດໂຕໜຶ່ງເທົ່ານັ້ນ

[ayghri/i-have-adhd](https://github.com/ayghri/i-have-adhd) (39k+ stars, MIT) ເປັນ skill ທີ່ປ່ຽນ **ຮູບແບບການຕອບຂອງ agent** ບໍ່ແມ່ນ code ruleset ຄື ponytail — ບັງຄັບ 10 ກົດ: ບອກ next action ກ່ອນສະເໝີ, ເລກ step ໃຫ້ຊັດ, ຈົບດ້ວຍ concrete next step ດຽວ, ຕັດ tangent/preamble/closer ("Hope this helps!"), list ບໍ່ເກີນ 5 ຂໍ້, ບອກເວລາເປັນຕົວເລກຈິງ, error ເວົ້າກົງໆ ບໍ່ມີນ້ຳ ຮອງຮັບ Claude Code, Cursor, Gemini, Kimi, Qwen ແລະ OpenCode ໃນຕົວດຽວກັນ

### ຕິດຕັ້ງເທິງ OpenCode

ບໍ່ມີເທິງ npm — ໃຊ້ວິທີ clone source ມາໄວ້ໃນເຄື່ອງແລ້ວຊີ້ `plugin` ໄປທີ່ path ຂອງໄຟລ໌ `.opencode/plugins/i-have-adhd.mjs` ໂດຍກົງ:

```bash
git clone https://github.com/ayghri/i-have-adhd ~/.config/opencode/vendor/i-have-adhd
```

```jsonc
{ "plugin": ["C:/Users/<user>/.config/opencode/vendor/i-have-adhd/.opencode/plugins/i-have-adhd.mjs"] }
```

ຣີສະຕາດ OpenCode ແລ້ວພິມ `/i-have-adhd` ໃນ session ເພື່ອເປີດໃຊ້ (toggle ຕໍ່ session ເທົ່ານັ້ນ — ພິມ `stop adhd mode` ຫຼື `normal mode` ເພື່ອປິດ)

> [!note] plugin ນີ້ເຮັດຫຍັງຈິງ
> `config` hook ລົງທະບຽນ skill directory ຂອງ repo (`skills/i-have-adhd/SKILL.md`) ແລະ command `/i-have-adhd` ເຂົ້າກັບ OpenCode ເສີຍໆ — ອ່ານໄຟລ໌ໃນຕົວ repo ລ້ວນໆ ບໍ່ມີ network call/exec/eval

### Always-on (ເປີດທຸກ session ອັດຕະໂນມັດ)

ປົກກະຕິ toggle ຕ້ອງພິມ `/i-have-adhd` ທຸກຄັ້ງທີ່ເລີ່ມ session ໃໝ່ ຖ້າຢາກໃຫ້ ruleset ຕໍ່ທ້າຍ system prompt ທຸກ turn ໂດຍບໍ່ຕ້ອງພິມເອງ ໃຫ້ສ້າງໄຟລ໌ flag ເປົ່າໆໄວ້:

```bash
touch ~/.config/opencode/.i-have-adhd-always
```

ປິດຖາວອນດ້ວຍການລົບໄຟລ໌ flag:

```bash
rm ~/.config/opencode/.i-have-adhd-always
```

> [!warning] Always-on ປ່ຽນພຶດຕິກຳທຸກ session ທັນທີ
> ຕ່າງຈາກ toggle ທີ່ຈຳກັດພຽງ session ດຽວ — ກ່ອນເປີດ always-on ໃຫ້ແນ່ໃຈວ່າຕ້ອງການໃຫ້ agent ຕອບສັ້ນ/ກົງປະເດັນແບບນີ້ **ທຸກວຽກ** ບໍ່ແມ່ນພຽງຕອນຮີບຮ້ອນ

### ອັບເດດ / ຖອດ

```bash
# ອັບເດດໃຫ້ຕົງ repo ຫຼ້າສຸດ
git -C ~/.config/opencode/vendor/i-have-adhd pull

# ຖອດ — ເອົາ path ອອກຈາກ plugin array ໃນ opencode.jsonc ກໍພໍ (ບໍ່ຕ້ອງແລ່ນ uninstall script ຄື ponytail)
```
