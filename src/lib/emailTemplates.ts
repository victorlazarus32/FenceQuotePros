// Email subject + body templates. Returns plain-text bodies for now; HTML
// versions can be layered on when a real email service (Resend) is hooked up.
// All templates take a small context object so the same template lives in one
// place regardless of who's sending it.

import type { FenceType } from "./fence";

export type ProposalEmailContext = {
  clientName: string;
  contractorName: string;
  contractorCompany: string | null;
  estimateNumber: string;
  shareUrl: string;
  totalDisplay: string;
  expiresOn: string | null;
};

export function proposalEmail(ctx: ProposalEmailContext): {
  subject: string;
  body: string;
} {
  const company = ctx.contractorCompany ?? ctx.contractorName;
  const subject = `Your fence proposal from ${company} — ${ctx.estimateNumber}`;
  const body = [
    `Hi ${ctx.clientName},`,
    ``,
    `Thanks for the opportunity to quote your fence project. Your proposal ${ctx.estimateNumber} is ready to review:`,
    ``,
    `  ${ctx.shareUrl}`,
    ``,
    `Total: ${ctx.totalDisplay}`,
    ctx.expiresOn ? `This proposal is valid through ${ctx.expiresOn}.` : null,
    ``,
    `If you have any questions, just reply to this email or call.`,
    ``,
    `— ${ctx.contractorName}${ctx.contractorCompany ? `, ${ctx.contractorCompany}` : ""}`,
  ]
    .filter(Boolean)
    .join("\n");
  return { subject, body };
}

// ─── Auto follow-up letters ─────────────────────────────────────
// Triggered when the client opens the proposal. Provides product-specific
// information: lifespan, maintenance, warranty, code-compliance hooks etc.

export type FollowUpEmailContext = {
  clientName: string;
  contractorName: string;
  contractorCompany: string | null;
  fenceType: FenceType;
  shareUrl: string;
};

type FollowUpTemplate = {
  subject: string;
  body: string;
};

const FOLLOWUP_BY_FENCE_TYPE: Record<
  FenceType,
  (ctx: FollowUpEmailContext) => FollowUpTemplate
> = {
  wood_privacy: (ctx) => ({
    subject: "More about your wood fence — what to expect",
    body: woodFollowUp(ctx),
  }),
  wood_picket: (ctx) => ({
    subject: "More about your wood fence — what to expect",
    body: woodFollowUp(ctx),
  }),
  vinyl: (ctx) => ({
    subject: "PVC fencing — low maintenance, decades of life",
    body: pvcFollowUp(ctx),
  }),
  aluminum: (ctx) => ({
    subject: "Aluminum fencing — code, security, and finish",
    body: aluminumFollowUp(ctx),
  }),
  wrought_iron: (ctx) => ({
    subject: "Wrought iron fencing — strength and aesthetics",
    body: wroughtIronFollowUp(ctx),
  }),
  composite: (ctx) => ({
    subject: "Composite fencing — modern look without the upkeep",
    body: compositeFollowUp(ctx),
  }),
  chain_link: (ctx) => ({
    subject: "Chain link fencing — cost-effective and durable",
    body: chainLinkFollowUp(ctx),
  }),
  dura_fence: (ctx) => ({
    subject: "DuraFence — engineer-sealed for Florida code",
    body: duraFenceFollowUp(ctx),
  }),
  concrete_wall: (ctx) => ({
    subject: "Concrete walls — privacy, sound, and permanence",
    body: concreteWallFollowUp(ctx),
  }),
  concrete_column: (ctx) => ({
    subject: "Concrete columns — architectural accents",
    body: concreteColumnFollowUp(ctx),
  }),
};

export function followUpEmail(ctx: FollowUpEmailContext): FollowUpTemplate {
  const builder = FOLLOWUP_BY_FENCE_TYPE[ctx.fenceType];
  return builder(ctx);
}

// ─── Per-type body copy ─────────────────────────────────────────

function signoff(ctx: FollowUpEmailContext): string {
  return `— ${ctx.contractorName}${ctx.contractorCompany ? `, ${ctx.contractorCompany}` : ""}`;
}

function woodFollowUp(ctx: FollowUpEmailContext): string {
  return [
    `Hi ${ctx.clientName},`,
    ``,
    `Thanks for taking a look at the proposal. A few things worth knowing about wood fences in Florida:`,
    ``,
    `• Lifespan: 15–20 years for pressure-treated pine, 25+ for cedar, when sealed every 2–3 years.`,
    `• Stain & seal: we recommend a quality water-repellent stain on both sides within 90 days of install — it locks out moisture and slows graying.`,
    `• Wind: per the engineering for Florida code, wood privacy fences perform well at 6 ft and below. Above that, we recommend galvanized post hardware and tighter post spacing.`,
    `• Finished side: per Miami-Dade Sec. 33-11(b)(2), the finished (smooth) side faces the neighbor by default. Facing it inward needs the neighbor to sign an Affidavit to Waive — we can prepare that if it applies.`,
    ``,
    `Proposal: ${ctx.shareUrl}`,
    ``,
    `Happy to walk through any of this on a call.`,
    ``,
    signoff(ctx),
  ].join("\n");
}

function pvcFollowUp(ctx: FollowUpEmailContext): string {
  return [
    `Hi ${ctx.clientName},`,
    ``,
    `Thanks for reviewing the proposal. PVC (vinyl) is one of the most popular fence choices in South Florida — here's why:`,
    ``,
    `• No painting, sealing, or staining — ever. The color is through-extruded, not applied.`,
    `• Lifespan: 30+ years typical, with most reputable manufacturers offering a limited lifetime warranty against fading, cracking, and peeling.`,
    `• UV stable: titanium dioxide additive blocks UV breakdown — critical for our climate.`,
    `• Hurricane performance: aluminum-reinforced rails and posts make modern PVC privacy fences wind-resistant. Florida product approval (NOA) covers HVHZ counties.`,
    ``,
    `Proposal: ${ctx.shareUrl}`,
    ``,
    `Reach out with any questions.`,
    ``,
    signoff(ctx),
  ].join("\n");
}

function aluminumFollowUp(ctx: FollowUpEmailContext): string {
  return [
    `Hi ${ctx.clientName},`,
    ``,
    `A few notes on aluminum fencing as you review the proposal:`,
    ``,
    `• Pool-barrier compliance: aluminum picket fences meet Florida Building Code §454.2.17 / R4501 when picket spacing rejects a 4" sphere and gates are self-closing/self-latching.`,
    `• Powder coat: factory-applied polyester powder coat is significantly more durable than spray paint — 20+ years before any touch-up is typical.`,
    `• No rust: real aluminum (not steel painted to look like aluminum) won't rust, even in coastal salt air.`,
    `• Security: 6 ft and 8 ft heights with spear-top pickets are common for residential perimeter security.`,
    ``,
    `Proposal: ${ctx.shareUrl}`,
    ``,
    `Let me know if you'd like to talk through finish options or gate hardware.`,
    ``,
    signoff(ctx),
  ].join("\n");
}

function wroughtIronFollowUp(ctx: FollowUpEmailContext): string {
  return [
    `Hi ${ctx.clientName},`,
    ``,
    `A few thoughts on wrought iron as you review:`,
    ``,
    `• Strength: real wrought iron and welded steel ornamental fences are the most secure option short of masonry.`,
    `• Maintenance: needs touch-up paint at points of rust every 5–10 years in Florida. Galvanized + powder-coated steel ornamental performs better than raw iron in our humidity.`,
    `• Lifespan: 50+ years with proper maintenance.`,
    ``,
    `Proposal: ${ctx.shareUrl}`,
    ``,
    signoff(ctx),
  ].join("\n");
}

function compositeFollowUp(ctx: FollowUpEmailContext): string {
  return [
    `Hi ${ctx.clientName},`,
    ``,
    `Composite fencing notes:`,
    ``,
    `• Recycled wood + plastic blend — looks like wood, performs like vinyl.`,
    `• No staining, sealing, or painting.`,
    `• 25-year typical manufacturer warranty against rot, splinters, and termites.`,
    ``,
    `Proposal: ${ctx.shareUrl}`,
    ``,
    signoff(ctx),
  ].join("\n");
}

function chainLinkFollowUp(ctx: FollowUpEmailContext): string {
  return [
    `Hi ${ctx.clientName},`,
    ``,
    `Quick notes on chain link as you review the proposal:`,
    ``,
    `• Most cost-effective fencing per linear foot — typically half the cost of wood privacy or PVC.`,
    `• Vinyl coatings (black, green, brown, white) cost slightly more but blend into landscaping much better than raw galvanized.`,
    `• Pool barrier code: chain link as a pool barrier requires 2" mesh max with a top rail, per Miami-Dade Sec. 33-12(i). Privacy slats are an option but reduce wind permeability.`,
    `• Lifespan: 20–30 years galvanized, 25–35 vinyl-coated.`,
    ``,
    `Proposal: ${ctx.shareUrl}`,
    ``,
    signoff(ctx),
  ].join("\n");
}

function duraFenceFollowUp(ctx: FollowUpEmailContext): string {
  return [
    `Hi ${ctx.clientName},`,
    ``,
    `A few things to know about DuraFence (steel panel) for your project:`,
    ``,
    `• Engineer-sealed: each install ships with a Florida PE-sealed structural spec (Carlos Lopez Reyes, FL PE #94475 — All American Engineering & Consulting). Florida Building Code 2023 / ASCE 7-22.`,
    `• HVHZ rated: certified for high-velocity hurricane zones (Vult 115 mph at Exposure C).`,
    `• Heavy-gauge steel: 16ga galvanized posts, 24ga formed steel panels, 1/8" full fillet welds.`,
    `• Permit-ready: the sealed sheet is part of the permit packet — no separate engineering fee.`,
    ``,
    `Proposal: ${ctx.shareUrl}`,
    ``,
    signoff(ctx),
  ].join("\n");
}

function concreteWallFollowUp(ctx: FollowUpEmailContext): string {
  return [
    `Hi ${ctx.clientName},`,
    ``,
    `Concrete wall notes:`,
    ``,
    `• Privacy + sound: a CBS wall blocks both sight and noise far better than any fence material.`,
    `• Lifespan: effectively permanent with reasonable upkeep.`,
    `• Finish: per Miami-Dade Sec. 33-11(b)(4), CBS walls are finished with stucco and paint on both sides. Decorative masonry / brick / natural stone are also options.`,
    `• Permit: building permit (yellow form), Category 18.`,
    ``,
    `Proposal: ${ctx.shareUrl}`,
    ``,
    signoff(ctx),
  ].join("\n");
}

function concreteColumnFollowUp(ctx: FollowUpEmailContext): string {
  return [
    `Hi ${ctx.clientName},`,
    ``,
    `Concrete columns add architectural weight to a fence run — typically paired with PVC, aluminum, or wrought iron panels between piers. A few notes:`,
    ``,
    `• Spacing: usually 8–10 ft on center, with the chosen panel material bridging.`,
    `• Cap options: standard square, decorative cap, or round.`,
    `• Footings: deeper than panel posts — usually 2–3 ft footings depending on column height.`,
    ``,
    `Proposal: ${ctx.shareUrl}`,
    ``,
    signoff(ctx),
  ].join("\n");
}
