# VOC fase 2A — GitHub als bouw- en publicatieplatform

## Uitkomst en onderzoeksgrens

De lokale bouwomgeving is voorbereid en gecontroleerd. GitHub Pages is geschikt
voor de statische VOC-frontend en een gecontroleerde publieke kenniscollectie.
Een private bronrepository kan behouden blijven met een geschikt betaald plan.
Pages zelf voert geen servercode of interactieve AI-backend uit.

Uitgangspunt: fase-1-commit `43cabb6fec2f2af365b9051806fbfa87d6becada`.
Lokale branch: **`codex/github-publishing`**. De code wordt lokaal gecommit;
`git log codex/github-publishing --oneline` toont de oplevercommits.

Alleen lokale bestanden zijn gewijzigd. GitHub is uitsluitend via GET-verzoeken
onderzocht; geen push, workflowrun, Pages-activering, zichtbaarheidwijziging,
environmentwijziging of aankoop. Geen SSH, VPS-, DNS-, certificaat- of
Nginx-wijzigingen in fase 2A.

## 1. Pages, abonnement en kosten

GitHub Free biedt Pages voor publieke repositories. Private repositories kunnen
Pages gebruiken met Pro, Team of Enterprise. De onderzochte repository is privé
en eigendom van een persoonlijk account: Pro is daarvoor de passende reguliere
route; een Team-abonnement is voor een organisatie. De gepubliceerde site is
openbaar; private site-toegang vraagt een Enterprise Cloud-organisatie. De
repository hoeft dus niet openbaar te worden gemaakt.
[Officiële beschikbaarheid](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages),
[abonnementen](https://docs.github.com/en/get-started/learning-about-github/githubs-plans).

De beschikbare API geeft geen abonnementsnaam terug. De Pages-API retourneert
404; dat bewijst niet of Pages ontbreekt, het plan ontoereikend is of het token
onvoldoende leesrechten heeft. Abonnement en concrete Pages-inrichting blijven
daarom vóór activering te verifiëren.

| Kostensoort                | Bevinding                                                                                                             |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| GitHub Free                | $0, maar onvoldoende voor Pages uit deze private repository                                                           |
| GitHub Pro                 | Betaald persoonlijk plan. Historische officiële referentie: $4/maand; actuele accountprijs/belasting niet vastgesteld |
| GitHub Team                | Publieke prijspagina vermeldt $4 per gebruiker/maand; vereist organisatiecontext                                      |
| Actions private repository | Verbruik boven inbegrepen compute/opslag kan extra kosten veroorzaken                                                 |
| Domein                     | Bestaande registrarvergoeding blijft bestaan                                                                          |
| Pages HTTPS                | Ondersteund door Pages; geen eigen Certbot-inrichting nodig                                                           |

De oude officiële Pro-prijs is geen actuele offerte. Controleer Licensing vóór
een eventuele aankoop. De actuele billingdocumentatie noemt $12 inbegrepen
compute per maand voor Free en $18 voor Pro/Team. Dit is verbruiksbudget, geen
abonnementsprijs. De workflow gebruikt Linux, korte artifactretentie en een
timeout; er zijn geen uitgaven of budgets ingesteld.
[Prijsvergelijking](https://github.com/pricing),
[historische Pro-prijs](https://docs.github.com/en/get-started/learning-about-github/faq-about-changes-to-githubs-plans),
[actuele verbruiksbundels](https://docs.github.com/en/billing/reference/product-usage-included),
[Actions-kosten](https://docs.github.com/en/billing/concepts/product-billing/github-actions).

Pages heeft een limiet van 1 GB gepubliceerde inhoud en een zachte limiet van
100 GB verkeer per maand. Grote toekomstige bronarchieven moeten hiertegen
worden begroot; de volledige 98 bronbestanden zijn in fase 2A niet gekopieerd.
[Officiële limieten](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits).

## 2. Ontworpen architectuur

```text
Mac → private GitHub-repository → read-only Actions build en tests
                                      ↓
                              privé build-artifact
                                      ↓ uitsluitend na expliciete activering
                         handmatige publicatie van exacte main-SHA
                                      ↓
                              publieke GitHub Pages
```

Automatische builds en publieke publicatie zijn bewust gescheiden. Een push of
pull request kan later wel een build maken, maar publiceert geen website. Het
build-artifact blijft onder de toegangsrechten van de private repository.

Alternatief: dezelfde Actions-build levert een gecontroleerd artifact aan een
afzonderlijke, handmatig goedgekeurde VPS-release. Bouw nooit op de kleine VPS.
Gebruik dan een beperkte deployidentiteit, vaste SSH-hostsleutel, manifest,
back-up, atomische installatie en code-rollback. Dat alternatief is onderzocht,
maar niet als uitvoerbaar VPS-deployscript toegevoegd.

## 3. Workflows en blokkering van publicatie

### Actieve workflow na een toekomstige goedgekeurde push

`.github/workflows/build.yml`:

1. Checkout met `persist-credentials: false`.
2. pnpm 10.30.2 en Node uit `.node-version` (26.0.0).
3. `pnpm install --frozen-lockfile --ignore-scripts`.
4. Workflowveiligheidstests, broncontrole en dependency-audit.
5. TypeScript en productiebuild.
6. Passende Chromium-versie installeren op de tijdelijke GitHub-runner.
7. Alle 32 browsercontroles op de zojuist gebouwde uitvoer.
8. Artifactcontrole en upload van uitsluitend `dist/`, met drie dagen retentie.

De matrix controleert `/` en `/voc-frontend/`. Rechten: alleen `contents: read`.
Er zijn geen Pages-, OIDC-, repositoryschrijf- of VPS-rechten. Geen secrets
worden aan de applicatie doorgegeven. Alle externe Actions zijn op volledige,
via de officiële repository geverifieerde commit-SHA's vastgezet.

### Inactief Pages-sjabloon

`.github/workflow-templates/pages-publish.yml.disabled` staat buiten de
uitvoerbare workflowmap en is geen actieve workflow. Na afzonderlijke
activering ondersteunt het uitsluitend `workflow_dispatch`, met:

- repository `wiard/voc-frontend` en branch `main`;
- repositoryvariabele `VOC_PAGES_ENABLED=true`;
- letterlijk `PUBLISH VOC PUBLICLY` als bevestiging;
- een volledige goedgekeurde commit-SHA die exact gelijk is aan de run-SHA;
- succesvolle herbouw, audit en tests vóór artifact-upload;
- een afzonderlijke deployjob met `needs: build` en environment `github-pages`;
- alleen die deployjob krijgt `pages: write` en `id-token: write`.

`configure-pages` heeft expliciet `enablement: false`. Er wordt geen Pages-site
automatisch aangemaakt. De deployjob voert geen broncode of installaties uit.
Er zijn geen `push`-, `workflow_run`- of PR-publicatietriggers.

Let op: required reviewers voor environments in private repositories zijn
volgens GitHub niet beschikbaar op Free/Pro/Team. Een environmentnaam alleen
is dus geen gegarandeerde tweede goedkeuringsstap. De handmatige dispatch,
commitcontrole en uitgeschakelde template zijn de huidige bescherming;
Enterprise-bescherming kan later aanvullend worden ingericht.
[Pages-workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages),
[environmentbeperkingen](https://docs.github.com/en/actions/reference/workflows-and-actions/deployments-and-environments).

## 4. Routes, domein en behoud van dossiers

`VOC_BASE_PATH` bepaalt de Vite-assetbasis. Standaard is dat `/`, geschikt voor
`vocpartij.nl`. Voor de normale project-URL
`https://wiard.github.io/voc-frontend/` is dit `/voc-frontend/`. De browsertests
gebruiken dezelfde basis, inclusief favicon en ankerlinks.

Een toekomstige domeinkoppeling vraagt afzonderlijke toestemming:

1. Domeineigendom verifiëren en de custom domain in GitHub instellen voordat
   de verkeersrecords worden omgezet.
2. Voor apex `vocpartij.nl` de dan actuele Pages A-records of ondersteunde
   ALIAS/ANAME gebruiken; `www` als CNAME naar `wiard.github.io`, zonder repopad.
3. Eventuele oude conflicterende A/AAAA-records gecontroleerd vervangen.
4. Certificaatuitgifte afwachten, HTTPS afdwingen en beide namen controleren.
5. DNS-terugval naar de bestaande VPS voorbereiden vóór omschakeling.

Bij custom Actions-publicatie wordt de custom domain in Pages-instellingen
beheerd; een `CNAME`-bestand is niet nodig. Er is nu geen CNAME toegevoegd.
[Domeinprocedure en actuele adressen](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site),
[HTTPS](https://docs.github.com/en/pages/getting-started-with-github-pages/securing-your-github-pages-site-with-https).

De huidige frontend bevat de bestaande dossierpagina's nog niet. Bewaar in de
volgende fase alle bestaande `.html`-paden, ankers en benodigde bestanden.
Een build van alleen deze homepage mag het bestaande domein niet overnemen.
Pages biedt geen configureerbare Nginx-SPA-fallback: gebruik echte statische
pagina's/gegenereerde routes of expliciete hash-routes voor toekomstige
clientnavigatie. Een algemene 404-omleiding is geen volwaardige vervanging voor
de bestaande dossiers. Default Pages-projectpublicatie zou al publiek zijn,
ook voordat DNS is omgezet.

## 5. Beveiligingsbevindingen

- De initiële registry-audit meldde zeven Vite 8.0.5-advisories: één hoog,
  vijf middel en één laag. Gerichte update naar **Vite 8.1.7** verhelpt deze.
  Geen hoofdversie-upgrade. React, Tailwind, TypeScript en pnpm behouden.
  [Officiële Vite-advisory](https://github.com/vitejs/launch-editor/security/advisories/GHSA-587h-7wmj-h5pm).
- Herhaalde `pnpm audit --audit-level=low`: **geen bekende kwetsbaarheden**.
- Heuristische controle van werkbestanden en de twee beschikbare historische
  commits (28 tekstbestandsversies): geen herkenbare sleutels, tokens,
  wachtwoorden of private keys aangetroffen. Waarden worden nooit geprint.
- Publicatiecontrole weigert interne bestanden, verborgen bestanden, symlinks,
  source maps, herkenbare secrets en ontbrekende/onjuiste assetverwijzingen.
- Het artifact bevat alleen HTML, gebundelde JavaScript/CSS en favicon.
  Documentatie, Git-historie, tests, `node_modules`, `.env` en workflows gaan
  niet naar Pages. De toegestane bestandenscope moet bij fase 2B bewust worden
  uitgebreid en opnieuw gecontroleerd.
- Alles wat in toekomstige browserbundels, `public/` of gepubliceerde JSON
  terechtkomt, is openbaar. Ook `VITE_*`-variabelen zijn geen opslagplaats voor
  geheimen. Geheime AI-sleutels horen uitsluitend in een backend.
- Google Fonts en Unsplash blijven externe netwerkafhankelijkheden. De
  browsercontrole heeft beide succesvol geladen; dit is geen offline-garantie.
- Er zijn geen privégebruikersrecords aangetroffen in deze frontend. Lokale
  auteursmetadata en documentatie blijven privé zolang alleen `dist/` wordt
  gepubliceerd. Een patrooncontrole/audit is geen volledige security-audit.

## 6. Lokale controles

| Controle                           | Resultaat                                     |
| ---------------------------------- | --------------------------------------------- |
| Node/pnpm                          | 26.0.0 / 10.30.2                              |
| Frozen installatie na wijziging    | Geslaagd, ook offline met `--ignore-scripts`  |
| TypeScript                         | Geslaagd                                      |
| Workflow/goedkeuring/artifacttests | 14 geslaagd                                   |
| Productiebuild `/`                 | Geslaagd                                      |
| Productiebuild `/voc-frontend/`    | Geslaagd                                      |
| Browsercontroles `/`               | 32 geslaagd                                   |
| Browsercontroles `/voc-frontend/`  | 32 geslaagd                                   |
| Artifactcontrole beide bases       | Geslaagd; alleen vier bedoelde buildbestanden |
| Dependency-audit na herstel        | Geen bekende kwetsbaarheden                   |
| Bron- en historiecontrole          | Geen gematchte geheimen                       |

Dit zijn lokale Chrome-tests op macOS, plus YAML- en veiligheidstests. Er is
geen echte GitHub-hosted Linux-run of Pages-publicatie uitgevoerd. De
CI-browserinstallatie en GitHub-permissies blijven pas na een goedgekeurde push
op GitHub te verifiëren. De bestaande Node-deprecatiewaarschuwing blokkeert de
build niet. Er zijn geen blokkerende lokale fouten over.

Zelf reproduceren:

```sh
pnpm install --frozen-lockfile --ignore-scripts
pnpm test:publishing
pnpm check:sources
pnpm typecheck
pnpm build
pnpm check:dist
PLAYWRIGHT_USE_EXISTING_BUILD=1 pnpm test
VOC_BASE_PATH=/voc-frontend/ pnpm build
VOC_BASE_PATH=/voc-frontend/ pnpm check:dist
VOC_BASE_PATH=/voc-frontend/ PLAYWRIGHT_USE_EXISTING_BUILD=1 pnpm test
```

De Ubuntu-runner installeert de bij Playwright passende Chromium-versie,
terwijl lokaal de al aanwezige Chrome wordt gebruikt.
[Officiële Playwright CI-inrichting](https://playwright.dev/docs/ci).

## 7. Pages tegenover de eigen VPS

| Aspect          | GitHub Pages                                                                             | Actions-build naar eigen VPS                                                   |
| --------------- | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| Kosten          | Passend privaat-repoplan, Actions-verbruik en domein                                     | Bestaande VPS-kosten, Actions-verbruik en domein; bedrag niet onderzocht       |
| Veiligheid      | Geen eigen webserverbeheer; openbare artifacts blijven openbaar                          | Meer controle over headers en toegang, maar ook eigen patch- en sleutelbeheer  |
| Onderhoud       | GitHub beheert statische hosting en HTTPS                                                | Eigen Nginx, certificaten, monitoring, schijfruimte en back-ups                |
| Betrouwbaarheid | Hosting afhankelijk van GitHub en Pages-limieten                                         | Afhankelijk van eigen VPS en herstelvoorzieningen; builds belasten de VPS niet |
| Techniek        | Statisch; geen eigen requesthandlers of volledige serverconfiguratie                     | Dynamische API, eigen headers, redirects en toegangsregels mogelijk            |
| AI              | Browserrekenen en vooraf gepubliceerde uitkomsten; geheime/live AI vraagt aparte backend | Beveiligde AI-API mogelijk, mits apart ontworpen en beheerd                    |

Dit is een technische afweging, geen gemeten uptimevergelijking. Geen
hostingvorm maakt automatisch de onderliggende datasets correct of privé.

## 8. Benodigde handelingen en advies

Na expliciete toestemming voor GitHub-wijzigingen: branch pushen, PR beoordelen,
CI op GitHub uitvoeren en de geslaagde branch naar main brengen. Zet niet
meteen Pages aan. Integreer eerst de volledige bestaande kennisbasis, behoud
alle publieke URL's en beoordeel de publiceerbare dataset/bronnencollectie.

Daarna, uitsluitend na publicatietoestemming: plan en Actions-budget verifiëren;
Pages-bron op GitHub Actions instellen; environment met branchbeperking inrichten;
het sjabloon bewust als `.github/workflows/pages-publish.yml` activeren en
reviewen; variabele `VOC_PAGES_ENABLED=true` zetten; de goedgekeurde main-SHA
handmatig dispatchen met de letterlijke bevestiging. Elke volgende publicatie
blijft handmatig. DNS-overgang is een afzonderlijke laatste stap.

**Advies:** behoud de private repository en gebruik GitHub Actions als
reproduceerbare bouwlaag voor beide hostingopties. Pages is een goede toekomstige
keuze voor het publieke statische kennisportaal wanneer abonnement,
bronomvang en routes zijn gecontroleerd. Ontwerp eventuele interactieve AI en
echte formulieren als afzonderlijke backend. Vervang de bestaande VPS-site pas
nadat fase 2B inhoudsbehoud en integratie heeft bewezen.

Fase 2A is lokaal geslaagd. Geen publicatie is uitgevoerd.

Implementatiecommit: **`72aff99c1efdf340c530869a1d80a3c4c73292dd`**
(`Prepare read-only GitHub CI and gated Pages publication template`). Deze
commit bevat de geteste code en het rapport; de opvolgende documentatiecommit
legt deze identifier vast. `main` blijft ongewijzigd op `2074e55`.
