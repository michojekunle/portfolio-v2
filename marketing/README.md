# French Daily & Spanish Daily — launch kit

Images are in `images/` at each platform's exact size. Their source is `cards.html`.
To re-render after editing a card, run the command at the bottom of this file.

**Before posting, read the hook copy.** It's written in your voice ("I could read French…"). Change anything that isn't true
to your own story: an honest personal hook beats a polished fake one. Every product claim below is true of the app today.
No "10× faster", no "fluent in 3 months", no invented user numbers.

Links: `michaelojekunle.dev/french` · `michaelojekunle.dev/spanish`

---

## Images

| File | Size | Use for |
|---|---|---|
| `ig-fr-1.png` … `ig-fr-6.png` | 1080×1350 | Instagram / LinkedIn carousel (French), in order |
| `ig-es-1.png` … `ig-es-3.png` | 1080×1350 | Instagram carousel (Spanish), in order |
| `x-fr.png`, `x-es.png` | 1600×900 | X, LinkedIn and Facebook single image |
| `tt-fr.png`, `tt-es.png` | 1080×1920 | TikTok / Reels / Shorts cover and Stories |

---

## X (Twitter)

### Launch thread (attach `x-fr.png` to post 1, `ig-fr-4.png` to post 4, `ig-fr-6.png` to post 6)

1/
I could read French. I couldn't say a word.

So I built a tiny app that makes you speak and write every day: one button, about ten minutes.

michaelojekunle.dev/french

2/
The problem with most language apps: you tap the right answer, keep the streak, and freeze the first time a real person talks to you.

Recognising a word and producing it are different skills. Most apps only train the first.

3/
So every line in French Daily has to come back out of you before you can move on: say it back (it checks what it heard) or type it from memory (the line hides).

Mistakes come back in a teacher's red pen.

4/
It also shows you how French actually sounds:

je ne sais pas → chais pas
je suis → chuis
il y a → y a

Textbooks never teach this, which is why native speech feels impossible.

5/
Your mistakes become cards, and they come back right before you'd forget them.

Tap any word for its meaning. No decks to build, no settings.

6/
And no "fluent in 3 months". The goal matches the time you give it:

15 min/day ≈ A2 in a year
30 min/day ≈ B1
1 h/day ≈ B2

Free, and no account needed to try:
michaelojekunle.dev/french

(Spanish too: michaelojekunle.dev/spanish)

### Standalone posts

- "Hier soir, j'ai allé au cinéma" → "je suis allé". Day 1 of writing one French sentence a day and getting it corrected in red pen. Ten minutes: michaelojekunle.dev/french
- Hot take: your streak isn't the problem. You're just never asked to *say* anything. I built the fix: michaelojekunle.dev/french
- Spanish learners: "para el" → "pa'l", "estoy" → "'toy", "cansado" → "cansao". That's why fast Spanish sounds like one long word. Ten minutes a day, out loud: michaelojekunle.dev/spanish (attach `x-es.png`)
- One button. No menus. Review, hear a short scene, say it back, write one sentence. Done in ~10 minutes. michaelojekunle.dev/french

---

## Instagram

### French carousel (`ig-fr-1` → `ig-fr-6`)

**Caption:**
I could read French. I couldn't say a word. 🇫🇷

So I built French Daily: one page a day, about ten minutes, and you can't skip a line until you've said it back or typed it from memory.

→ Mistakes come back in red pen
→ It shows how French really sounds ("chais pas", "chuis")
→ Your mistakes become tomorrow's flashcards
→ Honest goals: 15 min/day ≈ A2 in a year

Free to try, no account needed. Link in bio → /french

#learnfrench #frenchlearning #apprendrelefrancais #frenchvocabulary #languagelearning #studyfrench #frenchteacher #polyglot

### Spanish carousel (`ig-es-1` → `ig-es-3`)

**Caption:**
Why does fast Spanish sound like one long word? 🇪🇸

Because people say "pa'l", "'toy" and "cansao", not what the textbook taught you.

Spanish Daily: ten minutes a day, out loud. Hear a short scene, say it back, write one sentence, get it corrected.

Free to try, no account needed. Link in bio → /spanish

#learnspanish #spanishlearning #aprenderespañol #spanishvocabulary #languagelearning #studyspanish #hablaespañol

### Story frames (use `tt-fr.png` / `tt-es.png`, add a link sticker)
1. The POV cover.
2. Screen recording: pressing "Commencer", one line, "Je le redis", the score.
3. The red-pen correction appearing.
4. Link sticker: "Try today's page".

---

## TikTok / Reels / Shorts

Record the screen on your phone (built-in screen recorder, sound on), then add captions in the editor. Each video is 15–30 seconds. Use the matching `tt-*.png` as the cover.

### Video 1: "POV: a year of French and you freeze" (French)
- **0–2s:** cover text: "POV: you've studied French for a year…"
- **2–5s:** a clip of fast spoken French (your own voice or the app's real-speed scene). Caption: "and someone says 'chais pas'".
- **5–12s:** screen recording: app → Écouter → the "How it really sounds" list (je ne sais pas → chais pas).
- **12–22s:** say a line back; show the word-by-word score.
- **22–28s:** "Ten minutes a day. Free. Link in bio."
- **Voiceover idea:** "Apps taught me to recognise French, not to speak it. So I built one where you can't skip a line until you've said it."

### Video 2: "I let the app correct my French" (French)
- Type a sentence with a real mistake → "Corriger" → the red strike animation plays (this is the hook; it's satisfying to watch).
- Caption: "j'ai allé → je suis allé 💀". End on "One sentence a day."

### Video 3: "Spanish waiter test" (Spanish)
- Cover: "Your 300-day streak meets a real Spanish waiter."
- A clip asking "¿Algo más?" fast → freeze-frame face → the app's café scene line by line → "Lo repito" → score.
- Caption: "Ten minutes, out loud. Free."

### Video 4: "Day 1 vs day 30" (either language)
- Record your own 20-second answer to the same question on day 1 and day 30 (the Speak step's question works). Post both side by side.
- This is the most convincing content you can make, and it's honest by construction.

**Posting rhythm:** 3–4 short videos a week beat one polished one. Reuse every recording as a Reel, a Short and a TikTok.

---

## Things to never post
- Fluency timelines faster than the in-app goals.
- Fake user counts, testimonials or reviews.
- Screenshots that show other people's data.
- Competitor names in a mocking way. The POV jokes work without naming anyone.

---

## Re-render the images

```bash
cd marketing
CH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
render(){ "$CH" --headless=new --disable-gpu --hide-scrollbars --force-device-scale-factor=2 --window-size=$2,$3 --virtual-time-budget=6000 --screenshot="images/$1.png" "file://$PWD/cards.html#$1"; }
for id in ig-fr-1 ig-fr-2 ig-fr-3 ig-fr-4 ig-fr-5 ig-fr-6 ig-es-1 ig-es-2 ig-es-3; do render $id 540 675; done
render x-fr 800 450; render x-es 800 450; render tt-fr 540 960; render tt-es 540 960
```
