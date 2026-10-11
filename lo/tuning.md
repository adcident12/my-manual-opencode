---
tags: [project-doc, tuning, opencode, measurement, reference]
updated: 2026-10-11
summary: ວັດຜົນຈິງວ່າ workflow ໃນ USER-MANUAL/architecture ເຮັດວຽກຄົບບໍ — ຂະໜາດ prompt ຕໍ່ turn, tool ທີ່ agent ເອີ້ນແທ້, ສາເຫດທີ່ອ່ານໄຟລ໌ຊ້ຳ, ທົດສອບຄົບວົງຈອນ — ແລ້ວປັບຈູນຈາກຜົນທີ່ວັດໄດ້ ພ້ອມ script ໃຫ້ວັດຊ້ຳເທິງເຄື່ອງຕົນເອງ
---

# Tuning — ວັດຜົນຈິງ ແລ້ວປັບໃຫ້ workflow ເຮັດວຽກຄົບ

ພາບລວມທີ່ [[index]] · layer ຕາມໜ້າທີ່ທີ່ [[architecture]] · workflow ທີ່ [[USER-MANUAL]] · ບັນຫາທີ່ພົບທີ່ [[gotchas]]

config ຄົບ ບໍ່ໄດ້ໝາຍຄວາມວ່າ workflow ເຮັດວຽກຄົບ — MCP ທຸກໂຕ `connected` ແລະ skill ທຸກໂຕໂຫຼດໄດ້ ແຕ່ບໍ່ໄດ້ບອກວ່າ agent **ໃຊ້** ມັນຕາມລຳດັບທີ່ [[USER-MANUAL]] ກັບ [[architecture]] ແຕ້ມໄວ້ແທ້ຫຼືບໍ່ ໜ້ານີ້ບັນທຶກການວັດຜົນຈິງ 4 ແບບ (ທັງໝົດແລ່ນເທິງເຄື່ອງຕົນເອງ ບໍ່ສົ່ງຂໍ້ມູນອອກນອກເຄື່ອງ) ຜົນທີ່ໄດ້ ແລະສິ່ງທີ່ປັບຈາກຜົນນັ້ນ

> [!info] ສະຫຼຸບຜົນ (ວັດເມື່ອ 2026-10-03 · OpenCode 1.18.34 · graft 0.21.1 · ໂມເດວ self-hosted Qwen3.8 27B, context 131k)
> | ສິ່ງທີ່ວັດ | ກ່ອນປັບ | ຫຼັງປັບ |
> | --- | --- | --- |
> | prompt ຕໍ່ turn ກ່ອນເລີ່ມເຮັດວຽກ | ~43.3k tokens (131 tools) | **~32.6k tokens (84 tools), −25%** |
> | agent ໃຊ້ graft ຕອນສຳຫຼວດ code (E2E turn ທຳອິດ) | 0 ເທື່ອ, read 7 ເທື່ອ | **2 ເທື່ອ, read 2 ເທື່ອ** |
> | memory MCP | ເອີ້ນ 1 ເທື່ອໃນ 50 session, ໄຟລ໌ບໍ່ເຄີຍຖືກສ້າງ | **ບັນທຶກແລ້ວດຶງກັບມາໄດ້ຂ້າມ session** |
> | ການອ່ານໄຟລ໌ຊ້ຳ | 76% ເກີດຫຼັງ compaction | ເປີດ `compaction.prune` + ກົດ re-read (**ຍັງບໍ່ໄດ້ຢືນຢັນກັບ session ຍາວ**) |
> | ໃສ່ Caveman + benjamin-plus (ຂໍ້ 8) | — | **ບໍ່ດີຂຶ້ນແບບວັດໄດ້** — ເກັບ Caveman ໄວ້ເພາະຄຳຕອບອ່ານງ່າຍ (prompt ເປັນ ~34.0k), ຖອດ benjamin-plus |
>
> **OpenCode 2 (2026-10-11):** prompt ຕໍ່ turn ຫຼຸດເຫຼືອ **~14.2k** tokens (Code Mode) ສ່ວນ plugin, ໂຕກອງ skill, compaction ແລະກົດໃນ AGENTS.md ຕ້ອງເຮັດໃໝ່ທັງໝົດ ວັດຊ້ຳໃນ **ຂໍ້ 9**

script ທັງໝົດຢູ່ໃນ [`scripts/`](../scripts/) — ໃຊ້ພຽງ Node.js (≥ 22.5 ສຳລັບ `session-report.mjs` ເພາະໃຊ້ `node:sqlite` ທີ່ມາກັບ Node) ຕົ້ນສະບັບ HTML ຂອງຮູບໃນໜ້ານີ້ຢູ່ທີ່ [`assets/tuning/report.html`](../assets/tuning/report.html)

---

## 1. ວັດຂະໜາດ prompt ຕໍ່ turn

ທຸກ turn OpenCode ສົ່ງ system prompt, AGENTS.md ທຸກໄຟລ໌, ລາຍຊື່ skill ແລະ **ນິຍາມຂອງ tool ທຸກໂຕຈາກ MCP ທີ່ເປີດຢູ່** ໃຫ້ໂມເດວໃໝ່ທັງກ້ອນ ສ່ວນນີ້ຄື "ຄ່າເຂົ້າ" ທີ່ຈ່າຍກ່ອນເລີ່ມເຮັດວຽກແທ້ ແລະກິນ context 131k ຂອງໂມເດວ local ໄປໂດຍກົງ

### ວິທີວັດ — ດັກ request ແທ້ດ້ວຍ server ຈຳລອງ

ໃຊ້ວິທີດຽວກັບ [[gotchas]] ຂໍ້ 8 (ຊີ້ `baseURL` ໄປທີ່ proxy ເທິງເຄື່ອງ) ແຕ່ບໍ່ຕ້ອງເອີ້ນໂມເດວແທ້ເລີຍ — [`capture-server.mjs`](../scripts/capture-server.mjs) ເຮັດໂຕເປັນ OpenAI-compatible endpoint ທີ່ບັນທຶກ request ແລ້ວຕອບ `ok` ກັບ

```bash
# terminal 1 — ເປີດ server ຈຳລອງ
node scripts/capture-server.mjs ./capture

# terminal 2 — ໃຫ້ OpenCode ສົ່ງ prompt ໜຶ່ງເທື່ອ (config ແທ້ບໍ່ຖືກແກ້ — OPENCODE_CONFIG_CONTENT ຖືກ merge ທັບສະເພາະໃນ process ນີ້)
# OpenCode 2: ໃສ່ --standalone ບໍ່ດັ່ງນັ້ນ request ຈະໄປທີ່ background service ຊຶ່ງບໍ່ເຫັນຕົວແປນີ້
cd my-project
OPENCODE_CONFIG_CONTENT='{"provider":{"capture":{"npm":"@ai-sdk/openai-compatible","options":{"baseURL":"http://127.0.0.1:18555/v1"},"models":{"fake":{"limit":{"context":131072,"output":32768}}}}}}' \
  opencode run --standalone -m capture/fake "Reply with exactly the word: ok"

# ແຍກໝວດ
node scripts/analyze-prompt.mjs ./capture/req-02.json
```

PowerShell ຕັ້ງ env var ແບບນີ້ແທນ: `$env:OPENCODE_CONFIG_CONTENT='{...}'; opencode run -m capture/fake "..."`

> [!note] ໄຟລ໌ໃດຄື prompt ຫຼັກ
> ເທິງ OpenCode 1 ຈະໄດ້ 2 ໄຟລ໌ — ໄຟລ໌ນ້ອຍ (`req-01`) ຄື request ສ້າງຊື່ session ໄຟລ໌ໃຫຍ່ (`req-02`) ຄື prompt ທີ່ໂມເດວໄດ້ຮັບແທ້ໃນ turn ທຳອິດ ເທິງ OpenCode 2 ການ `run` ສັ້ນໆໄດ້ໄຟລ໌ດຽວຄື prompt ຫຼັກ

> [!tip] ຕົວເລກ token ແມ່ນຍຳແຄ່ໃດ
> `analyze-prompt.mjs` ປະມານ token ຈາກ ຈຳນວນຕົວອັກສອນ ÷ 3.6 — ກວດແລ້ວວ່າຍອດລວມ "ກ່ອນປັບ" (~43.3k) ຕົງກັບ 42,920 prompt tokens ທີ່ provider ລາຍງານແທ້ສຳລັບ prompt ດຽວກັນ ຖ້າມີຕົວເລກແທ້ຂອງຕົນເອງ ໃສ່ `--tokens <N>` ເພື່ອປັບອັດຕາໃຫ້ຕົງເປະ

### ຜົນ

![Prompt budget per turn — before vs after tuning](../assets/tuning/1-prompt-budget.png)

ສິ່ງທີ່ເຫັນ:
- **MCP ຝັ່ງ browser 3 ໂຕ (open-design, chrome-devtools, playwright) ກິນລວມ ~17.5k tokens ຫຼື 40%** ຂອງ prompt ທັງໝົດ ທັງທີ່ວຽກສ່ວນໃຫຍ່ບໍ່ໄດ້ໃຊ້ browser
- open-design ໂຕດຽວ ~6.6k tokens (tool 22 ໂຕ + ຄຳສັ່ງຂອງ server ເອງ) — ແຕ່ຖືກໃຊ້ພຽງຕອນດຶງວຽກຈາກ OpenDesign ([[USER-MANUAL]] ຂໍ້ 5)
- ລາຍຊື່ skill 25 ໂຕ (~3.4k), ponytail ruleset (~1.4k), superpowers bootstrap (~1k) — ທັງໝົດນີ້ຖືກສົ່ງ**ທຸກ turn** ບໍ່ແມ່ນພຽງຕອນເອີ້ນ skill

---

## 2. ເບິ່ງວ່າ agent ເອີ້ນ tool ຫຍັງແທ້

OpenCode ເກັບທຸກ tool call ຂອງທຸກ session ໄວ້ໃນຖານຂໍ້ມູນຂອງມັນເອງ (`~/.local/share/opencode/opencode.db`) — [`session-report.mjs`](../scripts/session-report.mjs) ອ່ານແບບ read-only ແລ້ວສະຫຼຸບໃຫ້

```bash
node scripts/session-report.mjs usage --since 2026-09-01
```

![What the agent actually called](../assets/tuning/2-tool-usage.png)

ທຽບກັບ [[architecture]] ເທື່ອລະ layer:

| Layer | ທີ່ແຕ້ມໄວ້ | ທີ່ເກີດແທ້ |
| --- | --- | --- |
| KNOWLEDGE | graft, graft-deep, context7, memory, open-design | **graft 25 ເທື່ອ ທຽບກັບ `read` ທັງໄຟລ໌ 486 ເທື່ອ** · memory 1 ເທື່ອ (ໄຟລ໌ `memory.jsonl` ບໍ່ເຄີຍຖືກສ້າງເລີຍ) · open-design 1 ເທື່ອ |
| REASONING | brainstorming, grilling, writing-plans | ✅ brainstorming ແລະ writing-plans ຖືກໃຊ້ສະໝ່ຳສະເໝີ · grilling ຖືກເອີ້ນເປັນ skill ແຍກພຽງ 2 ເທື່ອ — ຕາມກົດໃນ AGENTS.md ມັນຄວນເຮັດວຽກເປັນຮູບແບບຄຳຖາມພາຍໃນ brainstorming ຊຶ່ງບໍ່ຖືກນັບເປັນ skill call (ຍັງບໍ່ໄດ້ກວດວ່າຮູບແບບນັ້ນຖືກໃຊ້ທຸກເທື່ອຫຼືບໍ່) |
| EXECUTION | ponytail, playwright, chrome-devtools | ✅ chrome-devtools 541 ເທື່ອ · **playwright 33 ເທື່ອ** — ເຮັດວຽກຊ້ອນກັບ chrome-devtools |
| GOVERNANCE | verification, sonarqube, trivy | sonarqube ໃຊ້ໃນ 1–6 session · **trivy 0 ເທື່ອ** |

---

## 3. ເປັນຫຍັງອ່ານໄຟລ໌ເດີມຊ້ຳ

ຕົວເລກ `read` ທີ່ສູງບໍ່ໄດ້ໝາຍຄວາມວ່າ "ບໍ່ໃຊ້ graft" ສະເໝີໄປ — OpenCode ບັງຄັບໃຫ້ `read` ໄຟລ໌ກ່ອນ `edit` ຢູ່ແລ້ວ ຈຶ່ງແຍກເບິ່ງການອ່ານ**ຊ້ຳ**ໄຟລ໌ເດີມ ວ່າແຕ່ລະເທື່ອເກີດຫຼັງເຫດການຫຍັງ

```bash
node scripts/session-report.mjs rereads --since 2026-09-01
```

![Why files were read again](../assets/tuning/3-rereads.png)

**260 ຈາກ 341 ເທື່ອ (76%) ເກີດທັນທີຫຼັງ compaction** — session ທົ່ວໄປ compact 4–10 ເທື່ອ ທຸກເທື່ອທີ່ OpenCode ສະຫຼຸບ context ເນື້ອຫາໄຟລ໌ທີ່ເຄີຍອ່ານໄວ້ຈະຫາຍໄປ agent ຈຶ່ງອ່ານທັງໄຟລ໌ໃໝ່ (session ໜຶ່ງອ່ານຊ້ຳຫຼັງ compaction 162 ເທື່ອ ຜົນອ່ານຊ້ຳທັງ session ລວມ ~221k tokens) ຕົ້ນເຫດຈຶ່ງຢູ່ທີ່ **compaction ເກີດເລື້ອຍເກີນໄປ** ບໍ່ແມ່ນ graft

---

## 4. ທົດສອບຄົບວົງຈອນ (E2E) ໃນສຳເນົາຂອງ project

ຂໍ feature ແທ້ແບບດຽວກັບຕົວຢ່າງໃນ [[USER-MANUAL]] ຂໍ້ 3 ແລ້ວເບິ່ງວ່າ agent ເຮັດຕາມ 9 ຂັ້ນຫຼືບໍ່ — **ເຮັດໃນສຳເນົາສະເໝີ** ຢ່າທົດສອບໃນ project ແທ້

```bash
git clone ~/code/my-project ~/tmp/my-project-e2e
cp ~/code/my-project/AGENTS.md ~/code/my-project/opencode.json ~/tmp/my-project-e2e/   # ໄຟລ໌ທີ່ຍັງບໍ່ໄດ້ commit ຕ້ອງ copy ເອງ
cd ~/tmp/my-project-e2e && graft build

opencode run --title e2e-pause "please add a pause feature to the game: pressing P (or Esc) pauses and resumes gameplay"
node /path/to/scripts/session-report.mjs session e2e-pause   # ເບິ່ງຜົນ turn ທຳອິດ

# ຕອບຄຳຖາມ/ອະນຸມັດໃນ session ເດີມ
opencode run -s <session-id> "go ahead"
```

> [!note] `opencode run` ບໍ່ມີ tool `question`
> ໃນໂໝດ headless OpenCode ບໍ່ສົ່ງ tool `question` ໃຫ້ໂມເດວ (ເບິ່ງໄດ້ຈາກ request ທີ່ດັກໄວ້ໃນຂໍ້ 1) brainstorming ຈຶ່ງຖາມເປັນຂໍ້ຄວາມທຳມະດາແລ້ວຈົບ turn — ຕອບຕໍ່ດ້ວຍ `opencode run -s <id>` ໄດ້ໂດຍບໍ່ຄ້າງ session id ເບິ່ງໄດ້ຈາກ `opencode session list`

![End-to-end test](../assets/tuning/4-e2e-test.png)

ຜົນທີ່ໄດ້:
- ✅ `brainstorming` ຖືກເອີ້ນເປັນອັນທຳອິດສະເໝີ ແລະວຽກນ້ອຍໄດ້ການອອກແບບທີ່ແຄບ (1 ໄຟລ໌ ~10 ແຖວ) — ponytail ເຮັດວຽກ
- ✅ ແລ່ນ test ຄົບ ແລະກວດປຸ່ມ P/Esc ໃນ Chrome ແທ້ຜ່ານ chrome-devtools
- ❌→✅ **graft ບໍ່ຖືກເອີ້ນເລີຍ** — ທັງທີ່ graft-deep inject ຄຳແນະນຳ "use graft first" ໄວ້ແລ້ວ ຕົ້ນເຫດຄືຂັ້ນທຳອິດຂອງ `brainstorming` ຂຽນວ່າ *"Explore project context — check files, docs, recent commits"* ໂມເດວເຮັດຕາມຄຳສັ່ງຂອງ skill (ແລ່ນ `git log`, `read` folder ເທື່ອລະອັນ) ທັບຄຳສັ່ງໃນ AGENTS.md — ບັນຫາແບບດຽວກັບທີ່ຕ້ອງຂຽນກົດປະສານງານໃຫ້ grilling ໃນ [[plugins]] ແກ້ດ້ວຍກົດໃໝ່ໃນ global AGENTS.md (ຂໍ້ 5) ແລ້ວແລ່ນຄຳຂໍເດີມຊ້ຳ: graft 0 → 2 ເທື່ອ, `read` 7 → 2 ເທື່ອ (ເຫຼືອພຽງໄຟລ໌ທີ່ຈະແກ້)
- ⚠️ **ບໍ່ commit** ຕອນຈົບ (ຂັ້ນທີ 9) — ຍັງບໍ່ໄດ້ໃສ່ກົດບັງຄັບ ເພາະຈະເຮັດໃຫ້ agent commit ເອງໃນທຸກ project
- ⚠️ **ການກວດໃນ browser ຊ້າ** — turn ທີ່ລົງມືເຮັດໃຊ້ 32 ນາທີ ເອີ້ນ chrome-devtools 37 ຈາກ 60 ເທື່ອ (ສ່ວນໃຫຍ່ເປັນ `evaluate_script`) ທຸກ step ສົ່ງ prompt ທີ່ໃຫຍ່ຂຶ້ນເລື້ອຍໆ (ສູງສຸດ ~81k tokens) ໃຫ້ໂມເດວ local ປະມວນຜົນໃໝ່

> [!tip] ໄດ້ bug ແທ້ເປັນຂອງແຖມ
> ລະຫວ່າງທົດສອບ agent ພົບວ່າ menu ຂອງເກມຕົວຢ່າງພັງຕັ້ງແຕ່ເປີດ (scene ຍັງເອີ້ນຊື່ API ເກົ່າຫຼັງ refactor) — ການທົດສອບຄົບວົງຈອນເປັນໄລຍະຊ່ວຍຈັບບັນຫາທີ່ test ຂອງ code ເອງບໍ່ຄອບຄຸມໄດ້ນຳ

---

## 5. ສິ່ງທີ່ປັບ (config ທີ່ໃຊ້ແທ້ຫຼັງທົດສອບ)

> [!tip] ຜົນສຸດທ້າຍເປັນໄຟລ໌ແທ້ໃນ [`config/`](../config/README.md)
> [`config/opencode.jsonc`](../config/opencode.jsonc) (template ທີ່ລວມທຸກຂໍ້ຂ້າງລຸ່ມແລ້ວ) ແລະ [`config/AGENTS.md`](../config/AGENTS.md) (ກົດຄົບທຸກຫົວຂໍ້) — ຫົວຂໍ້ຍ່ອຍຂ້າງລຸ່ມອະທິບາຍເຫດຜົນຂອງແຕ່ລະສ່ວນ

### 5.1 ປິດ MCP ທີ່ໃຊ້ໜ້ອຍເປັນຄ່າເລີ່ມຕົ້ນ ແລ້ວເປີດສະເພາະ project ທີ່ຕ້ອງໃຊ້

ໃນ `~/.config/opencode/opencode.jsonc`:

```jsonc
"open-design": {
  "type": "local",
  "command": ["od", "mcp"],
  "timeout": 30000,
  "enabled": false        // ~6.6k tokens/turn, ໃຊ້ພຽງຕອນດຶງວຽກຈາກ OpenDesign
},
"playwright": {
  "type": "local",
  "command": ["npx", "-y", "@playwright/mcp@latest"],
  "timeout": 30000,
  "enabled": false        // ຊ້ອນກັບ chrome-devtools; e2e suite ຍັງແລ່ນ `npx playwright test` ຜ່ານ bash ໄດ້
}
```

ເປີດສະເພາະ project ໃນ `<project>/opencode.json` (merge ກັບ global — ໃສ່ພຽງ field ທີ່ປ່ຽນ):

```jsonc
{ "mcp": { "open-design": { "enabled": true } } }
```

### 5.2 ເປີດ `compaction.prune` (OpenCode 1 — ເທິງ OpenCode 2 ເບິ່ງຂໍ້ 9)

```jsonc
"compaction": { "auto": true, "prune": true }
```

`prune` (ຄ່າເລີ່ມຕົ້ນປິດ) ເຮັດວຽກຕອນຈົບແຕ່ລະຄຳສັ່ງ: ລຶບຜົນລັບຂອງ tool ທີ່ເກົ່າກວ່າ 2 turn ຫຼ້າສຸດ ໂດຍເວັ້ນຜົນຫຼ້າສຸດ ~40k tokens ໄວ້ສະເໝີ ແລະຈະລຶບກໍຕໍ່ເມື່ອມີໃຫ້ລຶບເກີນ ~20k tokens (ກວດຈາກ source ຂອງ OpenCode 1.18.34) — ລຶບເປັນກ້ອນໃຫຍ່ດົນໆເທື່ອ prompt cache ຂອງ llama.cpp ຈຶ່ງບໍ່ເສຍທຸກ turn ແຕ່ຊ່ວຍໃຫ້ compaction ເຕັມຮູບແບບເກີດໜ້ອຍລົງ

### 5.3 ກົດໃໝ່ 4 ຂໍ້ໃນ global AGENTS.md

ຕໍ່ທ້າຍກົດ grill-me ເດີມ ([[plugins]]) ໃນ `~/.config/opencode/AGENTS.md` — ຂຽນເປັນພາສາອັງກິດເພາະເປັນຄຳສັ່ງໃຫ້ໂມເດວ (~610 tokens ລວມກັນ) ກົດ "Verifying UI changes" ເພີ່ມທີຫຼັງຈາກຜົນໃນຂໍ້ 8:

```markdown
## Verifying UI changes — once, in a real browser

Passing tests is not enough for a change someone will see in a browser (a
web page, a game). Before reporting done, verify it once with
chrome-devtools: load the page, do the one interaction the task is about,
and check the console for errors. Keep it to a handful of calls — a single
short wait for the page to settle, no polling loops. If the page cannot
load or throws, that is a failure to report or fix, not "done".

## Exploring a codebase — graft first, even inside a skill

Skills such as `brainstorming` ("Explore project context — check files,
docs, recent commits") tell you to look around the project. When the
project has a `graft/` index, do that step through graft instead of
listing directories and reading files one by one:
`graft_graft_repo_map` for orientation, `graft_graft_find_code` for "where
is X / how does Y work", `graft_graft_file_api` to skim a file, and
`graft_graft_trace_calls` for callers. Then `read` only the files you are
about to edit. Directory listings and whole-file reads are the fallback
when there is no `graft/` index.

## Re-reading files after compaction or pruning

When you need a file you already read earlier in this session (its content
was compacted or pruned away), do not re-read the whole file. If the
project has a `graft/` index, run `graft skeleton <file>` or `graft ask
"<symbol>" --source` first; then `read` only the lines you need with
`offset`/`limit`. A full read is fine right before editing a file you
have not read since the last compaction.

## Memory — facts that must outlive this session (memory MCP)

- Before asking the user about a preference or a past decision, call
  `memory_search_nodes` with the project's folder name (and "user") — the
  answer may already be stored.
- When the user states a durable preference, or brainstorming/grilling
  settles a decision that later sessions will need, save it:
  `memory_create_entities` for a new project/user entity, otherwise
  `memory_add_observations` — one short sentence per fact, prefixed with
  today's date (YYYY-MM-DD).
- Never store secrets, code, or anything the repo already records
  (graft, git history, specs under `docs/`).
```

> [!important] ຊື່ tool ຕ້ອງຕົງກັບທີ່ໂມເດວເຫັນແທ້
> OpenCode ຕັ້ງຊື່ tool ຂອງ MCP ເປັນ `<server>_<tool>` — graft ຈຶ່ງກາຍເປັນ `graft_graft_find_code` ຯລຯ ເບິ່ງຊື່ແທ້ໄດ້ຈາກ request ທີ່ດັກໄວ້ໃນຂໍ້ 1 ກ່ອນຂຽນກົດທີ່ອ້າງຊື່ tool

ຜົນທົດສອບກົດ memory ດ້ວຍໂມເດວແທ້: session ທຳອິດສັ່ງ "remember …" → agent ເອີ້ນ `memory_search_nodes` ແລ້ວ `memory_create_entities` ພ້ອມວັນທີ · session ໃໝ່ຖາມກັບ → agent ເອີ້ນ `memory_search_nodes` ຈົນພົບແລ້ວຕອບຖືກ

### 5.4 ຕັດ skill ຂອງເຄື່ອງມືອື່ນອອກ — `OPENCODE_DISABLE_EXTERNAL_SKILLS=1` (OpenCode 1 — ເທິງ OpenCode 2 ເບິ່ງຂໍ້ 9)

OpenCode ໂຫຼດ skill ຈາກ `~/.claude/skills` (Claude Code) ແລະ `~/.agents/skills` ມານຳອັດຕະໂນມັດ — ເທິງເຄື່ອງທີ່ຕິດຕັ້ງເຄື່ອງມື AI ຫຼາຍໂຕ ລາຍຊື່ skill ພອງຈາກ 25 ເປັນ 86 ໂຕ (ທຸກໂຕຖືກສົ່ງໃນທຸກ turn ແລະໂມເດວນ້ອຍເລືອກຜິດງ່າຍ) ຕັ້ງ env var ລະດັບ user:

```powershell
[Environment]::SetEnvironmentVariable('OPENCODE_DISABLE_EXTERNAL_SKILLS','1','User')   # Windows
```

```bash
export OPENCODE_DISABLE_EXTERNAL_SKILLS=1   # macOS/Linux — ໃສ່ໃນ shell profile
```

ກວດດ້ວຍ `opencode debug skill` — ຄວນເຫຼືອສະເພາະ skill ຈາກ superpowers, ponytail, i-have-adhd, grill-me/grilling ແລະ `customize-opencode` ທີ່ມາກັບ OpenCode — ລາຍລະອຽດວ່າເປັນຫຍັງບໍ່ໃຊ້ `OPENCODE_DISABLE_CLAUDE_CODE_SKILLS` ຢູ່ໃນ [[gotchas]] ຂໍ້ 15

### 5.5 context7 — ສົ່ງ API key ຜ່ານ header ຈາກ env var

ຖ້າມີ key ຂອງ context7 (ບໍ່ບັງຄັບ — ບໍ່ມີກໍໃຊ້ໄດ້ແຕ່ຕິດ rate limit) ຢ່າຂຽນ key ລົງ config ໂດຍກົງ:

```jsonc
"context7": {
  "type": "remote",
  "url": "https://mcp.context7.com/mcp",
  "headers": { "CONTEXT7_API_KEY": "{env:CONTEXT7_API_KEY}" },
  "enabled": true
}
```

---

## 6. ຍັງບໍ່ໄດ້ແກ້ / ຕ້ອງຕິດຕາມຕໍ່

- **ຜົນຂອງ `prune` + ກົດ re-read** — session ທົດສອບສັ້ນຈົນບໍ່ເກີດ compaction ເລີຍ ໃຫ້ແລ່ນ `session-report.mjs rereads` ອີກເທື່ອຫຼັງໃຊ້ງານແທ້ໄປໄລຍະໜຶ່ງ ແລ້ວທຽບສັດສ່ວນ "after a compaction" ກັບ 76% ເດີມ
- **ຂັ້ນ commit** — ຖ້າຕ້ອງການໃຫ້ຕົງ [[USER-MANUAL]] ຂັ້ນທີ 9 ເພີ່ມກົດໃນ AGENTS.md ໃຫ້ commit ເປັນກ້ອນດຽວຫຼັງກວດຜ່ານ (ບໍ່ push) — ຕັດສິນໃຈເອງວ່າຢາກໃຫ້ agent commit ເອງຫຼືບໍ່
- **ການກວດໃນ browser** — 37–40 calls / 33–36 ນາທີສຳລັບ feature ນ້ອຍໆເທິງ OpenCode 1 ruleset ດ້ານ token efficiency ບໍ່ຊ່ວຍ (ຂໍ້ 8) ເທິງ OpenCode 2 feature ດຽວກັນໃຊ້ເວລາລວມ 15 ນາທີ (ຂໍ້ 9) ແລະສ່ວນໜຶ່ງໝົດໄປກັບການຂຽນ web server ຊົ່ວຄາວ ຊຶ່ງຕອນນີ້ກົດ UI ໃຫ້ໃຊ້ `npx http-server` ແທນ
- **trivy ບໍ່ເຄີຍຖືກເອີ້ນ** — ຍັງເປີດໄວ້ຕາມ [[architecture]] (~1.7k tokens/turn) ຖ້າວັດຊ້ຳແລ້ວຍັງເປັນ 0 ພິຈາລະນາປິດ ແລ້ວໃຫ້ agent ແລ່ນ `trivy fs .` ຜ່ານ bash ຫຼືໃສ່ໃນ CI ຕາມ [[sdlc]]

---

## 7. ເຄື່ອງມືທີ່ລອງແລ້ວບໍ່ໄດ້ໃຊ້ຕໍ່ (ແລະເຫດຜົນ)

| ເຄື່ອງມື | ເຮັດຫຍັງ | ຜົນທີ່ໄດ້ | ເຫດຜົນທີ່ບໍ່ໃຊ້ຕໍ່ |
| --- | --- | --- | --- |
| [Langfuse](https://github.com/langfuse/langfuse) self-host + [opencode-observability-plugin](https://github.com/langfuse/opencode-observability-plugin) | trace ເຕັມທຸກ turn: prompt, generation, tool call, reasoning, token | ✅ ໃຊ້ໄດ້ — trace ເຂົ້າ Langfuse ເທິງເຄື່ອງ | ເກັບເນື້ອຫາເຕັມລວມຜົນຂອງ tool (ໄຟລ໌ທີ່ agent ອ່ານ); Docker 6 containers ໃຊ້ RAM ~2.6 GB — ຖອດອອກຕາມຄວາມມັກ |
| [opencode-observability](https://github.com/abekdwight/opencode-observability) | dashboard/monitor ເທິງ `127.0.0.1` ອ່ານ `opencode.db` | ✅ ໃຊ້ໄດ້ | UI ບາງສ່ວນເປັນພາສາຍີ່ປຸ່ນ |
| [token-optimizer](https://github.com/alexgreensh/token-optimizer) | quality score, compaction guidance, session continuity | ປະເມີນຈາກ code ບໍ່ໄດ້ຕິດຕັ້ງ | plugin ຝັ່ງ OpenCode **ບໍ່ມີ**ການບີບອັດ output ຂອງ tool (ຕົວເລກປະຢັດໃນ README ມາຈາກ Claude Code); ມີ nudge ອັດຕະໂນມັດເມື່ອ context ≥ 25% ຊຶ່ງ setup ນີ້ເກີນຕັ້ງແຕ່ turn ທຳອິດ; license PolyForm Noncommercial |
| [benjamin-plus](https://github.com/JetBrains/benjamin-plus-skill) (JetBrains) | ກົດ ~880 tokens: ສຳຫຼວດເທື່ອດຽວ, ອ່ານສະເພາະຊ່ວງ, poll ໃຫ້ໜ້ອຍ, "ແລ້ວ = ເກນກວດຜ່ານ" | ຕິດຕັ້ງຜ່ານ `instructions` ແລ້ວວັດ (ຂໍ້ 8) | ບໍ່ຫຼຸດເວລາ/tool call ເມື່ອເຮັດຄົບທຸກຂັ້ນ ແລະເຮັດໃຫ້ agent ຂ້າມການກວດໃນ browser ([[gotchas]] ຂໍ້ 19) — ຖອດອອກ |
| proxy ຂອງ [caveman](https://github.com/JuliusBrussee/caveman) | ບີບຜົນຂອງ tool ກ່ອນສົ່ງໃຫ້ໂມເດວ | ປະເມີນຈາກ code ບໍ່ໄດ້ຕິດຕັ້ງ | wrap OpenCode ສະເພາະ provider `openai`/`anthropic` — provider ທີ່ host ເອງບໍ່ຜ່ານ proxy; telemetry ເປີດເປັນຄ່າເລີ່ມຕົ້ນ (ສ່ວນ **skill** ຂອງ caveman ໃຊ້ຢູ່ — [[plugins]]) |
| [token-diet](https://github.com/Kulaxyz/token-diet) | ruleset ລວມ: ຕອບສັ້ນ + YAGNI + ອ່ານສະເພາະຊ່ວງ + ຈຳກັດ test | ປະເມີນຈາກ README ບໍ່ໄດ້ຕິດຕັ້ງ | ຊ້ຳກັບ caveman, ponytail ແລະກົດໃນ AGENTS.md ພ້ອມກັນ; ກົດ "test ≤ 10 ຕໍ່ session" ຂັດກັບ TDD ຂອງ superpowers; ບໍ່ມີ installer ສຳລັບ OpenCode |

> [!warning] ຂໍ້ຄວນຮູ້ຖ້າຈະ self-host Langfuse ເອງ
> - compose ທາງການ map ClickHouse ໄວ້ທີ່ host port `9000` — ຂັດກັບ SonarQube ຖ້າແລ່ນທີ່ `9000` ໃຊ້ໄຟລ໌ `docker-compose.override.yml` ເອົາ port ທີ່ບໍ່ຈຳເປັນອອກ (`ports: !reset []`) ແທນການແກ້ໄຟລ໌ທາງການ
> - `TELEMETRY_ENABLED` ຄ່າເລີ່ມຕົ້ນເປັນ `true` — ປິດເອງຖ້າຕ້ອງການ self-host ແທ້
> - Langfuse v4 ບໍ່ມີ `/api/public/traces` ແລ້ວ (events-only) — ໃຊ້ `/api/public/v2/observations`
> - plugin ໃຊ້ env var `LANGFUSE_*` ແທນ cloud ກໍຕໍ່ເມື່ອຕັ້ງທັງ public **ແລະ** secret key

> [!tip] ເກນເລືອກເຄື່ອງມືເພີ່ມ
> ກ່ອນຕິດຕັ້ງຫຍັງໃໝ່ ຖາມ 2 ຂໍ້: (1) ຢູ່ layer ໃດໃນ [[architecture]] ແລະຊ້ຳກັບຂອງທີ່ມີຫຼືບໍ່ (2) ໃສ່ຫຍັງເຂົ້າ prompt ທຸກ turn ແດ່ — ວັດດ້ວຍຂໍ້ 1 ກ່ອນແລະຫຼັງຕິດຕັ້ງໄດ້ເລີຍ

---

## 8. ທົດລອງ Caveman + benjamin-plus (2026-10-03) — ຕົວຢ່າງການວັດກ່ອນຕັດສິນໃຈ

ລອງເພີ່ມເຄື່ອງມືດ້ານ "token efficiency" ສອງໂຕພ້ອມກັນ ແລ້ວວັດດ້ວຍວິທີໃນໜ້ານີ້: **[caveman](https://github.com/JuliusBrussee/caveman)** skill (ຕອບສັ້ນ — ໃຊ້ແທນ i-have-adhd) ແລະ **[benjamin-plus](https://github.com/JetBrains/benjamin-plus-skill)** (ກົດ 5 ຂໍ້ເລື່ອງການສຳຫຼວດ/ອ່ານ/poll ໃສ່ຜ່ານ `"instructions"`) ວຽກທົດສອບຄືວຽກເດີມໃນຂໍ້ 4 (ເພີ່ມລະບົບ pause) ໃນສຳເນົາຂອງເກມຕົວຢ່າງ ແລ່ນແບບລະໜຶ່ງຮອບ

| | ກ່ອນໃສ່ | ໃສ່ທັງຄູ່ | ໃສ່ທັງຄູ່ + ກົດ "Verifying UI changes" |
| --- | --- | --- | --- |
| prompt ຕໍ່ turn | ~32.6k | ~34.8k (+2.1k) | ~34.9k |
| turn 1 (ສຳຫຼວດ + ອອກແບບ): ເວລາ / output tokens | 6.0 ນາທີ / 3,541 | 7.5 ນາທີ / 5,379 | 8.3 ນາທີ / 6,133 |
| turn 1: graft / read | 2 / 2 | 4 / 1 | 3 / 5 |
| turn 2 (ລົງມື + ກວດ): ເວລາ | 32.6 ນາທີ | **6.0 ນາທີ** | 36.1 ນາທີ |
| turn 2: output tokens | 25,308 | **4,051** | 28,031 |
| turn 2: tool call / chrome-devtools | 60 / 37 | **10 / 0** | 66 / 40 |
| ກວດໃນ browser + ພົບ bug menu ພັງ | ✅ | ❌ ຂ້າມ | ✅ |
| test 5 ຊຸດ | ຜ່ານ | ຜ່ານ | ຜ່ານ |

ສິ່ງທີ່ຕົວເລກບອກ:

- **ຖັນກາງເບິ່ງດີທີ່ສຸດ ແຕ່ໄວເພາະຂ້າມວຽກ** — agent ຢຸດຫຼັງ test ຜ່ານໂດຍບໍ່ເປີດ browser ຕາມກົດ "ແລ້ວ = ເກນກວດຂອງວຽກຜ່ານ" ຂອງ benjamin-plus ຈຶ່ງບໍ່ພົບ bug ທີ່ຮອບທຳອິດພົບ ([[gotchas]] ຂໍ້ 19)
- **ເມື່ອບັງຄັບໃຫ້ເຮັດຄົບ (ຖັນຂວາ) ຕົ້ນທຶນກັບໄປເທົ່າເດີມ** — ເວລາ, output ແລະຈຳນວນ chrome-devtools call ໃກ້ຄຽງຮອບທຳອິດ ໝາຍຄວາມວ່າທັງສອງໂຕບໍ່ໄດ້ເຮັດໃຫ້ວຽກດຽວກັນຖືກລົງ
- **turn 1 ບໍ່ດີຂຶ້ນ** — ໃຊ້ເວລາແລະ output ຫຼາຍຂຶ້ນ ແລະ prompt ໜັກຂຶ້ນທຸກ turn (caveman ~1.2k, benjamin-plus ~0.9k)
- **ຄຳຕອບສຸດທ້າຍສັ້ນແລະອ່ານງ່າຍຂຶ້ນ** (~9%) — ຜົນດຽວທີ່ເຫັນຈາກ caveman ຊຶ່ງຕົງກັບທີ່ JetBrains ວັດໄວ້ (output −8.5% ໃນວຽກຂຽນ code)

**ທີ່ຕັດສິນໃຈ:** ເກັບ caveman (style ການຕອບ + `/caveman-commit` / `/caveman-review`, ຮັບຕົ້ນທຶນ ~1.2k tokens/turn) · ຖອດ benjamin-plus · ເກັບກົດ "Verifying UI changes" ແລະ `--isolated` ຂອງ chrome-devtools ໄວ້

> [!warning] ຂໍ້ຈຳກັດຂອງການວັດນີ້
> ແຕ່ລະແບບແລ່ນຮອບດຽວ ແລະໂມເດວແກວ່ງລະຫວ່າງຮອບໄດ້ຫຼາຍ (turn 1 ຂອງ config ດຽວກັນວັດສອງຮອບໄດ້ 5.7 ແລະ 7.5 ນາທີ) — ສະຫຼຸບໄດ້ພຽງວ່າ "ບໍ່ເຫັນວ່າດີຂຶ້ນ" ບໍ່ແມ່ນ "ແຍ່ລົງ" ຖ້າຈະຕັດສິນໃຫ້ຂາດຕ້ອງແລ່ນຊ້ຳຫຼາຍຮອບຕໍ່ແບບ

> [!tip] ບົດຮຽນເລື່ອງວິທີວັດ
> 1. ວັດ**ລຳດັບ tool call** ຄູ່ກັບເວລາສະເໝີ (`session-report.mjs session <title>`) — ຮອບທີ່ໄວຜິດປົກກະຕິມັກໝາຍຄວາມວ່າມີຂັ້ນທີ່ຫາຍໄປ
> 2. ເບິ່ງຄ່າ `finish` ຂອງ step ສຸດທ້າຍ — ຮອບໜຶ່ງຈົບດ້ວຍ `tool-calls` (ບໍ່ແມ່ນ `stop`) ເພາະ Chrome profile ຂັດກັບເຄື່ອງມືອື່ນ ([[gotchas]] ຂໍ້ 17) ເຮັດໃຫ້ run ຈົບກາງທາງແລະຕົວເລກໃຊ້ບໍ່ໄດ້
> 3. ຢ່າໃຊ້ chrome-devtools ຈາກເຄື່ອງມືອື່ນເທິງເຄື່ອງດຽວກັນລະຫວ່າງແລ່ນທົດສອບ ຖ້າຍັງບໍ່ໄດ້ໃສ່ `--isolated`

---

## 9. OpenCode 2 — ສິ່ງທີ່ປ່ຽນ ແລະສິ່ງທີ່ວັດຊ້ຳ (2026-10-11)

ການອັບເກຣດຈາກ OpenCode 1.18.34 ເປັນ **2.0.26** (superpowers ຂະຫຍັບເປັນ 7.0.0 ພ້ອມກັນ) ເຮັດໃຫ້ບາງສ່ວນຂອງ setup ນີ້ພັງໂດຍບໍ່ມີ error ຂຶ້ນຈໍ ວິທີແກ້ແຕ່ລະຂໍ້ຂ້າງລຸ່ມກວດກັບ config ແທ້ເທິງເຄື່ອງນີ້ແລ້ວ ຂັ້ນຕອນອັບເກຣດຢູ່ທີ່ [[updating]] ແລະແຕ່ລະບັນຫາມີຂໍ້ໃນ gotchas

### 9.1 ສິ່ງທີ່ພັງ ແລະວິທີແກ້

| ສ່ວນ | ເທິງ OpenCode 2 | ວິທີແກ້ | Gotcha |
| --- | --- | --- | --- |
| graft-deep, caveman | plugin ແບບ V1 ບໍ່ເຮັດວຽກ | plugin ແບບ V2 (`config/plugin/graft-deep.js`), `scripts/port-caveman-opencode2.mjs` | 20 |
| array `plugin` | path ທີ່ເປັນໄຟລ໌ຖືກປະຕິເສດ folder `plugins/caveman` ຖືກຂ້າມງຽບໆ | ໃສ່ແຕ່ແພັກເກດ plugin ໃນເຄື່ອງເປັນໄຟລ໌ `.js` ໃນ `~/.config/opencode/plugin/` | 21 |
| skill ຂອງເຄື່ອງມືອື່ນ | `OPENCODE_DISABLE_EXTERNAL_SKILLS` ບໍ່ມີຜົນ — ໂມເດວເຫັນ 90 skill | allow-list ໃນ `permissions` → 27 | 15 |
| `compaction.prune` | ບໍ່ມີຜົນ | `keep.tokens: 24000` + `buffer: 32768` (ຂ້າງລຸ່ມ) | — |
| MCP ລາຍໂປຣເຈັກ | `{ "enabled": true }` ບໍ່ມີຜົນ | ສຳເນົາລາຍການທັງກ້ອນ | 22 |
| ຊື່ tool ໃນ AGENTS.md | tool ຂອງ MCP ຖືກເອີ້ນໃນ `execute` | `tools.graft.graft_find_code` ແລະອື່ນໆ | — |
| `brainstorming` (superpowers 7) | ຄຳຂໍທີ່ "ຊັດ" ໄປຂຽນ code ທັນທີ | ກົດ "Approval before building" | 23 |
| engine ຂອງ OpenDesign | flag ຂອງ 1.x ຖືກປະຕິເສດ | ໃຊ້ engine ອື່ນຈົນກວ່າຕົ້ນທາງຈະແກ້ | 24 |
| background service | session ແລະ browser ຢູ່ຕໍ່ຫຼັງ `opencode run` ຈົບ | `session.interrupt`; ກົດ UI: ເປີດໜ້າຂອງຕົນເອງ ດຶງຂຶ້ນດ້ານໜ້າ ແລ້ວປິດ | 26 |

### 9.2 prompt ຕໍ່ turn: ~34.0k → ~14.6k tokens

ວັດດ້ວຍ `capture-server.mjs` + `analyze-prompt.mjs` (ຂໍ້ 1 ພ້ອມ `--standalone`) ເປີດ MCP 6 ໂຕເທົ່າເດີມ config ຊຸດສຸດທ້າຍ:

| ສ່ວນ | ~tokens |
| --- | --- |
| built-in tools (12 ໂຕ ລວມ `execute`, `shell`, `subagent`) | 3,349 |
| MCP catalog (Code Mode) | 2,493 |
| ລາຍການ skill (27 ໂຕ) | 2,331 |
| AGENTS.md — project (ບລັອກຂອງ graft) | 1,989 |
| AGENTS.md — global (6 ຫົວຂໍ້) | 1,533 |
| superpowers bootstrap | 1,216 |
| prompt ພື້ນຖານຂອງ OpenCode + `<env>` | 1,212 |
| instructions ຂອງ MCP server (graft, context7) | 520 |
| **ລວມ** | **~14.6k** |

ທີ່ຫຼຸດລົງເພາະ **Code Mode**: ແທນທີ່ຈະມີນິຍາມ tool ຂອງ MCP 70 ກວ່າໂຕ ໂມເດວໄດ້ tool `execute` ໂຕດຽວກັບ catalog ສັ້ນໆ (ບໍ່ເທົ່າໃດ tool ຕໍ່ server ທີ່ເຫຼືອຊອກເອງດ້ວຍ `search(...)`) ການປິດ MCP ເພື່ອປະຢັດ prompt (ຂໍ້ 5.1) ຈຶ່ງສຳຄັນໜ້ອຍລົງຫຼາຍ — server ທີ່ເປີດເພີ່ມກິນພຽງບໍ່ເທົ່າໃດແຖວໃນ catalog ແຕ່ຍັງຄວນປິດໂຕທີ່ໃຊ້ໜ້ອຍໄວ້ ເພາະແຕ່ລະໂຕຄື process ທີ່ຕ້ອງເປີດ ແລະ sonarqube ໃຊ້ ~14 ວິນາທີຜ່ານ Docker

### 9.3 Compaction ເທິງ OpenCode 2

```jsonc
"compaction": { "auto": true, "keep": { "tokens": 24000 }, "buffer": 32768 }
```

- **`keep.tokens`** — ບົດສົນທະນາຫຼ້າສຸດທີ່ເກັບໄວ້ຄູ່ກັບສະຫຼຸບ (ຄ່າເລີ່ມຕົ້ນ 15000) 24000 ເກັບໄຟລ໌ທີ່ agent ຫາກໍອ່ານໄວ້ໄດ້ຫຼາຍຂຶ້ນ ຊຶ່ງເປັນວຽກທີ່ `prune` + ກົດ re-read ເຄີຍເຮັດເທິງ OpenCode 1 ຍັງບໍ່ໄດ້ວັດກັບ session ຍາວ
- **`buffer`** — token ທີ່ເວັ້ນວ່າງໄວ້ໃຕ້ຂີດຈຳກັດຂອງໂມເດວ (ຄ່າເລີ່ມຕົ້ນ 10% ≈ 13k) server ໂມເດວແລ່ນດ້ວຍ `ctx-size 131072` ແລະໂມເດວຕອບໄດ້ສູງສຸດ 32768 tokens ຈຶ່ງຕັ້ງ buffer ເທົ່າຄຳຕອບເຕັມໜຶ່ງເທື່ອ: compaction ເລີ່ມທີ່ປະມານ ~98k ແທນທີ່ຈະປ່ອຍໃຫ້ prompt + ຄຳຕອບລົ້ນ context ຂອງ server ຖ້າ llama.cpp ແລ່ນດ້ວຍ `--parallel N` ແຕ່ລະ slot ໄດ້ພຽງ `131072 / N` — ໃຫ້ຫຼຸດ `limit.context` ຂອງໂມເດວໃຫ້ກົງ

### 9.4 ທົດສອບຄົບວົງຈອນ ຄຳຂໍດຽວກັບຂໍ້ 4

`please add a pause feature to the game: pressing P (or Esc) pauses and resumes gameplay` ໃນສຳເນົາໃໝ່ຂອງເກມຕົວຢ່າງ ໂມເດວ Ternary-Bonsai-2-27B ທີ່ host ເອງ (Qwen3.8-27B ແບບ ternary 1.7 bit, ~42 tok/s ເທິງ GPU ໂຕດຽວ) server ແລ່ນໂມເດວນີ້ໃນທຸກຮອບຂ້າງລຸ່ມ ແຕ່ OpenCode ຕິດປ້າຍ session ວ່າ `qwen3.8-27b-v3` ເພາະ llama-server ບໍ່ສົນຊື່ໂມເດວໃນ request ກ່ອນທຽບຕົວເລກຈຶ່ງຄວນກວດວ່າ server ໂຫຼດໂມເດວໃດຢູ່ແທ້

| ຮອບ | ກົດທີ່ເພີ່ມໃນ global AGENTS.md | Turn 1 (ອອກແບບ) | ລົງມື + ກວດໃນ browser | ຜົນ |
| --- | --- | --- | --- | --- |
| 1 | ກົດຊຸດ OpenCode 1 ແກ້ຊື່ tool ແລ້ວ | ບໍ່ມີການອອກແບບ — ຂຽນ code ທັນທີ | ລວມ 15 ນາທີ 66 tool calls (chrome-devtools 23) | ✅ ສ້າງແລະກວດແລ້ວ ການກວດໃນ browser ພົບ overlay "PAUSED" ສະແດງກັບດ້ານ |
| 2 | + "Approval before building" | 18 ນາທີກວ່າອ່ານ source ແບບ minified ຂອງ Phaser — ຢຸດເອງ | — | ❌ turn ອອກແບບກາຍເປັນການຄົ້ນຄວ້າ |
| 3 | + "ອອກແບບຈາກ code ຂອງໂປຣເຈັກເອງ", `npx http-server` | ✅ 6 ນາທີ 10 tool calls ອອກແບບໄຟລ໌ດຽວ + ຄຳຖາມໜຶ່ງຂໍ້ ບໍ່ແກ້ໄຟລ໌ | 22 ນາທີກວ່າ 60 tool calls (chrome-devtools 46) ວົນຢູ່ກັບໜ້າທີ່ຮອບ 1 ເປີດຄ້າງໄວ້ — ຢຸດເອງ | ⚠️ code ແລ້ວ test ຜ່ານ ແຕ່ການກວດໃນ browser ວົນບໍ່ຈົບ |
| 4 | + "ເປີດໜ້າຂອງຕົນເອງ ດຶງຂຶ້ນດ້ານໜ້າ ປິດເມື່ອແລ້ວ ຢຸດຫຼັງກວດ 2–3 ເທື່ອ" (service ໃໝ່) | ✅ 6 ນາທີ 13 tool calls ມີການອອກແບບ ບໍ່ແກ້ໄຟລ໌ | 11 ນາທີ ແລ້ວຄ້າງ 8 ນາທີທີ່ script ຂອງ `execute` ຊຶ່ງ promise ບໍ່ resolve — ຕ້ອງ interrupt ຫຼັງສັ່ງ "continue": 16 ນາທີ 61 tool calls (chrome-devtools 56) ກວດ P ແລະ Esc ແລ້ວ console ບໍ່ມີ error ປິດໜ້າແລ້ວ | ✅ ສ້າງແລະກວດແລ້ວ ໄຟລ໌ດຽວ test ຜ່ານ 5/5 ໄຟລ໌ |

ສິ່ງທີ່ຕົວເລກບອກ:

- **ຂັ້ນອະນຸມັດກັບມາເຮັດວຽກແລ້ວ** ດ້ວຍກົດຊຸດສຸດທ້າຍ turn 1 ສຳຫຼວດສະເພາະ code ຂອງໂປຣເຈັກ (graft + 5–6 ໄຟລ໌) ສະແດງການອອກແບບສັ້ນໆ (ໄຟລ໌ ພຶດຕິກຳ ສິ່ງທີ່ຈະບໍ່ເຮັດ ແລະຄຳຖາມໜຶ່ງຂໍ້) ແລະບໍ່ແກ້ຫຍັງ — ປະມານ 6 ນາທີ
- **ຮອບ 4 ບໍ່ໄດ້ໂຫຼດ `brainstorming` ເລີຍ** — ການອອກແບບມາຈາກກົດໃນ AGENTS.md ລ້ວນໆ superpowers 7 ຂ້າມຂັ້ນຕອນຂອງຕົນເອງເມື່ອເຫັນວ່າຄຳຂໍຊັດ ກົດນີ້ຄືສິ່ງທີ່ຮັກສາຂັ້ນອະນຸມັດໄວ້
- **ການກວດໃນ browser ຍັງເປັນສ່ວນທີ່ແພງທີ່ສຸດ:** chrome-devtools 23–56 ເທື່ອຕໍ່ຮອບເທິງໂມເດວນີ້ ແລະມັກທົດສອບເກີນ "ໜຶ່ງ interaction" ທີ່ກົດກຳນົດ ສອງໃນສີ່ຮອບພົບກັບດັກຂອງ OpenCode 2 ໃນຂັ້ນນີ້ — ໜ້າທີ່ session ກ່ອນເປີດຄ້າງໄວ້ ແລະ script ໃນ Code Mode ທີ່ບໍ່ resolve ([[gotchas]] ຂໍ້ 26) ທັງສອງເລື່ອງເປັນກົດໃນ AGENTS.md ແລ້ວ ເລື່ອງທີສອງເພີ່ມຫຼັງຮອບ 4 ແລະຍັງບໍ່ໄດ້ທົດສອບຊ້ຳຄົບຮອບ
- **ໂຕໂມເດວຄືຄໍຂວດ:** ເຖິງຈະໄດ້ ~42 tok/s ໂມເດວ 27B ທີ່ແລ່ນໃນເຄື່ອງກໍຍັງຄິດເປັນນາທີລະຫວ່າງ tool call ແຕ່ລະເທື່ອ ເຜື່ອເວລາ ~30 ນາທີສຳລັບ feature ນ້ອຍໜຶ່ງວຽກຕັ້ງແຕ່ຕົ້ນຈົນຈົບ

> [!warning] ຢຸດ run ແບບ headless ບໍ່ໄດ້ຢຸດ session
> ເທິງ OpenCode 2 `opencode run` ເປັນພຽງ client ຂອງ background service: kill ມັນ (Ctrl+C, timeout) ແລ້ວ session ຍັງເຮັດວຽກຕໍ່ ໃຫ້ຢຸດດ້ວຍ `Esc` ໃນ TUI ຫຼື `opencode api session.interrupt --param sessionID=<id>` (ຊອກ id ດ້ວຍ `opencode session list`)

### 9.5 ການວັດຜົນເທິງ OpenCode 2

- ຕອນນີ້ `session-report.mjs` ອ່ານໄດ້ທັງ session ຂອງ OpenCode 1 (`session`/`part`) ແລະ OpenCode 2 (`session_v2`/`session_message`) ເທິງ OpenCode 2 ການເອີ້ນ MCP ທຸກເທື່ອເກີດໃນ script ຂອງ `execute` ລາຍງານຈະແຍກ script ເຫຼົ່ານັ້ນກັບເປັນການເອີ້ນ `<server>_<tool>` ເຮັດໃຫ້ຍັງທຽບການໃຊ້ graft ແລະ chrome-devtools ກັບຜົນເດີມໄດ້
- `analyze-prompt.mjs` ນັບ `shell`/`subagent`/`execute` ເປັນ built-in tool ແລະແຍກ Code Mode catalog ເປັນຂອງຕົນເອງ
- ວິທີ capture ໃຫ້ເພີ່ມ `--standalone` (ຂໍ້ 1)
