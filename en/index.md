---
tags: [project-doc, overview, opencode, ai-agent]
updated: 2026-09-14
summary: Home page for the OpenCode CLI setup and usage manual, covering MCP servers, Plugins, and Skills (Agent Skills open standard) for vibe coding
---

# OpenCode — Vibe Coding Setup

**OpenCode** is a CLI-based AI coding agent (in the same vein as Claude Code) that lets you freely bring your own model provider — including a self-hosted model on your own server — and ships with a fully extensible **MCP (Model Context Protocol)** and **Plugin** system.

This set of docs records a real, working setup — from installing the CLI on a blank machine to wiring up a home model (self-hosted llama.cpp) + 11 MCP servers (8 enabled, 3 waiting to be turned on per-project or for a token) + 4 plugins, along with real problems hit along the way and confirmed fixes.

---

## 🧩 Stack actually in use

| Component | Details |
| --- | --- |
| **OpenCode CLI** | v1.18.18+, installed via `npm install -g opencode-ai` (global) |
| **Primary model provider** | `home-llamacpp` — a self-hosted llama.cpp server (URL specific to each machine), model `qwen3.8-27b` (Q4_K, 131k context) via an OpenAI-compatible endpoint |
| **Fallback model (fast)** | `opencode/deepseek-v4-flash-free` — built into OpenCode itself, no extra API key needed, fast replies (~10s) |
| **MCP servers** | context7 (docs), playwright + chrome-devtools (browser automation/debug), graft (code-graph/context — per-project), open-design (pulls files from an OpenDesign project), memory (context that persists across sessions), sonarqube (code quality/security — self-hosted via Docker), trivy (vulnerability/secret/misconfig scan — standalone CLI), github (issues/PR — disabled until a PAT exists), postgres/mysql (disabled by default, enabled per project) |
| **Plugins** | superpowers (skill library from obra/superpowers), graft-deep (custom plugin — auto-inject context only now; auto-rebuilding the graph is graft CLI's own job), ponytail (a ruleset that trims unnecessary code — from dietrichgebert/ponytail), i-have-adhd (forces terse, to-the-point replies — from ayghri/i-have-adhd) |
| **Skills** (Agent Skills open standard, not a plugin) | grill-me / grilling (from mattpocock/skills) — a batch interview that questions the user in rounds before starting work, wired to superpowers' `brainstorming` so the two don't collide |
| **Main config** | `~/.config/opencode/opencode.jsonc` (hand-written) + `~/.config/opencode/opencode.json` (auto-written by `od mcp install`) |

---

## 📖 Wiki Pages

- [[sdlc]] — an overview of all 7 Software Development Life Cycle phases, with pointers to which phases this manual actually covers (and the gaps that remain)
- [[architecture]] — the whole stack viewed through 4 functional layers (Knowledge/Reasoning/Execution/Governance) instead of by technical mechanism, for answering "which layer does this new tool belong to"
- [[setup]] — a detailed install guide, from a **blank machine** with no Node.js/Git all the way to a fully wired provider/MCP/plugin setup
- [[mcp-servers]] — details on every MCP server: install steps, config, and how to test each one
- [[plugins]] — superpowers, grill-me/grilling (a batch-interview skill that complements superpowers), the custom `graft-deep` plugin (full source + the OpenCode Plugin Hook API), ponytail (a code-minimization ruleset), and i-have-adhd (terse, to-the-point replies)
- [[USER-MANUAL]] — real day-to-day usage: vibe coding, the graft workflow, the OpenDesign workflow
- [[gotchas]] — 8 real problems hit in practice with fixes (Windows PATH/env snapshotting, a slow model, native module ABI mismatches, reasoning-model output caps, etc.)
- [[updating]] — how to update/upgrade the OpenCode CLI, MCP servers, plugins, and OpenDesign, one at a time

---

## 🚀 Quick Start

```bash
# 1. Install the CLI
npm install -g opencode-ai

# 2. Confirm it installed correctly
opencode --version

# 3. Try it immediately (no extra setup — uses the built-in free model)
opencode run -m opencode/deepseek-v4-flash-free "say hi"

# 4. Open the TUI in a project
cd my-project
opencode
```

Full provider/MCP/plugin setup from scratch is at [[setup]]

---

## ⚠️ Why keep a fallback provider (opencode/deepseek-v4-flash-free)

The home model (`home-llamacpp/qwen3.8-27b`) automatically becomes OpenCode's **default model**, since it's the only provider with real credentials configured — but the heavy context from superpowers + 5 MCP servers makes each turn slow (sometimes over 1–2 minutes).

External tools with short timeouts (e.g. the OpenDesign wizard, which sets a 45-second timeout) fail outright if they hit this model — so a fast, free model is kept on hand as a fallback for exactly this situation.

> [!tip] Read more
> Full diagnosis and fix for this issue is in [[gotchas]], item 1
