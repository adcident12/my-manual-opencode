# OpenCode Setup Manual (ພາສາລາວ)

ຄູ່ມືການຕິດຕັ້ງແລະນຳໃຊ້ [OpenCode](https://opencode.ai/) CLI ແບບລະອຽດ — ຕັ້ງແຕ່ເຄື່ອງເປົ່າທີ່ຍັງບໍ່ມີຫຍັງເລີຍ ຈົນເຖິງ MCP servers, Plugins ແລະວິທີນຳໃຊ້ຈິງສຳລັບ vibe coding

> [🇹🇭 อ่านภาษาไทย](../th/README.md) · [🇬🇧 Read in English](../en/README.md) · [🇵🇭 Basahin sa Filipino](../fil/README.md)

> ຫນ້ານີ້ເປັນສ່ວນຫນຶ່ງຂອງ [Obsidian](https://obsidian.md/) vault ດຽວກັນກັບ `th/`, `en/`, ແລະ `fil/` — ຫນ້າເນື້ອຫາລຸ່ມນີ້ເຊື່ອມຕໍ່ກັນດ້ວຍ `[[wikilink]]`, ດັ່ງນັ້ນເປີດໂຟນເດີນີ້ໃນ Obsidian ເພື່ອປະສົບການອ່ານທີ່ດີທີ່ສຸດ (ລິ້ງຄ໌ຄລິກໄດ້, graph view). ຫນ້ານີ້ (`README.md`) ໃຊ້ plain markdown link ແທນ ເພາະເປັນຫນ້າ landing ສຳລັບ GitHub

## ເລີ່ມອ່ານຈາກນີ້

| ໄຟລ໌ | ເນື້ອຫາ |
| --- | --- |
| [index.md](index.md) | ພາບລວມ stack ທັງຫມົດທີ່ໃຊ້ຈິງ |
| [sdlc.md](sdlc.md) | ພາບລວມ Software Development Life Cycle ທັງ 7 ຂະບວນການ ພ້ອມຊີ້ບອກວ່າຄູ່ມືນີ້ຄອບຄຸມ phase ໃດແດ່ |
| [architecture.md](architecture.md) | ເບິ່ງ stack ທັງໝົດຜ່ານ 4 layer ຕາມໜ້າທີ່ (Knowledge/Reasoning/Execution/Governance) ແທນທີ່ຈະຕາມກົນໄກທາງເທັກນິກ |
| [setup.md](setup.md) | **ເລີ່ມທີ່ນີ້ຖ້າຍັງບໍ່ໄດ້ຕິດຕັ້ງຫຍັງເລີຍ** — Node.js, Git, OpenCode CLI, provider, MCP, plugin ຄົບທຸກຂັ້ນຕອນ |
| [mcp-servers.md](mcp-servers.md) | ລາຍລະອຽດ MCP server ແຕ່ລະໂຕ (context7, playwright, chrome-devtools, graft, open-design, memory, sonarqube, trivy, github, postgres/mysql) ພ້ອມຂັ້ນຕອນຕິດຕັ້ງສະເພາະໂຕ |
| [plugins.md](plugins.md) | superpowers, `grill-me`/`grilling` (batch-interview skill ເສີມ superpowers), custom plugin `graft-deep`, `ponytail` (ໂຄ້ດເຕັມ + OpenCode Plugin Hook API) ແລະ `caveman` (ຕອບສັ້ນ ກົງປະເດັນ — ໃຊ້ແທນ `i-have-adhd`) |
| [USER-MANUAL.md](USER-MANUAL.md) | **ເລີ່ມໃຊ້ງານຕັ້ງແຕ່ຕົ້ນຈົນຈົບ** (ເປີດ session → ສັ່ງ → ອະນຸມັດ → ກວດ → commit) ແລະວິທີໃຊ້ງານຈິງປະຈຳວັນ — vibe coding, graft workflow, OpenDesign → OpenCode workflow |
| [gotchas.md](gotchas.md) | ບັນຫາທີ່ພົບຈິງ 19 ເລື່ອງພ້ອມວິທີແກ້ (Windows PATH/env snapshotting, native module ABI mismatch, reasoning-model output cap, prompt ພອງຈາກ MCP, skill ຂັດກັບ AGENTS.md, ຯລຯ) |
| [updating.md](updating.md) | ວິທີອັບເດດ/ອັບເກຣດ OpenCode CLI, MCP servers, plugins ແລະ OpenDesign ເທື່ອລະໂຕ |
| [tuning.md](tuning.md) | **ວັດຜົນແທ້ແລ້ວປັບຈູນ** — ຂະໜາດ prompt ຕໍ່ turn, tool ທີ່ agent ເອີ້ນແທ້, ທົດສອບ workflow ຄົບວົງຈອນ (ພ້ອມຮູບຜົນແລະ script ໃນ `scripts/`) |
| [../config/](../config/README.md) | **ໄຟລ໌ພ້ອມ copy** — template `opencode.jsonc`, global `AGENTS.md`, plugin `graft-deep.js` ທີ່ setup ນີ້ໃຊ້ແທ້ |
| [../AGENT-SETUP.md](../AGENT-SETUP.md) | **ໃຫ້ AI agent ຕິດຕັ້ງໃຫ້** — ຂັ້ນຕອນດຽວກັບ setup.md ໃນຮູບແບບທີ່ agent ອ່ານແລ້ວເຮັດຕາມໄດ້ ມີຈຸດກວດທຸກຂັ້ນ |

## Stack ທີ່ຄອບຄຸມ

- **OpenCode CLI** + self-hosted/cloud model provider
- **MCP servers**: context7, playwright, chrome-devtools, [graft](https://github.com/trailhq/Graft) (code-graph), [OpenDesign](https://github.com/nexu-io/open-design), memory (persistent context), [SonarQube](https://github.com/SonarSource/sonarqube-mcp-server) (code quality/security, self-hosted), [Trivy](https://github.com/aquasecurity/trivy-mcp) (vulnerability/secret/misconfig scan, standalone CLI), [GitHub](https://github.com/github/github-mcp-server) (issues/PR), postgres/mysql
- **Plugins**: [superpowers](https://github.com/obra/superpowers) (skill library) + custom `graft-deep` plugin + [ponytail](https://github.com/dietrichgebert/ponytail) (code-minimization ruleset) + [caveman](https://github.com/JuliusBrussee/caveman) (ຕອບສັ້ນ — ສະເພາະ skill; ໃຊ້ແທນ i-have-adhd)
- **Skills (Agent Skills open standard, ບໍ່ແມ່ນ plugin)**: [grill-me / grilling](https://github.com/mattpocock/skills) — batch interview ເສີມ `brainstorming` ຂອງ superpowers

---

*Repo ນີ້ເປັນ personal reference — ເນື້ອຫາເປັນແບບທົ່ວໄປ ບໍ່ມີຂໍ້ມູນລະບຸຕົວຕົນ (path/URL/credential ສະເພາະເຄື່ອງ ຖືກແທນທີ່ດ້ວຍ placeholder ແລ້ວ)*
