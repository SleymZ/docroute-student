# Growth series: ten 16–20 s videos (en, ru)

Same brand dark style as `marketing/teen` (the most viewed Instagram video):
dark background, coral glow, Inter, cuts on a 120 bpm beat synthesized by
`../teen/beat.py` (no third-party music). One template (`series.html`), the
scripts in `scripts.json`, written by `make_scripts.py`.

```bash
python3 marketing/series/make_scripts.py          # after editing the texts
node marketing/series/render.mjs                  # all → marketing/series/out/
node marketing/series/render.mjs 03 07 --langs ru # some videos, one language
node marketing/series/render.mjs --frames 2,9     # stills only, for checking
```

Every video promises one thing and ends on the page that keeps it:
**docroute-student.vercel.app/deadlines** (opens without an account).
Facts come only from DocRoute's verified data and its official sources
(IOM Migration Information Centre Slovakia, Euraxess Slovakia checklist
July 2026, ipc.gov.cz, each faculty's 2027/28 admission rules), checked
2026-10-23 … 2026-11-05. Example dates are labelled "Example".

## Links

Bio link (one per account): `https://docroute-student.vercel.app/go/<channel>-<lang>`,
e.g. `/go/tt-ru`, `/go/ig-en`, `/go/yt-ru`. In a post where links work
(Telegram, Reddit, YouTube description, comment replies) add the video
number: `/go/tg-ru-03`. Counts are in Supabase `link_clicks` (PR #100).

## Captions and hashtags

Hashtags EN: `#studyinslovakia #studyinczechia #studyineurope #internationalstudents #studentvisa #studyabroad`
Hashtags RU: `#учебавсловакии #учебавчехии #учебавевропе #внж #поступление2027 #студентзарубежом`

| # | Video | Caption EN | Caption RU |
| --- | --- | --- | --- |
| 01 | 3 · 3 · 30 | After you collect your Slovak student permit: 3 working days to report your stay (if you applied at an embassy), 3 working days for health insurance, 30 days for the medical report. Save this. All deadlines: link in bio. | После получения словацкого ВНЖ: 3 рабочих дня — сообщить о пребывании (если подавал в посольстве), 3 рабочих дня — страховка, 30 дней — медсправка. Сохрани. Все сроки — по ссылке в профиле. |
| 02 | The 90-day trap | Slovakia: your criminal record must be no older than 90 days when you file, and the police may take up to 90 days to decide. Count back from your start date. | Словакия: справка о несудимости — не старше 90 дней на дату подачи, а полиция может решать до 90 дней. Считай назад от даты начала учёбы. |
| 03 | Medicine deadlines | Medicine 2027/28 in Slovakia and Czechia: most deadlines are in February (Bratislava in English: 21 Feb). Every date from the faculty's official rules. | Медицина 2027/28 в Словакии и Чехии: большинство сроков — в феврале (Братислава на английском — 21 февраля). Каждая дата — из официальных правил факультета. |
| 04 | Work while studying | University students in Slovakia may work up to 80 hours a month without changing the purpose of residence. Residence card: €10 (30 days) or €39 (2 working days). | Студенты вузов в Словакии могут работать до 80 часов в месяц без смены цели пребывания. Карта ВНЖ: €10 (30 дней) или €39 (2 рабочих дня). |
| 05 | Translation gotcha | Translated your documents at home? For Slovakia a translation made abroad must be confirmed by a Slovak embassy or consulate. Made in Czechia: no confirmation needed. | Перевёл документы дома? Для Словакии перевод, сделанный за границей, должно заверить посольство или консульство Словакии. Сделан в Чехии — не нужно. |
| 06 | Computer science, Slovakia | Computer science in Slovakia, 2027/28: apply by 31 March. UNIZA €20, STU FIIT €30, Comenius FMFI one fee for up to 3 programmes. UNIZA: Slovak test at B1 for foreign applicants. | Информатика в Словакии на 2027/28: подача до 31 марта. UNIZA €20, STU FIIT €30, FMFI Коменского — один сбор до 3 программ. UNIZA: тест по словацкому на B1 для иностранцев. |
| 07 | Plan backwards | Need a Slovak decision by 1 Sep 2027? File by 3 Jun 2027 (up to 90 days), with a criminal record issued no earlier than 5 Mar 2027. Example, check your own dates. | Нужно решение по словацкому ВНЖ к 1 сентября 2027? Подавай до 3 июня 2027 (до 90 дней), справка о несудимости — не раньше 5 марта 2027. Это пример, проверь свои даты. |
| 08 | Slovakia vs Czechia | Student permit: Slovakia up to 90 days, criminal record ≤ 90 days old; Czechia up to 60 days, documents ≤ 180 days old, fee CZK 2,500. | ВНЖ на учёбу: Словакия — до 90 дней, несудимость не старше 90 дней; Чехия — до 60 дней, документы не старше 180 дней, сбор 2 500 крон. |
| 09 | February | 16 of 55 verified 2027/28 programmes in Slovakia and Czechia close in February 2027. Find your date before you plan anything else. | 16 из 55 проверенных программ 2027/28 в Словакии и Чехии закрывают приём в феврале 2027. Сначала узнай свою дату. |
| 10 | Passport | Same Slovak university, different passport: EU/EEA/Swiss report the stay within 10 working days and register after 3 months (free); everyone else needs a student residence permit. | Один словацкий вуз, разные паспорта: граждане ЕС/ЕЭЗ/Швейцарии сообщают о пребывании за 10 рабочих дней и регистрируются после 3 месяцев (бесплатно); остальным нужен ВНЖ на учёбу. |

Always add the last line: "Not legal advice: universities and authorities decide." /
«Не юридическая консультация: решают вуз и полиция».
