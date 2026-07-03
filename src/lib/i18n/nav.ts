// Layout nav strings — applies to every page via app/layout.tsx.
// Keep ultra-short: nav labels need to fit on one row at sm: breakpoints.

import type { Lang } from "@/lib/landing/lang";

export const NAV_COPY: Record<
  Lang,
  {
    dashboard: string;
    estimates: string;
    jobs: string;
    schedule: string;
    invoices: string;
    reports: string;
    clients: string;
    profile: string;
    signOut: string;
    platform: string;
    pricing: string;
    signIn: string;
    bookDemo: string;
    homeAriaLabel: string;
  }
> = {
  en: {
    dashboard: "Dashboard",
    estimates: "Estimates",
    jobs: "Jobs",
    schedule: "Schedule",
    invoices: "Invoices",
    reports: "Reports",
    clients: "Clients",
    profile: "Profile",
    signOut: "Sign out",
    platform: "Platform",
    pricing: "Pricing",
    signIn: "Sign in",
    bookDemo: "Book a demo",
    homeAriaLabel: "Fence Quote Pros home",
  },
  es: {
    dashboard: "Tablero",
    estimates: "Cotizaciones",
    jobs: "Trabajos",
    schedule: "Agenda",
    invoices: "Facturas",
    reports: "Reportes",
    clients: "Clientes",
    profile: "Perfil",
    signOut: "Cerrar sesión",
    platform: "Plataforma",
    pricing: "Precios",
    signIn: "Iniciar sesión",
    bookDemo: "Reservar demo",
    homeAriaLabel: "Inicio de Fence Quote Pros",
  },
};
