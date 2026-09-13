---
tags: [project-doc, setup, opencode, beginner-friendly]
updated: 2026-09-13
summary: ຄູ່ມືຕິດຕັ້ງ OpenCode ແບບລະອຽດຕັ້ງແຕ່ເຄື່ອງເປົ່າ — Node.js, Git, CLI, provider, MCP servers, plugins, skill ແບບ Agent Skills open standard ແລະ AGENTS.md (global vs project) ຄົບທຸກຂັ້ນຕອນ
---

# Setup

> ພາບລວມ stack ທັງໝົດເບິ່ງທີ່ [[index]] — ໜ້ານີ້ຄືຂັ້ນຕອນຕິດຕັ້ງແບບລະອຽດ ຂຽນໃຫ້ເຮັດຕາມໄດ້ຕັ້ງແຕ່ **ເຄື່ອງເປົ່າທີ່ຍັງບໍ່ມີຫຍັງເລີຍ** ໄປຈົນເຖິງພ້ອມໃຊ້ງານຈິງ

> [!tip] ລຳດັບການອ່ານ
> ເຮັດຕາມລຳດັບ Part 0 → 1 → 2 → 3 → 4 → 5 ຕາມທີ່ຂຽນໄວ້ ຢ່າຂ້າມ ເພາະແຕ່ລະ Part ອີງໃສ່ຂອງທີ່ເຮັດແລ້ວໃນ Part ກ່ອນໜ້າ

---

## Part 0 — ກຽມເຄື່ອງໃຫ້ພ້ອມ (ສຳລັບເຄື່ອງເປົ່າ)

ຖ້າເຄື່ອງມີ Node.js ແລະ Git ຢູ່ແລ້ວ ຂ້າມໄປ [Part 1](#part-1--ຕິດຕັ້ງ-opencode-cli) ໄດ້ເລີຍ ຖ້າບໍ່ແນ່ໃຈ ກວດກ່ອນດ້ວຍຄຳສັ່ງນີ້:

```bash
node --version
npm --version
git --version
```

ຖ້າຄຳສັ່ງໃດຂຶ້ນ `command not found` / ບໍ່ຮູ້ຈັກຄຳສັ່ງ ແປວ່າຍັງບໍ່ມີ ໃຫ້ຕິດຕັ້ງຕາມລຸ່ມນີ້

### ຕິດຕັ້ງ Node.js + npm

Node.js ຄືສິ່ງທີ່ OpenCode ແລະ MCP server ເກືອບທຸກໂຕຕ້ອງໃຊ້ແລ່ນ (npm ມາພ້ອມ Node.js ອັດຕະໂນມັດ ບໍ່ຕ້ອງຕິດຕັ້ງແຍກ)

**Windows:**
1. ໄປທີ່ [nodejs.org](https://nodejs.org/) → ດາວໂຫຼດເວີຊັນ **LTS** (ໂຕທີ່ແນະນຳ ບໍ່ແມ່ນ Current)
2. ແລ່ນຕົວຕິດຕັ້ງ `.msi` ກົດ Next ໄປເລື່ອຍໆ ຕາມຄ່າ default (ຕົວຕິດຕັ້ງຈະເພີ່ມ Node/npm ເຂົ້າ PATH ໃຫ້ເອງອັດຕະໂນມັດ)
3. **ປິດ terminal ທຸກບານທີ່ເປີດຢູ່ແລ້ວເປີດໃໝ່** (ສຳຄັນ — terminal ເກົ່າຈະຍັງບໍ່ເຫັນ PATH ທີ່ຫາກໍອັບເດດ ເບິ່ງເຫດຜົນເພີ່ມເຕີມທີ່ [[gotchas]] ຂໍ້ 2)
4. ກວດສອບ: `node --version` ຄວນຂຶ້ນເລກເວີຊັນ ເຊັ່ນ `v22.x.x`

**macOS:**
```bash
# ໃຊ້ Homebrew (ຖ້າຍັງບໍ່ມີ ຕິດຕັ້ງຈາກ https://brew.sh ກ່ອນ)
brew install node
```

**Linux (Debian/Ubuntu):**
```bash
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs
```

> [!note] ເວີຊັນຂັ້ນຕ່ຳ
> ແນະນຳ Node.js 20 ຂຶ້ນໄປ (LTS ຫຼ້າສຸດ ณ ຕອນຂຽນຄື Node 22/24) ເວີຊັນເກົ່າກວ່ານີ້ບາງ MCP server ອາດໃຊ້ບໍ່ໄດ້

### ຕິດຕັ້ງ Git

ຈຳເປັນສຳລັບຕິດຕັ້ງ plugin ທີ່ມາຈາກ `git+https://` (ເຊັ່ນ superpowers)

**Windows:** ດາວໂຫຼດຈາກ [git-scm.com](https://git-scm.com/download/win) ແລ່ນຕົວຕິດຕັ້ງ ກົດ Next ຕາມຄ່າ default ໄດ້ເລີຍ

**macOS:** ປົກກະຕິມີມາໃຫ້ແລ້ວ (ລອງ `git --version` — ຖ້າຍັງບໍ່ມີ macOS ຈະສະເໜີໃຫ້ຕິດຕັ້ງ Xcode Command Line Tools ໃຫ້ເອງ) ຫຼື `brew install git`

**Linux:** `sudo apt-get install git` (Debian/Ubuntu) ຫຼືໃຊ້ package manager ຂອງ distro ນັ້ນໆ

### ກຽມໂມເດວ LLM ຢ່າງໜ້ອຍ 1 ໂຕ

OpenCode ຕ້ອງມີ "ໂມເດວ" ໃຫ້ລົມນຳຢ່າງໜ້ອຍ 1 ໂຕຈຶ່ງໃຊ້ງານໄດ້ຈິງ ມີ 3 ທາງເລືອກ ເລືອກທາງໃດກໍໄດ້ຕາມທີ່ມີ:

| ທາງເລືອກ | ເໝາະກັບໃຜ | ຕ້ອງຕັ້ງຄ່າເພີ່ມບໍ່ |
| --- | --- | --- |
| **ໂມເດວຟຣີໃນຕົວ OpenCode** (ເຊັ່ນ `opencode/deepseek-v4-flash-free`) | ຢາກລອງໃຊ້ງານທັນທີໂດຍບໍ່ຕັ້ງຄ່າຫຍັງເລີຍ | ບໍ່ຕ້ອງ — ໃຊ້ໄດ້ເລີຍຫຼັງຕິດຕັ້ງ CLI |
| **Cloud provider** (OpenAI, Anthropic ຯລຯ) | ມີ API key ຂອງ provider ພວກນີ້ຢູ່ແລ້ວ | ຕ້ອງ `opencode auth login` |
| **Self-hosted model** (llama.cpp, Ollama, vLLM ຯລຯ) | ມີເຊີບເວີແລ່ນໂມເດວເອງຢູ່ແລ້ວ ຢາກຕໍ່ເຂົ້າມາໃຊ້ | ຕ້ອງ config `provider` ເອງ — ເບິ່ງ [Part 2](#part-2--ຕັ້ງຄ່າ-model-provider) |

> [!tip] ແນະນຳສຳລັບມືໃໝ່
> ເລີ່ມຈາກໂມເດວຟຣີໃນຕົວກ່ອນ (ບໍ່ຕ້ອງຕັ້ງຄ່າຫຍັງ) ແລ້ວຄ່ອຍເພີ່ມ self-hosted/cloud provider ພາຍຫຼັງເມື່ອພ້ອມ — ຈະໄດ້ເຫັນວ່າ OpenCode ເຮັດວຽກໄດ້ຈິງໄວທີ່ສຸດ ບໍ່ຕ້ອງລໍຕັ້ງຄ່າທຸກຢ່າງໃຫ້ຄົບກ່ອນ

---

## Part 1 — ຕິດຕັ້ງ OpenCode CLI

```bash
npm install -g opencode-ai
```

ກວດສອບວ່າຕິດຕັ້ງສຳເລັດ:

```bash
opencode --version
```

ຄວນຂຶ້ນເລກເວີຊັນ ເຊັ່ນ `1.18.18`

### ທົດລອງໃຊ້ງານທັນທີ (ບໍ່ຕ້ອງຕັ້ງຄ່າຫຍັງເພີ່ມ)

```bash
opencode run -m opencode/deepseek-v4-flash-free "say hi"
```

ຖ້າໄດ້ຄຳຕອບກັບຄືນມາ ແປວ່າ CLI ເຮັດວຽກຖືກຕ້ອງແລ້ວ ພ້ອມໄປຕັ້ງຄ່າສ່ວນເສີມຕໍ່

### ຮູ້ຈັກ config ຂອງ OpenCode

Config ຫຼັກຢູ່ທີ່ `~/.config/opencode/` — ໃຊ້ **path ດຽວກັນທຸກ OS** (Windows/macOS/Linux ບໍ່ມີຂໍ້ຍົກເວັ້ນ) ໂຟນເດີນີ້ອາດຍັງບໍ່ມີຕອນຕິດຕັ້ງໃໝ່ໆ ໃຫ້ສ້າງເອງໄດ້ຖ້າຈຳເປັນ

ໄຟລ໌ config ທີ່ OpenCode ໂຫຼດ (ແລະລວມກັນຖ້າມີຫຼາຍກວ່າ 1 ໄຟລ໌):

- `config.json`
- `opencode.json`
- `opencode.jsonc` *(ຮອງຮັບ comment — ແນະນຳໃຊ້ໄຟລ໌ນີ້ເປັນຫຼັກສຳລັບຕັ້ງຄ່າເອງ)*

> [!note] ເປັນຫຍັງອາດມີ 2 ໄຟລ໌
> ບາງ MCP installer (ເຊັ່ນ `od mcp install`) ຈະສ້າງ `opencode.json` ແຍກເອງອັດຕະໂນມັດ ໃນຂະນະທີ່ເຮົາຕັ້ງຄ່າອື່ນໄວ້ທີ່ `opencode.jsonc` — ບໍ່ຕ້ອງແປກໃຈຖ້າພົບທັງສອງໄຟລ໌ຢູ່ນຳກັນ OpenCode ຈະລວມໃຫ້ເອງບໍ່ມີບັນຫາ

ສ້າງໄຟລ໌ຕັ້ງຕົ້ນດ້ວຍມື (ຖ້າຍັງບໍ່ມີ):

```jsonc
// ~/.config/opencode/opencode.jsonc
{
  "$schema": "https://opencode.ai/config.json"
}
```

---

## Part 2 — ຕັ້ງຄ່າ Model Provider

ຂ້າມ Part ນີ້ໄດ້ຖ້າຈະໃຊ້ພຽງໂມເດວຟຣີໃນຕົວ OpenCode ຕໍ່ໄປເລີຍ

### ແບບ Self-hosted (ຕົວຢ່າງ: llama.cpp server ແບບ OpenAI-compatible)

ເພີ່ມໃນ `~/.config/opencode/opencode.jsonc`:

```jsonc
{
  "$schema": "https://opencode.ai/config.json",
  "provider": {
    "home-llamacpp": {
      "npm": "@ai-sdk/openai-compatible",
      "name": "Home llama.cpp",
      "options": {
        "baseURL": "https://your-server/v1",
        "apiKey": "{env:HOME_LLAMACPP_API_KEY}"
      },
      "models": {
        "your-model-id": {
          "name": "ຊື່ໃດກໍໄດ້",
          "limit": { "context": 131072, "output": 32768 }
        }
      }
    }
  }
}
```

ແທນທີ່:
- `home-llamacpp` — ຊື່ provider ຕັ້ງເອງໄດ້ (ຈະໃຊ້ເອີ້ນຜ່ານ `-m home-llamacpp/your-model-id`)
- `https://your-server/v1` — URL ຈິງຂອງເຊີບເວີເຈົ້າ
- `your-model-id` — ຊື່ model ຕາມທີ່ server ລາຍງານ (ກວດໄດ້ຈາກ `curl https://your-server/v1/models`)

> [!tip] ເປັນຫຍັງ output = 32768
> ຖ້າໂມເດວເປັນ reasoning model (ມີ thinking mode ເຊັ່ນ Qwen3) ເພດານ output ທີ່ຕ່ຳເກີນໄປເຮັດໃຫ້ agent "ຢຸດກາງຄັນ" ລະຫວ່າງຄິດໄດ້ — 32768 ຕົງກັບຄຳແນະນຳຂອງ Qwen ເອງສຳລັບວຽກທົ່ວໄປ ລາຍລະອຽດເຕັມເບິ່ງທີ່ [[gotchas]] ຂໍ້ 8

> [!warning] ຢ່າຝັງ API key ໂດຍກົງໃນໄຟລ໌
> ໃຊ້ `{env:VAR_NAME}` ແທນການພິມຄ່າ API key ໂດຍກົງໃນໄຟລ໌ສະເໝີ — OpenCode ຈະໄປດຶງຄ່າຈາກ environment variable ທີ່ຕັ້ງໄວ້ແທນ ວິທີຕັ້ງ env var:
>
> - **Windows:** ເປີດ "Edit the system environment variables" → Environment Variables → New (System variable) → ໃສ່ຊື່ `HOME_LLAMACPP_API_KEY` ກັບຄ່າ API key
> - **macOS/Linux:** ເພີ່ມແຖວ `export HOME_LLAMACPP_API_KEY="your-key"` ໃນ `~/.zshrc`, `~/.bashrc` ຫຼືໄຟລ໌ shell profile ທີ່ໃຊ້ ແລ້ວ `source` ໄຟລ໌ນັ້ນໃໝ່ (ຫຼືເປີດ terminal ໃໝ່)
>
> **ຕັ້ງຄ່າແລ້ວຕ້ອງປິດ-ເປີດ terminal/ແອັບທີ່ຈະໃຊ້ opencode ໃໝ່ສະເໝີ** — process ທີ່ເປີດຄ້າງຢູ່ກ່ອນໜ້າຈະຍັງບໍ່ເຫັນຄ່າໃໝ່ ເບິ່ງລາຍລະອຽດທີ່ [[gotchas]] ຂໍ້ 2

### ແບບ Cloud provider

```bash
opencode auth login
```

ຈະມີ wizard ໃຫ້ເລືອກ provider (OpenAI, Anthropic ຯລຯ) ແລ້ວປ້ອນ API key ຕາມຂັ້ນຕອນ

### ກວດສອບວ່າ provider ໃຊ້ງານໄດ້

```bash
opencode models | grep home-llamacpp
opencode run -m home-llamacpp/your-model-id "say hi"
```

ຖ້າໄດ້ຄຳຕອບກັບຄືນມາ ແປວ່າຕໍ່ provider ສຳເລັດແລ້ວ

---

## Part 3 — ຕິດຕັ້ງ MCP Servers

MCP (Model Context Protocol) ຄືລະບົບທີ່ໃຫ້ OpenCode ເອີ້ນໃຊ້ "ເຄື່ອງມື" ເພີ່ມເຕີມໄດ້ (ຄົ້ນຫາ docs, ຄວບຄຸມ browser, query database ຯລຯ) MCP server ສ່ວນຫຼາຍບໍ່ຕ້ອງ `npm install -g` ລ່ວງໜ້າ — OpenCode ຈະສັ່ງ `npx -y` ໃຫ້ເອງຕອນຕໍ່ຄັ້ງທຳອິດ

ຕົວຢ່າງ config ພື້ນຖານ (ເພີ່ມໃນ `opencode.jsonc`):

```jsonc
{
  "mcp": {
    "context7": { "type": "remote", "url": "https://mcp.context7.com/mcp" },
    "playwright": { "type": "local", "command": ["npx", "@playwright/mcp@latest"], "timeout": 30000 },
    "chrome-devtools": { "type": "local", "command": ["npx", "-y", "chrome-devtools-mcp@latest", "--no-usage-statistics"], "timeout": 30000 }
  }
}
```

> [!info] ລາຍລະອຽດຄົບທຸກໂຕ
> ຄູ່ມືຕິດຕັ້ງແບບເຈາະລຶກເທື່ອລະ MCP server (ລວມ graft, open-design, postgres/mysql) ພ້ອມຂັ້ນຕອນຕິດຕັ້ງ prerequisite ສະເພາະໂຕ ຢູ່ທີ່ [[mcp-servers]] — ໜ້ານີ້ສະແດງພຽງຕົວຢ່າງພາບລວມ

ກວດສອບສະຖານະຫຼັງເພີ່ມ config:

```bash
opencode mcp list
```

---

## Part 4 — ຕິດຕັ້ງ Plugins

### Plugin ຈາກ npm/git package (ຕົວຢ່າງ: superpowers)

```jsonc
{
  "plugin": ["superpowers@git+https://github.com/obra/superpowers.git"]
}
```

ປິດແລ້ວເປີດ OpenCode ໃໝ່ (plugin ໂຫຼດຕອນເລີ່ມ session ເທົ່ານັ້ນ) ແລ້ວກວດສອບ:

```bash
opencode debug skill
```

> [!warning] ຖ້າເຄືອຂ່າຍບລັອກ GitHub
> ອົງກອນ/ບໍລິສັດຫຼາຍແຫ່ງບລັອກ github.com ຜ່ານ firewall ເຮັດໃຫ້ຕິດຕັ້ງ plugin ແບບ git URL ບໍ່ໄດ້ — ກ່ອນແກ້ບັນຫາ **ຕ້ອງເບິ່ງ error message ຈິງກ່ອນ** ເພາະສາເຫດມີ 2 ແບບທີ່ແກ້ຕ່າງກັນ:
>
> 1. **ພົບໜ້າ block page ໂດຍກົງ** (ເຊັ່ນ FortiGate "Application Blocked") → ເຄືອຂ່າຍບລັອກຈິງຕາມນະໂຍບາຍ IT ຫ້າມພະຍາຍາມຫຼີກລ່ຽງ ໃຫ້ໃຊ້ວິທີ local path ແທນ ຫຼືຂໍ IT allowlist
> 2. **error ເປັນ `unable to get local issuer certificate`** → ເຄືອຂ່າຍອະນຸຍາດ ແຕ່ `git` ບໍ່ trust certificate ທີ່ອົງກອນໃຊ້ເຮັດ SSL inspection — ກໍລະນີນີ້ແກ້ໄດ້ທາງເທັກນິກ ແຕ່ຄວນລົມກັບຜູ້ໃຊ້/IT ກ່ອນສະເໝີ
>
> ລາຍລະອຽດວິທີແກ້ທັງສອງແບບເຕັມໆ ຢູ່ທີ່ [[plugins]]

### Plugin ຈາກ npm package (ຕົວຢ່າງ: ponytail)

ບໍ່ແມ່ນທຸກ plugin ຕ້ອງມາຈາກ git URL — ບາງໂຕເປັນ npm package ທຳມະດາ ຕິດຕັ້ງງ່າຍກວ່າເພາະບໍ່ມີບັນຫາເລື່ອງ GitHub ບລັອກ/SSL cert ຄື superpowers:

```jsonc
{
  "plugin": [
    "superpowers@git+https://github.com/obra/superpowers.git",
    "@dietrichgebert/ponytail"
  ]
}
```

ຣີສະຕາດ OpenCode ແລ້ວລອງແລ່ນ `/ponytail-help` ເພື່ອກວດວ່າ activate ສຳເລັດ — ລາຍລະອຽດ command/config ທັງໝົດເບິ່ງທີ່ [[plugins]]

### Plugin ຈາກ local git clone (ຕົວຢ່າງ: i-have-adhd)

ບາງ plugin ບໍ່ມີໃຫ້ເທິງ npm ແລະບໍ່ຮອງຮັບ `git+https://` ໂດຍກົງຜ່ານ `plugin` array — ຕ້ອງ clone source ມາໄວ້ໃນເຄື່ອງເອງກ່ອນ ແລ້ວຊີ້ path ໄປທີ່ໄຟລ໌ `.mjs`/`.js` ຂອງ plugin ຂ້າງໃນນັ້ນ:

```bash
git clone https://github.com/ayghri/i-have-adhd ~/.config/opencode/vendor/i-have-adhd
```

```jsonc
{
  "plugin": [
    "superpowers@git+https://github.com/obra/superpowers.git",
    "@dietrichgebert/ponytail",
    "C:/Users/<user>/.config/opencode/vendor/i-have-adhd/.opencode/plugins/i-have-adhd.mjs"
  ]
}
```

ຣີສະຕາດ OpenCode ແລ້ວພິມ `/i-have-adhd` ໃນ session ເພື່ອເປີດໃຊ້ — ລາຍລະອຽດ toggle/always-on ທັງໝົດເບິ່ງທີ່ [[plugins]]

### Plugin ທີ່ຂຽນເອງ (custom .js)

ວາງໄຟລ໌ `.js` ບ່ອນໃດກໍໄດ້ (ແນະນຳ `~/.config/opencode/plugin/<name>.js` ສຳລັບໃຊ້ທຸກ project) ແລ້ວເພີ່ມ path ໃນ `plugin` array:

```jsonc
{
  "plugin": [
    "superpowers@git+https://github.com/obra/superpowers.git",
    "C:/Users/<user>/.config/opencode/plugin/my-plugin.js"
  ]
}
```

ໂຄງສ້າງ plugin ຕ້ອງ export ຟັງຊັນ async ທີ່ຮັບ `{ directory }` ແລ້ວສົ່ງຄືນ object ຂອງ hooks — ຕົວຢ່າງເຕັມທີ່ [[plugins]] (graft-deep)

### Skill ດ່ຽວໆ ຕາມ Agent Skills open standard (ບໍ່ແມ່ນ plugin)

ບໍ່ແມ່ນຂອງເສີມທຸກໂຕຕ້ອງມາຈາກ `plugin` array — ບາງອັນເປັນພຽງໄຟລ໌ `SKILL.md` ດ່ຽວໆ ຕາມມາດຕະຖານເປີດ **Agent Skills** (Anthropic ເປັນຄົນເລີ່ມ ຕອນນີ້ເປັນ open standard ທີ່ຫຼາຍເຄື່ອງມືຮອງຮັບ ລວມ OpenCode) ວາງໄຟລ໌ຖືກບ່ອນກໍໃຊ້ໄດ້ເລີຍ ບໍ່ຕ້ອງແກ້ `opencode.jsonc`

OpenCode ຫາ skill ຈາກ 3 ບ່ອນ:

| ຕຳແໜ່ງ | ໃຊ້ໄດ້ກັບ |
| --- | --- |
| `<project>/.opencode/skills/<name>/SKILL.md` | ສະເພາະ project ນັ້ນ |
| `~/.config/opencode/skills/<name>/SKILL.md` | ທຸກ project (global) |
| `<project>/.claude/skills/<name>/SKILL.md` | compat ກັບ Claude Code (ໃຊ້ໄຟລ໌ດຽວກັນໄດ້ທັງສອງເຄື່ອງມື) |

ໂຄງສ້າງໄຟລ໌ຂັ້ນຕ່ຳ:

```markdown
---
name: my-skill
description: ອະທິບາຍສັ້ນໆ ວ່າ skill ນີ້ໃຊ້ຕອນໃດ (ໂມເດວໃຊ້ຂໍ້ຄວາມນີ້ຕັດສິນໃຈວ່າຈະເອີ້ນເມື່ອໃດ)
---

ເນື້ອຫາ instruction ເຕັມໆ ທີ່ຢາກໃຫ້ agent ເຮັດຕາມເມື່ອ skill ນີ້ຖືກເອີ້ນ
```

> [!warning] ບໍ່ແມ່ນ slash command ອັດຕະໂນມັດ (ຕ່າງຈາກ Claude Code)
> Skill ແບບນີ້ **ບໍ່ກາຍເປັນ `/my-skill`** ໃຫ້ພິມໂດຍກົງໃນ OpenCode — ໂມເດວເປັນຄົນຕັດສິນໃຈເອງວ່າຈະເອີ້ນ skill ໃດ ໂດຍທຽບຂໍ້ຄວາມທີ່ພິມກັບ field `description` ຂອງແຕ່ລະ skill (ຜ່ານ native `skill` tool) ດັ່ງນັ້ນ `description` ຕ້ອງຂຽນໃຫ້ຊັດພຽງພໍໃຫ້ໂມເດວຈັບຄູ່ຖືກ — ຖ້າຢາກໄດ້ຄວາມແນ່ນອນ 100% ແບບ slash command ຈິງ ຕ້ອງສ້າງເປັນ custom command ແຍກທີ່ `.opencode/commands/<name>.md` ແທນ (ເບິ່ງ [OpenCode Commands docs](https://opencode.ai/docs/commands/))

> [!note] Field ທີ່ OpenCode ບໍ່ຮູ້ຈັກຈະຖືກ ignore ງຽບໆ
> Skill ທີ່ port ມາຈາກ Claude Code ບາງໂຕມີ frontmatter field ສະເພາະຂອງ Claude Code ເຊັ່ນ `disable-model-invocation` — OpenCode ຮອງຮັບພຽງ `name`, `description`, `license`, `compatibility`, `metadata` ເທົ່ານັ້ນ field ອື່ນທີ່ບໍ່ຮູ້ຈັກຈະຖືກຂ້າມໄປງຽບໆ ບໍ່ error ບໍ່ຕ້ອງເອົາອອກເອງກ່ອນໃຊ້

ຕົວຢ່າງການຕິດຕັ້ງຈິງ (skill `grill-me`/`grilling` ຈາກ mattpocock/skills, ຜູກກັບ superpowers) ເບິ່ງທີ່ [[plugins]]

### AGENTS.md — instructions ລະດັບ global vs project

`AGENTS.md` ຄືໄຟລ໌ instruction ທີ່ OpenCode ອ່ານທຸກ session (ຄ້າຍ system prompt ເພີ່ມເຕີມ) ມີ 2 ລະດັບ:

1. **Project** — ໄລ່ຈາກ working directory ຂຶ້ນໄປຫາ `AGENTS.md` (ຫຼື `CLAUDE.md`) ໃນແຕ່ລະ repo — ໄຟລ໌ນີ້ຄືໄຟລ໌ທີ່ `graft init --agents agents --no-global` ຂຽນໃຫ້ອັດຕະໂນມັດຕໍ່ repo (ເບິ່ງ [[mcp-servers]])
2. **Global** — `~/.config/opencode/AGENTS.md` — ໃຊ້ກັບ**ທຸກ project** ບໍ່ມີ installer ໂຕໃດສ້າງໄຟລ໌ນີ້ໃຫ້ອັດຕະໂນມັດ ຕ້ອງສ້າງເອງ

> [!info] ຢືນຢັນຈາກການທົດສອບຈິງ — ໄຟລ໌ project ແລະ global ຖືກໃຊ້ນຳກັນ ບໍ່ແມ່ນເລືອກໄຟລ໌ດຽວ
> ທົດສອບຈິງເທິງ project ທີ່ມີທັງ project-level `AGENTS.md` (ຈາກ `graft init`) ແລະ global `~/.config/opencode/AGENTS.md` (ກົດ reconcile ຂອງ grill-me/grilling — ເບິ່ງ [[plugins]]) ພ້ອມກັນ — ໂມເດວອ້າງອິງເນື້ອຫາຈາກທັງສອງໄຟລ໌ໄດ້ໃນ turn ດຽວກັນ (ເຫັນໂດຍກົງຈາກ reasoning trace ທີ່ quote ປະໂຫຍກຈາກ global AGENTS.md) ສະຫຼຸບຄື **ກົດທີ່ຂຽນໄວ້ທີ່ global ຈະມີຜົນສະເໝີ ບໍ່ວ່າຈະມີໄຟລ໌ project ຢູ່ນຳຫຼືບໍ່**

> [!tip] ເມື່ອໃດຄວນຂຽນທີ່ global ແທນ project
> ຂຽນທີ່ global ເມື່ອກົດນັ້ນຄວນ apply "ທຸກ project ສະເໝີ" (ເຊັ່ນ ວິທີ reconcile skill ສອງໂຕທີ່ອາດຂັດແຍ້ງກັນ) ຂຽນທີ່ project ເມື່ອເປັນບໍລິບົດສະເພາະ repo ນັ້ນ (ເຊັ່ນ context graph ຂອງ graft) — ຕົວຢ່າງຈິງທີ່ຕ້ອງຂຽນທີ່ global ເບິ່ງທີ່ [[plugins]] ຫົວຂໍ້ grill-me/grilling

---

## Part 5 — ເພີ່ມ MCP ສະເພາະ project (per-project opt-in)

MCP ບາງໂຕຕ້ອງມີ credential/state ສະເພາະ project (ເຊັ່ນ database connection, code graph ຂອງ repo ນັ້ນ) ວິທີທີ່ປອດໄພຄື:

1. ຕັ້ງ `enabled: false` ໄວ້ທີ່ **global config** (`~/.config/opencode/opencode.jsonc`)
2. ເປີດທັບໃນ config **ລະດັບ project** — ສ້າງໄຟລ໌ນີ້ໄວ້ທີ່ root ຂອງ repo ນັ້ນ (OpenCode ຈະລວມທັບ global ອັດຕະໂນມັດ ບໍ່ຕ້ອງຕັ້ງຫຍັງເພີ່ມ):

```jsonc
// project-root/opencode.jsonc
{
  "mcp": {
    "postgres": { "enabled": true }
  }
}
```

3. ຕັ້ງ env var ທີ່ MCP ນັ້ນຕ້ອງການ (ເຊັ່ນ `POSTGRES_CONNECTION_STRING`) ກ່ອນແລ່ນ `opencode` ໃນ project ນັ້ນ

---

## ກວດສອບວ່າຕິດຕັ້ງຄົບທຸກຢ່າງ

```bash
opencode mcp list        # ກວດ MCP servers ທັງໝົດ
opencode debug skill     # ກວດ skill/plugin ທີ່ໂຫຼດສຳເລັດ
opencode debug config    # ເບິ່ງ config ທີ່ resolve ແລ້ວທັງໝົດ
```

> [!danger] `opencode debug config` ສະແດງ API key ແບບ plaintext
> ຄຳສັ່ງນີ້ສະແດງຄ່າ env var ທີ່ resolve ແລ້ວຈິງ (ບໍ່ແມ່ນ `{env:...}` placeholder) — ຖ້າຈະແປະຜົນລັບແຊຣ໌ໃຫ້ຄົນອື່ນເບິ່ງ ຕ້ອງລົບ/ປິດບັງຄ່າ `apiKey` ກ່ອນທຸກຄັ້ງ

---

## ຂັ້ນຕອນຕໍ່ໄປ

ຕັ້ງຄ່າແລ້ວ ໄປອ່ານ [[USER-MANUAL]] ສຳລັບວິທີໃຊ້ງານຈິງປະຈຳວັນ ຫຼື [[gotchas]] ຖ້າພົບບັນຫາລະຫວ່າງທາງ
