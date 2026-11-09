# Assembly from the owner's storyboard (2026-11-09)

The owner generated a storyboard image (10 panels) and a first cut that
used the panels as letterboxed stills with their time labels, an invented
website screen and a wrong logo. This folder rebuilds the film from 8 of
the panels (time labels painted out with OpenCV inpainting, 2.4× Lanczos
upscale): slow camera moves, blurred fill behind the frame, colour grade
cold → gold, grain and vignette, the last shot turning orange into the end
card with the real DocRoute logo (coral #ff795f) and the site address.
The invented website screen and the cap-and-gown logo are left out.

- `music.py` — original synthesized score (96 bpm, Am–F–C–G), arc matched to
  the voice: lonely piano → pulse → lift at the summit → piano break →
  rebuild → riser → hit on the end card at 40.1 s. Ducked under the voice.
- `film.html` + `render.mjs` — two versions: with subtitles and clean.
The panels and rendered files stay out of the repository.
