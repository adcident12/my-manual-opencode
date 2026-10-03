---
tags: [project-doc, tuning, opencode, measurement, reference]
updated: 2026-10-03
summary: Pagsukat kung talagang nangyayari ang workflow ng USER-MANUAL/architecture — laki ng prompt bawat turn, aling tools ang talagang tinatawag ng agent, bakit paulit-ulit binabasa ang files, at isang end-to-end test — saka pag-tune batay sa nasukat, kasama ang scripts para ulitin ito sa sariling makina
---

# Tuning — sukatin muna, saka paganahin nang buo ang workflow

Buod sa [[index]] · mga layer ayon sa function sa [[architecture]] · workflow sa [[USER-MANUAL]] · mga problema sa [[gotchas]]

Ang kumpletong config ay hindi pareho sa gumaganang workflow. Ang lahat ng MCP server na `connected` at lahat ng skill na naglo-load ay walang sinasabi kung talagang **ginagamit** ng agent ang mga ito ayon sa pagkakasunod na inilarawan ng [[USER-MANUAL]] at [[architecture]]. Itinatala ng pahinang ito ang apat na tunay na pagsukat (lahat ay tumakbo sa lokal na makina — walang lumalabas na data), ang ipinakita ng mga ito, at ang binago dahil dito.

> [!info] Buod ng resulta (sinukat noong 2026-10-03 · OpenCode 1.18.34 · graft 0.21.1 · self-hosted Qwen3.8 27B, 131k context)
> | Ang sinukat | Bago | Pagkatapos |
> | --- | --- | --- |
> | Prompt bawat turn, bago magsimula ng anumang trabaho | ~43.3k tokens (131 tools) | **~32.6k tokens (84 tools), −25%** |
> | Gumagamit ng graft ang agent habang nag-e-explore (E2E, turn 1) | 0 tawag, 7 reads | **2 tawag, 2 reads** |
> | memory MCP | 1 tawag sa 50 session, hindi kailanman nagawa ang file | **nagse-save at naaalala kahit magpalit ng session** |
> | Paulit-ulit na pagbasa ng files | 76% ay agad pagkatapos ng compaction | `compaction.prune` + isang re-read rule (**hindi pa nakumpirma sa mahabang session**) |
> | Pagdagdag ng Caveman + benjamin-plus (seksyon 8) | — | **walang nasusukat na improvement** — pinanatili ang Caveman dahil mas madaling basahin ang mga sagot (nagiging ~34.0k ang prompt), inalis ang benjamin-plus |

Lahat ng scripts ay nasa [`scripts/`](../scripts/) — Node.js lang ang kailangan (≥ 22.5 para sa `session-report.mjs`, na gumagamit ng built-in na `node:sqlite`). Ang HTML source ng bawat larawan dito ay [`assets/tuning/report.html`](../assets/tuning/report.html).

---

## 1. Sukatin ang laki ng prompt bawat turn

Bawat turn, muling ipinapadala ng OpenCode ang system prompt, bawat AGENTS.md, ang listahan ng skills, at **ang definition ng bawat tool mula sa bawat naka-enable na MCP server**. Iyan ang nakapirming "bayad" bago ang anumang tunay na trabaho, at direkta itong kinukuha mula sa 131k context ng isang lokal na model.

### Paano — kunin ang tunay na request gamit ang pekeng endpoint

Kaparehong ideya ng [[gotchas]] item 8 (pagturo ng `baseURL` sa isang lokal na proxy), pero walang tunay na model na tinatawag — ang [`capture-server.mjs`](../scripts/capture-server.mjs) ay isang OpenAI-compatible endpoint na nire-record ang bawat request at sumasagot ng `ok`.

```bash
# terminal 1 — simulan ang pekeng endpoint
node scripts/capture-server.mjs ./capture

# terminal 2 — hayaang magpadala ang OpenCode ng isang prompt (hindi ginagalaw ang tunay mong config — mine-merge lang ang OPENCODE_CONFIG_CONTENT sa process na ito)
cd my-project
OPENCODE_CONFIG_CONTENT='{"provider":{"capture":{"npm":"@ai-sdk/openai-compatible","options":{"baseURL":"http://127.0.0.1:18555/v1"},"models":{"fake":{"limit":{"context":131072,"output":32768}}}}}}' \
  opencode run -m capture/fake "Reply with exactly the word: ok"

# hatiin sa mga bucket
node scripts/analyze-prompt.mjs ./capture/req-02.json
```

Sa PowerShell, ganito i-set ang variable: `$env:OPENCODE_CONFIG_CONTENT='{...}'; opencode run -m capture/fake "..."`

> [!note] Aling file ang pangunahing prompt
> Dalawang file ang makukuha — ang maliit (`req-01`) ay ang request para sa session title; ang malaki (`req-02`) ay ang prompt na talagang natatanggap ng model sa unang turn.

> [!tip] Gaano katumpak ang token numbers
> Tinatantya ng `analyze-prompt.mjs` ang tokens bilang characters ÷ 3.6 — sinuri ang kabuuang "bago" (~43.3k) laban sa 42,920 prompt tokens na talagang inulat ng provider para sa parehong prompt. Kung may sarili kang tunay na bilang, gamitin ang `--tokens <N>` para eksaktong i-calibrate.

### Resulta

![Prompt budget per turn — before vs after tuning](../assets/tuning/1-prompt-budget.png)

Ang ipinapakita:
- **Ang tatlong browser-side MCP server (open-design, chrome-devtools, playwright) ay umubos ng ~17.5k tokens nang magkakasama — 40%** ng buong prompt — kahit karamihan ng trabaho ay hindi gumagamit ng browser
- Ang open-design pa lang ay ~6.6k tokens (22 tools + sariling instructions ng server) — at ginagamit lang ito kapag kumukuha ng trabaho mula sa OpenDesign ([[USER-MANUAL]] seksyon 5)
- Ang listahan ng 25 skills (~3.4k), ang ponytail ruleset (~1.4k), at ang superpowers bootstrap (~1k) ay ipinapadala **bawat turn**, hindi lang kapag tinawag ang isang skill

---

## 2. Tingnan kung aling tools talaga ang tinatawag ng agent

Iniimbak ng OpenCode ang bawat tool call ng bawat session sa sarili nitong database (`~/.local/share/opencode/opencode.db`) — binabasa ito ng [`session-report.mjs`](../scripts/session-report.mjs) nang read-only at ibinubuod.

```bash
node scripts/session-report.mjs usage --since 2026-09-01
```

![What the agent actually called](../assets/tuning/2-tool-usage.png)

Kumpara sa [[architecture]], bawat layer:

| Layer | Ayon sa disenyo | Ang talagang nangyari |
| --- | --- | --- |
| KNOWLEDGE | graft, graft-deep, context7, memory, open-design | **graft 25 tawag laban sa 486 na whole-file `read`** · memory 1 tawag (hindi nagawa ang `memory.jsonl`) · open-design 1 tawag |
| REASONING | brainstorming, grilling, writing-plans | ✅ regular na ginagamit ang brainstorming at writing-plans · tinawag ang grilling bilang hiwalay na skill nang dalawang beses lang — ayon sa rule sa AGENTS.md, dapat itong tumakbo bilang question format sa loob ng brainstorming, na hindi binibilang bilang skill call (hindi pa nasusuri kung laging nagagamit ang format na iyon) |
| EXECUTION | ponytail, playwright, chrome-devtools | ✅ chrome-devtools 541 tawag · **playwright 33 tawag** — parehong trabaho ng chrome-devtools |
| GOVERNANCE | verification, sonarqube, trivy | ginamit ang sonarqube sa 1–6 session · **trivy 0 tawag** |

---

## 3. Bakit paulit-ulit binabasa ang files

Ang mataas na bilang ng `read` ay hindi laging nangangahulugang "hindi gumagamit ng graft" — kailangan ng OpenCode ng `read` bago ang `edit` kahit papaano. Kaya ang tinitingnan dito ay ang **paulit-ulit** na pagbasa ng parehong file, at kung ano ang nangyari mula sa nakaraang pagbasa.

```bash
node scripts/session-report.mjs rereads --since 2026-09-01
```

![Why files were read again](../assets/tuning/3-rereads.png)

**260 sa 341 re-read (76%) ay agad pagkatapos ng compaction** — ang karaniwang session ay nagko-compact nang 4–10 beses, hindi itinatago ng compaction summary ang laman ng files, kaya binabasa ulit ng agent ang buong file (isang session ay nag-re-read nang 162 beses pagkatapos ng compactions; ~221k tokens ang kabuuang re-read output nito). Ang ugat na sanhi ay **masyadong madalas na compaction**, hindi ang graft.

---

## 4. End-to-end test sa isang kopya ng project

Humingi ng tunay na feature, gaya ng halimbawa sa [[USER-MANUAL]] seksyon 3, at tingnan kung sinusunod ng agent ang 9 na hakbang — **laging sa kopya**, hindi kailanman sa tunay na project.

```bash
git clone ~/code/my-project ~/tmp/my-project-e2e
cp ~/code/my-project/AGENTS.md ~/code/my-project/opencode.json ~/tmp/my-project-e2e/   # ang mga file na hindi pa naka-commit ay kailangang kopyahin nang manu-mano
cd ~/tmp/my-project-e2e && graft build

opencode run --title e2e-pause "please add a pause feature to the game: pressing P (or Esc) pauses and resumes gameplay"
node /path/to/scripts/session-report.mjs session e2e-pause   # suriin ang turn 1

# sumagot / mag-approve sa parehong session
opencode run -s <session-id> "go ahead"
```

> [!note] Walang `question` tool ang `opencode run`
> Sa headless mode, hindi ibinibigay ng OpenCode ang `question` tool sa model (makikita sa request na nakuha sa seksyon 1), kaya nagtatanong ang brainstorming sa plain text at tinatapos ang turn — magpatuloy gamit ang `opencode run -s <id>` nang walang nabibitin. Hanapin ang session id gamit ang `opencode session list`.

![End-to-end test](../assets/tuning/4-e2e-test.png)

Ang nangyari:
- ✅ Laging unang tinatawag ang `brainstorming`, at nakakuha ang maliit na task ng makitid na disenyo (1 file, ~10 linya) — gumagana ang ponytail
- ✅ Tumakbo ang lahat ng kasalukuyang tests, at na-verify ang P/Esc sa tunay na Chrome gamit ang chrome-devtools
- ❌→✅ **Hindi kailanman tinawag ang graft** — kahit nag-inject na ang graft-deep ng hint na "use graft first". Ugat na sanhi: ang unang hakbang ng `brainstorming` ay *"Explore project context — check files, docs, recent commits"*, at sinunod ng model ang skill (nag-`git log`, nag-`read` ng mga folder isa-isa) sa halip na ang AGENTS.md — parehong uri ng banggaan na nilulutas ng grilling reconciliation rule sa [[plugins]]. Inayos gamit ang bagong rule sa global AGENTS.md (seksyon 5), saka inulit ang parehong request: graft 0 → 2 tawag, `read` 7 → 2 (ang file lang na ie-edit)
- ⚠️ **Walang commit** sa dulo (hakbang 9) — wala pang rule na pumipilit dito, dahil magko-commit ang agent nang kusa sa bawat project
- ⚠️ **Mabagal ang browser verification** — 32 minuto ang implementation turn, 37 sa 60 tool calls nito ay chrome-devtools (karamihan `evaluate_script`), at bawat step ay muling nagpapadala ng lumalaking prompt (hanggang ~81k tokens) para iproseso ulit ng lokal na model

> [!tip] May tunay na bug na lumabas
> Habang nagte-test, natuklasan ng agent na nagka-crash ang menu ng sample game pagbukas (tumatawag pa ang scenes ng lumang API name pagkatapos ng isang refactor) — nakakahuli rin ng mga problemang hindi saklaw ng sariling tests ng code ang paminsan-minsang end-to-end run.

---

## 5. Ang binago (ang config na ginagamit pagkatapos ng testing)

> [!tip] Ang huling resulta ay nasa mga tunay na file sa ilalim ng [`config/`](../config/README.md)
> [`config/opencode.jsonc`](../config/opencode.jsonc) (template na kasama na ang lahat sa ibaba) at [`config/AGENTS.md`](../config/AGENTS.md) (lahat ng rule) — ipinapaliwanag ng mga subsection sa ibaba ang dahilan ng bawat bahagi.

### 5.1 Naka-off by default ang bihirang gamiting MCP servers, naka-on per project

Sa `~/.config/opencode/opencode.jsonc`:

```jsonc
"open-design": {
  "type": "local",
  "command": ["od", "mcp"],
  "timeout": 30000,
  "enabled": false        // ~6.6k tokens/turn, kailangan lang kapag kumukuha ng trabaho mula sa OpenDesign
},
"playwright": {
  "type": "local",
  "command": ["npx", "-y", "@playwright/mcp@latest"],
  "timeout": 30000,
  "enabled": false        // kapareho ng chrome-devtools; tumatakbo pa rin ang e2e suites gamit ang `npx playwright test` via bash
}
```

I-on para sa isang project lang sa `<project>/opencode.json` (mine-merge sa global config — ang binagong field lang ang kailangan):

```jsonc
{ "mcp": { "open-design": { "enabled": true } } }
```

### 5.2 I-on ang `compaction.prune`

```jsonc
"compaction": { "auto": true, "prune": true }
```

Ang `prune` (naka-off by default) ay tumatakbo sa dulo ng bawat prompt: tinatanggal nito ang tool outputs na mas luma sa huling 2 turn, laging iniiwan ang pinakabagong ~40k tokens, at kumikilos lang kapag higit sa ~20k tokens ang matatanggal (sinuri sa source ng OpenCode 1.18.34). Ang pag-prune nang malalaki at madalang ay pumipigil na ma-invalidate ang prompt cache ng llama.cpp bawat turn, habang pinadadalang ang buong compaction.

### 5.3 Apat na bagong rule sa global AGENTS.md

Idinagdag pagkatapos ng kasalukuyang grill-me rule ([[plugins]]) sa `~/.config/opencode/AGENTS.md` — nakasulat sa English dahil instructions ito para sa model (~610 tokens nang magkakasama). Idinagdag ang "Verifying UI changes" nang mas huli, dahil sa resulta sa seksyon 8:

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

> [!important] Dapat tugma ang tool names sa talagang nakikita ng model
> Pinapangalanan ng OpenCode ang MCP tools bilang `<server>_<tool>`, kaya ang sa graft ay nagiging `graft_graft_find_code` at iba pa. Tingnan ang tunay na mga pangalan sa request na nakuha sa seksyon 1 bago sumulat ng rule na bumabanggit ng tool.

Ang memory rule, sinubukan sa tunay na model: sa session 1 sinabing "remember …" → tinawag ng agent ang `memory_search_nodes`, saka ang `memory_create_entities` na may petsa · nagtanong pabalik ang bagong session → tinawag ng agent ang `memory_search_nodes` hanggang nahanap ang fact at sumagot nang tama.

### 5.4 Panatilihing labas ang skills ng ibang tools — `OPENCODE_DISABLE_EXTERNAL_SKILLS=1`

Kusa ring naglo-load ang OpenCode ng skills mula sa `~/.claude/skills` (Claude Code) at `~/.agents/skills` — sa makinang may ilang AI tools, lumaki ang listahan ng skills mula 25 hanggang 86 (lahat ay ipinapadala bawat turn, at mas madaling magkamali ng pili ang maliit na model). Mag-set ng user-level env var:

```powershell
[Environment]::SetEnvironmentVariable('OPENCODE_DISABLE_EXTERNAL_SKILLS','1','User')   # Windows
```

```bash
export OPENCODE_DISABLE_EXTERNAL_SKILLS=1   # macOS/Linux — ilagay sa shell profile
```

Tiyakin gamit ang `opencode debug skill` — ang skills lang mula sa superpowers, ponytail, i-have-adhd, grill-me/grilling, at ang sariling `customize-opencode` ng OpenCode ang dapat matira. Kung bakit hindi `OPENCODE_DISABLE_CLAUDE_CODE_SKILLS`: tingnan ang [[gotchas]] item 15.

### 5.5 context7 — ipadala ang API key bilang header mula sa env var

Kung may context7 key ka (opsyonal — gumagana kahit wala, may rate limit lang), huwag isulat ang key sa config:

```jsonc
"context7": {
  "type": "remote",
  "url": "https://mcp.context7.com/mcp",
  "headers": { "CONTEXT7_API_KEY": "{env:CONTEXT7_API_KEY}" },
  "enabled": true
}
```

---

## 6. Hindi pa naaayos / susubaybayan pa

- **Ang epekto ng `prune` + ng re-read rule** — masyadong maikli ang test sessions para mag-compact. Patakbuhin ulit ang `session-report.mjs rereads` pagkatapos ng ilang tunay na paggamit at ikumpara ang bahaging "after a compaction" sa orihinal na 76%
- **Ang commit step** — para tumugma sa [[USER-MANUAL]] hakbang 9, magdagdag ng AGENTS.md rule na gumawa ng isang scoped commit pagkatapos pumasa ang verification (walang push) — ikaw ang magpapasya kung gusto mong kusang mag-commit ang agent
- **Browser verification** — 37–40 tawag / 33–36 minuto para sa isang maliit na feature. Hindi nakatulong ang token-efficiency rule set (seksyon 8) — iyan ang gastos ng check mismo sa lokal na model; wala pang nasubukang paraan para bawasan ito
- **Hindi kailanman tinawag ang trivy** — naka-enable pa rin ayon sa [[architecture]] (~1.7k tokens/turn). Kung 0 pa rin sa muling pagsukat, isaalang-alang na i-off ito at hayaang patakbuhin ng agent ang `trivy fs .` via bash, o ilagay sa CI ayon sa [[sdlc]]

---

## 7. Mga tool na sinubukan at hindi itinuloy (at bakit)

| Tool | Ginagawa | Resulta | Bakit hindi itinuloy |
| --- | --- | --- | --- |
| [Langfuse](https://github.com/langfuse/langfuse) self-hosted + [opencode-observability-plugin](https://github.com/langfuse/opencode-observability-plugin) | buong trace ng bawat turn: prompt, generation, tool calls, reasoning, tokens | ✅ gumagana — pumasok ang traces sa lokal na Langfuse | iniimbak ang buong laman kasama ang tool output (mga file na binasa ng agent); 6 na Docker container, ~2.6 GB RAM — inalis ayon sa kagustuhan |
| [opencode-observability](https://github.com/abekdwight/opencode-observability) | dashboard/monitor sa `127.0.0.1`, binabasa ang `opencode.db` | ✅ gumagana | Japanese ang ilang bahagi ng UI |
| [token-optimizer](https://github.com/alexgreensh/token-optimizer) | quality score, compaction guidance, session continuity | sinuri mula sa source, hindi in-install | **walang** tool-output compression ang OpenCode plugin (galing sa Claude Code ang savings sa README nito); nagsisimula ang automatic nudges sa ≥ 25% context fill, na nalalampasan ng setup na ito mula turn 1; PolyForm Noncommercial license |
| [benjamin-plus](https://github.com/JetBrains/benjamin-plus-skill) (JetBrains) | ~880 tokens ng rules: isang-pasadang recon, keyhole reads, madalang na poll, "tapos = pumasa ang check" | in-install via `instructions` at sinukat (seksyon 8) | walang bawas sa oras o tool calls kapag ginawa ang bawat hakbang, at pinalaktaw nito sa agent ang browser check ([[gotchas]] item 19) — inalis |
| proxy ng [caveman](https://github.com/JuliusBrussee/caveman) | pinapaliit ang tool output bago umabot sa model | sinuri mula sa source, hindi in-install | nira-wrap ang OpenCode para lang sa `openai`/`anthropic` providers — hindi dumadaan dito ang self-hosted provider; naka-on ang telemetry by default (ginagamit ang **skill** ng caveman — [[plugins]]) |
| [token-diet](https://github.com/Kulaxyz/token-diet) | isang pinagsamang rule set: maikling sagot + YAGNI + keyhole reads + limit sa tests | sinuri mula sa README, hindi in-install | sabay na kapareho ng caveman, ponytail, at ng AGENTS.md rules; salungat sa TDD ng superpowers ang rule nitong "≤ 10 tests bawat session"; walang installer para sa OpenCode |

> [!warning] Kung ikaw mismo ang magse-self-host ng Langfuse
> - Mina-map ng opisyal na compose ang ClickHouse sa host port `9000` — banggaan ito sa SonarQube sa `9000`. Alisin ang hindi kailangang ports sa isang `docker-compose.override.yml` (`ports: !reset []`) sa halip na i-edit ang opisyal na file
> - `true` ang default ng `TELEMETRY_ENABLED` — i-off ito kung gusto mo ng tunay na self-hosted setup
> - Wala nang `/api/public/traces` ang Langfuse v4 (events-only) — gamitin ang `/api/public/v2/observations`
> - Ginagamit lang ng plugin ang `LANGFUSE_*` env vars sa halip na ang cloud kapag **parehong** naka-set ang public at secret key

> [!tip] Pamantayan sa pagdagdag ng tool
> Bago mag-install ng bago, itanong ang dalawang bagay: (1) saang layer ng [[architecture]] ito, at may kapareho na ba? (2) ano ang inilalagay nito sa prompt bawat turn? — sukatin gamit ang seksyon 1 bago at pagkatapos mag-install.

---

## 8. Pagsubok sa Caveman + benjamin-plus (2026-10-03) — halimbawa ng pagsukat bago magpasya

Dalawang "token efficiency" add-on ang sabay na idinagdag at sinukat gamit ang mga paraan sa pahinang ito: ang **[caveman](https://github.com/JuliusBrussee/caveman)** skill (maikling sagot — kapalit ng i-have-adhd) at ang **[benjamin-plus](https://github.com/JetBrains/benjamin-plus-skill)** (5 rule tungkol sa pag-explore / pagbasa / pag-poll, ini-inject sa pamamagitan ng `"instructions"`). Ang test task ay ang nasa seksyon 4 (magdagdag ng pause feature) sa isang kopya ng sample game, isang run bawat configuration.

| | Bago | Parehong idinagdag | Pareho + ang rule na "Verifying UI changes" |
| --- | --- | --- | --- |
| Prompt bawat turn | ~32.6k | ~34.8k (+2.1k) | ~34.9k |
| Turn 1 (explore + disenyo): oras / output tokens | 6.0 min / 3,541 | 7.5 min / 5,379 | 8.3 min / 6,133 |
| Turn 1: graft / read | 2 / 2 | 4 / 1 | 3 / 5 |
| Turn 2 (implement + verify): oras | 32.6 min | **6.0 min** | 36.1 min |
| Turn 2: output tokens | 25,308 | **4,051** | 28,031 |
| Turn 2: tool calls / chrome-devtools | 60 / 37 | **10 / 0** | 66 / 40 |
| Browser check + nahanap ang sirang-menu na bug | ✅ | ❌ nilaktawan | ✅ |
| 5 test suites | pasado | pasado | pasado |

Ang sinasabi ng mga numero:

- **Pinakamaganda ang hitsura ng gitnang column, pero mabilis ito dahil may nilaktawang trabaho** — huminto ang agent nang pumasa ang tests at hindi kailanman binuksan ang browser, ayon sa "tapos = pumasa ang sariling check ng task" ng benjamin-plus, kaya hindi nito nakita ang bug na nahanap ng unang run ([[gotchas]] item 19)
- **Kapag ipinatupad ang bawat hakbang (kanang column), bumalik ang gastos sa simula** — malapit sa unang run ang oras, output, at chrome-devtools calls, kaya walang isa man sa dalawang add-on ang nagpamura sa parehong trabaho
- **Hindi bumuti ang turn 1** — mas mahabang oras at mas maraming output, at mas mabigat na prompt bawat turn (caveman ~1.2k, benjamin-plus ~0.9k)
- **Mas maikli at mas madaling basahin ang huling sagot** (~9%) — ang nag-iisang epektong nakita mula sa caveman, tugma sa nasukat ng JetBrains (−8.5% output sa coding work)

**Desisyon:** panatilihin ang caveman (istilo ng sagot + `/caveman-commit` / `/caveman-review`, tinatanggap ang ~1.2k tokens/turn) · alisin ang benjamin-plus · panatilihin ang rule na "Verifying UI changes" at ang `--isolated` ng chrome-devtools

> [!warning] Mga limitasyon ng pagsukat na ito
> Isang run bawat configuration, at malaki ang pagbabago ng model sa pagitan ng mga run (5.7 at 7.5 minuto ang nasukat sa turn 1 ng parehong configuration sa dalawang run) — sinusuportahan nito ang "walang nakikitang improvement", hindi ang "mas lumala". Kailangan ng ilang run bawat configuration para sa tiyak na hatol.

> [!tip] Mga aral tungkol sa pagsukat
> 1. Laging sukatin ang **pagkakasunod ng tool calls** kasama ng oras (`session-report.mjs session <title>`) — ang di-pangkaraniwang mabilis na run ay kadalasang nangangahulugang may nawalang hakbang
> 2. Tingnan ang `finish` value ng huling step — isang run ang natapos sa `tool-calls` (hindi `stop`) dahil bumangga ang Chrome profile sa ibang tool ([[gotchas]] item 17), kaya natapos ang run sa gitna ng task at hindi magamit ang mga numero nito
> 3. Huwag gumamit ng chrome-devtools mula sa ibang tool sa parehong makina habang may tumatakbong test run, maliban kung naka-set ang `--isolated`
