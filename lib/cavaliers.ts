export const COASTAL_CAVALIERS = "https://coastalcavaliers.com";

export function cavalierHref() {
  const url = new URL(COASTAL_CAVALIERS);
  url.searchParams.set("utm_source", "onthiswater");
  url.searchParams.set("utm_medium", "handoff");
  return url.toString();
}
