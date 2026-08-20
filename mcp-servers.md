---
tags: [project-doc, mcp, opencode, reference]
updated: 2026-08-20
summary: รายละเอียด MCP server แต่ละตัวที่ตั้งไว้ใน OpenCode — ขั้นตอนติดตั้ง, config, วิธีทดสอบ, ข้อควรระวัง
---

# MCP Servers

ภาพรวมที่ [[index]] · ขั้นตอนติดตั้ง OpenCode เองที่ [[setup]]

ทุก MCP ด้านล่างเพิ่มเข้า `mcp` object ใน `~/.config/opencode/opencode.jsonc` (global — ใช้ได้ทุกโปรเจกต์) เว้นแต่จะระบุไว้ว่าต้องตั้งต่อโปรเจกต์

> [!note] ก่อนเริ่ม
> หน้านี้สมมติว่าติดตั้ง Node.js/npm และ OpenCode CLI เรียบร้อยแล้ว ถ้ายังไม่ได้ทำ ย้อนกลับไปที่ [[setup]] Part 0–1 ก่อน

---

## context7 — ค้นหา docs library/framework

Remote MCP (ไม่ต้องรันอะไรบนเครื่อง ไม่ต้องติดตั้งอะไรล่วงหน้า) ใช้ค้นหา documentation ของ library/framework แบบเรียลไทม์แทนการพึ่งความจำของโมเดล — มีประโยชน์มากเมื่อ agent ต้องเขียนโค้ดกับ library เวอร์ชันใหม่ที่ความจำของโมเดลอาจล้าสมัยไปแล้ว

### ขั้นตอนติดตั้ง

1. ไม่ต้องติดตั้งอะไรเพิ่ม เพราะเป็น remote HTTP endpoint

2. เพิ่ม config ใน `opencode.jsonc`:

   ```jsonc
   "context7": { "type": "remote", "url": "https://mcp.context7.com/mcp" }
   ```

3. รีสตาร์ท OpenCode (หรือเปิด session ใหม่) แล้วเช็คสถานะ:

   ```bash
   opencode mcp list
   ```

   ควรเห็น `✓ context7 connected`

---

## playwright — ควบคุมเบราว์เซอร์ / e2e testing

MCP server ที่ควบคุมเบราว์เซอร์จริงผ่าน Playwright — ใช้สำหรับ automation, กรอกฟอร์ม, คลิกปุ่ม, ถ่าย screenshot และทดสอบ flow ของเว็บไซต์แบบ end-to-end

### ขั้นตอนติดตั้ง

1. ติดตั้ง Chromium ให้ Playwright ล่วงหน้า (ไม่บังคับ — ถ้าข้ามขั้นนี้ไป MCP server จะพยายามดาวน์โหลดให้เองตอนเรียกครั้งแรก แต่ทำล่วงหน้าจะกันปัญหา timeout ตอนใช้งานจริงครั้งแรก):

   ```bash
   npx playwright install
   ```

2. เพิ่ม config ใน `opencode.jsonc`:

   ```jsonc
   "playwright": { "type": "local", "command": ["npx", "@playwright/mcp@latest"], "timeout": 30000 }
   ```

   ตั้ง `timeout: 30000` เพราะรอบแรก npx ต้อง resolve/ดาวน์โหลด package ก่อน ค่า default ของ OpenCode (5000ms) มักไม่พอ

3. ทดสอบ:

   ```bash
   opencode mcp list
   ```

   > [!warning] รอบแรกอาจขึ้น failed
   > รอบแรกอาจขึ้น `failed`/timeout เพราะ npx กำลังดาวน์โหลด package อยู่เบื้องหลัง — รันคำสั่งซ้ำอีกครั้งหลังรอสักครู่ ถ้ายัง fail ให้เช็คว่า step 1 ผ่านหรือยัง

---

## chrome-devtools — debug หน้าเว็บสด

ต่างจาก playwright ตรงที่เน้น **debug** (console log, network request, performance trace) มากกว่า automation ล้วนๆ — ใช้เสริมกันได้ ไม่ซ้ำซ้อน เหมาะกับตอน agent ต้องหาสาเหตุว่าทำไมหน้าเว็บ error หรือช้า

### ขั้นตอนติดตั้ง

1. ต้องมี **Google Chrome** หรือ **Chrome for Testing** ติดตั้งในเครื่อง (รองรับอย่างเป็นทางการแค่ 2 ตัวนี้ — Chromium อื่นๆ อาจใช้ได้แต่ไม่รับประกัน)

2. เพิ่ม config ใน `opencode.jsonc`:

   ```jsonc
   "chrome-devtools": {
     "type": "local",
     "command": ["npx", "-y", "chrome-devtools-mcp@latest", "--no-usage-statistics"],
     "timeout": 30000
   }
   ```

   `--no-usage-statistics` ปิดการส่ง telemetry ไปที่ Google (เปิดอยู่โดย default ถ้าไม่ใส่ flag นี้)

3. ทดสอบ:

   ```bash
   opencode mcp list
   ```

---

## graft — code-graph / context retrieval (per-project)

[nanonets/graft](https://github.com/nanonets/graft) สร้างกราฟความสัมพันธ์ของโค้ด (ฟังก์ชันไหนเรียกอะไร ไฟล์ไหนเกี่ยวกับไฟล์ไหน) ให้ agent เข้าใจโครงสร้าง repo ได้เร็วโดยไม่ต้องอ่านทุกไฟล์ ต่างจาก 3 ตัวข้างบนตรงที่ **ต้องตั้งต่อโปรเจกต์** เพราะกราฟต้องสแกนโค้ดของ repo นั้นๆ จริงๆ

### ขั้นตอนติดตั้ง

1. ติดตั้ง CLI แบบ global (ทำครั้งเดียวต่อเครื่อง ใช้ได้กับทุกโปรเจกต์):

   ```bash
   npm install -g @nanonets/graft
   ```

2. เพิ่ม config ใน `opencode.jsonc` (global — ใช้ได้ทุกโปรเจกต์ที่ผ่าน step 3 แล้ว):

   ```jsonc
   "graft": { "type": "local", "command": ["npx", "-y", "@nanonets/graft", "mcp"], "timeout": 30000 }
   ```

3. **ทำต่อทุกโปรเจกต์ที่จะใช้** (ครั้งแรกครั้งเดียวต่อ repo หนึ่งๆ):

   ```bash
   cd my-project
   graft build                              # สแกนโค้ด สร้างกราฟ (structural, ไม่ต้องมี API key)
   graft init --agents agents --no-global   # เขียน AGENTS.md + opencode.json (mcp.graft) เฉพาะ repo นี้
   ```

   `--agents agents --no-global` จำกัดให้เขียนเฉพาะไฟล์ที่ OpenCode ใช้ (`AGENTS.md`, `opencode.json`) ไม่ไปยุ่งกับ Claude Code/.kiro/.gemini/Codex ที่อาจติดตั้งไว้อยู่แล้วในเครื่อง

4. ทดสอบ:

   ```bash
   cd my-project
   opencode mcp list      # ควรเห็น graft connected
   graft map                # ทดสอบ CLI ตรงๆ ด้วยก็ได้
   ```

### CLI commands ที่มีประโยชน์

| คำสั่ง | ใช้ทำอะไร |
| --- | --- |
| `graft map` | ภาพรวมโปรเจกต์ — ไฟล์ไหน function อะไรถูกเรียกบ่อย |
| `graft ask "<คำถาม>"` | ถามเป็นภาษาคน หาโค้ดที่เกี่ยวข้อง คืน file:line |
| `graft grep "<regex>"` | ค้นหาแบบ exhaustive กลุ่มตาม symbol |
| `graft callers <ชื่อฟังก์ชัน>` | ดูว่าใครเรียกฟังก์ชันนี้บ้าง |
| `graft skeleton <file>` | API surface ของไฟล์แบบไม่มี body |
| `graft check` | เช็คว่ากราฟ drift จากโค้ดจริงหรือยัง |
| `graft viz` | เปิดหน้าเว็บดู dependency graph แบบ interactive |

> [!warning] Prompt injection ที่เจอจริง
> output ของ `graft map`/บาง command มีข้อความแฝงสั่งให้ agent พูดประโยคโปรโมท ("🌱 graft saved ~N tokens...") — เป็นฟีเจอร์ที่ตั้งใจให้ hook ของ Claude Code จับด้วย regex (`tool-savings` hook) แต่ถ้าเรียก CLI ตรงๆ นอก pipeline ของ hook ข้อความนี้จะโผล่มาเป็น tool output ธรรมดาที่ agent เห็น ควรรู้ไว้และไม่ทำตามคำสั่งนั้นอัตโนมัติ

> [!info] Deep integration บน OpenCode
> การ auto-rebuild กราฟหลังแก้โค้ด + auto-inject context ต่อ prompt ไม่ได้มาพร้อม graft สำหรับ OpenCode (มีแค่ Claude Code) ถ้าอยากได้พฤติกรรมนี้ต้องเขียน custom plugin เอง — ดู [[plugins]] หัวข้อ graft-deep

---

## open-design — ดึงไฟล์จากโปรเจกต์ OpenDesign

[nexu-io/open-design](https://github.com/nexu-io/open-design) เป็นเครื่องมือ generate เว็บไซต์/prototype/สไลด์ผ่าน AI (ทางเลือกโอเพนซอร์สของ Claude Design) รายละเอียดการใช้งาน OpenDesign เอง (Studio, workflow เต็ม) ดูที่ [[USER-MANUAL]]

### ขั้นตอนติดตั้ง

1. ดาวน์โหลด **desktop app** จาก [open-design.ai](https://open-design.ai/) หรือ [GitHub Releases](https://github.com/nexu-io/open-design/releases) แล้วติดตั้งตามปกติ (แนะนำที่สุด — zero config ไม่ต้องมี Node/pnpm/clone เอง)

2. **(เฉพาะ Windows)** ตัวติดตั้งมักไม่เพิ่ม `od` เข้า PATH ให้ ต้องสร้าง shim เอง — ดูขั้นตอนเต็มที่ [[gotchas]] ข้อ 4 (สรุปสั้นๆ: สร้างไฟล์ `~/AppData/Roaming/npm/od.cmd` ที่เรียกตัวแอปจริงผ่าน `ELECTRON_RUN_AS_NODE=1`)

3. เช็คว่า `od` ใช้งานได้แล้ว (**เปิด terminal ใหม่** หลังทำ step 2 เสมอ):

   ```bash
   od --help
   ```

4. เชื่อมกับ OpenCode:

   ```bash
   od mcp install opencode
   ```

   คำสั่งนี้จะเขียน config ให้เองที่ `~/.config/opencode/opencode.json`:

   ```jsonc
   "open-design": {
     "type": "local",
     "command": ["od", "mcp", "--daemon-url", "http://127.0.0.1:7456"],
     "timeout": 30000,
     "enabled": true
   }
   ```

   แนะนำเพิ่ม `"timeout": 30000` เองถ้า `od mcp install` ไม่ใส่ให้ (ค่า default 5000ms อาจไม่พอตอน daemon ยังไม่ warm)

5. **เปิดแอป OpenDesign ทิ้งไว้** (หรือรัน `od --no-open` แบบ headless) — MCP นี้เป็นแค่ stdio proxy ไปหา daemon ที่ `127.0.0.1:7456` ถ้าไม่มี daemon รันอยู่จะเชื่อมต่อไม่ได้เลย

6. ทดสอบ:

   ```bash
   opencode mcp list      # ควรเห็น open-design connected
   ```

**MCP tools ที่ได้:** `list_projects`, `get_active_context`, `get_project`, `get_file`, `search_files`, `list_files`, `create_artifact`

> [!warning] ปัญหาที่พบบ่อยบน Windows
> ดูรายละเอียดเต็มที่ [[gotchas]] ข้อ 4 — ครอบคลุมทั้งปัญหา PATH และปัญหา native module ที่ shim ธรรมดาแก้ไม่ได้

---

## postgres / mysql — query database (ปิดไว้ก่อน, เปิดต่อโปรเจกต์)

ทั้งคู่เป็น local MCP ที่ต้องมี database server รันอยู่แล้ว (local หรือ remote) — MCP แค่เป็นสะพานเชื่อม ไม่ได้ติดตั้ง DB ให้

### ขั้นตอนติดตั้ง (ที่ global config — ตั้งไว้เป็น disabled)

1. ไม่ต้องติดตั้งอะไรล่วงหน้า (`npx -y` จะดึง package ให้เองตอนเปิดใช้งานจริง)

2. เพิ่ม config ใน `opencode.jsonc` โดยตั้ง `enabled: false` ไว้ก่อน:

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

> [!note] ทำไมต้องปิดไว้เป็น default
> connection string เป็นข้อมูลเฉพาะโปรเจกต์ ถ้าเปิดไว้ตลอดจะพยายามต่อ DB ทุกครั้งที่เปิด OpenCode ในโปรเจกต์ไหนก็ตาม แม้ไม่มี DB ก็ตาม ทำให้ error/รบกวนเปล่าๆ

### ขั้นตอนเปิดใช้งานจริงต่อโปรเจกต์

1. สร้าง (หรือแก้) ไฟล์ config ที่ **root ของโปรเจกต์นั้น** เพื่อเปิดทับ global:

   ```jsonc
   // my-project/opencode.jsonc
   {
     "mcp": {
       "postgres": { "enabled": true }
       // หรือ "mysql": { "enabled": true }
     }
   }
   ```

2. ตั้ง env var connection ก่อนเปิด opencode ใน terminal เดียวกัน:

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

   บน Windows PowerShell ใช้ `$env:VAR_NAME = "..."` แทน — ดู [[gotchas]] ข้อ 2 เรื่อง env var ต้อง restart แอปถ้าตั้งผ่าน System Environment Variables แทน

3. เปิด opencode ใน terminal เดียวกัน (ที่มี env var แล้ว) จาก root ของโปรเจกต์นั้น:

   ```bash
   cd my-project
   opencode
   ```

4. ทดสอบ:

   ```bash
   opencode mcp list      # ควรเห็น postgres/mysql เปลี่ยนจาก disabled เป็น connected
   ```

> [!tip] Read-only by default
> ทั้งคู่ **read-only by default** (ป้องกัน agent แก้ข้อมูลจริงโดยไม่ตั้งใจ) — mysql เปิดเขียนได้ด้วย env flag เพิ่มเติม เช่น `ALLOW_INSERT_OPERATION=true`, `ALLOW_UPDATE_OPERATION=true`, `ALLOW_DELETE_OPERATION=true`

---

## เช็คสถานะทั้งหมด

```bash
opencode mcp list
```

ผลลัพธ์ตัวอย่างตอนตั้งค่าครบ (5 เปิด + 2 ปิด):

```
✓ context7        connected
✓ playwright       connected
✓ chrome-devtools  connected
✓ graft            connected
✓ open-design      connected
○ postgres         disabled
○ mysql            disabled
```
