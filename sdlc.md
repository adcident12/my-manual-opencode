---
tags: [project-doc, sdlc, opencode, reference, overview]
updated: 2026-09-11
summary: ภาพรวม Software Development Life Cycle (SDLC) ทั้ง 7 กระบวนการ อธิบายสำหรับผู้อ่านทั่วไป พร้อมลิงก์ไปยังส่วนที่คู่มือ OpenCode นี้ implement จริงในแต่ละ phase, ระบุชัดว่าส่วนไหนยังไม่ครอบคลุม และแนะนำเครื่องมือ/MCP ที่ควรเพิ่มเพื่อปิดช่องว่างแต่ละ phase (ยังไม่ได้ติดตั้งจริง)
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

---

## 🧰 เครื่องมือแนะนำเพิ่มเติม (ยังไม่ได้ติดตั้ง)

> [!warning] หัวข้อนี้เป็นข้อเสนอแนะ ไม่ใช่สิ่งที่ตั้งค่าไว้แล้ว
> ทุก config/MCP ในหัวข้อนี้**ยังไม่ได้เพิ่มเข้า `opencode.jsonc` จริง** — เขียนไว้เป็นตัวเลือกให้พิจารณา/คัดลอกไปใช้เมื่อพร้อม ต่างจากเนื้อหาในหัวข้อ 1-7 ด้านบนที่เป็นของที่ verify แล้วว่าใช้งานได้จริงบนเครื่องนี้

เกณฑ์เลือกเครื่องมือในหัวข้อนี้: (1) **มี MCP ให้ agent เรียกใช้ตรงๆ ได้** ถ้ามี เพื่อให้ agent ช่วยงานในเฟสนั้นได้เต็มที่ ไม่ใช่แค่มนุษย์ใช้เอง (2) เข้ากับ pattern ที่คู่มือนี้ใช้อยู่แล้ว (self-hosted ผ่าน Docker เหมือน sonarqube, MCP แบบ remote/local เหมือนที่มีอยู่)

### Planning

ไม่มี MCP ที่จำเป็นตรงนี้ — เป็น phase ที่ควรอยู่ในมือ human เป็นหลัก แนะนำ **GitHub Projects** (ฟรี ผูกกับ repo ที่มีอยู่แล้ว ไม่ต้องเพิ่ม service ใหม่) เป็นตัวเลือกแรกก่อนไปหาเครื่องมือหนักกว่าอย่าง Linear/Jira

### Requirements Analysis

**ตัวเลือกที่ 1 (แนะนำ, ทำได้เลย):** เปิด `github` MCP ที่มีอยู่ใน `opencode.jsonc` แล้ว (ตอนนี้ `enabled: false`) — แค่สร้าง PAT แล้วเปิด flag รายละเอียดที่ [[mcp-servers#github — จัดการ issues/PR/code search ผ่าน structured tool (ปิดไว้ก่อน จนกว่าจะมี token)|mcp-servers]]

**ตัวเลือกที่ 2 (ถ้าอยากใช้ Linear แทน GitHub Issues):** Linear มี MCP server ทางการ เป็น remote MCP เหมือน context7 — เพิ่มแบบนี้ใน `opencode.jsonc`:

```jsonc
{
  "mcp": {
    "linear": { "type": "remote", "url": "https://mcp.linear.app/mcp" }
  }
}
```

รองรับทั้ง read-only mode (`https://mcp.linear.app/mcp/readonly` — ปลอดภัยกว่าถ้าอยากให้ agent อ่านได้อย่างเดียว) และ OAuth/API key authentication

### Design (System/Architecture)

ไม่มี tool/MCP เฉพาะที่จำเป็น — ใช้ convention ที่เบาที่สุดคือ **ADR (Architecture Decision Record)**: เก็บเป็นไฟล์ markdown ธรรมดาที่ `docs/adr/NNNN-หัวข้อ.md` ต่อโปรเจกต์ ทุกครั้งที่ตัดสินใจสถาปัตยกรรมสำคัญ (เลือก database, เปลี่ยน pattern หลัก ฯลฯ) ให้ agent เขียนสรุปไว้ —ครั้งต่อไป agent จะอ่านของเก่าใน `docs/adr/` ก่อนเสนอของใหม่ได้เอง (คล้ายกับที่ [[plugins#graft-deep — custom plugin (auto-rebuild + auto-inject context)|graft-deep]] ทำกับโค้ด แต่เป็นระดับ decision ไม่ใช่ระดับ code)

> [!tip] Diagram ใช้ mermaid ต่อได้เลย ไม่ต้องหา tool ใหม่
> คู่มือนี้ใช้ mermaid inline ใน markdown อยู่แล้ว (ดู [[USER-MANUAL]]) — เขียน architecture diagram แบบเดียวกันได้เลยโดยไม่ต้องพึ่งเว็บ diagram แยก

สำหรับ API contract แนะนำเก็บเป็น `openapi.yaml` ไว้ใน repo ให้ agent อ่าน/แก้ตรงๆ ได้เหมือนไฟล์โค้ดทั่วไป ไม่ต้องมี tool พิเศษ

### Testing

เติมชั้น unit/integration test ที่ยังขาด — **ไม่ต้องมี MCP เพิ่ม** เพราะ opencode เรียก test runner ผ่าน Bash tool ได้อยู่แล้ว สิ่งที่ต้องเพิ่มคือแค่ตัว test framework ในโปรเจกต์เอง (เช่น `pytest`/`pytest-cov` ฝั่ง Python, `vitest`/`jest` ฝั่ง JS/TS) แล้วให้ `test-driven-development` skill ของ [[plugins#superpowers — skill library|superpowers]] ที่มีอยู่แล้วช่วยคุม workflow

> [!warning] Unit test ที่ agent รันเองไม่พอ ต้องผูกกับ CI ด้วย
> ถ้า agent รัน test ให้ดูตอนพัฒนาอย่างเดียว แต่ไม่มีใครรันซ้ำตอน merge — regression ที่ agent มองข้ามจะหลุดเข้า main ได้ ดูหัวข้อ CI/CD ถัดไป

### CI/CD & Deployment

**CI (แนะนำ GitHub Actions)** เพราะ repo อยู่บน GitHub อยู่แล้ว ไม่ต้องเพิ่ม service ใหม่ — workflow พื้นฐานที่ควรมี:

```yaml
# .github/workflows/ci.yml
name: CI
on: [pull_request, push]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci   # หรือ pip install -r requirements.txt แล้วแต่ stack
      - run: npm test  # unit/integration test จากหัวข้อก่อนหน้า
      - run: npx trivy fs .   # เพิ่ม security scan เข้า pipeline (มี trivy CLI อยู่แล้ว)
```

> [!tip] trivy มีอยู่แล้วบนเครื่อง แค่ยังไม่ได้ผูกเข้า CI
> [[mcp-servers#trivy — vulnerability/secret/misconfig scan (standalone CLI, ไม่ต้องมี server)|trivy]] ที่ติดตั้งไว้แล้วสำหรับให้ agent เรียกตอน dev — เพิ่ม step เดียวกันเข้า GitHub Actions ก็ได้ security gate อัตโนมัติทุก PR โดยไม่ต้องติดตั้งอะไรใหม่เลย

**Deployment target** เลือกตามสไตล์ที่ถนัด (คู่มือนี้เอนไปทาง self-hosted อยู่แล้ว จาก home-llamacpp/sonarqube):

| ทางเลือก | เหมาะกับ | Trade-off |
| --- | --- | --- |
| Self-host ผ่าน Docker Compose + reverse proxy (Caddy/nginx) | ต่อยอด pattern เดิมที่ self-host sonarqube/llama.cpp อยู่แล้ว | ดูแล server เอง (patch, uptime) |
| Vercel / Netlify / Cloudflare Pages | เว็บ frontend ล้วน deploy เร็วสุด | ผูกกับ platform, ต้นทุนเพิ่มถ้า traffic สูง |
| Railway / Render / Fly.io | full-stack app แบบ container ไม่อยากดูแล infra เอง | ยังต้องจ่ายรายเดือน แต่ไม่ต้องดูแล server |

### Maintenance (Production Monitoring)

**Error tracking:** [Sentry](https://github.com/getsentry/sentry-mcp) มี MCP server ทางการ (`@sentry/mcp-server`) — agent เรียก query error/stack trace จาก production ได้ตรงๆ ปิด loop กลับไป requirement/bug fix ได้จริง มีทั้งแบบ remote hosted และ local:

```jsonc
{
  "mcp": {
    "sentry": {
      "type": "remote",
      "url": "https://mcp.sentry.dev/mcp",
      "headers": { "Authorization": "Sentry-Bearer {env:SENTRY_ACCESS_TOKEN}" }
    }
  }
}
```

รองรับ self-hosted Sentry ด้วย (ตั้ง `SENTRY_HOST` แทนถ้าไม่ใช้ Sentry cloud) เข้ากับ pattern self-host ของคู่มือนี้

**Metrics/dashboard:** [Grafana](https://github.com/grafana/mcp-grafana) มี MCP server เช่นกัน (`mcp-grafana`) ให้ agent query dashboard/datasource/alert ได้ — รันเป็น Docker container ได้เหมือน sonarqube:

```jsonc
{
  "mcp": {
    "grafana": {
      "type": "local",
      "command": ["docker", "run", "--rm", "-i", "-e", "GRAFANA_URL", "-e", "GRAFANA_SERVICE_ACCOUNT_TOKEN", "grafana/mcp-grafana", "-t", "stdio"],
      "environment": {
        "GRAFANA_URL": "http://host.docker.internal:3000",
        "GRAFANA_SERVICE_ACCOUNT_TOKEN": "{env:GRAFANA_SERVICE_ACCOUNT_TOKEN}"
      },
      "timeout": 30000,
      "enabled": false
    }
  }
}
```

**Dependency updates:** เปิด GitHub Dependabot (native, ไม่ต้องติดตั้งอะไร แค่เพิ่มไฟล์ `.github/dependabot.yml`) — ทำงานคู่กับ trivy ที่มีอยู่แล้ว (trivy สแกน vulnerability ที่มีอยู่ ณ ปัจจุบัน, Dependabot เตือนก่อนเมื่อมี patch ใหม่ออก)

> [!info] ทำไมไม่แนะนำ Uptime Kuma
> พิจารณาแล้วแต่ไม่ใส่ไว้ในนี้เพราะไม่มี MCP ให้ agent เรียกใช้ — เป็นแค่ dashboard ให้ human ดูเฉยๆ ถ้าต้องการ uptime monitoring ง่ายๆ ยังติดตั้งได้ (self-host ผ่าน Docker เหมือนกัน) แต่จะไม่ได้ประโยชน์จากการทำงานคู่กับ agent เหมือนตัวอื่นในหัวข้อนี้
