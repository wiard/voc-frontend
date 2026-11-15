# VOC fase 1 — zelfstandige Figma-frontend

## Scope en uitgangspunt

- Lokale map: `/Users/wiardvasen/Projects/voc-frontend`.
- Bron: private repository `wiard/voc-frontend`, branch `main`.
- Basiscommit: `2074e55259d5798979cb2ea12b3b40d187598a9f`.
- Ontwikkelbranch: `codex/figma-standalone`.
- `main` blijft op de basiscommit. Geen push, SSH, VPS-aanpassing, publicatie of
  wijziging aan de bestaande VOC-website in deze fase.

## Aangetroffen oorzaak en herstel

De ongewijzigde productiebuild en TypeScript-controle zijn eerst uitgevoerd.
Beide faalden op de ontbrekende import `./.figma/make/site.json` in
`vite.config.ts` (TypeScript TS2307; build UNRESOLVED_IMPORT).

De oorspronkelijke configuratie gebruikte dat bestand voor documentmetadata,
favicon, eventuele analytics/custom scripts en Figma-preview-inrichting.
Het bestand is niet opgenomen in de onderzochte Git-commit. Waarom het bij de
export/upload ontbreekt, is niet vast te stellen uit de repositorygeschiedenis;
de inhoud is niet geraden of nagebouwd.

React, Tailwind en de alias werken zonder deze Figma-functies. Daarom is de
configuratie vervangen door een gewone Vite-configuratie. De documenttaal,
VOC-titel en bestaande favicon zijn rechtstreeks in `index.html` vastgelegd.
Alle Figma-plugins, comment-slots en Figma-omgevingsvariabelen zijn uit de
uitvoerbare configuratie verwijderd. Dev en preview binden alleen aan localhost.

## Wijzigingen en gebruikerservaring

- Layout, kleuren, Inter, afbeeldingen, politieke teksten, beginselen,
  werkwijze, secties en bestaande interacties behouden.
- Fictieve scores, begrotingseffecten en modelmetadata duidelijk gemarkeerd.
  "LIVE MODEL", "42 openbare bronnen" en "Vandaag bijgewerkt" vervangen door
  neutrale demo-aanduidingen.
- Formulieren blijven interactief, maar melden expliciet dat geen inzending,
  opslag of nieuwsbriefregistratie plaatsvindt. Geen verzend- of opslagcode
  toegevoegd.
- Inhoudslink voor toetsenbordgebruik, Nederlandse documenttaal, toegankelijke
  formuliernamen, statusmeldingen, geselecteerde onderwerpstatus en benoemde
  mobiele navigatie toegevoegd.
- Geen brede componentherschrijving of kennisintegratie: dat is niet nodig
  voor zelfstandige werking en valt onder een volgende fase.

Dit voorkomt dat bezoekers demonstratie-uitkomsten of lokale formulierreacties
aanzien voor echte onderzoeksresultaten en geslaagde aanmeldingen.

## Gewijzigde en toegevoegde bestanden

| Bestand                  | Doel                                                                        |
| ------------------------ | --------------------------------------------------------------------------- |
| `vite.config.ts`         | Zelfstandige configuratie; uitsluitend loopbackservers                      |
| `index.html`             | Nederlandse documenttaal, VOC-titel en bestaande favicon                    |
| `src/App.tsx`            | Demolabels, eerlijke formulierstatus en basale toegankelijkheid             |
| `package.json`           | Typecontrole/testscripts, pnpm-versie, Node-vereiste en testafhankelijkheid |
| `pnpm-lock.yaml`         | Playwright toegevoegd; bestaande pakketversies behouden                     |
| `tsconfig.json`          | Ook testcode en testconfiguratie controleren                                |
| `playwright.config.ts`   | Bestaande Chrome, vier schermbreedtes, lokale previewserver                 |
| `tests/homepage.spec.ts` | Reproduceerbare browsercontroles                                            |
| `.gitignore`             | Build, afhankelijkheden, testuitvoer en lokale geheimen uitsluiten          |
| `.node-version`          | Geteste Node-versie                                                         |
| `AGENTS.md`              | Verouderde Figma-runtime-instructies corrigeren                             |
| `README.md`              | Lokale uitvoering, beperkingen en integratiegrens                           |
| `docs/PHASE1_REPORT.md`  | Dit rapport                                                                 |

## Toolchain en resultaten

Gebruikt: Node.js **26.0.0**, pnpm **10.30.2**, Playwright **1.65.1** en de
bestaande Google Chrome-installatie. React **19.2.4**, Vite **8.0.5**,
Tailwind **4.2.2** en TypeScript **5.9.3** zijn behouden. De lockfilewijziging
omvat de testafhankelijkheid en pnpm-peer/platformmetadata, geen upgrades van
de bestaande afhankelijkheden.

| Controle                       | Resultaat                                                                                                  |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------- |
| Installatie originele lockfile | Geslaagd met `--frozen-lockfile --ignore-scripts`                                                          |
| TypeScript na herstel          | Geslaagd, inclusief tests                                                                                  |
| Productiebuild na herstel      | Geslaagd; 16 modules verwerkt                                                                              |
| Productie-HTML                 | `lang="nl"`, VOC-titel, favicon; geen Figma-slots                                                          |
| Browsertests                   | **32 geslaagd**, geen retries                                                                              |
| Schermbreedtes                 | 320, 390, 768 en 1440 pixels                                                                               |
| Console en middelen            | Geen JS-/console-/HTTP-fouten of mislukte requests in de geteste pagina's; foto en Inter geladen           |
| Navigatie                      | Sectiedoelen bestaan; mobiel menu opent en sluit na keuze                                                  |
| Effectverkenner                | Alle drie onderwerpen veranderen de gemarkeerde demo-uitkomst                                              |
| Formulieren                    | Verplichte/ongeldige invoer gecontroleerd; geen netwerkverzending, cookies, localStorage of sessionStorage |
| Toegankelijkheid               | Toetsenbord-inhoudslink, labels, menustatus en minder-bewegen-voorkeur gecontroleerd                       |
| Figma-verkeer                  | Geen Figma-verzoeken tijdens paginaweergave                                                                |
| Visuele controle               | Desktop- en mobiele schermafbeeldingen beoordeeld; geen horizontale documentoverflow op de vier breedtes   |

Ook de aangevulde lockfile is met `--frozen-lockfile --offline --ignore-scripts`
opnieuw succesvol gecontroleerd. De ontwikkelmodus is afzonderlijk in Chrome
gecontroleerd: geen runtime- of consolefouten, geen Figma-verzoeken en de
HMR-websocket verbindt uitsluitend met 127.0.0.1.

Dit is geen volledige WCAG-audit of Safari/Firefox-test. De gecontroleerde
productiebundel werkt in de bestaande Chrome-installatie. Het HTML-testrapport
en schermafbeeldingen staan lokaal in de genegeerde map `playwright-report/`.

## Resterende beperkingen

- Geen blokkerende build-, type- of browserfouten gevonden na herstel.
- Node 26 meldt vanuit de bestaande tooling een `module.register()`-
  deprecatiewaarschuwing. Die blokkeert build of tests niet; er zijn hiervoor
  geen onnodige dependency-upgrades uitgevoerd.
- Effectverkenner, AI-uitvoering en formulieren blijven demo; geen echte
  VOC-datasets, bronnentelling of backend aangesloten.
- Bestaande footer-placeholders en de transparantie-ankerlinks zijn nog geen
  inhoudelijke documentroutes.
- Google Fonts en Unsplash blijven externe afhankelijkheden. De bestaande
  productie-CSP vereist daarvoor een latere oplossing, bij voorkeur zonder
  de beveiliging te versoepelen.
- De omvang van de bestaande kennisbasis (11 pagina's, 54 datasets, 98
  geregistreerde bronbestanden en drie voorstellen) is context voor fase 2;
  er zijn in deze fase geen VPS- of kennisbestanden gekopieerd of gecontroleerd.

## Verificatie en vervolg

Zie `README.md` voor exacte lokale commando's. `git log -1 --oneline` toont de
lokale oplevercommit; `git status --short --branch` toont de werkboom.

Fase 1 levert een zelfstandig bouwbare lokale frontend op. Fase 2 vereist
afzonderlijke toestemming: volledige URL-inventaris, behoud van alle dossiers,
gestructureerde bron- en datasetkoppeling en hergebruik van het belastingmodel.
Geen productiepublicatie vanuit deze fase.
