const envName = process.env.NEXT_PUBLIC_STORE_NAME?.trim();

export const STORE = {
  name: envName || "ÉLARA",
  descriptor: "Fashion Boutique",
  paymentDescriptor: (envName || "ÉLARA").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^A-Za-z0-9 ]/g, "").slice(0, 13) || "ELARA",
  tagline: "Estilo que trasciende temporadas.",
  currency: "PEN",
  locale: "es-PE",
  whatsappNumber: "51930501096",
  whatsappDisplay: "+51 930 501 096",
  palette: {
    obsidian: "#111111",
    ivory: "#F8F5EF",
    champagne: "#C6A66B",
    white: "#FFFFFF",
    stone: "#77736D",
  },
} as const;

export function whatsappUrl(message: string): string {
  return `https://wa.me/${STORE.whatsappNumber}?text=${encodeURIComponent(message)}`;
}
