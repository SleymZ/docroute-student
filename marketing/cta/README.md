# "1-minute check" — a video built to get the click (en, ru, hi)

Owner: ~1000 views but ~5 visits. This video is a short tutorial whose whole
point is the visit: hook "Before you apply anywhere in Europe, do this
1-minute check" (a one-minute ring), Step 1 open the link in our profile
(arrow up), Step 2 choose passport, goal, country, Step 3 see what applies
(passport label, visa need with EU Regulation 2018/1806, steps with official
sources; Example card), universities without an account (2,598), the route
is free with an account, end card: big arrow up "Link in profile".
Claims match docs/ACCESS.md (guests: universities and Top 100; route: Free account).

Voices: en Kokoro am_michael, hi Kokoro hm_omega, ru Piper male
ru_RU-dmitri-medium (sherpa-onnx release tts-models; pip piper-tts).

```bash
python3 marketing/cta/voice.py <kokoro models> en ru hi
node marketing/cta/render.mjs en ru hi    # → out/DocRoute-check-<lang>.mp4 and -nomusic-
```
