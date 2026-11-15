import { useState, type FormEvent } from "react";
import defaults from "../../knowledge/original/data/laboratorium.json";
import { bereken, type TaxResult, type TaxScenario } from "./tax-engine.js";

const base = import.meta.env.BASE_URL;
const money = new Intl.NumberFormat("nl-NL", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const numericClass =
  "mt-2 w-full min-w-0 rounded-xl border-2 border-[#10264b]/25 bg-white p-3 text-[#10264b]";
const compare = (incomes: number[], a: TaxScenario, b: TaxScenario) =>
  incomes.map((income) => {
    const first = bereken(income, a),
      second = bereken(income, b);
    return {
      first,
      second,
      difference: (Math.round(second.netto * 100) - Math.round(first.netto * 100)) / 100,
    };
  });
type Row = { first: TaxResult; second: TaxResult; difference: number };

export default function TaxLab() {
  const [counts, setCounts] = useState([
    defaults.scenario1.tarieven.length,
    defaults.scenario2.tarieven.length,
  ]);
  const [rows, setRows] = useState<Row[] | null>(() =>
    compare(defaults.inkomens, defaults.scenario1, defaults.scenario2),
  );
  const [error, setError] = useState("");
  const [reset, setReset] = useState(0);
  const [status, setStatus] = useState(
    "Oefenwaarden berekend. Geen werkelijke Nederlandse tarieven.",
  );

  function calculate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    function number(name: string) {
      const value = String(data.get(name) ?? "");
      if (!value.trim()) throw new Error("Vul alle bedragen en tarieven in.");
      return Number(value);
    }
    function scenario(n: number): TaxScenario {
      const count = number(`s${n}-count`);
      return {
        voet: number(`s${n}-foot`),
        tarieven: Array.from({ length: count }, (_, i) => number(`s${n}-rate-${i}`)),
        grenzen: Array.from({ length: count - 1 }, (_, i) => number(`s${n}-limit-${i}`)),
      };
    }
    try {
      setRows(
        compare(
          defaults.inkomens.map((_, i) => number(`income-${i}`)),
          scenario(1),
          scenario(2),
        ),
      );
      setError("");
      setStatus("Berekend met uw huidige instellingen. Dit blijft een fictief oefenmodel.");
    } catch (cause) {
      setRows(null);
      setError(cause instanceof Error ? cause.message : "Controleer uw invoer.");
      setStatus("Geen geldige uitkomst. Corrigeer de invoer.");
    }
  }
  function changed() {
    setRows(null);
    setError("");
    setStatus("Invoer gewijzigd. Kies Bereken en vergelijk voor actuele uitkomsten.");
  }
  function restore() {
    setCounts([defaults.scenario1.tarieven.length, defaults.scenario2.tarieven.length]);
    setReset((value) => value + 1);
    setRows(compare(defaults.inkomens, defaults.scenario1, defaults.scenario2));
    setError("");
    setStatus("Oefenwaarden hersteld en berekend.");
  }

  return (
    <section
      id="laboratorium"
      className="bg-[#10264b] px-5 py-24 text-white sm:px-8 lg:py-32"
      aria-labelledby="laboratorium-titel"
    >
      <div className="mx-auto max-w-[1240px]">
        <p className="eyebrow text-[#64d8d4]">Een controleerbaar oefenmodel</p>
        <h2
          id="laboratorium-titel"
          className="mt-4 text-5xl font-black tracking-[-.05em] md:text-7xl"
        >
          Het belastinglaboratorium.
        </h2>
        <p className="mt-6 max-w-3xl text-lg leading-relaxed text-white/85">{defaults.status}</p>
        <p className="mt-3 text-sm text-white/75">
          Model {defaults.versie} · modeldatum {defaults.datum}. De oorspronkelijke rekenlogica is
          behouden. Alle berekeningen blijven in uw browser; invoer wordt niet opgeslagen of
          verstuurd.
        </p>
        <form
          key={reset}
          onSubmit={calculate}
          onInput={changed}
          aria-label="Belastinglaboratorium"
          className="mt-9 rounded-[1.75rem] bg-[#f5f2e9] p-5 text-[#10264b] md:p-9"
        >
          <div className="grid gap-7 md:grid-cols-2">
            {[defaults.scenario1, defaults.scenario2].map((scenario, i) => (
              <fieldset key={i} className="min-w-0 rounded-2xl border border-[#10264b]/25 p-5">
                <legend className="px-2 text-xl font-black">Scenario {i + 1}</legend>
                <label className="block text-sm font-bold" htmlFor={`tax-s${i}-foot`}>
                  Belastingvrije voet — scenario {i + 1}
                </label>
                <input
                  id={`tax-s${i}-foot`}
                  name={`s${i + 1}-foot`}
                  type="number"
                  min="0"
                  max="10000000"
                  step="0.01"
                  required
                  defaultValue={scenario.voet}
                  className={numericClass}
                />
                <label className="mt-5 block text-sm font-bold" htmlFor={`tax-s${i}-count`}>
                  Aantal schijven — scenario {i + 1}
                </label>
                <select
                  id={`tax-s${i}-count`}
                  name={`s${i + 1}-count`}
                  value={counts[i]}
                  className={numericClass}
                  onChange={(e) => {
                    setCounts((previous) =>
                      previous.map((count, n) => (n === i ? Number(e.target.value) : count)),
                    );
                    changed();
                  }}
                >
                  {[1, 2, 3, 4].map((count) => (
                    <option key={count} value={count}>
                      {count}
                    </option>
                  ))}
                </select>
                {Array.from({ length: counts[i] }, (_, j) => (
                  <div key={j} className="mt-5 border-t border-[#10264b]/15 pt-4">
                    <label className="text-sm font-bold" htmlFor={`tax-s${i}-rate-${j}`}>
                      Tarief schijf {j + 1} (%) — scenario {i + 1}
                    </label>
                    <input
                      id={`tax-s${i}-rate-${j}`}
                      name={`s${i + 1}-rate-${j}`}
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      required
                      defaultValue={scenario.tarieven[j] ?? 25}
                      className={numericClass}
                    />
                    {j < counts[i] - 1 && (
                      <>
                        <label
                          className="mt-3 block text-sm font-bold"
                          htmlFor={`tax-s${i}-limit-${j}`}
                        >
                          Grens schijf {j + 1} (€ grondslag) — scenario {i + 1}
                        </label>
                        <input
                          id={`tax-s${i}-limit-${j}`}
                          name={`s${i + 1}-limit-${j}`}
                          type="number"
                          min="0.01"
                          max="10000000"
                          step="0.01"
                          required
                          defaultValue={
                            scenario.grenzen[j] ??
                            (scenario.grenzen[scenario.grenzen.length - 1] || 0) +
                              (j - scenario.grenzen.length + 1) * 10000
                          }
                          className={numericClass}
                        />
                      </>
                    )}
                  </div>
                ))}
              </fieldset>
            ))}
          </div>
          <fieldset className="mt-7">
            <legend className="text-lg font-black">Drie bruto jaarinkomens (€)</legend>
            <div className="mt-4 grid gap-5 md:grid-cols-3">
              {defaults.inkomens.map((income, i) => (
                <div key={i}>
                  <label htmlFor={`tax-income-${i}`} className="text-sm font-bold">
                    Bruto inkomen {i + 1}
                  </label>
                  <input
                    id={`tax-income-${i}`}
                    name={`income-${i}`}
                    type="number"
                    min="0"
                    max="10000000"
                    step="0.01"
                    required
                    defaultValue={income}
                    className={numericClass}
                  />
                </div>
              ))}
            </div>
          </fieldset>
          <div className="mt-7 flex flex-wrap gap-3">
            <button className="button-primary" type="submit">
              Bereken en vergelijk
            </button>
            <button className="button-secondary" type="button" onClick={restore}>
              Herstel oefenwaarden
            </button>
          </div>
          <p role="status" className="mt-5 text-sm">
            {status}
          </p>
          {error && (
            <p role="alert" className="mt-4 rounded-xl border-2 border-[#ff5f3d] p-4 font-bold">
              {error}
            </p>
          )}
          {rows && (
            <div
              role="region"
              aria-label="Uitkomsten belastingmodel"
              tabIndex={0}
              className="mt-6 overflow-auto rounded-xl border border-[#10264b]/25"
            >
              <table className="w-full min-w-[800px] text-left text-sm">
                <caption className="p-4 text-left font-bold">
                  Netto in het oefenmodel. Effect = netto scenario 2 min netto scenario 1.
                </caption>
                <thead className="bg-[#10264b] text-white">
                  <tr>
                    {[
                      "Bruto",
                      "Grondslag 1",
                      "Belasting 1",
                      "Netto 1",
                      "Grondslag 2",
                      "Belasting 2",
                      "Netto 2",
                      "Netto-effect",
                    ].map((heading) => (
                      <th key={heading} scope="col" className="p-3">
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, i) => (
                    <tr key={i} className="border-t border-[#10264b]/20">
                      <th scope="row" className="p-3">
                        {money.format(row.first.bruto)}
                      </th>
                      {[
                        row.first.grondslag,
                        row.first.belasting,
                        row.first.netto,
                        row.second.grondslag,
                        row.second.belasting,
                        row.second.netto,
                        row.difference,
                      ].map((value, n) => (
                        <td key={n} className="p-3">
                          {money.format(value)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </form>
        <details className="mt-7 rounded-2xl border border-white/25 p-5">
          <summary className="cursor-pointer text-lg font-bold">
            Formule, aannames en beperkingen
          </summary>
          <p className="mt-4 leading-relaxed">{defaults.definitie}</p>
          <p className="mt-4">Niet opgenomen: {defaults.uitsluitingen.join(", ")}.</p>
          <p className="mt-4">
            Dit is geen berekening van het volledige Nederlandse belastingstelsel of de landelijke
            begroting.
          </p>
        </details>
        <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 font-bold">
          <a href={`${base}data/laboratorium.json`} className="underline">
            Oorspronkelijke modeldefinitie
          </a>
          <a href={`${base}js/laboratorium.js`} className="underline">
            Oorspronkelijke rekenfunctie
          </a>
          <a href={`${base}laboratorium.html#strategie`} className="underline">
            Uitvoeringsroutes en volledige verantwoording
          </a>
        </div>
      </div>
    </section>
  );
}
