/**
 * execute-guard — stops Code Mode scripts from hanging the session (OpenCode 2).
 *
 * The `execute` tool has no overall timeout and its runtime has no timers, so
 * when the model wants to "wait a moment" it often writes
 *     await new Promise(() => {});
 * — a promise whose executor takes no `resolve`, so it can never settle. The
 * session then sits on that line until the user interrupts it (four times in
 * one real session, 265–849 s each). A rule in AGENTS.md did not stop it.
 *
 * Before each `execute`, every `new Promise(` whose executor takes no
 * parameters (and so can never resolve) is rewritten to `__ocSettle(`, which
 * runs the same executor and settles with its return value. Side effects in
 * the executor (for example a chrome-devtools wait_for) still happen; nothing
 * else in the script changes. A promise whose executor takes `resolve` is left
 * alone, because it can settle on its own.
 */
const NEVER_SETTLES = /new\s+Promise\s*\(\s*(?=(?:async\s*)?\(\s*\)\s*=>|(?:async\s+)?function\s*[\w$]*\s*\(\s*\))/g;

const HELPER =
  'const __ocSettle = (fn) => { let r; try { r = fn(() => {}, () => {}); } catch (e) { return Promise.resolve(); } ' +
  'return Promise.resolve(r).catch(() => {}); };\n' +
  'console.log("[execute-guard] a Promise that could never resolve was made to settle; ' +
  'Code Mode has no timers — to wait for a page use tools[\\"chrome-devtools\\"].wait_for, otherwise just continue");\n';

export function guardCode(code) {
  if (typeof code !== 'string') return { code, changed: 0 };
  let changed = 0;
  const out = code.replace(NEVER_SETTLES, () => {
    changed++;
    return '__ocSettle(';
  });
  return { code: changed ? HELPER + out : code, changed };
}

export default {
  id: 'execute-guard',
  async setup(ctx) {
    await ctx.tool.hook('execute.before', (event) => {
      if (event.tool !== 'execute' || !event.input) return;
      const { code, changed } = guardCode(event.input.code);
      if (changed) event.input.code = code;
    });
  },
};
