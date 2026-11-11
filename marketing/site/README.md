# Site screen-recording video (en, ru, hi)

Real screenshots of the site (local build, dark theme, phone 390×693 @2.77,
language by the `docroute-lang` cookie), shown full screen like a screen
recording: Top 100 (what it takes to get in) → rows with deadline and
requirements → a university page → the home form and "Build my route" tap →
the profile step → a built route "for citizens of India" → end card over the
home page, "Link in profile". White headline box, subtitles on a dark plate,
taps and highlights. Voices: en Kokoro am_michael, hi hm_omega, ru Piper dmitri.

```bash
# local site on :3123 (see marketing/button/README.md), then
node marketing/site/cap.mjs en; node marketing/site/cap.mjs ru; node marketing/site/cap.mjs hi
node marketing/site/toprect.mjs en ru hi
python3 marketing/site/voice.py <kokoro models> en ru hi
node marketing/site/render.mjs en ru hi
```
