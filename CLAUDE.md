@AGENTS.md

# DocRoute — постоянные правила для Claude

DocRoute — бесплатная некоммерческая бета для планирования переезда в Европу
(учёба, работа, семья, бизнес). Владелец — не программист: говори по-русски и
объясняй его действия по шагам. Текущее состояние, план и история — в
`docs/STATUS.md` (файл большой, читай только через grep/sed).

## Ветки, PR и мерж

- Любая работа — в отдельной ветке и PR. Проверяй тесты и Vercel Preview,
  присылай прямую ссылку на Preview.
- В main мержи ТОЛЬКО после явного «мержим» / «мердж» / «мерджи» /
  «сделай мердж» от владельца. Перед мержем обнови `docs/STATUS.md`.
- Создание PR: `gh api repos/SleymZ/docroute-student/pulls --input <json>`.
  Мерж: `PUT .../pulls/N/merge` с `merge_method=squash` и `sha=<head>`.
- Статус Vercel: `gh api .../commits/<sha>/status`. Ссылка Preview:
  `deployments?sha=<sha>` → `statuses` → `environment_url`.
- `git push` медленный (timeout 300000). Удалять ветки через API прокси не даёт.
- При 403 на push вызови `add_repo SleymZ/docroute-student` с доступом push.

## Ревью

- Комментарии: `gh api repos/SleymZ/docroute-student/pulls/N/comments` и
  `.../issues/N/comments`. Исправляй обоснованное.
- Codex сам смотрит только первый коммит. После следующих пиши
  «@codex review» и жди комментарий с совпадающим `commit_sha` и
  `"status":"completed"`.
- Vercel и Codex жди одним bash-циклом.

## Стопки PR

- Мержатся по порядку; base переводится на main через PATCH.
- После squash: `git rebase --onto origin/main <старый head предыдущей> <ветка>`,
  проверь дерево, `git push --force-with-lease=<ветка>:<старый sha>`,
  дождись `mergeable=true` и зелёного Vercel.

## Экономия токенов

- Shallow clone в /tmp.
- Большие файлы (`top-*.ts`, `universities.json`, `pending-programs*.ts`,
  `docs/STATUS.md`) — только grep/sed.
- `top-*` правь Python-скриптами (один JSON на университет в строке) и
  обновляй `checkedAt`.
- Без промежуточных отчётов по мелочам. Итог коротко: что сделано, ссылка на
  Preview, что владельцу проверить.

## Тесты и типы

- `npm test` — все тесты (`tests/*.test.ts`) через встроенный в Node
  strip-types и loader `scripts/test-loader/` (алиас `@/`, разрешение
  `.ts/.tsx/.json`). Для другого корня задай `REPO_ROOT`.
- Типы: глобальный `tsc`; игнорируй TS2307/TS7016/TS7026/TS7006 и отсутствие
  типов React/Next.

## Визуальная проверка

- Локально `next build` + `next start` + headless google-chrome; все размеры
  экрана склеивай в одну картинку.
- Google Fonts в облаке недоступен: для локальной сборки временно подменяй
  Inter на `next/font/local` (`npm pack @fontsource-variable/inter`) и НЕ
  коммить подмену.
- Встроенный браузер — только для финальной проверки Preview.
- Цвета только `light-dark(светлый, тёмный)`, проверяй обе темы. Акцент сайта
  и логотипа `var(--coral)` (#d4502f / #ff795f). Шрифт Inter.

## SQL (Supabase)

- Перед работой загрузи skill `supabase-postgres-best-practices`.
- Проверяй на локальном Postgres 16 (`/usr/lib/postgresql/16/bin`, initdb от
  postgres в /var/tmp) с ролями anon/authenticated, заглушкой `auth.uid()` и
  схемой storage.
- Владельцу — SQL одним блоком, заканчивающимся `notify pgrst, 'reload schema';`,
  плюс отдельные проверочные блоки.

## Решения, которые нельзя менять

- Список подсвеченных стран на картах (SK, CZ, DE, AT, NL, PL, HU, HR, IT, FI,
  LT, IE, CH) и форму карты на входной странице не трогать.
- Входная страница `/` показывается только при первом визите (cookie
  `docroute-visited` или сессия Supabase → редирект на /home в `src/proxy.ts`).
  На ней только Log in и «Start your journey».
- Логотип: глобус с Европой, самолёт, дуга (`src/components/Logo.tsx`),
  «Doc» цветом текста, «Route» коралловым.
- Данные: правила 2027/28, если есть, иначе 2026/27. По каждому университету и
  направлению либо проверенный маршрут, либо «скоро», не оба. Никакой
  конвертации оценок. «Скоро» никогда не попадает в подбор по профилю.
- Истории с премодерацией; модераторов добавляет только владелец через SQL.
- Страны без проверенного маршрута ВНЖ: только официальные ссылки, без сумм и
  сроков. Гражданство: только официальные источники, без сумм и сроков.
- Доступ: гость / Free / Plus — таблица в `docs/ACCESS.md` (решение
  2026-11-05). Гость смотрит только университеты и истории, любой маршрут
  сразу просит регистрацию. Free — короткий план без дат, PDF/PNG, напоминаний
  и My route. Plus — всё. Меняется только по решению владельца.
- «Мой маршрут» только с регистрацией и Plus, один на аккаунт.
- Владелец не назван на сайте; контакт `contactEmail = "docroutestu@gmail.com"`
  (решение 2026-11-08), `isCommercial: false`.
