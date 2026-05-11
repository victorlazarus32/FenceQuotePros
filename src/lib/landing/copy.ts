// Landing-page copy table — single source of truth for every string the
// /landing surface renders. Caribbean Spanish (Cuban / Puerto Rican
// voice) for the ES variant: practical contractor language, "tú"
// where direct address is natural, "cerca" for fence, "concreto" for
// concrete, "cuadrilla" for crew, "portón" for gate.
//
// Keep the BrandWordmark untranslated — that's the brand identity.

import type { Lang } from "./lang";

export type LandingCopy = {
  metaTitle: string;
  metaDescription: string;
  hero: {
    geoStamp: string;
    blueprintTag: string;
    headline: { line1: string; line2: string; line3: string };
    subhead: string;
    primaryCta: string;
    secondaryCta: string;
    fineLine: string;
  };
  signals: {
    title: string;
    body: string;
  }[];
  problem: {
    blueprintTag: string;
    headline: { lead: string; tail: string };
    cards: { title: string; body: string }[];
    bottomLead: string;
    bottomBody: string;
  };
  visualization: {
    blueprintTag: string;
    headline: { lead: string; tail: string };
    body: string;
    bullets: string[];
    outcomeLabel: string;
    outcomeValue: string;
  };
  estimating: {
    blueprintTag: string;
    headline: { lead: string; tail: string };
    body: string;
    bulletsTop: string[];
    tiles: string[];
    bulletsBottom: string[];
  };
  permits: {
    blueprintTag: string;
    headline: { lead: string; tail: string };
    body: string;
    bullets: string[];
    demoBadge: string;
    demoLabel: string;
  };
  scheduling: {
    blueprintTag: string;
    headline: { lead: string; tail: string };
    body: string;
    bullets: string[];
  };
  fieldOps: {
    blueprintTag: string;
    headline: { lead: string; tail: string };
    body: string;
    bullets: string[];
  };
  trust: {
    blueprintTag: string;
    headline: { lead: string; tail: string };
    body: { intro: string; outroBefore: string; outroAfter: string };
    credentials: string[];
  };
  pricing: {
    blueprintTag: string;
    headline: { lead: string; tail: string };
    monthly: string;
    mostPop: string;
    tiers: {
      name: string;
      price: string;
      tagline: string;
      features: string[];
      cta: string;
    }[];
  };
  finalCta: {
    blueprintTag: string;
    headline: { lead: string; tail: string };
    body: string;
    primary: string;
    secondary: string;
  };
  footer: {
    platformTitle: string;
    platformLinks: string[];
    companyTitle: string;
    companyLinks: string[];
    accountTitle: string;
    accountLinks: string[];
    copyright: string;
  };
  langToggle: {
    label: string;
  };
  mockup: {
    problemLabel: string;
    moduleLabel: string;
    credentialLabel: string;
    hero: {
      projectLabel: string;
      before: string;
      after: string;
      styleLabel: string;
      folioLabel: string;
      statusLabel: string;
      statusValue: string;
      styleValue: string;
    };
    estimate: {
      estimateLabel: string;
      residence: string;
      fenceType: string;
      linearFeet: string;
      posts: string;
      concrete: string;
      singleGates: string;
      removal: string;
      labor: string;
      margin: string;
      total: string;
      fenceTypeValue: string;
      postsValue: string;
      concreteValue: string;
      gatesValue: string;
      removalValue: string;
      laborValue: string;
    };
    accountability: {
      header: string;
      crew: string;
      job: string;
      jobValue: string;
      linearFeet: string;
      posts: string;
      installDate: string;
      installDateValue: string;
      gate: string;
      gateValue: string;
      siteNotes: string;
      note1: string;
      note2: string;
      note3: string;
    };
  };
};

const EN: LandingCopy = {
  metaTitle:
    "Fence Quote Pros — The modern operating platform for fence contractors",
  metaDescription:
    "Quote, visualize, and close fence projects faster. Built for fence contractors — material calculations, property visualizations, permit-ready workflows, and worker's accountability lists, in one platform.",
  hero: {
    geoStamp: "Miami, FL · 2026",
    blueprintTag: "Field-tested workflows",
    headline: { line1: "Quote.", line2: "Visualize.", line3: "Close." },
    subhead:
      "The all-in-one platform built specifically for fence contractors.",
    primaryCta: "Book demo",
    secondaryCta: "Start free trial",
    fineLine: "No credit card · 20-min walkthrough",
  },
  signals: [
    {
      title: "Built by fence contractors",
      body: "Real-world experience in estimating, permits, and field operations.",
    },
    {
      title: "From lead to install",
      body: "Quoting, previews, permits, and crew workflows connected in one platform.",
    },
    {
      title: "Real property previews",
      body: "Show customers the finished fence before installation begins.",
    },
    {
      title: "Built for modern fence companies",
      body: "Professional tools designed specifically for fence operations.",
    },
  ],
  problem: {
    blueprintTag: "Common challenges",
    headline: {
      lead: "Three common problems",
      tail: "cost fence companies money.",
    },
    cards: [
      {
        title: "Slow estimates",
        body: "Manual quotes waste valuable sales time. Customers often move forward with the contractor who responds first.",
      },
      {
        title: "Homeowners can’t visualize",
        body: "Customers hesitate when they cannot clearly see how the finished fence will look on their property.",
      },
      {
        title: "Operational confusion",
        body: "Miscommunication between sales and installers leads to wrong gates, incorrect heights, delays, and costly rework.",
      },
    ],
    bottomLead: "simplifies the entire workflow.",
    bottomBody:
      "Professional quoting, realistic fence visualization, permits, and worker’s accountability lists — connected in one platform.",
  },
  visualization: {
    blueprintTag: "Before & After Previews",
    headline: {
      lead: "Show customers exactly",
      tail: "what they’re buying.",
    },
    body: "Show customers what the finished fence will look like on their own property before installation begins. Customers can compare fence styles and see the finished project before they commit — helping eliminate guesswork, hesitation, and buyer uncertainty.",
    bullets: [
      "Real property photos, not generic mockups",
      "Multiple fence styles per quote",
      "Compare aluminum, PVC, and wood fence options",
      "Compare fence styles side-by-side",
    ],
    outcomeLabel: "Outcome",
    outcomeValue: "Win more jobs",
  },
  estimating: {
    blueprintTag: "Smart estimating",
    headline: { lead: "Built for", tail: "real fence contractors." },
    body: "Created by contractors who understand real-world fence estimating. Not generic line-item software repurposed for the trades.",
    bulletsTop: [
      "Fence layout",
      "Linear-foot dimensions",
      "Post spacing",
      "Gate callouts",
      "Material takeoff",
      "Concrete & hardware",
    ],
    tiles: [
      "Materials",
      "Accountability List",
      "Gates + Hardware",
      "Labor",
      "Scheduler",
      "Margins",
      "Fence Styles",
      "Job Costing",
    ],
    bulletsBottom: [
      "Per-foot or fixed-margin pricing",
      "Wood, vinyl, aluminum, and chain-link",
      "Single + double gates with motors",
      "Removal & haul-away built in",
    ],
  },
  permits: {
    blueprintTag: "Permitting",
    headline: { lead: "Permit-ready", tail: "project workflows." },
    body: "Generate organized project documentation faster and reduce administrative delays. Your packets are ready when the customer signs — not three days later.",
    bullets: [
      "Faster turnarounds",
      "Cleaner submissions",
      "Fewer corrections from the building department",
      "Professional presentation, every time",
    ],
    demoBadge: "Live demo · 36 s",
    demoLabel: "Permit Autofill",
  },
  scheduling: {
    blueprintTag: "Production scheduling",
    headline: { lead: "Your whole week", tail: "on one board." },
    body: "Slot accepted jobs into crew calendars, see who’s booked and who’s open at a glance, and walk every install from scheduled to complete without leaving the page.",
    bullets: [
      "Day × crew week grid — every install in one view",
      "Unscheduled column for accepted jobs awaiting a date",
      "Status flow: scheduled → in progress → complete",
      "Crew capacity at a glance — no double-booked Tuesdays",
    ],
  },
  fieldOps: {
    blueprintTag: "Field operations",
    headline: { lead: "Worker’s", tail: "accountability list." },
    body: "Reduce installer confusion and keep crews aligned in the field. Every detail the crew needs — measurements, gate hardware, fence style, materials, photos — in one packet they can pull up on the truck.",
    bullets: [
      "Measurements",
      "Gate details",
      "Fence style",
      "Material breakdowns",
      "Job notes",
      "Site photos",
    ],
  },
  trust: {
    blueprintTag: "Built by the industry",
    headline: {
      lead: "Designed by professionals with",
      tail: "real fence experience.",
    },
    body: {
      intro:
        "Permitting. Estimating. Installation. Inspections. Field operations.",
      outroBefore:
        "was built by people who’ve done all of it — and got tired of running fence companies on phone calls and",
      outroAfter: "spreadsheets.",
    },
    credentials: [
      "Permitting expertise",
      "Inspection-ready specs",
      "Production management",
      "Field operations",
    ],
  },
  pricing: {
    blueprintTag: "Pricing",
    headline: {
      lead: "Operational infrastructure",
      tail: "for serious contractors.",
    },
    monthly: "/ mo",
    mostPop: "Most Pop.",
    tiers: [
      {
        name: "Starter",
        price: "$99",
        tagline: "CRM, estimates, proposals.",
        features: [
          "CRM + customer database",
          "Estimates & digital proposals",
          "Basic scheduling",
          "Up to 2 users",
        ],
        cta: "Book demo",
      },
      {
        name: "Pro",
        price: "$249",
        tagline: "Production-ready operations.",
        features: [
          "Everything in Starter",
          "Worker’s accountability list",
          "Material calculations",
          "Crew scheduling + production board",
          "Team management",
        ],
        cta: "Book demo",
      },
      {
        name: "Performance",
        price: "$499",
        tagline: "The full operating platform.",
        features: [
          "Everything in Pro",
          "Before & after previews",
          "Permit-ready workflows",
          "HOA application packets",
          "Advanced job costing",
        ],
        cta: "Book demo",
      },
      {
        name: "Enterprise",
        price: "Custom",
        tagline: "Multi-location · API · white label.",
        features: [
          "Everything in Performance",
          "Multi-location support",
          "API access",
          "Onboarding + training",
          "Dedicated support",
        ],
        cta: "Contact sales",
      },
    ],
  },
  finalCta: {
    blueprintTag: "Get started",
    headline: {
      lead: "The modern way to",
      tail: "run a fence company.",
    },
    body: "Quote faster. Win more jobs. Keep crews aligned. See it on a real project — book a 20-minute walkthrough with our team.",
    primary: "Book demo",
    secondary: "Start free trial",
  },
  footer: {
    platformTitle: "Platform",
    platformLinks: [
      "Visualization",
      "Estimating",
      "Permits",
      "Scheduling",
      "Accountability List",
    ],
    companyTitle: "Company",
    companyLinks: ["Book demo", "Pricing", "Contact"],
    accountTitle: "Account",
    accountLinks: ["Sign in", "Privacy", "Terms"],
    copyright: "All rights reserved.",
  },
  langToggle: { label: "Switch to Spanish" },
  mockup: {
    problemLabel: "Problem",
    moduleLabel: "Module",
    credentialLabel: "Credential",
    hero: {
      projectLabel: "Project",
      before: "Before",
      after: "After",
      styleLabel: "Style",
      folioLabel: "Folio",
      statusLabel: "Status",
      statusValue: "Approved",
      styleValue: "Aluminum",
    },
    estimate: {
      estimateLabel: "Estimate",
      residence: "Sanchez residence",
      fenceType: "Fence type",
      linearFeet: "Linear feet",
      posts: "Posts",
      concrete: "Concrete",
      singleGates: "Single gates",
      removal: "Removal",
      labor: "Labor",
      margin: "Margin",
      total: "Total",
      fenceTypeValue: "6′ Aluminum louvered",
      postsValue: "24 × 2.5″ × 8′",
      concreteValue: "48 bags / 80 lb",
      gatesValue: "1 × 4′ swing",
      removalValue: "62 LF chain-link",
      laborValue: "32 hr · 2 crew",
    },
    accountability: {
      header: "Worker’s accountability list",
      crew: "Crew · A-1",
      job: "Job",
      jobValue: "Sanchez · 4502 SW 92nd Ave",
      linearFeet: "Linear feet",
      posts: "Posts",
      installDate: "Install date",
      installDateValue: "Tue · 06/04",
      gate: "Gate",
      gateValue: "4′ swing · East",
      siteNotes: "Site notes",
      note1: "Avoid sprinkler line along south property edge",
      note2: "Customer requests photos sent before pour",
      note3: "Gate opens out toward driveway",
    },
  },
};

const ES: LandingCopy = {
  metaTitle:
    "Fence Quote Pros — La plataforma operativa moderna para contratistas de cercas",
  metaDescription:
    "Cotiza, visualiza y cierra proyectos de cerca más rápido. Hecho para contratistas — cálculo de materiales, vistas previas de la propiedad, flujos listos para permiso y listas de responsabilidad del instalador, en una sola plataforma.",
  hero: {
    geoStamp: "Miami, FL · 2026",
    blueprintTag: "Flujos probados en el campo",
    headline: { line1: "Cotiza.", line2: "Visualiza.", line3: "Cierra." },
    subhead:
      "La plataforma todo-en-uno hecha específicamente para contratistas de cercas.",
    primaryCta: "Reservar demo",
    secondaryCta: "Empezar prueba gratis",
    fineLine: "Sin tarjeta de crédito · Demo de 20 minutos",
  },
  signals: [
    {
      title: "Hecho por contratistas de cercas",
      body: "Experiencia real en cotizaciones, permisos y operaciones de campo.",
    },
    {
      title: "Del primer contacto a la instalación",
      body: "Cotizaciones, vistas previas, permisos y flujos de cuadrilla conectados en una sola plataforma.",
    },
    {
      title: "Vistas previas reales de la propiedad",
      body: "Muéstrale al cliente la cerca terminada antes de empezar la instalación.",
    },
    {
      title: "Hecho para compañías de cercas modernas",
      body: "Herramientas profesionales diseñadas específicamente para operaciones de cercas.",
    },
  ],
  problem: {
    blueprintTag: "Retos comunes",
    headline: {
      lead: "Tres problemas comunes",
      tail: "le cuestan dinero a las compañías de cercas.",
    },
    cards: [
      {
        title: "Cotizaciones lentas",
        body: "Las cotizaciones manuales pierden tiempo valioso de ventas. El cliente suele firmar con el contratista que responde primero.",
      },
      {
        title: "El cliente no puede visualizar",
        body: "El cliente duda cuando no puede ver claramente cómo se va a ver la cerca terminada en su propiedad.",
      },
      {
        title: "Confusión operativa",
        body: "La mala comunicación entre ventas e instaladores resulta en portones equivocados, alturas incorrectas, demoras y trabajo doble costoso.",
      },
    ],
    bottomLead: "simplifica todo el flujo de trabajo.",
    bottomBody:
      "Cotización profesional, visualización realista de cercas, permisos y listas de responsabilidad del instalador — todo conectado en una sola plataforma.",
  },
  visualization: {
    blueprintTag: "Vistas Previas: Antes y Después",
    headline: {
      lead: "Muéstrale al cliente",
      tail: "exactamente lo que está comprando.",
    },
    body: "Muéstrale al cliente cómo se va a ver la cerca terminada en su propia propiedad antes de empezar la instalación. El cliente puede comparar estilos de cerca y ver el proyecto terminado antes de firmar — eliminando dudas, vacilación e incertidumbre al cierre.",
    bullets: [
      "Fotos reales de la propiedad, no maquetas genéricas",
      "Varios estilos de cerca por cotización",
      "Compara opciones de aluminio, PVC y madera",
      "Compara estilos de cerca lado a lado",
    ],
    outcomeLabel: "Resultado",
    outcomeValue: "Gana más trabajos",
  },
  estimating: {
    blueprintTag: "Cotización inteligente",
    headline: {
      lead: "Hecho para",
      tail: "contratistas de cercas de verdad.",
    },
    body: "Creado por contratistas que entienden la cotización de cercas en el mundo real. No es un software genérico de línea por línea adaptado al oficio.",
    bulletsTop: [
      "Trazado de cerca",
      "Dimensiones en pies lineales",
      "Separación de postes",
      "Detalles de portón",
      "Lista de materiales",
      "Concreto y herrajes",
    ],
    tiles: [
      "Materiales",
      "Lista de responsabilidad",
      "Portones + Herrajes",
      "Mano de obra",
      "Agenda",
      "Márgenes",
      "Estilos de cerca",
      "Costeo de trabajos",
    ],
    bulletsBottom: [
      "Precios por pie o margen fijo",
      "Madera, vinilo, aluminio y malla ciclónica",
      "Portones sencillos y dobles con motor",
      "Demolición y retirada incluidas",
    ],
  },
  permits: {
    blueprintTag: "Permisos",
    headline: { lead: "Flujos de trabajo", tail: "listos para permiso." },
    body: "Genera documentación de proyecto organizada más rápido y reduce demoras administrativas. Tu paquete está listo cuando el cliente firma — no tres días después.",
    bullets: [
      "Tiempos de entrega más rápidos",
      "Sometidas más limpias",
      "Menos correcciones del departamento de construcción",
      "Presentación profesional, cada vez",
    ],
    demoBadge: "Demo en vivo · 36 s",
    demoLabel: "Auto-relleno de permisos",
  },
  scheduling: {
    blueprintTag: "Programación de producción",
    headline: { lead: "Tu semana completa", tail: "en un solo tablero." },
    body: "Coloca los trabajos aceptados en los calendarios de cada cuadrilla, mira quién está ocupado y quién está disponible de un vistazo, y lleva cada instalación de programada a completada sin salir de la página.",
    bullets: [
      "Cuadrícula día × cuadrilla — cada instalación en una sola vista",
      "Columna de no programados para trabajos aceptados esperando fecha",
      "Flujo de estado: programado → en proceso → completado",
      "Capacidad de cuadrilla de un vistazo — sin martes con doble reserva",
    ],
  },
  fieldOps: {
    blueprintTag: "Operaciones de campo",
    headline: {
      lead: "Lista de responsabilidad",
      tail: "del instalador.",
    },
    body: "Reduce la confusión del instalador y mantén a la cuadrilla alineada en el campo. Cada detalle que necesita el equipo — medidas, herrajes de portón, estilo de cerca, materiales, fotos — en un solo paquete que pueden abrir desde la troca.",
    bullets: [
      "Medidas",
      "Detalles de portón",
      "Estilo de cerca",
      "Lista de materiales",
      "Notas del trabajo",
      "Fotos del sitio",
    ],
  },
  trust: {
    blueprintTag: "Hecho por la industria",
    headline: {
      lead: "Diseñado por profesionales con",
      tail: "experiencia real en cercas.",
    },
    body: {
      intro:
        "Permisos. Cotizaciones. Instalación. Inspecciones. Operaciones de campo.",
      outroBefore:
        "fue creado por gente que ha hecho todo eso — y se cansó de manejar compañías de cercas con llamadas y hojas de",
      outroAfter: "cálculo.",
    },
    credentials: [
      "Experto en permisos",
      "Especificaciones listas para inspección",
      "Manejo de producción",
      "Operaciones de campo",
    ],
  },
  pricing: {
    blueprintTag: "Precios",
    headline: {
      lead: "Infraestructura operativa",
      tail: "para contratistas serios.",
    },
    monthly: "/ mes",
    mostPop: "Más popular",
    tiers: [
      {
        name: "Inicio",
        price: "$99",
        tagline: "CRM, cotizaciones, propuestas.",
        features: [
          "CRM + base de datos de clientes",
          "Cotizaciones y propuestas digitales",
          "Programación básica",
          "Hasta 2 usuarios",
        ],
        cta: "Reservar demo",
      },
      {
        name: "Pro",
        price: "$249",
        tagline: "Operaciones listas para producción.",
        features: [
          "Todo lo de Inicio",
          "Lista de responsabilidad del instalador",
          "Cálculo de materiales",
          "Programación de cuadrillas + tablero de producción",
          "Manejo de equipo",
        ],
        cta: "Reservar demo",
      },
      {
        name: "Performance",
        price: "$499",
        tagline: "La plataforma operativa completa.",
        features: [
          "Todo lo de Pro",
          "Vistas previas antes y después",
          "Flujos listos para permiso",
          "Paquetes de solicitud para HOA",
          "Costeo avanzado de trabajos",
        ],
        cta: "Reservar demo",
      },
      {
        name: "Empresarial",
        price: "A medida",
        tagline: "Múltiples ubicaciones · API · marca blanca.",
        features: [
          "Todo lo de Performance",
          "Soporte multi-ubicación",
          "Acceso API",
          "Onboarding + entrenamiento",
          "Soporte dedicado",
        ],
        cta: "Contactar ventas",
      },
    ],
  },
  finalCta: {
    blueprintTag: "Empieza",
    headline: {
      lead: "La forma moderna",
      tail: "de manejar una compañía de cercas.",
    },
    body: "Cotiza más rápido. Gana más trabajos. Mantén las cuadrillas alineadas. Míralo en un proyecto real — reserva una demo de 20 minutos con nuestro equipo.",
    primary: "Reservar demo",
    secondary: "Empezar prueba gratis",
  },
  footer: {
    platformTitle: "Plataforma",
    platformLinks: [
      "Visualización",
      "Cotizaciones",
      "Permisos",
      "Programación",
      "Lista de Responsabilidad",
    ],
    companyTitle: "Compañía",
    companyLinks: ["Reservar demo", "Precios", "Contacto"],
    accountTitle: "Cuenta",
    accountLinks: ["Iniciar sesión", "Privacidad", "Términos"],
    copyright: "Todos los derechos reservados.",
  },
  langToggle: { label: "Ver en inglés" },
  mockup: {
    problemLabel: "Problema",
    moduleLabel: "Módulo",
    credentialLabel: "Credencial",
    hero: {
      projectLabel: "Proyecto",
      before: "Antes",
      after: "Después",
      styleLabel: "Estilo",
      folioLabel: "Folio",
      statusLabel: "Estado",
      statusValue: "Aprobado",
      styleValue: "Aluminio",
    },
    estimate: {
      estimateLabel: "Cotización",
      residence: "Residencia Sánchez",
      fenceType: "Tipo de cerca",
      linearFeet: "Pies lineales",
      posts: "Postes",
      concrete: "Concreto",
      singleGates: "Portones sencillos",
      removal: "Demolición",
      labor: "Mano de obra",
      margin: "Margen",
      total: "Total",
      fenceTypeValue: "6′ Aluminio louvered",
      postsValue: "24 × 2.5″ × 8′",
      concreteValue: "48 sacos / 80 lb",
      gatesValue: "1 × 4′ batiente",
      removalValue: "62 PL malla ciclónica",
      laborValue: "32 hr · 2 cuadrillas",
    },
    accountability: {
      header: "Lista de responsabilidad del instalador",
      crew: "Cuadrilla · A-1",
      job: "Trabajo",
      jobValue: "Sánchez · 4502 SW 92nd Ave",
      linearFeet: "Pies lineales",
      posts: "Postes",
      installDate: "Fecha de instalación",
      installDateValue: "Mar · 06/04",
      gate: "Portón",
      gateValue: "4′ batiente · Este",
      siteNotes: "Notas del sitio",
      note1: "Evitar la línea de riego en el borde sur de la propiedad",
      note2: "El cliente pide fotos antes de vaciar el concreto",
      note3: "El portón abre hacia la entrada",
    },
  },
};

export const COPY: Record<Lang, LandingCopy> = { en: EN, es: ES };
