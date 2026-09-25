#!/usr/bin/env node
/**
 * Cross-platform (Windows/macOS/Ubuntu) maintenance script for the OpenCode
 * setup documented in this manual — see updating.md for the manual steps
 * each part of this script automates.
 *
 * Usage:
 *   node update-opencode.mjs                      # safe updates only
 *   node update-opencode.mjs --dry-run             # preview commands, run nothing
 *   node update-opencode.mjs --recreate-sonarqube  # also recreate the SonarQube server container
 *
 * Requires only Node.js — no extra dependencies to install.
 */

import { spawnSync } from 'node:child_process';
import { existsSync, rmSync, readFileSync } from 'node:fs';
import { homedir, platform } from 'node:os';
import { join } from 'node:path';
import https from 'node:https';

const isWin = platform() === 'win32';
const isMac = platform() === 'darwin';
const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const RECREATE_SONARQUBE = args.includes('--recreate-sonarqube');

if (args.includes('--help') || args.includes('-h')) {
  console.log(`
update-opencode.mjs — updates OpenCode CLI, MCP servers, plugins, and skills

  --dry-run             preview every command without running anything
  --recreate-sonarqube  also pull + recreate the SonarQube server container
                         (skipped by default — stops/removes a running container)
`);
  process.exit(0);
}

const CACHE_DIR = join(homedir(), '.cache', 'opencode', 'packages');
const CONFIG_DIR = join(homedir(), '.config', 'opencode');

const results = [];
const ICON = { ok: '✅', skip: '➖', warn: '⚠️', fail: '❌' };

function record(name, status, detail = '') {
  results.push({ name, status, detail });
  console.log(`${ICON[status]} ${name}${detail ? ' — ' + detail : ''}`);
}

// npm-installed CLIs are .cmd shims on Windows. Spawning a .cmd directly
// without a shell throws EINVAL (confirmed live — same bug documented for
// graft-deep.js in plugins.md); appending .cmd explicitly doesn't avoid it
// either. shell:true is the only fix that doesn't add a dependency — but
// only for those shims: a shell joins arguments unquoted, so an argument
// with a space (docker's `--format '{{json .Mounts}}'`) gets split and
// breaks (confirmed live: "template parsing error: unclosed action").
// Real .exe tools (docker, git, winget, trivy) therefore run without one.
// Every argument here is a fixed string we wrote, never user-supplied text,
// so Node's blanket DEP0190 warning about shell:true is silenced below.
process.noDeprecation = true;
const NPM_SHIMS = new Set(['opencode', 'graft', 'npm']);

function run(cmd, cmdArgs) {
  const label = [cmd, ...cmdArgs].join(' ');
  if (DRY_RUN) {
    console.log(`  [dry-run] would run: ${label}`);
    return { status: 0, stdout: '', stderr: '' };
  }
  return spawnSync(cmd, cmdArgs, { encoding: 'utf8', shell: isWin && NPM_SHIMS.has(cmd) });
}

function which(cmd) {
  return spawnSync(isWin ? 'where' : 'which', [cmd], { encoding: 'utf8' }).status === 0;
}

function resolveDocker() {
  if (which('docker')) return 'docker';
  if (isWin) {
    const fallback = 'C:/Program Files/Docker/Docker/resources/bin/docker.exe';
    if (existsSync(fallback)) return fallback;
  }
  return null;
}

function clearCache(name, dir) {
  if (!existsSync(dir)) return record(name, 'skip', 'no cache found, nothing to clear');
  if (DRY_RUN) return record(name, 'ok', `would remove ${dir}`);
  try {
    rmSync(dir, { recursive: true, force: true });
    record(name, 'ok', 'cache cleared — restart OpenCode to re-fetch the latest version');
  } catch (e) {
    record(name, 'fail', e.message);
  }
}

function firstLine(text) {
  return (text || '').trim().split('\n')[0];
}

function httpsGet(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, { headers: { 'User-Agent': 'update-opencode-script' } }, (res) => {
        let data = '';
        res.on('data', (c) => (data += c));
        res.on('end', () => resolve(data));
      })
      .on('error', reject);
  });
}

function updateOpencodeCli() {
  if (!which('opencode')) return record('OpenCode CLI', 'skip', 'opencode not found on PATH');
  const r = run('opencode', ['upgrade', '-m', 'npm']);
  if (DRY_RUN || r.status === 0) record('OpenCode CLI', 'ok', firstLine(r.stdout));
  else record('OpenCode CLI', 'fail', firstLine(r.stderr) || firstLine(r.stdout));
}

function updateGraft() {
  if (!which('graft')) return record('graft', 'skip', 'graft not found on PATH');
  let r = run('graft', ['upgrade']);
  if (!DRY_RUN && r.status !== 0) {
    console.log('  graft upgrade failed (known issue on some Windows setups) — falling back to npm install -g');
    r = run('npm', ['install', '-g', '@nanonets/graft@latest']);
  }
  if (DRY_RUN || r.status === 0) record('graft', 'ok');
  else record('graft', 'fail', firstLine(r.stderr) || firstLine(r.stdout));
}

function updateSuperpowers() {
  clearCache('superpowers', join(CACHE_DIR, 'superpowers@git+https_'));
}

function updatePonytail() {
  clearCache('ponytail', join(CACHE_DIR, '@dietrichgebert'));
}

function updateIHaveAdhd() {
  const dir = join(CONFIG_DIR, 'vendor', 'i-have-adhd');
  if (!existsSync(dir)) return record('i-have-adhd', 'skip', `not installed at ${dir}`);
  const r = run('git', ['-C', dir, 'pull']);
  if (DRY_RUN || r.status === 0) record('i-have-adhd', 'ok', firstLine(r.stdout));
  else record('i-have-adhd', 'fail', firstLine(r.stderr) || firstLine(r.stdout));
}

async function checkGrillMeGrilling() {
  const skillsDir = join(CONFIG_DIR, 'skills');
  const grillMeDir = join(skillsDir, 'grill-me');
  const grillingDir = join(skillsDir, 'grilling');
  if (!existsSync(grillMeDir) && !existsSync(grillingDir)) {
    return record('grill-me / grilling', 'skip', 'not installed');
  }
  if (DRY_RUN) return record('grill-me / grilling', 'ok', 'would diff local files against upstream');

  const rawBase = 'https://raw.githubusercontent.com/mattpocock/skills/main/skills/productivity';
  // grilling has one known, intentional local edit (inline graft ask instead of
  // "dispatch a sub-agent") — strip that paragraph from both sides before comparing.
  const stripFactsParagraph = (s) => s.replace(/Finding _facts_[\s\S]*?to them and wait\./, '').trim();

  try {
    let changed = false;
    const notes = [];
    for (const [name, dir, normalize] of [
      ['grill-me', grillMeDir, (s) => s.trim()],
      ['grilling', grillingDir, stripFactsParagraph],
    ]) {
      const localPath = join(dir, 'SKILL.md');
      if (!existsSync(localPath)) continue;
      const upstream = await httpsGet(`${rawBase}/${name}/SKILL.md`);
      const local = readFileSync(localPath, 'utf8');
      if (normalize(upstream) !== normalize(local)) {
        changed = true;
        notes.push(name);
      }
    }
    if (changed) {
      record(
        'grill-me / grilling',
        'warn',
        `upstream changed for: ${notes.join(', ')} — review manually before copying over (grilling has a local fix, do not overwrite it)`
      );
    } else {
      record('grill-me / grilling', 'ok', 'matches upstream (aside from the known local fix)');
    }
  } catch (e) {
    record('grill-me / grilling', 'warn', `couldn't reach upstream: ${e.message}`);
  }
}

function updateSonarqubeMcpWrapper(docker) {
  if (!docker) return record('sonarqube MCP wrapper', 'skip', 'docker not found');
  const r = run(docker, ['pull', 'sonarsource/sonarqube-mcp']);
  if (DRY_RUN || r.status === 0) record('sonarqube MCP wrapper', 'ok');
  else record('sonarqube MCP wrapper', 'fail', firstLine(r.stderr) || firstLine(r.stdout));
}

const DEFAULT_SONARQUBE_VOLUMES = [
  '-v', 'sonarqube_data:/opt/sonarqube/data',
  '-v', 'sonarqube_extensions:/opt/sonarqube/extensions',
  '-v', 'sonarqube_logs:/opt/sonarqube/logs',
];

// Host port 9001, not SonarQube's own 9000 — 9000 is commonly already taken
// by another local service (see mcp-servers.md). The container side stays 9000.
const DEFAULT_SONARQUBE_HOST_PORT = '9001';

// read-only, so it runs even under --dry-run — the preview then shows the real values
function inspectSonarqube(docker, template) {
  const r = spawnSync(docker, ['inspect', 'sonarqube', '--format', template], { encoding: 'utf8' });
  if (r.status !== 0 || !r.stdout?.trim()) return null;
  try {
    return JSON.parse(r.stdout.trim());
  } catch {
    return null;
  }
}

function resolveSonarqubeVolumeArgs(docker) {
  const mounts = inspectSonarqube(docker, '{{json .Mounts}}');
  // named volumes only — anonymous ones (64-hex names, e.g. the image's
  // /opt/sonarqube/temp VOLUME) are scratch space the new container recreates itself
  const named = (mounts ?? []).filter(
    (m) => m.Type === 'volume' && m.Name && m.Destination && !/^[0-9a-f]{64}$/.test(m.Name)
  );
  return named.length ? named.flatMap((m) => ['-v', `${m.Name}:${m.Destination}`]) : DEFAULT_SONARQUBE_VOLUMES;
}

function resolveSonarqubeHostPort(docker) {
  const bindings = inspectSonarqube(docker, '{{json .HostConfig.PortBindings}}');
  return bindings?.['9000/tcp']?.[0]?.HostPort || DEFAULT_SONARQUBE_HOST_PORT;
}

function recreateSonarqubeServer(docker) {
  if (!RECREATE_SONARQUBE) {
    return record('sonarqube Server container', 'skip', 'pass --recreate-sonarqube to update it');
  }
  if (!docker) return record('sonarqube Server container', 'skip', 'docker not found');

  // read the existing container's volumes + host port before removing it
  const mountArgs = resolveSonarqubeVolumeArgs(docker);
  const hostPort = resolveSonarqubeHostPort(docker);
  const pull = run(docker, ['pull', 'sonarqube:community']);
  if (!DRY_RUN && pull.status !== 0) {
    return record('sonarqube Server container', 'fail', firstLine(pull.stderr));
  }
  run(docker, ['stop', 'sonarqube']);
  run(docker, ['rm', 'sonarqube']);
  const up = run(docker, ['run', '-d', '--name', 'sonarqube', '-p', `${hostPort}:9000`, ...mountArgs, 'sonarqube:community']);
  if (DRY_RUN || up.status === 0) {
    record('sonarqube Server container', 'ok', `recreated — check http://localhost:${hostPort} once it finishes booting (~1-2 min)`);
  } else {
    record('sonarqube Server container', 'fail', firstLine(up.stderr));
  }
}

function updateTrivyCli() {
  if (!which('trivy')) return record('trivy CLI', 'skip', 'trivy not found on PATH');

  if (isWin) {
    const r = run('winget', ['upgrade', '--id', 'AquaSecurity.Trivy', '-e']);
    const out = (r.stdout || '') + (r.stderr || '');
    if (DRY_RUN || r.status === 0 || /no (applicable|available) upgrade/i.test(out)) {
      record('trivy CLI', 'ok', /no (applicable|available) upgrade/i.test(out) ? 'already latest' : '');
    } else {
      record('trivy CLI', 'fail', firstLine(out));
    }
    return;
  }

  if (isMac) {
    if (!which('brew')) return record('trivy CLI', 'skip', 'Homebrew not found');
    const r = run('brew', ['upgrade', 'trivy']);
    const out = (r.stdout || '') + (r.stderr || '');
    if (DRY_RUN || r.status === 0 || /already installed/i.test(out)) {
      record('trivy CLI', 'ok', /already installed/i.test(out) ? 'already latest' : '');
    } else {
      record('trivy CLI', 'fail', firstLine(out));
    }
    return;
  }

  // Linux: upgrading via apt needs sudo, which this script never runs on its
  // own — surface the exact command instead of prompting for a password.
  record('trivy CLI', 'skip', 'run manually: sudo apt-get update && sudo apt-get install --only-upgrade trivy (or your distro\'s package manager)');
}

function updateTrivyPlugin() {
  if (!which('trivy')) return record('trivy plugin (mcp)', 'skip', 'trivy not found on PATH');
  const r1 = run('trivy', ['plugin', 'update']);
  const r2 = run('trivy', ['plugin', 'upgrade']);
  if (DRY_RUN || (r1.status === 0 && r2.status === 0)) {
    record('trivy plugin (mcp)', 'ok', firstLine(r2.stdout));
  } else if (r2.status === 0) {
    // `plugin update` only refreshes the index (hosted on github.io, which some
    // networks block/time out); `upgrade` still checks each plugin's own repo
    record('trivy plugin (mcp)', 'warn', 'plugins upgraded, but the plugin index refresh failed (network?) — retry `trivy plugin update` later');
  } else {
    record('trivy plugin (mcp)', 'fail', firstLine(r2.stderr) || firstLine(r1.stderr));
  }
}

function printSummary() {
  console.log('\n' + '='.repeat(50));
  console.log('Summary');
  console.log('='.repeat(50));
  for (const { name, status, detail } of results) {
    console.log(`${ICON[status]} ${name.padEnd(28)} ${detail}`);
  }
  const failed = results.filter((r) => r.status === 'fail');
  const warned = results.filter((r) => r.status === 'warn');
  console.log('');
  if (failed.length) console.log(`${failed.length} failed — see errors above.`);
  if (warned.length) console.log(`${warned.length} need a manual look — see warnings above.`);
  if (!failed.length && !warned.length) console.log('Everything checked out.');
  process.exitCode = failed.length ? 1 : 0;
}

console.log(`OpenCode setup — update check${DRY_RUN ? ' (dry run)' : ''}`);
console.log('='.repeat(50));

updateOpencodeCli();
updateGraft();
updateSuperpowers();
updatePonytail();
updateIHaveAdhd();
await checkGrillMeGrilling();

const docker = resolveDocker();
updateSonarqubeMcpWrapper(docker);
recreateSonarqubeServer(docker);

updateTrivyCli();
updateTrivyPlugin();

record('graft-deep.js', 'skip', 'hand-written, no upstream — edit ~/.config/opencode/plugin/graft-deep.js directly if needed');
record('OpenDesign', 'skip', 'launcher auto-updater — check Settings → About in the app (Windows: the od.mjs shim follows the active version by itself)');
record('MCPs via npx (playwright, chrome-devtools, memory)', 'ok', 'already auto-update on every launch, nothing to do');

printSummary();
