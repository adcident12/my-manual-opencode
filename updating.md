---
tags: [project-doc, maintenance, opencode, reference]
updated: 2026-08-21
summary: วิธีอัปเดต/อัปเกรด OpenCode CLI, MCP servers, plugins และ OpenDesign แต่ละตัว
---

# Updating & Upgrading

ภาพรวมที่ [[index]] · ตั้งค่าครั้งแรกที่ [[setup]]

แต่ละส่วนของ stack มีวิธี "อัปเดต" ต่างกัน บางตัวอัปเดตอัตโนมัติอยู่แล้วโดยไม่ต้องทำอะไร บางตัวต้องสั่งเอง หน้านี้รวมไว้ทีละตัว

---

## OpenCode CLI

```bash
opencode upgrade
```

หรือระบุเวอร์ชันที่ต้องการเจาะจง:

```bash
opencode upgrade 0.1.48
```

> [!tip] เลือก installation method ให้ตรงกับตอนติดตั้งครั้งแรก
> ถ้าติดตั้งผ่าน `npm install -g opencode-ai` (ตามที่ [[setup]] แนะนำ) ใช้:
> ```bash
> opencode upgrade -m npm
> ```
> `-m`/`--method` รองรับ `curl`, `npm`, `pnpm`, `bun`, `brew`, `choco`, `scoop` — เลือกให้ตรงกับตอนติดตั้งจะได้ไม่มีสอง installation ปนกัน

ตรวจสอบเวอร์ชันหลังอัปเดต:

```bash
opencode --version
```

---

## MCP servers ที่รันผ่าน `npx`

**อัปเดตอัตโนมัติอยู่แล้ว ไม่ต้องทำอะไร** — MCP ที่ตั้งค่าไว้ทั้งหมด (`playwright`, `chrome-devtools`, `postgres`, `mysql`, `memory`) เรียกผ่าน `npx -y <package>@latest` หรือไม่ pin เวอร์ชัน — npx จะเช็ค npm registry หาเวอร์ชันล่าสุดทุกครั้งที่ spawn (ดาวน์โหลดเวอร์ชันใหม่อัตโนมัติถ้ามี ไม่ใช้ cache เก่าค้างไว้)

> [!note] context7 ไม่ต้องอัปเดตเลย
> เป็น remote MCP (HTTP endpoint) — ฝั่งเซิร์ฟเวอร์อัปเดตของเขาเอง ไม่มีอะไรให้ทำฝั่งเรา

ถ้าอยาก**บังคับ**เช็คเวอร์ชันล่าสุดของ package ใดตอนนี้เลย (ไม่ต้องรอ opencode เรียกเอง):

```bash
npx -y @playwright/mcp@latest --version
```

---

## graft (code-graph MCP + CLI)

graft มีคำสั่งอัปเดตในตัวเอง แยกจาก MCP wrapper:

```bash
graft version    # ดูเวอร์ชันที่ติดตั้งอยู่ เทียบกับเวอร์ชันล่าสุดบน npm
graft upgrade    # อัปเกรด global install ให้เป็นเวอร์ชันล่าสุด
```

> [!warning] อัปเกรดแล้วอาจต้อง build กราฟใหม่
> ถ้าเวอร์ชันใหม่เปลี่ยนรูปแบบกราฟ/wiring format ให้รัน `graft build` ซ้ำในแต่ละโปรเจกต์ที่ใช้งานอยู่ (ดู [[mcp-servers]] หัวข้อ graft) — เช็ค [CHANGELOG](https://github.com/nanonets/graft/blob/main/CHANGELOG.md) ของ graft ก่อนอัปเกรดถ้ากังวลเรื่อง breaking change

---

## superpowers plugin (ติดตั้งผ่าน git)

ติดตั้งแบบ `superpowers@git+https://github.com/obra/superpowers.git` (ไม่ pin เวอร์ชัน) — ตามหลักการควรดึง commit ล่าสุดของ branch `main` ทุกครั้งที่ opencode โหลด plugin แต่ในทางปฏิบัติ **opencode/Bun บาง version จะ cache git dependency ที่ resolve ไว้แล้ว** ทำให้ restart เฉยๆ ไม่เห็นเวอร์ชันใหม่

**วิธีบังคับดึงใหม่:**

```bash
rm -rf ~/.cache/opencode/packages/superpowers@git+https_
```

แล้วรีสตาร์ท OpenCode — คราวนี้จะ clone ใหม่ทั้งหมด

ตรวจสอบว่าได้เวอร์ชันใหม่จริง:

```bash
opencode debug skill
```

เช็ค path ที่ log แสดง ควรชี้ไปที่ cache ที่เพิ่ง clone ใหม่ (`~/.cache/opencode/packages/superpowers@git+https_/...`)

> [!tip] อยากได้เวอร์ชันตายตัว ไม่อยากอัปเดตอัตโนมัติ
> ปักหมุดด้วย git tag แทน:
> ```jsonc
> { "plugin": ["superpowers@git+https://github.com/obra/superpowers.git#v6.3.0"] }
> ```

---

## graft-deep.js (custom plugin ที่เขียนเอง)

ไม่มีต้นทางให้ "อัปเดต" เพราะเขียนเอง — ถ้าอยากปรับปรุง แก้ไฟล์ `~/.config/opencode/plugin/graft-deep.js` ตรงๆ ได้เลย (ดูโค้ดเต็มที่ [[plugins]]) ไม่ต้องรีสตาร์ทอะไรเพิ่มนอกจากเปิด session ใหม่ของ opencode

---

## OpenDesign (desktop app)

เป็น Electron app ที่มีตัวอัปเดตในตัว (auto-updater) — โดยทั่วไปจะเช็คเวอร์ชันใหม่ให้เองตอนเปิดแอป ไม่ต้องสั่งอะไรเพิ่ม

ถ้าอยากเช็คด้วยตัวเอง เข้า **Settings → About** ในแอป (มีปุ่ม "Check for updates" หรือคล้ายกัน) หรือดาวน์โหลดตัวติดตั้งเวอร์ชันล่าสุดใหม่จาก [GitHub Releases](https://github.com/nexu-io/open-design/releases) ทับของเดิมได้โดยตรง

> [!warning] อัปเดตแล้วเช็ค `od` shim อีกครั้ง (เฉพาะ Windows)
> ถ้าอัปเดต OpenDesign แล้ว path ของ `daemon-cli.mjs` เปลี่ยน (เช่น เปลี่ยน version folder) shim ที่สร้างไว้ที่ [[gotchas]] ข้อ 4 อาจต้องแก้ path ให้ตรงกับตำแหน่งใหม่ — เช็คด้วย `od --help` ว่ายังทำงานถูกต้องหลังอัปเดต

---

## สรุปเช็คลิสต์อัปเดตทั้งหมด

| ส่วนประกอบ | ต้องทำเองไหม | คำสั่ง |
| --- | --- | --- |
| OpenCode CLI | ✅ ต้องสั่งเอง | `opencode upgrade` |
| MCP ผ่าน npx (playwright, chrome-devtools, postgres, mysql, memory) | ❌ อัตโนมัติ | — |
| context7 (remote) | ❌ อัตโนมัติ (ฝั่งเซิร์ฟเวอร์) | — |
| graft | ✅ ต้องสั่งเอง | `graft upgrade` |
| superpowers | ⚠️ ต้องสั่งเอง (เพราะปัญหา cache) | ลบ cache แล้ว restart |
| graft-deep.js | ➖ ไม่มีอัปเดต (เขียนเอง) | แก้ไฟล์ตรงๆ |
| OpenDesign | ❌ อัตโนมัติ (แต่เช็คเองได้) | ผ่าน UI ในแอป |
