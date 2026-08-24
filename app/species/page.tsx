import { SPECIES } from "@/lib/data/species";
import { Badge } from "@/components/ui/badge";
import { MonthHeat, MonthHeatLegend } from "@/components/viz/month-heat";
import { TempBar } from "@/components/viz/temp-bar";
import { Waterline } from "@/components/viz/waterline";

export default function SpeciesPage() {
  const nowMonth = new Date().getUTCMonth() + 1;
  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] uppercase tracking-[0.2em] text-[color:var(--copper)]">Who swims where</p>
        <h1 className="mt-1 font-heading text-4xl text-[color:var(--cream)] md:text-5xl">Species</h1>
        <p className="mt-2 max-w-2xl text-sm text-[color:var(--cream)]/65">
          Doctrine from the Field Manual, limits from TPWD Outdoor Annual 2025–26 and FWC. Bahamas
          flats fish are treated as catch-and-release. The year bar is peak (copper) versus present
          (wash). The thermal strip is the fish’s window, not today’s gauge.
        </p>
        <Waterline className="mt-3" />
        <div className="mt-3">
          <MonthHeatLegend />
        </div>
      </div>
      <div className="grid gap-4">
        {SPECIES.map((s) => (
          <article key={s.id} className="rounded-3xl border border-[color:var(--line)] bg-[color:var(--panel)] p-5">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <div>
                <h2 className="font-heading text-2xl text-[color:var(--cream)]">{s.commonName}</h2>
                <p className="text-sm italic text-[color:var(--cream)]/45">{s.latin}</p>
              </div>
              <div className="flex gap-1">
                {s.theaters.map((t) => (
                  <Badge key={t} variant="secondary" className="bg-white/5 capitalize text-[color:var(--cream)]/70">
                    {t === "florida" ? "Miami & Keys" : t}
                  </Badge>
                ))}
              </div>
            </div>
            <MonthHeat className="mt-4" peak={s.peakMonths} present={s.presentMonths} nowMonth={nowMonth} />
            <TempBar
              className="mt-4"
              label="Thermal window"
              tempF={null}
              min={s.tempMin - 4}
              max={s.tempMax + 4}
              opt={s.tempOpt}
              detail={`${s.tempMin}–${s.tempMax}°F · best ${s.tempOpt[0]}–${s.tempOpt[1]}°F`}
            />
            <p className="mt-3 text-[color:var(--cream)]/75">{s.why}</p>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <p className="text-sm text-[color:var(--cream)]/65">
                <span className="text-[color:var(--copper)]">Fly. </span>
                {s.flyNote}
              </p>
              <p className="text-sm text-[color:var(--cream)]/65">
                <span className="text-[color:var(--copper)]">Spin. </span>
                {s.spinNote}
              </p>
            </div>
            <p className="mt-3 text-xs text-[color:var(--cream)]/45">
              {s.regulation}{" "}
              <a className="underline decoration-[color:var(--copper)]/50" href={s.regulationUrl}>
                Official source
              </a>
            </p>
          </article>
        ))}
      </div>
    </div>
  );
}
