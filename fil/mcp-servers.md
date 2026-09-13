---
tags: [project-doc, mcp, opencode, reference]
updated: 2026-09-13
summary: Detalye ng bawat MCP server na naka-setup sa OpenCode — hakbang sa pag-install, config, paano subukan, at mga gotchas
---

# MCP Servers

Buod sa [[index]] · Mga hakbang sa pag-install ng OpenCode mismo sa [[setup]]

Bawat MCP sa ibaba ay idinadagdag sa `mcp` object sa `~/.config/opencode/opencode.jsonc` (global — gumagana sa bawat project) maliban kung nakasaad na kailangan ito ng project-level na config.

> [!note] Bago magsimula
> Ipinapalagay ng pahinang ito na naka-install na ang Node.js/npm at ang OpenCode CLI. Kung hindi pa, bumalik muna sa [[setup]] Parts 0–1.

---

## context7 — maghanap ng docs ng library/framework

Isang remote MCP (walang patatakbuhin sa lokal, walang kailangang i-pre-install). Naghahanap ng documentation ng library/framework nang real time sa halip na umasa sa memorya ng model — napakakapaki-pakinabang kapag kailangang sumulat ng code ang agent laban sa bersyon ng library na mas bago kaysa sa training data ng model.

### Hakbang sa pag-install

1. Walang extra na kailangang i-install — remote HTTP endpoint ito.

2. Idagdag ang config sa `opencode.jsonc`:

   ```jsonc
   "context7": { "type": "remote", "url": "https://mcp.context7.com/mcp" }
   ```

3. I-restart ang OpenCode (o magbukas ng bagong session) pagkatapos tignan ang status:

   ```bash
   opencode mcp list
   ```

   Dapat makita mo ang `✓ context7 connected`.

---

## playwright — kontrolin ang browser / e2e testing

Isang MCP server na nagpapatakbo ng tunay na browser sa pamamagitan ng Playwright — para sa automation, pagsagot ng forms, pag-click ng buttons, pagkuha ng screenshots, at end-to-end testing ng daloy ng isang website.

### Hakbang sa pag-install

1. I-pre-install ang Chromium para sa Playwright (opsyonal — laktawan at susubukan ng MCP server na i-download ito sa unang tawag, pero ang paggawa nito nang maaga ay iniiwasan ang timeout sa unang tunay na paggamit):

   ```bash
   npx playwright install
   ```

2. Idagdag ang config sa `opencode.jsonc`:

   ```jsonc
   "playwright": { "type": "local", "command": ["npx", "@playwright/mcp@latest"], "timeout": 30000 }
   ```

   I-set ang `timeout: 30000` dahil sa unang takbo, kailangan munang i-resolve/i-download ng npx ang package — ang default ng OpenCode (5000ms) ay kadalasang hindi sapat.

3. Subukan:

   ```bash
   opencode mcp list
   ```

   > [!warning] Maaaring mag-fail ang unang subok
   > Maaaring lumabas na `failed`/timeout sa unang subok dahil dina-download pa ng npx ang package sa background — patakbuhin ulit ang command pagkatapos ng ilang saglit. Kung fail pa rin, tignan kung talagang natapos ang step 1.

---

## chrome-devtools — i-debug ang live na webpage

Kaiba sa playwright, mas nakatuon ito sa **pag-debug** (console logs, network requests, performance traces) kaysa purong automation — magkatuwang gumagana ang dalawa nang walang overlap, kapaki-pakinabang kapag kailangan ng agent na alamin kung bakit may error o mabagal ang isang page.

### Hakbang sa pag-install

1. Kailangan ng **Google Chrome** o **Chrome for Testing** na naka-install sa lokal (dalawa lang ito ang opisyal na suportado — maaaring gumana ang ibang Chromium build pero hindi ginagarantiya)

2. Idagdag ang config sa `opencode.jsonc`:

   ```jsonc
   "chrome-devtools": {
     "type": "local",
     "command": ["npx", "-y", "chrome-devtools-mcp@latest", "--no-usage-statistics"],
     "timeout": 30000
   }
   ```

   Ang `--no-usage-statistics` ay pumapatay sa telemetry na pinapadala sa Google (naka-on ito by default kung wala ang flag na ito).

3. Subukan:

   ```bash
   opencode mcp list
   ```

---

## graft — code-graph / context retrieval (per-project)

Ang [trailhq/Graft](https://github.com/trailhq/Graft) ay bumubuo ng graph ng relasyon ng code (aling function ang tumatawag ng ano, aling file ang may kinalaman sa aling file) para mabilis na maintindihan ng agent ang structure ng isang repo nang hindi binabasa ang bawat file. Kaiba sa 3 server sa itaas, **kailangan ito ng project-level na setup**, dahil kailangang aktwal na i-scan ng graph ang code ng specific na repo na iyon.

> [!note] Lumipat na ng organisasyon ang repo (huling na-check 2026-09-13)
> Dati ay nasa `nanonets/graft` ito — ngayon, parehong `github.com/nanonets/graft` at `github.com/NanoNets/Graft` (malaking letra) ay **awtomatikong nagre-redirect (301) papunta sa `github.com/trailhq/Graft`**. Gumagana pa rin ang mga lumang link na na-paste mo na dati (README, npm package page) dahil sa GitHub redirect, pero gamitin na ang bagong link mula ngayon — ang npm package mismo ay nakapangalan pa rin na `@nanonets/graft`, walang pagbabago.

### Hakbang sa pag-install

1. I-install ang CLI nang global (isang beses lang bawat makina, gumagana sa bawat project):

   ```bash
   npm install -g @nanonets/graft
   ```

2. Idagdag ang config sa `opencode.jsonc` (global — gumagana sa bawat project pagkatapos ng step 3):

   ```jsonc
   "graft": { "type": "local", "command": ["npx", "-y", "@nanonets/graft", "mcp"], "timeout": 30000 }
   ```

3. **Gawin ito sa bawat project na gagamitin mo** (isang beses lang bawat repo):

   ```bash
   cd my-project
   graft build                              # i-scan ang code, buuin ang graph (structural, walang kailangang API key)
   graft init --agents agents --no-global   # sumulat ng AGENTS.md + opencode.json (mcp.graft) para lang sa repo na ito
   ```

   Ang `--agents agents --no-global` ay naglilimita sa pagsulat lang sa mga file na ginagamit ng OpenCode (`AGENTS.md`, `opencode.json`) nang hindi ginagalaw ang Claude Code/.kiro/.gemini/Codex na maaaring naka-install na rin sa makina.

4. Subukan:

   ```bash
   cd my-project
   opencode mcp list      # dapat makita ang graft na connected
   graft map                # o subukan direkta ang CLI
   ```

### Mga kapaki-pakinabang na CLI command

| Command | Ginagawa |
| --- | --- |
| `graft map` | Buod ng project — aling files/functions ang pinaka-madalas tawagin |
| `graft ask "<tanong>"` | Magtanong sa plain na wika, makakuha ng relevant na code kasama ang file:line |
| `graft grep "<regex>"` | Exhaustive na paghahanap, naka-group ayon sa symbol (`-i --fixed` = case-insensitive + literal string sa halip na regex) |
| `graft callers <symbol>` | Sino ang tumatawag/nag-i-import/nag-e-extend ng symbol na ito — ang `--direction out` ay binabaligtad ito sa "ano ang tinatawag ng symbol na ito", ang `-d N` ay naglalakad ng N level pababa para sa buong blast radius |
| `graft skeleton <file>` | API surface ng isang file na walang bodies |
| `graft blast [dir]` | **(bago)** blast radius ng kasalukuyang diff — `--base origin/main` ihahambing laban sa merge base, `--format markdown` ay naka-format na handang i-paste bilang PR comment, `--export-viz` ay gagawa rin ng interactive na page |
| `graft check` | Iniuulat kung ang graph ba ay lumihis (drift) sa code (hindi ito ni-rebuild, ini-report lang) |
| `graft viz` | Nagbubukas ng interactive dependency-graph viewer sa browser — `--export site/` ay gumagawa ng isang static HTML file para sa CI/GitHub Pages |
| `graft uninstall [dir]` | Tinatanggal ang lahat ng file/config na nasulat ng `graft init` (kabaligtaran ng init) — kailangan ng `-y` para talagang mag-delete, kung wala, prine-print lang ang tatanggalin |

> [!info] May bagong flag na ang `graft build` para sa monorepos/submodules
> Ang `--follow-submodules` / `--follow-nested-repos` ay pinagsasama ang mga naka-initialize na submodule, o mga repo na naka-clone sa loob ng repo, sa iisang graph (excluded by default) — ang napiling opsyon ay natatandaan sa `.graft/config.json`. Ang `--extensions .ts .py` ay naglilimita lang sa specific na file extensions, walang kailangang i-edit na config.

> [!tip] Ang `--deep` ay nagdadagdag ng LLM summary bawat symbol (hindi pa naka-configure sa setup na ito)
> Karaniwang purong structural (tree-sitter, $0, walang LLM) ang `graft build`/`graft ask`/`graft check`, pero ang `graft build --deep` ay nagdadagdag ng layer ng summary gamit ang language model (concept node summaries + isang crux bawat symbol). Kailangan nito ang `GRAFT_PROVIDER` (`openai`/`anthropic`/`litellm`/`orcarouter`) + `GRAFT_API_KEY` + `GRAFT_MODEL` (hiwalay sa provider ng coding agent mismo) — hindi pa na-on ang feature na ito sa setup na ito, purong structural graph lang ang ginagamit.

### Ang mga MCP tool na aktwal na tinatawag ng agent (kaiba sa CLI sa itaas — ang CLI ay para direktang tawagin ng tao)

| Tool | Tumatanggap ng | Para saan |
| --- | --- | --- |
| `graft_find_code` | isang tanong | Naka-ranggo na relevant na nodes may file:line, ang source code ay naka-inline — kadalasang kumpleto na ang sagot, walang kailangan pang i-follow-up na basahin |
| `graft_file_api` | isang file path | Lahat ng signature sa file na iyon, walang bodies — ang API surface sa halagang 1/10 ng tokens |
| `graft_trace_calls` | isang symbol | Sino ang tumatawag sa symbol na ito (o ano ang tinatawag nito mismo, na may `direction: out`), maaaring lakarin nang ilang level pababa para sa blast radius |
| `graft_find_all` | isang regex | Bawat hit, naka-group ayon sa symbol na sumasaklaw dito, naka-ranggo ayon sa lakas ng koneksyon |
| `graft_repo_map` | (wala) | Unang tingin sa isang hindi pamilyar na repo — dir clusters, hubs, hotspots |
| `graft_check_freshness` | (wala) | Kung ang lokal na graph ba ay lumihis sa code |

> [!note] May doble ang prefix sa tool names na aktwal mong makikita sa OpenCode
> Dahil ang OpenCode ay nagbibigay ng pangalang `graft` sa MCP server pagkatapos ay naka-namespace ang tool bilang `<pangalan ng server>_<pangalan ng tool>`, aktwal mong makikita ang `graft_graft_find_code`, `graft_graft_file_api`, atbp. (dalawang beses na lumalabas ang salitang "graft") — normal na pagpapangalan ito, hindi bug, walang epekto sa functionality.

> [!warning] Aktwal na prompt injection na naranasan
> Ang output ng `graft map`/ilang command ay may kasamang tagong instruction na nagsasabi sa agent na sabihin ang isang promotional na linya ("🌱 graft saved ~N tokens..."). Ito ay sinasadyang feature para sa isang Claude Code hook (ang `tool-savings` hook) na kunin sa pamamagitan ng regex, hindi para basahin ng agent at sabihin nang tuwiran — pero kapag tinawag ang CLI direkta sa labas ng hook pipeline na iyon, lalabas ang text bilang plain tool output na makikita ng agent.

> [!info] Deep integration sa OpenCode — auto-inject context na lang ang kailangang gawin
> Hindi na kailangan pa ng kahit ano ang auto-rebuild ng graph pagkatapos ng edit — ang kasalukuyang graft CLI ay awtomatikong nagre-refresh na ng graph bago sumagot sa kahit anong tanong (structural, $0), kumpirmado sa aktwal na test. Ang wala pa sa OpenCode ay ang **awtomatikong pag-inject ng context sa bawat prompt** (Claude Code lang ang meron nito) — kung gusto ang ganitong behavior, kailangang sumulat ng custom plugin. Tignan ang [[plugins]], seksyong graft-deep.

---

## open-design — kumuha ng files mula sa isang OpenDesign project

Ang [nexu-io/open-design](https://github.com/nexu-io/open-design) ay isang AI tool para sa paggawa ng websites/prototypes/slide decks (open-source na alternatibo sa Claude Design). Buong detalye ng paggamit ng OpenDesign (Studio, buong workflow) ay nasa [[USER-MANUAL]].

### Hakbang sa pag-install

1. I-download ang **desktop app** mula sa [open-design.ai](https://open-design.ai/) o [GitHub Releases](https://github.com/nexu-io/open-design/releases) at i-install nang normal (pinaka-inirerekumenda — zero config, walang kailangang i-clone/Node/pnpm mismo)

2. **(Windows lang)** kadalasang hindi idinadagdag ng installer ang `od` sa PATH — kailangan mong gumawa ng shim mismo. Buong hakbang sa [[gotchas]], item 4 (maikling bersyon: gumawa ng `~/AppData/Roaming/npm/od.cmd` na tumatawag sa tunay na app sa pamamagitan ng `ELECTRON_RUN_AS_NODE=1`)

3. Kumpirmahin na gumagana ang `od` (**laging magbukas ng bagong terminal** pagkatapos ng step 2):

   ```bash
   od --help
   ```

4. I-wire ito sa OpenCode:

   ```bash
   od mcp install opencode
   ```

   Susulatan ka nito ng config sa `~/.config/opencode/opencode.json`:

   ```jsonc
   "open-design": {
     "type": "local",
     "command": ["od", "mcp", "--daemon-url", "http://127.0.0.1:7456"],
     "timeout": 30000,
     "enabled": true
   }
   ```

   Idagdag mismo ang `"timeout": 30000` kung hindi ito idinagdag ng `od mcp install` (ang default na 5000ms ay maaaring hindi sapat habang nagpapainit pa ang daemon).

5. **Panatilihing bukas ang OpenDesign app** (o patakbuhin ang `od --no-open` nang headless) — ang MCP na ito ay isang stdio proxy lang papunta sa daemon sa `127.0.0.1:7456`; kung walang tumatakbong daemon, hindi ito makakakonekta.

6. Subukan:

   ```bash
   opencode mcp list      # dapat makita ang open-design na connected
   ```

**Mga MCP tool na makukuha mo:** `list_projects`, `get_active_context`, `get_project`, `get_file`, `search_files`, `list_files`, `create_artifact`

> [!warning] Karaniwang problema sa Windows
> Buong detalye sa [[gotchas]], item 4 — saklaw ang parehong problema sa PATH at isang native-module na problema na hindi maaayos ng plain na shim.

---

## memory — panatilihin ang context sa buong sessions (opisyal na reference server)

Ang [`@modelcontextprotocol/server-memory`](https://github.com/modelcontextprotocol/servers/tree/main/src/memory) ay nagpapanatili ng persistent na knowledge graph para matandaan ng agent ang mga fact/context tungkol sa'yo sa buong sessions (halos katumbas ng memory feature ng Claude Code). Buong tumatakbo nang lokal; walang ipinapadala kahit saan.

### Hakbang sa pag-install

1. Walang kailangang i-pre-install (kukunin ito ng `npx -y` sa unang tawag)

2. Idagdag ang config sa `opencode.jsonc` — i-set ang `MEMORY_FILE_PATH` sa absolute path para laging nasa iisang lugar ang memory file kahit anong project ang pinagbubuksan ng opencode:

   ```jsonc
   "memory": {
     "type": "local",
     "command": ["npx", "-y", "@modelcontextprotocol/server-memory"],
     "environment": {
       "MEMORY_FILE_PATH": "C:/Users/<user>/.config/opencode/memory.jsonl"
     },
     "timeout": 30000
   }
   ```

3. Subukan:

   ```bash
   opencode mcp list      # dapat makita ang memory na connected agad, wala nang kailangan pang i-configure
   ```

> [!note] Anong uri ng data ang itinatago nito
> Naka-imbak bilang entities + observations sa plain na `.jsonl` file (nababasa/nae-edit nang manu-mano kung kailangan) — hindi vector database o anumang cloud service.

---

## github — pamahalaan ang issues/PR/code search sa pamamagitan ng structured tool (naka-disable hanggang may token)

Ang opisyal na GitHub MCP server (ginawa ng GitHub mismo) — nagbibigay-daan sa agent na tawagin ang issues, pull requests, at code search sa pamamagitan ng malinaw na naka-structure na tool sa halip na patakbuhin ang `git`/`gh` sa bash nang freeform.

### Hakbang sa pag-install

1. Gumawa ng GitHub Personal Access Token sa **https://github.com/settings/personal-access-tokens/new** — inirerekumenda ang **Fine-grained token** (mas mahusay ang pag-scope kaysa classic token). Piliin ang repository access at permissions na bagay sa gagamitin mo (hal. Contents, Issues, Pull requests: Read and write)

2. I-set ang environment variable na `GITHUB_PERSONAL_ACCESS_TOKEN` sa value ng token na iyon (tignan [[setup]] Part 2 para sa paano mag-set ng env vars bawat OS)

3. Idagdag ang config sa `opencode.jsonc`:

   ```jsonc
   "github": {
     "type": "remote",
     "url": "https://api.githubcopilot.com/mcp/",
     "oauth": false,
     "headers": {
       "Authorization": "Bearer {env:GITHUB_PERSONAL_ACCESS_TOKEN}"
     },
     "enabled": false
   }
   ```

   Sinasabi ng `oauth: false` sa OpenCode na gamitin ang PAT sa pamamagitan ng header sa halip na subukang mag-auto-discover ng OAuth (na kailangan ng GitHub Copilot subscription) — `enabled: false` muna hanggang handa na itong gamitin (parehong pattern gaya ng postgres/mysql, para hindi ito mag-throw ng error habang wala pang token).

4. Kapag handa na talagang gamitin, i-flip ang `"enabled": false` → `true` pagkatapos subukan:

   ```bash
   opencode mcp list      # dapat makita ang github na connected
   ```

> [!warning] Gumagamit ng maraming context
> Binabalaan ng dokumento mismo ng GitHub na ang MCP na ito ay "can add a lot of tokens to your context" — kung talagang io-on ito, paikliin ang naka-enable na toolset kung suportado ito ng OpenCode, sa halip na i-on lahat ng capability nang sabay.

---

## sonarqube — code quality + security scan, self-hosted (via Docker)

Ang opisyal na [SonarSource/sonarqube-mcp-server](https://github.com/SonarSource/sonarqube-mcp-server) — nagbibigay-daan sa agent na tignan ang quality gates, security hotspots, code smells, at coverage sa pamamagitan ng direktang tool calls. Kaiba sa lahat ng iba pang MCP sa pahinang ito, **kailangan nito ng aktwal na tumatakbong SonarQube server muna** (self-hosted o SonarCloud) — pinili ang self-hosted dito para walang dependency sa external service at hindi umaalis ang code data sa makina.

> [!info] Bakit hindi ginamit ang Semgrep MCP sa halip
> Mas magaan ang Semgrep at walang kailangang server, pero nakatuon lang ito sa security scanning — nagbibigay ang SonarQube ng code quality (code smells, coverage, duplication) AT security hotspots sa isang tool. Piliin batay sa dami ng coverage na gusto mo.

### Prerequisite — Docker Desktop

Kailangang naka-install ang Docker Desktop at **aktwal na tumatakbo ang engine nito** (hindi lang naka-install ang app). Tignan gamit:

```powershell
docker version
```

Kung lumabas ang error na `open //./pipe/dockerDesktopLinuxEngine`, hindi pa bukas ang app — buksan ang Docker Desktop at maghintay (kinakailangan ng ~30–90 segundo ang engine para mag-bootstrap pagkatapos bumukas ang app).

> [!warning] Maaaring wala ang `docker` sa PATH
> **Hindi laging idinadagdag** ng installer ng Docker Desktop ang path ng `docker.exe` sa System PATH (kumpirmado sa ilang makina na na-install na matagal na). Tignan gamit ang `Get-Command docker` — kung wala, gamitin na lang direkta ang buong path, kapwa sa pagsubok at sa MCP config: `C:\Program Files\Docker\Docker\resources\bin\docker.exe`

### Hakbang 1 — Patakbuhin ang SonarQube Server container

```bash
docker run -d --name sonarqube -p 9000:9000 \
  -v sonarqube_data:/opt/sonarqube/data \
  -v sonarqube_extensions:/opt/sonarqube/extensions \
  -v sonarqube_logs:/opt/sonarqube/logs \
  sonarqube:community
```

Gumagamit ng 3 named volumes para manatili ang data/extensions/logs kahit mag-restart ang container — **walang `--rm`**, dahil dapat manatili ang container na ito nang permanente, kaiba sa mga ephemeral na MCP server containers.

Maghintay na matapos ang bootstrap (karaniwang 1–2 minuto), makikita sa log:

```bash
docker logs sonarqube | grep "SonarQube is operational"
```

Kumpirmahin na bukas na ang web UI: buksan ang **http://localhost:9000**.

> [!note] Sapat na ang embedded H2 database para sa mag-isang paggamit
> Binabalaan ng SonarQube na "Embedded database should be used for evaluation purposes only" — okay lang para sa mag-isa/personal na project, pero lumipat sa hiwalay na PostgreSQL ayon sa opisyal na dokumento ng SonarQube kung gagamitin ng team o sa tunay na production.

### Hakbang 2 — Unang login + gumawa ng User Token

1. Pumunta sa **http://localhost:9000**, mag-login gamit ang `admin` / `admin` (default) — pipilitin kang magpalit ng password agad
2. Pumunta sa **My Account → Security**
3. Sa ilalim ng **Generate Tokens**: bigyan ng pangalan (hal. `opencode-mcp`), Expires in `No expiration` (o pumili ng sarili mo)

> [!danger] Dapat "User Token" lang ang Type — ang pinaka-madaling magkamali dito
> May 3 pagpipilian ang **Type** dropdown: Global Analysis Token, Project Analysis Token, User Token — **User Token lang ang gumagana** sa MCP server, dahil kailangan nito ang buong Web API (pagtingin ng issues, quality gates, project lists), hindi lang pag-submit ng scan results gaya ng ginagawa ng Analysis Token. Kung mali ang napili, makakakuha ka ng 401/403 sa aktwal na pagtawag ng tool, kahit na "connected" ang ipinapakita ng MCP server (ang connection check ay nagkukumpirma lang na maaabot ang server, hindi nito tinitignan ang permissions ng token sa oras na iyon).

4. I-click ang Generate → kopyahin agad ang token (isang beses lang ipinapakita)

### Hakbang 3 — I-set ang env var

I-set ang `SONARQUBE_TOKEN` sa value ng token na iyon (System Environment Variable sa Windows, o shell profile sa macOS/Linux — tignan [[setup]] Part 2)

> [!danger] Huwag kailanman ilagay ang token nang direkta sa config file o sa chat
> Palaging gamitin ang `{env:SONARQUBE_TOKEN}` sa halip, kahit na sa localhost lang tumatakbo ang server — mas magandang ugali ito at pinipigilan ang token na hindi sinasadyang mapunta sa git history/session logs.

### Hakbang 4 — Idagdag ang config sa `opencode.jsonc`

```jsonc
"sonarqube": {
  "type": "local",
  "command": [
    "C:/Program Files/Docker/Docker/resources/bin/docker.exe",
    "run", "--init", "--rm", "-i",
    "-e", "SONARQUBE_TOKEN",
    "-e", "SONARQUBE_URL",
    "sonarsource/sonarqube-mcp"
  ],
  "environment": {
    "SONARQUBE_TOKEN": "{env:SONARQUBE_TOKEN}",
    "SONARQUBE_URL": "http://host.docker.internal:9000"
  },
  "timeout": 30000,
  "enabled": true
}
```

Mga pangunahing pagkakaiba mula sa generic na halimbawang config sa opisyal na dokumento ng SonarQube:

- **Ginagamit ang buong path ng `docker.exe`** sa halip na plain na `docker`, ayon sa dahilan sa prerequisite sa itaas.
- **Ang `SONARQUBE_URL` ay dapat na `http://host.docker.internal:9000`**, hindi `http://localhost:9000` — dahil ang MCP server ay tumatakbo **sa sarili nitong hiwalay na container**, kung saan ang `localhost` ay tumutukoy sa container mismo, hindi sa tunay na makina. Ang `host.docker.internal` ang special na DNS name na ibinibigay ng Docker Desktop na laging tumuturo pabalik sa host machine.
- Ang `-e SONARQUBE_TOKEN` (walang `=value` sa hulihan) ay nagsasabi sa Docker na i-forward ang value mula sa environment ng process na tumawag ng `docker run` (opencode mismo) papunta sa container — gumagana ito kasama ng `"environment"` block sa itaas na nagre-resolve ng `{env:SONARQUBE_TOKEN}` para makita ng opencode ang tunay na value bago ito ipasa.

**I-pre-pull ang image bago ang unang tunay na paggamit** (iniiwasan ang timeout na 30 segundo na hindi sapat habang dina-download ang ~500MB+ na image):

```bash
docker pull sonarsource/sonarqube-mcp
```

### Hakbang 5 — Subukan

**Direktang subukan muna ang docker command** (hinihiwalay ang problema sa MCP config sa problema sa docker/network):

```powershell
& "C:\Program Files\Docker\Docker\resources\bin\docker.exe" run --init --rm -i -e SONARQUBE_TOKEN -e SONARQUBE_URL=http://host.docker.internal:9000 sonarsource/sonarqube-mcp
```

Dapat makita mo ang mga log na ganito (naghihintay ito ng input dahil stdio transport ito — normal, i-Ctrl+C para lumabas):

```
INFO SonarQube MCP Server - Starting backend service
INFO SonarQube MCP Server - SonarQube MCP Server Started:
INFO SonarQube MCP Server - Transport: stdio
INFO SonarQube MCP Server - Status: Server ready - tools loading in background
```

Kapag pumasa iyon, tignan sa pamamagitan ng opencode:

```bash
opencode mcp list      # dapat makita ang sonarqube na connected
```

> [!important] "connected" sa opencode mcp list, pero hindi matawag ng agent ang tool — tignan muna ang VS Code
> Isang aktwal na naranasang problema habang nagse-setup: pumasa ang docker command nang direkta, pero nabigo pa rin ang `opencode mcp list` na tinakbo mula sa **terminal sa loob ng VS Code**. Ang dahilan: ang terminal sa VS Code ay child process ng VS Code mismo (`Code.exe`) na bukas na mula bago pa i-set ang `SONARQUBE_TOKEN`. Hindi tumutulong ang pagbukas ng bagong terminal tab doon, dahil kino-clone lang nito ang umiiral nang environment ng VS Code sa halip na basahin ang bagong values mula sa Windows. Kailangang **isara nang buo ang buong VS Code app at buksan ulit** (tignan din ang Task Manager na walang natitirang `Code.exe`) bago makita ang bagong value — direktang kumpirmasyon ito ng [[gotchas]], item 2, hindi problema sa config.

### CLI/Tools na makukuha mo

Ang MCP server na ito ay naglalantad ng mga tool para sa: pag-analisa ng code, paglista ng issues, pagtingin ng quality gate status, pagkuha ng security hotspots, pagsukat ng coverage — awtomatikong tinatawag ito ng agent kapag hiniling na suriin ang code o hanapin ang vulnerabilities.

> [!note] Kailangang "i-Analyze" muna ang isang project bago magkaroon ng data
> Walang data ang bagong SonarQube server hanggang ma-scan ang isang project papasok dito nang minsan (via web UI's "Analyze new project," o pahintulutan ang agent na tumawag ng MCP tool para i-scan ito) — bago ang unang scan na iyon, karamihan sa mga tool ay sasabihin lang na walang data, hindi mag-e-error.

---

## trivy — vulnerability/secret/misconfig scan (standalone CLI, walang kailangang server)

Ang [aquasecurity/trivy](https://github.com/aquasecurity/trivy) ay isang scanner para sa vulnerabilities sa dependencies, hardcoded na secrets sa code, at misconfigurations sa config files (Terraform, Dockerfile, Kubernetes, atbp.). Kaiba sa sonarqube, ito ay **standalone CLI na walang kailangang patakbuhing server** — direktang nagkokonekta ang MCP sa binary sa pamamagitan ng plugin na ginawa ng Aqua Security mismo.

> [!info] Bakit meron pareho ng sonarqube at trivy
> Bahagyang nagto-overlap sa security hotspots, pero mas malawak ang saklaw ng trivy sa supply-chain — mas mahusay itong nag-e-scan ng dependency CVEs direkta mula sa lockfile, nag-e-scan ng container images, at naghahanap ng na-leak na secrets (API keys, tokens) sa code kaysa sonarqube. Magkatuwang silang gumagana; hindi ganoon ka-redundant na kailangan mo pang pumili ng isa lang.

### Hakbang sa pag-install

1. I-install ang Trivy CLI (sa Windows via winget, mabilis at walang kailangang hanapin na installer):

   ```powershell
   winget install --id AquaSecurity.Trivy -e
   ```

   macOS: `brew install trivy` · Linux: tignan ang tagubilin bawat distro sa [opisyal na dokumento](https://trivy.dev/latest/getting-started/installation/)

   > [!warning] Kailangang i-restart ang terminal pagkatapos i-install
   > Sinasabi mismo ng winget na "Path environment variable modified; restart your shell" — kaparehong problema ng [[gotchas]], item 2. Kung nananatili pa rin ang `trivy: command not found` kahit sinabi ng winget na matagumpay ang pag-install, isara at buksan ulit ang terminal (kailangang buong isara ang VS Code, gaya ng dati).

2. I-install ang opisyal na MCP plugin mula sa Aqua Security mismo (**hindi built-in subcommand ang "mcp" ng plain trivy — kailangan munang i-install ang plugin na ito**):

   ```bash
   trivy plugin install mcp
   ```

   > [!danger] Huwag magtiwala sa search result na nagsasabing gumagana agad ang `trivy mcp`
   > May ilang unofficial na third-party MCP wrapper (hindi mula sa aquasecurity org) na lumalabas sa mga pangkalahatang search result. Bago mag-install ng plugin, kumpirmahin na ang repo ay [aquasecurity/trivy-mcp](https://github.com/aquasecurity/trivy-mcp).

3. Idagdag ang config sa `opencode.jsonc`:

   ```jsonc
   "trivy": {
     "type": "local",
     "command": ["trivy", "mcp"],
     "timeout": 30000
   }
   ```

   > [!note] Kung wala ang `trivy` sa PATH ng opencode
   > May ilang makina na matagal nang na-install ng winget na maaaring hindi makita ang `trivy` sa plain na pangalan (kaparehong problema ng `docker`/`od` kanina) — tignan gamit ang `Get-Command trivy`; kung wala, gamitin na lang ang buong path ng `trivy.exe` direkta sa `"command"`.

4. Subukan:

   ```bash
   opencode mcp list      # dapat makita ang trivy na connected
   ```

   Maaari mo ring subukan direkta ang CLI muna (dina-download ang ~100MB na vulnerability DB sa unang takbo):

   ```bash
   trivy fs --scanners vuln,secret,misconfig .
   ```

> [!warning] Kailangan ng `docker-credential-desktop` sa PATH sa unang pag-download ng DB
> Itinatago ng Trivy ang vulnerability database bilang OCI artifact sa `mirror.gcr.io` — sa unang pull, susubukan nitong tingnan ang credentials sa pamamagitan ng Docker's credential helper, kahit hindi na kailangang tumakbo ang Docker server. Kung nakaharap sa error na `docker-credential-desktop: executable file not found`, pansamantalang idagdag ang folder na `resources/bin` ng Docker Desktop sa PATH (tignan [[gotchas]], item 4, para sa parehong Docker-path pattern) — **hindi ito permanenteng dependency**; kapag na-cache na ang DB, hindi na kailangan ng Docker sa mga susunod na takbo.

### Mga kapaki-pakinabang na CLI command

| Command | Ginagawa |
| --- | --- |
| `trivy fs .` | I-scan ang dependency vulnerabilities + secrets sa kasalukuyang folder |
| `trivy fs --scanners secret .` | Mag-scan ng hardcoded secrets lang (mas mabilis) |
| `trivy image <name>` | I-scan ang isang container image para sa CVEs |
| `trivy config .` | I-scan para sa misconfigurations sa Dockerfile/Terraform/K8s manifest |
| `trivy repository <url>` | I-scan ang remote git repository nang hindi mo ito kailangang i-clone mismo |

---

## postgres / mysql — mag-query ng database (naka-disable by default, ine-enable per project)

Parehong local MCP na kailangan ng tumatakbo nang database server (local o remote) — ang MCP ay tulay lang, hindi ito nag-i-install ng DB para sa'yo.

### Hakbang sa pag-install (sa global config — naiwang naka-disable)

1. Walang kailangang i-pre-install (kukunin ng `npx -y` ang package kapag talagang ginamit)

2. Idagdag ang config sa `opencode.jsonc` na may `enabled: false` muna:

   ```jsonc
   "postgres": {
     "type": "local",
     "command": ["npx", "-y", "@modelcontextprotocol/server-postgres", "{env:POSTGRES_CONNECTION_STRING}"],
     "timeout": 30000,
     "enabled": false
   },
   "mysql": {
     "type": "local",
     "command": ["npx", "-y", "@benborla29/mcp-server-mysql"],
     "environment": {
       "MYSQL_HOST": "{env:MYSQL_HOST}",
       "MYSQL_PORT": "{env:MYSQL_PORT}",
       "MYSQL_USER": "{env:MYSQL_USER}",
       "MYSQL_PASS": "{env:MYSQL_PASS}",
       "MYSQL_DB": "{env:MYSQL_DB}"
     },
     "timeout": 30000,
     "enabled": false
   }
   ```

> [!note] Bakit naka-disable by default
> Isang connection string ay project-specific na data — kung naka-enable ito palagi, susubukan nitong kumonekta sa isang DB tuwing bubuksan ang OpenCode sa kahit anong project, kahit walang DB, na magdudulot ng walang-saysay na errors/ingay.

### Hakbang para i-on nang tunay bawat project

1. Gumawa (o i-edit) ang config file sa **root ng project na iyon** para i-override ang global:

   ```jsonc
   // my-project/opencode.jsonc
   {
     "mcp": {
       "postgres": { "enabled": true }
       // o "mysql": { "enabled": true }
     }
   }
   ```

2. I-set ang connection env vars bago buksan ang opencode, sa parehong terminal:

   ```bash
   # Postgres
   export POSTGRES_CONNECTION_STRING="postgresql://user:pass@host:5432/dbname"

   # MySQL
   export MYSQL_HOST="127.0.0.1"
   export MYSQL_PORT="3306"
   export MYSQL_USER="root"
   export MYSQL_PASS="your_password"
   export MYSQL_DB="your_database"
   ```

   Sa Windows PowerShell, gamitin ang `$env:VAR_NAME = "..."` sa halip — tignan [[gotchas]], item 2, kung bakit kailangang i-restart ang app kung sa System Environment Variables mo ito na-set.

3. Buksan ang opencode sa parehong terminal (na may env vars na), mula sa root ng project na iyon:

   ```bash
   cd my-project
   opencode
   ```

4. Subukan:

   ```bash
   opencode mcp list      # dapat makita ang postgres/mysql na lumipat mula disabled papuntang connected
   ```

> [!tip] Read-only by default
> Parehong **read-only by default** ang dalawa (para hindi aksidenteng mabago ng agent ang tunay na data) — maaaring bigyan ng write access ang mysql gamit ang extra na env flags, hal. `ALLOW_INSERT_OPERATION=true`, `ALLOW_UPDATE_OPERATION=true`, `ALLOW_DELETE_OPERATION=true`

---

## Pagtingin sa pangkalahatang status

```bash
opencode mcp list
```

Halimbawang output kapag kumpleto ang setup (8 naka-enable + 3 naka-disable):

```
✓ context7        connected
✓ playwright       connected
✓ chrome-devtools  connected
✓ graft            connected
✓ open-design      connected
✓ memory           connected
✓ sonarqube        connected
✓ trivy            connected
○ github           disabled
○ postgres         disabled
○ mysql            disabled
```
