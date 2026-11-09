# "You got in. That was the easy part." (English only)

For YouTube Shorts, TikTok and Instagram Reels. 42 s, 1080×1920, 30 fps,
English voice (Kokoro am_michael), burned-in captions, synthesized beat.

Hook (first 3 s): an admission letter, the green ADMITTED stamp slams,
then the letter cracks and falls — "That was the easy part." Then the five
steps after admission (apostille or legalization, certified translations,
proof of funds, residence permit often filed at an embassy before travel,
registration within days of arrival in many countries; on screen: "Exact
steps depend on the country and your passport"), one missed deadline can
cost a whole year, DocRoute puts it in one route (example card), built for
your passport, "Start free".

```bash
python3 marketing/hook/tts.py /path/to/kokoro-models
node marketing/hook/render.mjs            # → marketing/hook/out/DocRoute-hook-en.mp4
node marketing/hook/render.mjs --frames 1,7,28
```
