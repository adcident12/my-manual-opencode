---
tags: [project-doc, plugins, opencode, reference]
updated: 2026-09-13
summary: superpowers (skill library), grill-me/grilling (batch-interview skill na dagdag sa superpowers), graft-deep (manu-manong sinulat na custom plugin), ponytail (code-minimization ruleset), at i-have-adhd (pinipilit ang maikli, diretso-sa-punto na sagot) — paano i-install ang bawat isa, at ang Plugin Hook API ng OpenCode
---

# Plugins

Buod sa [[index]] · MCP servers sa [[mcp-servers]]

> [!note] Bago magsimula
> Kailangang naka-install na ang Git (para sa mga plugin na galing sa `git+https://`) — tignan [[setup]] Part 0.

---

## superpowers — skill library

Ang [obra/superpowers](https://github.com/obra/superpowers) ay isang set ng "skills" — mga instruction na pinipilit ang agent na sundin ang magandang workflows, gaya ng brainstorming, systematic-debugging, test-driven-development, writing-plans. Orihinal na ginawa para sa Claude Code, pero may dedikadong OpenCode integration.

### Standard na pag-install

```jsonc
{ "plugin": ["superpowers@git+https://github.com/obra/superpowers.git"] }
```

I-restart ang OpenCode pagkatapos tignan:

```bash
opencode debug skill
```

Dapat makita mo ang lahat ng 14 skills: brainstorming, systematic-debugging, writing-plans, test-driven-development, executing-plans, using-git-worktrees, verification-before-completion, receiving-code-review, requesting-code-review, subagent-driven-development, finishing-a-development-branch, dispatching-parallel-agents, writing-skills, at using-superpowers.

> [!info] Paano nag-i-inject ng context ang superpowers
> Nag-i-inject ang superpowers ng isang "bootstrap" sa **unang** user message ng session (hindi system message) — sinadya ito para bawasan ang token bloat at iwasan ang problema ng ilang model (hal. Qwen) sa maraming system messages. Walang handang flag para patayin ang gawing ito.

### Paano ayusin kung na-block ng network ang GitHub

Kung nabigo ang pag-install ng `git+https://github.com/...`, tignan muna ang error message bago maghanap ng ayos — may 2 magkaibang dahilan na may magkaibang ayos:

**Kaso 1 — direktang may lumalabas na block page** (hal. FortiGate's "Application Blocked") kapag pumupunta sa github.com sa browser — talagang na-block ng network ayon sa IT policy.

> [!warning] Huwag subukang lampasan ang network policy
> Kung tunay na block page, huwag subukang lampasan ito — sinasadyang IT policy ito. Gamitin ang paraan sa ibaba, o hilingin sa IT ang isang allowlist.

Paano mag-install nang hindi dumaan sa GitHub:

1. **Gamitin ang lokal na path kung saan meron nang source** — kung naka-install na ang superpowers ng Claude Code (sa pamamagitan ng ibang channel na hindi naka-block gaya ng plugin marketplace), ituro ang `plugin` direkta sa path na iyon sa halip na git URL:

   ```jsonc
   { "plugin": ["C:/Users/<user>/.claude/plugins/cache/claude-plugins-official/superpowers/<version>"] }
   ```

   Gumagana ito dahil meron nang `main` ang package na tumuturo sa `.opencode/plugins/superpowers.js` — walang kailangang network.

2. **Ibang opsyon kung wala ang Claude Code** — i-download ang repo bilang zip mula sa GitHub web page (gumagana kahit hindi gumagana ang `git clone`, basta maaabot mo ang github.com sa browser), i-extract kahit saan, pagkatapos ituro ang `plugin` sa path na iyon sa halip.

**Kaso 2 — ang error ay isyu sa SSL certificate, hindi block page:**

```
fatal: unable to access 'https://github.com/...': unable to get local issuer certificate
```

Kadalasan ay nangangahulugan ito na gumagawa ang organisasyon ng SSL inspection (MITM gamit ang corporate root CA), pero hindi pinagkakatiwalaan ng `git` ang CA na iyon — nagtitiwala ang browser dahil naka-install ang CA sa OS, pero gumagamit ang git ng sarili nitong certificate store. Ito ay senyales na **pinapayagan ng network pero hindi ito pinagkakatiwalaan ng git** — kaiba sa tunay na block.

> [!caution] Palaging tanungin muna ang user bago ayusin ito
> Maaari itong ayusin sa pamamagitan ng pag-configure ng git para gamitin ang Windows certificate store (`git config http.sslBackend schannel`), pero **palaging tanungin muna ang user** — teknikal, ang ibig sabihin nito ay pagtitiwala sa MITM cert ng organisasyon, hindi ito desisyon na dapat gawin nang mag-isa.

**Kapag pinayagan na ng IT ang GitHub**, bumalik sa normal na git URL (para awtomatikong mag-update sa mga bagong bersyon mula ngayon) — huwag kalimutang linisin ang lumang cache mula sa dating nabigong clone, o baka hindi ito ulit i-clone ng opencode:

```bash
rm -rf ~/.cache/opencode/packages/<plugin-name>@git+https_
```

---

## grill-me / grilling — batch-interview skill (dagdag sa superpowers, hindi plugin)

Ang [mattpocock/skills](https://github.com/mattpocock/skills) ay isang community skill ni Matt Pocock (Total TypeScript / AI Hero), ipinamamahagi bilang standalone na mga `SKILL.md` file na sumusunod sa open **Agent Skills** standard (parehong spec na ginagamit ng Claude Code, at suportado ng OpenCode nang native, walang kailangang baguhin) — **hindi plugin**, kaya walang kailangang idagdag sa `plugin` array ng `opencode.jsonc`. Tignan ang buong mekanismo ng standalone skill sa [[setup]], seksyong "Standalone na skills batay sa Agent Skills open standard."

Gumagana bilang pares ng 2 file:

- `grill-me` — entry point lang (may frontmatter field na `disable-model-invocation: true`, na Claude-Code-specific — hindi kilala ng OpenCode ang field na ito at **tahimik na iniiwasan ito, walang epekto**; tignan [[setup]]). Nagfo-forward lang ito papunta sa `grilling`.
- `grilling` — ang tunay na logic: ini-interview ang user bilang isang "design tree" — bawat desisyon ay nahahati sa mga sub-desisyon. Nagtatanong sa **mga round**, sinasagot ang bawat tanong na handa nang itanong nang sabay-sabay (tinatawag na frontier); bawat tanong ay laging may kasamang inirerekumendang sagot (`➡️`). Natatapos kapag walang natitirang tanong at kinumpirma ng user na parehas na ang pag-unawa.

> [!info] Paano ito kaiba sa `superpowers brainstorming`
> Nagtatanong din ng clarifying questions ang `brainstorming` (seksyon sa itaas), pero isa-isa, at para sa bounded/architectural na trabaho, natatapos ito sa pagsulat ng isang spec file sa ilalim ng `docs/superpowers/specs/`. Nagtatanong naman ang `grilling` bilang batch (nagpapaputok ng ilang tanong bawat round) at walang sinusulat na file — mabuti ito para sa isang local na model kung saan mabagal ang bawat turn (mas mabuti ang mas kaunting turns). Tignan ang "Pag-wire nito sa superpowers brainstorming" sa ibaba para malaman kung bakit kailangang i-wire ang dalawang ito sa halip na hayaang magbanggaan.

### Pag-install (i-vendor ang mga file direkta, hindi sa pamamagitan ng plugin manager)

Gumawa ng 2 file na ito sa **global skills folder** ng OpenCode (gumagana agad sa bawat project, walang kailangang i-set up bawat repo):

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

`~/.config/opencode/skills/grilling/SKILL.md` — ang bersyong inayos para sa setup na ito (tignan "Pag-aayos para sa setup na ito" sa ibaba para sa eksaktong pagkakaiba sa orihinal):

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

Hindi na kailangang i-restart ang OpenCode — nag-lo-load ang mga skill na file-based sa pamamagitan ng native skill tool at matatawag agad pagkatapos i-save ang file (kaiba sa plugin, na nag-lo-load lang kapag nagsisimula ang session). Subukan itong tawagin direkta sa isang session gamit ang isang pangungusap na may salitang "grill," hal. `grill me about <isang ideya>`.

> [!note] Nasaan ang orihinal, walang binago
> - https://raw.githubusercontent.com/mattpocock/skills/main/skills/productivity/grill-me/SKILL.md
> - https://raw.githubusercontent.com/mattpocock/skills/main/skills/productivity/grilling/SKILL.md

### Pag-aayos para sa setup na ito (mahalaga — huwag laktawan)

Ang orihinal na `grilling` ay gumagamit ng pariralang "dispatch a sub-agent to find [a fact]" sa parapo na "Finding facts is your job" — kung ang workflow mo ay konti lang ang pag-asa sa subagents / mas madalas nag-e-execute nang inline (gaya ng setup na ito), dapat baguhin ang parapo na iyon para **laging hanapin ang facts mismo, inline muna**: tawagin ang `graft ask` kung may graft index ang project (tignan [[mcp-servers]], seksyong "graft"), pagkatapos bumalik sa grep/direktang pagbabasa ng files kung wala — dispatch ng sub-agent lang kapag talagang meron itong available at sapat na kabigatan ng trabaho (ang code block sa itaas ay ang naayos na bersyon na).

> [!tip] Bakit kailangang baguhin
> Opsyonal ang `graft`/subagents — hindi lahat ng setup ay meron o gustong gamitin ito nang pareho. Palaging iakma ang instructions sa aktwal na tools/estilo ng trabaho mo sa halip na kopyahin ang orihinal nang literal. Sa tuwing mag-a-update mula sa upstream, kailangang i-merge pabalik ang pagbabagong ito (tignan [[updating]]).

### Pag-wire nito sa superpowers brainstorming (kailangang gawin ito kung naka-install na ang superpowers)

May sarili nang hard gate ang `brainstorming` (seksyon sa itaas): **"MUST use this before any creative work"** — kung idagdag ang `grilling` nang walang isinulat na reconciliation rule muna, magkakaroon ng **dalawang gate na nagbabanggaan sa parehong sandali** ("bago simulan ang bagong trabaho"), na mataas ang risk para sa isang maliit/local na model na pumili ng maling isa o magtanong nang dobleng round.

Ang ayos ay ang pagsulat ng rule sa **global** na `~/.config/opencode/AGENTS.md` (tignan [[setup]], "AGENTS.md — global vs project na instructions," kung bakit kailangang global, hindi project-level) para ang `grilling` ay **dumagdag** sa `brainstorming` sa halip na kumpetensya dito:

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

> [!warning] Bakit kailangang global, hindi project-level na AGENTS.md
> Kung isusulat lang ang rule na ito sa project-level na AGENTS.md (ang file na awtomatikong sinusulat ng `graft init` — tignan [[mcp-servers]]), gagana lang ito sa isang repo na iyon. Ang ibang project na hindi pa nagpatakbo ng `graft init`, o walang `AGENTS.md`, ay walang reconciliation rule — at babalik ang `grilling` sa pagbabanggaan kay `brainstorming` sa sandaling lumipat ka ng project.

### Kumpirmado nang gumagana sa aktwal na paggamit (2 live test case)

> [!info] Aktwal na resulta ng test sa isang maliit na browser-game project (local model, hindi cloud)
> **Kaso 1 — direktang tinawag ang `grilling`** ("grill me about ...") → tama ang pagkakilala ng model na standalone case ito at hindi tinawag ang `brainstorming` kailanman; hinanap ang facts sa pamamagitan ng `graft ask` nang inline (walang subagent); nagtanong ng 2 round (8 tanong sa kabuuan) sa itinakdang format; walang nagawang spec file; naghintay muna ng go-ahead bago nag-implement; natapos sa pag-implement + browser-verify + matagumpay na commit.
>
> **Kaso 2 — direktang humingi ng feature, walang sinabing "grill"** ("pakidagdag ang ... para sa akin") → tinawag ng model ang `brainstorming` muna ayon sa pangunahing gate, kina-classify ang scope (bounded/architectural), sinuri ang code gamit ang graft, pagkatapos ay **ginamit ang question format ng grilling sa halip na magtanong isa-isa** (eksaktong tumutugma sa rule na isinulat sa global AGENTS.md — makikita mismo sa reasoning trace nito na literal na sumisipi ng rule na iyon). Hindi kailanman tinawag ang `grilling` bilang isang hiwalay, pangalawang skill call, at walang duplicate na round ng mga tanong. Natapos din sa pag-implement + tests + matagumpay na commit (walang spec file, dahil kina-classify itong bounded).
>
> Wala sa dalawang kaso ang nag-dispatch ng subagent sa kahit anong bahagi ng session, eksaktong ayon sa layunin.

---

## graft-deep — custom plugin (auto-inject context)

Walang "deep integration" ang graft (tignan [[mcp-servers]]) para sa OpenCode — ibig sabihin, awtomatikong pag-inject ng relevant na context sa isang prompt. Ang feature na ito ay para lang sa Claude Code (ang auto-rebuild ng graph pagkatapos ng isang edit ay trabaho na ng graft CLI mismo para sa bawat agent — tignan ang kahon sa ibaba). Ini-port ng plugin na ito ang auto-inject na gawi gamit ang public CLI ng graft (`graft ask --json`) sa halip na mag-import ng internal module — mas ligtas, at hindi masisira kapag nag-update ng bersyon ang graft.

> [!info] Dati may hook na rin para sa auto-rebuild — tinanggal na (2026-09-13)
> Ang unang bersyon ng plugin na ito ay may `tool.execute.after` hook na nagde-debounce ng 3 segundo bago mag-utos ng `graft build` mismo sa background sa tuwing may na-edit na file. Kumpirmado ng isang live test na ito ay **hindi na kailangan**: ang pag-edit ng isang file pagkatapos agad na tawagin ang `graft ask`, walang manu-manong `graft build` sa pagitan, ay nagbigay ng `[graft] refreshed the graph (1 file changed) before answering` — ibig sabihin, ang kasalukuyang graft CLI ay awtomatiko nang nagre-refresh ng graph bago sumagot sa kahit anong tanong (tignan [[mcp-servers]]). Ang tinanggal na hook ay hindi lang redundant — ito rin ang direktang dahilan ng race condition na nakadokumento sa [[gotchas]], item 6. Tinanggal ang dahilan sa halip na ayusin lang ang sintomas.

### Pag-install

1. Ilagay ang file sa `~/.config/opencode/plugin/graft-deep.js` (gawin mismo ang `plugin` folder kung wala pa)
2. Idagdag ang path na iyon sa `plugin` array ng global config
3. Walang kailangang i-set bawat project — maliban sa `graft build` na kailangan pa ring patakbuhin nang isang beses bawat repo gaya ng dati (tignan [[mcp-servers]]). Pagkatapos noon, ang graft mismo ang magpapanatili ng kasariwaan ng graph sa tuwing tinatanong — wala nang kailangang mag-rebuild dito.

### OpenCode Plugin Hook API na ginamit

Nagbabalik ang isang plugin ng object ng hooks batay sa type na `Hooks` mula sa `@opencode-ai/plugin` — isa na lang ang ginagamit dito ngayon:

| Hook | Kailan tumatakbo | Ginagawa ng graft-deep |
| --- | --- | --- |
| `experimental.chat.messages.transform` | Bawat agent step (hindi lang bawat turn — mas madalas itong tumatawag kaysa akala mo) | Tinatawag ang `graft ask` laban sa pinakahuling mensahe ng user → idinaragdag ang top 3 resulta sa prompt kung pumasa ang coverage sa threshold |

Ibang hooks na available pero hindi ginagamit dito: `tool.execute.before`, `tool.execute.after`, `chat.message`, `command.execute.before`, `session.compacting`, `event`, `tool.definition` — tignan ang buong type sa `node_modules/@opencode-ai/plugin/dist/index.d.ts`.

### Mahalagang aral habang isinusulat (Windows-specific)

**1. Nasisira ang `execFileSync('npx.cmd', args, {shell:false})` sa Windows** — nagta-throw ng `EINVAL` dahil hindi kayang i-spawn ng Windows ang `.cmd` file nang direkta nang walang dumaan sa shell.

**2. `shell:true` + pagdikit ng string mismo = command-injection risk** — ang prompt ay free text mula sa chat message ng user, direktang pagpasok nito sa shell string ay hindi ligtas.

> [!danger] Security
> Huwag kailanman idikit ang free text mula sa user papunta sa isang shell command string, kahit may manu-manong sinulat na escaping function — masyadong madaling magkamali dito at karaniwang hindi saklaw ang lahat ng edge case.

**3. Ang tamang ayos** ay ang `cross-spawn` (isang dependency na naka-ship na ng OpenCode sa sarili nitong `node_modules`), na tama ang paghawak ng Windows argv quoting nang hindi dumadaan sa shell — dynamic na na-import lang kapag `process.platform === 'win32'`. Direktang gumagamit ang macOS/Linux ng built-in na `execFileSync` ng Node dahil walang ganitong problema ang POSIX — kaya walang extra dependency ang file na ito sa non-Windows.

### Buong source code

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
 */
import { execFileSync } from 'node:child_process';

const isWin = process.platform === 'win32';
const MIN_PROMPT_CHARS = 12;
const ASK_TIMEOUT_MS = 8000;
const MIN_COVERAGE = 0.12;

export const GraftDeepPlugin = async ({ directory }) => {
  const crossSpawn = isWin ? (await import('cross-spawn')).default : null;

  const injected = new Set();

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

### Paano ito pansamantalang patayin kung masyadong mabagal

Ang auto-inject-context na bahagi ay tumatakbo nang **synchronous (blocking)** sa bawat bagong mensahe ng user — kung nararamdaman itong nagpapabagal sa isang local na model, patayin ito gamit ang env var, walang kailangang baguhing code:

```bash
GRAFT_AUTO_CONTEXT=0 opencode
```

### Paano subukan ang plugin nang hindi hinihintay ang mabagal na agent loop

Direktang tawagin ang hook function sa pamamagitan ng node script sa halip na hintayin ang LLM (napaka-kapaki-pakinabang habang mabagal ang model):

```js
import { pathToFileURL } from "node:url";
const { GraftDeepPlugin } = await import(pathToFileURL("<path-to-graft-deep.js>").href);
const hooks = await GraftDeepPlugin({ directory: "<project-path>" });

// subukan ang auto-inject context (ang tanging hook na meron ngayon)
const output = { messages: [{ info: { id: "msg1", role: "user" }, parts: [{ type: "text", text: "isang tunay na tanong" }] }] };
await hooks["experimental.chat.messages.transform"]({}, output);
console.log(output.messages[0].parts); // dapat may 2 parts kung matagumpay ang injection
```

> [!info] May babala dati tungkol sa race condition dito — hindi na relevant pagkatapos tanggalin ang auto-rebuild hook
> Dati, may `tool.execute.after` hook din ang plugin na ito na nagpapatakbo ng `graft build` mismo, na maaaring magbanggaan sa isang test na tumatakbo ng `graft ask` sa parehong oras (`graft ask` na fail nang tahimik). Tinanggal na ngayon ang hook na iyon (tignan ang kahon sa itaas), dahil auto-refresh na rin ng graft CLI mismo bago sumagot sa kahit anong tanong — kaya nawala ang problemang ito kasabay ng dahilan nito. Tignan [[gotchas]], item 6.

---

## ponytail — code-minimization ruleset

Ang [dietrichgebert/ponytail](https://github.com/dietrichgebert/ponytail) ay isang ruleset/skill na nagpapa-isip sa agent na parang "ang pinaka-tamad na senior dev sa kwarto" — bago magsulat ng anumang bagong code, kailangan nitong lakarin ang decision ladder ayon sa pagkakasunod-sunod: huwag isulat kung hindi kailangan → gamitin ulit ang meron na sa project → may standard library ba para dito → isang native na feature ng platform → isang dependency na naka-install na → maaari ba itong maging one-liner → saka lang magsulat ng kaunting bagong code na talagang kinakailangan (dapat pa rin laging may validation/security/accessibility, hindi ito babawasan alang-alang sa minimalism).

### Pag-install sa OpenCode

Idagdag ang plugin sa `opencode.json`/`opencode.jsonc` (maaaring isama sa parehong listahan ng ibang plugin na meron na):

```jsonc
{ "plugin": ["@dietrichgebert/ponytail"] }
```

I-restart ang OpenCode at subukan ang `/ponytail-help` para kumpirmahin na na-activate ito.

> [!note] Requirement
> Kailangang nasa PATH ang Node.js para sa buong lifecycle hooks — kung wala, gagana pa rin ang core skill, pero tahimik na mawawala ang ilang activation feature (tignan paano mag-install ng Node sa [[setup]] Part 0).

### Mga available na command

| Command | Ginagawa |
| --- | --- |
| `/ponytail [lite\|full\|ultra\|off]` | Ayusin ang intensity o patayin |
| `/ponytail-review` | Suriin ang kasalukuyang diff kung over-engineered |
| `/ponytail-audit` | I-scan ang buong repo para sa hindi kinakailangang code |
| `/ponytail-debt` | Itala ang mga puntong na-defer ang simplification |
| `/ponytail-gain` | Tignan ang mga resulta ng benchmark |
| `/ponytail-help` | Mabilisang reference ng command |

### Karagdagang config (opsyonal)

- Env var: `PONYTAIL_DEFAULT_MODE=lite|full|ultra|off`
- O config file: `~/.config/ponytail/config.json` (Windows: `%APPDATA%\ponytail\config.json`) — i-set ang field na `defaultMode`
- Para limitahan ang pag-inject ng ruleset sa ilang subagent lang: i-set ang `PONYTAIL_SUBAGENT_MATCHER` sa isang regex (walang naka-set = ini-inject sa bawat subagent)

### Uninstall

Patakbuhin ang uninstall script bago tanggalin ang plugin para malinis nang tuluyan ang config — kung hindi, matitira ang config file:

```bash
node scripts/uninstall.js
```

> [!info] Benchmark na hinahabol ng developer sa README
> Sinubukan sa tunay na FastAPI + React repo: ~54% na mas kaunting code (hanggang 94% sa ilang solong task), ~20% na mas mababang gastos, ~27% na mas mabilis, hindi nagbago ang security sa 100% — mga numero ito mula sa developer mismo, hindi pa independenteng na-verify ulit sa tunay na trabaho dito.

---

## i-have-adhd — pinipilit ang maikli, diretso-sa-punto na sagot

Ang [ayghri/i-have-adhd](https://github.com/ayghri/i-have-adhd) (39k+ stars, MIT) ay isang skill na binabago ang **istilo ng sagot** ng agent, hindi isang code ruleset gaya ng ponytail — pinipilit ang 10 rules: laging sabihin muna ang susunod na aksyon, malinaw na bilangin ang mga step, magtapos ng isang concrete na susunod na step, tanggalin ang tangents/preamble/closers ("Hope this helps!"), listahan na hanggang 5 item lang, magbigay ng tunay na numerikal na estimate ng oras, sabihin ang errors nang malinaw walang labis. Sumusuporta sa Claude Code, Cursor, Gemini, Kimi, Qwen, at OpenCode sa isang package.

### Pag-install sa OpenCode

Wala ito sa npm — i-clone ang source sa lokal at ituro ang `plugin` direkta sa `.opencode/plugins/i-have-adhd.mjs` file:

```bash
git clone https://github.com/ayghri/i-have-adhd ~/.config/opencode/vendor/i-have-adhd
```

```jsonc
{ "plugin": ["C:/Users/<user>/.config/opencode/vendor/i-have-adhd/.opencode/plugins/i-have-adhd.mjs"] }
```

I-restart ang OpenCode at i-type ang `/i-have-adhd` sa isang session para i-on ito (toggle bawat session lang — i-type ang `stop adhd mode` o `normal mode` para patayin).

> [!note] Ano talaga ang ginagawa ng plugin na ito
> Ang `config` hook ay nagre-register lang ng skill directory ng repo (`skills/i-have-adhd/SKILL.md`) at ng `/i-have-adhd` command sa OpenCode — purong nagbabasa ng files sa loob ng repo mismo, walang network calls/exec/eval. Sinuri na ang code at ligtas ito.

### Always-on (awtomatikong naka-on sa bawat session)

Karaniwan, kailangang i-type ang `/i-have-adhd` sa tuwing magsisimula ng bagong session para i-toggle. Kung gusto mong idagdag ang ruleset sa system prompt sa bawat turn nang hindi na kailangang i-type mismo, gumawa ng walang laman na flag file:

```bash
touch ~/.config/opencode/.i-have-adhd-always
```

Patayin ito nang permanente sa pamamagitan ng pagtanggal ng flag file:

```bash
rm ~/.config/opencode/.i-have-adhd-always
```

> [!warning] Agad na binabago ng Always-on ang gawi sa bawat session
> Kaiba sa toggle na limitado sa isang session lang — bago i-on ang always-on, siguraduhing gusto mo talagang sumagot ang agent nang ganito kaikli/diretso-sa-punto **sa bawat trabaho**, hindi lang tuwing nagmamadali.

### Pag-update / Pagtanggal

```bash
# I-update para tumugma sa pinakabagong repo
git -C ~/.config/opencode/vendor/i-have-adhd pull

# Tanggalin — alisin lang ang path sa plugin array sa opencode.jsonc
# (walang kailangang uninstall script, kaiba sa ponytail)
```
