// Offscreen document: the only place in an MV3 extension that can actually play
// audio persistently. Offscreen documents only get a small subset of chrome.* APIs
// (essentially just chrome.runtime for messaging — no chrome.storage), so this script
// never touches storage itself. background.js resolves settings/files and tells us
// exactly what to play; we report playback position/status back to it so it can
// persist it and relay "now playing" info to the popup.

const FADE_DURATION_MS = 5000;
const FADE_STEP_MS = 100;
const STATUS_INTERVAL_MS = 1000;

const bellPlayer = document.getElementById('bellPlayer');
const musicPlayers = [document.getElementById('musicPlayerA'), document.getElementById('musicPlayerB')];

let activePlayerIndex = 0;
let activeFades = [];
let musicStatusInterval = null;
let currentTrackFile = null;
let targetVolume = DEFAULT_FOCUS_MUSIC_VOLUME;
let nearEndTriggered = false;

function activePlayer() {
  return musicPlayers[activePlayerIndex];
}

function inactivePlayer() {
  return musicPlayers[1 - activePlayerIndex];
}

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
    setVolume(message.volume);
  } else if (message.type === 'switchTrack') {
    switchTrack(message.file, message.volume);
  } else if (message.type === 'seekMusic') {
    seekMusic(message.positionSeconds);
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

// Fades `player`'s volume linearly from `fromVol` to `toVol` over `durationMs`.
// Returns the interval id so callers can track/cancel it via `activeFades`.
function fadeVolume(player, fromVol, toVol, durationMs, onDone) {
  const steps = Math.max(1, Math.round(durationMs / FADE_STEP_MS));
  let step = 0;
  player.volume = clampVolume(fromVol);

  const id = setInterval(() => {
    step++;
    const t = Math.min(1, step / steps);
    player.volume = clampVolume(fromVol + (toVol - fromVol) * t);
    if (t >= 1) {
      clearInterval(id);
      activeFades = activeFades.filter(i => i !== id);
      if (onDone) onDone();
    }
  }, FADE_STEP_MS);

  activeFades.push(id);
  return id;
}

function clampVolume(v) {
  return Math.max(0, Math.min(1, v));
}

function cancelFades() {
  activeFades.forEach(clearInterval);
  activeFades = [];
}

// First start of a session's music, or a resume after a pause/break/mute — always
// fades in from silence rather than snapping straight to full volume.
async function startOrResumeMusic(file, positionSeconds, volume) {
  targetVolume = volume ?? DEFAULT_FOCUS_MUSIC_VOLUME;
  cancelFades();

  const player = activePlayer();
  const trackUrl = soundUrl(file);
  const isSameTrack = player.src === trackUrl;

  if (!isSameTrack) {
    player.src = trackUrl;
    player.currentTime = positionSeconds || 0;
    nearEndTriggered = false;
  }
  currentTrackFile = file;
  player.volume = 0;

  try {
    await player.play();
  } catch (error) {
    console.error('ZeeBlocker: focus music playback failed', error);
    return;
  }

  fadeVolume(player, 0, targetVolume, FADE_DURATION_MS);
  startStatusReporting();
}

// Crossfades from whatever's currently playing to `file`: the outgoing track fades
// out while the incoming one fades in, both over FADE_DURATION_MS, so there's no
// hard cut between songs.
async function switchTrack(file, volume) {
  targetVolume = volume ?? targetVolume;
  cancelFades();

  const outgoing = activePlayer();
  const incoming = inactivePlayer();
  const trackUrl = soundUrl(file);

  incoming.src = trackUrl;
  incoming.currentTime = 0;
  incoming.volume = 0;

  try {
    await incoming.play();
  } catch (error) {
    console.error('ZeeBlocker: focus music playback failed', error);
    return;
  }

  currentTrackFile = file;
  nearEndTriggered = false;

  const outgoingStartVolume = outgoing.volume;
  fadeVolume(outgoing, outgoingStartVolume, 0, FADE_DURATION_MS, () => {
    outgoing.pause();
    outgoing.currentTime = 0;
    outgoing.removeAttribute('src');
  });
  fadeVolume(incoming, 0, targetVolume, FADE_DURATION_MS);

  activePlayerIndex = 1 - activePlayerIndex;
  startStatusReporting();
}

function suspendMusic() {
  cancelFades();
  stopStatusReporting();
  const player = activePlayer();
  if (!player.paused) {
    reportStatus(true);
    player.pause();
  }
}

function setVolume(volume) {
  targetVolume = volume ?? DEFAULT_FOCUS_MUSIC_VOLUME;
  if (activeFades.length === 0) {
    activePlayer().volume = targetVolume;
  }
}

function seekMusic(positionSeconds) {
  const player = activePlayer();
  if (!player.src) return;
  player.currentTime = Math.max(0, positionSeconds || 0);
  reportStatus();
}

function startStatusReporting() {
  stopStatusReporting();
  musicStatusInterval = setInterval(() => reportStatus(), STATUS_INTERVAL_MS);
  reportStatus();
}

function stopStatusReporting() {
  if (musicStatusInterval) {
    clearInterval(musicStatusInterval);
    musicStatusInterval = null;
  }
}

function reportStatus(forcedPaused) {
  const player = activePlayer();
  if (!currentTrackFile) return;

  const paused = forcedPaused !== undefined ? forcedPaused : player.paused;
  const duration = isFinite(player.duration) ? player.duration : 0;

  chrome.runtime.sendMessage({
    action: 'musicStatusUpdate',
    trackFile: currentTrackFile,
    currentTime: player.currentTime || 0,
    duration,
    paused
  });

  // Proactively crossfade to the next track a few seconds before this one ends,
  // instead of waiting for a hard stop on 'ended'.
  if (!nearEndTriggered && !paused && duration && (duration - player.currentTime) <= FADE_DURATION_MS / 1000) {
    nearEndTriggered = true;
    chrome.runtime.sendMessage({ action: 'musicNearingEnd', trackFile: currentTrackFile });
  }
}

// Fallback safety net: if a track ends before the proactive crossfade above had a
// chance to fire (e.g. duration was unknown, or the track is shorter than the fade),
// ask background.js to pick the next track and start it (with its usual fade-in).
musicPlayers.forEach(player => {
  player.addEventListener('ended', () => {
    if (player !== activePlayer()) return; // stale event from a player we already swapped away from
    stopStatusReporting();
    chrome.runtime.sendMessage({ action: 'musicTrackEnded', trackFile: currentTrackFile });
  });
});

// Lets background.js loop the idle-alert bell ("ring continuously") by re-triggering
// playBell whenever the previous play finishes — see handleBellFinished there.
bellPlayer.addEventListener('ended', () => {
  chrome.runtime.sendMessage({ action: 'bellFinished' });
});
