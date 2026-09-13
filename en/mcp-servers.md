---
tags: [project-doc, mcp, opencode, reference]
updated: 2026-09-13
summary: Details on each MCP server set up in OpenCode — install steps, config, how to test, and gotchas
---

# MCP Servers

Overview at [[index]] · OpenCode's own install steps at [[setup]]

Every MCP below gets added to the `mcp` object in `~/.config/opencode/opencode.jsonc` (global — works for every project) unless it says it needs project-level config.

> [!note] Before you start
> This page assumes Node.js/npm and the OpenCode CLI are already installed. If not, go back to [[setup]] Parts 0–1 first.

---

## context7 — search library/framework docs

A remote MCP (nothing to run locally, nothing to pre-install). Searches library/framework documentation in real time instead of relying on the model's memory — very useful when the agent needs to write code against a library version newer than the model's training data.

### Install steps

1. Nothing extra to install — it's a remote HTTP endpoint.

2. Add config to `opencode.jsonc`:

   ```jsonc
   "context7": { "type": "remote", "url": "https://mcp.context7.com/mcp" }
   ```

3. Restart OpenCode (or open a new session) and check status:

   ```bash
   opencode mcp list
   ```

   You should see `✓ context7 connected`.

---

## playwright — control a browser / e2e testing

An MCP server that drives a real browser through Playwright — for automation, filling forms, clicking buttons, taking screenshots, and end-to-end testing a website's flow.

### Install steps

1. Pre-install Chromium for Playwright (optional — skip and the MCP server will try to download it on first call, but doing it ahead of time avoids a timeout on that first real use):

   ```bash
   npx playwright install
   ```

2. Add config to `opencode.jsonc`:

   ```jsonc
   "playwright": { "type": "local", "command": ["npx", "@playwright/mcp@latest"], "timeout": 30000 }
   ```

   Set `timeout: 30000` because the first run needs npx to resolve/download the package first — OpenCode's default (5000ms) usually isn't enough.

3. Test:

   ```bash
   opencode mcp list
   ```

   > [!warning] The first run may show failed
   > It may show `failed`/timeout on the first try because npx is downloading the package in the background — run the command again after a moment. If it still fails, check whether step 1 actually completed.

---

## chrome-devtools — debug a live webpage

Unlike playwright, this focuses on **debugging** (console logs, network requests, performance traces) rather than pure automation — the two complement each other without overlapping, useful when the agent needs to figure out why a page is erroring or slow.

### Install steps

1. Requires **Google Chrome** or **Chrome for Testing** installed locally (only these two are officially supported — other Chromium builds might work but aren't guaranteed)

2. Add config to `opencode.jsonc`:

   ```jsonc
   "chrome-devtools": {
     "type": "local",
     "command": ["npx", "-y", "chrome-devtools-mcp@latest", "--no-usage-statistics"],
     "timeout": 30000
   }
   ```

   `--no-usage-statistics` turns off telemetry sent to Google (on by default without this flag).

3. Test:

   ```bash
   opencode mcp list
   ```

---

## graft — code-graph / context retrieval (per-project)

[trailhq/Graft](https://github.com/trailhq/Graft) builds a graph of code relationships (which function calls what, which file relates to which) so the agent understands a repo's structure quickly without reading every file. Unlike the 3 servers above, it **needs project-level setup**, because the graph has to actually scan that specific repo's code.

> [!note] The repo moved orgs (last checked 2026-09-13)
> It used to live at `nanonets/graft` — both `github.com/nanonets/graft` and `github.com/NanoNets/Graft` (capitalized) now **301-redirect to `github.com/trailhq/Graft`** automatically. Old links you may already have pasted (README, npm package page) still work thanks to the GitHub redirect, but use the new link going forward — the npm package itself is still named `@nanonets/graft`, unchanged.

### Install steps

1. Install the CLI globally (once per machine, works for every project):

   ```bash
   npm install -g @nanonets/graft
   ```

2. Add config to `opencode.jsonc` (global — works for every project once it's passed step 3):

   ```jsonc
   "graft": { "type": "local", "command": ["npx", "-y", "@nanonets/graft", "mcp"], "timeout": 30000 }
   ```

3. **Do this for every project you'll use it in** (once per repo):

   ```bash
   cd my-project
   graft build                              # scan the code, build the graph (structural, no API key needed)
   graft init --agents agents --no-global   # write AGENTS.md + opencode.json (mcp.graft) for this repo only
   ```

   `--agents agents --no-global` limits it to writing only the files OpenCode uses (`AGENTS.md`, `opencode.json`) without touching Claude Code/.kiro/.gemini/Codex that might also be installed on the machine.

4. Test:

   ```bash
   cd my-project
   opencode mcp list      # should show graft connected
   graft map                # or test the CLI directly
   ```

### Useful CLI commands

| Command | What it does |
| --- | --- |
| `graft map` | Project overview — which files/functions get called the most |
| `graft ask "<question>"` | Ask in plain language, get relevant code back with file:line |
| `graft grep "<regex>"` | Exhaustive search, grouped by symbol (`-i --fixed` = case-insensitive + literal string instead of regex) |
| `graft callers <symbol>` | Who calls/imports/extends this symbol — `--direction out` flips it to "what does this symbol call", `-d N` walks N levels deep for the full blast radius |
| `graft skeleton <file>` | A file's API surface with no bodies |
| `graft blast [dir]` | **(new)** blast radius of the current diff — `--base origin/main` compares against the merge base, `--format markdown` formats it ready to paste as a PR comment, `--export-viz` also builds an interactive page |
| `graft check` | Reports whether the graph has drifted from the code (doesn't rebuild it, just reports) |
| `graft viz` | Opens an interactive dependency-graph viewer in the browser — `--export site/` produces a single static HTML file for CI/GitHub Pages |
| `graft uninstall [dir]` | Removes every file/config `graft init` ever wrote (the reverse of init) — needs `-y` to actually delete, otherwise it just prints what it would remove |

> [!info] `graft build` now has flags for monorepos/submodules
> `--follow-submodules` / `--follow-nested-repos` fold initialized submodules, or repos cloned inside the repo, into the same graph (excluded by default) — the choice is remembered in `.graft/config.json`. `--extensions .ts .py` limits it to specific file extensions, no config edit needed.

> [!tip] `--deep` adds an LLM summary per symbol (not configured in this setup)
> `graft build`/`graft ask`/`graft check` are normally purely structural (tree-sitter, $0, no LLM), but `graft build --deep` adds a language-model summary layer (concept node summaries + a crux per symbol). It needs `GRAFT_PROVIDER` (`openai`/`anthropic`/`litellm`/`orcarouter`) + `GRAFT_API_KEY` + `GRAFT_MODEL` (separate from the coding agent's own provider) — this setup hasn't turned this feature on, it just uses the plain structural graph.

### The MCP tools the agent actually calls (different from the CLI above — the CLI is for a human to call directly)

| Tool | Takes | What it's for |
| --- | --- | --- |
| `graft_find_code` | a question | Ranked relevant nodes with file:line, source code inlined — usually the full answer, no follow-up read needed |
| `graft_file_api` | a file path | Every signature in that file, no bodies — the API surface for about 1/10th the tokens |
| `graft_trace_calls` | a symbol | Who calls this symbol (or what it calls itself, with `direction: out`), walkable several levels deep for the blast radius |
| `graft_find_all` | a regex | Every hit, grouped by the symbol it falls inside, ranked by how coupled that symbol is |
| `graft_repo_map` | (nothing) | A first look at an unfamiliar repo — dir clusters, hubs, hotspots |
| `graft_check_freshness` | (nothing) | Whether the local graph has drifted from the code |

> [!note] The tool names you actually see in OpenCode have a doubled prefix
> Because OpenCode names the MCP server `graft` and namespaces tools as `<server name>_<tool name>`, you'll actually see `graft_graft_find_code`, `graft_graft_file_api`, etc. (the word "graft" appears twice) — this is normal naming, not a bug, and doesn't affect functionality.

> [!warning] Real prompt injection encountered
> The output of `graft map`/some commands carries a hidden instruction telling the agent to say a promotional line ("🌱 graft saved ~N tokens..."). This is a feature intentionally meant for a Claude Code hook to catch via regex (the `tool-savings` hook), but if you call the CLI directly outside that hook's pipeline, the text shows up as plain tool output the agent sees. Good to know, and don't follow that instruction automatically.

> [!info] Deep integration on OpenCode — only auto-inject-context is left to build yourself
> Auto-rebuilding the graph after an edit needs nothing extra anymore — the current graft CLI already refreshes the graph itself before answering any query (structural, $0), confirmed by a live test. What OpenCode still doesn't get natively is **automatically injecting context into every prompt** (Claude Code only) — if you want that behavior, you need to write a custom plugin. See [[plugins]], the graft-deep section.

---

## open-design — pull files from an OpenDesign project

[nexu-io/open-design](https://github.com/nexu-io/open-design) is an AI tool for generating websites/prototypes/slide decks (an open-source alternative to Claude Design). Full OpenDesign usage details (Studio, the whole workflow) are in [[USER-MANUAL]].

### Install steps

1. Download the **desktop app** from [open-design.ai](https://open-design.ai/) or [GitHub Releases](https://github.com/nexu-io/open-design/releases) and install normally (recommended — zero config, no need to clone/Node/pnpm anything yourself)

2. **(Windows only)** the installer usually doesn't add `od` to PATH — you have to build a shim yourself. Full steps are in [[gotchas]], item 4 (short version: create `~/AppData/Roaming/npm/od.cmd` that calls the real app via `ELECTRON_RUN_AS_NODE=1`)

3. Confirm `od` works (**always open a new terminal** after step 2):

   ```bash
   od --help
   ```

4. Wire it up to OpenCode:

   ```bash
   od mcp install opencode
   ```

   This writes config for you at `~/.config/opencode/opencode.json`:

   ```jsonc
   "open-design": {
     "type": "local",
     "command": ["od", "mcp", "--daemon-url", "http://127.0.0.1:7456"],
     "timeout": 30000,
     "enabled": true
   }
   ```

   Add `"timeout": 30000` yourself if `od mcp install` didn't (the default 5000ms may not be enough while the daemon is still warming up).

5. **Leave the OpenDesign app open** (or run `od --no-open` headless) — this MCP is just a stdio proxy to the daemon at `127.0.0.1:7456`; with no daemon running it can't connect at all.

6. Test:

   ```bash
   opencode mcp list      # should show open-design connected
   ```

**MCP tools you get:** `list_projects`, `get_active_context`, `get_project`, `get_file`, `search_files`, `list_files`, `create_artifact`

> [!warning] Common Windows problems
> Full details in [[gotchas]], item 4 — covers both the PATH issue and a native-module issue a plain shim can't fix.

---

## memory — persist context across sessions (official reference server)

[`@modelcontextprotocol/server-memory`](https://github.com/modelcontextprotocol/servers/tree/main/src/memory) — keeps a persistent knowledge graph so the agent remembers facts/context about you across sessions (roughly equivalent to Claude Code's memory feature). Runs entirely locally; nothing is sent anywhere.

### Install steps

1. Nothing to pre-install (`npx -y` pulls it on the first call)

2. Add config to `opencode.jsonc` — set `MEMORY_FILE_PATH` to an absolute path so the memory file always lives in one fixed place no matter which project opencode is opened from:

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

3. Test:

   ```bash
   opencode mcp list      # should show memory connected immediately, nothing else to configure
   ```

> [!note] What kind of data it stores
> Stored as entities + observations in a plain `.jsonl` file (readable/editable by hand if needed) — not a vector database or any cloud service.

---

## github — manage issues/PR/code search through a structured tool (disabled until there's a token)

The official GitHub MCP server (made by GitHub itself) — lets the agent call issues, pull requests, and code search through a clearly-structured tool instead of running `git`/`gh` through bash freeform.

### Install steps

1. Create a GitHub Personal Access Token at **https://github.com/settings/personal-access-tokens/new** — a **Fine-grained token** is recommended (finer-grained scoping than a classic token). Pick repository access and permissions to match what you'll use it for (e.g. Contents, Issues, Pull requests: Read and write)

2. Set the environment variable `GITHUB_PERSONAL_ACCESS_TOKEN` to that token's value (see [[setup]] Part 2 for how to set env vars per OS)

3. Add config to `opencode.jsonc`:

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

   `oauth: false` tells OpenCode to use the PAT via a header instead of trying to auto-discover OAuth (which needs a GitHub Copilot subscription) — `enabled: false` for now until it's actually ready to use (same pattern as postgres/mysql, so it doesn't throw errors while there's no token yet).

4. When ready to actually use it, flip `"enabled": false` → `true` and test:

   ```bash
   opencode mcp list      # should show github connected
   ```

> [!warning] Uses a lot of context
> GitHub's own docs warn this MCP "can add a lot of tokens to your context" — if you actually turn it on, narrow the enabled toolset if OpenCode supports it, rather than turning on every capability at once.

---

## sonarqube — code quality + security scan, self-hosted (via Docker)

The official [SonarSource/sonarqube-mcp-server](https://github.com/SonarSource/sonarqube-mcp-server) — lets the agent look up quality gates, security hotspots, code smells, and coverage through direct tool calls. Unlike every other MCP on this page, it **needs an actual running SonarQube server first** (self-hosted or SonarCloud) — self-hosted is chosen here so there's no external service dependency and code data never leaves the machine.

> [!info] Why not use Semgrep MCP instead
> Semgrep is lighter and needs no server, but is focused purely on security scanning — SonarQube gives both code quality (code smells, coverage, duplication) and security hotspots in one tool. Pick based on how much coverage you actually want.

### Prerequisite — Docker Desktop

Docker Desktop must be installed and its **engine actually running** (not just the app installed). Check with:

```powershell
docker version
```

If you get the error `open //./pipe/dockerDesktopLinuxEngine`, the app isn't open yet — open Docker Desktop and wait (the engine takes ~30–90 seconds to bootstrap after the app opens).

> [!warning] `docker` may not be on PATH
> The Docker Desktop installer **doesn't always add `docker.exe`'s path to the System PATH** (confirmed on some machines that had it installed a long time ago). Check with `Get-Command docker` — if not found, use the full path directly instead, both for testing and in the MCP config: `C:\Program Files\Docker\Docker\resources\bin\docker.exe`

### Step 1 — Run the SonarQube Server container

```bash
docker run -d --name sonarqube -p 9000:9000 \
  -v sonarqube_data:/opt/sonarqube/data \
  -v sonarqube_extensions:/opt/sonarqube/extensions \
  -v sonarqube_logs:/opt/sonarqube/logs \
  sonarqube:community
```

Uses 3 named volumes so data/extensions/logs persist across container restarts — **no `--rm`**, since this container is meant to stay around permanently, unlike the ephemeral MCP server containers.

Wait for bootstrap to finish (usually 1–2 minutes), checkable via the log:

```bash
docker logs sonarqube | grep "SonarQube is operational"
```

Confirm the web UI is up: open **http://localhost:9000**.

> [!note] The embedded H2 database is fine for solo use
> SonarQube warns "Embedded database should be used for evaluation purposes only" — fine for solo/personal-project use, but switch to a separate PostgreSQL per SonarQube's own docs if used with a team or in real production.

### Step 2 — First login + create a User Token

1. Go to **http://localhost:9000**, log in with `admin` / `admin` (default) — it forces a password change immediately
2. Go to **My Account → Security**
3. Under **Generate Tokens**: give it a name (e.g. `opencode-mcp`), Expires in `No expiration` (or set your own)

> [!danger] Type must be "User Token" only — the easiest thing to get wrong here
> The **Type** dropdown offers 3 choices: Global Analysis Token, Project Analysis Token, User Token — the MCP server **only works with a User Token**, since it needs the full Web API (viewing issues, quality gates, project lists), not just submitting scan results the way an Analysis Token does. Pick the wrong one and you'll get 401/403 when actually calling a tool, even though the MCP server shows "connected" (the connection check only confirms it can reach the server, it doesn't check the token's permissions at that point).

4. Click Generate → copy the token immediately (it's shown only once)

### Step 3 — Set the env var

Set `SONARQUBE_TOKEN` to that token's value (a System Environment Variable on Windows, or a shell profile on macOS/Linux — see [[setup]] Part 2)

> [!danger] Never put the token directly in a config file or in chat
> Always use `{env:SONARQUBE_TOKEN}` instead, even though the server only runs on localhost — it's a better habit and prevents the token from accidentally ending up in git history/session logs.

### Step 4 — Add config to `opencode.jsonc`

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

Key differences from the generic example config in SonarQube's own docs:

- **Uses `docker.exe`'s full path** instead of a bare `docker`, for the reason in the prerequisite above.
- **`SONARQUBE_URL` must be `http://host.docker.internal:9000`**, not `http://localhost:9000` — because the MCP server runs **in its own separate container**, where `localhost` refers to that container itself, not the real machine. `host.docker.internal` is the special DNS name Docker Desktop provides that always points back to the host machine.
- `-e SONARQUBE_TOKEN` (with no `=value` after it) tells Docker to forward the value from the environment of the process calling `docker run` (opencode itself) into the container — this works together with the `"environment"` block above, which resolves `{env:SONARQUBE_TOKEN}` so opencode sees the real value before passing it along.

**Pre-pull the image before first real use** (avoids the 30-second timeout not being enough while a ~500MB+ image downloads):

```bash
docker pull sonarsource/sonarqube-mcp
```

### Step 5 — Test

**Test the docker command directly first** (isolates an MCP-config problem from a docker/network problem):

```powershell
& "C:\Program Files\Docker\Docker\resources\bin\docker.exe" run --init --rm -i -e SONARQUBE_TOKEN -e SONARQUBE_URL=http://host.docker.internal:9000 sonarsource/sonarqube-mcp
```

You should see logs like this (it's waiting for input because it's a stdio transport — normal, Ctrl+C to exit):

```
INFO SonarQube MCP Server - Starting backend service
INFO SonarQube MCP Server - SonarQube MCP Server Started:
INFO SonarQube MCP Server - Transport: stdio
INFO SonarQube MCP Server - Status: Server ready - tools loading in background
```

Once that passes, check through opencode:

```bash
opencode mcp list      # should show sonarqube connected
```

> [!important] "connected" in opencode mcp list, but the agent can't call the tool — check VS Code first
> A problem hit for real during setup: the docker command tested fine directly, but `opencode mcp list` run from a **terminal inside VS Code** still failed. The cause: the terminal in VS Code is a child process of VS Code itself (`Code.exe`) that had been open since before `SONARQUBE_TOKEN` was set. Opening a new terminal tab there doesn't help, since it clones VS Code's own existing environment rather than reading fresh values from Windows. You have to **fully close the whole VS Code app and reopen it** (also check Task Manager that no `Code.exe` is still running) before it sees the new value — this is a direct real-world confirmation of [[gotchas]], item 2, not a config problem.

### CLI/Tools you get

This MCP server exposes tools for: analyzing code, listing issues, checking quality gate status, getting security hotspots, measuring coverage — the agent calls these automatically when asked to review code or find vulnerabilities.

> [!note] A project must be "Analyzed" before there's any data
> A fresh SonarQube server has no data until a project is scanned into it at least once (via the web UI's "Analyze new project," or by having the agent call an MCP tool to scan it) — before that first scan, most tools will just say there's no data, not throw an error.

---

## trivy — vulnerability/secret/misconfig scan (standalone CLI, no server needed)

[aquasecurity/trivy](https://github.com/aquasecurity/trivy) — a scanner for vulnerabilities in dependencies, hardcoded secrets in code, and misconfigurations in config files (Terraform, Dockerfile, Kubernetes, etc.). Unlike sonarqube, it's **a standalone CLI with no server to run at all** — the MCP connects to the binary directly through a plugin made by Aqua Security itself.

> [!info] Why both sonarqube and trivy
> They overlap a little on security hotspots, but trivy covers more ground on the supply-chain side — scanning dependency CVEs straight from a lockfile, scanning container images, and finding leaked secrets (API keys, tokens) in code better than sonarqube does. They work fine together; not so redundant that you'd need to pick just one.

### Install steps

1. Install the Trivy CLI (on Windows via winget, fast and no installer to hunt down):

   ```powershell
   winget install --id AquaSecurity.Trivy -e
   ```

   macOS: `brew install trivy` · Linux: see per-distro instructions in the [official docs](https://trivy.dev/latest/getting-started/installation/)

   > [!warning] Restart the terminal after installing
   > winget itself says "Path environment variable modified; restart your shell" — exactly the same problem as [[gotchas]], item 2. If you still get `trivy: command not found` even though winget said it installed successfully, close and reopen the terminal first (VS Code needs the whole app closed, as always).

2. Install the official MCP plugin from Aqua Security itself (**"mcp" is not a built-in subcommand of plain trivy — you need this plugin installed first**):

   ```bash
   trivy plugin install mcp
   ```

   > [!danger] Don't trust a search result claiming `trivy mcp` works out of the box
   > Several unofficial third-party MCP wrappers (not from the aquasecurity org) show up in general search results. Before installing a plugin, confirm the repo is [aquasecurity/trivy-mcp](https://github.com/aquasecurity/trivy-mcp) (the official plugin index's source is more trustworthy than a separate, unmaintained MCP server).

3. Add config to `opencode.jsonc`:

   ```jsonc
   "trivy": {
     "type": "local",
     "command": ["trivy", "mcp"],
     "timeout": 30000
   }
   ```

   > [!note] If `trivy` isn't on opencode's PATH
   > Some machines where winget installed it a while ago may not see `trivy` by its bare name (similar to the `docker`/`od` issue earlier) — check with `Get-Command trivy`; if not found, use `trivy.exe`'s full path directly in `"command"` instead.

4. Test:

   ```bash
   opencode mcp list      # should show trivy connected
   ```

   Or test the CLI directly first (downloads a ~100MB vulnerability DB on the first run):

   ```bash
   trivy fs --scanners vuln,secret,misconfig .
   ```

> [!warning] Needs `docker-credential-desktop` on PATH the first time it downloads the DB
> Trivy stores its vulnerability database as an OCI artifact on `mirror.gcr.io` — the first pull tries to check credentials via Docker's credential helper, even though no Docker server needs to actually be running at all. If you hit `docker-credential-desktop: executable file not found`, temporarily add Docker Desktop's `resources/bin` folder to PATH (see [[gotchas]], item 4, for the same Docker-path pattern) — **this isn't a permanent dependency**; once the DB is cached, later runs don't need Docker at all.

### Useful CLI commands

| Command | What it does |
| --- | --- |
| `trivy fs .` | Scan dependency vulnerabilities + secrets in the current folder |
| `trivy fs --scanners secret .` | Scan for hardcoded secrets only (faster) |
| `trivy image <name>` | Scan a container image for CVEs |
| `trivy config .` | Scan for misconfigurations in a Dockerfile/Terraform/K8s manifest |
| `trivy repository <url>` | Scan a remote git repository without cloning it yourself |

---

## postgres / mysql — query a database (disabled by default, enabled per project)

Both are local MCPs that need an already-running database server (local or remote) — the MCP is just a bridge, it doesn't install a DB for you.

### Install steps (in the global config — left disabled)

1. Nothing to pre-install (`npx -y` pulls the package when actually used)

2. Add config to `opencode.jsonc` with `enabled: false` for now:

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

> [!note] Why leave it disabled by default
> A connection string is project-specific data — leaving it enabled would try to connect to a DB every time OpenCode opens in any project at all, even ones with no DB, causing pointless errors/noise.

### Turning it on for a real project

1. Create (or edit) a config file at **that project's root** to override the global setting:

   ```jsonc
   // my-project/opencode.jsonc
   {
     "mcp": {
       "postgres": { "enabled": true }
       // or "mysql": { "enabled": true }
     }
   }
   ```

2. Set the connection env vars before opening opencode, in the same terminal:

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

   On Windows PowerShell use `$env:VAR_NAME = "..."` instead — see [[gotchas]], item 2, on why an app restart is needed if you set these via System Environment Variables instead.

3. Open opencode in that same terminal (which now has the env vars), from that project's root:

   ```bash
   cd my-project
   opencode
   ```

4. Test:

   ```bash
   opencode mcp list      # should show postgres/mysql switch from disabled to connected
   ```

> [!tip] Read-only by default
> Both are **read-only by default** (so the agent can't accidentally change real data) — mysql can be given write access via extra env flags, e.g. `ALLOW_INSERT_OPERATION=true`, `ALLOW_UPDATE_OPERATION=true`, `ALLOW_DELETE_OPERATION=true`

---

## Checking overall status

```bash
opencode mcp list
```

Example output with everything set up (8 enabled + 3 disabled):

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
