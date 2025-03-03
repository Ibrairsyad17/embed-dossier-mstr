import { Paths } from "@/lib/pageroutes"

export const Documents: Paths[] = [
  {
    title: "Introduction",
    href: "/introduction",
    heading: "Getting started",
    items: [
      {
        title: "Installation",
        href: "/installation",
      },
      {
        title: "Configure Library Server",
        href: "/configure-library-server",
      },
      {
        title: "Quick Start",
        href: "/quick-start",
      },
      {
        title: "Changelog",
        href: "/changelog",
      },
    ],
  },
  {
    title: "Embedding Use Cases",
    href: "/embedding-use-cases",
    heading: "Use Cases",
    items: [
      {
        title: "Dashboard Use Case",
        href: "/dashboard-use-case",
      },
      {
        title: "Library Page Use Case",
        href: "/library-page-use-case",
      },
      {
        title: "Bot Page Use Case",
        href: "/bot-page-use-case",
      },
    ],
  },
  {
    title: "Authentication Modes",
    href: "/authentication",
    heading: "Authentication",
    items: [
      { title: "Guest Authentication", href: "/guest-authentication" },
      { title: "Standard Authentication", href: "/standard-authentication" },
      { title: "SAML Authentication", href: "/saml-authentication" },
      { title: "OIDC Authentication", href: "/oidc-authentication" },
    ],
  },
  {
    title: "Functionalities",
    href: "/functionalities",
    heading: "Functionalities",
    items: [
      { title: "Navigation", href: "/navigation" },
      { title: "Filters", href: "/filters" },
      { title: "Event Handling", href: "/event-handling" },
      { title: "Error Handling", href: "/error-handling" },
    ],
  },
]
