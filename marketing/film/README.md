# DocRoute short film kit (English, 9:16)

The cinematic film itself is generated in an AI video tool from the shot
list and prompts in the doc "DocRoute short film — shot list and AI video
prompts" (claude.ai artifact). This folder makes everything around it:

- `voice.json` + `voice.py` — the voiceover (Kokoro am_michael), its timeline
  (`out/voice/timeline.json`) and `out/DocRoute-film-voiceover.wav/.mp3`.
- `shots.json` — the 14 shots with their times and colour grade.
- `endmap.mjs` → `endmap.json` — Europe and the route stops (world-atlas 50m, d3-geo).
- `endcard.html` + `render.mjs` — the end card (navy #1F2937, orange #FF7A00
  route Lisbon → Madrid → Paris → Munich → Vienna → Bratislava → High Tatras;
  with and without the logo) and an animatic with placeholder cards + voice.

```bash
python3 marketing/film/voice.py /path/to/kokoro-models
node marketing/film/render.mjs
```
