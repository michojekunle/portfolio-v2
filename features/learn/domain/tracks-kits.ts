import { normaliseWord } from "./glossary";
import type { LanguageId } from "./language";
import { LEVELS, type Level, type Register } from "./lessons";
import type { TrackId } from "./tracks";

export interface KitPhrase {
  readonly fr: string;
  readonly en: string;
  readonly notes: string;
  readonly register: Register;
  readonly minLevel: Level;
}

const FRENCH_KITS: Record<TrackId, readonly KitPhrase[]> = {
  general: [
    { fr: "Je voudrais", en: "I would like", notes: "Polite everyday opener for counters and requests", register: "vous", minLevel: "A1" },
    { fr: "Ça marche", en: "That works / sounds good", notes: "Standard casual confirmation", register: "tu", minLevel: "A1" },
    { fr: "Excusez-moi de vous déranger", en: "Sorry to bother you", notes: "Respectful opener before asking someone for help", register: "vous", minLevel: "A2" },
    { fr: "On se retrouve à quelle heure ?", en: "What time shall we meet up?", notes: "Everyday social plan phrasing", register: "tu", minLevel: "A2" },
    { fr: "Ça fait combien en tout ?", en: "How much is that altogether?", notes: "Useful at cafés, markets, and shops", register: "vous", minLevel: "A1" },
    { fr: "Franchement, je ne sais pas encore.", en: "Honestly, I don't know yet.", notes: "Natural conversational hedge", register: "tu", minLevel: "B1" },
  ],
  tech: [
    { fr: "De mon côté, j'ai avancé sur…", en: "On my side, I made progress on…", notes: "Standard French standup opener", register: "tu", minLevel: "A1" },
    { fr: "Je suis bloqué sur", en: "I am blocked on", notes: "Clear blocker flag for standups or Slack", register: "tu", minLevel: "A1" },
    { fr: "Du coup, on fait comment ?", en: "So, how should we proceed?", notes: "Everyday team decision connector", register: "tu", minLevel: "A2" },
    { fr: "Ça pète en staging.", en: "It's failing/breaking in staging.", notes: "Colloquial dev phrase for broken environments", register: "tu", minLevel: "B1" },
    { fr: "Tu peux jeter un œil à ma PR ?", en: "Can you take a look at my PR?", notes: "Polite peer code-review ask", register: "tu", minLevel: "A2" },
    { fr: "Le souci vient plutôt de…", en: "The issue rather comes from…", notes: "Pinpointing root cause gently in debugging", register: "tu", minLevel: "B1" },
    { fr: "On garde la mise en prod pour jeudi ?", en: "Are we keeping the prod release for Thursday?", notes: "'mise en prod' = release to production", register: "tu", minLevel: "A2" },
    { fr: "Il vaut mieux revenir en arrière.", en: "It's better to roll back.", notes: "Calm incident rollback suggestion", register: "mixed", minLevel: "B1" },
    { fr: "Pour que ce soit plus maintenable…", en: "So that it's easier to maintain…", notes: "Subjunctive phrase great for PRs & interviews", register: "mixed", minLevel: "B2" },
    { fr: "Si on ajoute ça maintenant, ça décale la livraison.", en: "If we add this now, it pushes back delivery.", notes: "Firm, non-blaming scope pushback", register: "vous", minLevel: "B1" },
  ],
  medical: [
    { fr: "Qu'est-ce qui vous amène aujourd'hui ?", en: "What brings you in today?", notes: "Warm opening question for consultations", register: "vous", minLevel: "A1" },
    { fr: "Où avez-vous mal exactement ?", en: "Where does it hurt exactly?", notes: "Pinpointing pain location politely", register: "vous", minLevel: "A1" },
    { fr: "Depuis combien de temps ?", en: "For how long / since when?", notes: "Essential symptom duration question", register: "vous", minLevel: "A1" },
    { fr: "Est-ce que vous avez des allergies ?", en: "Do you have any allergies?", notes: "Core safety screen before prescribing", register: "vous", minLevel: "A2" },
    { fr: "Vous prenez déjà un traitement ?", en: "Are you already taking any medication?", notes: "Checking current meds ('traitement')", register: "vous", minLevel: "A2" },
    { fr: "Dites-moi si ça vous fait mal.", en: "Tell me if this hurts you.", notes: "Reassures the patient during examination", register: "vous", minLevel: "A2" },
    { fr: "Respirez profondément par la bouche.", en: "Breathe deeply through your mouth.", notes: "Chest exam instruction", register: "vous", minLevel: "A2" },
    { fr: "Il faut rester à jeun à partir de minuit.", en: "You must fast starting from midnight.", notes: "'à jeun' = empty stomach before bloodwork/surgery", register: "vous", minLevel: "B1" },
    { fr: "Prenez un comprimé matin et soir après le repas.", en: "Take one tablet morning and evening after meals.", notes: "Clear discharge dosage phrasing", register: "vous", minLevel: "B1" },
    { fr: "Revenez tout de suite si la fièvre remonte.", en: "Come back right away if the fever goes back up.", notes: "Clear return precautions without panic", register: "vous", minLevel: "B1" },
  ],
  student: [
    { fr: "Excusez-moi de vous déranger après le cours.", en: "Sorry to bother you after class.", notes: "Polite opener for approaching a professor", register: "vous", minLevel: "A1" },
    { fr: "Tu pourrais m'envoyer les notes d'aujourd'hui ?", en: "Could you send me today's notes?", notes: "Casual favor to a classmate", register: "tu", minLevel: "A2" },
    { fr: "Qu'est-ce qu'il faut déposer sur l'ENT ?", en: "What do we need to upload to the student portal?", notes: "'ENT' = French university digital workspace", register: "mixed", minLevel: "A2" },
    { fr: "Il manque encore une pièce à mon dossier.", en: "My file is still missing one document.", notes: "Key phrase at scolarité / CROUS desks", register: "vous", minLevel: "A2" },
    { fr: "On se partage les parties pour l'exposé ?", en: "Shall we split up sections for the presentation?", notes: "Leading group project coordination", register: "tu", minLevel: "A2" },
    { fr: "Dans un premier temps…", en: "First of all / in the first stage…", notes: "Standard academic exposé transition", register: "vous", minLevel: "B1" },
    { fr: "Serait-il possible de décaler le rendu de deux jours ?", en: "Would it be possible to push the submission by two days?", notes: "Polite conditional extension request", register: "vous", minLevel: "B1" },
    { fr: "Je comprends ton point, mais d'un autre côté…", en: "I see your point, but on the other hand…", notes: "Respectful seminar disagreement", register: "mixed", minLevel: "B1" },
    { fr: "Je cherche un stage à partir de juin.", en: "I'm looking for an internship starting in June.", notes: "Advisor / lab networking opener", register: "vous", minLevel: "A2" },
  ],
  business: [
    { fr: "Merci d'avoir pris ce créneau.", en: "Thank you for taking this slot.", notes: "Clean opener on client or partner calls", register: "vous", minLevel: "A1" },
    { fr: "Ce que je vous propose, c'est…", en: "What I suggest is…", notes: "Polite, confident way to steer a meeting", register: "vous", minLevel: "A2" },
    { fr: "Quelle est votre priorité ce trimestre ?", en: "What is your priority this quarter?", notes: "High-leverage discovery question", register: "vous", minLevel: "A2" },
    { fr: "Je me permets de vous relancer au sujet de…", en: "I'm following up with you regarding…", notes: "Polite French business follow-up opener", register: "vous", minLevel: "B1" },
    { fr: "Pour qu'on soit bien alignés…", en: "So that we're fully aligned…", notes: "Prevents scope misunderstandings diplomatically", register: "vous", minLevel: "B1" },
    { fr: "Sur le principe je comprends, toutefois…", en: "In principle I understand, however…", notes: "Diplomatic pushback without sounding blunt", register: "vous", minLevel: "B2" },
    { fr: "Voici les prochaines étapes d'ici vendredi.", en: "Here are the next steps by Friday.", notes: "Crisp call wrap-up", register: "vous", minLevel: "A2" },
    { fr: "Nous pouvons démarrer par une première phase.", en: "We can start with a Phase 1.", notes: "Reshaping scope during price negotiation", register: "vous", minLevel: "B1" },
  ],
  relocation: [
    { fr: "Bonjour Madame, j'ai rendez-vous pour mon dossier.", en: "Hello Ma'am, I have an appointment for my file.", notes: "Essential polite desk ritual in France", register: "vous", minLevel: "A1" },
    { fr: "Voici mon justificatif de domicile.", en: "Here is my proof of address.", notes: "Asked at every bank, office, and agency", register: "vous", minLevel: "A1" },
    { fr: "Les charges sont comprises dans le loyer ?", en: "Are utilities/building fees included in the rent?", notes: "Must-ask during apartment viewings", register: "vous", minLevel: "A2" },
    { fr: "J'ai besoin d'un RIB pour mon employeur.", en: "I need my bank details (RIB) for my employer.", notes: "'RIB' = standard French bank account sheet", register: "vous", minLevel: "A2" },
    { fr: "Est-ce qu'une attestation d'hébergement suffit ?", en: "Is a host letter sufficient?", notes: "When you don't have a utility bill in your name yet", register: "vous", minLevel: "B1" },
    { fr: "Il y a une fuite sous l'évier depuis ce matin.", en: "There is a leak under the sink since this morning.", notes: "Reporting urgent flat repairs clearly", register: "vous", minLevel: "A2" },
    { fr: "Prenez-vous encore de nouveaux patients ?", en: "Are you still taking new patients?", notes: "Finding a primary care doctor (médecin traitant)", register: "vous", minLevel: "A2" },
    { fr: "Pourriez-vous me donner la référence du suivi ?", en: "Could you give me the tracking reference number?", notes: "Crucial on admin or telecom support calls", register: "vous", minLevel: "B1" },
  ],
  exams: [
    { fr: "À mon avis…", en: "In my opinion…", notes: "Clear thesis opener for oral prompts", register: "vous", minLevel: "A1" },
    { fr: "D'une part… d'autre part…", en: "On one hand… on the other hand…", notes: "Classic DELF/TCF structured balance", register: "vous", minLevel: "A2" },
    { fr: "Il me semble que", en: "It seems to me that", notes: "Nuanced stance softer than 'c'est sûr'", register: "vous", minLevel: "B1" },
    { fr: "C'est vrai que… néanmoins…", en: "It's true that… nevertheless…", notes: "High-scoring concession to an examiner counterpoint", register: "vous", minLevel: "B1" },
    { fr: "Par exemple, dans ma vie quotidienne…", en: "For example, in my daily life…", notes: "Grounds abstract topics with concrete proof", register: "vous", minLevel: "A2" },
    { fr: "Il serait utile de mettre en place…", en: "It would be useful to put in place…", notes: "Polite conditional proposal for conclusions", register: "vous", minLevel: "B2" },
    { fr: "Je vous remercie par avance de votre réponse.", en: "Thank you in advance for your reply.", notes: "Standard formal letter closing formula", register: "vous", minLevel: "A2" },
    { fr: "Ce qui m'a donné envie de vivre ici, c'est…", en: "What made me want to live here is…", notes: "Natural citizenship interview answer starter", register: "vous", minLevel: "B1" },
  ],
};

const SPANISH_SPAIN_KITS: Record<TrackId, readonly KitPhrase[]> = {
  general: [
    { fr: "¿Me pone un café, por favor?", en: "Could I have a coffee, please?", notes: "Everyday Spain counter request", register: "vous", minLevel: "A1" },
    { fr: "Vale, me parece bien.", en: "OK, sounds good to me.", notes: "Common Spain casual agreement", register: "tu", minLevel: "A1" },
    { fr: "Disculpe, ¿me puede ayudar?", en: "Excuse me, can you help me?", notes: "Polite street or counter opener", register: "vous", minLevel: "A1" },
    { fr: "¿A qué hora quedamos?", en: "What time shall we meet up?", notes: "Everyday social plan phrasing", register: "tu", minLevel: "A2" },
    { fr: "La verdad es que todavía no lo sé.", en: "The truth is I don't know yet.", notes: "Natural conversational hedge", register: "tu", minLevel: "B1" },
  ],
  tech: [
    { fr: "Por mi parte ya terminé…", en: "On my side I already finished…", notes: "Clean daily standup opener", register: "tu", minLevel: "A1" },
    { fr: "Estoy bloqueado con los permisos.", en: "I'm blocked on permissions.", notes: "Flagging a clear blocker", register: "tu", minLevel: "A1" },
    { fr: "¿Puedes echar un vistazo a mi PR?", en: "Can you take a look at my PR?", notes: "Polite peer review request", register: "tu", minLevel: "A2" },
    { fr: "Está fallando en el entorno de pruebas.", en: "It's failing in the staging/test environment.", notes: "Natural bug explanation", register: "tu", minLevel: "A2" },
    { fr: "El fallo viene más bien de…", en: "The bug rather comes from…", notes: "Pointing to root cause gently", register: "tu", minLevel: "B1" },
    { fr: "Mejor hacemos rollback y lo revisamos con calma.", en: "Better to roll back and check it calmly.", notes: "Calm incident triage decision", register: "tu", minLevel: "B1" },
    { fr: "En mi ordenador funciona bien, pero en producción no.", en: "It works on my computer, not in prod.", notes: "Uses Spain 'ordenador'", register: "tu", minLevel: "A2" },
    { fr: "Si añadimos esto ahora, se retrasa la entrega.", en: "If we add this now, the release gets delayed.", notes: "Clear scope trade-off", register: "vous", minLevel: "B1" },
  ],
  medical: [
    { fr: "¿Qué le trae por aquí hoy?", en: "What brings you in today?", notes: "Warm consultation opener (usted)", register: "vous", minLevel: "A1" },
    { fr: "¿Dónde le duele exactamente?", en: "Where does it hurt exactly?", notes: "Pinpointing pain politely", register: "vous", minLevel: "A1" },
    { fr: "¿Desde cuándo tiene estos síntomas?", en: "Since when have you had these symptoms?", notes: "Symptom timeline check", register: "vous", minLevel: "A2" },
    { fr: "¿Tiene alergia a algún medicamento?", en: "Are you allergic to any medication?", notes: "Essential safety check", register: "vous", minLevel: "A2" },
    { fr: "Dígame si le molesta cuando presiono aquí.", en: "Tell me if it hurts when I press here.", notes: "Reassures during exam", register: "vous", minLevel: "A2" },
    { fr: "Debe venir en ayunas mañana por la mañana.", en: "You need to come fasting tomorrow morning.", notes: "'en ayunas' = empty stomach for labs", register: "vous", minLevel: "B1" },
    { fr: "Tome una pastilla cada doce horas después de comer.", en: "Take one tablet every 12 hours after eating.", notes: "Clear dosage instructions", register: "vous", minLevel: "B1" },
    { fr: "Si la fiebre sube de nuevo, vuelva enseguida.", en: "If the fever goes back up, come back right away.", notes: "Clear return precautions", register: "vous", minLevel: "B1" },
  ],
  student: [
    { fr: "Disculpe que le moleste después de clase.", en: "Sorry to bother you after class.", notes: "Respectful opener for professors", register: "vous", minLevel: "A1" },
    { fr: "¿Me puedes pasar los apuntes de hoy?", en: "Can you send me today's lecture notes?", notes: "Casual ask to a classmate", register: "tu", minLevel: "A2" },
    { fr: "¿Hay que subir el trabajo al campus virtual?", en: "Do we need to upload the paper to the portal?", notes: "Checking submission steps", register: "mixed", minLevel: "A2" },
    { fr: "¿Cómo nos repartimos la presentación?", en: "How should we split the presentation?", notes: "Group work coordination", register: "tu", minLevel: "A2" },
    { fr: "¿Sería posible entregarlo el lunes?", en: "Would it be possible to submit it Monday?", notes: "Polite deadline extension ask", register: "vous", minLevel: "B1" },
    { fr: "En primer lugar… por otro lado…", en: "Firstly… on the other hand…", notes: "Academic oral presentation connectors", register: "vous", minLevel: "B1" },
    { fr: "Entiendo tu punto, pero conviene tener en cuenta…", en: "I see your point, but it's worth noting…", notes: "Polite seminar counterpoint", register: "mixed", minLevel: "B2" },
  ],
  business: [
    { fr: "Gracias por sacar este hueco en su agenda.", en: "Thanks for making this slot in your calendar.", notes: "Polite call opener (usted)", register: "vous", minLevel: "A1" },
    { fr: "Lo que le propongo es…", en: "What I suggest to you is…", notes: "Steers client meetings politely", register: "vous", minLevel: "A2" },
    { fr: "¿Cuál es su prioridad este trimestre?", en: "What is your priority this quarter?", notes: "High-signal discovery prompt", register: "vous", minLevel: "A2" },
    { fr: "Le escribo para dar seguimiento a nuestra propuesta.", en: "I'm writing to follow up on our proposal.", notes: "Clean client nudge", register: "vous", minLevel: "B1" },
    { fr: "Para que estemos totalmente alineados…", en: "So that we're completely aligned…", notes: "Confirms shared expectations", register: "vous", minLevel: "B1" },
    { fr: "Entiendo su punto; sin embargo, conviene considerar…", en: "I understand your point; however, it helps to consider…", notes: "Diplomatic executive pushback", register: "vous", minLevel: "B2" },
  ],
  relocation: [
    { fr: "Buenos días, tengo cita previa a las diez.", en: "Good morning, I have an appointment at ten.", notes: "Opening line at admin windows", register: "vous", minLevel: "A1" },
    { fr: "Aquí tiene mi pasaporte y el justificante.", en: "Here is my passport and proof document.", notes: "Clean counter handoff", register: "vous", minLevel: "A1" },
    { fr: "¿Están los gastos incluidos en el alquiler?", en: "Are utilities included in the rent?", notes: "Essential apartment question", register: "vous", minLevel: "A2" },
    { fr: "¿Cuánto piden de fianza?", en: "How much security deposit do they ask for?", notes: "Housing lease term ('fianza')", register: "vous", minLevel: "A2" },
    { fr: "Hay una fuga debajo del fregadero.", en: "There is a leak under the sink.", notes: "Calling the landlord for repairs", register: "vous", minLevel: "A2" },
    { fr: "¿Están aceptando nuevos pacientes aquí?", en: "Are you accepting new patients here?", notes: "Health center registration", register: "vous", minLevel: "A2" },
  ],
  exams: [
    { fr: "En mi opinión…", en: "In my opinion…", notes: "Clear oral stance opener", register: "vous", minLevel: "A1" },
    { fr: "Por un lado… por otro lado…", en: "On the one hand… on the other hand…", notes: "Clean DELE structure", register: "vous", minLevel: "A2" },
    { fr: "Es cierto que… sin embargo…", en: "It's true that… however…", notes: "Structured oral concession", register: "vous", minLevel: "B1" },
    { fr: "Por ejemplo, en mi día a día…", en: "For example, in my day-to-day…", notes: "Grounds general arguments cleanly", register: "vous", minLevel: "A2" },
    { fr: "Sería recomendable impulsar…", en: "It would be advisable to promote…", notes: "Strong B2 conditional closing", register: "vous", minLevel: "B2" },
    { fr: "Le agradezco de antemano su atención.", en: "Thank you in advance for your attention.", notes: "Formal letter closing formula", register: "vous", minLevel: "B1" },
  ],
};

const SPANISH_LATAM_OVERRIDES: Partial<Record<TrackId, readonly KitPhrase[]>> = {
  general: [
    { fr: "¿Me da un café, por favor?", en: "Can I have a coffee, please?", notes: "Common across Latin America", register: "vous", minLevel: "A1" },
    { fr: "Dale, me parece bien.", en: "Sure, sounds good to me.", notes: "Everyday LatAm casual confirmation", register: "tu", minLevel: "A1" },
    ...SPANISH_SPAIN_KITS.general.slice(2),
  ],
  tech: [
    ...SPANISH_SPAIN_KITS.tech.filter((item) => !item.fr.includes("ordenador")),
    { fr: "En mi computadora funciona bien, pero en producción no.", en: "It works on my computer, not in prod.", notes: "Uses LatAm 'computadora'", register: "tu", minLevel: "A2" },
  ],
  business: [
    { fr: "Gracias por hacer este espacio en su agenda.", en: "Thanks for making this slot in your calendar.", notes: "Neutral LatAm business opener", register: "vous", minLevel: "A1" },
    ...SPANISH_SPAIN_KITS.business.slice(1),
  ],
};

export function survivalKitForTrack(
  languageId: LanguageId,
  trackId: TrackId,
  variantId?: string | null
): readonly KitPhrase[] {
  if (languageId === "fr") return FRENCH_KITS[trackId];
  if (variantId === "latam") return SPANISH_LATAM_OVERRIDES[trackId] ?? SPANISH_SPAIN_KITS[trackId];
  return SPANISH_SPAIN_KITS[trackId];
}

/**
 * Picks kit phrases the learner doesn't already own and staggers due dates
 * cleanly across Days 0, 1, and 2 so seeding never floods Day 1 reviews.
 */
export function staggerStarterKitCards(
  kit: readonly KitPhrase[],
  trackId: TrackId,
  level: Level,
  existingTexts: readonly string[],
  now: Date
): readonly {
  readonly french: string;
  readonly english: string;
  readonly notes: string;
  readonly track: TrackId;
  readonly register: Register;
  readonly dueAt: Date;
}[] {
  const existingSet = new Set(existingTexts.map((t) => normaliseWord(t)));
  const levelRank = LEVELS.indexOf(level);
  const ordered = [...kit]
    .filter((item) => !existingSet.has(normaliseWord(item.fr)))
    .sort((a, b) => {
      const aFit = LEVELS.indexOf(a.minLevel) <= levelRank ? 0 : 1;
      const bFit = LEVELS.indexOf(b.minLevel) <= levelRank ? 0 : 1;
      return aFit - bFit;
    });

  const DAY_MS = 86_400_000;
  return ordered.map((item, idx) => {
    const dayOffset = Math.min(2, Math.floor(idx / 4));
    return {
      french: item.fr,
      english: item.en,
      notes: item.notes,
      track: trackId,
      register: item.register,
      dueAt: new Date(now.getTime() + dayOffset * DAY_MS),
    };
  });
}
