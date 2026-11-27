import type { LanguageId } from "./language";
import type { Level, Register } from "./lessons";

export const TRACK_IDS = [
  "general",
  "tech",
  "medical",
  "student",
  "business",
  "relocation",
  "exams",
] as const;
export type TrackId = (typeof TRACK_IDS)[number];
export const DEFAULT_TRACK: TrackId = "general";

export const MAX_GOAL_NOTE_LENGTH = 120;
export const MAX_DAILY_LESSON_REFRESHES = 2;

export interface TrackFocus {
  readonly id: string;
  readonly label: string;
  readonly hint: string;
  readonly preferredRegister?: Register;
}

export interface TrackMission {
  readonly slug: string;
  readonly sprint: number;
  readonly sprintTitle: string;
  readonly focusIds: readonly string[];
  readonly title: string;
  readonly topic: string;
  /** Communication room / artifact format so scenes feel real rather than generic textbook chat. */
  readonly medium: string;
  readonly register: Register;
  readonly situation: string;
  readonly writeCue: string;
}

export interface ListeningTrap {
  readonly form: string;
  readonly why: string;
}

export interface TrackDefinition {
  readonly id: TrackId;
  readonly label: string;
  readonly shortHint: string;
  readonly defaultRegister: Register;
  readonly registerGuidance: Record<LanguageId, string>;
  readonly cefrSpecialization: Record<Level, string>;
  readonly focuses: readonly TrackFocus[];
  readonly missions: readonly TrackMission[];
  readonly listeningTraps: Record<LanguageId, readonly ListeningTrap[]>;
  readonly samplePreview: Record<
    LanguageId,
    { readonly context: string; readonly line: string; readonly gloss: string }
  >;
}

const GENERAL_TRACK: TrackDefinition = {
  id: "general",
  label: "Everyday & Culture",
  shortHint: "Daily life, cafés, friends, and travel",
  defaultRegister: "tu",
  registerGuidance: {
    fr: "Natural everyday French: tu with friends and peers, polite vous with strangers and shopkeepers.",
    es: "Natural everyday Spanish: tú with friends and peers, usted in polite service interactions.",
  },
  cefrSpecialization: {
    A1: "Core present tense and the most frequent daily phrases.",
    A2: "Everyday stories, near future, simple past, and social plans.",
    B1: "Opinions, stories, light idioms, and natural spoken flow.",
    B2: "Nuanced conversation, humour, cultural references, and full tense range.",
  },
  focuses: [
    { id: "daily-life", label: "Daily life & cafés", hint: "Errands, dining, and neighborhood small talk", preferredRegister: "mixed" },
    { id: "social", label: "Friends & stories", hint: "Weekend plans, texting, and catching up", preferredRegister: "tu" },
    { id: "travel", label: "Travel & culture", hint: "Trains, hotels, recommendations, and outings", preferredRegister: "vous" },
  ],
  missions: [
    { slug: "gen-cafe-regular", sprint: 1, sprintTitle: "Everyday Fluency", focusIds: ["daily-life"], title: "Morning café regular", topic: "ordering at a café with a small customization", medium: "counter order", register: "vous", situation: "Ordering quickly at a neighborhood café before work.", writeCue: "Ask politely for a drink or food item." },
    { slug: "gen-weekend-plans", sprint: 1, sprintTitle: "Everyday Fluency", focusIds: ["social"], title: "Last-minute weekend plan", topic: "inviting a friend and picking a time to meet", medium: "casual peer chat", register: "tu", situation: "Coordinating Saturday plans with a friend over voice notes.", writeCue: "Suggest a time and place to meet." },
    { slug: "gen-market-fresh", sprint: 1, sprintTitle: "Everyday Fluency", focusIds: ["daily-life"], title: "At the neighborhood market", topic: "asking what is fresh today and paying", medium: "market stall exchange", register: "vous", situation: "Picking fruit and cheese at a morning street market.", writeCue: "Ask what they recommend or how much something costs." },
    { slug: "gen-train-platform", sprint: 1, sprintTitle: "Everyday Fluency", focusIds: ["travel"], title: "Checking the platform", topic: "confirming a train connection during a brief delay", medium: "station inquiry", register: "vous", situation: "Making sure you are boarding the right carriage before departure.", writeCue: "Ask which platform or car goes to your destination." },
    { slug: "gen-dinner-recap", sprint: 1, sprintTitle: "Everyday Fluency", focusIds: ["social"], title: "Recapping last night", topic: "telling a friend how an evening or film went", medium: "coffee catch-up", register: "tu", situation: "Sharing a quick story about dinner or a show yesterday.", writeCue: "Describe one thing you did yesterday evening." },
  ],
  listeningTraps: {
    fr: [
      { form: "Ça fait…", why: "Used at counters for totals instead of 'le prix est'." },
      { form: "On se retrouve", why: "Natives almost always say 'on' instead of 'nous' in casual plans." },
    ],
    es: [
      { form: "¿Me pone…? / ¿Me da…?", why: "Standard counter requests in Spain ('me pone') and LatAm ('me da')." },
      { form: "O sea / bueno", why: "Frequent conversational fillers speakers drop between clauses." },
    ],
  },
  samplePreview: {
    fr: { context: "Counter order · vous", line: "Bonjour, je voudrais un allongé à emporter, s'il vous plaît.", gloss: "Polite everyday café phrasing" },
    es: { context: "Cafetería · usted / tú", line: "Hola, ¿me da un café para llevar, por favor?", gloss: "Natural counter order" },
  },
};

const TECH_TRACK: TrackDefinition = {
  id: "tech",
  label: "Tech & Product",
  shortHint: "Standups, debugging calls, PRs, tech interviews",
  defaultRegister: "tu",
  registerGuidance: {
    fr: "Use peer 'tu' for engineers, PMs, and designers on the same team, switching to 'vous' only for external enterprise clients or exec boards. Keep phrasing natural for Slack and huddles — real French tech teams mix crisp French connectors ('du coup', 'en fait', 'point bloquant') with accepted loanwords ('en prod', 'merger', 'staging').",
    es: "Use 'tú' with engineering/product peers ('equipo', 'hilo'). Respect regional vocabulary from the dialect guide (Spain: 'ordenador', 'móvil', 'vale'; LatAm: 'computadora', 'celular', 'dale'). Keep client demos polite ('usted' or 'ustedes' as appropriate).",
  },
  cefrSpecialization: {
    A1: "Keep grammar simple (present + near future) with essential high-frequency team verbs (marcher, bloquer, envoyer, tester, voir) and avoid dense architecture jargon.",
    A2: "Handle short daily standup updates, simple bug reports, deadlines, and asking teammates for help clearly.",
    B1: "Explain root causes, trade-offs, PR review suggestions diplomatically, and ask clarifying product questions.",
    B2: "Debate architecture choices, hedge estimates under pressure, lead incident retrospectives, and pass technical behavioral interviews.",
  },
  focuses: [
    { id: "standups", label: "Daily standups & calls", hint: "Shipping updates, blockers, Slack & quick huddles", preferredRegister: "tu" },
    { id: "interviews", label: "Tech interviews", hint: "Explaining past projects, trade-offs, and architecture", preferredRegister: "vous" },
    { id: "clients", label: "Product & client demos", hint: "Scoping requests, timelines, and non-tech explanations", preferredRegister: "vous" },
  ],
  missions: [
    { slug: "tech-first-coffee", sprint: 1, sprintTitle: "Sprint 1 · First Week on the Team", focusIds: ["standups", "interviews"], title: "First huddle & your stack", topic: "introducing what you worked on before and asking how the repo is set up", medium: "video onboarding call", register: "tu", situation: "Day 1 video coffee with a teammate walking through your stack and local setup.", writeCue: "Say what part of the codebase you usually work on." },
    { slug: "tech-daily-standup", sprint: 1, sprintTitle: "Sprint 1 · First Week on the Team", focusIds: ["standups"], title: "60-second standup update", topic: "giving yesterday's progress, today's goal, and one small blocker", medium: "morning standup", register: "tu", situation: "Your turn in the 9:30 standup: be concise and highlight what is blocking you.", writeCue: "Give a one-line status update mentioning a blocker." },
    { slug: "tech-access-help", sprint: 1, sprintTitle: "Sprint 1 · First Week on the Team", focusIds: ["standups"], title: "Unblocking environment access", topic: "asking a teammate for missing permissions or staging environment variables", medium: "Slack thread / quick DM", register: "tu", situation: "Your local build fails because you lack staging credentials.", writeCue: "Ask a teammate to share access or check a config error." },
    { slug: "tech-ticket-clarify", sprint: 1, sprintTitle: "Sprint 1 · First Week on the Team", focusIds: ["standups", "clients"], title: "Clarifying vague acceptance criteria", topic: "asking a PM what should happen on an edge case before coding", medium: "product check-in", register: "tu", situation: "A ticket leaves an edge case undefined; clarify it before building the wrong thing.", writeCue: "Ask how the product should behave in an edge case." },
    { slug: "tech-friday-demo", sprint: 1, sprintTitle: "Sprint 1 · First Week on the Team", focusIds: ["standups", "clients"], title: "End-of-week sprint demo", topic: "walking teammates through a working feature and one known limitation", medium: "team demo", register: "tu", situation: "Showing a completed flow on screen share and noting what remains.", writeCue: "Present one thing that works now and one thing left to polish." },
    { slug: "tech-bug-triage", sprint: 2, sprintTitle: "Sprint 2 · Shipping & Code Reviews", focusIds: ["standups"], title: "Reproducing a staging bug", topic: "explaining when an error happens and narrowing down the root cause", medium: "pairing call", register: "tu", situation: "Debugging an intermittent 500 error in staging with another developer.", writeCue: "Explain under which condition the bug appears." },
    { slug: "tech-pr-review", sprint: 2, sprintTitle: "Sprint 2 · Shipping & Code Reviews", focusIds: ["standups"], title: "Diplomatic code-review feedback", topic: "suggesting a cleaner approach on a pull request without sounding harsh", medium: "PR discussion", register: "tu", situation: "A colleague's PR works, but introduces an N+1 query or duplicated logic.", writeCue: "Suggest a change gently while acknowledging their fix." },
    { slug: "tech-prod-incident", sprint: 2, sprintTitle: "Sprint 2 · Shipping & Code Reviews", focusIds: ["standups", "clients"], title: "Live outage triage", topic: "announcing a rollback vs hotfix decision during an active production alert", medium: "incident war-room", register: "tu", situation: "Latency spiked after release; decide whether to roll back immediately.", writeCue: "Recommend rolling back now and investigating afterwards." },
    { slug: "tech-scope-pushback", sprint: 3, sprintTitle: "Sprint 3 · Stakeholders & Interviews", focusIds: ["clients", "standups"], title: "Pushing back on scope creep", topic: "explaining why adding a last-minute request pushes back Friday's release", medium: "PM / stakeholder call", register: "mixed", situation: "A stakeholder asks for 'just one small tweak' right before release.", writeCue: "Explain the trade-off between adding the request and keeping the deadline." },
    { slug: "tech-past-project", sprint: 3, sprintTitle: "Sprint 3 · Stakeholders & Interviews", focusIds: ["interviews"], title: "Interview: toughest bug or outage", topic: "explaining a past technical challenge, your action, and what you measured", medium: "technical interview", register: "vous", situation: "The interviewer asks about a complex production problem you solved.", writeCue: "Describe one concrete problem you solved and its result." },
    { slug: "tech-arch-tradeoff", sprint: 3, sprintTitle: "Sprint 3 · Stakeholders & Interviews", focusIds: ["interviews", "clients"], title: "Justifying a technical trade-off", topic: "comparing speed to ship now versus maintainability later", medium: "architecture review", register: "vous", situation: "Defending why you chose a simple architecture over a complex distributed one.", writeCue: "Compare two options clearly using 'plutôt que' / 'en cambio'." },
    { slug: "tech-client-walkthrough", sprint: 3, sprintTitle: "Sprint 3 · Stakeholders & Interviews", focusIds: ["clients"], title: "Translating tech delay for a client", topic: "reassuring an external client about security checks delaying launch by 48 hours", medium: "client status call", register: "vous", situation: "Explaining a short delay transparently without exposing messy internal details.", writeCue: "Reassure the client with a concrete new delivery date." },
  ],
  listeningTraps: {
    fr: [
      { form: "du coup", why: "French devs start half of all standup conclusions with 'du coup' ('so / as a result')." },
      { form: "en prod / en préprod", why: "Short for production / staging; spoken super fast after 'ça pète' or 'ça passe'." },
      { form: "y a un point bloquant", why: "Elided 'il y a' — standard standup phrase for 'there's a blocker'." },
    ],
    es: [
      { form: "en producción / en staging", why: "Tech teams mix Spanish connectors ('entonces', 'a ver') with English deployment terms." },
      { form: "está caído / falla", why: "Used quickly to say a service is down or throwing errors." },
    ],
  },
  samplePreview: {
    fr: { context: "Morning standup · teammate (tu)", line: "De mon côté j'ai avancé sur l'API, mais je suis bloqué sur les droits en staging.", gloss: "Real standup French — clear, concise, zero textbook stiffness" },
    es: { context: "Daily standup · compañero (tú)", line: "Por mi parte avancé con el endpoint, pero estoy bloqueado esperando los permisos de staging.", gloss: "Natural engineering standup phrasing" },
  },
};

const MEDICAL_TRACK: TrackDefinition = {
  id: "medical",
  label: "Medicine & Healthcare",
  shortHint: "Patient intake, symptom triage, handoffs, pharmacy",
  defaultRegister: "vous",
  registerGuidance: {
    fr: "ALWAYS use warm, reassuring 'vous' with adult patients ('où avez-vous mal ?', 'je vais vous examiner'). Avoid brusque imperatives; soften instructions with 'je vous invite à...' or 'dites-moi si...'. Colleague handoffs can use concise clinical terminology and 'tu' among familiar peers.",
    es: "Use respectful 'usted' with patients by default ('¿dónde le duele?', '¿desde cuándo tiene fiebre?'). Keep wording plain and calming when talking to patients, reserving technical phrasing for colleague shift handoffs.",
  },
  cefrSpecialization: {
    A1: "Essential body parts, simple pain/duration questions, basic calming instructions (respirez, asseyez-vous).",
    A2: "Guided symptom history (since when, intensity, allergies, current meds) and clear prescription instructions.",
    B1: "Explaining probable causes simply, asking follow-up red-flag questions, and reassuring anxious family members.",
    B2: "Nuanced differential explanations, sensitive bad-news framing, and rapid colleague shift handoffs.",
  },
  focuses: [
    { id: "intake", label: "Patient intake & triage", hint: "Symptoms, onset, pain scale, calming patients", preferredRegister: "vous" },
    { id: "handoff", label: "Rounds & colleague handoffs", hint: "Vitals, history, labs, nursing/doctor updates", preferredRegister: "mixed" },
    { id: "prescriptions", label: "Treatment & prescriptions", hint: "Dosage, side effects, follow-up warnings", preferredRegister: "vous" },
  ],
  missions: [
    { slug: "med-greeting-chief", sprint: 1, sprintTitle: "Sprint 1 · Patient Intake & Comfort", focusIds: ["intake"], title: "Opening a consultation", topic: "welcoming an anxious patient and asking what brings them in today", medium: "clinic consultation", register: "vous", situation: "A patient sits down looking worried; put them at ease and open the visit.", writeCue: "Ask politely what brings the patient in today." },
    { slug: "med-pain-location", sprint: 1, sprintTitle: "Sprint 1 · Patient Intake & Comfort", focusIds: ["intake"], title: "Pinpointing pain & onset", topic: "asking where it hurts, what the pain feels like, and when it started", medium: "triage desk", register: "vous", situation: "Narrow down whether pain is sharp or dull and how long it has lasted.", writeCue: "Ask how long the patient has had this pain." },
    { slug: "med-allergies-meds", sprint: 1, sprintTitle: "Sprint 1 · Patient Intake & Comfort", focusIds: ["intake", "prescriptions"], title: "Allergies & current medications", topic: "checking allergies, chronic conditions, and what the patient already took", medium: "clinical history check", register: "vous", situation: "Verify safety before prescribing or administering anything.", writeCue: "Ask whether the patient has any drug allergies." },
    { slug: "med-exam-instructions", sprint: 1, sprintTitle: "Sprint 1 · Patient Intake & Comfort", focusIds: ["intake"], title: "Guiding a physical exam", topic: "asking the patient to breathe deeply, relax, and say if a touch hurts", medium: "examination room", register: "vous", situation: "Keep the patient informed step by step so nothing feels sudden.", writeCue: "Tell the patient gently to breathe slowly and tell you if it hurts." },
    { slug: "med-dosage-clear", sprint: 2, sprintTitle: "Sprint 2 · Prescriptions & Warnings", focusIds: ["prescriptions"], title: "Explaining dosage & meals", topic: "giving clear instructions on how many tablets to take and for how many days", medium: "discharge / pharmacy counter", register: "vous", situation: "Ensure the patient leaves knowing exact timing and duration.", writeCue: "Explain taking a medicine twice a day after meals." },
    { slug: "med-red-flags", sprint: 2, sprintTitle: "Sprint 2 · Prescriptions & Warnings", focusIds: ["prescriptions", "intake"], title: "When to come back immediately", topic: "giving clear warning signs that require urgent return or calling emergency services", medium: "discharge briefing", register: "vous", situation: "Make return precautions crystal clear without terrifying the patient.", writeCue: "Advise returning right away if fever gets worse." },
    { slug: "med-blood-test", sprint: 2, sprintTitle: "Sprint 2 · Prescriptions & Warnings", focusIds: ["intake", "prescriptions"], title: "Ordering a fasting blood test", topic: "explaining why labs are needed and confirming fasting rules for tomorrow", medium: "lab order explanation", register: "vous", situation: "Patient asks whether they can drink coffee or water beforehand.", writeCue: "Explain that only plain water is allowed before the test." },
    { slug: "med-shift-handoff", sprint: 3, sprintTitle: "Sprint 3 · Clinical Team & Difficult Cases", focusIds: ["handoff"], title: "Nursing / doctor shift handoff", topic: "summarizing a stable overnight patient, vitals trend, and pending labs to a colleague", medium: "ward station handoff", register: "tu", situation: "Quick, accurate morning handoff between colleagues coming on shift.", writeCue: "Report a patient's fever trend and one test still pending." },
    { slug: "med-family-update", sprint: 3, sprintTitle: "Sprint 3 · Clinical Team & Difficult Cases", focusIds: ["intake", "handoff"], title: "Reassuring a patient's relative", topic: "explaining what tests ruled out and the next 24-hour observation plan", medium: "family phone update", register: "vous", situation: "An adult child calls asking why their parent is still being kept overnight.", writeCue: "Reassure a family member that results are stable so far." },
    { slug: "med-consult-request", sprint: 3, sprintTitle: "Sprint 3 · Clinical Team & Difficult Cases", focusIds: ["handoff"], title: "Paging a specialist colleague", topic: "presenting a focused clinical summary and asking for a specialist consult", medium: "hospital phone consult", register: "vous", situation: "Giving a specialist the concise facts in 45 seconds.", writeCue: "Ask a colleague for their opinion on imaging or test results." },
  ],
  listeningTraps: {
    fr: [
      { form: "à jeun", why: "Means 'fasting / on an empty stomach' — sounds almost like 'à un' if missed at speed." },
      { form: "ordonnance / bilan", why: "Core everyday clinic nouns: prescription ('ordonnance') and lab workup ('bilan')." },
      { form: "ça vous lance ?", why: "Patients use colloquial pain verbs like 'lancer' (throb), 'piquer' (sting), 'serrer' (tighten)." },
    ],
    es: [
      { form: "en ayunas", why: "Means 'fasting / before eating' — crucial for lab prep." },
      { form: "receta / pastilla", why: "'Receta' = prescription; 'pastilla' / 'comprimido' = tablet." },
      { form: "le duele / le molesta", why: "Indirect object pronouns ('le') shift with 'usted' in every triage question." },
    ],
  },
  samplePreview: {
    fr: { context: "Consultation · patient (vous)", line: "Depuis quand avez-vous cette douleur, et est-ce qu'elle vous réveille la nuit ?", gloss: "Natural, calm French patient triage" },
    es: { context: "Consulta · paciente (usted)", line: "¿Desde cuándo tiene este dolor y nota si empeora por la noche?", gloss: "Warm clinical triage register" },
  },
};

const STUDENT_TRACK: TrackDefinition = {
  id: "student",
  label: "University & Campus",
  shortHint: "Seminars, group work, professors, housing/admin",
  defaultRegister: "mixed",
  registerGuidance: {
    fr: "Switch deliberately: casual 'tu' with classmates and roommates, formal 'vous' (plus polite openers like 'Bonjour Monsieur/Madame, je me permets de...') with professors, thesis supervisors, and university admin (scolarité / CROUS).",
    es: "Use 'tú' with classmates and study groups; use 'usted' (or polite modal requests like '¿Sería posible…?') with professors, secretaries, and housing offices.",
  },
  cefrSpecialization: {
    A1: "Schedule basics, classroom survival questions, cafeteria/library interactions, simple campus dates.",
    A2: "Group project coordination, asking a professor to repeat or clarify, basic housing/enrollment questions.",
    B1: "Sharing an opinion in a seminar, polite formal emails, troubleshooting registration or landlord admin.",
    B2: "Structured oral exposé signposting, defending an academic argument, academic nuance and counter-examples.",
  },
  focuses: [
    { id: "seminars", label: "Classes & seminars", hint: "Lectures, asking questions, exposés & oral defence", preferredRegister: "vous" },
    { id: "admin", label: "Campus & housing admin", hint: "Enrollment, CROUS/dorms, deadlines, certificates", preferredRegister: "vous" },
    { id: "peers", label: "Group projects & peers", hint: "Coordinating teammates, study sessions, campus social", preferredRegister: "tu" },
  ],
  missions: [
    { slug: "stu-first-seminar", sprint: 1, sprintTitle: "Sprint 1 · First Days on Campus", focusIds: ["seminars", "peers"], title: "Asking a classmate for notes", topic: "borrowing lecture notes you missed because the professor spoke fast", medium: "hallway after lecture", register: "tu", situation: "Lecture ended quickly and you missed the reading list on the last slide.", writeCue: "Ask a classmate if they can send you the notes or slides." },
    { slug: "stu-scolarite-desk", sprint: 1, sprintTitle: "Sprint 1 · First Days on Campus", focusIds: ["admin"], title: "Missing enrollment stamp", topic: "asking the registrar office which document is missing to get your student card", medium: "admin counter", register: "vous", situation: "The online portal shows your dossier incomplete right before library access closes.", writeCue: "Politely ask which document is missing from your file." },
    { slug: "stu-prof-question", sprint: 1, sprintTitle: "Sprint 1 · First Days on Campus", focusIds: ["seminars"], title: "Office hours clarification", topic: "asking a professor to clarify one requirement for next week's assignment", medium: "after class / office hours", register: "vous", situation: "You want to confirm the scope of a 5-page paper before writing.", writeCue: "Ask a professor politely if you understood the topic correctly." },
    { slug: "stu-group-split", sprint: 1, sprintTitle: "Sprint 1 · First Days on Campus", focusIds: ["peers"], title: "Splitting up a group presentation", topic: "dividing slides and setting a rehearsal time without sounding bossy", medium: "library study table", register: "tu", situation: "Three classmates haven't chosen sections yet for Friday's presentation.", writeCue: "Offer to take one part and ask who wants the next section." },
    { slug: "stu-extension-ask", sprint: 2, sprintTitle: "Sprint 2 · Seminars & Academic Voice", focusIds: ["seminars", "admin"], title: "Requesting a short deadline extension", topic: "explaining an unexpected overlap calmly and proposing a specific new date", medium: "professor check-in / email style", register: "vous", situation: "Two major exams landed on the same morning; ask early and respectfully.", writeCue: "Ask politely whether submitting two days later is possible." },
    { slug: "stu-expose-structure", sprint: 2, sprintTitle: "Sprint 2 · Seminars & Academic Voice", focusIds: ["seminars"], title: "Structuring a 3-minute exposé", topic: "introducing a topic with clear signposting ('firstly', 'however', 'to conclude')", medium: "seminar floor", register: "vous", situation: "Opening your class mini-presentation smoothly so everyone follows.", writeCue: "Introduce two contrasting points using a linking phrase." },
    { slug: "stu-crous-repair", sprint: 2, sprintTitle: "Sprint 2 · Seminars & Academic Voice", focusIds: ["admin"], title: "Reporting a dorm heating issue", topic: "calling campus housing maintenance and agreeing on a technician slot", medium: "housing office call", register: "vous", situation: "Heating or Wi-Fi is out in your room before an exam week.", writeCue: "Report what is broken in your room and say when you are free." },
    { slug: "stu-debate-agree", sprint: 3, sprintTitle: "Sprint 3 · Debate & Campus Independence", focusIds: ["seminars", "peers"], title: "Nuanced seminar disagreement", topic: "building on a classmate's point before adding a different perspective", medium: "seminar discussion", register: "mixed", situation: "Show you listened ('je comprends ton point') while defending another view.", writeCue: "Agree partially with someone's idea, then introduce a nuance." },
    { slug: "stu-internship-chat", sprint: 3, sprintTitle: "Sprint 3 · Debate & Campus Independence", focusIds: ["seminars", "admin"], title: "Asking an advisor about an internship", topic: "explaining your research interest and asking about lab/internship openings", medium: "advisor meeting", register: "vous", situation: "You need an internship agreement ('convention de stage') signed next month.", writeCue: "Explain what type of project or internship you are looking for." },
  ],
  listeningTraps: {
    fr: [
      { form: "dans un premier temps / par contre", why: "Classic French academic and group-work signposting transitions." },
      { form: "la fac / un TD / le partiel", why: "Campus shorthand: university ('fac'), tutorial class ('TD'), midterm exam ('partiel')." },
    ],
    es: [
      { form: "la carrera / los apuntes / el parcial", why: "Degree ('carrera'), class notes ('apuntes'), midterm ('parcial')." },
      { form: "en primer lugar / sin embargo", why: "High-frequency academic connectors heard in lectures and oral exposés." },
    ],
  },
  samplePreview: {
    fr: { context: "Office hours · professor (vous)", line: "Bonjour Madame, je me permets de vous demander une précision sur le plan du devoir.", gloss: "Respectful academic opener that professors expect" },
    es: { context: "Tutoría · profesor (usted)", line: "Buenos días, ¿sería posible aclarar un detalle sobre la entrega del viernes?", gloss: "Polite academic register" },
  },
};

const BUSINESS_TRACK: TrackDefinition = {
  id: "business",
  label: "Business & Clients",
  shortHint: "Discovery calls, negotiation, alignment, diplomacy",
  defaultRegister: "vous",
  registerGuidance: {
    fr: "Default to 'vous' for external clients, prospects, and senior executives until someone explicitly suggests 'tu' ('on peut se tutoyer ?'). French business values polite framing and conditional softeners ('je me permets de', 'il faudrait qu'on vérifie', 'pourriez-vous').",
    es: "Default to 'usted' / 'ustedes' with clients and formal negotiations, adjusting naturally to regional etiquette in Spain vs Latin America while keeping conditional diplomacy intact.",
  },
  cefrSpecialization: {
    A1: "Polite greetings, scheduling a call, confirming numbers/times, thanking a client cleanly.",
    A2: "Simple status updates, clarifying deliverables, asking to reschedule or send a summary.",
    B1: "Running a discovery call, summarizing client needs, polite disagreement and scope alignment.",
    B2: "High-stakes negotiation, persuasive executive briefs, diplomatic refusal without burning trust.",
  },
  focuses: [
    { id: "discovery", label: "Discovery & pitching", hint: "First calls, qualifying needs, value framing", preferredRegister: "vous" },
    { id: "negotiation", label: "Scope & negotiation", hint: "Pricing, delays, polite pushback & compromises", preferredRegister: "vous" },
    { id: "alignment", label: "Stakeholders & recaps", hint: "Meeting leads, next steps, clear follow-ups", preferredRegister: "vous" },
  ],
  missions: [
    { slug: "biz-call-opener", sprint: 1, sprintTitle: "Sprint 1 · First Impression & Discovery", focusIds: ["discovery"], title: "Opening a client discovery call", topic: "setting a concise 20-minute agenda and asking about their top priority", medium: "client Zoom call", register: "vous", situation: "First call with a French prospect; establish calm credibility in the first minute.", writeCue: "Propose a quick agenda and ask what their main challenge is." },
    { slug: "biz-probing-needs", sprint: 1, sprintTitle: "Sprint 1 · First Impression & Discovery", focusIds: ["discovery"], title: "Diagnosing the real bottleneck", topic: "asking follow-up questions about timeline, team size, and what failed before", medium: "discovery interview", register: "vous", situation: "Keep the prospect talking so you don't pitch the wrong solution.", writeCue: "Ask what has blocked them from solving this until now." },
    { slug: "biz-meeting-recap", sprint: 1, sprintTitle: "Sprint 1 · First Impression & Discovery", focusIds: ["alignment"], title: "Locking in next steps", topic: "summarizing decisions agreed in the meeting and who sends what by Thursday", medium: "call wrap-up", register: "vous", situation: "End a meeting crisply so nobody leaves vague on ownership.", writeCue: "Confirm one action you will send before the end of the week." },
    { slug: "biz-gentle-followup", sprint: 2, sprintTitle: "Sprint 2 · Diplomacy & Negotiation", focusIds: ["alignment", "negotiation"], title: "Following up without sounding pushy", topic: "checking in after sending a proposal that has gone quiet for a week", medium: "polite follow-up", register: "vous", situation: "Nudge a busy decision-maker while staying helpful and respectful.", writeCue: "Ask politely whether they had a chance to review your proposal." },
    { slug: "biz-budget-tradeoff", sprint: 2, sprintTitle: "Sprint 2 · Diplomacy & Negotiation", focusIds: ["negotiation"], title: "Defending your price or scope", topic: "offering a phased Phase-1 alternative when a client asks for a 30% discount", medium: "commercial negotiation", register: "vous", situation: "Say 'no' to free work by reshaping scope instead of cutting rate blindly.", writeCue: "Propose reducing the initial scope rather than lowering quality." },
    { slug: "biz-delay-own", sprint: 2, sprintTitle: "Sprint 2 · Diplomacy & Negotiation", focusIds: ["alignment", "negotiation"], title: "Owning a vendor delay professionally", topic: "informing a stakeholder early about a delay with a clear mitigation plan", medium: "account update call", register: "vous", situation: "Deliver bad news cleanly before the client discovers it themselves.", writeCue: "Inform the client of a delay and state your concrete backup plan." },
    { slug: "biz-polite-pushback", sprint: 3, sprintTitle: "Sprint 3 · Executive Persuasion", focusIds: ["negotiation", "alignment"], title: "Diplomatic disagreement in a review", topic: "acknowledging an executive's idea before warning about its operational risk", medium: "board / leadership review", register: "vous", situation: "Push back upward with poise ('sur le principe je comprends, toutefois…').", writeCue: "Support the goal while pointing out one key risk politely." },
    { slug: "biz-pitch-roi", sprint: 3, sprintTitle: "Sprint 3 · Executive Persuasion", focusIds: ["discovery"], title: "30-second ROI pitch", topic: "explaining concrete measurable impact instead of listing generic features", medium: "executive pitch", register: "vous", situation: "A busy director interrupts: 'Concretely, what does this save us?'", writeCue: "State one measurable time or cost benefit for the client." },
  ],
  listeningTraps: {
    fr: [
      { form: "je me permets de", why: "Signature French polite opener for emails, nudges, and proposals." },
      { form: "dans la mesure où / afin de", why: "Executive connectors meaning 'insofar as / in order to'." },
      { form: "on fait un point ?", why: "Everyday business idiom for 'let's have a quick sync / check-in'." },
    ],
    es: [
      { form: "me gustaría proponer / quedar", why: "Conditional politeness softens requests in negotiations." },
      { form: "quedamos en… / damos seguimiento", why: "'Agree on next steps / follow up' in client calls." },
    ],
  },
  samplePreview: {
    fr: { context: "Negotiation · client (vous)", line: "Je comprends votre contrainte budgétaire ; ce que je vous propose, c'est de démarrer par une première phase.", gloss: "Diplomatic French pushback that keeps trust" },
    es: { context: "Negociación · cliente (usted)", line: "Entiendo su límite de presupuesto; lo que le propongo es empezar por una primera fase.", gloss: "Calm executive framing" },
  },
};

const RELOCATION_TRACK: TrackDefinition = {
  id: "relocation",
  label: "Relocation & Admin",
  shortHint: "Visas, préfecture, leases, banking, everyday errands",
  defaultRegister: "vous",
  registerGuidance: {
    fr: "Strict polite 'vous' plus the non-negotiable opening ritual ('Bonjour Madame/Monsieur, excusez-moi de vous déranger...'). With clerks, landlords, and banks, polite precision gets doors opened.",
    es: "Polite 'usted' for landlords, banks, empadronamiento, and immigration offices; friendly 'tú' with neighbors once rapport is clear.",
  },
  cefrSpecialization: {
    A1: "Essential opening politeness, spelling your name/address, dates/numbers, asking for help calmly.",
    A2: "Apartment visits, booking appointments, reporting utility issues, pharmacy/bank basics.",
    B1: "Explaining missing documents, advocating politely when stuck in bureaucracy, contract questions.",
    B2: "Handling lease disputes, insurance claims, unexpected phone bureaucracy at native speed.",
  },
  focuses: [
    { id: "admin-visas", label: "Visas & civic admin", hint: "Préfecture/cita previa, dossiers, receipts & renewals", preferredRegister: "vous" },
    { id: "housing", label: "Apartments & leases", hint: "Viewing visits, guarantor, utilities, repairs", preferredRegister: "vous" },
    { id: "daily-setup", label: "Banking, health & neighborhood", hint: "Bank account, CPAM/doctor, neighbors & phone", preferredRegister: "mixed" },
  ],
  missions: [
    { slug: "reloc-gatekeeper-open", sprint: 1, sprintTitle: "Sprint 1 · First 14 Days Abroad", focusIds: ["admin-visas", "daily-setup"], title: "The polite desk greeting & file check", topic: "opening politely at an office window and handing over your dossier cleanly", medium: "admin counter", register: "vous", situation: "Your appointment at the civic office starts at the counter window.", writeCue: "Greet the clerk politely and say what appointment you have." },
    { slug: "reloc-apartment-view", sprint: 1, sprintTitle: "Sprint 1 · First 14 Days Abroad", focusIds: ["housing"], title: "Asking key apartment questions", topic: "checking heating, utilities included ('charges comprises'), and deposit rules", medium: "apartment tour", register: "vous", situation: "You like the flat, now verify monthly bills and move-in date.", writeCue: "Ask whether water and heating are included in the rent." },
    { slug: "reloc-bank-account", sprint: 1, sprintTitle: "Sprint 1 · First 14 Days Abroad", focusIds: ["daily-setup"], title: "Opening a local bank account", topic: "showing proof of address and asking when your card and IBAN/RIB arrive", medium: "bank advisor desk", register: "vous", situation: "Your employer or landlord needs local bank details this week.", writeCue: "Ask when you will receive your bank details (RIB / IBAN)." },
    { slug: "reloc-missing-paper", sprint: 2, sprintTitle: "Sprint 2 · Paperwork & Solving Blocks", focusIds: ["admin-visas"], title: "Solving a missing proof of address", topic: "asking politely whether a temporary attestation or host letter works instead", medium: "préfecture / immigration window", register: "vous", situation: "You don't have an electricity bill in your name yet.", writeCue: "Explain you are staying with a friend and offer a signed host letter." },
    { slug: "reloc-plumber-urgent", sprint: 2, sprintTitle: "Sprint 2 · Paperwork & Solving Blocks", focusIds: ["housing"], title: "Calling the landlord about a leak", topic: "explaining a water leak under the sink and scheduling a repair visit", medium: "phone call to landlord", register: "vous", situation: "You need an urgent fix without being blamed for existing wear.", writeCue: "Describe the leak calmly and ask if a plumber can come tomorrow." },
    { slug: "reloc-gp-register", sprint: 2, sprintTitle: "Sprint 2 · Paperwork & Solving Blocks", focusIds: ["daily-setup"], title: "Registering with a family doctor", topic: "asking if a clinic accepts new patients and bringing your health card paperwork", medium: "clinic reception", register: "vous", situation: "Finding a primary care doctor ('médecin traitant' / centro de salud).", writeCue: "Ask if the doctor is taking new patients this month." },
    { slug: "reloc-neighbor-chat", sprint: 3, sprintTitle: "Sprint 3 · Settling In", focusIds: ["daily-setup", "housing"], title: "Introducing yourself to a neighbor", topic: "mentioning you just moved in and asking about recycling or building codes", medium: "stairwell / lobby chat", register: "vous", situation: "Building friendly goodwill on your floor in week two.", writeCue: "Introduce yourself as the new neighbor and ask about bin pickup." },
    { slug: "reloc-phone-support", sprint: 3, sprintTitle: "Sprint 3 · Settling In", focusIds: ["admin-visas", "daily-setup"], title: "Following up by phone on a stalled file", topic: "giving your reference number slowly and asking what step comes next", medium: "customer support phone call", register: "vous", situation: "A residence card or internet box hasn't arrived after three weeks.", writeCue: "Ask to check the status of your application with your reference number." },
  ],
  listeningTraps: {
    fr: [
      { form: "justificatif / attestation / RIB", why: "Every French office asks for these three: proof ('justificatif'), certificate ('attestation'), bank sheet ('RIB')." },
      { form: "charges comprises", why: "Housing shorthand meaning utilities/building fees are included in the rent." },
    ],
    es: [
      { form: "empadronamiento / cita previa / NIE", why: "City-hall address registration, advance appointment, and foreigner ID." },
      { form: "fianza / gastos incluidos", why: "Security deposit and whether utilities are included in rent." },
    ],
  },
  samplePreview: {
    fr: { context: "Civic desk · polite ritual (vous)", line: "Bonjour Madame, j'ai rendez-vous à dix heures pour déposer mon dossier.", gloss: "Opens every French admin desk on the right foot" },
    es: { context: "Oficina / cita · formal (usted)", line: "Buenos días, tengo cita a las diez para presentar mi documentación.", gloss: "Calm administrative Spanish" },
  },
};

const EXAMS_TRACK: TrackDefinition = {
  id: "exams",
  label: "Exams & Citizenship",
  shortHint: "DELF/TCF/TEF/DELE oral prep & naturalization",
  defaultRegister: "vous",
  registerGuidance: {
    fr: "Exam examiners expect clear 'vous', logical structuring ('d'une part / d'autre part', 'en effet', 'il me semble que'), justified examples, and natural connectors without slang.",
    es: "DELE/SIELE oral tasks reward structured argument ('en primer lugar', 'por un lado', 'sin embargo'), clear personal justification, and natural 'usted' toward the examiner.",
  },
  cefrSpecialization: {
    A1: "Clear personal intro, daily habits, simple likes/dislikes, spelling and dates cleanly.",
    A2: "Past experiences, plans, simple comparisons, and 2–3 sentence answers with 'parce que / porque'.",
    B1: "Expressing and justifying an opinion on everyday society topics with pros/cons and examples.",
    B2: "Structured monologue + handling examiner counter-arguments with nuance, subjunctive triggers, and concessions.",
  },
  focuses: [
    { id: "oral-debate", label: "Structured oral argument", hint: "DELF B1/B2 & DELE problem-solving + debate", preferredRegister: "vous" },
    { id: "formal-writing", label: "Formal letter & opinion essay", hint: "Tone, connectors, concession & conclusions", preferredRegister: "vous" },
    { id: "citizenship", label: "Citizenship & integration interview", hint: "Personal story, values, life in the country", preferredRegister: "vous" },
  ],
  missions: [
    { slug: "exm-personal-story", sprint: 1, sprintTitle: "Sprint 1 · Clarity & Self-Presentation", focusIds: ["citizenship", "oral-debate"], title: "Your background in 45 seconds", topic: "explaining cleanly where you come from, your work, and why you learn the language", medium: "oral interview warmup", register: "vous", situation: "The opening question of almost every exam and citizenship interview.", writeCue: "Explain in one clear sentence why learning this language matters to you." },
    { slug: "exm-for-against", sprint: 1, sprintTitle: "Sprint 1 · Clarity & Self-Presentation", focusIds: ["oral-debate"], title: "Weighing two sides cleanly", topic: "giving one advantage and one drawback of remote work or city transit", medium: "timed oral prompt", register: "vous", situation: "Train balanced B1/B2 structuring ('d'un côté... par ailleurs...').", writeCue: "Give one advantage and one drawback of working remotely." },
    { slug: "exm-formal-request", sprint: 1, sprintTitle: "Sprint 1 · Clarity & Self-Presentation", focusIds: ["formal-writing"], title: "Formal complaint or request letter", topic: "asking a town hall or school to fix a scheduling error politely and clearly", medium: "formal letter opener", register: "vous", situation: "Exam writing tasks grade register and closing formulas heavily.", writeCue: "Write one polite formal sentence requesting a correction." },
    { slug: "exm-civic-motivation", sprint: 2, sprintTitle: "Sprint 2 · Handling Follow-Up Pressure", focusIds: ["citizenship"], title: "Why build a life here?", topic: "speaking genuinely about community, work, and daily integration", medium: "naturalization interview", register: "vous", situation: "The interviewer asks what made you feel at home and why apply now.", writeCue: "Explain one way you participate in your local community or work." },
    { slug: "exm-counter-argument", sprint: 2, sprintTitle: "Sprint 2 · Handling Follow-Up Pressure", focusIds: ["oral-debate"], title: "Responding to an examiner's challenge", topic: "conceding an examiner's objection ('c'est vrai que… cependant…') without freezing", medium: "oral follow-up debate", register: "vous", situation: "The examiner interrupts with a counter-example to test B1/B2 agility.", writeCue: "Acknowledge a counterpoint and defend your position calmly." },
    { slug: "exm-hypothetical", sprint: 2, sprintTitle: "Sprint 2 · Handling Follow-Up Pressure", focusIds: ["oral-debate", "formal-writing"], title: "Proposing a civic solution", topic: "using conditional phrasing ('on pourrait', 'il serait utile de') to solve a local problem", medium: "oral synthesis / essay", register: "vous", situation: "Closing an argument with concrete, realistic proposals.", writeCue: "Suggest one practical improvement using the conditional ('on pourrait / se podría')." },
    { slug: "exm-values-example", sprint: 3, sprintTitle: "Sprint 3 · Exam Simulation", focusIds: ["citizenship"], title: "Turning abstract values into concrete examples", topic: "explaining equality or public services using a brief real-life observation", medium: "citizenship mock interview", register: "vous", situation: "Avoid memorized slogans; give a human 1-sentence example.", writeCue: "Connect a civic principle to an everyday example in one sentence." },
  ],
  listeningTraps: {
    fr: [
      { form: "à votre avis / dans quelle mesure", why: "Examiner prompts asking for your reasoned opinion, not just yes/no." },
      { form: "toutefois / néanmoins / en revanche", why: "B1/B2 contrast markers that signal a shift in argument." },
    ],
    es: [
      { form: "¿en qué medida…? / ¿qué opina sobre…?", why: "DELE examiner prompts expecting structured reasoning." },
      { form: "sin embargo / a pesar de que / por lo tanto", why: "High-scoring logical connectors for oral and written tasks." },
    ],
  },
  samplePreview: {
    fr: { context: "Oral exam · examiner (vous)", line: "Il est vrai que cette solution coûte cher, toutefois elle reste indispensable à long terme.", gloss: "High-scoring B1/B2 concession + defense" },
    es: { context: "Examen oral · examinador (usted)", line: "Es cierto que esta medida requiere tiempo, sin embargo resulta muy útil a largo plazo.", gloss: "Structured DELE concession" },
  },
};

export const TRACKS: Record<TrackId, TrackDefinition> = {
  general: GENERAL_TRACK,
  tech: TECH_TRACK,
  medical: MEDICAL_TRACK,
  student: STUDENT_TRACK,
  business: BUSINESS_TRACK,
  relocation: RELOCATION_TRACK,
  exams: EXAMS_TRACK,
};

export const TRACK_LIST: readonly TrackDefinition[] = TRACK_IDS.map((id) => TRACKS[id]);

export function resolveTrackId(raw: string | null | undefined): TrackId {
  return raw && (TRACK_IDS as readonly string[]).includes(raw) ? (raw as TrackId) : DEFAULT_TRACK;
}

export function resolveFocusId(trackId: TrackId, raw: string | null | undefined): string {
  const track = TRACKS[trackId];
  const matched = raw ? track.focuses.find((f) => f.id === raw) : undefined;
  return (matched ?? track.focuses[0]).id;
}

/** Keeps custom role/goal notes safe against prompt-injection formatting and length bounds. */
export function sanitiseGoalNote(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const cleaned = raw
    .replace(/[\r\n\t]+/g, " ")
    .replace(/[<>{}[\]`]/g, "")
    .replace(/"""/g, '"')
    .replace(/\s+/g, " ")
    .trim();
  if (!cleaned) return null;
  return cleaned.slice(0, MAX_GOAL_NOTE_LENGTH).trim() || null;
}

export function effectiveRegister(trackId: TrackId, focusId?: string | null, missionRegister?: Register): Register {
  if (missionRegister) return missionRegister;
  const track = TRACKS[trackId];
  const focus = focusId ? track.focuses.find((f) => f.id === focusId) : undefined;
  return focus?.preferredRegister ?? track.defaultRegister;
}

export function registerBadgeText(languageId: LanguageId, register: Register): string {
  if (languageId === "fr") {
    if (register === "tu") return "tu · peer";
    if (register === "vous") return "vous · formal";
    return "tu & vous";
  }
  if (register === "tu") return "tú · peer";
  if (register === "vous") return "usted · formal";
  return "tú & usted";
}

/** Picks the next sequenced Sprint mission for the learner's track + focus without repeating recent ones. */
export function selectNextMission(
  trackId: TrackId,
  focusId: string | null | undefined,
  recentMissionSlugs: readonly string[],
  localDate: string
): TrackMission {
  const track = TRACKS[trackId];
  const resolvedFocus = resolveFocusId(trackId, focusId);
  const recentSet = new Set(recentMissionSlugs);

  const matchingFocus = track.missions.filter((m) => m.focusIds.includes(resolvedFocus));
  const candidates = matchingFocus.length > 0 ? matchingFocus : track.missions;

  const unseenFocus = candidates.find((m) => !recentSet.has(m.slug));
  if (unseenFocus) return unseenFocus;

  const unseenAny = track.missions.find((m) => !recentSet.has(m.slug));
  if (unseenAny) return unseenAny;

  const daysSinceEpoch = Math.floor(Date.parse(`${localDate}T00:00:00Z`) / 86_400_000);
  const idx = ((daysSinceEpoch % candidates.length) + candidates.length) % candidates.length;
  return candidates[idx];
}

export interface SprintProgress {
  readonly completedMissions: number;
  readonly totalMissions: number;
  readonly currentSprintTitle: string;
  readonly sprintCompleted: number;
  readonly sprintTotal: number;
}

/** Summarises Sprint progress for a track from previously seen mission slugs. */
export function computeSprintProgress(trackId: TrackId, completedSlugs: readonly string[]): SprintProgress {
  const track = TRACKS[trackId];
  const seen = new Set(completedSlugs);
  const trackDone = track.missions.filter((m) => seen.has(m.slug)).length;
  const currentMission = track.missions.find((m) => !seen.has(m.slug)) ?? track.missions[track.missions.length - 1];
  const sprintMissions = track.missions.filter((m) => m.sprint === currentMission.sprint);
  const sprintDone = sprintMissions.filter((m) => seen.has(m.slug)).length;
  return {
    completedMissions: trackDone,
    totalMissions: track.missions.length,
    currentSprintTitle: currentMission.sprintTitle,
    sprintCompleted: sprintDone,
    sprintTotal: sprintMissions.length,
  };
}
