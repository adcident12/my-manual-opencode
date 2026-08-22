---
tags: [project-doc, maintenance, opencode, reference]
updated: 2026-08-22
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

## sonarqube (self-hosted, ผ่าน Docker)

ต่างจาก MCP อื่นทั้งหมดในหน้านี้ตรงที่มี**สองส่วนที่ต้องอัปเดตแยกกัน** และ**ไม่มีตัวไหน auto-update แบบ npx เลย** — เพราะรันผ่าน Docker image ที่ pull มาเก็บ cache ไว้ในเครื่อง ไม่ใช่ดึงจาก registry สดทุกครั้งเหมือน `npx -y package@latest`

### ส่วนที่ 1 — SonarQube MCP wrapper (image `sonarsource/sonarqube-mcp`)

Config ที่ตั้งไว้ (ดู [[mcp-servers]] หัวข้อ sonarqube) ไม่ได้ pin เวอร์ชัน แต่ก็ไม่ได้ใส่ `--pull=always` ด้วย — ผลคือ Docker จะใช้ image ตัวเดิมที่ cache ไว้ซ้ำไปเรื่อยๆ แม้ tag จะชื่อ `latest` ก็ตาม **ต้องสั่ง pull เองเป็นระยะถ้าอยากได้เวอร์ชันใหม่:**

```bash
docker pull sonarsource/sonarqube-mcp
```

> [!tip] ถ้าอยากให้เช็คอัตโนมัติทุกครั้งที่เปิด
> เพิ่ม `"--pull=always"` เข้าไปใน `"command"` array ของ config (ต่อจาก `docker run`) — แลกกับ startup ช้าลงทุกครั้งเพราะต้องเช็ค registry ก่อน ไม่แนะนำถ้าเปิด/ปิด opencode บ่อย

### ส่วนที่ 2 — SonarQube Server container (image `sonarqube:community`)

Container นี้เป็น service ที่รันค้างอยู่ตลอด (ไม่ใช่ spawn ต่อครั้งแบบ MCP) การอัปเดตคือ pull image ใหม่แล้ว recreate container — ข้อมูลไม่หายเพราะเก็บอยู่ใน named volume แยกต่างหาก:

```bash
docker pull sonarqube:community
docker stop sonarqube
docker rm sonarqube
docker run -d --name sonarqube -p 9000:9000 \
  -v sonarqube_data:/opt/sonarqube/data \
  -v sonarqube_extensions:/opt/sonarqube/extensions \
  -v sonarqube_logs:/opt/sonarqube/logs \
  sonarqube:community
```

ตรวจสอบว่าขึ้นเวอร์ชันใหม่จริงหลัง container รันสำเร็จ:

```bash
docker logs sonarqube | grep "SonarQube is operational"
```

เข้า **http://localhost:9000 → Administration → System** เพื่อดูเลขเวอร์ชันที่ยืนยันจากหน้าเว็บอีกที

> [!danger] ข้ามเวอร์ชันหลักหลายเวอร์ชันพร้อมกันอาจพัง
> SonarQube (เหมือน database ทั่วไป) มักรองรับแค่การอัปเกรดข้าม major version ทีละ 1 ขั้น ถ้าปล่อยไว้นานแล้วอยากอัปเดตทีเดียวข้ามหลาย version ต้องเช็ค [Upgrade Guide ทางการ](https://docs.sonarsource.com/sonarqube-server/upgrading/) ก่อนเสมอ — บางครั้งต้อง upgrade ทีละขั้นตามลำดับ ไม่ใช่กระโดดตรงไปเวอร์ชันล่าสุด

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
| sonarqube MCP wrapper (docker) | ⚠️ ต้องสั่งเอง (ไม่ auto เหมือน npx) | `docker pull sonarsource/sonarqube-mcp` |
| sonarqube Server (container) | ✅ ต้องสั่งเอง | pull → stop → rm → recreate (เก็บ volume เดิม) |
