import { describe, expect, it } from "vitest";
import { categories, filterProducts, formatPrice, products } from "../src/lib/catalog";

describe("ÉLARA catalog", () => {
  it("contains a large demo catalog", () => {
    expect(products.length).toBeGreaterThanOrEqual(45);
    expect(new Set(products.map((product) => product.id)).size).toBe(products.length);
  });

  it("includes the expected category filters", () => {
    expect(categories).toEqual(["Todo", "Vestidos", "Blusas", "Conjuntos", "Accesorios"]);
  });

  it("filters products by category", () => {
    const result = filterProducts(products, "", "Vestidos");
    expect(result.length).toBeGreaterThan(0);
    expect(result.every((product) => product.category === "Vestidos")).toBe(true);
  });

  it("searches names without case sensitivity", () => {
    expect(filterProducts(products, "vestido sofía", "Todo").map((product) => product.id)).toContain("vestido-sofia");
  });

  it("combines category and text search", () => {
    expect(filterProducts(products, "perla", "Blusas").map((product) => product.id)).toEqual(["top-perla"]);
    expect(filterProducts(products, "perla", "Vestidos")).toEqual([]);
  });

  it("formats prices in Peruvian soles", () => {
    expect(formatPrice(189)).toContain("189");
    expect(formatPrice(189)).toMatch(/S\/|PEN/i);
  });
});