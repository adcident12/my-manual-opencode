# Local change to `grilling/SKILL.md`

`grilling` comes from [mattpocock/skills](https://github.com/mattpocock/skills) and is fetched from upstream, not copied into this repository. After downloading `skills/productivity/grilling/SKILL.md`, replace **one paragraph** — the one that starts with `Finding _facts_ is your job`.

Why: the original tells the agent to dispatch a sub-agent to find facts. This setup runs inline with a local model and has a graft index, so facts are looked up directly (see `plugins.md`, grill-me / grilling). Re-apply this change every time you update the skill from upstream.

## Replace the paragraph that starts with

```text
Finding _facts_ is your job, never the user's. When a frontier question needs a fact from the environment (filesystem, tools, etc.), dispatch a sub-agent to find it;
```

## With this paragraph

```text
Finding _facts_ is your job, never the user's. When a frontier question needs a fact from the environment (filesystem, tools, etc.), look it up yourself inline before asking the user anything you could find out yourself: if the project has a `graft/` index, run `graft ask "<question>"` first; otherwise fall back to grep or reading files directly. Do this synchronously while preparing each round — only dispatch a sub-agent for it if one is available and the lookup is heavy enough to warrant it. The _decisions_ are the user's: put each to them and wait.
```

`grill-me/SKILL.md` is used unmodified.
