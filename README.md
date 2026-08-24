# Field Brief

Inshore conditions for three theaters: the **Texas coast**, **Miami & the Florida Keys**, and the **Bahamas**. The brief tells you **where**, **when**, and **why** fish should be on a given piece of water — and which species are actually in play.

GitHub: [rmcnally11/field-brief-app](https://github.com/rmcnally11/field-brief-app). Live site: [field-brief-app.vercel.app](https://field-brief-app.vercel.app). Your three My Maps are imported as cream pins:

- [GULF ATLAS! - FISH](https://www.google.com/maps/d/u/0/edit?mid=1eqN2MMRViRbG4xwKDcL0Tzotogjcktw&usp=sharing)
- [FL Keys — zones, wrecks, humps, bridges](https://www.google.com/maps/d/u/0/edit?mid=1nn7DQ_IHmDLXRUFsatM4hj9zIqmaUg4&usp=sharing)
- [Texas corridors / jetties / flats](https://www.google.com/maps/d/u/0/edit?mid=18vm3y2qy_rT3-xeMZcJ1w_cv4i5FyxI&usp=sharing)

This is a conditions instrument, not a bite guarantee and not a chart for navigation.

## What it does

- Live **NOAA CO-OPS** tides, observed water level, water temperature, and station wind on Texas and Florida gauges.
- **Wind versus the table**: observed minus predicted water. On the Texas coast the wind often *is* the tide.
- **NWS** marine/hourly weather (U.S.) and **Open-Meteo** (Bahamas).
- Visual instruments on the brief: **tide curve**, **moon disk**, **wind compass**, **score ring**, water-temp bar, and a **14-day upcoming strip**.
- Two-month **1–10 calendar** by micro-area: this month and next, with a drawn moon and tide range on every day. Copper outline = amazing day.
- Satellite chart (Esri imagery) with official layers and your My Maps.
- Filters for **wade / skiff / kayak / fly / spin / jetty**.
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

Open [http://127.0.0.1:43217](http://127.0.0.1:43217).

No API keys. NOAA, NWS, USGS, and Open-Meteo are public. NWS requires a User-Agent, which the app sends.

## A real URL (Vercel)

This repo does **not** auto-deploy. The Preview you see in Cursor is this cloud VM. To get an `https://….vercel.app` link:

1. Import `rmcnally11/field-brief-app` in [vercel.com](https://vercel.com). Production branch is `main`.
2. Framework: Next.js. No environment variables.
3. After the first deploy, every `git push` to the connected branch rebuilds the site.

There is no nightly site rebuild. Code updates when someone pushes. Conditions update when someone opens a page (see below).

## How the water updates

Not a nightly batch. Each Brief / Calendar / Map load hits live gauges, then caches for a few minutes so a refresh is not a stampede:

| Feed | Freshness |
| --- | --- |
| NOAA CO-OPS tides, observed water, station wind, water temp | ~5 minutes |
| NWS hourly forecast (U.S.) | ~10 minutes |
| NWS point metadata | ~30 minutes |
| Open-Meteo (Bahamas wind) | ~10 minutes |
| USGS GNIS / NOAA ENC / FKNMS polygons | ~1 hour |
| Moon phase | computed from the clock, every load |
| Calendar days past the wind forecast | tide + moon + season only (labeled astronomical) |

A nightly cron would only make sense later for a morning text/email (“Galveston is a 8.2, copper day”). The page itself should stay live — Texas wind versus the table changes inside a morning.

## Theaters and micro-areas

**Texas:** Sabine · Galveston · Matagorda · Rockport / Aransas · Corpus · Baffin / Upper Laguna · Lower Laguna Madre

**Florida:** Biscayne (Miami) · Islamorada · Florida Bay / Flamingo · Marathon · Key West

**Bahamas:** Andros · Abaco · Grand Bahama · Eleuthera

Bahamas tides are a modeled lunar tide, labeled as such. There is no NOAA gauge on those islands.

## Official sources we cite

| Source | Use |
| --- | --- |
| [NOAA CO-OPS](https://api.tidesandcurrents.noaa.gov/) | Tides, water temp, station wind |
| [NWS API](https://www.weather.gov/documentation/services-web-api) | U.S. forecast |
| [USGS GNIS](https://www.usgs.gov/tools/geographic-names-information-system-gnis) | Named-feature coordinates (pins snapped where the hydro layer has a Feature ID) |
| [TxGIO](https://data.geographic.texas.gov/) | State clearinghouse (formerly TNRIS) for TPWD coastal GIS |
| [NOAA ENC Direct](https://gis.charttools.noaa.gov/arcgis/rest/services/encdirect) | Wrecks / obstructions |
| [NOAA FKNMS GIS](https://sanctuaries.noaa.gov/library/imast_gis.html) | Legal sanctuary zones |
| [TPWD Outdoor Annual](https://tpwd.texas.gov/regulations/outdoor-annual/) | Texas bag/season |
| [TPWD launches](https://tpwd.texas.gov/fishboat/boat/launch/) | Public ramps |
| [Texas GLO beach access](https://www.glo.texas.gov/coast/coastal-management/beach-access) | Drive-on beaches, county 2WD/4WD plans |
| [NPS Padre Island](https://www.nps.gov/pais/planyourvisit/beach-driving.htm) | PINS driving / camping |
| [FWC](https://myfwc.com/fishing/saltwater/recreational/) | Florida bonefish, permit, snook, redfish |

The TPWD coastal-ramp GIS and the GLO Beach & Bay Access feature service are the right legal inventories; the public TAMU ramp layer we tested is inland only, and the GLO Hub query required a token. Those go live when the open endpoints are reachable. Drop a Google My Maps **KML** into the project to add your saved structure as a layer — no matching export was in Drive.

## Stack

Next.js (App Router), TypeScript, Tailwind, shadcn/ui, Leaflet.
