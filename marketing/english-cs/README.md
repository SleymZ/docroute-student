# "Computer science in English" — site screen-recording video (en, ru, hi)

Same style as marketing/site. Real screens: Top 100 → the "Computer science
in English" filter (29 of 100) → the UCL card opened (apply by 13 Jan 2027,
days left, language, school certificate, tuition, official links) → the
countries page (Austria: verified study, work, family, business) → the
Austria guide → end card "Link in profile".

```bash
node marketing/english-cs/capture.mjs en; … ru; … hi     # local site on :3123
python3 marketing/english-cs/voice.py <kokoro models> en ru hi
node marketing/english-cs/render.mjs en ru hi
```
