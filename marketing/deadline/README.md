# "3 days left" — deadline video (5 languages, 22 s)

Strong open, then a drop: from frame one a huge "3 DAYS LEFT" on coral,
every hit changes the number (3 → 2 → 1) with a clock ticking faster, then
red "0 — MISSED" → dead silence, grey, slow: "That's how easy it is to lose a
whole year." → DocRoute shows the deadline before it's too late → Top 100
card (Example: last day to apply + days left, counted from 2026-11-09) →
after admission every step has a deadline → "Check your deadline today."

```bash
node marketing/deadline/render.mjs en ru es zh hi
python3 marketing/voice/voiceover.py deadline <kokoro models> en ru es zh hi          # voice + hits + pad (sfx.py)
NOBED=1 python3 marketing/voice/voiceover.py deadline <kokoro models> en ru es zh hi  # voice + opening hits only
```
