---
tags: [project-doc, overview, opencode, ai-agent]
updated: 2026-09-13
summary: ໜ້າຫຼັກຂອງຄູ່ມືການຕິດຕັ້ງແລະນຳໃຊ້ OpenCode CLI ພ້ອມ MCP servers, Plugins, ແລະ Skills (Agent Skills open standard) ສຳລັບ vibe coding
---

# OpenCode — Vibe Coding Setup

**OpenCode** ແມ່ນ AI coding agent ແບບ CLI (ແນວດຽວກັບ Claude Code) ທີ່ຮອງຮັບການຕໍ່ model provider ເອງໄດ້ອິດສະຫຼະ — ລວມທັງ self-hosted model ເທິງເຊີບເວີຂອງຕົນເອງ — ແລະມີລະບົບ **MCP (Model Context Protocol)** ກັບ **Plugin** ແບບເປີດໃຫ້ຂະຫຍາຍໄດ້ເຕັມຮູບແບບ

ຊຸດເອກະສານນີ້ບັນທຶກການຕັ້ງຄ່າຈິງທີ່ໃຊ້ງານຢູ່ — ຕັ້ງແຕ່ຕິດຕັ້ງ CLI ເທິງເຄື່ອງເປົ່າ ຈົນເຖິງຕໍ່ໂມເດວບ້ານ (self-hosted llama.cpp) + MCP servers 11 ໂຕ (8 ເປີດໃຊ້ງານ, 3 ລໍຖ້າເປີດຕໍ່ project/ລໍ token) + Plugin 4 ໂຕ ພ້ອມບັນທຶກບັນຫາທີ່ພົບຈິງລະຫວ່າງທາງແລະວິທີແກ້ທີ່ຢືນຢັນແລ້ວວ່າໃຊ້ໄດ້

---

## 🧩 Stack ທີ່ໃຊ້ງານຈິງ

| ສ່ວນປະກອບ | ລາຍລະອຽດ |
| --- | --- |
| **OpenCode CLI** | v1.18.18+ ຕິດຕັ້ງຜ່ານ `npm install -g opencode-ai` (global) |
| **Model provider ຫຼັກ** | `home-llamacpp` — self-hosted llama.cpp server (URL ສະເພາະຂອງແຕ່ລະຄົນ), ໂມເດວ `qwen3.8-27b` (Q4_K, context 131k) ຜ່ານ OpenAI-compatible endpoint |
| **Model ສຳຮອງ (ໄວ)** | `opencode/deepseek-v4-flash-free` — built-in ຂອງ OpenCode ເອງ ບໍ່ຕ້ອງຕັ້ງ API key ເພີ່ມ ຕອບໄວ (~10 ວິນາທີ) |
| **MCP servers** | context7 (docs), playwright + chrome-devtools (browser automation/debug), graft (code-graph/context — per-project), open-design (ດຶງໄຟລ໌ຈາກ project OpenDesign), memory (ຈື່ context ຂ້າມ session), sonarqube (code quality/security — self-hosted ຜ່ານ Docker), trivy (vulnerability/secret/misconfig scan — standalone CLI), github (issues/PR — ປິດໄວ້ຈົນກວ່າຈະມີ PAT), postgres/mysql (ປິດໄວ້ກ່ອນ ເປີດຕໍ່ project) |
| **Plugins** | superpowers (skill library ຈາກ obra/superpowers), graft-deep (custom plugin — auto-inject context ຢ່າງດຽວແລ້ວ; auto-rebuild graph ເປັນຫນ້າທີ່ຂອງ graft CLI ເອງ), ponytail (ruleset ຫຼຸດຄວາມຍາວໂຄ້ດທີ່ບໍ່ຈຳເປັນ — ຈາກ dietrichgebert/ponytail), i-have-adhd (ບັງຄັບຕອບກົງປະເດັນ ບໍ່ອ້ອມແອ້ມ — ຈາກ ayghri/i-have-adhd) |
| **Skills** (Agent Skills open standard, ບໍ່ແມ່ນ plugin) | grill-me / grilling (ຈາກ mattpocock/skills) — batch-interview ສຳພາດຜູ້ໃຊ້ເປັນຮອບກ່ອນເລີ່ມວຽກ ຜູກເຂົ້າກັບ `brainstorming` ຂອງ superpowers ບໍ່ໃຫ້ຂັດແຍ້ງກັນ |
| **Config ຫຼັກ** | `~/.config/opencode/opencode.jsonc` (ຕັ້ງເອງ) + `~/.config/opencode/opencode.json` (ຂຽນອັດຕະໂນມັດໂດຍ `od mcp install`) |

---

## 📖 ໜ້າ Wiki

- [[sdlc]] — ພາບລວມ Software Development Life Cycle ທັງ 7 ຂະບວນການ ພ້ອມຊີ້ບອກວ່າຄູ່ມືນີ້ຄອບຄຸມ phase ໃດແດ່ (ແລະຊ່ອງຫວ່າງທີ່ຍັງບໍ່ມີ)
- [[setup]] — ຄູ່ມືຕິດຕັ້ງແບບລະອຽດ ຕັ້ງແຕ່**ເຄື່ອງເປົ່າ**ທີ່ຍັງບໍ່ມີ Node.js/Git ຈົນເຖິງຕໍ່ provider/MCP/plugin ຄົບຖ້ວນ
- [[mcp-servers]] — ລາຍລະອຽດ MCP server ແຕ່ລະໂຕ ຂັ້ນຕອນຕິດຕັ້ງ config ແລະວິທີທົດສອບ
- [[plugins]] — superpowers, grill-me/grilling (batch-interview skill ເສີມ superpowers), custom plugin graft-deep (ໂຄ້ດເຕັມ + Plugin Hook API), ponytail (code-minimization ruleset) ແລະ i-have-adhd (ບັງຄັບຕອບກົງປະເດັນ)
- [[USER-MANUAL]] — ວິທີໃຊ້ງານຈິງປະຈຳວັນ: vibe coding, graft workflow, OpenDesign workflow
- [[gotchas]] — ບັນຫາທີ່ພົບຈິງ 8 ເລື່ອງພ້ອມວິທີແກ້ (Windows PATH/env snapshot, ໂມເດວຊ້າ, native module ABI mismatch, reasoning-model output cap, ຯລຯ)
- [[updating]] — ວິທີອັບເດດ/ອັບເກຣດ OpenCode CLI, MCP servers, plugins ແລະ OpenDesign ເທື່ອລະໂຕ

---

## 🚀 Quick Start

```bash
# 1. ຕິດຕັ້ງ CLI
npm install -g opencode-ai

# 2. ກວດສອບວ່າຕິດຕັ້ງສຳເລັດ
opencode --version

# 3. ທົດລອງໃຊ້ງານທັນທີ (ບໍ່ຕ້ອງຕັ້ງຄ່າຫຍັງເພີ່ມ — ໃຊ້ໂມເດວຟຣີໃນຕົວ)
opencode run -m opencode/deepseek-v4-flash-free "say hi"

# 4. ເປີດ TUI ໃນ project
cd my-project
opencode
```

ລາຍລະອຽດການຕັ້ງຄ່າ provider/MCP/plugin ທັງໝົດຕັ້ງແຕ່ຕົ້ນ ເບິ່ງທີ່ [[setup]]

---

## ⚠️ ເປັນຫຍັງຕ້ອງມີ provider ສຳຮອງ (opencode/deepseek-v4-flash-free)

ໂມເດວບ້ານ (`home-llamacpp/qwen3.8-27b`) ກາຍເປັນ **default model** ຂອງ OpenCode ໂດຍອັດຕະໂນມັດ ເພາະເປັນ provider ດຽວທີ່ມີ credential ຈິງ ແຕ່ context ທີ່ໜັກຈາກ superpowers + MCP 5 ໂຕ ເຮັດໃຫ້ແຕ່ລະ turn ໃຊ້ເວລານານ (ບາງເທື່ອເກີນ 1-2 ນາທີ)

ເຄື່ອງມືພາຍນອກທີ່ມີ timeout ສັ້ນ (ເຊັ່ນ OpenDesign wizard ທີ່ຕັ້ງໄວ້ 45 ວິນາທີ) ຈະພັງທັນທີຖ້າໄປຊົນກັບໂມເດວນີ້ — ຈຶ່ງເກັບໂມເດວຟຣີທີ່ໄວໄວ້ເປັນທາງເລືອກສຳຮອງສຳລັບກໍລະນີແບບນີ້

> [!tip] ອ່ານເພີ່ມ
> ລາຍລະອຽດວິທີວິນິດໄສບັນຫານີ້ແລະວິທີແກ້ເຕັມໆ ເບິ່ງທີ່ [[gotchas]] ຂໍ້ 1
