---
tags: [project-doc, plugins, opencode, reference]
updated: 2026-10-03
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

> [!warning] Muling sinubukan 2026-10-03 — hindi laging gumagamit ng graft ang kaso 2
> Sa ikalawang headless end-to-end run (isang maliit na feature sa kopya ng parehong game), tama ang pagtawag sa `brainstorming`, pero sa paggalugad ay sinunod ng agent ang *"Explore project context — check files, docs, recent commits"* ng skill at nag-`read` ng files isa-isa sa halip na gumamit ng graft — ang grill-me rule sa itaas ay sumasaklaw lang sa paghahanap ng facts habang nagga-grilling, hindi sa exploration step ng brainstorming. Kaya nagdagdag ng rule na "Exploring a codebase — graft first, even inside a skill" sa global AGENTS.md (buong teksto at bago/pagkatapos sa [[tuning]] seksyon 4–5, [[gotchas]] item 12).

---

## graft-deep — custom plugin (auto-inject context)

Walang "deep integration" ang graft (tignan [[mcp-servers]]) para sa OpenCode — ibig sabihin, awtomatikong pag-inject ng relevant na context sa isang prompt. Ang feature na ito ay para lang sa Claude Code (ang auto-rebuild ng graph pagkatapos ng isang edit ay trabaho na ng graft CLI mismo para sa bawat agent — tignan ang kahon sa ibaba). Ini-port ng plugin na ito ang auto-inject na gawi gamit ang public CLI ng graft (`graft ask --json`) sa halip na mag-import ng internal module — mas ligtas, at hindi masisira kapag nag-update ng bersyon ang graft.

> [!info] Dati may hook na rin para sa auto-rebuild — tinanggal na (2026-09-13)
> Ang unang bersyon ng plugin na ito ay may `tool.execute.after` hook na nagde-debounce ng 3 segundo bago mag-utos ng `graft build` mismo sa background sa tuwing may na-edit na file. Kumpirmado ng isang live test na ito ay **hindi na kailangan**: ang pag-edit ng isang file pagkatapos agad na tawagin ang `graft ask`, walang manu-manong `graft build` sa pagitan, ay nagbigay ng `[graft] refreshed the graph (1 file changed) before answering` — ibig sabihin, ang kasalukuyang graft CLI ay awtomatiko nang nagre-refresh ng graph bago sumagot sa kahit anong tanong (tignan [[mcp-servers]]). Ang tinanggal na hook ay hindi lang redundant — ito rin ang direktang dahilan ng race condition na nakadokumento sa [[gotchas]], item 6. Tinanggal ang dahilan sa halip na ayusin lang ang sintomas.

> [!info] In-update 2026-09-25 — bagong injection gate ng graft 0.19.0 + mga ayos para tumugma sa totoong pagtakbo ng hook na ito sa OpenCode
> Dalawang magkahiwalay na dahilan, parehong sinuri mula sa source code, hindi hinulaan:
> 1. **Binago ng graft 0.19.0 ang sarili nitong injection rule** (ang Claude Code hook na ini-port ng plugin na ito) — detalye sa "Injection gate" sa ibaba.
> 2. **Isinulat ang nakaraang bersyon na parang kapareho ng Claude Code ang OpenCode — hindi pala.** Ipinakita ng source ng OpenCode 1.18.32 na hindi kailanman nase-save ang mga pagbabago sa `experimental.chat.messages.transform`, kaya nawawala ang in-inject na context mula sa ikalawang agent step pataas. Detalye sa "Paano pinapatakbo ng OpenCode ang hook na ito" sa ibaba.

> [!info] Muling sinuri 2026-10-03 — graft 0.20.0 / 0.21.1 + OpenCode 1.18.34: walang kailangang baguhin sa code
> Hindi nagbago mula 0.19 ang `STRONG_FLOOR = 0.1`, `HIGH_FLOOR = 0.5`, `relevantRetrieval`, at ang mga argument na `ask … --json -n 3` sa hook ng graft, at ibinabalik pa rin ng `graft ask --json` ang `hits[].title`, `hits[].pointer`, `coverage`, `coverageStrong` — sa isang multi-step na simulation ng hook, nananatiling nakakabit ang context sa bawat step.
>
> Dapat malaman: hindi sapat ang hint na "use graft first" na ini-inject ng plugin na ito para pigilan ang model sa pagbasa ng files isa-isa kapag iyon ang sinasabi ng isang naka-load na skill — kailangan din ng rule sa global AGENTS.md ([[gotchas]] item 12)

### Pag-install

1. Ilagay ang file sa `~/.config/opencode/plugin/graft-deep.js` (gawin mismo ang `plugin` folder kung wala pa)
2. Idagdag ang path na iyon sa `plugin` array ng global config
3. Walang kailangang i-set bawat project — maliban sa `graft build` na kailangan pa ring patakbuhin nang isang beses bawat repo gaya ng dati (tignan [[mcp-servers]]). Pagkatapos noon, ang graft mismo ang magpapanatili ng kasariwaan ng graph sa tuwing tinatanong — wala nang kailangang mag-rebuild dito.

> [!note] Nasa `plugin` array *at* nasa `plugin/` folder — isang beses pa rin lang itong naglo-load
> Awtomatikong nilo-load ng OpenCode ang bawat `{plugin,plugins}/*.{ts,js}` sa config dir **at** lahat ng nasa `plugin` array, tapos inaalis ang doble batay sa eksaktong file URL (`deduplicatePluginOrigins` sa `config/plugin.ts`). Kumpirmado gamit ang `opencode debug config`: isang beses lang lumalabas ang `graft-deep.js`.

### OpenCode Plugin Hook API na ginamit

Nagbabalik ang isang plugin ng object ng hooks batay sa type na `Hooks` mula sa `@opencode-ai/plugin` — isa lang ang ginagamit dito:

| Hook | Kailan tumatakbo | Ginagawa ng graft-deep |
| --- | --- | --- |
| `experimental.chat.messages.transform` | Bago ang **bawat** LLM call — bawat agent step ng isang turn, at pati sa compaction | Sa unang step ng bagong user turn: tinatawag ang `graft ask` nang isang beses at kina-cache ang resulta ayon sa message ID. Sa bawat tawag: ibinabalik ang bawat naka-cache na context sa message nito |

Ibang hooks na available pero hindi ginagamit dito: `tool.execute.before`, `tool.execute.after`, `chat.message`, `command.execute.before`, `session.compacting`, `event`, `tool.definition` — tignan ang buong type sa `node_modules/@opencode-ai/plugin/dist/index.d.ts`.

### Paano pinapatakbo ng OpenCode ang hook na ito (sinuri sa source ng opencode 1.18.32)

> [!important] **Pansamantala** lang ang mga pagbabago sa `messages.transform` — para sa iisang LLM call lang
> Nilo-load muli ng prompt loop ang lahat ng message mula sa storage sa simula ng bawat step (`session/prompt.ts`, `MessageV2.filterCompactedEffect` sa loob ng `while (true)` loop) bago tawagin ang hook. Anuman ang idagdag ng hook ay ipinapadala sa model nang isang beses tapos itinatapon. Kabaligtaran ito ng Claude Code, kung saan permanenteng nasusulat sa transcript ang output ng `UserPromptSubmit` hook.

Ang epekto nito sa nakaraang bersyon, at kung paano ito hinahawakan ng bersyong ito:

| Gawi ng OpenCode | Nakaraang bersyon | Ngayon |
| --- | --- | --- |
| Bagong load ang mga message bawat step | Nag-inject sa step 1, tapos sa step 2+ agad nagre-return ang `injected.has(key)` → **nawala ang context sa sandaling tumawag ng unang tool ang agent** | Kinukuwenta ang pack nang isang beses bawat message, kina-cache ayon sa message ID, at **ibinabalik sa bawat tawag** — nakikita pa rin sa mga susunod na step at turn, gaya ng transcript ng Claude Code |
| Tinatawag din ng compaction ang hook na ito, gamit ang kopya ng lumang history (`session/compaction.ts`) | Nagpatakbo ng walang-silbing `graft ask` laban sa lumang message | Tumatakbo lang ang `graft ask` kapag ang **huling** message ay sa user (unang step ng bagong turn); sa compaction, ibinabalik lang ang mga naka-cache na context |
| Nagdadagdag ang sariling reminders ng OpenCode ng `synthetic` na text parts sa user message bago tumakbo ang hook (`session/reminders.ts` — mga prompt ng plan mode atbp.) | Nahalo ang boilerplate na iyon sa graft query | Ginagamit lang ng query ang mga text part na hindi `synthetic`/`ignored`; ang in-inject na part mismo ay may markang `synthetic: true`, ang sariling convention ng OpenCode |
| Tumatakbo ang mga plugin sa parehong process ng TUI | Napapahinto ng `crossSpawn.sync` ang OpenCode nang hanggang 8 segundo | Tumatakbo ang `graft ask` sa pamamagitan ng async na `spawn` — tuloy-tuloy ang event loop |

Mga side effect ng pagbabalik: nananatiling pareho ang prompt prefix bawat step (friendly sa prompt cache), at nagiging tapat ang "novelty" gate sa ibaba — ang pointer na naipakita na ay talagang nasa harap pa ng model. Nasa memory ang cache: pagkatapos i-restart ang OpenCode, nawawalan ng pack ang mga lumang message, at kasabay nitong nare-reset ang novelty memory, kaya nananatiling magkatugma ang dalawa.

### Injection gate (ginagaya ang sariling Claude Code hook ng graft 0.19)

Pinalitan ng graft 0.19.0 ang iisang `coverage` threshold nito (`0.12` ang gamit ng plugin na ito; `0.15` ang sa graft mismo) matapos makitang ang isang borderline pack ay "reads as orientation and suppresses the very retrieval call it should have triggered" (`dist/claude/format.js`). Ginagamit na ngayon ng plugin ang parehong dalawang gate ng `relevantRetrieval` ng graft:

1. **Strength** — ini-inject lang ang isang lexical na resulta kung tumama ang top hit sa isang totoong **pangalan** ng symbol (`coverageStrong ≥ 0.1`) o malawak na tumama sa query (`coverage ≥ 0.5`). Kung hindi, isang one-line hint na tumuturo sa graft tools ang ini-inject — hanggang 2 beses lang bawat session. Ang mga structural na resulta (hal. "sino ang tumatawag sa X") ay walang coverage score at laging pumapasa — itinuring ng nakaraang bersyon na `0` ang nawawalang `coverage` at tahimik na itinapon ang mga ito.
2. **Novelty** — inaalis ang mga hit na na-inject na ang `pointer` sa session na ito (tinatandaan ang huling 40); kung wala nang natira, walang ini-inject.

Isang sinukat na halimbawa (graft 0.19.0, isang totoong Next.js repo): ang prompt na "who calls the api client" ay bumalik na may `coverage 0.20`, `coverageStrong 0` — walang hit na tumama sa pangalan ng symbol. Ii-inject sana ng lumang `0.12` threshold ang 3 walang-kaugnayang hit na iyon; ngayon ang hint ang ini-inject. Ang "where is createTicket defined" ay tumama sa pangalan ng symbol at nag-inject ng pack.

> [!tip] Suriin muli pagkatapos ng bawat graft upgrade
> Walang sariling upstream ang graft-deep, pero ginagaya nito ang hook ng graft, kaya ikumpara ito tuwing nagpapalit ng bersyon ang graft:
> ```bash
> G="$(npm root -g)/@nanonets/graft/dist"
> grep -n "STRONG_FLOOR =\|HIGH_FLOOR =" "$G/ask/fuse.js"               # ang dalawang threshold
> grep -n "function relevantRetrieval" -A 25 "$G/claude/format.js"       # ang gate mismo
> grep -n "'ask', prompt" "$G/claude/hooks.js"                           # ang ask flags na gamit ng graft mismo
> graft ask --help                                                       # nandiyan pa ba ang --json / -n?
> ```
> Tignan din na nagbabalik pa rin ang `graft ask ... --json` ng `hits[].title`, `hits[].pointer`, `coverage` at `coverageStrong` (`dist/ask/ask.d.ts`, `AskResult`).

### Mahalagang aral habang isinusulat (Windows-specific)

**1. Nasisira ang `execFileSync('npx.cmd', args, {shell:false})` sa Windows** — nagta-throw ng `EINVAL` dahil hindi kayang i-spawn ng Windows ang `.cmd` file nang direkta nang walang dumaan sa shell.

**2. `shell:true` + pagdikit ng string mismo = command-injection risk** — ang prompt ay free text mula sa chat message ng user, direktang pagpasok nito sa shell string ay hindi ligtas.

> [!danger] Security
> Huwag kailanman idikit ang free text mula sa user papunta sa isang shell command string, kahit may manu-manong sinulat na escaping function — masyadong madaling magkamali dito at karaniwang hindi saklaw ang lahat ng edge case.

**3. Ang tamang ayos** ay ang `cross-spawn` (isang dependency na naka-ship na ng OpenCode sa sarili nitong `node_modules`), na tama ang paghawak ng Windows argv quoting nang hindi dumadaan sa shell — dynamic na na-import lang kapag `process.platform === 'win32'`. Direktang gumagamit ang macOS/Linux ng built-in na `spawn` ng Node dahil walang ganitong problema ang POSIX — kaya walang extra dependency ang file na ito sa non-Windows. Pareho ang async API ng dalawa (`spawn`, hindi `.sync`), kaya walang pakialam ang natitirang code kung alin ang nakuha nito.

### Buong code

> [!tip] File na handang kopyahin: [`config/plugin/graft-deep.js`](../config/plugin/graft-deep.js)
> Parehong file ang code sa ibaba — ang nasa `config/` ang ituring na source kapag kinokopya sa `~/.config/opencode/plugin/`.

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

### Pansamantalang pag-off kung masyadong mabagal

Hindi na bina-block ng `graft ask` ang OpenCode (async na ito), pero hinihintay pa rin ito ng unang step ng bawat bagong user turn — hanggang 8 segundo, karaniwang 2-3 (kasama ang pagsisimula ng `npx`). Hindi na ito nagtatanong ulit sa mga susunod na step. Para i-off nang hindi ine-edit ang code, gumamit ng env var:

```bash
GRAFT_AUTO_CONTEXT=0 opencode
```

### Pag-test ng plugin nang hindi naghihintay sa mabagal na agent loop

Direktang tawagin ang hook function mula sa isang node script sa halip na dumaan sa LLM (napakakapaki-pakinabang kapag mabagal ang model). Para i-test ito gaya ng totoong pagtakbo sa OpenCode, bigyan ang bawat step ng **bagong kopya** ng mga naka-store na message:

```js
import { pathToFileURL } from "node:url";
const { GraftDeepPlugin } = await import(pathToFileURL("<path-to-graft-deep.js>").href);
const hooks = await GraftDeepPlugin({ directory: "<project-path>" });
const transform = hooks["experimental.chat.messages.transform"];

const storage = [{ info: { id: "u1", role: "user", sessionID: "S1" }, parts: [{ type: "text", text: "where is createTicket defined" }] }];
const step = async () => { const msgs = structuredClone(storage); await transform({}, { messages: msgs }); return msgs; };

console.log((await step())[0].parts.length);  // step 1 (nagtatanong sa graft): 2 kung may na-inject na pack/hint
storage.push({ info: { id: "a1", role: "assistant", sessionID: "S1" }, parts: [{ type: "text", text: "..." }] });
console.log((await step())[0].parts.length);  // step 2 (pagkatapos ng tool call): 2 pa rin — ibinalik, walang bagong graft call
```

Sa Windows, patakbuhin ito na may `NODE_PATH` na nakaturo sa folder na may `cross-spawn` (hal. `NODE_PATH=~/.config/opencode/node_modules`), dahil ini-import ito ng plugin ayon sa pangalan.

> [!info] Dati may babala tungkol sa race condition dito — hindi na nauugnay mula nang tanggalin ang auto-rebuild hook
> Dati, may `tool.execute.after` hook pa rin ang plugin na nag-uutos ng `graft build` mismo, kaya ang pag-test nito kasabay ng `graft ask` ay maaaring magbanggaan (tahimik na nagfa-fail ang `graft ask`). Tinanggal na ang hook na iyon (tignan ang kahon sa itaas) dahil ang graft CLI mismo ay nagre-refresh na bago sumagot sa bawat tanong, kaya nawala ang problemang ito kasama ng dahilan nito — tignan [[gotchas]], item 6.

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

## caveman — maikli, diretso-sa-punto na sagot (ginagamit sa halip na i-have-adhd)

Ang [JuliusBrussee/caveman](https://github.com/JuliusBrussee/caveman) (Apache-2.0) ay may dalawang bahagi: isang **skill** na nagpapaikli ng sagot ng agent, at isang **proxy** na nagpapaliit ng tool output bago ito umabot sa model. **Ang skill lang** ang ginagamit ng setup na ito (kung bakit hindi ang proxy: dulo ng seksyong ito).

Mga rule ng skill: sagot muna, saka ang dahilan · walang bati, ulit, o pangwakas · maiikling salita · isang ideya bawat pangungusap · sumagot sa wika ng user · **laging nakasulat nang buo ang code, commands, paths, numero, at error text** · kusa itong bumabalik sa buong pangungusap para sa security warnings at mga aksyong hindi na mababawi.

> [!info] Bakit nito pinalitan ang i-have-adhd (2026-10-03)
> Pareho ang trabaho ng dalawa (kontrolin ang istilo ng sagot); kapag sabay, nagpapatong ang dalawang rule set. Kusang naka-on ang caveman sa bawat session, puwedeng i-toggle (`/caveman off`), at may kasamang `/caveman-commit` / `/caveman-review`. Gumagana pa rin ang i-have-adhd bilang alternatibo (susunod na seksyon) — pero **huwag patakbuhin ang dalawa nang sabay**.

### I-install sa OpenCode — nang manu-mano, hindi gamit ang installer

> [!warning] Huwag patakbuhin ang `bin/install.js --only opencode` kung `.jsonc` na may comments ang config mo
> Isinusulat ulit ng installer ang `opencode.jsonc` bilang plain JSON — **nawawala ang lahat ng comment** (nag-iiwan ito ng `.bak`) — at nag-i-install ng 9 na skills + 3 `cavecrew` subagents + isang rule block sa global AGENTS.md, na higit sa kailangan ng setup na ito ([[gotchas]] item 18).

I-download lang ang mga file na ginagamit, mula sa naka-pin na tag:

```bash
T=v3.1.0; R=https://raw.githubusercontent.com/JuliusBrussee/caveman/$T; C=~/.config/opencode
mkdir -p $C/plugins/caveman $C/commands
curl -fsSL $R/src/plugins/opencode/plugin.js    -o $C/plugins/caveman/plugin.js
curl -fsSL $R/src/plugins/opencode/package.json -o $C/plugins/caveman/package.json
curl -fsSL $R/src/hooks/caveman-config.js       -o $C/plugins/caveman/caveman-config.cjs   # dapat maging .cjs ang extension
curl -fsSL $R/src/hooks/caveman-parse.js        -o $C/plugins/caveman/caveman-parse.cjs
for s in caveman caveman-commit caveman-review; do
  mkdir -p $C/skills/$s
  curl -fsSL $R/skills/$s/SKILL.md                  -o $C/skills/$s/SKILL.md
  curl -fsSL $R/src/plugins/opencode/commands/$s.md -o $C/commands/$s.md
done
```

Idagdag nang manu-mano ang path ng plugin sa `plugin` array ng `opencode.jsonc` (subfolder ang `plugins/caveman/`, kaya hindi ito auto-load ng OpenCode):

```jsonc
{ "plugin": ["C:/Users/<user>/.config/opencode/plugins/caveman/plugin.js"] }
```

> [!note] Walang rule block sa global AGENTS.md
> Habang aktibo ang isang mode, inilalagay ng plugin ang buong `skills/caveman/SKILL.md` (~1.07k tokens) sa system prompt bawat turn sa pamamagitan ng `experimental.chat.system.transform`. Magiging doble ito ng AGENTS.md block na isinusulat ng installer, at patuloy pa iyong gagana kahit pagkatapos ng `/caveman off`. Walang network call at walang ini-spawn na process ang plugin (ang flag file na `~/.config/opencode/.caveman-active` lang ang binabasa/isinusulat nito).

Tiyakin: buksan ulit ang OpenCode → nakalista sa `opencode debug skill` ang `caveman`, `caveman-commit`, `caveman-review`, at `caveman` ang laman ng `~/.config/opencode/.caveman-active`.

### Mga command

| Command | Ginagawa |
| --- | --- |
| `/caveman` · `/caveman off` · `/caveman status` | i-on / i-off / ipakita ang mode (pinapatay din ito ng pag-type ng `normal mode` o `stop caveman`) |
| `/caveman-commit` | sumusulat ng Conventional Commits message para sa naka-stage na changes — **hindi** nito pinapatakbo ang `git commit` |
| `/caveman-review [files]` | nire-review ang diff, isang linya bawat finding, may 🔴/🟡/🟢 na severity |

Itakda ang default mode gamit ang env var na `CAVEMAN_DEFAULT_MODE`.

### Ang nasukat sa setup na ito

- **Gastos:** ~1.2k pang prompt tokens bawat turn (ang ~1,070-token na rule set + 3 skill entries) — mula ~32.6k tungong ~34.0k
- **Epekto:** bahagyang umikli ang huling sagot (~9% sa test) at mas madaling basahin, pero **hindi nasusukat na bumaba ang kabuuang output tokens** ng turn — sa coding work, karamihan ng output ay tool calls at code, na hindi ginagalaw ng skill (8.5% ang nasukat ng JetBrains sa 86 na tunay na task). Gamitin dahil mas madaling basahin, hindi dahil nakakatipid — detalye sa [[tuning]] seksyon 8

> [!note] Bakit hindi ang proxy ng caveman
> (1) Kapag nira-wrap nito ang OpenCode, ang `baseURL` lang ng `openai` at `anthropic` providers ang nire-redirect nito — hindi dumadaan dito ang custom provider (hal. self-hosted llama.cpp) (2) nagpapadala ang CLI ng telemetry by default, kasama ang IP (pinapatay ng `caveman telemetry off`) (3) nagdadagdag ito ng 5 MCP tools sa bawat prompt — hindi nasubukan dito

### Alisin

Tanggalin ang path sa `plugin` array, saka burahin ang `~/.config/opencode/plugins/caveman/`, `skills/caveman*/`, `commands/caveman*.md`, at ang file na `.caveman-active`.

### I-update

Palitan ang `T=` ng bagong tag at patakbuhin ulit ang download block — tignan [[updating]].

---

## i-have-adhd — pinipilit ang maikli, diretso-sa-punto na sagot

> [!warning] Isang alternatibo — caveman na ang ginagamit ng setup na ito (2026-10-03)
> Pinanatili ang seksyong ito para sa mas gusto ang opt-in bawat session kaysa laging naka-on. Isa lang ang i-install, hindi pareho.

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
