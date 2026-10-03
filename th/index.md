---
tags: [project-doc, overview, opencode, ai-agent]
updated: 2026-10-03
summary: Home page คู่มือการติดตั้งและใช้งาน OpenCode CLI พร้อม MCP servers, Plugins และ Skills (Agent Skills open standard) สำหรับ vibe coding
---

# OpenCode — Vibe Coding Setup

**OpenCode** คือ AI coding agent แบบ CLI (แนวเดียวกับ Claude Code) ที่รองรับการต่อ model provider เองได้อิสระ — รวมถึง self-hosted model บนเซิร์ฟเวอร์ของตัวเอง — และมีระบบ **MCP (Model Context Protocol)** กับ **Plugin** แบบเปิดให้ขยายได้เต็มรูปแบบ

เอกสารชุดนี้บันทึกการตั้งค่าจริงที่ใช้งานอยู่ — ตั้งแต่ติดตั้ง CLI บนเครื่องเปล่า จนถึงต่อโมเดลบ้าน (self-hosted llama.cpp) + MCP servers 11 ตัว (6 เปิดใช้งาน, 5 เปิดต่อโปรเจกต์/รอ token) + Plugin 4 ตัว พร้อมบันทึกปัญหาที่เจอจริงระหว่างทางและวิธีแก้ที่ยืนยันแล้วว่าใช้ได้ และผลการวัด/ปรับจูนว่า workflow ทำงานครบจริง ([[tuning]])

---

## 🧩 Stack ที่ใช้งานจริง

| ส่วนประกอบ | รายละเอียด |
| --- | --- |
| **OpenCode CLI** | v1.18.18+ ติดตั้งผ่าน `npm install -g opencode-ai` (global) |
| **Model provider หลัก** | `home-llamacpp` — self-hosted llama.cpp server (URL เฉพาะของแต่ละคน), โมเดล `qwen3.8-27b` (Q4_K, context 131k) ผ่าน OpenAI-compatible endpoint |
| **Model สำรอง (เร็ว)** | `opencode/deepseek-v4-flash-free` — built-in ของ OpenCode เอง ไม่ต้องตั้ง API key เพิ่ม ตอบเร็ว (~10 วินาที) |
| **MCP servers** | context7 (docs), chrome-devtools (browser debug/test), graft (code-graph/context — per-project), memory (จำ context ข้าม session — ใช้งานด้วยกฎใน global AGENTS.md), sonarqube (code quality/security — self-hosted ผ่าน Docker), trivy (vulnerability/secret/misconfig scan — standalone CLI) · **เปิดต่อโปรเจกต์:** open-design (นำเข้าไฟล์จากโปรเจกต์ OpenDesign), playwright (browser automation), postgres/mysql · github (ปิดไว้จนกว่าจะมี PAT) |
| **Plugins** | superpowers (skill library จาก obra/superpowers), graft-deep (custom plugin — auto-inject context; auto-rebuild graph เป็นของ graft CLI เองแล้ว), ponytail (ruleset ลดโค้ดที่ไม่จำเป็น — จาก dietrichgebert/ponytail), caveman (ตอบสั้น ตรงประเด็น — ใช้เฉพาะ skill จาก JuliusBrussee/caveman แทน i-have-adhd) |
| **Skills** (Agent Skills open standard, ไม่ใช่ plugin) | grill-me / grilling (จาก mattpocock/skills) — batch-interview สัมภาษณ์ผู้ใช้เป็นรอบก่อนเริ่มงาน ผูกเข้ากับ `brainstorming` ของ superpowers ไม่ให้ชนกัน |
| **Config หลัก** | `~/.config/opencode/opencode.jsonc` (ตั้งเอง) + `~/.config/opencode/opencode.json` (entry ของ open-design แก้เอง — **ไม่ใช่**แบบ port ตายตัวที่ `od mcp install` เขียนให้ ดู [[mcp-servers]]) |

---

## 📖 Wiki Pages

- [[sdlc]] — ภาพรวม Software Development Life Cycle ทั้ง 7 กระบวนการ พร้อมชี้ว่าคู่มือนี้ครอบคลุม phase ไหนบ้าง (และช่องว่างที่ยังไม่มี)
- [[architecture]] — มอง stack ทั้งหมดผ่าน 4 layer ตามหน้าที่ (Knowledge/Reasoning/Execution/Governance) แทนตามกลไกทางเทคนิค เอาไว้ตอบว่าเครื่องมือใหม่แต่ละตัว "อยู่ layer ไหน"
- [[setup]] — คู่มือติดตั้งแบบละเอียด ตั้งแต่**เครื่องเปล่า**ที่ยังไม่มี Node.js/Git จนถึงต่อ provider/MCP/plugin ครบ
- [[mcp-servers]] — รายละเอียด MCP server แต่ละตัว ขั้นตอนติดตั้ง config และวิธีทดสอบ
- [[plugins]] — superpowers, grill-me/grilling (batch-interview skill เสริม superpowers), custom plugin graft-deep (โค้ดเต็ม + Plugin Hook API), ponytail (code minimization ruleset) และ caveman (ตอบสั้น ตรงประเด็น — ใช้แทน i-have-adhd ซึ่งยังเป็นทางเลือก)
- [[USER-MANUAL]] — **เริ่มใช้งานตั้งแต่ต้นจนจบ** (เปิด session → สั่ง → อนุมัติ → ตรวจ → commit) และวิธีใช้งานจริงวันต่อวัน: vibe coding, graft workflow, OpenDesign workflow
- [[gotchas]] — ปัญหาที่เจอจริง 19 เรื่องพร้อมวิธีแก้ (Windows PATH/env snapshot, model ช้า, native module ABI mismatch, reasoning model output cap, prompt บวมจาก MCP, skill ชนกับ AGENTS.md, ฯลฯ)
- [[updating]] — วิธีอัปเดต/อัปเกรด OpenCode CLI, MCP servers, plugins และ OpenDesign แต่ละตัว
- [config/](../config/README.md) — ไฟล์ที่ setup นี้เขียน/แก้เอง พร้อม copy: template `opencode.jsonc`, global `AGENTS.md`, plugin `graft-deep.js`
- [AGENT-SETUP.md](../AGENT-SETUP.md) — ขั้นตอนติดตั้งสำหรับให้ AI agent อ่านแล้วทำตาม (สั่ง agent ว่า `อ่าน AGENT-SETUP.md แล้วติดตั้งตาม`)
- [[tuning]] — วัดผลจริงว่า workflow ทำงานครบไหม (ขนาด prompt ต่อ turn, tool ที่ agent เรียกจริง, ทดสอบครบวงจร) พร้อมภาพผล, สคริปต์วัดซ้ำ และค่าที่แนะนำหลังปรับจูน

---

## 🚀 Quick Start

```bash
# 1. ติดตั้ง CLI
npm install -g opencode-ai

# 2. ตรวจสอบว่าติดตั้งสำเร็จ
opencode --version

# 3. ทดสอบใช้งานทันที (ไม่ต้องตั้งค่าอะไรเพิ่ม — ใช้โมเดลฟรีในตัว)
opencode run -m opencode/deepseek-v4-flash-free "say hi"

# 4. เปิด TUI ในโปรเจกต์
cd my-project
opencode
```

รายละเอียดการตั้งค่า provider/MCP/plugin ทั้งหมดตั้งแต่ต้นดูที่ [[setup]]

---

## ⚠️ ทำไมต้องมี provider สำรอง (opencode/deepseek-v4-flash-free)

โมเดลบ้าน (`home-llamacpp/qwen3.8-27b`) กลายเป็น **default model** ของ OpenCode โดยอัตโนมัติ เพราะเป็น provider เดียวที่มี credential จริง แต่ context ที่หนักจาก superpowers + MCP 5 ตัวทำให้แต่ละ turn ใช้เวลานาน (บางครั้งเกิน 1-2 นาที)

เครื่องมือภายนอกที่มี timeout สั้น (เช่น OpenDesign wizard ที่ตั้ง timeout ไว้ 45 วินาที) จะพังทันทีถ้าไปชนกับโมเดลนี้ — จึงเก็บโมเดลฟรีที่เร็วไว้เป็นทางเลือกสำรองสำหรับกรณีแบบนี้

> [!tip] อ่านเพิ่ม
> รายละเอียดวิธีวินิจฉัยปัญหานี้และวิธีแก้เต็มๆ ดูที่ [[gotchas]] ข้อ 1
