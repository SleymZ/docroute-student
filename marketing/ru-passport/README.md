# Russian-audience video: moving with a Russian passport (ru only, 49 s)

Facts only from the official pages the site already cites
(`src/data/russia-belarus.ts`, checked 2026-11-05/08): Czechia does not accept
visa or residence applications from Russian citizens (Decree 55/2024), Estonia
and Lithuania do not accept visa applications, Schengen visas are as a rule
single-entry (Commission decision of 7 Nov 2025), non-biometric passports not
recognised in Finland from 1 Jun 2026 and Sweden from 1 Oct 2026. Neutral
wording, no comment on causes. The second half shows the site's own passport
warning (label "Маршрут для граждан страны «Россия»", blocked box with the
exceptions and the official source), texts as in the Russian catalog.

```bash
python3 marketing/ru-passport/voice.py     # RHVoice aleksandr-hq, timeline, mix.wav / mix-nomusic.wav
node marketing/ru-passport/render.mjs      # → out/DocRoute-ru-passport.mp4 and -nomusic.mp4
```
