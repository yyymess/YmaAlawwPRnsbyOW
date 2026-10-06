// The edit: which scene plays when. Boundaries come from the song's sections (Suno's cues snapped to
// downbeats, data/audio.json); scenes place their own shots on lyric lines and beats.
const modules = {
  intro: () => import('./scenes/intro.js'), verse1: () => import('./scenes/verse1.js'), chorus: () => import('./scenes/chorus.js'),
  verse2: () => import('./scenes/verse2.js'), verse3: () => import('./scenes/verse3.js'), bridge: () => import('./scenes/bridge.js'),
  outro: () => import('./scenes/outro.js'), placeholder: () => import('./scenes/placeholder.js'),
};
// a scene that fails to load falls back to the placeholder, and says so loudly: the error is reported by the engine
const load = (name) => async () => { try { return await modules[name](); } catch (e) { console.error(`scene ${name} failed to load: ${e.message}`); return { ...(await modules.placeholder()), loadError: `scene ${name} failed to load: ${e.message}` }; } };

export function makeTimeline(L, A) {
  const s = (n) => A.sectionByName(n);
  const E = (id, file, sec, params = {}) => ({ id, load: load(file), start: s(sec).start, end: s(sec).end, params: { ...params, section: sec } });
  const tl = [
    E('intro', 'intro', 'intro'),
    E('verse1', 'verse1', 'verse1'),
    E('chorus1', 'chorus', 'chorus1', { n: 1 }),
    E('verse2', 'verse2', 'verse2'),
    E('chorus2', 'chorus', 'chorus2', { n: 2 }),
    E('verse3', 'verse3', 'verse3'),
    E('chorus3', 'chorus', 'chorus3', { n: 3 }),
    E('bridge', 'bridge', 'bridge'),
    E('outro', 'outro', 'outro'),
  ];
  // a section whose singing starts before its downbeat (a pickup) cuts in on the beat before the first
  // word, but never before the previous line has finished
  for (let i = 1; i < tl.length; i++) {
    const e = tl[i], first = L.lines.find((l) => l.start >= e.start - 2.0);
    if (!first || first.start >= e.start) continue;
    const prev = L.lines[L.lines.indexOf(first) - 1], beat = A.timeOfBeat(Math.floor(A.beatAt(first.start)));
    const start = Math.min(first.start - 0.05, Math.max(beat, prev ? prev.end : 0));
    e.start = start; tl[i - 1].end = start;
  }
  return tl;
}
