---
tags: [project-doc, setup, opencode, beginner-friendly]
updated: 2026-09-13
summary: A detailed OpenCode install guide from a blank machine — Node.js, Git, the CLI, provider, MCP servers, plugins, Agent Skills open-standard skills, and AGENTS.md (global vs project), every step
---

# Setup

> Full stack overview at [[index]] — this page is the detailed install walkthrough, written so you can follow it from **a completely blank machine** all the way to a working setup.

> [!tip] Reading order
> Follow Part 0 → 1 → 2 → 3 → 4 → 5 in order, don't skip — each Part depends on what the previous one finished.

---

## Part 0 — Get the machine ready (for a blank machine)

If your machine already has Node.js and Git, skip straight to [Part 1](#part-1--install-the-opencode-cli). If unsure, check first with:

```bash
node --version
npm --version
git --version
```

If any command says `command not found`, it's not installed yet — install it below.

### Install Node.js + npm

Node.js is what OpenCode and nearly every MCP server needs to run (npm ships with Node.js automatically, no separate install).

**Windows:**
1. Go to [nodejs.org](https://nodejs.org/) → download the **LTS** version (the recommended one, not Current)
2. Run the `.msi` installer, click Next through the defaults (the installer adds Node/npm to PATH automatically)
3. **Close every open terminal and open a new one** (important — old terminals won't see the freshly updated PATH; see [[gotchas]], item 2, for why)
4. Verify: `node --version` should print a version number like `v22.x.x`

**macOS:**
```bash
# Using Homebrew (install from https://brew.sh first if you don't have it)
brew install node
```

**Linux (Debian/Ubuntu):**
```bash
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs
```

> [!note] Minimum version
> Node.js 20+ is recommended (the latest LTS as of writing is Node 22/24) — some MCP servers may not work on older versions.

### Install Git

Needed to install plugins that come from `git+https://` (e.g. superpowers).

**Windows:** download from [git-scm.com](https://git-scm.com/download/win), run the installer, click Next through the defaults (they're fine for normal use).

**macOS:** usually already present (try `git --version` — if missing, macOS will offer to install the Xcode Command Line Tools for you), or `brew install git`.

**Linux:** `sudo apt-get install git` (Debian/Ubuntu) or your distro's package manager.

### Prepare at least one LLM

OpenCode needs at least one "model" to talk to before it's actually usable. There are 3 options — pick whichever you have:

| Option | Good for | Extra setup needed? |
| --- | --- | --- |
| **OpenCode's built-in free model** (e.g. `opencode/deepseek-v4-flash-free`) | Trying it out immediately with zero setup | No — works right after installing the CLI |
| **Cloud provider** (OpenAI, Anthropic, etc.) | Already have an API key for one of these | `opencode auth login` |
| **Self-hosted model** (llama.cpp, Ollama, vLLM, etc.) | Already run a model server, want to plug it in | Manual `provider` config — see [Part 2](#part-2--set-up-a-model-provider) |

> [!tip] Recommended for beginners
> Start with the built-in free model first (no setup at all), then add a self-hosted/cloud provider later once you're ready — you'll see OpenCode actually working the fastest way possible, without waiting to configure everything up front.

---

## Part 1 — Install the OpenCode CLI

```bash
npm install -g opencode-ai
```

Confirm it installed correctly:

```bash
opencode --version
```

Should print a version number like `1.18.18`.

### Try it immediately (no extra setup)

```bash
opencode run -m opencode/deepseek-v4-flash-free "say hi"
```

If you get a reply back, the CLI works correctly — ready to move on to the extras.

### Getting to know OpenCode's config

The main config lives at `~/.config/opencode/` — **the same path on every OS** (Windows/macOS/Linux, no exceptions). This folder might not exist right after a fresh install; create it yourself if needed.

Config files OpenCode loads (and merges together if more than one exists):

- `config.json`
- `opencode.json`
- `opencode.jsonc` *(supports comments — recommended as your main hand-edited file)*

> [!note] Why there might be 2 files
> Some MCP installers (e.g. `od mcp install`) auto-generate a separate `opencode.json`, while you keep everything else in `opencode.jsonc` — don't be surprised to find both files together; OpenCode merges them fine on its own.

Create a starter file by hand (if you don't have one yet):

```jsonc
// ~/.config/opencode/opencode.jsonc
{
  "$schema": "https://opencode.ai/config.json"
}
```

---

## Part 2 — Set up a Model Provider

Skip this Part entirely if you're only going to use OpenCode's built-in free model.

### Self-hosted (example: an OpenAI-compatible llama.cpp server)

Add to `~/.config/opencode/opencode.jsonc`:

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
          "name": "any display name",
          "limit": { "context": 131072, "output": 32768 }
        }
      }
    }
  }
}
```

Replace:
- `home-llamacpp` — pick any provider name (you'll call it via `-m home-llamacpp/your-model-id`)
- `https://your-server/v1` — your server's real URL
- `your-model-id` — the model name as your server reports it (check with `curl https://your-server/v1/models`)

> [!tip] Why output = 32768
> If the model is a reasoning model (has a thinking mode, like Qwen3), too low an output ceiling can make the agent "stop mid-thought" — 32768 matches Qwen's own recommendation for general work. Full details in [[gotchas]], item 8.

> [!warning] Never hardcode an API key directly in the file
> Always use `{env:VAR_NAME}` instead of typing the API key value straight into the file — OpenCode will pull it from the environment variable you set instead. How to set that env var:
>
> - **Windows:** open "Edit the system environment variables" → Environment Variables → New (System variable) → name it `HOME_LLAMACPP_API_KEY` with the API key as the value
> - **macOS/Linux:** add a line `export HOME_LLAMACPP_API_KEY="your-key"` to `~/.zshrc`, `~/.bashrc`, or whichever shell profile you use, then `source` it again (or open a new terminal)
>
> **After setting it, always close and reopen the terminal/app that will run opencode** — a process that was already running won't see the new value. Details in [[gotchas]], item 2.

### Cloud provider

```bash
opencode auth login
```

A wizard walks you through picking a provider (OpenAI, Anthropic, etc.) and entering an API key.

### Confirm the provider works

```bash
opencode models | grep home-llamacpp
opencode run -m home-llamacpp/your-model-id "say hi"
```

If you get a reply back, the provider is wired up correctly.

---

## Part 3 — Install MCP Servers

MCP (Model Context Protocol) is what lets OpenCode call extra "tools" (searching docs, controlling a browser, querying a database, etc.). Most MCP servers don't need `npm install -g` ahead of time — OpenCode runs `npx -y` for you the first time it connects.

Basic example config (add to `opencode.jsonc`):

```jsonc
{
  "mcp": {
    "context7": { "type": "remote", "url": "https://mcp.context7.com/mcp" },
    "playwright": { "type": "local", "command": ["npx", "@playwright/mcp@latest"], "timeout": 30000 },
    "chrome-devtools": { "type": "local", "command": ["npx", "-y", "chrome-devtools-mcp@latest", "--no-usage-statistics"], "timeout": 30000 }
  }
}
```

> [!info] Full detail on every server
> An in-depth install guide for each MCP server (including graft, open-design, postgres/mysql) with its own prerequisites is at [[mcp-servers]] — this page only shows a quick overview example.

Check status after adding config:

```bash
opencode mcp list
```

---

## Part 4 — Install Plugins

### A plugin from an npm/git package (example: superpowers)

```jsonc
{
  "plugin": ["superpowers@git+https://github.com/obra/superpowers.git"]
}
```

Close and reopen OpenCode (plugins only load when a session starts) then check:

```bash
opencode debug skill
```

> [!warning] If the network blocks GitHub
> Many organizations block github.com via a firewall, which breaks installing a plugin via a git URL — **look at the actual error message first** before trying to fix anything, because there are 2 distinct causes with 2 different fixes:
>
> 1. **You get an outright block page** (e.g. FortiGate's "Application Blocked") → the network really is blocking it by policy. Don't try to bypass it — use the local-path method below instead, or ask IT to allowlist it.
> 2. **The error is `unable to get local issuer certificate`** → the network allows it, but `git` doesn't trust the certificate the organization uses for SSL inspection (unlike a browser, which trusts it because the OS has the CA installed). This one has a technical fix, but always talk to the user/IT before applying it.
>
> Full fixes for both cases are in [[plugins]].

### A plugin from an npm package (example: ponytail)

Not every plugin has to come from a git URL — some are plain npm packages, easier to install since they don't have superpowers' GitHub-block/SSL-cert issues:

```jsonc
{
  "plugin": [
    "superpowers@git+https://github.com/obra/superpowers.git",
    "@dietrichgebert/ponytail"
  ]
}
```

Restart OpenCode and try `/ponytail-help` to confirm it activated — full command/config details in [[plugins]].

### A plugin from a local git clone (example: i-have-adhd)

Some plugins aren't on npm and don't support `git+https://` directly via the `plugin` array — clone the source locally first, then point at the `.mjs`/`.js` plugin file inside it:

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

Restart OpenCode and type `/i-have-adhd` in a session to turn it on — full toggle/always-on details in [[plugins]].

### A plugin you write yourself (custom .js)

Put the `.js` file anywhere (`~/.config/opencode/plugin/<name>.js` is recommended for something used by every project), then add its path to the `plugin` array:

```jsonc
{
  "plugin": [
    "superpowers@git+https://github.com/obra/superpowers.git",
    "C:/Users/<user>/.config/opencode/plugin/my-plugin.js"
  ]
}
```

A plugin's structure must export an async function that takes `{ directory }` and returns an object of hooks — a full example is in [[plugins]] (graft-deep).

### Standalone skills following the Agent Skills open standard (not a plugin)

Not every extra has to come from the `plugin` array — some are just a single `SKILL.md` file following the open **Agent Skills** standard (started by Anthropic, now an open standard several tools support, OpenCode included). Drop the file in the right place and it just works — no `opencode.jsonc` edit needed.

OpenCode looks for skills in 3 places:

| Location | Applies to |
| --- | --- |
| `<project>/.opencode/skills/<name>/SKILL.md` | That project only |
| `~/.config/opencode/skills/<name>/SKILL.md` | Every project (global) |
| `<project>/.claude/skills/<name>/SKILL.md` | Claude Code compat (the same file works for both tools) |

Minimum file structure:

```markdown
---
name: my-skill
description: A short description of when this skill applies (the model uses this text to decide when to call it)
---

The full instruction content you want the agent to follow when this skill is invoked
```

> [!warning] Not an automatic slash command (unlike Claude Code)
> A skill like this **does not become a `/my-skill`** command you can type directly in OpenCode — the model decides on its own which skill to call by matching what you typed against each skill's `description` field (through the native `skill` tool). So `description` needs to be written clearly enough for the model to match correctly. If you want the 100% certainty of a real slash command, build a separate custom command at `.opencode/commands/<name>.md` instead (see the [OpenCode Commands docs](https://opencode.ai/docs/commands/)).

> [!note] Fields OpenCode doesn't recognize are silently ignored
> Skills ported from Claude Code sometimes have Claude-Code-specific frontmatter fields, like `disable-model-invocation` — OpenCode only supports `name`, `description`, `license`, `compatibility`, and `metadata`. Any other field is quietly skipped, no error, no need to strip it out before use.

A real install example (the `grill-me`/`grilling` skill from mattpocock/skills, wired to superpowers) is in [[plugins]].

### AGENTS.md — global vs project instructions

`AGENTS.md` is an instruction file OpenCode reads every session (like an extra system prompt). It has 2 levels:

1. **Project** — walking up from the working directory looking for `AGENTS.md` (or `CLAUDE.md`) in that repo — this is the file `graft init --agents agents --no-global` writes automatically per repo (see [[mcp-servers]]).
2. **Global** — `~/.config/opencode/AGENTS.md` — applies to **every project**. No installer creates this file automatically; you write it yourself.

> [!info] Confirmed by a live test — the project and global files are used together, not one instead of the other
> Tested for real on a project that had both a project-level `AGENTS.md` (from `graft init`) and a global `~/.config/opencode/AGENTS.md` (the grill-me/grilling reconciliation rule — see [[plugins]]) at the same time — the model referenced content from both files in the same turn (visible directly in its reasoning trace, quoting a sentence from the global AGENTS.md verbatim). Bottom line: **a rule written at the global level always applies, whether or not a project file also exists**.

> [!tip] When to write at global instead of project level
> Write at global when a rule should apply "to every project, always" (e.g. how to reconcile two skills that might collide). Write at project level when it's context specific to that one repo (e.g. graft's context graph). A real example that had to be written at global level is in [[plugins]], the grill-me/grilling section.

---

## Part 5 — Add project-specific MCPs (per-project opt-in)

Some MCPs need credentials/state specific to a project (e.g. a database connection, that repo's own code graph). The safe way to do it:

1. Set `enabled: false` at the **global config** level (`~/.config/opencode/opencode.jsonc`)
2. Override it in a **project-level** config — create this file at that repo's root (OpenCode merges it over the global one automatically, nothing extra to configure):

```jsonc
// project-root/opencode.jsonc
{
  "mcp": {
    "postgres": { "enabled": true }
  }
}
```

3. Set whatever env var that MCP needs (e.g. `POSTGRES_CONNECTION_STRING`) before running `opencode` in that project.

---

## Confirm everything is installed

```bash
opencode mcp list        # check all MCP servers
opencode debug skill     # check which skills/plugins loaded successfully
opencode debug config    # view the fully resolved config
```

> [!danger] `opencode debug config` shows API keys in plaintext
> This command shows the actual resolved env var values (not the `{env:...}` placeholder) — if you're going to paste the output somewhere to share with someone, always strip/mask any `apiKey` value first.

---

## Next steps

Setup done — read [[USER-MANUAL]] for real day-to-day usage, or [[gotchas]] if you hit a problem along the way.
