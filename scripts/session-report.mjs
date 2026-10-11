#!/usr/bin/env node
/**
 * Read-only reports over OpenCode's own session database, to check whether the
 * workflow in USER-MANUAL.md / architecture.md is what actually happens.
 * Requires Node.js >= 22.5 (built-in node:sqlite). Nothing is written.
 *
 *   node session-report.mjs usage   [--since YYYY-MM-DD]   tool calls grouped by MCP server / built-in tool, plus skills loaded
 *   node session-report.mjs rereads [--since YYYY-MM-DD]   why files were read again: after own edit / after compaction / for no new reason
 *   node session-report.mjs session <title>                one session turn by turn: tool sequence, graft vs read, skills, compactions
 *
 * Database: ~/.local/share/opencode/opencode.db (override with OPENCODE_DB).
 * Built-in tool names are listed below; anything else is "<mcp-server>_<tool>".
 *
 * Reads both OpenCode 1 sessions (tables session/message/part) and OpenCode 2
 * sessions (session_v2/session_message). OpenCode 2 records are normalized to
 * the V1 shape: `shell` counts as `bash`, `path` as `filePath`, and each MCP
 * call made inside an `execute` (Code Mode) script — `tools.graft.graft_find_code(...)`,
 * `tools["chrome-devtools"].click(...)` — counts as one `<server>_<tool>` call.
 */
import { DatabaseSync } from 'node:sqlite';
import { homedir } from 'node:os';
import { basename, join } from 'node:path';

const [cmd, ...rest] = process.argv.slice(2);
const opt = (name, def) => (rest.includes(name) ? rest[rest.indexOf(name) + 1] : def);
const since = Date.parse(opt('--since', '1970-01-01'));
const db = new DatabaseSync(process.env.OPENCODE_DB ?? join(homedir(), '.local', 'share', 'opencode', 'opencode.db'), { readOnly: true });
const hasTable = (name) => !!db.prepare("select 1 from sqlite_master where type = 'table' and name = ?").get(name);
const V1 = hasTable('part'), V2 = hasTable('session_message');

const BUILTIN = new Set(['bash', 'edit', 'glob', 'grep', 'list', 'read', 'write', 'task', 'todowrite', 'todoread', 'webfetch',
  'websearch', 'codesearch', 'skill', 'question', 'patch', 'apply_patch', 'lsp', 'invalid', 'execute', 'subagent',
  'list_mcp_resources', 'list_mcp_resource_templates', 'read_mcp_resource']);
const group = (tool) => (BUILTIN.has(tool) ? tool : `mcp:${tool.split('_')[0]}`);

const roots = () => [
  ...(V1 ? db.prepare('select id, title, directory, time_created, 1 as v from session where parent_id is null and time_created >= ?').all(since) : []),
  ...(V2 ? db.prepare('select id, title, directory, time_created, 2 as v from session_v2 where parent_id is null and time_created >= ?').all(since) : []),
].sort((a, b) => a.time_created - b.time_created);

const partsV1 = (id) => db.prepare(`select p.data, m.data as mdata from part p join message m on m.id = p.message_id
  where p.session_id in (select id from session where id = ? or parent_id = ?) order by p.time_created`).all(id, id)
  .map((r) => ({ ...JSON.parse(r.data), role: JSON.parse(r.mdata).role }));

// Code Mode: tools.ns.fn( / tools.ns["fn"]( / tools["ns"].fn( / tools["ns"]["fn"](
const MCP_CALL = /tools(?:\.([\w$]+)|\[\s*["']([^"']+)["']\s*\])(?:\.([\w$]+)|\[\s*["']([^"']+)["']\s*\])\s*\(/g;
const V2_TOOL = { shell: 'bash', subagent: 'task' };
function partsV2(id) {
  const out = [];
  const rows = db.prepare(`select type, data from session_message
    where session_id in (select id from session_v2 where id = ? or parent_id = ?) order by time_created, seq`).all(id, id);
  for (const r of rows) {
    const d = JSON.parse(r.data);
    if (r.type === 'user') out.push({ role: 'user', type: 'text', text: d.text ?? '' });
    else if (r.type === 'synthetic') out.push({ role: 'user', type: 'text', text: d.text ?? '', synthetic: true });
    else if (r.type === 'compaction') out.push({ role: 'assistant', type: 'compaction' });
    else if (r.type === 'assistant') {
      for (const c of d.content ?? []) {
        if (c.type !== 'tool') continue;
        const input = { ...(c.state?.input ?? {}) };
        input.filePath ??= input.path;
        if (c.name === 'skill') input.name ??= input.id;
        const output = (c.state?.content ?? []).map((x) => x.text ?? '').join('');
        const state = { ...c.state, input, output };
        const calls = c.name === 'execute' ? [...String(input.code ?? '').matchAll(MCP_CALL)] : [];
        if (calls.length) for (const m of calls) out.push({ role: 'assistant', type: 'tool', tool: `${m[1] ?? m[2]}_${m[3] ?? m[4]}`, state });
        else out.push({ role: 'assistant', type: 'tool', tool: V2_TOOL[c.name] ?? c.name, state });
      }
    }
  }
  return out;
}
const partsOf = (s) => (s.v === 2 ? partsV2(s.id) : partsV1(s.id));
const fileOf = (p) => (p.state?.input?.filePath ?? p.state?.input?.file_path ?? '').replace(/\\/g, '/').toLowerCase();

if (cmd === 'usage') {
  const calls = {}, sessions = {}, skills = {};
  const list = roots();
  for (const s of list) {
    for (const p of partsOf(s).filter((x) => x.type === 'tool')) {
      const g = group(p.tool);
      calls[g] = (calls[g] ?? 0) + 1;
      (sessions[g] ??= new Set()).add(s.id);
      if (p.tool === 'skill') skills[p.state?.input?.name] = (skills[p.state?.input?.name] ?? 0) + 1;
    }
  }
  console.log(`${list.length} root sessions since ${new Date(since).toISOString().slice(0, 10)}\n`);
  console.log('tool / server'.padEnd(28) + 'calls'.padStart(7) + 'sessions'.padStart(10));
  for (const [g, n] of Object.entries(calls).sort((a, b) => b[1] - a[1])) console.log(g.padEnd(28) + String(n).padStart(7) + String(sessions[g].size).padStart(10));
  console.log(`\nskills loaded: ${Object.entries(skills).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k}×${v}`).join(', ') || 'none'}`);
} else if (cmd === 'rereads') {
  console.log('session'.padEnd(34) + 'reads'.padStart(6) + 'compactions'.padStart(12) + '  re-read after: own-edit / compaction / no-new-info   re-read share of read output');
  for (const s of roots()) {
    const parts = partsOf(s);
    const reads = parts.filter((p) => p.tool === 'read');
    if (reads.length < 10) continue;
    const seen = new Set(), editedSince = new Map(), compactAt = new Map();
    let epoch = 0, afterEdit = 0, afterCompact = 0, none = 0, all = 0, again = 0;
    for (const p of parts) {
      if (p.type === 'compaction') { epoch++; continue; }
      if (p.tool === 'edit' || p.tool === 'write') { editedSince.set(fileOf(p), true); continue; }
      if (p.tool !== 'read') continue;
      const f = fileOf(p), len = (p.state?.output ?? '').length;
      all += len;
      if (seen.has(f)) {
        again += len;
        if (editedSince.get(f)) afterEdit++;
        else if (compactAt.get(f) !== epoch) afterCompact++;
        else none++;
      }
      seen.add(f); editedSince.set(f, false); compactAt.set(f, epoch);
    }
    const label = `${(s.title ?? '').slice(0, 22)} [${basename(s.directory)}]`.slice(0, 33);
    console.log(label.padEnd(34) + String(reads.length).padStart(6) + String(epoch).padStart(12) + `  ${afterEdit} / ${afterCompact} / ${none}`.padEnd(34) + `${all ? Math.round((again / all) * 100) : 0}%`.padStart(22));
  }
} else if (cmd === 'session') {
  const title = rest.filter((a) => !a.startsWith('--')).join(' ');
  const s = roots().filter((r) => r.title === title).at(-1);
  if (!s) { console.error(`no session titled "${title}"`); process.exit(1); }
  const parts = partsOf(s);
  const short = (p) => {
    const i = p.state?.input ?? {};
    const f = (i.filePath ?? '').split(/[\\/]/).slice(-2).join('/');
    if (p.tool === 'read') return `read(${f}${i.offset || i.limit ? `:${i.offset ?? 0}+${i.limit ?? ''}` : ''})`;
    if (p.tool === 'skill') return `skill(${i.name})`;
    if (p.tool === 'edit' || p.tool === 'write') return `${p.tool}(${f})`;
    return p.tool;
  };
  let turn = 0;
  for (const p of parts) {
    if (p.role === 'user' && p.type === 'text' && !p.synthetic) console.log(`\nturn ${++turn}: "${p.text.slice(0, 70)}"`);
    else if (p.type === 'tool') process.stdout.write(`  ${short(p)}\n`);
    else if (p.type === 'compaction') console.log('  ⟪compaction⟫');
  }
  const tools = parts.filter((p) => p.type === 'tool');
  const reads = tools.filter((p) => p.tool === 'read');
  const n = (f) => tools.filter(f).length;
  console.log(`\ntools=${tools.length} graft=${n((p) => p.tool.startsWith('graft_'))} read=${reads.length} (ranged=${reads.filter((p) => p.state?.input?.offset || p.state?.input?.limit).length}, re-reads=${reads.length - new Set(reads.map(fileOf)).size}) edit/write=${n((p) => p.tool === 'edit' || p.tool === 'write')} memory=${n((p) => p.tool.startsWith('memory_'))} compactions=${parts.filter((p) => p.type === 'compaction').length}`);
  console.log(`skills: ${tools.filter((p) => p.tool === 'skill').map((p) => p.state?.input?.name).join(', ') || 'none'}`);
} else {
  console.log('usage: node session-report.mjs usage|rereads [--since YYYY-MM-DD] | session <title>');
}
