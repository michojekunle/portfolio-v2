import type {
  CarouselSlideDraft,
  CurriculumDay,
  DailySession,
  PortfolioContextItem,
} from "./types";

/**
 * Deterministically builds clean, high-signal Instagram/X carousel slides from
 * a day's topic, PREM structure, daily learning notes, and linked builds/books.
 * Can be exported directly into /tools/carousel-lab via localStorage draft handoff.
 */
export function buildDailyCarouselSlides(params: {
  day: CurriculumDay;
  session: DailySession;
  linkedItems: PortfolioContextItem[];
}): CarouselSlideDraft[] {
  const { day, session, linkedItems } = params;

  const point =
    session.premPoint.trim() ||
    session.dailyLearningSummary.trim() ||
    day.whyItMatters;
  const reason =
    session.premReason.trim() ||
    session.preparationNotes.trim() ||
    `Day ${day.dayNumber} of 90 Days of Speaking (${day.skill}).`;
  const example =
    session.premExample.trim() ||
    (linkedItems.length > 0
      ? `Connected to ${linkedItems.map((i) => i.title).join(", ")}.`
      : session.reflectionWhatWorked.trim() || day.description);
  const meaning =
    session.premMeaning.trim() ||
    session.reflectionWhatLearned.trim() ||
    `Worth reflecting on: ${day.thinkingPrompts[0] ?? day.topic}`;

  const slides: CarouselSlideDraft[] = [
    {
      title: day.topic,
      content: `Day ${day.dayNumber} of 90 · ${day.skill}. What I explored and learned today.`,
      layout: "hook",
    },
    {
      title: "The Core Idea",
      content: point.slice(0, 220),
      layout: "default",
    },
    {
      title: "Why It Holds",
      content: reason.slice(0, 220),
      layout: "split",
    },
    {
      title: "In Practice",
      content: example.slice(0, 220),
      layout: "quote",
    },
    {
      title: "The Takeaway",
      content: meaning.slice(0, 220),
      layout: "cta",
    },
  ];

  if (linkedItems.length > 0) {
    const refs = linkedItems
      .slice(0, 3)
      .map((item) => `${item.title} (${item.kind})`)
      .join(" · ");
    slides.splice(4, 0, {
      title: "Reading & Building Links",
      content: `Currently connecting this to: ${refs}.`,
      layout: "default",
    });
  }

  return slides;
}

/**
 * Generates a structured weekly short-form article markdown draft from
 * a week's completed speaking notes, daily learning entries, and portfolio links.
 */
export function buildWeeklyArticleDraft(params: {
  weekNumber: number;
  weekTitle: string;
  days: CurriculumDay[];
  sessions: Record<number, DailySession>;
  portfolioContext: PortfolioContextItem[];
}): { title: string; slug: string; excerpt: string; content: string } {
  const { weekNumber, weekTitle, days, sessions, portfolioContext } = params;

  const title = `Week ${weekNumber} Notes: ${weekTitle}`;
  const slug = `speaking-week-${weekNumber}-${weekTitle
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")}`;

  const touchedDays = days.filter((d) => {
    const s = sessions[d.dayNumber];
    return (
      s &&
      (s.status === "completed" ||
        s.dailyLearningSummary.trim() ||
        s.premPoint.trim() ||
        s.reflectionWhatLearned.trim())
    );
  });

  const linkedIds = new Set<string>();
  for (const d of touchedDays) {
    const s = sessions[d.dayNumber];
    if (!s) continue;
    [
      ...s.linkedBuildingIds,
      ...s.linkedBookIds,
      ...s.linkedLearningIds,
      ...s.linkedProjectIds,
    ].forEach((id) => linkedIds.add(id));
  }

  const linkedPortfolioItems = portfolioContext.filter((item) =>
    linkedIds.has(item.id)
  );

  const daySections = (touchedDays.length > 0 ? touchedDays : days).map((d) => {
    const s = sessions[d.dayNumber];
    const point =
      s?.premPoint.trim() || s?.dailyLearningSummary.trim() || d.description;
    const learned = s?.reflectionWhatLearned.trim() || s?.premMeaning.trim() || "";
    return `### Day ${d.dayNumber} — ${d.topic}\n\n${point}${
      learned ? `\n\n**Key takeaway:** ${learned}` : ""
    }`;
  });

  const linksSection =
    linkedPortfolioItems.length > 0
      ? `\n\n## What I'm Building, Reading & Learning\n\n${linkedPortfolioItems
          .map((item) =>
            item.url
              ? `- **${item.title}** (${item.kind}) — ${item.subtitle} ([link](${item.url}))`
              : `- **${item.title}** (${item.kind}) — ${item.subtitle}`
          )
          .join("\n")}`
      : "";

  const content = `# ${title}\n\n*90 Days of Speaking — Week ${weekNumber} synthesis.*\n\n${daySections.join(
    "\n\n"
  )}${linksSection}\n\n---\n\n*Published as part of [The Speaking Ledger](https://michaelojekunle.dev/speaking).*`;

  const excerpt = `Weekly synthesis from Week ${weekNumber} of 90 Days of Speaking (${weekTitle}), connecting daily speaking practice with active builds and reading.`;

  return { title, slug, excerpt, content };
}
