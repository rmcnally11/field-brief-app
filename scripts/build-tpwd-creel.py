#!/usr/bin/env python3
"""Rebuild data/tpwd-creel.json from Collins et al. 2026 (PLOS One).

Interview-level observed harvest on parties that said they were fishing for
redfish, spotted seatrout, or red snapper. 1991–2023. Not expanded landings.
TPWD still interviews year-round; this public extract does not update with the tide.
"""

from __future__ import annotations

import csv
import io
import json
import zipfile
from collections import defaultdict
from pathlib import Path
from statistics import mean
from urllib.request import Request, urlopen

SRC = (
    "https://journals.plos.org/plosone/article/file"
    "?id=10.1371/journal.pone.0344688.s001&type=supplementary"
)
AREA = {
    "1": ("sabine", "Sabine Lake"),
    "2": ("galveston", "Galveston Bay"),
    "3": ("matagorda", "Matagorda Bay"),
    "4": ("san-antonio", "San Antonio Bay"),
    "5": ("aransas", "Aransas Bay"),
    "6": ("corpus", "Corpus Christi Bay"),
    "7": ("baffin", "Upper Laguna Madre"),
    "8": ("lower-laguna", "Lower Laguna Madre"),
}
SPECIES = {
    "RD": ("redfish", "Redfish", "bay"),
    "SST": ("speckled-trout", "Speckled trout", "bay"),
    "RS": ("red-snapper", "Red snapper", "gulf"),
}


def load_csv() -> list[dict[str, str]]:
    dest = Path("/tmp/tpwd/creel.csv")
    dest.parent.mkdir(parents=True, exist_ok=True)
    if not dest.exists():
        req = Request(SRC, headers={"User-Agent": "OnThisWater/1.0 (https://onthiswater.com)"})
        blob = urlopen(req, timeout=120).read()
        with zipfile.ZipFile(io.BytesIO(blob)) as zf:
            name = zf.namelist()[0]
            dest.write_bytes(zf.read(name))
    with dest.open(newline="") as f:
        return list(csv.DictReader(f))


def rollup(rows: list[dict[str, str]], era: str) -> dict:
    interviews: dict[tuple[str, str, str], int] = defaultdict(int)
    fish: dict[tuple[str, str, str], float] = defaultdict(float)
    with_catch: dict[tuple[str, str, str], int] = defaultdict(int)
    lengths: dict[tuple[str, str, str], list[float]] = defaultdict(list)
    hours: dict[tuple[str, str, str], float] = defaultdict(float)
    years: dict[tuple[str, str], list[int]] = defaultdict(list)

    for row in rows:
        year = int(row["Year"])
        if era == "late" and year < 2019:
            continue
        bay = row["Bay"]
        season = "high" if row["Season"] == "High_use" else "low"
        sp = row["Species"]
        key = (bay, season, sp)
        interviews[key] += 1
        caught = float(row["Total_Catch"] or 0)
        fish[key] += caught
        if caught > 0:
            with_catch[key] += 1
        length = (row.get("Catch_length") or "").strip()
        if length:
            lengths[key].append(float(length))
        hours[key] += float(row["Trip_Length"] or 0) * float(row["Anglers"] or 0)
        years[(bay, season)].append(year)

    out = {}
    for code, (area_id, system) in AREA.items():
        seasons = {}
        all_iv = 0
        all_fish = 0
        for season in ("high", "low"):
            ys = years.get((code, season), [])
            if not ys:
                continue
            species_rows = []
            iv = 0
            tot = 0.0
            for raw, (sid, label, water) in SPECIES.items():
                key = (code, season, raw)
                n = interviews.get(key, 0)
                if not n:
                    continue
                caught = fish[key]
                iv += n
                tot += caught
                hr = hours[key]
                ls = lengths[key]
                species_rows.append(
                    {
                        "id": sid,
                        "name": label,
                        "water": water,
                        "catch": int(round(caught)),
                        "interviews": n,
                        "perInterview": round(caught / n, 2),
                        "pctInterviews": round(100 * with_catch[key] / n, 1),
                        "perAnglerHour": round(caught / hr, 3) if hr else 0,
                        "meanInches": round(mean(ls) / 25.4, 1) if ls else None,
                    }
                )
            species_rows.sort(key=lambda r: -r["catch"])
            seasons[season] = {
                "interviews": iv,
                "fish": int(round(tot)),
                "yearStart": min(ys),
                "yearEnd": max(ys),
                "species": species_rows,
            }
            all_iv += iv
            all_fish += int(round(tot))
        out[area_id] = {
            "system": system,
            "majorArea": int(code),
            "interviews": all_iv,
            "fish": all_fish,
            "seasons": seasons,
        }
    return out


def main() -> None:
    rows = load_csv()
    payload = {
        "source": "Collins et al. 2026 — PLOS One e0344688 (TPWD creel intercepts)",
        "doi": "https://doi.org/10.1371/journal.pone.0344688",
        "href": "https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0344688",
        "program": "https://tpwd.texas.gov/fishboat/fish/didyouknow/coastal/creel.phtml",
        "gear": "TPWD Marine Sport-Harvest Monitoring Program — dockside interview",
        "protocol": (
            "Public ramps and wet slips. Parties that said they were fishing for redfish, "
            "trout, or snapper. Observed harvest of that fish — not expanded landings, "
            "not discards, not every boat at the ramp."
        ),
        "yearStart": 1991,
        "yearEnd": 2023,
        "published": "2026-06-15",
        "cadence": (
            "TPWD still interviews year-round, 10:00–18:00, about 1,000 survey-days and "
            "14,000 interviews a year. This public extract is targeting trips, 1991–2023. "
            "It does not update with the tide."
        ),
        "all": rollup(rows, "all"),
        "late": rollup(rows, "late"),
    }
    dest = Path(__file__).resolve().parents[1] / "data" / "tpwd-creel.json"
    dest.write_text(json.dumps(payload, indent=2) + "\n")
    print(f"wrote {dest} ({dest.stat().st_size} bytes)")


if __name__ == "__main__":
    main()
