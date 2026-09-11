---
tags: [project-doc, sdlc, opencode, reference, overview]
updated: 2026-09-11
summary: ภาพรวม Software Development Life Cycle (SDLC) ทั้ง 7 กระบวนการ อธิบายสำหรับผู้อ่านทั่วไป พร้อมลิงก์ไปยังส่วนที่คู่มือ OpenCode นี้ implement จริงในแต่ละ phase — และระบุชัดว่าส่วนไหนยังไม่ครอบคลุม
---

# Software Development Life Cycle (SDLC)

ภาพรวมคู่มือทั้งหมดที่ [[index]]

**SDLC** คือวงจรมาตรฐานที่อธิบายว่าซอฟต์แวร์ชิ้นหนึ่งเดินทางจาก "ไอเดีย" ไปจนถึง "ใช้งานจริงและดูแลต่อเนื่อง" ผ่านกระบวนการอะไรบ้าง หน้านี้อธิบายแต่ละ phase แบบกลางๆ สำหรับผู้อ่านทั่วไปก่อน แล้วชี้ว่าคู่มือ OpenCode ชุดนี้ (ที่เหลือทั้งหมดใน repo) ครอบคลุม phase ไหนด้วยเครื่องมือ/plugin อะไรบ้าง — ส่วนไหนยังไม่มี implementation จริงก็ระบุตรงๆ ไม่กลบเกลื่อน

> [!info] Security และ Documentation ไม่ใช่ phase เดี่ยว
> สองเรื่องนี้ควรทำ**คู่ขนานทุก phase** (แนวคิด "shift-left"/DevSecOps) ไม่ใช่ขั้นตอนท้ายสุดก่อนส่งมอบ — ในหน้านี้เลยพูดถึง security เป็นส่วนแทรกในแต่ละ phase ที่เกี่ยวข้อง แทนที่จะแยกเป็นหัวข้อโดดๆ

---

## 1. Planning (วางแผนโครงการ)

กำหนดขอบเขตงาน เป้าหมาย ทรัพยากร (คน/เวลา/งบ) และความเสี่ยงเบื้องต้น ก่อนเริ่มเขียนโค้ดแม้แต่บรรทัดเดียว — output ทั่วไปคือ project charter, timeline, risk register

> [!warning] ยังไม่ครอบคลุมในคู่มือนี้
> ไม่มีเครื่องมือ/plugin ใดใน stack นี้ที่ช่วยเรื่อง project planning ระดับนี้โดยตรง — เป็น phase ที่ต้องทำนอก OpenCode (เช่น ผ่าน spreadsheet, Notion, หรือ project management tool แยกต่างหาก)

---

## 2. Requirements Analysis (วิเคราะห์ความต้องการ)

เก็บและตกผลึกว่า "ระบบต้องทำอะไร" จาก stakeholder — แยกเป็น functional requirements (ฟีเจอร์) กับ non-functional (performance, security, scalability) มักเก็บเป็น user story/ticket ใน backlog tool เพื่อ trace ย้อนกลับได้ว่าโค้ดแต่ละส่วนตอบโจทย์ requirement ข้อไหน

> [!tip] มีอยู่บางส่วนในคู่มือนี้ แต่ปิดไว้
> [[mcp-servers#github — จัดการ issues/PR/code search ผ่าน structured tool (ปิดไว้ก่อน จนกว่าจะมี token)|github MCP]] รองรับ issues/PR ได้ แต่ตั้ง `enabled: false` ไว้จนกว่าจะมี Personal Access Token — ตอนนี้ยังไม่ active จริง นับเป็น partial coverage เท่านั้น

---

## 3. Design (ออกแบบ)

แปล requirement เป็นพิมพ์เขียวทางเทคนิค แบ่งเป็น 2 ระดับ: **system/architecture design** (เลือก stack, ออกแบบ database schema, API contract) กับ **UI/UX design** (mockup, prototype, design system)

> [!tip] มีเฉพาะฝั่ง UI/UX
> [[mcp-servers#open-design — ดึงไฟล์จากโปรเจกต์ OpenDesign|open-design MCP]] + workflow เต็มที่ [[USER-MANUAL#5. สร้างเว็บไซต์ด้วย OpenDesign แล้วดึงมาต่อใน opencode]] ครอบคลุมการออกแบบ/สร้างต้นแบบหน้าเว็บได้ดี — แต่ system/architecture design (schema, API contract) ยังไม่มีเครื่องมือเฉพาะ อาศัย `writing-plans` skill ของ [[plugins#superpowers — skill library|superpowers]] ช่วยได้บางส่วนในระดับ implementation plan เท่านั้น ไม่ใช่ design doc เต็มรูปแบบ

---

## 4. Development / Implementation (พัฒนา)

เขียนโค้ดจริงตาม design — รวม code review, coding standard เข้าไปด้วยเพื่อคุมคุณภาพระหว่างทาง ไม่ใช่แค่ตรวจทีหลัง

> [!tip] จุดแข็งที่สุดของคู่มือนี้
> - [[plugins#superpowers — skill library|superpowers]] — บังคับ workflow ที่ดี (brainstorming, systematic-debugging, executing-plans, subagent-driven-development ฯลฯ)
> - [[plugins#graft-deep — custom plugin (auto-rebuild + auto-inject context)|graft-deep]] + [[mcp-servers#graft — code-graph / context retrieval (per-project)|graft MCP]] — auto-rebuild code graph และ inject context ที่เกี่ยวข้องให้อัตโนมัติ
> - [[plugins#ponytail — code minimization ruleset|ponytail]] — คุมไม่ให้ agent เขียนโค้ดเกินจำเป็น
> - [[plugins#i-have-adhd — บังคับตอบตรงประเด็น ไม่อ้อมค้อม|i-have-adhd]] — คุมสไตล์การตอบให้ตรงประเด็น (opt-in)
>
> **Code review** ก็อยู่ใน phase นี้: superpowers มี skill `receiving-code-review`/`requesting-code-review` ในตัว

---

## 5. Testing (ทดสอบ)

ยืนยันว่าโค้ดถูกต้องและไม่มี regression — แบ่งเป็นชั้นตาม test pyramid: **unit test** (เร็ว ครอบคลุมเยอะ) → **integration test** (เช็คการต่อกันระหว่าง component/service) → **E2E/UI test** (จำลอง user จริง) → **security testing** (SAST/dependency/secret scan)

> [!tip] ครอบคลุมบางชั้น
> - E2E/UI: [[mcp-servers#playwright — ควบคุมเบราว์เซอร์ / e2e testing|playwright]] + [[mcp-servers#chrome-devtools — debug หน้าเว็บสด|chrome-devtools]] (เน้น debug — console log, network, performance trace)
> - Workflow guidance: `test-driven-development` skill ใน [[plugins#superpowers — skill library|superpowers]]
> - Security testing: [[mcp-servers#sonarqube — code quality + security scan แบบ self-hosted (ผ่าน Docker)|sonarqube]] (code quality/SAST) + [[mcp-servers#trivy — vulnerability/secret/misconfig scan (standalone CLI, ไม่ต้องมี server)|trivy]] (vulnerability/secret/misconfig scan)
>
> ที่ยังขาด: **unit/integration test runner** ของจริง (เช่น pytest, vitest) — คู่มือนี้ยังไม่มี MCP/plugin เฉพาะสำหรับชั้นนี้ อาศัย agent เขียน test file ตรงๆ ตาม convention ของแต่ละโปรเจกต์เอง

---

## 6. Deployment (ส่งมอบ/ขึ้นระบบจริง)

นำโค้ดที่ผ่าน test ไปรันบน production — โดยทั่วไปทำผ่าน **CI/CD pipeline** อัตโนมัติ (build → test → deploy) แทนการ deploy มือ เพื่อลดความผิดพลาดและทำซ้ำได้

> [!warning] ยังไม่ครอบคลุมในคู่มือนี้
> ใน [[USER-MANUAL#1. ภาพรวม|macro workflow diagram]] มีโหนด "Deploy" ต่อจาก quality gate แต่เป็นแค่ label เฉยๆ — ไม่มี CI/CD pipeline, build automation, หรือ hosting/infra ใดๆ ถูกบันทึกไว้ในคู่มือนี้เลย เป็นช่องว่างใหญ่สุดของทั้ง SDLC ณ ตอนนี้

---

## 7. Maintenance (ดูแลหลังส่งมอบ)

เมื่อระบบ live แล้ว ต้องมี **monitoring/observability** (log, metric, alert) คอยเฝ้าดูว่าระบบยังทำงานปกติไหม, แก้ bug ที่เจอทีหลัง, และวน feedback กลับไปเป็น requirement รอบใหม่ (ปิด loop กลับไป phase 1-2)

> [!tip] มีเฉพาะ maintenance ของ "เครื่องมือ dev" ไม่ใช่ของแอป
> [[updating]] ครอบคลุมการอัปเดต OpenCode CLI/MCP/plugin เองอย่างละเอียดมาก — แต่นั่นคือดูแล**เครื่องมือที่ใช้พัฒนา** ไม่ใช่ monitoring/observability ของ**แอปที่ deploy ไปแล้ว** (log, metric, alert ของ production) ซึ่งยังไม่มีอะไรรองรับเลย

---

## สรุปภาพรวม

| Phase | สถานะ | อ้างอิงในคู่มือนี้ |
| --- | --- | --- |
| 1. Planning | ❌ ไม่มี | — |
| 2. Requirements Analysis | ⚠️ บางส่วน (ปิดอยู่) | [[mcp-servers#github — จัดการ issues/PR/code search ผ่าน structured tool (ปิดไว้ก่อน จนกว่าจะมี token)\|github MCP]] |
| 3. Design | ⚠️ เฉพาะ UI/UX | [[mcp-servers#open-design — ดึงไฟล์จากโปรเจกต์ OpenDesign\|open-design]], [[USER-MANUAL#5. สร้างเว็บไซต์ด้วย OpenDesign แล้วดึงมาต่อใน opencode]] |
| 4. Development | ✅ ครบสุด | [[plugins]], [[mcp-servers#graft — code-graph / context retrieval (per-project)\|graft]] |
| — Code Review (ใน Dev) | ✅ มี | [[plugins#superpowers — skill library\|superpowers]] |
| 5. Testing | ⚠️ บางชั้น | [[mcp-servers#playwright — ควบคุมเบราว์เซอร์ / e2e testing\|playwright]], [[mcp-servers#chrome-devtools — debug หน้าเว็บสด\|chrome-devtools]] |
| — Security testing (ใน Testing) | ✅ มี | [[mcp-servers#sonarqube — code quality + security scan แบบ self-hosted (ผ่าน Docker)\|sonarqube]], [[mcp-servers#trivy — vulnerability/secret/misconfig scan (standalone CLI, ไม่ต้องมี server)\|trivy]] |
| 6. Deployment (CI/CD) | ❌ ไม่มี | — |
| 7. Maintenance (production) | ❌ ไม่มี (มีแต่ tooling) | [[updating]] (tooling เท่านั้น) |

**สรุปสั้น:** คู่มือนี้ครอบคลุมกลางวงจร (Design ฝั่ง UI, Development, Testing บางชั้น) ได้แน่นมาก แต่หัว-ท้ายของวงจร (Planning, Requirements, CI/CD Deployment, Production Monitoring) ยังเป็นช่องว่างที่ต้องพึ่งเครื่องมือ/กระบวนการนอกคู่มือนี้ทั้งหมด
