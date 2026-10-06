"""Word-level lyric alignment -> data/lyrics.json (the format app/src/engine/lyrics.ts reads).

Suno's line timings (lyrics/suno-timed-lines.srt) give each line a window; inside it, a CTC forced
alignment (torchaudio MMS_FA) on the Demucs vocals stem places every word. A garbage "star" token at
both ends of each line absorbs the neighbouring lines' audio that the padded window lets in.

Run:  uv run python align.py
"""
import common
import json
import re

import numpy as np
import torch
import torchaudio
import torchaudio.functional as F

SR = 16000
PAD = 0.6          # seconds of context either side of Suno's line window
# words sung one way but shown another (the Suno lyrics spell some words for pronunciation)
DISPLAY = {"em-peg": "MPEG"}

bundle = torchaudio.pipelines.MMS_FA
model = bundle.get_model(with_star=True).eval()
DICT = bundle.get_dict(star="*")


def norm(word):
    """Characters the acoustic model knows (lowercase a-z, apostrophe); digits are spelled in the lyrics."""
    w = word.lower().replace("’", "'")
    return "".join(c for c in w if c in DICT and c not in "*-")


def align_line(wave, t0, t1, words):
    a, b = int(max(0, t0) * SR), int(min(len(wave) / SR, t1) * SR)
    x = torch.from_numpy(wave[a:b]).float()[None]
    with torch.inference_mode():
        em, _ = model(x)
        em = torch.log_softmax(em, dim=-1)
    toks = [norm(w) for w in words]
    keep = [i for i, t in enumerate(toks) if t]
    seq = ["*"] + [toks[i] for i in keep] + ["*"]
    targets = torch.tensor([[DICT[c] for s in seq for c in s]], dtype=torch.int32)
    ali, scores = F.forced_align(em, targets, blank=0)
    spans = F.merge_tokens(ali[0], scores[0].exp())
    ratio = (b - a) / em.size(1) / SR
    out, k = {}, 0
    for wi, s in enumerate(seq):
        sp = spans[k:k + len(s)]
        k += len(s)
        if 0 < wi < len(seq) - 1:
            out[keep[wi - 1]] = (t0 + sp[0].start * ratio, t0 + sp[-1].end * ratio, float(np.mean([z.score for z in sp])))
    return out


def main():
    wave = common.load_stem("vocals", sr=SR)[0]
    _, lines = common.load_srt()
    doc = {"lines": []}
    for li, (a, z, text, tag) in enumerate(lines):
        # standalone punctuation (the "—" in "nights — and") belongs to the word before it
        words = []
        for tok in text.split():
            if not norm(tok) and words:
                words[-1] += " " + tok
            else:
                words.append(tok)
        # tighten the window to the neighbouring lines so the star tokens have little to absorb
        lo = max(a - PAD, lines[li - 1][1] - 0.2) if li else a - PAD
        hi = min(z + PAD, lines[li + 1][0] + 0.2) if li + 1 < len(lines) else z + PAD
        got = align_line(wave, lo, hi, words)
        ws = []
        for i, w in enumerate(words):
            s, e, c = got.get(i, (None, None, 0.0))
            key = w.lower().strip(",.;:—")
            shown = w.replace(w.strip(",.;:—"), DISPLAY[key]) if key in DISPLAY else w
            ws.append({"w": shown, "start": s, "end": e, "conf": round(c, 2)})
        # words the model had no letters for (dashes): take the gap next to them
        for i, w in enumerate(ws):
            if w["start"] is None:
                prev = ws[i - 1]["end"] if i else a
                nxt = next((x["start"] for x in ws[i + 1:] if x["start"] is not None), z)
                w["start"], w["end"] = prev, nxt
        # a word lasts until the next one starts unless there is a real gap (> 0.25 s)
        for w, n in zip(ws, ws[1:]):
            if n["start"] - w["end"] < 0.25:
                w["end"] = n["start"]
        for w in ws:
            w["start"], w["end"] = round(w["start"], 3), round(w["end"], 3)
        display = " ".join(x["w"] for x in ws)
        doc["lines"].append({"i": li, "text": display, "section": tag, "start": ws[0]["start"], "end": ws[-1]["end"], "words": ws})
        low = [x["w"] for x in ws if x["conf"] < 0.3]
        print(f"{li:3d} {ws[0]['start']:7.2f}-{ws[-1]['end']:7.2f} {display[:70]}" + (f"   low: {low}" if low else ""))
    (common.DATA / "lyrics.json").write_text(json.dumps(doc, indent=1, ensure_ascii=False))
    print("wrote data/lyrics.json:", len(doc["lines"]), "lines,", sum(len(l["words"]) for l in doc["lines"]), "words")


if __name__ == "__main__":
    main()
