---
tags: [project-doc, setup, opencode, beginner-friendly]
updated: 2026-08-20
summary: คู่มือติดตั้ง OpenCode แบบละเอียดตั้งแต่เครื่องเปล่า — Node.js, Git, CLI, provider, MCP servers และ plugins ครบทุกขั้นตอน
---

# Setup

> ภาพรวม stack ทั้งหมดดูที่ [[index]] — หน้านี้คือขั้นตอนติดตั้งแบบละเอียด เขียนให้ทำตามได้ตั้งแต่ **เครื่องเปล่าที่ยังไม่มีอะไรเลย** ไปจนถึงพร้อมใช้งานจริง

> [!tip] ลำดับการอ่าน
> ทำตามลำดับ Part 0 → 1 → 2 → 3 → 4 → 5 ตามที่เขียนไว้ อย่าข้าม เพราะแต่ละ Part ขึ้นกับของที่ทำเสร็จใน Part ก่อนหน้า

---

## Part 0 — เตรียมเครื่องให้พร้อม (สำหรับเครื่องเปล่า)

ถ้าเครื่องมี Node.js และ Git อยู่แล้ว ข้ามไป [Part 1](#part-1-ติดตั้ง-opencode-cli) ได้เลย ถ้าไม่แน่ใจ เช็คก่อนด้วยคำสั่งนี้:

```bash
node --version
npm --version
git --version
```

ถ้าคำสั่งไหนขึ้น `command not found` / `ไม่รู้จักคำสั่ง` แปลว่ายังไม่มี ให้ติดตั้งตามข้างล่าง

### ติดตั้ง Node.js + npm

Node.js คือสิ่งที่ OpenCode และ MCP server เกือบทุกตัวต้องใช้รัน (npm มาพร้อม Node.js อัตโนมัติ ไม่ต้องติดตั้งแยก)

**Windows:**
1. ไปที่ [nodejs.org](https://nodejs.org/) → ดาวน์โหลดเวอร์ชัน **LTS** (ตัวที่แนะนำ ไม่ใช่ Current)
2. รันตัวติดตั้ง `.msi` กด Next ไปเรื่อยๆ ตามค่า default (ตัวติดตั้งจะเพิ่ม Node/npm เข้า PATH ให้เองอัตโนมัติ)
3. **ปิด terminal ทุกบานที่เปิดอยู่แล้วเปิดใหม่** (สำคัญ — terminal เก่าจะยังไม่เห็น PATH ที่เพิ่งอัปเดต ดูเหตุผลเพิ่มเติมที่ [[gotchas]] ข้อ 2)
4. ตรวจสอบ: `node --version` ควรขึ้นเลขเวอร์ชัน เช่น `v22.x.x`

**macOS:**
```bash
# ใช้ Homebrew (ถ้ายังไม่มี ติดตั้งจาก https://brew.sh ก่อน)
brew install node
```

**Linux (Debian/Ubuntu):**
```bash
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs
```

> [!note] เวอร์ชันขั้นต่ำ
> แนะนำ Node.js 20 ขึ้นไป (LTS ล่าสุด ณ ตอนเขียนคือ Node 22/24) เวอร์ชันเก่ากว่านี้บาง MCP server อาจใช้ไม่ได้

### ติดตั้ง Git

จำเป็นสำหรับติดตั้ง plugin ที่มาจาก `git+https://` (เช่น superpowers)

**Windows:** ดาวน์โหลดจาก [git-scm.com](https://git-scm.com/download/win) รันตัวติดตั้ง กด Next ตามค่า default ได้เลย (ค่า default รองรับการใช้งานทั่วไปเพียงพอ)

**macOS:** ปกติมีมาให้แล้ว (ลอง `git --version` — ถ้ายังไม่มี macOS จะเสนอให้ติดตั้ง Xcode Command Line Tools ให้เอง) หรือ `brew install git`

**Linux:** `sudo apt-get install git` (Debian/Ubuntu) หรือใช้ package manager ของ distro นั้นๆ

### เตรียมโมเดล LLM อย่างน้อย 1 ตัว

OpenCode ต้องมี "โมเดล" ให้คุยด้วยอย่างน้อย 1 ตัวถึงจะใช้งานได้จริง มี 3 ทางเลือก เลือกทางไหนก็ได้ตามที่มี:

| ทางเลือก | เหมาะกับใคร | ต้องตั้งค่าเพิ่มไหม |
| --- | --- | --- |
| **โมเดลฟรีในตัว OpenCode** (เช่น `opencode/deepseek-v4-flash-free`) | อยากลองใช้งานทันทีโดยไม่ตั้งค่าอะไรเลย | ไม่ต้อง — ใช้ได้เลยหลังติดตั้ง CLI |
| **Cloud provider** (OpenAI, Anthropic ฯลฯ) | มี API key ของ provider เหล่านี้อยู่แล้ว | ต้อง `opencode auth login` |
| **Self-hosted model** (llama.cpp, Ollama, vLLM ฯลฯ) | มีเซิร์ฟเวอร์รันโมเดลเองอยู่แล้ว อยากต่อเข้ามาใช้ | ต้อง config `provider` เอง — ดู [Part 2](#part-2-ตั้งค่า-model-provider) |

> [!tip] แนะนำสำหรับมือใหม่
> เริ่มจากโมเดลฟรีในตัวก่อน (ไม่ต้องตั้งค่าอะไร) แล้วค่อยเพิ่ม self-hosted/cloud provider ทีหลังเมื่อพร้อม — จะได้เห็นว่า OpenCode ทำงานได้จริงเร็วที่สุด ไม่ต้องรอตั้งค่าทุกอย่างให้ครบก่อน

---

## Part 1 — ติดตั้ง OpenCode CLI

```bash
npm install -g opencode-ai
```

ตรวจสอบว่าติดตั้งสำเร็จ:

```bash
opencode --version
```

ควรขึ้นเลขเวอร์ชัน เช่น `1.18.18`

### ทดสอบใช้งานทันที (ไม่ต้องตั้งค่าอะไรเพิ่ม)

```bash
opencode run -m opencode/deepseek-v4-flash-free "say hi"
```

ถ้าได้คำตอบกลับมา แปลว่า CLI ทำงานถูกต้องแล้ว พร้อมไปตั้งค่าส่วนเสริมต่อ

### รู้จัก config ของ OpenCode

Config หลักอยู่ที่ `~/.config/opencode/` — ใช้ **path เดียวกันทุก OS** (Windows/macOS/Linux ทั้งหมด ไม่มีข้อยกเว้น) โฟลเดอร์นี้อาจยังไม่มีตอนติดตั้งใหม่ๆ ให้สร้างเองได้ถ้าจำเป็น

ไฟล์ config ที่ OpenCode โหลด (และ merge เข้าด้วยกันถ้ามีมากกว่า 1 ไฟล์):

- `config.json`
- `opencode.json`
- `opencode.jsonc` *(รองรับ comment — แนะนำใช้ไฟล์นี้เป็นหลักสำหรับตั้งค่าเอง)*

> [!note] ทำไมอาจมี 2 ไฟล์
> บาง MCP installer (เช่น `od mcp install`) จะสร้าง `opencode.json` แยกเองอัตโนมัติ ในขณะที่เราตั้งค่าอย่างอื่นไว้ที่ `opencode.jsonc` — ไม่ต้องแปลกใจถ้าเจอทั้งสองไฟล์อยู่ด้วยกัน OpenCode จะ merge ให้เองไม่มีปัญหา

สร้างไฟล์ตั้งต้นด้วยมือ (ถ้ายังไม่มี):

```jsonc
// ~/.config/opencode/opencode.jsonc
{
  "$schema": "https://opencode.ai/config.json"
}
```

---

## Part 2 — ตั้งค่า Model Provider

ข้าม Part นี้ได้ถ้าจะใช้แค่โมเดลฟรีในตัว OpenCode ต่อไปเลย

### แบบ Self-hosted (ตัวอย่าง: llama.cpp server แบบ OpenAI-compatible)

เพิ่มใน `~/.config/opencode/opencode.jsonc`:

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
          "name": "แสดงชื่ออะไรก็ได้",
          "limit": { "context": 131072, "output": 8192 }
        }
      }
    }
  }
}
```

แทนที่:
- `home-llamacpp` — ชื่อ provider ตั้งเองได้ (จะใช้เรียกผ่าน `-m home-llamacpp/your-model-id`)
- `https://your-server/v1` — URL จริงของเซิร์ฟเวอร์คุณ
- `your-model-id` — ชื่อ model ตามที่ server รายงาน (เช็คได้จาก `curl https://your-server/v1/models`)

> [!warning] อย่าฝัง API key ตรงๆ ในไฟล์
> ใช้ `{env:VAR_NAME}` แทนการพิมพ์ค่า API key ตรงๆ ในไฟล์เสมอ — OpenCode จะไปดึงค่าจาก environment variable ที่ตั้งไว้แทน วิธีตั้ง env var:
>
> - **Windows:** เปิด "Edit the system environment variables" → Environment Variables → New (System variable) → ใส่ชื่อ `HOME_LLAMACPP_API_KEY` กับค่า API key
> - **macOS/Linux:** เพิ่มบรรทัด `export HOME_LLAMACPP_API_KEY="your-key"` ใน `~/.zshrc`, `~/.bashrc` หรือไฟล์ shell profile ที่ใช้ แล้ว `source` ไฟล์นั้นใหม่ (หรือเปิด terminal ใหม่)
>
> **ตั้งค่าเสร็จแล้วต้องปิด-เปิด terminal/แอปที่จะใช้ opencode ใหม่เสมอ** — process ที่เปิดค้างอยู่ก่อนหน้าจะยังไม่เห็นค่าใหม่ ดูรายละเอียดที่ [[gotchas]] ข้อ 2

### แบบ Cloud provider

```bash
opencode auth login
```

จะมี wizard ให้เลือก provider (OpenAI, Anthropic ฯลฯ) แล้วกรอก API key ตามขั้นตอน

### ตรวจสอบว่า provider ใช้งานได้

```bash
opencode models | grep home-llamacpp
opencode run -m home-llamacpp/your-model-id "say hi"
```

ถ้าได้คำตอบกลับมา แปลว่าต่อ provider สำเร็จแล้ว

---

## Part 3 — ติดตั้ง MCP Servers

MCP (Model Context Protocol) คือระบบที่ให้ OpenCode เรียกใช้ "เครื่องมือ" เพิ่มเติมได้ (ค้นหา docs, ควบคุมเบราว์เซอร์, query database ฯลฯ) MCP server ส่วนใหญ่ไม่ต้อง `npm install -g` ล่วงหน้า — OpenCode จะสั่ง `npx -y` ให้เองตอนต่อครั้งแรก

ตัวอย่าง config เบื้องต้น (เพิ่มใน `opencode.jsonc`):

```jsonc
{
  "mcp": {
    "context7": { "type": "remote", "url": "https://mcp.context7.com/mcp" },
    "playwright": { "type": "local", "command": ["npx", "@playwright/mcp@latest"], "timeout": 30000 },
    "chrome-devtools": { "type": "local", "command": ["npx", "-y", "chrome-devtools-mcp@latest", "--no-usage-statistics"], "timeout": 30000 }
  }
}
```

> [!info] รายละเอียดครบทุกตัว
> คู่มือติดตั้งแบบเจาะลึกทีละ MCP server (รวม graft, open-design, postgres/mysql) พร้อมขั้นตอนติดตั้ง prerequisite เฉพาะตัว อยู่ที่ [[mcp-servers]] — หน้านี้แสดงแค่ตัวอย่างภาพรวม

ตรวจสอบสถานะหลังเพิ่ม config:

```bash
opencode mcp list
```

---

## Part 4 — ติดตั้ง Plugins

### Plugin จาก npm/git package (ตัวอย่าง: superpowers)

```jsonc
{
  "plugin": ["superpowers@git+https://github.com/obra/superpowers.git"]
}
```

ปิดแล้วเปิด OpenCode ใหม่ (plugin โหลดตอนเริ่ม session เท่านั้น) แล้วตรวจสอบ:

```bash
opencode debug skill
```

> [!warning] ถ้าเครือข่ายบล็อก GitHub
> องค์กร/บริษัทหลายแห่งบล็อก github.com ผ่าน firewall ทำให้ติดตั้ง plugin แบบ git URL ไม่ได้ — ก่อนแก้ปัญหา **ต้องดู error message จริงก่อน** เพราะสาเหตุมี 2 แบบที่แก้ต่างกัน:
>
> 1. **เจอหน้า block page ตรงๆ** (เช่น "Application Blocked" ของ FortiGate) → เครือข่ายบล็อกจริงตามนโยบาย ห้ามพยายามเลี่ยง ให้ใช้วิธี local path แทน หรือขอ IT allowlist
> 2. **error เป็น `unable to get local issuer certificate`** → เครือข่ายอนุญาต แต่ `git` ไม่ trust certificate ที่องค์กรใช้ทำ SSL inspection (ต่างจาก browser ที่ trust เพราะ OS มี CA ติดตั้งไว้) — กรณีนี้แก้ได้ทางเทคนิค แต่ควรคุยกับผู้ใช้/IT ก่อนเสมอ
>
> รายละเอียดวิธีแก้ทั้งสองแบบเต็มๆ อยู่ที่ [[plugins]]

### Plugin ที่เขียนเอง (custom .js)

วางไฟล์ `.js` ที่ไหนก็ได้ (แนะนำ `~/.config/opencode/plugin/<name>.js` สำหรับใช้ทุกโปรเจกต์) แล้วเพิ่ม path ใน `plugin` array:

```jsonc
{
  "plugin": [
    "superpowers@git+https://github.com/obra/superpowers.git",
    "C:/Users/<user>/.config/opencode/plugin/my-plugin.js"
  ]
}
```

โครงสร้าง plugin ต้อง export ฟังก์ชัน async ที่รับ `{ directory }` แล้วคืน object ของ hooks — ตัวอย่างเต็มที่ [[plugins]] (graft-deep)

---

## Part 5 — เพิ่ม MCP เฉพาะโปรเจกต์ (per-project opt-in)

MCP บางตัวต้องมี credential/state เฉพาะโปรเจกต์ (เช่น database connection, code-graph ของ repo นั้นๆ) วิธีที่ปลอดภัยคือ:

1. ตั้ง `enabled: false` ไว้ที่ **global config** (`~/.config/opencode/opencode.jsonc`)
2. เปิดทับใน config **ระดับโปรเจกต์** — สร้างไฟล์นี้ไว้ที่ root ของ repo นั้น (OpenCode จะ merge ทับ global อัตโนมัติ ไม่ต้องตั้งอะไรเพิ่ม):

```jsonc
// project-root/opencode.jsonc
{
  "mcp": {
    "postgres": { "enabled": true }
  }
}
```

3. ตั้ง env var ที่ MCP นั้นต้องการ (เช่น `POSTGRES_CONNECTION_STRING`) ก่อนรัน `opencode` ในโปรเจกต์นั้น

---

## ตรวจสอบว่าติดตั้งครบทุกอย่าง

```bash
opencode mcp list        # เช็ค MCP servers ทั้งหมด
opencode debug skill     # เช็ค skill/plugin ที่โหลดสำเร็จ
opencode debug config    # ดู config ที่ resolve แล้วทั้งหมด
```

> [!danger] `opencode debug config` โชว์ API key แบบ plaintext
> คำสั่งนี้แสดงค่า env var ที่ resolve แล้วจริงๆ (ไม่ใช่ `{env:...}` placeholder) — ถ้าจะแปะผลลัพธ์แชร์ให้คนอื่นดู ต้องลบ/ปิดบังค่า `apiKey` ก่อนทุกครั้ง

---

## ขั้นตอนต่อไป

ตั้งค่าเสร็จแล้ว ไปอ่าน [[USER-MANUAL]] สำหรับวิธีใช้งานจริงวันต่อวัน หรือ [[gotchas]] ถ้าเจอปัญหาระหว่างทาง
