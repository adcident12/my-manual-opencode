#!/usr/bin/env node
/**
 * Fake OpenAI-compatible endpoint that records every request OpenCode sends
 * and answers "ok" (streamed or not). Lets you see the exact prompt a model
 * receives — system prompt, AGENTS.md files, skill list, every MCP tool
 * definition — without calling a real model and without anything leaving
 * the machine. See tuning.md for the full procedure.
 *
 * Usage:
 *   node capture-server.mjs <out-dir> [port=18555]
 *
 * Then, in another terminal, point one `opencode run` at it (nothing in
 * your real config changes — OPENCODE_CONFIG_CONTENT is merged on top):
 *
 *   OPENCODE_CONFIG_CONTENT='{"provider":{"capture":{"npm":"@ai-sdk/openai-compatible","options":{"baseURL":"http://127.0.0.1:18555/v1"},"models":{"fake":{"limit":{"context":131072,"output":32768}}}}}}' \
 *     opencode run -m capture/fake "Reply with exactly the word: ok"
 *
 * The largest req-NN.json is the main prompt (the small one is session-title
 * generation). Analyze it with analyze-prompt.mjs.
 */
import { createServer } from 'node:http';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const outDir = process.argv[2];
const port = Number(process.argv[3] ?? 18555);
if (!outDir) {
  console.error('usage: node capture-server.mjs <out-dir> [port]');
  process.exit(1);
}
mkdirSync(outDir, { recursive: true });
let n = 0;

createServer((req, res) => {
  let body = '';
  req.on('data', (c) => (body += c));
  req.on('end', () => {
    n += 1;
    const file = join(outDir, `req-${String(n).padStart(2, '0')}.json`);
    try {
      writeFileSync(file, body);
    } catch (e) {
      console.error(`could not write ${file}: ${e.message}`);
    }
    let json = {};
    try {
      json = JSON.parse(body);
    } catch {}
    const base = { id: `cap-${n}`, created: Math.floor(Date.now() / 1000), model: json.model ?? 'fake' };
    const usage = { prompt_tokens: 1, completion_tokens: 1, total_tokens: 2 };
    if (json.stream) {
      res.writeHead(200, { 'content-type': 'text/event-stream', 'cache-control': 'no-cache' });
      const send = (o) => res.write(`data: ${JSON.stringify(o)}\n\n`);
      send({ ...base, object: 'chat.completion.chunk', choices: [{ index: 0, delta: { role: 'assistant', content: 'ok' }, finish_reason: null }] });
      send({ ...base, object: 'chat.completion.chunk', choices: [{ index: 0, delta: {}, finish_reason: 'stop' }], usage });
      res.end('data: [DONE]\n\n');
    } else {
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ ...base, object: 'chat.completion', choices: [{ index: 0, message: { role: 'assistant', content: 'ok' }, finish_reason: 'stop' }], usage }));
    }
    console.log(`captured ${file} (${body.length} bytes)`);
  });
}).listen(port, '127.0.0.1', () => console.log(`capture server on http://127.0.0.1:${port}/v1 -> ${outDir}`));
