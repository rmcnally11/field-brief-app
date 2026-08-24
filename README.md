# Field Brief

Inshore and offshore conditions for seven theaters: the **Texas coast**, **Louisiana**, **Florida** (Keys, Boca Grande, Jupiter), the **Bahamas**, **Mexico** (Yucatan flats + Baja), **Puerto Rico**, and the **Seychelles**. The brief tells you **where**, **when**, and **why** fish should be on a given piece of water — and which species are actually in play.

GitHub: [rmcnally11/field-brief-app](https://github.com/rmcnally11/field-brief-app). Live site: [field-brief-app.vercel.app](https://field-brief-app.vercel.app). Substack bots: [SUBSTACK.md](./SUBSTACK.md). Twitter / X bots: [TWITTER.md](./TWITTER.md) (morning + calendar screenshots of `/card`). Live rules: [/for-the-letter](https://field-brief-app.vercel.app/for-the-letter). Your three My Maps are imported as cream pins:

- [GULF ATLAS! - FISH](https://www.google.com/maps/d/u/0/edit?mid=1eqN2MMRViRbG4xwKDcL0Tzotogjcktw&usp=sharing)
- [FL Keys — zones, wrecks, humps, bridges](https://www.google.com/maps/d/u/0/edit?mid=1nn7DQ_IHmDLXRUFsatM4hj9zIqmaUg4&usp=sharing)
- [Texas corridors / jetties / flats](https://www.google.com/maps/d/u/0/edit?mid=18vm3y2qy_rT3-xeMZcJ1w_cv4i5FyxI&usp=sharing)

This is a conditions instrument, not a bite guarantee and not a chart for navigation.

## What it does

- Live **NOAA CO-OPS** tides, observed water level, water temperature, and station wind on Texas and Florida gauges.
- **Wind versus the table**: observed minus predicted water. On the Texas coast the wind often *is* the tide.
- **NWS** marine/hourly weather (U.S.) and **Open-Meteo** (Bahamas, Mexico, Seychelles) — wind **and rain / thunderstorms**.
- Visual instruments on the brief: **tide curve**, **moon disk**, **wind compass**, **score ring**, water-temp bar, and a **14-day upcoming strip**.
- **Weekly Field Letter** (`/newsletter`) — one live desk per theater you elect (Galveston, Venice, Islamorada, Andros, Ascension, San Juan, Alphonse). A Texas-only reader does not see Andros or Seychelles. Peaks and harvest closures follow the same coasts.
- **Seasonal fundamentals** (`/fundamentals`) — doctrine by the coasts you elected, then water type (fly / spin / sight / wade / skiff / rocks / marsh / skinny), species, and month.
- Two-month **1–10 calendar** by micro-area: this month and next. Tap a day for that date’s brief. Copper outline = amazing day. The monthly **YOLO** day is the best remaining **dry** day with a real wind forecast. Rain and thunderstorms tax the score; a soaker cannot be a copper day.
- **Stay or drive** (`/compare`) — two desks, one morning.
- **Morning line** (`/morning`) — one sentence you can copy or mail. No SMS on Hobby.
- Last theater / area / method is remembered in a cookie.
- Weekly Field Letter has a Saturday permalink (`/newsletter/YYYY-MM-DD`) and a short archive.
- Satellite chart (Esri imagery) with official layers and your My Maps. Pick a micro-area and the camera zooms to that water only — Flamingo does not keep Islamorada lit.
- Filters for **wade / skiff / kayak / fly / spin / jetty / offshore** (troll, edge, deep jig).
- Official map layers:
  - **USGS GNIS** — canonical names and coordinates for passes, bays, channels
  - **NOAA ENC Direct** — charted wrecks and obstructions
  - **NOAA FKNMS** — Sanctuary Preservation Areas, Ecological Reserves, Research-Only water (the legal red polygons)
  - **TPWD / Texas GLO / NPS PINS** — public ramps, beach-access corridors, Padre Island driving rules

Species doctrine follows the Flats Field Manual (Texas, Keys, Bahamas). Bag and season notes cite the **TPWD Outdoor Annual (Sep 1, 2025–Aug 31, 2026)** and **FWC**. Always verify before you keep a fish.

## Run it

```bash
npm install
npm run dev -- --port 43217 --hostname 127.0.0.1
```

Open [http://127.0.0.1:43217](http://127.0.0.1:43217). The **brief**, **calendar**, and **map** are public. A shared-word door still sits in front of compare, morning, species, method, and season (Hobby-friendly — not Vercel’s paid Password Protection). Set `SITE_PASSWORD` to change the word. Leave it unset and the shipped default is used.

No API keys for the gauges. NOAA, NWS, USGS, and Open-Meteo are public. NWS requires a User-Agent, which the app sends. The 5am email needs Resend if you want it to leave the machine (see below).

## A real URL (Vercel)

This repo does **not** auto-deploy. The Preview you see in Cursor is this cloud VM. To get an `https://….vercel.app` link:

1. Import `rmcnally11/field-brief-app` in [vercel.com](https://vercel.com). Production branch is `main`.
2. Framework: Next.js. Optional: `SITE_PASSWORD` to change the shared door word (compare / morning / species / method / season / list). For the list and mail: `AIRTABLE_API_KEY` (PAT on the Field Brief base), `RESEND_API_KEY`, `RESEND_FROM`, `SUBSCRIBER_EMAILS`, `CRON_SECRET`.
3. After the first deploy, every `git push` to the connected branch rebuilds the site.

There is no nightly site rebuild. Code updates when someone pushes. Conditions update when someone opens a page (see below).

## How the water updates

Not a nightly batch. Each Brief / Calendar / Map load hits live gauges, then caches for a few minutes so a refresh is not a stampede:

| Feed | Freshness |
| --- | --- |
| NOAA CO-OPS tides, observed water, station wind, water temp | ~5 minutes |
| NWS hourly forecast (U.S.) — wind, sky, rain chance | ~10 minutes |
| NWS active alerts at the desk point | ~5 minutes |
| NWS point metadata | ~30 minutes |
| Open-Meteo (wind, precip, weather code; always fetched in parallel so NOAA wind never blanks the sky) | ~10 minutes |
| USGS IV discharge (`00060`) on Texas / Louisiana river mouths | ~15 minutes |
| USGS GNIS / NOAA ENC / FKNMS polygons | ~1 hour |
| Moon phase | computed from the clock, every load |
| Calendar days past the wind forecast | tide + moon + season only (labeled astronomical) |

The page stays live. Texas wind versus the table changes inside a morning. The 5am email is a snapshot of that same live brief, not a separate overnight batch.

## The list — signup, the table, and the 5am email

Others can subscribe. The form is public on the brief and the letter (`/newsletter`). `/morning` still sits behind the hobby door.

There **is** a managed table: [Field Brief → Subscribers](https://airtable.com/app3GRvkkpJdnVIKy/tblqoCAVvAvEFYMe6) in the Costal Cavaliers workspace. Columns: Email, Desks, Cadence (`Daily` / `Weekly` / `Seasonal`), Status (`Active` / `Paid` / `Unsubscribed`), Source, Joined, Notes. `Paid` is the monetize hook — same list, later a charge. A gated `/subscribers` page in the app shows the same rows.

Signup elects **coasts** and **cadence**. Default is the water on the page (Texas / Galveston on a cold letter visit), not all seven desks. A Texas-only fisherman does not get Andros or Seychelles in the 5am line, the Saturday letter, or the season page. `fb_coasts` remembers that election the same way `fb_water` remembers the last desk. Letter chips (`/newsletter?coasts=texas`) and `?theater=` on `/fundamentals` write the cookie.

**How you get the email.** You are a row on that table (operator). Nothing lands in your inbox until sending is on. Fastest path: add `RESEND_API_KEY` + a verified `RESEND_FROM` on Vercel, and `AIRTABLE_API_KEY` (an Airtable PAT scoped to this base) so the cron can read the table. You can also put your address in `SUBSCRIBER_EMAILS` as a belt-and-suspenders (that env list still receives every desk).

**How others get the email.** They submit the public form. With `AIRTABLE_API_KEY` on Vercel, the row is upserted in Airtable with the desks and cadence they picked. At 10:00 UTC the cron generates the live morning line and Resend sends **Daily** addresses the desks they elected. On Saturday (Chicago) the same Hobby cron sends **Weekly** addresses a letter that only includes those desks. **Seasonal** is the fundamentals page (and the month block inside the Saturday letter). Without the Airtable token, a production signup only lives on that one Vercel instance and is lost. Without Resend, the cron writes `data/outbox/` and nobody’s inbox moves.

There is no nightly rebuild of the gauges. The mailer asks the same `getBriefing()` + `morningLine()` the `/morning` page does. Hobby cron is daily (`0 10 * * *` = 5:00 a.m. Galveston CDT). `CRON_HOURLY=1` plus an hourly ping sends each desk only at local 05:00. `?force=1` and `?desk=galveston` are daily tests. `?weekly=1` forces the Saturday letter. No SMS on Hobby. Do not commit addresses.

## Theaters and micro-areas

**Texas:** Sabine · Galveston · Matagorda · Rockport / Aransas · Corpus · Baffin / Upper Laguna · Lower Laguna Madre

**Louisiana:** Venice / Birdfoot · Grand Isle / Barataria · Calcasieu / Cameron

**Florida:** Biscayne (Miami) · Key Largo / Pennekamp · Islamorada · Florida Bay / Flamingo · Marathon · Key West · Boca Grande / Charlotte Harbor · Jupiter / Loxahatchee

**Bahamas:** Andros · Abaco · Grand Bahama · Eleuthera

**Mexico:** Ascension Bay / Sian Ka’an · Isla Mujeres / Cancún bank · East Cape / Los Barriles · La Paz / Espíritu Santo

**Puerto Rico:** San Juan / Condado · Vieques / Culebra · La Parguera / southwest

**Seychelles:** Alphonse / St François · Farquhar Atoll · Inner islands / Mahé

Bahamas, Mexico, and Seychelles tides are a modeled lunar tide, labeled as such. There is no NOAA gauge on those coasts. Puerto Rico uses live NOAA CO-OPS (San Juan, Vieques, Magueyes).

## Official sources we cite

| Source | Use |
| --- | --- |
| [NOAA CO-OPS](https://api.tidesandcurrents.noaa.gov/) | Tides, water temp, station wind |
| [NWS API](https://www.weather.gov/documentation/services-web-api) | U.S. wind, sky, rain chance, thunderstorms, active marine/flood alerts |
| [Open-Meteo](https://open-meteo.com/) | Wind and precip where NWS does not cover (Bahamas, Mexico, Seychelles) |
| [USGS GNIS](https://www.usgs.gov/tools/geographic-names-information-system-gnis) | Named-feature coordinates (pins snapped where the hydro layer has a Feature ID) |
| [USGS NWIS IV](https://waterservices.usgs.gov/) | River discharge (`00060`) — Trinity, Sabine, Colorado, Nueces, Mississippi at Belle Chasse, Calcasieu |
| [TxGIO](https://data.geographic.texas.gov/) | State clearinghouse (formerly TNRIS) for TPWD coastal GIS |
| [NOAA ENC Direct](https://gis.charttools.noaa.gov/arcgis/rest/services/encdirect) | Wrecks / obstructions |
| [NOAA FKNMS GIS](https://sanctuaries.noaa.gov/library/imast_gis.html) | Legal sanctuary zones |
| [TPWD Outdoor Annual](https://tpwd.texas.gov/regulations/outdoor-annual/) | Texas bag/season |
| [TPWD launches](https://tpwd.texas.gov/fishboat/boat/launch/) | Public ramps |
| [Texas GLO beach access](https://www.glo.texas.gov/coast/coastal-management/beach-access) | Drive-on beaches, county 2WD/4WD plans |
| [NPS Padre Island](https://www.nps.gov/pais/planyourvisit/beach-driving.htm) | PINS driving / camping |
| [FWC](https://myfwc.com/fishing/saltwater/recreational/) | Florida bonefish, permit, snook, redfish |
| [LDWF recreational saltwater](https://www.wlf.louisiana.gov/page/recreational-saltwater-finfish) | Louisiana bag, slot, and flounder season |
| [CONAPESCA](https://www.gob.mx/conapesca) | Mexico recreational license and harvest rules |
| [DNER Puerto Rico](https://www.drna.pr.gov/) | Puerto Rico recreational license and reserves |
| [Seychelles Fishing Authority](https://www.sfa.sc/) | Seychelles license and harvest rules |

The TPWD coastal-ramp GIS and the GLO Beach & Bay Access feature service are the right legal inventories; the public TAMU ramp layer we tested is inland only, and the GLO Hub query required a token. Those go live when the open endpoints are reachable. Drop a Google My Maps **KML** into the project to add your saved structure as a layer — no matching export was in Drive.

## Stack

Next.js (App Router), TypeScript, Tailwind, shadcn/ui, Leaflet.
