---
tags: [project-doc, mcp, opencode, reference]
updated: 2026-08-22
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

## memory — จำ context ข้าม session (official reference server)

[`@modelcontextprotocol/server-memory`](https://github.com/modelcontextprotocol/servers/tree/main/src/memory) — เก็บ knowledge graph แบบ persistent ให้ agent จำ fact/context ของคุณข้าม session ได้ (เทียบเท่าฟีเจอร์ memory ของ Claude Code) ทำงานฝั่งเครื่องล้วนๆ ไม่มีการส่งข้อมูลออกไปไหน

### ขั้นตอนติดตั้ง

1. ไม่ต้องติดตั้งอะไรล่วงหน้า (`npx -y` ดึงให้เองตอนเรียกครั้งแรก)

2. เพิ่ม config ใน `opencode.jsonc` — ระบุ `MEMORY_FILE_PATH` เป็น path แบบ absolute เพื่อให้ไฟล์ความจำอยู่ตำแหน่งเดียวแน่นอนไม่ว่าจะเปิด opencode จากโปรเจกต์ไหน:

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

3. ทดสอบ:

   ```bash
   opencode mcp list      # ควรเห็น memory connected ทันที ไม่ต้องตั้งค่าอะไรเพิ่ม
   ```

> [!note] เก็บข้อมูลแบบไหน
> เก็บเป็น entities + observations ในไฟล์ `.jsonl` ธรรมดา (อ่าน/แก้ด้วยมือได้ถ้าจำเป็น) ไม่ใช่ vector database หรือ cloud service ใดๆ

---

## github — จัดการ issues/PR/code search ผ่าน structured tool (ปิดไว้ก่อน จนกว่าจะมี token)

GitHub MCP server อย่างเป็นทางการ (ทำโดย GitHub เอง) — ให้ agent เรียก issues, pull requests, code search ผ่าน tool ที่มีโครงสร้างชัดเจน แทนการสั่ง `git`/`gh` ผ่าน bash แบบ freeform

### ขั้นตอนติดตั้ง

1. สร้าง GitHub Personal Access Token ที่ **https://github.com/settings/personal-access-tokens/new** — แนะนำใช้ **Fine-grained token** (จำกัด scope ได้ละเอียดกว่า classic token) เลือก repository access และ permission ตามงานที่จะใช้ (เช่น Contents, Issues, Pull requests: Read and write)

2. ตั้ง environment variable `GITHUB_PERSONAL_ACCESS_TOKEN` เป็นค่า token ที่ได้ (ดู [[setup]] Part 2 สำหรับวิธีตั้ง env var แต่ละ OS)

3. เพิ่ม config ใน `opencode.jsonc`:

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

   `oauth: false` บอก OpenCode ให้ใช้ PAT ผ่าน header แทนการพยายาม auto-discover OAuth (ซึ่งต้องมี GitHub Copilot subscription) — `enabled: false` ไว้ก่อนจนกว่าจะพร้อมใช้จริง (ตั้งไว้แบบเดียวกับ postgres/mysql เพื่อไม่ให้ error รบกวนตอนยังไม่มี token)

4. พร้อมใช้เมื่อไหร่ เปลี่ยน `"enabled": false` → `true` แล้วทดสอบ:

   ```bash
   opencode mcp list      # ควรเห็น github connected
   ```

> [!warning] กิน context เยอะ
> เอกสารทางการของ GitHub เตือนไว้ว่า MCP นี้ "can add a lot of tokens to your context" — ถ้าเปิดใช้งานจริง ควรจำกัด toolset ที่เปิดไว้ให้แคบลงถ้า opencode รองรับ ไม่ใช่เปิดทุก capability พร้อมกัน

---

## sonarqube — code quality + security scan แบบ self-hosted (ผ่าน Docker)

[SonarSource/sonarqube-mcp-server](https://github.com/SonarSource/sonarqube-mcp-server) อย่างเป็นทางการ — ให้ agent เรียกดู quality gate, security hotspot, code smell, coverage ของโค้ดผ่าน tool call ตรงๆ ต่างจาก MCP ตัวอื่นในหน้านี้ตรงที่ **ต้องมี SonarQube server รันอยู่จริงก่อน** (self-hosted หรือ SonarCloud) — เลือกทาง self-hosted เพราะไม่ต้องพึ่ง service ภายนอก ข้อมูลโค้ดไม่ออกจากเครื่อง

> [!info] ทำไมไม่ใช้ Semgrep MCP แทน
> Semgrep เบากว่าและไม่ต้องมีเซิร์ฟเวอร์ แต่เจาะจงด้าน security scan อย่างเดียว — SonarQube ให้ทั้ง code quality (code smell, coverage, duplication) และ security hotspot ในตัวเดียว เลือกใช้ตามที่ต้องการความครอบคลุมมากกว่า

### Prerequisite — Docker Desktop

ต้องมี Docker Desktop ติดตั้งและ **engine กำลังรันอยู่** (ไม่ใช่แค่ติดตั้งแอปไว้เฉยๆ) เช็คได้ด้วย:

```powershell
docker version
```

ถ้าขึ้น error `open //./pipe/dockerDesktopLinuxEngine` แปลว่าแอปยังไม่ได้เปิด — เปิด Docker Desktop ทิ้งไว้ก่อน (ใช้เวลา bootstrap engine ~30-90 วินาทีหลังเปิดแอป)

> [!warning] `docker` อาจไม่อยู่บน PATH
> ตัวติดตั้ง Docker Desktop **ไม่ได้เพิ่ม path ของ `docker.exe` เข้า System PATH เสมอไป** (พบจริงว่าเครื่องที่ติดตั้งไว้นานแล้วบางเครื่องไม่มี) เช็คด้วย `Get-Command docker` — ถ้าไม่เจอ ให้ใช้ full path ตรงๆ แทนทั้งตอนทดสอบและใน MCP config: `C:\Program Files\Docker\Docker\resources\bin\docker.exe`

### ขั้นตอนที่ 1 — รัน SonarQube Server container

```bash
docker run -d --name sonarqube -p 9000:9000 \
  -v sonarqube_data:/opt/sonarqube/data \
  -v sonarqube_extensions:/opt/sonarqube/extensions \
  -v sonarqube_logs:/opt/sonarqube/logs \
  sonarqube:community
```

ใช้ named volume 3 ตัวให้ข้อมูล/extension/log อยู่ถาวรข้าม container restart — **ไม่ใส่ `--rm`** เพราะต้องการให้ container คงอยู่ถาวร ไม่ใช่แบบ ephemeral เหมือน MCP server

รอจน bootstrap เสร็จ (ปกติ 1-2 นาที) เช็คได้จาก log:

```bash
docker logs sonarqube | grep "SonarQube is operational"
```

ทดสอบว่าเว็บขึ้นแล้ว: เปิด **http://localhost:9000**

> [!note] Embedded H2 database พอสำหรับใช้คนเดียว
> SonarQube เตือนว่า "Embedded database should be used for evaluation purposes only" — สำหรับใช้งานคนเดียว/โปรเจกต์ส่วนตัวไม่มีปัญหา แต่ถ้าจะใช้กับทีมหรือ production จริงต้องเปลี่ยนไปต่อ PostgreSQL แยกตามเอกสารทางการของ SonarQube

### ขั้นตอนที่ 2 — Login ครั้งแรก + สร้าง User Token

1. เข้า **http://localhost:9000** login ด้วย `admin` / `admin` (default) — ระบบบังคับตั้งรหัสผ่านใหม่ทันที
2. ไปที่ **My Account → Security**
3. ที่ **Generate Tokens**: ตั้งชื่อ (เช่น `opencode-mcp`), Expires in `No expiration` (หรือกำหนดเองถ้าต้องการ)

> [!danger] Type ต้องเป็น "User Token" เท่านั้น — จุดที่พลาดง่ายที่สุด
> Dropdown **Type** มีให้เลือก 3 แบบ: Global Analysis Token, Project Analysis Token, User Token — MCP server **ใช้ได้แค่ User Token** เท่านั้น เพราะต้องเรียก Web API เต็มรูปแบบ (ดู issues, quality gate, project list) ไม่ใช่แค่ส่งผลสแกนแบบที่ Analysis Token ทำได้ ถ้าเลือกผิดจะได้ 401/403 ตอนเรียก tool จริง แม้ MCP server จะ "connected" เฉยๆ ก็ตาม (เพราะ connection ตรวจแค่ว่าต่อ server ได้ ไม่ได้ตรวจสิทธิ์ token ตอนนั้น)

4. กด Generate → คัดลอก token ทันที (โชว์ครั้งเดียว)

### ขั้นตอนที่ 3 — ตั้ง env var

ตั้ง `SONARQUBE_TOKEN` เป็นค่า token ที่ได้ (System Environment Variable บน Windows หรือ shell profile บน macOS/Linux — ดู [[setup]] Part 2)

> [!danger] อย่าใส่ token ตรงๆ ในไฟล์ config หรือแชท
> ใช้ `{env:SONARQUBE_TOKEN}` แทนเสมอ แม้จะเป็น server ที่รันบน localhost เท่านั้นก็ตาม — เป็นนิสัยที่ดีกว่าและกัน token หลุดไปอยู่ใน git history/session log โดยไม่ตั้งใจ

### ขั้นตอนที่ 4 — เพิ่ม config ใน `opencode.jsonc`

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

จุดสำคัญที่ต่างจาก config ตัวอย่างทั่วไปในเอกสารของ SonarQube เอง:

- **ใช้ full path ของ `docker.exe`** แทนชื่อ `docker` เปล่าๆ ตามเหตุผลใน prerequisite ด้านบน
- **`SONARQUBE_URL` ต้องเป็น `http://host.docker.internal:9000`** ไม่ใช่ `http://localhost:9000` — เพราะตัว MCP server รันอยู่**ใน container แยก** `localhost` ข้างในนั้นหมายถึงตัว container เอง ไม่ใช่เครื่องจริง `host.docker.internal` คือ DNS พิเศษที่ Docker Desktop ให้มาเพื่อชี้กลับไปที่เครื่อง host เสมอ
- `-e SONARQUBE_TOKEN` (ไม่มี `=value` ต่อท้าย) บอก Docker ให้ forward ค่าจาก environment ของ process ที่เรียก `docker run` (คือ opencode เอง) เข้า container — ทำงานคู่กับ `"environment"` block ด้านบนที่ resolve `{env:SONARQUBE_TOKEN}` ให้ opencode เห็นค่าจริงก่อนส่งต่อ

**pre-pull image ก่อนใช้งานจริงครั้งแรก** (กัน timeout 30 วินาทีไม่พอตอนต้องดาวน์โหลด image ~500MB+):

```bash
docker pull sonarsource/sonarqube-mcp
```

### ขั้นตอนที่ 5 — ทดสอบ

**ทดสอบ docker command ตรงๆ ก่อน** (แยกปัญหา MCP config ออกจากปัญหา docker/network):

```powershell
& "C:\Program Files\Docker\Docker\resources\bin\docker.exe" run --init --rm -i -e SONARQUBE_TOKEN -e SONARQUBE_URL=http://host.docker.internal:9000 sonarsource/sonarqube-mcp
```

ควรเห็น log แบบนี้ (รอ input อยู่เพราะเป็น stdio transport — ปกติ, กด Ctrl+C ออกได้):

```
INFO SonarQube MCP Server - Starting backend service
INFO SonarQube MCP Server - SonarQube MCP Server Started:
INFO SonarQube MCP Server - Transport: stdio
INFO SonarQube MCP Server - Status: Server ready - tools loading in background
```

ถ้าผ่าน ค่อยเช็คผ่าน opencode:

```bash
opencode mcp list      # ควรเห็น sonarqube connected
```

> [!important] "connected" ใน opencode mcp list แต่ agent เรียก tool ไม่ได้ — เช็ค VS Code ก่อน
> ปัญหาที่เจอจริงระหว่างตั้งค่า: ทดสอบ docker command ตรงๆ ผ่านหมด แต่ `opencode mcp list` ที่รันจาก **terminal ข้างใน VS Code** ยัง fail อยู่ดี — สาเหตุคือ terminal ใน VS Code เป็น child process ของตัว VS Code (`Code.exe`) ที่เปิดค้างมาตั้งแต่ก่อนตั้ง `SONARQUBE_TOKEN` เปิด terminal tab ใหม่ในนั้นไม่ช่วย เพราะ clone environment เดิมของ VS Code เอง ไม่ได้ไปอ่านค่าใหม่จาก Windows ต้อง**ปิด VS Code ทั้งแอปจริงๆ แล้วเปิดใหม่** (เช็ค Task Manager ว่าไม่มี `Code.exe` ค้างด้วย) ถึงจะเห็นค่าใหม่ — นี่คือกรณีที่ยืนยันจริงของ [[gotchas]] ข้อ 2 ตรงๆ ไม่ใช่ปัญหา config

### CLI/Tool ที่ได้

MCP server นี้ expose tool สำหรับ: analyze code, list issues, check quality gate status, get security hotspots, measure coverage — agent เรียกเองอัตโนมัติเวลาถูกขอให้ตรวจโค้ด/หา vulnerability

> [!note] โปรเจกต์ต้อง "Analyze" ก่อนถึงจะมีข้อมูล
> SonarQube server เปล่าๆ ไม่มีข้อมูลอะไรจนกว่าจะสแกนโปรเจกต์เข้าไปครั้งแรก (ผ่านหน้าเว็บ "Analyze new project" หรือให้ agent เรียก MCP tool สแกนให้) — ก่อนสแกน tool ส่วนใหญ่จะตอบว่าไม่มีข้อมูล ไม่ใช่ error

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

ผลลัพธ์ตัวอย่างตอนตั้งค่าครบ (7 เปิด + 3 ปิด):

```
✓ context7        connected
✓ playwright       connected
✓ chrome-devtools  connected
✓ graft            connected
✓ open-design      connected
✓ memory           connected
✓ sonarqube        connected
○ github           disabled
○ postgres         disabled
○ mysql            disabled
```
