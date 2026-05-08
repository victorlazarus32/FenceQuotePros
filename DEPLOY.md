# Deploying Fence Quote Pros

End-to-end walkthrough from local code → live at `fencequotepros.com`.

Stack: **Vercel** (host) + **Supabase** (Postgres + Storage) + **GoDaddy** (DNS).

---

## 0. Prerequisites

- GitHub account: code at `https://github.com/victorlazarus32/FenceQuotePros`
- Vercel account: sign up at <https://vercel.com/signup> with the same GitHub
- Supabase account: sign up at <https://supabase.com/dashboard>
- GoDaddy DNS access for `fencequotepros.com`

---

## 1. Create the Supabase project

1. Go to <https://supabase.com/dashboard> → **New project**
2. Name: `fencequotepros` (region: `us-east-1` for Florida latency)
3. Generate + save a database password — you'll paste it into the connection
   string in step 2
4. Wait ~2 min for the project to provision

---

## 2. Get the Postgres connection string

1. In Supabase: **Settings → Database**
2. Under **Connection string**, switch the toggle to **URI**
3. Copy two strings:
   - **Pooled connection** (port `6543`) → goes into `DATABASE_URL`
   - **Direct connection** (port `5432`) → goes into `DIRECT_URL`
4. Replace `[YOUR-PASSWORD]` with the password from step 1

---

## 3. Create the Storage bucket

1. In Supabase: **Storage** (left sidebar) → **New bucket**
2. Name: `uploads`
3. **Private** (toggle public off — we issue signed URLs server-side)
4. Save

---

## 4. Get the Storage API key

1. In Supabase: **Settings → API**
2. Copy:
   - **Project URL** → `SUPABASE_URL`
   - **service_role key** (under "Project API keys") → `SUPABASE_SERVICE_ROLE_KEY`
3. ⚠️ The `service_role` key bypasses RLS. Server-side only — never put it
   in a client-side env var, never commit it.

---

## 5. Run the initial database migration

From your local machine, with the Supabase env vars set:

```bash
# Create .env.local with the values from steps 2 + 4
cp .env.example .env.local
# Edit .env.local — paste DATABASE_URL, DIRECT_URL, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY

# Generate the initial migration + apply to Supabase
npx prisma migrate dev --name init

# This creates prisma/migrations/<timestamp>_init/ — commit it.
git add prisma/migrations/
git commit -m "Initial Postgres migration"
```

---

## 6. Deploy to Vercel

1. <https://vercel.com/new> → **Import Git Repository** → pick
   `victorlazarus32/FenceQuotePros`
2. **Framework Preset:** Next.js (auto-detected)
3. **Root Directory:** `.` (default)
4. **Environment Variables** — paste each from your `.env.local`:
   - `DATABASE_URL`
   - `DIRECT_URL`
   - `STORAGE_DRIVER` = `supabase`
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `SUPABASE_STORAGE_BUCKET` = `uploads`
   - (Optional) `REPLICATE_API_TOKEN`, `FIRECRAWL_API_KEY`
5. Click **Deploy**. First deploy takes ~3 minutes.

After it succeeds, the app is live at a `*.vercel.app` URL — verify it works
before connecting the custom domain.

---

## 7. Connect fencequotepros.com

### In Vercel

1. Project → **Settings → Domains** → **Add**
2. Enter `fencequotepros.com` → **Add**
3. Vercel shows the records you need at GoDaddy (it'll be either an A record
   or nameservers). Keep this tab open.

### In GoDaddy

1. Open <https://dcc.godaddy.com/control/dnsmanagement?domainName=fencequotepros.com>
2. Delete any existing parking records for `@` (Apex) and `www`
3. Add the records Vercel gave you. Typical setup:

   | Type | Name | Value | TTL |
   |---|---|---|---|
   | `A` | `@` | `76.76.21.21` | 600 |
   | `CNAME` | `www` | `cname.vercel-dns.com` | 600 |

4. Save changes
5. DNS propagation usually 5–15 min. Vercel auto-provisions an SSL cert as
   soon as it sees the records.

### Verify

- Visit <https://fencequotepros.com> → should load the landing page
- Visit <https://www.fencequotepros.com> → should redirect to apex (Vercel
  configures this automatically)

---

## 8. Post-deploy checklist

- [ ] `/` loads with logo + nav
- [ ] `/landing` renders the marketing page
- [ ] `/login` works; create a contractor account
- [ ] `/profile` saves contractor info + signature
- [ ] Build a test estimate; sign + click "Demo: complete packet"
- [ ] Download a generated permit PDF — verify it streamed from Supabase
- [ ] Open the public estimate link from another browser; sign the estimate
- [ ] Confirm the demo button is **hidden** at fencequotepros.com (it should
      only show in development)

---

## Future deploys

Push to `main` → Vercel auto-builds and deploys. Schema changes:

```bash
# In a feature branch
npx prisma migrate dev --name <change-name>
git add prisma/migrations/ prisma/schema.prisma
git commit -m "..."
git push

# After merging to main, Vercel will run `prisma generate` during build.
# Apply migrations to Supabase:
npx prisma migrate deploy   # against DATABASE_URL pointing at Supabase
```

---

## When email + SMS are ready

1. Resend: sign up → add domain `fencequotepros.com` → set the SPF/DKIM
   records they give you in GoDaddy DNS → wait for verification
2. Twilio: sign up → buy a Florida (305 / 786) phone number
3. Add to Vercel env vars: `RESEND_API_KEY`, `RESEND_FROM_ADDRESS`,
   `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM_NUMBER`
4. Replace the placeholder block in
   `src/app/estimates/actions.ts → sendEstimateProposal` with real send
   calls (Resend SDK + Twilio SDK). Status flips queued → sent on success.
