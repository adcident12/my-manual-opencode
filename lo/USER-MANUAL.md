---
tags: [user-manual, getting-started, opencode, vibe-coding]
updated: 2026-10-03
summary: ຄູ່ມືການໃຊ້ງານ OpenCode ຕັ້ງແຕ່ຕົ້ນຈົນຈົບ (ເປີດ session, ສັ່ງວຽກ, ອະນຸມັດ, ກວດຜົນ, commit) ແລະປະຈຳວັນ — vibe coding, graft workflow, grill-me/grilling ແລະ OpenDesign workflow
---

# 📘 ຄູ່ມືການໃຊ້ງານ OpenCode ສຳລັບ Vibe Coding

> ຕັ້ງຄ່າຄົບແລ້ວເບິ່ງ [[setup]] · ລາຍລະອຽດ MCP/Plugin ເບິ່ງ [[mcp-servers]] ແລະ [[plugins]] · ບັນຫາທີ່ພົບເລື້ອຍເບິ່ງ [[gotchas]] · ອັບເດດ/ອັບເກຣດເບິ່ງ [[updating]]

---

## 📋 ສາລະບານ

- **⭐ ເລີ່ມໃຊ້ງານຕັ້ງແຕ່ຕົ້ນຈົນຈົບ** — ອ່ານສ່ວນນີ້ກ່ອນ: ຕ້ອງເຮັດຫຍັງເທື່ອດຽວ ແລະທຸກເທື່ອທີ່ມີວຽກຕ້ອງເລີ່ມ ລົມ ອະນຸມັດ ກວດ ແລະຈົບວຽກແນວໃດ
- ພາບລວມ — architecture ຂອງ setup ນີ້ + workflow cycle ລະດັບ project ແລະ agent
- ເລີ່ມວຽກໃນ project ໃໝ່ — checklist 6 ຂັ້ນຕອນ ພ້ອມຈຸດກວດສອບທຸກຂັ້ນ
- Vibe coding ທົ່ວໄປກັບ opencode — ລວມຕົວຢ່າງເຕັມ 1 ຮອບການເຮັດວຽກຈິງ (ຈາກຄຳສັ່ງເຖິງ commit) ແລະວິທີໃຊ້ grill-me/grilling
- ໃຊ້ graft ໃຫ້ເຂົ້າໃຈໂຄ້ດໄວຂຶ້ນ — ພ້ອມຕົວຢ່າງ output ຈິງທີ່ຕ້ອງພົບ
- ສ້າງເວັບໄຊທ໌ດ້ວຍ OpenDesign (ແລ້ວດຶງມາຕໍ່ໃນ opencode)
- ເລືອກໂມເດວໃຫ້ເໝາະກັບວຽກ
- ບັນຫາທີ່ພົບເລື້ອຍ

> [!tip] ມືໃໝ່ເລີ່ມອ່ານຕາມລຳດັບນີ້
> **⭐ ເລີ່ມໃຊ້ງານຕັ້ງແຕ່ຕົ້ນຈົນຈົບ** (ຂ້າງລຸ່ມນີ້ — ຮູ້ວ່າຕ້ອງເຮັດຫຍັງເມື່ອໃດ) → ຫົວຂໍ້ 2 (ເຮັດຕາມ checklist ຈິງໃນ project ທຳອິດ) → ຫົວຂໍ້ 3 (ລອງສັ່ງວຽກຈິງຕາມຕົວຢ່າງ) — ຫົວຂໍ້ 1 ແລະ 4-7 ເປັນແບບອ້າງອິງ ເປີດເບິ່ງຕອນຕ້ອງໃຊ້

---

## ⭐ ເລີ່ມໃຊ້ງານຕັ້ງແຕ່ຕົ້ນຈົນຈົບ

ຕິດຕັ້ງຕາມ [[setup]] ຄົບແລ້ວ — ສ່ວນນີ້ຕອບຄຳຖາມດຽວ: **ນັ່ງລົງໜ້າເຄື່ອງແລ້ວຕ້ອງເຮັດຫຍັງ ຕາມລຳດັບໃດ ຈົນວຽກແລ້ວ** ມີສາມລະດັບ ເຮັດເລື້ອຍບໍ່ເທົ່າກັນ:

| ເຮັດເມື່ອໃດ | ເຮັດຫຍັງ | ໃຊ້ເວລາ |
| --- | --- | --- |
| **ກ. ເທື່ອດຽວຕໍ່ເຄື່ອງ** | ກວດວ່າ setup ພ້ອມໃຊ້ | ~2 ນາທີ |
| **ຂ. ເທື່ອດຽວຕໍ່ project** | ສ້າງ graft index + AGENTS.md ຂອງ project | ~5 ນາທີ (ຫົວຂໍ້ 2) |
| **ຄ. ທຸກເທື່ອທີ່ມີວຽກ** | ວົງຈອນ 7 ຂັ້ນ: ເປີດ → ສັ່ງ → ອະນຸມັດ → agent ເຮັດ → ກວດ → commit → ປິດ | ຕາມຂະໜາດວຽກ |

```mermaid
graph TD
    S["ຕິດຕັ້ງແລ້ວ (setup)"] --> A["ກ. ກວດເຄື່ອງ<br/>ເທື່ອດຽວ"]
    A --> B["ຂ. ກຽມ project<br/>ເທື່ອດຽວຕໍ່ repo (ຫົວຂໍ້ 2)"]
    B --> C1["1. ເປີດ session<br/>opencode / opencode -c"]
    C1 --> C2["2. ສັ່ງວຽກເປັນພາສາຄົນ"]
    C2 --> K{"ວຽກແບບໃດ?"}
    K -->|ຖາມ / ແກ້ນ້ອຍ| C4
    K -->|feature ໃໝ່ / bug / ວຽກໃຫຍ່| C3["3. ຕອບຄຳຖາມ + ອະນຸມັດການອອກແບບ<br/>(agent ຍັງບໍ່ຂຽນ code)"]
    C3 --> C4["4. agent ລົງມື<br/>ແກ້ code → test → ກວດໃນ browser"]
    C4 --> C5{"5. ທ່ານກວດຜົນ<br/>ບົດສະຫຼຸບ + git diff"}
    C5 -->|ຍັງບໍ່ແມ່ນ| C2
    C5 -->|ຜ່ານ| C6["6. commit<br/>(agent ບໍ່ commit ເອງ)"]
    C6 --> C7["7. ປິດວຽກ<br/>/new ສຳລັບວຽກຕໍ່ໄປ"]
    C7 -->|ວຽກຕໍ່ໄປ| C2
```

### ກ. ເທື່ອດຽວຕໍ່ເຄື່ອງ — ກວດວ່າ setup ພ້ອມ

ເປີດ terminal **ໃໝ່** (env var ທີ່ຫາກໍຕັ້ງຈະຍັງບໍ່ມີຜົນໃນ terminal ເດີມ — [[gotchas]] ຂໍ້ 2) ແລ້ວແລ່ນ:

```bash
opencode --version       # ຕິດຕັ້ງ CLI ແລ້ວ
opencode mcp list        # MCP ທີ່ເປີດໃຊ້ຕ້ອງຂຶ້ນ connected
opencode debug skill     # skill ທີ່ໂຫຼດໄດ້
opencode run "say hi"    # ໂມເດວຕອບກັບໄດ້
```

✅ **ຕ້ອງເຫັນ:**
- `mcp list`: `context7`, `chrome-devtools`, `graft`, `memory`, `sonarqube`, `trivy` ຂຶ້ນ `connected` · `open-design`, `playwright`, `github`, `postgres`, `mysql` ຂຶ້ນ `disabled` (ປົກກະຕິ — ເປີດຕໍ່ project)
- `debug skill`: 27 ໂຕ — superpowers 15, ponytail 6, caveman 3, `grill-me`, `grilling`, `customize-opencode` ຖ້າເຫັນຫຼາຍກວ່ານີ້ຫຼາຍ ໝາຍຄວາມວ່າ skill ຂອງເຄື່ອງມືອື່ນປົນເຂົ້າມາ ([[gotchas]] ຂໍ້ 15)
- `run "say hi"`: ໄດ້ຄຳຕອບກັບ ຖ້າຊ້າເກີນ 1–2 ນາທີເບິ່ງ [[gotchas]] ຂໍ້ 1

### ຂ. ເທື່ອດຽວຕໍ່ project — ກຽມ repo

ເຮັດຕາມ **ຫົວຂໍ້ 2** (6 ຂັ້ນ): `graft build` → `graft init --agents agents --no-global` → ເປີດ MCP ສະເພາະ project ຖ້າຕ້ອງໃຊ້ (ຖານຂໍ້ມູນ, `open-design`, `playwright`) → ລອງຖາມຄຳຖາມທີ່ຕ້ອງອ້າງ code ແທ້ ເຮັດແລ້ວບໍ່ຕ້ອງເຮັດຊ້ຳອີກສຳລັບ repo ນັ້ນ

### ຄ. ທຸກເທື່ອທີ່ມີວຽກ — ວົງຈອນ 7 ຂັ້ນ

**ຂັ້ນ 1 — ເປີດ session**

```bash
cd my-project
git status          # ຄວນສະອາດ ຫຼືຢູ່ເທິງ branch ຂອງວຽກນີ້ — ຈະໄດ້ເຫັນຊັດວ່າ agent ແກ້ຫຍັງ
opencode            # session ໃໝ່
opencode -c         # ຫຼື: ເຮັດວຽກເດີມຕໍ່ຈາກ session ຫຼ້າສຸດ
```

ໃນ TUI: `/sessions` ເລືອກ session ເກົ່າ · `/new` ເລີ່ມ session ໃໝ່ · `/models` ປ່ຽນໂມເດວ · `/help` ເບິ່ງຄຳສັ່ງທັງໝົດ

> [!tip] ໜຶ່ງວຽກ = ໜຶ່ງ session
> prompt ພື້ນຖານໜັກ ~34k tokens ຈາກ context 131k ([[tuning]]) — ວຽກໃໝ່ໃຫ້ `/new` ສະເໝີ session ທີ່ຍາວຂ້າມຫຼາຍວຽກຈະ compact ເລື້ອຍ ແລະ agent ຕ້ອງອ່ານໄຟລ໌ເດີມຊ້ຳ

**ຂັ້ນ 2 — ສັ່ງວຽກເປັນພາສາຄົນ**

ບອກ**ຜົນລັບທີ່ຢາກໄດ້** ບໍ່ຕ້ອງບອກວິທີເຮັດ ແລະບໍ່ຕ້ອງສັ່ງໃຫ້ໃຊ້ tool ໂຕໃດ — agent ເລືອກເສັ້ນທາງເອງຈາກຊະນິດຂອງຄຳຂໍ:

| ທ່ານພິມປະມານນີ້ | agent ຈະເຮັດ | ທ່ານຕ້ອງເຮັດ |
| --- | --- | --- |
| `ລະບົບເກັບແຫວນເຮັດວຽກແນວໃດ` (ຖາມ/ໃຫ້ອະທິບາຍ) | ຫາ code ດ້ວຍ graft ແລ້ວຕອບໂດຍອ້າງ `file:line` | ອ່ານ — ຈົບທີ່ຂັ້ນນີ້ |
| `ແກ້ຄຳຜິດໃນໜ້າ menu` (ແກ້ນ້ອຍ) | ແກ້ເລີຍ → ແລ່ນ test | ຂ້າມໄປຂັ້ນ 5 |
| `ຊ່ວຍເພີ່ມລະບົບ pause ໃຫ້ເກມ` (feature ໃໝ່) | ເອີ້ນ `brainstorming` → ສຳຫຼວດດ້ວຍ graft → ຖາມຄຳຖາມຫຼືສະເໜີການອອກແບບ → **ຢຸດລໍ** | ໄປຂັ້ນ 3 |
| `ກົດໂດດແລ້ວເກມຄ້າງ` (bug) | ເອີ້ນ `systematic-debugging` — ຫາສາເຫດໃຫ້ໄດ້ກ່ອນແກ້ | ຢືນຢັນສາເຫດ ແລ້ວໃຫ້ແກ້ |
| `ຍ້າຍລະບົບດ່ານເປັນແບບ zone` (ວຽກໃຫຍ່ຫຼາຍໄຟລ໌) | ຂຽນ spec ທີ່ `docs/superpowers/specs/` + ແຜນ (`writing-plans`) | ອ່ານ spec ແລ້ວອະນຸມັດ |
| `grill me about <ໄອເດຍ>` (ຍັງບໍ່ເຮັດ ພຽງຢາກຄິດໃຫ້ຕົກ) | ຖາມເປັນຮອບແບບ `grilling` ບໍ່ມີ spec ບໍ່ຂຽນ code | ຕອບຄຳຖາມ |

**ຂັ້ນ 3 — ຕອບຄຳຖາມ ແລະອະນຸມັດການອອກແບບ** (ສະເພາະ feature ໃໝ່/ວຽກໃຫຍ່)

agent ຈະ**ບໍ່ຂຽນ code** ຈົນກວ່າຈະຜ່ານຂັ້ນນີ້ ມັນຈະມາໃນສອງຮູບແບບ:

- **ຄຳຖາມເປັນຊຸດ** (`❓ Q1 … ➡️ ຄຳແນະນຳ`) — ຕອບສັ້ນໆເປັນຕົວເລືອກ ເຊັ່ນ `A B A` ຫຼື `ຕາມແນະນຳທັງໝົດ`
- **ການອອກແບບດຽວພ້ອມຄຳຖາມ "Approve?"** (ວຽກແຄບພໍ) — ຕອບ `go ahead` ຫຼືບອກສິ່ງທີ່ຢາກປ່ຽນ ເຊັ່ນ `ບໍ່ຕ້ອງມີປຸ່ມ touch`

ອ່ານການອອກແບບຕອນນີ້ໃຫ້ດີ — ເປັນຈຸດທີ່ແກ້ທິດທາງໄດ້ຖືກທີ່ສຸດ ກ່ອນທີ່ໂມເດວຈະໃຊ້ເວລາຫຼາຍນາທີລົງມືເຮັດ

**ຂັ້ນ 4 — agent ລົງມື** (ທ່ານພຽງລໍ)

ລຳດັບທີ່ເກີດຂຶ້ນ: ponytail ກວດວ່າມີຂອງເດີມໃຫ້ໃຊ້ກ່ອນຂຽນໃໝ່ → ແກ້ code ພ້ອມ todo list → ແລ່ນ test → **ຖ້າເປັນວຽກທີ່ເຫັນໃນ browser ຈະເປີດ Chrome ຜ່ານ chrome-devtools ກວດໜຶ່ງຮອບ** (ກົດໃນ global AGENTS.md — [[tuning]]) → ສະຫຼຸບຜົນ

- ກົດ `Esc` ເພື່ອຢຸດກາງທາງ · `/undo` ຍ້ອນຂໍ້ຄວາມຫຼ້າສຸດພ້ອມການແກ້ໄຟລ໌ຂອງຂໍ້ຄວາມນັ້ນ (project ຕ້ອງເປັນ git repo) · `/redo` ເຮັດຊ້ຳ
- **ຂັ້ນກວດໃນ browser ໃຊ້ເວລາດົນທີ່ສຸດ** — ວັດໄດ້ ~30–36 ນາທີສຳລັບ feature ນ້ອຍເທິງໂມເດວ local ແຕ່ເປັນຂັ້ນທີ່ພົບ bug ທີ່ test ບໍ່ຄອບຄຸມ ([[tuning]] ຂໍ້ 4 ແລະ 8) ຖ້າວຽກບໍ່ກ່ຽວກັບ UI ຂັ້ນນີ້ຈະຖືກຂ້າມ
- ຖ້າ agent ຢຸດງຽບກາງທາງໂດຍບໍ່ສະຫຼຸບ ມັກເປັນເພາະໂມເດວຊົນເພດານ output ([[gotchas]] ຂໍ້ 8) — ພິມ `continue`

**ຂັ້ນ 5 — ກວດຜົນກ່ອນຮັບວຽກ**

ອ່ານບົດສະຫຼຸບທ້າຍຂອງ agent — ຄວນບອກ: ແກ້ໄຟລ໌ໃດ, ຜົນ test, ຜົນກວດໃນ browser ແລະສິ່ງທີ່**ຕັ້ງໃຈບໍ່ເຮັດ** ຈາກນັ້ນເບິ່ງຂອງແທ້:

```bash
git diff            # ຕົງກັບທີ່ສະຫຼຸບບໍ ມີໄຟລ໌ທີ່ບໍ່ຄວນຖືກແຕະຫຼືບໍ່
```

ຢາກໄດ້ຄວາມເຫັນທີສອງ ສັ່ງໃນ session ເດີມ:

| ຄຳສັ່ງ | ໄດ້ຫຍັງ |
| --- | --- |
| `/caveman-review` | ຣີວິວ diff ແບບໜຶ່ງແຖວຕໍ່ປະເດັນ ພ້ອມລະດັບຄວາມຮ້າຍແຮງ |
| `/ponytail-review` | ຫາ code ທີ່ເກີນຈຳເປັນໃນ diff |
| `scan project ນີ້ດ້ວຍ sonarqube ແລະ trivy` | ກວດຄຸນນະພາບ/ຊ່ອງໂຫວ່ — ໃຊ້ກັບວຽກທີ່ແຕະ dependency, auth ຫຼືຂໍ້ມູນ (agent **ບໍ່**ແລ່ນເອງທຸກວຽກ) |

ຍັງບໍ່ແມ່ນ → ບອກສິ່ງທີ່ຕ້ອງແກ້ໃນ session ເດີມ (ກັບໄປຂັ້ນ 2)

**ຂັ້ນ 6 — commit**

agent **ບໍ່ commit ເອງ** (ທົດສອບແລ້ວ — ວຽກຈົບໂດຍປະໄຟລ໌ໄວ້ໃນ working tree) ເລືອກທາງໃດທາງໜຶ່ງ:

```bash
git add -A
```

```
/caveman-commit          ← ໄດ້ຂໍ້ຄວາມ commit ແບບ Conventional Commits (ບໍ່ໄດ້ແລ່ນ git commit ໃຫ້)
commit ໃຫ້ແດ່              ← ຫຼືສັ່ງໃຫ້ agent commit ເອງ ແລ້ວກວດຂໍ້ຄວາມ
```

push ເອງເມື່ອພ້ອມ — ບໍ່ມີ CI ແລ່ນອັດຕະໂນມັດໃນ setup ນີ້ ([[sdlc]])

**ຂັ້ນ 7 — ປິດວຽກ**

- ວຽກຕໍ່ໄປ → `/new` (ຫຼື `/exit` ແລ້ວເປີດໃໝ່)
- ມີຄວາມມັກ/ຂໍ້ຕັດສິນໃຈທີ່ຢາກໃຫ້ຈື່ຂ້າມ session → ພິມ `ຈື່ໄວ້ວ່າ <ເລື່ອງ>` — agent ບັນທຶກລົງ memory ແລະ session ໜ້າຈະຄົ້ນກ່ອນຖາມຊ້ຳ
- session ຍາວຈົນ context ໃກ້ເຕັມແຕ່ວຽກຍັງບໍ່ຈົບ → `/compact`
- ບໍ່ຕ້ອງ rebuild graft ເອງ — CLI refresh graph ກ່ອນຕອບທຸກເທື່ອ

### ຄຳສັ່ງທີ່ໃຊ້ເລື້ອຍ

| ຕ້ອງການ | ພິມ |
| --- | --- |
| ເປີດ session ໃໝ່ / ຕໍ່ session ຫຼ້າສຸດ | `opencode` / `opencode -c` |
| ເລີ່ມວຽກໃໝ່ໃນ TUI ເດີມ | `/new` |
| ກັບໄປ session ເກົ່າ | `/sessions` |
| ຢຸດ agent / ຍ້ອນຂໍ້ຄວາມຫຼ້າສຸດ | `Esc` / `/undo` |
| ຫຍໍ້ context ຂອງ session ຍາວ | `/compact` |
| ໃຫ້ຕອບແບບເຕັມ ບໍ່ຫຍໍ້ / ກັບມາຕອບສັ້ນ | `/caveman off` (ຫຼື `normal mode`) / `/caveman` |
| ຂໍ້ຄວາມ commit / ຣີວິວ diff | `/caveman-commit` / `/caveman-review` |
| ຫຼຸດ/ເພີ່ມຄວາມເຂັ້ມຂອງ ponytail | `/ponytail lite\|full\|ultra\|off` |
| ຄິດໄອເດຍໃຫ້ຕົກກ່ອນ ຍັງບໍ່ເຮັດ | `grill me about <ເລື່ອງ>` |
| ສັ່ງແບບບໍ່ເປີດ TUI | `opencode run "<ຄຳສັ່ງ>"` ແລ້ວຕໍ່ດ້ວຍ `opencode run -c "<ຄຳຕອບ>"` |

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
    B -->|plugin| M["caveman - terse output<br/>(ເປີດເອງ, /caveman off ເພື່ອປິດ)"]
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

> [!note] Plugin caveman — ບໍ່ຢູ່ໃນ cycle ຕໍ່ turn ຂ້າງເທິງ (ຕັ້ງໃຈ)
> caveman (ເບິ່ງ [[plugins]]) ປ່ຽນພຽງ**style ການຕອບ**ໃຫ້ສັ້ນແລະກົງປະເດັນ ບໍ່ແຕະ tool orchestration ຈຶ່ງບໍ່ເປັນ node ໃນແຜນພາບ — ເປີດເອງທຸກ session (ຕ່າງຈາກ i-have-adhd ທີ່ມັນມາແທນ ຊຶ່ງຕ້ອງພິມເປີດເອງ) ປິດດ້ວຍ `/caveman off` ຫຼື `normal mode` ເມື່ອຢາກໄດ້ຄຳອະທິບາຍເຕັມ code, ຄຳສັ່ງ ແລະຂໍ້ຄວາມ error ຍັງຂຽນເຕັມສະເໝີ

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

✅ **ຕ້ອງເຫັນ:** ແຖວ `graft` ສະຖານະ `connected` ຖ້າບໍ່ຂຶ້ນ ໃຫ້ກວດ [[gotchas]] ກ່ອນ — ແຖວ `open-design` ແລະ `playwright` ຂຶ້ນ `disabled` ເປັນເລື່ອງປົກກະຕິ (ປິດໄວ້ເປັນຄ່າເລີ່ມຕົ້ນເພື່ອຫຼຸດຂະໜາດ prompt ເປີດສະເພາະ project ທີ່ຕ້ອງໃຊ້ໃນຂັ້ນ 4 — ເບິ່ງ [[tuning]])

```bash
graft map
```

✅ **ຕ້ອງເຫັນ:** ສະຫຼຸບ `repo map — N files · N symbols · N edges · <ພາສາຫຼັກ>`

**ຂັ້ນ 4 — (ສະເພາະກໍລະນີຕ້ອງໃຊ້) ເປີດ MCP ສະເພາະ project**

```jsonc
// my-new-project/opencode.jsonc
{ "mcp": { "postgres": { "enabled": true } } }
```

ໃຊ້ວິທີດຽວກັນກັບ MCP ທີ່ປິດໄວ້ເປັນຄ່າເລີ່ມຕົ້ນໂຕອື່ນ — `open-design` (ເມື່ອຈະດຶງວຽກຈາກ OpenDesign, ຂໍ້ 5) ແລະ `playwright` (ຖ້າຢາກໃຊ້ແທນ/ຄູ່ກັບ chrome-devtools):

```jsonc
{ "mcp": { "open-design": { "enabled": true }, "playwright": { "enabled": true } } }
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

✅ **ຕ້ອງເຫັນ:** skill ຈາກ `superpowers` 15 ໂຕ, skill ຂອງ `ponytail` 6 ໂຕ, `caveman`/`caveman-commit`/`caveman-review`, ແລະ `grill-me`/`grilling` ຖ້າຕິດຕັ້ງໄວ້ — ລວມ 27 ໂຕກັບ `customize-opencode` ທີ່ມາກັບ OpenCode

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
8. **ແລ່ນ test + ກວດໃນ browser** (ຜ່ານ chrome-devtools MCP ຖ້າເປັນວຽກທີ່ເຫັນໃນ browser — ກົດ "Verifying UI changes" ໃນ global AGENTS.md)
9. **commit** ເປັນ scoped commit ດຽວ ພ້ອມຂໍ້ຄວາມສັ້ນກົງປະເດັນ — ໃນການທົດສອບຊ້ຳ agent **ບໍ່ commit ເອງ** ຕ້ອງສັ່ງ (`/caveman-commit` ໃຫ້ຂໍ້ຄວາມ ຫຼືພິມ `commit ໃຫ້ແດ່`) ເບິ່ງຂັ້ນ 6 ໃນ "ເລີ່ມໃຊ້ງານຕັ້ງແຕ່ຕົ້ນຈົນຈົບ"

> [!tip] ບໍ່ເຫັນຄົບທຸກຂັ້ນກໍປົກກະຕິ
> ຄຳສັ່ງນ້ອຍໆ (ແກ້ typo, ຖາມຄຳຖາມທົ່ວໄປ) ຈະຂ້າມຂັ້ນ 2-6 ໄປເລີຍ ເຂົ້າຂັ້ນ 7-9 ໂດຍກົງ

> [!info] ທົດສອບຊ້ຳແບບ headless (2026-10-03) — ຜົນແທ້ຕໍ່ຂັ້ນ
> ຂໍ feature ນ້ອຍ ("add a pause feature …") ໃນສຳເນົາຂອງເກມຕົວຢ່າງ: ຂັ້ນ 2 ✅ · ຂັ້ນ 3 ❌ ໃນຮອບທຳອິດ (agent ເຮັດຕາມຂັ້ນ "check files" ຂອງ brainstorming ແທນການໃຊ້ graft) → ✅ ຫຼັງເພີ່ມກົດໃນ global AGENTS.md · ຂັ້ນ 4 ຂ້າມໄປເພາະວຽກແຄບພໍຈະສະເໜີການອອກແບບດຽວແລ້ວຂໍອະນຸມັດ · ຂັ້ນ 6–7 ✅ · ຂັ້ນ 8 ✅ ເມື່ອມີກົດ "Verifying UI changes" (ຖ້າມີກົດທີ່ເນັ້ນປະຢັດ step ຢ່າງດຽວ agent ຈະຂ້າມການກວດໃນ browser — [[gotchas]] ຂໍ້ 19) · ຂັ້ນ 9 ⚠️ ບໍ່ commit ເອງ — ວິທີທົດສອບ, ຮູບຜົນ ແລະສິ່ງທີ່ຍັງຄ້າງຢູ່ທີ່ [[tuning]] ຂໍ້ 4 ແລະ 8

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

> [!important] ເປີດ `open-design` ໃຫ້ project ນີ້ກ່ອນ
> MCP `open-design` ປິດໄວ້ເປັນຄ່າເລີ່ມຕົ້ນ (ກິນ ~6.6k tokens ທຸກ turn) — ໃສ່ `{ "mcp": { "open-design": { "enabled": true } } }` ໃນ `my-real-project/opencode.json` ແລ້ວເປີດ opencode ໃໝ່ ກວດດ້ວຍ `opencode mcp list` ວ່າ `open-design` ຂຶ້ນ `connected`

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
- **MCP `open-design` connected ແຕ່ເອີ້ນ tool ບໍ່ໄດ້** → config ຕ້ອງເປັນ `["od", "mcp"]` ເສີຍໆ ບໍ່ມີ `--daemon-url` — ຕັ້ງແຕ່ OpenDesign 0.22 daemon ໃຊ້ port ສຸ່ມ ບໍ່ແມ່ນ 7456 ແລ້ວ (ຂໍ້ 4)
- **ຄຳສັ່ງດຽວກັນໄດ້ຜົນບໍ່ຕົງກັນລະຫວ່າງ terminal** → ທົດສອບຜ່ານ PowerShell ແທນ Git Bash (ຂໍ້ 5)
- **MCP `sonarqube` ຂຶ້ນ connected ແຕ່ 401/403** → ກວດ token ວ່າເປັນ "User Token" ບໍ່ (ເບິ່ງ [[mcp-servers]])
- **`trivy` ຂຶ້ນ `command not found`** → restart terminal (ເບິ່ງ [[mcp-servers]])
- **ແຕ່ລະ turn ຊ້າ / compaction ເລື້ອຍ / agent ອ່ານໄຟລ໌ເດີມຊ້ຳໆ** → ວັດຂະໜາດ prompt ແລະເບິ່ງປະຫວັດການໃຊ້ tool ດ້ວຍ script ໃນ [[tuning]] (ຂໍ້ 11 ແລະ 13)
- **agent ບໍ່ໃຊ້ graft ທັງທີ່ມີ `graft/` index** → ຕ້ອງມີກົດ "graft first, even inside a skill" ໃນ global AGENTS.md (ຂໍ້ 12)
- **`opencode debug skill` ສະແດງ skill ຂອງ Claude Code ປົນມາ** → ຕັ້ງ `OPENCODE_DISABLE_EXTERNAL_SKILLS=1` (ຂໍ້ 15)
