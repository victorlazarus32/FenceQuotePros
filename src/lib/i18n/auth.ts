// Auth surface copy — login / signup / book-demo pages.

import type { Lang } from "@/lib/landing/lang";

export const AUTH_COPY: Record<
  Lang,
  {
    login: {
      title: string;
      heading: string;
      lead: string;
      noAccountPrefix: string;
      signupCta: string;
      emailLabel: string;
      passwordLabel: string;
      submit: string;
      submitPending: string;
      invalid: string;
    };
    signup: {
      title: string;
      heading: string;
      lead: string;
      haveAccountPrefix: string;
      loginCta: string;
      nameLabel: string;
      companyLabel: string;
      emailLabel: string;
      phoneLabel: string;
      passwordLabel: string;
      submit: string;
      submitPending: string;
    };
    bookDemo: {
      title: string;
      tag: string;
      heading: string;
      lead: string;
      emailCardTitle: string;
      emailCta: string;
      callCardTitle: string;
      callCta: string;
      tryItPrefix: string;
      trialCta: string;
      builtIn: string;
      emailSubject: string;
      emailBody: string;
    };
  }
> = {
  en: {
    login: {
      title: "Sign in — Fence Quote Pros",
      heading: "Sign in",
      lead: "Welcome back. Enter your credentials.",
      noAccountPrefix: "Don’t have an account?",
      signupCta: "Sign up →",
      emailLabel: "Email",
      passwordLabel: "Password",
      submit: "Sign in",
      submitPending: "Signing in…",
      invalid: "Invalid email or password.",
    },
    signup: {
      title: "Sign up — Fence Quote Pros",
      heading: "Create account",
      lead: "14-day free trial. No card required.",
      haveAccountPrefix: "Already have an account?",
      loginCta: "Sign in →",
      nameLabel: "Full name",
      companyLabel: "Company",
      emailLabel: "Email",
      phoneLabel: "Phone (optional)",
      passwordLabel: "Password",
      submit: "Start free trial",
      submitPending: "Creating account…",
    },
    bookDemo: {
      title: "Book a demo — Fence Quote Pros",
      tag: "Book a demo",
      heading: "See the operating system in action.",
      lead: "30-minute walkthrough of estimating, fence visualization, permit packet generation, and the contractor dashboard. We’ll tailor it to your typical job mix.",
      emailCardTitle: "Email us",
      emailCta: "Send a request",
      callCardTitle: "Call us",
      callCta: "Speak with founder",
      tryItPrefix: "Want to try it before talking?",
      trialCta: "Start the 14-day free trial →",
      builtIn: "Built in Miami for fence contractors everywhere.",
      emailSubject: "Fence Quote Pros Demo Request",
      emailBody:
        "Hi Victor,\n\nI'd like to schedule a demo of Fence Quote Pros.\n\nName: \nCompany: \nState/County: \nTypical job mix (wood/aluminum/chain link/PVC): \nPreferred day/time: \n\nThanks!",
    },
  },
  es: {
    login: {
      title: "Iniciar sesión — Fence Quote Pros",
      heading: "Iniciar sesión",
      lead: "Bienvenido. Entra con tus credenciales.",
      noAccountPrefix: "¿No tienes cuenta?",
      signupCta: "Crear cuenta →",
      emailLabel: "Correo electrónico",
      passwordLabel: "Contraseña",
      submit: "Iniciar sesión",
      submitPending: "Iniciando sesión…",
      invalid: "Correo o contraseña incorrectos.",
    },
    signup: {
      title: "Crear cuenta — Fence Quote Pros",
      heading: "Crear cuenta",
      lead: "Prueba gratis de 14 días. Sin tarjeta de crédito.",
      haveAccountPrefix: "¿Ya tienes cuenta?",
      loginCta: "Iniciar sesión →",
      nameLabel: "Nombre completo",
      companyLabel: "Compañía",
      emailLabel: "Correo electrónico",
      phoneLabel: "Teléfono (opcional)",
      passwordLabel: "Contraseña",
      submit: "Empezar prueba gratis",
      submitPending: "Creando cuenta…",
    },
    bookDemo: {
      title: "Reservar demo — Fence Quote Pros",
      tag: "Reservar demo",
      heading: "Mira el sistema operativo en acción.",
      lead: "Demo de 30 minutos sobre cotizaciones, visualización de cerca, generación del paquete de permiso y el tablero del contratista. La ajustamos al tipo de trabajo que tú haces.",
      emailCardTitle: "Envíanos un correo",
      emailCta: "Mandar solicitud",
      callCardTitle: "Llámanos",
      callCta: "Habla con el fundador",
      tryItPrefix: "¿Quieres probarlo antes de hablar?",
      trialCta: "Empieza la prueba gratis de 14 días →",
      builtIn: "Hecho en Miami para contratistas de cercas en todas partes.",
      emailSubject: "Solicitud de demo de Fence Quote Pros",
      emailBody:
        "Hola Victor,\n\nMe gustaría agendar una demo de Fence Quote Pros.\n\nNombre: \nCompañía: \nEstado/Condado: \nTipo de trabajo (madera/aluminio/malla ciclónica/PVC): \nDía/hora preferida: \n\n¡Gracias!",
    },
  },
};
