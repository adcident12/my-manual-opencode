---
tags: [project-doc, gotchas, opencode, windows, troubleshooting]
updated: 2026-10-03
summary: ปัญหาที่เจอจริงระหว่างตั้งค่า OpenCode + MCP + Plugin บน Windows และวิธีแก้ที่ยืนยันแล้วว่าใช้ได้ (ข้อ 6 resolved โดยตัดสาเหตุทิ้ง หลังพบว่า graft CLI auto-refresh ในตัวทำให้ hook เดิมซ้ำซ้อน)
---

# Gotchas

ภาพรวมที่ [[index]] · การตั้งค่าที่ [[setup]]

รวมปัญหาที่เจอจริง 16 เรื่อง เรียงตามลำดับที่เจอระหว่างตั้งค่าจริง แต่ละข้อมีทั้ง **Impact** (ผลกระทบ) และวิธีแก้ที่ยืนยันแล้วว่าใช้ได้

---

## 1. โมเดล self-hosted กลายเป็น default model โดยไม่ตั้งใจ — พังการเชื่อมต่อกับเครื่องมือภายนอก

**Impact:** เมื่อสั่ง `opencode run` โดยไม่ระบุ `-m` OpenCode จะ fallback ไปที่ provider ที่มี credential จริงตัวแรก (ในกรณีนี้คือ self-hosted llama.cpp) ถ้าโมเดลนั้นช้า (บวกกับ context หนักจาก plugin/MCP หลายตัว) เครื่องมือภายนอกที่มี timeout สั้น เช่น OpenDesign wizard ที่ตั้งไว้ 45 วินาที จะ fail ทันที

**วิธียืนยัน:**

```bash
opencode run "say hi"
```

จับเวลาดู ถ้าเกิน budget ของเครื่องมือที่พังก็คือสาเหตุนี้แหละ

> [!tip] วิธีแก้
> ถ้าเครื่องมือภายนอกมี dropdown เลือกโมเดลได้ ให้เลือกโมเดล built-in ที่เร็ว เช่น `opencode/deepseek-v4-flash-free` (ไม่ต้องตั้ง API key เพิ่ม ตอบภายใน ~10 วินาที) ถ้าไม่มี dropdown ต้องตั้ง default model ของ opencode เองให้เร็วขึ้น แลกกับต้องพิมพ์ `-m` เองเวลาอยากใช้โมเดลบ้านสำหรับงานจริง

---

## 2. Windows process snapshot environment variable / PATH ตอน launch — ต้อง restart แอปหลังตั้งค่าใหม่

**Impact:** ตั้งค่า System Environment Variable ใหม่ หรือเพิ่มไฟล์ shim ในโฟลเดอร์ที่อยู่บน PATH อยู่แล้ว **จะไม่ถูกมองเห็น** โดย process ที่เปิดค้างอยู่ก่อนหน้า (VS Code, Electron app ต่างๆ) เพราะ Windows process รับ env/PATH มาตอน launch เท่านั้น ไม่ได้ poll ค่าใหม่แบบ live

**เจอจริง 2 ครั้ง:**

- ตั้งค่า env var API key ใหม่ ไม่เห็นค่าใน shell จนกว่าจะ restart VS Code
- สร้าง `od.cmd` shim ใหม่ ทำงานถูกต้องใน PowerShell ใหม่ แต่ OpenDesign app ที่เปิดค้างยังพังต่อจนกว่าจะปิดแอปทั้งหมด (ไม่ใช่แค่ปิดหน้าต่าง — Electron app มักมี daemon เบื้องหลังที่ยังรันอยู่แม้ปิดหน้าต่างแล้ว)

> [!tip] วิธีแก้
> ทุกครั้งที่ตั้งค่า env var/PATH ใหม่แล้ว "ยังไม่เห็นผล" ให้ restart แอปที่เกี่ยวข้องแบบเต็มรูปแบบก่อนสงสัยว่า config ผิด สำหรับ Electron app เช็ค Task Manager ว่ามี process ค้างอยู่ไหมด้วย ไม่ใช่แค่ปิดหน้าต่าง

---

## 3. superpowers ติดตั้งผ่าน git ไม่ได้ — แยกแยะ "บล็อกจริง" กับ "SSL cert ไม่ trust"

**Impact:** `plugin: ["superpowers@git+https://github.com/..."]` ล้มเหลว

**วิธีแยกแยะสาเหตุจาก error message:**

| Error | ความหมาย | วิธีแก้ |
| --- | --- | --- |
| หน้า block page ตรงๆ (เช่น FortiGate "Application Blocked") ตอนเข้า github.com ผ่านเบราว์เซอร์ | เครือข่ายบล็อกจริงตามนโยบาย IT | อย่าพยายามเลี่ยง — ใช้ local path ของ plugin แทน (ดู [[plugins]]) หรือขอ IT allowlist |
| `fatal: unable to access '...': unable to get local issuer certificate` | เครือข่ายอนุญาต แต่ `git` ไม่ trust corporate root CA ที่ SSL inspection ใช้ (browser trust เพราะ OS มี CA แต่ git ใช้ certificate store ของตัวเอง) | ต้องคุยกับผู้ใช้ก่อนแก้ เพราะเทคนิคคือ trust MITM cert ขององค์กร ไม่ควรทำเองโดยพลการ |

> [!important] บทเรียน
> error message ที่ต่างกันบอกสาเหตุคนละแบบ อย่าเดาว่า "GitHub บล็อก = ต้องหาทางเลี่ยง" เสมอไป ต้องดู error จริงก่อน

---

## 4. `od` (OpenDesign CLI) ไม่ได้อยู่ใน PATH หลังติดตั้ง — และ shim ธรรมดาก็ยังใช้งานไม่ได้

**Impact:** `od mcp install opencode` ใช้ไม่ได้, OpenDesign wizard's connectivity test ค้าง/timeout

### ขั้นที่ 1 — เช็คว่า `od` อยู่ใน PATH จริงไหม

```powershell
Get-Command od -All -ErrorAction SilentlyContinue
```

ถ้าไม่เจออะไรเลย (หรือเจอ `od.exe` ของ Git Bash's coreutils — octal dump tool คนละตัว ชื่อชนกันโดยบังเอิญ) แปลว่าตัวติดตั้งของ OpenDesign พลาดไม่ได้เพิ่ม PATH ให้

### ขั้นที่ 2 — หา CLI จริง (ย้ายที่อยู่หลังแอปอัปเดตตัวเอง)

หลังติดตั้งใหม่ๆ CLI อยู่ในโฟลเดอร์ติดตั้ง:

```
<LocalAppData>\Programs\Open Design\resources\app\prebundled\daemon\daemon-cli.mjs
```

> [!warning] ตั้งแต่ OpenDesign 0.22 โฟลเดอร์ติดตั้งไม่ใช่เวอร์ชันที่รันจริงแล้ว (พบ 2026-09-25)
> ตอนนี้แอปอัปเดตตัวเองผ่าน launcher ของตัวเอง และรันแต่ละเวอร์ชันจากโฟลเดอร์แยก:
> ```
> %APPDATA%\Open Design\launcher\channels\stable\namespaces\release-stable-win\versions\<version>\payload\
> ```
> เวอร์ชันที่ใช้อยู่จริงบันทึกไว้ที่ `...\release-stable-win\runtime.json` (`active.version`) ส่วนโฟลเดอร์ติดตั้งเดิมค้างอยู่ที่เวอร์ชันแรกที่ติดตั้ง — เครื่องที่พบปัญหานี้ยังเป็น 0.20.0 อยู่ ขณะที่แอปรัน 0.22.2 (และดาวน์โหลด 0.24.1 รอไว้แล้ว) shim ที่ชี้ตายตัวไปโฟลเดอร์ติดตั้งยังใช้ได้ แต่แอบรัน CLI เวอร์ชันเก่ากับ daemon เวอร์ชันใหม่กว่าอยู่เงียบๆ

### ขั้นที่ 3 — อย่ารัน CLI ด้วย system `node` ตรงๆ

> [!danger] จะพังตอนพยายามเปิดจริง
> ไม่ใช่ตอน `--help`/`--print` ซึ่งดูเหมือนใช้ได้! error จะโผล่เฉพาะตอน daemon พยายามเปิด database จริง:
>
> ```
> Error: The module '...\better_sqlite3.node' was compiled against a different
> Node.js version using NODE_MODULE_VERSION 145. This version of Node.js
> requires NODE_MODULE_VERSION 137.
> ```

สาเหตุ: native module (`better-sqlite3`) compile มาสำหรับ Node/Electron ABI ที่ bundle มากับตัวแอป ไม่ใช่ system Node — ทำให้ `--help`/`--print` (ที่ไม่แตะ DB) ดูเหมือนใช้ได้ปกติ หลอกให้คิดว่า fix แล้ว

**shim ที่ถูกต้อง — ตามเวอร์ชันที่ active อยู่เสมอ** มีสองไฟล์:

1. [`scripts/od.mjs`](../scripts/od.mjs) จาก repo นี้ → คัดลอกไปไว้ที่ `~/.config/opencode/scripts/od.mjs` ตัวนี้อ่าน `runtime.json` แล้วรัน `Open Design.exe` **ของเวอร์ชันนั้นเอง** ด้วย `ELECTRON_RUN_AS_NODE=1` กับ `daemon-cli.mjs` ของเวอร์ชันเดียวกัน (ถ้ายังไม่มี launcher runtime จะถอยไปใช้โฟลเดอร์ติดตั้ง) system `node` แค่รัน launcher ตัวเล็กนี้เท่านั้น — ตัว CLI จริงยังรันบน Node/ABI ที่ bundle มากับแอป ปัญหา native module ด้านบนจึงไม่กลับมาอีก
2. `~/AppData/Roaming/npm/od.cmd` (โฟลเดอร์เดียวกับที่ `opencode.cmd` อยู่ อยู่บน PATH จริงอยู่แล้ว):

   ```cmd
   @echo off
   rem Follows OpenDesign's active launcher version - see %USERPROFILE%\.config\opencode\scripts\od.mjs
   node "%USERPROFILE%\.config\opencode\scripts\od.mjs" %*
   ```

หลัง OpenDesign อัปเดตทุกครั้ง shim จะหยิบเวอร์ชันใหม่ไปใช้เอง — ไม่ต้องแก้อะไร

`ELECTRON_RUN_AS_NODE=1` คือ flag มาตรฐานของ Electron ที่ให้รันตัว .exe เป็น plain Node CLI (ใช้ Node/ABI ที่ bundle มาในแอปเอง แทนที่จะเปิด GUI) — CLI ของ OpenDesign เองก็ hint เรื่องนี้ไว้ใน `--help`: `"$OD_NODE_BIN" "$OD_BIN" tools ...` — "avoids relying on user PATH for od or node"

> [!note] shim เดิม (ชี้ตายตัวไปเวอร์ชันเดียว) — เก็บไว้อ้างอิง
> ```cmd
> @echo off
> setlocal
> set ELECTRON_RUN_AS_NODE=1
> "<Program Files>\Open Design\Open Design.exe" "<Program Files>\Open Design\resources\app\prebundled\daemon\daemon-cli.mjs" %*
> ```
> ถูกต้องสำหรับ OpenDesign ≤ 0.20 แต่จะค้างอยู่ที่เวอร์ชันเก่าแบบเงียบๆ ทันทีที่ launcher เริ่มอัปเดตแอป (ขั้นที่ 2)

### ขั้นที่ 4 — port ของ daemon ไม่ตายตัวแล้ว: อย่าล็อก `--daemon-url`

> [!warning] ตั้งแต่ 0.22 daemon ของ desktop app ใช้ port สุ่ม ไม่ใช่ 7456
> แอปเวอร์ชัน packaged สั่ง daemon ด้วย `OD_PORT` ที่ hardcode เป็น `"0"` (port ว่างตัวไหนก็ได้ — เช่น `63621`) จึงไม่มี setting หรือ env var ให้ล็อก port ได้ ไม่มีอะไรฟังอยู่ที่ `7456` อีกแล้ว และ config ที่เป็น `od mcp --daemon-url http://127.0.0.1:7456` จะได้ `MCP error -32000: Connection closed` **แม้จะเปิดแอปไว้อยู่ก็ตาม**

**วิธีแก้: รัน `od mcp` โดยไม่ใส่ `--daemon-url`** แล้วให้มันหา daemon เอง ลำดับการหา: flag `--daemon-url` → `OD_DAEMON_URL` → ถามแอปผ่าน sidecar pipe ส่วนตัว (`OD_SIDECAR_CLIENT_ENDPOINT`) → `127.0.0.1:7456` ทาง pipe ต้องใช้ env var ไม่กี่ตัว — ชุดเดียวกับที่แอปแจกให้เองที่ `GET <daemon>/api/mcp/install-info`:

| Env var | ค่า | ใช้ทำอะไร |
| --- | --- | --- |
| `OD_SIDECAR_CLIENT_ENDPOINT` | `\\.\pipe\open-design-sidecar-<hash>` | ถามแอปที่รันอยู่ว่าตอนนี้ daemon อยู่ที่ URL ไหน |
| `OD_DATA_DIR` | `%APPDATA%\Open Design\namespaces\release-stable-win\data` | ข้อมูลของแอปเอง (โปรเจกต์ชุดเดียวกับใน GUI) |
| `OD_MCP_BOOTSTRAP_COMMAND` + `OD_MCP_BOOTSTRAP_ARGS` | `Open Design.exe` ตัว launcher + `["--headless"]` | ถ้าแอปปิดอยู่ `od mcp` จะเปิดแอปแบบ headless (ไม่มีหน้าต่าง) แล้วรอ daemon |

ชื่อ pipe คือ `sha256(<ชื่อผู้ใช้ Windows> + channel/namespace/source/mode/app)` — ไม่มีเวอร์ชัน ไม่มี PID — จึงเหมือนเดิมทั้งตอนรีสตาร์ทแอป**และ**ตอนอัปเดต `od.mjs` คำนวณค่าทั้งสี่ตัวแล้วตั้งให้ `od mcp` อัตโนมัติ (ถ้าตั้งค่าไว้ใน environment แล้วจะใช้ค่านั้นก่อน) config ของ OpenCode จึงไม่ต้องมี port ตายตัว และไม่มีค่าเฉพาะเครื่องเลย — ดู [[mcp-servers]] หัวข้อ open-design

> [!warning] `od mcp install opencode` ที่รันจาก terminal ยังเขียน port ตายตัวแบบเดิม
> มันถาม launch spec จาก daemon ที่ `127.0.0.1:7456` — ซึ่งไม่ตอบแล้ว — เลยถอยไปเขียน `--daemon-url http://127.0.0.1:7456` ให้แก้ config เองตามที่เขียนไว้ใน [[mcp-servers]] แทน

เช็คว่าตอนนี้ daemon อยู่ port ไหน (PowerShell):

```powershell
$d = Get-CimInstance Win32_Process | Where-Object { $_.CommandLine -like '*daemon-sidecar*' }
$port = (Get-NetTCPConnection -State Listen -OwningProcess $d.ProcessId).LocalPort
Invoke-RestMethod "http://127.0.0.1:$port/api/health"            # {"ok":true,"version":"…"}
Invoke-RestMethod "http://127.0.0.1:$port/api/mcp/install-info"   # launch spec ของ MCP ที่แอปแจกเอง
```

> [!note] เปิดแบบ headless เองตอนแอปปิดอยู่ — มาจาก help ของ OpenDesign เอง ยังไม่ได้ทดสอบ
> `od mcp --help` ระบุว่า packaged install จะ "starts the signed Open Design app in --headless mode when its daemon is stopped" และ "re-discovers the registered runtime before calls" ที่ยืนยันแล้ว (2026-09-25) คือกรณีเปิดแอปไว้เท่านั้น — ทางที่ง่ายที่สุดยังเป็นการเปิดแอป OpenDesign ทิ้งไว้

> [!tip] เครื่องมือ debug ที่ช่วยได้มาก
> log ของ daemon เองที่ `~/AppData/Roaming/Open Design/namespaces/release-stable-win/logs/daemon/latest.log` — สั้นแต่ตรงประเด็น เห็น error/event ล่าสุดชัดเจนกว่าเดา error จาก GUI toast

---

## 5. ทดสอบผ่าน Bash (Git Bash) กับ PowerShell ได้ผลไม่ตรงกัน

**Impact:** คำสั่งเดียวกัน (`opencode mcp list`) ที่รันผ่าน Git Bash เจอ error ที่รันผ่าน PowerShell ไม่เจอ

**สาเหตุ:** Git Bash เติม `/usr/bin` เข้า PATH ของตัวเอง**ก่อน** Windows PATH ปกติ — โปรแกรมที่ชื่อชนกับ Unix tool (เช่น `od` ชนกับ GNU coreutils' octal-dump) จะ resolve ผิดตัวเฉพาะตอนรันผ่าน Git Bash เท่านั้น process ที่ spawn จาก PowerShell/cmd.exe/Explorer (รวมถึง Electron app ทั่วไป) ไม่เจอปัญหานี้

> [!tip] วิธีแก้/ป้องกัน
> เวลา debug ปัญหาที่เกี่ยวกับ PATH resolution บน Windows ให้ทดสอบผ่าน **PowerShell** ไม่ใช่ Git Bash เพื่อให้ผลตรงกับสภาพแวดล้อมจริงที่ผู้ใช้ทั่วไป/แอปอื่นๆ เจอ

---

## 6. Rebuild กับ ask ของ graft ชนกันได้ (race condition) — [RESOLVED 2026-09-13]

**Impact เดิม:** เรียก `graft ask` ระหว่างที่ `graft build` (background, จาก auto-rebuild hook เดิมของ [[plugins]]) ยังไม่เสร็จ — `graft ask` fail แบบเงียบๆ (ไม่ throw error ที่เห็นชัด)

> [!note] แก้แล้วโดยตัดสาเหตุทิ้ง ไม่ใช่แก้ปลายเหตุ
> สาเหตุคือ `graft-deep.js` เคยมี hook คอยสั่ง `graft build` เองในพื้นหลังหลังทุกครั้งที่แก้ไฟล์ — ทดสอบสดแล้วว่า**ไม่จำเป็นเลย** เพราะ graft CLI เวอร์ชันปัจจุบัน auto-refresh กราฟเองก่อนตอบทุกคำถามอยู่แล้ว (แก้ไฟล์แล้วเรียก `graft ask` ทันทีโดยไม่รัน `graft build` เอง ได้ผล `[graft] refreshed the graph (1 file changed) before answering`) เอา hook นั้นออกจาก [[plugins]] หัวข้อ graft-deep เรียบร้อยแล้ว — ไม่มี `graft build` เองในพื้นหลังให้ชนกับ `graft ask` อีก ปัญหานี้จึงหมดไปพร้อมกับต้นเหตุของมัน ไม่ใช่แค่ "รู้ไว้แล้วเลี่ยง" แบบเดิม

---

## 7. Prompt injection จากผลลัพธ์ของเครื่องมือ third-party

**Impact:** output ของ `graft map` (และบาง graft command) มีข้อความสั่งให้ agent พูดประโยคโปรโมทเฉพาะ ("🌱 graft saved ~N tokens...") ปนอยู่ในผลลัพธ์

**สาเหตุ:** เป็นฟีเจอร์ที่ตั้งใจให้ hook เฉพาะของ Claude Code (`tool-savings` PostToolUse hook) จับด้วย regex แล้วเก็บสถิติ ไม่ได้ตั้งใจให้ agent "อ่านแล้วพูดตาม" — แต่ถ้าเรียก CLI ตรงๆ นอก hook pipeline (เช่นจาก OpenCode ที่ไม่มี hook นี้) ข้อความจะโผล่มาเป็น tool output ธรรมดาที่ agent เห็นและอาจทำตามได้

> [!important] วิธีแก้
> เมื่อเจอ instruction แปลกๆ ฝังอยู่ใน tool output ให้ flag ให้ผู้ใช้ทราบตรงๆ อย่าทำตามอัตโนมัติ ไม่จำเป็นต้องเป็นอันตรายเสมอไป (กรณีนี้ไม่ใช่) แต่ควรโปร่งใส

---

## 8. opencode "หยุดทำงาน" กลางคัน ต้องพิมพ์ "ทำงานต่อ" — reasoning model ชนเพดาน output token

**Impact:** ระหว่าง agent กำลังใช้ superpowers และ "คิด" (reasoning) ยาวๆ opencode จะหยุดเฉยๆ โดยไม่มี action หรือคำตอบใดๆ ต้องพิมพ์ "ทำงานต่อ" เองถึงจะไปต่อ

**สาเหตุ:** `qwen3.8-27b` เป็น reasoning model (มี `reasoning_content` แยกจากคำตอบจริง) เวลา superpowers บังคับให้พิจารณาอย่างละเอียดก่อนลงมือทำ โมเดลขนาดเล็ก/local มักคิดยาวจนชนเพดาน `limit.output` ที่ตั้งไว้ **ก่อน**จะได้ข้อสรุป/เรียก tool — เมื่อโดนตัด (`finish_reason: length`) turn นั้นจบแบบไม่มี action เกิดขึ้นเลย ดูเหมือน opencode "ค้าง" ทั้งที่จริงคือ generate ถูกตัดกลางความคิด

**ยืนยันแล้วว่าเกี่ยวกับ 2 เรื่องนี้โดยเฉพาะ:**

1. **[Qwen's own recommendation](https://qwen.readthedocs.io/)** — output length แนะนำ 32,768 token สำหรับงานทั่วไป, สูงถึง 38,912 สำหรับงานซับซ้อน (คณิตศาสตร์/แข่งเขียนโค้ด) — ค่า default ที่ตั้งไว้ตอนแรก (8,192) ต่ำกว่าคำแนะนำทางการมาก
2. **[Known bug ของ opencode](https://github.com/anomalyco/opencode/issues/29363)** — opencode **cap `limit.output` ไว้ที่ 32,000 token เสมอ** ไม่ว่าจะตั้งในไฟล์ config สูงแค่ไหนก็ตาม (ยืนยันว่า "systemic design flaw" ยังไม่ถูกแก้ ใช้กับ opencode 1.18.18 จริง) — ตั้งสูงกว่า 32k ไปก็ไม่มีประโยชน์เพิ่ม

> [!important] ยืนยันด้วยตัวเองแล้ว (opencode 1.18.19)
> ทดสอบจริงโดยตั้ง local capture proxy แทน `baseURL` ชั่วคราวเพื่อดักดู request จริงที่ opencode ส่งออกไป — พบว่า field `max_tokens` ใน HTTP request จริงมีค่า **32000 เป๊ะ** (ไม่ใช่ 32768 ที่ตั้งไว้ใน `limit.output`) ยืนยันว่า bug ยังทำงานอยู่จริงบน opencode 1.18.19 ไม่ใช่แค่รายงานจาก community เฉยๆ

> [!tip] วิธีแก้ที่ยืนยันแล้ว
> เพิ่ม `limit.output` เป็น `32768` ใน config ของโมเดล (ตรงกับทั้งคำแนะนำของ Qwen และเพดานจริงที่ opencode ยอมรับได้):
> ```jsonc
> "limit": { "context": 131072, "output": 32768 }
> ```
> ถ้าต้องการมากกว่านั้น (งานซับซ้อนที่ Qwen แนะนำสูงถึง 38,912) ต้องเพิ่ม env var `OPENCODE_EXPERIMENTAL_OUTPUT_TOKEN_MAX=38912` ควบคู่ไปด้วย — แต่ community อธิบายว่าเป็น "poor workaround" มีข้อเสียตามชื่อ ควรลองแค่ 32768 ก่อน

> [!note] ไม่ต้องแก้ฝั่ง llama.cpp server
> `-n`/`--n-predict` ของ llama-server มีค่า default เป็น `-1` (ไม่จำกัด) อยู่แล้ว ถ้า `extraArgs` ไม่ได้ตั้ง flag นี้ไว้ server จะรับค่า `max_tokens` ที่ client (opencode) ส่งมาตรงๆ ไม่มีการ cap ซ้อนอีกชั้น — จุดที่ต้องแก้มีที่เดียวคือฝั่ง opencode config

> [!warning] "ทำงานต่อ" ไม่ใช่ resume การ generate เดิม
> Chat completion API ไม่มีกลไก resume แบบ token-level — พิมพ์ "ทำงานต่อ" คือการเปิด request ใหม่ทั้งหมดที่มีความคิดที่ถูกตัดเป็น context ให้โมเดลอ่านแล้วพยายามสานต่อ ไม่ใช่ต่อ token สุดท้ายจริงๆ สำหรับ reasoning model บางครั้งโมเดลจะ**คิดใหม่ทั้งหมด**แทนที่จะสานต่อความคิดเดิม เท่ากับเสีย token รอบแรกไปฟรีๆ — เพิ่มเพดาน `output` ตั้งแต่ต้นดีกว่าพึ่ง "ทำงานต่อ" เป็นทางแก้ถาวร

---

## 9. สิ่งที่ plugin แก้ใน `experimental.chat.messages.transform` หายไปหลัง step เดียว — OpenCode ไม่ได้บันทึกไว้

**Impact:** context ที่ graft-deep inject เข้าไป โมเดลเห็นแค่ step แรกของ turn พอ agent เรียก tool แล้ว prompt ของ step ถัดไปไม่มี context นั้นอีก — พบเมื่อ 2026-09-25 ระหว่างอัปเดต plugin ให้รองรับ graft 0.19.0

**สาเหตุ:** prompt loop ของ OpenCode โหลด message ทั้งหมดใหม่จาก storage ตอนต้น**ทุก** step (`session/prompt.ts`) แล้วค่อยเรียก hook กับสำเนาใหม่นั้น สิ่งที่ hook เติมเข้าไปจึงอยู่แค่การเรียก LLM ครั้งเดียว plugin ลอกแบบของ Claude Code มา (inject ครั้งเดียวแล้วข้าม message นั้น) แต่ output ของ hook `UserPromptSubmit` ใน Claude Code ถูกเขียนลง transcript ถาวร — output ของ transform ใน OpenCode ไม่ใช่ นอกจากนี้ hook เดียวกันยังถูกเรียกตอน compaction (`session/compaction.ts`) กับ history เก่าด้วย

> [!important] วิธีแก้ — มอง hook นี้ว่าเป็น "สร้าง prompt ใหม่ทุกครั้ง" ไม่ใช่ "แก้ history ครั้งเดียว"
> คำนวณสิ่งที่จะ inject ครั้งเดียวต่อ message เก็บ cache ตาม message ID แล้วแปะกลับทุกครั้งที่ถูกเรียก งานที่แพง (อย่าง `graft ask`) ให้รันเฉพาะตอน message **สุดท้าย**เป็นของ user รอบ compaction จะได้ไม่ไปกระตุ้นมัน โค้ดเต็มและเรื่องเฉพาะของ OpenCode อื่นๆ (synthetic part, spawn แบบ async): [[plugins]] หัวข้อ graft-deep

> [!tip] บทเรียน
> hook ชื่อคล้ายกันในสอง harness ไม่ได้แปลว่าทำงานเหมือนกัน ก่อน port พฤติกรรมข้ามกัน ให้อ่าน source ของ host ว่าเรียก hook ที่ไหน และ output ของมันถูกทำอะไรต่อ

---

## 10. `update-opencode.mjs` มองข้ามค่าจริงของ SonarQube container แบบเงียบๆ บน Windows

**Impact:** `--recreate-sonarqube` สร้าง container ใหม่ด้วยชื่อ volume แบบ default และ host port `9000` เสมอ ไม่ว่า container เดิมจะใช้ค่าอะไรจริง — บนเครื่องที่ SonarQube รันที่ `9001` (เพราะ `9000` มี service อื่นใช้อยู่) ถ้ารันไปจะย้าย SonarQube กลับไป `9000` และทำ MCP config ที่ชี้ไป `9001` พัง

**สาเหตุ:** สคริปต์รันทุกคำสั่งด้วย `shell: true` บน Windows (ที่จริงจำเป็นแค่กับ `.cmd` shim ของ npm) shell ต่อ argument กัน**โดยไม่ใส่ quote** `docker inspect sonarqube --format '{{json .Mounts}}'` จึงถูกตัดตรงช่องว่าง docker fail ด้วย `template parsing error: unclosed action` — แล้วสคริปต์ก็ถอยไปใช้ค่า default แบบเงียบๆ

> [!important] วิธีแก้ (อยู่ในสคริปต์ปัจจุบันแล้ว)
> ใช้ `shell: true` เฉพาะ npm shim ที่จำเป็น (`opencode`, `graft`, `npm`) ส่วนเครื่องมือที่เป็น `.exe` จริง (`docker`, `git`, `winget`, `trivy`) รันโดยไม่ผ่าน shell ขั้น recreate ตอนนี้อ่านทั้ง named volume **และ** host port จาก container เดิม (ถ้าไม่มี container ใช้ `9001` เป็น default) และ `docker inspect` รันได้แม้ตอน `--dry-run` preview จึงแสดงค่าจริง — ดู [[updating]]

> [!tip] บทเรียน
> fallback ที่กลบ error ทำให้ bug มองไม่เห็น ควร preview ด้วย `--dry-run` ก่อนเสมอ — ตอนนี้มันพิมพ์คำสั่ง `docker run -p <port>:9000 -v …` ที่จะใช้จริงออกมาให้ดู

---

## 11. prompt ส่วนใหญ่คือนิยาม tool ของ MCP — server ที่แทบไม่ได้ใช้ก็กิน token ทุก turn

**Impact:** ก่อนเริ่มทำงานอะไรเลย prompt แต่ละ turn หนัก ~43k tokens (131 tools) — หนึ่งในสามของ context 131k ของโมเดล local หายไปตั้งแต่ turn แรก ทำให้ compaction เกิดเร็วและทุก step ช้าลง

**สาเหตุ:** MCP server ทุกตัวที่ `enabled: true` ส่งนิยาม tool ทั้งหมดของมัน (และ instructions ของ server) ไปใน**ทุก** request ไม่ว่างานนั้นจะใช้หรือไม่ — วัดได้ว่า open-design ~6.6k, chrome-devtools ~6.4k, playwright ~4.5k tokens ทั้งที่ประวัติจริงมี open-design ถูกเรียก 1 ครั้ง และ playwright 33 ครั้งเทียบกับ chrome-devtools 541 ครั้ง (ทำงานเดียวกัน)

> [!important] วิธีแก้
> วัดก่อนด้วย `capture-server.mjs` + `analyze-prompt.mjs` และดูการใช้งานจริงด้วย `session-report.mjs usage` (ขั้นตอนเต็มใน [[tuning]]) แล้วปิด server ที่ใช้น้อยเป็นค่าเริ่มต้น (`"enabled": false`) เปิดเฉพาะโปรเจกต์ที่ต้องใช้ใน `<project>/opencode.json`: `{ "mcp": { "open-design": { "enabled": true } } }` — ปิด open-design + playwright แล้ว prompt เหลือ ~32.6k tokens (−25%)

> [!tip] บทเรียน
> `connected` ใน `opencode mcp list` บอกแค่ว่าเชื่อมต่อได้ ไม่ได้บอกว่าคุ้ม — ทุก MCP มีค่าใช้จ่ายคงที่ต่อ turn ให้วัดก่อนเพิ่มตัวใหม่ทุกครั้ง

---

## 12. คำสั่งของ skill ชนะ AGENTS.md — agent ข้าม graft เพราะ brainstorming สั่งให้อ่านไฟล์

**Impact:** ใน session จริง agent เรียก graft 25 ครั้ง แต่ `read` ทั้งไฟล์ 486 ครั้ง ทั้งที่ทุกโปรเจกต์มี `graft/` index และ AGENTS.md ระดับโปรเจกต์เขียนชัดว่าให้ใช้ graft ก่อน — ทดสอบครบวงจรแล้ว turn แรกไม่เรียก graft เลยสักครั้ง

**สาเหตุ:** ขั้นแรกของ `brainstorming` (superpowers) เขียนว่า *"Explore project context — check files, docs, recent commits"* — โมเดลทำตามคำสั่งของ skill ที่เพิ่งโหลด (`git log`, `read` โฟลเดอร์ทีละอัน) แทนคำสั่งใน AGENTS.md แม้ graft-deep จะ inject hint "use graft first" ไว้ใน prompt แล้วก็ตาม

> [!important] วิธีแก้
> เขียนกฎประสานงานใน **global** `~/.config/opencode/AGENTS.md` แบบเดียวกับกฎของ grilling ([[plugins]]): เมื่อ skill สั่งให้สำรวจโปรเจกต์ และโปรเจกต์มี `graft/` ให้ทำขั้นนั้นด้วย `graft_graft_repo_map` / `graft_graft_find_code` / `graft_graft_file_api` แล้ว `read` เฉพาะไฟล์ที่จะแก้ (ข้อความกฎเต็มใน [[tuning]]) — รันคำขอเดิมซ้ำ: graft 0 → 2 ครั้ง, `read` 7 → 2 ครั้ง

> [!tip] บทเรียน
> ทุก skill ที่มีคำสั่งแบบ "ทำ X ก่อน" อาจชนกับกฎใน AGENTS.md ได้ — วิธีที่ได้ผลคือเขียนกฎที่อ้างถึง skill นั้นตรงๆ ว่าในขั้นนั้นให้ทำอย่างไร ไม่ใช่เขียนกฎกว้างๆ แล้วหวังว่าโมเดลจะเลือกถูก

---

## 13. อ่านไฟล์เดิมซ้ำทั้งไฟล์หลัง compaction

**Impact:** ใน session ยาว การอ่านซ้ำไฟล์เดิมคิดเป็น 42–86% ของผลการอ่านทั้งหมด (session หนึ่ง 204 reads แต่มีไฟล์ไม่ซ้ำแค่ 34 ไฟล์)

**สาเหตุ:** แยกการอ่านซ้ำแต่ละครั้งตามสิ่งที่เกิดก่อนหน้า (`session-report.mjs rereads`): **76% เกิดทันทีหลัง compaction** — session ทั่วไป compact 4–10 ครั้ง และสรุปของ compaction ไม่เก็บเนื้อหาไฟล์ agent จึงต้องอ่านทั้งไฟล์ใหม่ ส่วนการอ่านซ้ำหลังแก้ไฟล์เองมีแค่ 17%

> [!important] วิธีแก้ (ยังไม่ได้ยืนยันกับ session ยาว)
> 1. ลด prompt ต่อ turn (ข้อ 11) ให้ compaction เกิดช้าลง
> 2. เปิด `"compaction": { "auto": true, "prune": true }` — ลบผลของ tool ที่เก่ากว่า 2 turn ทีละก้อน ≥ 20k tokens จึงไม่ทำให้ prompt cache ของ llama.cpp เสียทุก turn
> 3. กฎใน global AGENTS.md: หลัง compaction ให้ใช้ `graft skeleton` / `graft ask --source` แล้ว `read` ด้วย `offset`/`limit` เฉพาะช่วงที่ต้องการ
>
> วัดซ้ำด้วย `session-report.mjs rereads` หลังใช้งานจริงไปสักพัก — รายละเอียดใน [[tuning]]

---

## 14. memory MCP ติดตั้งแล้วแต่ไม่เคยถูกใช้

**Impact:** memory อยู่ใน KNOWLEDGE layer ของ [[architecture]] และกิน ~1.1k tokens ทุก turn แต่ใน 50 session ถูกเรียก 1 ครั้ง และไฟล์ `memory.jsonl` ไม่เคยถูกสร้างเลย

**สาเหตุ:** ไม่มีอะไรบอกโมเดลว่า**เมื่อไร**ควรบันทึกหรือค้น — คำอธิบายของ tool บอกแค่ว่ามันทำอะไรได้

> [!important] วิธีแก้
> เพิ่มกฎใน global AGENTS.md: ค้นด้วย `memory_search_nodes` ก่อนถามผู้ใช้เรื่องที่อาจเคยตอบแล้ว · บันทึกด้วย `memory_create_entities` / `memory_add_observations` (ขึ้นต้นด้วยวันที่) เมื่อผู้ใช้บอกความชอบที่ถาวรหรือได้ข้อสรุปที่ session ต่อไปต้องใช้ · ห้ามเก็บ secret หรือสิ่งที่ repo บันทึกไว้แล้ว — ทดสอบกับโมเดลจริง: session แรกบันทึก, session ใหม่ดึงกลับมาตอบถูก (ข้อความกฎเต็มใน [[tuning]])

---

## 15. skill ของ Claude Code และ `~/.agents` ปนเข้ามาใน OpenCode

**Impact:** บนเครื่องที่ติดตั้งเครื่องมือ AI หลายตัว `opencode debug skill` แสดง 86 skill แทน 25 ตัวตามคู่มือ — รายชื่อทั้งหมดถูกส่งทุก turn และโมเดลเล็กเลือก skill ผิดตัวได้ง่ายขึ้น (เช่น skill ทั่วไปอย่าง `truth-first` แย่งกับ workflow ของ superpowers)

**สาเหตุ:** OpenCode สแกน "external skills" จาก `~/.claude/skills/` และ `~/.agents/skills/` ให้อัตโนมัติ — และเครื่องมือบางตัวติดตั้ง skill ชุดเดียวกันลงทั้งสองที่ (symlink)

> [!important] วิธีแก้
> ตั้ง env var ระดับ user `OPENCODE_DISABLE_EXTERNAL_SKILLS=1` แล้วปิด/เปิด terminal และ editor ใหม่ (ข้อ 2) — ตรวจด้วย `opencode debug skill` ว่าเหลือเฉพาะ skill ตามคู่มือ
>
> **อย่าใช้** `OPENCODE_DISABLE_CLAUDE_CODE_SKILLS=1` อย่างเดียว — มันตัดแค่ `~/.claude/skills` (86 → 74 บนเครื่องที่ทดสอบ) skill ที่ถูก symlink ไว้ใน `~/.agents/skills` ด้วยจะยังเข้ามาได้ ถ้าต้องการ skill ตัวไหนใน OpenCode จริงๆ ให้ copy ไปไว้ที่ `~/.config/opencode/skills/<name>/`

---

## 16. (Windows) `od` ไปเจอ `od.exe` ของ Git แทน shim ของ OpenDesign

**Impact:** ทำ shim ตามข้อ 4 แล้ว แต่ `od --help` ยังพิมพ์ help ของ octal-dump และ MCP `open-design` เชื่อมต่อไม่ได้

**สาเหตุ:** ถ้าโฟลเดอร์ `...\Git\usr\bin` อยู่**ก่อน**โฟลเดอร์ที่วาง `od.cmd` ใน PATH (เช่นติดตั้ง Node ผ่าน nvm-windows ซึ่งใช้โฟลเดอร์อื่นแทน `%APPDATA%\npm`) Windows จะเจอ `od.exe` ของ Git ก่อนเสมอ — OpenCode ที่ spawn `od` ก็เจอตัวเดียวกัน

> [!important] วิธีแก้
> ไม่ต้องแก้ลำดับ PATH — ให้ MCP config เรียก shim ผ่าน node ตรงๆ:
> ```jsonc
> "open-design": {
>   "type": "local",
>   "command": ["node", "C:/Users/<user>/.config/opencode/scripts/od.mjs", "mcp"],
>   "timeout": 30000
> }
> ```
> ตรวจลำดับด้วย `Get-Command od -All` (PowerShell) — ตัวแรกในรายการคือตัวที่ถูกเรียก
