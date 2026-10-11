## Approval before building — every new feature or behavior change

`brainstorming` lets a "quick, clear task" go straight to code. In this
setup that shortcut covers only questions, explanations, and fixes of an
obvious mistake (a typo, a wrong value, a crash whose cause is already
known). Anything that adds or changes behavior — even when the request
names every detail — gets a short design first: what changes and where
(files), how it behaves, and what you will deliberately leave out. Then
stop and wait for approval before editing any file. If the user says to
skip the questions or to just do it, skip this.

The design is a few lines, not research. Base it on the project's own
code — graft and the files you would change. Do not read library
sources, minified bundles, or the web to write it; if a library's
behavior matters, name it as an open question in the design and check it
while implementing, after approval.

## Grill me — complements superpowers brainstorming, doesn't duplicate it

This setup also runs the `superpowers` plugin. Its `brainstorming` skill is
the primary gate before creative work (new features, new subsystems,
behavior changes) — it already classifies scope, asks clarifying
questions, proposes approaches, and for bounded/architectural work writes
a spec under `docs/superpowers/specs/` before any implementation plan.
Do not add a second gate on top of it: if brainstorming has already run
(or is running) for a piece of work, do not also invoke `grilling` as a
separate pre-check for that same work.

Use `grilling` in exactly two situations instead:

1. **Inside** brainstorming's "ask clarifying questions" step: instead of
   asking one question at a time, batch the current frontier into
   `grilling`'s round format — numbered questions with a recommended
   answer each, resolved via the design-tree/frontier method — then fold
   the answers back into the brainstorming flow. This is a formatting
   upgrade to that one step, not a separate skill invocation cycle.
2. **Standalone**, outside any SDD/brainstorming flow: when the user
   explicitly wants to stress-test an idea or decision quickly (e.g. says
   "grill me about X"), with no spec file produced — this is a
   spike-level conversation, not project planning.

When a `grilling` round needs a fact from the codebase rather than a
user decision, look it up yourself inline before asking: if the project
has a `graft/` index, run `graft ask "<question>"` first; otherwise fall
back to grep or reading files directly. Only dispatch a sub-agent for it
if one is available and the lookup is heavy enough to warrant it.

## Exploring a codebase — graft first, even inside a skill

Skills such as `brainstorming` ("Explore project context — check files,
docs, recent commits") tell you to look around the project. When the
project has a `graft/` index, do that step through graft instead of
listing directories and reading files one by one. MCP tools are called
inside the `execute` tool (Code Mode), and the catalog shows only some of
graft's tools, so use these exact paths rather than guessing:
`tools.graft.graft_repo_map` for orientation, `tools.graft.graft_find_code`
for "where is X / how does Y work", `tools.graft.graft_file_api` to skim a
file, and `tools.graft.graft_trace_calls` for callers (check a signature
with `search({ namespace: "graft" })` if a call is rejected). There is no
`graft_ask` tool: `graft ask "<question>" --source` is the CLI, run
through `shell`. Inside `execute`, `await` each tool call directly; a
`new Promise(...)` that never calls `resolve` hangs the session, because
`execute` has no overall timeout. Then
`read` only the files you are about to edit. Directory listings and
whole-file reads are the fallback when there is no `graft/` index.

## Verifying UI changes — once, in a real browser

Passing tests is not enough for a change someone will see in a browser (a
web page, a game). Before reporting done, verify it once with
chrome-devtools: load the page, do the one interaction the task is about,
and check the console for errors. Keep it to a handful of calls — a single
short wait for the page to settle, no polling loops. For a static site, serve
it with `npx -y http-server -p 8765 -c-1` as a background shell job (pick
another port if that one is taken) instead of writing a server; a 404 for
`/favicon.ico` is harmless. If the page cannot
load or throws, that is a failure to report or fix, not "done".

The browser outlives your session: pages from earlier sessions may still
be open. Open your own page with `new_page` (not in the background) and
work only on that page id; close it when you are done. A background tab
does not run animation frames, so a game or animation in one looks
frozen — bring your page to the front before judging it. If the page
still does not behave after two or three checks, take one screenshot,
report what you saw, and stop; do not debug the framework from the
browser console.

## Re-reading files after compaction or pruning

When you need a file you already read earlier in this session (its content
was compacted or pruned away), do not re-read the whole file. If the
project has a `graft/` index, run `graft skeleton <file>` or `graft ask
"<symbol>" --source` first; then `read` only the lines you need with
`offset`/`limit`. A full read is fine right before editing a file you
have not read since the last compaction.

## Memory — facts that must outlive this session (memory MCP)

Call these inside the `execute` tool (Code Mode), like other MCP tools.

- Before asking the user about a preference or a past decision, call
  `tools.memory.search_nodes` with the project's folder name (and "user")
  — the answer may already be stored.
- When the user states a durable preference, or brainstorming/grilling
  settles a decision that later sessions will need, save it:
  `tools.memory.create_entities` for a new project/user entity, otherwise
  `tools.memory.add_observations` — one short sentence per fact, prefixed
  with today's date (YYYY-MM-DD).
- Never store secrets, code, or anything the repo already records
  (graft, git history, specs under `docs/`).
