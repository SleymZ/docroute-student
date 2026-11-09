# "Close these tabs." (5 languages, 24 s)

Follow-up to the promo, which did best on Instagram and TikTok. Same beats,
faster: "Moving to Europe? Close these tabs." while tabs pile up with a
counter (to 27) → dozens of tabs, one missed deadline can cost a year →
"Close all tabs" is tapped, the tabs collapse into the logo → each tab flips
into a step of the route (Example card: date + Official source) → passport
label cycling → call to action.

```bash
node marketing/tabs/render.mjs en ru es zh hi                    # silent → out/DocRoute-tabs-<lang>.mp4
python3 marketing/voice/voiceover.py tabs <kokoro models> en ru es zh hi          # voice + quiet pad
NOBED=1 python3 marketing/voice/voiceover.py tabs <kokoro models> en ru es zh hi  # voice only, for in-app music
```
