---
tags: [project-doc, overview, opencode, ai-agent]
updated: 2026-09-13
summary: Home page ng OpenCode CLI setup at usage manual — saklaw ang MCP servers, Plugins, at Skills (Agent Skills open standard) para sa vibe coding
---

# OpenCode — Vibe Coding Setup

Ang **OpenCode** ay isang CLI-based AI coding agent (kapareho ng direksyon ng Claude Code) na malayang pinipili mo ang sariling model provider — kasama ang self-hosted model sa sarili mong server — at may kumpletong extensible **MCP (Model Context Protocol)** at **Plugin** system.

Itong set ng dokumento ay talaan ng aktwal, gumaganang setup — mula sa pag-install ng CLI sa walang laman na makina, hanggang sa pag-wire ng home model (self-hosted llama.cpp) + 11 MCP servers (8 naka-enable, 3 naghihintay ma-turn on per-project o menu ng token) + 4 plugins, kasama ang mga aktwal na problemang naranasan sa daan at mga kumpirmadong ayos.

---

## 🧩 Stack na aktwal na ginagamit

| Bahagi | Detalye |
| --- | --- |
| **OpenCode CLI** | v1.18.18+, naka-install via `npm install -g opencode-ai` (global) |
| **Pangunahing model provider** | `home-llamacpp` — self-hosted llama.cpp server (URL na specific sa bawat makina), model na `qwen3.8-27b` (Q4_K, 131k context) sa pamamagitan ng OpenAI-compatible endpoint |
| **Backup model (mabilis)** | `opencode/deepseek-v4-flash-free` — built-in sa OpenCode mismo, walang kailangang extra na API key, mabilis sumagot (~10 segundo) |
| **MCP servers** | context7 (docs), playwright + chrome-devtools (browser automation/debug), graft (code-graph/context — per-project), open-design (kumukuha ng files mula sa isang OpenDesign project), memory (natatandaan ang context kahit magpalit ng session), sonarqube (code quality/security — self-hosted via Docker), trivy (vulnerability/secret/misconfig scan — standalone CLI), github (issues/PR — naka-disable hanggang may PAT), postgres/mysql (naka-disable by default, ine-enable per project) |
| **Plugins** | superpowers (skill library mula sa obra/superpowers), graft-deep (custom plugin — auto-inject context na lang ngayon; ang auto-rebuild ng graph ay trabaho na ng graft CLI mismo), ponytail (ruleset na nagpapaikli ng hindi kinakailangang code — mula sa dietrichgebert/ponytail), i-have-adhd (pinipilit na maikli, diretso-sa-punto na sagot — mula sa ayghri/i-have-adhd) |
| **Skills** (Agent Skills open standard, hindi plugin) | grill-me / grilling (mula sa mattpocock/skills) — isang batch interview na nagtatanong sa user sa mga round bago simulan ang trabaho, naka-wire sa `brainstorming` ng superpowers para hindi magbanggaan |
| **Pangunahing config** | `~/.config/opencode/opencode.jsonc` (manu-manong sinulat) + `~/.config/opencode/opencode.json` (auto-sinulat ng `od mcp install`) |

---

## 📖 Mga Wiki Page

- [[sdlc]] — buod ng lahat ng 7 phase ng Software Development Life Cycle, kasama ang alin sa mga ito ang aktwal na saklaw ng manual na ito (at ang mga gap na wala pa)
- [[setup]] — detalyadong gabay sa pag-install, mula sa **walang laman na makina** na walang Node.js/Git, hanggang sa kumpletong naka-wire na provider/MCP/plugin
- [[mcp-servers]] — detalye ng bawat MCP server: hakbang sa pag-install, config, at paano subukan ang bawat isa
- [[plugins]] — superpowers, grill-me/grilling (batch-interview skill na dagdag sa superpowers), custom na plugin na graft-deep (buong source code + ang OpenCode Plugin Hook API), ponytail (code-minimization ruleset), at i-have-adhd (maikli, diretso-sa-punto na sagot)
- [[USER-MANUAL]] — aktwal na araw-araw na paggamit: vibe coding, ang graft workflow, ang OpenDesign workflow
- [[gotchas]] — 8 aktwal na problemang naranasan may kasamang ayos (Windows PATH/env snapshotting, mabagal na model, native module ABI mismatch, reasoning-model output cap, atbp.)
- [[updating]] — paano i-update/i-upgrade ang OpenCode CLI, MCP servers, plugins, at OpenDesign, isa-isa

---

## 🚀 Quick Start

```bash
# 1. I-install ang CLI
npm install -g opencode-ai

# 2. Kumpirmahin na tama ang pag-install
opencode --version

# 3. Subukan agad (walang extra setup — gagamit ng built-in na libreng model)
opencode run -m opencode/deepseek-v4-flash-free "say hi"

# 4. Buksan ang TUI sa isang project
cd my-project
opencode
```

Ang kumpletong setup ng provider/MCP/plugin mula sa simula ay nasa [[setup]]

---

## ⚠️ Bakit kailangan ng backup provider (opencode/deepseek-v4-flash-free)

Ang home model (`home-llamacpp/qwen3.8-27b`) ay awtomatikong nagiging **default model** ng OpenCode, dahil ito ang tanging provider na may tunay na configured na credentials — pero ang mabigat na context mula sa superpowers + 5 MCP servers ay nagpapabagal sa bawat turn (minsan lampas 1–2 minuto).

Ang mga external na tool na may maikling timeout (hal. ang OpenDesign wizard, na naka-set sa 45 segundo) ay agad na mabibigo kapag nasagi ang modelong ito — kaya may mabilis, libreng model na naka-reserba bilang backup para sa ganitong sitwasyon.

> [!tip] Magbasa pa
> Ang kumpletong diagnosis at ayos para sa problemang ito ay nasa [[gotchas]], item 1
