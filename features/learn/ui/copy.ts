import type { LanguageId } from "../domain/language";
import type { Stage } from "../domain/progression";

/**
 * Words the interface says in the language being learned — headings, teacher's
 * marks, buttons. Instructions stay in English so a beginner is never lost;
 * the target language carries the mood and gives constant, tiny exposure.
 */
export interface Copy {
  readonly brand: string;
  readonly greetingMorning: string;
  readonly greetingEvening: string;
  readonly seeYouTomorrow: string;
  readonly today: string;
  readonly start: string;
  readonly startAgain: string;
  readonly plan: string;
  readonly goal: string;
  readonly settings: string;
  readonly whereAreYou: string;

  readonly steps: { readonly review: string; readonly learn: string; readonly listen: string; readonly speak: string; readonly write: string; readonly dictation: string };

  readonly check: string;
  readonly next: string;
  readonly sayBack: string;
  readonly typeBack: string;
  readonly seeWords: string;
  readonly keepWords: string;
  readonly wordsToKeep: string;
  readonly continue: string;
  readonly finishPage: string;
  readonly correct: string;
  readonly retry: string;

  readonly reviewHeading: string;
  readonly forgot: string;
  readonly knewIt: string;

  readonly speakHeading: string;
  readonly sayIt: string;
  readonly sayAgain: string;
  readonly listening: string;
  readonly saidWell: string;
  readonly almost: string;
  readonly heardNothing: string;
  readonly micBlocked: string;
  readonly noCheck: string;

  readonly askHeading: string;
  readonly answer: string;
  readonly answeredWell: string;
  readonly niceTry: string;
  readonly fallbackQuestion: { readonly fr: string; readonly en: string };

  readonly listenHeading: string;
  readonly heardRight: string;
  readonly heardWrong: string;

  readonly tilesHeading: string;
  readonly gapHeading: string;
  readonly dictationHeading: string;
  readonly writePlaceholder: string;
  readonly dictationPlaceholder: string;
  readonly perfect: string;
  readonly thereYouGo: string;
  readonly notQuite: string;
  readonly rightBut: string;
  readonly toFix: string;
  readonly noMistakes: string;
  readonly teacherReading: string;

  readonly savingPage: string;
  readonly pageNotFound: string;
  readonly veryGood: string;
  readonly goodWork: string;
  readonly keepGoing: string;
  readonly keepProgress: string;
  readonly signInTitle: string;
  readonly signUpTitle: string;
  readonly readyFor: (level: string) => string;
  readonly newCards: (count: number) => string;
  readonly recalled: (percent: number) => string;
  readonly cardsTomorrow: (count: number) => string;
  readonly unlocked: Partial<Record<Stage, string>>;

  readonly settingsRows: { readonly page: string; readonly light: string; readonly level: string; readonly time: string; readonly account: string; readonly classic: string; readonly otherLanguage: string };
  readonly modes: { readonly light: string; readonly dark: string; readonly system: string };
  readonly styles: { readonly notebook: string; readonly dictionary: string };
}

const plural = (count: number, one: string, many: string): string => `${count} ${count === 1 ? one : many}`;

const FR: Copy = {
  brand: "français",
  greetingMorning: "Bonjour.",
  greetingEvening: "Bonsoir.",
  seeYouTomorrow: "À demain.",
  today: "Aujourd'hui :",
  start: "Commencer",
  startAgain: "Encore une page",
  plan: "Au programme",
  goal: "Ton objectif",
  settings: "Réglages",
  whereAreYou: "Where are you with French?",
  steps: { review: "Revoir", learn: "Apprendre", listen: "Écouter", speak: "Parler", write: "Écrire", dictation: "Dictée" },
  check: "Vérifier",
  next: "Suivant",
  sayBack: "Je le redis",
  typeBack: "Je l'écris",
  seeWords: "Voir les mots",
  keepWords: "Garder ces mots",
  wordsToKeep: "Mots à garder",
  continue: "Continuer",
  finishPage: "Terminer la page",
  correct: "Corriger",
  retry: "Réessayer",
  reviewHeading: "Ça veut dire quoi ?",
  forgot: "Pas encore",
  knewIt: "Je savais",
  speakHeading: "À vous de le dire.",
  sayIt: "Je le dis",
  sayAgain: "Encore une fois",
  listening: "J'écoute…",
  saidWell: "Bien dit !",
  almost: "Presque.",
  heardNothing: "Rien entendu.",
  micBlocked: "Micro bloqué.",
  noCheck: "Pas de vérification.",
  askHeading: "Réponds à voix haute.",
  answer: "Je réponds",
  answeredWell: "Très bien dit.",
  niceTry: "Bien essayé.",
  fallbackQuestion: { fr: "Raconte ta journée en une phrase.", en: "Tell me about your day in one sentence." },
  listenHeading: "À vitesse réelle.",
  heardRight: "Bien entendu !",
  heardWrong: "Presque — c'était celle-ci.",
  tilesHeading: "Remets les mots dans l'ordre.",
  gapHeading: "Le mot qui manque.",
  dictationHeading: "La dictée.",
  writePlaceholder: "Écris ta phrase ici…",
  dictationPlaceholder: "Écris ce que tu entends…",
  perfect: "Parfait.",
  thereYouGo: "Voilà !",
  notQuite: "Pas tout à fait.",
  rightBut: "Juste — mais…",
  toFix: "À corriger.",
  noMistakes: "Zéro faute !",
  teacherReading: "Le prof lit…",
  savingPage: "On range la page…",
  pageNotFound: "Page introuvable.",
  veryGood: "Très bien !",
  goodWork: "Bon travail.",
  keepGoing: "Courage, ça vient.",
  keepProgress: "Garder mes progrès",
  signInTitle: "Retrouve ton cahier.",
  signUpTitle: "Ton cahier à toi.",
  readyFor: (level) => `Prêt pour le ${level} ?`,
  newCards: (n) => plural(n, "nouvelle carte", "nouvelles cartes"),
  recalled: (p) => `${p} % retenus`,
  cardsTomorrow: (n) => `${plural(n, "carte", "cartes")} pour demain`,
  unlocked: { 2: "Nouveau demain : le mot qui manque.", 3: "Nouveau demain : ta propre phrase." },
  settingsRows: { page: "Page", light: "Lumière", level: "Niveau", time: "Temps", account: "Compte", classic: "Ancienne vue", otherLanguage: "Autre langue" },
  modes: { light: "Jour", dark: "Nuit", system: "Auto" },
  styles: { notebook: "Cahier", dictionary: "Dictionnaire" },
};

const ES: Copy = {
  brand: "español",
  greetingMorning: "Buenos días.",
  greetingEvening: "Buenas noches.",
  seeYouTomorrow: "Hasta mañana.",
  today: "Hoy:",
  start: "Empezar",
  startAgain: "Otra página",
  plan: "El plan de hoy",
  goal: "Tu objetivo",
  settings: "Ajustes",
  whereAreYou: "Where are you with Spanish?",
  steps: { review: "Repasar", learn: "Aprender", listen: "Escuchar", speak: "Hablar", write: "Escribir", dictation: "Dictado" },
  check: "Comprobar",
  next: "Siguiente",
  sayBack: "Lo repito",
  typeBack: "Lo escribo",
  seeWords: "Ver las palabras",
  keepWords: "Guardar estas palabras",
  wordsToKeep: "Palabras para guardar",
  continue: "Seguir",
  finishPage: "Terminar la página",
  correct: "Corregir",
  retry: "Reintentar",
  reviewHeading: "¿Qué significa?",
  forgot: "Todavía no",
  knewIt: "Lo sabía",
  speakHeading: "Te toca a ti.",
  sayIt: "Lo digo",
  sayAgain: "Otra vez",
  listening: "Escuchando…",
  saidWell: "¡Bien dicho!",
  almost: "Casi.",
  heardNothing: "No se oyó nada.",
  micBlocked: "Micrófono bloqueado.",
  noCheck: "Sin comprobación.",
  askHeading: "Responde en voz alta.",
  answer: "Respondo",
  answeredWell: "Muy bien dicho.",
  niceTry: "Buen intento.",
  fallbackQuestion: { fr: "Cuéntame tu día en una frase.", en: "Tell me about your day in one sentence." },
  listenHeading: "A velocidad real.",
  heardRight: "¡Bien oído!",
  heardWrong: "Casi — era esta.",
  tilesHeading: "Ordena las palabras.",
  gapHeading: "La palabra que falta.",
  dictationHeading: "El dictado.",
  writePlaceholder: "Escribe tu frase aquí…",
  dictationPlaceholder: "Escribe lo que oyes…",
  perfect: "Perfecto.",
  thereYouGo: "¡Eso es!",
  notQuite: "No del todo.",
  rightBut: "Correcto — pero…",
  toFix: "A corregir.",
  noMistakes: "¡Cero faltas!",
  teacherReading: "La profe está leyendo…",
  savingPage: "Guardando la página…",
  pageNotFound: "Página no encontrada.",
  veryGood: "¡Muy bien!",
  goodWork: "Buen trabajo.",
  keepGoing: "Ánimo, ya llegará.",
  keepProgress: "Guardar mi progreso",
  signInTitle: "Recupera tu cuaderno.",
  signUpTitle: "Tu propio cuaderno.",
  readyFor: (level) => `¿Listo para el ${level}?`,
  newCards: (n) => plural(n, "tarjeta nueva", "tarjetas nuevas"),
  recalled: (p) => `${p} % recordadas`,
  cardsTomorrow: (n) => `${plural(n, "tarjeta", "tarjetas")} para mañana`,
  unlocked: { 2: "Mañana, novedad: la palabra que falta.", 3: "Mañana, novedad: tu propia frase." },
  settingsRows: { page: "Página", light: "Luz", level: "Nivel", time: "Tiempo", account: "Cuenta", classic: "Vista clásica", otherLanguage: "Otro idioma" },
  modes: { light: "Día", dark: "Noche", system: "Auto" },
  styles: { notebook: "Cuaderno", dictionary: "Diccionario" },
};

export const COPY: Record<LanguageId, Copy> = { fr: FR, es: ES };
