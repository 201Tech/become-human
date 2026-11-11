import { homedir } from "node:os";
import { join } from "node:path";

import { isLanguage, Language } from "./i18n";

const DEFAULT_DATA_FOLDER = "BecomeHuman";
const DEFAULT_LANGUAGE: Language = "en";

export function dataDir(): string {
  return process.env.BECOME_HUMAN_HOME ?? join(homedir(), DEFAULT_DATA_FOLDER);
}

export function language(): Language {
  const configured = process.env.BECOME_HUMAN_LANG ?? "";

  return isLanguage(configured) ? configured : DEFAULT_LANGUAGE;
}
