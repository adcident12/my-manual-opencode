#!/usr/bin/env node
/**
 * Version-following launcher for OpenDesign's `od` CLI (Windows).
 *
 * Since OpenDesign 0.22, the desktop app auto-updates through its own
 * launcher into %APPDATA%\Open Design\launcher\...\versions\<version>\payload
 * instead of the original install dir, so a shim hardcoded to one version's
 * daemon-cli.mjs goes stale on every update. This reads the launcher's
 * runtime.json (active.version) and runs that version's CLI with the
 * version's own bundled Electron as Node (ELECTRON_RUN_AS_NODE=1).
 *
 * Falls back to the original install dir if no launcher runtime is found.
 *
 * For `od mcp` (no --daemon-url / OD_DAEMON_URL), it also fills in the env
 * the app's own /api/mcp/install-info hands out, so the MCP finds the
 * desktop daemon's current (ephemeral) port through the sidecar pipe and
 * starts the app headless if it's closed — no fixed port in the config.
 * The pipe name is derived exactly like @open-design/sidecar's
 * resolvePrivateIpcPath (username + stamp, no version/pid), so it survives
 * restarts and updates. Any of these vars already set in the environment wins.
 *
 * Called from %APPDATA%\npm\od.cmd — see gotchas.md #4.
 */
import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { userInfo } from 'node:os';
import { join } from 'node:path';

const appData = process.env.APPDATA ?? '';
const localAppData = process.env.LOCALAPPDATA ?? '';
const CHANNEL = 'stable';
const NAMESPACE = 'release-stable-win';
const namespaceDir = join(appData, 'Open Design', 'launcher', 'channels', CHANNEL, 'namespaces', NAMESPACE);
const CLI_REL = join('resources', 'app', 'prebundled', 'daemon', 'daemon-cli.mjs');
const legacyDir = join(localAppData, 'Programs', 'Open Design');

function readJson(file) {
  try {
    return JSON.parse(readFileSync(file, 'utf8'));
  } catch {
    return null;
  }
}

function daemonPipe() {
  const stamp = [`channel=${CHANNEL}`, `namespace=${NAMESPACE}`, 'source=packaged', 'mode=runtime', 'app=daemon'].join('\n');
  const digest = createHash('sha256').update(`${userInfo().username}\n${stamp}`).digest('hex').slice(0, 32);
  return `\\\\.\\pipe\\open-design-sidecar-${digest}`;
}

function mcpEnv(args) {
  // only the plain stdio proxy (`od mcp [--flags]`), not `od mcp install` / `od mcp live-artifacts`
  if (args[0] !== 'mcp' || (args[1] && !args[1].startsWith('--'))) return {};
  if (args.includes('--daemon-url') || process.env.OD_DAEMON_URL) return {};
  const launchPath = readJson(join(namespaceDir, 'install.json'))?.launchPath ?? join(legacyDir, 'Open Design.exe');
  const defaults = {
    OD_DATA_DIR: join(appData, 'Open Design', 'namespaces', NAMESPACE, 'data'),
    OD_SIDECAR_CLIENT_ENDPOINT: daemonPipe(),
    OD_MCP_BOOTSTRAP_COMMAND: launchPath,
    OD_MCP_BOOTSTRAP_ARGS: '["--headless"]',
  };
  return Object.fromEntries(Object.entries(defaults).filter(([k]) => !process.env[k]));
}

function resolveTarget() {
  const runtime = readJson(join(namespaceDir, 'runtime.json'));
  for (const v of [runtime?.active?.version, runtime?.lastSuccessful?.version]) {
    if (!v) continue;
    const payload = join(namespaceDir, 'versions', v, 'payload');
    const exe = join(payload, 'Open Design.exe');
    const cli = join(payload, CLI_REL);
    if (existsSync(exe) && existsSync(cli)) return { exe, cli };
  }
  // no launcher runtime yet — the original install
  return { exe: join(legacyDir, 'Open Design.exe'), cli: join(legacyDir, CLI_REL) };
}

const args = process.argv.slice(2);
const { exe, cli } = resolveTarget();
if (!existsSync(exe) || !existsSync(cli)) {
  process.stderr.write(`od: OpenDesign CLI not found (looked for ${cli})\n`);
  process.exit(1);
}

const child = spawn(exe, [cli, ...args], {
  stdio: 'inherit',
  env: { ...process.env, ...mcpEnv(args), ELECTRON_RUN_AS_NODE: '1' },
  windowsHide: true,
});
for (const sig of ['SIGINT', 'SIGTERM']) process.on(sig, () => child.kill(sig));
child.on('error', (e) => {
  process.stderr.write(`od: ${e.message}\n`);
  process.exit(1);
});
child.on('exit', (code, signal) => process.exit(code ?? (signal ? 1 : 0)));
