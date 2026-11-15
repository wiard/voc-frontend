# VOC fase 2B — integratie van de bestaande publieke kennisbasis

## Uitkomst

De beschikbare publieke VOC-kennisbasis is lokaal geïntegreerd in de nieuwe
React-frontend, met behoud van de Figma-vormgeving als ingang, alle oorspronkelijke
inhoud en de oorspronkelijke rekenlogica. De homepage ontsluit zeven onderdelen:
Beginselen, Werkwijze, Laboratorium, Transparantie, Historische dossiers,
Jouw straat en AI-experiment.

De integratie gebruikt een hybride aanpak: een nieuwe React-kennisbank en
belastinginterface, plus de volledige oorspronkelijke dossierpagina's als
leesversie op hun bestaande URL's. Hun eigen vormgeving, grafieken, filters,
argumentweging en uitvoeringsroutes zijn behouden. Er is geen inhoudelijke
herschrijving van politieke teksten of historische dossiers uitgevoerd.

**Belangrijke grens:** het opgegeven ruwe archief van 98 bronbestanden is niet
meegeleverd in de publieke export en is niet volledig verifieerbaar. Wel zijn
alle beschikbare publieke gegevens en bronverwijzingen behouden. Dit is geen
volledige migratie van de afgeschermde ontwikkelomgeving.

## 1. Herkomst en geïntegreerde bestanden

- Werkmap: `/Users/wiardvasen/Projects/voc-frontend`.
- Read-only bron: `murende:/var/www/vocpartij.nl`.
- Snapshot opgehaald: **15 november 2026, 13:15:01 UTC**.
- Omvang oorspronkelijke snapshot: **25 bestanden, 2.820.530 bytes**.
- Originele bestanden: `knowledge/original/`.
- Bestandspaden, oorspronkelijke grootte en SHA-256: `knowledge/manifest.json`.
- Broncommit: **`c4928bd930593a363645255c77132dff07e4ab0a`**.

Er is alleen uit de publieke VOC-webroot gelezen en lokaal geschreven. Geen
sudo, geen poging tot toegang tot `/home/vocdev/voc-nieuw`, geen onderzoek naar
andere websites, geen productie- of configuratiewijziging. De laatste read-only
SHA-256-controle op de VPS bevestigt: alle 25 bestanden zijn gelijk aan de
oorspronkelijke snapshot; nul gewijzigde paden.

| Bestandsgroep          | Behouden inhoud                                                             |
| ---------------------- | --------------------------------------------------------------------------- |
| 11 HTML-pagina's       | Home/projectopzet en tien inhoudelijke bestemmingen                         |
| 6 JSON-bestanden       | Statistieken, voorstellen, modeldefinitie en bestaande instellingen         |
| 2 JavaScript-bestanden | Bestaande grafieken/filters en belastingmodel met oorspronkelijke interface |
| 1 stylesheet           | Oorspronkelijke dossieropmaak                                               |
| 5 afbeeldingen/SVG's   | Inclusief de bestaande AI-poster, landschap, molen en schip                 |

De originele bestanden zijn niet aangepast. `scripts/prepare-knowledge.mjs`
controleert hun hashes en maakt reproduceerbaar lokale publicatiekopieën,
catalogus, zoektekst en een pure rekenmodule. Deze gegenereerde bestanden zijn
buildproducten en worden niet handmatig bewerkt. Dev, typecheck, build en
browsertests voeren deze voorbereiding automatisch uit.

## 2. Datasets en betrouwbaarheid

Alle **54 datasetonderdelen** uit `data/statistieken.json` zijn beschikbaar in
de React-kennisbank. Daarvan bevat één onderdeel, `staatsschuld_rijk`, bewust geen
cijferreeks. Er zijn geen waarden voor ingevuld of geschat.

De interface biedt zoeken, datasetkeuze en volledige scrollbare gegevenstabellen.
Zij behoudt:

- oorspronkelijke bron-URL, bronnaam en tabelnummer;
- meetperiode en datum van ophalen/bijwerken, waar vermeld;
- originele waarden, eenheid, schaalfactor en decimaalinstelling;
- status en peildatum per waarde;
- voorlopige jaren en bronvlaggen;
- toelichtingen, afgeleide formules en afhankelijkheden;
- ontbrekende waarden als ontbrekend, niet als nul.

Oorspronkelijke brondata en VOC-berekeningen zijn verschillend gelabeld.
Bronbestandsnamen blijven in het bronregister beschikbaar. Het oorspronkelijke
JSON-bestand kan rechtstreeks worden gedownload.

De oorspronkelijke pagina's vermelden een controledatum van hun versie. Die
wordt niet omgedoopt tot publicatiedatum. Waar publicatiedatums ontbreken,
vermeldt de catalogus `null` en de interface **niet vermeld**.

## 3. Bronregister: aantallen en ontbrekend archief

| Begrip                               | Gecontroleerd aantal | Betekenis                                                                     |
| ------------------------------------ | -------------------- | ----------------------------------------------------------------------------- |
| Unieke bronverwijzingen              | **125**              | URL's uit de oorspronkelijke pagina's en datasetmetadata, met gebruikscontext |
| Unieke ruwe bronbestandsverwijzingen | **49**               | Bestandsnamen die in de datasetmetadata voorkomen                             |
| Opgehaald volledig ruw bronarchief   | **0**                | De ruwe downloads staan niet in de publieke webroot                           |
| Opgegeven archiefomvang              | **98**               | Context uit de opdracht; niet volledig te reconstrueren uit deze export       |

Deze aantallen meten verschillende dingen. De interface noemt 125 URL's geen
125 onafhankelijke onderzoeken en doet niet alsof de 49 bestandsverwijzingen
49 beschikbare downloads zijn. Geen ontbrekende bestandsnamen of datums zijn
verzonnen. Een niet-beschikbaar bestand krijgt geen kapotte downloadlink.

Het bronregister ondersteunt zoeken, externe bronlinks met
`noopener noreferrer`, gekoppelde dossiers/datasets, beschikbare metadata en
inzage in alle 49 geregistreerde bestandsverwijzingen. De catalogus is ook als
`data/knowledge-catalog.json` beschikbaar. De inhoud/actualiteit van alle
externe bronwebsites is niet opnieuw onafhankelijk onderzocht.

## 4. Dossiers, historische onderzoeken en politieke uitgangspunten

Alle elf oorspronkelijke documenten zijn op volledige hoofdtekst doorzoekbaar.
Zoeken op bijvoorbeeld **Spinoza** vindt het historische dossier. Zoekfragmenten
zijn letterlijke tekstselecties; er worden geen AI-samenvattingen gemaakt.

De behouden inhoud omvat financiën, kennis/onderwijs, bestuur, feitentoetsen,
geschiedenis, internationale oriëntatie, mensen/uitgangspunten, voorstellen,
documentenregister, laboratorium en de oorspronkelijke AI-projectopzet.

De oorspronkelijke drie Figma-beginselen blijven staan. Hun uitwerkingslinks
verwijzen nu naar passende bestaande passages. De volledige politieke grondslag
is behouden in de oorspronkelijke homepage en de inhoudelijke dossiers. De
werkwijze verwijst naar de bestaande onderzoeksmethode, rekenregels en grondslag.

## 5. Voorstellen

De drie oorspronkelijke voorstellen zijn volledig beschikbaar, inclusief datum,
onderdelen, argumenten voor en tegen en verwijzingen naar hun volledige dossiers:

1. Minder en eenvoudiger fiscale regelingen.
2. Meer onderwijstijd voor basisvaardigheden.
3. Een uitvoeringstoets en evaluatie bij elke nieuwe wet.

De status blijft **ter beoordeling**. De oorspronkelijke toelichting
**Geen VOC-standpunten** en de ontbrekende doorrekeningen blijven zichtbaar.
Interne bronbestandsnamen uit de JSON worden niet als bestaande publieke
HTML-pagina's gepresenteerd; de links openen de werkelijke dossierverwijzingen.

## 6. Belastinglaboratorium

`src/knowledge/TaxLab.tsx` biedt een React-interface rond de oorspronkelijke
pure functies `eenheden` en `bereken`. De generator neemt hun tekst letterlijk
over uit de geverifieerde oorspronkelijke `js/laboratorium.js`; de oude
DOM-aansturing wordt niet in de React-boom uitgevoerd.

De nieuwe interface ondersteunt twee scenario's, één tot vier schijven, een
belastingvrije voet en drie bruto inkomens. Wijzigingen verbergen oude uitkomsten
tot opnieuw wordt berekend. Ongeldige/aflopende grenzen geven geen resultaat.
Oefenwaarden kunnen worden hersteld. Rekeninvoer blijft uitsluitend in het
geheugen van de browser: geen opslag, verzending, bestelling of financiële
transactie.

De modelversie, modeldatum, formule, fictieve oefentarieven en alle uitsluitingen
uit `data/laboratorium.json` blijven zichtbaar. Dit is geen werkelijk Nederlands
belastingstelsel of landelijke begrotingsdoorrekening. De oorspronkelijke
laboratoriumpagina, uitvoeringsroutes, JSON-definitie en JavaScript blijven
rechtstreeks bereikbaar.

Vaste voorbeeldnetto's zijn behouden:

| Bruto inkomen | Netto scenario 1 | Netto scenario 2 |
| ------------- | ---------------- | ---------------- |
| € 24.000      | € 19.200         | € 20.500         |
| € 48.000      | € 35.700         | € 38.500         |
| € 90.000      | € 61.000         | € 64.000         |

Duizend deterministische synthetische scenario's komen overeen met zowel het
oorspronkelijke model als een onafhankelijke BigInt-berekening in centen.
Aanvullende tests controleren grensbedragen, belastingvrije voet, nul, maximale
invoer, halve-centafronding en foutieve invoer. De browser vergelijkt bovendien
de gerenderde React-uitkomst met de ongewijzigde oorspronkelijke interface.

## 7. Behoud van bestaande URL's

De volgende bestemmingen blijven als echte statische bestanden beschikbaar:

`laboratorium.html`, `financien.html`, `kennis.html`, `bestuur.html`,
`feiten.html`, `ideeenplein.html`, `geschiedenis.html`, `mensen.html`,
`bondgenoten.html` en `nieuws.html`.

`/` en `/index.html` openen de nieuwe React-homepage. De oorspronkelijke
homepage blijft volledig op **`over-voc.html`** staan. Oude homepage-ankers,
zoals `/index.html#republiek-ai`, verwijzen in de React-interface automatisch
naar hetzelfde anker in die leesversie. Dat ankerherstel vereist JavaScript;
de oorspronkelijke leesversie zelf blijft rechtstreeks zonder React leesbaar.

Alle oorspronkelijke interne links, fragmenten, scripts en stylesheets zijn
gecontroleerd. De AI-poster en overige middelen zijn bytegetrouw behouden.
Dit werkt zowel op `/` als onder `/voc-frontend/`.

De publicatiecontrole gebruikt het volledige snapshotmanifest, niet alleen een
afhankelijkhedengraaf vanaf de homepage. Zij weigert ontbrekende of gewijzigde
oorspronkelijke publieke bestanden. De latere build bevat **31 bestanden**,
circa **3,9 MB**. De Pages-publicatiestap blijft uitgeschakeld; er is geen DNS-
of hostingwijziging uitgevoerd.

## 8. Testresultaten en opgeloste problemen

| Controle                                     | Definitief resultaat                                                                                |
| -------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| TypeScript en productiebuild                 | Geslaagd                                                                                            |
| Frozen lockfile-installatie                  | Geslaagd, ook offline met installatiescripts uitgeschakeld                                          |
| Publicatieveiligheid                         | 14 Node-tests geslaagd                                                                              |
| Kennis en modelregressie                     | 10 Node-tests geslaagd, inclusief 1.000 scenario's                                                  |
| Browserregressie domeinpad `/`               | **60/60 geslaagd**                                                                                  |
| Browserregressie projectpad `/voc-frontend/` | **60/60 geslaagd**                                                                                  |
| Schermbreedtes                               | 320, 390, 768 en 1440 pixels                                                                        |
| Publieke bestanden via lokale HTTP           | Alle 25 oorspronkelijke bestanden bytegetrouw, inclusief de homepage-leesversie                     |
| Oude dossier-URL's en homepage-ankers        | Alle gecontroleerde bestemmingen werken                                                             |
| Console, afbeeldingen en imports             | Geen fouten in de geslaagde suite                                                                   |
| Backend-/opslagverkeer                       | Geen formulier-/AI-verzoeken, cookies, localStorage of sessionStorage vanuit de geteste interacties |
| Dependency-audit                             | Geen bekende kwetsbaarheden na de gerichte fase-2A-update en toevoeging van de HTML-parser          |
| Read-only productie-eindcontrole             | Alle 25 serverbestanden ongewijzigd                                                                 |

De eerste browserronde ontdekte een onduidelijke labelkoppeling bij de dataset-
keuzelijst. Die is hersteld met een expliciet label en getest. Een aanvullende
visuele controle ontdekte drie afgekapte koppen op 320 pixels, waaronder twee
oorspronkelijke Figma-koppen. Automatische woordafbreking voorkomt dat zonder
tekst, lettertype of kleuren te veranderen. Een nieuwe regressie meet de
daadwerkelijke tekstgrenzen van alle koppen.

Er zijn geen blokkerende lokale fouten over. De bestaande Node 26-tooling meldt
nog een niet-blokkerende `module.register()`-deprecatiewaarschuwing. Dit is geen
volledige WCAG-audit, Safari/Firefox-test of test op fysieke telefoons. GitHub
Actions is alleen lokaal voorbereid/gevalideerd en niet op GitHub uitgevoerd.
Er is geen Pages-, VPS- of andere productiepublicatie getest of uitgevoerd.

## 9. Bestanden en lokale verificatie

Belangrijkste nieuwe onderdelen:

- `knowledge/original/` en `knowledge/manifest.json`: oorspronkelijke kennis.
- `scripts/prepare-knowledge.mjs`: herkomstcontrole en generatie.
- `src/knowledge/KnowledgeHub.tsx`, `TaxLab.tsx`, `types.ts` en
  `tax-engine.d.ts`: kennisweergave en modelinterface.
- `tests/knowledge.test.mjs` en `tests/knowledge.spec.ts`: nieuwe regressie.

Gewijzigd: `src/App.tsx`, `src/index.css`, `package.json`, `pnpm-lock.yaml`,
`.gitignore`, `scripts/publication-checks.mjs`, bestaande tests, beide lokale
workflowbestanden, `README.md` en `AGENTS.md`. De uitgeschakelde Pages-template
is niet geactiveerd. De bestaande fase-1- en fase-2A-rapporten blijven behouden.

Reproduceren:

```sh
cd ~/Projects/voc-frontend
pnpm install --frozen-lockfile --ignore-scripts
pnpm check
VOC_BASE_PATH=/voc-frontend/ pnpm build
VOC_BASE_PATH=/voc-frontend/ pnpm check:dist
VOC_BASE_PATH=/voc-frontend/ PLAYWRIGHT_USE_EXISTING_BUILD=1 pnpm test
pnpm dev
```

De lokale ontwikkelserver is actief op **http://127.0.0.1:5173/** en luistert
uitsluitend op loopback. Playwright beheert zelf de tijdelijke previewserver op
poort 4173. De HTML-testrapportage staat in `playwright-report/index.html`.

## 10. Ontbrekende functionaliteit en toekomstige AI-architectuur

- Het afgeschermde ruwe bronarchief, de oorspronkelijke generators en eventuele
  niet-gepubliceerde dossiers zijn niet gekopieerd. Hiervoor is later een
  afzonderlijk goedgekeurde export nodig; beveiliging is niet omzeild.
- Nieuwsbrief en Jouw straat blijven ontwerpdemonstraties zonder opslag of
  verzending. Privacy/Toegankelijkheid/Broncode in de footer blijven placeholders.
- De effectverkenner blijft herkenbaar fictief en staat los van de echte datasets.
- De volledige dossierleesversies behouden hun oorspronkelijke opmaak; een
  volledige React-herbouw van iedere dossierpagina is geen onderdeel van deze
  behoudende integratie.
- Lettertype en Rijksmuseumfoto blijven externe middelen. Hun compatibiliteit
  met de bestaande VPS-CSP vereist vóór eventuele VPS-publicatie een oplossing.
- Bronregister en tekstzoekfunctie vervangen geen onafhankelijke bronnencontrole,
  historische toetsing of economische/fiscale validatie.

De kennislaag is los van de presentatie opgebouwd: onveranderlijke snapshot →
manifestcontrole → catalogus/model → React-weergave. Voor toekomstige AI kan
dezelfde catalogus gecontroleerde bronidentifiers en passages leveren.
Bewaar AI-uitvoer afzonderlijk met type `ai-generated`, bron- en snapshot-ID's,
modelnaam/versie, generatie- en beoordelingsdatum, onzekerheden en menselijke
goedkeuringsstatus. Laat AI-uitvoer nooit de oorspronkelijke brondata of
politieke vaststelling overschrijven.

Interactie met geheime AI-sleutels vraagt een apart goedgekeurde backend; sleutels
horen niet in React of `VITE_*`. Pages kan de statische frontend en vooraf
beoordeelde uitkomsten hosten, maar geen beveiligde request-backend uitvoeren.
Een toekomstige onderzoeksjob kan los van publicatie werken: onderzoek →
voorstel → menselijke beoordeling → expliciet goedgekeurd artifact. Er is nu
geen AI-API, vectorservice, account of automatische inhoudspublicatie toegevoegd.

## 11. Git en afronding

Branch: **`codex/knowledge-integration`**, gemaakt vanaf de volledig afgeronde
fase-2A-branch `codex/github-publishing` op **`f721e6e`**.
De fase-2A-implementatie staat op **`72aff99`**.
De snapshot staat op **`c4928bd`**. De geteste integratie en dit rapport staan op
**`babaf8b86d5c524bd1d4d636881e6535b120ac04`**
(`Integrate VOC knowledge, preserve dossier URLs and verify original tax model`).
De opvolgende documentatiecommit legt deze identifier vast.
`git log --oneline` toont de volledige lokale reeks.

De laatste read-only GitHub-controle bevestigt dat de repository privé is en
remote `main` nog op **`2074e55259d5798979cb2ea12b3b40d187598a9f`** staat.

**Conclusie:** de beschikbare publieke kennis is zonder verlies geïntegreerd en
lokaal getest. Het niet-beschikbare ruwe archief wordt expliciet als ontbrekend
behandeld. GitHub, de VPS, de bestaande website en DNS blijven ongewijzigd.
Geen push of publicatie. Verdere werkzaamheden wachten op toestemming.
