---
tags: [project-doc, sdlc, opencode, reference, overview]
updated: 2026-09-13
summary: An overview of all 7 Software Development Life Cycle phases for a general reader, with links to the parts of this OpenCode manual that actually implement each phase, honest notes on what's still not covered, and suggested tools/MCPs to close each gap (not installed yet)
---

# Software Development Life Cycle (SDLC)

Full manual overview at [index.md](index.md)

**SDLC** is the standard cycle describing what a piece of software goes through on its way from "idea" to "live and maintained." This page first explains each phase in general terms for any reader, then points out which phases this OpenCode manual (the rest of this repo) actually covers, with which tools/plugins — and states plainly, without glossing over it, which phases have no real implementation yet.

> [!info] Security and Documentation aren't standalone phases
> Both should happen **in parallel with every phase** (the "shift-left"/DevSecOps idea), not as a final step before delivery — so this page folds security into whichever phase it's relevant to, rather than giving it its own separate heading.

---

## 1. Planning

Defining scope, goals, resources (people/time/budget), and early risks before writing a single line of code — typical output is a project charter, timeline, and risk register.

> [!warning] Not covered by this manual
> No tool/plugin in this stack helps with project planning at this level directly — this phase happens outside OpenCode entirely (a spreadsheet, Notion, or a separate project-management tool).

---

## 2. Requirements Analysis

Gathering and crystallizing "what the system needs to do" from stakeholders — split into functional requirements (features) and non-functional ones (performance, security, scalability), usually kept as user stories/tickets in a backlog tool so each piece of code can be traced back to the requirement it satisfies.

> [!tip] Partially covered, but currently disabled
> The [github MCP](mcp-servers.md) (see the "github" section) supports issues/PRs, but it's set to `enabled: false` until a Personal Access Token exists — not active yet, so this only counts as partial coverage.
>
> For gathering requirements through conversation (not a backlog tool), [grill-me / grilling](plugins.md) (see the "grill-me / grilling" section) helps — it interviews in batched rounds until a feature's requirements crystallize, but it stops at the conversation: there's no ticket/trace back to a requirement the way a real backlog tool gives you.

---

## 3. Design

Turning requirements into a technical blueprint, at two levels: **system/architecture design** (choosing a stack, designing a database schema, an API contract) and **UI/UX design** (mockups, prototypes, a design system).

> [!tip] Only the UI/UX side is covered
> The [open-design MCP](mcp-servers.md) (see the "open-design" section) plus the full workflow in [USER-MANUAL.md](USER-MANUAL.md) (section 5, "Build a website with OpenDesign") cover designing/prototyping web pages well — but system/architecture design (schema, API contract) has no dedicated tool; the `writing-plans` skill from [superpowers](plugins.md) helps partially, only at the implementation-plan level, not as a full design doc. The step before that — crystallizing requirements/decisions before writing a plan — goes faster with [grill-me / grilling](plugins.md), which is wired into the same `writing-plans`/`brainstorming` flow.

---

## 4. Development / Implementation

Writing the actual code to the design — including code review and coding standards along the way to control quality as you go, not just checking afterward.

> [!tip] This manual's strongest phase by far
> - [superpowers](plugins.md) — enforces good workflow (brainstorming, systematic-debugging, executing-plans, subagent-driven-development, etc.)
> - [grill-me / grilling](plugins.md) — complements `brainstorming` by asking clarifying questions in a batch (faster than one at a time, which matters a lot with a local model where every turn is slow), or used standalone to interview an idea without implementing it
> - [graft-deep](plugins.md) + [graft MCP](mcp-servers.md) — automatically injects relevant context (auto-rebuilding the code graph is graft CLI's own job now, no longer needs this plugin)
> - [ponytail](plugins.md) — keeps the agent from writing more code than necessary
> - [i-have-adhd](plugins.md) — controls reply style to stay to-the-point (opt-in)
>
> **Code review** also lives in this phase: superpowers ships `receiving-code-review`/`requesting-code-review` skills out of the box.

---

## 5. Testing

Confirming the code is correct and hasn't regressed — layered as a test pyramid: **unit tests** (fast, high coverage) → **integration tests** (checking components/services talk to each other correctly) → **E2E/UI tests** (simulating a real user) → **security testing** (SAST/dependency/secret scans).

> [!tip] Some layers are covered
> - E2E/UI: [playwright](mcp-servers.md) + [chrome-devtools](mcp-servers.md) (mostly for debugging — console logs, network, performance traces)
> - Workflow guidance: the `test-driven-development` skill in [superpowers](plugins.md)
> - Security testing: [sonarqube](mcp-servers.md) (code quality/SAST) + [trivy](mcp-servers.md) (vulnerability/secret/misconfig scanning)
>
> Still missing: a real **unit/integration test runner** (e.g. pytest, vitest) — this manual has no dedicated MCP/plugin for this layer; it relies on the agent writing test files directly, following each project's own conventions.

---

## 6. Deployment

Taking code that's passed testing and running it in production — typically through an automated **CI/CD pipeline** (build → test → deploy) instead of deploying by hand, to reduce mistakes and make it repeatable.

> [!warning] Not covered by this manual
> The macro workflow diagram in [USER-MANUAL.md](USER-MANUAL.md) (section 1, "Overview") has a "Deploy" node after the quality gate, but it's just a label — no CI/CD pipeline, build automation, or hosting/infra of any kind is documented in this manual at all. This is the single biggest gap in the whole SDLC right now.

---

## 7. Maintenance

Once a system is live, you need **monitoring/observability** (logs, metrics, alerts) watching whether it's still behaving normally, fixing bugs found afterward, and feeding that back into requirements for the next round (closing the loop back to phases 1–2).

> [!tip] Only covers maintaining the "dev tooling," not the app
> [updating.md](updating.md) covers updating the OpenCode CLI/MCP/plugins themselves in great detail — but that's maintaining **the tools used to build**, not monitoring/observability for **the app that's actually deployed** (production logs, metrics, alerts), which has nothing supporting it at all yet.

---

## Summary

| Phase | Status | Referenced in this manual |
| --- | --- | --- |
| 1. Planning | ❌ None | — |
| 2. Requirements Analysis | ⚠️ Partial (disabled) | [github MCP](mcp-servers.md) |
| 3. Design | ⚠️ UI/UX only | [open-design](mcp-servers.md), [USER-MANUAL.md](USER-MANUAL.md) §5 |
| 4. Development | ✅ Most complete | [plugins.md](plugins.md), [graft](mcp-servers.md) |
| — Code Review (within Dev) | ✅ Present | [superpowers](plugins.md) |
| 5. Testing | ⚠️ Some layers | [playwright](mcp-servers.md), [chrome-devtools](mcp-servers.md) |
| — Security testing (within Testing) | ✅ Present | [sonarqube](mcp-servers.md), [trivy](mcp-servers.md) |
| 6. Deployment (CI/CD) | ❌ None | — |
| 7. Maintenance (production) | ❌ None (tooling only) | [updating.md](updating.md) (tooling only) |

**Short version:** this manual covers the middle of the cycle (UI-side Design, Development, some Testing layers) very thoroughly, but both ends of the cycle (Planning, Requirements, CI/CD Deployment, Production Monitoring) remain gaps that depend entirely on tools/processes outside this manual.

---

## 🧰 Additional tools worth considering (not installed)

> [!warning] This section is a suggestion, not something already configured
> Every config/MCP in this section **has not actually been added to `opencode.jsonc`** — it's written up as an option to consider/copy when ready, unlike sections 1–7 above, which are things verified to actually work on this machine.

Criteria for picking a tool in this section: (1) **it has an MCP the agent can call directly** where possible, so the agent can help with that phase fully, not just a human using it manually; (2) it fits the pattern this manual already uses (self-hosted via Docker like sonarqube, remote/local MCP like the ones already present).

### Planning

No MCP is really needed here — this phase should stay mostly in human hands. **GitHub Projects** is recommended (free, ties into the repo you already have, no new service to add) as the first option before reaching for something heavier like Linear/Jira.

### Requirements Analysis

**Option 1 (recommended, ready to go):** turn on the `github` MCP already present in `opencode.jsonc` (currently `enabled: false`) — just create a PAT and flip the flag; details in [mcp-servers.md](mcp-servers.md).

**Option 2 (if you'd rather use Linear instead of GitHub Issues):** Linear has an official MCP server, a remote MCP just like context7 — add this to `opencode.jsonc`:

```jsonc
{
  "mcp": {
    "linear": { "type": "remote", "url": "https://mcp.linear.app/mcp" }
  }
}
```

Supports both read-only mode (`https://mcp.linear.app/mcp/readonly` — safer if you only want the agent to read) and OAuth/API key authentication.

### Design (System/Architecture)

No specific tool/MCP is needed — the lightest convention is an **ADR (Architecture Decision Record)**: a plain markdown file at `docs/adr/NNNN-topic.md` per project. Every time a significant architecture decision gets made (choosing a database, changing a core pattern, etc.), have the agent write a summary there — next time, the agent can read what's already in `docs/adr/` before proposing something new on its own (similar to what [graft-deep](plugins.md) does for code, but at the decision level instead of the code level).

> [!tip] Diagrams can just use mermaid — no need for a new tool
> This manual already uses mermaid inline in markdown (see [USER-MANUAL.md](USER-MANUAL.md)) — write architecture diagrams the same way without relying on a separate diagramming website.

For API contracts, keep an `openapi.yaml` in the repo for the agent to read/edit directly like any other code file — no special tool needed.

### Testing

Filling the missing unit/integration test layer — **no extra MCP needed**, since opencode can already call a test runner through its Bash tool. What's needed is just a test framework in the project itself (e.g. `pytest`/`pytest-cov` for Python, `vitest`/`jest` for JS/TS), then let the `test-driven-development` skill already in [superpowers](plugins.md) guide the workflow.

> [!warning] The agent running unit tests itself isn't enough — it also needs to be wired into CI
> If the agent only runs tests to check its own work during development, but nothing re-runs them at merge time, a regression the agent missed can slip into `main`. See the CI/CD section next.

### CI/CD & Deployment

**CI (GitHub Actions recommended)** since the repo already lives on GitHub — no new service needed. A basic workflow to have:

```yaml
# .github/workflows/ci.yml
name: CI
on: [pull_request, push]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci   # or pip install -r requirements.txt depending on the stack
      - run: npm test  # unit/integration tests from the previous section
      - run: npx trivy fs .   # add a security scan to the pipeline (trivy CLI is already installed)
```

> [!tip] trivy is already on the machine, just not wired into CI yet
> [trivy](mcp-servers.md), already installed for the agent to call during dev — add the same step to GitHub Actions and get an automatic security gate on every PR with nothing new to install.

**Deployment target** — pick whichever style fits (this manual already leans self-hosted, given home-llamacpp/sonarqube):

| Option | Good for | Trade-off |
| --- | --- | --- |
| Self-host via Docker Compose + a reverse proxy (Caddy/nginx) | Extends the same self-hosting pattern already used for sonarqube/llama.cpp | You maintain the server yourself (patching, uptime) |
| Vercel / Netlify / Cloudflare Pages | Pure frontend web apps, fastest to deploy | Locked into the platform, cost rises with traffic |
| Railway / Render / Fly.io | Full-stack container apps, don't want to manage infra | Still a monthly cost, but no server upkeep |

### Maintenance (Production Monitoring)

**Error tracking:** [Sentry](https://github.com/getsentry/sentry-mcp) has an official MCP server (`@sentry/mcp-server`) — the agent can query production errors/stack traces directly, genuinely closing the loop back to a requirement/bug fix. Both remote-hosted and local are supported:

```jsonc
{
  "mcp": {
    "sentry": {
      "type": "remote",
      "url": "https://mcp.sentry.dev/mcp",
      "headers": { "Authorization": "Sentry-Bearer {env:SENTRY_ACCESS_TOKEN}" }
    }
  }
}
```

Self-hosted Sentry is supported too (set `SENTRY_HOST` instead if not using Sentry cloud) — fits this manual's self-hosting pattern.

**Metrics/dashboard:** [Grafana](https://github.com/grafana/mcp-grafana) also has an MCP server (`mcp-grafana`) letting the agent query dashboards/datasources/alerts — runs as a Docker container just like sonarqube:

```jsonc
{
  "mcp": {
    "grafana": {
      "type": "local",
      "command": ["docker", "run", "--rm", "-i", "-e", "GRAFANA_URL", "-e", "GRAFANA_SERVICE_ACCOUNT_TOKEN", "grafana/mcp-grafana", "-t", "stdio"],
      "environment": {
        "GRAFANA_URL": "http://host.docker.internal:3000",
        "GRAFANA_SERVICE_ACCOUNT_TOKEN": "{env:GRAFANA_SERVICE_ACCOUNT_TOKEN}"
      },
      "timeout": 30000,
      "enabled": false
    }
  }
}
```

**Dependency updates:** turn on GitHub Dependabot (native, nothing to install — just add a `.github/dependabot.yml` file) — works alongside trivy already in place (trivy scans for vulnerabilities that exist right now; Dependabot warns ahead of time when a new patch is released).

> [!info] Why Uptime Kuma isn't recommended here
> Considered it, but left it out because it has no MCP for the agent to call — it's just a dashboard for a human to look at. If you want simple uptime monitoring it's still easy to install (self-hosted via Docker too), but you won't get the agent-collaboration benefit that everything else in this section has.
