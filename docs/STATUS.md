# DocRoute — project status

Last updated: 2026-11-08 (launch review). Keep this file factual: describe what exists and
what was actually checked, not plans presented as done.

## What the product is

DocRoute (renamed from "DocRoute Student" on 2026-10-23) helps a person
move to a European country with one personal, source-linked route. It serves
three groups:

- students who need a university matched to their profile;
- people moving from abroad who need to know which documents they need and
  by when (deadline planner);
- students already in Europe looking for requirements and deadlines
  (Explore).

Purposes with a route today: **study**, **work**, **family** and
**business** (family and business: Slovakia, PR #28; source-linked
checklists for Czechia family/business and Austria work/family/business,
page `/route/guide`, 2026-10-30).

- **Work route** (`/route/work`, "Work" on the home form): six questions
  (citizenship, current status, job offer, Slovak diploma, EU Blue Card
  conditions, shortage occupation) pick the procedure — single permit, EU
  Blue Card or Slovak-graduate exemption — and build four stages: job offer
  → work authorisation (employer + Labour Office) → residence application →
  duties after approval. Includes progress ticks and a start-date deadline
  planner. Answers live in the URL (page is noindex); no account needed.
- **Explore** is a public university directory (no account needed).
- **Top 100** (`/explore/top`, linked from the Explore hero): Europe's 100
  universities with the most top-10%-cited papers, with bachelor's
  admission facts for non-EU applicants (reference only, see below).
- **How it works** (`/how-it-works`, the header button) explains the four
  steps, the three labels (verified / rules awaiting approval / review
  pending), the match statuses, the sourcing rules and current coverage.
  Coverage on that page is computed from the data files, so it stays in
  sync.
- **Build my route** collects an applicant profile, matches it against
  verified programs and builds a Preview Route (application → admission →
  enrolment → residence) with progress tracking.
- **Deadline planner** (Preview Route): the person enters a move date and
  gets dates for the residence steps (file ≥ 90 days before, criminal-record
  window, apostille/translation, arrival report within 3 working days).
  The date is kept in the URL as `move=YYYY-MM-DD`.
- The university always makes the admission decision. DocRoute never shows
  admission percentages or reuses rules from another field, degree or year.

## Production

- Site: https://docroute-student.vercel.app (Vercel, built from `main`).
- Every PR gets a Vercel Preview; Previews require a Vercel login.
- Backend: Supabase project `klhvbgewmmadizvsdtcg` (Auth, Postgres, RLS).
  Tables: `applicant_profiles`, `saved_universities`, `route_task_progress`,
  `confirmed_routes` (after migration `20261103120000`), `story_photos`,
  `story_comments`, `story_likes` (after migration `20261104120000`),
  `waitlist_signups`, `feedback`, `public_profiles`, `success_stories`,
  `story_moderators`;
  Storage buckets `avatars` (public) and `story-photos` (private). Functions: `delete_my_account()` (migration
  `20261028150000`, redefined in `20261028180000`), `leave_waitlist(email)`,
  `is_story_moderator()`, `moderate_story(id, status, reviewed_at)`.
- Migration `20261031120000_story_moderators.sql` was run on production
  (2026-10-31) and the owner's moderator account was added by SQL. The
  owner checked on production (2026-11-01): publishing a story on
  `/stories/review`, editing a story and uploading an avatar all work.

## Launch review 2026-11 (2026-11-08, before the 9 November beta)

Full review of main at #62 (not #58: #59–#62 were merged since). Report:
"DocRoute: готовность к запуску" (https://claude.ai/artifact/HNXGBmYj5F1LL9691kwoaM).

How it was checked: local build + headless Chrome; 200 pages each as guest,
Free and Plus (plans faked locally, not committed); 46 Free and 23 Plus
end-to-end scenarios (study via profile → universities → university →
route for SK/CZ × 4 fields; work, family, business, Czechia study/work for
passports RU, BY, UA, IN, CN, ZZ); light/dark, 1280 px and 390 px; 1,065
official links checked from GitHub Actions; RLS read from migrations;
secrets searched in code and all 291 commits. No crashes, console errors,
horizontal scroll, secrets, verified-and-coming-soon overlaps or past
deadlines in verified programmes. Free locks steps, dates, PDF/PNG and My
route; Plus opens everything.

PRs opened, each with tests, green Vercel and a clean Codex review; all
merged 2026-11-08 on the owner's «мерджи» (#68 and #71 rebased, translation
catalogs merged key by key):

| PR | What |
| --- | --- |
| #63 | `scripts/check-links.mjs` + weekly workflow: every official link (text and helper-built), report as PR comment / issue |
| #64 | Flags from `public/flags` (flag-icons, MIT) instead of flagcdn.com, which the Privacy Policy did not list |
| #65 | `not-found.tsx` and `error.tsx` with the header, both themes, 4 languages |
| #66 | `aria-label` on the sign-in password field |
| #67 | 8 dead official links replaced (Austrian registration, Chinese certificates, Vienna ×2, Cologne, NKUA, Cattolica, AUBG); AUBG fall 2027 deadlines corrected to 15 Jan / 15 Mar / 15 May |
| #68 | `src/lib/auth-errors.ts`: plain translated sign-in errors; `/auth?error=` shows only fixed sentences |
| #69 | Security headers (frame-ancestors/X-Frame-Options, nosniff, Referrer-Policy, Permissions-Policy) |
| #70 | This section |
| #71 | Any country: `applicantCountryOptions` = 243 countries and inhabited territories (residence, education, "moved from", home "Documents issued in" now a searchable `CountryPicker variant="inline"`); `citizenshipCountryOptions` = 201 nationalities, `DEPENDENT_TERRITORIES` never a citizenship (`isCitizenshipCode` in every route parser); pickers sort in the site language; country names in ru/es/zh/hi from CLDR. Language switcher: flag + name button, listbox with flags (`LOCALE_FLAGS`: en GB, ru RU, es ES, zh CN, hi IN) |

Open (owner decision or action):

1. **Blocker:** Supabase's built-in email sends only to project team
   members, 2 an hour. Test sign-up with an outside address; if no email
   arrives, either Google-only sign-in for the beta or custom SMTP.
2. **Blocker (GDPR Art. 13):** contact mailbox decided 2026-11-08:
   docroutestu@gmail.com (`legalInfo.contactEmail`, separate PR). Operator
   name still open.
3. Locked Free steps are in the public JS chunks (blocker for selling Plus;
   needs server-built routes, 3–5 days).
4. No spam limit on waitlist/feedback inserts; no error monitoring; ~1.7–2.4
   MB JS per page (world-atlas 50m map ≈ 800 KB; map shape is locked);
   Vercel Analytics must be enabled in the project; 162 links refuse robots
   (open by hand).
5. Minor: no OG image, sitemap without /explore/top and university pages,
   no skip link, /favicon.ico 404, default Next SVGs in /public.

Payment needs: trade licence (IČO), provider (merchant of record such as
Paddle/Lemon Squeezy vs Stripe), sale terms with the 14-day withdrawal
waiver, seller identity on the site, Vercel Pro, server-built routes,
webhook → `account_plans` (`source = 'payment'`). Ads need: an IAB TCF
certified CMP, Cookie/Privacy updates, no ads on `/route/*` (answers are in
the address), own domain, AdSense account in the owner's name.

## Red passport warnings (2026-11-08)

- `RestrictionNote.severity` in `src/data/russia-belarus.ts`: "blocked"
  (applications not accepted except listed groups, `solution` = the groups),
  "restricted" (`solution` = the step that solves it), "info" (route step
  only). `passportWarnings()` feeds `src/components/PassportWarning.tsx`, a
  red box with the official source under the citizenship field and above
  the route (country pages, Czech routes, guides, full path, study profile,
  route preview).
- Czechia (Government Decree No. 55/2024, MZV page updated 2026-02-09):
  visa and residence applications from RU and BY citizens are not accepted
  except listed groups, also with a second citizenship. Blocked: CZ (RU,
  BY), EE (RU), LT (RU). Restricted: FI, LV, PL, CZ biometric passports
  (RU), EE short-term work (BY).
- War and crisis passports, Czechia (`src/data/embassy-access.ts`, MZV
  territorial districts + local competence, read 2026-11-08): AF, SY, YE,
  SD, SS, SO, LY, PS, ER, HT, MM, ML, BF, NE, CF, KP get a "restricted"
  warning and a route step naming the Czech embassy abroad that takes their
  applications (e.g. AF → Islamabad), plus the 2-year residence alternative
  outside Schengen (inside Schengen: only the Dresden visa centre).
  Venezuela is left out (may apply at any Czech embassy).
- Sweep of all passports, 2026-11-08 (official sources only):
  - Russia, every Schengen destination (`SCHENGEN` in russia-belarus.ts;
    not IE, CY): single-entry Schengen visas and enhanced checks since
    2025-11-07 (Commission decision), non-acceptance of passports issued in
    occupied regions of Ukraine and Georgia (Decision (EU) 2022/2512), and
    non-biometric passports refused by more and more countries (Latvian MFA
    + EU table). Slovakia itself has no national restriction (MZV SR states
    its visa policy is unchanged).
  - Russia, national: SE and LV refuse non-biometric passports; DK's
    embassy in Moscow takes no visa or residence applications.
  - The Gambia, every Schengen destination: Council Implementing Decision
    (EU) 2021/1781 (still in force; only the fee increase was repealed).
    Ethiopia's measures were repealed 2026-05-18; Vanuatu is simply on the
    EU visa list (Regulation (EU) 2025/11).
- Not covered yet: Slovakia and the other destinations for these passports
  (no official list of competent embassies found; each country page would
  need checking).
## Email from docroutestu@gmail.com (2026-11-08)

- Owner decision: the site's mailbox docroutestu@gmail.com is the contact
  (`legalInfo.contactEmail`, #72) and the sender of every email.
- `scripts/send-plus-email.mjs` sends through Gmail SMTP (`nodemailer`,
  smtp.gmail.com:465, user = the mailbox) when `SMTP_PASS` holds a Google
  app password; Reply-To is the mailbox. Resend stays as a fallback
  (`RESEND_API_KEY` + `MAIL_FROM`, needs an own domain). Gmail allows about
  500 messages a day.
- Sign-in emails (confirmation, password reset) are sent by Supabase Auth:
  the owner sets Authentication → Emails → SMTP Settings → Enable custom
  SMTP: sender docroutestu@gmail.com, name DocRoute, host smtp.gmail.com,
  port 465, username docroutestu@gmail.com, password = the app password;
  then Authentication → Rate Limits → emails per hour (30 by default with
  custom SMTP). This removes launch blocker 1 (built-in email reaches only
  team members, 2 an hour).
## Passport label on every route (2026-11-08)

- `src/components/PassportBadge.tsx`: flag + "Route for citizens of
  {country}" + "Visa, documents and restrictions on this page are checked
  for this citizenship", under the header of every route (Slovak work,
  family, business; Czech routes; country guides; full study path; study
  route preview). Name from `regionName()`, the same as the passport stage.

## Verified coverage

| Area | Coverage | Checked |
| --- | --- | --- |
| Admission | Slovakia · Computer Science · Bachelor · 2027/28 · UNIZA FRI, 4 programs (`src/data/verified-programs.ts`) | 2026-10-19 |
| Study residence | Slovakia, third-country citizens (`src/data/slovakia-residence.ts`) | 2026-10-23 |
| Admission | Czechia · Computer Science · Bachelor · 2027/28 · Charles University MFF, Informatika (Czech-taught), policy `cuni-mff-bachelor-2027` | 2026-10-28 |
| Admission | Czechia · Computer Science · Bachelor · 2027/28 · ČVUT FIT, Informatika (Czech-taught), policy `cvut-fit-bachelor-2027` | 2026-10-29 |
| Coming soon (not verified) | Computer Science · Bachelor · 2027/28 (`src/data/pending-programs.ts`): Comenius FMFI (4 programs, rules awaiting approval), STU FIIT (Informatika) and TUKE FEI (5 programs), both "rules not published yet". Listed with last year's (2026/27) approved rules for orientation; no match, checklist or route | 2026-10-29 |
| Coming soon (not verified) | Medicine (long-cycle, MUDr./MDDr.) · 2027/28: Comenius LF Bratislava (2026/27 rules), Comenius JLF Martin (2027/28 rules published, "Rules published, route not built yet"), UPJŠ LF Košice (2026/27 rules, Slovak and English tracks). Germany: TUM Informatics bachelor (2026 cycle rules, standing aptitude statute); no German residence route | 2026-10-29 |
| Coming soon (not verified) | Czechia · Computer Science · Bachelor · 2027/28, rules already published ("Rules published, route not built yet"): VUT Brno FIT Informační technologie (SCIO 75th percentile or preferential admission), Masaryk FI (4 programs, TSP, waiver for Informatika). Next step: verify them into routes like Charles MFF | 2026-10-29 |
| Coming soon (not verified) | Austria: TU Wien Informatik, Uni Wien Informatik, JKU Artificial Intelligence (English), all with 2026/27 rules (2027 dates not out); MedUni Wien medicine via MedAT (expected 2027 dates published). Germany: KIT Informatik (standing rules, 15 July, €1,500 non-EU). No Austrian or German residence route. RWTH and LMU skipped: their pages did not give deadlines or requirements | 2026-10-29 |
| Coming soon (not verified) | Law and Economics & Business (new fields, PR #27): Comenius Faculty of Law, Právo bachelor (2026/27 rules); Charles University Faculty of Law and Masaryk Faculty of Law, Právo a právní věda (5-year long-cycle, 2027/28 rules published); EUBA framework (2026/27 rules) and VŠE Faculty of Economics (2026/27 rules). Czech medicine: Charles First Faculty of Medicine (2027/28 rules published) and Masaryk Faculty of Medicine (2026/27 handbook) | 2026-10-29 |
| Family residence | Slovakia, third-country citizens joining a non-EU relative with temporary/permanent residence or a Blue Card: spouse (both 18+), unmarried child under 18, dependent adult child, dependent parent (`src/data/slovakia-family-business.ts`, `src/lib/residence/slovakia-family-business.ts`, page `/route/family`) | 2026-10-29 |
| Business residence | Slovakia, third-country citizens: sole trader with a trade licence or company executive (page `/route/business`) | 2026-10-29 |
| Coming soon (not verified) | Europe (PR #29, `src/data/pending-programs-europe.ts`), 25 programmes: Netherlands (TU Delft CSE, TU/e CSE, Groningen Computing Science, Twente TCS, VU Computer Science; Erasmus IBEB, UvA Economics & Business; Groningen International & European Law), Poland (Warsaw UT CS & IS, AGH CS, Jagiellonian MD), Hungary (ELTE CS, BME Computer Engineering, Semmelweis and Szeged medicine, Corvinus), Czechia (Palacký Olomouc medicine in English), Croatia (Zagreb medicine in English), Italy (Padua medicine, IMAT), Finland (Aalto Science & Technology, Helsinki Science), Lithuania (Vilnius Software Engineering), Ireland (Trinity CS), Germany (Charité medicine), Austria (WU BBE). 14 with rules for the 2027 intake, the rest with the latest published rules | 2026-10-29 |
| Work residence | Slovakia, third-country citizens: single permit, EU Blue Card, Slovak graduates (`src/data/slovakia-work.ts`, `src/lib/residence/slovakia-work.ts`) | 2026-10-23 |
| Czech residence | Study (long-term residence permit for study or its extension), work (employee card, free access for Czech graduates, EU Blue Card), EU registration, permanent residents (`src/data/czechia-residence.ts`, `src/lib/residence/czechia.ts`, page `/route/czechia`) | 2026-10-28 |
| EU/EEA/Swiss residence | Slovakia: notice of stay, registration, optional card, duties, for study and work (`src/data/slovakia-residents.ts`) | 2026-10-28 |
| Current Slovak residents | Study residence (report new studies, gap, renewal), other purpose (change of purpose to study), permanent/long-term (no new application) | 2026-10-28 |
| Admission | Slovakia and Czechia · 2027/28 · Medicine 15, Law 7, Economics & Business 15, Computer Science +2 programmes (`src/data/verified-programs-fields.ts`, `src/data/verified-programs-sk-cz.ts`), policy `generic-2027` | 2026-11-05 |
| Other countries, fields, degrees, intakes | Not verified; shown as "Verification pending" | — |

The catalog (`src/data/universities.json`, 2,598 institutions in 46
countries, imported 2026-09-16 from Hipo) lists institutions only. It is not
evidence that a program exists or of its requirements.

On the home map Slovakia, Czechia, Germany and Austria (and the PR #29
countries plus Switzerland) are highlighted (Czechia for
its residence routes; Germany only for the TUM "coming soon" listing, owner
decision 2026-10-29 — no German residence or verified route; Austria the
same, for its coming-soon listings, PR #25).

## "Coming soon" programs

`src/data/pending-programs.ts` lists programs whose rules for the intake are
announced but not yet approved and published. They appear on results pages
(a "Coming soon" block), on the university page and on How it works, with
the label "Rules awaiting approval". They never go through `matchProgram`
and must not carry thresholds, dates or fees from a draft.

Reference rules (PR #23 renamed `previousCycle` to `referenceRules`): the
rules may also be the faculty's already published rules for the intake
itself (status `rules-published`, block "Published rules (2027/28), for
reference"; a test ties the two together). Medicine groups use
`degreeLevel: "long-cycle"` and are found from bachelor profiles. On the
university page each faculty with reference rules gets its own row of
three requirement cards.

Last year's rules (PR #21, owner decision 2026-10-29): a group may carry
`previousCycle`, the approved rules of the previous intake with their own
sources. They are shown in a "Last year's rules (2026/27), for orientation"
block (collapsed on results pages, open on the university page) with a
warning that they are not the rules for the intake and may change. The
matcher never reads them; tests check the intake is earlier, sources are on
the university's domain and program names exist. Replace the block when the
new rules are verified.

Comenius FMFI status (checked 2026-10-23, rechecked 2026-10-29: the
bachelor admission page, updated 21 Sep 2026, still describes 2026/27; the
2026/27 conditions were approved on 1 Dec 2025, so 2027/28 approval may come
around Nov–Dec 2026): the 2027/28 bachelor conditions
were item 4 of the Academic Senate session of 19 October 2026 as a draft
("návrh uznesenia"). No resolution was published, and the draft has two
different versions of Art. 2 (3)–(5) (which math tests are accepted; the
second also allows English-language tests such as SAT). The fee and
foreign-qualification recognition are not in the draft. The faculty's
applications page still shows 2026/27. When the approved 2027/28 rules
appear on https://fmph.uniba.sk/studium/prijimacie-konanie/bakalarske-studium/
(the old /prihlasky/ link is not reachable by the tools), move the group into
`verified-programs.ts` with its own matching policy (percentile/grade/
competition criteria differ completely from UNIZA's) and delete the
pending entry; a test fails if both exist.

Other Slovak computing faculties (PR #22, checked 2026-10-29): STU FIIT
and TUKE FEI still publish only their 2026/27 bachelor conditions (STU has
a university-wide 2027/28 admissions page, without FIIT rules). Both are
listed as "Rules not published yet" (`status: "rules-not-published"`) with
their 2026/27 rules: FIIT regulation 4/2025 of 18 Nov 2025 (better of
external maturita maths percentile or faculty exam, competition points,
3-year auto-admit 70+/reject <50, 4-year 50+/<35, Slovak B2 via ICV STU,
early exam for third-year pupils) and FEI TUKE 2026/27 conditions (deadline
30 Apr 2026, €20, no exam, points for grades/competitions/school type,
Slovak A1, planned intakes). FIIT's English-taught Informatics (fee-paying)
is not covered. The FIIT bachelor admission page and STU's schedule PDF
could not be opened by the tools.

## Recheck of listed universities (2026-10-30)

Rechecked on the universities' own sites; "2027/28 if published, else the
latest rules" (owner rule 2026-10-30):

- Now published for 2027/28 and updated: **STU FIIT** Informatika
  (regulation 2/2026 of 30 Sep 2026: two rounds to 30 Nov 2026 and
  31 Mar 2027, €30, external maturita maths percentile or faculty exam
  22 Jan / 16 Apr 2027 + competition points, 70+ admitted, <50 rejected, no
  school grades, Slovak B2 without SK/CZ maturita), **ELTE** CS BSc (portal:
  1 Feb – 30 Apr 2027, €150), **AGH** (Senate resolution 82/2026: WR formula,
  300-point minimum, foreign-certificate weights; fee and tuition still
  2026/27), **Vilnius** Software Engineering (portal opens 1 Dec 2026;
  portal deadline 1 Jul 2027 vs 1 May on the programme page; €4,800 vs €4,560).
- Gaps closed: FIT VUT application fee CZK 700 (EUR 28 from abroad, BUT
  admissions page, no year stated); Masaryk fees for procedures opened in
  2026/27 (= 2027/28 entry): FI CZK 900, LF CZK 900, Law CZK 850 (the CZK 800
  leaflet was older). JLF publisher typo fixed.
- Unchanged (still 2026/27 or no new data): Comenius FMFI (page updated
  21 Sep 2026, still 2026/27), TUKE FEI, LF UK Bratislava, UPJŠ LF, Comenius
  Law, VŠE NF, MU LF, TU Wien / Uni Wien / JKU (2026 procedures), TUM, KIT,
  Charité, WU BBE (2027/28 details "mid-November"), Zagreb, Padua, Warsaw UT
  (2027 dates "to be updated"), BME. JLF Martin, MedAT 2027, Charles PF and
  1. LF matched the stored data (Charles PF fee still not stated).
- Verified routes: Charles MFF and ČVUT FIT 2027 pages match the stored
  rules (MFF also now mentions 22 Oct 2027 for autumn maturita and a
  10-task, 75-minute exam). UNIZA FRI pages could not be opened by the tools
  this time (robots/allowlist); data from 2026-10-19/27 kept.
- Still not opened: FIT VUT directive 2/2026 (URL too long for the fetch
  tool), FIIT English-taught programme, UNIZA FRI rules page.

## EU-wide additions (2026-10-30, third batch, 30 listings)

- Coming soon, sources on each university's own site; "2027/28 if
  published, else latest". Published 2027/28: Bocconi BAI (sessions to
  26 Jan 2027, €17,700), KTU Informatics (1 Jun 2027, €4,201), AUBG (1 Mar /
  1 Jun, €7,100/semester), IE University CS & AI (rounds Sep 2026 – Mar
  2027), DCU (€23,800 non-EU 2027-28), Constructor University (to 31 Jul
  2027, €11,925/semester), STU FIIT English B-INFOxA (28 Feb 2027, maths
  test 12 Mar, €4,000 + €3,500), Tampere (7–21 Jan 2027), LSMU medicine
  (to 6 Jul 2027), Vilnius medicine (to 1 Jul 2027, €14,100), Galway, UCC
  (31 May 2027). Latest (2026/27 or undated): Luxembourg, Saarland, ITU
  Copenhagen, Malta, PoliTo, RTU (Liepāja), Babeș-Bolyai, Debrecen,
  Sapienza ACSAI, PJAIT, Jönköping, Milan/Pavia AI, Nicosia, University of
  Latvia, Wrocław medicine, Masaryk medicine in English, Limerick, Twente
  Business & IT.
- New countries without map highlight (owner rule): LU, DK, MT, LV, RO,
  BG, ES, SE, CY. Test host aliases added (aubg.edu, tuni.fi,
  constructor.university, unibocconi.it, ktu.edu, ju.se, pja.edu.pl,
  umw.edu.pl, lsmu.lt, saarland-informatics-campus.de).
- Not added: ČVUT FIT/FEL English and Charles MFF English (same university
  and field as a verified route; the data model allows only one), RSU Riga
  (not in the catalog), Óbuda, UPB, Primorska, SDU, Gdańsk, LUT, Maastricht
  DSAI (pages unreadable or without data).
- Supabase migration 20261029120000 confirmed on 2026-10-30: test feedback
  with route family-sk and business-sk was accepted from the Preview (two
  rows "TEST DocRoute … delete" in `feedback`).

## Second recheck and new listings (2026-10-30, "check 30 more")

- Rechecked against the universities' own pages, no changes needed: TU
  Delft, TU/e, Groningen (Computing Science, International and European
  Law), Erasmus IBEB, UvA EBE, Jagiellonian MD (exam line still shows
  "2027, 2026"), Semmelweis, Szeged, Corvinus, Palacký MD, Aalto, Helsinki,
  Trinity. Twente: matching events 12 Mar / 4 Jun 2027 added.
- New coming-soon listings (13): **UKF Nitra** FPVaI Aplikovaná
  informatika (2027/28 rules of 29 Sep 2026: 31 Mar 2027, €25, no exam,
  up to 40 points for the grade average of years 2–4 + 10 for activities;
  missing grades = no points, committee may admit conditionally), **UPJŠ**
  PF Informatika (2026/27: average ≤1.80), **STU FEI** Aplikovaná
  informatika (2026/27; 2027/28 Slovak testing only via July Group),
  **Pardubice** FEI Informační technologie (2027: to 31 May 2027, CZK 650,
  test 16 Jun or waiver with Czech maths maturita), **Mendel University**
  Otevřená informatika (2027 start, 200 places, deadline not on page),
  **TU Liberec** FM (2026/27), **ZČU** FAV (2026: average ≤1.5 or SCIO,
  Czech B2), **TU Graz**, **Innsbruck** (ordinance suspended 2026/27),
  **Salzburg** (2026/27), **Bern** and **Basel** (2026/27; Basel needs a
  Slovak university admission confirmation), **TalTech** Cyber Security
  Engineering (2027/28 calendar: third-country citizens by 22 Mar 2027;
  €3,500/semester non-EU). Estonia is not highlighted on the map (owner:
  map unchanged except Switzerland).
- Test host aliases: ttu.ee → taltech.ee, vslib.cz → tul.cz, sbg.ac.at →
  plus.ac.at.
- Not added (no usable data): VŠB-TUO FEI (only 2026/27 PDF links, not
  readable), UMB (page error), UHK FIM (only master pages found).

## Switzerland (added 2026-10-30)

- Coming soon, latest published rules (pages state no 2027 intake): **ETH
  Zurich** Informatik (1 Dec – 31 Mar, German C1 by 31 Mar, Slovak
  gymnázium maturita with 70% in maths/science/language plus a Slovak
  university admission certificate or the reduced entrance exam, CHF 2,190
  a semester for foreign students; ETH rules change from autumn 2028),
  **EPFL** Computer Science (mid-Nov – 30 Apr, CHF 150, French B2, ranking by
  general average, 3,000 first-year cap, CHF 2,190), **University of Zurich**
  Informatik (1 Jan – 30 Apr, 28 Feb with visa, CHF 150, German C1, semester
  fee CHF 1,220 + 59). No Swiss residence route.
- Map: Switzerland (756) added to the highlighted set (owner request); the
  other highlighted countries are unchanged.

## Top 100 universities (checked 2026-10-27, Leiden 2026 order 2026-11-04)

- Order: CWTS Leiden Ranking Open Edition 2026 (released 4 Nov 2026,
  OpenAlex snapshot of August 2026), region Europe, indicator P(top 10%),
  2021–2024, fractional counting, core publications, all sciences. Results
  are CC0 (Zenodo 10.5281/zenodo.23598718). Taken on 2026-11-04 from the
  ranking site's list for Europe (the same request the list view makes).
  QS, THE and ARWU positions are not shown: their terms do not allow
  republishing. CWTS ends the Traditional (Web of Science) Edition after
  2026; DocRoute already uses the Open Edition.
- Leiden 2026 update (2026-11-04): 97 of 100 universities stay; 82 changed
  rank (ties at 682, 647 and 619 follow the site's order). Out: Universidad
  Autónoma de Madrid, Politecnico di Torino (its coming-soon listing stays),
  Université PSL. In: Aix-Marseille University (#92), Queen's University
  Belfast (#96), University of Coimbra (#97), each with admission facts and
  a computer science entry read on its own site; Queen's also has the five
  fields and university-wide admission requirements (UK coverage rule).
  `top-computer-science.ts`, `top-field-requirements.ts` and
  `top-admission-requirements.ts` were re-keyed to the new ranks by Leiden
  id. Facts of the 97 staying universities were not rechecked in this pass.
- Data: `src/data/top-universities.ts` (generated once from research
  notes, edit by hand now), types in `src/types/top-universities.ts`,
  field resolution in `src/lib/top-universities.ts`, page
  `src/app/explore/top`, list `TopUniversitiesList.tsx`.
- Facts per university: how to apply, deadline, school certificate,
  language, tuition for a non-EU bachelor's applicant. A university's own
  statement wins; otherwise a sourced country rule is shown, labelled
  "Country rule". Fields with neither are listed as "Not checked yet".
  When a source page describes another intake (often 2026/27), the card
  says "Source describes: …". This is reference information: no
  matching, no checklist, not a verified route.
- Computer science bachelor per university (`src/data/top-computer-science.ts`,
  checked 2026-10-28 on the universities' own sites): programme link, the
  teaching language only when the checked page states it (28 marked
  English, UK/IE by default), and notes; 5 have none (Karolinska, Erasmus,
  Lausanne, Medical University of Vienna, Lund in English). Filter
  "Computer science in English" on the page. Not verified routes.
- University page (`/universities/[id]`): a Top 100 university shows a
  "Europe's top 100" block with its rank, top-10% paper count and the same
  facts and sources as its card (shared component
  `src/components/TopUniversityFacts.tsx`). Without a verified route the
  data status reads "Reference facts" with the latest check date; the empty
  01/02/03 placeholders are hidden. Still reference only, never a match.
- Entry requirements by field (`src/data/top-field-requirements.ts`,
  types `TopFieldKey`/`TopFieldRequirement`, test
  `tests/top-field-requirements.test.ts`): computer science, mathematics,
  medicine, law, economics, quoted as each course page publishes them
  (A-levels, IB, admissions tests, sometimes fee); grades are never
  converted between systems. First batch 2026-10-31: all 20 UK
  universities, 96 entries (Queen's Belfast added 2026-11-04, 5 entries) (Glasgow: only CS and medicine readable; QMUL:
  no 2027 medicine page; Imperial has no law; Warwick medicine is
  graduate-entry only). Shown in the Top 100 card and on the university
  page under "Entry requirements by field". Second batch 2026-10-31: all
  17 German Top 100 universities (the list has 17, not 19), 85 entries:
  teaching language, admission type (open / local NC / DoSV / nationwide),
  non-EU quotas and tests where the programme page states them (Freiburg
  5% medicine and 8% law quotas, Cologne TestAS module and percentile,
  RWTH and Frankfurt medicine TestAS, Münster medicine DSH 3). Notes for
  missing degrees: no law at TUM, RWTH, KIT, TU Dresden; no medicine at KIT;
  FU/HU medicine is Charité; TUM medicine is clinical part only (pre-clinical
  at LMU); no economics bachelor at RWTH (TUM and KIT list a business /
  digital-economics bachelor instead). Next: NL maths B, IT tests, FR
  dossier, ES admission grade.
- University-wide "Admission requirements" (`src/data/top-admission-requirements.ts`,
  type `TopAdmissionRequirements`, 2026-10-31): for all 38 UK and German
  Top 100 universities the university page's "Admission requirements" panel
  now shows three cards (application documents, entrance requirements,
  after admission) with sources, instead of "We are reviewing the official
  requirements". UK: UCAS steps, deadlines, CAS/ATAS/deposit rules; Germany:
  portal or uni-assist/VPD, certified copies and translations, enrolment
  (health insurance, semester fee). Reference only, never a match. TUM and
  KIT (which also have coming-soon listings) show it under "University-wide
  application steps". Not found: Edinburgh and Cardiff CAS pages (not
  opened), Manchester's page still shows the 2026 equal-consideration date.
  Also corrected: TU Dresden non-EU deadline 1 April–15 July (programme
  pages; the older leaflet said 31 May); LMU moves to uni-assist VPD and a
  new portal from summer semester 2027.
- Explore filters (2026-10-31): country and field are each optional ("Any
  country" / "Any field"). One country with any field shows its whole
  directory (verified/coming soon in any field first); one field across
  Europe lists only institutions with something checked for that field
  (verified route, coming-soon listing or Top 100 requirements by field).
  The personal route flow still needs both. Result cards show a
  "Top 100 · #N" badge linking to the list.
- 97 of 100 link to their DocRoute catalog page; Paris Cité, Sorbonne and
  PSL do not (the catalog has only predecessor institutions).
- Recheck 2026-10-30 (11 universities): new or updated facts for KU Leuven
  (Dutch-taught non-EEA deadline 1 Feb 2027, final 22 Sep 2027), Ghent
  (visa applicants by 1 April, no year on page; school rule), Bern (30 April,
  medicine 15 Feb, late only without visa), Lausanne (now its 2026/27
  deadline page: 28 Feb visa/ECUS, 30 April others), UCD (Fall 2027:
  priority 1 Dec 2026, final 1 July 2027; €60 on that page vs €70 in the
  FAQ), Helsinki (Studyinfo, admission groups, SAT/ACT), MedUni Wien
  (expected MedAT 2027 dates, 5% non-EU quota); Vienna, Edinburgh,
  Politecnico di Milano and Trinity rechecked unchanged (still describe
  2026/27 or the 2025–2026 cycle). Not yet published for 2027/28 on the
  checked pages: Italian calls (Polimi, Bologna, PoliTo, Milan), Vienna
  2027/28 periods, UK English pages (2026 entry), Trinity (2025 page),
  DTU dates. Greek universities: no current official procedure found for
  non-EU applicants (the ministry's call found describes 2024). KU Leuven,
  UNIL and Bern pages were read in the built-in browser (robots block the
  fetch tool).
- Second pass 2026-10-30: Florence (2026/27 intake rounds), Charles
  University (e-application, MFF example 31 March 2027, CZK 1,000), NTNU
  (Samordna opptak, 15 April), Utrecht (example 1 April); Hamburg, Porto
  and PSL rechecked unchanged (PSL's FAQ still shows 2025 dates and 2022/23
  fees). German, Dutch, Spanish, Swedish and Danish entries rely on the
  sourced country rules plus university facts checked on 2026-10-27; most
  UK pages still describe 2026 entry. Unreadable by the tools: Federico II,
  Goethe Frankfurt deadline page (semester dates only).
- Third pass 2026-10-30: Padua (second 2027/28 call, 1 Dec 2026–1 Mar
  2027); rechecked unchanged ETH, EPFL, Zurich, Karolinska, Copenhagen,
  Lund, Paris-Saclay, Paris Cité, Aarhus, Aalborg, Pisa, Turin, Bari (the
  Italian pages still describe 2026/27). Geneva blocked the tool; Basel's
  deadline page text was not readable.
- Fourth pass 2026-10-31 (60 universities): every Top 100 entry whose
  sources were all from 2026-10-27 was reopened on official pages; 91 of
  100 now carry a source checked on 2026-10-30 or later (93 with Oxford
  and Cardiff, added the same day). Changes worth
  knowing: Göttingen restricted programmes for non-EU applicants close on
  30 April (1 March–30 April, €65 fee), not 15 July; Lisbon now has a
  central 2027/28 call (phases 4 Jan–5 Feb, 5 Apr–21 May 2027; fees by
  programme €1,500–11,000); Freiburg publishes winter 2027/28 dates; Oslo
  Technology Systems closes 1 December; Sorbonne Sciences DAP 1 Oct 2026–15
  Jan 2027 with French B2; Leiden, Maastricht (CS 2027/28), UvA, Radboud,
  VU: non-EU deadline 1 April (Wageningen: Studielink 15 April);
  Frankfurt, HU Berlin, Tübingen, Geneva and Basel read in the built-in
  browser (Frankfurt 1 June–15 July / 30 Sept; HU 1 June–15 July via
  uni-assist, German C1 to apply). UK: 2027-entry computer science pages
  (IELTS, fees, admissions tests: UCL TARA, Imperial and Cambridge TMUA)
  added as notes and the CS links rechecked. Oxford: the fetch tool served
  a cached 2023 course page, but the live page (built-in browser) shows 2027
  entry: TMUA, A*AA, £66,580 overseas, IELTS now 7.5 (7.0 each; old English
  page is a 404). Not rechecked in this pass: TUM (no WS 2027/28 bachelor
  dates yet), Bologna, Milan, PoliTo (only 2026/27 calls), Barcelona
  (found page covers finished degrees only),
  AUTh (robots), Charles (rechecked 2026-10-30, sources not re-dated).
  Federico II's international site stays unreadable (also in the browser);
  its enrolment page is used instead.
- Known gaps: Federico II (Naples) and KU Leuven pages could not be read
  by the tools; Spanish universities mostly show the national procedure;
  Italian, Austrian and Portuguese deadlines are from the 2026/27 cycle.
  UK tuition is per course (link only). Oxford, Cambridge and UK
  medicine closed for 2027 entry on 15 October 2026.

## EU citizens and current residents (checked 2026-10-28)

- Sources (IOM MIC): "Residence of Union citizens" (updated 16 July 2026),
  "Change of the purpose or type of residence permit" (4 March 2026),
  "Reporting residence and other important obligations" (14 July 2026),
  "Permanent residence" (14 July 2026), "Temporary residence – study"
  (22 July 2026).
- EU, EEA, Swiss: notice of stay within 10 working days of entry (unless
  the accommodation provider reports it); register within 30 days after
  the first 3 months, free; card optional (10 years, €10/€39); report
  changes within 10 working days; permanent residence after 5 years. The
  route uses the university confirmation (study) or employment contract
  (work). No dated planner for this group yet.
- Residence status now has three Slovak options: `destination-study-residence`,
  `destination-residence` (now "another purpose") and
  `destination-permanent-residence`. Migration
  `20261028090000_residence_permit_types.sql` must be run in Supabase
  before profiles with the new values can be saved.
- Study holders: report the new university (no published deadline, so the
  route says "ask"), gap warning (purpose end must be reported within 3
  working days), renewal by the last day of validity.
- Other purpose: the guidance does not say which purposes allow study, so
  the route asks to confirm first, then gives the change-of-purpose
  checklist (no repeated criminal record or medical report, stay
  authorised in Slovakia while pending); the planner drops those items.
- Permanent: guidance gives citizen-like rights incl. employment; study is
  not mentioned, so the study route asks to confirm with the university.
- Not covered: family members of EU citizens; a study holder switching to
  work is still shown the ordinary in-country work route.

## Charles University MFF Informatika (checked 2026-10-28)

- Sources: MFF page "Přijímací řízení ke studiu bakalářských programů
  (2027/2028)", the 2027/28 programme list, and the Charles University
  information system (Informatika: full-time, Czech, 3 years). No
  approval date is shown on the pages.
- Rules used: deadline 31 Mar 2027; fee CZK 1,000 due 3 days later;
  written exam 7 Jun 2027 (substitute 22 Jun), 40/100 passes, everyone
  who meets the conditions is admitted; waivers (maturita 2025/26–2026/27
  only for the maturita grounds): maths average ≤1.5 (CZ/SK/European
  school), olympiads, MFF seminars, CZ Matematika rozšiřující 68%+, SK
  external maths 75%+, AP 4/5 (by May 2026), České hlavičky (not in the
  form). Czech proof (B2+) only without a CZ/SK maturita; SK/PL/HU/SI
  certificates are automatically equivalent.
- Inconsistencies on the page: waiver deadline 23 vs 24 May 2027;
  maturita copy 31 Jul vs 30 Sep 2027. The route uses the earlier dates.
- The English-taught Computer Science bachelor (EUR 7,500/year non-EU,
  deadline 30 Apr 2027) is not verified: its 2027/28 requirements page
  was not found.
- Matcher: `matchProgram` dispatches per policy; profile form shows waiver
  options per destination country.

## European coming-soon listings (PR #29, checked 2026-10-29)

- Each entry cites only the university's own pages; tuition is the non-EU
  rate (a non-EU citizen with Slovak residence usually pays it). Status
  `rules-published` only when the page states the 2027 intake; otherwise
  the latest rules with a "Source describes" year (a test ties the two).
- Map: NL, PL, HU, HR, IT, FI, LT and IE highlighted for these listings
  (same rule as DE/AT); no residence routes for them.
- Test host aliases: sote.hu → semmelweis.hu, wu-wien.ac.at → wu.ac.at.
- Skipped (pages did not give deadlines or requirements, or the
  programme is not taught in English): UvA Informatica (Dutch), Maastricht
  European Law School, Politecnico di Milano, Ljubljana FRI, Tartu CS
  (Estonian), Pécs and Debrecen medicine, ETH Zurich, TU Berlin, RWTH,
  DTU (engineering, not CS), UCD, Poznań, Sapienza. (ETH Zurich was added later as Informatik in German, see
  Switzerland.)
- Known gaps: VU non-EU fee, TU/e and Trinity teaching language/fees,
  BME tuition, Padua IMAT dates; Jagiellonian page shows the exam year as
  2026 in one line; Zagreb package gives 50 and 60 places.

## Fields: Law and Economics & Business (PR #27, checked 2026-10-29)

- Owner decision 2026-10-29: the field list is Medicine (incl. dentistry),
  Law, Economics & Business, Computer Science. Dentistry and Pharmacy were
  removed as separate fields (no data; dentistry sits under Medicine).
  Old links with `program=Dentistry/Pharmacy` show the invalid-field page.
- Czech law (Právo a právní věda) is a five-year master's entered from
  secondary school, stored as `long-cycle` (label "Long-cycle master's
  (Mgr.)"); medicine keeps "(MUDr./MDDr.)".
- Gaps: Charles PF fee amount not on the page; MU Law fee differs (CZK 800
  in the leaflet, 850 on the faculty page) and its conditions PDF and
  foreign-certificate rules could not be opened; UPJŠ Law skipped (2027/28
  page has a blank exam date and no 2026/27 conditions found); EUBA tuition
  for English programmes not checked; 1. LF test format and bonus rules not
  on the checked pages; MU Medicine fee/intake are 2026/27.

## ČVUT FIT Informatika (checked 2026-10-29)

- Sources: the faculty's PDF "Podmínky přijímacího řízení … 2027/2028"
  (bi-podminky-prijimaci-rizeni-2027.pdf; no approval date or decision
  number in it), the bachelor admission page (Přijímací řízení 2027) and the
  programme list bk.fit.cvut.cz (Informatika B0613A140029, 3 years).
- Rules used: application 1 Jan – 31 Mar 2027 at prihlaska.cvut.cz; fee
  CZK 1,050 by 31 Mar (non-refundable); maths test 1 or 2 June 2027
  (90 min, 0–100), excuse by 7 June → make-up 9 June; 70 points guarantee
  admission, remaining places by ranking (threshold may be lowered);
  planned maximum 1,100 full-time. Waivers by 24 May 2027 (later proof
  ignored): CERMAT Matematika rozšiřující 75%+ (2025/26–2026/27), SCIO
  Mathematics or OSP 90th percentile (listed dates 5 Dec 2026 – 24 Apr
  2027, CZ or SK version), Mensa IQ 130+, FIKS winner (4 years), national
  round/regional nomination in the maths, informatics or physics olympiad,
  SOČ or comparable (3 years); CERMAT, FIKS and competitions only for a
  first study at FIT. Czech B2 certificate for non-CZ/SK citizens without
  Czech/Slovak-language schooling, unless the OSP ground is met. Slovak
  schools count as Czech (no nostrifikace); others need nostrifikace or a
  ČVUT assessment. Documents by 16 Jun / 30 Jul / 13 Sep for online
  enrolment 22 Jun / 3 Aug / 15 Sep 2027. Extra conditions for RU/BY
  citizens (route warns); North Korean citizens cannot apply (not in the
  country list).
- Matcher: `matchCvutFit`; waiver values `cvut-cermat-math-75`,
  `scio-math-90`, `scio-osp-90`, `mensa-130`, `cvut-fiks`,
  `cvut-national-competition` (no DB change: `waiver_evidence` is a free
  JSON array). A school in CZ/SK is taken as Czech/Slovak-language
  schooling (the route asks to confirm otherwise).
- Not verified: the English-taught Informatics bachelor (CZK 64,000 for
  the first semester, same deadline) and the ČVUT assessment fee.

## Czechia residence (checked 2026-10-28)

- Sources: Ministry of the Interior portal ipc.gov.cz (study permit and
  study visa 27 Jul 2026, funds 30 Sep 2026, formal requirements 27 Jul,
  obligations 24 Aug, processing periods 25 Jun, employee card 12 Oct,
  Blue Card 14 Sep, free access 27 Jul, EU obligations 24 Aug, EU
  registration certificate 15 Sep 2026) and mzv.gov.cz (study: legal
  processing 60 days, Režim Student). Act 326/1999 is the legal basis,
  not checked section by section.
- Numbers: funds CZK 78,250 per semester / 115,810 per year (portal still
  uses a CZK 3,130 subsistence minimum; recheck yearly); fee CZK 2,500
  (study), CZK 5,000 consular / 2,500 in Czechia (employee card, Blue
  Card); documents ≤180 days, Czech translation unless Czech or Slovak;
  register within 30 days with D/VR visa (3 days visa-free); card within
  60 days of biometrics; extension from 120 days before expiry; employee
  card 60 days (90 complex), Blue Card 90 days; EU: report stay within 30
  days, optional certificate CZK 200.
- Known gaps: the Blue Card page gives both 6 months and 1 year as minimum
  contract and no CZK salary amount (route asks to confirm); employee card
  unemployment rules not described; how a study-permit holder reports
  a change of university is not described.
- Holders of a permit from another EU country (PR #17, checked
  2026-10-28): for study, `/route/czechia` asks what the permit is for,
  who issued it and whether it is an exchange permit. A long-term study
  permit or visa from an EU country other than Ireland and Denmark (e.g.
  Slovakia) → first application in person at a Ministry of the Interior
  office in Czechia (no Czech visa needed; embassy also possible), with
  first-application documents incl. criminal record. The route warns that
  short stays on the current permit are limited to 90 days in 180 and a
  pending application does not extend that (ipc "Travelling within the
  Schengen Area", 28 Jul 2026), and that in Slovakia the end of the
  residence purpose is reported within 3 working days (IOM). Exchange
  permits with a programme note: up to 1 year visa-free in Czechia,
  register with the Foreign Police within 3 days (ipc study-mobility page,
  24 Aug 2026). Other purposes, Ireland, Denmark or non-EU issuers →
  embassy. Older links without these answers stay "confirm where to
  apply". The Charles MFF route (saved profile) cannot ask these questions
  and still says "confirm", pointing to the Czechia route.
- Planner uses calendar days (no Czech holidays needed).

## Work route sources and limits (checked 2026-10-23)

- IOM Migration Information Centre: "Temporary residence – employment" and
  "Single permit" (both updated 11 August 2026), "EU Blue Card" (15 July
  2026), "How to document the purpose of residence" (11 August 2026),
  "Reporting a vacancy" (19 July 2024), and the July 2026 amendment news.
  Act No. 404/2011 is the legal basis; its paragraphs were not checked one
  by one.
- Numbers used: fee €250; card €10/€39; decision up to 60 days (single
  permit), 30 days (shortage occupation, Blue Card), 90 days (Slovak
  graduates); vacancy reported ≥20 working days before the confirmation
  request (by the request day for shortage occupations with <45% foreign
  staff, and for the Blue Card); file within 180 days of the confirmation;
  documents ≤90 days old; accommodation ≥6 months; missing documents within
  15 days (+15); entry within 180 days of approval; report arrival within 3
  working days; insurance 3 working days and medical report 30 days after
  the card; unemployment notice 7 working days; protection period 3/6
  months (single permit), 60 days (graduates).
- Not dated on purpose: the Labour Office's processing time is not
  published, so the planner shows the vacancy report as a "no later than"
  limit only.
- Known gaps: the Blue Card salary threshold in euros is not given by the
  guidance (the route asks to confirm it with the employer); Blue Card
  job-loss rules are not described in the checked guidance; work permits
  (e.g. sailors), seasonal work, intra-corporate transfers and job-seeking
  residence are not covered. "Documents issued in" on the home form only
  pre-fills citizenship; the person can change it.
- The amendment dropped the sworn ownership statement as accommodation
  proof while the employment page still lists an owner affidavit, so the
  route names examples and asks to recheck.

## Family and business routes (PR #28, checked 2026-10-29)

- Sources (IOM MIC): family reunification (SK page, 30 Jul 2026), right
  to work of family members (2 Mar 2026), application for temporary
  residence (23 Jul 2026), documenting the purpose (11 Aug 2026), business
  by type of residence (19 Aug 2026), temporary-residence list (validity),
  15 July 2026 changes (13 Aug 2026), trade business basics (2020). The
  IOM business articles themselves (trade licence, company executive)
  could not be opened by the tools.
- Family: €200 (free under 18), card €10/€39, documents ≤90 days (civil
  status exempt), apostille + Slovak/Czech translation, accommodation ≥6
  months, decision 90 days (30 for Blue Card families filed together),
  valid as long as the sponsor's residence, max 5 years; work permit
  needed in the first 9 months (not for Blue Card families); no switch to
  business for 24 months. Not covered (route says so, no dates): family of
  Slovak or EU citizens, unmarried partners, spouses under 18.
- Business: €350 embassy / €330 police; first application only at an
  embassy (police only for a change of purpose from Slovak temporary
  residence); business plan (Ministry of Economy template) with
  feasibility documents; funds: subsistence minimum €295.22/month
  (€3,542.64 for over a year), business account €5,904.40 (sole trader)
  or €29,522 (executive); 90 days; 3 years. Renewal from 15 July 2026:
  sole traders need taxable income above a threshold (IOM's reading: about
  €2,876.90 for 2025), executives proof of tax (minimum €340–€11,520); no
  debts. Study residence already allows business (shown to study holders);
  permanent residents and EU citizens only need the trade licence or EU
  registration.
- Planner: `planPurposeResidenceDeadlines` (the work planner without
  Labour Office steps). Waitlist/feedback route ids `family-sk`,
  `business-sk`: migration `20261029120000_family_business_routes.sql`
  was run by the owner (confirmed 2026-10-30).

## Czechia and Austria residence guides (checked 2026-10-30)

- Page `/route/guide?country=CZ|AT&purpose=work|family|business&variant=…`
  (`src/lib/residence/country-guides.ts`, `CountryGuideScreen.tsx`):
  checklists with progress ticks and key figures, no dated planner, no
  waitlist; feedback form without a route id (no database change). Czech
  work stays on `/route/czechia`. Austria is now a home-form destination
  (study in Austria still goes to Explore).
- Czechia (ipc.gov.cz): family reunification (updated 15 Jul 2026): sponsor
  conditions (15 months + both spouses 20+, employee card 6 months, Blue
  Card/ICT/investment, research, job-seeking/business applicants), CZK 2,500
  (1,000 under 15), 60 days in Czechia / 270 via embassy, validity tied to
  the sponsor (min 1 year), work allowed; income = living minimum +
  normative housing cost (from 1 Oct 2026). Business: long-term visa (28 Jul
  2026; CZK 5,000, 90/120 days, up to 1 year, funds CZK 156,500 = 50 ×
  3,130; the page gives both embassy and Ministry filing) then the permit
  (27 Jul 2026; Ministry office, CZK 2,500, 60 days, up to 2 years).
- Austria (migration.gv.at, no page dates): EU Blue Card (€55,678 gross
  2026), RWR very highly qualified (70 points, job-seeker visa 6 months
  €195), shortage occupations (55 points), other key workers (55 points,
  €3,465/month 2026); family: RWR Card plus (no quota) or settlement permit
  (quota, German A1), spouses 21+, income €1,308.39 / €2,064.12 / +€201.88
  per child (2026); business: self-employed key worker (e.g. €100,000,
  AMS opinion 3 weeks), start-up founder (€30,000, 50 points). Fee €218;
  address registration within 3 days (oesterreich.gv.at, 13 Jan 2026).
- Not covered: family of Czech/Austrian/EU citizens, Czech job-seeking and
  investment permits, Austrian seasonal/ICT/graduate routes, Swiss residence.

## Code structure for residence

- `src/lib/residence/slovakia.ts`: shared Slovak residence steps plus a
  purpose definition (`studyPurpose`), and `residenceGateStage` (Slovak /
  EU-EEA-Swiss / contradictory profiles), shared with work.
- `src/lib/residence/slovakia-work.ts`: the work route builder; answers
  parsing in `src/lib/work-profile.ts`; `planWorkResidenceDeadlines` in
  `deadlines.ts`. `WorkRouteScreen` has its own layout (route strip,
  checklist rows, sticky date panel), separate from the study preview.
- `src/lib/residence/deadlines.ts`: pure date calculations for the planner
  (UTC; working days skip weekends and Slovak days off; dates formatted by
  hand to avoid ICU differences between server and browser).
- `src/lib/residence/slovak-holidays.ts`: Slovak days off under Act No.
  241/1993 (Slov-Lex version in force from 1 Nov 2025, checked 2026-10-27):
  11 fixed days plus Good Friday and Easter Monday (Easter is calculated).
  1 Sep, 28 Oct and 17 Nov are state holidays but not days off; § 4b makes
  8 May and 15 Sep working days in 2026 only. Recheck the act each year;
  a test pins the list.

## Residence sources (rechecked 2026-10-23)

- Requirements cite the IOM Migration Information Centre pages updated in
  July 2026, after the Foreigners Residence Act amendment in force from
  15 July 2026.
- The legal basis is cited as Act No. 404/2011 Coll. on Slov-Lex (version
  from 15 July 2026). Its paragraphs were not cross-checked one by one; the
  tool could not load the full text.
- The previous minv.sk deep link redirects to the ministry homepage and was
  removed.

## Legal status and beta (2026-10-28)

- DocRoute runs as a **free, non-commercial public beta** by a private
  individual living in Slovakia (no IČO, no payments). The operator is not
  named on the site during the beta. `legalInfo` in `src/data/legal.ts`
  holds the contact (email `null` until the dedicated mailbox exists;
  meanwhile GitHub issues), minimum account age (16) and document dates; Terms, Privacy, Cookies and the
  footer read from it. `isCommercial` must stay `false` until a trade
  licence exists and payment terms are written (a test checks it).
- Pages: `/terms` (not legal advice / not a legal service under Act
  586/2003, decisions belong to universities and authorities, no
  guarantee, Slovak law), `/privacy` (GDPR: data table, processors
  Supabase, Vercel, Google sign-in, Wikimedia photos; rights; complaint to
  ÚOOÚ SR), `/cookies` (only strictly necessary items; § 109(8) of Act
  452/2021). A cookie banner asks "Accept all" / "Necessary only" (equal
  buttons, choice in `docroute-cookie-consent`, changeable on `/cookies`);
  both behave the same today. Any future optional tool must check
  `hasOptionalConsent()` in `src/lib/cookie-consent.ts`.
- Site-wide footer with the BETA label and legal links; BETA badge in the
  header; consent line on the sign-in/sign-up screen (Terms, 16+, Privacy).
- Account page: **Download my data** (JSON of account, profile, saved
  universities, progress) and **Delete my account** (RPC
  `delete_my_account`, migration `20261028150000`).
- Visit statistics (PR #19): Vercel Web Analytics loaded by
  `ConsentedAnalytics` only after "Accept all" and only on production
  (`NEXT_PUBLIC_VERCEL_ENV`), via the plain script
  `/_vercel/insights/script.js` (no npm package). Cookieless; `beforeSend`
  strips the query string (route answers live there) and drops events if
  consent was withdrawn. Needs Analytics enabled in the Vercel project
  (owner action). Hobby has no custom events. Cookie Policy, banner and
  Privacy Policy describe it. No other analytics or trackers (a test
  checks package.json).
- Feedback (PR #19): anonymous form (rating 1–5 and/or text) at the end of
  every route page and on `/feedback` (footer link). Table `feedback`
  (migration `20261028200000_feedback.sql`): insert-only like the
  waitlist, page path without query string (checked in the database),
  kept at most 24 months; read in the Supabase dashboard.
- Before taking money: trade licence (živnosť; study-residence holders may
  run a trade per podnikajte.sk, confirm with the trade office), payment
  terms with the 14-day withdrawal waiver for digital content, Vercel Pro
  (Hobby is non-commercial), a lawyer's review of the wording, and the
  seller's name or business name, IČO and address on the site (selling
  cannot be anonymous).

## Public profiles and moving stories (PR #34, 2026-10-30)

- Migration `20261030120000_profiles_and_stories.sql` (owner must run it in
  the Supabase SQL editor; until then `/stories` shows "Stories could not be
  loaded"). Tested twice on local Postgres 16 with anon/authenticated roles
  and a storage stub.
- `public_profiles`: display name (2–40, no `<>@`), optional bio (≤280) and
  avatar path; public read, own-row writes. Avatar files in the public
  bucket `avatars` (1 MB, webp/jpeg/png), only inside `<user id>/`; the
  browser crops to 256×256 WebP (drops EXIF/GPS) before upload.
- `success_stories`: title, text (80–4000), reason (study/work/family/
  business), from/to country, year, optional university/employer. A trigger
  forces every author insert or edit to `pending`; the owner publishes by
  setting `status = 'published'` (or `hidden`) in Table Editor. Max 5 per
  account. Public sees only published rows; authors see their own.
- Pages: `/stories` (filters `?purpose=`, `?to=`), `/stories/new` (needs
  login and a public profile; own stories with status and delete),
  `/u/<id>` (public profile, noindex without published stories). Profile
  editor on `/account`; "Stories" in the header nav; `/stories` in sitemap.
- Download my data includes the profile and stories; account deletion
  removes avatar files through the Storage API, then `delete_my_account()`
  (redefined) deletes stories and profile. Terms §7 "Your public profile and
  stories" and Privacy (data row, `#stories`) updated, dates 2026-10-30.
- Review fixes (PR #35): migration `20261030130000_story_limit_lock.sql`
  locks the profile row before counting, so concurrent submissions cannot
  exceed 5 (tested with two sessions); account deletion stops with a
  retryable message if the photo cannot be removed from Storage.
- Moderators and author editing (2026-10-31): migration
  `20261031120000_story_moderators.sql` adds `story_moderators` (no API
  access; the owner inserts rows in the SQL editor by email, the email is not
  in the repo), `is_story_moderator()` and `moderate_story(id, status, reviewed_at)`.
  Moderators see all stories, publish/decline/return them on
  `/stories/review` (404 for others) and may delete any story. `/stories`
  shows moderators the queue size and authors a link to their stories that
  are not public yet. Authors can edit their stories on `/stories/new`
  (edit sends the story back to `pending`; publishing a version the author
  changed after the moderator loaded it is refused). Review list paginated
  by 30. Tested on local Postgres 16.
- Explore shows "Verified routes" (SK, CZ) and an amber "Rules checked"
  group/badge for countries with official-rule listings; How it works shows
  each listing's status and the CZ/AT guides.

## Route results and avatar upload (2026-10-31)

- "Continue university matching" (`/route/universities`) now opens on
  **My options in <country>**: every verified programme for the profile's
  field, degree and intake that is not "unavailable" (ready, preparation
  needed, needs clarification), plus every coming-soon listing for the same
  field, degree and intake. Tabs: **Other countries** (the same across
  Europe, e.g. Czech verified routes for a Slovakia profile) and **Whole
  directory**. Coming-soon cards say the profile was not checked against
  them (their rules are not approved; the matcher never reads them). Logic in
  `src/lib/route-options.ts`, test `tests/route-options.test.ts`. The old
  "Current profile options" (steps-remaining only) tab is gone. For an
  option in another country the profile's destination becomes that country
  and destination-relative residence (study/temporary/permanent residence,
  national visa) becomes "other EU/EEA residence" when the old destination is
  in the EU/EEA, otherwise "not sure" (visa-free stays too), so the route asks
  (`profileForDestination`), both in matching and in the card's links.
- Avatar: "Add photo" works before the profile is saved (the typed name is
  saved first), the round avatar itself opens the picker, drag and drop,
  instant preview, EXIF orientation respected, JPEG fallback where the
  browser cannot encode WebP (older Safari); the DB rule already allows
  `.jpg`.

## Family and business across the EU and Switzerland (2026-11-02)

- `/route/guide?country=XX&purpose=family|business` now covers all EU
  countries and Switzerland. Slovakia (`/route/family`, `/route/business`),
  Czechia and Austria keep their verified guides; the other 25 countries
  get a linked checklist (`src/lib/residence/linked-guides.ts`,
  `coverage: "official-link"`): check eligibility → documents and
  application (where to apply, visa first or not) → after approval. Each
  step cites one official page and states no fee, threshold or date (a test
  checks there are no figures): EU Immigration Portal "Family member in
  <country>" / "Self-employed worker in <country>" pages
  (`src/data/eu-immigration-portal.ts`, all 27 × 2 checked 2026-11-02),
  New to Denmark (family reunification, Start-up Denmark), ch.ch (family
  reunification) and the SECO SME portal (foreign founders; third-state
  permits limited to a highly qualified workforce) for Switzerland.
- `/route/guide` without a country is a chooser (verified countries first,
  then official links). The home form links to it for family and business
  ("Other EU countries and Switzerland"); the map and the destination list
  are unchanged (owner decision).
- Passport notes (`src/data/citizenship-notes.ts`, India first, checked
  2026-11-02): a "For Indian citizens" stage in every residence guide
  (citizenship picker on the page; not taken from the home form, whose
  "Documents issued in" is not citizenship), the Slovak
  family and business routes and the full study path. Visa: India is in
  Annex I of Regulation (EU) 2018/1806 (consolidated 30 Dec 2025); Ireland's
  list of visa-required nationalities (12 May 2025) and its New Delhi visa
  office (22 May 2026); Switzerland's SEM list marks India visa-required for
  short and long stays (version 3 Apr 2026); existing residents get no
  entry-visa step. Documents: MEA apostille
  (Hague Convention since 2005; state/UT/chamber authentication first;
  submitted only through MEA's outsourced agencies).
- Not covered: work outside SK/CZ/AT, family of EU citizens, other
  citizenships' notes, verified step-by-step guides for the 25 linked
  countries.

## Work across the EU and passport notes for every citizenship (2026-11-03)

- `/route/guide?country=XX&purpose=work` now covers the other 24 EU
  countries and Switzerland (`linked-guides.ts`, version
  `linked-work-guides-2026-11-03`): choose the permit → apply → after
  approval. Sources (checked 2026-11-03): EU Immigration Portal "Employed
  worker in <country>" plus "EU Blue Card in <country>" (Ireland: "Highly-
  qualified worker", the Critical Skills permit; the portal says Cyprus
  currently issues no Blue Cards), New to Denmark "Work" (Fast-track, Pay
  Limit, Positive Lists…), SEM "Non-EU/EFTA nationals" for Switzerland. No
  figures (test). Slovakia (`/route/work`), Czechia (`/route/czechia`) and
  Austria (verified guide) keep their routes. The chooser and the home form
  link work too.
- Passport notes (`src/data/citizenship-notes.ts`,
  `src/data/citizenship-lists.ts`) for any citizenship outside the
  EU/EEA/Switzerland, in every guide, the Slovak work/family/business
  routes, the Czech routes and the full study path (existing residents get
  no entry steps; routes that stop at a gate get no passport stage; task ids
  end with the citizenship so ticks do not carry over to another passport):
  - entry visa: Regulation (EU) 2018/1806 Annex I/II (consolidated
    30 Dec 2025; biometric-passport footnotes), Ireland's own list, SEM's
    list for long stays in Switzerland;
  - airport transit visa: Visa Code Annex IV (consolidated 28 Jun 2024);
  - apostille or legalisation: HCCH status table (30 Jun 2026), entry into
    force for recent parties (Thailand only from 28 Feb 2027: legalisation
    until then), and the
    objections still in force for EU countries (e.g. Germany–India,
    Poland/Czechia/Netherlands…–Pakistan, Germany–Philippines); India keeps
    the MEA procedure where the apostille applies;
  - relief: Germany § 41 AufenthV (apply in Germany; § 41 (2) without
    employment), § 26 (1)/(2) BeschV for work (incl. Western Balkans), the
    Netherlands' MVV exemption list (IND, 6 May 2026);
  - extra checks: the Netherlands' TB test (IND page, exemption list linked,
    not copied: it is a PDF);
  - Ukraine: EU temporary protection extended by Implementing Decision (EU)
    2026/1912 (military-obligation proof for new grants), Denmark's Special
    Act, Switzerland's status S.
  The citizenship picker on the guide and the full path offers every
  country on these lists. Stage strip label "For citizens of <country>"
  (fixes "For indian citizens").
- Not covered: Russia/Belarus national restrictions (need each country's
  official page), per-nationality Irish and Swiss lists (linked, not
  copied), the Dutch TB exemption list itself.

## Country pages and paths by passport (2026-11-05, plan items 1–2)

- `/countries` (all 27 EU countries + Switzerland) and `/countries/xx`:
  study (universities in the directory, Top 100, verified programmes,
  coming-soon count, student residence verified or official links) and
  work / family / business cards with "Verified steps" (Slovakia all three,
  Czechia work + verified guides, Austria guides) or "Official links" (the
  linked guides for every other country). Built from the route data
  (`src/lib/countries.ts`); the light list for the map is
  `src/lib/country-list.ts` (no catalogue in the client bundle).
- Home route form: "I want to study / work / … in" lists all 28 countries
  with flags (Slovakia, Czechia, Austria first; `plannerDestinationOptions`).
  The map keeps its five featured destinations (`mapDestination`).
- Home map: every EU country and Switzerland gets "Work, family, business in
  <country>" → its page (highlighting unchanged). Header and footer link
  "Countries"; sitemap lists all pages. Phone header tightened for 5 items.
- "Path by passport" block (`src/lib/passport-track.ts`): own country;
  easier (EU/EEA/Swiss free movement, Your Europe; Germany's apply-after-
  entry nationalities; Netherlands MVV-exempt); standard (Schengen
  visa-free or visa-required list); harder (Russia/Belarus restrictions).
  Links open the routes with `citizenship=`.
- Russia and Belarus (`src/data/russia-belarus.ts`, official pages read
  2026-11-05): EU suspension of visa facilitation with Russia (no 2022 fee
  figures), Estonia (no C/D visas for Russians; Belarus: no visas for
  short-term work/business/telework), Finland (entry restricted; non-
  biometric passports refused from 1 June 2026), Latvia (Cabinet Reg. 123
  categories), Lithuania (visa applications suspended; questionnaire for
  RU/BY with any new permit or national visa), Poland (entry limited since
  19 September 2022), Czechia (biometric Russian passports only). Added as
  "attention" tasks to every route's passport stage.

## Google sign-in on production (2026-11-06)

- Symptom: after Google sign-in on production the browser opened
  `localhost:3000/?code=…`; the account was created, the session was not.
  Cause: Supabase "Site URL" was `http://localhost:3000` and the production
  callback was not on the redirect allow list (previews were), so Supabase
  fell back to the Site URL. Fix in Supabase (owner): Site URL
  `https://docroute-student.vercel.app`, Redirect URLs include
  `https://docroute-student.vercel.app/auth/callback`.
- Code safety net: a `code` that lands on `/` or `/home` is forwarded to
  `/auth/callback` (`src/proxy.ts`).

## Entry page: larger logo and tagline (2026-11-06, PR #61)

- Logo mark 56 px (46 on phones), wordmark 26 px (22 on phones), tagline
  "Official steps. Real deadlines." under the wordmark (translated).
- Headline "Start your journey" smaller: clamp(44px, 5.6vw, 88px).

## Site languages: Russian, Spanish, Chinese, Hindi (2026-11-06, PR #60)

- Owner request 2026-11-05 ("Indian" = Hindi). Details: `docs/I18N.md`.
- Language: `docroute-lang` cookie, else the browser's languages, else
  English; addresses unchanged; switcher in the header and footer. A site
  JSX runtime (`jsxImportSource: @/i18n`) translates rendered text and
  readable attributes from `src/i18n/catalogs/{ru,es,zh,hi}.json`, keyed by
  the English text. Root layout reads cookies, so pages render per request.
- Translated: the whole interface (~1,580 strings) plus passport notes
  (visa, apostille, Russia/Belarus, China), Slovak deadlines, cookie table
  (~1,725 entries per language). Source titles and publishers stay as
  published.
- Not yet translated (~4,400 strings): residence route steps (~21k words),
  university/programme data (~35k words), legal pages. They show in
  English; a footer notice in non-English languages says the English text
  and official sources prevail.
- Engine rules: joined texts translate sentence run by sentence run or stay
  English; a template variable may not hold untranslated English words;
  search boxes match English and translated names.
- Fixes found on the way: text inside components (next/link) on client
  navigation; textarea placeholders; hydration error on every country page
  (Node vs browser country names, now a fixed table
  `src/data/region-names.ts`).

## Chinese passports in the verified countries (2026-11-06, PR #59)

- `src/data/china-notes.ts` (official pages read 2026-11-05/06), added to
  the passport stage of every route for `citizenship=CN` and to "Path by
  passport" (Hong Kong and Macao passports are separate codes):
  - Germany, study: APS certificate before the visa (German missions in
    China checklist, July 2024).
  - Austria, study: APS verification and gaokao/huikao recommendation
    (BMBWF, from 1 March 2022).
  - Switzerland, study: VFS appointment, notarised diplomas with FR/DE/IT
    translation, IELTS/TOEFL for English-taught (no processing time stated).
  - Czechia: registration by e-mail at the Beijing embassy (study/family);
    employee cards by e-mail + economic migration programmes (work);
    Shanghai covers Shanghai, Anhui, Jiangsu, Zhejiang. The country page
    shows both notes.
  - Slovakia, work: national visa D for employment at the visa centre in
    China; apostilled criminal record with official Slovak translation.
  - Documents: China applies the Apostille Convention since 7 Nov 2023
    (notary certificate → MFA or provincial foreign affairs office).
  - Nationality law (National Immigration Administration): China does not
    recognise dual nationality; naturalising abroad ends Chinese
    nationality. Shown also to people already living in the country.
- Not found on official pages: China-specific steps for Slovak study or
  family/business routes, or for Polish study.

## Plus email sender (2026-11-05, PR #55)

- `scripts/send-plus-email.mjs`: one-off email to Plus members from a CSV
  exported in the Supabase SQL editor (query in the script header; never
  commit the CSV). Dry run by default (prints recipients); `--send` needs
  `RESEND_API_KEY`, `MAIL_FROM` and `SITE_URL` in the environment.
- Provider Resend is an assumption; no provider, key or verified sender
  domain is set up yet. Reminder emails (plan item 5) remain to be built.

## Home: destination selector restored (2026-11-05, revert of PR #54)

- PR #54 (destination asked only after "Other country") is reverted at the
  owner's request: with the field hidden, a purpose such as Work built a
  route to a country the person never chose. "I want to … in" is shown
  again for every purpose, as before #54.

## Verified programmes: 8 Slovak and Czech faculties (2026-11-05, plan item 4)

- New shared matching policy `generic-2027` (`matchGeneric` in
  `src/lib/match-programs.ts`): a programme declares `genericRules`
  (language proof with exempt citizenships/schools, recognition with exempt
  schools, entrance route) and the matcher only restates them. A page that
  states no language proof gives an "unknown" check (status "more
  information") instead of a guess.
- `src/data/verified-programs-sk-cz.ts`, checked on the faculties' own
  2027/28 pages: VUT FIT Informační technologie; STU FIIT Informatika;
  MUNI FI Informatika, Programování a vývoj aplikací, Kyberbezpečnost,
  Bioinformatika; FMFI UK Informatika, Aplikovaná informatika, Dátová veda,
  Bioinformatika (conditions approved 19 October 2026); JLF UK Všeobecné
  lekárstvo (Slovak); PrF UK and PrF MU Právo a právní věda; 1. LF UK
  Všeobecné lékařství. 14 programmes.
- Medicine and law carry `programType: "long-cycle"` and are labelled
  "Long-cycle master's (N years)" (`formatProgramDegree`), while matching
  from a bachelor-level profile as before.
- Rule "verified or coming soon, not both" per university and field: the
  pending groups of these faculties were removed, and with them STU FEI AI,
  STU FIIT English and LF UK Bratislava (same university and field). JLF's
  English-taught General Medicine and both Dentistry programmes are not
  verified and no longer listed.
- Not verified (2027/28 not published or unreadable on 2026-11-05): TUKE
  FEI, LF UK Bratislava, VŠE NF, VŠB FEI, MUNI LF (page error), 3. LF UK
  (robots), UPOL PřF (no application deadline in the 2027/28 document).
- Fees not stated on the checked pages are shown as "set in the
  e-application" (MUNI FI, FMFI, PrF UK, 1. LF UK).

## Verified programmes: 10 per field (2026-11-05, owner's goal)

Goal: ten verified 2027/28 programmes per field in Slovakia and Czechia
(the only countries with a post-admission residence route). Counts after
this change: Computer Science 16, Medicine 10, Economics & Business 10,
Law 5. All use the `generic-2027` policy; new file
`src/data/verified-programs-fields.ts`.

- Medicine (+8): LF MU Všeobecné and Zubní lékařství (deadline 28 Feb 2027,
  CZK 900, tests 9/10 June); LF UK Hradec Králové Všeobecné and Zubní
  lékařství (28 Feb, CZK 1,000, test 16 June, Czech C1); LF UP Olomouc
  Všeobecné and Zubní lékařství (15 March, CZK 790, test 8 June);
  1. LF UK Zubní lékařství (same dates as Všeobecné); JLF UK Zubné
  lekárstvo (€100, 12 places, skills test SMZ 19–23 April).
- Law (+3): PF UP Olomouc Právo a právní věda and Právo ve veřejné správě
  (Bc., full-time; SCIO OSP+ZSV, 15 March, CZK 790); FPR ZČU Plzeň Právo a
  právní věda (30 April, CZK 750, SCIO OSP+ZSV). Only five, because no
  other full-time Czech or Slovak law programme had 2027/28 rules: Slovak
  law faculties (Comenius, UPJŠ, Trnava, UMB, Paneurópska) still show
  2026/27; MU and PF UP's other bachelors are combined/distance only.
- Economics & Business (+10): FP VUT Ekonomika a management; FPH VŠE
  Podniková ekonomika a management; FMV VŠE Mezinárodní obchod, Turismus a
  hospitality management; FPEDAS UNIZA Ekonomika a manažment podniku,
  Finančný manažment, Elektronický obchod a manažment; FaME UTB Ekonomika a
  management, Finance a finanční technologie, Účetnictví a daně.
- Rule "verified or coming soon, not both" per university and field:
  removed pending groups MUNI LF (Czech), MUNI and UPOL General Medicine
  in English, and NF VŠE Economics (VŠE is now verified at FPH and FMV).
- Not verified (no 2027/28 rules or unreadable on 2026-11-05): 2. LF UK
  (no application deadline), 3. LF UK (only 2026/27 details), LF UK Plzeň
  (outdated page), LF OU (accreditation), LF UK Bratislava, UPJŠ LF, NF and
  FFÚ VŠE, ESF MU (2027/28 PDF not reachable), EUBA (English only), VŠB EKF,
  CEVRO (domain differs from the catalogue).
- Faculty pages that state no Czech proof get an "unknown" language check
  (LF MU, LF UP, PF UP, FPR ZČU, FaME); FPH and FMV use their own Czech
  tests (no CEFR level), shown as documents for schools outside CZ/SK.
- University page: the "verified route is available" sentence now counts
  programmes per faculty, degree type and length and adds "N more verified
  in this field" (VŠE: FPH and FMV; medicine and dentistry).

## Verified programmes: second batch (2026-11-05)

Owner asked for +5 business, +5 medicine, +10 law, +1–2 computer science.
Counts now: Computer Science 18, Medicine 15, Economics & Business 15,
Law 7 (file `src/data/verified-programs-fields-2.ts`).

- Law (+2 of 10 asked): PraF UPJŠ Košice Právo (3 years) and Právo in
  Slovak, English and French (4 years); deadline 31 March 2027, €30 online,
  test 10 June 2027. No more found: Comenius, Trnava, Paneurópska still
  show 2025/26–2026/27 rules, UMB's site returned errors, ZČU's bachelor is
  only documented for 2022/23, MU and PF UP bachelors are not full-time.
- Medicine (+5, English-taught): JLF UK General Medicine (four exam rounds,
  €70, up to 150, €11,500); LF UK Bratislava General Medicine and
  Dentistry (March round by 21 February 2027, €85, 240/50 places);
  LF UK Plzeň General Medicine and Dentistry (by 30 April 2027, CZK 990,
  test 26 May 2027). Not added: UPJŠ LF English (published, but verifying it
  would drop the Slovak-taught UPJŠ coming-soon listing), UPOL English (2027
  exam dates not out), MUNI, LF HK and 1. LF English (2026 pages only).
- Economics & Business (+5): PEF ČZU Business Administration and Economics
  and Management (English; dean's directive 16/2026, GAP test, last stage
  31 March 2027); FES UPCE Ekonomika a management, Digitální podnikání
  (critical-thinking test) and Finance (SCIO 20th percentile).
- Computer Science (+2): FIS VŠE Aplikovaná informatika; FP VUT
  Manažerská informatika.
- University page: when the selected field is verified, coming-soon
  listings of other fields are not shown (UPJŠ law page no longer showed
  medicine's "5 programs listed" and "Build my full path").

## Top 100: last day to apply and admission requirements (2026-11-05)

- New `admissions.applyBy` on every Top 100 university: `{date, cycle,
  label}` = the last day a non-EU applicant can apply on the main route;
  `deadline` keeps the details. 94 universities have a date; 6 are `null`
  with a reason shown (Naples, Bologna, Politecnico di Milano, Pisa: per
  programme/call; NKUA and AUTh: Ministry application, closing date not
  readable). Cycle "2026/27" is used only when 2027/28 is not published
  yet (most of Italy and Spain, Porto, Vienna, FU Berlin, Münster) and the
  label says so.
- Card: "Apply by" block first (date, entry year, "N days left" / "Closed"
  worked out in the browser, label); grey for a past cycle or no date.
- Re-checked on official pages 2026-11-05: Utrecht, Radboud, Groningen,
  Erasmus, Leiden, TU Delft, UvA, Wageningen, VU, Sapienza, Milan,
  Politecnico di Milano, Valencia, Seville/Granada (Andalusian foreign
  phase), UB/UAB (Catalan pre-enrolment), Porto, Ghent, Trinity, Vienna,
  NKUA. Others derived from the deadline texts checked 2026-10-27..31.
- `top-admission-requirements.ts`: now 55 universities (17 added outside
  the UK and Germany); a test checks every entry cites the university's
  own site. Greece got a country deadline rule.
- Next: requirements for the remaining 45 (CH, DK, SE, FR, NO, FI, CZ,
  Lisbon, Coimbra, KU Leuven, UCD, MedUni Vienna, rest of Italy/Spain);
  refresh 2026/27 dates when 2027/28 calls appear (Italy Feb–Apr, Spain
  spring, Vienna spring).

## Student residence: Austria, Germany, Poland (2026-11-05, plan item 1)

- `src/lib/residence/study-routes.ts`: source-checked first-arrival routes
  for non-EU students, used by the full study path (`/route/full`) instead
  of the official-link step. Coverage "verified". EU/EEA/Swiss citizens keep
  the EU registration steps; people already living there keep "ask the
  authority".
- Austria (migration.gv.at "Temporary residence: Students"): where to file
  (embassy, or in Austria after lawful entry: MA 35 / district authority),
  money €722.58/month under 24 and €1,308.39 from 24, insurance, no
  accommodation proof, Meldezettel within 3 days, AMS permit for any job
  (≤ 20 h/week without labour-market test), extension with study success.
  OeAD student-permit page (as of 2026): money shown for 12 months, rent
  above €386.43/month and health insurance (€78.84/month self-insurance)
  need extra money, fee €218 (not refunded), renewal in the last 3 months.
- Germany (Make it in Germany "Visa for studying", as of January 2026;
  Auswärtiges Amt funding and blocked-account pages): visa via Consular
  Services Portal, fee €75, blocked account €11,904 (2026) or other proofs,
  documents, address registration, German health insurance, § 16b permit
  before the visa expires (fees up to €100). No registration deadline stated.
  Citizens of AU, CA, GB, IL, JP, NZ, KR, US (and AD, BR, SV, HN, MC, SM
  without employment) get "enter visa-free, apply in Germany" instead of the
  visa step (Auswärtiges Amt FAQ).
- Poland (study.gov.pl by NAWA; Poznań voivode office page): D visa at a
  consulate (≤ 1 year, review up to 15 days), temporary residence permit
  online in MOS by the last day of legal stay (university annex first),
  stamp duty PLN 340, card PLN 100 (PLN 50 eligible students), proofs incl.
  15 months of money (amounts listed by the voivode office; not stated by
  DocRoute because the page is undated), fingerprints in person, 15-month
  first permit, notify within 15 working days. Work without a work permit.
  Visa-free nationals: a note to ask the Office for Foreigners before
  skipping the visa (NAWA does not say they can apply after visa-free entry).
- No date planner for these countries yet. Next: Netherlands, Hungary,
  Italy; then work residence routes.

## CLAUDE.md and npm test (PR #47, 2026-11-05)

- Standing working rules now live in `CLAUDE.md` (branches/PRs, Codex review,
  PR stacks, tests, visual checks, SQL, decisions that cannot change).
- `npm test` runs all tests with Node's type stripping and the loader in
  `scripts/test-loader/` (alias `@/`, `.ts/.tsx/.json`), no tsx.

## Guest / Free / Plus access, map links, Google sign-in (2026-11-05)

- Owner decision: guests browse universities (Explore, Top 100, university
  pages, home map) and stories only; every route page (`/route/*`),
  `/explore/profile`, `/my-route` and `/stories/new` redirects a guest to
  `/auth?mode=signup&next=…` in `src/proxy.ts` (only when Supabase answers;
  nothing is blocked if it is unreachable). Full table: `docs/ACCESS.md`.
- Free (signed in): only the key steps are open (first step of each stage and
  every "Needs attention" step); the rest are locked cards with no text
  (changed 2026-11-05, see "Locked steps" below); no move date / deadline planner (a `move=`
  date in the address is ignored), no PDF/PNG, no saving to My route.
- Plus: everything, plus a new PNG export (canvas, light theme, on device).
  Email reminders are not built yet (note "arrive with the Plus launch").
- Migration `20261105120000_account_plans.sql` (owner runs it): table
  `account_plans` (own row readable, no API writes; owner grants Plus by SQL),
  `has_plus()`; inserting or changing `confirmed_routes` now needs Plus (RLS).
  Tested on local Postgres 16 (free insert refused, plus allowed, expired
  plus refused, anon denied, cascade on account delete). Download my data
  includes `plan`; Privacy row and deletion text updated; Terms updated.
- Page `/plus` compares the plans (footer "Plans", sitemap). Plus is not
  sold: during the beta the owner gives it to testers.
- Home map: every European country with universities in the directory gets
  "Universities in <country>" → `/explore/universities?country=XX`
  (`countryCodeById`, `src/data/university-countries.ts`, test keeps the
  list in sync). Highlighted countries unchanged.
- Google sign-in was already in the code; added the official G mark, a clear
  message when the provider is not enabled in Supabase, and a hint on the
  sign-up screen when a guest arrives from a route. The owner must enable
  the Google provider in Supabase (steps in the PR / chat).
- Limit: route builders run in the browser, so the Free step limit is an
  interface limit; real enforcement needs server-built routes.

## Entry page, story photos, comments and likes (2026-11-04)

- **Entry page at `/`** (owner request): no site navigation, only the
  DocRoute logo, **Log in** (or **My profile** when signed in) and
  **Start your journey**. Title "Start your journey", slogan **"Your move to
  Europe, one route."** Behind the text a dot map of Europe (computed at
  build time from the 110m world atlas in `src/lib/landing-map.ts`; ~3,300
  dots as one SVG path, the page is static) on which a route draws in from
  the south-east and lights up Application, Documents and Residence permit
  in Bratislava. "Start your journey" zooms into the destination, shows the
  route loader ("Opening DocRoute") and opens the site; with reduced motion,
  a modifier key or no JavaScript it is a plain link. Nothing is stored in
  the browser. The global footer (legal links) stays below.
- **Logo** (owner, 2026-11-04): coral "D" with a road leading to a pin,
  redrawn as SVG in `src/components/Logo.tsx` (site coral via `var(--coral)`; road and pin
  are cut out, so they show the background in both themes). Used in the
  header, entry page, sign-in and password screens, `src/app/icon.svg`
  (favicon; the old favicon.ico is removed) and `apple-icon.png`. The
  loader (`RouteLoader`) is the logo with moving road markings and a
  pulsing pin. The logo uses the same coral as the rest of the site (owner choice).
- Entry page details: countries with DocRoute routes or university
  listings in brighter dots (list now shared with the home map in
  `src/data/highlighted-countries.ts`), their capitals as small rings, an
  "Example route: Study in Slovakia" card whose three steps tick as the
  line reaches each stage (wide screens), and a legend for the bright
  dots. The route and button use the logo orange.
- **The full site moved to `/home`** (route builder, map, journey rail):
  logo, "Build my route", all "/#route-builder" and "/?purpose=…" links,
  `/my-route` fallback, sitemap and canonical updated; `/home/loading.tsx`
  shows the same route loader. Log in from the entry page returns to
  `/home`. Signing out and account deletion still land on `/`.
- Header navigation: "Build route" and "Residence routes" removed (owner
  decision 2026-11-04). The "Build my route" button on the right stays.
- Stories (migration `20261104120000_story_photos_comments_likes.sql`, owner
  runs it in the SQL editor; tested twice on local Postgres 16 with
  anon/authenticated roles and a storage stub):
  - **Photos:** up to 4 per story (`story_photos`), shrunk to 1600 px and
    re-encoded as WebP (JPEG on old Safari) in the browser, which drops
    EXIF/GPS; at most 2 MB. Private bucket `story-photos`, files in
    `<user>/<story>/photo-<ms>.webp`, shown through signed URLs valid for
    one hour. A photo is readable only where its story is visible
    (published, own, moderator). Adding or removing a photo sends the
    author's story back to review (also a pending one gets a new
    `updated_at`, so an older review cannot publish it); a registered photo
    path can never be uploaded again (no swapping a reviewed photo). A
    moderator can remove a single photo on the story page without
    unpublishing it; a story whose photos could not be loaded cannot be
    published from the review page.
  - **Comments:** signed-in people with a public name comment on published
    stories (`story_comments`, 2–1000 characters). Every comment starts as
    pending (owner decision: pre-moderation) and appears after a moderator
    publishes it on `/stories/review/comments`; at most 10 pending comments
    per account. Authors and moderators delete comments; no editing.
    The story page shows published comments 100 per page (`?comments=N`)
    and always the reader's own unpublished ones.
  - **Likes:** one per account and published story (`story_likes`). Who liked
    what is private; `story_engagement(ids)` returns only like and
    published-comment counts.
  - Story page `/stories/<id>` (full story, photo gallery, like button,
    comments and comment form; noindex unless published). Cards on
    `/stories` and profiles show a cover photo, like and comment counts and
    "Open, like and comment"; review cards show all photos.
  - Deleting a story removes its photo files first (if that fails, the
    story stays and the delete can be retried); deleting the account removes
    all story photo files first (then rows go with the account through
    foreign keys). Download my data adds `storyPhotos`, `storyComments`,
    `storyLikes`. Privacy and Terms updated (2026-11-04).

## Entry page design from the style board (2026-11-04)

- Owner request: a brighter entry page with a fuller middle, built from
  the DocRoute style board (warm orange, Inter, icon tiles). The accent
  stays the site coral (`var(--coral)`); the board's light orange
  `#FF9F4D` is used only for soft glows.
- Site typeface is now Inter (`next/font/google`, `--font-inter`) instead
  of Arial, everywhere.
- Entry page: "journey" in coral, an arrow on the start button, a warm
  glow over the middle of the map, a small plane that flies the route
  while it draws (hidden with reduced motion or without CSS motion
  paths), four purpose tiles (Study, Work, Family, Business; not links,
  the page keeps one way in) and, on screens 1280px and wider, three
  floating facts over the middle of the map (official sources, deadlines
  counted back, 13 countries).
- The map, its highlighted countries and the route are unchanged. On
  phones the map is faded with a mask and the text starts under it, so
  the title no longer covers the route.
- Logo from the style board in site colours: a globe ring (text colour)
  with Europe (coral; Natural Earth land-50m outline, orthographic,
  clipped and simplified), a plane leaving the ring and a coral route
  swoosh under it; "Doc" in text colour, "Route" in coral. Used in the
  headers, entry, sign-in and password screens, `src/app/icon.svg` (both
  themes) and `src/app/apple-icon.png` (dark tile). The loader shows the
  plane circling the globe.
- Entry map colours (owner request): neutral land dots, coral dots for the
  13 highlighted countries, stop rings in the text colour. Shape, route
  and the country list are unchanged.
- The entry page shows only on the first visit (owner decision):
  `src/proxy.ts` sends `/` to `/home` when the browser has the
  `docroute-visited` cookie (set on the first page view, one year,
  httpOnly, listed in the Cookie Policy) or a Supabase session cookie.

## My route, date fields on phones, full-path button (2026-11-03)

- **Confirm this route** block at the top of every route page (study
  preview SK/CZ, work SK, Czechia, family/business SK, `/route/guide`,
  `/route/full`). Confirming needs an account: signed-out visitors get
  "Sign up to confirm", which returns to the same route page. One confirmed
  route per account; confirming another asks first, then replaces it
  (ticks stay, they are keyed by route). A route is the page address without
  the move date (a guide with another citizenship is another route). Same
  route with a new move date is
  saved again automatically (also flushed when the page is left).
- Page `/my-route` (header link "My route", login required, noindex,
  disallowed in robots): title, purpose, country, confirmed date, move date,
  "X of Y steps done" (ticks in `route_task_progress` counted only for the
  confirmed checklist's step ids, stored with the route), Open / Remove.
  The study preview stores the profile answers in the address, also when
  they came from the saved account profile, so editing the profile later
  does not change the confirmed route.
- Migration `20261103120000_confirmed_routes.sql` (owner runs it in the SQL
  editor): table `confirmed_routes` (one row per user, `route_path` must
  start with `/route/`, no `//`, `\` or spaces), RLS own row only, anon has
  no access, `confirmed_at`/`updated_at` set by a trigger (`confirmed_at`
  changes only when a route with other answers replaces it), removed with the
  account (foreign key cascade). Tested twice on local Postgres 16 with
  anon/authenticated roles. Download my data includes `confirmedRoute`;
  Privacy data row and deletion text updated (2026-11-03).
- Date fields: one `DateInput` for all move/start dates. It keeps the
  picked value locally and writes only complete dates to the address, so
  phone pickers no longer jump back while the address updates; iOS gets a
  normal-size field and 16px text (no zoom on focus). Not checked on a real
  iPhone/Android by DocRoute; the owner checks on his phone.
- University page: the main route action ("Build my full path", "Build my
  route" or "Build my <field> route") stays in a bar at the bottom of the
  screen (full width on phones); "University website" is a secondary
  button when a route exists. In route results the coming-soon card's
  "Build my full path" is now the main button.

## Full study path (2026-11-01)

- Every "coming soon" listing (all of `pending-programs.ts` and
  `pending-programs-europe.ts`) has a **Build my full path** button: on the
  listing card (results and university page), on the university card in
  results, and as the university page's main action when the university has
  only coming-soon listings. Verified programmes keep their personalised
  Preview Route.
- Page `/route/full?group=<id>&citizenship=XX&status=<status>` (noindex,
  answers in the URL, progress ticks via `route_task_progress` with key
  `full-<group>:<version>:<answers>`). Two questions (citizenship, current
  status); prefilled from the profile when one is linked or saved (status
  translated with `profileForDestination`).
- Stages (`src/lib/full-path.ts`, `buildFullPath`): Choose and check (read
  the rules; "watch for the approved rules" unless the intake's rules are
  published) → Application → Entrance requirements → Admission → enrolment
  (each item taken verbatim from `referenceRules.overview`, labelled as
  last year's rules or the intake's published rules; never matched against
  the profile) → residence. Key facts in the side panel are the reference
  facts.
- Residence: Slovakia and Czechia reuse the verified study residence
  routes (`buildSlovakiaResidenceStage`, `czechStudyRoute`). Elsewhere the
  step is marked "not verified by DocRoute yet" and links to the official
  page (`src/data/study-residence-links.ts`, checked 2026-11-01): EU
  Immigration Portal "Student in <country>" pages (all EU countries except
  Denmark, whose portal page only points to nyidanmark.dk), New to Denmark
  for Denmark, ch.ch for Switzerland (EU/EFTA registration with the canton,
  or a permit before arrival with a study plan, CV and leaving
  confirmation), Your Europe for EU citizens in another EU country
  (enrolment, health insurance, enough resources; registration may be
  required after 3 months). No fee, deadline or document list is stated
  for countries without a verified route.
- Next: verified student residence routes country by country (3–4 per PR),
  replacing the official-link step.

## Waitlist for the full route (PR #16)

- "Want the full route?" block (`WaitlistCta`) at the end of every route
  page: study SK/CZ (`RoutePreviewScreen`), work SK, Czechia. Email +
  unticked consent box (16+, one email about the full route, kept at most
  12 months, withdraw any time, link to `/privacy#waitlist`). Honeypot
  field; a repeat signup shows the same success message. Nothing is stored
  in the browser.
- Table `waitlist_signups` (migration `20261028180000_waitlist.sql`):
  email (lower-case), route (`study-sk`, `study-cz`, `work-sk`, `work-cz`),
  consent version (`WAITLIST_CONSENT_VERSION` in `src/lib/waitlist.ts`;
  change it when the consent wording changes), `consented_at` set by the
  database. RLS: anon and signed-in users may only insert those three
  columns; no one can read, change or delete rows through the API. The
  owner reads the list in the Supabase dashboard (Table Editor).
  `leave_waitlist(email)` removes an email without saying whether it was
  listed (form on `/privacy#waitlist`); `delete_my_account()` also deletes
  rows with the account's email.
- Privacy Policy: waitlist row (consent, Art. 6(1)(a)), Supabase role,
  summary line, deletion and security text, "Leaving the waitlist" form.
- The migration was run twice on a local Postgres 16 with Supabase-like
  roles: inserts work, reads/updates/deletes are denied, bad email or
  route rejected, duplicates give 23505, leave and account deletion work.
- Limits: no rate limit beyond the honeypot (bots could add fake emails);
  "Download my data" does not include waitlist rows (they cannot be read
  through the API). Delete rows after the one announcement email or after
  12 months.

## Recently shipped (October 2026)

- PR #29 (2026-10-29): 25 coming-soon programmes across 12 European
  countries (computing, medicine, law, economics) in a separate data file;
  eight more countries highlighted on the map.

- PR #28 (2026-10-29): Slovakia family-reunification and business
  (trade licence, company executive) routes; Family and Business enabled
  on the home form.

- PR #27 (2026-10-29): new fields Law and Economics & Business (replacing
  Dentistry and Pharmacy), with Comenius, Charles and Masaryk law faculties,
  EUBA and VŠE NF as coming soon; Charles 1. LF and Masaryk LF medicine.

- PR #26 (2026-10-29): ČVUT FIT Informatika 2027/28 is a verified route
  with its own matching policy and tests; removed from "coming soon".

- PR #25 (2026-10-29): Austria (TU Wien, Uni Wien, JKU AI, MedAT at MedUni
  Wien) and KIT as coming soon with reference rules; Austria highlighted.
  Test host aliases: tuwien.ac.at → tuwien.at, meduniwien.at →
  meduniwien.ac.at and medizinstudieren.at (joint MedAT site).

- PR #24 (2026-10-29): Czech computing bachelors at ČVUT FIT, VUT Brno FIT
  and Masaryk FI as coming soon with their published 2027/28 rules. FIT
  VUT sources are on vut.cz (the catalog still says vutbr.cz; the test
  allows this alias). Not checked: FIT VUT fee and the directive PDF, MU
  fee and Czech-language rules (pages not reachable or silent).
  Results pages no longer show the separate "Coming soon" block (owner
  request): those universities are ordinary cards in the list with a
  "Coming soon" badge (exact status in the tooltip) and a line saying
  whether the next intake's rules are out; the rules summary stays on the
  university page. The block is still shown when a route profile has no
  verified match, and on the university page.

- PR #23 (2026-10-29): Slovak medicine (LF UK Bratislava, JLF UK Martin
  with published 2027/28 rules, UPJŠ LF Košice) and TUM Informatics as
  coming soon with reference rules; Germany highlighted on the home map;
  status "Rules published, route not built yet".

- PR #22 (2026-10-29): STU FIIT and TUKE FEI computing bachelors added as
  coming soon with their 2026/27 rules; new status "Rules not published
  yet" shown on cards, the university page and How it works. On the
  university page the three requirement cards (application documents,
  entrance requirements, after admission) are filled from last year's
  rules (`previousCycle.overview`), labelled "2026/27, for orientation".
- PR #21 (2026-10-29): last year's approved rules for "coming soon"
  programs, starting with Comenius FMFI 2026/27 (deadline, fee, no entrance
  exam, grade/percentile thresholds per program, SCIO for non-EU schools,
  Slovak B1, recognition of foreign certificates).

- PR #20 (2026-10-28): README rewritten as an English case study for the
  portfolio (beta results section to fill after interviews);
  `docs/launch-kit.md` with the beta post (RU/EN), interview questions and
  the demo-video script.
- PR #19 (2026-10-28): feedback form and consent-gated visit statistics
  (see Legal status and beta).
- PR #18 (2026-10-28): "Save as PDF" on every route page (browser print
  dialog; `@media print` in `globals.css` forces the light theme, hides
  the header, breadcrumbs, waitlist, edit links, footer and cookie banner
  via `data-print-hide`, and a print-only note gives the date and says
  the rules may change). No PDF library, nothing leaves the device.
  Accessibility fix for open question 6.
- PR #17 (2026-10-28): Czech study permit for holders of a Slovak (or
  other EU) study permit: where to file (see Czechia residence).
- PR #16 (2026-10-28): waitlist "I want the full route" (see above).

- PR #15 (2026-10-28): public beta legal basis — Terms, Privacy,
  Cookies, footer, BETA badge, sign-up consent line, data download and
  account deletion.
- PR #14 (2026-10-28): computer science bachelor link and language for
  each Top 100 university, English filter.
- PR #13 (2026-10-28): Charles University MFF Informatika verified (see
  above); the study route uses Czech residence stages and planner.
  Checked on the Preview: UA citizen, Slovak school, SK maths 75%+ →
  waiver, no Czech proof, CZK 1,000, planner dates.
- PR #12 (2026-10-28): Czech residence routes for study and work at
  `/route/czechia` (same layout as the Slovak work route), home form and
  map. Checked on the Preview: UA student from abroad (planner, 78,250
  CZK), Blue Card questionnaire, Czechia highlighted.

- PR #11 (2026-10-28): EU/EEA/Swiss registration and current-resident
  routes for Slovakia (see the section above). Checked on the Preview:
  UA citizen with study residence, DE citizen, change of purpose with move
  date 15 Sep 2027 (no criminal-record or medical items), new form options.

- PR #10 (2026-10-27): Top 100 page (see the section above), Explore hero
  link and a "#N in Europe's top 100" button on university pages. Checked
  on the Preview: 100 cards, search and country filter, both themes,
  375px width without sideways scroll.
- PR #9 (2026-10-27): UNIZA rules and planner holidays.
  - Slovak test exemption: rechecked points 2 and 9–13 of the FRI 2027/28
    rules on 2026-10-27. Point 11 exempts foreign applicants "from the
    Czech Republic"; point 2 describes a foreign applicant as one who
    finished school abroad; citizenship is not mentioned. The test is now
    skipped only when citizenship and school country are both SK/CZ,
    required when neither is, and otherwise the route says "ask the
    faculty" (Needs clarification) with the test as fallback
    (`slovakTestRule` in `match-programs.ts`).
  - The route shows the UNIZA test once (language task); the separate
    document task was removed from the route.
  - The "Profile aligned" match status was removed: the faculty always
    keeps a step, so "Steps remaining" is the best status. A met condition
    inside the route is labelled "Condition met".
  - Planner counts Slovak public holidays (see residence code structure).
  - Checked on the Preview: CZ citizen schooled in UA gets "ask the
    faculty"; no duplicate test task; move date 25 Mar 2027 gives the
    arrival report by 1 Apr 2027 (Easter skipped).

- PR #8 (merged 2026-10-24): **light theme** and Explore redesign.
  - Theme follows the system setting until the person presses the
    sun/moon button in the header (also on the sign-in page); the choice is
    stored in `localStorage` (`docroute-theme`) and applied by an inline
    script in `<head>` before paint (`src/lib/theme.ts`,
    `ThemeToggle.tsx`). Every colour is written as
    `light-dark(<light>, <dark>)`; dark values were kept as designed. Write
    new colours the same way; `light-dark()` takes colours only (not
    gradients or whole shadows).
  - By design the sign-in form panel stays light ("paper") in both themes,
    and university illustrations (`UniversityImage`) stay dark.
  - Explore: destination and field lists with search (shown once a list
    has more than 6 items) that scroll inside their panels; "Verified"
    badges are derived from `verified-programs.ts`; the country pop-up was
    removed; sticky selection bar (compact on phones). The background glow
    no longer shows a vertical seam on wide screens.
  - The university page now has the site header; on phones "Log in" is an
    icon button so the header fits one row.
  - Not checked: the account page while signed in (needs a login).

- Evidence-based matching for the UNIZA FRI scenario (PR #2), including
  date handling in Europe/Bratislava, exam-waiver evidence and language
  proof rules.
- Fixes: open redirect after login; residence route based on citizenship
  (EEA/Swiss, contradictory statuses); progress/bookmark sync no longer
  re-adds items removed on another device; personalised URLs are noindex;
  Preview links respect `canBuildRoute`; Explore no longer scrolls sideways
  on phones; Arial Black rendering of 800-weight text replaced with 700.
- Account page redesign (PR #4); unverified university pages point to the
  verified route (PR #3).
- PR #7 (merged 2026-10-23): work route for Slovakia (single permit, EU
  Blue Card, Slovak graduates) with questionnaire, progress and start-date
  planner; "Work" selectable on the home form. The route page was
  redesigned after owner feedback: compact header with a plain summary,
  horizontal route strip (one date per stage, vertical on phones),
  checklist rows instead of cards, one warning block, sticky side panel
  (start date, key dates, progress), minimum text size 12px. Checked in the
  browser on the Preview at desktop and 375px width.
- PR #6 (merged 2026-10-23): Comenius FMFI computing programs listed as
  "coming soon"; separate How it works page behind the header button.
- PR #5: map fades into the page and highlights only Slovakia; move-purpose
  foundation; residence recheck; rename to DocRoute; residence code split
  into shared steps and purposes; deadline planner.

## Working agreement with the owner

- The owner is not a programmer; talk in Russian and explain any action
  they must take step by step.
- Work in a branch with a PR; check tests and the Vercel Preview (open it
  in the built-in browser; Previews need a Vercel login), then send the
  owner the direct Preview link. Merge into `main` only after the owner
  says «мержим».
- Facts in routes come only from official sources with a check date; no
  rules borrowed from another year, field, degree or purpose.

## How changes are verified

- Unit tests: `npm test` (284 tests on 2026-11-04).
- SSR smoke test after a build: `npm run test:ssr`.
- Vercel build on every push (type check included).
- Manual browser walkthrough of the Slovakia → Computer Science scenario
  on the Preview before merging.

Note: in the Claude cloud environment npm packages could not be installed,
so tests were run with Node's built-in TypeScript support and a small local
module loader; ESLint and `test:ssr` were not run there. Light/dark text
contrast was checked with a script in the browser on the Preview for every
public page (no remaining issues except the sign-in form's small grey
text, which is unchanged from before).

## Open questions and known limits

1. **UNIZA Slovak test exemption** (resolved in PR #9 as "ask the faculty"
   when citizenship and school country differ). A written answer from the
   faculty would let DocRoute decide these cases.
2. (resolved in PR #9) Duplicate UNIZA test tasks.
3. (resolved in PR #9) "Profile aligned" removed as unreachable.
4. (resolved in PR #11) EU/EEA/Swiss registration route for Slovakia.
   Family members of EU citizens are not covered.
5. **Signed-in flows on Previews**: email links may redirect to production
   because Preview URLs are not in the Supabase redirect allow list.
6. (resolved in PR #18) The university image's `role="img"` is now on an
   inner element; the photo credit links sit outside it.
7. **Planner limits**: Slovak public holidays are counted only as listed in
   Act 241/1993 (future one-year exceptions must be added by hand); steps
   that start at card collection (insurance, medical report) are relative, not
   dated. The planner uses the maximum 90-day decision period.
8. The production domain is still `docroute-student.vercel.app`; renaming
   the Vercel project/domain is a separate decision.

## Next steps

1. Watch the FMFI bachelor admission page for the approved Comenius FMFI
   2027/28 rules; then verify and add the four programs with their own
   matching policy.
2. Ask UNIZA FRI in writing how the Czech exemption applies to mixed
   citizenship/school cases (open question 1).
3. Add the next verified faculty or program only with its own official
   sources (STU FIIT and TUKE FEI once their 2027/28 rules are out).
4. Work route: cross-check key paragraphs of Act 404/2011 (and the
   Employment Services Act for the 20-working-day rule) on Slov-Lex;
   consider seasonal work and the Blue Card salary amount.
5. Top 100 follows Leiden 2026 (done 2026-11-04). Recheck deadlines once universities publish 2027/28
   rules.
6. Add more "coming soon" faculties with last year's rules (next: other
   fields such as medicine in English, Czech computing faculties) while
   their 2027/28 rules are not out. Watch FIIT/FEI for 2027/28 rules.
7. Family and business for Slovakia are live (PR #28). Next: family of
   EU/Slovak citizens, and recheck the IOM business articles directly.

## Locked steps on Free; Germany and Switzerland verified (2026-11-05)

- Free plan: `stepAccess()` in `src/lib/access.ts` opens the first step of
  each stage and every "Needs attention" step. Every other step stays in its
  place as `LockedStep` (`src/components/Plus.tsx`): a lock, grey bars and
  "Step locked · open with Plus". Its title, text, date and source links are
  never rendered (not blurred text: nothing to screenshot or read in the
  HTML). Under the stage: "N steps in this stage locked". Used by all six
  route screens. The route data is still in the JavaScript bundle; the
  server-built checklist comes with the paid route PR.
- Germany (`country-guides.ts`, checked 2026-11-05): work (EU Blue Card
  €50,700 / €45,934.20, skilled worker incl. €55,770 from age 45,
  Opportunity Card 6 points and €1,091 a month), family (Blue Card/skilled
  sponsor without German or living space; other sponsors with basic German,
  housing, livelihood; children rules from BAMF), business (§ 21
  self-employment, § 21(5) freelancers). Sources: Make it in Germany
  ("as of January 2026" sheets, pages of 30 Oct / 4 Nov 2026), BAMF,
  Auswärtiges Amt. Visa fee €75, residence permit up to €100. Study
  residence was already verified (#49).
- Switzerland: work (qualified worker, Swiss graduate's 6 months), family
  (non-EU/EFTA sponsor: housing, no social assistance, A1 oral course
  enrolment, 5 years / 1 year for children over 12), business
  (self-employed: overall economic interest, business plan), and the
  student residence route in the full study path (canton before arrival,
  visa if needed, 15 h/week after 6 months). Sources: SEM (5 Jul 2026,
  procedure 22 Dec 2020) and ch.ch. No amounts: the pages state none.
- `/countries`: "study" now also counts a verified student residence route,
  so Austria, Germany, Poland and Switzerland show it. `verifiedGuideCountries`
  in `country-list.ts` = AT, CZ, DE, CH (a test keeps it in step with the
  guides).
