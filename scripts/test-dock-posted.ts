import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { dockPostedHomeHref, fuelHref, fuelMailLine } from "../lib/dock-posted.ts";

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

const root = process.cwd();
const brief = readFileSync(path.join(root, "components/briefing-panel.tsx"), "utf8");
assert.match(brief, /DockPostedHandoff/);
assert.match(brief, /area\.theater/);
assert.match(brief, /area\.id/);

const morning = readFileSync(path.join(root, "app/(app)/morning/page.tsx"), "utf8");
assert.match(morning, /DockPostedHandoff/);
assert.match(morning, /briefing\.area\.theater/);

const footer = readFileSync(path.join(root, "components/site-footer.tsx"), "utf8");
assert.match(footer, /dockPostedHomeHref/);
assert.match(footer, /data-testid="dock-posted-credit"/);

const mail = readFileSync(path.join(root, "lib/mail.ts"), "utf8");
assert.match(mail, /fuelMailLine/);
assert.match(mail, /fuelMailHtml/);
assert.doesNotMatch(mail, /\/run\?corridor/);

console.log("dock-posted sister tests passed");
