# Analysis

Produces the timing data the video needs from `audio/engineers-paradise.m4a`:

| output | what |
|---|---|
| `data/audio.json` | constant-tempo beat grid (80.02 BPM), downbeats, sections, 100 fps envelopes, kick/snare/hat/vocal onsets |
| `data/lyrics.json` | 81 lines, 680 words with start/end/confidence |

```sh
cd analysis
uv sync                                   # CPU torch, demucs, librosa
ffmpeg -i ../audio/engineers-paradise.m4a -ar 44100 -ac 2 work/mix.wav
uv run python -m demucs -n htdemucs -d cpu -o stems work/mix.wav   # ~12 min on 4 CPU cores
uv run python analyze.py                  # data/audio.json
uv run python align.py                    # data/lyrics.json
```

- Line windows come from the lyrics Suno embedded in the m4a (`lyrics/suno-timed-lines.srt`, extracted with `ffmpeg -i audio/engineers-paradise.m4a -map 0:s:0 lyrics/suno-timed-lines.srt`); words inside a line are placed by CTC forced alignment (torchaudio MMS_FA) on the vocals stem.
- Check (2026-10-06): 477 words matched against faster-whisper word timestamps, median difference 50 ms, 90th percentile 206 ms. The few lines over 300 ms are choir lines where Whisper stretches the first word into the preceding silence.
- Sections are Suno's cues snapped to downbeats: intro 7 bars · verse 12 · chorus 8 · verse 14 · chorus 8 · verse 14 · chorus 8 · bridge 8 · outro.
- Grid and onset helpers are adapted from mexicat/pdoom-video (MIT).
