// Offscreen document: the only place in an MV3 extension that can actually play
// audio persistently. Offscreen documents only get a small subset of chrome.* APIs
// (essentially just chrome.runtime for messaging — no chrome.storage), so this script
// never touches storage itself. background.js resolves settings/files and tells us
// exactly what to play; we report playback position back to it so it can persist it.

const bellPlayer = document.getElementById('bellPlayer');
const musicPlayer = document.getElementById('musicPlayer');

let musicSaveInterval = null;
let currentTrackFile = null;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.target !== 'offscreen') return;

  if (message.type === 'ping') {
    // Lets background.js confirm this document is alive and its listener is actually
    // registered before it starts firing real commands at it.
    sendResponse({ pong: true });
    return;
  }

  if (message.type === 'playBell') {
    playFile(bellPlayer, message.file);
  } else if (message.type === 'previewSound') {
    playFile(bellPlayer, message.file);
  } else if (message.type === 'startOrResumeMusic') {
    startOrResumeMusic(message.file, message.positionSeconds, message.volume);
  } else if (message.type === 'suspendMusic') {
    suspendMusic();
  } else if (message.type === 'setVolume') {
    musicPlayer.volume = message.volume ?? DEFAULT_FOCUS_MUSIC_VOLUME;
  }
});

async function playFile(playerEl, file) {
  playerEl.src = soundUrl(file);
  playerEl.currentTime = 0;
  try {
    await playerEl.play();
  } catch (error) {
    console.error('ZeeBlocker: sound playback failed', error);
  }
}

async function startOrResumeMusic(file, positionSeconds, volume) {
  const trackUrl = soundUrl(file);
  musicPlayer.volume = volume ?? DEFAULT_FOCUS_MUSIC_VOLUME;

  if (musicPlayer.src !== trackUrl) {
    musicPlayer.src = trackUrl;
    musicPlayer.currentTime = positionSeconds || 0;
  }
  currentTrackFile = file;

  try {
    await musicPlayer.play();
  } catch (error) {
    console.error('ZeeBlocker: focus music playback failed', error);
    return;
  }

  startPositionAutosave();
}

function suspendMusic() {
  stopPositionAutosave();
  if (!musicPlayer.paused) {
    reportMusicPosition();
    musicPlayer.pause();
  }
}

function startPositionAutosave() {
  stopPositionAutosave();
  musicSaveInterval = setInterval(reportMusicPosition, 2000);
}

function stopPositionAutosave() {
  if (musicSaveInterval) {
    clearInterval(musicSaveInterval);
    musicSaveInterval = null;
  }
}

function reportMusicPosition() {
  if (!currentTrackFile) return;
  chrome.runtime.sendMessage({
    action: 'musicPositionUpdate',
    trackFile: currentTrackFile,
    positionSeconds: musicPlayer.currentTime || 0
  });
}

// Track finished on its own: ask the background service worker (which owns storage
// and the track list) to figure out the next track and tell us to play it.
musicPlayer.addEventListener('ended', () => {
  stopPositionAutosave();
  chrome.runtime.sendMessage({ action: 'musicTrackEnded', trackFile: currentTrackFile });
});
