---
tags: [project-doc, plugins, opencode, reference]
updated: 2026-09-25
summary: superpowers (skill library), grill-me/grilling (batch-interview skill เสริม superpowers), graft-deep (custom plugin ที่เขียนเอง), ponytail (code minimization ruleset) และ i-have-adhd (บังคับตอบตรงประเด็น ไม่อ้อมค้อม) — วิธีติดตั้งและโครงสร้าง Plugin Hook API ของ OpenCode
---

# Plugins

ภาพรวมที่ [[index]] · MCP servers ที่ [[mcp-servers]]

> [!note] ก่อนเริ่ม
> ต้องมี Git ติดตั้งในเครื่องก่อน (สำหรับ plugin ที่มาจาก `git+https://`) — ดูวิธีติดตั้งที่ [[setup]] Part 0

---

## superpowers — skill library

[obra/superpowers](https://github.com/obra/superpowers) เป็นชุด "skills" คือคำสั่งที่บังคับให้ agent ทำตาม workflow ที่ดี เช่น brainstorming, systematic-debugging, test-driven-development, writing-plans เดิมทำมาสำหรับ Claude Code แต่มี integration ให้ OpenCode โดยเฉพาะ

### ติดตั้งแบบมาตรฐาน

```jsonc
{ "plugin": ["superpowers@git+https://github.com/obra/superpowers.git"] }
```

รีสตาร์ท OpenCode แล้วเช็ค:

```bash
opencode debug skill
```

ควรเห็น skill ทั้งหมด 14 ตัว ได้แก่ brainstorming, systematic-debugging, writing-plans, test-driven-development, executing-plans, using-git-worktrees, verification-before-completion, receiving-code-review, requesting-code-review, subagent-driven-development, finishing-a-development-branch, dispatching-parallel-agents, writing-skills และ using-superpowers

> [!info] วิธีที่ superpowers ฉีด context
> superpowers ฉีด "bootstrap" เข้า user message **แรก** ของ session (ไม่ใช่ system message) — จงใจทำแบบนี้เพื่อลด token bloat และป้องกันปัญหากับโมเดลบางตัว (เช่น Qwen) ที่มีปัญหากับ multiple system messages ไม่มี flag สำเร็จรูปสำหรับปิดพฤติกรรมนี้

### วิธีแก้ปัญหา GitHub ถูกบล็อกเครือข่าย

ถ้า `git+https://github.com/...` ติดตั้งไม่ได้ ให้เช็ค error message ก่อนเสมอ — สาเหตุมี 2 แบบที่แก้ต่างกัน:

**กรณีที่ 1 — เจอหน้า block page ตรงๆ** (เช่น FortiGate "Application Blocked") ตอนเข้า github.com ผ่านเบราว์เซอร์ แปลว่าเครือข่ายบล็อกจริงตามนโยบาย IT

> [!warning] อย่าพยายามเลี่ยงนโยบายเครือข่าย
> ถ้าเป็น block page ตรงๆ ไม่ควรพยายามเลี่ยง เพราะเป็นนโยบายที่ IT ตั้งใจ ให้ใช้วิธีข้างล่างแทน หรือขอ IT allowlist

วิธีติดตั้งโดยไม่ต้องผ่าน GitHub:

1. **ใช้ path บนเครื่องที่มีซอร์สอยู่แล้ว** — ถ้ามี Claude Code ติดตั้ง superpowers ไว้ก่อนหน้า (ผ่านช่องทางอื่นที่ไม่ถูกบล็อก เช่น plugin marketplace) ให้ชี้ `plugin` ไปที่ path นั้นตรงๆ แทน git URL:

   ```jsonc
   { "plugin": ["C:/Users/<user>/.claude/plugins/cache/claude-plugins-official/superpowers/<version>"] }
   ```

   ใช้ได้เพราะ package มี `main` ชี้ไปที่ `.opencode/plugins/superpowers.js` อยู่แล้วในตัว — ไม่ต้องพึ่ง network เลย

2. **ทางเลือกอื่นถ้าไม่มี Claude Code** — ดาวน์โหลด zip ของ repo จากหน้า GitHub (ถ้าเข้าเว็บ github.com ได้แม้ `git clone` จะใช้ไม่ได้) แตก zip ไว้ที่ไหนก็ได้ แล้วชี้ `plugin` ไปที่ path นั้นแทน

**กรณีที่ 2 — error เป็น SSL certificate ไม่ใช่ block page:**

```
fatal: unable to access 'https://github.com/...': unable to get local issuer certificate
```

มักหมายความว่าองค์กรทำ SSL inspection (MITM ด้วย corporate root CA) แต่ `git` ไม่ trust CA นั้น — browser trust เพราะ Windows/OS มี CA ติดตั้งไว้ แต่ git ใช้ certificate store ของตัวเอง นี่เป็นสัญญาณว่า **เครือข่ายอนุญาตแต่ git ไม่ trust cert** ต่างจากกรณี block page ที่บล็อกจริง

> [!caution] ถามผู้ใช้ก่อนแก้เสมอ
> แก้ได้ด้วยการตั้งค่า git ให้ใช้ Windows certificate store (`git config http.sslBackend schannel`) แต่ **ควรถามผู้ใช้ก่อนทำเสมอ** เพราะเทคนิคๆ แล้วมันคือการ trust MITM cert ขององค์กร ไม่ใช่การตัดสินใจที่ควรทำเองโดยพลการ

**เมื่อ IT อนุญาต GitHub แล้ว** ให้เปลี่ยนกลับไปใช้ git URL ตามปกติ (จะได้อัปเดตเวอร์ชันใหม่อัตโนมัติในอนาคต) — อย่าลืมลบ cache เก่าที่ค้างจากตอน clone ไม่สำเร็จก่อนหน้าด้วย มิฉะนั้น opencode อาจไม่ clone ใหม่ให้:

```bash
rm -rf ~/.cache/opencode/packages/<plugin-name>@git+https_
```

---

## grill-me / grilling — batch-interview skill (เสริม superpowers, ไม่ใช่ plugin)

[mattpocock/skills](https://github.com/mattpocock/skills) เป็น community skill ของ Matt Pocock (Total TypeScript / AI Hero) แจกเป็นไฟล์ `SKILL.md` เดี่ยวๆ ตามมาตรฐานเปิด **Agent Skills** (สเปกเดียวกับที่ Claude Code ใช้ และ OpenCode รองรับ native โดยไม่ต้องดัดแปลง) — **ไม่ใช่ plugin** จึงไม่ต้องเพิ่มอะไรใน `plugin` array ของ `opencode.jsonc` เลย ดูกลไก skill แบบไฟล์เต็มๆ ที่ [[setup#Skill เดี่ยวๆ ตาม Agent Skills open standard (ไม่ใช่ plugin)|setup]]

ทำงานเป็นคู่ 2 ไฟล์:

- `grill-me` — entry point เฉยๆ (มี frontmatter field `disable-model-invocation: true` ซึ่งเป็นของเฉพาะ Claude Code — OpenCode ไม่รู้จัก field นี้ จะ **ignore เงียบๆ ไม่มีผลเสีย** ดู [[setup]]) แค่ forward ไปเรียก `grilling`
- `grilling` — ตัว logic จริง: สัมภาษณ์ผู้ใช้แบบ "design tree" — ทุกการตัดสินใจแตกเป็นการตัดสินใจย่อย ถามเป็น**รอบ** (round) โดยยิงทุกคำถามที่พร้อมถามได้พร้อมกัน (เรียกว่า frontier) แต่ละข้อมีคำแนะนำคำตอบ (`➡️`) แนบมาด้วยเสมอ จบเมื่อไม่มีคำถามเหลือและผู้ใช้ยืนยันว่าเข้าใจตรงกันแล้ว

> [!info] ต่างจาก `superpowers brainstorming` ยังไง
> `brainstorming` (หัวข้อบน) ก็ถามคำถามชี้แจงเหมือนกัน แต่ถามทีละข้อ และสำหรับงาน bounded/architectural จะจบด้วยการเขียน spec file ที่ `docs/superpowers/specs/` — `grilling` ถามเป็น batch เร็วกว่า (ยิงหลายข้อพร้อมกันต่อรอบ) และไม่เขียนไฟล์อะไรเลย เหมาะกับ local model ที่แต่ละ turn ใช้เวลานาน (ยิ่งลดจำนวน turn ยิ่งดี) — ดูหัวข้อ "ผูกเข้ากับ superpowers brainstorming" ด้านล่างว่าทำไมต้องผูกสองตัวนี้เข้าด้วยกัน ไม่ปล่อยให้ชนกัน

### ติดตั้ง (vendor ไฟล์ตรงๆ ไม่ผ่าน plugin manager)

สร้าง 2 ไฟล์นี้ที่ **global skills folder** ของ OpenCode (ใช้ได้ทุกโปรเจกต์ทันที ไม่ต้องตั้งอะไรต่อ repo):

```
~/.config/opencode/skills/grill-me/SKILL.md
~/.config/opencode/skills/grilling/SKILL.md
```

`~/.config/opencode/skills/grill-me/SKILL.md`:

```markdown
---
name: grill-me
description: A relentless interview to sharpen a plan or design.
disable-model-invocation: true
---

Call the Skill tool with "grilling".
```

`~/.config/opencode/skills/grilling/SKILL.md` — เวอร์ชันที่ปรับสำหรับ setup นี้แล้ว (ดูหัวข้อ "ปรับให้เข้ากับ setup นี้" ถัดไปว่าต่างจากต้นฉบับตรงไหน):

````markdown
---
name: grilling
description: Grill the user relentlessly about a plan, decision, or idea. Use when the user wants to stress-test their thinking, or uses any 'grill' trigger phrases.
---

Interview the user relentlessly until you reach a shared understanding. Map this as a **design tree**: every decision branches into the decisions that hang off it.

Work the tree in **rounds**. The **frontier** is every decision whose prerequisites are already settled: the questions you can ask _now_ without guessing at answers you haven't heard yet. Ask the whole frontier in one round: number each question and give your recommended answer. Then wait for the user's answers before the next round.

Format a round like so:

```
❓ **Q1** - **<question title>**: <question body, might be multiple paragraphs, including multiple choices>

➡️ <your recommended answer>

---

❓ **Q2** - **<question title>**: <question body, might be multiple paragraphs, including multiple choices>

➡️ <your recommended answer>
```

Each round the user answers reshapes the tree: settled decisions push the frontier outward and unblock questions that depended on them. Recompute the frontier and ask the next round. A question whose answer depends on another question still open in this round belongs to a _later_ round, not this one.

Finding _facts_ is your job, never the user's. When a frontier question needs a fact from the environment (filesystem, tools, etc.), look it up yourself inline before asking the user anything you could find out yourself: if the project has a `graft/` index, run `graft ask "<question>"` first; otherwise fall back to grep or reading files directly. Do this synchronously while preparing each round — only dispatch a sub-agent for it if one is available and the lookup is heavy enough to warrant it. The _decisions_ are the user's: put each to them and wait.

The session is done when the frontier is empty: every branch of the design tree visited, nothing left silently assumed. Do not act on it until the user confirms you have reached a shared understanding.
````

ไม่ต้องรีสตาร์ท OpenCode — skill แบบไฟล์โหลดผ่าน native skill tool เรียกใช้ได้ทันทีหลังบันทึกไฟล์ (ต่างจาก plugin ที่โหลดตอน session เริ่มเท่านั้น) ทดสอบเรียกตรงๆ ในเซสชันด้วยประโยคที่มีคำว่า "grill" เช่น `grill me about <ไอเดีย>`

> [!note] ต้นฉบับไม่ได้ปรับแต่งอะไรอยู่ที่
> - https://raw.githubusercontent.com/mattpocock/skills/main/skills/productivity/grill-me/SKILL.md
> - https://raw.githubusercontent.com/mattpocock/skills/main/skills/productivity/grilling/SKILL.md

### ปรับให้เข้ากับ setup นี้ (สำคัญ — อย่าข้าม)

ต้นฉบับของ `grilling` ใช้คำว่า "dispatch a sub-agent to find [a fact]" ตรงย่อหน้า "Finding facts is your job" — ถ้า workflow ของคุณพึ่ง subagent น้อย/execute inline เป็นหลัก (แบบ setup นี้) ควรแก้ย่อหน้านั้นให้ **หา fact เอง inline ก่อนเสมอ**: เรียก `graft ask` ถ้าโปรเจกต์มี graft index (ดู [[mcp-servers#graft — code-graph / context retrieval (per-project)|graft MCP]]) แล้วค่อย fallback เป็น grep/อ่านไฟล์ตรงๆ ถ้าไม่มี — dispatch sub-agent เฉพาะตอนมีให้ใช้จริงและงานหนักพอเท่านั้น (โค้ดบล็อกด้านบนเป็นเวอร์ชันที่แก้แล้ว)

> [!tip] ทำไมต้องแก้
> `graft`/subagent เป็นทางเลือก ไม่ใช่ทุก setup จะมีหรืออยากใช้เหมือนกัน ปรับ instruction ให้ตรงกับเครื่องมือ/สไตล์การทำงานจริงของคุณเสมอ แทนที่จะ copy ต้นฉบับตรงๆ ทุกครั้งที่อัปเดตจากต้นทาง ต้อง merge การแก้นี้กลับเข้าไปด้วย (ดู [[updating]])

### ผูกเข้ากับ superpowers brainstorming (ต้องทำ ถ้าติดตั้ง superpowers ไว้อยู่แล้ว)

`brainstorming` (หัวข้อบน) มี hard-gate ของตัวเองอยู่แล้ว: **"MUST use this before any creative work"** — ถ้าเพิ่ม `grilling` เข้าไปโดยไม่เขียนกฎ reconcile ไว้ก่อน จะได้ **เกตสองอันที่แย่งกันคุมจังหวะเดียวกัน** ("ก่อนเริ่มงานใหม่") ซึ่งกับโมเดลขนาดเล็ก/local เสี่ยงสูงที่จะเลือกผิดตัวหรือถามซ้อนกันสองรอบ

วิธีแก้คือเขียนกฎไว้ใน **global** `~/.config/opencode/AGENTS.md` (ดู [[setup#AGENTS.md — instructions ระดับ global vs project|setup]] ว่าทำไมต้องเป็น global ไม่ใช่ project) ให้ `grilling` **เสริม** `brainstorming` แทนที่จะแข่งกัน:

```markdown
## Grill me — complements superpowers brainstorming, doesn't duplicate it

This setup also runs the `superpowers` plugin. Its `brainstorming` skill is
the primary gate before creative work (new features, new subsystems,
behavior changes) — it already classifies scope, asks clarifying
questions, proposes approaches, and for bounded/architectural work writes
a spec under `docs/superpowers/specs/` before any implementation plan.
Do not add a second gate on top of it: if brainstorming has already run
(or is running) for a piece of work, do not also invoke `grilling` as a
separate pre-check for that same work.

Use `grilling` in exactly two situations instead:

1. **Inside** brainstorming's "ask clarifying questions" step: instead of
   asking one question at a time, batch the current frontier into
   `grilling`'s round format — numbered questions with a recommended
   answer each, resolved via the design-tree/frontier method — then fold
   the answers back into the brainstorming flow. This is a formatting
   upgrade to that one step, not a separate skill invocation cycle.
2. **Standalone**, outside any SDD/brainstorming flow: when the user
   explicitly wants to stress-test an idea or decision quickly (e.g. says
   "grill me about X"), with no spec file produced — this is a
   spike-level conversation, not project planning.

When a `grilling` round needs a fact from the codebase rather than a
user decision, look it up yourself inline before asking: if the project
has a `graft/` index, run `graft ask "<question>"` first; otherwise fall
back to grep or reading files directly. Only dispatch a sub-agent for it
if one is available and the lookup is heavy enough to warrant it.
```

> [!warning] ทำไมต้องเป็น global ไม่ใช่ project AGENTS.md
> ถ้าเขียนกฎนี้แค่ใน AGENTS.md ระดับโปรเจกต์ (ไฟล์ที่ `graft init` เขียนให้อัตโนมัติ — ดู [[mcp-servers]]) จะใช้ได้แค่ repo เดียว โปรเจกต์อื่นที่ยังไม่ได้รัน `graft init` หรือยังไม่มี `AGENTS.md` จะไม่มีกฎ reconcile นี้เลย ทำให้ `grilling` กลับไปชนกับ `brainstorming` เหมือนเดิมทันทีที่เปลี่ยนโปรเจกต์

### ยืนยันแล้วว่าใช้งานได้จริง (ทดสอบสด 2 เคส)

> [!info] ผลทดสอบจริงบนโปรเจกต์เกม browser เล็กๆ (local model, ไม่ใช่ cloud)
> **เคส 1 — เรียก `grilling` ตรงๆ** ("grill me about ...") → โมเดลแยกออกได้เองว่าเป็น standalone case ไม่เรียก `brainstorming` เลย, หา fact ด้วย `graft ask` inline (ไม่มี subagent), ถามเป็น 2 รอบ (รวม 8 ข้อ) ตาม format ที่กำหนด, ไม่มี spec file ถูกสร้าง, รอคำสั่งเริ่มก่อนลงมือ, จบด้วย feature ที่ implement + browser-verify + commit สำเร็จ
>
> **เคส 2 — ขอฟีเจอร์ตรงๆ ไม่พูดคำว่า grill** ("ช่วยเพิ่ม... หน่อย") → โมเดลเรียก `brainstorming` ก่อนตามเกตหลัก, classify scope (bounded/architectural), สำรวจโค้ดด้วย graft, แล้ว**เอา format คำถามของ grilling มาใช้แทนการถามทีละข้อ** (ตรงตามกฎที่เขียนไว้ใน global AGENTS.md เป๊ะ — เห็นจาก reasoning trace ที่ quote ประโยคจากกฎนี้ตรงๆ) ไม่มีการเรียก `grilling` ซ้อนเป็น skill call ที่สอง ไม่มีการถามสองรอบซ้ำกัน จบด้วย implement + test + commit สำเร็จเช่นกัน (ไม่มี spec file เพราะ classify เป็น bounded)
>
> ทั้งสองเคสไม่มีการ dispatch subagent เลยตลอดทั้ง session ตรงกับที่ตั้งใจไว้

---

## graft-deep — custom plugin (auto-inject context)

graft (ดู [[mcp-servers]]) ไม่มี "deep integration" ให้ OpenCode — คือ auto-inject context ที่เกี่ยวข้องต่อ prompt — ฟีเจอร์นี้มีให้แค่ Claude Code เท่านั้น (ส่วน auto-rebuild หลังแก้ไฟล์ ตอนนี้ graft CLI เองทำให้ทุก agent อยู่แล้ว ดูกล่องด้านล่าง) plugin นี้ port พฤติกรรม auto-inject มาโดยใช้ public CLI ของ graft (`graft ask --json`) แทนการ import internal module — ปลอดภัยกว่าและไม่พังตอน graft อัปเดตเวอร์ชัน

> [!info] เคยมี hook auto-rebuild ด้วย — ตัดออกแล้ว (2026-09-13)
> เวอร์ชันแรกของ plugin นี้มี `tool.execute.after` hook คอย debounce 3 วิแล้วสั่ง `graft build` เองในพื้นหลังทุกครั้งที่แก้ไฟล์ ยืนยันด้วยการทดสอบสดแล้วว่า**ไม่จำเป็นอีกต่อไป**: แก้ไฟล์แล้วเรียก `graft ask` ทันทีโดยไม่รัน `graft build` เองเลย ได้ผลลัพธ์ `[graft] refreshed the graph (1 file changed) before answering` — แปลว่า graft CLI ปัจจุบัน auto-refresh กราฟก่อนตอบทุกคำถามในตัวอยู่แล้ว (ดู [[mcp-servers]]) hook ที่ตัดออกไม่ได้แค่ซ้ำซ้อนเฉยๆ แต่เป็นต้นเหตุของ race condition ที่เคยบันทึกไว้ที่ [[gotchas]] ข้อ 6 ด้วย — ตัดสาเหตุทิ้งแทนที่จะแก้ปลายเหตุ

> [!info] อัปเดต 2026-09-25 — เกณฑ์ inject ใหม่ของ graft 0.19.0 + แก้ให้ตรงกับวิธีที่ OpenCode เรียก hook นี้จริง
> มีสองเหตุผลแยกกัน ทั้งคู่ตรวจจาก source code จริง ไม่ได้เดา:
> 1. **graft 0.19.0 เปลี่ยนกฎการ inject ของตัวเอง** (hook ของ Claude Code ที่ plugin นี้ port มา) — รายละเอียดที่หัวข้อ "เกณฑ์การ inject" ด้านล่าง
> 2. **เวอร์ชันก่อนเขียนโดยคิดว่า OpenCode ทำงานเหมือน Claude Code — ซึ่งไม่ใช่** อ่าน source ของ OpenCode 1.18.32 แล้วพบว่าสิ่งที่แก้ใน `experimental.chat.messages.transform` ไม่ถูกบันทึกเลย context ที่ inject จึงหายไปตั้งแต่ agent step ที่ 2 — รายละเอียดที่หัวข้อ "OpenCode เรียก hook นี้อย่างไร" ด้านล่าง

### ติดตั้ง

1. วางไฟล์ที่ `~/.config/opencode/plugin/graft-deep.js` (สร้างโฟลเดอร์ `plugin` เองถ้ายังไม่มี)
2. เพิ่ม path นั้นใน `plugin` array ของ global config
3. ไม่ต้องตั้งอะไรเพิ่มต่อโปรเจกต์ — ยกเว้น `graft build` ที่ยังต้องรันครั้งแรกต่อ repo เหมือนเดิม (ดู [[mcp-servers]]) หลังจากนั้น graft จะดูแลความสดของกราฟเองทุกครั้งที่ถูกถาม ไม่ต้องมีอะไรคอย rebuild ให้อีก

> [!note] อยู่ทั้งใน `plugin` array *และ* ในโฟลเดอร์ `plugin/` — ก็ยังโหลดแค่ครั้งเดียว
> OpenCode โหลด `{plugin,plugins}/*.{ts,js}` ในโฟลเดอร์ config เองอัตโนมัติ **และ**โหลดทุกตัวใน `plugin` array ด้วย แล้วค่อยตัดตัวซ้ำด้วย file URL ที่ตรงกันเป๊ะ (`deduplicatePluginOrigins` ใน `config/plugin.ts`) — ยืนยันด้วย `opencode debug config` แล้วว่า `graft-deep.js` มีแค่ตัวเดียว

### OpenCode Plugin Hook API ที่ใช้

Plugin คืน object ของ hooks ตาม type `Hooks` จาก `@opencode-ai/plugin` — ตัวเดียวที่ใช้ในนี้:

| Hook | ทำงานตอนไหน | ใช้ทำอะไรใน graft-deep |
| --- | --- | --- |
| `experimental.chat.messages.transform` | ก่อนเรียก LLM **ทุกครั้ง** — ทุก agent step ของ turn และตอน compaction ด้วย | step แรกของ user turn ใหม่: รัน `graft ask` ครั้งเดียวแล้ว cache ผลไว้ตาม message ID — ทุกครั้งที่ถูกเรียก: แปะ context ที่ cache ไว้กลับเข้าไปที่ message ของมันทุกตัว |

hook อื่นๆ ที่มีให้ใช้แต่ยังไม่ได้ใช้ในนี้: `tool.execute.before`, `tool.execute.after`, `chat.message`, `command.execute.before`, `session.compacting`, `event`, `tool.definition` — ดูชนิดเต็มที่ `node_modules/@opencode-ai/plugin/dist/index.d.ts`

### OpenCode เรียก hook นี้อย่างไร (ตรวจจาก source ของ opencode 1.18.32)

> [!important] สิ่งที่แก้ใน `messages.transform` เป็นของ**ชั่วคราว** — อยู่แค่การเรียก LLM ครั้งเดียว
> prompt loop โหลด message ทั้งหมดใหม่จาก storage ทุกต้น step (`session/prompt.ts` — `MessageV2.filterCompactedEffect` ใน loop `while (true)`) แล้วค่อยเรียก hook สิ่งที่ hook เติมเข้าไปจะถูกส่งให้โมเดลครั้งเดียวแล้วทิ้ง — ตรงข้ามกับ Claude Code ที่ output ของ hook `UserPromptSubmit` ถูกเขียนลง transcript ถาวร

ผลกระทบต่อเวอร์ชันก่อน และวิธีที่เวอร์ชันนี้จัดการ:

| พฤติกรรมของ OpenCode | เวอร์ชันก่อน | ตอนนี้ |
| --- | --- | --- |
| โหลด message ใหม่ทุก step | inject ที่ step 1 แล้ว step 2+ เจอ `injected.has(key)` ก็ return ทันที → **context หายทันทีที่ agent เรียก tool ตัวแรก** | คำนวณ pack ครั้งเดียวต่อ message เก็บ cache ตาม message ID แล้ว**แปะกลับทุกครั้งที่ถูกเรียก** — ยังเห็นได้ใน step และ turn ถัดๆ ไป เหมือน transcript ของ Claude Code |
| compaction ก็เรียก hook นี้ด้วย โดยส่งสำเนาของ history เก่าเข้ามา (`session/compaction.ts`) | รัน `graft ask` กับ message เก่าโดยไม่มีประโยชน์ | รัน `graft ask` เฉพาะตอน message **สุดท้าย**เป็นของ user (step แรกของ turn ใหม่) — ตอน compaction แค่แปะ context ที่ cache ไว้กลับเข้าไป |
| reminder ของ OpenCode เองเติม text part แบบ `synthetic` เข้า user message ก่อน hook ทำงาน (`session/reminders.ts` — prompt ของ plan mode ฯลฯ) | ข้อความ boilerplate นั้นปนเข้าไปใน query ของ graft | query ใช้เฉพาะ text part ที่ไม่ใช่ `synthetic`/`ignored` — part ที่ inject เองก็ติด `synthetic: true` ตาม convention ของ OpenCode |
| plugin รันใน process เดียวกับ TUI | `crossSpawn.sync` ทำ OpenCode ค้างได้นานสุด 8 วินาที | `graft ask` รันผ่าน `spawn` แบบ async — event loop ยังเดินต่อได้ |

ผลพลอยได้จากการแปะกลับทุกครั้ง: prompt prefix เหมือนเดิมทุก step (เป็นมิตรกับ prompt cache) และเกณฑ์ "novelty" ด้านล่างถูกต้องจริง — pointer ที่เคยแสดงแล้วยังอยู่ตรงหน้าโมเดลจริงๆ cache เก็บในหน่วยความจำ: หลังรีสตาร์ท OpenCode message เก่าจะไม่มี pack แล้ว และความจำของ novelty ก็รีเซ็ตไปพร้อมกัน ทั้งสองจึงยังสอดคล้องกัน

### เกณฑ์การ inject (ตามแบบ hook ของ Claude Code ใน graft 0.19)

graft 0.19.0 เลิกใช้ threshold `coverage` ค่าเดียว (plugin นี้เคยใช้ `0.12` ส่วน graft เองใช้ `0.15`) หลังพบว่า pack ที่ก้ำกึ่ง "reads as orientation and suppresses the very retrieval call it should have triggered" (`dist/claude/format.js`) ตอนนี้ plugin ใช้สองเกณฑ์เดียวกับ `relevantRetrieval` ของ graft:

1. **Strength** — ผลแบบ lexical จะถูก inject ก็ต่อเมื่อ hit อันดับแรกตรงกับ**ชื่อ** symbol จริง (`coverageStrong ≥ 0.1`) หรือตรงกับ query แบบกว้างพอ (`coverage ≥ 0.5`) ไม่อย่างนั้นจะ inject hint บรรทัดเดียวชี้ไปที่ graft tools แทน — ไม่เกิน 2 ครั้งต่อ session ผลแบบ structural (เช่น "ใครเรียก X") ไม่มีคะแนน coverage และผ่านเสมอ — เวอร์ชันก่อนนับ `coverage` ที่ไม่มีเป็น `0` แล้วตัดทิ้งเงียบๆ
2. **Novelty** — hit ที่ `pointer` เคย inject ไปแล้วใน session นี้จะถูกตัดออก (จำล่าสุด 40 ตัว) ถ้าไม่เหลือเลยก็ไม่ inject อะไร

ตัวอย่างที่วัดจริง (graft 0.19.0, repo Next.js จริง): prompt "who calls the api client" ได้ `coverage 0.20`, `coverageStrong 0` — ไม่มี hit ไหนตรงกับชื่อ symbol เลย threshold เดิม `0.12` จะ inject hit ที่ไม่เกี่ยวข้อง 3 ตัวนั้นไปทั้งหมด ตอนนี้ inject hint แทน ส่วน "where is createTicket defined" ตรงกับชื่อ symbol จึง inject pack ตามปกติ

> [!tip] ตรวจซ้ำทุกครั้งที่อัปเกรด graft
> graft-deep ไม่มีต้นทางของตัวเอง แต่ลอกแบบ hook ของ graft มา ควรเทียบทุกครั้งที่ graft เปลี่ยนเวอร์ชัน:
> ```bash
> G="$(npm root -g)/@nanonets/graft/dist"
> grep -n "STRONG_FLOOR =\|HIGH_FLOOR =" "$G/ask/fuse.js"               # threshold สองตัว
> grep -n "function relevantRetrieval" -A 25 "$G/claude/format.js"       # ตัวเกณฑ์เอง
> grep -n "'ask', prompt" "$G/claude/hooks.js"                           # flag ของ ask ที่ graft ใช้เอง
> graft ask --help                                                       # --json / -n ยังอยู่ไหม
> ```
> และเช็คว่า `graft ask ... --json` ยังคืน `hits[].title`, `hits[].pointer`, `coverage` และ `coverageStrong` อยู่ (`dist/ask/ask.d.ts` — `AskResult`)

### บทเรียนสำคัญตอนเขียน (Windows-specific)

**1. `execFileSync('npx.cmd', args, {shell:false})` พังบน Windows** — โยน `EINVAL` เพราะ Windows spawn ไฟล์ `.cmd` ตรงๆ โดยไม่ผ่าน shell ไม่ได้

**2. `shell:true` + string ต่อกันเอง = command injection risk** — prompt เป็น free-text จากข้อความแชทผู้ใช้ ไปต่อเป็น shell string ตรงๆ ไม่ปลอดภัย

> [!danger] Security
> ห้ามเอา free-text ที่มาจากผู้ใช้ไปต่อเป็น shell command string เด็ดขาด แม้จะเขียนฟังก์ชัน escape เองก็ตาม เพราะพลาดได้ง่ายและมักไม่ครอบคลุมทุก edge case

**3. วิธีที่ถูกต้อง** ใช้ `cross-spawn` (dependency ที่ OpenCode มีอยู่แล้วใน `node_modules` ของตัวเอง) ซึ่งจัดการ argv quoting ของ Windows ถูกต้องโดยไม่ผ่าน shell — import แบบ dynamic เฉพาะตอน `process.platform === 'win32'` เท่านั้น ฝั่ง macOS/Linux ใช้ `spawn` ที่ built-in ใน Node ตรงๆ ได้เลยเพราะ POSIX ไม่มีปัญหานี้ ทำให้ไฟล์นี้ไม่มี extra dependency บน non-Windows เลย ทั้งสองตัวมี API แบบ async เหมือนกัน (`spawn` ไม่ใช่ `.sync`) โค้ดส่วนอื่นจึงไม่ต้องสนว่าได้ตัวไหนมา

### โค้ดเต็ม

```js
/**
 * Graft deep-integration plugin for OpenCode (global, cross-platform).
 * Ports the auto-inject-context behavior that graft only ships natively
 * for Claude Code, using graft's public CLI (`graft ask --json`) instead
 * of internal modules.
 *
 * No longer does a manual auto-rebuild-on-edit: current graft CLI versions
 * refresh the graph themselves before answering any query (verified live —
 * an edit followed immediately by `graft ask`, no `graft build` in between,
 * printed "[graft] refreshed the graph (1 file changed) before answering").
 * The old debounced `graft build` hook here was therefore redundant, and
 * was the direct cause of the rebuild/ask race condition documented in
 * gotchas.md #6 — removing it fixes that race by removing its cause.
 *
 * Injection gate mirrors graft 0.19's own Claude prompt hook
 * (dist/claude/format.js `relevantRetrieval`), which replaced the old
 * single `coverage` floor:
 *   1. strength — lexical results inject only if the top hit matched a
 *      symbol NAME (`coverageStrong` >= STRONG_FLOOR) or matched the query
 *      broadly (`coverage` >= HIGH_FLOOR); otherwise a short nudge is
 *      injected instead (at most NUDGE_CAP per session). Structural results
 *      carry no coverage score and always pass.
 *   2. novelty — pointers already injected this session are dropped; if
 *      none remain, nothing is injected.
 *
 * OpenCode specifics (verified against opencode v1.18.32 source):
 * - `experimental.chat.messages.transform` edits are NOT persisted — the
 *   prompt loop reloads messages from storage on every agent step
 *   (session/prompt.ts). Claude Code keeps hook output in the transcript,
 *   so to match that (and to keep the novelty gate honest and the prompt
 *   prefix cache-stable) each message's context is computed once, cached by
 *   message ID, and re-attached to that message on every call.
 * - Compaction also fires this hook (session/compaction.ts) on older
 *   history, so a new `graft ask` runs only when the last message is the
 *   user's — i.e. the first step of a fresh turn.
 * - OpenCode's own reminders push `synthetic` text parts into the user
 *   message (plan mode etc.); those are excluded from the query.
 */
import { spawn } from 'node:child_process';

const isWin = process.platform === 'win32';
const MIN_PROMPT_CHARS = 12;
const ASK_TIMEOUT_MS = 8000;
const STRONG_FLOOR = 0.1; // graft dist/ask/fuse.js
const HIGH_FLOOR = 0.5; // graft dist/ask/fuse.js
const PACK_CAP = 3;
const NUDGE_CAP = 2;
const INJECTED_POINTERS_CAP = 40;

export const GraftDeepPlugin = async ({ directory }) => {
  const spawnFn = isWin ? (await import('cross-spawn')).default : spawn;

  const contexts = new Map(); // messageID -> injected text, or null (asked, nothing to inject)
  const sessions = new Map(); // sessionID -> { injectedPointers, nudges }

  function sessionState(id) {
    let s = sessions.get(id);
    if (!s) sessions.set(id, (s = { injectedPointers: [], nudges: 0 }));
    return s;
  }

  // Async so a slow ask never blocks OpenCode's event loop (TUI, other sessions).
  function graftAsk(prompt) {
    const args = ['-y', '@nanonets/graft', 'ask', prompt, '.', '--json', '-n', String(PACK_CAP)];
    return new Promise((resolve) => {
      let out = '';
      let child;
      try {
        child = spawnFn('npx', args, { cwd: directory, stdio: ['ignore', 'pipe', 'ignore'], windowsHide: true });
      } catch {
        return resolve(null);
      }
      const timer = setTimeout(() => {
        child.kill();
        resolve(null);
      }, ASK_TIMEOUT_MS);
      child.stdout.setEncoding('utf8');
      child.stdout.on('data', (c) => (out += c));
      child.on('error', () => {
        clearTimeout(timer);
        resolve(null);
      });
      child.on('close', (code) => {
        clearTimeout(timer);
        try {
          resolve(code === 0 && out ? JSON.parse(out) : null);
        } catch {
          resolve(null);
        }
      });
    });
  }

  function weakMatchNudge(s, strong) {
    if (s.nudges >= NUDGE_CAP) return null;
    s.nudges += 1;
    return `[graft] no strong match for this prompt (name-field match ${strong.toFixed(2)}) — the graph ` +
      'has more than this probe found. Use the graft MCP tools (or `graft ask "<your task>" --source`) before grepping.';
  }

  function formatContext(result, s) {
    const hits = result?.hits;
    if (!Array.isArray(hits) || hits.length === 0) return null;

    const lexical = typeof result.coverage === 'number' || typeof result.coverageStrong === 'number';
    if (lexical) {
      const strong = result.coverageStrong ?? 0;
      const broad = result.coverage ?? 0;
      if (strong < STRONG_FLOOR && broad < HIGH_FLOOR) return weakMatchNudge(s, strong);
    }

    const seen = new Set(s.injectedPointers);
    const fresh = hits.filter((h) => !seen.has(h.pointer)).slice(0, PACK_CAP);
    if (fresh.length === 0) return null;
    s.injectedPointers = [...s.injectedPointers, ...fresh.map((h) => h.pointer)].slice(-INJECTED_POINTERS_CAP);

    const lines = fresh.map((h) => `- ${h.title} — ${(h.pointer ?? '').split(',')[0].trim()}`);
    return `[graft] possibly relevant code for this request:\n${lines.join('\n')}\n(use the graft MCP tools for full detail if needed)`;
  }

  function attach(msg, text) {
    msg.parts.push({
      id: `${msg.info.id}-graft`,
      messageID: msg.info.id,
      sessionID: msg.info.sessionID,
      type: 'text',
      text,
      synthetic: true,
    });
  }

  return {
    'experimental.chat.messages.transform': async (_input, output) => {
      if (process.env.GRAFT_AUTO_CONTEXT === '0') return;
      const messages = output?.messages;
      if (!messages?.length) return;

      // Fresh turn: the user's message is the last one (not a later agent step,
      // not a compaction pass over older history). Ask graft once for it.
      const last = messages[messages.length - 1];
      if (last.info.role === 'user' && last.info.id && !contexts.has(last.info.id)) {
        const text = last.parts
          .filter((p) => p.type === 'text' && !p.synthetic && !p.ignored)
          .map((p) => p.text)
          .join(' ')
          .trim();
        if (text.length >= MIN_PROMPT_CHARS) {
          contexts.set(last.info.id, null); // claim it; a failed ask is not retried
          const result = await graftAsk(text);
          if (result) contexts.set(last.info.id, formatContext(result, sessionState(last.info.sessionID || 'default')));
        }
      }

      // Re-attach every cached context so it stays visible on later steps and turns.
      for (const m of messages) {
        if (m.info.role !== 'user') continue;
        const ctx = contexts.get(m.info.id);
        if (ctx) attach(m, ctx);
      }
    },
  };
};
```

### วิธีปิดชั่วคราวถ้าช้าเกินไป

`graft ask` ไม่บล็อก OpenCode แล้ว (เป็น async) แต่ step แรกของ user turn ใหม่ยังต้องรอผลอยู่ — นานสุด 8 วินาที ปกติ 2-3 วินาที (รวมเวลาเริ่ม `npx`) step ถัดไปไม่ถามซ้ำ ถ้าอยากปิดโดยไม่แก้โค้ด ใช้ env var:

```bash
GRAFT_AUTO_CONTEXT=0 opencode
```

### วิธีทดสอบ plugin โดยไม่ต้องรอ agent loop ช้าๆ

เรียก hook function ตรงๆ ผ่าน node script แทนที่จะรอผ่าน LLM (มีประโยชน์มากตอนโมเดลช้า) — ถ้าจะทดสอบให้ตรงกับที่ OpenCode ทำจริง ต้องส่ง**สำเนาใหม่**ของ message ที่เก็บไว้ให้ทุก step:

```js
import { pathToFileURL } from "node:url";
const { GraftDeepPlugin } = await import(pathToFileURL("<path-to-graft-deep.js>").href);
const hooks = await GraftDeepPlugin({ directory: "<project-path>" });
const transform = hooks["experimental.chat.messages.transform"];

const storage = [{ info: { id: "u1", role: "user", sessionID: "S1" }, parts: [{ type: "text", text: "where is createTicket defined" }] }];
const step = async () => { const msgs = structuredClone(storage); await transform({}, { messages: msgs }); return msgs; };

console.log((await step())[0].parts.length);  // step 1 (ถาม graft): ได้ 2 ถ้า inject pack/hint สำเร็จ
storage.push({ info: { id: "a1", role: "assistant", sessionID: "S1" }, parts: [{ type: "text", text: "..." }] });
console.log((await step())[0].parts.length);  // step 2 (หลังเรียก tool): ยังได้ 2 — แปะกลับให้ ไม่ถาม graft ใหม่
```

บน Windows ให้รันพร้อม `NODE_PATH` ที่ชี้ไปโฟลเดอร์ที่มี `cross-spawn` (เช่น `NODE_PATH=~/.config/opencode/node_modules`) เพราะ plugin import ด้วยชื่อ package

> [!info] เคยมีคำเตือนเรื่อง race condition ตรงนี้ — ไม่เกี่ยวแล้วหลังตัด auto-rebuild hook ออก
> ก่อนหน้านี้ plugin ยังมี `tool.execute.after` hook คอยสั่ง `graft build` เอง ทำให้ทดสอบพร้อมกับ `graft ask` แล้วชนกันได้ (`graft ask` fail แบบเงียบๆ) ตอนนี้ hook นั้นถูกตัดออกแล้ว (ดูกล่องด้านบน) เพราะ graft CLI เองก็ auto-refresh ก่อนตอบทุกคำถามอยู่แล้ว ปัญหานี้เลยหมดไปพร้อมกับสาเหตุของมัน — ดู [[gotchas]] ข้อ 6

---

## ponytail — code minimization ruleset

[dietrichgebert/ponytail](https://github.com/dietrichgebert/ponytail) เป็น ruleset/skill ที่บังคับให้ agent คิดแบบ "senior dev ขี้เกียจที่สุดในห้อง" ก่อนเขียนโค้ดใหม่ทุกครั้งต้องไล่ decision ladder ตามลำดับ: ไม่จำเป็นก็ไม่เขียน → มีอยู่แล้วในโปรเจกต์ก็ reuse → standard library มีไหม → native platform feature มีไหม → dependency ที่ติดตั้งอยู่แล้วมีไหม → เขียนบรรทัดเดียวได้ไหม → ค่อยเขียนโค้ดใหม่เท่าที่จำเป็นจริงๆ (validation/security/accessibility ยังต้องทำเสมอ ไม่ลดทอนเพราะ minimal)

### ติดตั้งบน OpenCode

เพิ่ม plugin เข้า `opencode.json`/`opencode.jsonc` (ใส่รวมกับ plugin อื่นที่มีอยู่แล้วในลิสต์เดียวกันได้เลย):

```jsonc
{ "plugin": ["@dietrichgebert/ponytail"] }
```

รีสตาร์ท OpenCode แล้วลองรัน `/ponytail-help` เพื่อเช็คว่า activate สำเร็จ

> [!note] Requirement
> ต้องมี Node.js อยู่บน PATH สำหรับ lifecycle hooks เต็มรูปแบบ — ถ้าไม่มี ตัว skill core ยังทำงานได้ แต่บาง activation feature จะเงียบไป (ดูวิธีติดตั้ง Node ที่ [[setup]] Part 0)

### คำสั่งที่ใช้ได้

| คำสั่ง | หน้าที่ |
| --- | --- |
| `/ponytail [lite\|full\|ultra\|off]` | ปรับความเข้ม/ปิดการทำงาน |
| `/ponytail-review` | ตรวจ diff ปัจจุบันว่า over-engineer ไหม |
| `/ponytail-audit` | สแกนทั้ง repo หา code ที่ไม่จำเป็น |
| `/ponytail-debt` | บันทึกจุดที่เลื่อนการ simplify ไว้ |
| `/ponytail-gain` | ดู benchmark ผลลัพธ์ |
| `/ponytail-help` | อ้างอิงคำสั่งเร็ว |

### Config เพิ่มเติม (optional)

- Env var: `PONYTAIL_DEFAULT_MODE=lite|full|ultra|off`
- หรือไฟล์ config: `~/.config/ponytail/config.json` (Windows: `%APPDATA%\ponytail\config.json`) — ใส่ field `defaultMode`
- จำกัดการ inject ruleset เข้าเฉพาะ subagent บางตัว: ตั้ง `PONYTAIL_SUBAGENT_MATCHER` เป็น regex (ไม่ตั้ง = inject ทุก subagent)

### Uninstall

ต้องรัน uninstall script ก่อนถอด plugin เพื่อล้าง config ให้หมด ไม่งั้นไฟล์ config จะค้างอยู่:

```bash
node scripts/uninstall.js
```

> [!info] Benchmark ที่ผู้พัฒนาอ้างไว้ใน README
> ทดสอบบน FastAPI + React repo จริง: โค้ดน้อยลง ~54% (สูงสุดถึง 94% ในบาง task เดี่ยว), cost ลดลง ~20%, เร็วขึ้น ~27%, ความปลอดภัยคงเดิมที่ 100% — เป็นตัวเลขจากฝั่งผู้พัฒนา ยังไม่ได้ verify ซ้ำเองในงานจริง

---

## i-have-adhd — บังคับตอบตรงประเด็น ไม่อ้อมค้อม

[ayghri/i-have-adhd](https://github.com/ayghri/i-have-adhd) (39k+ stars, MIT) เป็น skill ที่เปลี่ยน **สไตล์การตอบของ agent** ไม่ใช่ code ruleset แบบ ponytail — บังคับ 10 กฎ: บอก next action ก่อนเสมอ, เลข step ให้ชัด, จบด้วย concrete next step เดียว, ตัด tangent/preamble/closer ("Hope this helps!"), list ไม่เกิน 5 ข้อ, บอกเวลาเป็นตัวเลขจริง, error พูดตรงๆ ไม่มีน้ำ รองรับ Claude Code, Cursor, Gemini, Kimi, Qwen และ OpenCode ในตัวเดียวกัน

### ติดตั้งบน OpenCode

ไม่มีบน npm — ใช้วิธี clone ซอร์สมาไว้ในเครื่องแล้วชี้ `plugin` ไปที่ path ของไฟล์ `.opencode/plugins/i-have-adhd.mjs` ตรงๆ:

```bash
git clone https://github.com/ayghri/i-have-adhd ~/.config/opencode/vendor/i-have-adhd
```

```jsonc
{ "plugin": ["C:/Users/<user>/.config/opencode/vendor/i-have-adhd/.opencode/plugins/i-have-adhd.mjs"] }
```

รีสตาร์ท OpenCode แล้วพิมพ์ `/i-have-adhd` ในเซสชันเพื่อเปิดใช้ (toggle ต่อ session เท่านั้น — พิมพ์ `stop adhd mode` หรือ `normal mode` เพื่อปิด)

> [!note] plugin นี้ทำอะไรจริงๆ
> `config` hook ลงทะเบียน skill directory ของ repo (`skills/i-have-adhd/SKILL.md`) และ command `/i-have-adhd` เข้ากับ OpenCode เฉยๆ — อ่านไฟล์ในตัว repo ล้วนๆ ไม่มี network call/exec/eval ตรวจโค้ดแล้วปลอดภัย

### Always-on (เปิดทุก session อัตโนมัติ)

ปกติ toggle ต้องพิมพ์ `/i-have-adhd` ทุกครั้งที่เริ่ม session ใหม่ ถ้าอยากให้ ruleset ต่อท้าย system prompt ทุก turn โดยไม่ต้องพิมพ์เอง ให้สร้างไฟล์ flag เปล่าๆ ไว้:

```bash
touch ~/.config/opencode/.i-have-adhd-always
```

ปิดถาวรด้วยการลบไฟล์ flag:

```bash
rm ~/.config/opencode/.i-have-adhd-always
```

> [!warning] Always-on เปลี่ยน behavior ทุกเซสชันทันที
> ต่างจาก toggle ที่จำกัดแค่ session เดียว — ก่อนเปิด always-on ให้แน่ใจว่าต้องการให้ agent ตอบสั้น/ตรงประเด็นแบบนี้ **ทุกงาน** ไม่ใช่แค่ตอนเร่งรีบ

### อัปเดต / ถอด

```bash
# อัปเดตให้ตรง repo ล่าสุด
git -C ~/.config/opencode/vendor/i-have-adhd pull

# ถอด — ลบ path ออกจาก plugin array ใน opencode.jsonc ก็พอ (ไม่ต้องรัน uninstall script แบบ ponytail)
```
