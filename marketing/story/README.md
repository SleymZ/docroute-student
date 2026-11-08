# DocRoute founder-story video (voice-over)

First-person story, without naming where from or where to: moving to
Europe, rules scattered across dozens of sites, in a language a translator
could not make clear, so DocRoute was built. Vertical 1080×1920, 30 fps,
41–56 s depending on the language, burned-in captions (words light up as
they are read), quiet synthesized pad under the voice, loudness −15 LUFS.

Scenes follow the spoken lines (`texts.json` → `lines`):
map with one flight arc → dozens of sites → "residence permit" in six
European languages and a translator that shows "???" → one straight line →
DocRoute and arcs from every side into Europe → goals and an example
route → five site languages → end card.

Voices: Russian RHVoice `aleksandr-hq` (apt `rhvoice rhvoice-russian`);
English `am_michael`, Spanish `em_alex`, Hindi `hm_omega`, Chinese
`zm_yunxi` from Kokoro (pip `kokoro-onnx`, model files from the kokoro-onnx
GitHub release `model-files-v1.0`). `say` in `texts.json` fixes how the
brand is read. Map: world-atlas 50m via d3-geo (`map.json`).

```bash
python3 marketing/story/tts.py /path/to/kokoro-models ru en es zh hi
node marketing/story/render.mjs ru en es zh hi     # → marketing/story/out/
```
Needs the Devanagari font in `marketing/promo/fonts` (see promo README).
