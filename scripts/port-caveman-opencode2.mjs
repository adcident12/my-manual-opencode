#!/usr/bin/env node
/**
 * Port caveman's OpenCode plugin (upstream V1 shape, still the case in
 * caveman v3.2.0) to the OpenCode 2 plugin API, in place. Run it after every
 * caveman download/update — see plugins.md, caveman.
 *
 *   node port-caveman-opencode2.mjs [opencode-config-dir]
 *
 * Default config dir: ~/.config/opencode (or $XDG_CONFIG_HOME/opencode).
 *
 * What it does:
 *  1. plugins/caveman/plugin.js — keeps every helper (flag file, mode parser,
 *     ruleset loader) and replaces only the exported V1 plugin function with a
 *     V2 definition. The original is kept as plugin.v1.js.
 *       event (session.created)            -> ctx.event.subscribe()
 *       chat.message                       -> ctx.session.hook('prompt')
 *       experimental.chat.system.transform -> ctx.session.hook('context')
 *  2. plugin/caveman.js — a one-line shim. OpenCode 2 loads .js files in
 *     plugin/ by itself, but skips the plugins/caveman directory without a
 *     diagnostic (v2.0.26), and a plugin path in the config must be a
 *     directory, so the shim is what actually loads caveman.
 *
 * Idempotent: a plugin.js that is already ported is left alone.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync, copyFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

const configDir = process.argv[2] ?? join(process.env.XDG_CONFIG_HOME ?? join(homedir(), '.config'), 'opencode');
const pluginFile = join(configDir, 'plugins', 'caveman', 'plugin.js');
const shimFile = join(configDir, 'plugin', 'caveman.js');

const V2_ENTRY = `// OpenCode 2 entry point (ported by port-caveman-opencode2.mjs; upstream still
// ships only the V1 shape, which OpenCode 2 does not load).
export default {
  id: 'caveman',
  async setup(ctx) {
    // Assert the flag at load as well: in one-shot \`opencode run\` the first
    // session.created can publish before the subscription below is live.
    handleSessionCreated();

    const controller = new AbortController();
    void (async () => {
      try {
        for await (const event of ctx.event.subscribe({ signal: controller.signal })) {
          if (event && event.type === 'session.created') handleSessionCreated();
        }
      } catch {
        // aborted on unload, or the stream closed — the load-time write still stands
      }
    })();

    // Mode changes from /caveman commands and natural-language toggles. The
    // prompt hook sees command templates already expanded (expandedTpl) and
    // its text edits become the persisted prompt.
    await ctx.session.hook('prompt', (event) => {
      const text = event.prompt?.text;
      if (!text) return;
      const change = parseModeChange(text, { getDefaultMode, expandedTpl: true, unwrapQuotes: true });
      if (change && change.action === 'status') {
        const active = readFlag(flagPath);
        event.prompt.text = 'Report this status verbatim without changing mode: Caveman mode: ' + (active || 'off');
        return;
      }
      if (change) applyModeChange(change);
    });

    // Per-request reinforcement. event.system is rebuilt for every model call,
    // so a plain push cannot accumulate across turns.
    await ctx.session.hook('context', (event) => {
      const active = readFlag(flagPath);
      if (active && !INDEPENDENT_MODES.has(active)) {
        event.system.push({ type: 'text', text: reinforcementLine(active) });
      }
    });

    return () => controller.abort();
  },
};
`;

if (!existsSync(pluginFile)) {
  console.error(`not found: ${pluginFile} — download caveman first (plugins.md)`);
  process.exit(1);
}
const source = readFileSync(pluginFile, 'utf8');
if (source.includes("id: 'caveman'")) {
  console.log(`already ported: ${pluginFile}`);
} else {
  const at = source.indexOf('export const CavemanPlugin');
  if (at < 0) {
    console.error('could not find "export const CavemanPlugin" — upstream changed its plugin; port it by hand (plugins.md)');
    process.exit(1);
  }
  for (const name of ['handleSessionCreated', 'parseModeChange', 'applyModeChange', 'readFlag', 'reinforcementLine', 'INDEPENDENT_MODES', 'flagPath', 'getDefaultMode']) {
    if (!source.slice(0, at).includes(name)) {
      console.error(`helper "${name}" is missing above the export — upstream changed its plugin; port it by hand (plugins.md)`);
      process.exit(1);
    }
  }
  copyFileSync(pluginFile, join(configDir, 'plugins', 'caveman', 'plugin.v1.js'));
  writeFileSync(pluginFile, source.slice(0, at) + V2_ENTRY);
  console.log(`ported: ${pluginFile} (original kept as plugin.v1.js)`);
}

mkdirSync(join(configDir, 'plugin'), { recursive: true });
writeFileSync(shimFile, "// Loads plugins/caveman on OpenCode 2 (see port-caveman-opencode2.mjs).\nexport { default } from '../plugins/caveman/plugin.js';\n");
console.log(`shim: ${shimFile}`);
