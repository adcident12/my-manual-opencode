# AGENT-SETUP — instructions for an AI agent setting up OpenCode from this manual

You are an AI coding agent. A user asked you to set up OpenCode the way this repository documents it. Follow this file top to bottom. It is the executable summary of the human manual (`en/setup.md`, `en/mcp-servers.md`, `en/plugins.md`, `en/tuning.md`); when a step needs more detail, read the page it names.

All paths are relative to the root of this repository unless they start with `~`. `~/.config/opencode/` is the OpenCode config directory on **every** OS (on Windows it is `%USERPROFILE%\.config\opencode`).

## Rules — read before running anything

1. **Back up first.** If `~/.config/opencode/` exists, copy it to `~/.config/opencode-backup-<timestamp>/` before changing anything.
2. **Never overwrite an existing file blindly.** If `opencode.jsonc`, `opencode.json` or `AGENTS.md` already exists, merge: add the missing keys or sections, keep what is there, and show the user the diff. Only copy a file wholesale when the target does not exist.
3. **Never write a secret into a file, and never ask the user to paste one into the chat.** Config files reference secrets as `{env:NAME}`. Tell the user which environment variables to set themselves (step 4).
4. **Do not run third-party installers that edit the OpenCode config** (for example caveman's `bin/install.js`, `od mcp install opencode`). Install by copying files and editing the config by hand, as written below. See `en/gotchas.md` items 4 and 18.
5. **Verify every step with the check given.** If a check fails, stop, report what failed, and do not continue to later steps that depend on it.
6. **Ask instead of guessing** for the values listed in "Ask the user" below. Skip optional components the user does not want; set their MCP entry to `"enabled": false` rather than leaving a broken server enabled.
7. After changing environment variables or PATH, the user must **open a new terminal** (and fully restart editors) before the change is visible — `en/gotchas.md` item 2. Say so explicitly.

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
npm install -g opencode-ai
npm install -g @nanonets/graft
opencode --version && graft version
```

**Check:** both print a version.

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
- Target exists → merge key by key (`compaction`, `plugin` entries, each `mcp` server). Keep the user's existing provider and comments. Remove any `open-design` entry that pins `--daemon-url` (in `opencode.json` too) — `en/gotchas.md` item 4.

**Check:** `opencode debug config` prints JSON without an error. (It prints resolved secrets — never paste its output anywhere.)

## Step 4 — Environment variables (the user sets these)

Set by you (not a secret):

- `OPENCODE_DISABLE_EXTERNAL_SKILLS=1` — user-level. Windows: `[Environment]::SetEnvironmentVariable('OPENCODE_DISABLE_EXTERNAL_SKILLS','1','User')`. macOS/Linux: append `export OPENCODE_DISABLE_EXTERNAL_SKILLS=1` to the shell profile.

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
| [`config/AGENTS.md`](config/AGENTS.md) | `~/.config/opencode/AGENTS.md` | Global rules (5 sections). If the target exists, append only the `## ` sections it does not already have. |
| [`config/plugin/graft-deep.js`](config/plugin/graft-deep.js) | `~/.config/opencode/plugin/graft-deep.js` | Custom plugin. Its path is already in the template's `plugin` array. |
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

Do **not** add a caveman block to `AGENTS.md` (the plugin injects the ruleset itself) and do **not** also install `i-have-adhd` (same job). Details: `en/plugins.md`, caveman.

## Step 8 — Optional components

- **Trivy:** Windows `winget install --id AquaSecurity.Trivy -e` · macOS `brew install trivy` · then `trivy plugin install mcp`. If `trivy` is not on PATH for OpenCode, put the full path in the config's `command`. Not wanted → `"enabled": false`.
- **SonarQube:** needs Docker and a running server (`en/mcp-servers.md`, sonarqube). Set `SONARQUBE_URL` in the config to the host port the container publishes. On macOS/Linux change the command's first element to `"docker"`. Not wanted or no Docker → `"enabled": false`.
- **OpenDesign:** leave `"enabled": false` globally; it is turned on per project. On Windows build the `od` shim (`en/gotchas.md` items 4 and 16).
- **github / postgres / mysql:** leave disabled.

## Step 9 — Verify the whole setup

Run in a **new** terminal:

```bash
opencode mcp list
opencode debug skill
opencode run "say hi"
```

**Expected:**

- `mcp list`: `context7`, `chrome-devtools`, `graft`, `memory` connected, plus `sonarqube` / `trivy` if chosen. `open-design`, `playwright`, `github`, `postgres`, `mysql` disabled. A server may show `failed` on the very first run while `npx` downloads it — run the command again.
- `debug skill`: 27 skills — 15 from superpowers, 6 from ponytail, `caveman`, `caveman-commit`, `caveman-review`, `grill-me`, `grilling`, `customize-opencode`. Many more than that → `OPENCODE_DISABLE_EXTERNAL_SKILLS` is not in effect in this terminal.
- `run "say hi"`: a reply. No reply or a timeout → check the provider (`en/gotchas.md` item 1).
- `~/.config/opencode/.caveman-active` exists after the first run.

## Step 10 — Per project (repeat in each repository the user works in)

```bash
cd <project>
graft build
graft init --agents agents --no-global     # writes AGENTS.md + opencode.json (mcp.graft) for this repo only
opencode mcp list                            # graft: connected
graft map
```

To enable an off-by-default server for one project, add to `<project>/opencode.json`:

```jsonc
{ "mcp": { "open-design": { "enabled": true } } }
```

## Report back to the user

Finish with a short list: what you installed, which components you skipped and why, which environment variables **they** still have to set, that they must open a new terminal, and where the backup is. Then point them to `en/USER-MANUAL.md` → "Start to finish" for how to work day to day.

## Do not

- run caveman's installer, `od mcp install opencode`, or any installer that rewrites `opencode.jsonc`;
- enable `open-design` or `playwright` globally (they cost ~11k prompt tokens per turn together — `en/tuning.md`);
- install both `caveman` and `i-have-adhd`;
- commit, push, or print secrets, or paste `opencode debug config` output.
