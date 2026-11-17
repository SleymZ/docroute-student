"""Scripts for the "hooks" series (en, hi): short videos with a hook in the
first two seconds and a rhythm of calm scenes (about 70% attention) and
spikes (zoom punch, counter, comparison, stamp) every few seconds, with real
DocRoute screens. Every fact comes from the site's verified data:
- src/data/slovakia-residence.ts (90 days, 6 years), czechia-residence.ts (60)
- src/data/slovakia-work.ts (Blue Card 30 days / 5 years, single permit
  60 days / 2 years, documents max 90 days old, 6-month contract, arrival
  report within 3 working days)
- src/data/citizenship-notes.ts (MEA apostille, India visa notes, Ireland)
- the soonest verified deadline (21 February, Comenius Medicine) on /deadlines
python3 marketing/hooks/make_scripts.py  ->  scripts.json
"""
import json, os

here = os.path.dirname(os.path.abspath(__file__))
URL = "docroute.app"

END = {
    "en": {"type": "end", "say": "Free. Link in bio: docroute dot app.", "url": URL, "sub": "Free · official sources · link in bio"},
    "hi": {"type": "end", "say": "मुफ़्त है। लिंक बायो में: डॉकरूट डॉट ऐप।", "url": URL, "sub": "मुफ़्त · आधिकारिक स्रोत · लिंक बायो में"},
}

V = {}

V["01-visa-after-class"] = {
    "en": [
        {"type": "hook", "say": "Your visa can arrive after your first class.", "text": "Your visa can arrive <b>after</b> your first class"},
        {"type": "count", "say": "In Slovakia, the police can take up to ninety days to decide on residence for study.", "to": 90, "unit": "days", "label": "police decision on student residence · Slovakia"},
        {"type": "site", "say": "And you can only file once the university has admitted you.", "shot": "deadlines", "target": "stats", "zoom": 1.0},
        {"type": "split", "say": "Classes in September? Then file by early June. In Czechia, plan for up to sixty days.",
         "a": {"title": "Slovakia", "lines": ["up to 90 days", "file by early June"]}, "b": {"title": "Czechia", "lines": ["up to 60 days", "file by early July"]}, "tag": "Classes start in September"},
        {"type": "site", "say": "The first application deadline is February twenty-first.", "shot": "deadlines", "target": "card", "zoom": 1.35},
        {"type": "line", "say": "DocRoute puts every step in order, with the official source.", "text": "Every step in order.<br><b>Every source official.</b>"},
        END["en"],
    ],
    "hi": [
        {"type": "hook", "say": "आपका वीज़ा आपकी पहली क्लास के बाद आ सकता है।", "text": "वीज़ा पहली क्लास के <b>बाद</b>?!"},
        {"type": "count", "say": "स्लोवाकिया में पढ़ाई के निवास परमिट पर फ़ैसला करने में पुलिस नब्बे दिन तक ले सकती है।", "to": 90, "unit": "दिन", "label": "पढ़ाई का निवास परमिट · पुलिस का फ़ैसला · स्लोवाकिया"},
        {"type": "site", "say": "और आवेदन तभी होता है जब यूनिवर्सिटी आपको दाख़िला दे दे।", "shot": "deadlines", "target": "stats", "zoom": 1.0},
        {"type": "split", "say": "क्लास सितंबर में है? तो जून की शुरुआत तक आवेदन करें। चेकिया में साठ दिन तक का समय रखें।",
         "a": {"title": "स्लोवाकिया", "lines": ["90 दिन तक", "जून की शुरुआत तक आवेदन"]}, "b": {"title": "चेकिया", "lines": ["60 दिन तक", "जुलाई की शुरुआत तक आवेदन"]}, "tag": "क्लास सितंबर से"},
        {"type": "site", "say": "पहली आवेदन की आख़िरी तारीख़ इक्कीस फ़रवरी है।", "shot": "deadlines", "target": "card", "zoom": 1.35},
        {"type": "line", "say": "डॉकरूट हर कदम को सही क्रम में रखता है, आधिकारिक स्रोत के साथ।", "text": "हर कदम सही क्रम में।<br><b>हर स्रोत आधिकारिक।</b>"},
        END["hi"],
    ],
}

V["02-one-job-two-permits"] = {
    "en": [
        {"type": "hook", "say": "Same job in Slovakia. Two permits. One is twice as fast.", "text": "Same job. Two permits.<br>One is <b>2× faster</b>"},
        {"type": "site", "say": "Moving to Slovakia for work from outside the EU? The route depends on your job.", "shot": "work", "target": "hero", "zoom": 1.0},
        {"type": "split", "say": "EU Blue Card: decided within thirty days, for up to five years. Single permit: sixty days, up to two years.",
         "a": {"title": "EU Blue Card", "lines": ["decision: 30 days", "up to 5 years"]}, "b": {"title": "Single permit", "lines": ["decision: 60 days", "up to 2 years"]}, "tag": "Slovakia · work", "win": "a"},
        {"type": "line", "say": "The Blue Card is for highly qualified work, with a salary threshold and a contract of at least six months.", "text": "Blue Card: highly qualified work,<br><b>contract of 6+ months</b>"},
        {"type": "stamp", "say": "Your documents must be no older than ninety days.", "text": "max 90 days old", "sub": "every document you file"},
        {"type": "site", "say": "DocRoute lays out the steps: job offer, work authorisation, residence application.", "shot": "work", "target": "stages", "zoom": 1.3},
        {"type": "count", "say": "And after you arrive, report it within three working days.", "to": 3, "unit": "working days", "label": "to report your arrival · Slovakia"},
        END["en"],
    ],
    "hi": [
        {"type": "hook", "say": "स्लोवाकिया में एक ही नौकरी, दो परमिट। एक दोगुना तेज़ है।", "text": "एक नौकरी। दो परमिट।<br>एक <b>2× तेज़</b>"},
        {"type": "site", "say": "ई यू के बाहर से काम के लिए स्लोवाकिया जा रहे हैं? रास्ता आपकी नौकरी पर निर्भर है।", "shot": "work", "target": "hero", "zoom": 1.0},
        {"type": "split", "say": "ई यू ब्लू कार्ड: तीस दिन में फ़ैसला, पाँच साल तक। सिंगल परमिट: साठ दिन, दो साल तक।",
         "a": {"title": "EU ब्लू कार्ड", "lines": ["फ़ैसला: 30 दिन", "5 साल तक"]}, "b": {"title": "सिंगल परमिट", "lines": ["फ़ैसला: 60 दिन", "2 साल तक"]}, "tag": "स्लोवाकिया · काम", "win": "a"},
        {"type": "line", "say": "ब्लू कार्ड उच्च योग्यता वाले काम के लिए है, न्यूनतम वेतन और कम से कम छह महीने के अनुबंध के साथ।", "text": "ब्लू कार्ड: उच्च योग्यता वाला काम,<br><b>6+ महीने का अनुबंध</b>"},
        {"type": "stamp", "say": "आपके दस्तावेज़ नब्बे दिन से पुराने नहीं होने चाहिए।", "text": "90 दिन से पुराने नहीं", "sub": "हर जमा किया गया दस्तावेज़"},
        {"type": "site", "say": "डॉकरूट कदम क्रम से दिखाता है: जॉब ऑफ़र, काम की अनुमति, निवास का आवेदन।", "shot": "work", "target": "stages", "zoom": 1.3},
        {"type": "count", "say": "और पहुँचने के बाद तीन कार्य-दिवसों के अंदर सूचना दें।", "to": 3, "unit": "कार्य-दिवस", "label": "आगमन की सूचना · स्लोवाकिया"},
        END["hi"],
    ],
}

V["03-india-start-with-this-stamp"] = {
    "en": [
        {"type": "hook", "say": "Moving to Europe from India? Start with this stamp.", "text": "India → Europe?<br>Start with <b>this stamp</b>"},
        {"type": "line", "say": "If the authority asks for legalised Indian documents, India uses the MEA apostille.", "text": "Legalised Indian documents<br>= <b>MEA apostille</b>"},
        {"type": "chain", "say": "First the state government, union territory or chamber of commerce authenticates it. Then you submit it through an MEA outsourced agency.",
         "steps": ["State / UT / Chamber of Commerce", "MEA outsourced agency", "Apostille"]},
        {"type": "stamp", "say": "Not to the MEA directly. And it takes time, so plan it before you apply.", "text": "not to MEA directly", "sub": "plan it before you apply"},
        {"type": "site", "say": "Indian citizens also need a visa or a residence permit before moving to Czechia or Slovakia.", "shot": "india", "target": "visa", "zoom": 1.35},
        {"type": "split", "say": "One more trap: Ireland is not in Schengen, so a Schengen visa does not cover it.",
         "a": {"title": "Schengen visa", "lines": ["Czechia, Slovakia", "and other Schengen states"]}, "b": {"title": "Ireland", "lines": ["not in Schengen", "own visa from New Delhi"]}, "tag": "Indian passport"},
        {"type": "site", "say": "DocRoute shows what applies to an Indian passport, step by step.", "shot": "india", "target": "title", "zoom": 1.0},
        END["en"],
    ],
    "hi": [
        {"type": "hook", "say": "भारत से यूरोप जा रहे हैं? इस मुहर से शुरुआत करें।", "text": "भारत → यूरोप?<br>पहले <b>यह मुहर</b>"},
        {"type": "line", "say": "अगर अधिकारी वैध किए हुए भारतीय दस्तावेज़ माँगें, तो भारत में एम ई ए का एपोस्टिल लगता है।", "text": "वैध भारतीय दस्तावेज़<br>= <b>MEA एपोस्टिल</b>"},
        {"type": "chain", "say": "पहले राज्य सरकार, केंद्र शासित प्रदेश या चैंबर ऑफ़ कॉमर्स प्रमाणित करता है। फिर एम ई ए की अधिकृत एजेंसी के ज़रिए जमा करें।",
         "steps": ["राज्य / केंद्र शासित प्रदेश / चैंबर ऑफ़ कॉमर्स", "MEA की अधिकृत एजेंसी", "एपोस्टिल"]},
        {"type": "stamp", "say": "सीधे एम ई ए को नहीं। और इसमें समय लगता है, इसलिए आवेदन से पहले योजना बनाएँ।", "text": "सीधे MEA को नहीं", "sub": "आवेदन से पहले योजना बनाएँ"},
        {"type": "site", "say": "भारतीय नागरिकों को चेकिया या स्लोवाकिया जाने से पहले वीज़ा या निवास परमिट भी चाहिए।", "shot": "india", "target": "visa", "zoom": 1.35},
        {"type": "split", "say": "एक और जाल: आयरलैंड शेंगेन में नहीं है, इसलिए शेंगेन वीज़ा वहाँ मान्य नहीं।",
         "a": {"title": "शेंगेन वीज़ा", "lines": ["चेकिया, स्लोवाकिया", "और बाकी शेंगेन देश"]}, "b": {"title": "आयरलैंड", "lines": ["शेंगेन में नहीं", "नई दिल्ली से अलग वीज़ा"]}, "tag": "भारतीय पासपोर्ट"},
        {"type": "site", "say": "डॉकरूट बताता है कि भारतीय पासपोर्ट पर क्या लागू होता है, कदम दर कदम।", "shot": "india", "target": "title", "zoom": 1.0},
        END["hi"],
    ],
}

SPIKES = {"hook", "count", "split", "stamp", "chain", "end"}
out = {}
for vid, langs in V.items():
    out[vid] = {}
    for lang, scenes in langs.items():
        scenes = [dict(s) for s in scenes]
        for s in scenes:
            s["spike"] = s["type"] in SPIKES or (s["type"] == "site" and s.get("zoom", 1) > 1)
        out[vid][lang] = {"lang": lang, "id": vid, "scenes": scenes}
json.dump(out, open(os.path.join(here, "scripts.json"), "w"), ensure_ascii=False, indent=1)
print("scripts:", ", ".join(out))
