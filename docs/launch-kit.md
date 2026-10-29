# Запуск беты: пост, интервью, демо-видео

Рабочие материалы владельца на 9–30 ноября 2026. Перед публикацией
проверь, что всё перечисленное в посте есть на сайте (ссылки, маршруты).

## 1. Пост для чатов (9–15 ноября)

### Русский (основной)

> Привет! Я студент, живу в Словакии. Сам прошёл через поступление и ВНЖ и
> сделал бесплатный сайт, который собирает это в один маршрут:
> **DocRoute** — https://docroute-student.vercel.app
>
> Что он умеет сейчас:
> • учёба в Словакии (информатика, Жилинский университет, 2027/28) и в
>   Чехии (Карлов университет, Informatika) — какие условия поступления
>   подходят именно тебе;
> • ВНЖ на учёбу и работу в Словакии и Чехии: какие документы, где подавать
>   и до какой даты каждый шаг (вводишь дату переезда — получаешь сроки);
> • если у тебя уже словацкий ВНЖ на учёбу — где подавать на чешский;
> • у каждого правила ссылка на официальный источник и дата проверки.
>
> Это бета, без рекламы, регистрация не нужна. Мне очень поможет обратная
> связь: внизу каждого маршрута есть короткая анонимная форма. И если
> готов(а) 15 минут поговорить о том, как ты собирал(а) документы, —
> напиши мне в личку 🙏
>
> Важно: это не юридическая консультация, решения принимают вуз и МВД.

### English (short)

> Hi! I'm a student living in Slovakia and built a free tool for moving to
> Slovakia or Czechia to study or work: **DocRoute** —
> https://docroute-student.vercel.app
> It builds one route with the documents you need, where to file them and a
> deadline for each step, with an official source and check date for every
> rule. Free beta, no sign-up needed. Feedback form at the end of each route;
> if you'd talk to me for 15 minutes about your own paperwork, please DM me.
> Not legal advice: universities and authorities decide.

Куда постить: чаты иностранных студентов UNIZA, UK (Карлов), STU, общие
чаты «учёба в Словакии/Чехии», группы абитуриентов из Украины, Казахстана,
Узбекистана, Индии. Читай правила чата: где-то реклама запрещена — тогда
спроси админа.

## 2. Интервью (10–20 человек, по 15 минут)

Цель — понять, есть ли боль, за которую платят, а не похвалить сайт.
Не показывай сайт до конца первых вопросов.

1. Расскажи, как ты поступал(а) / оформлял(а) ВНЖ. С чего начал(а)?
2. Что было самым сложным или заняло больше всего времени?
3. Была ли ошибка или почти ошибка (просроченный документ, не то место
   подачи)? Чего она стоила?
4. Где ты искал(а) информацию? Платил(а) ли кому-то (агентству, юристу,
   переводчику)? Сколько?
5. *(Теперь покажи свой маршрут на сайте.)* Что здесь понятно, а что нет?
   Чего не хватает?
6. Если бы полный маршрут с напоминаниями и проверкой документов стоил
   X €, ты бы заплатил(а) тогда? Почему да / нет?
7. Кого ещё мне стоит спросить?

Записывай коротко: возраст/страна, этап (абитуриент / уже в ЕС), 3 главные
боли, готовность платить (да/нет/сумма). Не записывай имена и контакты в
общие документы.

**Решение 16 ноября:** смотри число записей в листе ожидания (Supabase →
Table Editor → `waitlist_signups`), отзывы (`feedback`) и ответы на вопрос 6.
Ориентир для «да»: несколько человек сами назвали сумму и болезненную
ошибку, а не просто «интересно».

## 3. Сценарий демо-видео (23–30 ноября, 90 секунд)

Запись экрана + голос, на английском (для портфолио), субтитры.

| Время | Экран | Текст |
| --- | --- | --- |
| 0–10 с | Главная, карта | "Moving to Europe to study means combining university rules, immigration law and deadlines that depend on each other. I built DocRoute to put them in one route." |
| 10–30 с | Build my route → профиль (UA, словацкая школа) → результат UNIZA | "I enter my profile once. DocRoute checks it only against rules verified for this exact faculty, degree and year, and marks what is met, missing or unclear." |
| 30–50 с | Preview Route → планировщик, дата переезда | "When I pick the date I need to be there, it calculates the latest filing date and the window for each document, using real processing times and Slovak public holidays." |
| 50–65 с | Наведение на источник у требования | "Every rule shows its official source and the date I checked it. If a rule is ambiguous, the route says ask the faculty instead of guessing." |
| 65–80 с | Чехия: словацкий ВНЖ → где подавать; Save as PDF | "It also covers harder cases, like a Slovak study-permit holder applying in Czechia, and the whole route can be saved as a PDF." |
| 80–90 с | README / тесты / Privacy | "It's a free beta built with Next.js and Supabase, with 180+ tests and privacy by design. Feedback from real students decides what comes next." |

Перед записью: светлая тема, окно 1280×800, без закладок и личных вкладок,
cookie-баннер закрыт («Necessary only»).
