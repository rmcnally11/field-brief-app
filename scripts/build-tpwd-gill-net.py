#!/usr/bin/env python3
"""Rebuild data/tpwd-gill-net.json from the BCO-DMO / WHOI TSV.

TPWD still samples twice a year. This public compilation ends in 2019.
Do not treat the output as this morning's water.
"""

from __future__ import annotations

import csv
import json
from collections import defaultdict
from pathlib import Path
from urllib.request import Request, urlopen

SRC = (
    "https://darchive.mblwhoilibrary.org/server/api/core/bitstreams/"
    "8a989db6-0d46-5356-8976-7e1ed52a7cde/content"
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
    "Red drum": ("redfish", "Redfish"),
    "Spotted seatrout": ("speckled-trout", "Speckled trout"),
    "Southern flounder": ("flounder", "Southern flounder"),
    "Black drum": ("black-drum", "Black drum"),
    "Sheepshead": ("sheepshead", "Sheepshead"),
}


def season(month: str) -> str | None:
    m = int(month)
    if m in (4, 5, 6):
        return "spring"
    if m in (9, 10, 11):
        return "fall"
    return None


def load_rows(path: Path):
    sets = {}
    catch: dict[tuple, int] = defaultdict(int)
    with path.open(newline="") as f:
        for row in csv.DictReader(f, delimiter="\t"):
            sid = row["Sample_ID"]
            seas = season(row["Month"])
            if not seas:
                continue
            sets[sid] = {
                "area": row["Major_Area"],
                "year": int(row["Year"]),
                "season": seas,
            }
            catch[(row["Major_Area"], seas, sid, row["Species_Common_Name"])] += int(
                float(row["Catch"] or 0)
            )
    return sets, catch


def rollup(sets, catch, era: str):
    sets_by = defaultdict(set)
    for sid, meta in sets.items():
        if era == "late" and meta["year"] < 2015:
            continue
        sets_by[(meta["area"], meta["season"])].add(sid)
    out = {}
    for code, (area_id, system) in AREA.items():
        all_sids: set[str] = set()
        seasons = {}
        for seas in ("spring", "fall"):
            sids = sets_by[(code, seas)]
            if not sids:
                continue
            all_sids |= sids
            years = sorted(sets[s]["year"] for s in sids)
            total_fish = sum(
                n for (a, se, sid, _name), n in catch.items() if a == code and se == seas and sid in sids
            )
            rows = []
            for raw, (sid, label) in SPECIES.items():
                tot = 0
                seen = 0
                for sample in sids:
                    n = catch.get((code, seas, sample, raw), 0)
                    tot += n
                    if n:
                        seen += 1
                nset = len(sids)
                rows.append(
                    {
                        "id": sid,
                        "name": label,
                        "catch": tot,
                        "perSet": round(tot / nset, 2) if nset else 0,
                        "setsPresent": seen,
                        "pctSets": round(100 * seen / nset, 1) if nset else 0,
                    }
                )
            rows.sort(key=lambda r: -r["catch"])
            seasons[seas] = {
                "sets": len(sids),
                "fish": total_fish,
                "yearStart": years[0],
                "yearEnd": years[-1],
                "species": rows,
            }
        out[area_id] = {
            "system": system,
            "majorArea": int(code),
            "sets": len(all_sids),
            "fish": sum(n for (a, _se, sid, _n), n in catch.items() if a == code and sid in all_sids),
            "seasons": seasons,
        }
    return out


def main():
    raw = Path("/tmp/tpwd/gill.tsv")
    raw.parent.mkdir(parents=True, exist_ok=True)
    if not raw.exists():
        req = Request(SRC, headers={"User-Agent": "OnThisWater/1.0 (https://onthiswater.com)"})
        raw.write_bytes(urlopen(req, timeout=120).read())
    sets, catch = load_rows(raw)
    payload = {
        "source": "BCO-DMO dataset 828794 — Fujiwara & Martinez-Andrade 2020",
        "doi": "https://doi.org/10.26008/1912/bco-dmo.828794.1",
        "href": "https://www.bco-dmo.org/dataset/828794",
        "gear": "TPWD Coastal Fisheries gill net",
        "protocol": "45 overnight shoreline sets per bay per season. Random 1-minute grids. Not a honey-hole map.",
        "yearStart": 1982,
        "yearEnd": 2019,
        "published": "2020-12-18",
        "cadence": "TPWD still sets spring (Apr–Jun) and fall (Sep–Nov). This public file ends in 2019. It does not update with the tide.",
        "all": rollup(sets, catch, "all"),
        "late": rollup(sets, catch, "late"),
    }
    dest = Path(__file__).resolve().parents[1] / "data" / "tpwd-gill-net.json"
    dest.write_text(json.dumps(payload, indent=2) + "\n")
    print(f"wrote {dest} ({dest.stat().st_size} bytes)")


if __name__ == "__main__":
    main()
