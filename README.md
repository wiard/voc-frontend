# VOC frontend — zelfstandige lokale ontwikkeling

React, Vite, TypeScript en Tailwind CSS. Oorspronkelijk gegenereerd met Figma
Make; de applicatie heeft geen Figma-configuratie, account of runtime nodig.

## Lokaal gebruiken

Getest met Node.js **26.0.0** (`.node-version`) en pnpm **10.30.2**
(`packageManager`). Vite vereist een geschikte Node-versie; dit project stelt
minimaal 22.12.0 in. Gebruik de vastgelegde lockfile, zonder upgrades:

```sh
cd ~/Projects/voc-frontend
pnpm install --frozen-lockfile --ignore-scripts
pnpm dev
```

Open **http://127.0.0.1:5173**. De ontwikkelserver luistert uitsluitend op
127.0.0.1 en kiest geen andere poort wanneer 5173 bezet is.

```sh
pnpm typecheck
pnpm build
pnpm test
```

De browsertests gebruiken de **bestaande Google Chrome-installatie** via
Playwright; er wordt geen browser gedownload. Chrome moet dus lokaal aanwezig
zijn. De tests bouwen de applicatie en beheren zelf een tijdelijke previewserver
op **127.0.0.1:4173**. Laat die poort daarvoor vrij. De server stopt na de tests.

`pnpm check` voert typecontrole, build en tests achter elkaar uit. Het lokale
HTML-testrapport staat in `playwright-report/index.html`, inclusief
schermafbeeldingen voor vier schermbreedtes.

Een productiebuild afzonderlijk bekijken:

```sh
pnpm build
pnpm preview
```

Open dan **http://127.0.0.1:4173**. Stop een handmatig gestarte server met Ctrl+C.
`dist/` bevat alleen statische uitvoer. Deze fase publiceert die nergens.

## Demo en externe middelen

- De effectverkenner gebruikt fictieve, vaste cijfers; er is geen echt
  begrotingsmodel, bronnentelling, live actualisatie of gekoppelde AI.
- De beschrijving van de AI-werkwijze is inhoud van het ontwerp, geen
  geïmplementeerde AI-functionaliteit.
- Onderzoeksvraag en nieuwsbrief zijn lokale ontwerpdemonstraties. Ze sturen
  niets op, schrijven niets weg en bevestigen geen echte inzending of aanmelding.
  Alleen tijdelijke React-interface-status verandert; herladen herstelt de demo.
- De footerlinks Privacy, Toegankelijkheid en Broncode blijven placeholders.
  "Open data" opent de kennisbank. De beginselen verwijzen naar de bestaande
  inhoudelijke dossiers. Het officiële X-account is gekoppeld.
- Inter wordt nog via Google Fonts geladen. De Rijksmuseumfoto komt nog van
  Unsplash, met de bestaande naamsvermelding. Internet is nodig voor die
  externe middelen; zelfstandig betekent hier **zonder Figma**, niet offline.
- Er zijn geen API-sleutels, trackingconfiguratie, backend of nieuwe diensten
  toegevoegd.

## Kennisintegratie (fase 2B)

Op `codex/knowledge-integration`, vanaf de afgeronde fase 2A, zijn de publieke
VOC-bestanden lokaal geïntegreerd. Productie blijft ongewijzigd. Niet pushen of
publiceren zonder afzonderlijke toestemming.

- `knowledge/original/`: 25 ongewijzigde publieke VOC-bestanden.
- `knowledge/manifest.json`: oorspronkelijke paden, groottes en SHA-256.
- `scripts/prepare-knowledge.mjs`: controleert het manifest en maakt lokaal de
  publiceerbare kopieën, zoekcatalogus en pure rekenmodule.
- `src/knowledge/KnowledgeHub.tsx`: 54 datasets, dossiers, bronregister en drie
  voorstellen met behoud van status, metadata en ontbrekende waarden.
- `src/knowledge/TaxLab.tsx`: nieuwe interface rond de letterlijk overgenomen
  oorspronkelijke rekenfunctie. Geen echte Nederlandse belastingberekening.

De zeven homepage-ingangen verbinden beginselen, werkwijze, laboratorium,
transparantie, historische dossiers, Jouw straat en het AI-experiment. De
oorspronkelijke volledige dossierpagina's blijven als leesversie beschikbaar op
hun bestaande `.html`-URL's, inclusief eigen grafieken en interacties. De oude
homepage staat volledig op `over-voc.html`; oude homepage-ankers verwijzen daar
automatisch naartoe. Het oorspronkelijke Figma-ontwerp blijft de React-ingang.

De publieke export bevat **125 unieke bronverwijzingen** en **49 unieke
bronbestandsverwijzingen** bij datasets. Het opgegeven archief van 98 ruwe
bronbestanden is niet toegankelijk/gekopieerd en wordt niet als compleet
gepresenteerd. Er zijn geen ontbrekende waarden of bronbestanden verzonnen.

```sh
pnpm knowledge:prepare
pnpm test:knowledge
pnpm check
```

Dev, typecheck, build en tests bereiden de kennisbestanden automatisch voor.
De gegenereerde bestanden onder `public/`, `knowledge/generated/` en de
rekenmodule zijn genegeerde buildproducten: bewerk ze niet met de hand. De
oorspronkelijke snapshots blijven onveranderd. Voor een toekomstige data-update:
bewaar een nieuwe gecontroleerde VOC-snapshot, werk het manifest bewust bij,
genereer opnieuw en draai de regressie; geen presentatiecode aanpassen.

`pnpm check:dist` weigert ontbrekende of gewijzigde oorspronkelijke publieke
bestanden en niet-goedgekeurde uitvoer. De AI-poster blijft behouden. Een
toekomstige VPS-publicatie vereist nog controle van de strikte bestaande CSP,
omdat Google Fonts en Unsplash externe middelen blijven. Bouw buiten de VPS.

Zie [fase 1](docs/PHASE1_REPORT.md) en [het fase-2B-rapport](docs/PHASE2B_REPORT.md).

## GitHub-bouwvoorbereiding (fase 2A)

Op `codex/github-publishing` is een lokale buildworkflow toegevoegd. Deze
publiceert niets: alleen `dist/` wordt later als privé build-artifact opgeslagen.
De Pages-publicatie staat als **uitgeschakeld sjabloon** buiten de uitvoerbare
workflowmap. Push, Pages-inrichting en publicatie vereisen aparte toestemming.

```sh
pnpm test:publishing
pnpm check:sources
pnpm build
pnpm check:dist
VOC_BASE_PATH=/voc-frontend/ pnpm test
```

`VOC_BASE_PATH` is standaard `/`; voor projecthosting is het `/voc-frontend/`.
Op CI gebruikt Playwright de daar geïnstalleerde passende Chromium; lokaal
blijft de bestaande Chrome in gebruik. Vite is wegens gemelde kwetsbaarheden
gericht naar 8.1.7 bijgewerkt. Zie [het fase-2A-rapport](docs/PHASE2A_REPORT.md)
voor kosten, veiligheidscontroles, domeinvoorwaarden en activeringsprocedure.
