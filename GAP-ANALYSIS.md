# Gap Analysis — Fence Quote Pros vs. Permit Solutions

**Date:** 2026-07-02
**Goal:** Bring Fence Quote Pros (FQP) up to Permit Solutions (PS) maturity — re-implemented in FQP's stack, not ported.
**Sources:** Full-code inventories of both repos (PS read from `permit-solutions-reference`, read-only; FQP read from this repo). Every claim below is grounded in file:line evidence from those reads.

---

## 1. Framing — what "similar to PS" actually means

The two apps share almost no code-level DNA:

| | Fence Quote Pros | Permit Solutions |
|---|---|---|
| Stack | Next.js 16 / TS / Prisma / Postgres (Supabase) / Vercel | Flask / SQLite / Render |
| Shape | Multi-tenant SaaS (contractor = tenant) | Single-company internal console |
| Domain | Field estimating → e-sign → invoice → permit docs | Violation lead-gen → letters → invoicing/workflow |
| State | Pre-launch (email is a stub) | Live in production (~325+ letters mailed) |

So the gap is **maturity and business-rule depth**, not technology. FQP is the more modern codebase; PS is the more battle-tested *business machine*. The work is to re-implement PS's hardest-won behaviors inside FQP.

---

## 2. What FQP already does BETTER (do not "fix" these)

- **Multi-tenant SaaS architecture** — every query userId-scoped; PS is single-company.
- **The fence calculator** (`src/lib/fence.ts`, ~1,450 lines) — 10 fence types, site multipliers, margin modes, and genuinely Miami-Dade-specific compliance (pool barrier blockers, HVHZ, finished-side/height affidavit triggers). PS has nothing like it.
- **Customer-facing web documents** — public share links (`/p/[token]`), view tracking, in-house canvas **e-signature** with IP/UA capture. PS is paper/PDF-only.
- **Permit-doc autofill** (pdf-lib + AcroForm maps + signature embedding + Supabase storage). PS coordinates permits but never fills county forms.
- **Partial payments with history** and per-user invoice numbering.
- **Bilingual customer estimate** and AI fence visualization (Replicate flux-fill-pro, real code not stub).
- **Real migrations** (6 Postgres migrations, lockfile) vs PS's hand-rolled ALTERs.

---

## 3. The Gap Table — what PS has that FQP lacks (ranked by business impact)

### GAP 1 — Documents actually reach the customer ❗ launch blocker
- **PS:** Mails physical letters via Lob with verification, idempotency keys, delivery webhooks, and status tracking. The loop closes.
- **FQP:** `sendEstimateProposal` (`src/app/estimates/actions.ts:612`) writes `EmailMessage status="queued"` and stops. The in-app notification literally says *"No real email service hooked up yet."* Follow-up letters queue on first view but never send. **The product's core loop is non-functional.**
- **Close it:** Wire Resend (domain: fencequotepros.com), flip queued→sent with providerId, add a send-failure path. Later: Twilio SMS. (DEPLOY.md §"When email + SMS are ready" already sketches this.)

### GAP 2 — The two-track status model + workflow pipeline
- **PS:** Every invoice carries **two independent status machines**: billing (`draft→sent→paid|partial|overdue|void`) and a **16-stage engagement workflow** (intake→…→closed_won/lost) with per-transition history, **auto-created tasks per stage** (with due dates), **stuck-job detection** (per-stage day thresholds computed from history, not `updated_at`), and admin-defined custom stages.
- **FQP:** Estimate status + invoice status only. `FenceJob.installStatus` exists but there is no job pipeline, no history, no tasks, no stuck detection.
- **Close it:** Add a `JobWorkflow` (status enum + history table + auto-task map) adapted to fencing: `intake → quote_sent → accepted → permit_prep → permit_submitted → approved → scheduled → installed → inspection → closed_won/lost`. Port the stuck-detection rule (days-in-status from history).

### GAP 3 — Team & RBAC (Marcelo can't log in)
- **PS:** admin/operator roles; **default-deny endpoint allowlist**; row-level ownership that returns "not found" (never "forbidden"); forced password rotation on new accounts; brute-force lockout (5 fails → 15 min); self-service password change; admin user management with guard rails (can't demote/delete self; deleting a user reassigns their invoices).
- **FQP:** One contractor login per tenant. No roles, no password reset, no rate limiting, and a passwordless-account "claim" path (`login/actions.ts:108-121`) that is an account-takeover edge.
- **Close it:** Add `role` to User + a `TeamMember` concept (owner/admin/office), password reset via Resend, login rate limiting, kill or constrain the claim path.

### GAP 4 — Money-handling correctness rules (PS's hardest-won logic)
Port these exact behaviors — they encode years of real edge cases:
1. **`overdue` is derived at read time**, never stored (`sent|partial AND due_at < today`).
2. **"Fully paid" uses a +0.005 epsilon**, and an exact-set correction path can walk status *backward* to `sent`.
3. **`issued_at` is COALESCE-stamped once** — re-sending never moves the issue date.
4. **Deposit = shortfall payment**, not a fixed amount; already-covered deposits only backfill date/method.
5. **Void is idempotent, terminal, reason-logged — and cascades**: a voided job's open tasks vanish from work views (filtered, not deleted).
6. Totals **recomputed from line items on every write** (never trust stored totals). FQP already does this in spirit; keep it.
- **FQP today:** has partial/paid recompute (`invoices/actions.ts:46-65`) but no void, no correction path, no derived overdue, no deposit-shortfall logic on invoices.

### GAP 5 — Invoice delivery parity ❗ near-blocker
- **PS:** Server-side PDF (Playwright/Chromium), draft prints as "Estimate," paid gets a "Paid" stamp, deposit math rendered, payment instructions embedded.
- **FQP:** Invoice page is browser-print only (`PrintButton`), **English-only** (unlike the bilingual estimate), **no public share link, no send action, no PDF**. A contractor cannot deliver an invoice from the app.
- **Close it:** Mirror the estimate pattern: shareToken + `/p/` route + bilingual strings + a server-side PDF (either Playwright or extend the existing pdf-lib pipeline).

### GAP 6 — Reusable contracts / scope modules / proposals
- **PS:** Contracts library with radio-default semantics (one default for invoices, one for estimates); **scope modules** with `{{var}}` substitution assembled into a Scope of Services; branded **Proposal & Service Agreement PDF** regenerable from stored `proposal_data`; plain-English "explain like a homeowner" summary blurbs; optional AI proposal parse (Claude tool-use with graceful 501).
- **FQP:** Free-text notes/terms per estimate. Nothing reusable.
- **Close it:** `ContractTemplate` + `ScopeModule` models with the same default semantics; assemble into estimate/invoice documents.

### GAP 7 — Reporting & audit trail
- **PS:** Revenue/funnel dashboards sourced from invoices (deliberately not the dead CRM), date-windowed reports, `daily_runs` audit table (one row per automation run with per-step counts + error text), workflow history as a first-class audit log.
- **FQP:** Basic KPI cards; `EstimateView` tracking exists but no reporting layer, no audit table.
- **Close it:** Reports page (revenue by period, pipeline conversion, outstanding/overdue) + an `AuditRun`/history pattern for any future automation.

### GAP 8 — Operational hardening
- **PS:** Nightly off-site DB backups with rotation and snapshot validation (magic-bytes check); token-gated, fail-closed DB export endpoint; idempotent upserts everywhere; single-worker discipline documented in the Procfile; a "dummy-proof" employee CLI (`morning_run.py`) with PID lockfiles and type-YES-to-mail confirmation; **tests on the two highest-risk paths** (letter derivation, webhook idempotency).
- **FQP:** **Zero tests.** Seed script is broken (SQLite against a Postgres app). **No `.env.example`** despite DEPLOY.md referencing it. App throws on missing `SESSION_SECRET`. Supabase PITR helps on backups, but nothing is verified.
- **Close it:** `.env.example`; fix seed to Prisma/Postgres; vitest on the money paths (learn from PS's blind spot — their tests cover letters, *not* invoices); document the deploy env.

### GAP 9 — Permit-doc safety (FQP-specific, PS-informed)
- pdf-lib **silently skips mismatched field names** (`src/lib/permitDocPdf.ts:59`) → risk of filing a blank county form with no error. Add strict-mode validation + a fill report.
- MDC affidavits **require notarization**; the app stamps a drawn image only. Add an explicit disclaimer + attorney review. *(Compliance — route to attorney before launch.)*
- Jurisdiction is hardcoded `miami_dade` — fine for v1, parameterize later.

### GAP 10 — Lead generation (the strategic one, phase 3)
- **PS:** A complete acquisition engine — scrape violations, filter by trade keywords (already includes "fence"), enrich owners, mail bilingual letters, track delivery.
- **FQP:** A static embed widget (`public/embed/alldayfence-quote.html`) that is **unwired** (blank ENDPOINT → mailto fallback) and **hardcoded with Allday Fence branding** inside a multi-tenant product.
- **Close it (near-term):** Add `/api/leads` ingest + parameterize the widget per tenant (or pull it).
- **Close it (later, big):** Feed FQP from the PS violation engine scoped to fence keywords — Allday Fence as tenant #1 gets an automated lead faucet. This is integration, not duplication: PS stays the lead engine; FQP is the quote-to-cash engine.

---

## 4. Phased plan (recommended sequence)

### Phase 1 — Launch-ready (the shortest path to a real user) — ~1–2 weeks
1. Wire **Resend** email: send-proposal + queued follow-ups; flip `EmailMessage` lifecycle for real. (GAP 1)
2. **Invoice delivery**: shareToken + public route + bilingual + printable/PDF. (GAP 5)
3. **Auth hardening**: password reset, rate limiting, close the claim path. (GAP 3, minimum slice)
4. **Permit-doc safety**: strict field validation + notarization disclaimer (attorney sign-off). (GAP 9)
5. Housekeeping: `.env.example`, fix seed script, re-tenant or remove the Allday embed widget, i18n the invoice doc.

### Phase 2 — PS-grade business layer — ~2–6 weeks
6. Money correctness rules (derived overdue, epsilon, correction, void+cascade, deposit-shortfall, COALESCE stamps). (GAP 4)
7. Job workflow pipeline + history + auto-tasks + stuck detection, fencing-adapted. (GAP 2)
8. Team roles: owner/office (Marcelo), ownership scoping, admin guard rails. (GAP 3, full)
9. Contracts + scope-module library + proposal PDF. (GAP 6)
10. Reports + audit trail. (GAP 7)
11. Tests on every money path (vitest). (GAP 8)

### Phase 3 — Growth (opt-in, after launch)
12. Lead ingest API + tenant-parameterized widget. (GAP 10)
13. PS-engine integration: fence-scoped violation leads flowing into FQP for Allday Fence.
14. Jurisdiction parameterization (beyond Miami-Dade); backup/monitoring routine.

---

## 5. Standing cautions

- **PS repo is reference-only** (`permit-solutions-reference`, origin detached). Never edit; never re-point FQP at its DB.
- Anything touching **contracts/legal text, notarization language, or payment terms** gets attorney review before it ships to a real customer.
- FQP work happens on branches in this repo; nothing is pushed without Victor's explicit OK.
- On any lien/NOC-adjacent document generated for Allday Fence jobs: the contractor entity is **Allday Fence**, never Victor personally.
