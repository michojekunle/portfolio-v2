// Pre-written content for the 4 initial books.
// This data is seeded on first login via /api/bookbreaks/seed.

export const SEED_BOOKS = [
  {
    title: "The Diary of a CEO",
    author: "Steven Bartlett",
    cover_url: null,
    theme: "diary",
    genres: ["entrepreneurship", "leadership", "self-development"],
    rating: 5,
    read_date: "2026-06-01",
    notes:
      "A masterclass in building a personal brand and business from the ground up. Raw, honest, and packed with unconventional frameworks.",
    insights: [
      "The Law of Open Doors: Every opportunity comes through a person. Invest in relationships before you need them.",
      "The Compounding Effect of Consistency: Small daily actions compound into extraordinary outcomes over years, not weeks.",
      "Your story is your strongest asset: Vulnerability and authenticity build deeper trust than polished perfection.",
      "Systems over willpower: Successful people don't rely on motivation — they build environments that make good behaviour automatic.",
      "The 1% rule: If you get 1% better each day for a year, you'll be 37× better by year end. Aim for marginal daily improvement.",
    ],
  },
  {
    title: "Thinking Sideways",
    author: "Edward de Bono",
    cover_url: null,
    theme: "sideways",
    genres: ["creativity", "problem-solving", "innovation"],
    rating: 4,
    read_date: "2026-06-08",
    notes:
      "De Bono's lateral thinking framework is genuinely paradigm-shifting. The PO technique alone is worth the whole book.",
    insights: [
      "Lateral thinking vs vertical thinking: Vertical = dig deeper in the same hole. Lateral = move sideways to find better ground.",
      "The PO Technique: Deliberately introduce an absurd idea (PO) to break mental patterns and reveal new solution paths.",
      "Challenge every assumption: Most constraints are imaginary. Ask 'Why?' until you reach the original assumption, then question it.",
      "Random entry: Introduce a completely unrelated concept into your problem and force connections. Randomness unlocks creativity.",
      "Alternatives are not just improvements: True lateral thinking generates fundamentally different approaches, not just better versions of the existing one.",
    ],
  },
  {
    title: "Sell Like Crazy",
    author: "Sabri Suby",
    cover_url: null,
    theme: "sellcrazy",
    genres: ["sales", "marketing", "business"],
    rating: 5,
    read_date: "2026-06-15",
    notes:
      "The most practical sales and marketing book I've read. Suby's HALO framework and Dream 100 strategy are immediately actionable.",
    insights: [
      "The HALO customer avatar: Get crystal-clear on your ideal customer's deepest fears, desires, and daily frustrations — then speak directly to those.",
      "Dream 100: Identify your top 100 ideal clients and create hyper-personalised outreach for each. Volume without targeting is waste.",
      "The Value Ladder: Lead with extreme value up-front to earn trust before asking for a sale. Give $100 to get $10 back.",
      "Direct response over brand marketing: Every piece of content should prompt a specific measurable action. Awareness without conversion is expensive decoration.",
      "Follow-up is where money lives: 80% of sales happen after the 5th follow-up contact. Most businesses give up after 1–2.",
    ],
  },
  {
    title: "Sell or Be Sold",
    author: "Grant Cardone",
    cover_url: null,
    theme: "sellsold",
    genres: ["sales", "mindset", "business"],
    rating: 4,
    read_date: "2026-06-22",
    notes:
      "Cardone's energy is contagious and his point is undeniable: everyone is selling something, all the time. The 10X rule principle runs through every page.",
    insights: [
      "You are always selling: Whether a product, idea, or yourself — life is a series of sales conversations. Master this or be mastered by it.",
      "Commit fully or not at all: Half-commitment is the enemy of results. The universe rewards total commitment with total opportunity.",
      "Selling is a service: If you truly believe your product helps people, withholding it out of fear is selfish. Conviction is the fuel of selling.",
      "The most dangerous objection is silence: Follow up until you get a yes or a no. The maybe is a slow no that wastes your time.",
      "Expand, never contract: In uncertain times, most pull back. The winner expands activity, reach, and investment while others retreat.",
    ],
  },
];

export const SEED_CONTENT = [
  // ── THE DIARY OF A CEO ────────────────────────────────────────────────────
  {
    book_index: 0,
    content_type: "article",
    platform: "blog",
    title: "5 Life-Changing Lessons from The Diary of a CEO by Steven Bartlett",
    content: `**Meta:** Steven Bartlett's raw, honest diary reveals the frameworks behind building a billion-dollar brand — here are the 5 insights that hit hardest.

# 5 Life-Changing Lessons from The Diary of a CEO by Steven Bartlett

I came to this book expecting marketing tactics. What I got instead was a masterclass in identity, consistency, and the brutal truth about building something that matters.

Steven Bartlett dropped out of university, slept on a friend's sofa, and built a social media agency that grew to over 300 employees and sold for eight figures before he turned 30. More relevant to me — he documented every ugly, uncertain, triumphant moment along the way.

Here are the five insights that rewired how I think about building a business and a life.

## 1. The Law of Open Doors

Every significant opportunity in Bartlett's journey came through a *person*, not a pitch deck.

He writes about deliberately investing in relationships long before he needed them — showing up for people, adding value without agenda, and building goodwill with no expectation of return. When his business was struggling, it was a relationship he'd nurtured months earlier that opened the door he needed.

This is counterintuitive because most of us network transactionally: we reach out *when* we want something. Bartlett's approach is the opposite. He builds genuine connections first, then when he needs help, he's drawing from a full account rather than an overdraft.

**How I'm applying it:** I've started scheduling weekly calls with people I admire — not to pitch, just to learn. The return on these conversations compounds faster than almost any other activity.

## 2. Consistency Compounds Faster Than Talent

Bartlett is brutally honest that he wasn't the most talented person in the room. He was the most consistent.

He breaks down how daily non-negotiable actions — a podcast episode every week, a post every day, a lesson from every failure — compound into results that look like overnight success from the outside. The people watching the highlight reel don't see the three years of invisible effort preceding it.

What struck me was his calculation: if you improve just 1% each day for a year, you'll be 37× better by December 31st. Not 37% better — 37× better. The compounding mathematics of small consistent actions is genuinely staggering.

**How I'm applying it:** I've committed to shipping one piece of content per week regardless of how busy I am. Not when I'm inspired — every week.

## 3. Your Story Is Your Strongest Asset

This one hit me personally.

Bartlett argues that in a world drowning in polished, professional content, vulnerability is the ultimate differentiator. His willingness to share the moments of doubt, failure, and confusion built deeper trust with his audience than any award or achievement ever could.

He was rejected. He was broke. He made mistakes. He shared all of it. And his audience loved him more for it, not less.

The insight: people don't connect with your highlight reel — they connect with your humanity. The fact that you struggled *and kept going* is more powerful than the success you eventually achieved.

**How I'm applying it:** I'm documenting the building process, not just the wins. The difficult debugging session. The client conversation that didn't go well. The day I wanted to quit and why I didn't.

## 4. Systems Over Willpower

The book has a quiet but devastating line: *"Successful people aren't more disciplined — they've built better environments."*

Bartlett doesn't wake up every morning and fight his instincts to do the right thing. He's designed systems — physical environments, team structures, calendar blocks — that make good behaviour automatic and bad behaviour inconvenient.

He removed his social media apps from his phone. He hired an EA to protect his calendar. He built accountability into his team. By the time willpower is required, he's already won.

**How I'm applying it:** I blocked all social media sites on my laptop during working hours. I moved my phone to another room while I write. Small environmental tweaks that remove the need to rely on discipline.

## 5. The 1% Rule

Bartlett frames every action through a single lens: *"Does this make me 1% better or 1% worse?"*

This sounds deceptively simple until you apply it consistently. It replaces the paralyzing question of "Am I making the right decision?" with something immediately actionable. The 1% rule creates a clear hierarchy of choices and removes decision fatigue.

It also reframes failure. A bad day isn't a catastrophe — it's a 1% backward. You correct course tomorrow. Nothing is irreversible at the level of daily decisions.

**How I'm applying it:** I run every significant choice through this filter. Does skipping this workout make me 1% better or worse? Does publishing this article, even imperfectly, move me forward?

## My Biggest Takeaway

The overarching message of this book is something I needed to hear: *building something great isn't about being extraordinary, it's about being consistently ordinary for an uncommon amount of time.*

Bartlett didn't win because he was uniquely gifted. He won because he showed up, told the truth, invested in people, and kept going when everyone else would have stopped.

## Should You Read This?

**Read it if:**
- You're building a personal brand or business from scratch
- You want a raw, honest account of what entrepreneurship actually feels like
- You're looking for frameworks, not just inspiration
- You believe consistency matters more than talent
- You're a creator who wants to build genuine community

**Skip it if:**
- You're looking for a tactical step-by-step marketing textbook
- You prefer theoretical frameworks to personal narrative
- You've already read everything Bartlett has shared publicly (some material overlaps with his podcast)

**Rating:** 5/5 — One of the most honest books I've read about building something.

---

*I write about books, building, and learning in public. Follow the journey at [michaelojekunle.dev](https://michaelojekunle.dev) and on X [@devvmichael](https://x.com/devvmichael).*`,
    metadata: {
      seo_keywords: ["diary of a ceo review", "steven bartlett book", "entrepreneur lessons"],
      meta_description:
        "Steven Bartlett's raw, honest diary reveals the frameworks behind building a billion-dollar brand — here are the 5 insights that hit hardest.",
      word_count: 900,
      estimated_read_time: 5,
    },
  },
  {
    book_index: 0,
    content_type: "thread",
    platform: "x",
    title: "The Diary of a CEO — X Thread",
    content: `1/ Just finished "The Diary of a CEO" by @StevenBartlett.

Here are the 5 insights that rewired how I think about building:

2/ THE LAW OF OPEN DOORS

Every opportunity comes through a person.

Not a pitch deck. Not a clever strategy. A person.

Bartlett invested in relationships long before he needed them. When his business hit a wall, a relationship he'd built months earlier opened the only door that mattered.

3/ Network before you need to.

Most of us reach out transactionally — only when we want something.

The people who win build genuine connections first. Then when they need help, they're drawing from a full account, not an overdraft.

4/ CONSISTENCY COMPOUNDS

Bartlett wasn't the most talented person in the room.

He was the most consistent.

If you get 1% better each day for a year, you'll be 37× better by December 31st.

Not 37% better. 37×.

That's not motivational math — it's compound interest applied to skill.

5/ YOUR STORY IS YOUR STRONGEST ASSET

In a world drowning in polished content, vulnerability is the ultimate differentiator.

Bartlett shared the failures, the doubt, the embarrassing moments.

His audience loved him MORE for it. Not less.

6/ People don't connect with your highlight reel.

They connect with your humanity.

The fact that you struggled AND kept going is more powerful than any success you eventually achieve.

7/ SYSTEMS > WILLPOWER

"Successful people aren't more disciplined — they've built better environments."

He removed social apps from his phone. Hired an EA to protect his calendar. Built accountability into his team.

By the time willpower is required, he's already won.

8/ THE 1% RULE

Before every decision, Bartlett asks one question:

"Does this make me 1% better or 1% worse?"

This replaces the paralysing "Am I making the right decision?" with something immediately actionable.

Nothing is irreversible at the level of daily choices.

9/ The overarching message:

Building something great isn't about being extraordinary.

It's about being consistently ordinary for an uncommon amount of time.

10/ Bartlett didn't win because he was uniquely gifted.

He won because he:
→ Showed up daily
→ Told the truth about his failures
→ Invested in people before he needed them
→ Kept going when everyone else stopped

11/ If you're building something — a brand, a business, a life — this book is required reading.

Read my full breakdown with examples at michaelojekunle.dev

Follow for more book breakdowns every week 📚`,
    metadata: { tweet_count: 11 },
  },
  {
    book_index: 0,
    content_type: "caption",
    platform: "instagram",
    title: "Diary of a CEO — Instagram Caption",
    content: `Just finished "The Diary of a CEO" by @stevenbartlett and it rewired how I think about building.

Here's what stuck:

📖 The Law of Open Doors — every opportunity comes through a person. Build relationships before you need them.

📈 Consistency compounds — 1% better daily = 37× better by year end. Not motivation. Compound interest.

🔓 Vulnerability wins — your story, including the failures, is your strongest asset. People connect with your humanity, not your highlight reel.

🏗️ Systems over willpower — successful people don't rely on discipline. They build environments that make good behaviour automatic.

🎯 The 1% rule — before every decision: does this make me 1% better or worse? Simple filter. Powerful results.

The big idea: building something great isn't about being extraordinary. It's about being consistently ordinary for an uncommon amount of time.

→ Read my full breakdown with real examples at michaelojekunle.dev

Which of these hits hardest for you? Drop it in the comments 👇

#BookReview #DiaryOfACEO #StevenBartlett #LearningInPublic #Entrepreneurship #PersonalBrand #BuildInPublic`,
    metadata: {},
  },
  // ── THINKING SIDEWAYS ────────────────────────────────────────────────────
  {
    book_index: 1,
    content_type: "thread",
    platform: "x",
    title: "Thinking Sideways — X Thread",
    content: `1/ I just finished "Thinking Sideways" by Edward de Bono.

It's changed how I approach every problem.

Here's what stuck (thread):

2/ LATERAL vs VERTICAL THINKING

Vertical = digging deeper in the same hole.

Lateral = moving sideways to find better ground.

Most of us are excellent vertical thinkers. We analyse, refine, optimise.

But we never question whether we're digging in the right place.

3/ The uncomfortable truth:

The harder you work on the wrong approach, the further you get from the solution.

Effort and direction are separate variables.

4/ THE PO TECHNIQUE

De Bono's most powerful tool.

Introduce a deliberately absurd idea — prefixed with "PO" (provocation) — and use it as a stepping stone to a real insight.

PO: All cars should have square wheels.
→ Why? Bumpy ride → think about suspension → invent the modern air-ride system.

5/ You don't adopt the absurd idea.

You use it to see past your assumptions.

The point is not the idea. The point is the movement it creates in your mind.

6/ CHALLENGE EVERY ASSUMPTION

Most constraints are imaginary.

Ask "Why?" until you reach the original assumption. Then question whether it needs to exist.

The first assumption is usually: "This is just how it's done."

That's not a reason.

7/ RANDOM ENTRY

Pick a completely unrelated object or concept. Force connections between it and your problem.

Word: RIVER
Problem: How to grow my audience?

→ Flow, direction, tributaries (niches), erosion (consistency over time), destination (goal)

The connections you find are never coincidences.

8/ The key insight:

Creativity isn't a personality trait. It's a deliberate skill.

De Bono's framework gives you structured techniques to generate non-obvious solutions on demand.

9/ Most people think creativity means waiting for inspiration.

Lateral thinkers manufacture it.

10/ What problem have you been attacking vertically that deserves a sideways approach?

11/ Read my full breakdown at michaelojekunle.dev

I post book breakdowns every week. Follow for more 📚`,
    metadata: { tweet_count: 11 },
  },
  {
    book_index: 1,
    content_type: "caption",
    platform: "instagram",
    title: "Thinking Sideways — Instagram Caption",
    content: `Why does your problem feel unsolvable?

Because you're probably thinking about it wrong.

Just finished "Thinking Sideways" by Edward de Bono and here's what shifted:

🔵 Vertical thinking = drilling deeper (what most of us do)
🔵 Lateral thinking = moving sideways to find better ground
🔵 The PO Technique = use absurd ideas as stepping stones
🔵 All assumptions can be questioned. Most constraints are imaginary.
🔵 Creativity isn't a trait — it's a skill you can practise deliberately

The hardest part: realising you're working hard in the wrong direction.

The 10 hours you spent optimising the wrong approach would have been better spent asking "Is this even the right approach?"

→ Full breakdown at michaelojekunle.dev

What problem are you stuck on where lateral thinking could help? DM me 👇

#ThinkingSideways #EdwardDeBono #LateralThinking #Creativity #ProblemSolving #LearningInPublic #BookReview`,
    metadata: {},
  },
  // ── SELL LIKE CRAZY ─────────────────────────────────────────────────────
  {
    book_index: 2,
    content_type: "article",
    platform: "blog",
    title: "Sell Like Crazy: 5 Brutal Sales Truths from Sabri Suby",
    content: `**Meta:** Sabri Suby's Sell Like Crazy is the most practical sales book I've read. Here are the 5 frameworks that changed how I think about selling and marketing.

# Sell Like Crazy: 5 Brutal Sales Truths from Sabri Suby

I've read a lot of marketing books. Most are full of theories that dissolve under the pressure of real-world application.

Sell Like Crazy is different. Sabri Suby built King Kong — one of Australia's fastest-growing digital agencies — using the exact principles in this book. He's not teaching theory; he's documenting what actually moved the needle when millions of dollars were on the line.

Here are the five insights that changed how I think about sales and marketing.

## 1. The HALO Customer Avatar

Most businesses market to everyone. They lose money doing it.

Suby's HALO framework demands brutal specificity: who is your single ideal customer? Not a demographic — a real human being with a name, a daily routine, specific fears, specific desires, and a deeply frustrating problem that keeps them up at night.

When you know exactly who you're talking to, your marketing stops being background noise and starts being a private conversation. The person reading your ad thinks: *"How does he know exactly what I'm going through?"*

That feeling of being understood is the most powerful sales tool in existence.

**How I'm applying it:** I've written a 2-page document describing my ideal client in painful detail. Every piece of content I create now is addressed to that person — not to "developers" or "founders" generally.

## 2. The Dream 100

Suby's Dream 100 strategy is simple and devastating in its effectiveness: identify the 100 people or companies you most want as clients, then spend 90 days making it impossible for them to ignore you.

Not through volume — through personalisation. Send them a handwritten note about something they published. Comment meaningfully on their work. Create content specifically about their industry challenges. Show up where they spend time.

The average sales team gets 2–3% conversion on cold outreach. Dream 100 — done properly — can yield 20–30% conversion. The math on volume versus targeting is not close.

**How I'm applying it:** I've identified 20 companies I'd genuinely love to work with. I'm in their orbit every week, adding value before I've made a single pitch.

## 3. The Value Ladder

Suby describes a principle I'd intuitively felt but never articulated this clearly: before you ask someone to buy, you need to earn extraordinary trust.

The Value Ladder means leading with so much upfront value that your prospect feels indebted before they've spent a penny. A free resource so useful they can't believe it's free. A case study that solves their specific problem. A consultation that gives them clarity.

By the time you present an offer, they're already converted. You're not convincing them to buy — you're giving them a vehicle to pay you back for value they've already received.

**How I'm applying it:** Every major piece of content I publish is designed to be more valuable than most paid products in my niche.

## 4. Direct Response Over Brand Marketing

This one offended me at first — I care about brand building. But Suby's argument is inescapable.

Brand marketing (awareness campaigns, beautiful ads with no CTA) is a luxury for companies with unlimited budgets. For everyone else, every marketing dollar must be traceable to a measurable outcome: a click, a lead, a conversion.

Every piece of content should prompt a specific action. If someone can consume your content and do nothing with it, you've created expensive decoration.

**How I'm applying it:** Every article I write now ends with a specific CTA — not "follow me" generally, but a specific action tied to the value I just delivered.

## 5. Follow-Up Is Where the Money Lives

The most sobering statistic in the book: 80% of sales happen after the 5th follow-up contact. Most salespeople and marketers give up after one or two.

The person who didn't buy on your first email wasn't a lost cause — they were a future customer who needed more time or more trust. The sale was still available. You just stopped showing up.

Suby's follow-up system is relentless but valuable: every touchpoint delivers new information, new proof, new perspective. You're not nagging — you're educating.

**How I'm applying it:** I've built a 7-touch email sequence for every lead that enters my world. Each email delivers specific value and moves the conversation forward.

## My Biggest Takeaway

The core message of Sell Like Crazy is this: *most businesses fail at sales because they're thinking about themselves, not their customer.*

The moment you get obsessed with your customer's problem — their exact fears, their desired outcomes, their decision process — selling becomes almost effortless. You're not convincing anyone. You're connecting the right person to the right solution.

## Should You Read This?

**Read it if:**
- You run a business or freelance and want to grow revenue
- You've been relying on word-of-mouth and want a repeatable system
- You want practical frameworks you can implement this week
- You're a creator who wants to monetise your audience

**Skip it if:**
- You're opposed to direct response marketing philosophically
- You prefer academic marketing theory over field-tested tactics
- You already have a systematic, converting sales funnel

**Rating:** 5/5 — The most actionable marketing book I've read.

---

*I write about books, building, and learning in public. Follow at [michaelojekunle.dev](https://michaelojekunle.dev) and on X [@devvmichael](https://x.com/devvmichael).*`,
    metadata: {
      seo_keywords: ["sell like crazy review", "sabri suby", "sales marketing frameworks"],
      meta_description:
        "Sabri Suby's Sell Like Crazy contains the most practical sales frameworks I've encountered. Here are the 5 that changed how I sell.",
      word_count: 850,
      estimated_read_time: 5,
    },
  },
  {
    book_index: 2,
    content_type: "thread",
    platform: "x",
    title: "Sell Like Crazy — X Thread",
    content: `1/ "Sell Like Crazy" by Sabri Suby is the most practical sales book I've read.

Here are 5 frameworks that changed how I think about getting clients (thread):

2/ THE HALO CUSTOMER AVATAR

Most businesses market to everyone. They lose money doing it.

HALO forces you to define your single ideal customer — their name, daily routine, deepest fears, biggest desires, and the problem that keeps them up at night.

When you know exactly who you're talking to, your marketing becomes a private conversation.

3/ The person reading your ad thinks: "How does he know exactly what I'm going through?"

That feeling of being understood is the most powerful sales tool in existence.

4/ THE DREAM 100

Identify the 100 people/companies you most want as clients.

Then spend 90 days making it impossible for them to ignore you.

Not through volume — through personalisation.

Cold outreach converts at 2–3%.
Dream 100, done right, can yield 20–30%.

The math is not close.

5/ THE VALUE LADDER

Lead with so much upfront value that your prospect feels indebted before spending a penny.

A resource so useful they can't believe it's free.
A consultation that gives them real clarity.
A case study that solves their specific problem.

By the time you present an offer, they're already converted.

6/ DIRECT RESPONSE OVER BRAND MARKETING

Brand marketing is a luxury for companies with unlimited budgets.

For everyone else, every marketing dollar must trace to a measurable outcome.

If someone can consume your content and do nothing, you've created expensive decoration.

7/ Every piece you publish needs a specific, measurable call to action.

Not "follow me." A specific action tied to the value you just delivered.

8/ FOLLOW-UP IS WHERE THE MONEY LIVES

80% of sales happen after the 5th follow-up.

Most businesses give up after 1–2.

The person who didn't buy on your first email wasn't a lost cause.

They were a future customer who needed more time.

You just stopped showing up.

9/ The core message of the entire book:

Most businesses fail at sales because they're thinking about themselves, not their customer.

Get obsessed with your customer's problem and selling becomes almost effortless.

10/ You're not convincing anyone.

You're connecting the right person to the right solution.

That's the whole game.

11/ If you're building a business or freelancing, this book is required reading.

Full breakdown at michaelojekunle.dev 📚`,
    metadata: { tweet_count: 11 },
  },
  // ── SELL OR BE SOLD ──────────────────────────────────────────────────────
  {
    book_index: 3,
    content_type: "thread",
    platform: "x",
    title: "Sell or Be Sold — X Thread",
    content: `1/ "Sell or Be Sold" by @GrantCardone hit different.

His main claim: life is a series of sales conversations. Master it, or be mastered by it.

Here are the 5 ideas that stuck (thread):

2/ YOU ARE ALWAYS SELLING

Whether it's a product, an idea, a first date, a job interview, or a vision to your team —

You are always selling.

The question isn't whether to sell. It's whether you'll do it consciously or unconsciously.

3/ COMMIT FULLY OR NOT AT ALL

Cardone argues that most people fail not because they try and miss, but because they half-try.

Half-commitment is the enemy of results.

The universe rewards total commitment with total opportunity.

4/ And here's the uncomfortable part:

The same amount of energy you spend half-committing to 3 things could fully commit to 1 thing and change your life.

Divided attention is divided results.

5/ SELLING IS A SERVICE

This one flipped my perspective completely.

If you genuinely believe your product or service helps people, withholding it out of fear of rejection is selfish.

You're not protecting them from a pitch.
You're protecting yourself from discomfort.

6/ Conviction is the fuel of selling.

If you don't believe deeply in what you're offering, the prospect will sense it before you finish your first sentence.

7/ THE MOST DANGEROUS OBJECTION IS SILENCE

"Maybe" and "I'll think about it" are slow no's.

Follow up until you get a real yes or a real no.

The maybe wastes your time, their time, and keeps you from serving the people who actually need what you have.

8/ EXPAND, NEVER CONTRACT

In uncertain times, most people pull back.

They reduce activity, cut costs, play it safe.

Cardone says this is exactly backwards.

Winners expand activity, reach, and investment while others retreat.

Market downturns are the biggest discounts in history.

9/ The people who win in hard times aren't lucky.

They're the ones who kept moving when everyone else froze.

10/ The overarching message:

Sales is not a department. It's a life skill.

The most powerful people in any room are the ones who can communicate a vision and move others to action.

That's selling.

11/ If you're in any kind of business — or trying to build anything in life — read this book.

Full breakdown at michaelojekunle.dev 📚`,
    metadata: { tweet_count: 11 },
  },
  {
    book_index: 3,
    content_type: "caption",
    platform: "instagram",
    title: "Sell or Be Sold — Instagram Caption",
    content: `Controversial take: not selling is selfish.

Just finished "Sell or Be Sold" by Grant Cardone and I can't stop thinking about this.

If you genuinely believe your product, service, or idea helps people — withholding it out of fear of rejection isn't protecting them. It's protecting yourself from discomfort at their expense.

Here's what else landed hard:

💥 You're always selling — products, ideas, yourself. Consciously or not.
💥 Half-commitment = half-results. Always.
💥 "I'll think about it" is a slow no. Follow up until you get a real answer.
💥 Expand in uncertain times while others contract. Downturns are the biggest discounts in history.
💥 Conviction is the fuel. If you don't believe in what you're offering, prospects feel it instantly.

The big shift: sales isn't a department. It's a life skill.

The most powerful people in any room are the ones who can communicate a vision and move others to action.

That's selling.

→ Full breakdown at michaelojekunle.dev

Are you selling your ideas with full conviction or holding back? Be honest 👇

#SellOrBeSold #GrantCardone #Sales #BusinessMindset #LearningInPublic #BookReview #Entrepreneurship`,
    metadata: {},
  },
];
