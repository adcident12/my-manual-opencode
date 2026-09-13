---
tags: [project-doc, mcp, opencode, reference]
updated: 2026-09-13
summary: ລາຍລະອຽດ MCP server ແຕ່ລະໂຕທີ່ຕັ້ງໄວ້ໃນ OpenCode — ຂັ້ນຕອນຕິດຕັ້ງ, config, ວິທີທົດສອບ, ຂໍ້ຄວນລະວັງ
---

# MCP Servers

ພາບລວມທີ [[index]] · ຂັ້ນຕອນຕິດຕັ້ງ OpenCode ເອງທີ [[setup]]

MCP ທຸກໂຕລຸ່ມນີ້ເພີ່ມເຂົ້າ `mcp` object ໃນ `~/.config/opencode/opencode.jsonc` (global — ໃຊ້ໄດ້ທຸກ project) ເວັ້ນແຕ່ຈະລະບຸໄວ້ວ່າຕ້ອງຕັ້ງຕໍ່ project

> [!note] ກ່ອນເລີ່ມ
> ໜ້ານີ້ສົມມຸດວ່າຕິດຕັ້ງ Node.js/npm ແລະ OpenCode CLI ຮຽບຮ້ອຍແລ້ວ ຖ້າຍັງບໍ່ໄດ້ເຮັດ ຄືນໄປທີ່ [[setup]] Part 0–1 ກ່ອນ

---

## context7 — ຄົ້ນຫາ docs library/framework

Remote MCP (ບໍ່ຕ້ອງແລ່ນຫຍັງເທິງເຄື່ອງ ບໍ່ຕ້ອງຕິດຕັ້ງຫຍັງລ່ວງໜ້າ) ໃຊ້ຄົ້ນຫາ documentation ຂອງ library/framework ແບບ real time ແທນການເພິ່ງຄວາມຈຳຂອງໂມເດວ — ມີປະໂຫຍດຫຼາຍເມື່ອ agent ຕ້ອງຂຽນໂຄ້ດກັບ library ເວີຊັນໃໝ່ທີ່ຄວາມຈຳຂອງໂມເດວອາດເກົ່າແລ້ວ

### ຂັ້ນຕອນຕິດຕັ້ງ

1. ບໍ່ຕ້ອງຕິດຕັ້ງຫຍັງເພີ່ມ ເພາະເປັນ remote HTTP endpoint

2. ເພີ່ມ config ໃນ `opencode.jsonc`:

   ```jsonc
   "context7": { "type": "remote", "url": "https://mcp.context7.com/mcp" }
   ```

3. ຣີສະຕາດ OpenCode (ຫຼືເປີດ session ໃໝ່) ແລ້ວກວດສະຖານະ:

   ```bash
   opencode mcp list
   ```

   ຄວນເຫັນ `✓ context7 connected`

---

## playwright — ຄວບຄຸມ browser / e2e testing

MCP server ທີ່ຄວບຄຸມ browser ຈິງຜ່ານ Playwright — ໃຊ້ສຳລັບ automation, ປ້ອນ form, ຄລິກປຸ່ມ, ຖ່າຍ screenshot ແລະທົດສອບ flow ຂອງເວັບໄຊທ໌ແບບ end-to-end

### ຂັ້ນຕອນຕິດຕັ້ງ

1. ຕິດຕັ້ງ Chromium ໃຫ້ Playwright ລ່ວງໜ້າ (ບໍ່ບັງຄັບ — ຖ້າຂ້າມຂັ້ນນີ້ MCP server ຈະພະຍາຍາມດາວໂຫຼດໃຫ້ເອງຕອນເອີ້ນຄັ້ງທຳອິດ ແຕ່ເຮັດລ່ວງໜ້າຈະກັນບັນຫາ timeout ຕອນໃຊ້ງານຈິງຄັ້ງທຳອິດ):

   ```bash
   npx playwright install
   ```

2. ເພີ່ມ config ໃນ `opencode.jsonc`:

   ```jsonc
   "playwright": { "type": "local", "command": ["npx", "@playwright/mcp@latest"], "timeout": 30000 }
   ```

   ຕັ້ງ `timeout: 30000` ເພາະຮອບທຳອິດ npx ຕ້ອງ resolve/ດາວໂຫຼດ package ກ່ອນ ຄ່າ default ຂອງ OpenCode (5000ms) ມັກບໍ່ພຽງພໍ

3. ທົດສອບ:

   ```bash
   opencode mcp list
   ```

   > [!warning] ຮອບທຳອິດອາດຂຶ້ນ failed
   > ຮອບທຳອິດອາດຂຶ້ນ `failed`/timeout ເພາະ npx ກຳລັງດາວໂຫຼດ package ຢູ່ພາຍໃນ — ແລ່ນຄຳສັ່ງຄືນອີກຄັ້ງຫຼັງລໍໜ້ອຍໜຶ່ງ ຖ້າຍັງ fail ໃຫ້ກວດວ່າ step 1 ຜ່ານແລ້ວບໍ່

---

## chrome-devtools — debug ໜ້າເວັບສົດ

ຕ່າງຈາກ playwright ຢູ່ບ່ອນເນັ້ນ **debug** (console log, network request, performance trace) ຫຼາຍກວ່າ automation ລ້ວນໆ — ໃຊ້ເສີມກັນໄດ້ ບໍ່ຊ້ຳຊ້ອນ ເໝາະຕອນ agent ຕ້ອງຫາສາເຫດວ່າເປັນຫຍັງໜ້າເວັບ error ຫຼືຊ້າ

### ຂັ້ນຕອນຕິດຕັ້ງ

1. ຕ້ອງມີ **Google Chrome** ຫຼື **Chrome for Testing** ຕິດຕັ້ງໃນເຄື່ອງ (ຮອງຮັບທາງການພຽງ 2 ໂຕນີ້ — Chromium ອື່ນອາດໃຊ້ໄດ້ແຕ່ບໍ່ຮັບປະກັນ)

2. ເພີ່ມ config ໃນ `opencode.jsonc`:

   ```jsonc
   "chrome-devtools": {
     "type": "local",
     "command": ["npx", "-y", "chrome-devtools-mcp@latest", "--no-usage-statistics"],
     "timeout": 30000
   }
   ```

   `--no-usage-statistics` ປິດການສົ່ງ telemetry ໄປທີ່ Google (ເປີດຢູ່ໂດຍ default ຖ້າບໍ່ໃສ່ flag ນີ້)

3. ທົດສອບ:

   ```bash
   opencode mcp list
   ```

---

## graft — code-graph / context retrieval (per-project)

[trailhq/Graft](https://github.com/trailhq/Graft) ສ້າງກຣາຟຄວາມສຳພັນຂອງໂຄ້ດ (ຟັງຊັນໃດເອີ້ນຫຍັງ, ໄຟລ໌ໃດກ່ຽວຂ້ອງກັບໄຟລ໌ໃດ) ໃຫ້ agent ເຂົ້າໃຈໂຄງສ້າງ repo ໄດ້ໄວໂດຍບໍ່ຕ້ອງອ່ານທຸກໄຟລ໌ ຕ່າງຈາກ 3 ໂຕຂ້າງເທິງຢູ່ບ່ອນ **ຕ້ອງຕັ້ງຕໍ່ project** ເພາະກຣາຟຕ້ອງສະແກນໂຄ້ດຂອງ repo ນັ້ນຈິງໆ

> [!note] repo ຍ້າຍ org ແລ້ວ (ກວດຫຼ້າສຸດ 2026-09-13)
> ເດີມຢູ່ທີ່ `nanonets/graft` — ຕອນນີ້ທັງ `github.com/nanonets/graft` ແລະ `github.com/NanoNets/Graft` (ໂຕພິມໃຫຍ່) **redirect (301) ໄປທີ່ `github.com/trailhq/Graft` ອັດຕະໂນມັດ** ລິ້ງເກົ່າທີ່ເຄີຍແປະໄວ້ (README, npm package page) ຍັງໃຊ້ໄດ້ເພາະ GitHub redirect ໃຫ້ ແຕ່ຄວນໃຊ້ລິ້ງໃໝ່ຈາກນີ້ໄປ — npm package ຍັງຊື່ເດີມ `@nanonets/graft` ບໍ່ປ່ຽນ

### ຂັ້ນຕອນຕິດຕັ້ງ

1. ຕິດຕັ້ງ CLI ແບບ global (ເຮັດຄັ້ງດຽວຕໍ່ເຄື່ອງ ໃຊ້ໄດ້ກັບທຸກ project):

   ```bash
   npm install -g @nanonets/graft
   ```

2. ເພີ່ມ config ໃນ `opencode.jsonc` (global — ໃຊ້ໄດ້ທຸກ project ທີ່ຜ່ານ step 3 ແລ້ວ):

   ```jsonc
   "graft": { "type": "local", "command": ["npx", "-y", "@nanonets/graft", "mcp"], "timeout": 30000 }
   ```

3. **ເຮັດຕໍ່ທຸກ project ທີ່ຈະໃຊ້** (ຄັ້ງທຳອິດຄັ້ງດຽວຕໍ່ repo ໜຶ່ງ):

   ```bash
   cd my-project
   graft build                              # ສະແກນໂຄ້ດ ສ້າງກຣາຟ (structural, ບໍ່ຕ້ອງມີ API key)
   graft init --agents agents --no-global   # ຂຽນ AGENTS.md + opencode.json (mcp.graft) ສະເພາະ repo ນີ້
   ```

   `--agents agents --no-global` ຈຳກັດໃຫ້ຂຽນສະເພາະໄຟລ໌ທີ່ OpenCode ໃຊ້ (`AGENTS.md`, `opencode.json`) ບໍ່ໄປຍຸ່ງກັບ Claude Code/.kiro/.gemini/Codex ທີ່ອາດຕິດຕັ້ງໄວ້ຢູ່ແລ້ວໃນເຄື່ອງ

4. ທົດສອບ:

   ```bash
   cd my-project
   opencode mcp list      # ຄວນເຫັນ graft connected
   graft map                # ທົດສອບ CLI ໂດຍກົງກໍໄດ້
   ```

### ຄຳສັ່ງ CLI ທີ່ມີປະໂຫຍດ

| ຄຳສັ່ງ | ໃຊ້ເຮັດຫຍັງ |
| --- | --- |
| `graft map` | ພາບລວມ project — ໄຟລ໌ໃດ function ໃດຖືກເອີ້ນເລື້ອຍ |
| `graft ask "<ຄຳຖາມ>"` | ຖາມເປັນພາສາຄົນ ຫາໂຄ້ດທີ່ກ່ຽວຂ້ອງ ຄືນ file:line |
| `graft grep "<regex>"` | ຄົ້ນຫາແບບ exhaustive ຈັດກຸ່ມຕາມ symbol (`-i --fixed` = case-insensitive + literal string ບໍ່ແມ່ນ regex) |
| `graft callers <symbol>` | ເບິ່ງວ່າໃຜເອີ້ນ/import/extend symbol ນີ້ແດ່ — `--direction out` ສະຫຼັບເປັນ "symbol ນີ້ເອີ້ນຫຍັງແດ່", `-d N` ຍ່າງເລິກ N ຊັ້ນເບິ່ງ blast radius ເຕັມ |
| `graft skeleton <file>` | API surface ຂອງໄຟລ໌ແບບບໍ່ມີ body |
| `graft blast [dir]` | **(ໃໝ່)** blast radius ຂອງ diff ປັດຈຸບັນ — `--base origin/main` ທຽບກັບ merge base, `--format markdown` ອອກແບບພ້ອມແປະເປັນ PR comment, `--export-viz` ເຮັດໜ້າເວັບ interactive ນຳ |
| `graft check` | ກວດວ່າກຣາຟ drift ຈາກໂຄ້ດຈິງແລ້ວບໍ່ (ບໍ່ rebuild ໃຫ້ ພຽງລາຍງານ) |
| `graft viz` | ເປີດໜ້າເວັບເບິ່ງ dependency graph ແບບ interactive — `--export site/` ໄດ້ static HTML ໄຟລ໌ດຽວສຳລັບແປະໃນ CI/GitHub Pages |
| `graft uninstall [dir]` | ລ້າງທຸກໄຟລ໌/config ທີ່ `graft init` ເຄີຍຂຽນໄວ້ (ກົງກັນຂ້າມກັບ init) — ຕ້ອງໃສ່ `-y` ຈຶ່ງລົບຈິງ ບໍ່ດັ່ງນັ້ນພຽງ print ລາຍການ |

> [!info] `graft build` ມີ flag ສຳລັບ monorepo/submodule ເພີ່ມມານຳ
> `--follow-submodules` / `--follow-nested-repos` ລວມ submodule ທີ່ init ແລ້ວ ຫຼື repo ທີ່ clone ຊ້ອນໄວ້ຂ້າງໃນເຂົ້າກຣາຟດຽວກັນ (ປົກກະຕິຖືກກັນອອກເປັນ default) — ທາງເລືອກຖືກຈື່ໄວ້ທີ່ `.graft/config.json` ໃຊ້ `--extensions .ts .py` ຈຳກັດສະເພາະນາມສະກຸນໄຟລ໌ທີ່ຕ້ອງການກໍໄດ້ ບໍ່ຕ້ອງແກ້ config

> [!tip] `--deep` ເພີ່ມ LLM summary ຕໍ່ symbol (ຍັງບໍ່ໄດ້ຕັ້ງຄ່າໃນ setup ນີ້)
> ປົກກະຕິ `graft build`/`graft ask`/`graft check` ເປັນ structural ລ້ວນ (tree-sitter, $0, ບໍ່ມີ LLM) ແຕ່ `graft build --deep` ເພີ່ມຊັ້ນສະຫຼຸບດ້ວຍໂມເດວພາສາ (concept node summary + crux ຕໍ່ symbol) ຕ້ອງຕັ້ງ `GRAFT_PROVIDER` (`openai`/`anthropic`/`litellm`/`orcarouter`) + `GRAFT_API_KEY` + `GRAFT_MODEL` (ແຍກຈາກ provider ຂອງໂຕ coding agent ເອງ) — setup ນີ້ຍັງບໍ່ໄດ້ເປີດໃຊ້ feature ນີ້ ໃຊ້ພຽງ structural graph ທຳມະດາ

### MCP tools ທີ່ agent ເອີ້ນຈິງ (ຕ່າງຈາກ CLI ຂ້າງເທິງ — CLI ໄວ້ໃຫ້ຄົນເອີ້ນເອງ)

| Tool | ຮັບ | ໃຊ້ເຮັດຫຍັງ |
| --- | --- | --- |
| `graft_find_code` | ຄຳຖາມ | node ທີ່ກ່ຽວຂ້ອງຈັດອັນດັບ ພ້ອມ file:line ແລະ source code ຝັງມານຳ — ມັກຕອບຈົບບໍ່ຕ້ອງອ່ານໄຟລ໌ຕໍ່ |
| `graft_file_api` | path ໄຟລ໌ | signature ທຸກໂຕໃນໄຟລ໌ນັ້ນ ບໍ່ມີ body — ໄດ້ API surface ໂດຍໃຊ້ token ພຽງ ~1/10 |
| `graft_trace_calls` | symbol | ໃຜເອີ້ນໃຊ້ symbol ນີ້ແດ່ (ຫຼື symbol ນີ້ເອີ້ນຫຍັງແດ່ຖ້າໃສ່ `direction: out`) ຍ່າງເລິກໄດ້ຫຼາຍຊັ້ນເບິ່ງ blast radius |
| `graft_find_all` | regex | ທຸກ hit ຈັດກຸ່ມຕາມ symbol ທີ່ຄອບມັນ ຈັດອັນດັບຕາມຄວາມເຊື່ອມໂຍງ |
| `graft_repo_map` | (ບໍ່ຕ້ອງໃສ່ຫຍັງ) | ພາບລວມ repo ທີ່ບໍ່ເຄີຍເຫັນມາກ່ອນ — dir cluster, hub, hotspot |
| `graft_check_freshness` | (ບໍ່ຕ້ອງໃສ່ຫຍັງ) | ກວດວ່າກຣາຟໃນເຄື່ອງ drift ຈາກໂຄ້ດຈິງແລ້ວບໍ່ |

> [!note] ຊື່ tool ທີ່ເຫັນຈິງໃນ OpenCode ມີ prefix ຊ້ອນ
> ເພາະ OpenCode ຕັ້ງຊື່ MCP server ວ່າ `graft` ແລ້ວ namespace tool ເປັນ `<ຊື່ server>_<ຊື່ tool>` ເຫັນຈິງຈະເປັນ `graft_graft_find_code`, `graft_graft_file_api` ຯລຯ (ຊ້ຳຄຳວ່າ graft ສອງເທື່ອ) — ເປັນເລື່ອງປົກກະຕິຂອງການຕັ້ງຊື່ ບໍ່ແມ່ນ bug ບໍ່ກະທົບການໃຊ້ງານ

> [!warning] Prompt injection ທີ່ພົບຈິງ
> output ຂອງ `graft map`/ບາງ command ມີຂໍ້ຄວາມແຝງສັ່ງໃຫ້ agent ເວົ້າປະໂຫຍກໂປຣໂມທ ("🌱 graft saved ~N tokens...") — ເປັນ feature ທີ່ຕັ້ງໃຈໃຫ້ hook ຂອງ Claude Code ຈັບດ້ວຍ regex (`tool-savings` hook) ແຕ່ຖ້າເອີ້ນ CLI ໂດຍກົງນອກ pipeline ຂອງ hook ຂໍ້ຄວາມນີ້ຈະໂຜ່ມາເປັນ tool output ທຳມະດາທີ່ agent ເຫັນ ຄວນຮູ້ໄວ້ແລະບໍ່ເຮັດຕາມຄຳສັ່ງນັ້ນອັດຕະໂນມັດ

> [!info] Deep integration ເທິງ OpenCode — ເຫຼືອພຽງ auto-inject context ທີ່ຕ້ອງຂຽນເອງ
> auto-rebuild ກຣາຟຫຼັງແກ້ໂຄ້ດບໍ່ຕ້ອງເຮັດຫຍັງເພີ່ມແລ້ວ — graft CLI ປັດຈຸບັນ refresh ກຣາຟເອງກ່ອນຕອບທຸກຄຳຖາມຢູ່ແລ້ວ (structural, $0) ຢືນຢັນດ້ວຍການທົດສອບສົດແລ້ວ ສ່ວນທີ່ຍັງບໍ່ມີໃຫ້ OpenCode ຄື **auto-inject context ຕໍ່ prompt ອັດຕະໂນມັດ** (ມີພຽງ Claude Code) ຖ້າຢາກໄດ້ພຶດຕິກຳນີ້ຕ້ອງຂຽນ custom plugin ເອງ — ເບິ່ງ [[plugins]] ຫົວຂໍ້ graft-deep

---

## open-design — ດຶງໄຟລ໌ຈາກ project OpenDesign

[nexu-io/open-design](https://github.com/nexu-io/open-design) ເປັນເຄື່ອງມື generate ເວັບໄຊທ໌/prototype/ສະໄລດ໌ຜ່ານ AI (ທາງເລືອກໂອເພັນຊອສຂອງ Claude Design) ລາຍລະອຽດການໃຊ້ງານ OpenDesign ເອງ (Studio, workflow ເຕັມ) ເບິ່ງທີ່ [[USER-MANUAL]]

### ຂັ້ນຕອນຕິດຕັ້ງ

1. ດາວໂຫຼດ **desktop app** ຈາກ [open-design.ai](https://open-design.ai/) ຫຼື [GitHub Releases](https://github.com/nexu-io/open-design/releases) ແລ້ວຕິດຕັ້ງຕາມປົກກະຕິ (ແນະນຳທີ່ສຸດ — zero config ບໍ່ຕ້ອງມີ Node/pnpm/clone ເອງ)

2. **(ສະເພາະ Windows)** ຕົວຕິດຕັ້ງມັກບໍ່ເພີ່ມ `od` ເຂົ້າ PATH ໃຫ້ ຕ້ອງສ້າງ shim ເອງ — ເບິ່ງຂັ້ນຕອນເຕັມທີ່ [[gotchas]] ຂໍ້ 4 (ສະຫຼຸບສັ້ນໆ: ສ້າງໄຟລ໌ `~/AppData/Roaming/npm/od.cmd` ທີ່ເອີ້ນຕົວແອັບຈິງຜ່ານ `ELECTRON_RUN_AS_NODE=1`)

3. ກວດວ່າ `od` ໃຊ້ງານໄດ້ແລ້ວ (**ເປີດ terminal ໃໝ່** ຫຼັງເຮັດ step 2 ສະເໝີ):

   ```bash
   od --help
   ```

4. ເຊື່ອມກັບ OpenCode:

   ```bash
   od mcp install opencode
   ```

   ຄຳສັ່ງນີ້ຈະຂຽນ config ໃຫ້ເອງທີ່ `~/.config/opencode/opencode.json`:

   ```jsonc
   "open-design": {
     "type": "local",
     "command": ["od", "mcp", "--daemon-url", "http://127.0.0.1:7456"],
     "timeout": 30000,
     "enabled": true
   }
   ```

   ແນະນຳເພີ່ມ `"timeout": 30000` ເອງຖ້າ `od mcp install` ບໍ່ໃສ່ໃຫ້ (ຄ່າ default 5000ms ອາດບໍ່ພຽງພໍຕອນ daemon ຍັງບໍ່ warm)

5. **ເປີດແອັບ OpenDesign ໄວ້** (ຫຼືແລ່ນ `od --no-open` ແບບ headless) — MCP ນີ້ເປັນພຽງ stdio proxy ໄປຫາ daemon ທີ່ `127.0.0.1:7456` ຖ້າບໍ່ມີ daemon ແລ່ນຢູ່ຈະເຊື່ອມຕໍ່ບໍ່ໄດ້ເລີຍ

6. ທົດສອບ:

   ```bash
   opencode mcp list      # ຄວນເຫັນ open-design connected
   ```

**MCP tools ທີ່ໄດ້:** `list_projects`, `get_active_context`, `get_project`, `get_file`, `search_files`, `list_files`, `create_artifact`

> [!warning] ບັນຫາທີ່ພົບເລື້ອຍເທິງ Windows
> ເບິ່ງລາຍລະອຽດເຕັມທີ່ [[gotchas]] ຂໍ້ 4 — ຄອບຄຸມທັງບັນຫາ PATH ແລະບັນຫາ native module ທີ່ shim ທຳມະດາແກ້ບໍ່ໄດ້

---

## memory — ຈື່ context ຂ້າມ session (official reference server)

[`@modelcontextprotocol/server-memory`](https://github.com/modelcontextprotocol/servers/tree/main/src/memory) — ເກັບ knowledge graph ແບບ persistent ໃຫ້ agent ຈື່ fact/context ຂອງເຈົ້າຂ້າມ session ໄດ້ (ທຽບເທົ່າ feature memory ຂອງ Claude Code) ເຮັດວຽກຝັ່ງເຄື່ອງລ້ວນໆ ບໍ່ມີການສົ່ງຂໍ້ມູນອອກໄປໃສ

### ຂັ້ນຕອນຕິດຕັ້ງ

1. ບໍ່ຕ້ອງຕິດຕັ້ງຫຍັງລ່ວງໜ້າ (`npx -y` ດຶງໃຫ້ເອງຕອນເອີ້ນຄັ້ງທຳອິດ)

2. ເພີ່ມ config ໃນ `opencode.jsonc` — ລະບຸ `MEMORY_FILE_PATH` ເປັນ path ແບບ absolute ເພື່ອໃຫ້ໄຟລ໌ຄວາມຈຳຢູ່ຕຳແໜ່ງດຽວແນ່ນອນບໍ່ວ່າຈະເປີດ opencode ຈາກ project ໃດ:

   ```jsonc
   "memory": {
     "type": "local",
     "command": ["npx", "-y", "@modelcontextprotocol/server-memory"],
     "environment": {
       "MEMORY_FILE_PATH": "C:/Users/<user>/.config/opencode/memory.jsonl"
     },
     "timeout": 30000
   }
   ```

3. ທົດສອບ:

   ```bash
   opencode mcp list      # ຄວນເຫັນ memory connected ທັນທີ ບໍ່ຕ້ອງຕັ້ງຄ່າຫຍັງເພີ່ມ
   ```

> [!note] ເກັບຂໍ້ມູນແບບໃດ
> ເກັບເປັນ entities + observations ໃນໄຟລ໌ `.jsonl` ທຳມະດາ (ອ່ານ/ແກ້ດ້ວຍມືໄດ້ຖ້າຈຳເປັນ) ບໍ່ແມ່ນ vector database ຫຼື cloud service ໃດໆ

---

## github — ຈັດການ issues/PR/code search ຜ່ານ structured tool (ປິດໄວ້ກ່ອນ ຈົນກວ່າຈະມີ token)

GitHub MCP server ທາງການ (ເຮັດໂດຍ GitHub ເອງ) — ໃຫ້ agent ເອີ້ນ issues, pull requests, code search ຜ່ານ tool ທີ່ມີໂຄງສ້າງຊັດເຈນ ແທນການສັ່ງ `git`/`gh` ຜ່ານ bash ແບບ freeform

### ຂັ້ນຕອນຕິດຕັ້ງ

1. ສ້າງ GitHub Personal Access Token ທີ່ **https://github.com/settings/personal-access-tokens/new** — ແນະນຳໃຊ້ **Fine-grained token** (ຈຳກັດ scope ໄດ້ລະອຽດກວ່າ classic token) ເລືອກ repository access ແລະ permission ຕາມວຽກທີ່ຈະໃຊ້

2. ຕັ້ງ environment variable `GITHUB_PERSONAL_ACCESS_TOKEN` ເປັນຄ່າ token ທີ່ໄດ້ (ເບິ່ງ [[setup]] Part 2 ສຳລັບວິທີຕັ້ງ env var ແຕ່ລະ OS)

3. ເພີ່ມ config ໃນ `opencode.jsonc`:

   ```jsonc
   "github": {
     "type": "remote",
     "url": "https://api.githubcopilot.com/mcp/",
     "oauth": false,
     "headers": {
       "Authorization": "Bearer {env:GITHUB_PERSONAL_ACCESS_TOKEN}"
     },
     "enabled": false
   }
   ```

   `oauth: false` ບອກ OpenCode ໃຫ້ໃຊ້ PAT ຜ່ານ header ແທນການພະຍາຍາມ auto-discover OAuth — `enabled: false` ໄວ້ກ່ອນຈົນກວ່າຈະພ້ອມໃຊ້ຈິງ

4. ພ້ອມໃຊ້ເມື່ອໃດ ປ່ຽນ `"enabled": false` → `true` ແລ້ວທົດສອບ:

   ```bash
   opencode mcp list      # ຄວນເຫັນ github connected
   ```

> [!warning] ກິນ context ຫຼາຍ
> ເອກະສານທາງການຂອງ GitHub ເຕືອນໄວ້ວ່າ MCP ນີ້ "can add a lot of tokens to your context" — ຖ້າເປີດໃຊ້ງານຈິງ ຄວນຈຳກັດ toolset ທີ່ເປີດໄວ້ໃຫ້ແຄບລົງ ບໍ່ແມ່ນເປີດທຸກ capability ພ້ອມກັນ

---

## sonarqube — code quality + security scan ແບບ self-hosted (ຜ່ານ Docker)

[SonarSource/sonarqube-mcp-server](https://github.com/SonarSource/sonarqube-mcp-server) ທາງການ — ໃຫ້ agent ເອີ້ນເບິ່ງ quality gate, security hotspot, code smell, coverage ຂອງໂຄ້ດຜ່ານ tool call ໂດຍກົງ ຕ່າງຈາກ MCP ອື່ນໃນໜ້ານີ້ຢູ່ບ່ອນ **ຕ້ອງມີ SonarQube server ແລ່ນຢູ່ຈິງກ່ອນ** (self-hosted ຫຼື SonarCloud) — ເລືອກທາງ self-hosted ເພາະບໍ່ຕ້ອງເພິ່ງ service ພາຍນອກ ຂໍ້ມູນໂຄ້ດບໍ່ອອກຈາກເຄື່ອງ

### Prerequisite — Docker Desktop

ຕ້ອງມີ Docker Desktop ຕິດຕັ້ງແລະ **engine ກຳລັງແລ່ນຢູ່** (ບໍ່ແມ່ນພຽງຕິດຕັ້ງແອັບໄວ້ເສີຍໆ) ກວດໄດ້ດ້ວຍ:

```powershell
docker version
```

ຖ້າຂຶ້ນ error `open //./pipe/dockerDesktopLinuxEngine` ແປວ່າແອັບຍັງບໍ່ໄດ້ເປີດ — ເປີດ Docker Desktop ໄວ້ກ່ອນ (ໃຊ້ເວລາ bootstrap engine ~30-90 ວິນາທີຫຼັງເປີດແອັບ)

> [!warning] `docker` ອາດບໍ່ຢູ່ເທິງ PATH
> ຕົວຕິດຕັ້ງ Docker Desktop **ບໍ່ໄດ້ເພີ່ມ path ຂອງ `docker.exe` ເຂົ້າ System PATH ສະເໝີໄປ** (ພົບຈິງວ່າເຄື່ອງທີ່ຕິດຕັ້ງໄວ້ດົນແລ້ວບາງເຄື່ອງບໍ່ມີ) ກວດດ້ວຍ `Get-Command docker` — ຖ້າບໍ່ພົບ ໃຫ້ໃຊ້ full path ໂດຍກົງແທນທັງຕອນທົດສອບແລະໃນ MCP config: `C:\Program Files\Docker\Docker\resources\bin\docker.exe`

### ຂັ້ນຕອນທີ 1 — ແລ່ນ SonarQube Server container

```bash
docker run -d --name sonarqube -p 9000:9000 \
  -v sonarqube_data:/opt/sonarqube/data \
  -v sonarqube_extensions:/opt/sonarqube/extensions \
  -v sonarqube_logs:/opt/sonarqube/logs \
  sonarqube:community
```

ໃຊ້ named volume 3 ໂຕໃຫ້ຂໍ້ມູນ/extension/log ຢູ່ຖາວອນຂ້າມ container restart — **ບໍ່ໃສ່ `--rm`** ເພາະຕ້ອງການໃຫ້ container ຄົງຢູ່ຖາວອນ ບໍ່ແມ່ນແບບ ephemeral ຄື MCP server

ລໍຈົນ bootstrap ສຳເລັດ (ປົກກະຕິ 1-2 ນາທີ) ກວດໄດ້ຈາກ log:

```bash
docker logs sonarqube | grep "SonarQube is operational"
```

ທົດສອບວ່າເວັບຂຶ້ນແລ້ວ: ເປີດ **http://localhost:9000**

> [!note] Embedded H2 database ພຽງພໍສຳລັບໃຊ້ຄົນດຽວ
> SonarQube ເຕືອນວ່າ "Embedded database should be used for evaluation purposes only" — ສຳລັບໃຊ້ງານຄົນດຽວ/project ສ່ວນຕົວບໍ່ມີບັນຫາ ແຕ່ຖ້າຈະໃຊ້ກັບທີມຫຼື production ຈິງ ຕ້ອງປ່ຽນໄປຕໍ່ PostgreSQL ແຍກຕາມເອກະສານທາງການຂອງ SonarQube

### ຂັ້ນຕອນທີ 2 — Login ຄັ້ງທຳອິດ + ສ້າງ User Token

1. ເຂົ້າ **http://localhost:9000** login ດ້ວຍ `admin` / `admin` (default) — ລະບົບບັງຄັບຕັ້ງລະຫັດຜ່ານໃໝ່ທັນທີ
2. ໄປທີ່ **My Account → Security**
3. ທີ່ **Generate Tokens**: ຕັ້ງຊື່ (ເຊັ່ນ `opencode-mcp`), Expires in `No expiration` (ຫຼືກຳນົດເອງຖ້າຕ້ອງການ)

> [!danger] Type ຕ້ອງເປັນ "User Token" ເທົ່ານັ້ນ — ຈຸດທີ່ພາດງ່າຍທີ່ສຸດ
> Dropdown **Type** ມີໃຫ້ເລືອກ 3 ແບບ: Global Analysis Token, Project Analysis Token, User Token — MCP server **ໃຊ້ໄດ້ພຽງ User Token** ເທົ່ານັ້ນ ເພາະຕ້ອງເອີ້ນ Web API ເຕັມຮູບແບບ ຖ້າເລືອກຜິດຈະໄດ້ 401/403 ຕອນເອີ້ນ tool ຈິງ ເຖິງແມ່ນ MCP server ຈະ "connected" ເສີຍໆກໍຕາມ

4. ກົດ Generate → ຄັດລອກ token ທັນທີ (ໂຊວ໌ຄັ້ງດຽວ)

### ຂັ້ນຕອນທີ 3 — ຕັ້ງ env var

ຕັ້ງ `SONARQUBE_TOKEN` ເປັນຄ່າ token ທີ່ໄດ້ (System Environment Variable ເທິງ Windows ຫຼື shell profile ເທິງ macOS/Linux — ເບິ່ງ [[setup]] Part 2)

> [!danger] ຢ່າໃສ່ token ໂດຍກົງໃນໄຟລ໌ config ຫຼືໃນແຊັດ
> ໃຊ້ `{env:SONARQUBE_TOKEN}` ແທນສະເໝີ ເຖິງແມ່ນຈະເປັນ server ທີ່ແລ່ນເທິງ localhost ເທົ່ານັ້ນກໍຕາມ

### ຂັ້ນຕອນທີ 4 — ເພີ່ມ config ໃນ `opencode.jsonc`

```jsonc
"sonarqube": {
  "type": "local",
  "command": [
    "C:/Program Files/Docker/Docker/resources/bin/docker.exe",
    "run", "--init", "--rm", "-i",
    "-e", "SONARQUBE_TOKEN",
    "-e", "SONARQUBE_URL",
    "sonarsource/sonarqube-mcp"
  ],
  "environment": {
    "SONARQUBE_TOKEN": "{env:SONARQUBE_TOKEN}",
    "SONARQUBE_URL": "http://host.docker.internal:9000"
  },
  "timeout": 30000,
  "enabled": true
}
```

ຈຸດສຳຄັນທີ່ຕ່າງຈາກ config ຕົວຢ່າງທົ່ວໄປໃນເອກະສານຂອງ SonarQube ເອງ:

- **ໃຊ້ full path ຂອງ `docker.exe`** ແທນຊື່ `docker` ເສີຍໆ
- **`SONARQUBE_URL` ຕ້ອງເປັນ `http://host.docker.internal:9000`** ບໍ່ແມ່ນ `http://localhost:9000` — ເພາະໂຕ MCP server ແລ່ນຢູ່**ໃນ container ແຍກ** `localhost` ຂ້າງໃນນັ້ນໝາຍເຖິງໂຕ container ເອງ ບໍ່ແມ່ນເຄື່ອງຈິງ
- `-e SONARQUBE_TOKEN` (ບໍ່ມີ `=value` ຕໍ່ທ້າຍ) ບອກ Docker ໃຫ້ forward ຄ່າຈາກ environment ຂອງ process ທີ່ເອີ້ນ `docker run` (ຄື opencode ເອງ) ເຂົ້າ container

**pre-pull image ກ່ອນໃຊ້ງານຈິງຄັ້ງທຳອິດ** (ກັນ timeout 30 ວິນາທີບໍ່ພຽງພໍຕອນຕ້ອງດາວໂຫຼດ image ~500MB+):

```bash
docker pull sonarsource/sonarqube-mcp
```

### ຂັ້ນຕອນທີ 5 — ທົດສອບ

**ທົດສອບ docker command ໂດຍກົງກ່ອນ** (ແຍກບັນຫາ MCP config ອອກຈາກບັນຫາ docker/network):

```powershell
& "C:\Program Files\Docker\Docker\resources\bin\docker.exe" run --init --rm -i -e SONARQUBE_TOKEN -e SONARQUBE_URL=http://host.docker.internal:9000 sonarsource/sonarqube-mcp
```

ຄວນເຫັນ log ແບບນີ້ (ລໍ input ຢູ່ເພາະເປັນ stdio transport — ປົກກະຕິ, ກົດ Ctrl+C ອອກໄດ້):

```
INFO SonarQube MCP Server - Starting backend service
INFO SonarQube MCP Server - SonarQube MCP Server Started:
INFO SonarQube MCP Server - Transport: stdio
INFO SonarQube MCP Server - Status: Server ready - tools loading in background
```

ຖ້າຜ່ານ ຄ່ອຍກວດຜ່ານ opencode:

```bash
opencode mcp list      # ຄວນເຫັນ sonarqube connected
```

> [!important] "connected" ໃນ opencode mcp list ແຕ່ agent ເອີ້ນ tool ບໍ່ໄດ້ — ກວດ VS Code ກ່ອນ
> ບັນຫາທີ່ພົບຈິງລະຫວ່າງຕັ້ງຄ່າ: ທົດສອບ docker command ໂດຍກົງຜ່ານໝົດ ແຕ່ `opencode mcp list` ທີ່ແລ່ນຈາກ **terminal ຂ້າງໃນ VS Code** ຍັງ fail ຢູ່ດີ — ສາເຫດຄື terminal ໃນ VS Code ເປັນ child process ຂອງໂຕ VS Code (`Code.exe`) ທີ່ເປີດຄ້າງມາຕັ້ງແຕ່ກ່ອນຕັ້ງ `SONARQUBE_TOKEN` ຕ້ອງ**ປິດ VS Code ທັງແອັບຈິງໆ ແລ້ວເປີດໃໝ່** ຈຶ່ງຈະເຫັນຄ່າໃໝ່ — ນີ້ຄືກໍລະນີທີ່ຢືນຢັນຈິງຂອງ [[gotchas]] ຂໍ້ 2 ໂດຍກົງ ບໍ່ແມ່ນບັນຫາ config

### CLI/Tool ທີ່ໄດ້

MCP server ນີ້ expose tool ສຳລັບ: analyze code, list issues, check quality gate status, get security hotspots, measure coverage — agent ເອີ້ນເອງອັດຕະໂນມັດເວລາຖືກຂໍໃຫ້ກວດໂຄ້ດ/ຫາ vulnerability

> [!note] project ຕ້ອງ "Analyze" ກ່ອນຈຶ່ງມີຂໍ້ມູນ
> SonarQube server ເປົ່າໆ ບໍ່ມີຂໍ້ມູນຫຍັງຈົນກວ່າຈະສະແກນ project ເຂົ້າໄປຄັ້ງທຳອິດ (ຜ່ານໜ້າເວັບ "Analyze new project" ຫຼືໃຫ້ agent ເອີ້ນ MCP tool ສະແກນໃຫ້) — ກ່ອນສະແກນ tool ສ່ວນຫຼາຍຈະຕອບວ່າບໍ່ມີຂໍ້ມູນ ບໍ່ແມ່ນ error

---

## trivy — vulnerability/secret/misconfig scan (standalone CLI, ບໍ່ຕ້ອງມີ server)

[aquasecurity/trivy](https://github.com/aquasecurity/trivy) — scanner ຫາ vulnerability ໃນ dependency, secret ທີ່ hardcode ໄວ້ໃນໂຄ້ດ, ແລະ misconfiguration ໃນ config file (Terraform, Dockerfile, Kubernetes ຯລຯ) ຕ່າງຈາກ sonarqube ຢູ່ບ່ອນ**ເປັນ CLI ດ່ຽວໆ ບໍ່ຕ້ອງມີ server ແລ່ນຢູ່ເລີຍ**

### ຂັ້ນຕອນຕິດຕັ້ງ

1. ຕິດຕັ້ງ Trivy CLI (Windows ຜ່ານ winget):

   ```powershell
   winget install --id AquaSecurity.Trivy -e
   ```

   macOS: `brew install trivy` · Linux: ເບິ່ງວິທີຕາມ distro ທີ່ [ເອກະສານທາງການ](https://trivy.dev/latest/getting-started/installation/)

   > [!warning] ຕ້ອງ restart terminal ຫຼັງຕິດຕັ້ງ
   > winget ແຈ້ງເອງວ່າ "Path environment variable modified; restart your shell" — ບັນຫາດຽວກັນກັບ [[gotchas]] ຂໍ້ 2

2. ຕິດຕັ້ງ MCP plugin ທາງການຈາກ Aqua Security ເອງ:

   ```bash
   trivy plugin install mcp
   ```

   > [!danger] ຢ່າເຊື່ອຜົນຄົ້ນຫາທີ່ບອກວ່າ `trivy mcp` ໃຊ້ໄດ້ເລີຍທັນທີ
   > ກ່ອນຕິດຕັ້ງ plugin ກວດວ່າ repo ຄື [aquasecurity/trivy-mcp](https://github.com/aquasecurity/trivy-mcp) ໃຫ້ແນ່ໃຈ

3. ເພີ່ມ config ໃນ `opencode.jsonc`:

   ```jsonc
   "trivy": {
     "type": "local",
     "command": ["trivy", "mcp"],
     "timeout": 30000
   }
   ```

4. ທົດສອບ:

   ```bash
   opencode mcp list      # ຄວນເຫັນ trivy connected
   ```

   ທົດສອບ CLI ໂດຍກົງກ່ອນກໍໄດ້ (ດາວໂຫຼດ vulnerability DB ~100MB ຄັ້ງທຳອິດທີ່ແລ່ນ):

   ```bash
   trivy fs --scanners vuln,secret,misconfig .
   ```

> [!warning] ຕ້ອງມີ `docker-credential-desktop` ເທິງ PATH ຕອນດາວໂຫຼດ DB ຄັ້ງທຳອິດ
> ຖ້າພົບ error `docker-credential-desktop: executable file not found` ໃຫ້ເພີ່ມໂຟນເດີ `resources/bin` ຂອງ Docker Desktop ເຂົ້າ PATH ຊົ່ວຄາວ — **ນີ້ບໍ່ແມ່ນ dependency ຖາວອນ** ພຽງແຕ່ DB cache ໄວ້ແລ້ວຄັ້ງຕໍ່ໄປບໍ່ຕ້ອງເພິ່ງ Docker ອີກເລີຍ

### ຄຳສັ່ງ CLI ທີ່ມີປະໂຫຍດ

| ຄຳສັ່ງ | ໃຊ້ເຮັດຫຍັງ |
| --- | --- |
| `trivy fs .` | ສະແກນ dependency vulnerability + secret ໃນໂຟນເດີປັດຈຸບັນ |
| `trivy fs --scanners secret .` | ສະແກນຫາ secret ທີ່ hardcode ໄວ້ຢ່າງດຽວ (ໄວກວ່າ) |
| `trivy image <name>` | ສະແກນ container image ຫາ CVE |
| `trivy config .` | ສະແກນຫາ misconfiguration ໃນ Dockerfile/Terraform/K8s manifest |
| `trivy repository <url>` | ສະແກນ remote git repository ໂດຍບໍ່ຕ້ອງ clone ເອງ |

---

## postgres / mysql — query database (ປິດໄວ້ກ່ອນ, ເປີດຕໍ່ project)

ທັງສອງເປັນ local MCP ທີ່ຕ້ອງມີ database server ແລ່ນຢູ່ແລ້ວ (local ຫຼື remote) — MCP ພຽງເປັນສະພານເຊື່ອມ ບໍ່ໄດ້ຕິດຕັ້ງ DB ໃຫ້

### ຂັ້ນຕອນຕິດຕັ້ງ (ທີ່ global config — ຕັ້ງໄວ້ເປັນ disabled)

1. ບໍ່ຕ້ອງຕິດຕັ້ງຫຍັງລ່ວງໜ້າ (`npx -y` ຈະດຶງ package ໃຫ້ເອງຕອນເປີດໃຊ້ງານຈິງ)

2. ເພີ່ມ config ໃນ `opencode.jsonc` ໂດຍຕັ້ງ `enabled: false` ໄວ້ກ່ອນ:

   ```jsonc
   "postgres": {
     "type": "local",
     "command": ["npx", "-y", "@modelcontextprotocol/server-postgres", "{env:POSTGRES_CONNECTION_STRING}"],
     "timeout": 30000,
     "enabled": false
   },
   "mysql": {
     "type": "local",
     "command": ["npx", "-y", "@benborla29/mcp-server-mysql"],
     "environment": {
       "MYSQL_HOST": "{env:MYSQL_HOST}",
       "MYSQL_PORT": "{env:MYSQL_PORT}",
       "MYSQL_USER": "{env:MYSQL_USER}",
       "MYSQL_PASS": "{env:MYSQL_PASS}",
       "MYSQL_DB": "{env:MYSQL_DB}"
     },
     "timeout": 30000,
     "enabled": false
   }
   ```

> [!note] ເປັນຫຍັງຕ້ອງປິດໄວ້ເປັນ default
> connection string ເປັນຂໍ້ມູນສະເພາະ project ຖ້າເປີດໄວ້ຕະຫຼອດຈະພະຍາຍາມຕໍ່ DB ທຸກຄັ້ງທີ່ເປີດ OpenCode ໃນ project ໃດກໍຕາມ ເຖິງແມ່ນບໍ່ມີ DB ກໍຕາມ ເຮັດໃຫ້ error/ລົບກວນເສີຍໆ

### ຂັ້ນຕອນເປີດໃຊ້ງານຈິງຕໍ່ project

1. ສ້າງ (ຫຼືແກ້) ໄຟລ໌ config ທີ່ **root ຂອງ project ນັ້ນ** ເພື່ອເປີດທັບ global:

   ```jsonc
   // my-project/opencode.jsonc
   {
     "mcp": {
       "postgres": { "enabled": true }
       // ຫຼື "mysql": { "enabled": true }
     }
   }
   ```

2. ຕັ້ງ env var connection ກ່ອນເປີດ opencode ໃນ terminal ດຽວກັນ:

   ```bash
   # Postgres
   export POSTGRES_CONNECTION_STRING="postgresql://user:pass@host:5432/dbname"

   # MySQL
   export MYSQL_HOST="127.0.0.1"
   export MYSQL_PORT="3306"
   export MYSQL_USER="root"
   export MYSQL_PASS="your_password"
   export MYSQL_DB="your_database"
   ```

   ເທິງ Windows PowerShell ໃຊ້ `$env:VAR_NAME = "..."` ແທນ

3. ເປີດ opencode ໃນ terminal ດຽວກັນ (ທີ່ມີ env var ແລ້ວ) ຈາກ root ຂອງ project ນັ້ນ:

   ```bash
   cd my-project
   opencode
   ```

4. ທົດສອບ:

   ```bash
   opencode mcp list      # ຄວນເຫັນ postgres/mysql ປ່ຽນຈາກ disabled ເປັນ connected
   ```

> [!tip] Read-only by default
> ທັງສອງ **read-only by default** (ປ້ອງກັນ agent ແກ້ຂໍ້ມູນຈິງໂດຍບໍ່ຕັ້ງໃຈ) — mysql ເປີດຂຽນໄດ້ດ້ວຍ env flag ເພີ່ມເຕີມ ເຊັ່ນ `ALLOW_INSERT_OPERATION=true`, `ALLOW_UPDATE_OPERATION=true`, `ALLOW_DELETE_OPERATION=true`

---

## ກວດສະຖານະທັງໝົດ

```bash
opencode mcp list
```

ຜົນລັບຕົວຢ່າງຕອນຕັ້ງຄ່າຄົບ (8 ເປີດ + 3 ປິດ):

```
✓ context7        connected
✓ playwright       connected
✓ chrome-devtools  connected
✓ graft            connected
✓ open-design      connected
✓ memory           connected
✓ sonarqube        connected
✓ trivy            connected
○ github           disabled
○ postgres         disabled
○ mysql            disabled
```
