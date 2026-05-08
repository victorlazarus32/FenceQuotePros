// Firecrawl wrapper — fetches JS-rendered pages (e.g. Municode chapter pages)
// and returns markdown. Used for ordinance research into municipalities whose
// code site is a React/SPA that resists plain HTTP fetch.

import Firecrawl from "@mendable/firecrawl-js";

let client: Firecrawl | null = null;

function getClient(): Firecrawl {
  if (!client) {
    const apiKey = process.env.FIRECRAWL_API_KEY;
    if (!apiKey) {
      throw new Error(
        "FIRECRAWL_API_KEY is not set. Add it to .env (next to dev.db) before scraping.",
      );
    }
    client = new Firecrawl({ apiKey });
  }
  return client;
}

export type ScrapeResult = {
  url: string;
  markdown: string;
  title?: string;
  fetchedAt: Date;
};

/**
 * Scrape a single URL and return its rendered markdown content.
 * Lets the caller pass through any Firecrawl scrape options if needed
 * (e.g. waitFor selector, custom headers).
 */
export async function scrapeUrl(
  url: string,
  options: {
    waitForMs?: number;
    onlyMainContent?: boolean;
  } = {},
): Promise<ScrapeResult> {
  const fc = getClient();
  const doc = await fc.scrape(url, {
    formats: ["markdown"],
    waitFor: options.waitForMs ?? 1500,
    onlyMainContent: options.onlyMainContent ?? true,
  });

  const markdown =
    typeof doc === "object" && doc !== null && "markdown" in doc
      ? String(doc.markdown ?? "")
      : "";
  const title =
    typeof doc === "object" &&
    doc !== null &&
    "metadata" in doc &&
    typeof doc.metadata === "object" &&
    doc.metadata !== null &&
    "title" in doc.metadata
      ? String(doc.metadata.title ?? "")
      : undefined;

  return {
    url,
    markdown,
    title,
    fetchedAt: new Date(),
  };
}
