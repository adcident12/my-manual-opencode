# config/ — the files this setup adds to OpenCode

The files written or changed by hand for this setup, as real files you can copy — the manual pages explain *why* each one looks the way it does.

| File here | Goes to | What it is | Explained in |
| --- | --- | --- | --- |
| [`opencode.jsonc`](opencode.jsonc) | `~/.config/opencode/opencode.jsonc` | Global config template for OpenCode 2: provider, 2 package plugins, 11 MCP servers (6 on, 5 off by default), `compaction.keep`/`buffer`, the skill allow-list in `permissions`. Machine-specific values are `<placeholders>`; secrets are `{env:NAME}` references only. | `setup.md`, `mcp-servers.md`, `tuning.md` |
| [`AGENTS.md`](AGENTS.md) | `~/.config/opencode/AGENTS.md` | Global rules, 6 sections: approval before building, grill-me ↔ brainstorming, graft first (with OpenCode 2 Code Mode tool paths), verifying UI changes, re-reading after compaction, memory. | `plugins.md`, `tuning.md` §5.3 and §9 |
| [`plugin/graft-deep.js`](plugin/graft-deep.js) | `~/.config/opencode/plugin/graft-deep.js` | Custom OpenCode 2 plugin: appends graft context to each new prompt. Loaded from that folder by itself — no `plugin` array entry. Windows also needs `npm install cross-spawn` in `~/.config/opencode`. | `plugins.md`, graft-deep |
| [`skills/grilling-local-change.md`](skills/grilling-local-change.md) | applied to `~/.config/opencode/skills/grilling/SKILL.md` | The one paragraph changed in the upstream `grilling` skill. | `plugins.md`, grill-me / grilling |
| [`../scripts/od.mjs`](../scripts/od.mjs) | `~/.config/opencode/scripts/od.mjs` | Windows launcher for the OpenDesign CLI that follows the app's active version. | `gotchas.md` items 4, 16 |

Not stored here, fetched from their own repositories at install time: **superpowers** and **ponytail** (via the `plugin` array), **caveman** (downloaded from a pinned tag, then ported to OpenCode 2 with [`../scripts/port-caveman-opencode2.mjs`](../scripts/port-caveman-opencode2.mjs) — `plugins.md`), **grill-me / grilling** (mattpocock/skills).

Scripts for measuring and maintaining the setup live in [`../scripts/`](../scripts/): `update-opencode.mjs`, `port-caveman-opencode2.mjs`, `capture-server.mjs`, `analyze-prompt.mjs`, `session-report.mjs` (reads OpenCode 1 and 2 sessions).

**Letting an AI agent do the setup:** point it at [`../AGENT-SETUP.md`](../AGENT-SETUP.md).
