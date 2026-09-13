# OpenCode Setup Manual (English)

A detailed setup and usage manual for [OpenCode](https://opencode.ai/) CLI — from a blank machine with nothing installed, to MCP servers, Plugins, and real day-to-day vibe-coding workflows.

> [🇹🇭 อ่านภาษาไทย](../th/README.md) · [🇵🇭 Basahin sa Filipino](../fil/README.md) · [🇱🇦 ອ່ານພາສາລາວ](../lo/README.md)

> This English side is also written as part of the same [Obsidian](https://obsidian.md/) vault as `th/`, `fil/`, and `lo/` — the content pages below link to each other with `[[wikilink]]`s, so open this folder in Obsidian for the best reading experience (clickable links, graph view). This page itself (`README.md`) uses plain markdown links instead, since it's GitHub's landing page for this folder and renders best there.

## Start reading here

| File | Contents |
| --- | --- |
| [index.md](index.md) | Overview of the whole stack actually in use |
| [sdlc.md](sdlc.md) | Overview of all 7 Software Development Life Cycle phases, and which ones this manual covers |
| [setup.md](setup.md) | **Start here if nothing is installed yet** — Node.js, Git, OpenCode CLI, provider, MCP, plugins, every step |
| [mcp-servers.md](mcp-servers.md) | Details on each MCP server (context7, playwright, chrome-devtools, graft, open-design, memory, sonarqube, trivy, github, postgres/mysql) with its own install steps |
| [plugins.md](plugins.md) | superpowers, `grill-me`/`grilling` (a batch-interview skill that complements superpowers), the custom `graft-deep` plugin, `ponytail` (full source + the OpenCode Plugin Hook API), and `i-have-adhd` (terse, to-the-point reply style) |
| [USER-MANUAL.md](USER-MANUAL.md) | Real day-to-day usage — vibe coding, the graft workflow, the OpenDesign → OpenCode workflow |
| [gotchas.md](gotchas.md) | 8 real problems hit in practice, with fixes (Windows PATH/env snapshotting, native module ABI mismatches, reasoning-model output caps, etc.) |
| [updating.md](updating.md) | How to update/upgrade the OpenCode CLI, MCP servers, plugins, and OpenDesign, one at a time |

## Stack covered

- **OpenCode CLI** + a self-hosted/cloud model provider
- **MCP servers**: context7, playwright, chrome-devtools, [graft](https://github.com/trailhq/Graft) (code-graph), [OpenDesign](https://github.com/nexu-io/open-design), memory (persistent context), [SonarQube](https://github.com/SonarSource/sonarqube-mcp-server) (code quality/security, self-hosted), [Trivy](https://github.com/aquasecurity/trivy-mcp) (vulnerability/secret/misconfig scan, standalone CLI), [GitHub](https://github.com/github/github-mcp-server) (issues/PR), postgres/mysql
- **Plugins**: [superpowers](https://github.com/obra/superpowers) (skill library) + a custom `graft-deep` plugin + [ponytail](https://github.com/dietrichgebert/ponytail) (code-minimization ruleset) + [i-have-adhd](https://github.com/ayghri/i-have-adhd) (terse, action-first output style)
- **Skills (Agent Skills open standard, not a plugin)**: [grill-me / grilling](https://github.com/mattpocock/skills) — a batch interview that complements superpowers' `brainstorming`

---

*This repo is a personal reference — content is generic, with no identifying information (machine-specific paths/URLs/credentials have all been replaced with placeholders).*
