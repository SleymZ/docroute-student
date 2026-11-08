// The welcome email sent once after someone creates a DocRoute account
// (owner request 2026-11-08). Plain HTML tables with inline styles, because
// email apps ignore style sheets; colours follow the site's light theme
// (cream page, coral accent #d4502f, ink #1c1b1f). Every language of the
// site has its own text; the visitor's site language picks it.

import type { Locale } from "@/i18n/config";

type Copy = {
  subject: string;
  preheader: string;
  eyebrow: string;
  title: string;
  intro: string;
  stepsTitle: string;
  steps: [title: string, text: string][];
  cta: string;
  beta: string;
  sign: [string, string];
  disclaimer: string;
  why: string;
  privacy: string;
};

const COPY: Record<Locale, Copy> = {
  en: {
    subject: "Welcome to DocRoute — thank you for signing up",
    preheader: "Your route to Europe, step by step, with official sources.",
    eyebrow: "Welcome",
    title: "Thank you for joining DocRoute",
    intro: "We built DocRoute because the rules for moving to Europe are scattered across dozens of websites, often in a language you don't speak. Here they come together in one route, with a link to the official source for every step.",
    stepsTitle: "Where to start",
    steps: [
      ["Build your route", "Choose your citizenship and your goal — study, work, family or business — and see every step in order."],
      ["Find a university", "2,598 universities in 46 countries, and a Top 100 with the last day to apply."],
      ["Check your profile", "Compare your profile with admission rules: what is met, what still needs doing, what is missing."],
    ],
    cta: "Open DocRoute",
    beta: "DocRoute is a free beta. If a rule looks wrong or something is hard to understand, just reply to this email — it comes straight to us.",
    sign: ["Good luck with your move,", "The DocRoute team"],
    disclaimer: "DocRoute is a preparation tool, not legal advice. Universities and authorities make every decision.",
    why: "You received this email once because you created an account on DocRoute.",
    privacy: "Privacy Policy",
  },
  ru: {
    subject: "Добро пожаловать в DocRoute — спасибо за регистрацию",
    preheader: "Ваш маршрут в Европу — шаг за шагом, с официальными источниками.",
    eyebrow: "Добро пожаловать",
    title: "Спасибо, что вы с DocRoute",
    intro: "Мы сделали DocRoute, потому что правила переезда в Европу разбросаны по десяткам сайтов и часто написаны на языке, которого вы не знаете. Здесь они собраны в один маршрут, и у каждого шага есть ссылка на официальный источник.",
    stepsTitle: "С чего начать",
    steps: [
      ["Постройте маршрут", "Выберите гражданство и цель — учёба, работа, семья или бизнес — и увидите все шаги по порядку."],
      ["Найдите вуз", "2 598 вузов в 46 странах и Топ-100 с последним днём подачи документов."],
      ["Проверьте профиль", "Сравните свой профиль с правилами приёма: что выполнено, что ещё нужно сделать и чего не хватает."],
    ],
    cta: "Открыть DocRoute",
    beta: "DocRoute — бесплатная бета. Если правило кажется неверным или что-то непонятно, просто ответьте на это письмо — оно придёт прямо к нам.",
    sign: ["Удачи с переездом!", "Команда DocRoute"],
    disclaimer: "DocRoute — инструмент подготовки, а не юридическая консультация. Все решения принимают университеты и ведомства.",
    why: "Это письмо пришло один раз, потому что вы создали аккаунт в DocRoute.",
    privacy: "Политика конфиденциальности",
  },
  es: {
    subject: "Te damos la bienvenida a DocRoute: gracias por registrarte",
    preheader: "Tu ruta a Europa, paso a paso, con fuentes oficiales.",
    eyebrow: "Te damos la bienvenida",
    title: "Gracias por unirte a DocRoute",
    intro: "Creamos DocRoute porque las normas para mudarse a Europa están repartidas en decenas de sitios web, a menudo en un idioma que no hablas. Aquí se reúnen en una sola ruta, con un enlace a la fuente oficial en cada paso.",
    stepsTitle: "Por dónde empezar",
    steps: [
      ["Crea tu ruta", "Elige tu ciudadanía y tu objetivo —estudios, trabajo, familia o negocios— y ve todos los pasos en orden."],
      ["Encuentra universidad", "2598 universidades en 46 países y un Top 100 con el último día para solicitar."],
      ["Revisa tu perfil", "Compara tu perfil con las normas de admisión: qué cumples, qué te queda por hacer y qué falta."],
    ],
    cta: "Abrir DocRoute",
    beta: "DocRoute es una beta gratuita. Si una norma parece incorrecta o algo no se entiende, responde a este correo: nos llega directamente.",
    sign: ["¡Suerte con tu mudanza!", "El equipo de DocRoute"],
    disclaimer: "DocRoute es una herramienta de preparación, no asesoría legal. Las universidades y las autoridades toman todas las decisiones.",
    why: "Has recibido este correo una sola vez porque creaste una cuenta en DocRoute.",
    privacy: "Política de privacidad",
  },
  zh: {
    subject: "欢迎来到 DocRoute，感谢你的注册",
    preheader: "你的欧洲之路：一步一步，附官方来源。",
    eyebrow: "欢迎",
    title: "感谢你加入 DocRoute",
    intro: "我们做 DocRoute，是因为搬到欧洲的各种规定分散在几十个网站上，而且常常是你看不懂的语言。在这里，它们汇成一条路线，每一步都附有官方来源链接。",
    stepsTitle: "从这里开始",
    steps: [
      ["建立你的路线", "选择你的国籍和目的：留学、工作、家庭或创业，按顺序查看每一步。"],
      ["找到大学", "46 个国家的 2598 所大学，以及附申请截止日的前 100 名榜单。"],
      ["检查你的条件", "把你的条件和招生规定对比：哪些已满足，哪些待完成，哪些还缺少。"],
    ],
    cta: "打开 DocRoute",
    beta: "DocRoute 目前是免费测试版。如果某条规定看起来有误或难以理解，直接回复这封邮件即可，我们会收到。",
    sign: ["祝你搬家顺利！", "DocRoute 团队"],
    disclaimer: "DocRoute 是准备工具，不是法律意见。所有决定都由大学和主管部门作出。",
    why: "你创建了 DocRoute 账户，所以收到这封邮件（只会发送一次）。",
    privacy: "隐私政策",
  },
  hi: {
    subject: "DocRoute में आपका स्वागत है — रजिस्टर करने के लिए धन्यवाद",
    preheader: "यूरोप का आपका मार्ग — कदम दर कदम, आधिकारिक स्रोतों के साथ।",
    eyebrow: "स्वागत है",
    title: "DocRoute से जुड़ने के लिए धन्यवाद",
    intro: "हमने DocRoute इसलिए बनाया क्योंकि यूरोप जाने के नियम दर्जनों वेबसाइटों पर बिखरे होते हैं, अक्सर ऐसी भाषा में जो आप नहीं जानते। यहाँ वे एक मार्ग में जुड़ जाते हैं, और हर कदम के साथ आधिकारिक स्रोत का लिंक होता है।",
    stepsTitle: "कहाँ से शुरू करें",
    steps: [
      ["अपना मार्ग बनाएँ", "अपनी नागरिकता और मकसद चुनें — पढ़ाई, नौकरी, परिवार या बिज़नेस — और हर कदम क्रम से देखें।"],
      ["यूनिवर्सिटी ढूँढें", "46 देशों की 2,598 यूनिवर्सिटी, और आवेदन की आख़िरी तारीख़ के साथ टॉप 100।"],
      ["अपनी प्रोफ़ाइल जाँचें", "अपनी प्रोफ़ाइल को प्रवेश नियमों से मिलाएँ: क्या पूरा है, क्या अभी करना है और क्या कम है।"],
    ],
    cta: "DocRoute खोलें",
    beta: "DocRoute एक मुफ़्त बीटा है। अगर कोई नियम ग़लत लगे या कुछ समझ न आए, तो बस इस ईमेल का जवाब दें — यह सीधे हम तक पहुँचता है।",
    sign: ["आपके सफ़र के लिए शुभकामनाएँ,", "DocRoute टीम"],
    disclaimer: "DocRoute तैयारी का टूल है, कानूनी सलाह नहीं। हर फ़ैसला यूनिवर्सिटी और सरकारी विभाग करते हैं।",
    why: "आपको यह ईमेल एक बार मिला है क्योंकि आपने DocRoute पर खाता बनाया।",
    privacy: "निजता नीति",
  },
};

/** Where each step of the email leads. */
const STEP_PATHS = ["/home", "/explore/top", "/explore/profile"] as const;

export function welcomeCopy(locale: Locale): Copy {
  return COPY[locale] ?? COPY.en;
}

const esc = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

// The brand name always reads Doc + coral Route, also inside sentences.
const brand = (value: string) =>
  esc(value).replace(/DocRoute/g, 'Doc<span style="color:#d4502f">Route</span>');

const FONT = "Inter,-apple-system,'Segoe UI',Roboto,'Noto Sans','Noto Sans Devanagari','PingFang SC','Microsoft YaHei',Arial,sans-serif";

export function welcomeEmail(locale: Locale, siteUrl: string) {
  const c = welcomeCopy(locale);
  const site = siteUrl.replace(/\/$/, "");
  const lang = locale === "zh" ? "zh-Hans" : locale;

  const steps = c.steps
    .map(([title, text], i) => `
        <tr>
          <td valign="top" width="44" style="padding:0 0 18px 0">
            <div style="width:32px;height:32px;border-radius:16px;background:#fbe9e3;color:#d4502f;font:700 15px/32px ${FONT};text-align:center">${i + 1}</div>
          </td>
          <td valign="top" style="padding:4px 0 18px 0;font:400 15px/1.55 ${FONT};color:#4a4650">
            <a href="${site}${STEP_PATHS[i]}" style="font-weight:700;color:#1c1b1f;text-decoration:none">${esc(title)}</a><br>${esc(text)}
          </td>
        </tr>`)
    .join("");

  const html = `<!DOCTYPE html>
<html lang="${lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light">
<title>${esc(c.subject)}</title>
</head>
<body style="margin:0;padding:0;background:#f3efe8">
<div style="display:none;max-height:0;overflow:hidden;opacity:0">${esc(c.preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f3efe8">
  <tr>
    <td align="center" style="padding:32px 16px">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px">
        <tr>
          <td style="padding:0 4px 20px 4px">
            <a href="${site}/home" style="text-decoration:none">
              <img src="${site}/email/docroute-logo.png" width="40" height="40" alt="" style="vertical-align:middle;border:0">
              <span style="vertical-align:middle;font:800 22px ${FONT};letter-spacing:-0.02em;color:#1c1b1f;padding-left:8px">Doc<span style="color:#d4502f">Route</span></span>
            </a>
          </td>
        </tr>
        <tr>
          <td style="background:#fffdf9;border:1px solid #e6dfd4;border-radius:20px;padding:36px 32px">
            <div style="font:700 12px ${FONT};letter-spacing:0.14em;text-transform:uppercase;color:#d4502f">${esc(c.eyebrow)}</div>
            <h1 style="margin:10px 0 16px 0;font:800 28px/1.2 ${FONT};letter-spacing:-0.02em;color:#1c1b1f">${brand(c.title)}</h1>
            <p style="margin:0 0 26px 0;font:400 16px/1.6 ${FONT};color:#4a4650">${esc(c.intro)}</p>
            <div style="margin:0 0 14px 0;font:700 16px ${FONT};color:#1c1b1f">${esc(c.stepsTitle)}</div>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${steps}
            </table>
            <table role="presentation" cellpadding="0" cellspacing="0" style="margin:8px 0 28px 0">
              <tr>
                <td style="border-radius:999px;background:#d4502f">
                  <a href="${site}/home" style="display:inline-block;padding:14px 30px;font:700 16px ${FONT};color:#ffffff;text-decoration:none;border-radius:999px">${esc(c.cta)} &rarr;</a>
                </td>
              </tr>
            </table>
            <div style="background:#fbf1ec;border-radius:14px;padding:16px 18px;font:400 14px/1.55 ${FONT};color:#4a4650">${esc(c.beta)}</div>
            <p style="margin:26px 0 0 0;font:400 15px/1.6 ${FONT};color:#1c1b1f">${esc(c.sign[0])}<br><strong>${brand(c.sign[1])}</strong></p>
          </td>
        </tr>
        <tr>
          <td style="padding:20px 8px 0 8px;font:400 12px/1.6 ${FONT};color:#8a8590">
            ${esc(c.disclaimer)}<br>${esc(c.why)}<br>
            <a href="${site}/privacy" style="color:#8a8590">${esc(c.privacy)}</a> &middot; <a href="mailto:docroutestu@gmail.com" style="color:#8a8590">docroutestu@gmail.com</a>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
</body>
</html>`;

  const text = [
    c.title,
    "",
    c.intro,
    "",
    `${c.stepsTitle}:`,
    ...c.steps.map(([title, body], i) => `${i + 1}. ${title} — ${body}\n   ${site}${STEP_PATHS[i]}`),
    "",
    `${c.cta}: ${site}/home`,
    "",
    c.beta,
    "",
    c.sign[0],
    c.sign[1],
    "",
    "—",
    c.disclaimer,
    c.why,
    `${c.privacy}: ${site}/privacy`,
  ].join("\n");

  return { subject: c.subject, html, text };
}
