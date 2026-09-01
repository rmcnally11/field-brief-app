export const PRODUCT_NAME = "On This Water";
export const LETTER_NAME = "Saturday";
export const PRODUCT_LINE = "This morning on your water.";
export const PRODUCT_DOMAIN = "onthiswater.com";
export const GITHUB_REPO = "https://github.com/rmcnally11/field-brief-app";
export const USER_AGENT = "OnThisWater/1.0 (inshore conditions; https://onthiswater.com)";

export function siteOrigin(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || `https://${PRODUCT_DOMAIN}`).replace(/\/$/, "");
}
