---
tags: [project-doc, plugins, opencode, reference]
updated: 2026-08-20
summary: superpowers (skill library) และ graft-deep (custom plugin ที่เขียนเอง) — วิธีติดตั้งและโครงสร้าง Plugin Hook API ของ OpenCode
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

## graft-deep — custom plugin (auto-rebuild + auto-inject context)

graft (ดู [[mcp-servers]]) ไม่มี "deep integration" ให้ OpenCode — คือ auto-rebuild กราฟหลังแก้ไฟล์ และ auto-inject context ที่เกี่ยวข้องต่อ prompt — ฟีเจอร์นี้มีให้แค่ Claude Code เท่านั้น (อยู่ใน `dist/claude/hooks.js` ของ package) plugin นี้ port พฤติกรรมนั้นมาโดยใช้ public CLI ของ graft (`graft build`, `graft ask --json`) แทนการ import internal module — ปลอดภัยกว่าและไม่พังตอน graft อัปเดตเวอร์ชัน

### ติดตั้ง

1. วางไฟล์ที่ `~/.config/opencode/plugin/graft-deep.js` (สร้างโฟลเดอร์ `plugin` เองถ้ายังไม่มี)
2. เพิ่ม path นั้นใน `plugin` array ของ global config
3. ไม่ต้องตั้งอะไรเพิ่มต่อโปรเจกต์ — ยกเว้น `graft build` ที่ยังต้องรันครั้งแรกต่อ repo เหมือนเดิม (ดู [[mcp-servers]])

### OpenCode Plugin Hook API ที่ใช้

Plugin คืน object ของ hooks ตาม type `Hooks` จาก `@opencode-ai/plugin` — สองตัวที่ใช้ในนี้:

| Hook | ทำงานตอนไหน | ใช้ทำอะไรใน graft-deep |
| --- | --- | --- |
| `tool.execute.after` | หลัง tool ใดๆ ถูกเรียก (รวม edit/write/bash) | เช็คว่าเป็น edit-like tool ไหม (`/edit\|write\|patch/i`) → debounce 3 วิ → รัน `graft build` แบบ background |
| `experimental.chat.messages.transform` | ทุก agent step (ไม่ใช่แค่ทุก turn — เรียกบ่อยกว่าที่คิด) | รัน `graft ask` กับข้อความล่าสุดของ user → แปะผล top 3 ต่อท้าย prompt ถ้า coverage ผ่าน threshold |

hook อื่นๆ ที่มีให้ใช้แต่ยังไม่ได้ใช้ในนี้: `tool.execute.before`, `chat.message`, `command.execute.before`, `session.compacting`, `event`, `tool.definition` — ดูชนิดเต็มที่ `node_modules/@opencode-ai/plugin/dist/index.d.ts`

### บทเรียนสำคัญตอนเขียน (Windows-specific)

**1. `execFileSync('npx.cmd', args, {shell:false})` พังบน Windows** — โยน `EINVAL` เพราะ Windows spawn ไฟล์ `.cmd` ตรงๆ โดยไม่ผ่าน shell ไม่ได้

**2. `shell:true` + string ต่อกันเอง = command injection risk** — prompt เป็น free-text จากข้อความแชทผู้ใช้ ไปต่อเป็น shell string ตรงๆ ไม่ปลอดภัย

> [!danger] Security
> ห้ามเอา free-text ที่มาจากผู้ใช้ไปต่อเป็น shell command string เด็ดขาด แม้จะเขียนฟังก์ชัน escape เองก็ตาม เพราะพลาดได้ง่ายและมักไม่ครอบคลุมทุก edge case

**3. วิธีที่ถูกต้อง** ใช้ `cross-spawn` (dependency ที่ OpenCode มีอยู่แล้วใน `node_modules` ของตัวเอง) ซึ่งจัดการ argv quoting ของ Windows ถูกต้องโดยไม่ผ่าน shell — import แบบ dynamic เฉพาะตอน `process.platform === 'win32'` เท่านั้น ฝั่ง macOS/Linux ใช้ Node built-in (`execFileSync`/`spawn`) ตรงๆ ได้เลยเพราะ POSIX ไม่มีปัญหานี้ ทำให้ไฟล์นี้ไม่มี extra dependency บน non-Windows เลย

### โค้ดเต็ม

```js
/**
 * Graft deep-integration plugin for OpenCode (global, cross-platform).
 * ...(ดู docstring ในไฟล์จริงสำหรับรายละเอียดเหตุผลทั้งหมด)
 */
import { execFileSync, spawn } from 'node:child_process';

const isWin = process.platform === 'win32';
const REBUILD_DEBOUNCE_MS = 3000;
const MIN_PROMPT_CHARS = 12;
const ASK_TIMEOUT_MS = 8000;
const MIN_COVERAGE = 0.12;
const EDIT_TOOL_PATTERN = /edit|write|patch/i;

export const GraftDeepPlugin = async ({ directory }) => {
  const crossSpawn = isWin ? (await import('cross-spawn')).default : null;
  const spawnFn = isWin ? crossSpawn : spawn;

  let rebuildTimer = null;
  let rebuilding = false;
  const injected = new Set();

  function scheduleRebuild() {
    if (rebuildTimer) clearTimeout(rebuildTimer);
    rebuildTimer = setTimeout(() => {
      if (rebuilding) return;
      rebuilding = true;
      try {
        const child = spawnFn('npx', ['-y', '@nanonets/graft', 'build'], {
          cwd: directory,
          detached: true,
          stdio: 'ignore',
        });
        child.on('exit', () => { rebuilding = false; });
        child.on('error', () => { rebuilding = false; });
        child.unref();
      } catch {
        rebuilding = false;
      }
    }, REBUILD_DEBOUNCE_MS);
  }

  function graftAsk(prompt) {
    const args = ['-y', '@nanonets/graft', 'ask', prompt, '.', '--json', '-n', '3'];
    try {
      if (isWin) {
        const r = crossSpawn.sync('npx', args, { cwd: directory, encoding: 'utf8', timeout: ASK_TIMEOUT_MS });
        if (r.error || r.status !== 0 || !r.stdout) return null;
        return JSON.parse(r.stdout);
      }
      const out = execFileSync('npx', args, {
        cwd: directory, encoding: 'utf8', timeout: ASK_TIMEOUT_MS,
        stdio: ['ignore', 'pipe', 'ignore'],
      });
      return JSON.parse(out);
    } catch {
      return null;
    }
  }

  function formatContext(result) {
    const hits = result?.hits;
    if (!Array.isArray(hits) || hits.length === 0) return null;
    if ((result.coverage ?? 0) < MIN_COVERAGE) return null;
    const lines = hits.map((h) => `- ${h.title} — ${h.pointer}`);
    return `[graft] possibly relevant code for this request:\n${lines.join('\n')}\n(use the graft MCP tools for full detail if needed)`;
  }

  return {
    'tool.execute.after': async (input) => {
      if (EDIT_TOOL_PATTERN.test(input?.tool ?? '')) scheduleRebuild();
    },

    'experimental.chat.messages.transform': async (_input, output) => {
      if (process.env.GRAFT_AUTO_CONTEXT === '0') return;
      if (!output?.messages?.length) return;

      const lastUser = [...output.messages].reverse().find((m) => m.info.role === 'user');
      if (!lastUser || !lastUser.parts.length) return;

      const text = lastUser.parts.filter((p) => p.type === 'text').map((p) => p.text).join(' ').trim();
      if (text.length < MIN_PROMPT_CHARS) return;

      const key = lastUser.info.id || text; // dedupe per message across agent steps
      if (injected.has(key)) return;

      const result = graftAsk(text);
      const ctx = result && formatContext(result);
      if (!ctx) return;

      injected.add(key);
      const ref = lastUser.parts[0];
      lastUser.parts.push({ ...ref, type: 'text', text: ctx });
    },
  };
};
```

### วิธีปิดชั่วคราวถ้าช้าเกินไป

ส่วน auto-inject context รันแบบ **synchronous (บล็อก)** ทุกข้อความใหม่ของ user ถ้ารู้สึกช้าขึ้นบนโมเดลในเครื่อง ปิดได้ด้วย env var โดยไม่ต้องแก้โค้ด:

```bash
GRAFT_AUTO_CONTEXT=0 opencode
```

ส่วน auto-rebuild ทำงานเบื้องหลังไม่บล็อกอะไรเลย เปิดไว้ตลอดได้ ไม่มีผลต่อความเร็ว

### วิธีทดสอบ plugin โดยไม่ต้องรอ agent loop ช้าๆ

เรียก hook function ตรงๆ ผ่าน node script แทนที่จะรอผ่าน LLM (มีประโยชน์มากตอนโมเดลช้า):

```js
import { pathToFileURL } from "node:url";
const { GraftDeepPlugin } = await import(pathToFileURL("<path-to-graft-deep.js>").href);
const hooks = await GraftDeepPlugin({ directory: "<project-path>" });

// ทดสอบ auto-rebuild
await hooks["tool.execute.after"]({ tool: "edit", sessionID: "s1", callID: "c1", args: {} });

// ทดสอบ auto-inject context
const output = { messages: [{ info: { id: "msg1", role: "user" }, parts: [{ type: "text", text: "คำถามจริง" }] }] };
await hooks["experimental.chat.messages.transform"]({}, output);
console.log(output.messages[0].parts); // ควรมี 2 parts ถ้า inject สำเร็จ
```

> [!warning] อย่ารัน rebuild กับ ask พร้อมกันตอนทดสอบ
> เจอ race condition จริง: ถ้า `graft build` (background) ยังไม่เสร็จตอน `graft ask` ยิงไป จะเกิด contention แล้ว `graft ask` fail แบบเงียบๆ (by design, "fail soft") ทำให้ดูเหมือน bug ทั้งที่จริงๆ ทำงานถูกต้องถ้าทดสอบแยกกัน
