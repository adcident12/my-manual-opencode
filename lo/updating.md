---
tags: [project-doc, maintenance, opencode, reference]
updated: 2026-09-13
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

---

## OpenDesign (desktop app)

ເປັນ Electron app ທີ່ມີຕົວອັບເດດໃນຕົວ (auto-updater) — ໂດຍທົ່ວໄປຈະກວດເວີຊັນໃໝ່ໃຫ້ເອງຕອນເປີດແອັບ

ຖ້າຢາກກວດດ້ວຍຕົນເອງ ເຂົ້າ **Settings → About** ໃນແອັບ ຫຼືດາວໂຫຼດຕົວຕິດຕັ້ງເວີຊັນຫຼ້າສຸດໃໝ່ຈາກ [GitHub Releases](https://github.com/nexu-io/open-design/releases)

> [!warning] ອັບເດດແລ້ວກວດ `od` shim ອີກຄັ້ງ (ສະເພາະ Windows)
> ຖ້າອັບເດດ OpenDesign ແລ້ວ path ຂອງ `daemon-cli.mjs` ປ່ຽນ shim ທີ່ສ້າງໄວ້ທີ່ [[gotchas]] ຂໍ້ 4 ອາດຕ້ອງແກ້ path ໃຫ້ຕົງກັບຕຳແໜ່ງໃໝ່

---

## sonarqube (self-hosted, ຜ່ານ Docker)

### ສ່ວນທີ 1 — SonarQube MCP wrapper (image `sonarsource/sonarqube-mcp`)

```bash
docker pull sonarsource/sonarqube-mcp
```

### ສ່ວນທີ 2 — SonarQube Server container (image `sonarqube:community`)

```bash
docker pull sonarqube:community
docker stop sonarqube
docker rm sonarqube
docker run -d --name sonarqube -p 9000:9000 \
  -v sonarqube_data:/opt/sonarqube/data \
  -v sonarqube_extensions:/opt/sonarqube/extensions \
  -v sonarqube_logs:/opt/sonarqube/logs \
  sonarqube:community
```

```bash
docker logs sonarqube | grep "SonarQube is operational"
```

ເຂົ້າ **http://localhost:9000 → Administration → System** ເພື່ອເບິ່ງເລກເວີຊັນທີ່ຢືນຢັນຈາກໜ້າເວັບອີກຄັ້ງ

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
| graft-deep.js | ➖ ບໍ່ມີອັບເດດ | ແກ້ໄຟລ໌ໂດຍກົງ |
| OpenDesign | ❌ ອັດຕະໂນມັດ | ຜ່ານ UI ໃນແອັບ |
| sonarqube MCP wrapper (docker) | ⚠️ ຕ້ອງສັ່ງເອງ | `docker pull sonarsource/sonarqube-mcp` |
| sonarqube Server (container) | ✅ ຕ້ອງສັ່ງເອງ | pull → stop → rm → recreate |
| trivy CLI | ✅ ຕ້ອງສັ່ງເອງ | `winget upgrade AquaSecurity.Trivy` |
| trivy plugin (mcp) | ✅ ຕ້ອງສັ່ງເອງ | `trivy plugin update && trivy plugin upgrade` |
| trivy vulnerability DB | ❌ ອັດຕະໂນມັດ | — |
