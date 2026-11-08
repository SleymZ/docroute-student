# DocRoute promo video (Instagram Reels / TikTok)

Vertical 1080×1920, 30 fps, 25 s, in the five site languages
(en, ru, es, zh, hi). Silent audio track: add a sound inside Instagram or
TikTok (their in-app music is licensed for the platform).

## Script

| Time | Scene | On screen |
| --- | --- | --- |
| 0–3.5 s | Hook | "Moving to Europe?" · Study · Work · Family · Business |
| 3.5–8.5 s | Problem | Browser tabs pile up (faculty rules, residence permit, apostille, embassy…). "Dozens of tabs. Different offices." → "One missed deadline can cost a whole year." |
| 8.5–11.5 s | Answer | Tabs collapse into the logo. DocRoute · "Official steps. Real deadlines." |
| 11.5–17.5 s | Route | Example route card: 4 steps, each with a date and "Official source", ticked off one by one |
| 17.5–21 s | Passport | "Built for your passport": the passport label cycles India → Nigeria → Brazil → Vietnam → Kazakhstan, plus a red warning card |
| 21–25 s | Call to action | Logo, "Start your journey", 2,598 universities · 46 countries, Free to start · 5 languages, URL, "A preparation tool, not legal advice." |

Every claim matches the live site: university count from
`src/data/universities.json`, the tagline, the passport label and the
"Start your journey" text are the site's own strings and translations.
The route card is marked "Example": its dates are illustrative.
"Free to start" (not "free"), because paid Plus is planned.

## Post captions

Instagram does not make links in captions clickable: put the URL in the bio.

- **en**: Moving to Europe to study or work? DocRoute turns university rules, residence permits and deadlines into one route — every step linked to its official source. Free to start, in 5 languages. Link in bio. #studyineurope #studyabroad #moveabroad #residencepermit #internationalstudents
- **ru**: Переезжаете в Европу учиться или работать? DocRoute собирает правила вузов, ВНЖ и сроки в один маршрут — у каждого шага ссылка на официальный источник. Начать можно бесплатно, 5 языков. Ссылка в профиле. #учебаневропе #переездвевропу #внж #учебазарубежом #студенты
- **es**: ¿Te mudas a Europa para estudiar o trabajar? DocRoute convierte las normas de las universidades, los permisos de residencia y los plazos en una sola ruta, con la fuente oficial de cada paso. Empieza gratis, en 5 idiomas. Enlace en la bio. #estudiareneuropa #estudiarenelextranjero #emigrar #permisoderesidencia
- **zh**: 想去欧洲留学或工作？DocRoute 把大学招生规定、居留许可和各项期限整理成一条路线，每一步都附官方来源。免费开始，支持 5 种语言。链接见主页。#欧洲留学 #留学 #出国 #居留许可
- **hi**: यूरोप में पढ़ाई या नौकरी की सोच रहे हैं? DocRoute यूनिवर्सिटी के नियम, निवास परमिट और समय-सीमाएँ एक मार्ग में जोड़ता है — हर कदम के साथ आधिकारिक स्रोत। मुफ़्त में शुरू करें, 5 भाषाओं में। लिंक बायो में। #studyineurope #studyabroad #यूरोप #विदेशमेंपढ़ाई

## Render again

```bash
(cd /tmp && npm pack @fontsource/noto-sans-devanagari && tar xzf fontsource-noto-sans-devanagari-*.tgz)
mkdir -p marketing/promo/fonts && cp /tmp/package/files/noto-sans-devanagari-devanagari-{500,700,800}-normal.woff2 marketing/promo/fonts/
node marketing/promo/render.mjs en ru es zh hi            # videos → marketing/promo/out/
node marketing/promo/render.mjs en --frames 7.5,16.5      # stills only, for checking
```

Needs google-chrome, ffmpeg and puppeteer (or puppeteer-core); Inter and
Noto Sans CJK must be installed as system fonts. Texts live in `texts.json`;
change a text there and render that language again (about 2.5 minutes).

## Voice-over version

`voice.json` holds one spoken line per scene in each language;
`python3 marketing/voice/voiceover.py promo <kokoro models> en ru es zh hi`
adds the voice (and a quiet pad) to the rendered videos →
`out/DocRoute-promo-voice-<lang>.mp4`.
