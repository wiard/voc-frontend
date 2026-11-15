import { FormEvent, useState } from "react";

const Arrow = ({ className = "" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M5 12h14M14 7l5 5-5 5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const Check = ({ className = "" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="m5 12 4 4L19 6"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const Spark = ({ className = "" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M12 2c.8 5.7 4.3 9.2 10 10-5.7.8-9.2 4.3-10 10-.8-5.7-4.3-9.2-10-10 5.7-.8 9.2-4.3 10-10Z"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
  </svg>
);

const principles = [
  {
    number: "01",
    title: "Vrijheid van het individu",
    text: "De overheid beschermt jouw vrijheid, eigendom en persoonlijke levenssfeer. Zij bepaalt niet hoe jij hoort te leven.",
    color: "bg-[#c8ff62]",
  },
  {
    number: "02",
    title: "Kennis boven partijbelang",
    text: "Voorstellen worden getoetst aan feiten, expertise en meetbare gevolgen — niet aan politieke winst op korte termijn.",
    color: "bg-[#64d8d4]",
  },
  {
    number: "03",
    title: "Een seculiere rechtsstaat",
    text: "Iedereen is gelijk voor de wet. Geloof is vrij en persoonlijk; de staat blijft neutraal en bewaakt grondrechten.",
    color: "bg-[#ff7a59] text-white",
  },
];

const researchSteps = [
  ["Vraag", "We formuleren het probleem precies en publiceren de aannames."],
  ["Onderzoek", "AI vergelijkt data, vakkennis en bewezen oplossingen."],
  ["Bereken", "Kosten, baten, risico’s en neveneffecten worden doorgerekend."],
  ["Besluit", "Mensen wegen de uitkomst en leggen publiek verantwoording af."],
];

const topics = [
  { name: "Wonen", score: 92, delta: "+18%" },
  { name: "Energie", score: 78, delta: "−12%" },
  { name: "Mobiliteit", score: 64, delta: "+7%" },
];

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [ideaSubmitted, setIdeaSubmitted] = useState(false);
  const [activeTopic, setActiveTopic] = useState(0);

  const submitNewsletter = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubscribed(true);
  };

  const submitIdea = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIdeaSubmitted(true);
  };

  return (
    <div className="min-h-screen overflow-hidden bg-[#f5f2e9] text-[#10264b]">
      <header className="relative z-50 border-b border-[#10264b]/15 bg-[#f5f2e9]/95 backdrop-blur">
        <div className="mx-auto flex h-20 max-w-[1240px] items-center justify-between px-5 lg:h-24 lg:px-8">
          <a href="#" className="flex items-center gap-3" aria-label="VOC, naar begin">
            <span className="grid h-12 w-12 place-items-center rounded-full bg-[#c8ff62] font-black tracking-[-.08em] text-[#10264b]">
              VOC
            </span>
            <span className="hidden text-[.68rem] font-extrabold uppercase leading-[1.25] tracking-[.12em] sm:block">
              Verenigd
              <br />
              Onafhankelijk Collectief
            </span>
          </a>

          <nav className="hidden items-center gap-8 font-bold lg:flex" aria-label="Hoofdnavigatie">
            <a className="nav-link" href="#beginselen">
              Beginselen
            </a>
            <a className="nav-link" href="#werkwijze">
              Werkwijze
            </a>
            <a className="nav-link" href="#transparantie">
              Transparantie
            </a>
            <a className="nav-link" href="#meedenken">
              Meedenken
            </a>
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <a
              href="#nieuwsbrief"
              className="rounded-full border-2 border-[#10264b] px-5 py-3 text-sm font-extrabold transition hover:bg-white"
            >
              Blijf op de hoogte
            </a>
            <a href="#meedenken" className="button-primary">
              Denk mee <Arrow className="h-4 w-4" />
            </a>
          </div>

          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="grid h-11 w-11 place-items-center rounded-full border-2 border-[#10264b] lg:hidden"
            aria-label={menuOpen ? "Menu sluiten" : "Menu openen"}
            aria-expanded={menuOpen}
          >
            <span className="relative h-4 w-5">
              <span
                className={`absolute left-0 top-0 h-0.5 w-5 bg-current transition ${menuOpen ? "translate-y-[7px] rotate-45" : ""}`}
              />
              <span
                className={`absolute left-0 top-[7px] h-0.5 w-5 bg-current transition ${menuOpen ? "opacity-0" : ""}`}
              />
              <span
                className={`absolute left-0 top-[14px] h-0.5 w-5 bg-current transition ${menuOpen ? "-translate-y-[7px] -rotate-45" : ""}`}
              />
            </span>
          </button>
        </div>
        {menuOpen && (
          <nav className="absolute inset-x-0 top-full flex flex-col gap-2 border-y border-[#10264b]/15 bg-[#f5f2e9] p-5 text-xl font-extrabold shadow-xl lg:hidden">
            {[
              ["Beginselen", "#beginselen"],
              ["Werkwijze", "#werkwijze"],
              ["Transparantie", "#transparantie"],
              ["Meedenken", "#meedenken"],
            ].map(([label, href]) => (
              <a
                key={href}
                href={href}
                onClick={() => setMenuOpen(false)}
                className="rounded-xl px-4 py-3 hover:bg-white"
              >
                {label}
              </a>
            ))}
          </nav>
        )}
      </header>

      <main>
        <section className="relative">
          <div className="mx-auto grid min-h-[720px] max-w-[1440px] lg:grid-cols-[1.04fr_.96fr]">
            <div className="relative z-10 flex flex-col justify-center px-5 py-20 sm:px-10 lg:px-[max(2rem,calc((100vw-1240px)/2))] lg:py-28">
              <div className="mb-7 flex w-fit items-center gap-2 rounded-full border border-[#10264b]/20 bg-white px-4 py-2 text-xs font-extrabold uppercase tracking-[.14em]">
                <Spark className="h-4 w-4 text-[#ff5f3d]" />
                Menselijk besluit. Kunstmatige intelligentie.
              </div>
              <h1 className="max-w-[800px] text-[clamp(3.6rem,7.8vw,7.4rem)] font-black leading-[.84] tracking-[-.075em]">
                Politiek.
                <br />
                <span className="relative inline-block text-[#ff5f3d]">
                  Opnieuw
                  <svg
                    className="absolute -bottom-3 left-0 w-full"
                    viewBox="0 0 440 24"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M5 16C118 3 298 5 435 10"
                      stroke="#c8ff62"
                      strokeWidth="11"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
                <br />
                berekend.
              </h1>
              <p className="mt-11 max-w-2xl text-xl font-medium leading-relaxed text-[#10264b]/72 md:text-2xl">
                VOC vernieuwt de politiek met kunstmatige intelligentie, kennis en radicale
                transparantie. Niet partijbelang, maar controleerbare feiten bepalen de koers.
              </p>
              <div className="mt-9 flex flex-wrap gap-3">
                <a href="#werkwijze" className="button-primary">
                  Ontdek onze methode <Arrow className="h-5 w-5" />
                </a>
                <a href="#beginselen" className="button-secondary">
                  Lees onze beginselen
                </a>
              </div>
            </div>

            <div className="relative flex min-h-[580px] items-center overflow-hidden bg-[#10264b] px-5 py-16 text-white sm:px-10 lg:min-h-full">
              <div className="absolute -right-28 -top-28 h-80 w-80 rounded-full border-[58px] border-[#64d8d4]/15" />
              <div className="absolute -bottom-32 -left-32 h-80 w-80 rounded-full bg-[#c8ff62]/10" />
              <div className="relative mx-auto w-full max-w-xl">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-extrabold uppercase tracking-[.16em] text-[#64d8d4]">
                      Open onderzoeksmodel
                    </p>
                    <p className="mt-1 text-2xl font-black">Effectverkenner</p>
                  </div>
                  <span className="flex items-center gap-2 rounded-full bg-[#c8ff62] px-3 py-1.5 text-xs font-black text-[#10264b]">
                    <span className="h-2 w-2 rounded-full bg-[#10264b]" />
                    LIVE MODEL
                  </span>
                </div>

                <div className="rounded-[1.75rem] border border-white/15 bg-white/[.07] p-5 shadow-2xl backdrop-blur md:p-7">
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {topics.map((topic, index) => (
                      <button
                        type="button"
                        key={topic.name}
                        onClick={() => setActiveTopic(index)}
                        className={`rounded-full px-4 py-2 text-sm font-extrabold transition ${
                          activeTopic === index
                            ? "bg-[#c8ff62] text-[#10264b]"
                            : "bg-white/10 text-white/65 hover:bg-white/15"
                        }`}
                      >
                        {topic.name}
                      </button>
                    ))}
                  </div>
                  <div className="mt-7 grid grid-cols-[1fr_auto] items-end gap-4">
                    <div>
                      <p className="text-sm text-white/55">Maatschappelijke haalbaarheid</p>
                      <p className="mt-1 text-6xl font-black tracking-[-.06em]">
                        {topics[activeTopic].score}
                        <span className="text-2xl text-white/40">/100</span>
                      </p>
                    </div>
                    <div className="rounded-xl bg-[#64d8d4]/15 p-3 text-right">
                      <p className="text-xs text-white/50">Begrotingseffect</p>
                      <p className="mt-1 text-xl font-black text-[#64d8d4]">
                        {topics[activeTopic].delta}
                      </p>
                    </div>
                  </div>
                  <div className="mt-7 flex h-32 items-end gap-2 border-b border-white/20 pb-1">
                    {[36, 55, 44, 72, 63, 91, topics[activeTopic].score].map((height, index) => (
                      <div
                        key={`${activeTopic}-${index}`}
                        className={`flex-1 rounded-t-md ${index === 6 ? "bg-[#c8ff62]" : "bg-[#64d8d4]/35"}`}
                        style={{ height: `${height}%` }}
                      />
                    ))}
                  </div>
                  <div className="mt-5 flex items-center justify-between text-xs font-bold text-white/45">
                    <span>42 openbare bronnen</span>
                    <span>Model v1.8</span>
                    <span>Vandaag bijgewerkt</span>
                  </div>
                </div>
                <p className="mt-5 flex items-start gap-3 text-sm leading-relaxed text-white/55">
                  <span className="mt-1 grid h-5 w-5 shrink-0 place-items-center rounded-full border border-white/25 text-[.65rem]">
                    i
                  </span>
                  Illustratieve weergave. Elk werkelijk VOC-onderzoek publiceert bronnen, aannames,
                  onzekerheden en rekenmodellen.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-[#10264b] px-5 pb-5 sm:px-8 sm:pb-8">
          <div className="relative mx-auto min-h-[440px] max-w-[1376px] overflow-hidden rounded-[1.75rem] sm:min-h-[560px]">
            <img
              src="https://images.unsplash.com/photo-1589825743636-cd96373c3319?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&ixlib=rb-4.1.0&q=85&w=1800"
              alt="Het Rijksmuseum in Amsterdam op een zonnige dag"
              className="absolute inset-0 h-full w-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(16,38,75,.88)_0%,rgba(16,38,75,.48)_48%,rgba(16,38,75,.08)_78%)]" />
            <div className="relative flex min-h-[440px] max-w-2xl flex-col justify-end p-7 text-white sm:min-h-[560px] sm:p-12 lg:p-16">
              <p className="eyebrow text-[#c8ff62]">Gebouwd op kennis</p>
              <h2 className="mt-5 text-4xl font-black leading-[.95] tracking-[-.05em] sm:text-6xl">
                Nederland verdient een bestuur dat verder kijkt.
              </h2>
              <p className="mt-5 max-w-xl text-lg leading-relaxed text-white/75">
                We beschermen wat van waarde is en vernieuwen wat beter kan — met open onderzoek,
                een langetermijnvisie en respect voor iedere generatie.
              </p>
            </div>
            <a
              href="https://unsplash.com/@frns"
              target="_blank"
              rel="noreferrer"
              className="absolute bottom-4 right-5 rounded-full bg-[#10264b]/65 px-3 py-1.5 text-[.65rem] font-bold text-white/70 backdrop-blur transition hover:text-white"
            >
              Foto: Frans Ruiter / Unsplash
            </a>
          </div>
        </section>

        <section id="beginselen" className="bg-[#10264b] px-5 py-24 text-white sm:px-8 lg:py-32">
          <div className="mx-auto max-w-[1240px]">
            <div className="mb-14 flex flex-col justify-between gap-7 md:flex-row md:items-end">
              <div>
                <p className="eyebrow text-[#c8ff62]">Waar we voor staan</p>
                <h2 className="mt-4 max-w-3xl text-5xl font-black leading-[.95] tracking-[-.05em] md:text-7xl">
                  Vrij denken. Feitelijk handelen.
                </h2>
              </div>
              <p className="max-w-sm text-lg leading-relaxed text-white/65">
                Technologie is een hulpmiddel. Onze democratische en rechtsstatelijke beginselen
                zijn altijd leidend.
              </p>
            </div>
            <div className="grid gap-5 lg:grid-cols-3">
              {principles.map((item) => (
                <article
                  key={item.number}
                  className="group flex min-h-[390px] flex-col rounded-[1.75rem] bg-[#f5f2e9] p-7 text-[#10264b] transition duration-300 hover:-translate-y-2 md:p-9"
                >
                  <div
                    className={`grid h-14 w-14 place-items-center rounded-full ${item.color} font-black`}
                  >
                    {item.number}
                  </div>
                  <h3 className="mt-10 text-3xl font-black leading-[1.02] tracking-[-.035em]">
                    {item.title}
                  </h3>
                  <p className="mt-5 text-base font-medium leading-relaxed text-[#10264b]/65">
                    {item.text}
                  </p>
                  <a
                    href="#transparantie"
                    className="mt-auto flex items-center gap-2 pt-8 font-extrabold"
                  >
                    Lees de uitwerking{" "}
                    <Arrow className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </a>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="werkwijze" className="px-5 py-24 sm:px-8 lg:py-32">
          <div className="mx-auto max-w-[1240px]">
            <div className="grid gap-12 lg:grid-cols-[.8fr_1.2fr]">
              <div>
                <p className="eyebrow text-[#ff5f3d]">De VOC-methode</p>
                <h2 className="mt-5 text-5xl font-black leading-[.94] tracking-[-.05em] md:text-7xl">
                  AI adviseert.
                  <br />
                  Mensen besluiten.
                </h2>
                <p className="mt-7 max-w-lg text-lg leading-relaxed text-[#10264b]/68">
                  AI kan meer informatie analyseren en scenario’s sneller vergelijken. Maar het
                  maakt geen politieke keuzes. Gekozen mensen blijven verantwoordelijk,
                  aanspreekbaar en controleerbaar.
                </p>
              </div>
              <div className="grid gap-px overflow-hidden rounded-[1.75rem] border border-[#10264b]/15 bg-[#10264b]/15 sm:grid-cols-2">
                {researchSteps.map(([title, text], index) => (
                  <div key={title} className="min-h-56 bg-white p-7 md:p-9">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black tracking-[.15em] text-[#ff5f3d]">
                        STAP 0{index + 1}
                      </span>
                      {index < 3 && <Arrow className="h-5 w-5 text-[#10264b]/25" />}
                    </div>
                    <h3 className="mt-8 text-3xl font-black">{title}</h3>
                    <p className="mt-4 leading-relaxed text-[#10264b]/60">{text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="transparantie" className="bg-[#64d8d4] px-5 py-24 sm:px-8 lg:py-28">
          <div className="mx-auto max-w-[1240px]">
            <div className="grid items-start gap-12 lg:grid-cols-[1.1fr_.9fr]">
              <div>
                <p className="eyebrow">Geen zwarte doos</p>
                <h2 className="mt-5 max-w-3xl text-5xl font-black leading-[.94] tracking-[-.05em] md:text-7xl">
                  Alles open.
                  <br />
                  Alles controleerbaar.
                </h2>
              </div>
              <div className="grid gap-3">
                {[
                  "Bronnen en datasets zijn openbaar",
                  "Aannames staan zichtbaar bij iedere berekening",
                  "Onzekerheden worden niet weggemoffeld",
                  "Financiële gevolgen zijn vooraf inzichtelijk",
                  "Bestuurders leggen persoonlijk verantwoording af",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-4 rounded-2xl bg-white/65 p-4">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#10264b] text-[#c8ff62]">
                      <Check className="h-5 w-5" />
                    </span>
                    <span className="font-extrabold">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-16 grid gap-5 border-t-2 border-[#10264b] pt-6 md:grid-cols-3">
              <div>
                <p className="text-3xl font-black">Open onderzoek</p>
                <p className="mt-2 text-[#10264b]/65">Iedereen mag onze conclusies toetsen.</p>
              </div>
              <div>
                <p className="text-3xl font-black">Gezonde financiën</p>
                <p className="mt-2 text-[#10264b]/65">Geen plan zonder eerlijke dekking.</p>
              </div>
              <div>
                <p className="text-3xl font-black">Meetbaar resultaat</p>
                <p className="mt-2 text-[#10264b]/65">Beleid wordt geëvalueerd en bijgestuurd.</p>
              </div>
            </div>
          </div>
        </section>

        <section id="meedenken" className="px-5 py-24 sm:px-8 lg:py-32">
          <div className="mx-auto grid max-w-[1240px] overflow-hidden rounded-[2rem] bg-[#ff5f3d] text-white lg:grid-cols-[.95fr_1.05fr]">
            <div className="p-8 md:p-12 lg:p-16">
              <p className="eyebrow text-[#c8ff62]">Democratie begint dichtbij</p>
              <h2 className="mt-5 text-5xl font-black leading-[.92] tracking-[-.05em] md:text-7xl">
                Jouw straat.
                <br />
                Jouw kennis.
              </h2>
              <p className="mt-7 max-w-xl text-lg leading-relaxed text-white/80">
                Een onveilige kruising, leegstaande woningen of een vastgelopen regel? Breng het
                probleem in. Samen maken we het concreet en onderzoekbaar.
              </p>
              <div className="mt-8 flex flex-wrap gap-3 text-sm font-bold">
                {["Lokaal probleem", "Landelijk idee", "Controleverzoek"].map((label) => (
                  <span key={label} className="rounded-full border border-white/35 px-4 py-2">
                    {label}
                  </span>
                ))}
              </div>
            </div>
            <div className="bg-[#10264b] p-8 md:p-12 lg:p-16">
              {ideaSubmitted ? (
                <div className="flex h-full min-h-80 flex-col justify-center">
                  <span className="grid h-14 w-14 place-items-center rounded-full bg-[#c8ff62] text-[#10264b]">
                    <Check className="h-7 w-7" />
                  </span>
                  <h3 className="mt-6 text-3xl font-black">Dank voor je inbreng.</h3>
                  <p className="mt-3 max-w-md leading-relaxed text-white/65">
                    Je idee is in deze demo ontvangen. In het werkelijke platform kun je de
                    onderzoeksstatus en publieke reacties blijven volgen.
                  </p>
                  <button
                    type="button"
                    onClick={() => setIdeaSubmitted(false)}
                    className="mt-7 w-fit border-b border-[#c8ff62] pb-1 font-bold text-[#c8ff62]"
                  >
                    Nog een onderwerp indienen
                  </button>
                </div>
              ) : (
                <form onSubmit={submitIdea}>
                  <p className="text-xs font-extrabold uppercase tracking-[.15em] text-[#64d8d4]">
                    Start een onderzoeksvraag
                  </p>
                  <label className="mt-7 block text-sm font-bold">
                    Wat speelt er?
                    <textarea
                      required
                      rows={5}
                      placeholder="Beschrijf het probleem zo concreet mogelijk…"
                      className="mt-2 w-full resize-none rounded-2xl border border-white/20 bg-white/10 p-4 text-white outline-none placeholder:text-white/35 focus:border-[#64d8d4]"
                    />
                  </label>
                  <label className="mt-4 block text-sm font-bold">
                    Plaats of postcode
                    <input
                      required
                      type="text"
                      placeholder="Bijvoorbeeld 3511"
                      className="mt-2 h-14 w-full rounded-full border border-white/20 bg-white/10 px-5 text-white outline-none placeholder:text-white/35 focus:border-[#64d8d4]"
                    />
                  </label>
                  <button
                    type="submit"
                    className="mt-6 inline-flex h-14 w-full items-center justify-center gap-2 rounded-full bg-[#c8ff62] px-6 font-extrabold text-[#10264b] transition hover:scale-[1.01]"
                  >
                    Dien je vraag in <Arrow className="h-5 w-5" />
                  </button>
                  <p className="mt-4 text-xs leading-relaxed text-white/40">
                    Dit formulier is een ontwerpdemonstratie en slaat geen gegevens op.
                  </p>
                </form>
              )}
            </div>
          </div>
        </section>

        <section id="nieuwsbrief" className="px-5 pb-24 sm:px-8">
          <div className="mx-auto grid max-w-[1240px] gap-8 rounded-[2rem] bg-white p-7 shadow-[0_20px_70px_rgba(16,38,75,.09)] md:grid-cols-[1fr_1.1fr] md:p-12">
            <div>
              <p className="eyebrow text-[#ff5f3d]">Volg het onderzoek</p>
              <h2 className="mt-3 text-4xl font-black tracking-[-.04em] md:text-5xl">
                Politiek met bronvermelding.
              </h2>
              <p className="mt-4 text-[#10264b]/65">
                Ontvang nieuwe analyses, voorstellen en openbare rekenmodellen in je inbox.
              </p>
            </div>
            {subscribed ? (
              <div className="flex items-center gap-4 rounded-2xl bg-[#64d8d4]/25 p-6">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[#10264b] text-white">
                  <Check className="h-6 w-6" />
                </span>
                <div>
                  <p className="text-lg font-black">Je bent aangemeld.</p>
                  <p className="text-sm text-[#10264b]/65">Welkom bij het collectief.</p>
                </div>
              </div>
            ) : (
              <form
                onSubmit={submitNewsletter}
                className="flex flex-col gap-3 sm:flex-row sm:items-end"
              >
                <label className="flex-1 text-sm font-bold">
                  E-mailadres
                  <input
                    required
                    type="email"
                    placeholder="jij@voorbeeld.nl"
                    className="mt-2 h-14 w-full rounded-full border-2 border-[#10264b]/20 bg-[#f5f2e9] px-5 outline-none transition placeholder:text-[#10264b]/35 focus:border-[#10264b]"
                  />
                </label>
                <button
                  type="submit"
                  className="button-primary h-14 justify-center whitespace-nowrap"
                >
                  Aanmelden <Arrow className="h-5 w-5" />
                </button>
              </form>
            )}
          </div>
        </section>
      </main>

      <footer className="bg-[#10264b] px-5 py-12 text-white sm:px-8">
        <div className="mx-auto max-w-[1240px]">
          <div className="flex flex-col justify-between gap-10 border-b border-white/15 pb-10 md:flex-row">
            <a href="#" className="flex items-center gap-3">
              <span className="grid h-12 w-12 place-items-center rounded-full bg-[#c8ff62] font-black tracking-[-.08em] text-[#10264b]">
                VOC
              </span>
              <span className="text-[.68rem] font-extrabold uppercase leading-[1.25] tracking-[.12em]">
                Verenigd
                <br />
                Onafhankelijk Collectief
              </span>
            </a>
            <div className="grid grid-cols-2 gap-x-12 gap-y-3 text-sm font-bold sm:grid-cols-4">
              <a href="#beginselen">Beginselen</a>
              <a href="#werkwijze">Werkwijze</a>
              <a href="#transparantie">Open data</a>
              <a href="#meedenken">Contact</a>
            </div>
          </div>
          <div className="flex flex-col justify-between gap-3 pt-6 text-xs text-white/45 sm:flex-row">
            <p>© 2025 VOC — Verenigd Onafhankelijk Collectief</p>
            <div className="flex gap-5">
              <a href="#">Privacy</a>
              <a href="#">Toegankelijkheid</a>
              <a href="#">Broncode</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
