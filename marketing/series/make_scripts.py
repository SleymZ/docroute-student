"""Writes scripts.json: ten 16–20 s videos in English and Russian.
Every fact comes from DocRoute's verified data (src/data/*, checked
2026-10-23 … 2026-11-05) and its official sources (IOM Migration
Information Centre Slovakia, Euraxess Slovakia checklist July 2026,
ipc.gov.cz, faculty admission rules 2027/28). No made-up numbers.
python3 make_scripts.py"""
import json, pathlib

URL = "docroute-student.vercel.app/deadlines"
CTA = {
    "en": {"type": "cta", "text": "All 2027/28 deadlines in one place", "url": URL, "small": "Link in bio · free · official sources"},
    "ru": {"type": "cta", "text": "Все сроки 2027/28 в одном месте", "url": URL, "small": "Ссылка в профиле · бесплатно · официальные источники"},
}

def video(dur, scenes_en, scenes_ru, times):
    """times: [(at, until), ...] for the scenes before the CTA; CTA takes the rest."""
    assert len(scenes_en) == len(scenes_ru) == len(times)
    out = {"dur": dur}
    for lang, scenes in (("en", scenes_en), ("ru", scenes_ru)):
        seq = [dict(s, at=a, until=b) for s, (a, b) in zip(scenes, times)]
        seq.append(dict(CTA[lang], at=times[-1][1], until=dur + 1))
        out[lang] = {"scenes": seq}
    return out

V = {}

# 01 · 3 · 3 · 30 — duties after arrival in Slovakia (IOM, Euraxess checklist)
V["01-three-three-thirty"] = video(18, [
    {"type": "hook", "kicker": "Student permit · Slovakia", "text": "Got your Slovak student permit? Three deadlines start now.", "sub": "Most people learn about them too late."},
    {"type": "big", "word": "3 · 3 · 30"},
    {"type": "list", "title": "After you arrive", "items": [
        {"ic": "3", "text": "Working days to report your stay to the Foreign Police (if you applied at an embassy)"},
        {"ic": "3", "text": "Working days after you collect the card: get health insurance"},
        {"ic": "30", "text": "Days after you collect the card: medical report, no older than 30 days"}]},
    {"type": "source", "text": "From the official rules", "pills": ["IOM Slovakia", "Euraxess checklist 2026"]},
], [
    {"type": "hook", "kicker": "ВНЖ на учёбу · Словакия", "text": "Получил словацкий ВНЖ? Сейчас начнутся три срока.", "sub": "О них обычно узнают слишком поздно."},
    {"type": "big", "word": "3 · 3 · 30"},
    {"type": "list", "title": "После приезда", "items": [
        {"ic": "3", "text": "рабочих дня — сообщить о начале пребывания в полицию (если подавал в посольстве)"},
        {"ic": "3", "text": "рабочих дня после получения карты — оформить медстраховку"},
        {"ic": "30", "text": "дней после получения карты — медсправка, не старше 30 дней"}]},
    {"type": "source", "text": "По официальным правилам", "pills": ["IOM Slovakia", "Euraxess 2026"]},
], [(0, 3.5), (3.5, 5.5), (5.5, 12), (12, 14.5)])

# 02 · the 90-day trap (criminal record, police decision)
V["02-ninety-day-trap"] = video(19, [
    {"type": "hook", "text": "Got your criminal record in June? By October it may be too old.", "sub": "Slovak student permit"},
    {"type": "big", "word": "90 days", "sub": "the number that keeps coming back"},
    {"type": "list", "tone": "pain", "title": "Slovakia, non-EU students", "items": [
        {"ic": "!", "text": "Criminal record: no older than 90 days when you file"},
        {"ic": "!", "text": "From every country where you lived 90+ days in 6 months in a row, in the last 3 years"},
        {"ic": "!", "text": "The police may take up to 90 days to decide"}]},
    {"type": "card", "title": "Count back from your start date", "tag": "Example", "rows": [
        {"k": "To have a decision by", "v": "1 Sep 2027", "tone": "cyan"},
        {"k": "Police decision: up to", "v": "90 days"},
        {"k": "File by", "v": "3 Jun 2027", "tone": "ok"}]},
], [
    {"type": "hook", "text": "Справку о несудимости взял в июне? К октябрю она может устареть.", "sub": "ВНЖ на учёбу в Словакии"},
    {"type": "big", "word": "90 дней", "sub": "число, которое повторяется"},
    {"type": "list", "tone": "pain", "title": "Словакия, студенты вне ЕС", "items": [
        {"ic": "!", "text": "Справка о несудимости — не старше 90 дней на дату подачи"},
        {"ic": "!", "text": "Из каждой страны, где жил 90+ дней за 6 месяцев подряд за последние 3 года"},
        {"ic": "!", "text": "Полиция может решать до 90 дней"}]},
    {"type": "card", "title": "Считай назад от даты начала", "tag": "Пример", "rows": [
        {"k": "Решение нужно к", "v": "1 сен 2027", "tone": "cyan"},
        {"k": "Решение полиции: до", "v": "90 дней"},
        {"k": "Подать до", "v": "3 июн 2027", "tone": "ok"}]},
], [(0, 3.5), (3.5, 5.5), (5.5, 11.5), (11.5, 15.5)])

# 03 · medicine deadlines 2027/28 (verified programmes)
V["03-medicine-deadlines"] = video(19, [
    {"type": "hook", "kicker": "Medicine · 2027/28", "text": "Medicine in Czechia or Slovakia? The deadline is not in summer.", "sub": "It's February."},
    {"type": "card", "title": "Application deadlines, verified", "rowStep": .55, "rows": [
        {"k": "Bratislava · in English", "small": "Comenius University", "v": "21 Feb"},
        {"k": "Martin · Slovak or English", "small": "Comenius, Jessenius Faculty", "v": "28 Feb"},
        {"k": "Prague · Hradec Králové", "small": "Charles University", "v": "28 Feb"},
        {"k": "Brno", "small": "Masaryk University", "v": "28 Feb"},
        {"k": "Olomouc", "small": "Palacký University", "v": "15 Mar", "tone": "cyan"},
        {"k": "Pilsen · in English", "small": "Charles University", "v": "30 Apr", "tone": "ok"}]},
    {"type": "source", "text": "Each date from the faculty's 2027/28 rules", "pills": ["Official page", "Check date"]},
], [
    {"type": "hook", "kicker": "Медицина · 2027/28", "text": "Медицина в Чехии или Словакии? Срок подачи — не летом.", "sub": "А в феврале."},
    {"type": "card", "title": "Сроки подачи, проверено", "rowStep": .55, "rows": [
        {"k": "Братислава · на английском", "small": "Университет Коменского", "v": "21 фев"},
        {"k": "Мартин · словацкий или англ.", "small": "Коменского, факультет Есениуса", "v": "28 фев"},
        {"k": "Прага · Градец-Кралове", "small": "Карлов университет", "v": "28 фев"},
        {"k": "Брно", "small": "Университет Масарика", "v": "28 фев"},
        {"k": "Оломоуц", "small": "Университет Палацкого", "v": "15 мар", "tone": "cyan"},
        {"k": "Пльзень · на английском", "small": "Карлов университет", "v": "30 апр", "tone": "ok"}]},
    {"type": "source", "text": "Каждая дата — из правил факультета на 2027/28", "pills": ["Официальная страница", "Дата проверки"]},
], [(0, 3.5), (3.5, 12.5), (12.5, 15.5)])

# 04 · working while studying in Slovakia + card fees
V["04-work-while-studying"] = video(17, [
    {"type": "hook", "text": "Studying in Slovakia — can you also work?", "sub": "Short answer: yes, with a limit."},
    {"type": "big", "word": "80 h", "sub": "a month for university students, without changing the purpose of residence"},
    {"type": "card", "title": "Student permit, the costs", "rows": [
        {"k": "Residence card in 30 days", "v": "€10"},
        {"k": "Residence card in 2 working days", "v": "€39"},
        {"k": "Separate application fee for study", "v": "none listed", "tone": "ok"}]},
], [
    {"type": "hook", "text": "Учишься в Словакии — можно ли работать?", "sub": "Коротко: да, но с лимитом."},
    {"type": "big", "word": "80 ч", "sub": "в месяц для студентов вуза, без смены цели пребывания"},
    {"type": "card", "title": "ВНЖ на учёбу: сколько стоит", "rows": [
        {"k": "Карта ВНЖ за 30 дней", "v": "€10"},
        {"k": "Карта ВНЖ за 2 рабочих дня", "v": "€39"},
        {"k": "Отдельный сбор за заявление на учёбу", "v": "не указан", "tone": "ok"}]},
], [(0, 3.5), (3.5, 8), (8, 13.5)])

# 05 · translation gotcha
V["05-translation-gotcha"] = video(17, [
    {"type": "hook", "text": "Translated your documents at home? There's a catch.", "sub": "Slovak student permit"},
    {"type": "list", "title": "Foreign documents for Slovakia", "items": [
        {"ic": "1", "text": "Apostille, or superlegalisation where the apostille does not apply"},
        {"ic": "2", "text": "Official translation into Slovak (or Czech)"},
        {"ic": "!", "text": "Translated abroad? A Slovak embassy or consulate must confirm it"},
        {"ic": "✓", "text": "Translated in Czechia? No confirmation needed"}]},
    {"type": "source", "text": "From the official rules", "pills": ["IOM Slovakia", "Checked Oct 2026"]},
], [
    {"type": "hook", "text": "Перевёл документы дома? Есть подвох.", "sub": "ВНЖ на учёбу в Словакии"},
    {"type": "list", "title": "Иностранные документы для Словакии", "items": [
        {"ic": "1", "text": "Апостиль или консульская легализация, если апостиль не действует"},
        {"ic": "2", "text": "Официальный перевод на словацкий (или чешский)"},
        {"ic": "!", "text": "Переводил за границей? Его должно заверить посольство или консульство Словакии"},
        {"ic": "✓", "text": "Перевод сделан в Чехии? Заверять не нужно"}]},
    {"type": "source", "text": "По официальным правилам", "pills": ["IOM Slovakia", "Проверено окт 2026"]},
], [(0, 3.5), (3.5, 11), (11, 13.5)])

# 06 · computer science in Slovakia
V["06-cs-slovakia"] = video(18, [
    {"type": "hook", "kicker": "Computer science · Slovakia", "text": "What it really takes to apply for computer science in Slovakia", "sub": "2027/28, bachelor's"},
    {"type": "card", "title": "Apply by 31 March 2027", "rows": [
        {"k": "Žilina · UNIZA FRI", "small": "taught in Slovak", "v": "fee €20"},
        {"k": "Bratislava · STU FIIT", "small": "taught in Slovak", "v": "fee €30"},
        {"k": "Bratislava · Comenius FMFI", "small": "one fee for up to 3 programmes", "v": "3 in 1", "tone": "ok"}]},
    {"type": "list", "tone": "pain", "title": "The part people miss", "items": [
        {"ic": "!", "text": "UNIZA: foreign applicants pass its Slovak test at B1 (applicants from Czechia exempt)"}]},
], [
    {"type": "hook", "kicker": "Информатика · Словакия", "text": "Что на самом деле нужно, чтобы подать на информатику в Словакии", "sub": "2027/28, бакалавриат"},
    {"type": "card", "title": "Подать до 31 марта 2027", "rows": [
        {"k": "Жилина · UNIZA FRI", "small": "на словацком", "v": "сбор €20"},
        {"k": "Братислава · STU FIIT", "small": "на словацком", "v": "сбор €30"},
        {"k": "Братислава · Коменского FMFI", "small": "один сбор — до 3 программ", "v": "3 в 1", "tone": "ok"}]},
    {"type": "list", "tone": "pain", "title": "Что часто упускают", "items": [
        {"ic": "!", "text": "UNIZA: иностранцы сдают её тест по словацкому на B1 (кроме абитуриентов из Чехии)"}]},
], [(0, 3.5), (3.5, 10.5), (10.5, 14.5)])

# 07 · plan backwards from the start date (Slovakia)
V["07-plan-backwards"] = video(17, [
    {"type": "hook", "text": "When do you file for a Slovak student permit?", "sub": "Not when you think."},
    {"type": "text", "text": "Count back from the day you need the decision.", "sub": "The police may take up to 90 days."},
    {"type": "card", "title": "Example", "tag": "Example", "rows": [
        {"k": "Decision needed by", "v": "1 Sep 2027", "tone": "cyan"},
        {"k": "File by", "v": "3 Jun 2027", "tone": "ok"},
        {"k": "Criminal record issued no earlier than", "v": "5 Mar 2027"}]},
], [
    {"type": "hook", "text": "Когда подавать на словацкий ВНЖ на учёбу?", "sub": "Раньше, чем кажется."},
    {"type": "text", "text": "Считай назад от дня, к которому нужно решение.", "sub": "Полиция может решать до 90 дней."},
    {"type": "card", "title": "Пример", "tag": "Пример", "rows": [
        {"k": "Решение нужно к", "v": "1 сен 2027", "tone": "cyan"},
        {"k": "Подать до", "v": "3 июн 2027", "tone": "ok"},
        {"k": "Справка о несудимости выдана не раньше", "v": "5 мар 2027"}]},
], [(0, 3.5), (3.5, 7.5), (7.5, 13.5)])

# 08 · Slovakia vs Czechia student permit
V["08-sk-vs-cz"] = video(18, [
    {"type": "hook", "text": "Student permit: Slovakia or Czechia?", "sub": "Same goal. Different rules."},
    {"type": "card", "title": "Slovakia", "rows": [
        {"k": "Decision", "v": "up to 90 days"},
        {"k": "Criminal record", "v": "≤ 90 days old"},
        {"k": "Residence card", "v": "€10 / €39"}]},
    {"type": "card", "title": "Czechia", "rows": [
        {"k": "Decision", "v": "up to 60 days", "tone": "cyan"},
        {"k": "Documents", "v": "≤ 180 days old", "tone": "cyan"},
        {"k": "Fee", "v": "CZK 2,500", "tone": "cyan"}]},
    {"type": "source", "text": "From the official portals", "pills": ["IOM Slovakia", "ipc.gov.cz"]},
], [
    {"type": "hook", "text": "ВНЖ на учёбу: Словакия или Чехия?", "sub": "Цель одна. Правила разные."},
    {"type": "card", "title": "Словакия", "rows": [
        {"k": "Решение", "v": "до 90 дней"},
        {"k": "Справка о несудимости", "v": "≤ 90 дней"},
        {"k": "Карта ВНЖ", "v": "€10 / €39"}]},
    {"type": "card", "title": "Чехия", "rows": [
        {"k": "Решение", "v": "до 60 дней", "tone": "cyan"},
        {"k": "Документы", "v": "≤ 180 дней", "tone": "cyan"},
        {"k": "Сбор", "v": "2 500 крон", "tone": "cyan"}]},
    {"type": "source", "text": "По официальным порталам", "pills": ["IOM Slovakia", "ipc.gov.cz"]},
], [(0, 3), (3, 7.5), (7.5, 12), (12, 14.5)])

# 09 · February is closer than you think
V["09-february"] = video(16, [
    {"type": "hook", "text": "Applying for 2027/28? Some deadlines are in February.", "sub": "Slovakia and Czechia"},
    {"type": "big", "word": "16", "sub": "of 55 verified programmes close in February 2027"},
    {"type": "list", "tone": "ok", "title": "Before you start", "items": [
        {"ic": "✓", "text": "Find your programme's date"},
        {"ic": "✓", "text": "Check the language and the fee"},
        {"ic": "✓", "text": "Open the faculty's official page"}]},
], [
    {"type": "hook", "text": "Поступаешь на 2027/28? Часть сроков — в феврале.", "sub": "Словакия и Чехия"},
    {"type": "big", "word": "16", "sub": "из 55 проверенных программ закрывают приём в феврале 2027"},
    {"type": "list", "tone": "ok", "title": "Перед стартом", "items": [
        {"ic": "✓", "text": "Найди дату своей программы"},
        {"ic": "✓", "text": "Проверь язык обучения и сбор"},
        {"ic": "✓", "text": "Открой официальную страницу факультета"}]},
], [(0, 3.5), (3.5, 7.5), (7.5, 12.5)])

# 10 · EU passport vs non-EU passport (Slovakia, study)
V["10-passport"] = video(19, [
    {"type": "hook", "text": "Same university. Different passport. Different paperwork.", "sub": "Studying in Slovakia"},
    {"type": "card", "title": "EU, EEA or Swiss passport", "rows": [
        {"k": "Report where you stay", "small": "unless your dorm or hotel does it", "v": "10 working days", "tone": "ok"},
        {"k": "Register after 3 months", "small": "at the Foreign Police", "v": "within 30 days", "tone": "ok"},
        {"k": "Registration fee", "v": "free", "tone": "ok"}]},
    {"type": "card", "title": "Any other passport", "rows": [
        {"k": "Temporary residence for study", "v": "permit"},
        {"k": "Police decision", "v": "up to 90 days"},
        {"k": "Criminal record, apostille, translation", "v": "needed"}]},
], [
    {"type": "hook", "text": "Один вуз. Разные паспорта. Разные документы.", "sub": "Учёба в Словакии"},
    {"type": "card", "title": "Паспорт ЕС, ЕЭЗ или Швейцарии", "rows": [
        {"k": "Сообщить, где живёшь", "small": "если общежитие или отель не сделали это сами", "v": "10 раб. дней", "tone": "ok"},
        {"k": "Регистрация после 3 месяцев", "small": "в полиции по делам иностранцев", "v": "в течение 30 дней", "tone": "ok"},
        {"k": "Сбор за регистрацию", "v": "бесплатно", "tone": "ok"}]},
    {"type": "card", "title": "Любой другой паспорт", "rows": [
        {"k": "ВНЖ на учёбу", "v": "нужен"},
        {"k": "Решение полиции", "v": "до 90 дней"},
        {"k": "Несудимость, апостиль, перевод", "v": "нужны"}]},
], [(0, 3.5), (3.5, 9.5), (9.5, 15.5)])

here = pathlib.Path(__file__).parent
(here / "scripts.json").write_text(json.dumps(V, ensure_ascii=False, indent=1) + "\n")
print("videos:", len(V))
