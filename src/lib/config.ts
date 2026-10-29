const envName = process.env.NEXT_PUBLIC_STORE_NAME?.trim();

export const STORE = {
  name: envName || "ÉLARA",
  descriptor: "Fashion Boutique",
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
