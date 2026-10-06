"""Shared paths / loaders for the analysis scripts.

Import this module FIRST (before torch / demucs imports) so model downloads land in analysis/.cache/.
"""
import os
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent          # analysis/
PROJECT = ROOT.parent
CACHE = ROOT / ".cache"
for var, sub in [("TORCH_HOME", "torch"), ("HF_HOME", "hf"), ("XDG_CACHE_HOME", "xdg"),
                 ("MPLCONFIGDIR", "mpl"), ("NUMBA_CACHE_DIR", "numba")]:
    os.environ.setdefault(var, str(CACHE / sub))
    (CACHE / sub).mkdir(parents=True, exist_ok=True)

AUDIO = PROJECT / "audio" / "engineers-paradise.m4a"
SRT = PROJECT / "lyrics" / "suno-timed-lines.srt"
WORK = ROOT / "work"
MIX_WAV = WORK / "mix.wav"            # ffmpeg -i ../audio/engineers-paradise.m4a -ar 44100 -ac 2 work/mix.wav
STEMS = ROOT / "stems" / "htdemucs" / "mix"
DATA = PROJECT / "data"
QA = ROOT / "qa"
for d in (WORK, DATA, QA):
    d.mkdir(exist_ok=True)


def load_mix(sr=44100):
    import librosa
    return librosa.load(str(MIX_WAV), sr=sr, mono=True)


def load_stem(name, sr=44100, mono=True):
    import librosa
    return librosa.load(str(STEMS / f"{name}.wav"), sr=sr, mono=mono)


def _ts(s):
    h, m, rest = s.split(":")
    sec, ms = rest.split(",")
    return int(h) * 3600 + int(m) * 60 + int(sec) + int(ms) / 1000


def load_srt():
    """Suno's line-timed lyrics -> (sections, lines).

    sections: [(tag, start)] from the bracketed cues; lines: [(start, end, text, section_tag)].
    """
    blocks = re.split(r"\n\s*\n", SRT.read_text(encoding="utf-8").strip())
    sections, lines, cur = [], [], None
    for b in blocks:
        rows = b.strip().splitlines()
        if len(rows) < 3:
            continue
        a, z = [_ts(x.strip()) for x in rows[1].split("-->")]
        text = " ".join(rows[2:]).strip()
        if text.startswith("[") and text.endswith("]"):
            cur = text[1:-1].split(":")[0].strip()
            sections.append((cur, a))
        else:
            lines.append((a, z, text, cur))
    return sections, lines
