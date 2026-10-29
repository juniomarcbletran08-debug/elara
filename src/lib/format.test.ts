import { describe, expect, it } from "vitest";
import { formatPEN, slugify } from "@/lib/format";
import { STORE, whatsappUrl } from "@/lib/config";

describe("formatPEN", () => {
  it("formats PEN values for Peru", () => {
    expect(formatPEN(149.9)).toContain("149.90");
    expect(formatPEN(149.9)).toContain("S/");
  });
  it("rejects invalid numbers", () => {
    expect(() => formatPEN(Number.NaN)).toThrow();
  });
});

describe("slugify", () => {
  it("normalizes accents, whitespace and punctuation", () => {
    expect(slugify("Vestido Élegance / Azul")).toBe("vestido-elegance-azul");
  });
  it("handles empty input", () => {
    expect(slugify("  ")).toBe("");
  });
});

describe("WhatsApp", () => {
  it("uses the commercial number and encodes the message", () => {
    const url = new URL(whatsappUrl("Hola ÉLARA & gracias"));
    expect(url.origin + url.pathname).toBe("https://wa.me/" + STORE.whatsappNumber);
    expect(url.searchParams.get("text")).toBe("Hola ÉLARA & gracias");
  });
});
