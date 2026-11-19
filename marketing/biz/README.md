# Business route (en, YouTube Shorts): табло вылетов

Сплит-флэп табло, каждая плитка переворачивается со щелчком (sound.py, тайминги
из board.json). Факты: маршрут бизнеса в Словакии из docs/STATUS.md (IOM, проверено 2026-10-29).

    cd marketing/biz && python3 sound.py out/bed.wav && node render.mjs en
    python3 ../voice/voiceover.py biz <kokoro dir> en
