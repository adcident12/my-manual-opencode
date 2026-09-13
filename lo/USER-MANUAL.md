---
tags: [user-manual, getting-started, opencode, vibe-coding]
updated: 2026-09-13
summary: ຄູ່ມືການໃຊ້ງານ OpenCode ປະຈຳວັນ — vibe coding, graft workflow, grill-me/grilling ແລະ OpenDesign workflow
---

# 📘 ຄູ່ມືການໃຊ້ງານ OpenCode ສຳລັບ Vibe Coding

> ຕັ້ງຄ່າຄົບແລ້ວເບິ່ງ [[setup]] · ລາຍລະອຽດ MCP/Plugin ເບິ່ງ [[mcp-servers]] ແລະ [[plugins]] · ບັນຫາທີ່ພົບເລື້ອຍເບິ່ງ [[gotchas]] · ອັບເດດ/ອັບເກຣດເບິ່ງ [[updating]]

---

## 📋 ສາລະບານ

- ພາບລວມ — architecture ຂອງ setup ນີ້ + workflow cycle ລະດັບ project ແລະ agent
- ເລີ່ມວຽກໃນ project ໃໝ່ — checklist 6 ຂັ້ນຕອນ ພ້ອມຈຸດກວດສອບທຸກຂັ້ນ
- Vibe coding ທົ່ວໄປກັບ opencode — ລວມຕົວຢ່າງເຕັມ 1 ຮອບການເຮັດວຽກຈິງ (ຈາກຄຳສັ່ງເຖິງ commit) ແລະວິທີໃຊ້ grill-me/grilling
- ໃຊ້ graft ໃຫ້ເຂົ້າໃຈໂຄ້ດໄວຂຶ້ນ — ພ້ອມຕົວຢ່າງ output ຈິງທີ່ຕ້ອງພົບ
- ສ້າງເວັບໄຊທ໌ດ້ວຍ OpenDesign (ແລ້ວດຶງມາຕໍ່ໃນ opencode)
- ເລືອກໂມເດວໃຫ້ເໝາະກັບວຽກ
- ບັນຫາທີ່ພົບເລື້ອຍ

> [!tip] ມືໃໝ່ເລີ່ມອ່ານຕາມລຳດັບນີ້
> ຫົວຂໍ້ 1 (ເຂົ້າໃຈພາບລວມກ່ອນ) → 2 (ເຮັດຕາມ checklist ຈິງໃນ project ທຳອິດ) → 3 (ລອງສັ່ງວຽກຈິງຕາມຕົວຢ່າງ) — ເຮັດຄົບ 3 ຫົວຂໍ້ທຳອິດແລ້ວຈະໃຊ້ງານປະຈຳວັນໄດ້ເອງ ຫົວຂໍ້ 4-7 ເປັນແບບອ້າງອິງ ເປີດເບິ່ງຕອນຕ້ອງໃຊ້

---

## 1. ພາບລວມ

```mermaid
graph LR
    A[OpenDesign App<br/>Studio - chat + live preview] -->|spawns as engine| B[OpenCode]
    B -->|MCP| C[context7 / playwright / chrome-devtools]
    B -->|MCP| D[graft - code graph]
    B -->|MCP| E[open-design - ດຶງໄຟລ໌]
    B -->|plugin| F[superpowers - skills]
    B -->|plugin| G[graft-deep - inject context]
    B -->|plugin| L[ponytail - code minimization]
    B -->|plugin, opt-in| M["i-have-adhd - terse output<br/>(/i-have-adhd ຕໍ່ session)"]
    B -->|provider| H[home-llamacpp<br/>self-hosted model]
    E -.->|ດຶງໄຟລ໌ generate ໄວ້| I[project ຈິງ frontend+backend]
```

ສອງ entry point ຫຼັກ:

1. **ເປີດ opencode terminal ໂດຍກົງ** ໃນ project ໂຄ້ດຈິງ — ໃຊ້ຕອນພັດທະນາ backend/full-stack ເຕັມຮູບແບບ
2. **ເປີດແອັບ OpenDesign** — ໃຊ້ຕອນຢາກໄດ້ໜ້າເວັບ/prototype ໄວໆ ພ້ອມ live preview (OpenDesign ເອີ້ນ opencode ເປັນ "ເຄື່ອງຈັກ" ເບື້ອງຫຼັງໃຫ້ເອງ ບໍ່ຕ້ອງພິມ opencode terminal ເອງ)

### Workflow cycle ລະດັບ project (macro)

ພາບລວມແບບວົນຊ້ຳຕັ້ງແຕ່ໄດ້ໂຈດຈົນເຖິງ deploy ແລ້ວວົນກັບມາຮັບໂຈດໃໝ່/ປັບປຸງຕໍ່:

```mermaid
graph LR
    A["Brief<br/>ໂຈດທີ່ຢາກໄດ້"] --> B["ອອກແບບ/ສ້າງຕົ້ນແບບ<br/>OpenDesign Studio"]
    B --> C["ດຶງເຂົ້າ project ຈິງ<br/>open-design MCP"]
    C --> D["ພັດທະນາ backend/DB<br/>opencode + postgres/mysql MCP"]
    D --> E["ທົດສອບ<br/>playwright / chrome-devtools MCP"]
    E --> Q["ກວດຄຸນນະພາບ/ຄວາມປອດໄພ<br/>sonarqube + trivy MCP (quality gate)"]
    Q --> F["Deploy"]
    F -->|ໂຈດໃໝ່ / ປັບປຸງ| A
```

ໃຊ້ເບິ່ງພາບລວມວ່າ "ວຽກໜຶ່ງອັນ" ຄວນໄຫຼຜ່ານເຄື່ອງມືໃດແດ່ຕາມລຳດັບ — ລາຍລະອຽດແຕ່ລະຂັ້ນເບິ່ງທີ່ຫົວຂໍ້ 5 ລຸ່ມນີ້

### Workflow cycle ຂອງ agent ຕໍ່ 1 ຄຳສັ່ງ (micro)

ພາຍໃນແຕ່ລະ turn ທີ່ພິມຄຳສັ່ງໃຫ້ opencode ເກີດຫຍັງຂຶ້ນແດ່ເບື້ອງຫຼັງ (ອີງຈາກ [[plugins]] ແລະ [[mcp-servers]]):

```mermaid
graph LR
    A["User ພິມຄຳສັ່ງ"] --> B["graft-deep<br/>ຝັງ context ທີ່ກ່ຽວຂ້ອງ"]
    B --> C["superpowers<br/>ເລືອກ skill ທີ່ເໝາະສົມ"]
    C --> D{"ຕ້ອງໃຊ້ tool ເພີ່ມບໍ່?"}
    D -->|ຄົ້ນ docs| E["context7"]
    D -->|ເຂົ້າໃຈໂຄງສ້າງໂຄ້ດ| F["graft"]
    D -->|ທົດສອບ/debug UI| G["playwright /<br/>chrome-devtools"]
    D -->|ຈື່ context ເກົ່າ| H["memory"]
    D -->|ກວດ quality/security| K["sonarqube /<br/>trivy"]
    E --> L["ponytail<br/>ກວດ decision ladder ກ່ອນຂຽນໂຄ້ດ"]
    F --> L
    G --> L
    H --> L
    K --> L
    L --> I["ແກ້ໄຂ/ຂຽນໂຄ້ດ"]
    I -->|ຄຳສັ່ງຖັດໄປ| A
```

> [!note] ບໍ່ມີຂັ້ນ "auto-rebuild graph" ແຍກແລ້ວ
> ເດີມ graft-deep ມີ hook ຄອຍ rebuild graph ເອງຫຼັງແກ້ໂຄ້ດ — ຕັດອອກແລ້ວເພາະ graft CLI ເວີຊັນປັດຈຸບັນ refresh graph ໃຫ້ເອງກ່ອນຕອບທຸກຄຳຖາມຢູ່ແລ້ວ (verified ເບິ່ງ [[plugins]] ຫົວຂໍ້ graft-deep) ບໍ່ມີຫຍັງໃຫ້ລໍ ບໍ່ມີ node ແຍກໃນ diagram ນີ້ອີກຕໍ່ໄປ

> [!note] ບໍ່ແມ່ນທຸກ turn ຈະຄົບທຸກຂັ້ນ
> ຖ້າຄຳສັ່ງສັ້ນ/ບໍ່ກ່ຽວກັບໂຄ້ດ (ເຊັ່ນ "ອະທິບາຍ X ໃຫ້ຟັງ") ບາງ node ອາດຖືກຂ້າມໄປ — diagram ນີ້ສະແດງ**ເສັ້ນທາງທີ່ເປັນໄປໄດ້ທັງໝົດ** ບໍ່ແມ່ນທຸກ turn ຈະແລ່ນຜ່ານທຸກກ່ອງ

> [!note] Plugin ponytail
> plugin ponytail (ເບິ່ງ [[plugins]]) ເປັນ gate ສຸດທ້າຍກ່ອນລົງມືຂຽນໂຄ້ດຈິງ (node L) — ບັງຄັບໃຫ້ agent ໄລ່ decision ladder ເຮັດວຽກຄຽງຄູ່ກັບ superpowers/graft-deep ໂດຍບໍ່ຊ້ຳຊ້ອນ (superpowers ເລືອກ workflow, graft-deep ຫາ context, ponytail ຄວບຄຸມປະລິມານໂຄ້ດທີ່ຂຽນອອກມາ)

> [!note] Plugin i-have-adhd — ບໍ່ຢູ່ໃນ cycle ຕໍ່ turn ຂ້າງເທິງ (ຕັ້ງໃຈ)
> ຕ່າງຈາກ superpowers/graft-deep/ponytail ທີ່ເຮັດວຽກອັດຕະໂນມັດທຸກ turn — i-have-adhd (ເບິ່ງ [[plugins]]) ເປັນ **opt-in ຕໍ່ session**: ຕ້ອງພິມ `/i-have-adhd` ເອງກ່ອນຈຶ່ງຈະເລີ່ມມີຜົນ — ປິດດ້ວຍ `stop adhd mode` ເມື່ອໃດກໍໄດ້

> [!note] Skill grill-me / grilling — ບໍ່ແມ່ນ plugin ແຍກ ແຕ່ຜູກກັບ node C
> ບໍ່ໄດ້ຢູ່ໃນ diagram ເປັນ node ແຍກ ເພາະເປັນ skill (ໄຟລ໌ `SKILL.md` ດ່ຽວໆ ຕາມ Agent Skills open standard — ເບິ່ງ [[setup]]) ບໍ່ແມ່ນ plugin ແຕ່ເຮັດວຽກທີ່ node C ດຽວກັນກັບ superpowers: ເມື່ອ agent ເລືອກ `brainstorming` ສຳລັບວຽກສ້າງ feature ໃໝ່ ຈະໃຊ້ format ຄຳຖາມແບບ batch ຂອງ `grilling` ແທນການຖາມເທື່ອລະຂໍ້ ວິທີໃຊ້ຈິງເບິ່ງຫົວຂໍ້ 3 ລຸ່ມນີ້ ລາຍລະອຽດການຕິດຕັ້ງ/reconcile ເຕັມໆ ເບິ່ງທີ່ [[plugins]]

---

## 2. ເລີ່ມວຽກໃນ project ໃໝ່ — ເຮັດຕາມຂັ້ນຕອນນີ້ທີລະຂັ້ນ

ເຮັດຄັ້ງດຽວຕໍ່ project ໜຶ່ງ (ບໍ່ຕ້ອງເຮັດຊ້ຳທຸກຄັ້ງທີ່ເປີດ opencode) ແຕ່ລະຂັ້ນມີຈຸດກວດສອບກຳກັບໄວ້ — ຖ້າຂັ້ນໃດບໍ່ໄດ້ຜົນຕາມທີ່ບອກ **ຢຸດຢູ່ນັ້ນກ່ອນ** ຄ່ອຍໄປຕໍ່

**ຂັ້ນ 1 — ເຂົ້າໂຟນເດີ project**

```bash
cd my-new-project
# ຖ້າຍັງບໍ່ມີໂຟນເດີ/repo: mkdir my-new-project && cd my-new-project && git init
```

**ຂັ້ນ 2 — ສ້າງ context graph ດ້ວຍ graft** (ຂ້າມຂັ້ນນີ້ໄດ້ຖ້າບໍ່ໄດ້ຕິດຕັ້ງ graft ໄວ້ — ເບິ່ງ [[mcp-servers]] ກ່ອນຖ້າຍັງບໍ່ເຄີຍຕິດຕັ້ງ)

```bash
graft build
```

✅ **ຕ້ອງເຫັນ:** `parsing 1/N: ...` ໄລ່ຈົນເຖິງ `N/N` ແລ້ວຈົບໂດຍບໍ່ມີ error — ໄດ້ໂຟນເດີ `graft/` ໃໝ່ໃນ project

```bash
graft init --agents agents --no-global
```

✅ **ຕ້ອງເຫັນ:** ໄຟລ໌ `AGENTS.md` ແລະ `opencode.json` (ມີ `mcp.graft`) ຖືກສ້າງ/ແກ້ທີ່ root project

**ຂັ້ນ 3 — ຢືນຢັນວ່າ graft ຕໍ່ກັບ opencode ສຳເລັດ**

```bash
opencode mcp list
```

✅ **ຕ້ອງເຫັນ:** ແຖວ `graft` ສະຖານະ `connected` ຖ້າບໍ່ຂຶ້ນ ໃຫ້ກວດ [[gotchas]] ກ່ອນ

```bash
graft map
```

✅ **ຕ້ອງເຫັນ:** ສະຫຼຸບ `repo map — N files · N symbols · N edges · <ພາສາຫຼັກ>`

**ຂັ້ນ 4 — (ສະເພາະກໍລະນີຕ້ອງໃຊ້) ເປີດ MCP ສະເພາະ project**

```jsonc
// my-new-project/opencode.jsonc
{ "mcp": { "postgres": { "enabled": true } } }
```

```bash
export POSTGRES_CONNECTION_STRING="postgresql://user:pass@host/db"
```

**ຂັ້ນ 5 — ເປີດ opencode ຄັ້ງທຳອິດໃນ project ນີ້**

```bash
opencode
```

ລອງພິມຄຳຖາມທີ່ຕ້ອງອ້າງອິງໂຄ້ດຈິງ ເຊັ່ນ `ສະຫຼຸບໂຄງສ້າງ project ນີ້ໃຫ້ແດ່`

✅ **ຕ້ອງເຫັນ:** ຄຳຕອບອ້າງອິງຊື່ໄຟລ໌/ຟັງຊັນຈິງໃນ project

**ຂັ້ນ 6 — (ແນະນຳ) ຢືນຢັນວ່າ skill/plugin ໂຫຼດຄົບ**

```bash
opencode debug skill
```

✅ **ຕ້ອງເຫັນ:** skill ຈາກ `superpowers` ຄົບ 14 ໂຕ, skill ຂອງ `ponytail`, `i-have-adhd`, ແລະ `grill-me`/`grilling` ຖ້າຕິດຕັ້ງໄວ້

> [!tip] ເຮັດຄົບ 6 ຂັ້ນແລ້ວໄປຫົວຂໍ້ 3 ໄດ້ເລີຍ
> ຈາກນີ້ບໍ່ຕ້ອງເຮັດ checklist ນີ້ຊ້ຳອີກສຳລັບ project ເດີມ

---

## 3. Vibe Coding ທົ່ວໄປກັບ opencode

ເປີດ TUI ແລ້ວລົມເປັນພາສາທຳມະດາໄດ້ເລີຍ:

```bash
opencode
```

ຫຼືແລ່ນແບບ non-interactive (headless, ໃຊ້ script/automation ໄດ້):

```bash
opencode run "ຂຽນຟັງຊັນ reverse string ເປັນ one-liner python"
opencode run -m home-llamacpp/qwen3.8-27b "..."   # ລະບຸໂມເດວສະເພາະ
```

ລະຫວ່າງລົມ agent ຈະເລືອກໃຊ້ tool ເອງ (context7 ຫາ docs, playwright/chrome-devtools debug browser, graft ເຂົ້າໃຈໂຄງສ້າງໂຄ້ດ) — ບໍ່ຕ້ອງສັ່ງເຈາະຈົງວ່າ "ໃຊ້ tool X" ເວັ້ນແຕ່ຢາກບັງຄັບ

### ຕົວຢ່າງເຕັມໜຶ່ງຮອບ (ຈາກຄຳສັ່ງເຖິງ commit)

1. **ພິມຄຳສັ່ງ:** `ຊ່ວຍເພີ່ມດ່ານ 3 ໃຫ້ເກມແດ່`
2. **superpowers ເລືອກ skill** — ພົບວ່າເປັນວຽກສ້າງ feature ໃໝ່ → ເອີ້ນ `brainstorming`
3. **graft ຫາໂຄ້ດທີ່ກ່ຽວຂ້ອງ** — agent ເອີ້ນ graft ເອງ (`graft_find_code`/`graft_file_api` ຜ່ານ MCP) ຫາວ່າລະບົບດ່ານປັດຈຸບັນເຮັດວຽກແນວໃດ
4. **ຖາມຄຳຖາມຊີ້ແຈງແບບ batch (grilling format)** — ຍິງຄຳຖາມພ້ອມກັນຫຼາຍຂໍ້ ພ້ອມຄຳແນະນຳ `➡️` ຕໍ່ທ້າຍ
5. **ຕອບຄຳຖາມ** — ພິມສັ້ນໆ ເຊັ່ນ `ຕາມແນະນຳທັງໝົດ`
6. **ponytail ກວດ decision ladder** — ກ່ອນຂຽນໂຄ້ດໃໝ່ ກວດວ່າມີຂອງເດີມໃຫ້ reuse ບໍ່
7. **ຂຽນ/ແກ້ໂຄ້ດ** ພ້ອມ todo list ກຳກັບຄວາມຄືບໜ້າ
8. **ແລ່ນ test + ກວດໃນ browser** (ຜ່ານ playwright/chrome-devtools MCP ຖ້າເປັນເວັບ)
9. **commit** ເປັນ scoped commit ດຽວ ພ້ອມຂໍ້ຄວາມສັ້ນກົງປະເດັນ

> [!tip] ບໍ່ເຫັນຄົບທຸກຂັ້ນກໍປົກກະຕິ
> ຄຳສັ່ງນ້ອຍໆ (ແກ້ typo, ຖາມຄຳຖາມທົ່ວໄປ) ຈະຂ້າມຂັ້ນ 2-6 ໄປເລີຍ ເຂົ້າຂັ້ນ 7-9 ໂດຍກົງ

### ໃຊ້ grill-me / grilling ກ່ອນເລີ່ມ feature ໃໝ່ (ຖ້າຕິດຕັ້ງໄວ້)

ຖ້າຕິດຕັ້ງ skill `grill-me`/`grilling` ໄວ້ແລ້ວ (ວິທີຕິດຕັ້ງທີ່ [[plugins]]) ມີ 2 ວິທີເອີ້ນໃຊ້:

**1. ໃຫ້ສຳພາດດ່ຽວໆ (ບໍ່ implement ທັນທີ, ບໍ່ມີ spec file):**

```
grill me about <ໄອເດຍ/ການຕັດສິນໃຈທີ່ຢາກທົດສອບ>
```

**2. ປ່ອຍໃຫ້ເກີດຂຶ້ນເອງຕອນຂໍ feature ໃໝ່ (ບໍ່ຕ້ອງເວົ້າຄຳວ່າ grill ເລີຍ):**

```
ຊ່ວຍເພີ່ມ <feature> ໃຫ້ແດ່
```

ຖ້າຕິດຕັ້ງ `superpowers` ໄວ້ນຳ (ປົກກະຕິເປັນຄູ່ກັນ) ກໍລະນີທີ 2 ຈະເອີ້ນ `brainstorming` ກ່ອນຕາມ gate ຫຼັກຂອງມັນ ແລ້ວ**ເອົາ format ຄຳຖາມຂອງ grilling ມາໃຊ້**:

```
❓ Q1 - <ຫົວຂໍ້ຄຳຖາມ>: <ລາຍລະອຽດ/ຕົວເລືອກ>
➡️ <ຄຳແນະນຳ>

---

❓ Q2 - ...
```

ຕອບເປັນຕົວເລືອກ/ຕົວອັກສອນສັ້ນໆ ໄດ້ເລີຍ (ເຊັ່ນ `A A A A` ຫຼື `ຕາມແນະນຳທັງໝົດ`) — agent ຈະບໍ່ເລີ່ມຂຽນໂຄ້ດຈົນກວ່າຈະຕອບຄົບທຸກຂໍ້

> [!info] ຢືນຢັນແລ້ວວ່າບໍ່ຂັດແຍ້ງກັນ
> ທົດສອບຈິງແລ້ວວ່າເອີ້ນ `grilling` ດ່ຽວໆ ກັບປ່ອຍໃຫ້ `brainstorming` ຢືມ format ໄປໃຊ້ ເຮັດວຽກຖືກທາງທີ່ຕ່າງກັນໂດຍບໍ່ຂັດແຍ້ງກັນ ລາຍລະອຽດເຕັມຢູ່ທີ່ [[plugins]] ຫົວຂໍ້ grill-me/grilling

---

## 4. ໃຊ້ graft ໃຫ້ເຂົ້າໃຈໂຄ້ດໄວຂຶ້ນ

ບໍ່ຕ້ອງສັ່ງ `graft` ເອງເລີຍ — ເມື່ອຜູກ MCP ໄວ້ແລ້ວ (ເບິ່ງ [[mcp-servers]]) opencode ຈະເອີ້ນ tool ຂອງ graft ເອງອັດຕະໂນມັດເວລາຈຳເປັນ ສ່ວນນີ້ຄືວິທີເອີ້ນ CLI ໂດຍກົງດ້ວຍຕົນເອງ ເຜື່ອຢາກສຳຫຼວດໂຄ້ດໄວໆ ກ່ອນເລີ່ມລົມກັບ agent

**ຂັ້ນ 1 — ເບິ່ງພາບລວມ project**

```bash
graft map
```

ຕົວຢ່າງ output ຈິງທີ່ຄວນໄດ້:

```
repo map — 15 files · 312 symbols · 540 edges · javascript

src/                12 files · 280 symbols   hubs: SG.config (config.js, 9←), GameScene (GameScene.js, 7←)
test/               1 files · 12 symbols     hubs: runTest (logic.test.js, 2←)

hotspots: SG.config · object · src/config.js:L3-L18 · 9←  GameScene.create · method · src/scenes/GameScene.js:L14-L111 · 7←
```

**ຂັ້ນ 2 — ຖາມຫາໂຄ້ດທີ່ກ່ຽວຂ້ອງເປັນພາສາຄົນ**

```bash
graft ask "auth ເຮັດວຽກຢູ່ໃສ"
```

ຕົວຢ່າງ output ຈິງ:

```
graft ask — "ring collection overlap handler addRings ring cap"  (lexical)

1. addRings · method  [symbol]
   src/entities/Sonic.js:L43-L45
   addRings(n)

   addRings(n) {
     this.rings = Math.min(SG.config.ringCap, this.rings + n);
   }
```

**ຂັ້ນ 3 — ກວດວ່າ graph ຍັງຕົງກັບໂຄ້ດຈິງບໍ່**

```bash
graft check
```

✅ exit code `0` = graph ຕົງກັບໂຄ້ດປັດຈຸບັນ

> [!note] Plugin graft-deep
> plugin graft-deep (ເບິ່ງ [[plugins]]) auto-inject context ທີ່ກ່ຽວຂ້ອງຕໍ່ prompt ໃໝ່ທຸກຄັ້ງ — ສ່ວນຄວາມສົດຂອງ graph ເອງບໍ່ຕ້ອງເພິ່ງ plugin ນີ້ແລ້ວ — graft CLI ປັດຈຸບັນ refresh ຕົນເອງກ່ອນຕອບທຸກຄຳຖາມຢູ່ແລ້ວ

---

## 5. ສ້າງເວັບໄຊທ໌ດ້ວຍ OpenDesign ແລ້ວດຶງມາຕໍ່ໃນ opencode

### Phase 1 — ອອກແບບ/ສ້າງຕົ້ນແບບໃນ OpenDesign

1. ເປີດແອັບ OpenDesign → ໜ້າ **Home**
2. ພິມ brief (ໂຈດເວັບໄຊທ໌) ເປັນຂໍ້ຄວາມທຳມະດາ
3. ເລືອກປະເພດ artifact ເປັນ **Prototype**
4. ເລືອກ design system ຫຼືປ່ອຍ auto
5. Launch → ເຂົ້າສູ່ **Studio**
6. ລົມຕໍ່ໃນແຊັດເພື່ອປັບແກ້
7. ພໍໃຈແລ້ວ export ໄດ້ຈາກເມນູ Download (HTML/PDF/PPTX)

### Phase 2 — ດຶງມາຕໍ່ໃນ project ຈິງ

```bash
cd my-real-project
opencode
```

```
ໃຊ້ open-design tool list_projects ເບິ່ງວ່າມີ project ຫຍັງແດ່
ແລ້ວດຶງໄຟລ໌ຈາກ project <ຊື່> ມາໃສ່ໃນໂຟນເດີນີ້ ຕໍ່ດ້ວຍເພີ່ມ backend API
```

> [!warning] ຕ້ອງມີ daemon ແລ່ນຢູ່
> ກ່ອນໃຊ້ MCP `open-design` ຕ້ອງມີ daemon ຂອງ OpenDesign ແລ່ນຢູ່ — ເບິ່ງລາຍລະອຽດທີ່ [[gotchas]] ຂໍ້ 4

---

## 6. ເລືອກໂມເດວໃຫ້ເໝາະກັບວຽກ

| ສະຖານະການ | ໂມເດວທີ່ແນະນຳ |
| --- | --- |
| ວຽກຈິງ ຢາກໄດ້ຄຸນນະພາບ/privacy, ບໍ່ຮີບ | `home-llamacpp/qwen3.8-27b` (self-hosted) |
| ລອງໄອເດຍໄວໆ, smoke test | `opencode/deepseek-v4-flash-free` (built-in) |

```bash
opencode run -m opencode/deepseek-v4-flash-free "..."
```

---

## 7. ບັນຫາທີ່ພົບເລື້ອຍ

ເບິ່ງລາຍການເຕັມທີ່ [[gotchas]] — ສະຫຼຸບຫຍໍ້:

- **ເຄື່ອງມືພາຍນອກຕໍ່ opencode ແລ້ວ timeout** → ກວດວ່າ default model ຊ້າໄປບໍ່ (ຂໍ້ 1)
- **ຕັ້ງ env var/PATH ໃໝ່ແລ້ວຍັງບໍ່ເຫັນຜົນ** → restart ແອັບທີ່ກ່ຽວຂ້ອງແບບເຕັມຮູບແບບ (ຂໍ້ 2)
- **MCP `open-design` connected ແຕ່ເອີ້ນ tool ບໍ່ໄດ້** → ກວດ daemon (ຂໍ້ 4)
- **ຄຳສັ່ງດຽວກັນໄດ້ຜົນບໍ່ຕົງກັນລະຫວ່າງ terminal** → ທົດສອບຜ່ານ PowerShell ແທນ Git Bash (ຂໍ້ 5)
- **MCP `sonarqube` ຂຶ້ນ connected ແຕ່ 401/403** → ກວດ token ວ່າເປັນ "User Token" ບໍ່ (ເບິ່ງ [[mcp-servers]])
- **`trivy` ຂຶ້ນ `command not found`** → restart terminal (ເບິ່ງ [[mcp-servers]])
