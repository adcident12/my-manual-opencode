---
tags: [user-manual, getting-started, opencode, vibe-coding]
updated: 2026-09-13
summary: Araw-araw na gabay sa paggamit ng OpenCode — vibe coding, ang graft workflow, grill-me/grilling, at ang OpenDesign workflow
---

# 📘 Gabay sa Paggamit ng OpenCode para sa Vibe Coding

> Tapos na sa setup? Tignan [[setup]] · Detalye ng MCP/Plugin sa [[mcp-servers]] at [[plugins]] · Karaniwang problema sa [[gotchas]] · Pag-update/pag-upgrade sa [[updating]]

---

## 📋 Talaan ng Nilalaman

- Pangkalahatang-ideya — architecture ng setup na ito + ang project-level at agent-level na workflow cycles
- Pagsisimula ng bagong project — 6-hakbang na checklist
- Pangkalahatang vibe coding gamit ang opencode — kasama ang buong halimbawa (isang tunay na request hanggang sa commit) at paano gamitin ang grill-me/grilling
- Paggamit ng graft para mas mabilis maintindihan ang code — may tunay na halimbawa ng output na dapat makilala
- Paggawa ng website gamit ang OpenDesign (pagkatapos ay ikakabit sa opencode)
- Pagpili ng tamang model para sa trabaho
- Karaniwang mga problema

> [!tip] Mga baguhan, magbasa sa pagkakasunod-sunod na ito
> Seksyon 1 (unawain muna ang pangkalahatang-ideya) → 2 (sundin ang tunay na checklist sa unang project mo) → 3 (subukan ang aktwal na request gamit ang halimbawa) — gawin ang unang 3 seksyon at handa ka na para sa araw-araw na paggamit. Ang seksyon 4–7 ay reference lang — buksan ito kapag talagang kailangan.

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
    B -->|plugin, opt-in| M["i-have-adhd - terse output<br/>(/i-have-adhd bawat session)"]
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

> [!note] Plugin i-have-adhd — sinasadyang wala sa per-turn cycle sa itaas
> Kaiba sa superpowers/graft-deep/ponytail na awtomatikong tumatakbo sa bawat turn — ang i-have-adhd (tignan [[plugins]]) ay **opt-in bawat session**: kailangan mong i-type mismo ang `/i-have-adhd` bago ito magkaroon ng epekto (binabago lang ang istilo ng sagot para maging diretso-sa-punto, hindi ginagalaw ang tool orchestration). Mabuti kapag gusto ng mabilis na sagot, hindi mahabang paliwanag — patayin anumang oras gamit ang `stop adhd mode`.

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

✅ **Dapat makita mo:** ang row na `graft` na may status na `connected`. Kung hindi, tignan muna [[gotchas]].

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

✅ **Dapat makita mo:** lahat ng 14 skills ng `superpowers` (`brainstorming`, `systematic-debugging`, `writing-plans`, ...), mga skill ng `ponytail` (`ponytail`, `ponytail-review`, ...), `i-have-adhd`, at `grill-me`/`grilling` kung naka-install (tignan [[plugins]] kung ano ang bawat isa).

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
8. **nagpatakbo ng tests + sinuri sa browser** (via playwright/chrome-devtools MCP, para sa web project)
9. **nag-commit** bilang isang scoped commit, may maikli, diretso-sa-punto na mensahe

> [!tip] Normal lang na hindi makita ang lahat ng hakbang
> Ang maliliit na request (pag-aayos ng typo, isang pangkalahatang tanong) ay dumidiretso sa hakbang 7–9, nilalaktawan ang 2–6 — nangyayari lang ang buong hakbang na ito para sa trabahong talagang "paggawa ng bagong feature."

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
- **Naka-connect ang `open-design` MCP pero hindi matawag ang tool** → tignan kung talagang tumatakbo ang daemon ng OpenDesign sa port 7456 (item 4)
- **Ibang resulta ang parehong command sa magkaibang terminal** → subukan ang PowerShell sa halip ng Git Bash sa Windows (item 5)
- **Naka-show na connected ang `sonarqube` MCP pero 401/403 ang resulta sa pagtawag ng tool** → tignan kung "User Token" ang ginagamit na token, hindi "Global/Project Analysis Token" (tignan [[mcp-servers]], seksyong sonarqube) — kinukumpirma lang ng connection check na naaabot ang server, hindi nito tinitignan ang permissions ng token sa oras na iyon
- **Lumalabas ang `command not found` sa `trivy` kahit sinabi ng winget na matagumpay ang pag-install** → i-restart ang terminal (kailangang buong isara ang VS Code) — parehong PATH staleness gaya ng item 2 (tignan [[mcp-servers]], seksyong trivy)
