---
tags: [user-manual, getting-started, opencode, vibe-coding]
updated: 2026-10-03
summary: Gabay sa paggamit ng OpenCode mula simula hanggang tapos (magbukas ng session, mag-request, mag-approve, suriin, commit) at araw-araw — vibe coding, ang graft workflow, grill-me/grilling, at ang OpenDesign workflow
---

# 📘 Gabay sa Paggamit ng OpenCode para sa Vibe Coding

> Tapos na sa setup? Tignan [[setup]] · Detalye ng MCP/Plugin sa [[mcp-servers]] at [[plugins]] · Karaniwang problema sa [[gotchas]] · Pag-update/pag-upgrade sa [[updating]]

---

## 📋 Talaan ng Nilalaman

- **⭐ Mula simula hanggang tapos** — basahin muna ito: ano ang ginagawa nang isang beses, at paano sinisimulan, pinag-uusapan, ina-approve, sinusuri, at tinatapos ang bawat trabaho
- Pangkalahatang-ideya — architecture ng setup na ito + ang project-level at agent-level na workflow cycles
- Pagsisimula ng bagong project — 6-hakbang na checklist
- Pangkalahatang vibe coding gamit ang opencode — kasama ang buong halimbawa (isang tunay na request hanggang sa commit) at paano gamitin ang grill-me/grilling
- Paggamit ng graft para mas mabilis maintindihan ang code — may tunay na halimbawa ng output na dapat makilala
- Paggawa ng website gamit ang OpenDesign (pagkatapos ay ikakabit sa opencode)
- Pagpili ng tamang model para sa trabaho
- Karaniwang mga problema

> [!tip] Mga baguhan, magbasa sa pagkakasunod-sunod na ito
> **⭐ Mula simula hanggang tapos** (nasa ibaba — ano ang gagawin, at kailan) → seksyon 2 (sundin ang tunay na checklist sa unang project mo) → seksyon 3 (subukan ang aktwal na request gamit ang halimbawa). Ang seksyon 1 at 4–7 ay reference lang — buksan ito kapag talagang kailangan.

---

## ⭐ Mula simula hanggang tapos

Tapos na ang setup ayon sa [[setup]] — isang tanong ang sinasagot ng seksyong ito: **umupo ka sa harap ng makina; ano ang gagawin mo, sa anong pagkakasunod, hanggang matapos ang trabaho?** May tatlong antas, na magkakaiba ang dalas:

| Kailan | Ano | Tagal |
| --- | --- | --- |
| **A. Isang beses bawat makina** | Tiyaking handa ang setup | ~2 min |
| **B. Isang beses bawat project** | Buuin ang graft index + ang AGENTS.md ng project | ~5 min (seksyon 2) |
| **C. Bawat trabaho** | Ang 7-hakbang na loop: buksan → mag-request → mag-approve → gumagawa ang agent → suriin → commit → isara | depende sa trabaho |

```mermaid
graph TD
    S["Tapos ang setup (setup)"] --> A["A. Suriin ang makina<br/>isang beses"]
    A --> B["B. Ihanda ang project<br/>isang beses bawat repo (seksyon 2)"]
    B --> C1["1. Magbukas ng session<br/>opencode / opencode -c"]
    C1 --> C2["2. Mag-request sa plain language"]
    C2 --> K{"Anong uri ng trabaho?"}
    K -->|tanong / maliit na ayos| C4
    K -->|bagong feature / bug / malaking trabaho| C3["3. Sagutin ang mga tanong + i-approve ang disenyo<br/>(wala pang code na isinusulat)"]
    C3 --> C4["4. Gumagawa ang agent<br/>edit → tests → browser check"]
    C4 --> C5{"5. Suriin mo ang resulta<br/>buod + git diff"}
    C5 -->|hindi pa tama| C2
    C5 -->|ayos| C6["6. Commit<br/>(hindi kusang nagko-commit ang agent)"]
    C6 --> C7["7. Isara ang trabaho<br/>/new para sa susunod"]
    C7 -->|susunod na trabaho| C2
```

### A. Isang beses bawat makina — tiyaking handa ang setup

Magbukas ng **bagong** terminal (hindi nakikita sa lumang terminal ang mga env var na kaka-set lang — [[gotchas]] item 2) at patakbuhin:

```bash
opencode --version       # naka-install ang CLI
opencode mcp list        # dapat connected ang mga naka-enable na MCP server
opencode debug skill     # ang mga skill na nag-load
opencode run "say hi"    # sumasagot ang model
```

✅ **Dapat makita mo:**
- `mcp list`: `context7`, `chrome-devtools`, `graft`, `memory`, `sonarqube`, `trivy` bilang `connected` · `open-design`, `playwright`, `github`, `postgres`, `mysql` bilang `disabled` (normal — ino-on per project)
- `debug skill`: 27 na skills — 15 mula sa superpowers, 6 mula sa ponytail, 3 mula sa caveman, `grill-me`, `grilling`, `customize-opencode`. Kung higit pa rito nang marami, pumapasok ang skills ng ibang tool ([[gotchas]] item 15)
- `run "say hi"`: may sagot. Kung lampas 1–2 minuto, tingnan ang [[gotchas]] item 1

### B. Isang beses bawat project — ihanda ang repo

Sundin ang **seksyon 2** (6 na hakbang): `graft build` → `graft init --agents agents --no-global` → i-enable ang project-specific na MCP servers kung kailangan (database, `open-design`, `playwright`) → magtanong ng isang tanong na nangangailangan ng tunay na code reference. Kapag tapos na, hindi na uulitin para sa repo na iyon.

### C. Bawat trabaho — ang 7-hakbang na loop

**Hakbang 1 — Magbukas ng session**

```bash
cd my-project
git status          # dapat malinis, o nasa branch ng trabahong ito — para kita agad kung ano ang binago ng agent
opencode            # bagong session
opencode -c         # o: ituloy ang huling session
```

Sa loob ng TUI: `/sessions` para pumili ng lumang session · `/new` para magsimula ng bago · `/models` para magpalit ng model · `/help` para sa lahat ng command

> [!tip] Isang trabaho = isang session
> ~34k tokens na ng 131k context ang bigat ng base prompt ([[tuning]]) — laging `/new` para sa bagong trabaho. Ang session na sumasaklaw ng ilang task ay madalas mag-compact, at kailangang basahin ulit ng agent ang parehong files.

**Hakbang 2 — Mag-request sa plain language**

Sabihin **kung ano ang gusto mong kalabasan**, hindi kung paano gagawin at hindi kung aling tool ang gagamitin — pinipili ng agent ang daan batay sa uri ng request:

| Ganito ang ita-type mo | Ang gagawin ng agent | Ang kailangan mong gawin |
| --- | --- | --- |
| `paano gumagana ang pagkolekta ng ring` (tanong / paliwanag) | hahanapin ang code gamit ang graft at sasagot na may `file:line` | basahin — tapos na sa hakbang na ito |
| `ayusin ang typo sa menu screen` (maliit na ayos) | i-edit agad → patakbuhin ang tests | lumaktaw sa hakbang 5 |
| `pakidagdag ng pause feature sa game` (bagong feature) | tatawagin ang `brainstorming` → mag-e-explore gamit ang graft → magtatanong o magmumungkahi ng disenyo → **hihinto at maghihintay** | pumunta sa hakbang 3 |
| `nagfi-freeze ang game kapag tumalon` (bug) | tatawagin ang `systematic-debugging` — hahanapin muna ang sanhi bago ayusin | kumpirmahin ang sanhi, saka ipaayos |
| `ilipat ang level system sa zones` (malaki, maraming file) | susulat ng spec sa `docs/superpowers/specs/` + plano (`writing-plans`) | basahin ang spec, saka i-approve |
| `grill me about <ideya>` (hindi pa gagawin, pag-iisipan lang) | magtatanong nang paikot-ikot na `grilling` — walang spec, walang code | sagutin ang mga tanong |

**Hakbang 3 — Sagutin ang mga tanong at i-approve ang disenyo** (bagong feature / malaking trabaho lang)

**Hindi susulat ng code** ang agent hangga't hindi tapos ang hakbang na ito. Dalawa ang anyo nito:

- **Isang batch ng mga tanong** (`❓ Q1 … ➡️ rekomendasyon`) — sagutin nang maikli gamit ang mga opsyon, hal. `A B A` o `sundin lahat ng rekomendasyon`
- **Isang disenyo na nagtatapos sa "Approve?"** (kapag sapat na makitid ang trabaho) — sumagot ng `go ahead`, o sabihin ang gustong baguhin, hal. `hindi kailangan ng touch button`

Basahing mabuti ang disenyo rito — ito ang pinakamurang punto para baguhin ang direksyon, bago gumugol ang model ng maraming minuto sa paggawa.

**Hakbang 4 — Gumagawa ang agent** (maghintay ka lang)

Ang nangyayari, ayon sa pagkakasunod: sinusuri ng ponytail kung may magagamit nang umiiral bago sumulat ng bago → nag-e-edit na may todo list → nagpapatakbo ng tests → **para sa anumang makikita sa browser, binubuksan ang Chrome sa pamamagitan ng chrome-devtools at sinusuri nang isang beses** (isang rule sa global AGENTS.md — [[tuning]]) → nagbubuod.

- `Esc` para ihinto sa gitna · `/undo` para ibalik ang huling mensahe kasama ang mga binago nitong file (dapat git repo ang project) · `/redo` para ulitin
- **Ang browser check ang pinakamabagal na hakbang** — nasukat na ~30–36 minuto para sa maliit na feature sa lokal na model, pero ito ang hakbang na nakakahanap ng mga bug na hindi saklaw ng tests ([[tuning]] seksyon 4 at 8). Nilalaktawan ito ng trabahong walang UI
- Kung tahimik na huminto ang agent nang walang buod, kadalasang naabot ng model ang output ceiling nito ([[gotchas]] item 8) — i-type ang `continue`

**Hakbang 5 — Suriin ang resulta bago tanggapin**

Basahin ang pangwakas na buod ng agent — dapat sabihin nito kung aling files ang nabago, ang resulta ng tests, ang resulta ng browser check, at kung ano ang **sinadyang hindi ginawa**. Saka tingnan ang tunay:

```bash
git diff            # tugma ba sa buod? may file bang nagalaw na hindi dapat?
```

Gusto ng pangalawang opinyon? Hilingin sa parehong session:

| Command | Ang makukuha mo |
| --- | --- |
| `/caveman-review` | review ng diff, isang linya bawat finding, may severity |
| `/ponytail-review` | code sa diff na higit sa kailangan |
| `i-scan ang project na ito gamit ang sonarqube at trivy` | quality / vulnerability checks — para sa trabahong humahawak sa dependencies, auth, o data (**hindi** ito pinapatakbo ng agent sa bawat task) |

Hindi pa tama → sabihin kung ano ang aayusin sa parehong session (balik sa hakbang 2).

**Hakbang 6 — Commit**

**Hindi** kusang nagko-commit ang agent (nasubukan — natatapos ang trabaho na naiwan ang files sa working tree). Pumili ng isa:

```bash
git add -A
```

```
/caveman-commit          ← nagbibigay ng Conventional Commits message (hindi nito pinapatakbo ang git commit)
i-commit mo ito            ← o ipa-commit sa agent, saka suriin ang message
```

Ikaw ang mag-push kapag handa na — walang awtomatikong tumatakbo sa CI sa setup na ito ([[sdlc]]).

**Hakbang 7 — Isara ang trabaho**

- Susunod na trabaho → `/new` (o `/exit` at buksan ulit)
- May kagustuhan o desisyong gustong matandaan sa mga susunod na session → i-type ang `tandaan na <bagay>` — ise-save ito ng agent sa memory, at hahanapin muna ng susunod na session ang memory bago magtanong ulit
- Mahabang session na malapit na sa limit ng context pero hindi pa tapos ang trabaho → `/compact`
- Hindi mo kailangang i-rebuild ang graft — nire-refresh ng CLI ang graph bago ang bawat sagot

### Mga command na pinakamadalas gamitin

| Para | I-type |
| --- | --- |
| Magbukas ng bagong session / ituloy ang huli | `opencode` / `opencode -c` |
| Magsimula ng bagong trabaho sa parehong TUI | `/new` |
| Bumalik sa lumang session | `/sessions` |
| Ihinto ang agent / ibalik ang huling mensahe | `Esc` / `/undo` |
| Paliitin ang context ng mahabang session | `/compact` |
| Buong sagot, hindi pinaikli / bumalik sa maikli | `/caveman off` (o `normal mode`) / `/caveman` |
| Commit message / review ng diff | `/caveman-commit` / `/caveman-review` |
| Hinaan o lakasan ang ponytail | `/ponytail lite\|full\|ultra\|off` |
| Pag-isipan ang ideya nang hindi pa ginagawa | `grill me about <paksa>` |
| Patakbuhin nang hindi binubuksan ang TUI | `opencode run "<request>"`, saka `opencode run -c "<sagot>"` |

---

## 1. Pangkalahatang-ideya

```mermaid
graph LR
    A[OpenDesign App<br/>Studio - chat + live preview] -->|spawns as engine| B[OpenCode]
    B -->|MCP| C[context7 / playwright / chrome-devtools]
    B -->|MCP| D[graft - code graph]
    B -->|MCP| E[open-design - kumukuha ng files]
    B -->|plugin| F[superpowers - skills]
    B -->|plugin| G[graft-deep - inject context]
    B -->|plugin| L[ponytail - code minimization]
    B -->|plugin| M["caveman - terse output<br/>(kusang naka-on, /caveman off para ihinto)"]
    B -->|provider| H[home-llamacpp<br/>self-hosted model]
    E -.->|kumukuha ng generated files| I[tunay na project frontend+backend]
```

Dalawang pangunahing entry point:

1. **Direktang buksan ang opencode terminal** sa isang tunay na code project — para sa buong backend/full-stack development.
2. **Buksan ang OpenDesign app** — kapag gusto ng mabilis na web page/prototype na may live preview (tinatawag ng OpenDesign ang opencode bilang "makina" sa likod-tabing, hindi mo na kailangang mag-type sa isang opencode terminal mismo).

### Project-level na workflow cycle (macro)

Ang buong loop, mula sa brief hanggang sa deployment at pabalik ulit sa susunod na brief/improvement:

```mermaid
graph LR
    A["Brief<br/>ang gusto mo"] --> B["Design/prototype<br/>OpenDesign Studio"]
    B --> C["Ikabit sa tunay na project<br/>open-design MCP"]
    C --> D["Buuin ang backend/DB<br/>opencode + postgres/mysql MCP"]
    D --> E["Testing<br/>playwright / chrome-devtools MCP"]
    E --> Q["Suriin ang kalidad/seguridad<br/>sonarqube + trivy MCP (quality gate)"]
    Q --> F["Deploy"]
    F -->|bagong brief / improvement| A
```

Gamitin ito para makita kung saang mga tool dapat dumaan ang "isang piraso ng trabaho," ayon sa pagkakasunod-sunod — detalye ng bawat hakbang ay nasa seksyon 5 sa ibaba.

### Ang per-request na workflow cycle ng agent (micro)

Ano ang nangyayari sa likod-tabing sa loob ng bawat turn na nag-type ka ng command sa opencode (batay sa [[plugins]] at [[mcp-servers]]):

```mermaid
graph LR
    A["Nag-type ang user ng command"] --> B["graft-deep<br/>nag-i-inject ng relevant na context"]
    B --> C["superpowers<br/>pinipili ang tamang skill"]
    C --> D{"Kailangan ba ng extra na tool?"}
    D -->|maghanap ng docs| E["context7"]
    D -->|maintindihan ang structure ng code| F["graft"]
    D -->|testing/debug ng UI| G["playwright /<br/>chrome-devtools"]
    D -->|alalahanin ang lumang context| H["memory"]
    D -->|suriin ang quality/security| K["sonarqube /<br/>trivy"]
    E --> L["ponytail<br/>sinusuri ang decision ladder bago magsulat ng code"]
    F --> L
    G --> L
    H --> L
    K --> L
    L --> I["I-edit/sumulat ng code"]
    I -->|susunod na command| A
```

> [!note] Wala nang hiwalay na "auto-rebuild graph" na hakbang
> Dati ay may hook ang graft-deep na nag-rebuild ng graph mismo pagkatapos ng isang edit — tinanggal na ito, dahil ang kasalukuyang bersyon ng graft CLI ay awtomatiko nang nagre-refresh ng graph bago sumagot sa kahit anong tanong (verified — tignan [[plugins]], seksyong graft-deep). Walang hihintayin, kaya wala nang hiwalay na node para dito sa diagram na ito — trabaho na ng graft mismo ang kasariwaan ng graph, hindi na ng opencode.

> [!note] Hindi bawat turn dumadaan sa bawat hakbang
> Kung maikli/hindi related sa code ang command (hal. "ipaliwanag ang X sa akin"), may mga node na nilalaktawan — ipinapakita ng diagram na ito ang **lahat ng posibleng daan**, hindi ang aktwal na dinadaanan ng bawat turn.

> [!note] Plugin ponytail
> Ang ponytail plugin (tignan [[plugins]]) ang huling gate bago talagang magsulat ng code (node L) — pinipilit nitong lakarin ng agent ang decision ladder (huwag isulat kung hindi kailangan → gamitin ulit ang meron na → may standard library ba → isang native na feature → isang dependency na naka-install na → isang one-liner → saka lang magsulat ng minimal na bagong code). Gumagana ito kasama ng superpowers/graft-deep nang walang overlap (superpowers pumipili ng workflow, graft-deep naghahanap ng context, ponytail kumokontrol kung gaano karaming code ang isinusulat).

> [!note] Plugin caveman — sinasadyang wala sa per-turn cycle sa itaas
> Ang caveman (tignan [[plugins]]) ay binabago lang ang **istilo ng sagot** para maging maikli at diretso-sa-punto; hindi nito ginagalaw ang tool orchestration, kaya hindi ito node sa diagram. Kusa itong naka-on sa bawat session (kaiba sa i-have-adhd na pinalitan nito, na kailangang i-type para ma-on). Patayin gamit ang `/caveman off` o `normal mode` kapag gusto ng buong paliwanag. Ang code, commands, at error text ay laging nakasulat nang buo.

> [!note] Skill grill-me / grilling — hindi hiwalay na plugin, naka-wire sa node C
> Hindi ito hiwalay na node sa diagram, dahil isa itong skill (isang standalone `SKILL.md` file na sumusunod sa Agent Skills open standard — tignan [[setup]]), hindi plugin — pero gumagana ito sa parehong node C gaya ng superpowers: kapag pinili ng agent ang `brainstorming` para sa paggawa ng bagong feature, ginagamit nito ang batch question format ng `grilling` sa halip na magtanong isa-isa (o tinatawag ang `grilling` mismo kung gusto lang ng user na i-interview ang isang ideya, hindi ito agad i-implement). Tunay na paggamit nasa seksyon 3 sa ibaba; buong detalye ng pag-install/reconciliation nasa [[plugins]].

---

## 2. Pagsisimula ng bagong project — sundin ang mga hakbang na ito ayon sa pagkakasunod-sunod

Gawin ito isang beses bawat project (hindi na kailangang ulitin sa tuwing bubuksan ang opencode). Bawat hakbang ay may kasamang checkpoint — kung hindi kumilos ayon sa nakasaad ang isang hakbang, **huminto muna doon** bago magpatuloy; ang mga susunod na hakbang ay umaasa sa mga naunang hakbang.

**Hakbang 1 — pumunta sa folder ng project**

```bash
cd my-new-project
# kung wala pang folder/repo: mkdir my-new-project && cd my-new-project && git init
```

**Hakbang 2 — buuin ang context graph gamit ang graft** (laktawan ang hakbang na ito kung hindi naka-install ang graft — tignan [[mcp-servers]] muna kung hindi mo pa ito na-install)

```bash
graft build
```

✅ **Dapat makita mo:** `parsing 1/N: ...` na bumibilang hanggang `N/N`, natatapos nang walang errors — makakakuha ka ng bagong `graft/` folder sa project (awtomatikong idinagdag sa `.gitignore`, huwag i-commit)

```bash
graft init --agents agents --no-global
```

✅ **Dapat makita mo:** isang `AGENTS.md` file at `opencode.json` (may `mcp.graft`) na ginawa/na-edit sa root ng project — buksan ito para kumpirmahin na meron talagang `<!-- graft:start -->...<!-- graft:end -->` block

**Hakbang 3 — kumpirmahin na naka-wire ang graft sa opencode**

```bash
opencode mcp list
```

✅ **Dapat makita mo:** ang row na `graft` na may status na `connected`. Kung hindi, tignan muna [[gotchas]]. Normal na `disabled` ang `open-design` at `playwright` (naka-off by default para manatiling maliit ang prompt — i-on per project sa hakbang 4, tingnan ang [[tuning]]).

```bash
graft map
```

✅ **Dapat makita mo:** isang buod gaya ng `repo map — N files · N symbols · N edges · <pangunahing wika>` kasama ang dir clusters/hubs — kung gumana ang command na ito, handa na ang CLI mismo kahit hindi pa nagtagumpay ang koneksyon ng MCP (tumutulong ito para mahiwalay kung problema ito sa graft mismo o sa koneksyon ng MCP).

**Hakbang 4 — (kung kailangan lang) i-on ang isang project-specific na MCP**

Kung kailangan ng project na ito ng database, gumawa ng config na specific sa repo na iyon (hindi maaapektuhan ang ibang project):

```jsonc
// my-new-project/opencode.jsonc
{ "mcp": { "postgres": { "enabled": true } } }
```

Ganito rin para sa ibang servers na naka-off by default — `open-design` (kapag kumukuha ng trabaho mula sa OpenDesign, seksyon 5) at `playwright` (kung gusto mo ito sa halip na / kasabay ng chrome-devtools):

```jsonc
{ "mcp": { "open-design": { "enabled": true }, "playwright": { "enabled": true } } }
```

I-set ang env var **bago** buksan ang opencode sa tuwing gagamitin (i-set ito isang beses lang sa shell profile at hindi mo na kailangang i-type ito paulit-ulit):

```bash
export POSTGRES_CONNECTION_STRING="postgresql://user:pass@host/db"
```

**Hakbang 5 — buksan ang opencode sa unang pagkakataon sa project na ito**

```bash
opencode
```

Subukang magtanong ng isang bagay na kailangan ng tunay na reference sa code, hal. `ibuod ang structure ng project na ito` o `saang file matatagpuan ang entry point ng project na ito`.

✅ **Dapat makita mo:** isang sagot na tumutukoy sa tunay na pangalan ng file/function sa project (hindi isang pangkalahatang sagot na walang batayan) — kung oo, gumagana na ang graft/context nang tuluyan.

**Hakbang 6 — (inirerekumenda) kumpirmahin na na-load nang buo ang skills/plugins**

```bash
opencode debug skill
```

✅ **Dapat makita mo:** 15 skills ng `superpowers` (`brainstorming`, `systematic-debugging`, `writing-plans`, ...), 6 na skill ng `ponytail` (`ponytail`, `ponytail-review`, ...), `caveman`/`caveman-commit`/`caveman-review`, at `grill-me`/`grilling` kung naka-install — 27 lahat kasama ang sariling `customize-opencode` ng OpenCode (tignan [[plugins]] kung ano ang bawat isa).

> [!tip] Natapos ang lahat ng 6 hakbang? Pumunta na sa seksyon 3
> Hindi na kailangang ulitin ang checklist na ito para sa parehong project — buksan lang ang `opencode` at gamitin ayon sa seksyon 3. Ulitin lang ang checklist na ito kapag talagang bagong project.

---

## 3. Pangkalahatang Vibe Coding gamit ang opencode

Buksan ang TUI at makipag-usap sa plain na wika:

```bash
opencode
```

O patakbuhin nang non-interactive (headless, magagamit mula sa scripts/automation):

```bash
opencode run "sumulat ng reverse-string function bilang isang python one-liner"
opencode run -m home-llamacpp/qwen3.8-27b "..."   # tukuyin ang specific na model
```

Habang nakikipag-usap, ang agent mismo ang pumipili ng mga tool nito (context7 para sa docs, playwright/chrome-devtools para sa browser debugging, graft para sa pag-unawa ng structure ng code) — hindi kailangang sabihing "gamitin ang tool X" maliban kung gusto mong pilitin ito.

### Buong halimbawa (mula sa request hanggang sa commit)

Ang "per-request workflow" diagram sa seksyon 1 ay isang abstract na buod — ang halimbawang ito ay isang tunay na cycle na talagang nangyari (buod mula sa isang tunay na na-test na session, hindi gawa-gawa lang), para ipakita kung ano ang nagiging bawat kahon sa diagram kapag nasa screen na:

1. **I-type ang isang command:** `pakidagdag ang level 3 sa laro`
2. **pumipili ang superpowers ng skill** — nakikilala nitong ito ay paggawa ng bagong feature → tinatawag ang `brainstorming` (makikita ito sa pag-uusap ng agent tungkol sa "pag-classify ng scope" bilang bounded/architectural muna)
3. **naghahanap ang graft ng relevant na code** — mismong tinatawag ng agent ang graft (`graft_find_code`/`graft_file_api` via MCP) para malaman kung paano gumagana ang kasalukuyang sistema ng level, sa halip na buksan mismo ang bawat file — makikita ito sa buod ng facts na tumutukoy sa tunay na `file:line`
4. **nagtatanong ng clarifying questions bilang batch (grilling format)** — nagpapaputok ng ilang tanong sabay-sabay, may kasamang `➡️` na rekomendasyon (tignan ang susunod na seksyon kung saan galing ang format na ito)
5. **sumagot sa mga tanong** — isang maikling sagot, hal. `sundin ang mga rekomendasyon mo`
6. **sinusuri ng ponytail ang decision ladder** — bago sumulat ng bagong code, tinitignan kung may meron nang pwedeng i-reuse (makikita ito sa resultang code na kadalasang nag-e-edit ng meron nang file/nagdadagdag ng field sa isang meron nang data structure, sa halip na bumuo ng bagong parallel na sistema)
7. **sumulat/nag-edit ng code**, kasama ang todo list na sumusubaybay sa progreso
8. **nagpatakbo ng tests + sinuri sa browser** (via chrome-devtools MCP, para sa trabahong makikita sa browser — ang rule na "Verifying UI changes" sa global AGENTS.md)
9. **nag-commit** bilang isang scoped commit, may maikli, diretso-sa-punto na mensahe — sa muling pagsubok ay **hindi** kusang nag-commit ang agent; kailangan mong hilingin (`/caveman-commit` para sa message, o i-type ang `i-commit mo ito`). Tignan ang hakbang 6 ng "Mula simula hanggang tapos"

> [!tip] Normal lang na hindi makita ang lahat ng hakbang
> Ang maliliit na request (pag-aayos ng typo, isang pangkalahatang tanong) ay dumidiretso sa hakbang 7–9, nilalaktawan ang 2–6 — nangyayari lang ang buong hakbang na ito para sa trabahong talagang "paggawa ng bagong feature."

> [!info] Muling sinubukan nang headless (2026-10-03) — tunay na resulta bawat hakbang
> Isang maliit na feature ("add a pause feature …") sa kopya ng sample game: hakbang 2 ✅ · hakbang 3 ❌ sa unang run (sinunod ng agent ang "check files" na hakbang ng brainstorming sa halip na gamitin ang graft) → ✅ pagkatapos magdagdag ng rule sa global AGENTS.md · nilaktawan ang hakbang 4 dahil sapat na makitid ang task para sa isang disenyo + approval · hakbang 6–7 ✅ · hakbang 8 ✅ kapag nakalagay na ang rule na "Verifying UI changes" (sa rule set na puro pagtitipid ng steps ang layunin, nilalaktawan ng agent ang browser check — [[gotchas]] item 19) · hakbang 9 ⚠️ hindi kusang nag-commit — proseso ng test, mga larawan ng resulta, at mga natitirang isyu sa [[tuning]] seksyon 4 at 8

### Paggamit ng grill-me / grilling bago magsimula ng bagong feature (kung naka-install)

Kung naka-install na ang `grill-me`/`grilling` skill (hakbang sa pag-install sa [[plugins]]), may 2 paraan para tawagin ito:

**1. I-interview nang standalone (hindi agad ii-implement, walang spec file):**

```
grill me about <isang ideya/desisyon na gusto mong subukan)
```

**2. Hayaang mangyari ito mismo kapag humihingi ng bagong feature (hindi na kailangang sabihing "grill"):**

```
pakidagdag ang <feature> para sa akin
```

Kung naka-install din ang `superpowers` (karaniwang naka-install nang magkapareha), sa kaso 2 ay tatawagin muna ang `brainstorming` ayon sa pangunahing gate nito, pagkatapos ay **hihiramin ang format ng question ng grilling** (nagtatanong bilang batch, may bilang, may `➡️` na rekomendasyon sa bawat isa) sa halip na magtanong isa-isa — makikilala ito mula sa:

```
❓ Q1 - <pamagat ng tanong>: <detalye/mga opsyon>
➡️ <rekomendasyon>

---

❓ Q2 - ...
```

Maaari kang sumagot ng maiikling opsyon/letra direkta (hal. `A A A A` o `sundin ang lahat ng rekomendasyon`) — hindi magsisimula ang agent na magsulat ng code hangga't hindi nasasagot ang lahat ng tanong at walang natitira sa frontier.

> [!info] Kumpirmado na hindi nagbabanggaan
> Nasubukan na nang totoo na ang pagtawag sa `grilling` nang standalone at ang paghihiram ng `brainstorming` sa format nito ay parehong gumagana sa sarili nilang tamang daan nang hindi nagbabanggaan (walang duplicate na round ng tanong, walang lumalabas na spec file kung hindi ito dapat). Buong detalye nasa [[plugins]], seksyong grill-me/grilling.

---

## 4. Paggamit ng graft para mas mabilis maintindihan ang code

Hindi mo kailangang tawagin mismo ang `graft` — kapag naka-wire na ang MCP (tignan [[mcp-servers]]), awtomatikong tinatawag ng opencode ang mga tool ng graft (`graft_find_code`/`graft_file_api`/`graft_trace_calls`/`graft_find_all`/`graft_repo_map`/`graft_check_freshness`) kapag kailangan, gaya ng playwright/chrome-devtools. Ang seksyong ito ay tungkol sa direktang pagtawag sa CLI mismo, kung sakaling gusto mong mabilisang tignan ang code bago makipag-usap sa agent.

**Hakbang 1 — tignan ang pangkalahatang-ideya ng project**

```bash
graft map
```

Halimbawang tunay na output na dapat makuha mo (nagbabago ang mga bilang/pangalan ng file depende sa project):

```
repo map — 15 files · 312 symbols · 540 edges · javascript

src/                12 files · 280 symbols   hubs: SG.config (config.js, 9←), GameScene (GameScene.js, 7←)
test/               1 files · 12 symbols     hubs: runTest (logic.test.js, 2←)

hotspots: SG.config · object · src/config.js:L3-L18 · 9←  GameScene.create · method · src/scenes/GameScene.js:L14-L111 · 7←
```

Paano basahin ito: **hubs**/**hotspots** = ang code na pinaka-madalas i-reference (ang bilang na `←` = ilang beses itong tinawag) — kadalasang pinaka-may-halaga ang pagsimula ng pag-unawa sa isang project mula sa mga puntong ito.

**Hakbang 2 — magtanong ng relevant na code sa plain na wika**

```bash
graft ask "saan nangyayari ang auth"
```

Halimbawang tunay na output (mula sa pagtatanong tungkol sa isang ring-collection system sa isang sample na laro):

```
graft ask — "ring collection overlap handler addRings ring cap"  (lexical)

1. addRings · method  [symbol]
   src/entities/Sonic.js:L43-L45
   addRings(n)

   addRings(n) {
     this.rings = Math.min(SG.config.ringCap, this.rings + n);
   }
```

Makukuha mo ang **file:line + ang tunay na code na naka-inline na** — hindi mo na kailangang buksan mismo ang file. Kung masyadong malawak ang tanong at isang resulta lang/hindi tumpak ang nakuha, subukan ang ibang command sa halip: `graft grep "<eksaktong salita>"` (hanapin ang bawat lugar na may salitang ito) o `graft skeleton <file>` (tignan ang buong API ng isang file na walang bodies).

**Hakbang 3 — tignan kung tumutugma pa rin ang graph sa tunay na code** (karaniwang hindi na kailangan mismo, dahil ang bawat command sa itaas ay awtomatikong nagre-refresh na bago sumagot — gamitin ito para lang kumpirmahin, o sa CI)

```bash
graft check
```

✅ exit code `0` = tumutugma ang graph sa kasalukuyang code, wala nang kailangan pang gawin.

> [!note] Plugin graft-deep
> Ang graft-deep plugin (tignan [[plugins]]) ay awtomatikong nag-i-inject ng relevant na context sa bawat bagong prompt — tumatakbo sa background nang walang kailangan pang gawin, kahit hindi ito 100% garantisadong gagamitin ng model ang naka-inject na context (depende ito sa kakayahan ng bawat model). Ang kasariwaan ng graph mismo ay hindi na kailangan ng plugin na ito — ang kasalukuyang graft CLI ay nagre-refresh na mismo bago sumagot sa kahit anong tanong.

---

## 5. Paggawa ng website gamit ang OpenDesign, pagkatapos ay ikabit sa opencode

### Phase 1 — Design/prototype sa OpenDesign

1. Buksan ang OpenDesign app → ang **Home** page
2. I-type ang brief (ang brief ng website) bilang plain na text
3. Piliin ang artifact type bilang **Prototype**
4. Piliin ang design system (151 na pagpipilian) o iwan sa auto
5. Launch → pumasok sa **Studio** (chat + generated files + live preview, lahat nasa isang window)
6. Ipagpatuloy ang pakikipag-usap sa chat para i-refine — direktang sumusulat ang Studio ng tunay na HTML/CSS/JS files sa disk, hindi lang mockup
7. Kapag nasiyahan na, i-export mula sa Download menu (HTML/PDF/PPTX)

> [!tip] Hindi laging kailangang bumalik sa opencode
> Kung simpleng isang-pahinang website lang, maaaring dito na magtapos ang export — hindi na kailangang magpatuloy sa opencode.

### Phase 2 — Ikabit sa tunay na project (kapag gusto ng backend/pagpapalawak)

```bash
cd my-real-project    # isang tunay na full-stack project na may kumpletong naka-setup na MCPs ng opencode
opencode
```

> [!important] I-on muna ang `open-design` para sa project na ito
> Naka-off by default ang `open-design` MCP (~6.6k tokens ang gastos nito bawat turn) — ilagay ang `{ "mcp": { "open-design": { "enabled": true } } }` sa `my-real-project/opencode.json`, buksan ulit ang opencode, at tiyaking ipinapakita ng `opencode mcp list` na `connected` ang `open-design`.

```
Gamitin ang open-design tool na list_projects para makita kung anong mga project ang meron,
pagkatapos ay kumuha ng files mula sa project na <pangalan> at ilagay sa folder na ito, at magdagdag ng backend API.
```

Tatawagin ng opencode ang `list_projects` → `get_project`/`get_artifact`/`get_file` sa open-design MCP mismo, kukunin ang nilalaman ng file, pagkatapos ay isusulat ito sa tunay na project gamit ang sarili nitong write tool — pagkatapos ay magpapatuloy ito bilang normal na full-stack session (pagkonekta ng DB via postgres/mysql MCP, testing via playwright/chrome-devtools, atbp.).

> [!info] Buod ng mga tungkulin
> **OpenDesign** = ang design/mabilisang frontend phase na may live preview · **opencode** (hiwalay na session) = ang tunay na development phase, pinapalawak ito tungo sa isang buong sistema, konektado sa pamamagitan ng `open-design` MCP.

> [!warning] Kailangang tumatakbo ang daemon
> Bago gamitin ang `open-design` MCP, kailangang tumatakbo ang daemon ng OpenDesign (panatilihing bukas ang app, o patakbuhin ang `od --no-open` nang headless) — buong detalye/problemang naranasan nasa [[gotchas]], item 4.

---

## 6. Pagpili ng tamang model para sa trabaho

| Sitwasyon | Inirerekumendang model |
| --- | --- |
| Tunay na trabaho, gustong kalidad/privacy, walang pagmamadali | `home-llamacpp/qwen3.8-27b` (self-hosted) |
| Mabilisang pagsubok ng isang ideya, smoke test, isang external na tool na may maikling timeout | `opencode/deepseek-v4-flash-free` (built-in, walang kailangang i-set up na key) |

Tukuyin gamit ang `-m provider/model`:

```bash
opencode run -m opencode/deepseek-v4-flash-free "..."
```

---

## 7. Karaniwang mga Problema

Buong listahan may kasamang ayos nasa [[gotchas]] — maikling bersyon:

- **Nagko-konekta ang isang external na tool sa opencode pagkatapos ay nag-ti-timeout** → tignan kung masyadong mabagal ang default na model (item 1 sa gotchas)
- **Nag-set ng bagong env var/PATH pero hindi pa rin ito gumagana** → buong i-restart ang kaugnay na app, hindi lang isara ang window nito (item 2)
- **Naka-connect ang `open-design` MCP pero hindi matawag ang tool** → dapat simpleng `["od", "mcp"]` ang config, walang `--daemon-url` — mula OpenDesign 0.22, random na port ang gamit ng daemon, hindi 7456 (item 4)
- **Ibang resulta ang parehong command sa magkaibang terminal** → subukan ang PowerShell sa halip ng Git Bash sa Windows (item 5)
- **Naka-show na connected ang `sonarqube` MCP pero 401/403 ang resulta sa pagtawag ng tool** → tignan kung "User Token" ang ginagamit na token, hindi "Global/Project Analysis Token" (tignan [[mcp-servers]], seksyong sonarqube) — kinukumpirma lang ng connection check na naaabot ang server, hindi nito tinitignan ang permissions ng token sa oras na iyon
- **Lumalabas ang `command not found` sa `trivy` kahit sinabi ng winget na matagumpay ang pag-install** → i-restart ang terminal (kailangang buong isara ang VS Code) — parehong PATH staleness gaya ng item 2 (tignan [[mcp-servers]], seksyong trivy)
- **Mabagal ang bawat turn / madalas ang compaction / paulit-ulit na binabasa ng agent ang parehong files** → sukatin ang laki ng prompt at ang tool-call history gamit ang scripts sa [[tuning]] (item 11 at 13)
- **Hindi gumagamit ng graft ang agent kahit may `graft/` index** → kailangan ng global AGENTS.md ang rule na "graft first, even inside a skill" (item 12)
- **Nakalista rin ang skills ng Claude Code sa `opencode debug skill`** → i-set ang `OPENCODE_DISABLE_EXTERNAL_SKILLS=1` (item 15)
