import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { dockPostedHomeHref, fuelHref, fuelMailLine } from "../lib/dock-posted.ts";
import { morningHref } from "../lib/hrefs.ts";
import { cavalierHref } from "../lib/cavaliers.ts";

const galveston = fuelHref({ theater: "texas", areaId: "galveston" });
assert.equal(galveston.label, "Galveston posted fuel");
assert.match(galveston.href, /corridor=galveston-bay/);
assert.match(galveston.href, /#board/);
assert.match(galveston.href, /utm_source=onthiswater/);
assert.match(galveston.href, /utm_medium=handoff/);
assert.doesNotMatch(galveston.href, /\/run/);

assert.equal(fuelHref({ theater: "texas", areaId: "sabine" }).label, "Texas posted fuel");
assert.match(fuelHref({ theater: "texas", areaId: "sabine" }).href, /region=texas/);
assert.match(fuelHref({ theater: "texas", areaId: "aransas" }).href, /region=texas/);
assert.match(fuelHref({ theater: "florida", areaId: "key-largo" }).href, /corridor=upper-keys/);
assert.match(fuelHref({ theater: "florida", areaId: "islamorada" }).href, /region=keys/);
assert.match(fuelHref({ theater: "florida", areaId: "key-west" }).href, /region=keys/);
assert.match(fuelHref({ theater: "louisiana", areaId: "venice" }).href, /region=louisiana/);
assert.match(fuelHref({ theater: "florida", areaId: "boca-grande" }).href, /region=west-florida/);
assert.match(fuelHref({ theater: "florida", areaId: "biscayne" }).href, /region=east-florida/);
assert.equal(fuelHref({ theater: "bahamas", areaId: "andros" }).label, "US posted fuel");
assert.match(fuelHref({ theater: "bahamas", areaId: "andros" }).href, /#board/);
assert.doesNotMatch(fuelHref({ theater: "bahamas", areaId: "andros" }).href, /corridor=|region=/);
assert.match(dockPostedHomeHref(), /#board/);
assert.match(dockPostedHomeHref(), /utm_source=onthiswater/);
assert.doesNotMatch(dockPostedHomeHref(), /\/run/);
assert.match(fuelMailLine({ theater: "texas", areaId: "galveston" }), /corridor=galveston-bay/);
assert.doesNotMatch(fuelMailLine({ theater: "texas", areaId: "galveston" }), /\/run/);

assert.equal(morningHref({ areaId: "galveston", theater: "texas" }), "/morning/galveston");
assert.equal(
  morningHref({ areaId: "galveston", theater: "texas", date: "2026-09-04" }),
  "/morning/galveston/2026-09-04",
);
assert.equal(
  morningHref({ areaId: "islamorada", activity: "fly" }),
  "/morning/islamorada?activity=fly",
);
assert.match(cavalierHref(), /coastalcavaliers\.com/);
assert.match(cavalierHref(), /utm_source=onthiswater/);

const root = process.cwd();
const brief = readFileSync(path.join(root, "components/briefing-panel.tsx"), "utf8");
assert.match(brief, /DockPostedHandoff/);
assert.match(brief, /area\.theater/);
assert.match(brief, /area\.id/);

const desk = readFileSync(path.join(root, "components/morning-desk.tsx"), "utf8");
assert.match(desk, /DockPostedHandoff/);
assert.match(desk, /CavalierHandoff/);
assert.match(desk, /This morning on/);
assert.match(desk, /\/morning\//);

const handoff = readFileSync(path.join(root, "components/dock-posted-handoff.tsx"), "utf8");
assert.match(handoff, /What they posted on the pump/);
assert.match(handoff, /marina fuel on this water/);

const footer = readFileSync(path.join(root, "components/site-footer.tsx"), "utf8");
assert.match(footer, /dockPostedHomeHref/);
assert.match(footer, /data-testid="dock-posted-credit"/);
assert.match(footer, /marina fuel on this water/);

const mail = readFileSync(path.join(root, "lib/mail.ts"), "utf8");
assert.match(mail, /fuelMailLine/);
assert.match(mail, /fuelMailHtml/);
assert.doesNotMatch(mail, /\/run\?corridor/);

const robots = readFileSync(path.join(root, "app/robots.ts"), "utf8");
assert.match(robots, /sitemap\.xml/);
assert.match(robots, /siteOrigin/);

const sitemap = readFileSync(path.join(root, "app/sitemap.ts"), "utf8");
assert.match(sitemap, /morning\/\$\{area/);
assert.doesNotMatch(sitemap, /vercel\.app/);

console.log("dock-posted sister tests passed");
