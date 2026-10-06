"""Music analysis -> data/audio.json (the format app/src/engine/audio.ts reads).

  * constant-tempo beat grid fitted to drum + mix onset envelopes, phase refined on kick attacks;
    bar phase from the snare (beats 2 and 4) and the section starts;
  * sections from Suno's bracketed cues in lyrics/suno-timed-lines.srt, snapped to downbeats;
  * 100 fps normalized envelopes (mix rms / low / mid / high, stem rms);
  * kick / snare / hat onsets from the drums stem, vocal onsets from the vocals stem.

The grid / onset helpers are adapted from mexicat/pdoom-video (analysis/analyze.py, MIT).
Needs the Demucs stems:  uv run python -m demucs -n htdemucs -d cpu -o stems work/mix.wav

Run:  uv run python analyze.py
"""
import common
import json
import math

import numpy as np
import librosa
from scipy.ndimage import uniform_filter1d, median_filter
from scipy.signal import butter, find_peaks, sosfiltfilt

SR = 44100
FPS = 100
BPM_RANGE = (76.0, 86.0)

SECTION_NAMES = {"Intro": "intro", "Verse 1": "verse1", "Verse 2": "verse2", "Verse 3": "verse3",
                 "Bridge": "bridge", "Outro": "outro"}


def band_sos(lo, hi, sr):
    if lo and hi:
        return butter(4, [lo, hi], btype="band", fs=sr, output="sos")
    if hi:
        return butter(4, hi, btype="low", fs=sr, output="sos")
    return butter(4, lo, btype="high", fs=sr, output="sos")


def frame_rms(x, sr, fps=FPS, win=2048):
    hop = sr / fps
    n = int(math.ceil(len(x) / sr * fps))
    pad = np.pad(x, (win // 2, win // 2 + int(hop) + 2))
    idx = (np.arange(n) * hop).astype(int)
    c = np.concatenate([[0.0], np.cumsum(pad.astype(np.float64) ** 2)])
    return np.sqrt(np.maximum((c[idx + win] - c[idx]) / win, 0))


def smooth_env(x, fps=FPS, attack=0.010, release=0.090):
    """One-pole follower: fast attack, slower release (visual friendly)."""
    aa, ar = math.exp(-1 / (attack * fps)), math.exp(-1 / (release * fps))
    y, s = np.empty_like(x), 0.0
    for i, v in enumerate(x):
        a = aa if v > s else ar
        s = a * s + (1 - a) * v
        y[i] = s
    return y


def norm01(x, pct=99.0):
    return np.clip(x / (np.percentile(x, pct) + 1e-12), 0, 1)


def band_onsets(x, sr, lo, hi, win=0.010, hop_s=0.002, min_gap=0.08, rel_db=10.0):
    """Onsets in a frequency band: steepest rise of the band's log-energy envelope."""
    xb = sosfiltfilt(band_sos(lo, hi, sr), x)
    h, w = int(hop_s * sr), int(win * sr)
    e = np.convolve(xb.astype(np.float64) ** 2, np.ones(w) / w, mode="same")[::h]
    db = 10 * np.log10(e + 1e-10)
    fps = sr / h
    d = uniform_filter1d(np.diff(db, prepend=db[0]), 3)
    lag = int(0.02 * fps)
    rise = db - np.concatenate([np.full(lag, db[0]), db[:-lag]])
    floor = median_filter(db, int(1.0 * fps) | 1)
    pk, _ = find_peaks(rise, height=rel_db, distance=int(min_gap * fps))
    times, strength = [], []
    for p in pk:
        a = max(0, p - lag)
        q = a + int(np.argmax(d[a:p + 1]))
        peak_db = db[p:p + int(0.03 * fps)].max()
        if peak_db < floor[p] + 3:
            continue
        times.append(q / fps)
        strength.append(peak_db)
    return np.array(times), np.array(strength)


def fit_grid(drums, mix, sr, duration):
    """Constant-tempo grid: tempo/phase search on onset envelopes, then phase refined on kicks."""
    hop = 32
    od = librosa.onset.onset_strength(y=librosa.resample(drums, orig_sr=sr, target_sr=22050), sr=22050,
                                      hop_length=hop, lag=1, max_size=1)
    om = librosa.onset.onset_strength(y=librosa.resample(mix, orig_sr=sr, target_sr=22050), sr=22050,
                                      hop_length=hop, lag=1, max_size=1)
    o = od / (np.percentile(od, 99) + 1e-9) + om / (np.percentile(om, 99) + 1e-9)
    ofps = 22050 / hop

    def score(P, off):
        idx = np.round((off + P * np.arange(int(duration / P) + 1)) * ofps).astype(int)
        idx = idx[(idx > 2) & (idx < len(o) - 2)]
        return np.maximum.reduce([o[idx - 1], o[idx], o[idx + 1]]).mean()

    best = (0, None, None)
    for bpm in np.arange(*BPM_RANGE, 0.02):
        P = 60 / bpm
        for off in np.arange(0, P, 0.004):
            s = score(P, off)
            if s > best[0]:
                best = (s, bpm, off)
    _, bpm, off = best
    for b2 in np.arange(bpm - 0.02, bpm + 0.02, 0.001):
        for o2 in np.arange(off - 0.01, off + 0.01, 0.001):
            s = score(60 / b2, o2)
            if s > best[0]:
                best = (s, b2, o2)
    _, bpm, off = best
    P = 60 / bpm
    kick_t, _ = band_onsets(drums, sr, None, 120, win=0.012, min_gap=0.2, rel_db=12)
    res = kick_t - (off + np.round((kick_t - off) / P) * P)
    res = res[np.abs(res) < 0.06]
    if len(res):
        off += float(np.median(res))
    off -= P * math.floor(off / P)
    return bpm, P, off, res


def drum_onsets(d, sr):
    kt, kdb = band_onsets(d, sr, None, 120, win=0.012, min_gap=0.15, rel_db=12)
    st, _ = band_onsets(d, sr, 1500, 5000, win=0.010, min_gap=0.15, rel_db=10)
    # a snare has a long noisy 0.5-5 kHz tail 40-120 ms after the attack; hats and kick clicks don't
    xb = sosfiltfilt(band_sos(500, 5000, sr), d)
    e = np.sqrt(np.convolve(xb.astype(np.float64) ** 2, np.ones(441) / 441, mode="same"))
    tail = np.array([20 * np.log10(e[int((t + 0.04) * sr):int((t + 0.12) * sr)].mean() + 1e-9) for t in st])
    rel = np.array([tail[i] - tail[np.abs(st - st[i]) < 2.5].max() for i in range(len(st))])
    keep = (rel > -8) & (tail > np.percentile(tail, 95) - 25)
    st, stail = st[keep], tail[keep]
    ht, hdb = band_onsets(d, sr, 7000, None, win=0.006, min_gap=0.06, rel_db=9)
    for other, gap in ((st, 0.04), (kt, 0.03)):
        if len(other) and len(ht):
            keep = np.min(np.abs(ht[:, None] - other[None, :]), axis=1) > gap
            ht, hdb = ht[keep], hdb[keep]
    return (kt, kdb), (st, stail), (ht, hdb)


def strength01(v, lo_pct=5, hi_pct=95):
    if len(v) == 0:
        return v
    lo, hi = np.percentile(v, lo_pct), np.percentile(v, hi_pct)
    return np.clip((v - lo) / (hi - lo + 1e-9) * 0.8 + 0.2, 0, 1)


def vocal_onsets(v, sr):
    """Vocal syllable/note onsets: spectral-flux peaks on the vocals stem, gated by vocal level."""
    y = librosa.resample(v, orig_sr=sr, target_sr=22050)
    hop = 110  # 5 ms
    on = librosa.onset.onset_strength(y=y, sr=22050, hop_length=hop, n_mels=64)
    rms = librosa.amplitude_to_db(librosa.feature.rms(y=y, hop_length=hop)[0], ref=np.max)
    pk = librosa.util.peak_pick(on, pre_max=8, post_max=8, pre_avg=40, post_avg=40, delta=0.15 * np.percentile(on, 99), wait=18)
    pk = [p for p in pk if rms[min(len(rms) - 1, p + 6)] > -40]
    s = np.array([on[p] for p in pk])
    s = s / (np.percentile(s, 95) + 1e-9) if len(s) else s
    return [(round(p * hop / 22050, 3), round(float(min(1.0, max(0.1, x))), 3)) for p, x in zip(pk, s)]


def main():
    mix, _ = common.load_mix(SR)
    duration = len(mix) / SR
    stems = {}
    for n in ("vocals", "drums", "bass", "other"):
        x = common.load_stem(n, sr=SR)[0][: len(mix)]
        stems[n] = np.pad(x, (0, len(mix) - len(x)))

    bpm, P, off, kick_res = fit_grid(stems["drums"], mix, SR, duration)
    print(f"tempo {bpm:.3f} BPM  period {P:.5f}s  first beat {off:.4f}s  kick residual sd {kick_res.std() * 1000:.1f} ms")
    beats = off + P * np.arange(int((duration - off) / P) + 1)

    (kt, kdb), (st, sdb), (ht, hdb) = drum_onsets(stems["drums"], SR)

    # bar phase: snares on beats 2 and 4 fix it up to half a bar; the section starts (first sung line
    # of each section, Suno's cues) pick the half
    sections_srt, lines = common.load_srt()
    beat_of = lambda t: np.round((np.asarray(t) - off) / P).astype(int)
    sb = beat_of(st)
    phase_score = [np.sum(((sb - k) % 4 == 1) | ((sb - k) % 4 == 3)) for k in range(4)]
    cands = [k for k in range(4) if phase_score[k] == max(phase_score)] or [0]
    cands = sorted(set(cands + [(c + 2) % 4 for c in cands]))
    starts = np.array([t for _, t in sections_srt[1:]])

    def dist_to_db(k):
        x = (starts - off) / P - k
        return np.mean(np.abs(x / 4 - np.round(x / 4)))
    k0 = min(cands, key=dist_to_db)
    print("snare on 2&4 score per phase", phase_score, "-> bar phase", k0)
    downbeats = beats[(np.arange(len(beats)) - k0) % 4 == 0]

    # sections: the downbeat of the bar the first line starts in, unless it is a short (< 2 beat) pickup
    sections, seen = [], {}
    for tag, t in sections_srt:
        if tag in ("Spoken", "End"):
            continue
        name = SECTION_NAMES.get(tag)
        if name is None:  # Chorus x3
            seen[tag] = seen.get(tag, 0) + 1
            name = f"{tag.lower()}{seen[tag]}"
        prev = downbeats[downbeats <= t + 0.05]
        s = float(prev[-1]) if len(prev) else 0.0
        nxt = downbeats[downbeats > t + 0.05]
        if len(nxt) and nxt[0] - t < 2 * P and name != "intro":
            s = float(nxt[0])
        sections.append(dict(name=name, start=round(0.0 if name == "intro" else s, 3)))
    for a, b in zip(sections, sections[1:] + [None]):
        a["end"] = round(b["start"] if b else duration, 3)

    n = int(math.ceil(duration * FPS))
    env = {"rms": frame_rms(mix, SR)[:n]}
    for name, (lo, hi) in {"low": (None, 150), "mid": (150, 2000), "high": (4000, None)}.items():
        env[name] = frame_rms(sosfiltfilt(band_sos(lo, hi, SR), mix), SR)[:n]
    for s in ("vocal", "drums", "bass", "other"):
        env[s] = frame_rms(stems["vocals" if s == "vocal" else s], SR)[:n]
    for k in env:
        env[k] = [round(float(x), 3) for x in norm01(smooth_env(env[k]))]

    pairs = lambda ts, ss: [[round(float(t), 3), round(float(s), 3)] for t, s in zip(ts, ss)]
    onsets = {"kick": pairs(kt, strength01(kdb)), "snare": pairs(st, strength01(sdb)), "hat": pairs(ht, strength01(hdb)),
              "vocal": [list(x) for x in vocal_onsets(stems["vocals"], SR)]}

    doc = dict(duration=round(duration, 3), bpm=round(bpm, 3), beat_period=round(P, 5), time_signature=4,
               beats=[round(float(t), 3) for t in beats], downbeats=[round(float(t), 3) for t in downbeats],
               sections=sections, fps=FPS, **env, onsets=onsets,
               notes=f"Constant tempo {bpm:.3f} BPM fitted on drum+mix onsets, phase refined on kicks "
                     f"(first beat {off:.3f}s); bar phase from snares on 2&4 and Suno's section cues. "
                     f"Sections are Suno's cues snapped to downbeats. Stems: Demucs htdemucs.")
    (common.DATA / "audio.json").write_text(json.dumps(doc, separators=(",", ":")))
    print(f"wrote data/audio.json: {len(beats)} beats, {len(downbeats)} downbeats, {len(kt)} kicks, "
          f"{len(st)} snares, {len(ht)} hats, {len(onsets['vocal'])} vocal onsets")
    for s in sections:
        print(f"  {s['name']:8s} {s['start']:7.2f} - {s['end']:7.2f}  ({(s['end'] - s['start']) / (4 * P):.1f} bars)")


if __name__ == "__main__":
    main()
