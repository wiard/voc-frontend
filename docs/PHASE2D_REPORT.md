# VOC fase 2D — GitHub Pages-testpublicatie geslaagd

Datum: 15 november 2026, Europe/Amsterdam.

## Uitkomst

De testwebsite is gepubliceerd en rechtstreeks via HTTPS getest:

**https://wiard.github.io/voc-frontend/**

HTTP 200, geldige TLS-verificatie en alle **72 publieke browsertests geslaagd**.
Er zijn geen inhoudelijke websitewijzigingen gedaan. `main`, `vocpartij.nl`,
VPS Murende en DNS zijn ongewijzigd.

De eerdere blokkade gold voor Pages vanuit de toen private repository met het
beschikbare abonnement. De gebruiker heeft de repository zelf openbaar gemaakt.
De hervatte aanvraag is geaccepteerd zonder een betaald abonnement te activeren.

## Branch, bron en exacte commits

| Onderdeel                                       | Waarde                                     |
| ----------------------------------------------- | ------------------------------------------ |
| Repository                                      | `wiard/voc-frontend`, openbaar             |
| Gepushte publicatiebranch                       | `codex/voc-pages-test`                     |
| Exacte gepubliceerde websitebron                | `56a7f8c91ac6567e40690b6db8e7680876026c32` |
| Commit met publicatieworkflow en publieke tests | `cf02f9a25f8c26041c66993c2ad3f8e763cb2e8d` |
| Remote `main`, vóór en na publicatie            | `2074e55259d5798979cb2ea12b3b40d187598a9f` |

De workflow checkt expliciet de goedgekeurde websitebron uit en controleert de
exacte hash. De workflowcommit verschilt dus bewust van de gepubliceerde
websitebron. Een afsluitende documentatiecommit bevat dit rapport en verandert
het gebouwde artifact niet.

Er is uitsluitend deze publicatiebranch gepusht, zonder force-push, merge,
release of tags. Bestaande ontwikkelbranches en `main` zijn niet aangepast.

## GitHub Pages en publicatieworkflow

- Pages gebruikt `build_type: workflow`, zonder custom domain (`cname: null`).
- HTTPS is verplicht (`https_enforced: true`).
- De omgeving `github-pages` liet standaard alleen `main` toe. De exacte branch
  `codex/voc-pages-test` is als aanvullende toegestane branch opgenomen. De
  bestaande regel voor `main` en overige bescherming zijn behouden.
- Publicatie vanaf de afzonderlijke branch werkt; wijzigingen aan `main`
  waren niet nodig.
- `.github/workflows/pages-test.yml` reageert uitsluitend op wijzigingen van
  die workflow op `codex/voc-pages-test`. Gewone applicatie- of rapportwijzigingen
  publiceren de site niet opnieuw.
- De build gebruikt Node uit `.node-version`, pnpm 10.30.2 en de bevroren
  lockfile. Het Vite-basispad is `/voc-frontend/`; ook de Pages-uitvoer wordt
  daarop gecontroleerd.
- De workflow voert de bestaande Node-, TypeScript-, bron-, build-, artifact-
  en 60 browsercontroles uit vóór de deployment.
- Alleen `dist/` wordt met de officiële `configure-pages`,
  `upload-pages-artifact` en `deploy-pages` Actions gepubliceerd. Alle Actions
  zijn op volledige commit-hashes vastgezet; checkout bewaart geen credentials.
- Alleen de deployjob krijgt `pages: write` en `id-token: write`. Het bestaande
  bouwproces heeft geen publicatierechten. Het oude publicatiesjabloon blijft
  uitgeschakeld.

## Echte GitHub Actions-resultaten

| Run                                                                                                | Resultaat                                                         |
| -------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| [Fase 2C — 43735309829](https://github.com/wiard/voc-frontend/actions/runs/43735309829)            | Beide bouwvarianten geslaagd op broncommit `56a7f8c`              |
| [Pages-publicatie — 43752739172](https://github.com/wiard/voc-frontend/actions/runs/43752739172)   | `build` en `deploy` geslaagd op workflowcommit `cf02f9a`          |
| [Nieuwe CI-controle — 43752739033](https://github.com/wiard/voc-frontend/actions/runs/43752739033) | `build (domain, /)` en `build (project, /voc-frontend/)` geslaagd |

Dit zijn daadwerkelijk uitgevoerde GitHub-hosted runs. Lokale resultaten zijn
hieronder afzonderlijk vermeld. De afsluitende rapportcommit gebruikt
`[skip ci]`, zodat dezelfde ongewijzigde website niet onnodig opnieuw wordt
gebouwd; de publicatieworkflow heeft bovendien een strikt padfilter.

## Lokale controles

De volledige `pnpm check` is opnieuw succesvol uitgevoerd:

| Controle                                     | Resultaat                                                       |
| -------------------------------------------- | --------------------------------------------------------------- |
| Publicatieveiligheid en Actions-configuratie | 14 Node-tests geslaagd                                          |
| Kennis en belastingmodel                     | 10 Node-tests geslaagd, inclusief 1.000 synthetische scenario's |
| Bronbestanden                                | 61 bestanden gecontroleerd; geen herkende geheimen              |
| TypeScript                                   | Geslaagd, inclusief nieuwe publieke testcode                    |
| Productiebuild en artifactcontrole           | Geslaagd                                                        |
| Bestaande browsertests                       | 60 geslaagd op vier schermbreedtes                              |

De nieuwe YAML-configuratie is geparseerd, de branch-, bron- en basispadgrenzen
zijn gecontroleerd en de werkelijke Actions-uitvoering is geslaagd. De
websitebron, kennisbestanden, dependencies en Vite-configuratie verschillen niet
van de goedgekeurde commit.

## Werkelijke publieke website: 72 tests geslaagd

Uitgevoerd met `pnpm exec playwright test --config playwright.public.config.mjs`,
rechtstreeks tegen het publieke HTTPS-adres, zonder lokale previewserver.
Vier schermbreedtes: **320, 390, 768 en 1440 pixels**. Geen tests overgeslagen,
geen automatische retries; alle 72 tests slaagden in ongeveer 1,1 minuut.

Gecontroleerd:

- HTTP 200, juiste host, geldige HTTPS-verbinding en niet verlopen certificaat.
- Homepage, zeven kennisonderdelen, desktop- en mobiele navigatie,
  toetsenbordbediening en voorkeur voor minder beweging.
- JavaScript en CSS, werkende afbeeldingen en lettertypen; geen waargenomen
  consolefouten, mislukte imports of ontbrekende middelen in de betrokken tests.
- Alle 54 datasets daadwerkelijk geselecteerd en met hun titel weergegeven.
- Alle 11 dossierdocumenten, de oorspronkelijke homepage als `over-voc.html`,
  bestaande dossier-URL's en oude homepage-ankers.
- Alle 25 oorspronkelijke publieke bestanden via HTTPS tegen hun SHA-256 uit
  het bestaande bronmanifest vergeleken: bytegetrouw behouden.
- Bronregister, zoeken, voorstellenstatus en het React-belastinglaboratorium,
  inclusief vergelijking met het oorspronkelijke laboratorium en invoergrenzen.
- Geen horizontale overloop of buiten beeld vallende koppen op de vier formaten.
- Eigen functionele links en middelen in homepage en dossiers verwijzen niet
  naar `vocpartij.nl` of `www.vocpartij.nl`.
- Demoformulieren en kennisinteracties versturen geen inzendingen of AI-verzoeken
  en leggen geen cookies of browseropslag aan tijdens de gecontroleerde acties.
- Ontwikkelpaden zoals `.env`, `.git/config`, `src/App.tsx`, `package.json` en
  dit rapport zijn niet als websitebestanden bereikbaar.

Het lokale HTML-browsertestrapport, inclusief screenshots, staat in
`playwright-report/public/index.html`; deze uitvoer is Git-ignored en niet
gepubliceerd als websitebestand.

## Beveiliging en bestaande auditresultaten

De bestaande fase-2A-, fase-2B-, fase-2C- en eerdere fase-2D-auditresultaten zijn
hergebruikt. Er is geen nieuwe uitgebreide projectaudit uitgevoerd. De eerdere
historische controle omvatte zeven commits, 83 unieke tekstblobs en twee binaire
blobs, zonder herkenbare geheimen of ongewenste historische bestanden.

De enige nieuwe bronbestanden zijn de publicatieworkflow en twee publieke
testbestanden. Deze zijn aanvullend gecontroleerd op geheimpatronen; niets
herkend. De volledige bestaande bron- en artifactcontroles zijn opnieuw geslaagd.
Patrooncontroles zijn geen absolute garantie dat willekeurige informatie nooit
gevoelig kan zijn. De repository is inmiddels publiek door de keuze van de
gebruiker; de Git-historie en documentatie zijn daarmee eveneens zichtbaar.

De site bevat uitsluitend de goedgekeurde statische uitvoer, niet de Git-historie,
projectdocumentatie, ontwikkelconfiguraties of testresultaten. De bestaande
publieke kennis omvat 54 datasets, 11 documenten, drie voorstellen ter beoordeling,
125 bron-URL's en 49 geregistreerde bronbestandsverwijzingen. Het genoemde ruwe
archief van 98 bestanden is niet meegeleverd; de interface blijft daar eerlijk over.

## Gewijzigde bestanden

1. `.github/workflows/pages-test.yml` — beperkte publicatieworkflow voor deze testbranch.
2. `playwright.public.config.mjs` — tests op het echte publieke adres.
3. `tests/public-site.check.ts` — aanvullende HTTPS-, dataset-, link- en artifactcontroles.
4. `docs/PHASE2D_REPORT.md` — dit definitieve rapport vervangt het eerdere blokkeringsrapport.

Deze wijziging maakt het goedgekeurde ontwerp en de kennisbasis op één afzonderlijk
HTTPS-testadres toegankelijk, zonder de bestaande productiewebsite te vervangen.
Er zijn geen inhoudelijke teksten, CSS, React-componenten of kennisdata veranderd.

## Grenzen, resterende beperkingen en afronding

Geen concrete publicatieblokkades meer. Er zijn geen betaalde diensten
geactiveerd, geen andere repositories gewijzigd en geen SSH-verbindingen voor
deze uitvoering gemaakt. VPS Murende, `vocpartij.nl`, DNS, Nginx en certificaten
van de productieomgeving zijn niet aangepast.

De bestaande demo's blijven demo's: geen echte nieuwsbriefinschrijvingen,
inzendingen of externe AI. Het belastingmodel blijft een oefenmodel; externe
Google Fonts en Unsplash blijven bestaande netwerkafhankelijkheden. Dit zijn
bestaande eigenschappen, geen tijdens publicatie toegevoegde functionaliteit.

Lokaal opnieuw controleren:

```sh
cd ~/Projects/voc-frontend
pnpm check
pnpm exec playwright test --config playwright.public.config.mjs
```

De afzonderlijke testwebsite is succesvol gepubliceerd en getest.
**Fase 2D is afgerond; er wordt niets verder gepubliceerd of aan productie gewijzigd.**
