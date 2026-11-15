# VOC fase 2E — desktopverbetering gepubliceerd

Datum: 15 november 2026, Europe/Amsterdam.

## Resultaat

**De goedgekeurde desktopverbetering staat op https://nieuw.vocpartij.nl/.**
De deployment is door GitHub als geslaagd bevestigd. De nieuwe desktopweergave
is rechtstreeks op het publieke domein getest en visueel vergeleken met de
geteste lokale versie. Mobiel en tablet zijn exact behouden op de onderzochte
formaten, inclusief volledige paginascreenshots.

## Commits en branch

| Onderdeel                                    | Exacte waarde                                      |
| -------------------------------------------- | -------------------------------------------------- |
| Gepubliceerde websitebron                    | `4ab8e46493b438d2db42335f266db987f28708a6`         |
| Geteste desktopimplementatie binnen die bron | `cb6b85cdbd2e6c1000c48e4ff651a41518b3f3cc`         |
| Publicatiebranch                             | `codex/voc-pages-test`                             |
| Commit die de publicatie startte             | `4d4d40448eb708afe1b560aa12b8cafdb4040595`         |
| Vorige publicatiebranchpositie               | `78ebc1bd9c1008e567bc0f0a1165a9fae7f73b68`         |
| Lokale ontwikkelbranch                       | `codex/desktop-proportions`, behouden op `4ab8e46` |
| `main`, vóór en na                           | `2074e55259d5798979cb2ea12b3b40d187598a9f`         |

De werkmap was bij aanvang schoon. De publicatiebranch kon zonder conflicten
fast-forwarden naar de exacte goedgekeurde ontwikkelcommit; er is niets
verloren gegaan. Alleen de publicatiebranch is gepusht, zonder force-push,
merge naar `main`, tags of release.

De afsluitende rapportcommit staat op dezelfde branch met `[skip ci]` en
verandert het gepubliceerde website-artifact niet.

## GitHub Actions

- [Pages-publicatie — run 43759113305](https://github.com/wiard/voc-frontend/actions/runs/43759113305): **geslaagd**, zowel `build` als `deploy`.
- [Build en tests — run 43759113204](https://github.com/wiard/voc-frontend/actions/runs/43759113204): **geslaagd**, zowel `build (domain, /)` als `build (project, /voc-frontend/)`.

De bestaande officiële Pages-workflow blijft in gebruik. De bron is nu expliciet
vastgezet op de goedgekeurde commit `4ab8e46`, zowel in checkout als de controle
van `APPROVED_SOURCE`. De workflow voert aanvullend de twaalf responsive tests
uit vóór het uploaden en publiceren van uitsluitend `dist/`.

Domeincontrole, Actions-pins, beperkte permissies, omgeving `github-pages`,
padfilter en custom-domainconfiguratie blijven behouden. De bijbehorende
Node-test controleert de nieuwe goedgekeurde bronhash. De deployjob volgt pas
na geslaagde Node-, TypeScript-, build-, browser-, responsive en artifactcontroles.

## Controles vóór publicatie

| Controle                                      | Resultaat                                                 |
| --------------------------------------------- | --------------------------------------------------------- |
| `pnpm check`                                  | Geslaagd                                                  |
| Node-publicatiecontroles                      | 16 geslaagd                                               |
| Node-kenniscontroles                          | 10 geslaagd, inclusief 1.000 synthetische modelscenario's |
| TypeScript                                    | Geslaagd                                                  |
| Productiebuild                                | Geslaagd                                                  |
| Bron- en artifactcontrole                     | Geslaagd                                                  |
| Bestaande browsertests                        | 60 geslaagd                                               |
| Responsive tests                              | 12 geslaagd                                               |
| Nieuwe mobiele/tabletscreenshotvergelijkingen | 8 van 8 exact gelijk                                      |

Vlak vóór de push zijn nieuwe screenshots van de toenmalige publieke website
vergeleken met de lokale publicatiekandidaat: op 375×667, 375×812, 768×800 en
768×1024, telkens het eerste scherm én de volledige pagina. Alle PNG-bestanden
waren bytegelijk op basis van SHA-256. Er is dus pas gepubliceerd nadat deze
verplichte controle volledig was geslaagd.

## Rechtstreekse publieke tests na deployment

| Controle op `nieuw.vocpartij.nl`                          | Resultaat                                          |
| --------------------------------------------------------- | -------------------------------------------------- |
| HTTPS-homepage                                            | HTTP 200, geldige TLS-verificatie                  |
| Enforce HTTPS                                             | Ingeschakeld                                       |
| Publieke browserregressie                                 | **72 geslaagd**                                    |
| Publieke responsive tests                                 | **12 geslaagd**                                    |
| Mobiel/tablet: eerste scherm en volledige pagina          | **8 van 8 bytegelijk aan de oude publieke versie** |
| Desktop: vergelijking met goedgekeurde lokale screenshots | **8 van 8 bytegelijk**                             |

De publieke regressie controleerde homepage, navigatie, JavaScript-console,
CSS, afbeeldingen en lettertypen, toetsenbordbediening, dossiers, bronnen,
alle 54 datasets, het belastinglaboratorium en zijn invoervalidatie. Alle 25
oorspronkelijke publieke kennisbestanden zijn ook via HTTPS tegen hun bestaande
SHA-256-manifest gecontroleerd. Er waren geen ontbrekende bestanden of
waargenomen consolefouten in de betrokken tests.

De responsive tests zijn rechtstreeks tegen het publieke domein uitgevoerd,
zonder lokale webserver. Gecontroleerde formaten:

- 375×667 en 375×812;
- 768×800 en 768×1024;
- 1024×768 en 1024×900;
- 1280×720 en 1280×900;
- 1440×800 en 1440×1000;
- 1920×900 en 1920×1080.

Op alle desktopformaten staat de titel op drie regels, zonder afgebroken
woorden of horizontale overflow. Introductie, beide actieknoppen en de
interactieve modelkaart passen binnen het eerste scherm. Alle thema's van de
Effectverkenner blijven werken.

De nieuwe homepage laadt daadwerkelijk de nieuwe assets:
`/assets/index-CEXR-i-V.js` en `/assets/index-BU2zqpjJ.css`.
De acht desktopbeelden zijn bovendien bytegelijk aan de geteste lokale
fase-2E-screenshots. Daarmee is bevestigd dat de correctie publiek zichtbaar
is en niet uitsluitend lokaal werkt.

## Mobiele en tabletweergave

Na deployment zijn dezelfde acht vergelijkingen tegen de ongewijzigde oude
publieke baselines herhaald. De uiteindelijke controle slaagde exact voor
alle viewport- en volledige-paginaopnamen, zonder pixeltolerantie of wijziging
van de referentiebeelden.

De eerste controles met een gedeeld browserproces gaven wisselende
rasterverschillen. De vergelijking is daarop gepauzeerd en onderzocht.
Met een verse browser per formaat en stabiele opnamen waren alle bestanden
weer exact gelijk aan de oorspronkelijke referenties. Er zijn hiervoor geen
website-, CSS-, kennis- of baselinewijzigingen gedaan. De eerste afwijkende
opnamen zijn voor navolgbaarheid lokaal bewaard.

Dit bevestigt de mobiele/tabletopmaak op de vier gemeten formaten; de
bestaande functionele regressie dekt aanvullend 320 en 390 px breedte.
De controles zijn uitgevoerd in Chrome; Safari en Firefox zijn niet afzonderlijk getest.

## Screenshotbewijzen en lokale rapporten

Alle onderstaande uitvoer staat uitsluitend lokaal en is Git-ignored:

- Hoofdmap: `/Users/wiardvasen/Projects/voc-frontend/artifacts/phase2e.local/publication/`.
- `approved/`: oude publieke mobiel/tabletbeelden, vóór publicatie vastgelegd.
- `candidate/`: bijbehorende lokale kandidaatbeelden.
- `published/`: opnieuw vastgelegde publieke mobiel/tabletbeelden na publicatie.
- `desktop/`: acht screenshots van de werkelijk gepubliceerde desktopweergave.
- `pre-comparison.json`: acht geslaagde exacte vergelijkingen vóór publicatie.
- `post-comparison.json`: acht geslaagde exacte vergelijkingen na publicatie.
- `desktop-comparison.json`: acht geslaagde exacte desktopvergelijkingen.
- `first-render-diagnostic/`: behouden eerste afwijkende opnamen.
- `playwright-report/public/index.html`: de 72 publieke tests.
- `playwright-report/public-responsive/index.html`: de 12 publieke responsive tests.

[Publiek desktopvoorbeeld, 1440×800](/Users/wiardvasen/Projects/voc-frontend/artifacts/phase2e.local/publication/desktop/1440x800.png).

De eerdere [vóór/na-galerij](/Users/wiardvasen/Projects/voc-frontend/artifacts/phase2e.local/index.html)
blijft beschikbaar. De screenshots en tijdelijke meethelpers zijn niet naar
GitHub gepusht en maken geen deel uit van de websitebuild.

## Wijzigingen en beschermde productie

Geïntegreerd zijn uitsluitend de goedgekeurde desktopklassen in `src/App.tsx`,
de bijbehorende responsive test/configuratie en het fase-2E-ontwikkelrapport.
Daarnaast zijn de bronpin en responsive teststap in de bestaande Pages-workflow
bijgewerkt, plus de gekoppelde Node-controle en dit publicatierapport.

De wijzigingen lossen de te grote titel, de verkeerd groeiende binnenmarges
en de te laag geplaatste Effectverkenner op. Teksten, dossiers, datasets,
beleidsdocumenten, constitutie, kennisbasis en applicatiefunctionaliteit zijn
niet gewijzigd.

`main` is gecontroleerd en ongewijzigd. Geen SSH-verbinding met Murende, geen
VPS-, DNS-, Nginx- of certificaatwijzigingen aan de bestaande productieomgeving,
geen wijziging van `vocpartij.nl`, geen andere repositories en geen betaalde
diensten. De bestaande custom-domaininstellingen zijn alleen gelezen.

## Opnieuw verifiëren

```sh
cd ~/Projects/voc-frontend
pnpm check
pnpm exec playwright test --config playwright.responsive.config.mjs
VOC_PUBLIC_BASE_URL=https://nieuw.vocpartij.nl/ pnpm exec playwright test --config playwright.public.config.mjs
```

De actuele website is beschikbaar op **https://nieuw.vocpartij.nl/**.
Geen resterende functionele problemen vastgesteld. De publicatie is afgerond;
er worden geen verdere wijzigingen of deployments uitgevoerd.
