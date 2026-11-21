# "What happens when you press this button?" (English only)

For YouTube Shorts, TikTok and Instagram Reels. 40 s, 1080×1920, 30 fps,
English voice (Kokoro am_michael), captions, synthesized beat. Built from
**real screenshots of the site** (dark theme, phone size), shown in a phone
window with camera moves, highlights and a tapping cursor.

Story, built around the "Build my route" button (work purpose, India →
Slovakia, the real flow): the button → choose purpose, documents country
and destination → press → six questions (job offer: yes) → press again →
the route "for citizens of India" → what the passport needs (visa, EU
Regulation 2018/1806 linked) → stages in order (job offer, Labour Office,
embassy, arrival) → sources with check dates → "Try the button".
The Free view is shown as it is: Plus-only steps stay locked.

```bash
# 1. the site, locally (fonts: next/font/local with @fontsource-variable/inter, do not commit)
next build && next start -p 3123
# 2. screenshots + element positions → shots/
node marketing/button/capture.mjs
# 3. voice, then video → out/DocRoute-button-en.mp4
python3 marketing/button/tts.py /path/to/kokoro-models
node marketing/button/render.mjs
```
