// Song data: the beat grid / envelopes / onsets (data/audio.json) and word-timed lyrics (data/lyrics.json).

export class Audio {
  constructor(j) {
    Object.assign(this, { duration: j.duration, bpm: j.bpm, P: j.beat_period, beats: j.beats, downbeats: j.downbeats, sections: j.sections, fps: j.fps, onsets: j.onsets });
    this.env = {}; for (const k of ['rms', 'low', 'mid', 'high', 'vocal', 'drums', 'bass', 'other']) this.env[k] = Float32Array.from(j[k] ?? []);
    this.t0 = j.beats[0];
  }
  /** continuous beat index (beat 0 = first beat of the grid) */
  beatAt(t) { return (t - this.t0) / this.P; }
  timeOfBeat(b) { return this.t0 + b * this.P; }
  /** continuous bar index (bar 0 starts at the first downbeat) */
  barAt(t) { return (t - this.downbeats[0]) / (4 * this.P); }
  timeOfBar(k) { return this.downbeats[0] + k * 4 * this.P; }
  section(t) { return this.sections.find((s) => t >= s.start && t < s.end) ?? this.sections[this.sections.length - 1]; }
  sectionByName(n) { return this.sections.find((s) => s.name === n); }
  level(name, t) {
    const a = this.env[name]; if (!a?.length) return 0;
    const x = t * this.fps, i = Math.floor(x);
    if (i < 0) return a[0]; if (i >= a.length - 1) return a[a.length - 1];
    return a[i] + (a[i + 1] - a[i]) * (x - i);
  }
  /** decaying pulse (1 at each onset of `kind`, scaled by strength) */
  hit(kind, t, half = 0.12) {
    const on = this.onsets[kind] ?? []; let lo = 0, hi = on.length;
    while (lo < hi) { const m = (lo + hi) >> 1; if (on[m][0] <= t) lo = m + 1; else hi = m; }
    let v = 0; for (let i = lo - 1; i >= 0 && t - on[i][0] < half * 6; i--) v = Math.max(v, on[i][1] * Math.pow(0.5, (t - on[i][0]) / half));
    return v;
  }
}

export class Lyrics {
  constructor(j) {
    this.lines = j.lines;
    this.words = this.lines.flatMap((l, li) => l.words.map((w, wi) => Object.assign(w, { line: li, index: wi })));
  }
  /** the nth line whose text contains q (case-insensitive, quotes normalised) */
  get(q, nth = 0) {
    const n = (s) => s.toLowerCase().replace(/[’‘]/g, "'").replace(/[“”]/g, '"');
    const hits = this.lines.filter((l) => n(l.text).includes(n(q)));
    if (!hits[nth]) throw new Error(`lyric not found: ${q} #${nth}`);
    return hits[nth];
  }
  /** 0..1 how much of word w has been sung at t */
  static progress(w, t) { return t <= w.start ? 0 : t >= w.end ? 1 : (t - w.start) / Math.max(0.05, w.end - w.start); }
  /** the line being sung at t (or the last one started) */
  at(t) { let cur = null; for (const l of this.lines) if (l.start - 0.3 <= t) cur = l; return cur; }
}

export async function loadData(base = '../data') {
  const [a, l] = await Promise.all([fetch(`${base}/audio.json`).then((r) => r.json()), fetch(`${base}/lyrics.json`).then((r) => r.json())]);
  return { audio: new Audio(a), lyrics: new Lyrics(l) };
}
