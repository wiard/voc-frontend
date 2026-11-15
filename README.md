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
- De footerlinks Privacy, Toegankelijkheid en Broncode zijn bestaande
  placeholders. "Open data" en "Lees de uitwerking" verwijzen naar de
  transparantiesectie, niet naar de VOC-kennisbasis.
- Inter wordt nog via Google Fonts geladen. De Rijksmuseumfoto komt nog van
  Unsplash, met de bestaande naamsvermelding. Internet is nodig voor die
  externe middelen; zelfstandig betekent hier **zonder Figma**, niet offline.
- Er zijn geen API-sleutels, trackingconfiguratie, backend of nieuwe diensten
  toegevoegd.

## Fase 2 — grens en voorbereiding

De bestaande VOC-pagina's, datasets, bronbestanden, voorstellen en het
belastinglaboratorium zijn **niet** in deze repository geïntegreerd of gewijzigd.
Alleen lokale ontwikkeling op `codex/figma-standalone` is uitgevoerd; niet pushen
of publiceren zonder afzonderlijke toestemming.

Na toestemming: maak eerst een inventaris van alle publieke URL's en bestanden.
Scheid vervolgens presentatiecomponenten, een getypeerde inhoudscatalogus,
data-adapters en het bestaande pure belastingrekenmodel. Behoud bronmetadata,
eenheden, onzekerheden en de status van voorstellen. Houd demogegevens daarbij
expliciet gescheiden van echte kennisdata.

De homepage is niet breed opgesplitst: dat was niet nodig om haar zelfstandig
betrouwbaar te laten functioneren. Gerichte componentextractie volgt wanneer de
kennislaag wordt aangesloten. De bestaande `@`-alias blijft beschikbaar.

Een toekomstige release moet **alle** bestaande publieke bestanden en URL's
behouden, inclusief niet vanuit de homepage gelinkte dossiers en de AI-poster.
Vervang de huidige webroot niet door alleen deze `dist/`. De huidige VPS-CSP
laat de externe lettertypen en afbeelding niet toe; los die compatibiliteit in
een volgende, goedgekeurde fase op. Bouw buiten de VPS.

Zie [het fase-1-rapport](docs/PHASE1_REPORT.md) voor bevindingen en testresultaten.

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
