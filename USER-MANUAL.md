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
- เริ่มงานในโปรเจกต์ใหม่ — checklist ต่อ repo
- Vibe coding ทั่วไปกับ opencode
- ใช้ graft ให้เข้าใจโค้ดเร็วขึ้น
- สร้างเว็บไซต์ด้วย OpenDesign (แล้วดึงมาต่อใน opencode)
- เลือกโมเดลให้เหมาะกับงาน
- ปัญหาที่พบบ่อย

---

## 1. ภาพรวม

```mermaid
graph LR
    A[OpenDesign App<br/>Studio - chat + live preview] -->|spawn เป็น engine| B[OpenCode]
    B -->|MCP| C[context7 / playwright / chrome-devtools]
    B -->|MCP| D[graft - code graph]
    B -->|MCP| E[open-design - ดึงไฟล์]
    B -->|plugin| F[superpowers - skills]
    B -->|plugin| G[graft-deep - auto rebuild/context]
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
    I --> J["graft-deep<br/>auto-rebuild กราฟ (background)"]
    J -->|คำสั่งถัดไป| A
```

> [!note] ไม่ใช่ทุก turn จะครบทุกขั้น
> ถ้าคำสั่งสั้น/ไม่เกี่ยวกับโค้ด (เช่น "อธิบาย X ให้ฟัง") บาง node อาจถูกข้ามไป — แผนภาพนี้แสดง**เส้นทางที่เป็นไปได้ทั้งหมด** ไม่ใช่ทุก turn จะวิ่งผ่านทุกกล่อง

> [!note] Plugin ponytail
> plugin ponytail (ดู [[plugins]]) เป็นด่านสุดท้ายก่อนลงมือเขียนโค้ดจริง (โหนด L) — บังคับให้ agent ไล่ decision ladder (ไม่จำเป็นก็ไม่เขียน → reuse ของเดิม → standard library → native feature → dependency ที่มีอยู่ → one-liner → ค่อยเขียนใหม่ขั้นต่ำ) ทำงานคู่กับ superpowers/graft-deep โดยไม่ทับซ้อนกัน (superpowers เลือก workflow, graft-deep หา context, ponytail คุมปริมาณโค้ดที่เขียนออกมา)

> [!note] Plugin i-have-adhd — ไม่อยู่ในวงจรต่อ turn ด้านบน (จงใจ)
> ต่างจาก superpowers/graft-deep/ponytail ที่ทำงานอัตโนมัติทุก turn — i-have-adhd (ดู [[plugins]]) เป็น **opt-in ต่อ session**: ต้องพิมพ์ `/i-have-adhd` เองก่อนถึงจะเริ่มมีผล (เปลี่ยนแค่สไตล์การตอบให้ตรงประเด็น/ไม่อ้อมค้อม ไม่แตะ tool orchestration) เหมาะตอนต้องการคำตอบไว ไม่ต้องการคำอธิบายยาว — ปิดด้วย `stop adhd mode` เมื่อไหร่ก็ได้

> [!note] Skill grill-me / grilling — ไม่ใช่ plugin แยก แต่ผูกกับโหนด C
> ไม่ได้อยู่ในแผนภาพเป็นโหนดแยก เพราะเป็น skill (ไฟล์ `SKILL.md` เดี่ยวๆ ตาม Agent Skills open standard — ดู [[setup]]) ไม่ใช่ plugin แต่ทำงานที่โหนด C เดียวกับ superpowers: เมื่อ agent เลือก `brainstorming` สำหรับงานสร้างฟีเจอร์ใหม่ จะใช้ format คำถามแบบ batch ของ `grilling` แทนการถามทีละข้อ (หรือเรียก `grilling` เดี่ยวๆ ถ้าผู้ใช้แค่อยากสัมภาษณ์ตัวเอง ไม่ได้จะ implement ทันที) วิธีใช้จริงดูหัวข้อ 3 ด้านล่าง รายละเอียดการติดตั้ง/reconcile เต็มๆ ดูที่ [[plugins]]

---

## 2. เริ่มงานในโปรเจกต์ใหม่ — checklist

```bash
cd my-new-project

# ถ้าจะใช้ graft (แนะนำสำหรับโปรเจกต์ที่มีโค้ดอยู่แล้ว)
graft build
graft init --agents agents --no-global
```

ถ้าจะใช้ postgres/mysql MCP — สร้าง project-level config:

```jsonc
// my-new-project/opencode.jsonc
{ "mcp": { "postgres": { "enabled": true } } }
```

ตั้ง env var connection string ก่อนเปิด opencode:

```bash
export POSTGRES_CONNECTION_STRING="postgresql://user:pass@host/db"

opencode
```

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

ไม่ต้องสั่ง `graft` เองเลย — เมื่อผูก MCP ไว้แล้ว (ดู [[mcp-servers]]) opencode จะเรียก tool ของ graft (`ask`/`grep`/`map`/`callers`/`skeleton`) เองอัตโนมัติเวลาจำเป็น เหมือน playwright/chrome-devtools

ถ้าอยากสำรวจโค้ดด้วยตัวเองเร็วๆ ก่อนเริ่มคุยกับ agent:

```bash
graft map                                   # ภาพรวมโปรเจกต์
graft ask "auth ทำงานตรงไหน"                # หา entry point
```

> [!note] Plugin graft-deep
> plugin graft-deep (ดู [[plugins]]) auto-rebuild กราฟให้เองหลังแก้ไฟล์ (debounce 3 วิ, background) และ auto-inject context ที่เกี่ยวข้องต่อ prompt ใหม่ทุกครั้ง — ทำงานเบื้องหลังโดยไม่ต้องทำอะไรเพิ่ม แต่ไม่รับประกัน 100% ว่าโมเดลจะเลือกใช้ context ที่ inject มาเสมอ (ขึ้นกับความสามารถของโมเดลแต่ละตัว)

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
