# Fence Quote Pro — Design Handoff

A self-contained brief for a designer (or another Claude design session) picking this up cold. No prior context required.

---

## 1. The product in one sentence

**Fence Quote Pro** is a Joist-style estimating + invoicing app built for fence contractors — quote a job in 90 seconds on a phone in someone's driveway, send the estimate, convert to invoice, get paid.

## 2. Who uses it

**Primary user — "Victor on a job site":**
- Fence contractor (Allday Fence Co., Miami-Dade — but the app is sold to any fence contractor)
- Standing in a customer's yard with one hand on a tape measure and one hand on a phone
- Has 5 minutes to produce a credible quote before the homeowner gets distracted
- Bilingual EN/ES customer base — needs to hand the same estimate in either language without re-keying anything
- Lives and dies by **trust signals** on the customer-facing PDF (clean header, license #, terms, totals that add up)

**Secondary user — "Marcelo at the desk":**
- Office / CFO role
- Reconciles payments, follows up on outstanding invoices, exports for accounting

**Tertiary user — "the homeowner":**
- Sees only the customer-facing **estimate** and **invoice** PDFs
- May open them on a phone, may print them, may forward to a spouse for approval
- Often Spanish-preferring in the Miami market

## 3. Non-negotiable UX principles

1. **Reduce mistakes.** The product's stated purpose. Every form should make the right answer the easy answer (dropdowns over free-text, real-time validation, code-compliance warnings inline).
2. **Mobile-first for the estimate flow.** Quotes get built on phones outdoors, in glare, with gloves on. Generous tap targets, big numeric inputs, no hover-only interactions.
3. **Print-perfect for the customer documents.** Estimates and invoices are routinely printed or saved as PDF. There's a `.no-print` utility class — toolbar/chrome must hide; the document itself must look like a real invoice on letter-size paper.
4. **Bilingual without parallel screens.** Same URL, `?lang=es` toggle. No second navigation tree.
5. **Calm, not flashy.** Buyers signing a $5K–$30K contract want to feel like they hired pros, not used a startup. White cards, restrained color, tabular numbers.

## 4. Current visual system

### Palette
| Token | Hex | Usage |
|---|---|---|
| Brand (teal-700) | `#0f766e` | Primary buttons, brand wordmark, links |
| Brand-dark (teal-800) | `#115e59` | Button hover |
| Foreground | `#0f172a` (slate-900) | Body text |
| Background | `#f8fafc` (slate-50) | App background |
| Card | `#ffffff` | All content surfaces |
| Border | `#e2e8f0` (slate-200) | Card borders |
| Muted | `#64748b` (slate-500) | Helper text, labels |
| Subtle text | `#475569` (slate-600) | Secondary copy |
| Danger | `#dc2626` (red-600) | Destructive actions, blocker warnings |
| Warning bg | `#fffbeb` / `#fcd34d` (amber-50/300) | Soft warnings |
| Success | `#ecfdf5` / `#6ee7b7` | Confirmation states |

CSS vars in [src/app/globals.css](src/app/globals.css) — Tailwind 4 with `@theme inline`.

### Type
- **Sans:** Geist (`next/font/google`) — body & headings
- **Mono:** Geist Mono — not currently used; available
- Numbers use `tabular-nums` everywhere money or counts appear
- Headings: `text-2xl font-semibold tracking-tight` (page title), `font-medium` (card titles)
- Body: `text-sm` is the default app density; documents use `text-sm` for line items

### Spacing / radius / shadow
- Cards: `rounded-lg border border-slate-200` (no shadow on cards)
- Buttons: `rounded-md`
- Pills (status badges): `rounded-full px-2 py-0.5 text-xs`
- Section padding: `p-4` for compact panels, `p-8` for the customer-facing document
- Vertical rhythm: `space-y-6` between sections, `space-y-1` inside totals blocks
- Page max width: `max-w-6xl`; document max width: `max-w-2xl` for forms, full card for documents

### Components (already built)
- [Button.tsx](src/components/Button.tsx) — variants: `primary | secondary | ghost | danger`, sizes: `sm | md`. Has matching `LinkButton` for `<Link>` usage.
- [StatusBadge.tsx](src/components/StatusBadge.tsx) — color-coded pill, color logic in `lib/format.ts`
- [PrintButton.tsx](src/components/PrintButton.tsx) — fires `window.print()`

### Layout chrome
- Top nav at [src/app/layout.tsx](src/app/layout.tsx): white bar, h-14, brand wordmark left ("Fence Quote Pro" in teal), nav links right (Dashboard / Estimates / Invoices / Clients)
- No sidebar, no footer
- All content centered in `max-w-6xl` with `px-4 py-8`

## 5. Routes / pages inventory

| Route | Purpose | Audience | Design priority |
|---|---|---|---|
| `/` | Dashboard — KPI cards, recent estimates/invoices | Contractor | Medium — works, but bland |
| `/estimates` | List of all estimates with status filter | Contractor | Low |
| `/estimates/new` | **The big one** — fence calculator + line items + totals | Contractor (mobile!) | **HIGH** |
| `/estimates/[id]` | Customer-facing estimate document + toolbar | Both (mobile + print) | **HIGH** |
| `/estimates/[id]?lang=es` | Same, Spanish | Customer | **HIGH** |
| `/invoices` | List of all invoices | Contractor | Low |
| `/invoices/[id]` | Customer-facing invoice document | Both | **HIGH** (and not yet bilingual — known gap) |
| `/clients` | Client list | Contractor | Low |
| `/clients/new`, `/clients/[id]`, `/clients/[id]/edit` | Client CRUD | Contractor | Low |
| `/embed/alldayfence-quote.html` | Static lead-intake form for the contractor's marketing site | Homeowner | Medium |

## 6. The two screens that matter most

### A. `/estimates/new` — the fence calculator
This is where mistakes happen and where time is saved or wasted. Sections (top to bottom):
1. **Client picker** — dropdown of existing clients + expiry date
2. **Fence calculator** (the centerpiece) — fence type dropdown, height, linear feet, post spacing, terrain, gate counts, tear-out toggle, **pool-adjacent + HVHZ checkboxes**, **live compliance warnings** (red blocker / amber warning), and a calculated-lines preview
3. **Additional line items** — repeating row editor for permits, custom adders
4. **Totals & notes** — tax rate input, subtotal/tax/total, notes & terms textareas

**Design problems to solve:**
- The screen is dense on mobile; sections need clearer hierarchy without scrolling fatigue
- The compliance warnings panel is functional but bland — should feel authoritative without being alarming
- The "calculated lines" preview is a small grey block — should it become the primary visual?
- No empty state for the dropdowns when the contractor hasn't seeded clients yet

### B. `/estimates/[id]` — the customer document
This is what wins or loses the deal. Currently:
- White card with company header (name + address + phone + email)
- Estimate # + status pill in top-right
- "Bill to" / "Issued" / "Expires" three-column block
- Line items table with description / qty / unit price / total
- Subtotal / tax / total stack right-aligned
- Notes & terms two-column footer
- Toolbar above (no-print): back link, language toggle, status actions, "Convert to invoice", Print, Delete

**Design problems to solve:**
- Header has no logo slot today (User model has `logoUrl` field but it's not rendered)
- No watermarked status (e.g. faded "DRAFT" or "ACCEPTED" in the background)
- No signature block / accept-this-estimate affordance
- Spanish version uses identical layout — fine, but worth double-checking line-length expansion (Spanish runs ~15–20% longer)
- Print: untested at letter and A4; needs verification that nothing clips

## 7. Brand

- Name: **Fence Quote Pro**
- Wordmark: currently text-only ("Fence Quote Pro" in `font-semibold text-lg tracking-tight text-teal-700`)
- **No logo asset exists yet** — designer to propose
- Tagline candidate (not used): "Estimates & invoices for fence contractors"
- Tone: confident, direct, blue-collar-respectful — not whimsical, not corporate

## 8. Special context: the embed widget

[public/embed/alldayfence-quote.html](public/embed/alldayfence-quote.html) is a single-file lead-intake form designed to drop into a fence contractor's existing marketing site. It's already styled inline (no Tailwind dependency) but uses the same color/spacing language. Designer should treat this as the "homeowner-facing" surface — first impression of the brand.

## 9. Tech constraints the designer should know

- **Tailwind 4** (utility-first; designer can speak in tokens)
- **Next.js 16 App Router** with React Server Components — most pages are server-rendered
- **Server actions** drive all mutations — forms must remain real `<form>` elements that POST FormData (no SPA-only fancy state stuff that breaks JS-off)
- **Mobile-first** breakpoints: `sm: 640px`, `lg: 1024px` — most screens collapse to single-column under `sm`
- **Print** — a `.no-print` utility hides chrome; designer should provide a separate print mode review for both the estimate and invoice documents
- **No design system library** (no shadcn, no Radix yet) — components are hand-rolled and could be expanded into a small kit

## 10. What I want from design

In priority order:

1. **Logo + wordmark** for "Fence Quote Pro" (and a favicon)
2. **Document polish** for `/estimates/[id]` and `/invoices/[id]` — header layout with logo slot, optional watermark, signature/acceptance block, print-mode QA
3. **Mobile redesign of `/estimates/new`** — compress the fence calculator into a thumb-friendly flow without losing the all-on-one-page speed advantage
4. **Visual treatment for compliance warnings** — make blockers/warnings feel authoritative and Florida-specific (Miami pool code, HVHZ)
5. **Dashboard upgrade** — the KPI cards are flat; needs a Joist-grade "this is your business at a glance" feel
6. **Empty states** — every list/dropdown needs a designed empty state
7. **Embed widget refresh** — visual harmony with the main app, plus marketing-site polish (the homeowner is making a buying decision here)

## 11. How to preview locally

```bash
cd C:\Users\Taylor\fencequote
npm run dev
# open http://localhost:3002
```

Seeded? Check `prisma/dev.db`. If empty, ask the engineer for a seed script or use the `/clients/new` and `/estimates/new` flows to create test data.

## 12. Open design questions

- Should we adopt a small component library (shadcn/ui)? Pro: faster, cohesive primitives. Con: visual drift toward generic startup look — the brand wants to feel trade-specific.
- Logo direction: literal (fence picket / chain link motif) or abstract (geometric "FQP" mark)?
- Color: teal is the brand today. Worth exploring? Trade contractors often use orange/yellow (work-truck energy), navy (trustworthy), or forest green (outdoor work).
- Photo strategy: do we want imagery (fence textures, job-site photos) anywhere in the app chrome, or stay all-typography?

## 13. Files worth reading first

- [src/app/page.tsx](src/app/page.tsx) — dashboard (current state)
- [src/app/estimates/new/NewEstimateForm.tsx](src/app/estimates/new/NewEstimateForm.tsx) — the high-density form to redesign
- [src/app/estimates/[id]/page.tsx](src/app/estimates/[id]/page.tsx) — the customer document
- [src/components/Button.tsx](src/components/Button.tsx) — primitive style
- [src/app/globals.css](src/app/globals.css) — design tokens
- [public/embed/alldayfence-quote.html](public/embed/alldayfence-quote.html) — homeowner-facing embed
