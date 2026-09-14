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
| [plugins.md](plugins.md) | superpowers, `grill-me`/`grilling` (isang batch-interview skill na dagdag sa superpowers), ang custom na `graft-deep` plugin, `ponytail` (buong source code + ang OpenCode Plugin Hook API), at `i-have-adhd` (maikli, diretso-sa-punto na istilo ng sagot) |
| [USER-MANUAL.md](USER-MANUAL.md) | Aktwal na araw-araw na paggamit — vibe coding, ang graft workflow, ang OpenDesign → OpenCode workflow |
| [gotchas.md](gotchas.md) | 8 aktwal na problemang naranasan, may kasamang ayos (Windows PATH/env snapshotting, native module ABI mismatch, reasoning-model output cap, atbp.) |
| [updating.md](updating.md) | Paano i-update/i-upgrade ang OpenCode CLI, MCP servers, plugins, at OpenDesign, isa-isa |

## Saklaw na Stack

- **OpenCode CLI** + self-hosted/cloud model provider
- **MCP servers**: context7, playwright, chrome-devtools, [graft](https://github.com/trailhq/Graft) (code-graph), [OpenDesign](https://github.com/nexu-io/open-design), memory (persistent context), [SonarQube](https://github.com/SonarSource/sonarqube-mcp-server) (code quality/security, self-hosted), [Trivy](https://github.com/aquasecurity/trivy-mcp) (vulnerability/secret/misconfig scan, standalone CLI), [GitHub](https://github.com/github/github-mcp-server) (issues/PR), postgres/mysql
- **Plugins**: [superpowers](https://github.com/obra/superpowers) (skill library) + custom na `graft-deep` plugin + [ponytail](https://github.com/dietrichgebert/ponytail) (code-minimization ruleset) + [i-have-adhd](https://github.com/ayghri/i-have-adhd) (maikli, action-first na istilo ng output)
- **Skills (Agent Skills open standard, hindi plugin)**: [grill-me / grilling](https://github.com/mattpocock/skills) — isang batch interview na dagdag sa `brainstorming` ng superpowers

---

*Personal reference lang ang repo na ito — generic ang laman, walang identifying information (napalitan na ng placeholder ang mga path/URL/credential na specific sa makina).*
