# Universities video #2 (en, ru, hi) — follow-up to the best Instagram video

Same look, beat and timing as marketing/teen ("Choosing a university in
Europe? Here's how it usually goes." — the most viewed on Instagram), new
pains that the Top 100 card really answers: is my school certificate
accepted, which language test and score, which time zone is the 18:00
deadline, where is the non-EU tuition. Card: University College London,
apply by 13 Jan 2027 (UCAS, real data), days left counted from 2026-11-13.

```bash
node marketing/teen2/render.mjs en ru hi
PIPER_RU=<ru_RU-dmitri-medium.onnx> python3 marketing/voice/voiceover.py teen2 <kokoro models> en ru hi
```
