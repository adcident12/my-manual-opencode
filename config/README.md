# config/ — the files this setup adds to OpenCode

The files written or changed by hand for this setup, as real files you can copy — the manual pages explain *why* each one looks the way it does.

| File here | Goes to | What it is | Explained in |
| --- | --- | --- | --- |
| [`opencode.jsonc`](opencode.jsonc) | `~/.config/opencode/opencode.jsonc` | Global config template for OpenCode 2: provider, 2 package plugins, 12 MCP servers (4 on, 8 off by default, including debugmcp), `mcp.timeout.startup`, `compaction.keep`/`buffer`, the skill allow-list and `external_directory` rules in `permissions`. Machine-specific values are `<placeholders>`; secrets are `{env:NAME}` references only. | `setup.md`, `mcp-servers.md`, `tuning.md` |
| [`AGENTS.md`](AGENTS.md) | `~/.config/opencode/AGENTS.md` | Global rules, 9 sections: approval before building, unattended work (decide, don't ask), large work one piece at a time, grill-me ↔ brainstorming, graft first (with OpenCode 2 Code Mode tool paths), verifying UI changes (incl. `evaluate_script`), debugger (debugmcp), re-reading after compaction, memory. | `plugins.md`, `tuning.md` §5.3, §9 and §10 |
| [`plugin/graft-deep.js`](plugin/graft-deep.js) | `~/.config/opencode/plugin/graft-deep.js` | Custom OpenCode 2 plugin: appends graft context to each new prompt. Loaded from that folder by itself — no `plugin` array entry. Windows also needs `npm install cross-spawn` in `~/.config/opencode`. | `plugins.md`, graft-deep |
| [`plugin/execute-guard.js`](plugin/execute-guard.js) | `~/.config/opencode/plugin/execute-guard.js` | Custom OpenCode 2 plugin: rewrites a Code Mode `new Promise(() => {})` that could never settle, so `execute` cannot hang. No config entry needed. | `plugins.md`, execute-guard; `gotchas.md` item 29 |
| [`plugin/compaction-keep.js`](plugin/compaction-keep.js) | `~/.config/opencode/plugin/compaction-keep.js` | Custom OpenCode 2 plugin: tells compaction summaries to keep the request, approvals, plan status, edited files and facts read. No config entry needed. | `plugins.md`, compaction-keep |
| [`skills/grilling-local-change.md`](skills/grilling-local-change.md) | applied to `~/.config/opencode/skills/grilling/SKILL.md` | The one paragraph changed in the upstream `grilling` skill. | `plugins.md`, grill-me / grilling |
| [`../scripts/od.mjs`](../scripts/od.mjs) | `~/.config/opencode/scripts/od.mjs` | Windows launcher for the OpenDesign CLI that follows the app's active version. | `gotchas.md` items 4, 16 |

Not stored here, fetched from their own repositories at install time: **superpowers** and **ponytail** (via the `plugin` array), **caveman** (downloaded from a pinned tag, then ported to OpenCode 2 with [`../scripts/port-caveman-opencode2.mjs`](../scripts/port-caveman-opencode2.mjs) — `plugins.md`), **grill-me / grilling** (mattpocock/skills).

Scripts for measuring and maintaining the setup live in [`../scripts/`](../scripts/): `update-opencode.mjs`, `port-caveman-opencode2.mjs`, `capture-server.mjs`, `analyze-prompt.mjs`, `session-report.mjs` (reads OpenCode 1 and 2 sessions).

**Letting an AI agent do the setup:** point it at [`../AGENT-SETUP.md`](../AGENT-SETUP.md).
