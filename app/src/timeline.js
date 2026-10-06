// The edit: which scene plays when. Boundaries come from the song's sections (Suno's cues snapped to
// downbeats, data/audio.json); scenes place their own shots on lyric lines and beats.
const modules = {
  intro: () => import('./scenes/intro.js'), verse1: () => import('./scenes/verse1.js'), chorus: () => import('./scenes/chorus.js'),
  verse2: () => import('./scenes/verse2.js'), verse3: () => import('./scenes/verse3.js'), bridge: () => import('./scenes/bridge.js'),
  outro: () => import('./scenes/outro.js'), placeholder: () => import('./scenes/placeholder.js'),
};
const load = (name) => async () => { try { return await modules[name](); } catch (e) { console.warn(`scene ${name}: ${e.message}; using placeholder`); return modules.placeholder(); } };

export function makeTimeline(L, A) {
  const s = (n) => A.sectionByName(n);
  const E = (id, file, sec, params = {}) => ({ id, load: load(file), start: s(sec).start, end: s(sec).end, params: { ...params, section: sec } });
  return [
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
}
