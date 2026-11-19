# Pulse (en): интенсивность 90 → 50 → 70 → 30 → 20 → 10 %

Чёрный фон, кардиограмма, плёночное зерно. Звук свой (sound.py: сердцебиение,
темп и сила по кривой из segs.json), голос Kokoro am_michael.

    cd marketing/pulse && python3 sound.py out/bed.wav && node render.mjs en
    python3 ../voice/voiceover.py pulse <kokoro dir> en   # → out/DocRoute-pulse-voice-en.mp4
