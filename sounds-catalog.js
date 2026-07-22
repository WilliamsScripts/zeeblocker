const WORK_BELL_SOUNDS = [
  { name: 'School Bell', file: 'sounds/time-up/emg5991-school-bell.mp3' },
  { name: 'School Bell (Alt)', file: 'sounds/time-up/universfield-school-bell.mp3' },
  { name: 'Copper Bell Ding', file: 'sounds/break/floraphonic-copper-bell-ding-25.mp3' },
  { name: 'Casual Click Pop', file: 'sounds/break/floraphonic-casual-click-pop-ui-4.mp3' },
  { name: 'Short UI Break', file: 'sounds/break/pietix-short-ui-break-6.mp3' },
  { name: 'Slow Piano Pause', file: 'sounds/break/freesound_community-slow-piano-pause-sound.mp3' }
];

const BREAK_BELL_SOUNDS = [
  { name: 'Copper Bell Ding', file: 'sounds/break/floraphonic-copper-bell-ding-25.mp3' },
  { name: 'Casual Click Pop', file: 'sounds/break/floraphonic-casual-click-pop-ui-4.mp3' },
  { name: 'Short UI Break', file: 'sounds/break/pietix-short-ui-break-6.mp3' },
  { name: 'Slow Piano Pause', file: 'sounds/break/freesound_community-slow-piano-pause-sound.mp3' },
  { name: 'School Bell', file: 'sounds/time-up/emg5991-school-bell.mp3' },
  { name: 'School Bell (Alt)', file: 'sounds/time-up/universfield-school-bell.mp3' },
];

const FOCUS_MUSIC_TRACKS = [
  { name: 'Lofi Music', file: 'sounds/focus-music/Lofi Music.webm' },
  { name: 'Lofi Music 2', fsile: 'sounds/focus-music/lofi 2.webm' },
  { name: 'Lofi beat', file: 'sounds/focus-music/mirostar-lofi-beats-531504.mp3' }
];

const DEFAULT_WORK_BELL = WORK_BELL_SOUNDS[0].file;
const DEFAULT_BREAK_BELL = BREAK_BELL_SOUNDS[0].file;
const DEFAULT_FOCUS_MUSIC_ENABLED = true;
const DEFAULT_FOCUS_MUSIC_VOLUME = 0.5;

function soundUrl(path) {
  return chrome.runtime.getURL(path.split('/').map(encodeURIComponent).join('/'));
}
