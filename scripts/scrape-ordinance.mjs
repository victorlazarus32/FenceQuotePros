// CLI: scrape a Municode (or any JS-rendered) ordinance page via Firecrawl
// and write the result to scraped/<slug>-<timestamp>.md.
//
// Usage:
//   npm run scrape -- "https://library.municode.com/fl/hialeah/codes/code_of_ordinances?nodeId=..."
//
// Requires FIRECRAWL_API_KEY in .env (or ambient env).

import "dotenv/config";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import Firecrawl from "@mendable/firecrawl-js";

const url = process.argv[2];
if (!url) {
  console.error("usage: npm run scrape -- <url>");
  process.exit(1);
}

const apiKey = process.env.FIRECRAWL_API_KEY;
if (!apiKey) {
  console.error(
    "FIRECRAWL_API_KEY is not set. Add it to .env (next to dev.db) and try again.",
  );
  process.exit(1);
}

const fc = new Firecrawl({ apiKey });

console.log(`scraping  ${url}`);
const doc = await fc.scrape(url, {
  formats: ["markdown"],
  waitFor: 2500,
  onlyMainContent: true,
});

const markdown = doc?.markdown ?? "";
const title = doc?.metadata?.title ?? "untitled";

if (!markdown) {
  console.error("Firecrawl returned no markdown. Raw response:");
  console.error(JSON.stringify(doc, null, 2).slice(0, 800));
  process.exit(2);
}

// Write to scraped/<slug>-<timestamp>.md so we can inspect / commit / re-read
// without re-hitting Firecrawl. Filename is derived from the URL's last
// nodeId or path segment.
const slug = (() => {
  try {
    const u = new URL(url);
    const node = u.searchParams.get("nodeId");
    if (node) return node.replace(/[^a-z0-9_-]/gi, "_").slice(0, 80);
    return u.pathname.replace(/[^a-z0-9_-]/gi, "_").slice(0, 80) || "page";
  } catch {
    return "page";
  }
})();
const ts = new Date().toISOString().replace(/[:.]/g, "-");
const dir = resolve("scraped");
await mkdir(dir, { recursive: true });
const out = resolve(dir, `${slug}_${ts}.md`);

const header = [
  `<!--`,
  `URL: ${url}`,
  `Title: ${title}`,
  `Fetched: ${new Date().toISOString()}`,
  `-->`,
  ``,
  `# ${title}`,
  ``,
].join("\n");

await writeFile(out, header + markdown, "utf8");

console.log(`wrote     ${out}  (${markdown.length} chars)`);
console.log(`title:    ${title}`);
console.log(`preview:`);
console.log(markdown.slice(0, 600).replace(/^/gm, "  "));
