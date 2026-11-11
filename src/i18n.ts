export const CATEGORIES = [
  "workflow",
  "communication",
  "code",
  "decisions",
  "learning",
  "tone",
] as const;

export type Category = (typeof CATEGORIES)[number];

export interface Labels {
  profileTitle: string;
  categories: Record<Category, string>;
  myRulesTemplate: string;
}

const LABELS = {
  en: {
    profileTitle: "What I learned about you",
    categories: {
      workflow: "Workflow",
      communication: "Communication",
      code: "Code",
      decisions: "Decisions",
      learning: "Learning",
      tone: "Tone",
    },
    myRulesTemplate: [
      "# My rules",
      "",
      "<!--",
      "Write here anything you want every agent to follow, one rule per line.",
      "Example: - Always answer in Portuguese.",
      "Text inside this comment is ignored.",
      "-->",
      "",
    ].join("\n"),
  },
  pt: {
    profileTitle: "O que aprendi sobre você",
    categories: {
      workflow: "Fluxo de trabalho",
      communication: "Comunicação",
      code: "Código",
      decisions: "Decisões",
      learning: "Aprendizagem",
      tone: "Tom",
    },
    myRulesTemplate: [
      "# Minhas regras",
      "",
      "<!--",
      "Escreva aqui o que todo agente deve seguir, uma regra por linha.",
      "Exemplo: - Responder sempre em português.",
      "O texto dentro deste comentário é ignorado.",
      "-->",
      "",
    ].join("\n"),
  },
} satisfies Record<string, Labels>;

export type Language = keyof typeof LABELS;

export function isLanguage(value: string): value is Language {
  return Object.hasOwn(LABELS, value);
}

export function labels(language: Language): Labels {
  return LABELS[language];
}
