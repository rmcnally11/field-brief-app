# Field Brief

Inshore conditions for three theaters: the **Texas coast**, **Miami & the Florida Keys**, and the **Bahamas**. The brief tells you **where**, **when**, and **why** fish should be on a given piece of water — and which species are actually in play.

This is a conditions instrument, not a bite guarantee and not a chart for navigation.

## What it does

- Live **NOAA CO-OPS** tides, observed water level, water temperature, and station wind on Texas and Florida gauges.
- **Wind versus the table**: observed minus predicted water. On the Texas coast the wind often *is* the tide.
- **NWS** marine/hourly weather (U.S.) and **Open-Meteo** (Bahamas).
- Monthly **1–10 calendar** by micro-area. Days inside the forecast use wind; days beyond that are tide + moon + season only.
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
