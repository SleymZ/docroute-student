"""Writes scripts.json for the "Applicant cheat sheet" series: ten voiced
20-35 s videos in Russian and English. `say` is read by the voice (numbers
and dates in words, so the engine gets the case right), `cap` is the
caption on screen. Facts only from DocRoute's verified data and its
official sources (IOM Migration Information Centre Slovakia, Euraxess
Slovakia checklist 07/2026, ipc.gov.cz, faculty 2027/28 rules), checked
2026-10-23 ... 2026-11-05; example dates are labelled as examples.
python3 marketing/notes/make_scripts.py"""
import json, pathlib

SK, CZ = "../../public/flags/sk.svg", "../../public/flags/cz.svg"
URL = "docroute-student.vercel.app/deadlines"
END = {
    "ru": {"type": "end", "url": URL, "sub": "Ссылка в профиле · бесплатно · без регистрации",
           "say": "Все сроки — по ссылке в профиле. Это бесплатно.", "cap": "Все сроки — по ссылке в профиле. Бесплатно."},
    "en": {"type": "end", "url": URL, "sub": "Link in bio · free · no sign-up",
           "say": "All the deadlines are at the link in my bio. It's free.", "cap": "All deadlines: link in bio. Free."},
}
CHIP = {"ru": "Шпаргалка №{n}", "en": "Cheat sheet #{n}"}
BADGE = {"ru": "по официальным источникам", "en": "from official sources"}
V = {}

def add(slug, ru, en):
    n = f"{len(V) + 1:02d}"
    V[f"{n}-{slug}"] = {
        lang: {"chip": CHIP[lang].format(n=n), "badge": BADGE[lang], "scenes": scenes + [END[lang]]}
        for lang, scenes in (("ru", ru), ("en", en))
    }

shot = lambda name, lang: f"shots/{name}-{lang}.png"

# 01 · plan backwards from September (Slovakia)
add("plan-backwards", [
    {"type": "title", "head": "Учёба в Словакии с сентября? *Подавай на ВНЖ в июне.*",
     "say": "Хочешь учиться в Словакии с сентября? Подавать на вид на жительство нужно уже в июне."},
    {"type": "big", "big": "*90* дней", "sub": "столько полиция может решать",
     "say": "Полиция может решать до девяноста дней.", "cap": "Полиция может решать до *90 дней.*"},
    {"type": "calendar", "label": "Пример: решение нужно к", "from": {"month": "Сентябрь", "day": "1", "year": "2027"},
     "to": {"month": "Июнь", "day": "3", "year": "2027"}, "note": "подать не позже",
     "say": "Решение нужно к первому сентября? Значит, подавай не позже третьего июня.",
     "cap": "Решение к 1 сентября? Подавай не позже *3 июня.*"},
    {"type": "calendar", "label": "Справка о несудимости — выдана не раньше", "to": {"month": "Март", "day": "5", "year": "2027"},
     "say": "А справку о несудимости бери не раньше пятого марта: на дату подачи ей должно быть не больше девяноста дней.",
     "cap": "Справка о несудимости — не раньше *5 марта:* на дату подачи ей не больше 90 дней."},
    {"type": "phone", "img": shot("country-sk", "ru"), "from": 0, "to": 900,
     "say": "Все шаги по порядку и официальные источники — на сайте Док Рут.",
     "cap": "Все шаги по порядку — с официальными источниками."},
], [
    {"type": "title", "head": "Starting in Slovakia in September? *File for residence in June.*",
     "say": "Starting university in Slovakia in September? You should file for your residence permit in June."},
    {"type": "big", "big": "*90* days", "sub": "how long the police may take",
     "say": "The police can take up to ninety days to decide.", "cap": "The police can take up to *90 days.*"},
    {"type": "calendar", "label": "Example: decision needed by", "from": {"month": "September", "day": "1", "year": "2027"},
     "to": {"month": "June", "day": "3", "year": "2027"}, "note": "file no later than",
     "say": "Need the decision by September first? Then file by June third at the latest.",
     "cap": "Decision by 1 September? File by *3 June.*"},
    {"type": "calendar", "label": "Criminal record — issued no earlier than", "to": {"month": "March", "day": "5", "year": "2027"},
     "say": "And get your criminal record no earlier than March fifth. It must be at most ninety days old when you file.",
     "cap": "Criminal record: no earlier than *5 March.* At most 90 days old when you file."},
    {"type": "phone", "img": shot("country-sk", "en"), "from": 0, "to": 900,
     "say": "Every step, in order, with the official sources, is on Doc Root.",
     "cap": "Every step in order, with official sources."},
])

# 02 · medicine deadlines are in February
add("medicine-february", [
    {"type": "title", "head": "Медицина в Словакии или Чехии? *Срок — в феврале.*",
     "say": "Мечтаешь о медицине в Словакии или Чехии? Срок подачи не летом, а в феврале."},
    {"type": "calendar", "label": "Братислава · на английском", "to": {"month": "Февраль", "day": "21", "year": "2027"},
     "say": "Братислава, программа на английском, — до двадцать первого февраля.",
     "cap": "Братислава, на английском — до *21 февраля.*"},
    {"type": "list", "title": "До 28 февраля 2027", "items": [
        {"n": "SK", "text": "Мартин", "small": "на словацком и на английском"},
        {"n": "CZ", "text": "Прага", "small": "Карлов университет, 1-й медицинский"},
        {"n": "CZ", "text": "Брно", "small": "Университет Масарика"},
        {"n": "CZ", "text": "Градец-Кралове", "small": "Карлов университет"}],
     "say": "Мартин, Прага, Брно и Градец-Кралове — до двадцать восьмого февраля.",
     "cap": "Мартин, Прага, Брно, Градец-Кралове — до *28 февраля.*"},
    {"type": "list", "title": "Позже", "items": [
        {"n": "15.03", "text": "Оломоуц", "small": "Университет Палацкого", "tone": "ok"},
        {"n": "30.04", "text": "Пльзень · на английском", "small": "Карлов университет", "tone": "ok"}],
     "say": "Позже других — Оломоуц, пятнадцатого марта, и Пльзень на английском — тридцатого апреля.",
     "cap": "Оломоуц — 15 марта, Пльзень на английском — *30 апреля.*"},
    {"type": "phone", "img": shot("medicine", "ru"), "from": 0, "to": 1700, "scrollDur": 2.2,
     "say": "Каждая дата — из официальных правил факультета, с датой проверки.",
     "cap": "Каждая дата — из правил факультета, с датой проверки."},
], [
    {"type": "title", "head": "Medicine in Slovakia or Czechia? *The deadline is in February.*",
     "say": "Want to study medicine in Slovakia or Czechia? The deadline isn't in summer. It's in February."},
    {"type": "calendar", "label": "Bratislava · in English", "to": {"month": "February", "day": "21", "year": "2027"},
     "say": "Bratislava, the English programme: by February twenty-first.",
     "cap": "Bratislava, in English: by *21 February.*"},
    {"type": "list", "title": "By 28 February 2027", "items": [
        {"n": "SK", "text": "Martin", "small": "in Slovak and in English"},
        {"n": "CZ", "text": "Prague", "small": "Charles University, First Faculty"},
        {"n": "CZ", "text": "Brno", "small": "Masaryk University"},
        {"n": "CZ", "text": "Hradec Králové", "small": "Charles University"}],
     "say": "Martin, Prague, Brno and Hradec Králové: by February twenty-eighth.",
     "cap": "Martin, Prague, Brno, Hradec Králové: by *28 February.*"},
    {"type": "list", "title": "Later", "items": [
        {"n": "15.03", "text": "Olomouc", "small": "Palacký University", "tone": "ok"},
        {"n": "30.04", "text": "Pilsen · in English", "small": "Charles University", "tone": "ok"}],
     "say": "Later ones: Olomouc on March fifteenth, and Pilsen in English on April thirtieth.",
     "cap": "Olomouc: 15 March. Pilsen in English: *30 April.*"},
    {"type": "phone", "img": shot("medicine", "en"), "from": 0, "to": 1700, "scrollDur": 2.2,
     "say": "Every date comes from the faculty's official rules, with the date it was checked.",
     "cap": "Every date from the faculty's rules, with its check date."},
])

# 03 · three deadlines after the permit (3 · 3 · 30)
items_ru = [
    {"n": "3", "text": "рабочих дня после приезда", "small": "сообщить в полицию о начале пребывания"},
    {"n": "3", "text": "рабочих дня после получения карты", "small": "оформить медицинскую страховку"},
    {"n": "30", "text": "дней после получения карты", "small": "медсправка, не старше 30 дней"}]
items_en = [
    {"n": "3", "text": "working days after arrival", "small": "report your stay to the Foreign Police"},
    {"n": "3", "text": "working days after the card", "small": "get health insurance"},
    {"n": "30", "text": "days after the card", "small": "medical report, no older than 30 days"}]
def steps(items, k): return [dict(it, old=True) if i < k else (dict(it, at=0.2) if i == k else dict(it, dim=True)) for i, it in enumerate(items)]
add("three-deadlines", [
    {"type": "title", "head": "Получил словацкий ВНЖ? *Не расслабляйся.*",
     "say": "Получил словацкий вид на жительство на учёбу? Не расслабляйся: сейчас начнутся три срока."},
    {"type": "list", "title": "После приезда", "items": steps(items_ru, 0),
     "say": "Первый: если подавал в посольстве, за три рабочих дня после приезда сообщи в полицию, что ты приехал.",
     "cap": "Подавал в посольстве? За *3 рабочих дня* после приезда сообщи в полицию."},
    {"type": "list", "title": "После приезда", "keep": True, "items": steps(items_ru, 1),
     "say": "Второй: за три рабочих дня после получения карты оформи медицинскую страховку.",
     "cap": "За *3 рабочих дня* после получения карты — медстраховка."},
    {"type": "list", "title": "После приезда", "keep": True, "items": steps(items_ru, 2),
     "say": "Третий: за тридцать дней принеси медицинскую справку. Ей тоже должно быть не больше тридцати дней.",
     "cap": "За *30 дней* — медсправка, не старше 30 дней."},
    {"type": "stamp", "stamp": "Официальные правила", "small": "IOM Slovakia · Euraxess 2026",
     "say": "Это из официальных правил: Ай-О-Эм и Евраксесс в Словакии.", "cap": "Источник: IOM и Euraxess в Словакии."},
], [
    {"type": "title", "head": "Got your Slovak student permit? *Don't relax yet.*",
     "say": "Got your Slovak student residence permit? Don't relax yet. Three deadlines start now."},
    {"type": "list", "title": "After you arrive", "items": steps(items_en, 0),
     "say": "One. If you applied at an embassy, report your stay to the Foreign Police within three working days of arriving.",
     "cap": "Applied at an embassy? Report your stay within *3 working days.*"},
    {"type": "list", "title": "After you arrive", "keep": True, "items": steps(items_en, 1),
     "say": "Two. Within three working days of collecting the card, get health insurance.",
     "cap": "Within *3 working days* of the card: health insurance."},
    {"type": "list", "title": "After you arrive", "keep": True, "items": steps(items_en, 2),
     "say": "Three. Within thirty days, bring a medical report that is itself no older than thirty days.",
     "cap": "Within *30 days:* a medical report, no older than 30 days."},
    {"type": "stamp", "stamp": "Official rules", "small": "IOM Slovakia · Euraxess 2026",
     "say": "That's straight from the official rules: I O M and Euraxess Slovakia.", "cap": "Source: IOM and Euraxess Slovakia."},
])

# 04 · the criminal record goes stale
add("criminal-record", [
    {"type": "title", "head": "Справка о несудимости *тоже стареет.*",
     "say": "Справка о несудимости тоже стареет. Из-за этого документы часто приходится собирать заново."},
    {"type": "big", "big": "≤ *90* дней", "sub": "столько ей может быть на дату подачи (Словакия, ВНЖ на учёбу)",
     "say": "Для словацкого ВНЖ на учёбу ей должно быть не больше девяноста дней на дату подачи.",
     "cap": "Словакия: не старше *90 дней* на дату подачи."},
    {"type": "list", "title": "Откуда нужна справка", "items": [
        {"n": "1", "text": "Из страны гражданства"},
        {"n": "2", "text": "Из каждой страны, где жил больше 90 дней", "small": "за 6 месяцев подряд, в последние 3 года"},
        {"n": "−", "text": "Кроме стран ЕС,", "small": "которые сами передают эти данные Словакии", "tone": "ok"}],
     "say": "Нужна она из страны гражданства и из каждой страны, где ты жил больше девяноста дней за шесть месяцев подряд за последние три года. Кроме стран ЕС, которые сами обмениваются этими данными со Словакией.",
     "cap": "Из страны гражданства и каждой страны, где жил *90+ дней* за 6 месяцев подряд за 3 года."},
    {"type": "list", "title": "И ещё", "items": [
        {"n": "✓", "text": "Апостиль или легализация", "tone": "ok"},
        {"n": "✓", "text": "Официальный перевод на словацкий", "tone": "ok"}],
     "say": "Плюс апостиль или легализация и официальный перевод на словацкий.",
     "cap": "Плюс апостиль и официальный *перевод.*"},
    {"type": "phone", "img": shot("country-sk", "ru"), "from": 0, "to": 900,
     "say": "Что и когда собирать — по шагам на Док Рут.", "cap": "Что и когда собирать — по шагам."},
], [
    {"type": "title", "head": "Your criminal record *goes stale too.*",
     "say": "Your criminal record certificate goes stale too. It's a common reason to redo documents."},
    {"type": "big", "big": "≤ *90* days", "sub": "its maximum age when you file (Slovakia, student permit)",
     "say": "For a Slovak student permit it must be at most ninety days old when you file.",
     "cap": "Slovakia: at most *90 days old* when you file."},
    {"type": "list", "title": "Where you need it from", "items": [
        {"n": "1", "text": "Your country of citizenship"},
        {"n": "2", "text": "Every country you lived in for 90+ days", "small": "within 6 months in a row, in the last 3 years"},
        {"n": "−", "text": "Except EU countries", "small": "that share this data with Slovakia", "tone": "ok"}],
     "say": "You need one from your country of citizenship, and from every country where you lived more than ninety days within six months in a row, in the last three years. Except EU countries that share this data with Slovakia.",
     "cap": "Citizenship country, plus every country with *90+ days* in 6 months, in the last 3 years."},
    {"type": "list", "title": "Also", "items": [
        {"n": "✓", "text": "Apostille or legalisation", "tone": "ok"},
        {"n": "✓", "text": "Official translation into Slovak", "tone": "ok"}],
     "say": "Plus an apostille or legalisation, and an official translation into Slovak.",
     "cap": "Plus an apostille and an official *translation.*"},
    {"type": "phone", "img": shot("country-sk", "en"), "from": 0, "to": 900,
     "say": "What to collect, and when, step by step on Doc Root.", "cap": "What to collect and when, step by step."},
])

# 05 · where the translation is made matters
add("translation", [
    {"type": "title", "head": "Перевёл документы дома? *Проверь одну деталь.*",
     "say": "Перевёл документы для Словакии у себя дома? Проверь одну деталь."},
    {"type": "list", "title": "Иностранный документ для Словакии", "items": [
        {"n": "1", "text": "Апостиль", "small": "или легализация, если апостиль не действует"},
        {"n": "2", "text": "Официальный перевод", "small": "на словацкий или чешский"}],
     "say": "Иностранному документу нужен апостиль или легализация, а потом официальный перевод на словацкий или чешский.",
     "cap": "Сначала *апостиль,* потом официальный перевод на словацкий или чешский."},
    {"type": "stamp", "stamp": "Заверить в посольстве Словакии", "small": "если перевод сделан за границей",
     "say": "Если перевод сделан за границей, его должно заверить посольство или консульство Словакии.",
     "cap": "Перевод сделан за границей? Его заверяет *посольство Словакии.*"},
    {"type": "list", "items": [{"n": "✓", "text": "Перевод сделан в Чехии?", "small": "заверять не нужно", "tone": "ok"}],
     "say": "А перевод, сделанный в Чехии, заверять не нужно.", "cap": "Сделан в Чехии — заверять *не нужно.*"},
], [
    {"type": "title", "head": "Translated your documents at home? *Check one detail.*",
     "say": "Translated your documents for Slovakia back home? Check one detail."},
    {"type": "list", "title": "A foreign document for Slovakia", "items": [
        {"n": "1", "text": "Apostille", "small": "or legalisation where the apostille doesn't apply"},
        {"n": "2", "text": "Official translation", "small": "into Slovak or Czech"}],
     "say": "A foreign document needs an apostille or legalisation, then an official translation into Slovak or Czech.",
     "cap": "First an *apostille,* then an official translation into Slovak or Czech."},
    {"type": "stamp", "stamp": "Confirm at a Slovak embassy", "small": "if it was translated abroad",
     "say": "If the translation was made abroad, a Slovak embassy or consulate must confirm it.",
     "cap": "Translated abroad? A *Slovak embassy* must confirm it."},
    {"type": "list", "items": [{"n": "✓", "text": "Translated in Czechia?", "small": "no confirmation needed", "tone": "ok"}],
     "say": "A translation made in Czechia needs no confirmation.", "cap": "Made in Czechia: *no confirmation* needed."},
])

# 06 · computer science in Slovakia
add("computer-science", [
    {"type": "title", "head": "Информатика в Словакии: *что нужно для подачи.*",
     "say": "Хочешь на информатику в Словакии? Вот что на самом деле нужно для подачи на следующий год."},
    {"type": "calendar", "label": "Жилина · STU FIIT · Коменского FMFI", "to": {"month": "Март", "day": "31", "year": "2027"},
     "say": "У трёх факультетов срок один: тридцать первое марта.", "cap": "Срок у трёх факультетов: *31 марта 2027.*"},
    {"type": "list", "title": "Сбор за заявление", "items": [
        {"n": "€20", "text": "Жилина · UNIZA FRI"},
        {"n": "€30", "text": "Братислава · STU FIIT"},
        {"n": "1×", "text": "Братислава · FMFI", "small": "один сбор — до трёх программ", "tone": "ok"}],
     "say": "Сбор в Жилине — двадцать евро, в FIIT — тридцать, а в FMFI один сбор покрывает до трёх программ.",
     "cap": "Жилина *€20,* FIIT *€30,* FMFI — один сбор на 3 программы."},
    {"type": "list", "items": [{"n": "B1", "text": "UNIZA: тест по словацкому", "small": "для иностранцев, кроме абитуриентов из Чехии", "tone": "warn"}],
     "say": "Важно: в Жилине иностранцы сдают тест университета по словацкому на уровень бэ один. Кроме абитуриентов из Чехии.",
     "cap": "В Жилине иностранцы сдают тест по словацкому на *B1.*"},
    {"type": "phone", "img": shot("cs-sk", "ru"), "from": 0, "to": 1600, "scrollDur": 2,
     "say": "Всё это — на одной странице, с официальными ссылками.", "cap": "Всё на одной странице, с официальными ссылками."},
], [
    {"type": "title", "head": "Computer science in Slovakia: *what you need to apply.*",
     "say": "Want computer science in Slovakia? Here's what it really takes to apply for next year."},
    {"type": "calendar", "label": "Žilina · STU FIIT · Comenius FMFI", "to": {"month": "March", "day": "31", "year": "2027"},
     "say": "Three faculties, one deadline: March thirty-first.", "cap": "Three faculties, one deadline: *31 March 2027.*"},
    {"type": "list", "title": "Application fee", "items": [
        {"n": "€20", "text": "Žilina · UNIZA FRI"},
        {"n": "€30", "text": "Bratislava · STU FIIT"},
        {"n": "1×", "text": "Bratislava · FMFI", "small": "one fee for up to three programmes", "tone": "ok"}],
     "say": "Twenty euros in Žilina, thirty at FIIT, and at FMFI one fee covers up to three programmes.",
     "cap": "Žilina *€20,* FIIT *€30,* FMFI: one fee, 3 programmes."},
    {"type": "list", "items": [{"n": "B1", "text": "UNIZA: Slovak language test", "small": "for foreign applicants, except applicants from Czechia", "tone": "warn"}],
     "say": "Watch out: at Žilina, foreign applicants pass the university's Slovak test at level B one. Applicants from Czechia are exempt.",
     "cap": "At Žilina, foreign applicants pass a Slovak test at *B1.*"},
    {"type": "phone", "img": shot("cs-sk", "en"), "from": 0, "to": 1600, "scrollDur": 2,
     "say": "It's all on one page, with the official links.", "cap": "All on one page, with official links."},
])

# 07 · working while studying
add("work-while-studying", [
    {"type": "title", "head": "Учишься в Словакии — *можно ли работать?*",
     "say": "Можно ли работать, пока учишься в Словакии?"},
    {"type": "big", "big": "*80* ч", "sub": "в месяц — для студентов вуза, без смены цели пребывания",
     "say": "Да. Студент вуза может работать до восьмидесяти часов в месяц без смены цели пребывания.",
     "cap": "Да: до *80 часов в месяц,* без смены цели пребывания."},
    {"type": "list", "title": "Карта ВНЖ", "items": [
        {"n": "€10", "text": "за 30 дней"}, {"n": "€39", "text": "за 2 рабочих дня"}],
     "say": "А сама карта стоит десять евро, если ждать тридцать дней, или тридцать девять — за два рабочих дня.",
     "cap": "Карта ВНЖ: *€10* за 30 дней или *€39* за 2 рабочих дня."},
    {"type": "stamp", "stamp": "Отдельного сбора нет в правилах", "small": "за заявление на учёбу · IOM Slovakia",
     "say": "Отдельный сбор за само заявление на учёбу официальные правила не указывают.",
     "cap": "Отдельный сбор за заявление на учёбу *не указан.*"},
], [
    {"type": "title", "head": "Studying in Slovakia: *can you work?*",
     "say": "Can you work while you study in Slovakia?"},
    {"type": "big", "big": "*80* h", "sub": "a month for university students, without changing the purpose of residence",
     "say": "Yes. University students may work up to eighty hours a month, without changing the purpose of residence.",
     "cap": "Yes: up to *80 hours a month,* same permit."},
    {"type": "list", "title": "Residence card", "items": [
        {"n": "€10", "text": "in 30 days"}, {"n": "€39", "text": "in 2 working days"}],
     "say": "And the card itself costs ten euros if you wait thirty days, or thirty-nine for two working days.",
     "cap": "Card: *€10* in 30 days, or *€39* in 2 working days."},
    {"type": "stamp", "stamp": "No separate fee listed", "small": "for the study application · IOM Slovakia",
     "say": "The official rules list no separate fee for the study application itself.",
     "cap": "No separate fee listed for the *study application.*"},
])

# 08 · Slovakia vs Czechia, student permit
rows_ru = [{"k": "Решение", "l": "до 90 дней", "r": "до 60 дней"},
           {"k": "Документы", "l": "несудимость ≤ 90 дней", "r": "≤ 180 дней"},
           {"k": "Сбор", "l": "карта €10 или €39", "r": "2 500 крон"}]
rows_en = [{"k": "Decision", "l": "up to 90 days", "r": "up to 60 days"},
           {"k": "Documents", "l": "criminal record ≤ 90 days", "r": "≤ 180 days old"},
           {"k": "Fee", "l": "card €10 or €39", "r": "CZK 2,500"}]
L_ru, R_ru = {"title": "Словакия", "flag": SK}, {"title": "Чехия", "flag": CZ}
L_en, R_en = {"title": "Slovakia", "flag": SK}, {"title": "Czechia", "flag": CZ}
add("slovakia-vs-czechia", [
    {"type": "title", "head": "ВНЖ на учёбу: *Словакия или Чехия?*",
     "say": "Вид на жительство на учёбу: Словакия или Чехия? Сравним по официальным правилам."},
    {"type": "compare", "left": L_ru, "right": R_ru, "rows": rows_ru, "upto": 0, "hl": 0,
     "say": "Решение: в Словакии — до девяноста дней, в Чехии — до шестидесяти.", "cap": "Решение: Словакия *до 90 дней,* Чехия *до 60.*"},
    {"type": "compare", "keep": True, "left": L_ru, "right": R_ru, "rows": rows_ru, "upto": 1, "hl": 1,
     "say": "Документы: в Словакии справка о несудимости не старше девяноста дней, в Чехии документы не старше ста восьмидесяти.",
     "cap": "Словакия: несудимость *≤ 90 дней.* Чехия: документы *≤ 180 дней.*"},
    {"type": "compare", "keep": True, "left": L_ru, "right": R_ru, "rows": rows_ru, "upto": 2, "hl": 2,
     "say": "Сбор: в Словакии платишь за карту, десять или тридцать девять евро, в Чехии — две тысячи пятьсот крон.",
     "cap": "Словакия: карта *€10 / €39.* Чехия: *2 500 крон.*"},
    {"type": "phone", "img": shot("deadlines", "ru"), "from": 0, "to": 1900, "scrollDur": 2.2,
     "say": "А сроки подачи в вузы обеих стран — на одной странице.", "cap": "Сроки подачи в вузы обеих стран — на одной странице."},
], [
    {"type": "title", "head": "Student permit: *Slovakia or Czechia?*",
     "say": "Student residence permit: Slovakia or Czechia? Let's compare the official rules."},
    {"type": "compare", "left": L_en, "right": R_en, "rows": rows_en, "upto": 0, "hl": 0,
     "say": "Decision: up to ninety days in Slovakia, up to sixty in Czechia.", "cap": "Decision: Slovakia *up to 90 days,* Czechia *up to 60.*"},
    {"type": "compare", "keep": True, "left": L_en, "right": R_en, "rows": rows_en, "upto": 1, "hl": 1,
     "say": "Documents: in Slovakia the criminal record must be at most ninety days old, in Czechia documents up to a hundred and eighty.",
     "cap": "Slovakia: criminal record *≤ 90 days.* Czechia: documents *≤ 180 days.*"},
    {"type": "compare", "keep": True, "left": L_en, "right": R_en, "rows": rows_en, "upto": 2, "hl": 2,
     "say": "Fees: in Slovakia you pay for the card, ten or thirty-nine euros. In Czechia, two thousand five hundred crowns.",
     "cap": "Slovakia: card *€10 / €39.* Czechia: *CZK 2,500.*"},
    {"type": "phone", "img": shot("deadlines", "en"), "from": 0, "to": 1900, "scrollDur": 2.2,
     "say": "And the university deadlines for both countries are on one page.", "cap": "University deadlines for both countries, on one page."},
])

# 09 · EU passport vs any other passport (Slovakia)
rows9_ru = [{"k": "Что нужно", "l": "сообщить, где живёшь · 10 раб. дней", "r": "ВНЖ на учёбу"},
            {"k": "Дальше", "l": "регистрация после 3 мес. · бесплатно", "r": "решение до 90 дней"},
            {"k": "Документы", "l": "паспорт или ID + подтверждение учёбы", "r": "несудимость, апостиль, перевод"}]
rows9_en = [{"k": "What you need", "l": "report where you stay · 10 working days", "r": "student residence permit"},
            {"k": "Then", "l": "register after 3 months · free", "r": "decision up to 90 days"},
            {"k": "Documents", "l": "passport or ID + proof of study", "r": "criminal record, apostille, translation"}]
EU_ru, NEU_ru = {"title": "Паспорт ЕС"}, {"title": "Другой паспорт"}
EU_en, NEU_en = {"title": "EU passport"}, {"title": "Any other"}
add("passport", [
    {"type": "title", "head": "Один вуз. *Разные паспорта.*",
     "say": "Один и тот же словацкий вуз, но разные паспорта — и совсем разные документы."},
    {"type": "compare", "left": EU_ru, "right": NEU_ru, "rows": rows9_ru, "upto": 1, "hl": 0,
     "say": "С паспортом ЕС за десять рабочих дней сообщаешь, где живёшь, если общежитие не сделало это за тебя, а после трёх месяцев регистрируешься. Бесплатно.",
     "cap": "Паспорт ЕС: сообщить, где живёшь, за *10 рабочих дней,* регистрация после 3 месяцев — бесплатно."},
    {"type": "compare", "keep": True, "left": EU_ru, "right": NEU_ru, "rows": rows9_ru, "upto": 2, "hl": 2,
     "say": "С любым другим паспортом нужен вид на жительство на учёбу: решение до девяноста дней, справка о несудимости, апостиль и перевод.",
     "cap": "Другой паспорт: *ВНЖ на учёбу,* до 90 дней, несудимость, апостиль, перевод."},
    {"type": "phone", "img": shot("country-sk", "ru"), "from": 0, "to": 900,
     "say": "Док Рут строит маршрут под твой паспорт.", "cap": "Маршрут — под твой паспорт."},
], [
    {"type": "title", "head": "Same university. *Different passport.*",
     "say": "Same Slovak university, different passport, and completely different paperwork."},
    {"type": "compare", "left": EU_en, "right": NEU_en, "rows": rows9_en, "upto": 1, "hl": 0,
     "say": "With an EU passport you report where you stay within ten working days, unless your dorm does it for you, and register after three months. For free.",
     "cap": "EU passport: report your stay within *10 working days,* register after 3 months, free."},
    {"type": "compare", "keep": True, "left": EU_en, "right": NEU_en, "rows": rows9_en, "upto": 2, "hl": 2,
     "say": "With any other passport you need a student residence permit: up to ninety days for a decision, a criminal record, an apostille and a translation.",
     "cap": "Any other passport: a *student permit,* up to 90 days, criminal record, apostille, translation."},
    {"type": "phone", "img": shot("country-sk", "en"), "from": 0, "to": 900,
     "say": "Doc Root builds the route for your passport.", "cap": "A route built for your passport."},
])

# 10 · the deadlines page itself
add("one-page", [
    {"type": "title", "head": "55 программ. *Все сроки на одной странице.*",
     "say": "Пятьдесят пять проверенных программ в Словакии и Чехии. Все сроки подачи — на одной странице."},
    {"type": "phone", "img": shot("deadlines", "ru"), "from": 0, "to": 0,
     "say": "Открываешь без регистрации и сразу видишь, сколько дней осталось.", "cap": "Без регистрации: сразу видно, *сколько дней осталось.*"},
    {"type": "phone", "keep": True, "img": shot("deadlines", "ru"), "from": 0, "to": 1500, "scrollAt": .1, "scrollDur": 1.4,
     "say": "Фильтр по стране и направлению: медицина, информатика, право, экономика.", "cap": "Фильтр: страна и направление."},
    {"type": "phone", "keep": True, "img": shot("deadlines", "ru"), "from": 1500, "to": 2050, "scrollAt": .1, "scrollDur": 1,
     "say": "У каждой даты — ссылка на страницу факультета и дата, когда её проверили.", "cap": "У каждой даты — *официальная страница* и дата проверки."},
], [
    {"type": "title", "head": "55 programmes. *Every deadline on one page.*",
     "say": "Fifty-five verified programmes in Slovakia and Czechia. Every application deadline, on one page."},
    {"type": "phone", "img": shot("deadlines", "en"), "from": 0, "to": 0,
     "say": "No sign-up. Open it and see how many days are left.", "cap": "No sign-up: see *how many days are left.*"},
    {"type": "phone", "keep": True, "img": shot("deadlines", "en"), "from": 0, "to": 1500, "scrollAt": .1, "scrollDur": 1.4,
     "say": "Filter by country and field: medicine, computer science, law, economics.", "cap": "Filter by country and field."},
    {"type": "phone", "keep": True, "img": shot("deadlines", "en"), "from": 1500, "to": 2050, "scrollAt": .1, "scrollDur": 1,
     "say": "Every date links to the faculty's page and shows when it was checked.", "cap": "Every date: the *official page* and its check date."},
])

here = pathlib.Path(__file__).parent
(here / "scripts.json").write_text(json.dumps(V, ensure_ascii=False, indent=1) + "\n")
print(len(V), "videos")
