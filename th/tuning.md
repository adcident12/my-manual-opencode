---
tags: [project-doc, tuning, opencode, measurement, reference]
updated: 2026-10-11
summary: วัดผลจริงว่า workflow ใน USER-MANUAL/architecture ทำงานครบไหม — ขนาด prompt ต่อ turn, tool ที่ agent เรียกจริง, สาเหตุการอ่านไฟล์ซ้ำ, ทดสอบครบวงจร — แล้วปรับจูนจากผลที่วัดได้ พร้อมสคริปต์ให้วัดซ้ำบนเครื่องตัวเอง
---

# Tuning — วัดผลจริง แล้วปรับให้ workflow ทำงานครบ

ภาพรวมที่ [[index]] · layer ตามหน้าที่ที่ [[architecture]] · workflow ที่ [[USER-MANUAL]] · ปัญหาที่เจอที่ [[gotchas]]

config ครบ ไม่ได้แปลว่า workflow ทำงานครบ — MCP ทุกตัว `connected` และ skill ทุกตัวโหลดได้ แต่ไม่ได้บอกว่า agent **ใช้** มันตามลำดับที่ [[USER-MANUAL]] กับ [[architecture]] วาดไว้จริงหรือเปล่า หน้านี้บันทึกการวัดผลจริง 4 แบบ (ทั้งหมดรันบนเครื่องตัวเอง ไม่ส่งข้อมูลออกนอกเครื่อง) ผลที่ได้ และสิ่งที่ปรับจากผลนั้น

> [!info] สรุปผล (วัดเมื่อ 2026-10-03 · OpenCode 1.18.34 · graft 0.21.1 · โมเดล self-hosted Qwen3.8 27B, context 131k)
> | สิ่งที่วัด | ก่อนปรับ | หลังปรับ |
> | --- | --- | --- |
> | prompt ต่อ turn ก่อนเริ่มทำงาน | ~43.3k tokens (131 tools) | **~32.6k tokens (84 tools), −25%** |
> | agent ใช้ graft ตอนสำรวจโค้ด (E2E turn แรก) | 0 ครั้ง, read 7 ครั้ง | **2 ครั้ง, read 2 ครั้ง** |
> | memory MCP | เรียก 1 ครั้งใน 50 session, ไฟล์ไม่เคยถูกสร้าง | **บันทึกแล้วดึงกลับได้ข้าม session** |
> | การอ่านไฟล์ซ้ำ | 76% เกิดหลัง compaction | เปิด `compaction.prune` + กฎ re-read (**ยังไม่ได้ยืนยันกับ session ยาว**) |
> | ใส่ Caveman + benjamin-plus (ข้อ 8) | — | **ไม่ดีขึ้นแบบวัดได้** — เก็บ Caveman ไว้เพราะคำตอบอ่านง่าย (prompt เป็น ~34.0k), ถอด benjamin-plus |
>
> **OpenCode 2 (2026-10-11):** prompt ต่อ turn ลดเหลือ **~14.2k** tokens (Code Mode) ส่วน plugin, ตัวกรอง skill, compaction และกฎใน AGENTS.md ต้องทำใหม่ทั้งหมด วัดซ้ำใน **ข้อ 9**

สคริปต์ทั้งหมดอยู่ใน [`scripts/`](../scripts/) — ใช้แค่ Node.js (≥ 22.5 สำหรับ `session-report.mjs` เพราะใช้ `node:sqlite` ที่มากับ Node) ต้นฉบับ HTML ของภาพในหน้านี้อยู่ที่ [`assets/tuning/report.html`](../assets/tuning/report.html)

---

## 1. วัดขนาด prompt ต่อ turn

ทุก turn OpenCode ส่ง system prompt, AGENTS.md ทุกไฟล์, รายชื่อ skill และ **นิยามของ tool ทุกตัวจาก MCP ที่เปิดอยู่** ไปให้โมเดลใหม่ทั้งก้อน ส่วนนี้คือ "ค่าเข้า" ที่จ่ายก่อนเริ่มทำงานจริง และกิน context 131k ของโมเดล local ไปตรงๆ

### วิธีวัด — ดัก request จริงด้วย server จำลอง

ใช้วิธีเดียวกับ [[gotchas]] ข้อ 8 (ชี้ `baseURL` ไปที่ proxy บนเครื่อง) แต่ไม่ต้องเรียกโมเดลจริงเลย — [`capture-server.mjs`](../scripts/capture-server.mjs) ทำตัวเป็น OpenAI-compatible endpoint ที่บันทึก request แล้วตอบ `ok` กลับ

```bash
# terminal 1 — เปิด server จำลอง
node scripts/capture-server.mjs ./capture

# terminal 2 — ให้ OpenCode ส่ง prompt หนึ่งครั้ง (config จริงไม่ถูกแก้ — OPENCODE_CONFIG_CONTENT ถูก merge ทับแค่ใน process นี้)
# OpenCode 2: ใส่ --standalone ไม่อย่างนั้น request จะไปที่ background service ซึ่งไม่เห็นตัวแปรนี้
cd my-project
OPENCODE_CONFIG_CONTENT='{"provider":{"capture":{"npm":"@ai-sdk/openai-compatible","options":{"baseURL":"http://127.0.0.1:18555/v1"},"models":{"fake":{"limit":{"context":131072,"output":32768}}}}}}' \
  opencode run --standalone -m capture/fake "Reply with exactly the word: ok"

# แยกหมวด
node scripts/analyze-prompt.mjs ./capture/req-02.json
```

PowerShell ตั้ง env var แบบนี้แทน: `$env:OPENCODE_CONFIG_CONTENT='{...}'; opencode run -m capture/fake "..."`

> [!note] ไฟล์ไหนคือ prompt หลัก
> บน OpenCode 1 จะได้ 2 ไฟล์ — ไฟล์เล็ก (`req-01`) คือ request สร้างชื่อ session ไฟล์ใหญ่ (`req-02`) คือ prompt ที่โมเดลได้รับจริงใน turn แรก บน OpenCode 2 การ `run` สั้นๆ ได้ไฟล์เดียวคือ prompt หลัก

> [!tip] ตัวเลข token แม่นแค่ไหน
> `analyze-prompt.mjs` ประมาณ token จาก จำนวนตัวอักษร ÷ 3.6 — ตรวจแล้วว่ายอดรวม "ก่อนปรับ" (~43.3k) ตรงกับ 42,920 prompt tokens ที่ provider รายงานจริงสำหรับ prompt เดียวกัน ถ้ามีตัวเลขจริงของตัวเอง ใส่ `--tokens <N>` เพื่อปรับอัตราให้ตรงเป๊ะ

### ผล

![Prompt budget per turn — before vs after tuning](../assets/tuning/1-prompt-budget.png)

สิ่งที่เห็น:
- **MCP ฝั่งเบราว์เซอร์ 3 ตัว (open-design, chrome-devtools, playwright) กินรวม ~17.5k tokens หรือ 40%** ของ prompt ทั้งหมด ทั้งที่งานส่วนใหญ่ไม่ได้ใช้เบราว์เซอร์
- open-design คนเดียว ~6.6k tokens (tool 22 ตัว + คำสั่งของ server เอง) — แต่ถูกใช้แค่ตอนดึงงานจาก OpenDesign ([[USER-MANUAL]] ข้อ 5)
- รายชื่อ skill 25 ตัว (~3.4k), ponytail ruleset (~1.4k), superpowers bootstrap (~1k) — ทั้งหมดนี้ถูกส่ง**ทุก turn** ไม่ใช่แค่ตอนเรียก skill

---

## 2. ดูว่า agent เรียก tool อะไรจริง

OpenCode เก็บทุก tool call ของทุก session ไว้ในฐานข้อมูลของมันเอง (`~/.local/share/opencode/opencode.db`) — [`session-report.mjs`](../scripts/session-report.mjs) อ่านแบบ read-only แล้วสรุปให้

```bash
node scripts/session-report.mjs usage --since 2026-09-01
```

![What the agent actually called](../assets/tuning/2-tool-usage.png)

เทียบกับ [[architecture]] ทีละ layer:

| Layer | ที่วาดไว้ | ที่เกิดจริง |
| --- | --- | --- |
| KNOWLEDGE | graft, graft-deep, context7, memory, open-design | **graft 25 ครั้ง เทียบกับ `read` ทั้งไฟล์ 486 ครั้ง** · memory 1 ครั้ง (ไฟล์ `memory.jsonl` ไม่เคยถูกสร้างเลย) · open-design 1 ครั้ง |
| REASONING | brainstorming, grilling, writing-plans | ✅ brainstorming และ writing-plans ถูกใช้สม่ำเสมอ · grilling ถูกเรียกเป็น skill แยกแค่ 2 ครั้ง — ตามกฎใน AGENTS.md มันควรทำงานเป็นรูปแบบคำถามข้างใน brainstorming ซึ่งไม่ถูกนับเป็น skill call (ยังไม่ได้ตรวจว่ารูปแบบนั้นถูกใช้ทุกครั้งหรือไม่) |
| EXECUTION | ponytail, playwright, chrome-devtools | ✅ chrome-devtools 541 ครั้ง · **playwright 33 ครั้ง** — ทำงานซ้อนกับ chrome-devtools |
| GOVERNANCE | verification, sonarqube, trivy | sonarqube ใช้ใน 1–6 session · **trivy 0 ครั้ง** |

---

## 3. ทำไมอ่านไฟล์เดิมซ้ำ

ตัวเลข `read` ที่สูงไม่ได้แปลว่า "ไม่ใช้ graft" เสมอไป — OpenCode บังคับให้ `read` ไฟล์ก่อน `edit` อยู่แล้ว เลยแยกดูการอ่าน**ซ้ำ**ไฟล์เดิม ว่าแต่ละครั้งเกิดหลังเหตุการณ์อะไร

```bash
node scripts/session-report.mjs rereads --since 2026-09-01
```

![Why files were read again](../assets/tuning/3-rereads.png)

**260 จาก 341 ครั้ง (76%) เกิดทันทีหลัง compaction** — session ทั่วไป compact 4–10 ครั้ง ทุกครั้งที่ OpenCode สรุป context เนื้อหาไฟล์ที่เคยอ่านไว้จะหายไป agent เลยอ่านทั้งไฟล์ใหม่ (session หนึ่งอ่านซ้ำหลัง compaction 162 ครั้ง ผลอ่านซ้ำทั้ง session รวม ~221k tokens) ต้นเหตุจึงอยู่ที่ **compaction บ่อยเกินไป** ไม่ใช่ graft

---

## 4. ทดสอบครบวงจร (E2E) ในสำเนาของโปรเจกต์

ขอ feature จริงแบบเดียวกับตัวอย่างใน [[USER-MANUAL]] ข้อ 3 แล้วดูว่า agent เดินตาม 9 ขั้นหรือไม่ — **ทำในสำเนาเสมอ** อย่าทดสอบในโปรเจกต์จริง

```bash
git clone ~/code/my-project ~/tmp/my-project-e2e
cp ~/code/my-project/AGENTS.md ~/code/my-project/opencode.json ~/tmp/my-project-e2e/   # ไฟล์ที่ยังไม่ได้ commit ต้อง copy เอง
cd ~/tmp/my-project-e2e && graft build

opencode run --title e2e-pause "please add a pause feature to the game: pressing P (or Esc) pauses and resumes gameplay"
node /path/to/scripts/session-report.mjs session e2e-pause   # ดูผล turn แรก

# ตอบคำถาม/อนุมัติใน session เดิม
opencode run -s <session-id> "go ahead"
```

> [!note] `opencode run` ไม่มี tool `question`
> ในโหมด headless OpenCode ไม่ส่ง tool `question` ให้โมเดล (ดูได้จาก request ที่ดักไว้ในข้อ 1) brainstorming จึงถามเป็นข้อความธรรมดาแล้วจบ turn — ตอบต่อด้วย `opencode run -s <id>` ได้โดยไม่ค้าง session id ดูได้จาก `opencode session list`

![End-to-end test](../assets/tuning/4-e2e-test.png)

ผลที่ได้:
- ✅ `brainstorming` ถูกเรียกเป็นอย่างแรกเสมอ และงานเล็กได้ดีไซน์ที่แคบ (1 ไฟล์ ~10 บรรทัด) — ponytail ทำงาน
- ✅ รันเทสต์ครบ และตรวจปุ่ม P/Esc ใน Chrome จริงผ่าน chrome-devtools
- ❌→✅ **graft ไม่ถูกเรียกเลย** — ทั้งที่ graft-deep inject คำแนะนำ "use graft first" ไว้แล้ว ต้นเหตุคือขั้นแรกของ `brainstorming` เขียนว่า *"Explore project context — check files, docs, recent commits"* โมเดลทำตามคำสั่งของ skill (รัน `git log`, `read` โฟลเดอร์ทีละอัน) ทับคำสั่งใน AGENTS.md — ปัญหาแบบเดียวกับที่ต้องเขียนกฎประสานงานให้ grilling ใน [[plugins]] แก้ด้วยกฎใหม่ใน global AGENTS.md (ข้อ 5) แล้วรันคำขอเดิมซ้ำ: graft 0 → 2 ครั้ง, `read` 7 → 2 ครั้ง (เหลือแค่ไฟล์ที่จะแก้)
- ⚠️ **ไม่ commit** ตอนจบ (ขั้นที่ 9) — ยังไม่ได้ใส่กฎบังคับ เพราะจะทำให้ agent commit เองในทุกโปรเจกต์
- ⚠️ **การตรวจในเบราว์เซอร์ช้า** — turn ที่ลงมือทำใช้ 32 นาที เรียก chrome-devtools 37 จาก 60 ครั้ง (ส่วนใหญ่เป็น `evaluate_script`) ทุก step ส่ง prompt ที่โตขึ้นเรื่อยๆ (สูงสุด ~81k tokens) ให้โมเดล local ประมวลผลใหม่

> [!tip] ได้ bug จริงเป็นของแถม
> ระหว่างทดสอบ agent พบว่าเมนูของเกมตัวอย่างพังตั้งแต่เปิด (scene ยังเรียกชื่อ API เก่าหลัง refactor) — การทดสอบครบวงจรเป็นระยะช่วยจับปัญหาที่เทสต์ของตัวโค้ดไม่ครอบคลุมได้ด้วย

---

## 5. สิ่งที่ปรับ (config ที่ใช้จริงหลังทดสอบ)

> [!tip] ผลลัพธ์สุดท้ายเป็นไฟล์จริงใน [`config/`](../config/README.md)
> [`config/opencode.jsonc`](../config/opencode.jsonc) (template ที่รวมทุกข้อด้านล่างแล้ว) และ [`config/AGENTS.md`](../config/AGENTS.md) (กฎครบทุกหัวข้อ) — หัวข้อย่อยด้านล่างอธิบายเหตุผลของแต่ละส่วน

### 5.1 ปิด MCP ที่ใช้น้อยเป็นค่าเริ่มต้น แล้วเปิดเฉพาะโปรเจกต์ที่ต้องใช้

ใน `~/.config/opencode/opencode.jsonc`:

```jsonc
"open-design": {
  "type": "local",
  "command": ["od", "mcp"],
  "timeout": 30000,
  "enabled": false        // ~6.6k tokens/turn, ใช้แค่ตอนดึงงานจาก OpenDesign
},
"playwright": {
  "type": "local",
  "command": ["npx", "-y", "@playwright/mcp@latest"],
  "timeout": 30000,
  "enabled": false        // ซ้อนกับ chrome-devtools; e2e suite ยังรัน `npx playwright test` ผ่าน bash ได้
}
```

เปิดเฉพาะโปรเจกต์ใน `<project>/opencode.json` (merge กับ global — ใส่แค่ field ที่เปลี่ยน):

```jsonc
{ "mcp": { "open-design": { "enabled": true } } }
```

### 5.2 เปิด `compaction.prune` (OpenCode 1 — บน OpenCode 2 ดูข้อ 9)

```jsonc
"compaction": { "auto": true, "prune": true }
```

`prune` (ค่าเริ่มต้นปิด) ทำงานตอนจบแต่ละคำสั่ง: ลบผลลัพธ์ของ tool ที่เก่ากว่า 2 turn ล่าสุด โดยเว้นผลล่าสุด ~40k tokens ไว้เสมอ และจะลบก็ต่อเมื่อมีให้ลบเกิน ~20k tokens (ตรวจจาก source ของ OpenCode 1.18.34) — ลบเป็นก้อนใหญ่นานๆ ครั้ง prompt cache ของ llama.cpp จึงไม่เสียทุก turn แต่ช่วยให้ compaction เต็มรูปแบบเกิดน้อยลง

### 5.3 กฎใหม่ 4 ข้อใน global AGENTS.md

ต่อท้ายกฎ grill-me เดิม ([[plugins]]) ใน `~/.config/opencode/AGENTS.md` — เขียนเป็นภาษาอังกฤษเพราะเป็นคำสั่งให้โมเดล (~610 tokens รวมกัน) กฎ "Verifying UI changes" เพิ่มทีหลังจากผลในข้อ 8:

```markdown
## Verifying UI changes — once, in a real browser

Passing tests is not enough for a change someone will see in a browser (a
web page, a game). Before reporting done, verify it once with
chrome-devtools: load the page, do the one interaction the task is about,
and check the console for errors. Keep it to a handful of calls — a single
short wait for the page to settle, no polling loops. If the page cannot
load or throws, that is a failure to report or fix, not "done".

## Exploring a codebase — graft first, even inside a skill

Skills such as `brainstorming` ("Explore project context — check files,
docs, recent commits") tell you to look around the project. When the
project has a `graft/` index, do that step through graft instead of
listing directories and reading files one by one:
`graft_graft_repo_map` for orientation, `graft_graft_find_code` for "where
is X / how does Y work", `graft_graft_file_api` to skim a file, and
`graft_graft_trace_calls` for callers. Then `read` only the files you are
about to edit. Directory listings and whole-file reads are the fallback
when there is no `graft/` index.

## Re-reading files after compaction or pruning

When you need a file you already read earlier in this session (its content
was compacted or pruned away), do not re-read the whole file. If the
project has a `graft/` index, run `graft skeleton <file>` or `graft ask
"<symbol>" --source` first; then `read` only the lines you need with
`offset`/`limit`. A full read is fine right before editing a file you
have not read since the last compaction.

## Memory — facts that must outlive this session (memory MCP)

- Before asking the user about a preference or a past decision, call
  `memory_search_nodes` with the project's folder name (and "user") — the
  answer may already be stored.
- When the user states a durable preference, or brainstorming/grilling
  settles a decision that later sessions will need, save it:
  `memory_create_entities` for a new project/user entity, otherwise
  `memory_add_observations` — one short sentence per fact, prefixed with
  today's date (YYYY-MM-DD).
- Never store secrets, code, or anything the repo already records
  (graft, git history, specs under `docs/`).
```

> [!important] ชื่อ tool ต้องตรงกับที่โมเดลเห็นจริง
> OpenCode ตั้งชื่อ tool ของ MCP เป็น `<server>_<tool>` — graft จึงกลายเป็น `graft_graft_find_code` ฯลฯ ดูชื่อจริงได้จาก request ที่ดักไว้ในข้อ 1 ก่อนเขียนกฎที่อ้างชื่อ tool

ผลทดสอบกฎ memory ด้วยโมเดลจริง: session แรกสั่ง "remember …" → agent เรียก `memory_search_nodes` แล้ว `memory_create_entities` พร้อมวันที่ · session ใหม่ถามกลับ → agent เรียก `memory_search_nodes` จนเจอแล้วตอบถูก

### 5.4 ตัด skill ของเครื่องมืออื่นออก — `OPENCODE_DISABLE_EXTERNAL_SKILLS=1` (OpenCode 1 — บน OpenCode 2 ดูข้อ 9)

OpenCode โหลด skill จาก `~/.claude/skills` (Claude Code) และ `~/.agents/skills` มาด้วยโดยอัตโนมัติ — บนเครื่องที่ติดตั้งเครื่องมือ AI หลายตัว รายชื่อ skill พองจาก 25 เป็น 86 ตัว (ทุกตัวถูกส่งในทุก turn และโมเดลเล็กเลือกผิดง่าย) ตั้ง env var ระดับ user:

```powershell
[Environment]::SetEnvironmentVariable('OPENCODE_DISABLE_EXTERNAL_SKILLS','1','User')   # Windows
```

```bash
export OPENCODE_DISABLE_EXTERNAL_SKILLS=1   # macOS/Linux — ใส่ใน shell profile
```

ตรวจด้วย `opencode debug skill` — ควรเหลือเฉพาะ skill จาก superpowers, ponytail, i-have-adhd, grill-me/grilling และ `customize-opencode` ที่มากับ OpenCode — รายละเอียดว่าทำไมไม่ใช้ `OPENCODE_DISABLE_CLAUDE_CODE_SKILLS` อยู่ใน [[gotchas]] ข้อ 15

### 5.5 context7 — ส่ง API key ผ่าน header จาก env var

ถ้ามี key ของ context7 (ไม่บังคับ — ไม่มีก็ใช้ได้แต่ติด rate limit) อย่าเขียน key ลง config ตรงๆ:

```jsonc
"context7": {
  "type": "remote",
  "url": "https://mcp.context7.com/mcp",
  "headers": { "CONTEXT7_API_KEY": "{env:CONTEXT7_API_KEY}" },
  "enabled": true
}
```

---

## 6. ยังไม่ได้แก้ / ต้องติดตามต่อ

- **ผลของ `prune` + กฎ re-read** — session ทดสอบสั้นจนไม่เกิด compaction เลย ให้รัน `session-report.mjs rereads` อีกครั้งหลังใช้งานจริงไปสักพัก แล้วเทียบสัดส่วน "after a compaction" กับ 76% เดิม
- **ขั้น commit** — ถ้าต้องการให้ตรง [[USER-MANUAL]] ขั้นที่ 9 เพิ่มกฎใน AGENTS.md ให้ commit เป็นก้อนเดียวหลังตรวจผ่าน (ไม่ push) — ตัดสินใจเองว่าอยากให้ agent commit เองหรือเปล่า
- **การตรวจในเบราว์เซอร์** — 37–40 calls / 33–36 นาทีสำหรับ feature เล็กๆ บน OpenCode 1 ruleset ด้าน token efficiency ไม่ช่วย (ข้อ 8) บน OpenCode 2 feature เดียวกันใช้เวลารวม 15 นาที (ข้อ 9) และส่วนหนึ่งหมดไปกับการเขียน web server ชั่วคราว ซึ่งตอนนี้กฎ UI ให้ใช้ `npx http-server` แทน
- **trivy ไม่เคยถูกเรียก** — ยังเปิดไว้ตาม [[architecture]] (~1.7k tokens/turn) ถ้าวัดซ้ำแล้วยังเป็น 0 พิจารณาปิด แล้วให้ agent รัน `trivy fs .` ผ่าน bash หรือใส่ใน CI ตาม [[sdlc]]

---

## 7. เครื่องมือที่ลองแล้วไม่ได้ใช้ต่อ (และเหตุผล)

| เครื่องมือ | ทำอะไร | ผลที่ได้ | เหตุผลที่ไม่ใช้ต่อ |
| --- | --- | --- | --- |
| [Langfuse](https://github.com/langfuse/langfuse) self-host + [opencode-observability-plugin](https://github.com/langfuse/opencode-observability-plugin) | trace เต็มทุก turn: prompt, generation, tool call, reasoning, token | ✅ ใช้ได้ — trace เข้า Langfuse บนเครื่อง | เก็บเนื้อหาเต็มรวมผลของ tool (ไฟล์ที่ agent อ่าน); Docker 6 containers ใช้ RAM ~2.6 GB — ถอดออกตามความชอบ |
| [opencode-observability](https://github.com/abekdwight/opencode-observability) | dashboard/monitor บน `127.0.0.1` อ่าน `opencode.db` | ✅ ใช้ได้ | UI บางส่วนเป็นภาษาญี่ปุ่น |
| [token-optimizer](https://github.com/alexgreensh/token-optimizer) | quality score, compaction guidance, session continuity | ประเมินจากโค้ด ไม่ได้ติดตั้ง | plugin ฝั่ง OpenCode **ไม่มี**การบีบอัด output ของ tool (ตัวเลขประหยัดใน README มาจาก Claude Code); มี nudge อัตโนมัติเมื่อ context ≥ 25% ซึ่ง setup นี้เกินตั้งแต่ turn แรก; license PolyForm Noncommercial |
| [benjamin-plus](https://github.com/JetBrains/benjamin-plus-skill) (JetBrains) | กฎ ~880 tokens: สำรวจรวดเดียว, อ่านเฉพาะช่วง, poll ให้น้อย, "เสร็จ = เกณฑ์ตรวจผ่าน" | ติดตั้งผ่าน `instructions` แล้ววัด (ข้อ 8) | ไม่ลดเวลา/tool call เมื่อทำครบทุกขั้น และทำให้ agent ข้ามการตรวจในเบราว์เซอร์ ([[gotchas]] ข้อ 19) — ถอดออก |
| proxy ของ [caveman](https://github.com/JuliusBrussee/caveman) | บีบผลของ tool ก่อนส่งให้โมเดล | ประเมินจากโค้ด ไม่ได้ติดตั้ง | wrap OpenCode เฉพาะ provider `openai`/`anthropic` — provider ที่ host เองไม่ผ่าน proxy; telemetry เปิดเป็นค่าเริ่มต้น (ส่วน **skill** ของ caveman ใช้อยู่ — [[plugins]]) |
| [token-diet](https://github.com/Kulaxyz/token-diet) | ruleset รวม: ตอบสั้น + YAGNI + อ่านเฉพาะช่วง + จำกัดเทสต์ | ประเมินจาก README ไม่ได้ติดตั้ง | ซ้ำกับ caveman, ponytail และกฎใน AGENTS.md พร้อมกัน; กฎ "เทสต์ ≤ 10 ต่อ session" ขัดกับ TDD ของ superpowers; ไม่มี installer สำหรับ OpenCode |

> [!warning] ข้อควรรู้ถ้าจะ self-host Langfuse เอง
> - compose ทางการ map ClickHouse ไว้ที่ host port `9000` — ชนกับ SonarQube ถ้ารันที่ `9000` ใช้ไฟล์ `docker-compose.override.yml` เอา port ที่ไม่จำเป็นออก (`ports: !reset []`) แทนการแก้ไฟล์ทางการ
> - `TELEMETRY_ENABLED` ค่าเริ่มต้นเป็น `true` — ปิดเองถ้าต้องการ self-host จริง
> - Langfuse v4 ไม่มี `/api/public/traces` แล้ว (events-only) — ใช้ `/api/public/v2/observations`
> - plugin ใช้ env var `LANGFUSE_*` แทน cloud ก็ต่อเมื่อตั้งทั้ง public **และ** secret key

> [!tip] เกณฑ์เลือกเครื่องมือเพิ่ม
> ก่อนติดตั้งอะไรใหม่ ถาม 2 ข้อ: (1) อยู่ layer ไหนใน [[architecture]] และซ้ำกับของที่มีหรือเปล่า (2) ใส่อะไรเข้า prompt ทุก turn บ้าง — วัดด้วยข้อ 1 ก่อนและหลังติดตั้งได้เลย

---

## 8. ทดลอง Caveman + benjamin-plus (2026-10-03) — ตัวอย่างการวัดก่อนตัดสินใจ

ลองเพิ่มเครื่องมือด้าน "token efficiency" สองตัวพร้อมกัน แล้ววัดด้วยวิธีในหน้านี้: **[caveman](https://github.com/JuliusBrussee/caveman)** skill (ตอบสั้น — ใช้แทน i-have-adhd) และ **[benjamin-plus](https://github.com/JetBrains/benjamin-plus-skill)** (กฎ 5 ข้อเรื่องการสำรวจ/อ่าน/poll ใส่ผ่าน `"instructions"`) งานทดสอบคืองานเดิมในข้อ 4 (เพิ่มระบบ pause) ในสำเนาของเกมตัวอย่าง รันแบบละหนึ่งรอบ

| | ก่อนใส่ | ใส่ทั้งคู่ | ใส่ทั้งคู่ + กฎ "Verifying UI changes" |
| --- | --- | --- | --- |
| prompt ต่อ turn | ~32.6k | ~34.8k (+2.1k) | ~34.9k |
| turn 1 (สำรวจ + ดีไซน์): เวลา / output tokens | 6.0 นาที / 3,541 | 7.5 นาที / 5,379 | 8.3 นาที / 6,133 |
| turn 1: graft / read | 2 / 2 | 4 / 1 | 3 / 5 |
| turn 2 (ลงมือ + ตรวจ): เวลา | 32.6 นาที | **6.0 นาที** | 36.1 นาที |
| turn 2: output tokens | 25,308 | **4,051** | 28,031 |
| turn 2: tool call / chrome-devtools | 60 / 37 | **10 / 0** | 66 / 40 |
| ตรวจในเบราว์เซอร์ + เจอ bug เมนูพัง | ✅ | ❌ ข้าม | ✅ |
| เทสต์ 5 ชุด | ผ่าน | ผ่าน | ผ่าน |

สิ่งที่ตัวเลขบอก:

- **คอลัมน์กลางดูดีที่สุด แต่เร็วเพราะข้ามงาน** — agent หยุดหลังเทสต์ผ่านโดยไม่เปิดเบราว์เซอร์ ตามกฎ "เสร็จ = เกณฑ์ตรวจของงานผ่าน" ของ benjamin-plus จึงไม่เจอ bug ที่รอบแรกเจอ ([[gotchas]] ข้อ 19)
- **พอบังคับให้ทำครบ (คอลัมน์ขวา) ต้นทุนกลับไปเท่าเดิม** — เวลา, output และจำนวน chrome-devtools call ใกล้เคียงรอบแรก แปลว่าทั้งสองตัวไม่ได้ทำให้งานเดียวกันถูกลง
- **turn 1 ไม่ดีขึ้น** — ใช้เวลาและ output มากขึ้น และ prompt หนักขึ้นทุก turn (caveman ~1.2k, benjamin-plus ~0.9k)
- **คำตอบสุดท้ายสั้นและอ่านง่ายขึ้น** (~9%) — ผลเดียวที่เห็นจาก caveman ซึ่งตรงกับที่ JetBrains วัดไว้ (output −8.5% ในงานเขียนโค้ด)

**ที่ตัดสินใจ:** เก็บ caveman (สไตล์การตอบ + `/caveman-commit` / `/caveman-review`, รับต้นทุน ~1.2k tokens/turn) · ถอด benjamin-plus · เก็บกฎ "Verifying UI changes" และ `--isolated` ของ chrome-devtools ไว้

> [!warning] ข้อจำกัดของการวัดนี้
> แต่ละแบบรันรอบเดียว และโมเดลแกว่งระหว่างรอบได้มาก (turn 1 ของ config เดียวกันวัดสองรอบได้ 5.7 และ 7.5 นาที) — สรุปได้แค่ว่า "ไม่เห็นว่าดีขึ้น" ไม่ใช่ "แย่ลง" ถ้าจะตัดสินให้ขาดต้องรันซ้ำหลายรอบต่อแบบ

> [!tip] บทเรียนเรื่องวิธีวัด
> 1. วัด**ลำดับ tool call** คู่กับเวลาเสมอ (`session-report.mjs session <title>`) — รอบที่เร็วผิดปกติมักแปลว่ามีขั้นที่หายไป
> 2. ดูค่า `finish` ของ step สุดท้าย — รอบหนึ่งจบด้วย `tool-calls` (ไม่ใช่ `stop`) เพราะ Chrome profile ชนกับเครื่องมืออื่น ([[gotchas]] ข้อ 17) ทำให้ run จบกลางคันและตัวเลขใช้ไม่ได้
> 3. อย่าใช้ chrome-devtools จากเครื่องมืออื่นบนเครื่องเดียวกันระหว่างรันทดสอบ ถ้ายังไม่ได้ใส่ `--isolated`

---

## 9. OpenCode 2 — สิ่งที่เปลี่ยนและสิ่งที่วัดซ้ำ (2026-10-11)

การอัปเกรดจาก OpenCode 1.18.34 เป็น **2.0.26** (superpowers ขยับเป็น 7.0.0 พร้อมกัน) ทำให้บางส่วนของ setup นี้พังโดยไม่มี error ขึ้นจอ วิธีแก้แต่ละข้อด้านล่างตรวจกับ config จริงบนเครื่องนี้แล้ว ขั้นตอนอัปเกรดอยู่ที่ [[updating]] และแต่ละปัญหามีข้อใน gotchas

### 9.1 สิ่งที่พัง และวิธีแก้

| ส่วน | บน OpenCode 2 | วิธีแก้ | Gotcha |
| --- | --- | --- | --- |
| graft-deep, caveman | plugin แบบ V1 ไม่ทำงาน | plugin แบบ V2 (`config/plugin/graft-deep.js`), `scripts/port-caveman-opencode2.mjs` | 20 |
| array `plugin` | path ที่เป็นไฟล์ถูกปฏิเสธ โฟลเดอร์ `plugins/caveman` ถูกข้ามเงียบๆ | ใส่แต่แพ็กเกจ plugin ในเครื่องเป็นไฟล์ `.js` ใน `~/.config/opencode/plugin/` | 21 |
| skill ของเครื่องมืออื่น | `OPENCODE_DISABLE_EXTERNAL_SKILLS` ไม่มีผล — โมเดลเห็น 90 skill | allow-list ใน `permissions` → 27 | 15 |
| `compaction.prune` | ไม่มีผล | `keep.tokens: 24000` + `buffer: 32768` (ด้านล่าง) | — |
| MCP รายโปรเจกต์ | `{ "enabled": true }` ไม่มีผล | คัดลอกรายการทั้งก้อน | 22 |
| ชื่อ tool ใน AGENTS.md | tool ของ MCP ถูกเรียกใน `execute` | `tools.graft.graft_find_code` ฯลฯ | — |
| `brainstorming` (superpowers 7) | คำขอที่ "ชัด" ไปเขียนโค้ดทันที | กฎ "Approval before building" | 23 |
| engine ของ OpenDesign | flag ของ 1.x ถูกปฏิเสธ | ใช้ engine อื่นจนกว่าต้นทางจะแก้ | 24 |
| background service | session และเบราว์เซอร์อยู่ต่อหลัง `opencode run` จบ | `session.interrupt`; กฎ UI: เปิดหน้าของตัวเอง ดึงขึ้นด้านหน้า แล้วปิด | 26 |

### 9.2 prompt ต่อ turn: ~34.0k → ~14.6k tokens

วัดด้วย `capture-server.mjs` + `analyze-prompt.mjs` (ข้อ 1 พร้อม `--standalone`) เปิด MCP 6 ตัวเท่าเดิม config ชุดสุดท้าย:

| ส่วน | ~tokens |
| --- | --- |
| built-in tools (12 ตัว รวม `execute`, `shell`, `subagent`) | 3,349 |
| MCP catalog (Code Mode) | 2,493 |
| รายการ skill (27 ตัว) | 2,331 |
| AGENTS.md — project (บล็อกของ graft) | 1,989 |
| AGENTS.md — global (6 หัวข้อ) | 1,533 |
| superpowers bootstrap | 1,216 |
| prompt พื้นฐานของ OpenCode + `<env>` | 1,212 |
| instructions ของ MCP server (graft, context7) | 520 |
| **รวม** | **~14.6k** |

ที่ลดลงเพราะ **Code Mode**: แทนที่จะมีนิยาม tool ของ MCP 70 กว่าตัว โมเดลได้ tool `execute` ตัวเดียวกับ catalog สั้นๆ (ไม่กี่ tool ต่อ server ที่เหลือหาเองด้วย `search(...)`) การปิด MCP เพื่อประหยัด prompt (ข้อ 5.1) จึงสำคัญน้อยลงมาก — server ที่เปิดเพิ่มกินแค่ไม่กี่บรรทัดใน catalog แต่ยังควรปิดตัวที่ใช้น้อยไว้ เพราะแต่ละตัวคือ process ที่ต้องเปิด และ sonarqube ใช้ ~14 วินาทีผ่าน Docker

### 9.3 Compaction บน OpenCode 2

```jsonc
"compaction": { "auto": true, "keep": { "tokens": 24000 }, "buffer": 32768 }
```

- **`keep.tokens`** — บทสนทนาล่าสุดที่เก็บไว้คู่กับสรุป (ค่าเริ่มต้น 15000) 24000 เก็บไฟล์ที่ agent เพิ่งอ่านไว้ได้มากขึ้น ซึ่งเป็นงานที่ `prune` + กฎ re-read เคยทำบน OpenCode 1 ยังไม่ได้วัดกับ session ยาว
- **`buffer`** — token ที่เว้นว่างไว้ใต้ขีดจำกัดของโมเดล (ค่าเริ่มต้น 10% ≈ 13k) server โมเดลรันด้วย `ctx-size 131072` และโมเดลตอบได้สูงสุด 32768 tokens จึงตั้ง buffer เท่าคำตอบเต็มหนึ่งครั้ง: compaction เริ่มที่ราว ~98k แทนที่จะปล่อยให้ prompt + คำตอบล้น context ของ server ถ้า llama.cpp รันด้วย `--parallel N` แต่ละ slot ได้แค่ `131072 / N` — ให้ลด `limit.context` ของโมเดลให้ตรง

### 9.4 ทดสอบครบวงจร คำขอเดียวกับข้อ 4

`please add a pause feature to the game: pressing P (or Esc) pauses and resumes gameplay` ในสำเนาใหม่ของเกมตัวอย่าง โมเดล Qwen3.8 27B ที่ host เอง

| รอบ | กฎที่เพิ่มใน global AGENTS.md | Turn 1 (ดีไซน์) | ลงมือ + ตรวจในเบราว์เซอร์ | ผล |
| --- | --- | --- | --- | --- |
| 1 | กฎชุด OpenCode 1 แก้ชื่อ tool แล้ว | ไม่มีดีไซน์ — เขียนโค้ดทันที | รวม 15 นาที 66 tool calls (chrome-devtools 23) | ✅ สร้างและตรวจแล้ว การตรวจในเบราว์เซอร์เจอ overlay "PAUSED" แสดงกลับด้าน |
| 2 | + "Approval before building" | 18 นาทีกว่าอ่าน source แบบ minified ของ Phaser — หยุดเอง | — | ❌ turn ดีไซน์กลายเป็นการค้นคว้า |
| 3 | + "ดีไซน์จากโค้ดของโปรเจกต์เอง", `npx http-server` | ✅ 6 นาที 10 tool calls ดีไซน์ไฟล์เดียว + คำถามหนึ่งข้อ ไม่แก้ไฟล์ | 22 นาทีกว่า 60 tool calls (chrome-devtools 46) วนอยู่กับหน้าที่รอบ 1 เปิดค้างไว้ — หยุดเอง | ⚠️ โค้ดเสร็จ เทสต์ผ่าน แต่การตรวจในเบราว์เซอร์วนไม่จบ |
| 4 | + "เปิดหน้าของตัวเอง ดึงขึ้นด้านหน้า ปิดเมื่อเสร็จ หยุดหลังตรวจ 2–3 ครั้ง" (service ใหม่) | ✅ 6 นาที 13 tool calls มีดีไซน์ ไม่แก้ไฟล์ | 11 นาที แล้วค้าง 8 นาทีที่ script ของ `execute` ซึ่ง promise ไม่ resolve — ต้อง interrupt หลังสั่ง "continue": 16 นาที 61 tool calls (chrome-devtools 56) ตรวจ P และ Esc แล้ว console ไม่มี error ปิดหน้าแล้ว | ✅ สร้างและตรวจแล้ว ไฟล์เดียว เทสต์ผ่าน 5/5 ไฟล์ |

สิ่งที่ตัวเลขบอก:

- **ขั้นอนุมัติกลับมาทำงานแล้ว** ด้วยกฎชุดสุดท้าย turn 1 สำรวจเฉพาะโค้ดของโปรเจกต์ (graft + 5–6 ไฟล์) แสดงดีไซน์สั้นๆ (ไฟล์ พฤติกรรม สิ่งที่จะไม่ทำ และคำถามหนึ่งข้อ) และไม่แก้อะไร — ราว 6 นาที
- **รอบ 4 ไม่ได้โหลด `brainstorming` เลย** — ดีไซน์มาจากกฎใน AGENTS.md ล้วนๆ superpowers 7 ข้ามขั้นตอนของตัวเองเมื่อมองว่าคำขอชัด กฎนี้คือสิ่งที่รักษาขั้นอนุมัติไว้
- **การตรวจในเบราว์เซอร์ยังเป็นส่วนที่แพงที่สุด:** chrome-devtools 23–56 ครั้งต่อรอบบนโมเดลนี้ และมักทดสอบเกิน "หนึ่ง interaction" ที่กฎกำหนด สองในสี่รอบเจอกับดักของ OpenCode 2 ในขั้นนี้ — หน้าที่ session ก่อนเปิดค้างไว้ และ script ใน Code Mode ที่ไม่ resolve ([[gotchas]] ข้อ 26) ทั้งสองเรื่องเป็นกฎใน AGENTS.md แล้ว เรื่องที่สองเพิ่มหลังรอบ 4 และยังไม่ได้ทดสอบซ้ำครบรอบ
- **ตัวโมเดลคือคอขวด:** โมเดล 27B ที่รันในเครื่องคิดเป็นนาทีระหว่าง tool call แต่ละครั้ง เผื่อเวลา ~30 นาทีสำหรับฟีเจอร์เล็กหนึ่งงานตั้งแต่ต้นจนจบ

> [!warning] หยุด run แบบ headless ไม่ได้หยุด session
> บน OpenCode 2 `opencode run` เป็นแค่ client ของ background service: kill มัน (Ctrl+C, timeout) แล้ว session ยังทำงานต่อ ให้หยุดด้วย `Esc` ใน TUI หรือ `opencode api session.interrupt --param sessionID=<id>` (หา id ด้วย `opencode session list`)

### 9.5 การวัดผลบน OpenCode 2

- ตอนนี้ `session-report.mjs` อ่านได้ทั้ง session ของ OpenCode 1 (`session`/`part`) และ OpenCode 2 (`session_v2`/`session_message`) บน OpenCode 2 การเรียก MCP ทุกครั้งเกิดใน script ของ `execute` รายงานจะแยก script เหล่านั้นกลับเป็นการเรียก `<server>_<tool>` ทำให้ยังเทียบการใช้ graft และ chrome-devtools กับผลเดิมได้
- `analyze-prompt.mjs` นับ `shell`/`subagent`/`execute` เป็น built-in tool และแยก Code Mode catalog เป็นของตัวเอง
- วิธี capture ให้เพิ่ม `--standalone` (ข้อ 1)
