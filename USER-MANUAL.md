---
tags: [user-manual, getting-started, opencode, vibe-coding]
updated: 2026-09-13
summary: คู่มือใช้งาน OpenCode วันต่อวัน — vibe coding เว็บไซต์ workflow กับ graft, grill-me/grilling และ OpenDesign
---

# 📘 คู่มือการใช้งาน OpenCode สำหรับ Vibe Coding

> ตั้งค่าครบแล้วดู [[setup]] · รายละเอียด MCP/Plugin ดู [[mcp-servers]] และ [[plugins]] · ปัญหาที่เจอบ่อยดู [[gotchas]] · อัปเดต/อัปเกรดดู [[updating]]

---

## 📋 สารบัญ

- ภาพรวม — สถาปัตยกรรมของ setup นี้ + วงจรการทำงานระดับโปรเจกต์และระดับ agent
- เริ่มงานในโปรเจกต์ใหม่ — ทำตามลำดับ 6 ขั้น พร้อมจุดตรวจสอบทุกขั้น
- Vibe coding ทั่วไปกับ opencode — รวมตัวอย่างเต็ม 1 รอบทำงานจริง (จากคำสั่งถึง commit) และวิธีใช้ grill-me/grilling
- ใช้ graft ให้เข้าใจโค้ดเร็วขึ้น — พร้อมตัวอย่าง output จริงที่ต้องเจอ
- สร้างเว็บไซต์ด้วย OpenDesign (แล้วดึงมาต่อใน opencode)
- เลือกโมเดลให้เหมาะกับงาน
- ปัญหาที่พบบ่อย

> [!tip] มือใหม่เริ่มอ่านตามลำดับนี้
> หัวข้อ 1 (เข้าใจภาพรวมก่อน) → 2 (ทำตามเช็คลิสต์จริงในโปรเจกต์แรก) → 3 (ลองสั่งงานจริงตามตัวอย่าง) — ทำครบ 3 หัวข้อแรกแล้วจะใช้งานวันต่อวันได้เอง หัวข้อ 4-7 เป็นแบบอ้างอิง เปิดดูตอนต้องใช้

---

## 1. ภาพรวม

```mermaid
graph LR
    A[OpenDesign App<br/>Studio - chat + live preview] -->|spawn เป็น engine| B[OpenCode]
    B -->|MCP| C[context7 / playwright / chrome-devtools]
    B -->|MCP| D[graft - code graph]
    B -->|MCP| E[open-design - ดึงไฟล์]
    B -->|plugin| F[superpowers - skills]
    B -->|plugin| G[graft-deep - inject context]
    B -->|plugin| L[ponytail - code minimization]
    B -->|plugin, opt-in| M["i-have-adhd - terse output<br/>(/i-have-adhd ต่อ session)"]
    B -->|provider| H[home-llamacpp<br/>self-hosted model]
    E -.->|pull ไฟล์ที่ generate ไว้| I[โปรเจกต์จริงหน้าบ้าน+หลังบ้าน]
```

สอง entry point หลัก:

1. **เปิด opencode terminal ตรงๆ** ในโปรเจกต์โค้ดจริง — ใช้ตอนพัฒนา backend/full-stack เต็มรูปแบบ
2. **เปิดแอป OpenDesign** — ใช้ตอนอยากได้หน้าเว็บ/prototype เร็วๆ พร้อม live preview (OpenDesign เรียก opencode เป็น "เครื่องยนต์" เบื้องหลังให้เอง ไม่ต้องพิมพ์ opencode terminal เอง)

### วงจรการทำงานระดับโปรเจกต์ (macro)

ภาพรวมแบบวนซ้ำตั้งแต่ได้โจทย์จนถึง deploy แล้ววนกลับมารับโจทย์ใหม่/ปรับปรุงต่อ:

```mermaid
graph LR
    A["Brief<br/>โจทย์ที่อยากได้"] --> B["ออกแบบ/สร้างต้นแบบ<br/>OpenDesign Studio"]
    B --> C["ดึงเข้าโปรเจกต์จริง<br/>open-design MCP"]
    C --> D["พัฒนา backend/DB<br/>opencode + postgres/mysql MCP"]
    D --> E["ทดสอบ<br/>playwright / chrome-devtools MCP"]
    E --> Q["ตรวจคุณภาพ/ความปลอดภัย<br/>sonarqube + trivy MCP (quality gate)"]
    Q --> F["Deploy"]
    F -->|โจทย์ใหม่ / ปรับปรุง| A
```

ใช้ดูภาพรวมว่า "งานหนึ่งชิ้น" ควรไหลผ่านเครื่องมือไหนบ้างตามลำดับ — รายละเอียดแต่ละขั้นดูที่หัวข้อ 5 ด้านล่าง

### วงจรการทำงานของ agent ต่อ 1 คำสั่ง (micro)

ภายในแต่ละ turn ที่คุณพิมพ์คำสั่งให้ opencode เกิดอะไรขึ้นบ้างเบื้องหลัง (อิงจาก [[plugins]] และ [[mcp-servers]]):

```mermaid
graph LR
    A["User พิมพ์คำสั่ง"] --> B["graft-deep<br/>แทรก context ที่เกี่ยวข้อง"]
    B --> C["superpowers<br/>เลือก skill ที่เหมาะสม"]
    C --> D{"ต้องใช้ tool เพิ่มไหม?"}
    D -->|ค้น docs| E["context7"]
    D -->|เข้าใจโครงสร้างโค้ด| F["graft"]
    D -->|ทดสอบ/debug UI| G["playwright /<br/>chrome-devtools"]
    D -->|จำ context เก่า| H["memory"]
    D -->|ตรวจ quality/security| K["sonarqube /<br/>trivy"]
    E --> L["ponytail<br/>เช็ค decision ladder ก่อนเขียนโค้ด"]
    F --> L
    G --> L
    H --> L
    K --> L
    L --> I["แก้ไข/เขียนโค้ด"]
    I -->|คำสั่งถัดไป| A
```

> [!note] ไม่มีขั้น "auto-rebuild กราฟ" แยกแล้ว
> เดิม graft-deep มี hook คอย rebuild กราฟเองหลังแก้โค้ด — ตัดออกแล้วเพราะ graft CLI เวอร์ชันปัจจุบัน refresh กราฟให้เองก่อนตอบทุกคำถามอยู่แล้ว (verified ดู [[plugins]] หัวข้อ graft-deep) ไม่มีอะไรให้รอ ไม่มี node แยกในแผนภาพนี้อีกต่อไป — ความสดของกราฟเป็นเรื่องของ graft เอง ไม่ใช่ของ opencode

> [!note] ไม่ใช่ทุก turn จะครบทุกขั้น
> ถ้าคำสั่งสั้น/ไม่เกี่ยวกับโค้ด (เช่น "อธิบาย X ให้ฟัง") บาง node อาจถูกข้ามไป — แผนภาพนี้แสดง**เส้นทางที่เป็นไปได้ทั้งหมด** ไม่ใช่ทุก turn จะวิ่งผ่านทุกกล่อง

> [!note] Plugin ponytail
> plugin ponytail (ดู [[plugins]]) เป็นด่านสุดท้ายก่อนลงมือเขียนโค้ดจริง (โหนด L) — บังคับให้ agent ไล่ decision ladder (ไม่จำเป็นก็ไม่เขียน → reuse ของเดิม → standard library → native feature → dependency ที่มีอยู่ → one-liner → ค่อยเขียนใหม่ขั้นต่ำ) ทำงานคู่กับ superpowers/graft-deep โดยไม่ทับซ้อนกัน (superpowers เลือก workflow, graft-deep หา context, ponytail คุมปริมาณโค้ดที่เขียนออกมา)

> [!note] Plugin i-have-adhd — ไม่อยู่ในวงจรต่อ turn ด้านบน (จงใจ)
> ต่างจาก superpowers/graft-deep/ponytail ที่ทำงานอัตโนมัติทุก turn — i-have-adhd (ดู [[plugins]]) เป็น **opt-in ต่อ session**: ต้องพิมพ์ `/i-have-adhd` เองก่อนถึงจะเริ่มมีผล (เปลี่ยนแค่สไตล์การตอบให้ตรงประเด็น/ไม่อ้อมค้อม ไม่แตะ tool orchestration) เหมาะตอนต้องการคำตอบไว ไม่ต้องการคำอธิบายยาว — ปิดด้วย `stop adhd mode` เมื่อไหร่ก็ได้

> [!note] Skill grill-me / grilling — ไม่ใช่ plugin แยก แต่ผูกกับโหนด C
> ไม่ได้อยู่ในแผนภาพเป็นโหนดแยก เพราะเป็น skill (ไฟล์ `SKILL.md` เดี่ยวๆ ตาม Agent Skills open standard — ดู [[setup]]) ไม่ใช่ plugin แต่ทำงานที่โหนด C เดียวกับ superpowers: เมื่อ agent เลือก `brainstorming` สำหรับงานสร้างฟีเจอร์ใหม่ จะใช้ format คำถามแบบ batch ของ `grilling` แทนการถามทีละข้อ (หรือเรียก `grilling` เดี่ยวๆ ถ้าผู้ใช้แค่อยากสัมภาษณ์ตัวเอง ไม่ได้จะ implement ทันที) วิธีใช้จริงดูหัวข้อ 3 ด้านล่าง รายละเอียดการติดตั้ง/reconcile เต็มๆ ดูที่ [[plugins]]

---

## 2. เริ่มงานในโปรเจกต์ใหม่ — ทำตามลำดับนี้ทีละขั้น

ทำครั้งเดียวต่อโปรเจกต์หนึ่งๆ (ไม่ต้องทำซ้ำทุกครั้งที่เปิด opencode) แต่ละขั้นมีจุดตรวจสอบกำกับไว้ — ถ้าขั้นไหนไม่ได้ผลตามที่บอก **หยุดตรงนั้นก่อน** ค่อยไปต่อ อย่าข้าม เพราะขั้นหลังพึ่งขั้นก่อนหน้า

**ขั้น 1 — เข้าโฟลเดอร์โปรเจกต์**

```bash
cd my-new-project
# ถ้ายังไม่มีโฟลเดอร์/repo: mkdir my-new-project && cd my-new-project && git init
```

**ขั้น 2 — สร้าง context graph ด้วย graft** (ข้ามขั้นนี้ได้ถ้าไม่ได้ติดตั้ง graft ไว้ — ดู [[mcp-servers]] ก่อนถ้ายังไม่เคยติดตั้ง)

```bash
graft build
```

✅ **ต้องเห็น:** `parsing 1/N: ...` ไล่จนถึง `N/N` แล้วจบโดยไม่มี error — ได้โฟลเดอร์ `graft/` ใหม่ในโปรเจกต์ (ถูกใส่เข้า `.gitignore` ให้อัตโนมัติ ไม่ต้อง commit)

```bash
graft init --agents agents --no-global
```

✅ **ต้องเห็น:** ไฟล์ `AGENTS.md` และ `opencode.json` (มี `mcp.graft`) ถูกสร้าง/แก้ที่ root โปรเจกต์ — เปิดดูว่ามีบล็อก `<!-- graft:start -->...<!-- graft:end -->` จริง

**ขั้น 3 — ยืนยันว่า graft ต่อกับ opencode สำเร็จ**

```bash
opencode mcp list
```

✅ **ต้องเห็น:** แถว `graft` สถานะ `connected` ถ้าไม่ขึ้น ให้เช็ค [[gotchas]] ก่อน

```bash
graft map
```

✅ **ต้องเห็น:** สรุป `repo map — N files · N symbols · N edges · <ภาษาหลัก>` พร้อม dir cluster/hub — ถ้าคำสั่งนี้ทำงาน แปลว่า CLI พร้อมใช้แล้วไม่ว่า MCP จะต่อสำเร็จหรือไม่ก็ตาม (ช่วยแยกปัญหาว่าเป็นที่ตัว graft เองหรือที่การต่อ MCP)

**ขั้น 4 — (เฉพาะกรณีต้องใช้) เปิด MCP เฉพาะโปรเจกต์**

ถ้าโปรเจกต์นี้ต้องต่อฐานข้อมูล สร้าง config เฉพาะ repo นี้ (ไม่กระทบโปรเจกต์อื่น):

```jsonc
// my-new-project/opencode.jsonc
{ "mcp": { "postgres": { "enabled": true } } }
```

ตั้ง env var **ก่อน** เปิด opencode ทุกครั้ง (ตั้งครั้งเดียวใน shell profile ก็ได้ ไม่ต้องพิมพ์ทุกครั้ง):

```bash
export POSTGRES_CONNECTION_STRING="postgresql://user:pass@host/db"
```

**ขั้น 5 — เปิด opencode ครั้งแรกในโปรเจกต์นี้**

```bash
opencode
```

ลองพิมพ์คำถามที่ต้องอ้างอิงโค้ดจริง เช่น `สรุปโครงสร้างโปรเจกต์นี้ให้หน่อย` หรือ `entry point ของโปรเจกต์นี้อยู่ไฟล์ไหน`

✅ **ต้องเห็น:** คำตอบอ้างอิงชื่อไฟล์/ฟังก์ชันจริงในโปรเจกต์ (ไม่ใช่คำตอบทั่วไปลอยๆ) — ถ้าใช่ แปลว่า graft/context ทำงานครบวงจรแล้ว

**ขั้น 6 — (แนะนำ) ยืนยันว่า skill/plugin โหลดครบ**

```bash
opencode debug skill
```

✅ **ต้องเห็น:** skill จาก `superpowers` ครบ 14 ตัว (`brainstorming`, `systematic-debugging`, `writing-plans`, ...), skill ของ `ponytail` (`ponytail`, `ponytail-review`, ...), `i-have-adhd`, และ `grill-me`/`grilling` ถ้าติดตั้งไว้ (ดู [[plugins]] ว่าแต่ละตัวคืออะไร)

> [!tip] ทำครบ 6 ขั้นแล้วไปหัวข้อ 3 ได้เลย
> จากนี้ไม่ต้องทำเช็คลิสต์นี้ซ้ำอีกสำหรับโปรเจกต์เดิม — เปิด `opencode` แล้วใช้งานได้ตามหัวข้อ 3 ทันที ทำเช็คลิสต์นี้ใหม่เฉพาะตอนเริ่มโปรเจกต์ใหม่เท่านั้น

---

## 3. Vibe Coding ทั่วไปกับ opencode

เปิด TUI แล้วคุยเป็นภาษาธรรมชาติได้เลย:

```bash
opencode
```

หรือรันแบบ non-interactive (headless, ใช้ script/automation ได้):

```bash
opencode run "สร้างฟังก์ชัน reverse string เป็น one-liner python"
opencode run -m home-llamacpp/qwen3.8-27b "..."   # ระบุโมเดลเฉพาะ
```

ระหว่างคุย agent จะเลือกใช้ tool เอง (context7 หา docs, playwright/chrome-devtools debug เบราว์เซอร์, graft เข้าใจโครงสร้างโค้ด) — ไม่ต้องสั่งเจาะจงว่า "ใช้ tool X" เว้นแต่อยากบังคับ

### ตัวอย่างเต็มหนึ่งรอบ (จากคำสั่งถึง commit)

แผนภาพ "วงจรการทำงานของ agent ต่อ 1 คำสั่ง" ในหัวข้อ 1 เป็นภาพรวมนามธรรม — ตัวอย่างนี้คือรอบทำงานจริงที่เกิดขึ้นจริง (สรุปจาก session จริงที่ทดสอบ ไม่ใช่สมมติ) เพื่อให้เห็นว่าแต่ละกล่องในแผนภาพแปลงเป็นสิ่งที่เห็นบนหน้าจอจริงอย่างไร:

1. **พิมพ์คำสั่ง:** `ช่วยเพิ่มด่าน 3 ให้เกมหน่อย`
2. **superpowers เลือก skill** — เจอว่าเป็นงานสร้างฟีเจอร์ใหม่ → เรียก `brainstorming` (เห็นได้จาก agent พูดถึงการ "classify scope" เป็น bounded/architectural ก่อน)
3. **graft หาโค้ดที่เกี่ยวข้อง** — agent เรียก graft เอง (`graft_find_code`/`graft_file_api` ผ่าน MCP) หาว่าระบบด่านปัจจุบันทำงานยังไง แทนที่จะเปิดอ่านทุกไฟล์เอง — เห็นได้จากข้อความสรุป fact ที่อ้าง `file:line` ของจริง
4. **ถามคำถามชี้แจงแบบ batch (grilling format)** — ยิงคำถามพร้อมกันหลายข้อ พร้อมคำแนะนำ `➡️` ต่อท้าย (ดูหัวข้อถัดไปว่า format แบบนี้มาจากไหน)
5. **ตอบคำถาม** — พิมพ์สั้นๆ เช่น `ตามแนะนำทั้งหมด`
6. **ponytail เช็ค decision ladder** — ก่อนเขียนโค้ดใหม่ เช็คว่ามีของเดิมให้ reuse ไหม (เห็นได้จากโค้ดที่ออกมามักแก้ไฟล์เดิม/เพิ่ม field ในโครงสร้างข้อมูลที่มีอยู่ แทนที่จะสร้างระบบใหม่คู่ขนาน)
7. **เขียน/แก้โค้ด** พร้อม todo list กำกับความคืบหน้า
8. **รัน test + ตรวจใน browser** (ผ่าน playwright/chrome-devtools MCP ถ้าเป็นเว็บ)
9. **commit** เป็น scoped commit เดียว พร้อมข้อความสั้นตรงประเด็น

> [!tip] ไม่เห็นครบทุกขั้นก็ปกติ
> คำสั่งเล็กๆ (แก้ typo, ถามคำถามทั่วไป) จะข้ามขั้น 2-6 ไปเลย เข้าขั้น 7-9 ตรงๆ — ครบทุกขั้นแบบนี้เกิดกับงานที่เป็น "สร้างฟีเจอร์ใหม่" เท่านั้น

### ใช้ grill-me / grilling ก่อนเริ่มฟีเจอร์ใหม่ (ถ้าติดตั้งไว้)

ถ้าติดตั้ง skill `grill-me`/`grilling` ไว้แล้ว (วิธีติดตั้งที่ [[plugins]]) มี 2 วิธีเรียกใช้:

**1. ให้สัมภาษณ์เดี่ยวๆ (ไม่ implement ทันที, ไม่มี spec file):**

```
grill me about <ไอเดีย/การตัดสินใจที่อยากทดสอบ>
```

**2. ปล่อยให้เกิดขึ้นเองตอนขอฟีเจอร์ใหม่ (ไม่ต้องพูดคำว่า grill เลย):**

```
ช่วยเพิ่ม <ฟีเจอร์> ให้หน่อย
```

ถ้าติดตั้ง `superpowers` ไว้ด้วย (ปกติเป็นคู่กัน) กรณีที่ 2 จะเรียก `brainstorming` ก่อนตามเกตหลักของมัน แล้ว**เอา format คำถามของ grilling มาใช้** (ถามเป็นชุด มีเลขข้อ มีคำแนะนำ `➡️` ต่อท้ายทุกข้อ) แทนที่จะถามทีละข้อ — สังเกตได้จาก:

```
❓ Q1 - <หัวข้อคำถาม>: <รายละเอียด/ตัวเลือก>
➡️ <คำแนะนำ>

---

❓ Q2 - ...
```

ตอบเป็นตัวเลือก/ตัวอักษรสั้นๆ ได้เลย (เช่น `A A A A` หรือ `ตามแนะนำทั้งหมด`) — agent จะไม่เริ่มเขียนโค้ดจนกว่าจะตอบครบทุกข้อและ frontier ว่าง (ไม่มีคำถามค้าง)

> [!info] ยืนยันแล้วว่าไม่ชนกัน
> ทดสอบจริงแล้วว่าเรียก `grilling` เดี่ยวๆ กับปล่อยให้ `brainstorming` ยืม format ไปใช้ ทำงานถูกทางที่ต่างกันโดยไม่ชนกัน (ไม่ถามซ้อนสองรอบ, ไม่มี spec file โผล่มาตอนไม่ควรมี) รายละเอียดเต็มอยู่ที่ [[plugins]] หัวข้อ grill-me/grilling

---

## 4. ใช้ graft ให้เข้าใจโค้ดเร็วขึ้น

ไม่ต้องสั่ง `graft` เองเลย — เมื่อผูก MCP ไว้แล้ว (ดู [[mcp-servers]]) opencode จะเรียก tool ของ graft (`graft_find_code`/`graft_file_api`/`graft_trace_calls`/`graft_find_all`/`graft_repo_map`/`graft_check_freshness`) เองอัตโนมัติเวลาจำเป็น เหมือน playwright/chrome-devtools — ส่วนนี้คือวิธีเรียก CLI ตรงๆ ด้วยตัวเอง เผื่ออยากสำรวจโค้ดเร็วๆ ก่อนเริ่มคุยกับ agent

**ขั้น 1 — ดูภาพรวมโปรเจกต์**

```bash
graft map
```

ตัวอย่าง output จริงที่ควรได้ประมาณนี้ (ตัวเลข/ชื่อไฟล์เปลี่ยนตามโปรเจกต์):

```
repo map — 15 files · 312 symbols · 540 edges · javascript

src/                12 files · 280 symbols   hubs: SG.config (config.js, 9←), GameScene (GameScene.js, 7←)
test/               1 files · 12 symbols     hubs: runTest (logic.test.js, 2←)

hotspots: SG.config · object · src/config.js:L3-L18 · 9←  GameScene.create · method · src/scenes/GameScene.js:L14-L111 · 7←
```

อ่านแบบนี้: **hubs**/**hotspots** = โค้ดที่ถูกอ้างอิงบ่อยที่สุด (ตัวเลข `←` = จำนวนที่ถูกเรียกใช้) เริ่มทำความเข้าใจโปรเจกต์จากจุดพวกนี้ก่อนมักคุ้มที่สุด

**ขั้น 2 — ถามหาโค้ดที่เกี่ยวข้องเป็นภาษาคน**

```bash
graft ask "auth ทำงานตรงไหน"
```

ตัวอย่าง output จริง (จากการถามเรื่องระบบเก็บแหวนในเกมตัวอย่าง):

```
graft ask — "ring collection overlap handler addRings ring cap"  (lexical)

1. addRings · method  [symbol]
   src/entities/Sonic.js:L43-L45
   addRings(n)

   addRings(n) {
     this.rings = Math.min(SG.config.ringCap, this.rings + n);
   }
```

ได้ **file:line + โค้ดจริงฝังมาด้วยเลย** ไม่ต้องเปิดไฟล์ตามอ่านเอง — ถ้าคำถามกว้างเกินไปจนได้ผลลัพธ์เดียว/ไม่ตรง ให้ลองคำสั่งอื่นแทน: `graft grep "<คำเป๊ะๆ>"` (หาทุกจุดที่มีคำนี้) หรือ `graft skeleton <file>` (ดู API ทั้งไฟล์แบบไม่มี body)

**ขั้น 3 — เช็คว่ากราฟยังตรงกับโค้ดจริงไหม** (ปกติไม่ต้องทำเอง เพราะทุกคำสั่งด้านบน refresh ให้เองก่อนตอบอยู่แล้ว — ใช้ตอนอยากยืนยันเฉยๆ หรือใน CI)

```bash
graft check
```

✅ exit code `0` = กราฟตรงกับโค้ดปัจจุบัน ไม่ต้องทำอะไรเพิ่ม

> [!note] Plugin graft-deep
> plugin graft-deep (ดู [[plugins]]) auto-inject context ที่เกี่ยวข้องต่อ prompt ใหม่ทุกครั้ง — ทำงานเบื้องหลังโดยไม่ต้องทำอะไรเพิ่ม แต่ไม่รับประกัน 100% ว่าโมเดลจะเลือกใช้ context ที่ inject มาเสมอ (ขึ้นกับความสามารถของโมเดลแต่ละตัว) ส่วนความสดของกราฟเองไม่ต้องพึ่ง plugin นี้แล้ว — graft CLI ปัจจุบัน refresh ตัวเองก่อนตอบทุกคำถามอยู่แล้ว

---

## 5. สร้างเว็บไซต์ด้วย OpenDesign แล้วดึงมาต่อใน opencode

### เฟส 1 — ออกแบบ/สร้างต้นแบบใน OpenDesign

1. เปิดแอป OpenDesign → หน้า **Home**
2. พิมพ์ brief (โจทย์เว็บไซต์) เป็นข้อความปกติ
3. เลือกประเภท artifact เป็น **Prototype**
4. เลือก design system (มีให้เลือก 151 แบบ) หรือปล่อย auto
5. Launch → เข้าสู่ **Studio** (แชท + ไฟล์ที่ generate + live preview อยู่หน้าต่างเดียว)
6. คุยต่อในแชทเพื่อปรับแก้ — Studio เขียนไฟล์ HTML/CSS/JS จริงลง disk ทันที ไม่ใช่แค่ mockup
7. พอใจแล้ว export ได้จากเมนู Download (HTML/PDF/PPTX)

> [!tip] ไม่จำเป็นต้องกลับมา opencode เสมอไป
> ถ้าเป็นเว็บหน้าเดียวจบๆ export ตรงนี้จบได้เลย ไม่ต้องไปต่อ opencode

### เฟส 2 — ดึงมาต่อในโปรเจกต์จริง (เมื่ออยากทำหลังบ้าน/ต่อยอด)

```bash
cd my-real-project    # โปรเจกต์ full-stack จริงที่มี opencode MCP ครบ
opencode
```

```
ใช้ open-design tool list_projects ดูว่ามีโปรเจกต์อะไรบ้าง
แล้วดึงไฟล์จากโปรเจกต์ <ชื่อ> มาใส่ในโฟลเดอร์นี้ ต่อด้วยเพิ่ม backend API
```

opencode จะเรียก `list_projects` → `get_project`/`get_artifact`/`get_file` ของ open-design MCP เอง ดึงเนื้อไฟล์มา แล้วเขียนลงโปรเจกต์จริงด้วย write tool ของตัวเอง จากนั้นทำงานต่อแบบ full-stack ปกติ (ต่อ DB ผ่าน postgres/mysql MCP, ทดสอบผ่าน playwright/chrome-devtools ฯลฯ)

> [!info] สรุปบทบาท
> **OpenDesign** = เฟสออกแบบ/ทำหน้าบ้านเร็วพร้อม preview สด · **opencode** (session แยก) = เฟสพัฒนาจริงต่อยอดเป็นระบบเต็ม เชื่อมกันด้วย MCP `open-design`

> [!warning] ต้องมี daemon รันอยู่
> ก่อนใช้ MCP `open-design` ต้องมี daemon ของ OpenDesign รันอยู่ (เปิดแอปทิ้งไว้ หรือรัน `od --no-open` แบบ headless) — ดูรายละเอียด/ปัญหาที่เจอที่ [[gotchas]] ข้อ 4

---

## 6. เลือกโมเดลให้เหมาะกับงาน

| สถานการณ์ | โมเดลที่แนะนำ |
| --- | --- |
| งานจริง อยากได้คุณภาพ/private, ไม่รีบ | `home-llamacpp/qwen3.8-27b` (self-hosted) |
| ลองไอเดียเร็วๆ, smoke test, เครื่องมือภายนอกที่มี timeout สั้น | `opencode/deepseek-v4-flash-free` (built-in, ไม่ต้องตั้ง key) |

ระบุด้วย `-m provider/model`:

```bash
opencode run -m opencode/deepseek-v4-flash-free "..."
```

---

## 7. ปัญหาที่พบบ่อย

ดูรายการเต็มพร้อมวิธีแก้ที่ [[gotchas]] — สรุปย่อ:

- **เครื่องมือภายนอกต่อ opencode แล้ว timeout** → เช็คว่า default model ช้าไปไหม (ข้อ 1 ใน gotchas)
- **ตั้ง env var/PATH ใหม่แล้วยังไม่เห็นผล** → restart แอปที่เกี่ยวข้องแบบเต็มรูปแบบ ไม่ใช่แค่ปิดหน้าต่าง (ข้อ 2)
- **MCP `open-design` connected แต่เรียก tool ไม่ได้** → เช็คว่า daemon ของ OpenDesign รันอยู่จริงที่ port 7456 ไหม (ข้อ 4)
- **คำสั่งเดียวกันได้ผลไม่ตรงกันระหว่าง terminal** → ทดสอบผ่าน PowerShell แทน Git Bash บน Windows (ข้อ 5)
- **MCP `sonarqube` ขึ้น connected แต่เรียก tool แล้ว 401/403** → เช็คว่า token ที่ใช้เป็น "User Token" ไม่ใช่ "Global/Project Analysis Token" (ดู [[mcp-servers]] หัวข้อ sonarqube) — connection ตรวจแค่ว่าต่อ server ได้ ไม่ได้ตรวจสิทธิ์ token ตอนนั้น
- **`trivy` ขึ้น `command not found` ทั้งที่ winget บอกติดตั้งสำเร็จ** → restart terminal (VS Code ต้องปิดทั้งแอป) — เจอ PATH staleness เดียวกับข้อ 2 (ดู [[mcp-servers]] หัวข้อ trivy)
