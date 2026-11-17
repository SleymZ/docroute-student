# "Hooks" series: 3 videos × English and Hindi, voice only

Hook in the first two seconds, then a rhythm of calm scenes and spikes
(zoom punch with a flash, a number that counts up, a comparison that slams
in, a stamp) every 3–5 seconds, with real DocRoute screens in a phone.
1080×1920, 30 fps, 29–51 s, voice only (Kokoro: English `am_michael`, Hindi
`hm_omega`); the owner adds music in the app, quietly under the voice.

Every fact is from the site's verified data (see the header of
`make_scripts.py`). The end card and captions point to **docroute.app**.

## Build

```
next build && next start -p 3100        # local site (font patch for Inter, see CLAUDE.md)
node marketing/hooks/capture.mjs        # phone screens en/hi + shots/marks.json
python3 marketing/hooks/make_scripts.py # scripts.json
python3 marketing/hooks/voice.py        # out/timeline.json + voice tracks
node marketing/hooks/render.mjs         # out/DocRoute-hooks-<id>-<lang>.mp4
node marketing/hooks/render.mjs 02 --langs hi --frames 2,10   # stills only
```

Hindi screens need the Noto Sans Devanagari font installed for Chrome.

## Where to post

- **English** → TikTok `docrouteen`, Instagram `docroute_en` (Reels), YouTube (Shorts).
- **Hindi** → Instagram Reels and YouTube Shorts only: TikTok is still
  banned in India (2020 ban), so Hindi on TikTok reaches almost no one.
- Bio / description links: `docroute.app/go/tt-en`, `docroute.app/go/ig-en`,
  `docroute.app/go/yt-en`; for Hindi posts `docroute.app/go/ig-hi`,
  `docroute.app/go/yt-hi`.

## Captions

**01 · Your visa can arrive after your first class**

EN: Your visa can arrive after your first class 😬 In Slovakia the police
can take up to 90 days to decide on residence for study, in Czechia up to
60. Classes in September? Plan backwards. Every 2027/28 application
deadline, checked on official pages: link in bio.
#studyabroad #studyineurope #slovakia #czechia #studentvisa #internationalstudents

HI: वीज़ा पहली क्लास के बाद? 😬 स्लोवाकिया में पढ़ाई के निवास परमिट पर
पुलिस का फ़ैसला 90 दिन तक, चेकिया में 60 दिन तक। क्लास सितंबर में है तो
पीछे से गिनकर योजना बनाएँ। 2027/28 की सारी आख़िरी तारीख़ें, आधिकारिक पेजों
से: लिंक बायो में।
#studyabroad #studyineurope #indianstudents #slovakia #czechia #studentvisa

**02 · Same job, two permits**

EN: Same job in Slovakia, two permits. EU Blue Card: decision within 30
days, up to 5 years. Single permit: 60 days, up to 2 years. Documents no
older than 90 days, and report your arrival within 3 working days. Your
steps in order: link in bio.
#workineurope #eubluecard #slovakia #workpermit #jobsineurope

HI: स्लोवाकिया में एक नौकरी, दो परमिट। EU ब्लू कार्ड: 30 दिन में फ़ैसला,
5 साल तक। सिंगल परमिट: 60 दिन, 2 साल तक। दस्तावेज़ 90 दिन से पुराने नहीं,
और पहुँचकर 3 कार्य-दिवसों में सूचना। सारे कदम क्रम से: लिंक बायो में।
#workineurope #eubluecard #indiansinEurope #slovakia #workpermit

**03 · India → Europe? Start with this stamp**

EN: Moving to Europe from India? If the authority asks for legalised
documents, India uses the MEA apostille: first the state government, union
territory or chamber of commerce, then an MEA outsourced agency, not the MEA
directly. And a Schengen visa does not cover Ireland. Link in bio.
#indianstudents #apostille #studyineurope #indiansinEurope #mea

HI: भारत से यूरोप? अगर अधिकारी वैध दस्तावेज़ माँगें तो MEA एपोस्टिल:
पहले राज्य / केंद्र शासित प्रदेश / चैंबर ऑफ़ कॉमर्स, फिर MEA की अधिकृत
एजेंसी, सीधे MEA नहीं। और शेंगेन वीज़ा आयरलैंड के लिए मान्य नहीं। लिंक बायो
में।
#indianstudents #apostille #studyineurope #indiansinEurope #mea
