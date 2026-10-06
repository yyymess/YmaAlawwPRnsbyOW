"""Cross-check data/lyrics.json word starts against faster-whisper word timestamps.

Run (needs faster-whisper):  python xcheck_whisper.py stems/htdemucs/mix/vocals.wav ../data/lyrics.json .cache/whisper
"""
import sys, json, re, numpy as np, librosa
from faster_whisper import WhisperModel
y,_ = librosa.load(sys.argv[1], sr=16000)
m = WhisperModel("small.en", device="cpu", compute_type="int8", download_root=sys.argv[3])
segs,_ = m.transcribe(y, language="en", word_timestamps=True, condition_on_previous_text=False)
ww = [(re.sub(r"[^a-z']","",w.word.lower()), w.start, w.end) for s in segs for w in s.words]
lj = json.load(open(sys.argv[2]))
diffs=[]; per_line=[]
for L in lj["lines"]:
    d=[]
    for w in L["words"]:
        k=re.sub(r"[^a-z']","",w["w"].lower().split()[0])
        c=[s for t,s,e in ww if t==k and abs(s-w["start"])<1.5]
        if c and len(k)>2:
            x=min(c,key=lambda s:abs(s-w["start"]))-w["start"]; d.append(x); diffs.append(x)
    per_line.append((L["i"], len(d), np.median(np.abs(d)) if d else None, L["text"][:50]))
a=np.abs(diffs); print(f"matched {len(a)} words: median |diff| {np.median(a)*1000:.0f} ms, 90th pct {np.percentile(a,90)*1000:.0f} ms, >300ms: {np.mean(a>0.3)*100:.1f}%")
for i,n,md,t in per_line:
    if md is not None and md>0.25: print(f"  line {i}: {n} matched, median {md*1000:.0f} ms  {t}")
