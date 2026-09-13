---
tags: [project-doc, plugins, opencode, reference]
updated: 2026-09-13
summary: superpowers (skill library), grill-me/grilling (batch-interview skill ເສີມ superpowers), graft-deep (custom plugin ຂຽນເອງ), ponytail (code-minimization ruleset) ແລະ i-have-adhd (ບັງຄັບຕອບກົງປະເດັນ) — ວິທີຕິດຕັ້ງແຕ່ລະໂຕ ແລະ Plugin Hook API ຂອງ OpenCode
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

ຣີສະຕາດ OpenCode ແລ້ວກວດ:

```bash
opencode debug skill
```

ຄວນເຫັນ skill ທັງໝົດ 14 ໂຕ ໄດ້ແກ່ brainstorming, systematic-debugging, writing-plans, test-driven-development, executing-plans, using-git-worktrees, verification-before-completion, receiving-code-review, requesting-code-review, subagent-driven-development, finishing-a-development-branch, dispatching-parallel-agents, writing-skills ແລະ using-superpowers

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

---

## graft-deep — custom plugin (auto-inject context)

graft (ເບິ່ງ [[mcp-servers]]) ບໍ່ມີ "deep integration" ໃຫ້ OpenCode — ຄື auto-inject context ທີ່ກ່ຽວຂ້ອງຕໍ່ prompt — feature ນີ້ມີໃຫ້ພຽງ Claude Code ເທົ່ານັ້ນ (ສ່ວນ auto-rebuild ຫຼັງແກ້ໄຟລ໌ ຕອນນີ້ graft CLI ເອງເຮັດໃຫ້ທຸກ agent ຢູ່ແລ້ວ ເບິ່ງກ່ອງລຸ່ມນີ້) plugin ນີ້ port ພຶດຕິກຳ auto-inject ມາໂດຍໃຊ້ public CLI ຂອງ graft (`graft ask --json`) ແທນການ import internal module — ປອດໄພກວ່າແລະບໍ່ພັງຕອນ graft ອັບເດດເວີຊັນ

> [!info] ເຄີຍມີ hook auto-rebuild ນຳ — ຕັດອອກແລ້ວ (2026-09-13)
> ເວີຊັນທຳອິດຂອງ plugin ນີ້ມີ `tool.execute.after` hook ຄອຍ debounce 3 ວິນາທີແລ້ວສັ່ງ `graft build` ເອງໃນພື້ນຫຼັງທຸກຄັ້ງທີ່ແກ້ໄຟລ໌ ຢືນຢັນດ້ວຍການທົດສອບສົດແລ້ວວ່າ**ບໍ່ຈຳເປັນອີກຕໍ່ໄປ**: ແກ້ໄຟລ໌ແລ້ວເອີ້ນ `graft ask` ທັນທີໂດຍບໍ່ແລ່ນ `graft build` ເອງເລີຍ ໄດ້ຜົນລັບ `[graft] refreshed the graph (1 file changed) before answering` — ແປວ່າ graft CLI ປັດຈຸບັນ auto-refresh ກຣາຟກ່ອນຕອບທຸກຄຳຖາມໃນຕົວຢູ່ແລ້ວ (ເບິ່ງ [[mcp-servers]]) hook ທີ່ຕັດອອກບໍ່ພຽງແຕ່ຊ້ຳຊ້ອນເສີຍໆ ແຕ່ຍັງເປັນຕົ້ນເຫດຂອງ race condition ທີ່ເຄີຍບັນທຶກໄວ້ທີ່ [[gotchas]] ຂໍ້ 6 ນຳ — ຕັດສາເຫດຖິ້ມແທນທີ່ຈະແກ້ປາຍເຫດ

### ຕິດຕັ້ງ

1. ວາງໄຟລ໌ທີ່ `~/.config/opencode/plugin/graft-deep.js` (ສ້າງໂຟນເດີ `plugin` ເອງຖ້າຍັງບໍ່ມີ)
2. ເພີ່ມ path ນັ້ນໃນ `plugin` array ຂອງ global config
3. ບໍ່ຕ້ອງຕັ້ງຫຍັງເພີ່ມຕໍ່ project — ຍົກເວັ້ນ `graft build` ທີ່ຍັງຕ້ອງແລ່ນຄັ້ງທຳອິດຕໍ່ repo ຄືເດີມ (ເບິ່ງ [[mcp-servers]]) ຫຼັງຈາກນັ້ນ graft ຈະດູແລຄວາມສົດຂອງກຣາຟເອງທຸກຄັ້ງທີ່ຖືກຖາມ ບໍ່ຕ້ອງມີຫຍັງຄອຍ rebuild ໃຫ້ອີກ

### OpenCode Plugin Hook API ທີ່ໃຊ້

Plugin ຄືນ object ຂອງ hooks ຕາມ type `Hooks` ຈາກ `@opencode-ai/plugin` — ໂຕດຽວທີ່ໃຊ້ໃນນີ້ຕອນນີ້:

| Hook | ເຮັດວຽກຕອນໃດ | ໃຊ້ເຮັດຫຍັງໃນ graft-deep |
| --- | --- | --- |
| `experimental.chat.messages.transform` | ທຸກ agent step (ບໍ່ແມ່ນພຽງທຸກ turn — ເອີ້ນເລື້ອຍກວ່າທີ່ຄິດ) | ແລ່ນ `graft ask` ກັບຂໍ້ຄວາມຫຼ້າສຸດຂອງ user → ຕິດ top 3 ຕໍ່ທ້າຍ prompt ຖ້າ coverage ຜ່ານ threshold |

hook ອື່ນທີ່ມີໃຫ້ໃຊ້ແຕ່ຍັງບໍ່ໄດ້ໃຊ້ໃນນີ້: `tool.execute.before`, `tool.execute.after`, `chat.message`, `command.execute.before`, `session.compacting`, `event`, `tool.definition` — ເບິ່ງ type ເຕັມທີ່ `node_modules/@opencode-ai/plugin/dist/index.d.ts`

### ບົດຮຽນສຳຄັນຕອນຂຽນ (Windows-specific)

**1. `execFileSync('npx.cmd', args, {shell:false})` ພັງເທິງ Windows** — throw `EINVAL` ເພາະ Windows spawn ໄຟລ໌ `.cmd` ໂດຍກົງໂດຍບໍ່ຜ່ານ shell ບໍ່ໄດ້

**2. `shell:true` + ຕໍ່ string ເອງ = command injection risk** — prompt ເປັນ free text ຈາກຂໍ້ຄວາມແຊັດຂອງ user ໄປຕໍ່ເປັນ shell string ໂດຍກົງບໍ່ປອດໄພ

> [!danger] Security
> ຫ້າມເອົາ free text ທີ່ມາຈາກ user ໄປຕໍ່ເປັນ shell command string ເດັດຂາດ ເຖິງແມ່ນຈະຂຽນຟັງຊັນ escape ເອງກໍຕາມ

**3. ວິທີທີ່ຖືກຕ້ອງ** ໃຊ້ `cross-spawn` (dependency ທີ່ OpenCode ມີຢູ່ແລ້ວໃນ `node_modules` ຂອງຕົນເອງ) ຊຶ່ງຈັດການ argv quoting ຂອງ Windows ຖືກຕ້ອງໂດຍບໍ່ຜ່ານ shell — import ແບບ dynamic ສະເພາະຕອນ `process.platform === 'win32'` ເທົ່ານັ້ນ ຝັ່ງ macOS/Linux ໃຊ້ Node built-in `execFileSync` ໂດຍກົງໄດ້ເລີຍເພາະ POSIX ບໍ່ມີບັນຫານີ້

### ໂຄ້ດເຕັມ

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

### ວິທີປິດຊົ່ວຄາວຖ້າຊ້າເກີນໄປ

ສ່ວນ auto-inject context ແລ່ນແບບ **synchronous (blocking)** ທຸກຂໍ້ຄວາມໃໝ່ຂອງ user ຖ້າຮູ້ສຶກຊ້າຂຶ້ນເທິງ local model ປິດໄດ້ດ້ວຍ env var ໂດຍບໍ່ຕ້ອງແກ້ໂຄ້ດ:

```bash
GRAFT_AUTO_CONTEXT=0 opencode
```

### ວິທີທົດສອບ plugin ໂດຍບໍ່ຕ້ອງລໍ agent loop ຊ້າໆ

ເອີ້ນ hook function ໂດຍກົງຜ່ານ node script ແທນທີ່ຈະລໍຜ່ານ LLM (ມີປະໂຫຍດຫຼາຍຕອນໂມເດວຊ້າ):

```js
import { pathToFileURL } from "node:url";
const { GraftDeepPlugin } = await import(pathToFileURL("<path-to-graft-deep.js>").href);
const hooks = await GraftDeepPlugin({ directory: "<project-path>" });

// ທົດສອບ auto-inject context (hook ດຽວທີ່ມີຕອນນີ້)
const output = { messages: [{ info: { id: "msg1", role: "user" }, parts: [{ type: "text", text: "ຄຳຖາມຈິງ" }] }] };
await hooks["experimental.chat.messages.transform"]({}, output);
console.log(output.messages[0].parts); // ຄວນມີ 2 parts ຖ້າ inject ສຳເລັດ
```

> [!info] ເຄີຍມີຄຳເຕືອນເລື່ອງ race condition ຢູ່ນີ້ — ບໍ່ກ່ຽວແລ້ວຫຼັງຕັດ auto-rebuild hook ອອກ
> ກ່ອນໜ້ານີ້ plugin ຍັງມີ `tool.execute.after` hook ຄອຍສັ່ງ `graft build` ເອງ ອາດຂັດແຍ້ງກັບການທົດສອບທີ່ແລ່ນ `graft ask` ພ້ອມກັນ ຕອນນີ້ hook ນັ້ນຖືກຕັດອອກແລ້ວ (ເບິ່ງກ່ອງຂ້າງເທິງ) ເພາະ graft CLI ເອງກໍ auto-refresh ກ່ອນຕອບທຸກຄຳຖາມຢູ່ແລ້ວ ບັນຫານີ້ຈຶ່ງໝົດໄປພ້ອມກັບສາເຫດຂອງມັນ — ເບິ່ງ [[gotchas]] ຂໍ້ 6

---

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

## i-have-adhd — ບັງຄັບຕອບກົງປະເດັນ ບໍ່ອ້ອມແອ້ມ

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
