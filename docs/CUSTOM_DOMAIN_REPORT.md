# VOC — publicatie op nieuw.vocpartij.nl

Datum: 15 november 2026, Europe/Amsterdam.

## Publicatie

Website: **https://nieuw.vocpartij.nl/**.

De root-build is gepubliceerd via de bestaande GitHub Actions-workflow.
De daadwerkelijke website geeft HTTP 200 en alle **72 publieke browsertests**
op het nieuwe domein zijn geslaagd.

- Branch: `codex/voc-pages-test`.
- Publicatieconfiguratiecommit: `e9ef85bfe392deb73f262defca4568855f70642f`.
- Ongewijzigde websitebron: `56a7f8c91ac6567e40690b6db8e7680876026c32`.
- `main` blijft `2074e55259d5798979cb2ea12b3b40d187598a9f`.

[Publicatierun 43756758084](https://github.com/wiard/voc-frontend/actions/runs/43756758084):
`build` en `deploy` geslaagd.

[CI-run 43756758041](https://github.com/wiard/voc-frontend/actions/runs/43756758041):
zowel `build (domain, /)` als `build (project, /voc-frontend/)` geslaagd.

## GitHub Pages en HTTPS

Bij hervatting was `nieuw.vocpartij.nl` al als custom domain ingesteld en was
het certificaat door GitHub goedgekeurd. `https_enforced` stond nog op `false`.
Die instelling is gewijzigd naar `true`, nadat HTTPS daadwerkelijk werkte.

Actuele instellingen:

| Instelling             | Waarde                                               |
| ---------------------- | ---------------------------------------------------- |
| Publicatiebron         | GitHub Actions (`build_type: workflow`)              |
| Custom domain          | `nieuw.vocpartij.nl`                                 |
| Publiek adres          | `https://nieuw.vocpartij.nl/`                        |
| Enforce HTTPS          | Ingeschakeld                                         |
| Certificaat            | GitHub-status `approved`, voor `nieuw.vocpartij.nl`  |
| Certificaatvervaldatum | 13 februari 2027 volgens de GitHub API               |
| Deploymentomgeving     | Bestaande `github-pages`, bestaande publicatiebranch |

Er is geen nieuw `CNAME`-bestand nodig: bij publicatie met een custom Actions-
workflow gebruikt GitHub Pages de domeininstelling; zo'n bestand wordt genegeerd.
[Officiële GitHub-documentatie](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site).

## Rootpad, routes en statische bestanden

De bestaande Vite-configuratie ondersteunt al `VOC_BASE_PATH`, standaard `/`.
Alleen de publicatieworkflow is op `/` gezet. Het pinnen van de goedgekeurde
websitebron is behouden. De workflow controleert nu exact de Pages-host
`nieuw.vocpartij.nl` en een leeg Pages-basispad voordat hij bouwt/publiceert.
Een oud of ander publicatiedoel wordt geweigerd.

De gepubliceerde HTML gebruikt `/assets/...` en `/favicon.png`, zonder het
oude projectprefix `/voc-frontend/`. JavaScript en CSS laden correct.

De React-interface gebruikt sectieankers en `import.meta.env.BASE_URL` voor
dossier-, data- en afbeeldingslinks. Er is geen React Router met history-routes
of serverherschrijving nodig. De bestaande statische `.html`-dossiers en het
oude laboratorium blijven op hun eigen root-URL's beschikbaar. Oude
homepage-ankers verwijzen correct naar `over-voc.html#...`.

React-code, teksten, CSS, dependencies en de 25 oorspronkelijke kennisbestanden
zijn niet gewijzigd. Alle oorspronkelijke publieke bestanden zijn via het
nieuwe domein bytegetrouw tegen hun SHA-256-manifest gecontroleerd.

## Tests

| Controle                                                                 | Resultaat                                            |
| ------------------------------------------------------------------------ | ---------------------------------------------------- |
| Lokale root-build: `VOC_BASE_PATH=/ pnpm check`                          | Geslaagd                                             |
| Node-publicatiecontroles                                                 | 16 geslaagd, inclusief geweigerde verkeerde domeinen |
| Node-kenniscontroles                                                     | 10 geslaagd, inclusief 1.000 modelscenario's         |
| TypeScript, broncontrole en artifactcontrole                             | Geslaagd                                             |
| Lokale browsertests op rootpad                                           | 60 geslaagd                                          |
| Aangepaste publieke testgevallen op het oude testadres vóór omschakeling | 12 geslaagd                                          |
| Volledige publieke suite op `https://nieuw.vocpartij.nl/`                | **72 geslaagd**, geen retries of overgeslagen tests  |

Publiek getest op 320, 390, 768 en 1440 pixels:

- HTTPS, host, rootpad en certificaatgeldigheid;
- homepage, navigatie, toegankelijkheid en mobiele weergave;
- JavaScript, CSS, afbeeldingen, lettertypen en consolefouten;
- alle 11 dossierdocumenten, oude homepage-ankers en 25 originele bestanden;
- alle 54 datasets geselecteerd en weergegeven;
- zoeken, bronregister en voorstellenstatus;
- belastinglaboratorium, vergelijking met de oorspronkelijke uitkomsten en invoergrenzen;
- geen ongewenste opslag, inzendingen of AI-verzoeken bij de geteste demo-interacties;
- ontwikkelbestanden zijn niet als websitebestanden toegankelijk.

De publieke testconfiguratie is instelbaar met `VOC_PUBLIC_BASE_URL`. Alleen de
oude Pages-test-URL en het nieuwe HTTPS-subdomein zijn toegestaan; de bestaande
productiewebsite `vocpartij.nl` en `www.vocpartij.nl` worden expliciet geweigerd.

Opnieuw testen:

```sh
cd ~/Projects/voc-frontend
VOC_BASE_PATH=/ pnpm check
VOC_PUBLIC_BASE_URL=https://nieuw.vocpartij.nl/ pnpm exec playwright test --config playwright.public.config.mjs
```

Het lokale HTML-testrapport staat in `playwright-report/public/index.html` en is
niet opgenomen in Git of de website-uitvoer.

## DNS: uitsluitend gelezen

Gecontroleerd via de lokale resolver, Cloudflare, Google en beide autoritatieve
Hostnet-nameservers. Tijdens de voorbereiding veranderde de zichtbare DNS van
het oude VPS-adres naar `nieuw.vocpartij.nl CNAME wiard.github.io.`; er zijn door
deze uitvoering geen DNS-wijzigingen gedaan.

Bij de controle van 21:11 CET gaven beide Hostnet-nameservers, de lokale resolver
en Google het juiste CNAME terug. Cloudflare gaf voor de A-query eveneens de
juiste CNAME-keten naar GitHub Pages, maar zijn afzonderlijke CNAME/AAAA-query
had toen nog een leeg gecachet antwoord. De CNAME-TTL bij Hostnet is 14.400 seconden.
IPv4 en IPv6 volgen de CNAME naar GitHub Pages; er is geen afzonderlijk
VPS-AAAA-record nodig. Het bestaande wildcard-A-record en de A/CNAME-records
voor `vocpartij.nl` en `www.vocpartij.nl` zijn niet gewijzigd.

## Doorverwijzingen

De oorspronkelijke homepage `https://wiard.github.io/voc-frontend/` verwijst met
HTTP 301 naar `https://nieuw.vocpartij.nl/`. Echte Chrome-navigatie bevestigde
één directe HTTPS-redirect, vervolgens HTTP 200 en een zichtbare kennisbank.

Ook `feiten.html`, `laboratorium.html` en `data/statistieken.json` onder het
oude projectpad verwijzen met HTTP 301 naar hetzelfde pad op het nieuwe
HTTPS-domein en eindigen op HTTP 200 met geldige TLS-verificatie.
`http://nieuw.vocpartij.nl/` verwijst met HTTP 301 naar HTTPS.

Kort na de deployment gaven sommige GitHub-CDN-cachevarianten nog de oude
homepage of een extra HTTP-redirect terug. Deze overgang is afgewacht. De
afsluitende browsercontrole bevestigde de directe juiste HTTPS-redirect.
Er zijn geen aanvullende redirects in React, DNS of Nginx toegevoegd.

## Gewijzigde bestanden en grenzen

1. `.github/workflows/pages-test.yml` — rootpad en controle op het exacte custom domain.
2. `playwright.public.config.mjs` — selecteerbaar publiek testadres met productiebescherming.
3. `tests/public-site.check.ts` — host en pad volgen het gekozen testadres.
4. `tests/publishing.test.mjs` — regressiecontrole van domein- en workflowbeveiliging.
5. `docs/CUSTOM_DOMAIN_REPORT.md` — dit rapport.

De wijzigingen lossen het laden van middelen op het custom domain op en maken
hetzelfde ontwerp en dezelfde kennisbasis bereikbaar vanaf de domeinroot.
De enige gewijzigde GitHub-instelling in deze uitvoering is Enforce HTTPS.
De bestaande workflow publiceerde alleen het gecontroleerde `dist/`-artifact.

Geen wijzigingen aan `main`, andere repositories, DNS, VPS Murende, Nginx of de
bestaande website `vocpartij.nl`. Geen software of betaalde diensten toegevoegd.

## Afronding

Geen resterende functionele problemen of noodzakelijke Pages-instellingen
vastgesteld. De nieuwe website is volledig bereikbaar en getest. De bestaande
demo-beperkingen blijven zoals beschreven in het fase-2D-rapport; er is geen
nieuwe nieuwsbrief-, inzend- of AI-functionaliteit toegevoegd.

Het rapport wordt apart op dezelfde branch vastgelegd met `[skip ci]`; dit
verandert het gepubliceerde artifact niet en start geen nieuwe deployment.
