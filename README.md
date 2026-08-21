# OpenCode Setup Manual

คู่มือติดตั้งและใช้งาน [OpenCode](https://opencode.ai/) CLI แบบละเอียด — ตั้งแต่เครื่องเปล่าที่ยังไม่มีอะไรเลย จนถึง MCP servers, Plugins และวิธีใช้งานจริงสำหรับ vibe coding

> เอกสารชุดนี้เขียนในรูปแบบ [Obsidian](https://obsidian.md/) vault (ใช้ `[[wikilink]]` เชื่อมหน้า) — เปิดด้วย Obsidian จะได้ประสบการณ์อ่านที่ดีที่สุด (ลิงก์คลิกได้, graph view) ลิงก์ด้านล่างเป็น markdown link ธรรมดาสำหรับอ่านบน GitHub

## เริ่มอ่านจากตรงนี้

| ไฟล์ | เนื้อหา |
| --- | --- |
| [index.md](index.md) | ภาพรวม stack ทั้งหมดที่ใช้งานจริง |
| [setup.md](setup.md) | **เริ่มที่นี่ถ้ายังไม่ได้ติดตั้งอะไรเลย** — Node.js, Git, OpenCode CLI, provider, MCP, plugin ครบทุกขั้นตอน |
| [mcp-servers.md](mcp-servers.md) | รายละเอียด MCP server แต่ละตัว (context7, playwright, chrome-devtools, graft, open-design, memory, github, postgres/mysql) พร้อมขั้นตอนติดตั้งเฉพาะตัว |
| [plugins.md](plugins.md) | superpowers และ custom plugin `graft-deep` (โค้ดเต็ม + Plugin Hook API ของ OpenCode) |
| [USER-MANUAL.md](USER-MANUAL.md) | วิธีใช้งานจริงวันต่อวัน — vibe coding, graft workflow, OpenDesign → OpenCode workflow |
| [gotchas.md](gotchas.md) | ปัญหาที่เจอจริง 8 เรื่องพร้อมวิธีแก้ (Windows PATH/env snapshot, native module ABI mismatch, reasoning model output cap, ฯลฯ) |
| [updating.md](updating.md) | วิธีอัปเดต/อัปเกรด OpenCode CLI, MCP servers, plugins และ OpenDesign แต่ละตัว |

## Stack ที่ครอบคลุม

- **OpenCode CLI** + self-hosted/cloud model provider
- **MCP servers**: context7, playwright, chrome-devtools, [graft](https://github.com/nanonets/graft) (code-graph), [OpenDesign](https://github.com/nexu-io/open-design), memory (persistent context), [GitHub](https://github.com/github/github-mcp-server) (issues/PR), postgres/mysql
- **Plugins**: [superpowers](https://github.com/obra/superpowers) (skill library) + custom `graft-deep` plugin

---

*Repo นี้เป็น personal reference — เนื้อหา generic ไม่มีข้อมูลระบุตัวตน (path/URL/credential เฉพาะเครื่อง ถูกแทนที่ด้วย placeholder แล้ว)*
