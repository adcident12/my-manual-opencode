---
tags: [project-doc, sdlc, opencode, reference, overview]
updated: 2026-09-13
summary: Buod ng lahat ng 7 phase ng Software Development Life Cycle para sa pangkalahatang mambabasa, may link sa mga bahagi ng OpenCode manual na ito na aktwal na nag-iimplementa ng bawat phase, tapat na paliwanag kung ano ang wala pa, at mungkahing tools/MCPs para tapunan ang bawat gap (hindi pa naka-install)
---

# Software Development Life Cycle (SDLC)

Buong buod ng manual sa [[index]]

Ang **SDLC** ay ang standard na cycle na naglalarawan kung ano ang dinadaanan ng isang software mula sa "ideya" hanggang sa "live at maayos na pinapanatili." Ang pahinang ito ay unang nagpapaliwanag ng bawat phase sa pangkalahatang paraan para sa kahit sinong mambabasa, pagkatapos ay itinuturo kung aling mga phase ang aktwal na saklaw ng OpenCode manual na ito (ang natitirang bahagi ng repo na ito), gamit anong mga tool/plugin — at hayagang sinasabi, nang hindi pinaglilihiman, kung aling mga phase ang wala pang tunay na implementation.

> [!info] Hindi standalone phase ang Security at Documentation
> Dapat mangyari ang dalawang ito **sabay sa bawat phase** (ang ideya ng "shift-left"/DevSecOps), hindi bilang huling hakbang bago i-deliver — kaya ang pahinang ito ay ikinakabit ang security sa kung saang phase ito relevant, sa halip na bigyan ito ng sariling hiwalay na heading.

---

## 1. Planning

Pagdedesisyon ng scope, layunin, resources (tao/oras/badyet), at maagang mga risk bago pa man magsulat ng kahit isang linya ng code — karaniwang output ay isang project charter, timeline, at risk register.

> [!warning] Hindi saklaw ng manual na ito
> Walang tool/plugin sa stack na ito na tumutulong sa project planning sa ganitong level nang direkta — ang phase na ito ay ginagawa sa labas ng OpenCode (spreadsheet, Notion, o hiwalay na project-management tool).

---

## 2. Requirements Analysis

Pangongolekta at pagtatakda kung "ano ang kailangang gawin ng sistema" mula sa mga stakeholder — hinahati sa functional requirements (features) at non-functional (performance, security, scalability), karaniwang itinatago bilang user stories/tickets sa isang backlog tool para ma-trace pabalik kung anong requirement ang tinutugunan ng bawat bahagi ng code.

> [!tip] May bahagi na sa manual na ito, pero naka-disable
> Ang [github MCP](mcp-servers.md) — tignan sa [[mcp-servers]] ang seksyong "github" — ay suportado ang issues/PRs, pero naka-set sa `enabled: false` hanggang may Personal Access Token — hindi pa aktibo, kaya bahagyang saklaw lang ito.
>
> Para sa pagkolekta ng requirement sa pamamagitan ng usapan (hindi backlog tool), may tulong ang [[plugins]] — tignan ang seksyong "grill-me / grilling" — sinasagot nito sa mga batch round hanggang matukoy kung ano ang kailangan ng feature, pero hanggang usapan lang ito — walang ticket/trace pabalik sa requirement gaya ng tunay na backlog tool.

---

## 3. Design

Pagsasalin ng requirements sa technical blueprint, sa dalawang level: **system/architecture design** (pagpili ng stack, pagdisenyo ng database schema, API contract) at **UI/UX design** (mockups, prototypes, design system).

> [!tip] UI/UX na bahagi lang ang saklaw
> Ang [[mcp-servers]] (seksyong "open-design") kasama ang buong workflow sa [[USER-MANUAL]] (seksyon 5, "Paggawa ng website gamit ang OpenDesign") ay maayos na sumasaklaw sa pagdisenyo/pag-prototype ng web pages — pero ang system/architecture design (schema, API contract) ay walang dedikadong tool; ang `writing-plans` skill mula sa [[plugins]] (seksyong superpowers) ay bahagyang tumutulong, sa level lang ng implementation plan, hindi buong design doc. Ang hakbang bago iyon — pagtatakda ng requirements/desisyon bago sumulat ng plano — ay mas mabilis gamit ang [[plugins]] (seksyong grill-me / grilling), na naka-wire sa parehong `writing-plans`/`brainstorming` flow.

---

## 4. Development / Implementation

Pagsulat ng aktwal na code batay sa design — kasama ang code review at coding standards habang ginagawa para makontrol ang kalidad sa daan, hindi lang pagsusuri pagkatapos.

> [!tip] Pinakamalakas na phase ng manual na ito
> - [[plugins]] (superpowers) — pinipilit ang magandang workflow (brainstorming, systematic-debugging, executing-plans, subagent-driven-development, atbp.)
> - [[plugins]] (grill-me / grilling) — dagdag sa `brainstorming` sa pamamagitan ng pagtatanong ng clarifying questions bilang batch (mas mabilis kaysa isa-isa, mahalaga ito sa local model kung saan mabagal ang bawat turn), o standalone para mag-interview ng ideya nang hindi agad ini-implement
> - [[plugins]] (graft-deep) + [[mcp-servers]] (graft) — awtomatikong nag-i-inject ng relevant na context (ang auto-rebuild ng code graph ay trabaho na ng graft CLI mismo)
> - [[plugins]] (ponytail) — pinipigilan ang agent na magsulat ng mas maraming code kaysa kinakailangan
> - [[plugins]] (i-have-adhd) — kinokontrol ang istilo ng sagot para manatiling diretso-sa-punto (opt-in)
>
> Ang **code review** ay nasa phase na ito rin: may built-in na `receiving-code-review`/`requesting-code-review` skills ang superpowers.

---

## 5. Testing

Pagkumpirma na tama ang code at walang regression — nakaayos bilang test pyramid: **unit tests** (mabilis, malawak na coverage) → **integration tests** (sinusuri kung tama ang pag-uusap ng mga component/service) → **E2E/UI tests** (ginagaya ang tunay na user) → **security testing** (SAST/dependency/secret scan).

> [!tip] May ilang layer na saklaw
> - E2E/UI: [[mcp-servers]] (playwright) + [[mcp-servers]] (chrome-devtools) (mas para sa pag-debug — console logs, network, performance traces)
> - Workflow guidance: ang `test-driven-development` skill sa [[plugins]] (superpowers)
> - Security testing: [[mcp-servers]] (sonarqube) (code quality/SAST) + [[mcp-servers]] (trivy) (vulnerability/secret/misconfig scanning)
>
> Kulang pa: isang tunay na **unit/integration test runner** (hal. pytest, vitest) — walang dedikadong MCP/plugin ang manual na ito para sa layer na ito; umaasa sa agent na direktang sumulat ng test files, sinusunod ang convention ng bawat project.

---

## 6. Deployment

Pagkuha ng code na pumasa sa testing at pagpapatakbo nito sa production — karaniwang sa pamamagitan ng awtomatikong **CI/CD pipeline** (build → test → deploy) sa halip na manu-manong deploy, para bawasan ang pagkakamali at maulit-ulit.

> [!warning] Hindi saklaw ng manual na ito
> Ang macro workflow diagram sa [[USER-MANUAL]] (seksyon 1, "Pangkalahatang-ideya") ay may node na "Deploy" pagkatapos ng quality gate, pero label lang ito — walang CI/CD pipeline, build automation, o hosting/infra na anumang uri ang naitala sa manual na ito. Ito ang pinakamalaking gap sa buong SDLC sa ngayon.

---

## 7. Maintenance

Kapag live na ang sistema, kailangan ng **monitoring/observability** (logs, metrics, alerts) na nagbabantay kung normal pa rin ang gawi nito, pag-aayos ng mga bug na natuklasan pagkatapos, at pagbabalik ng feedback bilang bagong requirements (isinasara ang loop pabalik sa phase 1–2).

> [!tip] Saklaw lang ang maintenance ng "dev tooling," hindi ng app
> Sinasaklaw ng [[updating]] ang pag-update ng OpenCode CLI/MCP/plugins mismo nang detalyado — pero pagpapanatili iyon ng **mga tool na ginagamit sa paggawa**, hindi monitoring/observability ng **aktwal na na-deploy na app** (production logs, metrics, alerts), na wala pang sumusuporta dito.

---

## Buod

| Phase | Status | Reference sa manual na ito |
| --- | --- | --- |
| 1. Planning | ❌ Wala | — |
| 2. Requirements Analysis | ⚠️ Bahagi (naka-disable) | [[mcp-servers]] (github MCP) |
| 3. Design | ⚠️ UI/UX lang | [[mcp-servers]] (open-design), [[USER-MANUAL]] §5 |
| 4. Development | ✅ Pinaka-kumpleto | [[plugins]], [[mcp-servers]] (graft) |
| — Code Review (sa loob ng Dev) | ✅ Meron | [[plugins]] (superpowers) |
| 5. Testing | ⚠️ Ilang layer | [[mcp-servers]] (playwright), [[mcp-servers]] (chrome-devtools) |
| — Security testing (sa loob ng Testing) | ✅ Meron | [[mcp-servers]] (sonarqube), [[mcp-servers]] (trivy) |
| 6. Deployment (CI/CD) | ❌ Wala | — |
| 7. Maintenance (production) | ❌ Wala (tooling lang) | [[updating]] (tooling lang) |

**Maikling buod:** Ang manual na ito ay lubos na saklaw ang gitna ng cycle (Design sa panig ng UI, Development, ilang layer ng Testing) — pero ang dalawang dulo ng cycle (Planning, Requirements, CI/CD Deployment, Production Monitoring) ay mananatiling gap na umaasa sa mga tool/proseso sa labas ng manual na ito.

---

## 🧰 Karagdagang mga tool na dapat isaalang-alang (hindi pa naka-install)

> [!warning] Mungkahi lang ang seksyong ito, hindi pa naka-configure
> Bawat config/MCP sa seksyong ito **ay hindi pa aktwal na idinagdag sa `opencode.jsonc`** — nakasulat bilang opsyong pagbubulay-bulayan/kopyahin kapag handa na, iba ito sa nilalaman ng seksyon 1–7 sa itaas na na-verify nang aktwal na gumagana sa makinang ito.

Batayan sa pagpili ng tool sa seksyong ito: (1) **may direktang matatawag na MCP ang agent** kung meron, para makatulong ang agent sa phase na iyon nang buo, hindi lang tao ang gumagamit; (2) tumutugma sa pattern na ginagamit na ng manual na ito (self-hosted via Docker gaya ng sonarqube, remote/local MCP gaya ng mga meron na).

### Planning

Walang talagang kinakailangang MCP dito — ito ang phase na dapat nasa kamay ng tao pa rin. Ang **GitHub Projects** ang inirerekumenda (libre, konektado na sa repo na meron ka na, walang idadagdag na bagong service) bilang unang opsyon bago pumunta sa mas mabigat gaya ng Linear/Jira.

### Requirements Analysis

**Opsyon 1 (inirerekumenda, gawin na agad):** i-on ang `github` MCP na nasa `opencode.jsonc` na (kasalukuyang `enabled: false`) — gumawa lang ng PAT at i-flip ang flag; detalye sa [[mcp-servers]].

**Opsyon 2 (kung gusto mong gamitin ang Linear sa halip ng GitHub Issues):** May opisyal na MCP server ang Linear, remote MCP gaya ng context7 — idagdag ito sa `opencode.jsonc`:

```jsonc
{
  "mcp": {
    "linear": { "type": "remote", "url": "https://mcp.linear.app/mcp" }
  }
}
```

Suportado ang read-only mode (`https://mcp.linear.app/mcp/readonly` — mas ligtas kung gusto mo lang na makabasa ang agent) at OAuth/API key authentication.

### Design (System/Architecture)

Walang tiyak na tool/MCP na kailangan — ang pinakasimpleng convention ay isang **ADR (Architecture Decision Record)**: plain markdown file sa `docs/adr/NNNN-topic.md` bawat project. Sa tuwing may malaking desisyon sa architecture (pagpili ng database, pagbabago ng pangunahing pattern, atbp.), pasulatin ang agent ng buod doon — sa susunod, mababasa ng agent ang laman ng `docs/adr/` bago mag-mungkahi ng bago nang mag-isa (kahalintulad ng ginagawa ng [[plugins]] (graft-deep) sa code, pero sa level ng desisyon sa halip na code).

> [!tip] Gumamit lang ng mermaid para sa diagrams — walang bagong tool na kailangan
> Gumagamit na ang manual na ito ng mermaid nang inline sa markdown (tignan [[USER-MANUAL]]) — sumulat ng architecture diagram sa parehong paraan nang hindi umaasa sa hiwalay na diagramming website.

Para sa API contracts, panatilihin ang isang `openapi.yaml` sa repo para direktang mabasa/ma-edit ng agent gaya ng ibang code file — walang special tool na kailangan.

### Testing

Pagtapon ng kulang na unit/integration test layer — **walang kailangang dagdag na MCP**, dahil kaya na ng opencode tawagin ang isang test runner sa pamamagitan ng Bash tool nito. Ang kailangan lang idagdag ay ang test framework sa project mismo (hal. `pytest`/`pytest-cov` para sa Python, `vitest`/`jest` para sa JS/TS), pagkatapos hayaan ang `test-driven-development` skill na nasa [[plugins]] (superpowers) na para gabayan ang workflow.

> [!warning] Hindi sapat ang pagpapatakbo ng unit test ng agent lang — kailangan din itong ma-wire sa CI
> Kung ang agent lang ang nagpapatakbo ng test habang nagde-develop, pero walang muling nagpapatakbo nito habang mag-merge — ang regression na nalampasan ng agent ay maaaring makapasok sa `main`. Tignan ang susunod na seksyon ng CI/CD.

### CI/CD & Deployment

**CI (inirerekumenda ang GitHub Actions)** dahil nasa GitHub na ang repo — walang bagong service na kailangan. Isang basic na workflow na dapat meron:

```yaml
# .github/workflows/ci.yml
name: CI
on: [pull_request, push]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci   # o pip install -r requirements.txt depende sa stack
      - run: npm test  # unit/integration tests mula sa nakaraang seksyon
      - run: npx trivy fs .   # magdagdag ng security scan sa pipeline (naka-install na ang trivy CLI)
```

> [!tip] Naka-install na ang trivy sa makina, hindi pa lang naka-wire sa CI
> Ang [[mcp-servers]] (trivy), naka-install na para tawagin ng agent habang nagde-develop — idagdag ang parehong step sa GitHub Actions at magkakaroon ng awtomatikong security gate sa bawat PR nang walang bagong ii-install.

**Deployment target** — piliin ang istilong bagay sa'yo (ang manual na ito ay nakasandal na sa self-hosted, batay sa home-llamacpp/sonarqube):

| Opsyon | Bagay para sa | Trade-off |
| --- | --- | --- |
| Self-host via Docker Compose + reverse proxy (Caddy/nginx) | Extension ng parehong pattern na ginagamit na para sa sonarqube/llama.cpp | Ikaw ang mag-aalaga ng server (patching, uptime) |
| Vercel / Netlify / Cloudflare Pages | Purong frontend web app, pinakamabilis i-deploy | Naka-lock sa platform, tumataas ang gastos kung tumaas ang traffic |
| Railway / Render / Fly.io | Full-stack container app, ayaw mag-manage ng infra | May buwanang gastos pa rin, pero walang aalagaang server |

### Maintenance (Production Monitoring)

**Error tracking:** May opisyal na MCP server ang [Sentry](https://github.com/getsentry/sentry-mcp) (`@sentry/mcp-server`) — direktang matatawag ng agent ang mga error/stack trace mula sa production, tunay na nagsasara ng loop pabalik sa requirement/bug fix. Suportado ang remote-hosted at local:

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

Suportado rin ang self-hosted Sentry (i-set ang `SENTRY_HOST` sa halip kung hindi gumagamit ng Sentry cloud) — tugma sa self-hosting pattern ng manual na ito.

**Metrics/dashboard:** May MCP server din ang [Grafana](https://github.com/grafana/mcp-grafana) (`mcp-grafana`) na nagbibigay-daan sa agent na mag-query ng dashboards/datasources/alerts — tumatakbo bilang Docker container gaya ng sonarqube:

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

**Dependency updates:** i-on ang GitHub Dependabot (native, walang ii-install — magdagdag lang ng `.github/dependabot.yml`) — gumagana kasabay ng trivy na meron na (trivy nag-i-scan ng vulnerability na meron sa ngayon; Dependabot nagbabala nang maaga kapag may bagong patch na lumabas).

> [!info] Bakit hindi inirerekumenda ang Uptime Kuma dito
> Pinag-isipan ito, pero hindi isinama dahil walang MCP na matatawag ng agent — dashboard lang ito para tignan ng tao. Kung gusto ng simpleng uptime monitoring, madali pa rin itong i-install (self-hosted din via Docker), pero hindi mo makukuha ang benepisyo ng pakikipagtulungan sa agent gaya ng ibang nasa seksyong ito.
