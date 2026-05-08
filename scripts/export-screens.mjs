// Crawl the running Next.js server and write a self-contained static export
// to design-export/. Designed for handing off to a designer — every HTML file
// works when opened directly from disk (no dev server required).
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join, posix as posixPath } from "node:path";
import Database from "better-sqlite3";

const ORIGIN = "http://localhost:3099";
const OUT = "design-export";

// Look up real IDs so dynamic routes render
const db = new Database("./dev.db", { readonly: true });
const userId = db
  .prepare("SELECT id FROM User WHERE email = ?")
  .get("demo@fencequote.app").id;
const ests = db
  .prepare("SELECT id, number FROM Estimate WHERE userId=? ORDER BY number")
  .all(userId);
const invs = db
  .prepare("SELECT id, number FROM Invoice WHERE userId=? ORDER BY number")
  .all(userId);
const clients = db
  .prepare("SELECT id, name FROM Client WHERE userId=? ORDER BY name")
  .all(userId);

const estByNum = (n) => ests.find((e) => e.number === n).id;
const invByNum = (n) => invs.find((i) => i.number === n).id;
const clientByName = (n) => clients.find((c) => c.name === n).id;

// Each entry: [url, output filename, label]
const PAGES = [
  ["/", "index.html", "Dashboard"],
  ["/clients", "clients.html", "Clients list"],
  ["/clients/new", "clients-new.html", "New client form"],
  [`/clients/${clientByName("Maria Rodriguez")}`, "client-detail.html", "Client detail (Maria)"],
  [`/clients/${clientByName("Maria Rodriguez")}/edit`, "client-edit.html", "Client edit"],
  ["/estimates", "estimates.html", "Estimates list"],
  ["/estimates/new", "estimates-new.html", "New estimate form (the big one)"],
  [`/estimates/${estByNum("EST-1001")}`, "estimate-pool.html", "Estimate detail — pool barrier (EN)"],
  [`/estimates/${estByNum("EST-1001")}?lang=es`, "estimate-pool-es.html", "Estimate detail — pool barrier (ES)"],
  [`/estimates/${estByNum("EST-1002")}`, "estimate-large-hoa.html", "Estimate detail — large HOA job"],
  [`/estimates/${estByNum("EST-1004")}?lang=es`, "estimate-spanish.html", "Estimate detail — full Spanish"],
  ["/invoices", "invoices.html", "Invoices list"],
  [`/invoices/${invByNum("INV-2001")}`, "invoice-paid.html", "Invoice — paid"],
  [`/invoices/${invByNum("INV-2002")}`, "invoice-partial.html", "Invoice — partial payment"],
  [`/invoices/${invByNum("INV-2003")}`, "invoice-sent.html", "Invoice — sent / unpaid"],
  ["/embed/alldayfence-quote.html", "embed-lead-form.html", "Lead-intake widget for marketing site"],
];

async function ensureDir(p) {
  await mkdir(dirname(p), { recursive: true });
}

const downloaded = new Map(); // src URL -> local path relative to out

async function fetchAsset(url) {
  if (downloaded.has(url)) return downloaded.get(url);
  // Map URL to a local path under design-export/assets/...
  const u = new URL(url, ORIGIN);
  let local = "assets" + u.pathname;
  // Strip query strings from filename, keep extension
  if (u.search) {
    const dot = local.lastIndexOf(".");
    const sanitized = u.search.replace(/[^a-z0-9]/gi, "_").slice(0, 24);
    if (dot >= 0)
      local = local.slice(0, dot) + sanitized + local.slice(dot);
    else local += sanitized;
  }
  const outPath = join(OUT, local);
  try {
    const r = await fetch(u.href);
    if (!r.ok) throw new Error("HTTP " + r.status);
    const buf = Buffer.from(await r.arrayBuffer());
    await ensureDir(outPath);
    await writeFile(outPath, buf);
    downloaded.set(url, local);

    // If this is a CSS file, recursively fetch any url(...) and @import
    if (local.endsWith(".css")) {
      let css = buf.toString("utf8");
      const refs = new Set();
      css.replace(/url\(["']?([^"')]+)["']?\)/g, (_m, p1) => {
        refs.add(p1);
        return _m;
      });
      css.replace(/@import\s+(?:url\()?["']([^"')]+)["']\)?;/g, (_m, p1) => {
        refs.add(p1);
        return _m;
      });
      for (const ref of refs) {
        if (ref.startsWith("data:")) continue;
        const abs = new URL(ref, u).href;
        const localRef = await fetchAsset(abs);
        if (localRef) {
          // Rewrite the CSS to point to the relative asset path.
          // CSS lives at <out>/assets/.../foo.css, ref lives at <out>/<localRef>.
          // From foo.css we need path relative to its own dir.
          const cssDir = dirname(local).replace(/\\/g, "/");
          let rel = posixPath.relative(cssDir, localRef);
          if (!rel.startsWith(".")) rel = "./" + rel;
          // Escape regex special chars in original ref
          const re = new RegExp(
            ref.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
            "g",
          );
          css = css.replace(re, rel);
        }
      }
      await writeFile(outPath, css, "utf8");
    }
    return local;
  } catch (e) {
    console.warn(`  ! asset fetch failed: ${url} (${e.message})`);
    return null;
  }
}

async function exportPage(url, filename, label) {
  console.log(`→ ${url}  →  ${filename}`);
  const r = await fetch(ORIGIN + url, {
    redirect: "follow",
    headers: { "Accept-Language": "en" },
  });
  if (!r.ok) {
    console.warn(`  ! HTTP ${r.status}`);
    return null;
  }
  let html = await r.text();

  // Find every <link rel="stylesheet" href="..."> and <script src="...">
  const assetRefs = new Set();
  html.replace(
    /<link[^>]+href=["']([^"']+)["'][^>]*>/gi,
    (m, href) => {
      if (/rel=["']stylesheet["']/i.test(m) || /\.css(\?|$)/i.test(href))
        assetRefs.add(href);
      if (/rel=["']preload["']/i.test(m) && /as=["']font["']/i.test(m))
        assetRefs.add(href);
      if (/rel=["']icon["']/i.test(m)) assetRefs.add(href);
      return m;
    },
  );
  html.replace(/<script[^>]+src=["']([^"']+)["'][^>]*>/gi, (_m, src) => {
    assetRefs.add(src);
    return _m;
  });
  // Image src
  html.replace(/<img[^>]+src=["']([^"']+)["'][^>]*>/gi, (_m, src) => {
    if (!src.startsWith("data:")) assetRefs.add(src);
    return _m;
  });

  // Download and remap each asset
  for (const ref of assetRefs) {
    if (ref.startsWith("data:") || ref.startsWith("http")) {
      // External (e.g. CDN) — leave as is
      continue;
    }
    const abs = new URL(ref, ORIGIN).href;
    const local = await fetchAsset(abs);
    if (local) {
      const re = new RegExp(
        '(["\'])' + ref.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + '(["\'])',
        "g",
      );
      html = html.replace(re, `$1${local}$2`);
    }
  }

  // Inject a top banner so designers can see what page they're looking at
  const banner = `
<div style="position:fixed;top:0;left:0;right:0;background:#0f172a;color:#e2e8f0;padding:6px 12px;font:12px/1.4 -apple-system,sans-serif;z-index:9999;display:flex;justify-content:space-between;align-items:center;">
  <span><strong>${label}</strong> — <code style="background:#1e293b;padding:2px 6px;border-radius:3px;color:#94a3b8">${url}</code></span>
  <a href="index-of-screens.html" style="color:#67e8f9;text-decoration:none">← all screens</a>
</div>
<style>body{padding-top:32px !important}</style>
`;
  html = html.replace(/<body([^>]*)>/i, `<body$1>${banner}`);

  const outPath = join(OUT, filename);
  await ensureDir(outPath);
  await writeFile(outPath, html, "utf8");
  return { url, filename, label };
}

async function main() {
  const exported = [];
  for (const [url, filename, label] of PAGES) {
    const r = await exportPage(url, filename, label);
    if (r) exported.push(r);
  }

  // Index page
  const indexHtml = `<!doctype html>
<html><head>
<meta charset="utf-8">
<title>Fence Quote Pro — Design Export</title>
<style>
  body { font: 15px/1.5 -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; background:#f8fafc; color:#0f172a; margin:0; padding:32px; }
  .wrap { max-width: 720px; margin: 0 auto; }
  h1 { margin: 0 0 4px; letter-spacing: -.01em; }
  .sub { color:#64748b; margin-bottom: 28px; }
  ul { list-style: none; padding: 0; margin: 0; }
  li { background:#fff; border:1px solid #e2e8f0; border-radius: 8px; margin-bottom: 8px; }
  li a { display: flex; justify-content: space-between; align-items:center; gap: 12px; padding: 12px 16px; text-decoration:none; color: inherit; }
  li a:hover { background: #f1f5f9; }
  .label { font-weight: 500; }
  .url { font: 12px/1 ui-monospace, monospace; color:#64748b; background:#f1f5f9; padding:4px 8px; border-radius:4px; }
  .group { margin-top: 24px; font-size: 11px; text-transform: uppercase; letter-spacing: .04em; color:#94a3b8; font-weight:600; padding-left: 4px; margin-bottom: 8px; }
  .note { background:#fffbeb; border:1px solid #fcd34d; border-radius:8px; padding:12px 16px; font-size: 13px; color:#78350f; margin-bottom:24px; }
</style>
</head><body>
<div class="wrap">
  <h1>Fence Quote Pro — Screen Export</h1>
  <div class="sub">Static snapshots of every screen, with sample data. Open any file directly — no server needed.</div>
  <div class="note">
    <strong>For the designer:</strong> these are real renders from the running app. CSS, fonts, and assets are bundled. Forms won't submit (this is an offline snapshot), but every visual element, color, font, and layout matches production exactly.
    See <a href="../DESIGN_HANDOFF.md" style="color:#78350f;font-weight:600">DESIGN_HANDOFF.md</a> for context, palette, priorities.
  </div>

  <div class="group">Contractor app</div>
  <ul>
    ${exported
      .filter((e) => !e.url.startsWith("/embed"))
      .map(
        (e) => `<li><a href="${e.filename}">
        <span class="label">${e.label}</span>
        <span class="url">${e.url}</span>
      </a></li>`,
      )
      .join("\n    ")}
  </ul>

  <div class="group">Marketing-site embed</div>
  <ul>
    ${exported
      .filter((e) => e.url.startsWith("/embed"))
      .map(
        (e) => `<li><a href="${e.filename}">
        <span class="label">${e.label}</span>
        <span class="url">${e.url}</span>
      </a></li>`,
      )
      .join("\n    ")}
  </ul>
</div>
</body></html>
`;
  await writeFile(join(OUT, "index-of-screens.html"), indexHtml, "utf8");
  console.log(
    `\nExported ${exported.length} screens + ${downloaded.size} assets to ${OUT}/`,
  );
  console.log(`Open ${OUT}/index-of-screens.html in a browser.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
