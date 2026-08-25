export const PRODUCT_NAME = "On This Water";
export const LETTER_NAME = "Saturday Letter";
export const PRODUCT_LINE = "The water, as it is this morning.";
export const PRODUCT_DOMAIN = "onthiswater.com";
export const GITHUB_REPO = "https://github.com/rmcnally11/field-brief-app";
export const USER_AGENT = "OnThisWater/1.0 (inshore conditions; https://onthiswater.com)";

export function siteOrigin(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || `https://${PRODUCT_DOMAIN}`).replace(/\/$/, "");
}
