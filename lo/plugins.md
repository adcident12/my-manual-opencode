---
tags: [project-doc, plugins, opencode, reference]
updated: 2026-09-25
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

> [!info] ອັບເດດ 2026-09-25 — ເກນການ inject ໃໝ່ຂອງ graft 0.19.0 + ແກ້ໃຫ້ກົງກັບວິທີທີ່ OpenCode ເອີ້ນ hook ນີ້ແທ້
> ມີສອງເຫດຜົນແຍກກັນ ທັງສອງກວດຈາກ source code ແທ້ ບໍ່ໄດ້ເດົາ:
> 1. **graft 0.19.0 ປ່ຽນກົດການ inject ຂອງຕົນເອງ** (hook ຂອງ Claude Code ທີ່ plugin ນີ້ port ມາ) — ລາຍລະອຽດຢູ່ຫົວຂໍ້ "ເກນການ inject" ລຸ່ມນີ້
> 2. **ເວີຊັນກ່ອນຂຽນໂດຍຄິດວ່າ OpenCode ເຮັດວຽກຄື Claude Code — ຊຶ່ງບໍ່ແມ່ນ** ອ່ານ source ຂອງ OpenCode 1.18.32 ແລ້ວພົບວ່າສິ່ງທີ່ແກ້ໃນ `experimental.chat.messages.transform` ບໍ່ຖືກບັນທຶກເລີຍ context ທີ່ inject ຈຶ່ງຫາຍໄປຕັ້ງແຕ່ agent step ທີ 2 — ລາຍລະອຽດຢູ່ຫົວຂໍ້ "OpenCode ເອີ້ນ hook ນີ້ແນວໃດ" ລຸ່ມນີ້

### ຕິດຕັ້ງ

1. ວາງໄຟລ໌ທີ່ `~/.config/opencode/plugin/graft-deep.js` (ສ້າງໂຟນເດີ `plugin` ເອງຖ້າຍັງບໍ່ມີ)
2. ເພີ່ມ path ນັ້ນໃນ `plugin` array ຂອງ global config
3. ບໍ່ຕ້ອງຕັ້ງຫຍັງເພີ່ມຕໍ່ project — ຍົກເວັ້ນ `graft build` ທີ່ຍັງຕ້ອງແລ່ນຄັ້ງທຳອິດຕໍ່ repo ຄືເດີມ (ເບິ່ງ [[mcp-servers]]) ຫຼັງຈາກນັ້ນ graft ຈະດູແລຄວາມສົດຂອງກຣາຟເອງທຸກຄັ້ງທີ່ຖືກຖາມ ບໍ່ຕ້ອງມີຫຍັງຄອຍ rebuild ໃຫ້ອີກ

> [!note] ຢູ່ທັງໃນ `plugin` array *ແລະ* ໃນໂຟນເດີ `plugin/` — ກໍຍັງໂຫຼດພຽງຄັ້ງດຽວ
> OpenCode ໂຫຼດ `{plugin,plugins}/*.{ts,js}` ໃນໂຟນເດີ config ເອງອັດຕະໂນມັດ **ແລະ** ໂຫຼດທຸກໂຕໃນ `plugin` array ນຳ ແລ້ວຈຶ່ງຕັດໂຕຊ້ຳດ້ວຍ file URL ທີ່ກົງກັນແທ້ (`deduplicatePluginOrigins` ໃນ `config/plugin.ts`) — ຢືນຢັນດ້ວຍ `opencode debug config` ແລ້ວວ່າ `graft-deep.js` ມີພຽງໂຕດຽວ

### OpenCode Plugin Hook API ທີ່ໃຊ້

Plugin ຄືນ object ຂອງ hooks ຕາມ type `Hooks` ຈາກ `@opencode-ai/plugin` — ໂຕດຽວທີ່ໃຊ້ໃນນີ້:

| Hook | ເຮັດວຽກຕອນໃດ | ໃຊ້ເຮັດຫຍັງໃນ graft-deep |
| --- | --- | --- |
| `experimental.chat.messages.transform` | ກ່ອນເອີ້ນ LLM **ທຸກຄັ້ງ** — ທຸກ agent step ຂອງ turn ແລະຕອນ compaction ນຳ | step ທຳອິດຂອງ user turn ໃໝ່: ແລ່ນ `graft ask` ຄັ້ງດຽວແລ້ວ cache ຜົນໄວ້ຕາມ message ID — ທຸກຄັ້ງທີ່ຖືກເອີ້ນ: ຕິດ context ທີ່ cache ໄວ້ກັບຄືນເຂົ້າ message ຂອງມັນທຸກໂຕ |

hook ອື່ນທີ່ມີໃຫ້ໃຊ້ແຕ່ຍັງບໍ່ໄດ້ໃຊ້ໃນນີ້: `tool.execute.before`, `tool.execute.after`, `chat.message`, `command.execute.before`, `session.compacting`, `event`, `tool.definition` — ເບິ່ງ type ເຕັມທີ່ `node_modules/@opencode-ai/plugin/dist/index.d.ts`

### OpenCode ເອີ້ນ hook ນີ້ແນວໃດ (ກວດຈາກ source ຂອງ opencode 1.18.32)

> [!important] ສິ່ງທີ່ແກ້ໃນ `messages.transform` ເປັນຂອງ**ຊົ່ວຄາວ** — ຢູ່ພຽງການເອີ້ນ LLM ຄັ້ງດຽວ
> prompt loop ໂຫຼດ message ທັງໝົດໃໝ່ຈາກ storage ທຸກຕົ້ນ step (`session/prompt.ts` — `MessageV2.filterCompactedEffect` ໃນ loop `while (true)`) ແລ້ວຈຶ່ງເອີ້ນ hook ສິ່ງທີ່ hook ເພີ່ມເຂົ້າໄປຈະຖືກສົ່ງໃຫ້ໂມເດວຄັ້ງດຽວແລ້ວຖິ້ມ — ກົງກັນຂ້າມກັບ Claude Code ທີ່ output ຂອງ hook `UserPromptSubmit` ຖືກຂຽນລົງ transcript ຖາວອນ

ຜົນກະທົບຕໍ່ເວີຊັນກ່ອນ ແລະວິທີທີ່ເວີຊັນນີ້ຈັດການ:

| ພຶດຕິກຳຂອງ OpenCode | ເວີຊັນກ່ອນ | ຕອນນີ້ |
| --- | --- | --- |
| ໂຫຼດ message ໃໝ່ທຸກ step | inject ທີ່ step 1 ແລ້ວ step 2+ ເຈີ `injected.has(key)` ກໍ return ທັນທີ → **context ຫາຍທັນທີທີ່ agent ເອີ້ນ tool ໂຕທຳອິດ** | ຄຳນວນ pack ຄັ້ງດຽວຕໍ່ message ເກັບ cache ຕາມ message ID ແລ້ວ**ຕິດກັບຄືນທຸກຄັ້ງທີ່ຖືກເອີ້ນ** — ຍັງເຫັນໄດ້ໃນ step ແລະ turn ຕໍ່ໆໄປ ຄື transcript ຂອງ Claude Code |
| compaction ກໍເອີ້ນ hook ນີ້ນຳ ໂດຍສົ່ງສຳເນົາຂອງ history ເກົ່າເຂົ້າມາ (`session/compaction.ts`) | ແລ່ນ `graft ask` ກັບ message ເກົ່າໂດຍບໍ່ມີປະໂຫຍດ | ແລ່ນ `graft ask` ສະເພາະຕອນ message **ສຸດທ້າຍ**ເປັນຂອງ user (step ທຳອິດຂອງ turn ໃໝ່) — ຕອນ compaction ພຽງຕິດ context ທີ່ cache ໄວ້ກັບຄືນ |
| reminder ຂອງ OpenCode ເອງເພີ່ມ text part ແບບ `synthetic` ເຂົ້າ user message ກ່ອນ hook ເຮັດວຽກ (`session/reminders.ts` — prompt ຂອງ plan mode ແລະອື່ນໆ) | ຂໍ້ຄວາມ boilerplate ນັ້ນປົນເຂົ້າໄປໃນ query ຂອງ graft | query ໃຊ້ສະເພາະ text part ທີ່ບໍ່ແມ່ນ `synthetic`/`ignored` — part ທີ່ inject ເອງກໍຕິດ `synthetic: true` ຕາມ convention ຂອງ OpenCode |
| plugin ແລ່ນໃນ process ດຽວກັບ TUI | `crossSpawn.sync` ເຮັດໃຫ້ OpenCode ຄ້າງໄດ້ດົນສຸດ 8 ວິນາທີ | `graft ask` ແລ່ນຜ່ານ `spawn` ແບບ async — event loop ຍັງເດີນຕໍ່ໄດ້ |

ຜົນພອຍໄດ້ຈາກການຕິດກັບຄືນທຸກຄັ້ງ: prompt prefix ຄືເດີມທຸກ step (ເປັນມິດກັບ prompt cache) ແລະເກນ "novelty" ລຸ່ມນີ້ຖືກຕ້ອງແທ້ — pointer ທີ່ເຄີຍສະແດງແລ້ວຍັງຢູ່ຕໍ່ໜ້າໂມເດວແທ້ cache ເກັບໃນໜ່ວຍຄວາມຈຳ: ຫຼັງ restart OpenCode message ເກົ່າຈະບໍ່ມີ pack ແລ້ວ ແລະຄວາມຈຳຂອງ novelty ກໍ reset ໄປພ້ອມກັນ ທັງສອງຈຶ່ງຍັງສອດຄ່ອງກັນ

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

### ວິທີປິດຊົ່ວຄາວຖ້າຊ້າເກີນໄປ

`graft ask` ບໍ່ blocking OpenCode ແລ້ວ (ເປັນ async) ແຕ່ step ທຳອິດຂອງ user turn ໃໝ່ຍັງຕ້ອງລໍຜົນຢູ່ — ດົນສຸດ 8 ວິນາທີ ປົກກະຕິ 2-3 ວິນາທີ (ລວມເວລາເລີ່ມ `npx`) step ຕໍ່ໄປບໍ່ຖາມຊ້ຳ ຖ້າຢາກປິດໂດຍບໍ່ແກ້ໂຄ້ດ ໃຊ້ env var:

```bash
GRAFT_AUTO_CONTEXT=0 opencode
```

### ວິທີທົດສອບ plugin ໂດຍບໍ່ຕ້ອງລໍ agent loop ຊ້າໆ

ເອີ້ນ hook function ໂດຍກົງຜ່ານ node script ແທນທີ່ຈະລໍຜ່ານ LLM (ມີປະໂຫຍດຫຼາຍຕອນໂມເດວຊ້າ) — ຖ້າຈະທົດສອບໃຫ້ກົງກັບທີ່ OpenCode ເຮັດແທ້ ຕ້ອງສົ່ງ**ສຳເນົາໃໝ່**ຂອງ message ທີ່ເກັບໄວ້ໃຫ້ທຸກ step:

```js
import { pathToFileURL } from "node:url";
const { GraftDeepPlugin } = await import(pathToFileURL("<path-to-graft-deep.js>").href);
const hooks = await GraftDeepPlugin({ directory: "<project-path>" });
const transform = hooks["experimental.chat.messages.transform"];

const storage = [{ info: { id: "u1", role: "user", sessionID: "S1" }, parts: [{ type: "text", text: "where is createTicket defined" }] }];
const step = async () => { const msgs = structuredClone(storage); await transform({}, { messages: msgs }); return msgs; };

console.log((await step())[0].parts.length);  // step 1 (ຖາມ graft): ໄດ້ 2 ຖ້າ inject pack/hint ສຳເລັດ
storage.push({ info: { id: "a1", role: "assistant", sessionID: "S1" }, parts: [{ type: "text", text: "..." }] });
console.log((await step())[0].parts.length);  // step 2 (ຫຼັງເອີ້ນ tool): ຍັງໄດ້ 2 — ຕິດກັບຄືນໃຫ້ ບໍ່ຖາມ graft ໃໝ່
```

ເທິງ Windows ໃຫ້ແລ່ນພ້ອມ `NODE_PATH` ທີ່ຊີ້ໄປໂຟນເດີທີ່ມີ `cross-spawn` (ເຊັ່ນ `NODE_PATH=~/.config/opencode/node_modules`) ເພາະ plugin import ດ້ວຍຊື່ package

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
