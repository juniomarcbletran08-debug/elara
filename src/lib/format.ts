import { STORE } from "@/lib/config";

export function formatPEN(amount: number): string {
  if (!Number.isFinite(amount)) throw new TypeError("El precio debe ser un número finito.");
  return new Intl.NumberFormat(STORE.locale, {
    style: "currency",
    currency: STORE.currency,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function slugify(value: string): string {
  return value.normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
