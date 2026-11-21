#!/usr/bin/env python3
"""Generate the Dukaan Dost Soundbox voice lines as MP3 files.

Primary engine : edge-tts, stock voice hi-IN-SwaraNeural, rate -5%
Fallback engine: gTTS (lang="hi")

Usage:
    pip install edge-tts gTTS
    python3 scripts/generate-audio.py            # generate missing files
    python3 scripts/generate-audio.py --force    # regenerate everything

After generating, every file is decoded once (ffprobe if available, else
mutagen) to check it is not empty, and a summary table is printed.
"""
from __future__ import annotations

import asyncio
import os
import shutil
import subprocess
import sys
from pathlib import Path

OUT_DIR = Path(__file__).resolve().parent.parent / "public" / "audio"
VOICE = "hi-IN-SwaraNeural"
RATE = "-5%"

HINDI_AMOUNTS = {
    40: "चालीस",
    50: "पचास",
    80: "अस्सी",
    100: "एक सौ",
    120: "एक सौ बीस",
    150: "एक सौ पचास",
    200: "दो सौ",
    250: "दो सौ पचास",
    500: "पाँच सौ",
}

LINES: dict[str, str] = {
    "visit1": "इस महीने दो और विज़िट पर दस रुपये कैशबैक।",
    "visit2": "इस महीने एक और विज़िट पर दस रुपये कैशबैक।",
    "visit3": "शुक्रिया! आपको दस रुपये कैशबैक मिला। यह कैशबैक आपको पारले-जी की तरफ़ से। वापस ज़रूर आइएगा!",
    "visit3_paytm": "शुक्रिया! आपको पेटीएम यूपीआई पर पंद्रह रुपये कैशबैक मिला। यह कैशबैक आपको पारले-जी की तरफ़ से। वापस ज़रूर आइएगा!",
    "recap": "आज चार ग्राहकों को इनाम मिला। इस महीने बारह ग्राहक वापस आए।",
}
for amount, words in HINDI_AMOUNTS.items():
    LINES[f"alert_{amount}"] = f"पेटीएम पर {words} रुपये प्राप्त हुए।"


async def edge(text: str, path: Path) -> None:
    import edge_tts  # type: ignore

    # aiohttp ignores HTTPS_PROXY unless told; pass it through explicitly.
    proxy = os.environ.get("HTTPS_PROXY") or os.environ.get("https_proxy")
    await edge_tts.Communicate(text, VOICE, rate=RATE, proxy=proxy).save(str(path))


def gtts(text: str, path: Path) -> None:
    from gtts import gTTS  # type: ignore

    gTTS(text=text, lang="hi").save(str(path))


def duration(path: Path) -> float:
    if shutil.which("ffprobe"):
        out = subprocess.run(
            ["ffprobe", "-v", "error", "-show_entries", "format=duration",
             "-of", "default=nw=1:nk=1", str(path)],
            capture_output=True, text=True, check=False,
        ).stdout.strip()
        try:
            return float(out)
        except ValueError:
            return 0.0
    try:
        from mutagen.mp3 import MP3  # type: ignore

        return float(MP3(str(path)).info.length)
    except Exception:
        return 0.0


def main() -> int:
    force = "--force" in sys.argv
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    rows: list[tuple[str, str, float, int]] = []
    failures: list[str] = []

    for key, text in LINES.items():
        path = OUT_DIR / f"{key}.mp3"
        engine = "existing"
        if force or not path.exists() or path.stat().st_size == 0:
            try:
                asyncio.run(edge(text, path))
                engine = "edge-tts"
            except Exception as e:  # noqa: BLE001
                print(f"[warn] edge-tts failed for {key}: {e}; trying gTTS")
                try:
                    gtts(text, path)
                    engine = "gTTS"
                except Exception as e2:  # noqa: BLE001
                    print(f"[error] gTTS also failed for {key}: {e2}")
                    failures.append(key)
                    continue
        secs = duration(path)
        if secs <= 0.2 or path.stat().st_size < 1000:
            failures.append(key)
        rows.append((key, engine, secs, path.stat().st_size))

    print(f"\n{'file':<20} {'engine':<10} {'seconds':>8} {'bytes':>8}")
    print("-" * 50)
    for key, engine, secs, size in rows:
        print(f"{key + '.mp3':<20} {engine:<10} {secs:>8.2f} {size:>8}")
    if failures:
        print(f"\nFAILED / EMPTY: {', '.join(failures)}")
        print("The app still works without these: speech bubbles show the text.")
        return 1
    print(f"\nAll {len(rows)} files OK in {OUT_DIR}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
