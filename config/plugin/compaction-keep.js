/**
 * compaction-keep — make OpenCode 2 compaction summaries keep the working state.
 *
 * In a real 4-hour session the agent compacted 7 times and re-read the same
 * files after each one (44% of all file reads were repeats), because the
 * default summary keeps the conversation's gist but not the facts the next
 * step needs. Claude Code carries its todo list and file context across a
 * compaction; this plugin asks for the equivalent in the summary text.
 *
 * Uses the `compaction` session hook, which runs only for checkpoint
 * summaries (OpenCode appends its own summary prompt after hooks run), so
 * normal agent turns are unaffected.
 */
const KEEP = `When you write this compaction summary, the agent must be able to continue without re-reading files or asking the user again. Keep, as compact lists:
1. The user's current request and every approval or decision they gave, quoted exactly.
2. The plan or checklist file path (if any) and the status of each item: done, in progress (with the exact next step), not started.
3. Every file created or edited, with one line on what changed.
4. For each file read and still relevant: its path and the specific facts needed later (function or component names, signatures, types, line ranges). Write the facts, not "was read".
5. Commands that check the work (tests, build, lint), plus dev servers, ports and background shells still running.
6. Open problems, failed attempts worth not repeating, and questions waiting for the user.
Drop greetings, tool chatter and anything already finished and irrelevant to the next step.`;

export default {
  id: 'compaction-keep',
  async setup(ctx) {
    await ctx.session.hook('compaction', (event) => {
      event.system.push({ type: 'text', text: KEEP });
    });
  },
};
