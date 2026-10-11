---
tags: [project-doc, tuning, opencode, measurement, reference]
updated: 2026-10-11
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
>
> **OpenCode 2 (2026-10-11):** bumaba sa **~14.2k** tokens ang prompt bawat turn (Code Mode), at kinailangang gawing muli ang plugins, skill filter, compaction at AGENTS.md rules. Sinukat ulit sa **section 9**.

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
# OpenCode 2: idagdag ang --standalone, kung hindi ay mapupunta ang request sa background service, na hindi nakakakita ng variable
cd my-project
OPENCODE_CONFIG_CONTENT='{"provider":{"capture":{"npm":"@ai-sdk/openai-compatible","options":{"baseURL":"http://127.0.0.1:18555/v1"},"models":{"fake":{"limit":{"context":131072,"output":32768}}}}}}' \
  opencode run --standalone -m capture/fake "Reply with exactly the word: ok"

# hatiin sa mga bucket
node scripts/analyze-prompt.mjs ./capture/req-02.json
```

Sa PowerShell, ganito i-set ang variable: `$env:OPENCODE_CONFIG_CONTENT='{...}'; opencode run -m capture/fake "..."`

> [!note] Aling file ang pangunahing prompt
> Sa OpenCode 1, dalawang file ang makukuha — ang maliit (`req-01`) ay ang request para sa session title; ang malaki (`req-02`) ay ang prompt na talagang natatanggap ng model sa unang turn. Sa OpenCode 2, isang file lang ang nalikha ng maikling `run`: ang pangunahing prompt.

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

### 5.2 I-on ang `compaction.prune` (OpenCode 1 — sa OpenCode 2 tignan ang section 9)

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

### 5.4 Panatilihing labas ang skills ng ibang tools — `OPENCODE_DISABLE_EXTERNAL_SKILLS=1` (OpenCode 1 — sa OpenCode 2 tignan ang section 9)

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
- **Browser verification** — 37–40 tawag / 33–36 minuto para sa maliit na feature sa OpenCode 1. Hindi nakatulong ang token-efficiency rule set (seksyon 8). Sa OpenCode 2, 15 minuto lahat-lahat ang parehong feature (section 9), at bahagi ng oras na iyon ay napunta sa pagsulat ng pansamantalang web server, na pinapalitan na ngayon ng UI rule ng `npx http-server`
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

---

## 9. OpenCode 2 — ang nagbago at ang muling sinukat (2026-10-11)

Ang pag-upgrade mula OpenCode 1.18.34 papuntang **2.0.26** (sabay na lumipat ang superpowers sa 7.0.0) ay nakasira ng ilang bahagi ng setup na ito nang walang lumalabas na error. Sinuri ang bawat ayos sa ibaba laban sa tunay na config ng makinang ito. Nasa [[updating]] ang mga hakbang sa pag-upgrade, at may gotcha ang bawat problema.

### 9.1 Ang nasira, at ang ayos

| Bahagi | Sa OpenCode 2 | Ayos | Gotcha |
| --- | --- | --- | --- |
| graft-deep, caveman | hindi tumatakbo ang V1 plugins | V2 plugin (`config/plugin/graft-deep.js`), `scripts/port-caveman-opencode2.mjs` | 20 |
| `plugin` array | tinatanggihan ang file path, tahimik na nilalaktawan ang `plugins/caveman` folder | packages lang; mga lokal na plugin bilang `.js` files sa `~/.config/opencode/plugin/` | 21 |
| Skills ng ibang tools | binabalewala ang `OPENCODE_DISABLE_EXTERNAL_SKILLS` — 90 skills ang inaalok | `permissions` allow-list → 27 | 15 |
| `compaction.prune` | binabalewala | `keep.tokens: 24000` + `buffer: 32768` (sa ibaba) | — |
| Per-project MCP | binabalewala ang `{ "enabled": true }` | kopyahin ang buong entry | 22 |
| Mga pangalan ng tool sa AGENTS.md | tinatawag ang MCP tools sa loob ng `execute` | `tools.graft.graft_find_code` atbp. | — |
| `brainstorming` (superpowers 7) | diretsong napupunta sa code ang "malinaw" na request | rule na "Approval before building" | 23 |
| Engine ng OpenDesign | tinatanggihan ang mga 1.x flag | ibang engine hangga't hindi naaayos ng upstream | 24 |
| Background service | nananatili ang mga session at ang browser pagkatapos ng `opencode run` | `session.interrupt`; UI rule: sariling page, dalhin sa harap, isara | 26 |

### 9.2 Prompt bawat turn: ~34.0k → ~14.6k tokens

Sinukat gamit ang `capture-server.mjs` + `analyze-prompt.mjs` (section 1, may `--standalone`), parehong 6 na MCP server ang naka-enable, huling config:

| Bahagi | ~tokens |
| --- | --- |
| built-in tools (12, kasama ang `execute`, `shell`, `subagent`) | 3,349 |
| MCP catalog (Code Mode) | 2,493 |
| listahan ng skill (27 skills) | 2,331 |
| AGENTS.md — project (block ng graft) | 1,989 |
| AGENTS.md — global (6 na seksyon) | 1,533 |
| superpowers bootstrap | 1,216 |
| base prompt ng OpenCode + `<env>` | 1,212 |
| mga instruction ng MCP server (graft, context7) | 520 |
| **Kabuuan** | **~14.6k** |

Galing ang pagbaba sa **Code Mode**: sa halip na 70+ MCP tool definitions, isang `execute` tool at maikling catalog ang natatanggap ng model (ilang tool bawat server; hinahanap nito ang iba gamit ang `search(...)`). Mas maliit na ang epekto ng pag-off ng MCP servers para makatipid ng prompt (section 5.1) — ilang linya lang sa catalog ang dagdag ng bawat naka-enable na server. Panatilihin pa ring naka-off ang bihirang gamitin: proseso ang bawat isa na kailangang simulan, at ~14 s ang sonarqube sa Docker.

### 9.3 Compaction sa OpenCode 2

```jsonc
"compaction": { "auto": true, "keep": { "tokens": 24000 }, "buffer": 32768 }
```

- **`keep.tokens`** — ang kamakailang usapan na itinatabi sa tabi ng summary (default 15000). Mas maraming file na kababasa lang ng agent ang naitatabi ng 24000, na siyang trabaho ng `prune` + re-read rule sa OpenCode 1. Hindi pa nasusukat sa mahabang session.
- **`buffer`** — mga token na iniiwang bakante sa ilalim ng limit ng model (default 10% ≈ 13k). Tumatakbo ang model server na may `ctx-size 131072` at puwedeng sumagot ang model nang hanggang 32768 tokens, kaya itinakda ang buffer sa isang buong sagot: nagsisimula ang compaction malapit sa ~98k sa halip na hayaang umapaw sa context ng server ang prompt + sagot. Kung tumatakbo ang llama.cpp na may `--parallel N`, `131072 / N` lang ang nakukuha ng bawat slot — ibaba ang `limit.context` ng model para tumugma.

### 9.4 End-to-end test, parehong request gaya ng section 4

`please add a pause feature to the game: pressing P (or Esc) pauses and resumes gameplay`, sa bagong kopya ng sample game, self-hosted Qwen3.8 27B.

| Run | Mga rule na idinagdag sa global AGENTS.md | Turn 1 (disenyo) | Pagbuo + browser check | Resulta |
| --- | --- | --- | --- | --- |
| 1 | mga rule ng OpenCode 1, na-update ang mga pangalan ng tool | walang disenyo — diretso sa code | 15 min lahat-lahat, 66 tool calls (23 chrome-devtools) | ✅ nabuo at na-verify; nakita ng browser check ang baligtad na "PAUSED" overlay |
| 2 | + "Approval before building" | 18+ min sa pagbabasa ng minified source ng Phaser — pinahinto nang manu-mano | — | ❌ naging pananaliksik ang turn ng disenyo |
| 3 | + "disenyo mula sa sariling code ng project", `npx http-server` | ✅ 6 min, 10 tool calls, 1-file na disenyo + isang tanong, walang edit | 22+ min, 60 tool calls (46 chrome-devtools) sa mga page na iniwang bukas ng run 1 — pinahinto nang manu-mano | ⚠️ tapos ang code, pasado ang tests, umikot ang browser check |
| 4 | + "sariling page, dalhin sa harap, isara, huminto pagkatapos ng 2–3 check" (bagong service) | ✅ 6 min, 13 tool calls, disenyo, walang edit | 11 min, saka 8 min na nakabitin sa `execute` script na hindi nag-resolve ang promise — in-interrupt; pagkatapos ng "continue": 16 min, 61 tool calls (56 chrome-devtools), na-verify ang P at Esc, malinis ang console, isinara ang page | ✅ nabuo at na-verify, 1 file, 5/5 test files pasado |

Ang sinasabi ng mga numero:

- **Gumagana ulit ang approval step.** Sa huling mga rule, ang turn 1 ay nag-e-explore lang ng sariling code ng project (graft + 5–6 na file), nagpapakita ng maikling disenyo (mga file, behavior, ang iiwan, isang tanong) at walang binabago — mga 6 na minuto.
- **Sa run 4, hindi na-load ang `brainstorming`** — ang AGENTS.md rule lang ang gumawa ng disenyo. Nilalaktawan ng superpowers 7 ang sarili nitong proseso para sa request na itinuturing nitong malinaw; ang rule ang nagpapanatili ng approval step.
- **Ang browser check pa rin ang pinakamahal na bahagi:** 23–56 chrome-devtools calls bawat run sa model na ito, at madalas itong magpatuloy sa pagsubok lampas sa isang interaction na hinihingi ng rule. Dalawa sa apat na run ang tinamaan ng OpenCode 2 trap sa hakbang na ito — mga page na iniwang bukas ng naunang session, at Code Mode script na hindi nag-resolve ([[gotchas]] item 26). Pareho na itong AGENTS.md rules; idinagdag ang pangalawa pagkatapos ng run 4 at hindi pa nasusubukan ulit sa buong run.
- **Ang model ang bottleneck:** ilang minuto nag-iisip ang lokal na 27B model sa pagitan ng mga tool call. Maglaan ng ~30 minuto para sa maliit na feature mula simula hanggang tapos.

> [!warning] Hindi napapahinto ng pagpapahinto sa headless run ang session
> Sa OpenCode 2, client lang ng background service ang `opencode run`: ang pag-kill dito (Ctrl+C, timeout) ay nag-iiwan sa session na tumatakbo. Ihinto ito gamit ang `Esc` sa TUI, o ang `opencode api session.interrupt --param sessionID=<id>` (hanapin ang id gamit ang `opencode session list`).

### 9.5 Pagsukat sa OpenCode 2

- Binabasa na ngayon ng `session-report.mjs` ang mga session ng OpenCode 1 (`session`/`part`) at OpenCode 2 (`session_v2`/`session_message`). Sa OpenCode 2, nangyayari ang bawat tawag sa MCP sa loob ng `execute` script; hinahati ulit ng report ang mga script na iyon pabalik sa mga tawag na `<server>_<tool>`, kaya maihahambing pa rin ang paggamit ng graft at chrome-devtools sa mga lumang resulta.
- Binibilang ng `analyze-prompt.mjs` ang `shell`/`subagent`/`execute` bilang built-in tools at iniuulat ang Code Mode catalog bilang hiwalay na bahagi.
- Para sa capture method, idagdag ang `--standalone` (section 1).
