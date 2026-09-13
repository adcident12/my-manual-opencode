---
tags: [project-doc, setup, opencode, beginner-friendly]
updated: 2026-09-13
summary: Detalyadong gabay sa pag-install ng OpenCode mula sa walang laman na makina — Node.js, Git, ang CLI, provider, MCP servers, plugins, Agent Skills open-standard skills, at AGENTS.md (global vs project), bawat hakbang
---

# Setup

> Buod ng buong stack sa [[index]] — ang pahinang ito ang detalyadong gabay sa pag-install, sinulat para masundan mo mula sa **ganap na walang laman na makina** hanggang sa gumaganang setup.

> [!tip] Pagkakasunod-sunod ng pagbabasa
> Sundin ang Part 0 → 1 → 2 → 3 → 4 → 5 nang sunod-sunod, huwag laktawan — bawat Part ay umaasa sa natapos na sa nakaraang Part.

---

## Part 0 — Ihanda ang makina (para sa walang laman na makina)

Kung meron nang Node.js at Git sa makina mo, tumalon na sa [Part 1](#part-1--i-install-ang-opencode-cli). Kung hindi sigurado, tignan muna gamit ito:

```bash
node --version
npm --version
git --version
```

Kung may command na nagsasabing `command not found`, hindi pa naka-install — i-install sa ibaba.

### I-install ang Node.js + npm

Ang Node.js ang kailangan ng OpenCode at halos lahat ng MCP server para tumakbo (kasama na ang npm sa Node.js, walang hiwalay na kailangang i-install).

**Windows:**
1. Pumunta sa [nodejs.org](https://nodejs.org/) → i-download ang bersyong **LTS** (ang inirerekumenda, hindi ang Current)
2. Patakbuhin ang `.msi` installer, i-click ang Next sa mga default (idadagdag mismo ng installer ang Node/npm sa PATH)
3. **Isara ang lahat ng bukas na terminal at magbukas ng bago** (mahalaga — hindi makikita ng lumang terminal ang bagong-update na PATH; tignan ang [[gotchas]], item 2, para sa dahilan)
4. Kumpirmahin: dapat magprint ng version number ang `node --version` gaya ng `v22.x.x`

**macOS:**
```bash
# Gamit ang Homebrew (i-install mula sa https://brew.sh muna kung wala pa)
brew install node
```

**Linux (Debian/Ubuntu):**
```bash
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs
```

> [!note] Pinakamababang bersyon
> Inirerekumenda ang Node.js 20+ (ang pinakabagong LTS sa oras ng pagsulat ay Node 22/24) — maaaring hindi gumana ang ibang MCP server sa mas lumang bersyon.

### I-install ang Git

Kailangan para mag-install ng mga plugin na galing sa `git+https://` (hal. superpowers).

**Windows:** i-download mula sa [git-scm.com](https://git-scm.com/download/win), patakbuhin ang installer, i-click ang Next sa mga default (sapat na ang mga ito para sa normal na paggamit).

**macOS:** kadalasan meron na (subukan ang `git --version` — kung wala, mag-oofer ang macOS na i-install ang Xcode Command Line Tools), o `brew install git`.

**Linux:** `sudo apt-get install git` (Debian/Ubuntu) o ang package manager ng distro mo.

### Maghanda ng kahit isang LLM

Kailangan ng OpenCode ng kahit isang "model" na kakausapin bago ito magamit talaga. May 3 opsyon — piliin kung alin ang meron ka:

| Opsyon | Bagay para kanino | May kailangan pang setup? |
| --- | --- | --- |
| **Built-in na libreng model ng OpenCode** (hal. `opencode/deepseek-v4-flash-free`) | Gustong subukan agad nang walang anumang setup | Wala — gumagana kaagad pagkatapos i-install ang CLI |
| **Cloud provider** (OpenAI, Anthropic, atbp.) | May API key na para sa isa sa mga ito | `opencode auth login` |
| **Self-hosted model** (llama.cpp, Ollama, vLLM, atbp.) | May tumatakbo nang model server, gustong ikonekta | Manu-manong `provider` config — tignan [Part 2](#part-2--i-set-up-ang-model-provider) |

> [!tip] Inirerekumenda para sa mga baguhan
> Magsimula muna sa built-in na libreng model (walang setup), pagkatapos magdagdag ng self-hosted/cloud provider sa mas huling panahon kapag handa na — makikita mo agad na gumagana ang OpenCode, hindi na kailangang hintayin ang lahat ng setup bago simulan.

---

## Part 1 — I-install ang OpenCode CLI

```bash
npm install -g opencode-ai
```

Kumpirmahin na tama ang pag-install:

```bash
opencode --version
```

Dapat magprint ito ng version number gaya ng `1.18.18`.

### Subukan agad (walang extra setup)

```bash
opencode run -m opencode/deepseek-v4-flash-free "say hi"
```

Kung may sagot na bumalik, tama na gumagana ang CLI — handa nang magpatuloy sa mga extra.

### Pagkakilala sa config ng OpenCode

Ang pangunahing config ay nasa `~/.config/opencode/` — **parehong path sa lahat ng OS** (Windows/macOS/Linux, walang exception). Maaaring wala pa ang folder na ito pagkatapos ng bagong install; gawin mo ito mismo kung kailangan.

Mga config file na binabasa ng OpenCode (at pinagsasama kung mahigit isa):

- `config.json`
- `opencode.json`
- `opencode.jsonc` *(may suporta sa comment — inirerekumenda bilang pangunahing manu-manong ini-edit na file)*

> [!note] Bakit maaaring magkaroon ng 2 file
> May ilang MCP installer (hal. `od mcp install`) na awtomatikong gumagawa ng hiwalay na `opencode.json`, habang inilalagay mo ang ibang setting sa `opencode.jsonc` — huwag magulat kung parehong file ang mahanap mo — pinagsasama ito ng OpenCode nang walang problema.

Gumawa ng starter file nang manu-mano (kung wala pa):

```jsonc
// ~/.config/opencode/opencode.jsonc
{
  "$schema": "https://opencode.ai/config.json"
}
```

---

## Part 2 — I-set up ang Model Provider

Laktawan ang buong Part na ito kung ang built-in na libreng model lang ng OpenCode ang gagamitin.

### Self-hosted (halimbawa: OpenAI-compatible na llama.cpp server)

Idagdag sa `~/.config/opencode/opencode.jsonc`:

```jsonc
{
  "$schema": "https://opencode.ai/config.json",
  "provider": {
    "home-llamacpp": {
      "npm": "@ai-sdk/openai-compatible",
      "name": "Home llama.cpp",
      "options": {
        "baseURL": "https://your-server/v1",
        "apiKey": "{env:HOME_LLAMACPP_API_KEY}"
      },
      "models": {
        "your-model-id": {
          "name": "kahit anong display name",
          "limit": { "context": 131072, "output": 32768 }
        }
      }
    }
  }
}
```

Palitan:
- `home-llamacpp` — pumili ng kahit anong pangalan ng provider (tatawagin mo ito via `-m home-llamacpp/your-model-id`)
- `https://your-server/v1` — tunay na URL ng server mo
- `your-model-id` — pangalan ng model ayon sa report ng server mo (tignan gamit `curl https://your-server/v1/models`)

> [!tip] Bakit output = 32768
> Kung reasoning model ang model (may thinking mode, gaya ng Qwen3), ang masyadong mababang output ceiling ay maaaring maging dahilan para "tumigil sa gitna" ang agent — tumutugma ang 32768 sa opisyal na rekomendasyon ng Qwen para sa pangkalahatang trabaho. Buong detalye sa [[gotchas]], item 8.

> [!warning] Huwag kailanman i-hardcode ang API key nang direkta sa file
> Palaging gamitin ang `{env:VAR_NAME}` sa halip na direktang i-type ang value ng API key sa file — kukunin ito ng OpenCode mula sa environment variable na na-set mo. Paano mag-set ng env var:
>
> - **Windows:** buksan ang "Edit the system environment variables" → Environment Variables → New (System variable) → pangalanan ng `HOME_LLAMACPP_API_KEY` may value na ang API key
> - **macOS/Linux:** magdagdag ng linyang `export HOME_LLAMACPP_API_KEY="your-key"` sa `~/.zshrc`, `~/.bashrc`, o kung anong shell profile ang ginagamit mo, pagkatapos i-`source` ulit (o magbukas ng bagong terminal)
>
> **Pagkatapos i-set, laging isara at buksan ulit ang terminal/app na magpapatakbo ng opencode** — hindi makikita ng process na tumatakbo na ang bagong value. Detalye sa [[gotchas]], item 2.

### Cloud provider

```bash
opencode auth login
```

May wizard na gagabay sa'yo sa pagpili ng provider (OpenAI, Anthropic, atbp.) at pagpasok ng API key.

### Kumpirmahin na gumagana ang provider

```bash
opencode models | grep home-llamacpp
opencode run -m home-llamacpp/your-model-id "say hi"
```

Kung may sagot na bumalik, tama ang pagka-wire ng provider.

---

## Part 3 — I-install ang MCP Servers

Ang MCP (Model Context Protocol) ang nagbibigay-daan sa OpenCode na tumawag ng extra na "tools" (paghahanap ng docs, pagkontrol ng browser, pag-query ng database, atbp.). Karamihan sa mga MCP server ay hindi kailangang i-`npm install -g` nang maaga — pinapatakbo ng OpenCode ang `npx -y` para sa'yo sa unang pagkonekta.

Halimbawang basic config (idagdag sa `opencode.jsonc`):

```jsonc
{
  "mcp": {
    "context7": { "type": "remote", "url": "https://mcp.context7.com/mcp" },
    "playwright": { "type": "local", "command": ["npx", "@playwright/mcp@latest"], "timeout": 30000 },
    "chrome-devtools": { "type": "local", "command": ["npx", "-y", "chrome-devtools-mcp@latest", "--no-usage-statistics"], "timeout": 30000 }
  }
}
```

> [!info] Buong detalye ng bawat isa
> Detalyadong gabay sa pag-install ng bawat MCP server (kasama ang graft, open-design, postgres/mysql) may sariling prerequisites ay nasa [[mcp-servers]] — halimbawang pangkalahatan lang ang ipinapakita ng pahinang ito.

Tignan ang status pagkatapos idagdag ang config:

```bash
opencode mcp list
```

---

## Part 4 — I-install ang Plugins

### Plugin mula sa npm/git package (halimbawa: superpowers)

```jsonc
{
  "plugin": ["superpowers@git+https://github.com/obra/superpowers.git"]
}
```

Isara at buksan ulit ang OpenCode (nag-lo-load ang mga plugin lang kapag nagsisimula ang session) pagkatapos tignan:

```bash
opencode debug skill
```

> [!warning] Kung na-block ng network ang GitHub
> Maraming organisasyon/kompanya ang nag-b-block ng github.com sa pamamagitan ng firewall, na sumisira sa pag-install ng plugin via git URL — **tignan muna ang aktwal na error message** bago maghanap ng ayos, dahil may 2 magkaibang dahilan na may magkaibang ayos:
>
> 1. **Direktang may lumalabas na block page** (hal. FortiGate's "Application Blocked") → talagang na-block ng network ayon sa IT policy. Huwag subukang lampasan — gamitin ang paraan sa ibaba, o hilingin sa IT na i-allowlist.
> 2. **Ang error ay `unable to get local issuer certificate`** → pinapayagan ng network, pero hindi pinagkakatiwalaan ng `git` ang certificate na ginagamit ng organisasyon para sa SSL inspection (nagtitiwala ang browser dahil naka-install sa OS ang CA, pero gumagamit ang git ng sarili nitong certificate store). May teknikal na ayos ito, pero palaging kausapin muna ang user/IT bago aplayin.
>
> Buong ayos para sa dalawang kaso ay nasa [[plugins]].

### Plugin mula sa npm package (halimbawa: ponytail)

Hindi lahat ng plugin ay kailangang galing sa git URL — ang iba ay plain na npm package, mas madaling i-install dahil walang problema sa GitHub block/SSL cert gaya ng superpowers:

```jsonc
{
  "plugin": [
    "superpowers@git+https://github.com/obra/superpowers.git",
    "@dietrichgebert/ponytail"
  ]
}
```

I-restart ang OpenCode at subukan ang `/ponytail-help` para kumpirmahin na na-activate ito — buong detalye ng command/config sa [[plugins]].

### Plugin mula sa local git clone (halimbawa: i-have-adhd)

May mga plugin na wala sa npm at hindi direktang suportado ang `git+https://` sa `plugin` array — i-clone muna ang source sa lokal, pagkatapos ituro ang `plugin` sa `.mjs`/`.js` file sa loob nito:

```bash
git clone https://github.com/ayghri/i-have-adhd ~/.config/opencode/vendor/i-have-adhd
```

```jsonc
{
  "plugin": [
    "superpowers@git+https://github.com/obra/superpowers.git",
    "@dietrichgebert/ponytail",
    "C:/Users/<user>/.config/opencode/vendor/i-have-adhd/.opencode/plugins/i-have-adhd.mjs"
  ]
}
```

I-restart ang OpenCode at i-type ang `/i-have-adhd` sa isang session para i-on ito — buong detalye ng toggle/always-on sa [[plugins]].

### Plugin na sarili mong sinulat (custom .js)

Ilagay ang `.js` file kahit saan (inirerekumenda ang `~/.config/opencode/plugin/<name>.js` para sa isang bagay na gagamitin ng bawat project), pagkatapos idagdag ang path nito sa `plugin` array:

```jsonc
{
  "plugin": [
    "superpowers@git+https://github.com/obra/superpowers.git",
    "C:/Users/<user>/.config/opencode/plugin/my-plugin.js"
  ]
}
```

Ang structure ng plugin ay dapat mag-export ng async function na tumatanggap ng `{ directory }` at nagbabalik ng object ng hooks — buong halimbawa nasa [[plugins]] (graft-deep).

### Standalone na skills batay sa Agent Skills open standard (hindi plugin)

Hindi lahat ng extra ay kailangang galing sa `plugin` array — ang iba ay isang standalone `SKILL.md` file lang na sumusunod sa open **Agent Skills** standard (sinimulan ng Anthropic, ngayon ay open standard na suportado ng ilang tool, kasama ang OpenCode). Ilagay lang ang file sa tamang lugar at gagana na agad — walang kailangang i-edit sa `opencode.jsonc`.

Naghahanap ang OpenCode ng skills sa 3 lugar:

| Lokasyon | Saklaw |
| --- | --- |
| `<project>/.opencode/skills/<name>/SKILL.md` | Para lang sa project na iyon |
| `~/.config/opencode/skills/<name>/SKILL.md` | Bawat project (global) |
| `<project>/.claude/skills/<name>/SKILL.md` | Compatible sa Claude Code (parehong file gumagana sa dalawang tool) |

Pinakasimpleng structure ng file:

```markdown
---
name: my-skill
description: Maikling paglalarawan kung kailan gagamitin ang skill na ito (ginagamit ito ng model para magdesisyon kung kailan tatawagin)
---

Buong nilalaman ng instruction na gusto mong sundin ng agent kapag tinawag ang skill na ito
```

> [!warning] Hindi awtomatikong slash command (kaiba sa Claude Code)
> Ang isang skill na ganito **ay hindi nagiging `/my-skill`** na maaaring direktang i-type sa OpenCode — ang model mismo ang nagdedesisyon kung aling skill ang tatawagin, sa pamamagitan ng pagtutugma ng in-type mo laban sa `description` field ng bawat skill (sa pamamagitan ng native `skill` tool). Kaya kailangang malinaw ang `description` para tama ang pagtutugma ng model. Kung gusto mo ng 100% katiyakan ng tunay na slash command, gumawa ng hiwalay na custom command sa `.opencode/commands/<name>.md` sa halip (tignan ang [OpenCode Commands docs](https://opencode.ai/docs/commands/)).

> [!note] Tahimik na iniiwasan ang mga field na hindi kilala ng OpenCode
> May mga skill na ginaling sa Claude Code na may mga Claude-Code-specific na frontmatter field, gaya ng `disable-model-invocation` — suportado lang ng OpenCode ang `name`, `description`, `license`, `compatibility`, at `metadata`. Anumang ibang field ay tahimik na nilalaktawan, walang error, hindi na kailangang alisin bago gamitin.

Isang tunay na halimbawa ng pag-install (ang `grill-me`/`grilling` skill mula sa mattpocock/skills, naka-wire sa superpowers) ay nasa [[plugins]].

### AGENTS.md — global vs project na instructions

Ang `AGENTS.md` ay isang instruction file na binabasa ng OpenCode sa bawat session (parang extra system prompt). May 2 level ito:

1. **Project** — naglalakad paakyat mula sa working directory naghahanap ng `AGENTS.md` (o `CLAUDE.md`) sa repo na iyon — ito ang file na awtomatikong sinusulat ng `graft init --agents agents --no-global` bawat repo (tignan [[mcp-servers]]).
2. **Global** — `~/.config/opencode/AGENTS.md` — saklaw ang **bawat project**. Walang installer na gumagawa ng file na ito nang awtomatiko; ikaw mismo ang sumusulat nito.

> [!info] Kumpirmado mula sa aktwal na test — magkasamang ginagamit ang project at global file, hindi pinipili lang ang isa
> Sinubukan nang totoo sa isang project na may parehong project-level `AGENTS.md` (mula sa `graft init`) at global `~/.config/opencode/AGENTS.md` (ang rule ng reconciliation ng grill-me/grilling — tignan [[plugins]]) sabay-sabay — nag-reference ang model ng nilalaman mula sa pareho sa parehong turn (makikita mismo sa reasoning trace nito na literal na sumipi ng pangungusap mula sa global AGENTS.md). Sa maikli: **ang rule na nakasulat sa global ay laging may bisa, may project file man o wala**.

> [!tip] Kailan dapat sumulat sa global sa halip na project
> Sumulat sa global kapag dapat "laging" mag-apply ang rule sa bawat project (hal. paraan ng pag-reconcile ng dalawang skill na maaaring magbanggaan). Sumulat sa project kapag specific ito sa context ng repo na iyon (hal. context graph ng graft) — tunay na halimbawa na kailangang isulat sa global ay nasa [[plugins]], seksyong grill-me/grilling.

---

## Part 5 — Magdagdag ng project-specific na MCPs (per-project opt-in)

May ilang MCP na kailangan ng credentials/state na specific sa isang project (hal. koneksyon sa database, sariling code graph ng repo na iyon). Ang ligtas na paraan:

1. I-set ang `enabled: false` sa **global config** (`~/.config/opencode/opencode.jsonc`)
2. I-override ito sa isang **project-level** na config — gumawa ng file na ito sa root ng repo na iyon (awtomatikong pinagsasama ito ng OpenCode sa ibabaw ng global, walang kailangan pang i-set):

```jsonc
// project-root/opencode.jsonc
{
  "mcp": {
    "postgres": { "enabled": true }
  }
}
```

3. I-set ang env var na kailangan ng MCP na iyon (hal. `POSTGRES_CONNECTION_STRING`) bago patakbuhin ang `opencode` sa project na iyon.

---

## Kumpirmahin na kumpleto ang lahat

```bash
opencode mcp list        # tignan ang lahat ng MCP servers
opencode debug skill     # tignan kung anong skills/plugins ang matagumpay na na-load
opencode debug config    # tignan ang buong na-resolve na config
```

> [!danger] Ipinapakita ng `opencode debug config` ang API keys sa plaintext
> Ipinapakita ng command na ito ang mga aktwal na na-resolve na env var value (hindi ang `{env:...}` placeholder) — kung ipapasta mo ang resulta kahit saan para ibahagi sa iba, palaging tanggalin/itago muna ang anumang `apiKey` value.

---

## Susunod na hakbang

Tapos na ang setup — basahin ang [[USER-MANUAL]] para sa aktwal na araw-araw na paggamit, o [[gotchas]] kung may problemang naranasan sa daan.
