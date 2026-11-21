import type { LanguageId, LanguagePack } from "../language";
import { SPANISH } from "./es";
import { FRENCH } from "./fr";

export { FRENCH, SPANISH };

export const LANGUAGES: Record<LanguageId, LanguagePack> = { fr: FRENCH, es: SPANISH };
