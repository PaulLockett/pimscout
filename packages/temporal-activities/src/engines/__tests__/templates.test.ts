import { describe, it, expect } from "vitest";
import { interpolate, findTemplate } from "../templates.js";

describe("templates", () => {
  describe("findTemplate", () => {
    it("returns boardy-intro template for intake stage", () => {
      const template = findTemplate("intake", "boardy-intro");
      expect(template).not.toBeNull();
      expect(template!.id).toBe("boardy-intro-v1");
      expect(template!.requiredVars).toContain("founderName");
      expect(template!.requiredVars).toContain("companyName");
      expect(template!.requiredVars).toContain("referringPartner");
    });

    it("returns null for non-template message types", () => {
      expect(findTemplate("active-nurture", "relationship-building")).toBeNull();
      expect(findTemplate("warm", "check-in")).toBeNull();
      expect(findTemplate("intake", "follow-up")).toBeNull();
    });
  });

  describe("interpolate", () => {
    it("replaces all known variables", () => {
      const template = "Hi {{founderName}}, welcome to {{companyName}}";
      const result = interpolate(template, {
        founderName: "Alice",
        companyName: "Acme Inc",
      });
      expect(result).toBe("Hi Alice, welcome to Acme Inc");
    });

    it("leaves unmatched placeholders visible for review", () => {
      const template = "Hi {{founderName}}, contact {{unknownVar}}";
      const result = interpolate(template, {
        founderName: "Bob",
        companyName: "Test Co",
      });
      expect(result).toBe("Hi Bob, contact {{unknownVar}}");
    });

    it("produces correct Boardy intro email with real template", () => {
      const template = findTemplate("intake", "boardy-intro")!;
      const result = interpolate(template.body, {
        founderName: "Sarah Chen",
        companyName: "QuantumLeap AI",
        referringPartner: "Jessica",
      });

      expect(result).toContain("Hi Sarah Chen,");
      expect(result).toContain("Jessica, thank you for the introduction");
      expect(result).toContain("founder of QuantumLeap AI");
      expect(result).toContain("Paul Lockett");
      expect(result).not.toContain("{{");
    });

    it("interpolates subject line correctly", () => {
      const template = findTemplate("intake", "boardy-intro")!;
      const result = interpolate(template.subject, {
        founderName: "Sarah Chen",
        companyName: "QuantumLeap AI",
      });
      expect(result).toBe("Introduction — Sarah Chen, QuantumLeap AI");
    });
  });
});
