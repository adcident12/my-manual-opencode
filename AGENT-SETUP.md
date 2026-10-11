# AGENT-SETUP — instructions for an AI agent setting up OpenCode from this manual

You are an AI coding agent. A user asked you to set up OpenCode the way this repository documents it. Follow this file top to bottom. It is the executable summary of the human manual (`en/setup.md`, `en/mcp-servers.md`, `en/plugins.md`, `en/tuning.md`); when a step needs more detail, read the page it names.

This file targets **OpenCode 2** (tested on 2.0.26). If `opencode --version` prints 1.x, follow `en/updating.md` → "Upgrading from OpenCode 1 to OpenCode 2" instead of installing from scratch.

All paths are relative to the root of this repository unless they start with `~`. `~/.config/opencode/` is the OpenCode config directory on **every** OS (on Windows it is `%USERPROFILE%\.config\opencode`).

## Rules — read before running anything

1. **Back up first.** If `~/.config/opencode/` exists, copy it to `~/.config/opencode-backup-<timestamp>/` before changing anything.
2. **Never overwrite an existing file blindly.** If `opencode.jsonc`, `opencode.json` or `AGENTS.md` already exists, merge: add the missing keys or sections, keep what is there, and show the user the diff. Only copy a file wholesale when the target does not exist.
3. **Never write a secret into a file, and never ask the user to paste one into the chat.** Config files reference secrets as `{env:NAME}`. Tell the user which environment variables to set themselves (step 4).
4. **Do not run third-party installers that edit the OpenCode config** (for example caveman's `bin/install.js`, `od mcp install opencode`). Install by copying files and editing the config by hand, as written below. See `en/gotchas.md` items 4 and 18.
5. **Verify every step with the check given.** If a check fails, stop, report what failed, and do not continue to later steps that depend on it.
6. **Ask instead of guessing** for the values listed in "Ask the user" below. Skip optional components the user does not want; set their MCP entry to `"enabled": false` rather than leaving a broken server enabled.
7. After changing environment variables or PATH, the user must **open a new terminal** (and fully restart editors) before the change is visible — `en/gotchas.md` item 2. Say so explicitly.
8. **OpenCode 2 runs a background service.** After any config or plugin change run `opencode service restart` before checking. In Git Bash, prefix `opencode api …` calls with `MSYS_NO_PATHCONV=1` (`en/gotchas.md` item 25).

## Ask the user (once, up front)

| Question | Used in |
| --- | --- |
| Model provider: base URL, model id, and the name of the env var that will hold the API key — or "none, use the built-in free model for now" | step 3 |
| Do you want the governance tools? SonarQube (needs Docker and a running SonarQube server) · Trivy | step 8 |
| Do you use the OpenDesign desktop app? | step 8 |
| Do you have a context7 API key? (optional) | step 3 |

## Step 0 — Prerequisites

```bash
node --version    # need v20+; v22.5+ to run scripts/session-report.mjs
npm --version
git --version
```

Missing or too old → stop and point the user to `en/setup.md` Part 0. Do not install system packages without asking.

## Step 1 — Install the OpenCode CLI and graft

```bash
npm install -g @opencode/cli      # OpenCode 2 — "opencode-ai" is the old 1.x package
npm install -g @nanonets/graft
opencode --version && graft version
```

**Check:** both print a version; OpenCode's must be 2.x.

## Step 2 — Back up and create the config directory

```bash
[ -d ~/.config/opencode ] && cp -r ~/.config/opencode ~/.config/opencode-backup-$(date +%Y%m%d-%H%M%S)
mkdir -p ~/.config/opencode/plugin ~/.config/opencode/plugins/caveman ~/.config/opencode/skills ~/.config/opencode/commands ~/.config/opencode/scripts
```

## Step 3 — Global config: `~/.config/opencode/opencode.jsonc`

Source: [`config/opencode.jsonc`](config/opencode.jsonc) (a commented template; every machine-specific value is a `<placeholder>`).

- Target does not exist → copy the template, then replace the placeholders:
  - `<user>` → the OS user name. On macOS/Linux also change `C:/Users/<user>` to the real home directory.
  - `<your-server>`, `<your-model-id>`, the provider's `apiKey` env var name → from the user's answer.
  - No provider yet → delete the `"provider"` block and the `"model"` line; OpenCode then uses its built-in model (`opencode/deepseek-v4-flash-free` works without a key).
  - No context7 key → delete the `"headers"` line of `context7`.
- Target exists → merge key by key (`compaction`, `permissions`, `plugin` entries, each `mcp` server). Keep the user's existing provider and comments. Inside one `mcp` entry, provider, agent or command keep a single syntax (OpenCode 2 reads the V1 syntax used by the template). Remove a V1 `compaction.prune` and any local file path in the `plugin` array — OpenCode 2 ignores the first and rejects the second (`en/gotchas.md` item 21). Remove any `open-design` entry that pins `--daemon-url` (in `opencode.json` too) — `en/gotchas.md` item 4.

**Check:** `opencode debug config` prints JSON, and `opencode debug config --log-level warn --print-logs` shows no `configuration normalization diagnostic` for this file other than `attachment` on a model. (Never paste its output anywhere — it shows machine paths and URLs.)

## Step 4 — Environment variables (the user sets these)

Nothing for you to set here: on OpenCode 2, other tools' skills are kept out by the `permissions` allow-list in the template, not by an environment variable (`en/gotchas.md` item 15).

Tell the user to set these themselves, only for the components they chose:

| Variable | For |
| --- | --- |
| the provider key variable named in step 3 (e.g. `HOME_LLAMACPP_API_KEY`) | model provider |
| `CONTEXT7_API_KEY` | context7 (optional) |
| `SONARQUBE_TOKEN` | sonarqube — must be a **User** token |
| `GITHUB_PERSONAL_ACCESS_TOKEN` | github MCP (stays disabled until set) |

## Step 5 — Files shipped in this repository

| Copy from | To | Notes |
| --- | --- | --- |
| [`config/AGENTS.md`](config/AGENTS.md) | `~/.config/opencode/AGENTS.md` | Global rules (6 sections). If the target exists, append only the `## ` sections it does not already have, and replace a graft or memory section that still names `graft_graft_…` / `memory_…` tools (OpenCode 1 names). |
| [`config/plugin/graft-deep.js`](config/plugin/graft-deep.js) | `~/.config/opencode/plugin/graft-deep.js` | Custom OpenCode 2 plugin. OpenCode 2 loads `.js` files in that folder by itself — do **not** add it to the `plugin` array. |
| [`scripts/od.mjs`](scripts/od.mjs) | `~/.config/opencode/scripts/od.mjs` | Windows + OpenDesign only. |

Windows only — `graft-deep.js` imports `cross-spawn`:

```bash
cd ~/.config/opencode && npm install cross-spawn
```

**Check:** `node --check ~/.config/opencode/plugin/graft-deep.js` exits 0.

## Step 6 — Skills `grill-me` and `grilling` (fetched from upstream, one local edit)

```bash
B=https://raw.githubusercontent.com/mattpocock/skills/main/skills/productivity
for s in grill-me grilling; do mkdir -p ~/.config/opencode/skills/$s; curl -fsSL $B/$s/SKILL.md -o ~/.config/opencode/skills/$s/SKILL.md; done
```

Then apply the single edit described in [`config/skills/grilling-local-change.md`](config/skills/grilling-local-change.md) to `~/.config/opencode/skills/grilling/SKILL.md` (replace the "Finding _facts_ …" paragraph).

**Check:** the grilling file contains `graft ask` and no longer says `dispatch a sub-agent to find it`.

## Step 7 — caveman skill (terse replies), by hand from a pinned tag

```bash
T=v3.1.0; R=https://raw.githubusercontent.com/JuliusBrussee/caveman/$T; C=~/.config/opencode
curl -fsSL $R/src/plugins/opencode/plugin.js    -o $C/plugins/caveman/plugin.js
curl -fsSL $R/src/plugins/opencode/package.json -o $C/plugins/caveman/package.json
curl -fsSL $R/src/hooks/caveman-config.js       -o $C/plugins/caveman/caveman-config.cjs
curl -fsSL $R/src/hooks/caveman-parse.js        -o $C/plugins/caveman/caveman-parse.cjs
for s in caveman caveman-commit caveman-review; do
  mkdir -p $C/skills/$s
  curl -fsSL $R/skills/$s/SKILL.md                  -o $C/skills/$s/SKILL.md
  curl -fsSL $R/src/plugins/opencode/commands/$s.md -o $C/commands/$s.md
done
```

Then port it to OpenCode 2 (upstream ships a V1 plugin that OpenCode 2 ignores) — this also writes the loader shim `~/.config/opencode/plugin/caveman.js`:

```bash
node scripts/port-caveman-opencode2.mjs
```

Do **not** add caveman to the `plugin` array, do **not** add a caveman block to `AGENTS.md` (the plugin injects the ruleset itself), and do **not** also install `i-have-adhd` (same job). Details: `en/plugins.md`, caveman.

**Check:** `opencode service restart`, then `opencode api GET /api/plugin` lists `caveman`, `graft-deep`, `superpowers`, `ponytail` with status `active`.

## Step 8 — Optional components

- **Trivy:** Windows `winget install --id AquaSecurity.Trivy -e` · macOS `brew install trivy` · then `trivy plugin install mcp`. If `trivy` is not on PATH for OpenCode, put the full path in the config's `command`. Not wanted → `"enabled": false`.
- **SonarQube:** needs Docker and a running server (`en/mcp-servers.md`, sonarqube). Set `SONARQUBE_URL` in the config to the host port the container publishes. On macOS/Linux change the command's first element to `"docker"`. Not wanted or no Docker → `"enabled": false`.
- **OpenDesign:** leave `"enabled": false` globally; it is turned on per project. On Windows build the `od` shim (`en/gotchas.md` items 4 and 16). Tell the user that OpenDesign 0.24.1 cannot use OpenCode 2 as its engine yet (`en/gotchas.md` item 24).
- **github / postgres / mysql:** leave disabled.

## Step 9 — Verify the whole setup

Run in a **new** terminal:

```bash
opencode mcp list
opencode plugin list
opencode run "list the skill IDs you can load, comma-separated"
```

**Expected:**

- `mcp list`: `context7`, `chrome-devtools`, `graft`, `memory` connected, plus `sonarqube` / `trivy` if chosen. `open-design`, `playwright`, `github`, `postgres`, `mysql` disabled. A server may show `failed` on the very first run while `npx` downloads it — run the command again.
- `plugin list`: `superpowers`, `ponytail`, `graft-deep`, `caveman`, each with an ID.
- `run …`: a reply listing 27 skills — `opencode`, `report`, 15 from superpowers, 6 from ponytail, `caveman`, `caveman-commit`, `caveman-review`, `grilling` (`grill-me` is hidden from the model by its own `disable-model-invocation: true` — it only forwards to `grilling`; `@grill-me` still loads it). Many more → the `permissions` allow-list is missing. No reply or a timeout → check the provider (`en/gotchas.md` item 1).
- `~/.config/opencode/.caveman-active` exists after the first run.

## Step 10 — Per project (repeat in each repository the user works in)

```bash
cd <project>
graft build
graft init --agents agents --no-global     # writes AGENTS.md + opencode.json (mcp.graft) for this repo only
opencode mcp list                            # graft: connected
graft map
```

To enable an off-by-default server for one project, copy its **whole** entry from `config/opencode.jsonc` into `<project>/opencode.json` and set `"enabled": true` — a short `{ "enabled": true }` is ignored on OpenCode 2 (`en/gotchas.md` item 22):

```jsonc
{ "mcp": { "playwright": { "type": "local", "command": ["npx", "-y", "@playwright/mcp@latest"], "enabled": true } } }
```

## Report back to the user

Finish with a short list: what you installed, which components you skipped and why, which environment variables **they** still have to set, that they must open a new terminal, and where the backup is. Then point them to `en/USER-MANUAL.md` → "Start to finish" for how to work day to day.

## Do not

- run caveman's installer, `od mcp install opencode`, or any installer that rewrites `opencode.jsonc`;
- enable `open-design` or `playwright` globally (each one is another process and catalog entry every session — `en/tuning.md`);
- list a local plugin file in the `plugin` array, or leave caveman unported (`en/gotchas.md` items 20–21);
- install both `caveman` and `i-have-adhd`;
- commit, push, or print secrets, or paste `opencode debug config` output.
