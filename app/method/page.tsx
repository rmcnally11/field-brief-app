export default function MethodPage() {
  return (
    <div className="prose prose-invert max-w-3xl space-y-6 text-[color:var(--cream)]/80">
      <div>
        <p className="text-[11px] uppercase tracking-[0.2em] text-[color:var(--copper)]">Transparency</p>
        <h1 className="mt-1 font-heading text-4xl text-[color:var(--cream)]">How the score is built</h1>
      </div>
      <p>
        The brief answers three questions: <em>where</em> on this water, <em>when</em> the tide is
        moving in a usable hour, and <em>why</em> — in language tied to a gauge, not a vibe. The
        calendar is the same engine stretched across a month.
      </p>
      <h2 className="font-heading text-2xl text-[color:var(--cream)]">What is observed</h2>
      <ul className="list-disc space-y-1 pl-5 text-sm">
        <li>NOAA CO-OPS tide predictions and observed water level (MLLW) on Texas and Florida stations.</li>
        <li>NOAA water temperature and station wind where the gauge has them.</li>
        <li>NWS hourly forecast on U.S. water. Open-Meteo on the Bahamas.</li>
        <li>
          USGS GNIS names and coordinates for passes, channels, and banks. Where the hydro layer
          has a Feature ID (San Luis Pass is the exception — it is not in that layer), the pin is
          snapped to that lat/lon.
        </li>
        <li>NOAA ENC wreck / obstruction points from ENC Direct (not for navigation).</li>
        <li>NOAA FKNMS management-zone polygons — the legal red water.</li>
      </ul>
      <h2 className="font-heading text-2xl text-[color:var(--cream)]">What is inferred</h2>
      <ul className="list-disc space-y-1 pl-5 text-sm">
        <li>Species thermal windows and seasonal peaks from TPWD / FWC biology and the Field Manual.</li>
        <li>Habitat × tide matching (flood the grass, drain the creek, wrecks on the fall).</li>
        <li>Wind setup/setdown: observed minus predicted water. On the Texas coast this often is the tide.</li>
        <li>Bahamas tides are a modeled M2 — labeled as such. No NOAA gauge on those islands.</li>
      </ul>
      <h2 className="font-heading text-2xl text-[color:var(--cream)]">Activity filter</h2>
      <p className="text-sm">
        Fly and kayak pay a wind tax above ~16 mph. Wade needs standing water. Skiff loses skinny flats
        at dead low. Jetty / structure likes midday and current. Spin is what you do when the day does
        not allow the fly.
      </p>
      <h2 className="font-heading text-2xl text-[color:var(--cream)]">Official layers we still want live</h2>
      <ul className="list-disc space-y-1 pl-5 text-sm">
        <li>
          TPWD coastal ramp inventory via TxGIO (
          <a className="underline" href="https://data.geographic.texas.gov/">
            data.geographic.texas.gov
          </a>
          , formerly TNRIS) /{" "}
          <a className="underline" href="https://gis-tpwd.opendata.arcgis.com/">
            TPWD Open Data
          </a>
          . TPWD Coastal REST still requires a token. The public TAMU boat-ramp layer is inland
          lakes and rivers only. Access pins here are curated from the published TPWD launch
          directory and cited to it.
        </li>
        <li>
          Texas GLO Beach &amp; Bay Access (county 2WD/4WD plans) from{" "}
          <a className="underline" href="https://www.glo.texas.gov/coast/coastal-management/beach-access">
            glo.texas.gov
          </a>
          . Hub item is cited; a public REST query was not open without their token.
        </li>
        <li>
          NPS Padre Island driving/camping closures —{" "}
          <a className="underline" href="https://www.nps.gov/pais/planyourvisit/beach-driving.htm">
            nps.gov/pais
          </a>
          . We cite the rule; the park API needs a key.
        </li>
        <li>Your Google My Maps KML. Nothing matching a saved-map export was in Drive. Drop a KML and it becomes a layer.</li>
      </ul>
      <p className="text-sm">
        Scores are 1–10. They are not bite guarantees. A 9 in August heat still means go early. A 3
        after a norther still holds fish in the gut if you already know the water.
      </p>
    </div>
  );
}
