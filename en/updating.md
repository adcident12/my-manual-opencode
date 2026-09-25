---
tags: [project-doc, maintenance, opencode, reference]
updated: 2026-09-25
summary: How to update/upgrade the OpenCode CLI, MCP servers, plugins, the grill-me/grilling skill, and OpenDesign, one at a time
---

# Updating & Upgrading

Overview at [[index]] · Initial setup at [[setup]]

Each part of the stack has a different way to "update." Some already update automatically with nothing to do; others need a manual command. This page covers each one.

---

## Automated update script (recommended — one run covers everything that needs a manual command)

[`scripts/update-opencode.mjs`](../scripts/update-opencode.mjs) — a single Node.js script that runs the same way on **Windows, macOS, and Ubuntu** (uses only the Node.js already installed per [[setup]] Part 0, no extra dependency to install) — automates every part of this page that can be done safely on its own:

```bash
node scripts/update-opencode.mjs             # update everything that's safe to update
node scripts/update-opencode.mjs --dry-run   # preview every command, run nothing
node scripts/update-opencode.mjs --recreate-sonarqube   # also recreate the sonarqube server container
```

Covers: the OpenCode CLI, graft (with an automatic fallback if `graft upgrade` hits the bug documented in [[gotchas]]), clearing the superpowers/ponytail caches, a `git pull` for i-have-adhd, diffing grill-me/grilling against upstream (never auto-overwriting), pulling the sonarqube MCP wrapper image, and updating the trivy CLI/plugin.

> [!warning] What it deliberately does **not** automate (needs a flag or a manual step)
> - **The sonarqube Server container** — skipped by default, since it means stopping/removing a running container. Pass `--recreate-sonarqube` to do it (the script `docker inspect`s the existing container first, so it reuses the real volume names in place rather than hardcoding over them).
> - **trivy on Linux/Ubuntu** — never runs `sudo` on its own (it would need a password); it just prints the exact command to run yourself.
> - **graft-deep.js** and **OpenDesign** — hand-written / a GUI auto-updater, respectively. The script only prints a reminder; there's nothing for it to update automatically.

> [!info] Fixed 2026-09-25 — the SonarQube port, argument quoting, and the trivy index
> - **`--recreate-sonarqube` keeps the existing container's host port** (and named volumes) instead of always using `9000` — default `9001` if there's no container yet, since `9000` is often taken by another service (see [[mcp-servers]], sonarqube). Try `--dry-run --recreate-sonarqube` first: it now prints the exact `docker run -p <port>:9000 -v …` with the real values.
> - On Windows, only the npm shims (`opencode`, `graft`, `npm`) run through a shell; before, every command did, which split `docker inspect --format '{{json .Mounts}}'` at the space so the volume lookup silently fell back to defaults — see [[gotchas]] item 10.
> - `trivy plugin update` failing on the network (the plugin index lives on github.io, which some networks block) is now a ⚠️ warning when `trivy plugin upgrade` still succeeded, not a ❌ failure.
>
> Running it from a local copy (e.g. `~/.config/opencode/scripts/update-opencode.mjs`)? Replace that copy with the new [`scripts/update-opencode.mjs`](../scripts/update-opencode.mjs).

---

## OpenCode CLI

```bash
opencode upgrade
```

Or target a specific version:

```bash
opencode upgrade 0.1.48
```

> [!tip] Match the installation method to how it was first installed
> If installed via `npm install -g opencode-ai` (as recommended in [[setup]]), use:
> ```bash
> opencode upgrade -m npm
> ```
> `-m`/`--method` supports `curl`, `npm`, `pnpm`, `bun`, `brew`, `choco`, `scoop` — match whichever was used at install time so you don't end up with two installations mixed together.

Confirm the version after updating:

```bash
opencode --version
```

---

## MCP servers that run via `npx`

**Already update automatically, nothing to do** — every MCP configured this way (`playwright`, `chrome-devtools`, `postgres`, `mysql`, `memory`) is called via `npx -y <package>@latest` or with no version pinned — npx checks the npm registry for the latest version every time it spawns (auto-downloading a new version if one exists, never sitting on a stale cache).

> [!note] context7 doesn't need updating at all
> It's a remote MCP (an HTTP endpoint) — the server side updates itself, nothing to do on our end.

If you want to **force** a check for the latest version of any package right now (without waiting for opencode to call it itself):

```bash
npx -y @playwright/mcp@latest --version
```

---

## graft (code-graph MCP + CLI)

graft has its own built-in update command, separate from the MCP wrapper:

```bash
graft version    # see the installed version, compared against the latest on npm
graft upgrade    # upgrade the global install to the latest version
```

> [!warning] After upgrading, you may need to rebuild the graph
> If a new version changes the graph/wiring format, re-run `graft build` in each project you use it in (see [[mcp-servers]], the graft section) — check graft's [CHANGELOG](https://github.com/trailhq/Graft/blob/main/CHANGELOG.md) before upgrading if you're worried about breaking changes (the repo has moved to `trailhq/Graft` — see [[mcp-servers]]).

> [!important] After every graft upgrade, re-check graft-deep too
> graft-deep copies the injection gate from graft's own Claude Code hook, so a graft release can change what the plugin should do — 0.19.0 did (see [[plugins]], graft-deep → "Injection gate", which lists the exact files and `grep` commands to compare). Quick check that the existing graphs still load: `graft check . --json` in a project should report `"graph": { "ok": true }`.

---

## superpowers plugin (installed via git)

Installed as `superpowers@git+https://github.com/obra/superpowers.git` (unpinned) — in principle, it should pull the latest commit of the `main` branch every time opencode loads the plugin, but in practice **some opencode/Bun versions cache the resolved git dependency**, so a plain restart won't show a new version.

**How to force a fresh pull:**

```bash
rm -rf ~/.cache/opencode/packages/superpowers@git+https_
```

Then restart OpenCode — this time it'll clone everything fresh.

Confirm it actually picked up the new version:

```bash
opencode debug skill
```

Check the path shown in the log — it should point at the freshly cloned cache (`~/.cache/opencode/packages/superpowers@git+https_/...`).

> [!tip] Want a fixed version instead of auto-updating
> Pin it with a git tag instead:
> ```jsonc
> { "plugin": ["superpowers@git+https://github.com/obra/superpowers.git#v6.3.0"] }
> ```

---

## ponytail plugin (installed via npm)

Installed as `@dietrichgebert/ponytail` (a plain npm package, not a git URL) — opencode/Bun resolves the latest version matching its range through the normal lockfile mechanism, no lingering git-cache issue like superpowers.

**Updating the version:** just restarting OpenCode is often not enough if the lockfile pinned a version — remove the resolved cache and force a fresh pull:

```bash
rm -rf ~/.cache/opencode/packages/@dietrichgebert+ponytail@*
```

Then restart OpenCode and confirm with `/ponytail-help`.

> [!tip] Removing the plugin needs its config cleaned up too
> Before taking `@dietrichgebert/ponytail` out of the `plugin` array, always run `node scripts/uninstall.js` (from ponytail's own source) first — otherwise the config file at `~/.config/ponytail/config.json` gets left behind.

---

## i-have-adhd (installed via a local git clone)

Unlike superpowers/ponytail, this doesn't go through the `plugin` array as a git URL or npm package at all — the `plugin` array points directly at a `.mjs` file path inside the cloned source (see [[setup]] Part 4). So updating it is just a `git pull` of that source, with none of opencode/Bun's caching involved at all:

```bash
git -C ~/.config/opencode/vendor/i-have-adhd pull
```

Then restart OpenCode (plugins only load when a session starts) — nothing else to check besides trying `/i-have-adhd` to confirm it still activates normally.

> [!tip] Removing the plugin needs no script
> Unlike ponytail, which needs an uninstall script run first — i-have-adhd has no config to clean up. Just take the path out of the `plugin` array and delete the `~/.config/opencode/vendor/i-have-adhd` folder (if always-on was ever turned on, don't forget to also delete the `~/.config/opencode/.i-have-adhd-always` flag file — see [[plugins]]).

---

## grill-me / grilling skill (a vendored SKILL.md, no plugin manager updates it)

Not installed through the `plugin` array at all (see [[plugins]]) — it's a plain `SKILL.md` file copied from [mattpocock/skills](https://github.com/mattpocock/skills), living at `~/.config/opencode/skills/grill-me/` and `~/.config/opencode/skills/grilling/`. **Nothing updates it automatically at all** — you have to periodically diff it against the original yourself:

```bash
curl -s https://raw.githubusercontent.com/mattpocock/skills/main/skills/productivity/grill-me/SKILL.md
curl -s https://raw.githubusercontent.com/mattpocock/skills/main/skills/productivity/grilling/SKILL.md
```

Compare against the existing files — if upstream has changed, **don't just copy it over directly**: the `grilling/SKILL.md` actually in use has been changed from the original in 1 place (the fact-finding paragraph, to use `graft ask` inline instead of "dispatch a sub-agent" — see [[plugins]]). That change has to be merged back in every time you update from upstream, or you'll accidentally regress back to relying on a subagent again.

> [!tip] No need to restart OpenCode
> Unlike a plugin, which only loads when a session starts — a file-based skill is read through the native skill tool and can be called immediately after saving the file.

**Removing it:** delete the `~/.config/opencode/skills/grill-me/` and `.../grilling/` folders. If a reconciliation rule was ever written into the global `AGENTS.md` (see [[plugins]]), don't forget to remove that too — otherwise `brainstorming` will keep trying to reference a skill that no longer exists.

---

## graft-deep.js (a hand-written custom plugin)

There's no upstream to "update" from, since it's hand-written — to improve it, edit `~/.config/opencode/plugin/graft-deep.js` directly (full source is in [[plugins]]). Nothing else to restart besides opening a new OpenCode session.

It still has two things to keep in step with, though:

1. **graft** — the plugin mirrors graft's own Claude Code prompt hook (the gate that decides when to inject). Compare after every graft upgrade — see the box under graft above.
2. **OpenCode** — the plugin depends on how OpenCode calls `experimental.chat.messages.transform` (reloaded messages every step, also called during compaction, synthetic parts). If a new OpenCode version changes that, the plugin's assumptions break — see [[plugins]], graft-deep → "How OpenCode runs this hook", and [[gotchas]] item 9.

Last checked: graft 0.19.0 + OpenCode 1.18.32 (2026-09-25).

---

## OpenDesign (desktop app)

Updates itself through its own launcher (since 0.22) — it checks for a new version when the app opens, nothing extra to run.

To check yourself, go to **Settings → About** in the app, or download the latest installer directly from [GitHub Releases](https://github.com/nexu-io/open-design/releases).

> [!note] Where the running version actually lives (Windows)
> Since 0.22 each version runs from `%APPDATA%\Open Design\launcher\channels\stable\namespaces\release-stable-win\versions\<version>\payload\`; the active one is `active.version` in `runtime.json` next to `versions\`. The original install folder under `Programs` stays on the first installed version.

> [!tip] Nothing to fix by hand after an update (Windows) — if the shim is the version-following one
> The `od.mjs` shim from [[gotchas]] item 4 reads `runtime.json` on every call, so it follows each update by itself, and the MCP config has no fixed port. Confirm with `od --help` and `opencode mcp list` (open-design should be connected). If you still have the older shim hardcoded to one path, replace it — it keeps running the old CLI.

---

## sonarqube (self-hosted, via Docker)

Unlike every other MCP on this page, this has **two separate parts to update**, and **neither auto-updates like npx does** — because it runs through Docker images pulled and cached locally, not fetched fresh from a registry on every call the way `npx -y package@latest` is.

### Part 1 — the SonarQube MCP wrapper (image `sonarsource/sonarqube-mcp`)

The configured setup (see [[mcp-servers]], the sonarqube section) doesn't pin a version, but also doesn't set `--pull=always` — so Docker keeps reusing the same cached image repeatedly, even though the tag is named `latest`. **You have to pull it yourself periodically to get a new version:**

```bash
docker pull sonarsource/sonarqube-mcp
```

> [!tip] If you want it checked automatically every time it opens
> Add `"--pull=always"` into the config's `"command"` array (after `docker run`) — trades off a slower startup every time, since it has to check the registry first; not recommended if opencode is opened/closed often.

### Part 2 — the SonarQube Server container (image `sonarqube:community`)

> [!note] Host port `9001`, not `9000`
> `9000` is often already taken by another local service, so this setup publishes SonarQube on host port `9001` (the container side stays `9000`). `update-opencode.mjs --recreate-sonarqube` reads the port from the existing container, so it keeps whatever you actually use.

This container is a service meant to stay running permanently (not spawned per-use like the MCP) — updating it means pulling a new image and recreating the container. No data is lost, since it's kept in separate named volumes:

```bash
docker pull sonarqube:community
docker stop sonarqube
docker rm sonarqube
docker run -d --name sonarqube -p 9001:9000 \
  -v sonarqube_data:/opt/sonarqube/data \
  -v sonarqube_extensions:/opt/sonarqube/extensions \
  -v sonarqube_logs:/opt/sonarqube/logs \
  sonarqube:community
```

Confirm the new version is actually running once the container starts successfully:

```bash
docker logs sonarqube | grep "SonarQube is operational"
```

Go to **http://localhost:9001 → Administration → System** to confirm the version number from the web UI too.

> [!danger] Skipping several major versions at once can break it
> SonarQube (like most databases) usually only supports upgrading one major version at a time. If it's been left alone a long time and you want to update across several versions at once, always check the [official Upgrade Guide](https://docs.sonarsource.com/sonarqube-server/upgrading/) first — sometimes you need to upgrade step by step in sequence, not jump straight to the latest version.

---

## trivy (CLI + MCP plugin)

3 parts, each updated through a different mechanism:

**1. The Trivy CLI itself** — update through the same package manager used to install it:

```powershell
winget upgrade AquaSecurity.Trivy
```

macOS: `brew upgrade trivy`

**2. The `mcp` plugin** — versioned separately from the main CLI, needs its own update step:

```bash
trivy plugin update      # refresh the plugin index first
trivy plugin upgrade     # upgrade installed plugins (including mcp) to the latest version
```

> [!warning] `trivy plugin update` can fail on some networks — the upgrade itself may still work
> `plugin update` only refreshes the plugin index, hosted on `aquasecurity.github.io`; seen timing out here (2026-09-25). `trivy plugin upgrade` still checked the `mcp` plugin's own repo and confirmed it up to date (`trivy plugin list` shows the version). The update script reports this case as a warning, not a failure.

**3. The vulnerability database** — **auto-updates on its own, nothing to do** — checks the DB's freshness itself on every scan, downloading a new one automatically if the cache is too old (unlike the 2 parts above, which need a manual command).

> [!note] Trivy has no "server" to update separately
> Unlike sonarqube, which has 2 parts (MCP wrapper + server container) — trivy is a standalone CLI with no long-running service to maintain; the 2 commands above are the whole update process.

---

## Full update checklist summary

| Component | Manual action needed? | Command |
| --- | --- | --- |
| OpenCode CLI | ✅ Manual | `opencode upgrade` |
| MCPs via npx (playwright, chrome-devtools, postgres, mysql, memory) | ❌ Automatic | — |
| context7 (remote) | ❌ Automatic (server-side) | — |
| graft | ✅ Manual | `graft upgrade` |
| superpowers | ⚠️ Manual (caching issue) | delete cache, then restart |
| ponytail | ⚠️ Manual (if the lockfile pinned a version) | delete cache, then restart |
| i-have-adhd | ✅ Manual (local clone) | `git pull`, then restart |
| grill-me / grilling | ✅ Manual diffing (vendored, no manager) | curl the raw URL, compare, merge the fix back in |
| graft-deep.js | ➖ No upstream (hand-written) — but compare with graft's hook after each graft upgrade | edit the file directly; see [[plugins]] |
| OpenDesign | ❌ Automatic (launcher auto-updater) | via the app's UI; the `od.mjs` shim follows the new version by itself |
| sonarqube MCP wrapper (docker) | ⚠️ Manual (not auto like npx) | `docker pull sonarsource/sonarqube-mcp` |
| sonarqube Server (container) | ✅ Manual | pull → stop → rm → recreate (same volumes + same host port, `9001`) |
| trivy CLI | ✅ Manual | `winget upgrade AquaSecurity.Trivy` |
| trivy plugin (mcp) | ✅ Manual (separate from the CLI) | `trivy plugin update && trivy plugin upgrade` (index refresh may fail on some networks — upgrade still works) |
| trivy vulnerability DB | ❌ Automatic | — |
