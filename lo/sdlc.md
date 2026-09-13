---
tags: [project-doc, sdlc, opencode, reference, overview]
updated: 2026-09-13
summary: ພາບລວມ Software Development Life Cycle (SDLC) ທັງ 7 ຂະບວນການ ອະທິບາຍສຳລັບຜູ້ອ່ານທົ່ວໄປ ພ້ອມລິ້ງໄປຫາສ່ວນທີ່ຄູ່ມື OpenCode ນີ້ implement ຈິງໃນແຕ່ລະ phase, ລະບຸຢ່າງກົງໄປກົງມາວ່າສ່ວນໃດຍັງບໍ່ຄອບຄຸມ, ແລະແນະນຳເຄື່ອງມື/MCP ທີ່ຄວນເພີ່ມເພື່ອອຸດຊ່ອງຫວ່າງແຕ່ລະ phase (ຍັງບໍ່ໄດ້ຕິດຕັ້ງຈິງ)
---

# Software Development Life Cycle (SDLC)

ພາບລວມຄູ່ມືທັງໝົດທີ່ [[index]]

**SDLC** ແມ່ນວົງຈອນມາດຕະຖານທີ່ອະທິບາຍວ່າຊອບແວອັນຫນຶ່ງເດີນທາງຈາກ "ໄອເດຍ" ໄປຈົນເຖິງ "ໃຊ້ງານຈິງແລະດູແລຕໍ່ເນື່ອງ" ຜ່ານຂະບວນການໃດແດ່ ໜ້ານີ້ອະທິບາຍແຕ່ລະ phase ແບບກາງໆ ສຳລັບຜູ້ອ່ານທົ່ວໄປກ່ອນ ແລ້ວຊີ້ບອກວ່າຄູ່ມື OpenCode ຊຸດນີ້ (ສ່ວນທີ່ເຫຼືອທັງໝົດໃນ repo) ຄອບຄຸມ phase ໃດແດ່ດ້ວຍເຄື່ອງມື/plugin ອັນໃດ — ສ່ວນໃດຍັງບໍ່ມີ implementation ຈິງກໍລະບຸກົງໆ ບໍ່ປິດບັງ

> [!info] Security ແລະ Documentation ບໍ່ແມ່ນ phase ດ່ຽວ
> ສອງເລື່ອງນີ້ຄວນເຮັດ**ຄຽງຄູ່ທຸກ phase** (ແນວຄິດ "shift-left"/DevSecOps) ບໍ່ແມ່ນຂັ້ນຕອນສຸດທ້າຍກ່ອນສົ່ງມອບ — ໜ້ານີ້ຈຶ່ງເວົ້າເຖິງ security ເປັນສ່ວນແຊກໃນແຕ່ລະ phase ທີ່ກ່ຽວຂ້ອງ ແທນທີ່ຈະແຍກເປັນຫົວຂໍ້ໂດດ

---

## 1. Planning (ວາງແຜນໂຄງການ)

ກຳນົດຂອບເຂດວຽກ, ເປົ້າໝາຍ, ຊັບພະຍາກອນ (ຄົນ/ເວລາ/ງົບ) ແລະຄວາມສ່ຽງເບື້ອງຕົ້ນ ກ່ອນເລີ່ມຂຽນໂຄ້ດແມ່ນແຕ່ແຖວດຽວ — output ທົ່ວໄປແມ່ນ project charter, timeline, risk register

> [!warning] ຍັງບໍ່ຄອບຄຸມໃນຄູ່ມືນີ້
> ບໍ່ມີເຄື່ອງມື/plugin ໃດໃນ stack ນີ້ທີ່ຊ່ວຍເລື່ອງ project planning ລະດັບນີ້ໂດຍກົງ — ເປັນ phase ທີ່ຕ້ອງເຮັດນອກ OpenCode (ເຊັ່ນ ຜ່ານ spreadsheet, Notion, ຫຼື project management tool ແຍກຕ່າງຫາກ)

---

## 2. Requirements Analysis (ວິເຄາະຄວາມຕ້ອງການ)

ເກັບກຳແລະຕົກຜະລຶກວ່າ "ລະບົບຕ້ອງເຮັດຫຍັງ" ຈາກ stakeholder — ແຍກເປັນ functional requirements (features) ກັບ non-functional (performance, security, scalability) ມັກເກັບເປັນ user story/ticket ໃນ backlog tool ເພື່ອ trace ກັບຄືນໄດ້ວ່າໂຄ້ດແຕ່ລະສ່ວນຕອບໂຈດ requirement ຂໍ້ໃດ

> [!tip] ມີບາງສ່ວນໃນຄູ່ມືນີ້ ແຕ່ປິດໄວ້
> [[mcp-servers]] (ຫົວຂໍ້ "github") ຮອງຮັບ issues/PR ໄດ້ ແຕ່ຕັ້ງ `enabled: false` ໄວ້ຈົນກວ່າຈະມີ Personal Access Token — ຕອນນີ້ຍັງບໍ່ active ຈິງ ນັບເປັນ partial coverage ເທົ່ານັ້ນ
>
> ສ່ວນການເກັບ requirement ຜ່ານການສົນທະນາ (ບໍ່ແມ່ນ backlog tool) ມີ [[plugins]] (ຫົວຂໍ້ "grill-me / grilling") ຊ່ວຍໄດ້ — ສຳພາດແບບ batch ເປັນຮອບຈົນຕົກຜະລຶກວ່າ feature ຕ້ອງເຮັດຫຍັງແດ່ ແຕ່ຈົບພຽງການສົນທະນາ ບໍ່ມີ ticket/trace ກັບຄືນໄປຫາ requirement ຄືກັບ backlog tool ຈິງ

---

## 3. Design (ອອກແບບ)

ແປ requirement ເປັນພິມເຂຍວທາງເທັກນິກ ແບ່ງເປັນ 2 ລະດັບ: **system/architecture design** (ເລືອກ stack, ອອກແບບ database schema, API contract) ກັບ **UI/UX design** (mockup, prototype, design system)

> [!tip] ມີສະເພາະຝັ່ງ UI/UX
> [[mcp-servers]] (ຫົວຂໍ້ "open-design") ພ້ອມ workflow ເຕັມທີ່ [[USER-MANUAL]] (ຫົວຂໍ້ 5, "ສ້າງເວັບໄຊທ໌ດ້ວຍ OpenDesign") ຄອບຄຸມການອອກແບບ/ສ້າງຕົ້ນແບບໜ້າເວັບໄດ້ດີ — ແຕ່ system/architecture design (schema, API contract) ຍັງບໍ່ມີເຄື່ອງມືສະເພາະ ອາໄສ `writing-plans` skill ຂອງ [[plugins]] (ຫົວຂໍ້ superpowers) ຊ່ວຍໄດ້ບາງສ່ວນໃນລະດັບ implementation plan ເທົ່ານັ້ນ ບໍ່ແມ່ນ design doc ເຕັມຮູບແບບ — ຂັ້ນຕອນກ່ອນໜ້ານັ້ນ (ເກັບ requirement/ຕັດສິນໃຈໃຫ້ຕົກຜະລຶກກ່ອນຂຽນແຜນ) ໄວຂຶ້ນໄດ້ດ້ວຍ [[plugins]] (ຫົວຂໍ້ grill-me / grilling) ເຊິ່ງຜູກຢູ່ກັບ `writing-plans`/`brainstorming` ອັນດຽວກັນ

---

## 4. Development / Implementation (ພັດທະນາ)

ຂຽນໂຄ້ດຈິງຕາມ design — ລວມ code review, coding standard ເຂົ້າໄປນຳເພື່ອຄວບຄຸມຄຸນນະພາບລະຫວ່າງທາງ ບໍ່ແມ່ນພຽງກວດພາຍຫຼັງ

> [!tip] ຈຸດແຂງທີ່ສຸດຂອງຄູ່ມືນີ້
> - [[plugins]] (superpowers) — ບັງຄັບ workflow ທີ່ດີ (brainstorming, systematic-debugging, executing-plans, subagent-driven-development ຯລຯ)
> - [[plugins]] (grill-me / grilling) — ເສີມ `brainstorming` ດ້ວຍການຖາມຄຳຖາມຊີ້ແຈງເປັນ batch (ໄວກວ່າຖາມເທື່ອລະຂໍ້ ສຳຄັນກັບ local model ທີ່ແຕ່ລະ turn ຊ້າ) ຫຼືໃຊ້ດ່ຽວໆ ສຳພາດໄອເດຍແບບບໍ່ implement
> - [[plugins]] (graft-deep) + [[mcp-servers]] (graft) — inject context ທີ່ກ່ຽວຂ້ອງໃຫ້ອັດຕະໂນມັດ (auto-rebuild code graph ເປັນຂອງ graft CLI ເອງແລ້ວ ບໍ່ຕ້ອງເພິ່ງ plugin ນີ້ອີກ)
> - [[plugins]] (ponytail) — ຄວບຄຸມບໍ່ໃຫ້ agent ຂຽນໂຄ້ດເກີນຈຳເປັນ
> - [[plugins]] (i-have-adhd) — ຄວບຄຸມຮູບແບບການຕອບໃຫ້ກົງປະເດັນ (opt-in)
>
> **Code review** ກໍຢູ່ໃນ phase ນີ້: superpowers ມີ skill `receiving-code-review`/`requesting-code-review` ໃນຕົວ

---

## 5. Testing (ທົດສອບ)

ຢືນຢັນວ່າໂຄ້ດຖືກຕ້ອງແລະບໍ່ມີ regression — ແບ່ງເປັນຊັ້ນຕາມ test pyramid: **unit test** (ໄວ ຄອບຄຸມຫຼາຍ) → **integration test** (ກວດການເຊື່ອມຕໍ່ລະຫວ່າງ component/service) → **E2E/UI test** (ຈຳລອງ user ຈິງ) → **security testing** (SAST/dependency/secret scan)

> [!tip] ຄອບຄຸມບາງຊັ້ນ
> - E2E/UI: [[mcp-servers]] (playwright) + [[mcp-servers]] (chrome-devtools) (ເນັ້ນ debug — console log, network, performance trace)
> - Workflow guidance: `test-driven-development` skill ໃນ [[plugins]] (superpowers)
> - Security testing: [[mcp-servers]] (sonarqube) (code quality/SAST) + [[mcp-servers]] (trivy) (vulnerability/secret/misconfig scan)
>
> ທີ່ຍັງຂາດ: **unit/integration test runner** ຂອງແທ້ (ເຊັ່ນ pytest, vitest) — ຄູ່ມືນີ້ຍັງບໍ່ມີ MCP/plugin ສະເພາະສຳລັບຊັ້ນນີ້ ອາໄສ agent ຂຽນ test file ໂດຍກົງຕາມ convention ຂອງແຕ່ລະ project ເອງ

---

## 6. Deployment (ສົ່ງມອບ/ຂຶ້ນລະບົບຈິງ)

ນຳໂຄ້ດທີ່ຜ່ານ test ໄປແລ່ນເທິງ production — ໂດຍທົ່ວໄປເຮັດຜ່ານ **CI/CD pipeline** ອັດຕະໂນມັດ (build → test → deploy) ແທນການ deploy ດ້ວຍມື ເພື່ອຫຼຸດຄວາມຜິດພາດແລະເຮັດຊ້ຳໄດ້

> [!warning] ຍັງບໍ່ຄອບຄຸມໃນຄູ່ມືນີ້
> ໃນ [[USER-MANUAL]] (ຫົວຂໍ້ 1, "ພາບລວມ") ມີ node "Deploy" ຕໍ່ຈາກ quality gate ແຕ່ເປັນພຽງ label — ບໍ່ມີ CI/CD pipeline, build automation, ຫຼື hosting/infra ໃດໆ ຖືກບັນທຶກໄວ້ໃນຄູ່ມືນີ້ເລີຍ ເປັນຊ່ອງຫວ່າງໃຫຍ່ສຸດຂອງທັງ SDLC ໃນຕອນນີ້

---

## 7. Maintenance (ດູແລຫຼັງສົ່ງມອບ)

ເມື່ອລະບົບ live ແລ້ວ ຕ້ອງມີ **monitoring/observability** (log, metric, alert) ຄອຍເຝົ້າເບິ່ງວ່າລະບົບຍັງເຮັດວຽກປົກກະຕິບໍ່, ແກ້ bug ທີ່ພົບພາຍຫຼັງ, ແລະວົນ feedback ກັບຄືນເປັນ requirement ຮອບໃໝ່ (ປິດ loop ກັບຄືນໄປ phase 1-2)

> [!tip] ມີສະເພາະ maintenance ຂອງ "ເຄື່ອງມື dev" ບໍ່ແມ່ນຂອງແອັບ
> [[updating]] ຄອບຄຸມການອັບເດດ OpenCode CLI/MCP/plugin ເອງຢ່າງລະອຽດຫຼາຍ — ແຕ່ນັ້ນຄືການດູແລ**ເຄື່ອງມືທີ່ໃຊ້ພັດທະນາ** ບໍ່ແມ່ນ monitoring/observability ຂອງ**ແອັບທີ່ deploy ໄປແລ້ວ** (log, metric, alert ຂອງ production) ເຊິ່ງຍັງບໍ່ມີຫຍັງຮອງຮັບເລີຍ

---

## ສະຫຼຸບພາບລວມ

| Phase | ສະຖານະ | ອ້າງອິງໃນຄູ່ມືນີ້ |
| --- | --- | --- |
| 1. Planning | ❌ ບໍ່ມີ | — |
| 2. Requirements Analysis | ⚠️ ບາງສ່ວນ (ປິດຢູ່) | [[mcp-servers]] (github MCP) |
| 3. Design | ⚠️ ສະເພາະ UI/UX | [[mcp-servers]] (open-design), [[USER-MANUAL]] §5 |
| 4. Development | ✅ ຄົບສຸດ | [[plugins]], [[mcp-servers]] (graft) |
| — Code Review (ໃນ Dev) | ✅ ມີ | [[plugins]] (superpowers) |
| 5. Testing | ⚠️ ບາງຊັ້ນ | [[mcp-servers]] (playwright), [[mcp-servers]] (chrome-devtools) |
| — Security testing (ໃນ Testing) | ✅ ມີ | [[mcp-servers]] (sonarqube), [[mcp-servers]] (trivy) |
| 6. Deployment (CI/CD) | ❌ ບໍ່ມີ | — |
| 7. Maintenance (production) | ❌ ບໍ່ມີ (ມີແຕ່ tooling) | [[updating]] (tooling ເທົ່ານັ້ນ) |

**ສະຫຼຸບສັ້ນ:** ຄູ່ມືນີ້ຄອບຄຸມກາງວົງຈອນ (Design ຝັ່ງ UI, Development, Testing ບາງຊັ້ນ) ໄດ້ແໜ້ນຫຼາຍ ແຕ່ຫົວ-ທ້າຍຂອງວົງຈອນ (Planning, Requirements, CI/CD Deployment, Production Monitoring) ຍັງເປັນຊ່ອງຫວ່າງທີ່ຕ້ອງເພິ່ງເຄື່ອງມື/ຂະບວນການນອກຄູ່ມືນີ້ທັງໝົດ

---

## 🧰 ເຄື່ອງມືແນະນຳເພີ່ມເຕີມ (ຍັງບໍ່ໄດ້ຕິດຕັ້ງ)

> [!warning] ຫົວຂໍ້ນີ້ເປັນຂໍ້ສະເໜີແນະ ບໍ່ແມ່ນສິ່ງທີ່ຕັ້ງຄ່າໄວ້ແລ້ວ
> ທຸກ config/MCP ໃນຫົວຂໍ້ນີ້**ຍັງບໍ່ໄດ້ເພີ່ມເຂົ້າ `opencode.jsonc` ຈິງ** — ຂຽນໄວ້ເປັນທາງເລືອກໃຫ້ພິຈາລະນາ/ຄັດລອກໄປໃຊ້ເມື່ອພ້ອມ ຕ່າງຈາກເນື້ອຫາໃນຫົວຂໍ້ 1-7 ຂ້າງເທິງທີ່ເປັນສິ່ງທີ່ verify ແລ້ວວ່າໃຊ້ງານໄດ້ຈິງເທິງເຄື່ອງນີ້

ເກນເລືອກເຄື່ອງມືໃນຫົວຂໍ້ນີ້: (1) **ມີ MCP ໃຫ້ agent ເອີ້ນໃຊ້ໂດຍກົງໄດ້** ຖ້າມີ ເພື່ອໃຫ້ agent ຊ່ວຍວຽກໃນ phase ນັ້ນໄດ້ເຕັມທີ່ ບໍ່ແມ່ນພຽງມະນຸດໃຊ້ເອງ (2) ເຂົ້າກັບ pattern ທີ່ຄູ່ມືນີ້ໃຊ້ຢູ່ແລ້ວ (self-hosted ຜ່ານ Docker ຄື sonarqube, MCP ແບບ remote/local ຄືທີ່ມີຢູ່)

### Planning

ບໍ່ມີ MCP ທີ່ຈຳເປັນຢູ່ນີ້ — ເປັນ phase ທີ່ຄວນຢູ່ໃນມືມະນຸດເປັນຫຼັກ ແນະນຳ **GitHub Projects** (ຟຣີ ຜູກກັບ repo ທີ່ມີຢູ່ແລ້ວ ບໍ່ຕ້ອງເພີ່ມ service ໃໝ່) ເປັນທາງເລືອກທຳອິດກ່ອນໄປຫາເຄື່ອງມືໜັກກວ່າຄື Linear/Jira

### Requirements Analysis

**ທາງເລືອກທີ 1 (ແນະນຳ, ເຮັດໄດ້ເລີຍ):** ເປີດ `github` MCP ທີ່ມີຢູ່ໃນ `opencode.jsonc` ແລ້ວ (ຕອນນີ້ `enabled: false`) — ພຽງສ້າງ PAT ແລ້ວເປີດ flag ລາຍລະອຽດທີ່ [[mcp-servers]]

**ທາງເລືອກທີ 2 (ຖ້າຢາກໃຊ້ Linear ແທນ GitHub Issues):** Linear ມີ MCP server ທາງການ ເປັນ remote MCP ຄື context7 — ເພີ່ມແບບນີ້ໃນ `opencode.jsonc`:

```jsonc
{
  "mcp": {
    "linear": { "type": "remote", "url": "https://mcp.linear.app/mcp" }
  }
}
```

ຮອງຮັບທັງ read-only mode (`https://mcp.linear.app/mcp/readonly` — ປອດໄພກວ່າຖ້າຢາກໃຫ້ agent ອ່ານໄດ້ຢ່າງດຽວ) ແລະ OAuth/API key authentication

### Design (System/Architecture)

ບໍ່ມີ tool/MCP ສະເພາະທີ່ຈຳເປັນ — ໃຊ້ convention ທີ່ເບົາທີ່ສຸດຄື **ADR (Architecture Decision Record)**: ເກັບເປັນໄຟລ໌ markdown ທຳມະດາທີ່ `docs/adr/NNNN-ຫົວຂໍ້.md` ຕໍ່ project ທຸກຄັ້ງທີ່ຕັດສິນໃຈສະຖາປັດຕະຍະກຳສຳຄັນ (ເລືອກ database, ປ່ຽນ pattern ຫຼັກ ຯລຯ) ໃຫ້ agent ຂຽນສະຫຼຸບໄວ້ — ຄັ້ງຕໍ່ໄປ agent ຈະອ່ານຂອງເກົ່າໃນ `docs/adr/` ກ່ອນສະເໜີຂອງໃໝ່ໄດ້ເອງ (ຄ້າຍກັບທີ່ [[plugins]] (graft-deep) ເຮັດກັບໂຄ້ດ ແຕ່ເປັນລະດັບ decision ບໍ່ແມ່ນລະດັບ code)

> [!tip] Diagram ໃຊ້ mermaid ຕໍ່ໄດ້ເລີຍ ບໍ່ຕ້ອງຫາ tool ໃໝ່
> ຄູ່ມືນີ້ໃຊ້ mermaid inline ໃນ markdown ຢູ່ແລ້ວ (ເບິ່ງ [[USER-MANUAL]]) — ຂຽນ architecture diagram ແບບດຽວກັນໄດ້ເລີຍໂດຍບໍ່ຕ້ອງເພິ່ງເວັບ diagram ແຍກ

ສຳລັບ API contract ແນະນຳເກັບເປັນ `openapi.yaml` ໄວ້ໃນ repo ໃຫ້ agent ອ່ານ/ແກ້ໄດ້ໂດຍກົງຄືໄຟລ໌ໂຄ້ດທົ່ວໄປ ບໍ່ຕ້ອງມີ tool ພິເສດ

### Testing

ຕື່ມຊັ້ນ unit/integration test ທີ່ຍັງຂາດ — **ບໍ່ຕ້ອງມີ MCP ເພີ່ມ** ເພາະ opencode ເອີ້ນ test runner ຜ່ານ Bash tool ໄດ້ຢູ່ແລ້ວ ສິ່ງທີ່ຕ້ອງເພີ່ມແມ່ນພຽງ test framework ໃນ project ເອງ (ເຊັ່ນ `pytest`/`pytest-cov` ຝັ່ງ Python, `vitest`/`jest` ຝັ່ງ JS/TS) ແລ້ວໃຫ້ `test-driven-development` skill ຂອງ [[plugins]] (superpowers) ທີ່ມີຢູ່ແລ້ວຊ່ວຍຄວບຄຸມ workflow

> [!warning] Unit test ທີ່ agent ແລ່ນເອງບໍ່ພຽງພໍ ຕ້ອງຜູກກັບ CI ນຳ
> ຖ້າ agent ແລ່ນ test ໃຫ້ເບິ່ງຕອນພັດທະນາຢ່າງດຽວ ແຕ່ບໍ່ມີໃຜແລ່ນຄືນຕອນ merge — regression ທີ່ agent ມອງຂ້າມຈະຫຼຸດເຂົ້າ main ໄດ້ ເບິ່ງຫົວຂໍ້ CI/CD ຖັດໄປ

### CI/CD & Deployment

**CI (ແນະນຳ GitHub Actions)** ເພາະ repo ຢູ່ເທິງ GitHub ຢູ່ແລ້ວ ບໍ່ຕ້ອງເພີ່ມ service ໃໝ່ — workflow ພື້ນຖານທີ່ຄວນມີ:

```yaml
# .github/workflows/ci.yml
name: CI
on: [pull_request, push]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci   # ຫຼື pip install -r requirements.txt ແລ້ວແຕ່ stack
      - run: npm test  # unit/integration test ຈາກຫົວຂໍ້ກ່ອນໜ້າ
      - run: npx trivy fs .   # ເພີ່ມ security scan ເຂົ້າ pipeline (ມີ trivy CLI ຢູ່ແລ້ວ)
```

> [!tip] trivy ມີຢູ່ແລ້ວເທິງເຄື່ອງ ພຽງແຕ່ຍັງບໍ່ໄດ້ຜູກເຂົ້າ CI
> [[mcp-servers]] (trivy) ທີ່ຕິດຕັ້ງໄວ້ແລ້ວສຳລັບໃຫ້ agent ເອີ້ນຕອນ dev — ເພີ່ມ step ດຽວກັນເຂົ້າ GitHub Actions ກໍໄດ້ security gate ອັດຕະໂນມັດທຸກ PR ໂດຍບໍ່ຕ້ອງຕິດຕັ້ງຫຍັງໃໝ່ເລີຍ

**Deployment target** ເລືອກຕາມສະໄຕລ໌ທີ່ຖະໜັດ (ຄູ່ມືນີ້ອຽງໄປທາງ self-hosted ຢູ່ແລ້ວ ຈາກ home-llamacpp/sonarqube):

| ທາງເລືອກ | ເໝາະກັບ | Trade-off |
| --- | --- | --- |
| Self-host ຜ່ານ Docker Compose + reverse proxy (Caddy/nginx) | ຕໍ່ຍອດ pattern ເກົ່າທີ່ self-host sonarqube/llama.cpp ຢູ່ແລ້ວ | ດູແລ server ເອງ (patch, uptime) |
| Vercel / Netlify / Cloudflare Pages | ເວັບ frontend ລ້ວນ deploy ໄວທີ່ສຸດ | ຜູກກັບ platform, ຕົ້ນທຶນເພີ່ມຖ້າ traffic ສູງ |
| Railway / Render / Fly.io | full-stack app ແບບ container ບໍ່ຢາກດູແລ infra ເອງ | ຍັງຕ້ອງຈ່າຍລາຍເດືອນ ແຕ່ບໍ່ຕ້ອງດູແລ server |

### Maintenance (Production Monitoring)

**Error tracking:** [Sentry](https://github.com/getsentry/sentry-mcp) ມີ MCP server ທາງການ (`@sentry/mcp-server`) — agent ເອີ້ນ query error/stack trace ຈາກ production ໄດ້ໂດຍກົງ ປິດ loop ກັບຄືນໄປ requirement/bug fix ໄດ້ຈິງ ມີທັງແບບ remote hosted ແລະ local:

```jsonc
{
  "mcp": {
    "sentry": {
      "type": "remote",
      "url": "https://mcp.sentry.dev/mcp",
      "headers": { "Authorization": "Sentry-Bearer {env:SENTRY_ACCESS_TOKEN}" }
    }
  }
}
```

ຮອງຮັບ self-hosted Sentry ນຳ (ຕັ້ງ `SENTRY_HOST` ແທນຖ້າບໍ່ໃຊ້ Sentry cloud) ເຂົ້າກັບ pattern self-host ຂອງຄູ່ມືນີ້

**Metrics/dashboard:** [Grafana](https://github.com/grafana/mcp-grafana) ມີ MCP server ເຊັ່ນກັນ (`mcp-grafana`) ໃຫ້ agent query dashboard/datasource/alert ໄດ້ — ແລ່ນເປັນ Docker container ໄດ້ຄື sonarqube:

```jsonc
{
  "mcp": {
    "grafana": {
      "type": "local",
      "command": ["docker", "run", "--rm", "-i", "-e", "GRAFANA_URL", "-e", "GRAFANA_SERVICE_ACCOUNT_TOKEN", "grafana/mcp-grafana", "-t", "stdio"],
      "environment": {
        "GRAFANA_URL": "http://host.docker.internal:3000",
        "GRAFANA_SERVICE_ACCOUNT_TOKEN": "{env:GRAFANA_SERVICE_ACCOUNT_TOKEN}"
      },
      "timeout": 30000,
      "enabled": false
    }
  }
}
```

**Dependency updates:** ເປີດ GitHub Dependabot (native, ບໍ່ຕ້ອງຕິດຕັ້ງຫຍັງ ພຽງເພີ່ມໄຟລ໌ `.github/dependabot.yml`) — ເຮັດວຽກຄຽງຄູ່ກັບ trivy ທີ່ມີຢູ່ແລ້ວ (trivy scan vulnerability ທີ່ມີຢູ່ ณ ປັດຈຸບັນ, Dependabot ເຕືອນກ່ອນເມື່ອມີ patch ໃໝ່ອອກ)

> [!info] ເປັນຫຍັງບໍ່ແນະນຳ Uptime Kuma
> ພິຈາລະນາແລ້ວແຕ່ບໍ່ໃສ່ໄວ້ໃນນີ້ເພາະບໍ່ມີ MCP ໃຫ້ agent ເອີ້ນໃຊ້ — ເປັນພຽງ dashboard ໃຫ້ມະນຸດເບິ່ງເອງ ຖ້າຕ້ອງການ uptime monitoring ງ່າຍໆ ຍັງຕິດຕັ້ງໄດ້ (self-host ຜ່ານ Docker ຄືກັນ) ແຕ່ຈະບໍ່ໄດ້ຜົນປະໂຫຍດຈາກການເຮັດວຽກຄຽງຄູ່ກັບ agent ຄືໂຕອື່ນໃນຫົວຂໍ້ນີ້
