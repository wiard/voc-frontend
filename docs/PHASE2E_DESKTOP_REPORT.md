# VOC fase 2E — desktopverhoudingen gecorrigeerd

Datum: 15 november 2026, Europe/Amsterdam.

## Resultaat en Git

De desktopcompositie is lokaal verbeterd met behoud van de bestaande Figma-stijl.
De titel staat op drie volledige regels, de introductie en beide actieknoppen
zijn op alle geteste desktopformaten binnen het eerste scherm zichtbaar, en de
Effectverkenner staat direct bovenaan in de rechterkolom.

- Nieuwe lokale branch: **`codex/desktop-proportions`**.
- Exacte geteste implementatiecommit: **`cb6b85cdbd2e6c1000c48e4ff651a41518b3f3cc`**.
- Branchbasis: `78ebc1bd9c1008e567bc0f0a1165a9fae7f73b68`, de actuele publicatiebranch.
- Actueel gepubliceerde websitebron: `56a7f8c91ac6567e40690b6db8e7680876026c32`.
  Vóór de wijziging was de lokale applicatiebron bytegelijk aan die bron; de
  latere publicatiecommits bevatten alleen workflow-, test- en documentatiewerk.
- Een opvolgende lokale documentatiecommit bevat dit rapport.
- `main` blijft `2074e55259d5798979cb2ea12b3b40d187598a9f`.

**Niets gepusht of gepubliceerd.** De site `nieuw.vocpartij.nl` toont nog de
bestaande versie. GitHub-instellingen, workflows, DNS, VPS Murende en
`vocpartij.nl` zijn tijdens deze fase niet gewijzigd.

## Nulmeting en oorzaak

Eerst zijn twaalf screenshots van de werkelijk gepubliceerde homepage op
`https://nieuw.vocpartij.nl/` gemaakt, vóór enige applicatiewijziging.
De metingen zijn gedaan nadat de kennisbank en lettertypen waren geladen,
met verminderde beweging ingeschakeld.

De belangrijkste oorzaak was de desktop-padding
`max(2rem, calc((100vw - 1240px) / 2))` aan beide zijden van de linkerkolom.
De buitencontainer stopt bij 1440 px, maar de padding bleef groeien met de
viewport. Bij 1920 px kostte die padding 680 px in een kolom van ongeveer
749 px. Er bleef bijna geen bruikbare tekstbreedte over.

Tegelijk groeide de titel tot 118,4 px, waren automatische woordafbreking en
`overflow-wrap: anywhere` actief, en centreerde de rechterkolom zijn inhoud
verticaal ten opzichte van de steeds langere linkerkolom. Op 1920 px:

- brak de titel over tien regels met afgebroken woorden;
- stond de primaire knop pas rond y=1979 px;
- begon de titel van de Effectverkenner rond y=857 px.

Ook op 1024–1440 px was de typografie te groot en viel de primaire knop bij
normale schermhoogtes buiten het eerste scherm.

## Gerichte wijzigingen

Alle vormgevingswijzigingen zitten in **zes bestaande `className`-attributen**
in `src/App.tsx`, via responsive Tailwind-CSS. Er is geen component herschreven.

- Desktopkolommen gebruiken `minmax(0, ...)` en `min-w-0`, met behoud van hun
  bestaande verhouding en de maximale containerbreedte van 1440 px.
- De linker desktop-padding is begrensd: 40 px en vanaf 1280 px 56 px.
- De verticale desktop-padding is 40 px; de inhoud begint bovenaan.
- De titel gebruikt op desktop `clamp(3.5rem, 5vw, 4.75rem)`: 56–76 px.
  Regelhoogte is 0,98 en letterspatiëring −0,065 em. Woordafbreking is daar
  uitgeschakeld; de bestaande drie titelregels blijven intact.
- De introductie schaalt op desktop tussen 18 en 20 px. De afstand tot titel
  en knoppen is verkleind tot respectievelijk 28 en 24 px.
- De rechterkolom begint eveneens bovenaan, met 40 px verticale ruimte en
  begrensde horizontale padding. De kaart zelf en alle interacties blijven gelijk.
- De desktopminimumhoogte van 720 px is losgelaten, zodat de compositie niet
  onnodig veel lege hoogte krijgt.

Kleuren, lettertype, oranje titelaccent, lime onderstreping, navigatie, knoppen,
kaartonderdelen, teksten, rekenlogica en handlers zijn behouden. De globale
stylesheet en de kennisbasis zijn niet aangepast.

## Resultaten per breedte

De geometrie is op beide genoemde hoogtes per breedte gecontroleerd.
Coördinaten zijn vanaf de bovenkant van de pagina, afgerond op hele pixels.
"Effect" is de bovenkant van de titel Effectverkenner.

| Breedte | Geteste hoogtes | Titelgrootte vóór → na | Titelregels vóór → na | Primaire knop onderkant vóór → na | Effect bovenkant vóór → na |
| ------- | --------------- | ---------------------- | --------------------- | --------------------------------- | -------------------------- |
| 375     | 667, 812        | 57,6 → 57,6 px         | 3 → 3                 | 681 → 681 px                      | 927 → 927 px               |
| 768     | 800, 1024       | 59,9 → 59,9 px         | 3 → 3                 | 625 → 625 px                      | 789 → 789 px               |
| 1024    | 768, 900        | 79,9 → 56 px           | 3 → 3                 | 802 → 587 px                      | 256 → 157 px               |
| 1280    | 720, 900        | 99,8 → 64 px           | 3 → 3                 | 813 → 587 px                      | 250 → 157 px               |
| 1440    | 800, 1000       | 112,3 → 72 px          | 3 → 3                 | 844 → 615 px                      | 266 → 157 px               |
| 1920    | 900, 1080       | 118,4 → 76 px          | 10 → 3                | 1979 → 626 px                     | 857 → 157 px               |

Op alle acht desktopcombinaties staan de volledige introductie, **beide**
actieknoppen en de interactieve modelkaart binnen het eerste scherm.
De Effectverkenner begint op alle desktopformaten 60 px onder de header.
Geen titelwoord wordt over meerdere regels afgebroken en er is geen
horizontale pagina-overflow.

## Mobiele en tabletregressie

De screenshots op **375×667, 375×812, 768×800 en 768×1024 zijn vóór en na
bytegelijk** op basis van SHA-256-vergelijking van de PNG-bestanden.
De bestaande mobiele breakpoints en opmaak zijn behouden.

De volledige bestaande regressie controleert bovendien 320×740 en 390×844,
inclusief mobiel menu, toetsenbord, demoformulieren, titelgrenzen en de
kenniscomponenten. Op korte mobiele schermen blijft scrollen naar de knoppen
en Effectverkenner nodig, zoals in de nulmeting. De nieuwe responsive test
controleert dat de primaire knop door scrollen bereikbaar is en dat alle drie
demothema's werken.

## Geautomatiseerde tests

| Controle                  | Resultaat                                                 |
| ------------------------- | --------------------------------------------------------- |
| `pnpm check`              | Geslaagd                                                  |
| Node-publicatiecontroles  | 16 geslaagd                                               |
| Node-kenniscontroles      | 10 geslaagd, inclusief 1.000 synthetische modelscenario's |
| TypeScript                | Geslaagd, inclusief de nieuwe responsive test             |
| Productiebuild            | Geslaagd                                                  |
| Bron- en artifactcontrole | Geslaagd                                                  |
| Bestaande browsertests    | 60 geslaagd                                               |
| Extra responsive suite    | 12 geslaagd, één per breedte/hoogtecombinatie             |

De bestaande browsertests omvatten dossiers, alle oorspronkelijke publieke
middelen en hun SHA-256, datasets, bronregister, voorstellen, oud en nieuw
belastinglaboratorium, invoervalidatie en ongewenste opslag/netwerkacties.
Alle 25 oorspronkelijke publieke kennisbestanden blijven bytegetrouw behouden.

De aanvullende suite meet echte letterposities om woordafbreking te detecteren,
controleert de drie titelregels, overflow, zichtbaarheid van desktopacties en
modelkaart, de hogere positie van de Effectverkenner en het wisselen tussen
Wonen, Energie en Mobiliteit. Geen retries of overgeslagen tests.

De niet-blokkerende bestaande Node/Vite-waarschuwing over `module.register()`
blijft zichtbaar; er zijn geen dependencies voor deze opdracht gewijzigd.

## Screenshots en rapporten bekijken

**[Open de volledige vóór/na-vergelijkingsgalerij](/Users/wiardvasen/Projects/voc-frontend/artifacts/phase2e.local/index.html)**

- Vóór: `/Users/wiardvasen/Projects/voc-frontend/artifacts/phase2e.local/before/`.
- Na: `/Users/wiardvasen/Projects/voc-frontend/artifacts/phase2e.local/after/`.
- Bestandsnamen: bijvoorbeeld `1440x800.png` en `1920x900.png`, voor alle twaalf
  combinaties uit de tabel. Elke map bevat ook `metrics.json` met exacte metingen.
- De galerij toont vóór en na naast elkaar en linkt naar het oorspronkelijke formaat.
- Standaard browsertestrapport: `playwright-report/index.html`.
- Responsive testrapport: `playwright-report/responsive/index.html`.

Voorbeelden:
[1920 px vóór](/Users/wiardvasen/Projects/voc-frontend/artifacts/phase2e.local/before/1920x900.png),
[1920 px na](/Users/wiardvasen/Projects/voc-frontend/artifacts/phase2e.local/after/1920x900.png),
[1440 px na](/Users/wiardvasen/Projects/voc-frontend/artifacts/phase2e.local/after/1440x800.png).

De screenshots, meetbestanden en galerij blijven uitsluitend lokaal; de bestaande
ignore-regel `*.local` sluit deze map uit. Testuitvoer is eveneens genegeerd.
Ze zitten niet in de websitebuild of een Git-commit.

## Gewijzigde projectbestanden

1. `src/App.tsx` — alleen de gerichte responsive hero-klassen.
2. `playwright.responsive.config.mjs` — lokale testmatrix met twaalf formaten.
3. `tests/desktop-layout.check.ts` — aanvullende meetbare UX-regressiecontrole.
4. `docs/PHASE2E_DESKTOP_REPORT.md` — dit rapport.

## Lokaal verifiëren en aandachtspunten

```sh
cd ~/Projects/voc-frontend
git switch codex/desktop-proportions
pnpm check
pnpm exec playwright test --config playwright.responsive.config.mjs
pnpm preview
```

De preview is beschikbaar op `http://127.0.0.1:4173/`. Stop een handmatige
preview vóór het draaien van tests die dezelfde poort beheren.

Geen resterende blokkades voor de lokale vormgevingscorrectie. Getest in de
bestaande lokale Chrome-installatie; Firefox en Safari zijn niet afzonderlijk
getest. De mobiele opmaak en compacte bestaande navigatie op 1024 px zijn
behouden. De inhoudelijke beperkingen van de Effectverkenner blijven als demo
zichtbaar en ongewijzigd.

Een toekomstige publicatie vereist afzonderlijke toestemming en een bewuste
bijwerking van de gepinde broncommit in de publicatieworkflow; die staat nog op
`56a7f8c`. Alleen pushen van deze ontwikkelbranch zou de nieuwe vormgeving dus
niet publiceren. **Er is nu niets gepusht, omgeschakeld of gepubliceerd.**
