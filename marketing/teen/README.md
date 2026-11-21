# DocRoute university video (younger audience)

25 s, 1080×1920, 30 fps, five languages. Brand dark style (owner: no loud
colours or emojis), cut on a 120 bpm beat synthesized by `beat.py` (no
third-party music). Scenes: hook → four "tabs" of the usual chaos → "Stop."
→ DocRoute → 2,598 universities in 46 countries → Top 100 last day to apply
(example card) → profile vs rules (met / still to do / missing) → every rule
links to the official source → call to action. Texts: `texts.json`.

```bash
node marketing/teen/render.mjs en ru es zh hi   # → marketing/teen/out/
```
Needs the Devanagari font in `marketing/promo/fonts` (see promo README).

## Voice-over version

`voice.json` holds one spoken line per scene; `python3 marketing/voice/voiceover.py
teen <kokoro models> en ru es zh hi` speaks them over the beat (lowered) →
`out/DocRoute-unis-voice-<lang>.mp4`.
