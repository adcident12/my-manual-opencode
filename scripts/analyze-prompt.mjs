#!/usr/bin/env node
/**
 * Breaks a prompt captured by capture-server.mjs into context-budget buckets:
 * OpenCode's base prompt, each AGENTS.md, MCP server instructions, the skill
 * list, plugin injections, the superpowers bootstrap, built-in tools, and
 * every MCP server's tool definitions.
 *
 * Usage:
 *   node analyze-prompt.mjs <req-NN.json> [--tokens <real prompt tokens>] [--json]
 *
 * Token counts are estimates: characters / 3.6 by default (measured against a
 * Qwen tokenizer on this setup). Pass --tokens with the provider-reported
 * prompt token count of the same prompt to calibrate the ratio exactly.
 */
import { readFileSync } from 'node:fs';
import { homedir } from 'node:os';

const args = process.argv.slice(2);
const file = args.find((a) => !a.startsWith('--'));
const realTokens = Number(args[args.indexOf('--tokens') + 1]) || 0;
if (!file) {
  console.error('usage: node analyze-prompt.mjs <req-NN.json> [--tokens N] [--json]');
  process.exit(1);
}
const req = JSON.parse(readFileSync(file, 'utf8'));

const BUILTIN = new Set([
  'bash', 'edit', 'glob', 'grep', 'list', 'read', 'write', 'task', 'todowrite', 'todoread', 'webfetch',
  'websearch', 'codesearch', 'skill', 'question', 'patch', 'apply_patch', 'lsp', 'invalid',
  'list_mcp_resources', 'list_mcp_resource_templates', 'read_mcp_resource',
]);
const buckets = new Map();
const add = (k, n) => n > 0 && buckets.set(k, (buckets.get(k) ?? 0) + n);
const text = (c) => (typeof c === 'string' ? c : Array.isArray(c) ? c.map((p) => p.text ?? '').join('\n') : '');

// --- system prompt
let sys = (req.messages ?? []).filter((m) => m.role === 'system').map((m) => text(m.content)).join('\n');
const take = (re, label) => {
  for (const m of [...sys.matchAll(re)]) {
    if (label) add(label, m[0].length);
    sys = sys.replace(m[0], '');
  }
};
// MCP server instructions count toward that server's bucket
const mcpBlock = sys.match(/<mcp_instructions>([\s\S]*?)<\/mcp_instructions>/)?.[1] ?? '';
for (const m of mcpBlock.matchAll(/<server name="([^"]+)">[\s\S]*?(?=<server name=|$)/g)) add(`mcp: ${m[1]}`, m[0].length);
take(/<mcp_instructions>[\s\S]*?<\/mcp_instructions>/g);
take(/<available_skills>[\s\S]*?<\/available_skills>/g, 'skill list (<available_skills>)');

const configDir = `${homedir()}`.toLowerCase();
const instr = [...sys.matchAll(/Instructions from: (.+)\n([\s\S]*?)(?=Instructions from: |$)/g)];
for (const m of instr) {
  const where = m[1].toLowerCase().replace(/\\/g, '/').includes(`${configDir.replace(/\\/g, '/')}/.config/`) ? 'global' : 'project';
  // stop the last AGENTS.md block where plugin-injected rulesets begin (a top-level "# " heading)
  const body = m[2].split(/\n(?=# [A-Z])/)[0];
  add(`AGENTS.md (${where})`, m[1].length + body.length);
  sys = sys.replace(`Instructions from: ${m[1]}\n${body}`, '');
}
const firstInstr = sys.indexOf('Instructions from: ');
const envEnd = sys.indexOf('</env>');
const baseEnd = envEnd >= 0 ? envEnd + 6 : firstInstr >= 0 ? firstInstr : sys.length;
add('OpenCode base prompt + <env>', baseEnd);
add('plugin injections (e.g. ponytail ruleset)', sys.slice(baseEnd).trim().length);

// --- messages
for (const m of req.messages ?? []) {
  if (m.role === 'system') continue;
  const t = text(m.content);
  add(t.includes('<EXTREMELY_IMPORTANT>') ? 'superpowers bootstrap (as a user message)' : `message: ${m.role}`, t.length);
}

// --- tools
const perServerCount = {};
for (const t of req.tools ?? []) {
  const f = t.function ?? t;
  const name = f.name ?? '?';
  const server = BUILTIN.has(name) ? null : name.split('_')[0];
  add(server ? `mcp: ${server}` : 'built-in tools', JSON.stringify(f.description ?? '').length + JSON.stringify(f.parameters ?? {}).length);
  const k = server ?? 'built-in';
  perServerCount[k] = (perServerCount[k] ?? 0) + 1;
}

const total = [...buckets.values()].reduce((a, b) => a + b, 0);
const ratio = realTokens ? realTokens / total : 1 / 3.6;
const rows = [...buckets].sort((a, b) => b[1] - a[1]).map(([k, v]) => ({
  bucket: k, chars: v, tokens: Math.round(v * ratio), share: v / total,
  tools: k.startsWith('mcp: ') ? perServerCount[k.slice(5)] ?? 0 : k === 'built-in tools' ? perServerCount['built-in'] : undefined,
}));

if (args.includes('--json')) {
  console.log(JSON.stringify({ totalChars: total, estTokens: Math.round(total * ratio), tools: req.tools?.length ?? 0, rows }, null, 2));
} else {
  console.log(`tools: ${req.tools?.length ?? 0}   ~${Math.round(total * ratio)} tokens (${total} chars, ${(1 / ratio).toFixed(2)} chars/token${realTokens ? ', calibrated' : ', assumed'})\n`);
  console.log('bucket'.padEnd(46) + '~tokens'.padStart(8) + 'share'.padStart(8) + '  tools');
  for (const r of rows) console.log(r.bucket.padEnd(46) + String(r.tokens).padStart(8) + `${(r.share * 100).toFixed(1)}%`.padStart(8) + (r.tools !== undefined ? `  ${r.tools}` : ''));
}
