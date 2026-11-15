import { useState } from "react";
import catalogData from "../../knowledge/generated/catalog.json";
import statisticsData from "../../knowledge/original/data/statistieken.json";
import proposals from "../../knowledge/original/data/voorstellen.json";
import type { Dataset, KnowledgeCatalog } from "./types";

const catalog: KnowledgeCatalog = catalogData;
const statistics = statisticsData as {
  _toelichting: string;
  opgehaald: string;
  datasets: Record<string, Dataset>;
};
const base = import.meta.env.BASE_URL;
const normalize = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("nl");
const matching = (value: string, query: string) =>
  normalize(value).includes(normalize(query.trim()));
const inputClass =
  "mt-2 min-h-12 w-full rounded-xl border-2 border-[#10264b]/25 bg-white p-3 text-[#10264b] focus:outline-2 focus:outline-[#10264b]";

export default function KnowledgeHub() {
  const [datasetQuery, setDatasetQuery] = useState("");
  const [selected, setSelected] = useState("bbp");
  const [documentQuery, setDocumentQuery] = useState("");
  const [sourceQuery, setSourceQuery] = useState("");
  const [showAllSources, setShowAllSources] = useState(false);
  const datasets = Object.entries(statistics.datasets).filter(([id, d]) =>
    matching(`${id} ${d.titel} ${d.bron.naam}`, datasetQuery),
  );
  const active = datasets.find(([id]) => id === selected) || datasets[0];
  const documents = catalog.documents.filter((d) =>
    matching(`${d.title} ${d.category} ${d.text}`, documentQuery),
  );
  const sources = catalog.sources.filter((s) => matching(`${s.title} ${s.url}`, sourceQuery));

  return (
    <section
      id="kennisbank"
      className="bg-[#f5f2e9] px-5 py-24 sm:px-8 lg:py-32"
      aria-labelledby="kennisbank-titel"
    >
      <div className="mx-auto max-w-[1240px]">
        <p className="eyebrow text-[#ff5f3d]">Onderzoek met herkomst</p>
        <h2
          id="kennisbank-titel"
          className="mt-4 text-5xl font-black tracking-[-.05em] md:text-7xl"
        >
          De VOC-kennisbank.
        </h2>
        <p className="mt-6 max-w-3xl text-lg leading-relaxed text-[#10264b]/75">
          Bestaande onderzoeken, cijfers en voorstellen. Bronfeiten, VOC-analyses, politieke
          voorstellen en fictieve oefeningen blijven herkenbaar gescheiden.
        </p>
        <div
          className="mt-8 flex flex-wrap gap-3 text-sm font-extrabold"
          aria-label="Omvang kenniscollectie"
        >
          {[
            `${Object.keys(statistics.datasets).length} datasets`,
            `${catalog.documents.length} dossiers`,
            `${catalog.sources.length} bronverwijzingen`,
            `${proposals.voorstellen.length} voorstellen ter beoordeling`,
          ].map((label) => (
            <span key={label} className="rounded-full bg-[#64d8d4]/30 px-4 py-3">
              {label}
            </span>
          ))}
        </div>

        <div className="mt-12 rounded-[1.75rem] bg-white p-5 md:p-9">
          <h3 className="text-3xl font-black">Datasets en meetgegevens</h3>
          <p className="mt-3 text-sm leading-relaxed text-[#10264b]/70">
            {statistics._toelichting}
          </p>
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <label className="text-sm font-bold">
              Zoek datasets
              <input
                type="search"
                value={datasetQuery}
                onChange={(e) => setDatasetQuery(e.target.value)}
                className={inputClass}
              />
            </label>
            <div>
              <label htmlFor="knowledge-dataset-select" className="text-sm font-bold">
                Kies een dataset
              </label>
              <select
                id="knowledge-dataset-select"
                value={active?.[0] || ""}
                onChange={(e) => setSelected(e.target.value)}
                disabled={!datasets.length}
                className={inputClass}
              >
                {!datasets.length && <option value="">Geen datasets gevonden</option>}
                {datasets.map(([id, d]) => (
                  <option key={id} value={id}>
                    {d.titel} ({id})
                  </option>
                ))}
              </select>
            </div>
          </div>
          <p role="status" className="mt-3 text-sm">
            {datasets.length} datasets gevonden.
          </p>
          {active && <DatasetView id={active[0]} dataset={active[1]} />}
          <a
            className="mt-6 inline-block font-extrabold underline"
            href={`${base}data/statistieken.json`}
          >
            Download het oorspronkelijke cijferbestand (JSON)
          </a>
        </div>

        <div id="historische-dossiers" className="mt-16 scroll-mt-8">
          <p className="eyebrow text-[#ff5f3d]">Historische dossiers en onderzoek</p>
          <h3 className="mt-4 text-3xl font-black md:text-4xl">Zoek in de bestaande dossiers</h3>
          <p className="mt-4 max-w-3xl leading-relaxed text-[#10264b]/75">
            Alle oorspronkelijke dossierteksten blijven volledig leesbaar. De zoekfunctie doorzoekt
            de inhoud; zij geeft geen AI-samenvatting of nieuwe beoordeling.
          </p>
          <label className="mt-5 block max-w-2xl text-sm font-bold">
            Zoek dossiers en geschiedenis
            <input
              type="search"
              placeholder="Bijvoorbeeld Spinoza, onderwijs of staatsschuld"
              value={documentQuery}
              onChange={(e) => setDocumentQuery(e.target.value)}
              className={inputClass}
            />
          </label>
          <p role="status" className="mt-3 text-sm">
            {documents.length} dossiers gevonden.
          </p>
          <div className="mt-5 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {documents.map((doc) => (
              <article
                key={doc.id}
                className="min-w-0 rounded-2xl border border-[#10264b]/15 bg-white p-6"
              >
                <p className="text-xs font-extrabold uppercase tracking-wide text-[#10264b]/65">
                  {doc.category}
                </p>
                <h4 className="mt-3 text-xl font-black">
                  <a
                    className="underline decoration-[#64d8d4] underline-offset-4"
                    href={`${base}${doc.path}`}
                  >
                    {doc.title}
                  </a>
                </h4>
                <p className="mt-3 text-sm leading-relaxed text-[#10264b]/75">
                  {excerpt(doc.text, documentQuery)}
                </p>
                <p className="mt-4 text-xs text-[#10264b]/70">
                  Versie gecontroleerd: {doc.checkedAt || "niet vermeld"}. Publicatiedatum:{" "}
                  {doc.publishedAt || "niet vermeld"}.
                </p>
              </article>
            ))}
          </div>
        </div>

        <div
          id="voorstellen"
          className="mt-16 rounded-[1.75rem] bg-[#10264b] p-6 text-white md:p-9"
        >
          <h3 className="text-3xl font-black">Voorstellen ter beoordeling</h3>
          <p className="mt-4 leading-relaxed text-white/80">{proposals.toelichting}</p>
          {proposals.voorstellen.map((proposal) => (
            <details key={proposal.id} className="mt-5 rounded-2xl border border-white/25 p-5">
              <summary className="cursor-pointer text-lg font-extrabold">
                {proposal.titel} — {proposal.status}
              </summary>
              <p className="mt-4 text-sm">
                Datum van deze voorstelversie: {proposal.datum}. Geen vastgesteld VOC-beleid.
              </p>
              {proposal.onderdelen.map((part) => (
                <div key={part.titel} className="mt-5">
                  <h4 className="font-extrabold text-[#c8ff62]">{part.titel}</h4>
                  <p className="mt-2 leading-relaxed text-white/85">{part.tekst}</p>
                  {"brontitel" in part && (
                    <p className="mt-2 text-sm">
                      Bron: {part.brontitel}.{" "}
                      <a
                        className="underline"
                        href={`${base}ideeenplein.html#voorstel-${proposal.id}`}
                      >
                        Bronverwijzingen in het volledige voorstel
                      </a>
                      .
                    </p>
                  )}
                </div>
              ))}
              <div className="mt-6 grid gap-6 md:grid-cols-2">
                {[
                  ["Argumenten voor", proposal.voor],
                  ["Argumenten tegen", proposal.tegen],
                ].map(([title, argumentsList]) => (
                  <div key={title as string}>
                    <h4 className="font-extrabold">{title}</h4>
                    <ul className="mt-3 list-disc space-y-2 pl-5 text-white/85">
                      {(argumentsList as string[]).map((argument) => (
                        <li key={argument}>{argument}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </details>
          ))}
        </div>

        <div id="bronregister" className="mt-16 rounded-[1.75rem] bg-white p-5 md:p-9">
          <h3 className="text-3xl font-black">Bronregister</h3>
          <p className="mt-4 max-w-3xl leading-relaxed text-[#10264b]/75">
            {catalog.sources.length} unieke bronverwijzingen uit de bestaande pagina’s en datasets.
            De datasetmetadata noemt {catalog.registeredSourceFiles.length} unieke ruwe
            bronbestanden; die bestanden zelf ontbreken in deze publieke export. Dat is geen bewijs
            dat zij niet bestaan. Een bronverwijzing is geen onafhankelijke bevestiging van iedere
            conclusie.
          </p>
          <label className="mt-5 block max-w-2xl text-sm font-bold">
            Zoek bronnen
            <input
              type="search"
              value={sourceQuery}
              onChange={(e) => {
                setSourceQuery(e.target.value);
                setShowAllSources(false);
              }}
              className={inputClass}
            />
          </label>
          <p role="status" className="mt-3 text-sm">
            {sources.length} bronverwijzingen gevonden.
          </p>
          <ul className="mt-5 divide-y divide-[#10264b]/15">
            {(showAllSources ? sources : sources.slice(0, 8)).map((source) => (
              <li key={source.id} className="min-w-0 py-4">
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="break-words font-extrabold underline"
                >
                  {source.title}
                </a>
                <p className="mt-1 break-all text-xs text-[#10264b]/65">{source.url}</p>
                <p className="mt-2 text-sm">
                  Gebruikt bij {source.documentIds.length} dossiers en {source.datasetIds.length}{" "}
                  datasets.
                </p>
                {source.metadata.map((meta, i) => (
                  <p key={i} className="mt-1 text-xs text-[#10264b]/70">
                    {meta.naam}; bron bijgewerkt: {meta.gewijzigd || "niet vermeld"}; opgehaald:{" "}
                    {meta.opgehaald || "niet vermeld"}; periode: {meta.periode || "niet vermeld"}.
                  </p>
                ))}
              </li>
            ))}
          </ul>
          {!showAllSources && sources.length > 8 && (
            <button
              type="button"
              className="button-secondary mt-4"
              onClick={() => setShowAllSources(true)}
            >
              Toon alle bronverwijzingen
            </button>
          )}
          <details className="mt-6 border-t border-[#10264b]/20 pt-5">
            <summary className="cursor-pointer font-bold">
              Geregistreerde bronbestanden en beschikbaarheid
            </summary>
            <ul className="mt-4 space-y-2 text-sm">
              {catalog.registeredSourceFiles.map((file) => (
                <li key={file.path} className="break-all">
                  {file.path} — alleen de bestandsverwijzing beschikbaar; gebruikt door{" "}
                  {file.datasetIds.length} datasets.
                </li>
              ))}
            </ul>
          </details>
          <a
            className="mt-6 inline-block font-extrabold underline"
            href={`${base}data/knowledge-catalog.json`}
          >
            Download de kennis- en broncatalogus (JSON)
          </a>
        </div>
      </div>
    </section>
  );
}

function excerpt(text: string, query: string) {
  const found = normalize(text).indexOf(normalize(query.trim()));
  const start = query.trim() ? Math.max(0, found - 70) : 0;
  return `${start ? "…" : ""}${text.slice(start, start + 220)}${text.length > start + 220 ? "…" : ""}`;
}

function DatasetView({ id, dataset: d }: { id: string; dataset: Dataset }) {
  const format = new Intl.NumberFormat("nl-NL", {
    minimumFractionDigits: d.decimalen,
    maximumFractionDigits: d.decimalen,
  });
  return (
    <article data-dataset-id={id} className="mt-8 min-w-0">
      <h4 className="text-2xl font-black">{d.titel}</h4>
      <p className="mt-2 text-sm font-bold">
        {d.berekend
          ? "VOC-berekening op basis van brongegevens"
          : "Officiële statistiek: brongegevens"}{" "}
        · {d.eenheid}
      </p>
      <p className="mt-3 leading-relaxed">{d.toelichting}</p>
      <dl className="mt-5 grid gap-3 text-sm md:grid-cols-2">
        <div>
          <dt className="font-bold">Oorspronkelijke bron</dt>
          <dd>
            <a
              className="break-words underline"
              href={d.bron.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              {d.bron.naam}
              {d.bron.tabel ? ` — ${d.bron.tabel}` : ""}
            </a>
          </dd>
        </div>
        <div>
          <dt className="font-bold">Meetperiode volgens bron</dt>
          <dd>{d.bron.periode || "Niet vermeld; zie afzonderlijke peildatums."}</dd>
        </div>
        <div>
          <dt className="font-bold">Bron bijgewerkt / opgehaald</dt>
          <dd>
            {d.bron.gewijzigd || "Niet vermeld"} / {d.bron.opgehaald || "Niet vermeld"}
          </dd>
        </div>
        <div>
          <dt className="font-bold">Weergave en hergebruik</dt>
          <dd>
            Bronwaarden gedeeld door {d.deler}; {d.decimalen} decimalen.{" "}
            {d.bron.licentie || "Licentie niet vermeld."}
          </dd>
        </div>
      </dl>
      {d.berekend && (
        <p className="mt-4 rounded-xl bg-[#64d8d4]/20 p-4 text-sm">
          {d.berekend}{" "}
          {d.afhankelijkheden?.length ? `Afhankelijkheden: ${d.afhankelijkheden.join(", ")}.` : ""}
        </p>
      )}
      {d.eenheid_verantwoording && <p className="mt-3 text-sm">{d.eenheid_verantwoording}</p>}
      {d.leeg ? (
        <p className="mt-5 rounded-xl border-2 border-[#10264b]/25 p-4">
          Geen cijferreeks beschikbaar in de oorspronkelijke bronexport. Er zijn geen waarden
          ingevuld of geschat.
        </p>
      ) : (
        <div
          role="region"
          aria-label={`Gegevenstabel ${d.titel}`}
          tabIndex={0}
          className="mt-5 max-h-96 overflow-auto rounded-xl border border-[#10264b]/20"
        >
          <table className="w-full min-w-[560px] text-left text-sm">
            <caption className="p-3 text-left">
              {d.titel} — {d.eenheid}. Een streepje is een ontbrekende waarde, geen nul.
            </caption>
            <thead className="bg-[#10264b] text-white">
              <tr>
                <th scope="col" className="p-3">
                  Periode / categorie
                </th>
                {d.reeksen.map((s) => (
                  <th key={s.naam} scope="col" className="p-3">
                    {s.naam}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {d.labels.map((label, i) => (
                <tr key={i} className="border-t border-[#10264b]/15">
                  <th scope="row" className="p-3">
                    {label}
                    {d.voorlopig?.includes(Number(label)) && (
                      <small className="block">voorlopig bronjaar</small>
                    )}
                  </th>
                  {d.reeksen.map((series) => (
                    <td key={series.naam} className="p-3">
                      <span>
                        {series.waarden[i] == null
                          ? "— (ontbreekt)"
                          : format.format(series.waarden[i]! / d.deler)}
                      </span>
                      <small className="mt-1 block text-[#10264b]/70">
                        {series.peildatum?.[i] || label} ·{" "}
                        {series.status?.[i] || "status niet vermeld"}
                        {series.bronvlag?.[i] ? ` · ${series.bronvlag[i]}` : ""}
                      </small>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </article>
  );
}
