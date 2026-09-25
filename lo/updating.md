---
tags: [project-doc, maintenance, opencode, reference]
updated: 2026-09-25
summary: ວິທີອັບເດດ/ອັບເກຣດ OpenCode CLI, MCP servers, plugins, grill-me/grilling skill ແລະ OpenDesign ເທື່ອລະໂຕ
---

# Updating & Upgrading

ພາບລວມທີ [[index]] · ຕັ້ງຄ່າຄັ້ງທຳອິດທີ [[setup]]

ແຕ່ລະສ່ວນຂອງ stack ມີວິທີ "ອັບເດດ" ຕ່າງກັນ ບາງໂຕອັບເດດອັດຕະໂນມັດຢູ່ແລ້ວໂດຍບໍ່ຕ້ອງເຮັດຫຍັງ ບາງໂຕຕ້ອງສັ່ງເອງ ໜ້ານີ້ລວມໄວ້ທີລະໂຕ

---

## ສະຄຣິບອັບເດດອັດຕະໂນມັດ (ແນະນຳ — ແລ່ນຄັ້ງດຽວໄດ້ທຸກສ່ວນທີ່ຕ້ອງສັ່ງເອງ)

[`scripts/update-opencode.mjs`](../scripts/update-opencode.mjs) — ສະຄຣິບ Node.js ໄຟລ໌ດຽວ ແລ່ນໄດ້ຄືກັນເທິງ **Windows, macOS, Ubuntu** (ໃຊ້ພຽງ Node.js ທີ່ຕິດຕັ້ງໄວ້ແລ້ວຕາມ [[setup]] Part 0 ບໍ່ຕ້ອງຕິດຕັ້ງ dependency ເພີ່ມ) — automate ທຸກສ່ວນໃນໜ້ານີ້ທີ່ເຮັດເອງໄດ້ຢ່າງປອດໄພ:

```bash
node scripts/update-opencode.mjs             # ອັບເດດສ່ວນທີ່ປອດໄພທັງໝົດ
node scripts/update-opencode.mjs --dry-run   # ເບິ່ງວ່າຈະແລ່ນຄຳສັ່ງຫຍັງແດ່ ໂດຍບໍ່ແລ່ນຈິງ
node scripts/update-opencode.mjs --recreate-sonarqube   # ເພີ່ມການ recreate sonarqube server container ນຳ
```

ຄອບຄຸມ: OpenCode CLI, graft (ພ້ອມ fallback ອັດຕະໂນມັດຖ້າ `graft upgrade` ພັງຕາມ bug ທີ່ພົບໃນ [[gotchas]]), ລ້າງ cache ຂອງ superpowers/ponytail, `git pull` ຂອງ i-have-adhd, ທຽບ diff ຂອງ grill-me/grilling ກັບຕົ້ນສະບັບ (ບໍ່ overwrite ອັດຕະໂນມັດ), pull image ຂອງ sonarqube MCP wrapper, ອັບເດດ trivy CLI/plugin

> [!warning] ຂັ້ນຕອນທີ່ **ບໍ່** ເຮັດໃຫ້ອັດຕະໂນມັດ (ຕ້ອງສັ່ງ flag/ເຮັດເອງ)
> - **sonarqube Server container** — ຂ້າມເປັນ default ເພາະຕ້ອງ stop+rm+recreate container ທີ່ແລ່ນຢູ່ ຕ້ອງໃສ່ `--recreate-sonarqube` ຈຶ່ງຈະເຮັດ (ສະຄຣິບຈະ `docker inspect` container ເດີມກ່ອນເພື່ອໃຊ້ volume names ຈິງທີ່ມີຢູ່ ບໍ່ hardcode ທັບ)
> - **trivy ເທິງ Linux/Ubuntu** — ບໍ່ແລ່ນ `sudo` ໃຫ້ອັດຕະໂນມັດ (ຕ້ອງໃສ່ລະຫັດຜ່ານ) ພຽງ print ຄຳສັ່ງທີ່ຕ້ອງແລ່ນເອງ
> - **graft-deep.js** ແລະ **OpenDesign** — hand-written / GUI auto-updater ຕາມລຳດັບ ສະຄຣິບພຽງເຕືອນໄວ້ ບໍ່ມີຫຍັງໃຫ້ອັບເດດອັດຕະໂນມັດ

> [!info] ແກ້ 2026-09-25 — port ຂອງ SonarQube, ການ quote argument ແລະ index ຂອງ trivy
> - **`--recreate-sonarqube` ໃຊ້ host port ເດີມຂອງ container** (ແລະ named volume ເດີມ) ແທນທີ່ຈະໃຊ້ `9000` ສະເໝີ — ຖ້າຍັງບໍ່ມີ container ຈະໃຊ້ `9001` ເປັນ default ເພາະ `9000` ມັກມີ service ອື່ນໃຊ້ຢູ່ແລ້ວ (ເບິ່ງ [[mcp-servers]] ຫົວຂໍ້ sonarqube) ລອງແລ່ນ `--dry-run --recreate-sonarqube` ກ່ອນ: ຕອນນີ້ມັນພິມຄຳສັ່ງ `docker run -p <port>:9000 -v …` ພ້ອມຄ່າແທ້ອອກມາໃຫ້ເບິ່ງ
> - ເທິງ Windows ສະເພາະ npm shim (`opencode`, `graft`, `npm`) ທີ່ແລ່ນຜ່ານ shell — ເດີມທຸກຄຳສັ່ງຜ່ານ shell ເຮັດໃຫ້ `docker inspect --format '{{json .Mounts}}'` ຖືກຕັດຕົງຊ່ອງຫວ່າງ ການອ່ານ volume ຈຶ່ງຖອຍໄປໃຊ້ຄ່າ default ແບບງຽບໆ — ເບິ່ງ [[gotchas]] ຂໍ້ 10
> - `trivy plugin update` ທີ່ fail ເພາະ network (plugin index ຢູ່ເທິງ github.io ຊຶ່ງບາງ network ບລັອກ) ຕອນນີ້ເປັນ ⚠️ warning ຖ້າ `trivy plugin upgrade` ຍັງສຳເລັດ ບໍ່ແມ່ນ ❌ failure
>
> ຖ້າແລ່ນຈາກສຳເນົາໃນເຄື່ອງ (ເຊັ່ນ `~/.config/opencode/scripts/update-opencode.mjs`) ໃຫ້ແທນທີ່ດ້ວຍ [`scripts/update-opencode.mjs`](../scripts/update-opencode.mjs) ໂຕໃໝ່

---

## OpenCode CLI

```bash
opencode upgrade
```

ຫຼືລະບຸເວີຊັນທີ່ຕ້ອງການເຈາະຈົງ:

```bash
opencode upgrade 0.1.48
```

> [!tip] ເລືອກ installation method ໃຫ້ຕົງກັບຕອນຕິດຕັ້ງຄັ້ງທຳອິດ
> ຖ້າຕິດຕັ້ງຜ່ານ `npm install -g opencode-ai` (ຕາມທີ່ [[setup]] ແນະນຳ) ໃຊ້:
> ```bash
> opencode upgrade -m npm
> ```
> `-m`/`--method` ຮອງຮັບ `curl`, `npm`, `pnpm`, `bun`, `brew`, `choco`, `scoop` — ເລືອກໃຫ້ຕົງກັບຕອນຕິດຕັ້ງຈະໄດ້ບໍ່ມີສອງ installation ປົນກັນ

ກວດສອບເວີຊັນຫຼັງອັບເດດ:

```bash
opencode --version
```

---

## MCP servers ທີ່ແລ່ນຜ່ານ `npx`

**ອັບເດດອັດຕະໂນມັດຢູ່ແລ້ວ ບໍ່ຕ້ອງເຮັດຫຍັງ** — MCP ທີ່ຕັ້ງຄ່າໄວ້ທັງໝົດ (`playwright`, `chrome-devtools`, `postgres`, `mysql`, `memory`) ເອີ້ນຜ່ານ `npx -y <package>@latest` ຫຼືບໍ່ pin ເວີຊັນ — npx ຈະກວດ npm registry ຫາເວີຊັນຫຼ້າສຸດທຸກຄັ້ງທີ່ spawn

> [!note] context7 ບໍ່ຕ້ອງອັບເດດເລີຍ
> ເປັນ remote MCP (HTTP endpoint) — ຝັ່ງເຊີບເວີອັບເດດຂອງລາວເອງ ບໍ່ມີຫຍັງໃຫ້ເຮັດຝັ່ງເຮົາ

```bash
npx -y @playwright/mcp@latest --version
```

---

## graft (code-graph MCP + CLI)

```bash
graft version    # ເບິ່ງເວີຊັນທີ່ຕິດຕັ້ງຢູ່ ທຽບກັບເວີຊັນຫຼ້າສຸດເທິງ npm
graft upgrade    # ອັບເກຣດ global install ໃຫ້ເປັນເວີຊັນຫຼ້າສຸດ
```

> [!warning] ອັບເກຣດແລ້ວອາດຕ້ອງ build graph ໃໝ່
> ຖ້າເວີຊັນໃໝ່ປ່ຽນຮູບແບບ graph/wiring format ໃຫ້ແລ່ນ `graft build` ຊ້ຳໃນແຕ່ລະ project ທີ່ໃຊ້ງານຢູ່ (ເບິ່ງ [[mcp-servers]] ຫົວຂໍ້ graft) — ເຊັກ [CHANGELOG](https://github.com/trailhq/Graft/blob/main/CHANGELOG.md) ຂອງ graft ກ່ອນອັບເກຣດຖ້າກັງວົນເລື່ອງ breaking change (repo ຍ້າຍໄປທີ່ `trailhq/Graft` ແລ້ວ — ເບິ່ງ [[mcp-servers]])

> [!important] ອັບເກຣດ graft ທຸກຄັ້ງ ຕ້ອງກວດ graft-deep ນຳ
> graft-deep ລອກເກນການ inject ມາຈາກ hook ຂອງ Claude Code ໃນ graft ເອງ graft ອອກເວີຊັນໃໝ່ຈຶ່ງອາດປ່ຽນສິ່ງທີ່ plugin ຄວນເຮັດໄດ້ — 0.19.0 ກໍປ່ຽນແທ້ (ເບິ່ງ [[plugins]] ຫົວຂໍ້ graft-deep → "ເກນການ inject" ມີລາຍຊື່ໄຟລ໌ແລະຄຳສັ່ງ `grep` ທີ່ໃຊ້ທຽບ) ກວດໄວໆວ່າ graph ເດີມຍັງໂຫຼດໄດ້: ແລ່ນ `graft check . --json` ໃນ project ຄວນໄດ້ `"graph": { "ok": true }`

---

## superpowers plugin (ຕິດຕັ້ງຜ່ານ git)

**ວິທີບັງຄັບດຶງໃໝ່:**

```bash
rm -rf ~/.cache/opencode/packages/superpowers@git+https_
```

ແລ້ວຣີສະຕາດ OpenCode — ຄາວນີ້ຈະ clone ໃໝ່ທັງໝົດ

```bash
opencode debug skill
```

> [!tip] ຢາກໄດ້ເວີຊັນຕາຍຕົວ ບໍ່ຢາກອັບເດດອັດຕະໂນມັດ
> ປັກໝຸດດ້ວຍ git tag ແທນ:
> ```jsonc
> { "plugin": ["superpowers@git+https://github.com/obra/superpowers.git#v6.3.0"] }
> ```

---

## ponytail plugin (ຕິດຕັ້ງຜ່ານ npm)

```bash
rm -rf ~/.cache/opencode/packages/@dietrichgebert+ponytail@*
```

ແລ້ວຣີສະຕາດ OpenCode ຕິກສອບດ້ວຍ `/ponytail-help`

> [!tip] ຖອນ plugin ໃຫ້ລ້າງ config ນຳ
> ກ່ອນເອົາ `@dietrichgebert/ponytail` ອອກຈາກ `plugin` array ຄວນແລ່ນ `node scripts/uninstall.js` ກ່ອນສະເໝີ

---

## i-have-adhd (ຕິດຕັ້ງຜ່ານ local git clone)

```bash
git -C ~/.config/opencode/vendor/i-have-adhd pull
```

ແລ້ວຣີສະຕາດ OpenCode

> [!tip] ຖອນ plugin ບໍ່ຕ້ອງແລ່ນ script ຫຍັງ
> ຕ່າງຈາກ ponytail ທີ່ຕ້ອງແລ່ນ uninstall script ກ່ອນຖອດ — i-have-adhd ບໍ່ມີ config ທີ່ຕ້ອງລ້າງ

---

## grill-me / grilling skill (vendored SKILL.md, ບໍ່ມີ plugin manager ຄອຍອັບເດດ)

```bash
curl -s https://raw.githubusercontent.com/mattpocock/skills/main/skills/productivity/grill-me/SKILL.md
curl -s https://raw.githubusercontent.com/mattpocock/skills/main/skills/productivity/grilling/SKILL.md
```

ທຽບກັບໄຟລ໌ທີ່ມີຢູ່ — ຖ້າຕົ້ນທາງມີການປ່ຽນແປງ **ຢ່າ copy ທັບໂດຍກົງ**: ໄຟລ໌ `grilling/SKILL.md` ທີ່ໃຊ້ຈິງຖືກແກ້ຈາກຕົ້ນສະບັບ 1 ຈຸດ (ຫຍໍ້ໜ້າຫາ fact ໃຫ້ໃຊ້ `graft ask` inline ແທນ "dispatch a sub-agent" — ເບິ່ງ [[plugins]]) ຕ້ອງ merge ການແກ້ນີ້ກັບຄືນເຂົ້າໄປທຸກຄັ້ງທີ່ອັບເດດຈາກຕົ້ນທາງ

> [!tip] ບໍ່ຕ້ອງຣີສະຕາດ OpenCode
> skill ແບບໄຟລ໌ຖືກອ່ານຜ່ານ native skill tool ເອີ້ນໃຊ້ໄດ້ທັນທີຫຼັງບັນທຶກໄຟລ໌

**ຖອດ:** ລົບໂຟນເດີ `~/.config/opencode/skills/grill-me/` ແລະ `.../grilling/` ຖ້າເຄີຍຂຽນກົດ reconcile ໄວ້ໃນ global `AGENTS.md` (ເບິ່ງ [[plugins]]) ຢ່າລືມລົບສ່ວນນັ້ນອອກນຳ

---

## graft-deep.js (custom plugin ຂຽນເອງ)

ບໍ່ມີຕົ້ນທາງໃຫ້ "ອັບເດດ" ເພາະຂຽນເອງ — ຖ້າຢາກປັບປຸງ ແກ້ໄຟລ໌ `~/.config/opencode/plugin/graft-deep.js` ໂດຍກົງໄດ້ເລີຍ (ເບິ່ງໂຄ້ດເຕັມທີ່ [[plugins]])

ແຕ່ຍັງມີສອງຢ່າງທີ່ຕ້ອງຕາມໃຫ້ທັນ:

1. **graft** — plugin ລອກແບບ prompt hook ຂອງ Claude Code ໃນ graft ເອງ (ເກນທີ່ຕັດສິນວ່າຈະ inject ເມື່ອໃດ) ຕ້ອງທຽບທຸກຄັ້ງທີ່ອັບເກຣດ graft — ເບິ່ງກ່ອງໃຕ້ຫົວຂໍ້ graft ຂ້າງເທິງ
2. **OpenCode** — plugin ເພິ່ງວິທີທີ່ OpenCode ເອີ້ນ `experimental.chat.messages.transform` (ໂຫຼດ message ໃໝ່ທຸກ step, ຖືກເອີ້ນຕອນ compaction ນຳ, synthetic part) ຖ້າ OpenCode ເວີຊັນໃໝ່ປ່ຽນເລື່ອງນີ້ ສົມມຸດຕິຖານຂອງ plugin ຈະພັງ — ເບິ່ງ [[plugins]] ຫົວຂໍ້ graft-deep → "OpenCode ເອີ້ນ hook ນີ້ແນວໃດ" ແລະ [[gotchas]] ຂໍ້ 9

ກວດຫຼ້າສຸດ: graft 0.19.0 + OpenCode 1.18.32 (2026-09-25)

---

## OpenDesign (desktop app)

ອັບເດດຕົນເອງຜ່ານ launcher ຂອງຕົນເອງ (ຕັ້ງແຕ່ 0.22) — ກວດເວີຊັນໃໝ່ໃຫ້ເອງຕອນເປີດແອັບ

ຖ້າຢາກກວດດ້ວຍຕົນເອງ ເຂົ້າ **Settings → About** ໃນແອັບ ຫຼືດາວໂຫຼດຕົວຕິດຕັ້ງເວີຊັນຫຼ້າສຸດຈາກ [GitHub Releases](https://github.com/nexu-io/open-design/releases)

> [!note] ເວີຊັນທີ່ແລ່ນແທ້ຢູ່ໃສ (Windows)
> ຕັ້ງແຕ່ 0.22 ແຕ່ລະເວີຊັນແລ່ນຈາກ `%APPDATA%\Open Design\launcher\channels\stable\namespaces\release-stable-win\versions\<version>\payload\` ໂຕທີ່ active ຄື `active.version` ໃນ `runtime.json` ຂ້າງໂຟນເດີ `versions\` ສ່ວນໂຟນເດີຕິດຕັ້ງເດີມໃຕ້ `Programs` ຄ້າງຢູ່ທີ່ເວີຊັນທຳອິດທີ່ຕິດຕັ້ງ

> [!tip] ຫຼັງອັບເດດບໍ່ຕ້ອງແກ້ຫຍັງເອງ (Windows) — ຖ້າໃຊ້ shim ແບບຕາມເວີຊັນ
> shim `od.mjs` ຈາກ [[gotchas]] ຂໍ້ 4 ອ່ານ `runtime.json` ທຸກຄັ້ງທີ່ຖືກເອີ້ນ ຈຶ່ງຕາມທຸກການອັບເດດເອງ ແລະ MCP config ກໍບໍ່ມີ port ຕາຍຕົວ ກວດດ້ວຍ `od --help` ແລະ `opencode mcp list` (open-design ຄວນ connected) ຖ້າຍັງໃຊ້ shim ເກົ່າທີ່ຊີ້ຕາຍຕົວໄປ path ດຽວ ໃຫ້ປ່ຽນ — ມັນຈະແລ່ນ CLI ເວີຊັນເກົ່າຕໍ່ໄປເລື້ອຍໆ

---

## sonarqube (self-hosted, ຜ່ານ Docker)

### ສ່ວນທີ 1 — SonarQube MCP wrapper (image `sonarsource/sonarqube-mcp`)

```bash
docker pull sonarsource/sonarqube-mcp
```

### ສ່ວນທີ 2 — SonarQube Server container (image `sonarqube:community`)

> [!note] host port `9001` ບໍ່ແມ່ນ `9000`
> `9000` ມັກມີ service ອື່ນໃນເຄື່ອງໃຊ້ຢູ່ແລ້ວ setup ນີ້ຈຶ່ງເປີດ SonarQube ທີ່ host port `9001` (ຝັ່ງ container ຍັງເປັນ `9000`) `update-opencode.mjs --recreate-sonarqube` ອ່ານ port ຈາກ container ເດີມ ຈຶ່ງຄົງຄ່າທີ່ໃຊ້ຢູ່ແທ້ໄວ້

```bash
docker pull sonarqube:community
docker stop sonarqube
docker rm sonarqube
docker run -d --name sonarqube -p 9001:9000 \
  -v sonarqube_data:/opt/sonarqube/data \
  -v sonarqube_extensions:/opt/sonarqube/extensions \
  -v sonarqube_logs:/opt/sonarqube/logs \
  sonarqube:community
```

```bash
docker logs sonarqube | grep "SonarQube is operational"
```

ເຂົ້າ **http://localhost:9001 → Administration → System** ເພື່ອເບິ່ງເລກເວີຊັນທີ່ຢືນຢັນຈາກໜ້າເວັບອີກຄັ້ງ

> [!danger] ຂ້າມເວີຊັນຫຼັກຫຼາຍເວີຊັນພ້ອມກັນອາດພັງ
> SonarQube ມັກຮອງຮັບພຽງການອັບເກຣດຂ້າມ major version ທີລະ 1 ຂັ້ນ ຖ້າປ່ອຍໄວ້ດົນແລ້ວຢາກອັບເດດເທື່ອດຽວຂ້າມຫຼາຍ version ຕ້ອງເຊັກ [Upgrade Guide ທາງການ](https://docs.sonarsource.com/sonarqube-server/upgrading/) ກ່ອນສະເໝີ

---

## trivy (CLI + MCP plugin)

**1. Trivy CLI ເອງ:**

```powershell
winget upgrade AquaSecurity.Trivy
```

macOS: `brew upgrade trivy`

**2. Plugin `mcp`:**

```bash
trivy plugin update
trivy plugin upgrade
```

> [!warning] `trivy plugin update` ອາດ fail ໃນບາງ network — ແຕ່ການ upgrade ເອງຍັງໃຊ້ໄດ້
> `plugin update` ພຽງ refresh plugin index ທີ່ຢູ່ເທິງ `aquasecurity.github.io` — ພົບ timeout ແທ້ຢູ່ນີ້ (2026-09-25) ສ່ວນ `trivy plugin upgrade` ຍັງກວດກັບ repo ຂອງ plugin `mcp` ເອງໄດ້ແລະຢືນຢັນວ່າເປັນເວີຊັນຫຼ້າສຸດ (`trivy plugin list` ສະແດງເວີຊັນ) script ອັບເດດລາຍງານກໍລະນີນີ້ເປັນ warning ບໍ່ແມ່ນ failure

**3. Vulnerability database** — **auto-update ໃນຕົວ ບໍ່ຕ້ອງເຮັດຫຍັງເລີຍ**

> [!note] Trivy ບໍ່ມີ "server" ໃຫ້ຕ້ອງອັບເດດແຍກ
> ຕ່າງຈາກ sonarqube ທີ່ມີ 2 ສ່ວນ — trivy ເປັນ CLI ດ່ຽວ ບໍ່ມີ long-running service ໃຫ້ດູແລ

---

## ສະຫຼຸບ checklist ອັບເດດທັງໝົດ

| ສ່ວນປະກອບ | ຕ້ອງເຮັດເອງບໍ່ | ຄຳສັ່ງ |
| --- | --- | --- |
| OpenCode CLI | ✅ ຕ້ອງສັ່ງເອງ | `opencode upgrade` |
| MCP ຜ່ານ npx | ❌ ອັດຕະໂນມັດ | — |
| context7 (remote) | ❌ ອັດຕະໂນມັດ (ຝັ່ງເຊີບເວີ) | — |
| graft | ✅ ຕ້ອງສັ່ງເອງ | `graft upgrade` |
| superpowers | ⚠️ ຕ້ອງສັ່ງເອງ (ບັນຫາ cache) | ລົບ cache ແລ້ວ restart |
| ponytail | ⚠️ ຕ້ອງສັ່ງເອງ (ຖ້າ lockfile pin ໄວ້) | ລົບ cache ແລ້ວ restart |
| i-have-adhd | ✅ ຕ້ອງສັ່ງເອງ | `git pull` ແລ້ວ restart |
| grill-me / grilling | ✅ ຕ້ອງເຊັກ diff ເອງ | curl raw URL ທຽບ ແລ້ວ merge ການແກ້ກັບ |
| graft-deep.js | ➖ ບໍ່ມີຕົ້ນທາງ (ຂຽນເອງ) — ແຕ່ຕ້ອງທຽບກັບ hook ຂອງ graft ທຸກຄັ້ງທີ່ອັບເກຣດ graft | ແກ້ໄຟລ໌ໂດຍກົງ ເບິ່ງ [[plugins]] |
| OpenDesign | ❌ ອັດຕະໂນມັດ (launcher auto-updater) | ຜ່ານ UI ໃນແອັບ — shim `od.mjs` ຕາມເວີຊັນໃໝ່ເອງ |
| sonarqube MCP wrapper (docker) | ⚠️ ຕ້ອງສັ່ງເອງ | `docker pull sonarsource/sonarqube-mcp` |
| sonarqube Server (container) | ✅ ຕ້ອງສັ່ງເອງ | pull → stop → rm → recreate (volume ເດີມ + host port ເດີມ `9001`) |
| trivy CLI | ✅ ຕ້ອງສັ່ງເອງ | `winget upgrade AquaSecurity.Trivy` |
| trivy plugin (mcp) | ✅ ຕ້ອງສັ່ງເອງ | `trivy plugin update && trivy plugin upgrade` (refresh index ອາດ fail ໃນບາງ network — upgrade ຍັງໃຊ້ໄດ້) |
| trivy vulnerability DB | ❌ ອັດຕະໂນມັດ | — |
