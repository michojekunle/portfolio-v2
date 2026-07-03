export interface CuratedBookSummary {
  id: string;
  title: string;
  author: string;
  category: string;
  tagline: string;
  description: string;
  cover_url: string;
  read_time_minutes: number;
  content: string;
}

export const CURATED_BOOKS: CuratedBookSummary[] = [
  {
    id: "atomic-habits",
    title: "Atomic Habits",
    author: "James Clear",
    category: "Productivity",
    tagline: "Tiny Changes, Remarkable Results.",
    description: "An easy & proven way to build good habits & break bad ones. Learn the 4 laws of behavior change: Make it obvious, attractive, easy, and satisfying.",
    cover_url: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=200",
    read_time_minutes: 15,
    content: `# Summary of Atomic Habits by James Clear

## Core Idea
Success is the product of daily habits—not once-in-a-lifetime transformations. Small 1% improvements accumulate into massive differences over time.

## The 4 Laws of Behavior Change
1. **First Law (Cue)**: Make it obvious. Design your environment so cues are visible.
2. **Second Law (Craving)**: Make it attractive. Use temptation bundling.
3. **Third Law (Response)**: Make it easy. Reduce friction, prime the environment.
4. **Fourth Law (Reward)**: Make it satisfying. Use immediate rewards and habit trackers.
`
  },
  {
    id: "think-grow-rich",
    title: "Think and Grow Rich",
    author: "Napoleon Hill",
    category: "Wealth",
    tagline: "What the mind can conceive and believe, it can achieve.",
    description: "One of the most famous wealth-building books of all time. Explores the power of desire, faith, auto-suggestion, and persistent planning.",
    cover_url: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=200",
    read_time_minutes: 15,
    content: `# Summary of Think and Grow Rich by Napoleon Hill

## Core Idea
All achievement, all earned riches, have their beginning in an idea. Thoughts are things, and when combined with purpose, persistence, and desire, they are powerful tools for success.

## Key Steps to Riches
1. **Desire**: The starting point of all achievement. You must want it with obsession.
2. **Faith**: Visualizing and believing in the attainment of your desire.
3. **Auto-Suggestion**: The medium for influencing the subconscious mind.
4. **Specialized Knowledge**: Directing your mind towards a specific, actionable purpose.
5. **Persistence**: The sustained effort necessary to induce faith.
`
  },
  {
    id: "win-friends",
    title: "How to Win Friends and Influence People",
    author: "Dale Carnegie",
    category: "Psychology",
    tagline: "The golden rules of interpersonal relationships.",
    description: "The absolute classic on building trust, influence, and strong relationships. Learn how to make people like you and win them to your way of thinking.",
    cover_url: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=200",
    read_time_minutes: 15,
    content: `# Summary of How to Win Friends & Influence People

## Core Idea
The secret to dealing with people is making them feel important and appreciated. Influence is not about manipulation; it is about genuine interest and active listening.

## Golden Rules
1. **Be genuinely interested in other people.**
2. **Smile.** It costs nothing but creates much.
3. **Remember that a person's name is to that person the sweetest sound.**
4. **Be a good listener.** Encourage others to talk about themselves.
5. **Talk in terms of the other person's interests.**
`
  },
  {
    id: "7-habits",
    title: "The 7 Habits of Highly Effective People",
    author: "Stephen R. Covey",
    category: "Leadership",
    tagline: "Powerful lessons in personal change.",
    description: "A comprehensive framework for personal and professional effectiveness. Move from dependence to independence, and finally to interdependence.",
    cover_url: "https://images.unsplash.com/photo-1476275466078-4007374efbbe?auto=format&fit=crop&q=80&w=200",
    read_time_minutes: 15,
    content: `# Summary of The 7 Habits of Highly Effective People

## Core Idea
Real effectiveness is character-based, not personality-based. Align your habits with universal principles for long-term growth and success.

## The 7 Habits
1. **Habit 1: Be Proactive**: Take responsibility for your life.
2. **Habit 2: Begin with the End in Mind**: Define your mission and goals.
3. **Habit 3: Put First Things First**: Prioritize important, non-urgent tasks.
4. **Habit 4: Think Win/Win**: Seek mutually beneficial solutions.
5. **Habit 5: Seek First to Understand, Then to Be Understood**: Listen empathetically.
6. **Habit 6: Synergize**: Combine strengths of people through teamwork.
7. **Habit 7: Sharpen the Saw**: Balance and renew your resources.
`
  },
  {
    id: "deep-work",
    title: "Deep Work",
    author: "Cal Newport",
    category: "Productivity",
    tagline: "Rules for focused success in a distracted world.",
    description: "The ability to focus without distraction on cognitively demanding tasks is becoming increasingly rare and increasingly valuable. Deep Work shows you how to cultivate this superpower.",
    cover_url: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&q=80&w=200",
    read_time_minutes: 13,
    content: `# Summary of Deep Work by Cal Newport

## Core Idea
Deep Work — professional activity performed in a state of distraction-free concentration that pushes your cognitive abilities to their limit — is the skill of the 21st century. Those who can cultivate it will thrive.

## The Deep Work Hypothesis
The ability to perform deep work is becoming increasingly rare, while simultaneously becoming increasingly valuable. Those who develop this skill will produce at an elite level.

## 4 Rules for Deep Work

### Rule 1: Work Deeply
Schedule deep work sessions like meetings. Use rituals and routines to minimize friction. Choose a depth philosophy: Monastic, Bimodal, Rhythmic, or Journalistic.

### Rule 2: Embrace Boredom
Resist the urge to switch to distraction at the first sign of boredom. Productive meditation, scheduled internet use, and memory training sharpen your concentration muscles.

### Rule 3: Quit Social Media
Apply the craftsman approach to tool selection: a tool is only worth using if its positives substantially outweigh its negatives relative to your professional goals.

### Rule 4: Drain the Shallows
Identify and minimize shallow work (email, meetings, admin). Schedule every minute of your workday. Finish work by 5:30pm.

## Action Steps
1. Block 90-minute deep work sessions in your calendar for the next week
2. Identify your "depth philosophy" and commit to it for 30 days
3. Eliminate or batch all shallow tasks to a 2-hour window each day
`
  },
  {
    id: "power-of-habit",
    title: "The Power of Habit",
    author: "Charles Duhigg",
    category: "Productivity",
    tagline: "Why we do what we do, and how to change.",
    description: "Habits are the brain's shortcut for repeating behaviours. Understanding the habit loop — cue, routine, reward — gives you the power to change any pattern in your life.",
    cover_url: "https://images.unsplash.com/photo-1495364141860-b0d03eccd065?auto=format&fit=crop&q=80&w=200",
    read_time_minutes: 12,
    content: `# Summary of The Power of Habit by Charles Duhigg

## Core Idea
Every habit operates through a neurological loop: Cue → Routine → Reward. Identify the cue and reward, and you can change the routine — and therefore the habit.

## The Habit Loop

### Cue
A trigger that tells your brain to go into automatic mode. It can be a time, place, emotion, other people, or an immediately preceding action.

### Routine
The physical, mental, or emotional behaviour that follows the cue. This is the habit itself.

### Reward
The positive reinforcement that tells your brain the loop is worth remembering. Without a reward, no habit forms.

## Key Insights

**The Golden Rule of Habit Change**: You can't extinguish a bad habit — you can only change it. Keep the same cue and reward, but insert a new routine.

**Keystone Habits**: Some habits create chain reactions that shift other patterns. Exercise is a classic keystone habit — it tends to improve diet, sleep, and productivity automatically.

**Belief**: For habits to permanently change, you must believe change is possible. Groups and communities make this easier.

## Action Steps
1. Pick one habit to change. Write down the cue, routine, and reward for it
2. Keep the cue and reward the same — experiment with 3 new routines
3. Identify one keystone habit to build that will cascade positively
`
  },
  {
    id: "rich-dad-poor-dad",
    title: "Rich Dad Poor Dad",
    author: "Robert T. Kiyosaki",
    category: "Wealth",
    tagline: "What the rich teach their kids about money.",
    description: "Challenges the conventional wisdom about money, investing, and career. The key difference between the rich and the poor is not how much they earn — it's what they do with it.",
    cover_url: "https://images.unsplash.com/photo-1553729459-efe14ef6055d?auto=format&fit=crop&q=80&w=200",
    read_time_minutes: 14,
    content: `# Summary of Rich Dad Poor Dad by Robert Kiyosaki

## Core Idea
Financial intelligence — not a high salary — is the key to wealth. The rich don't work for money; they make money work for them.

## The Two Dads
- **Poor Dad**: "Study hard, get good grades, find a safe job." Believed in job security, salary, and conventional thinking.
- **Rich Dad**: "Mind your own business. Build or buy assets that generate income." Believed in financial education and ownership.

## Key Lessons

### 1. The Rich Don't Work for Money
The rat race keeps people working for a paycheck to pay bills. The wealthy build assets that generate cash flow while they sleep.

### 2. The Importance of Financial Literacy
Income statement vs. balance sheet. Assets put money in your pocket; liabilities take money out. Most people buy liabilities they think are assets (like a primary home).

### 3. Mind Your Own Business
Your profession is not your business. Your business is your asset column: stocks, bonds, real estate, businesses, intellectual property.

### 4. Taxes and Corporations
The rich use legal corporate structures to protect their assets and reduce tax liability — financial education makes the difference.

### 5. The Rich Invent Money
Financial intelligence creates opportunities. Practice makes perfect: start small, take calculated risks, learn from failures.

## Action Steps
1. List your assets (things that put money in your pocket) vs. liabilities (things that take it out)
2. Choose one asset class to study deeply this month: stocks, real estate, or starting a side business
3. Track every naira/dollar you spend for 30 days to reveal where it actually goes
`
  },
  {
    id: "psychology-of-money",
    title: "The Psychology of Money",
    author: "Morgan Housel",
    category: "Wealth",
    tagline: "Timeless lessons on wealth, greed, and happiness.",
    description: "Doing well with money has little to do with how smart you are and a lot to do with how you behave. 19 short stories on the strange ways people think about money.",
    cover_url: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&q=80&w=200",
    read_time_minutes: 11,
    content: `# Summary of The Psychology of Money by Morgan Housel

## Core Idea
Financial success is not a hard science. It's a soft skill where how you behave matters more than what you know. Your personal history and psychology shape your financial decisions far more than facts and spreadsheets.

## Key Ideas

### No One is Crazy
Everyone's financial decisions make sense to them given the unique experiences they've had. The poor person who plays the lottery isn't irrational — it may be their only realistic shot at wealth.

### Luck and Risk
Bill Gates went to one of the only high schools in the world with a computer. His success is partly luck. Risk means good decisions can lead to bad outcomes. Judge strategies, not just outcomes.

### Never Enough
The hardest financial skill is getting the goalpost to stop moving. Enough is realizing that the opposite of "enough" is not "more" — it's a race you can never win.

### Compounding is the Most Powerful Force
Warren Buffett's fortune is mostly explained by time, not genius. He started at age 10 and never stopped. Most wealth is made in the last years of a long investing journey.

### Save Like a Pessimist, Invest Like an Optimist
Pessimism sounds smart and optimism sounds naïve, but the world gets better over time. Save with a margin of safety; invest with long-term conviction.

### The Price of Investing
Volatility is the admission fee to long-term returns. Investors who view it as a fee get the reward. Those who view it as a fine try to avoid it and miss out.

## Action Steps
1. Write down your "enough" number — what would you need to feel financially secure?
2. Automate savings so behaviour doesn't get in the way of intention
3. Extend your investment time horizon by 10 years — compounding does the work
`
  },
  {
    id: "thinking-fast-slow",
    title: "Thinking, Fast and Slow",
    author: "Daniel Kahneman",
    category: "Psychology",
    tagline: "The two systems that shape your judgment and decisions.",
    description: "Nobel Prize winner Daniel Kahneman reveals the two systems of thought: System 1 (fast, intuitive) and System 2 (slow, deliberate). Understanding both transforms how you make decisions.",
    cover_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200",
    read_time_minutes: 16,
    content: `# Summary of Thinking, Fast and Slow by Daniel Kahneman

## Core Idea
Our minds operate using two systems. System 1 is fast, automatic, and emotional — it runs most of your life. System 2 is slow, deliberate, and logical — it kicks in only when you truly engage. Most of our mistakes happen when System 1 operates where System 2 should.

## System 1 vs. System 2

**System 1 (Fast Thinking)**
- Automatic, emotional, rapid
- Uses mental shortcuts (heuristics)
- Susceptible to cognitive biases
- Controls 95% of our decisions

**System 2 (Slow Thinking)**
- Deliberate, rational, effortful
- Can override System 1 when engaged
- Limited capacity — gets tired
- Only activates when consciously engaged

## Key Cognitive Biases

**Anchoring Effect**: The first number you hear influences all subsequent judgments. Negotiators use this deliberately.

**Availability Heuristic**: We judge probability by how easily examples come to mind. Vivid events (plane crashes) seem more common than they are.

**Overconfidence**: People systematically overestimate their knowledge and underestimate their ignorance. "I knew it all along" is a memory distortion.

**Loss Aversion**: Losses feel roughly twice as painful as gains feel good. This explains risk aversion and the endowment effect.

**The Planning Fallacy**: People chronically underestimate time, cost, and risks of future actions. Reference class forecasting corrects this.

## Action Steps
1. Before any major decision, ask "What would System 2 say?" — slow down and list pros/cons
2. When you feel very certain about something, immediately question that certainty
3. Use checklists to engage System 2 in repetitive, high-stakes tasks
`
  },
  {
    id: "mans-search-for-meaning",
    title: "Man's Search for Meaning",
    author: "Viktor E. Frankl",
    category: "Psychology",
    tagline: "Finding purpose in suffering, freedom in attitude.",
    description: "Psychiatrist Viktor Frankl survived the Nazi death camps and developed logotherapy — the therapy of finding meaning. His account reveals that the last human freedom is the freedom to choose one's attitude.",
    cover_url: "https://images.unsplash.com/photo-1474932430478-367dbb6832c1?auto=format&fit=crop&q=80&w=200",
    read_time_minutes: 10,
    content: `# Summary of Man's Search for Meaning by Viktor Frankl

## Core Idea
Those who have a "why" to live for can bear almost any "how." The primary human drive is not pleasure or power — it is the pursuit of meaning.

## Part 1: Life in the Concentration Camp

Frankl describes the psychological stages of concentration camp prisoners: admission shock, apathy and emotional dulling, and the psychology of liberation. He observed that prisoners who had a reason to survive — a manuscript to complete, a loved one to find — lasted longer.

**The Last Human Freedom**: Between stimulus and response, there is a space. In that space lies our freedom to choose our response, and in our response lies our growth and freedom. No one can take this from you.

## Part 2: Logotherapy

Logotherapy is therapy through meaning. The central principle: humans are driven above all by the search for meaning.

**Three Sources of Meaning**:
1. **Creative values** — what we give to the world (work, creations, deeds)
2. **Experiential values** — what we receive from the world (love, truth, beauty)
3. **Attitudinal values** — the stance we take toward unavoidable suffering

**The Existential Vacuum**: The feeling of emptiness that arises when people lose meaning — often manifests as boredom, depression, or the pursuit of power and pleasure as substitutes.

**Tragic Optimism**: Maintaining optimism in spite of the "tragic triad" — pain, guilt, and death. Finding meaning in suffering transforms it.

## Action Steps
1. Write a "meaning statement" — what gives your life purpose right now?
2. When facing unavoidable suffering, ask: "What attitude can I choose in this situation?"
3. Identify one creative project you could dedicate yourself to this month
`
  }
];
