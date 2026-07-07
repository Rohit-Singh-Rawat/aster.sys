/**
 * Site identity — single source for metadata, SEO routes, and JSON-LD.
 * Set NEXT_PUBLIC_SITE_URL to the production domain in the deployment env.
 */
export const SITE_NAME = "aster";
export const SITE_TITLE = "aster | interaction systems";
export const SITE_DESCRIPTION =
  "Components are easy to copy. Interaction isn't. Primitives engineered as interaction systems.";
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
export const GITHUB_REPO = "Rohit-Singh-Rawat/aster.sys";
export const GITHUB_URL = `https://github.com/${GITHUB_REPO}`;
