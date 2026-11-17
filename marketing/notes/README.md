# «Шпаргалка абитуриента» / "Applicant cheat sheet": ten voiced videos (ru, en)

New style (2026-11-17), replaces `marketing/series`: light planner paper with
a dot grid and a red margin line, ink-black type, a coral marker over the key
words, a tear-off calendar, numbered checklists, a stamp for official sources,
real phone screens of the site, and the episode number as a recurring format.
Voice-over with word-by-word captions (the video works with the sound off).
**No music**: add it in the app at low volume (see "Music" below).

1080×1920, 30 fps, 21–33 s. Voices: Russian Piper `ru_RU-dmitri-medium`
(male), English Kokoro `am_michael`. Facts only from DocRoute's verified data
and its official sources (IOM Migration Information Centre Slovakia,
Euraxess Slovakia checklist 07/2026, ipc.gov.cz, each faculty's 2027/28
rules), checked 2026-10-23 … 2026-11-05. Example dates say "Example".

```bash
node marketing/notes/capture.mjs                 # real site screens (local next start with /deadlines)
python3 marketing/notes/make_scripts.py          # texts → scripts.json
python3 marketing/notes/voice.py                 # voice lines → out/timeline.json + out/<id>-<lang>-voice.wav
node marketing/notes/render.mjs                  # → out/DocRoute-cheatsheet-<id>-<lang>.mp4
node marketing/notes/render.mjs 03 --langs ru --frames 2,9   # stills only
```

Every video ends on **docroute-student.vercel.app/deadlines** (opens without an
account, PR #101). Bio links: `/go/<channel>-<lang>`; a post or Story link
adds the video number, e.g. `/go/ig-ru-03` (PR #100).

## Music

Instagram: Reel editor → Audio → pick a track → Volume: original audio 100,
music 10–15. TikTok: Sounds → pick → Volume: original 100, added 10–20.
YouTube Shorts: Sound → pick → set the track low. Only tracks from the app's
own library (on a business account: the commercial library); never a track
from elsewhere, or the video gets muted.

## Captions and hashtags

RU: `#учебавсловакии #учебавчехии #поступление2027 #внж #учебазаграницей #шпаргалкаабитуриента`
EN: `#studyinslovakia #studyinczechia #studyineurope #internationalstudents #studentvisa #cheatsheet`
Last line of every caption: «Не юридическая консультация: решают вуз и полиция.» /
"Not legal advice: universities and authorities decide."

| # | RU caption | EN caption |
| --- | --- | --- |
| 01 | Учёба в Словакии с 1 сентября 2027? Полиция может решать до 90 дней, значит подавать на ВНЖ — до 3 июня, а справку о несудимости брать не раньше 5 марта. Сохрани, чтобы не пересчитывать. Все сроки — ссылка в профиле. | Starting in Slovakia on 1 September 2027? The police may take up to 90 days, so file by 3 June, with a criminal record issued no earlier than 5 March. Save this. All deadlines: link in bio. |
| 02 | Медицина 2027/28 в Словакии и Чехии: Братислава на английском — до 21 февраля, Мартин, Прага, Брно, Градец-Кралове — до 28 февраля, Оломоуц — 15 марта, Пльзень на английском — 30 апреля. Отправь тому, кто поступает на медицину. | Medicine 2027/28 in Slovakia and Czechia: Bratislava in English by 21 Feb; Martin, Prague, Brno, Hradec Králové by 28 Feb; Olomouc 15 Mar; Pilsen in English 30 Apr. Send this to someone applying for medicine. |
| 03 | После словацкого ВНЖ на учёбу: 3 рабочих дня — сообщить о приезде (если подавал в посольстве), 3 рабочих дня после карты — страховка, 30 дней — медсправка. Сохрани на день приезда. | After your Slovak student permit: 3 working days to report your stay (if you applied at an embassy), 3 working days after the card for insurance, 30 days for the medical report. Save it for arrival day. |
| 04 | Справка о несудимости для словацкого ВНЖ — не старше 90 дней на дату подачи, из страны гражданства и каждой страны, где жил 90+ дней за 6 месяцев подряд за последние 3 года (кроме стран ЕС, которые передают данные сами). Плюс апостиль и перевод. | For a Slovak student permit your criminal record must be at most 90 days old when you file: from your citizenship country and every country with 90+ days within 6 months in a row in the last 3 years (except EU countries that share the data). Plus apostille and translation. |
| 05 | Перевод для Словакии: апостиль, потом официальный перевод на словацкий или чешский. Сделан за границей — заверяет посольство или консульство Словакии. Сделан в Чехии — заверять не нужно. | Translations for Slovakia: apostille first, then an official translation into Slovak or Czech. Made abroad: a Slovak embassy or consulate confirms it. Made in Czechia: no confirmation needed. |
| 06 | Информатика в Словакии 2027/28: Жилина (UNIZA FRI) €20, STU FIIT €30, FMFI Коменского — один сбор до 3 программ. Срок — 31 марта 2027. В UNIZA иностранцы сдают тест по словацкому на B1 (кроме абитуриентов из Чехии). | Computer science in Slovakia 2027/28: Žilina (UNIZA FRI) €20, STU FIIT €30, Comenius FMFI one fee for up to 3 programmes. Deadline 31 March 2027. At UNIZA foreign applicants pass a Slovak test at B1 (applicants from Czechia exempt). |
| 07 | Студент вуза в Словакии может работать до 80 часов в месяц без смены цели пребывания. Карта ВНЖ — €10 за 30 дней или €39 за 2 рабочих дня; отдельного сбора за заявление на учёбу правила не указывают. | University students in Slovakia may work up to 80 hours a month without changing the purpose of residence. Residence card €10 in 30 days or €39 in 2 working days; no separate study application fee is listed. |
| 08 | ВНЖ на учёбу: Словакия — решение до 90 дней, несудимость не старше 90 дней, карта €10/€39. Чехия — до 60 дней, документы не старше 180 дней, сбор 2 500 крон. А ты бы что выбрал? | Student permit: Slovakia up to 90 days, criminal record ≤ 90 days old, card €10/€39. Czechia up to 60 days, documents ≤ 180 days old, fee CZK 2,500. Which would you pick? |
| 09 | Один словацкий вуз — разные паспорта. ЕС: сообщить, где живёшь, за 10 рабочих дней и регистрация после 3 месяцев, бесплатно. Остальным — ВНЖ на учёбу: до 90 дней, несудимость, апостиль, перевод. Напиши в комментах свой паспорт — подскажу, где смотреть. | Same Slovak university, different passport. EU: report your stay within 10 working days, register after 3 months, free. Everyone else: a student permit, up to 90 days, criminal record, apostille, translation. Comment your passport and I'll point you to the right page. |
| 10 | 55 проверенных программ в Словакии и Чехии — все сроки подачи на одной странице. Без регистрации, с днями до дедлайна, фильтрами и официальной ссылкой у каждой даты. | 55 verified programmes in Slovakia and Czechia, every deadline on one page. No sign-up, days left, filters and the official link for every date. |
