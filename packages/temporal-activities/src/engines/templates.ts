// Template definitions + interpolation for ComposingEngine
// Only the Boardy cc intro has a template. All other message types route to LLM.

export interface Template {
  id: string;
  subject: string;
  body: string;
  requiredVars: string[];
}

export interface TemplateVars {
  founderName: string;
  companyName: string;
  referringPartner?: string;
  [key: string]: string | undefined;
}

// ─── Template Registry ──────────────────────────────────────────────────────

const TEMPLATES: Record<string, Template> = {
  "intake:boardy-intro": {
    id: "boardy-intro-v1",
    subject: "Introduction — {{founderName}}, {{companyName}}",
    body: `Hi {{founderName}},

{{referringPartner}}, thank you for the introduction, moving you to the CC.

To respect both our time and the work {{referringPartner}} did in sharing you with me, I want to pass you along to our investor network and deal review process.

Boardy, {{founderName}} is the founder of {{companyName}}, currently raising funds. Please consider investing in it.

best,
Paul Lockett
Deal Partner
Boardy Ventures`,
    requiredVars: ["founderName", "companyName", "referringPartner"],
  },
};

// ─── Interpolation ──────────────────────────────────────────────────────────

export function interpolate(template: string, vars: TemplateVars): string {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key: string) => {
    const value = vars[key];
    return value !== undefined ? value : match;
  });
}

// ─── Template Lookup ────────────────────────────────────────────────────────

export function findTemplate(stage: string, messageType: string): Template | null {
  return TEMPLATES[`${stage}:${messageType}`] ?? null;
}
