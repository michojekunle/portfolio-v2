import type { LanguagePack } from "../language";
import type { Lesson } from "../lessons";

/**
 * Hand-written Spanish lessons (neutral Spanish, "tú"), used for guests, new
 * users and AI outages. Same shape and size as the French ones.
 */
const FALLBACK_LESSONS: readonly Lesson[] = [
  {
    title: "En la cafetería",
    topic: "ordering at a café",
    level: "A2",
    sentences: [
      { fr: "Hola, buenos días. ¿Me pone un café con leche, por favor?", en: "Hello, good morning. Could I have a coffee with milk, please?", gloss: [{ fr: "hola", en: "hello" }, { fr: "buenos días", en: "good morning" }, { fr: "un café con leche", en: "a coffee with milk" }, { fr: "por favor", en: "please" }] },
      { fr: "¿Algo más?", en: "Anything else?", gloss: [] },
      { fr: "Sí, una tostada con tomate, pero sin aceite.", en: "Yes, a piece of toast with tomato, but without oil.", gloss: [{ fr: "sí", en: "yes" }, { fr: "una tostada", en: "a slice of toast" }, { fr: "con tomate", en: "with tomato" }, { fr: "pero", en: "but" }, { fr: "aceite", en: "(olive) oil" }] },
      { fr: "Son tres euros con cincuenta.", en: "That's three euros fifty.", gloss: [{ fr: "son", en: "that's / they are" }, { fr: "tres", en: "three" }, { fr: "con cincuenta", en: "and fifty (cents)" }] },
      { fr: "Aquí tiene. Quédese con el cambio.", en: "Here you go. Keep the change.", gloss: [{ fr: "aquí tiene", en: "here you are (formal)" }] },
      { fr: "¡Muchas gracias, que tenga un buen día!", en: "Thank you very much, have a good day!", gloss: [{ fr: "muchas gracias", en: "thank you very much" }, { fr: "que tenga un buen día", en: "have a good day (formal)" }] },
    ],
    vocab: [
      { fr: "me pone", en: "could I have (when ordering)", note: "Very common in Spain at the counter" },
      { fr: "algo más", en: "anything else" },
      { fr: "sin", en: "without" },
      { fr: "el cambio", en: "the change (money)" },
      { fr: "quédese", en: "keep (formal)", note: "From quedarse, usted form" },
    ],
    shadow: { fr: "Hola, buenos días. ¿Me pone un café con leche, por favor?", en: "Hello, good morning. Could I have a coffee with milk, please?" },
    ask: { fr: "¿Qué tomas normalmente en una cafetería?", en: "What do you usually have at a café?" },
    write: { prompt: "Escribe una frase para pedir algo con « me pone ».", targetWord: "me pone" },
  },
  {
    title: "Este fin de semana",
    topic: "making weekend plans",
    level: "A2",
    sentences: [
      { fr: "¿Qué haces este fin de semana?", en: "What are you doing this weekend?", gloss: [{ fr: "qué", en: "what" }, { fr: "haces", en: "you do / are doing" }, { fr: "este fin de semana", en: "this weekend" }] },
      { fr: "Todavía no lo sé. ¿Y tú?", en: "I don't know yet. And you?", gloss: [{ fr: "lo sé", en: "I know (it)" }, { fr: "y tú", en: "and you" }] },
      { fr: "Yo voy a ir al mercado el sábado por la mañana.", en: "I'm going to go to the market on Saturday morning.", gloss: [{ fr: "yo", en: "I" }, { fr: "al mercado", en: "to the market" }, { fr: "el sábado", en: "on Saturday" }, { fr: "por la mañana", en: "in the morning" }] },
      { fr: "¿Quieres venir conmigo?", en: "Do you want to come with me?", gloss: [{ fr: "quieres", en: "do you want" }, { fr: "venir", en: "to come" }] },
      { fr: "¡Vale! Después podemos comer juntos.", en: "OK! Afterwards we can have lunch together.", gloss: [{ fr: "después", en: "afterwards" }, { fr: "podemos", en: "we can" }, { fr: "comer", en: "to have lunch / to eat" }] },
      { fr: "Perfecto, te llamo el viernes.", en: "Perfect, I'll call you on Friday.", gloss: [{ fr: "perfecto", en: "perfect" }, { fr: "te llamo", en: "I'll call you" }, { fr: "el viernes", en: "on Friday" }] },
    ],
    vocab: [
      { fr: "todavía no", en: "not yet" },
      { fr: "voy a ir", en: "I'm going to go", note: "ir a + infinitive = near future" },
      { fr: "conmigo", en: "with me" },
      { fr: "vale", en: "OK", note: "Everyday Spain Spanish" },
      { fr: "juntos", en: "together" },
    ],
    shadow: { fr: "Yo voy a ir al mercado el sábado por la mañana.", en: "I'm going to go to the market on Saturday morning." },
    ask: { fr: "¿Qué vas a hacer este fin de semana?", en: "What are you going to do this weekend?" },
    write: { prompt: "Escribe una frase sobre tus planes con « voy a ».", targetWord: "voy a" },
  },
  {
    title: "Anoche",
    topic: "telling a story about yesterday",
    level: "A2",
    sentences: [
      { fr: "Anoche fui al cine con una amiga.", en: "Last night I went to the cinema with a friend.", gloss: [{ fr: "al cine", en: "to the cinema" }, { fr: "con", en: "with" }, { fr: "una amiga", en: "a (female) friend" }] },
      { fr: "Vimos una película muy divertida.", en: "We saw a very funny film.", gloss: [{ fr: "vimos", en: "we saw" }, { fr: "una película", en: "a film" }, { fr: "muy", en: "very" }] },
      { fr: "Después de la película, cenamos una pizza.", en: "After the film, we had a pizza for dinner.", gloss: [{ fr: "después de", en: "after" }, { fr: "cenamos", en: "we had dinner" }] },
      { fr: "Estaba lloviendo, así que volvimos en taxi.", en: "It was raining, so we came back by taxi.", gloss: [{ fr: "estaba lloviendo", en: "it was raining" }, { fr: "volvimos", en: "we came back" }, { fr: "en taxi", en: "by taxi" }] },
      { fr: "Lo pasé muy bien.", en: "I had a really good time.", gloss: [{ fr: "lo pasé muy bien", en: "I had a really good time" }] },
    ],
    vocab: [
      { fr: "anoche", en: "last night" },
      { fr: "fui", en: "I went", note: "Past of ir (also of ser)" },
      { fr: "divertida", en: "funny, fun" },
      { fr: "así que", en: "so (therefore)" },
      { fr: "pasarlo bien", en: "to have a good time" },
    ],
    shadow: { fr: "Vimos una película muy divertida.", en: "We saw a very funny film." },
    ask: { fr: "¿Qué hiciste anoche?", en: "What did you do last night?" },
    write: { prompt: "Escribe una frase en pasado con « fui ».", targetWord: "fui" },
  },
];

export const SPANISH: LanguagePack = {
  id: "es",
  name: "Spanish",
  appName: "Spanish Daily",
  route: "/spanish",
  api: "/api/spanish",
  speechLocale: "es-ES",
  accentRegion: "Spain",
  // Spain-Spanish voices on common platforms (Paulina is Mexican, so she is not here).
  voiceHints: /mónica|monica|jorge|lucía|lucia|elvira|álvaro|alvaro|helena|laura|pablo|google español de españa|google español/i,
  topics: [
    "ordering at a café",
    "making weekend plans",
    "telling a story about yesterday",
    "asking for directions",
    "shopping at the market",
    "talking about work",
    "describing your family",
    "booking a hotel room",
    "visiting a doctor",
    "meeting a new colleague",
  ],
  fallbackLessons: FALLBACK_LESSONS,
  cefrGuide: {
    A1: "present tense only, 4-7 word sentences, the 500 most common words",
    A2: "present, pretérito perfecto, pretérito indefinido and ir a + infinitive, 6-10 word sentences, everyday vocabulary",
    B1: "add the imperfecto and the conditional, the subjunctive in fixed expressions (ojalá, cuando + future), 8-14 word sentences, some idioms",
    B2: "all common tenses incl. present and imperfect subjunctive, natural spoken connectors, 10-18 word sentences",
  },
  levelUpChanges: {
    A1: "",
    A2: "A2 scenes add the past tenses (pretérito perfecto and indefinido) and ir a + infinitive.",
    B1: "B1 scenes add the imperfecto, the conditional and the first subjunctive expressions.",
    B2: "B2 scenes use every common tense, including the subjunctive, and sound like natural speech.",
  },
  informalYou: "tú",
  articles: ["el", "la", "los", "las", "un", "una", "unos", "unas"],
  accents: ["á", "é", "í", "ó", "ú", "ñ", "ü", "¿", "¡"],
  // Casual speech in much of Spain and Latin America; regional, not "wrong" — learners need to recognise it, not copy it.
  // Unicode-aware boundaries: \b treats "á" as a non-letter, so \bestá\b would never match.
  reductions: [
    { pattern: /(?<!\p{L})para el(?!\p{L})/giu, spoken: "pa'l", why: "para shrinks to pa' and fuses with el" },
    { pattern: /(?<!\p{L})para(?!\p{L})/giu, spoken: "pa'", why: "para shrinks to pa' in casual speech" },
    { pattern: /(?<!\p{L})está(?!\p{L})/giu, spoken: "'tá", why: "the es- of estar is often swallowed" },
    { pattern: /(?<!\p{L})estoy(?!\p{L})/giu, spoken: "'toy", why: "the es- of estar is often swallowed" },
    { pattern: /(?<!\p{L})nada(?!\p{L})/giu, spoken: "na'", why: "the d between vowels softens and drops" },
    { pattern: /(?<!\p{L})(\p{L}{2,})ado(?!\p{L})/giu, spoken: "$1ao", why: "the d in -ado softens and drops (cansado → cansao)" },
    { pattern: /(?<!\p{L})(\p{L}+)dad(?!\p{L})/giu, spoken: "$1dá", why: "a final d is barely pronounced" },
  ],
  spokenNote: "In everyday speech, Spanish softens and drops sounds. Written first, then spoken.",
  tables: {
    profiles: "spanish_profiles",
    streaks: "spanish_user_streaks",
    cards: "spanish_cards",
    cardText: "target_text",
    lessons: "spanish_lessons",
    sessions: "spanish_sessions",
    completionLog: null,
  },
};
