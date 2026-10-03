# OpenCode Setup Manual (Filipino)

Detalyadong gabay sa pag-setup at paggamit ng [OpenCode](https://opencode.ai/) CLI — mula sa walang laman na makina, hanggang sa MCP servers, Plugins, at aktwal na araw-araw na vibe-coding workflows.

> [🇹🇭 อ่านภาษาไทย](../th/README.md) · [🇬🇧 Read in English](../en/README.md) · [🇱🇦 ອ່ານພາສາລາວ](../lo/README.md)

> Bahagi ito ng parehong [Obsidian](https://obsidian.md/) vault gaya ng `th/`, `en/`, at `lo/` — ang mga content page sa ibaba ay naka-link sa isa't isa gamit ang `[[wikilink]]`, kaya buksan ang folder na ito sa Obsidian para sa pinakamahusay na karanasan sa pagbabasa (clickable links, graph view). Ang pahinang ito (`README.md`) ay gumagamit ng plain markdown links dahil ito ang landing page para sa GitHub.

## Magsimula dito

| File | Nilalaman |
| --- | --- |
| [index.md](index.md) | Buod ng buong stack na aktwal na ginagamit |
| [sdlc.md](sdlc.md) | Buod ng lahat ng 7 phase ng Software Development Life Cycle, at kung alin sa mga ito ang saklaw ng manual na ito |
| [architecture.md](architecture.md) | Ang buong stack sa pamamagitan ng 4 functional layer (Knowledge/Reasoning/Execution/Governance) sa halip na ayon sa technical mechanism |
| [setup.md](setup.md) | **Magsimula dito kung wala pang naka-install** — Node.js, Git, OpenCode CLI, provider, MCP, plugins, bawat hakbang |
| [mcp-servers.md](mcp-servers.md) | Detalye ng bawat MCP server (context7, playwright, chrome-devtools, graft, open-design, memory, sonarqube, trivy, github, postgres/mysql) kasama ang sariling hakbang sa pag-install |
| [plugins.md](plugins.md) | superpowers, `grill-me`/`grilling` (isang batch-interview skill na dagdag sa superpowers), ang custom na `graft-deep` plugin, `ponytail` (buong source code + ang OpenCode Plugin Hook API), at `caveman` (maikli, diretso-sa-punto na sagot — ginagamit sa halip na `i-have-adhd`) |
| [USER-MANUAL.md](USER-MANUAL.md) | **Mula simula hanggang tapos** (magbukas ng session → mag-request → mag-approve → suriin → commit) at aktwal na araw-araw na paggamit — vibe coding, ang graft workflow, ang OpenDesign → OpenCode workflow |
| [gotchas.md](gotchas.md) | 19 aktwal na problemang naranasan, may kasamang ayos (Windows PATH/env snapshotting, native module ABI mismatch, reasoning-model output cap, prompt na lumaki dahil sa MCP tools, skill na nananaig sa AGENTS.md, atbp.) |
| [updating.md](updating.md) | Paano i-update/i-upgrade ang OpenCode CLI, MCP servers, plugins, at OpenDesign, isa-isa |
| [tuning.md](tuning.md) | **Sukatin, saka i-tune** — laki ng prompt bawat turn, aling tools ang talagang tinatawag ng agent, isang end-to-end na test ng workflow (kasama ang mga larawan ng resulta at scripts sa `scripts/`) |
| [../config/](../config/README.md) | **Mga file na handang kopyahin** — ang template ng `opencode.jsonc`, global `AGENTS.md`, at `graft-deep.js` plugin na aktwal na ginagamit ng setup na ito |
| [../AGENT-SETUP.md](../AGENT-SETUP.md) | **Ipagawa ang setup sa AI agent** — ang parehong proseso ng setup.md sa anyong kayang sundin ng agent, may check pagkatapos ng bawat hakbang |

## Saklaw na Stack

- **OpenCode CLI** + self-hosted/cloud model provider
- **MCP servers**: context7, playwright, chrome-devtools, [graft](https://github.com/trailhq/Graft) (code-graph), [OpenDesign](https://github.com/nexu-io/open-design), memory (persistent context), [SonarQube](https://github.com/SonarSource/sonarqube-mcp-server) (code quality/security, self-hosted), [Trivy](https://github.com/aquasecurity/trivy-mcp) (vulnerability/secret/misconfig scan, standalone CLI), [GitHub](https://github.com/github/github-mcp-server) (issues/PR), postgres/mysql
- **Plugins**: [superpowers](https://github.com/obra/superpowers) (skill library) + custom na `graft-deep` plugin + [ponytail](https://github.com/dietrichgebert/ponytail) (code-minimization ruleset) + [caveman](https://github.com/JuliusBrussee/caveman) (maikling sagot — skill lang; kapalit ng i-have-adhd)
- **Skills (Agent Skills open standard, hindi plugin)**: [grill-me / grilling](https://github.com/mattpocock/skills) — isang batch interview na dagdag sa `brainstorming` ng superpowers

---

*Personal reference lang ang repo na ito — generic ang laman, walang identifying information (napalitan na ng placeholder ang mga path/URL/credential na specific sa makina).*
