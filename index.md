---
tags: [project-doc, overview, opencode, ai-agent]
updated: 2026-08-21
summary: Home page คู่มือการติดตั้งและใช้งาน OpenCode CLI พร้อม MCP servers และ Plugins สำหรับ vibe coding
---

# OpenCode — Vibe Coding Setup

**OpenCode** คือ AI coding agent แบบ CLI (แนวเดียวกับ Claude Code) ที่รองรับการต่อ model provider เองได้อิสระ — รวมถึง self-hosted model บนเซิร์ฟเวอร์ของตัวเอง — และมีระบบ **MCP (Model Context Protocol)** กับ **Plugin** แบบเปิดให้ขยายได้เต็มรูปแบบ

เอกสารชุดนี้บันทึกการตั้งค่าจริงที่ใช้งานอยู่ — ตั้งแต่ติดตั้ง CLI บนเครื่องเปล่า จนถึงต่อโมเดลบ้าน (self-hosted llama.cpp) + MCP servers 9 ตัว (6 เปิดใช้งาน, 3 รอเปิดต่อโปรเจกต์/รอ token) + Plugin 2 ตัว พร้อมบันทึกปัญหาที่เจอจริงระหว่างทางและวิธีแก้ที่ยืนยันแล้วว่าใช้ได้

---

## 🧩 Stack ที่ใช้งานจริง

| ส่วนประกอบ | รายละเอียด |
| --- | --- |
| **OpenCode CLI** | v1.18.18+ ติดตั้งผ่าน `npm install -g opencode-ai` (global) |
| **Model provider หลัก** | `home-llamacpp` — self-hosted llama.cpp server (URL เฉพาะของแต่ละคน), โมเดล `qwen3.8-27b` (Q4_K, context 131k) ผ่าน OpenAI-compatible endpoint |
| **Model สำรอง (เร็ว)** | `opencode/deepseek-v4-flash-free` — built-in ของ OpenCode เอง ไม่ต้องตั้ง API key เพิ่ม ตอบเร็ว (~10 วินาที) |
| **MCP servers** | context7 (docs), playwright + chrome-devtools (browser automation/debug), graft (code-graph/context — per-project), open-design (นำเข้าไฟล์จากโปรเจกต์ OpenDesign), memory (จำ context ข้าม session), github (issues/PR — ปิดไว้จนกว่าจะมี PAT), postgres/mysql (ปิดไว้ก่อน เปิดต่อโปรเจกต์) |
| **Plugins** | superpowers (skill library จาก obra/superpowers), graft-deep (custom plugin — auto-rebuild graph + auto-inject context) |
| **Config หลัก** | `~/.config/opencode/opencode.jsonc` (ตั้งเอง) + `~/.config/opencode/opencode.json` (เขียนอัตโนมัติโดย `od mcp install`) |

---

## 📖 Wiki Pages

- [[setup]] — คู่มือติดตั้งแบบละเอียด ตั้งแต่**เครื่องเปล่า**ที่ยังไม่มี Node.js/Git จนถึงต่อ provider/MCP/plugin ครบ
- [[mcp-servers]] — รายละเอียด MCP server แต่ละตัว ขั้นตอนติดตั้ง config และวิธีทดสอบ
- [[plugins]] — superpowers และ custom plugin graft-deep แบบละเอียด (โค้ดเต็ม + Plugin Hook API)
- [[USER-MANUAL]] — วิธีใช้งานจริงวันต่อวัน: vibe coding, graft workflow, OpenDesign workflow
- [[gotchas]] — ปัญหาที่เจอจริง 8 เรื่องพร้อมวิธีแก้ (Windows PATH/env snapshot, model ช้า, native module ABI mismatch, reasoning model output cap, ฯลฯ)
- [[updating]] — วิธีอัปเดต/อัปเกรด OpenCode CLI, MCP servers, plugins และ OpenDesign แต่ละตัว

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
