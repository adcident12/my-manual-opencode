---
tags: [project-doc, maintenance, opencode, reference]
updated: 2026-10-03
summary: Paano i-update/i-upgrade ang OpenCode CLI, MCP servers, plugins, ang grill-me/grilling skill, at OpenDesign, isa-isa
---

# Pag-update at Pag-upgrade

Buod sa [[index]] · Unang setup sa [[setup]]

Bawat bahagi ng stack ay may kanya-kanyang paraan ng "pag-update." May ilang awtomatiko nang nag-a-update, walang kailangang gawin; may iba na kailangan ng manu-manong command. Sinasaklaw ng pahinang ito ang bawat isa.

---

## Awtomatikong update script (inirerekumenda — isang beses lang para sa lahat ng manu-manong bahagi)

Ang [`scripts/update-opencode.mjs`](../scripts/update-opencode.mjs) ay isang Node.js script na tumatakbo nang pareho sa **Windows, macOS, at Ubuntu** (gumagamit lang ng Node.js na naka-install na ayon sa [[setup]] Part 0, walang extra na dependency na kailangang i-install) — ino-automate ang bawat bahagi ng pahinang ito na ligtas gawin mag-isa:

```bash
node scripts/update-opencode.mjs             # i-update ang lahat ng ligtas i-update
node scripts/update-opencode.mjs --dry-run   # tignan ang bawat command, walang tatakbo
node scripts/update-opencode.mjs --recreate-sonarqube   # i-recreate din ang sonarqube server container
```

Saklaw: ang OpenCode CLI, graft (may awtomatikong fallback kung tinamaan ng `graft upgrade` ang bug na nakadokumento sa [[gotchas]]), paglilinis ng cache ng superpowers/ponytail, isang `git pull` para sa i-have-adhd, pag-diff ng grill-me/grilling laban sa upstream (hindi kailanman awtomatikong nag-o-overwrite), pag-pull ng sonarqube MCP wrapper image, at pag-update ng trivy CLI/plugin.

> [!warning] Ang hindi sinasadyang ino-automate (kailangan ng flag o manu-manong hakbang)
> - **Ang sonarqube Server container** — naka-skip by default, dahil kailangan nitong isara/tanggalin ang isang tumatakbong container. I-pass ang `--recreate-sonarqube` para gawin ito (mismong `docker inspect`-in muna ng script ang meron nang container, kaya ginagamit ang tunay na pangalan ng volumes sa halip na i-hardcode ito).
> - **Trivy sa Linux/Ubuntu** — hindi kailanman nagpapatakbo ng `sudo` mismo (kakailanganin nito ng password); prine-print lang nito ang eksaktong command na dapat mong patakbuhin.
> - **graft-deep.js** at **OpenDesign** — manu-manong sinulat / isang GUI auto-updater, ayon sa pagkakasunod-sunod. Ang script ay nagpe-print lang ng paalala; walang awtomatikong ii-update dito.

> [!info] Inayos 2026-09-25 — ang port ng SonarQube, pag-quote ng argument, at ang index ng trivy
> - **Pinapanatili ng `--recreate-sonarqube` ang host port ng dating container** (at mga named volume) sa halip na laging `9000` — default na `9001` kung wala pang container, dahil kadalasang may ibang service na gumagamit ng `9000` (tignan [[mcp-servers]], sonarqube). Subukan muna ang `--dry-run --recreate-sonarqube`: ipinapakita na nito ang eksaktong `docker run -p <port>:9000 -v …` na may totoong value.
> - Sa Windows, ang mga npm shim lang (`opencode`, `graft`, `npm`) ang dumadaan sa shell; dati lahat ng command, kaya nahati sa espasyo ang `docker inspect --format '{{json .Mounts}}'` at tahimik na bumalik sa default ang paghahanap ng volume — tignan [[gotchas]] item 10.
> - Ang pag-fail ng `trivy plugin update` dahil sa network (nasa github.io ang plugin index, na bina-block ng ilang network) ay ⚠️ warning na ngayon kung nagtagumpay pa rin ang `trivy plugin upgrade`, hindi ❌ failure.
>
> Pinapatakbo mula sa lokal na kopya (hal. `~/.config/opencode/scripts/update-opencode.mjs`)? Palitan ang kopyang iyon ng bagong [`scripts/update-opencode.mjs`](../scripts/update-opencode.mjs).

---

## OpenCode CLI

```bash
opencode upgrade
```

O tukuyin ang isang specific na bersyon:

```bash
opencode upgrade 0.1.48
```

> [!tip] Itugma ang installation method sa paraan ng unang pag-install
> Kung naka-install via `npm install -g opencode-ai` (gaya ng inirerekumenda sa [[setup]]), gamitin:
> ```bash
> opencode upgrade -m npm
> ```
> Sinusuportahan ng `-m`/`--method` ang `curl`, `npm`, `pnpm`, `bun`, `brew`, `choco`, `scoop` — itugma sa ginamit sa oras ng pag-install para hindi magkaroon ng dalawang magkahalong installation.

Kumpirmahin ang bersyon pagkatapos mag-update:

```bash
opencode --version
```

---

## MCP servers na tumatakbo via `npx`

**Awtomatiko na itong nag-a-update, walang kailangang gawin** — bawat MCP na naka-configure ganito (`playwright`, `chrome-devtools`, `postgres`, `mysql`, `memory`) ay tinatawag via `npx -y <package>@latest` o walang naka-pin na bersyon — chine-check ng npx ang npm registry para sa pinakabagong bersyon sa tuwing ito ay spumo-spawn (awtomatikong dina-download ang bagong bersyon kung meron, hindi kailanman umaasa sa lumang cache).

> [!note] Hindi na kailangang i-update ang context7
> Isa itong remote MCP (isang HTTP endpoint) — ang server side ang mismong nag-a-update, walang kailangang gawin sa panig natin.

Kung gusto mong **pilitin** na tignan ang pinakabagong bersyon ng anumang package ngayon din (hindi na kailangang hintayin na tawagin ito mismo ng opencode):

```bash
npx -y @playwright/mcp@latest --version
```

---

## graft (code-graph MCP + CLI)

May sarili nang built-in na update command ang graft, hiwalay sa MCP wrapper:

```bash
graft version    # tignan ang naka-install na bersyon, ihambing sa pinakabago sa npm
graft upgrade    # i-upgrade ang global install sa pinakabagong bersyon
```

> [!warning] Baka kailangang i-rebuild ang graph pagkatapos mag-upgrade
> Kung nagbago ang graph/wiring format ng bagong bersyon, i-run muli ang `graft build` sa bawat project na ginagamitan mo nito (tignan [[mcp-servers]], seksyong graft) — tignan ang [CHANGELOG](https://github.com/trailhq/Graft/blob/main/CHANGELOG.md) ng graft bago mag-upgrade kung nag-aalala tungkol sa breaking changes (lumipat na sa `trailhq/Graft` ang repo — tignan [[mcp-servers]]).

> [!important] Pagkatapos ng bawat graft upgrade, suriin din ang graft-deep
> Kinokopya ng graft-deep ang injection gate mula sa sariling Claude Code hook ng graft, kaya maaaring baguhin ng isang graft release ang dapat gawin ng plugin — ginawa ito ng 0.19.0 (tignan [[plugins]], graft-deep → "Injection gate", na naglilista ng eksaktong mga file at `grep` command na ikukumpara). Mabilis na check na naglo-load pa ang mga dating graph: ang `graft check . --json` sa isang project ay dapat mag-ulat ng `"graph": { "ok": true }`.

---

## superpowers plugin (naka-install via git)

Naka-install bilang `superpowers@git+https://github.com/obra/superpowers.git` (walang naka-pin) — sa prinsipyo, dapat kunin nito ang pinakabagong commit ng `main` branch sa tuwing lino-load ng opencode ang plugin, pero sa praktika, **may ilang bersyon ng opencode/Bun na nag-ca-cache ng na-resolve na git dependency**, kaya hindi makikita ang bagong bersyon sa plain na restart lang.

**Paano pilitin ang bagong pagkuha:**

```bash
rm -rf ~/.cache/opencode/packages/superpowers@git+https_
```

Pagkatapos i-restart ang OpenCode — sa pagkakataong ito, kukunin nito nang buo mula sa simula.

Kumpirmahin na talagang nakuha ang bagong bersyon:

```bash
opencode debug skill
```

Tignan ang path na ipinapakita sa log — dapat itong tumuro sa bagong-clone na cache (`~/.cache/opencode/packages/superpowers@git+https_/...`).

> [!tip] Gustong fixed na bersyon, ayaw ng awtomatikong pag-update
> I-pin sa halip gamit ang isang git tag:
> ```jsonc
> { "plugin": ["superpowers@git+https://github.com/obra/superpowers.git#v6.3.0"] }
> ```

---

## ponytail plugin (naka-install via npm)

Naka-install bilang `@dietrichgebert/ponytail` (plain na npm package, hindi git URL) — nire-resolve ng opencode/Bun ang pinakabagong bersyon na tumutugma sa range nito sa pamamagitan ng normal na lockfile mechanism, walang lumang git-cache na problema gaya ng superpowers.

**Pag-update ng bersyon:** kadalasang hindi sapat ang plain na pag-restart ng OpenCode kung may naka-pin na bersyon ang lockfile — tanggalin ang na-resolve na cache at pilitin ang bagong pagkuha:

```bash
rm -rf ~/.cache/opencode/packages/@dietrichgebert+ponytail@*
```

Pagkatapos i-restart ang OpenCode at kumpirmahin gamit ang `/ponytail-help`.

> [!tip] Kailangang linisin din ang config kapag tinanggal ang plugin
> Bago alisin ang `@dietrichgebert/ponytail` sa `plugin` array, palaging patakbuhin muna ang `node scripts/uninstall.js` (mula sa sarili nitong source) — kung hindi, matitira ang config file sa `~/.config/ponytail/config.json`.

---

## caveman (in-install nang manu-mano mula sa mga file na naka-pin sa tag)

In-install sa pamamagitan ng pag-download ng files mula sa naka-pin na tag (tignan [[plugins]]), kaya walang kusang nag-a-update. Bantayan ang bagong release sa [github.com/JuliusBrussee/caveman/releases](https://github.com/JuliusBrussee/caveman/releases), palitan ang `T=` ng bagong tag, patakbuhin ulit ang download block sa [[plugins]] (pinapatungan nito ang mga file), saka buksan ulit ang OpenCode.

> [!warning] Huwag mag-update gamit ang installer
> Isinusulat ulit ng `bin/install.js` ang `opencode.jsonc` bilang plain JSON at tinatanggal ang mga comment — [[gotchas]] item 18. Hindi ginagalaw ng `update-opencode.mjs` ang caveman (huling nasubukang bersyon: v3.1.0, 2026-10-03).

---

## i-have-adhd (naka-install via lokal na git clone)

> [!note] Lumipat na ang setup na ito sa caveman (2026-10-03) — para lang ang seksyong ito kung naka-install pa ang i-have-adhd. Kusang nilalaktawan ng update script ang hakbang na ito kapag wala ang folder.

Kaiba sa superpowers/ponytail, hindi ito dumaan sa `plugin` array bilang git URL o npm package — direktang tumuturo ang `plugin` array sa isang `.mjs` file path sa loob ng na-clone na source (tignan [[setup]] Part 4). Kaya ang pag-update dito ay isang `git pull` lang sa source na iyon, wala nang caching ng opencode/Bun na kaugnay:

```bash
git -C ~/.config/opencode/vendor/i-have-adhd pull
```

Pagkatapos i-restart ang OpenCode (nag-lo-load lang ang plugins kapag nagsisimula ang session) — wala nang ibang kailangang tignan maliban sa pagsubok ng `/i-have-adhd` para kumpirmahin na normal pa rin ang pag-activate nito.

> [!tip] Walang kailangang script para tanggalin ang plugin
> Kaiba sa ponytail na kailangan munang patakbuhin ang uninstall script — walang config na kailangang linisin ang i-have-adhd. Alisin lang ang path sa `plugin` array at burahin ang folder na `~/.config/opencode/vendor/i-have-adhd` (kung na-on kailanman ang always-on, huwag kalimutang burahin din ang flag file na `~/.config/opencode/.i-have-adhd-always` — tignan [[plugins]]).

---

## grill-me / grilling skill (isang vendored na SKILL.md, walang plugin manager na nag-a-update)

Hindi ito naka-install sa pamamagitan ng `plugin` array (tignan [[plugins]]) — plain na `SKILL.md` file lang ito na kinopya mula sa [mattpocock/skills](https://github.com/mattpocock/skills), nasa `~/.config/opencode/skills/grill-me/` at `~/.config/opencode/skills/grilling/`. **Walang kahit anong awtomatikong nag-a-update dito** — kailangan mong regular na i-diff ito laban sa orihinal mismo:

```bash
curl -s https://raw.githubusercontent.com/mattpocock/skills/main/skills/productivity/grill-me/SKILL.md
curl -s https://raw.githubusercontent.com/mattpocock/skills/main/skills/productivity/grilling/SKILL.md
```

Ihambing sa mga meron nang file — kung nagbago ang upstream, **huwag lang direktang i-copy pataas**: ang `grilling/SKILL.md` na aktwal na ginagamit ay nabago mula sa orihinal sa 1 lugar (ang parapo ng paghahanap ng facts, para gamitin ang `graft ask` nang inline sa halip na "dispatch a sub-agent" — tignan [[plugins]]). Kailangang i-merge pabalik ang pagbabagong iyon sa tuwing mag-a-update mula sa upstream, kung hindi, aksidenteng babalik ito sa pag-asa sa isang subagent.

> [!tip] Hindi na kailangang i-restart ang OpenCode
> Kaiba sa isang plugin, na nag-lo-load lang kapag nagsisimula ang session — nababasa ang isang file-based na skill sa pamamagitan ng native skill tool at matatawag agad pagkatapos i-save ang file.

**Pagtanggal:** burahin ang mga folder na `~/.config/opencode/skills/grill-me/` at `.../grilling/`. Kung may isinulat na reconciliation rule sa global `AGENTS.md` (tignan [[plugins]]), huwag kalimutang tanggalin din iyon — kung hindi, patuloy na susubukan ng `brainstorming` na i-reference ang isang skill na wala na.

---

## graft-deep.js (manu-manong sinulat na custom plugin)

Walang upstream para "i-update" dito, dahil manu-mano itong sinulat — para pagbutihin ito, i-edit lang direkta ang `~/.config/opencode/plugin/graft-deep.js` (buong source code nasa [[plugins]]). Wala nang ibang kailangang i-restart maliban sa pagbukas ng bagong OpenCode session.

Pero may dalawa pa rin itong kailangang sabayan:

1. **graft** — ginagaya ng plugin ang sariling Claude Code prompt hook ng graft (ang gate na nagpapasya kung kailan mag-inject). Ikumpara pagkatapos ng bawat graft upgrade — tignan ang kahon sa ilalim ng graft sa itaas.
2. **OpenCode** — umaasa ang plugin sa paraan ng pagtawag ng OpenCode sa `experimental.chat.messages.transform` (bagong load na mga message bawat step, tinatawag din sa compaction, synthetic parts). Kung baguhin ito ng bagong bersyon ng OpenCode, masisira ang mga palagay ng plugin — tignan [[plugins]], graft-deep → "Paano pinapatakbo ng OpenCode ang hook na ito", at [[gotchas]] item 9.

Huling sinuri: graft 0.21.1 + OpenCode 1.18.34 (2026-10-03) — napanatili ng graft 0.20/0.21 ang injection gate ng 0.19, walang kailangang baguhin sa plugin.

---

## OpenDesign (desktop app)

Ina-update ang sarili sa pamamagitan ng sarili nitong launcher (mula 0.22) — chine-check nito ang bagong bersyon kapag binubuksan ang app, walang extra na kailangang patakbuhin.

Para tignan mismo, pumunta sa **Settings → About** sa app, o i-download ang pinakabagong installer direkta mula sa [GitHub Releases](https://github.com/nexu-io/open-design/releases).

> [!note] Kung nasaan talaga ang tumatakbong bersyon (Windows)
> Mula 0.22, tumatakbo ang bawat bersyon mula sa `%APPDATA%\Open Design\launcher\channels\stable\namespaces\release-stable-win\versions\<version>\payload\`; ang active ay ang `active.version` sa `runtime.json` katabi ng `versions\`. Nananatili sa unang na-install na bersyon ang orihinal na install folder sa ilalim ng `Programs`.

> [!tip] Walang kailangang ayusin nang mano-mano pagkatapos ng update (Windows) — kung ang shim ay ang sumusunod-sa-bersyon
> Binabasa ng `od.mjs` shim mula sa [[gotchas]] item 4 ang `runtime.json` sa bawat tawag, kaya kusa nitong sinusundan ang bawat update, at walang nakapirming port ang MCP config. Kumpirmahin gamit ang `od --help` at `opencode mcp list` (dapat connected ang open-design). Kung ang lumang shim na naka-hardcode sa iisang path pa rin ang gamit mo, palitan ito — patuloy nitong pinapatakbo ang lumang CLI.

---

## sonarqube (self-hosted, via Docker)

Kaiba sa lahat ng iba pang MCP sa pahinang ito, may **dalawang hiwalay na bahaging kailangang i-update**, at **wala sa mga ito ang auto-update gaya ng npx** — dahil tumatakbo ito sa pamamagitan ng Docker images na kinuha at naka-cache nang lokal, hindi kinukuha mula sa registry nang sariwa sa bawat tawag gaya ng `npx -y package@latest`.

### Bahagi 1 — ang SonarQube MCP wrapper (image na `sonarsource/sonarqube-mcp`)

Ang naka-configure na setup (tignan [[mcp-servers]], seksyong sonarqube) ay walang naka-pin na bersyon, pero wala ring `--pull=always` — kaya patuloy na ginagamit ng Docker ang parehong naka-cache na image, kahit na `latest` ang pangalan ng tag. **Kailangan mong mag-pull mismo paminsan-minsan para makakuha ng bagong bersyon:**

```bash
docker pull sonarsource/sonarqube-mcp
```

> [!tip] Kung gusto mong awtomatikong ma-check ito sa bawat pagbukas
> Idagdag ang `"--pull=always"` sa `"command"` array ng config (pagkatapos ng `docker run`) — kapalit nito ay mas mabagal na startup sa tuwina, dahil kailangan munang tignan ang registry; hindi inirerekumenda kung madalas buksan/isara ang opencode.

### Bahagi 2 — ang SonarQube Server container (image na `sonarqube:community`)

> [!note] Host port na `9001`, hindi `9000`
> Kadalasang may ibang lokal na service nang gumagamit ng `9000`, kaya inilalathala ng setup na ito ang SonarQube sa host port na `9001` (`9000` pa rin sa panig ng container). Binabasa ng `update-opencode.mjs --recreate-sonarqube` ang port mula sa dating container, kaya pinapanatili nito ang talagang ginagamit mo.

Isang service na dapat manatiling tumatakbo nang permanente ang container na ito (hindi spina-spawn per-use gaya ng MCP) — ang pag-update dito ay pag-pull ng bagong image at pagbuo ulit ng container. Walang mawawalang data dahil nakaimbak ito sa hiwalay na named volumes:

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

Kumpirmahin na tumatakbo na talaga ang bagong bersyon matapos magtagumpay ang container:

```bash
docker logs sonarqube | grep "SonarQube is operational"
```

Pumunta sa **http://localhost:9001 → Administration → System** para kumpirmahin din ang version number mula sa web UI.

> [!danger] Maaaring masira kapag nilaktawan ang ilang major version nang sabay-sabay
> Karaniwang isang major version lang bawat pagkakataon ang suportado ng SonarQube (gaya ng karamihan ng databases) para sa pag-upgrade. Kung matagal na itong naiwan at gusto mong i-update nang sabay-sabay sa maraming bersyon, palaging tignan muna ang [opisyal na Upgrade Guide](https://docs.sonarsource.com/sonarqube-server/upgrading/) — minsan kailangang mag-upgrade nang paisa-isa ayon sa pagkakasunod-sunod, hindi tumalon diretso sa pinakabagong bersyon.

---

## trivy (CLI + MCP plugin)

3 bahagi, bawat isa ay iba-ibang mekanismo ang pag-update:

**1. Ang Trivy CLI mismo** — i-update sa pamamagitan ng parehong package manager na ginamit sa pag-install:

```powershell
winget upgrade AquaSecurity.Trivy
```

macOS: `brew upgrade trivy`

**2. Ang `mcp` plugin** — hiwalay ang bersyon sa pangunahing CLI, kailangan ng sarili nitong hakbang sa pag-update:

```bash
trivy plugin update      # i-refresh muna ang plugin index
trivy plugin upgrade     # i-upgrade ang mga naka-install na plugin (kasama ang mcp) sa pinakabagong bersyon
```

> [!warning] Maaaring mag-fail ang `trivy plugin update` sa ilang network — maaaring gumana pa rin ang upgrade mismo
> Nire-refresh lang ng `plugin update` ang plugin index, na nasa `aquasecurity.github.io`; nakitang nagta-timeout dito (2026-09-25). Nasuri pa rin ng `trivy plugin upgrade` ang sariling repo ng `mcp` plugin at kinumpirmang pinakabago ito (ipinapakita ng `trivy plugin list` ang bersyon). Iniuulat ito ng update script bilang warning, hindi failure.

**3. Ang vulnerability database** — **auto-update ito mismo, walang kailangang gawin** — chine-check nito mismo ang kasariwaan ng DB sa bawat scan, awtomatikong nagdo-download ng bago kung masyadong luma na ang cache (kaiba sa 2 bahagi sa itaas na kailangan ng manu-manong command).

> [!note] Walang "server" ang Trivy na kailangang i-update nang hiwalay
> Kaiba sa sonarqube na may 2 bahagi (MCP wrapper + server container) — standalone na CLI ang trivy na walang long-running na service na kailangang alagaan; ang 2 command sa itaas na ang buong proseso ng pag-update.

---

## Buod ng buong checklist ng pag-update

| Bahagi | Kailangan bang manu-mano? | Command |
| --- | --- | --- |
| OpenCode CLI | ✅ Manu-mano | `opencode upgrade` |
| MCPs via npx (playwright, chrome-devtools, postgres, mysql, memory) | ❌ Awtomatiko | — |
| context7 (remote) | ❌ Awtomatiko (server-side) | — |
| graft | ✅ Manu-mano | `graft upgrade` |
| superpowers | ⚠️ Manu-mano (dahil sa problema sa cache) | tanggalin ang cache, pagkatapos i-restart |
| ponytail | ⚠️ Manu-mano (kung may naka-pin na bersyon ang lockfile) | tanggalin ang cache, pagkatapos i-restart |
| caveman | ✅ Manu-mano (mga file na naka-pin sa tag) | palitan ang tag at i-download ulit — huwag kailanman ang installer |
| i-have-adhd (kung ginagamit pa) | ✅ Manu-mano (lokal na clone) | `git pull`, pagkatapos i-restart |
| grill-me / grilling | ✅ Manu-manong pag-diff (vendored, walang manager) | i-curl ang raw URL, ihambing, i-merge pabalik ang ayos |
| graft-deep.js | ➖ Walang upstream (manu-manong sinulat) — pero ikumpara sa hook ng graft pagkatapos ng bawat graft upgrade | i-edit direkta ang file; tignan [[plugins]] |
| OpenDesign | ❌ Awtomatiko (launcher auto-updater) | via UI ng app; kusang sinusundan ng `od.mjs` shim ang bagong bersyon |
| sonarqube MCP wrapper (docker) | ⚠️ Manu-mano (hindi auto gaya ng npx) | `docker pull sonarsource/sonarqube-mcp` |
| sonarqube Server (container) | ✅ Manu-mano | pull → stop → rm → recreate (parehong volumes + parehong host port, `9001`) |
| trivy CLI | ✅ Manu-mano | `winget upgrade AquaSecurity.Trivy` |
| trivy plugin (mcp) | ✅ Manu-mano (hiwalay sa CLI) | `trivy plugin update && trivy plugin upgrade` (maaaring mag-fail ang index refresh sa ilang network — gumagana pa rin ang upgrade) |
| trivy vulnerability DB | ❌ Awtomatiko | — |
