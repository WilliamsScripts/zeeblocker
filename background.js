// Background service worker for ZeeBlocker

importScripts('sounds-catalog.js');

const SESSION_ALARM = 'sessionTick';
const OFFSCREEN_URL = 'offscreen.html';

// Initialize extension
chrome.runtime.onInstalled.addListener(async () => {
  console.log('ZeeBlocker installed');

  const defaultSettings = {
    focusModeEnabled: false,
    darkMode: false,
    tasks: [],
    distractingSites: [
      'facebook.com',
      'twitter.com',
      'x.com',
      'instagram.com',
      'tiktok.com',
      'youtube.com',
      'reddit.com',
      'netflix.com',
      'twitch.tv',
      'pinterest.com'
    ],
    adultSites: [
      'pornhub.com',
      'xvideos.com',
      'xnxx.com',
      'redtube.com',
      'youporn.com'
    ],
    childSafetyMode: false,
    parentEmail: '',
    idleTimeThreshold: 10, // minutes
    idleCheckEnabled: false,
    workBell: DEFAULT_WORK_BELL,
    breakBell: DEFAULT_BREAK_BELL,
    focusMusicEnabled: DEFAULT_FOCUS_MUSIC_ENABLED,
    focusMusicVolume: DEFAULT_FOCUS_MUSIC_VOLUME,
    idleAlertBellMode: DEFAULT_IDLE_ALERT_BELL_MODE,
    idleAlertSound: DEFAULT_IDLE_ALERT_SOUND
  };

  const existing = await chrome.storage.sync.get(Object.keys(defaultSettings));
  const toSet = {};

  for (const [key, value] of Object.entries(defaultSettings)) {
    if (existing[key] === undefined) {
      toSet[key] = value;
    }
  }

  if (Object.keys(toSet).length > 0) {
    await chrome.storage.sync.set(toSet);
  }

  await initStats();

  chrome.alarms.create('idleCheck', { periodInMinutes: 1 });
});

// Catch up on any session that finished while the service worker was asleep,
// then make sure focus music is playing if a focus phase is already in progress
// (the offscreen document can outlive the service worker, but not a full browser restart).
catchUpSession().then(resumeMusicIfNeeded);

async function catchUpSession() {
  let guard = 0;
  while (guard < 20) {
    const { activeSession } = await chrome.storage.local.get(['activeSession']);
    if (!activeSession || activeSession.paused || activeSession.endsAt === null || activeSession.endsAt > Date.now()) {
      break;
    }
    await advanceSession();
    guard++;
  }
}

async function resumeMusicIfNeeded() {
  const { activeSession } = await chrome.storage.local.get(['activeSession']);
  if (activeSession && !activeSession.paused && activeSession.phase === 'focus') {
    await startOrResumeMusic();
  }
}

// Handle alarms
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === 'idleCheck') {
    await checkIdleTime();
  } else if (alarm.name === SESSION_ALARM) {
    await advanceSession();
  }
});

// Lifetime stats — these accumulate forever, they are never reset automatically
async function initStats() {
  const existing = await chrome.storage.local.get(['sitesBlocked', 'focusMinutes']);
  const toSet = {};
  if (existing.sitesBlocked === undefined) toSet.sitesBlocked = 0;
  if (existing.focusMinutes === undefined) toSet.focusMinutes = 0;
  if (Object.keys(toSet).length > 0) {
    await chrome.storage.local.set(toSet);
  }
}

// Check idle time
async function checkIdleTime() {
  const settings = await chrome.storage.sync.get(['idleCheckEnabled', 'idleTimeThreshold']);

  if (!settings.idleCheckEnabled) {
    return;
  }

  const idleState = await chrome.idle.queryState(settings.idleTimeThreshold * 60);

  if (idleState === 'idle') {
    await handleIdleDetected(settings.idleTimeThreshold);
  } else {
    await handleIdleCleared();
  }
}

// ---- Idle alert modal (in addition to the native Chrome notification) ----
// Tracked in chrome.storage.session (in-memory, cleared on browser restart) rather
// than a plain module variable, since the service worker can be torn down and
// restarted independently of the alert window actually being open.

async function handleIdleDetected(minutes) {
  const { idleAlertWindowId } = await chrome.storage.session.get(['idleAlertWindowId']);

  if (idleAlertWindowId && (await windowExists(idleAlertWindowId))) {
    return; // already showing an alert for this idle stretch
  }

  notify('Idle Detected', `You've been idle for ${minutes} minutes. Time for a break?`);
  await openIdleAlertWindow(minutes);
}

// Runs on every idle check (roughly once a minute) regardless of state, so the alert
// auto-closes as soon as Chrome reports the user active again — not just when they
// click "I'm back" on the modal itself.
async function handleIdleCleared() {
  const { idleAlertWindowId } = await chrome.storage.session.get(['idleAlertWindowId']);
  if (!idleAlertWindowId) return;

  await chrome.storage.session.remove(['idleAlertWindowId']);
  try {
    await chrome.windows.remove(idleAlertWindowId);
  } catch (error) {
    // already closed — nothing to do
  }
}

async function windowExists(windowId) {
  try {
    await chrome.windows.get(windowId);
    return true;
  } catch (error) {
    return false;
  }
}

async function openIdleAlertWindow(minutes) {
  const win = await chrome.windows.create({
    url: chrome.runtime.getURL(`idle-alert.html?minutes=${minutes}`),
    type: 'popup',
    width: 360,
    height: 340,
    focused: true
  });
  await chrome.storage.session.set({ idleAlertWindowId: win.id });

  const { idleAlertBellMode } = await chrome.storage.sync.get(['idleAlertBellMode']);
  const mode = idleAlertBellMode || DEFAULT_IDLE_ALERT_BELL_MODE;
  if (mode !== 'off') {
    await playIdleAlertSound();
  }
}

// The offscreen document's bell finished playing. If an idle alert is still open and
// the user has it set to ring continuously, ring it again — otherwise this is just a
// normal one-shot bell (session transition, preview, or "ring once" idle alert).
async function handleBellFinished() {
  const { idleAlertWindowId } = await chrome.storage.session.get(['idleAlertWindowId']);
  if (!idleAlertWindowId || !(await windowExists(idleAlertWindowId))) return;

  const { idleAlertBellMode } = await chrome.storage.sync.get(['idleAlertBellMode']);
  if ((idleAlertBellMode || DEFAULT_IDLE_ALERT_BELL_MODE) === 'continuous') {
    await playIdleAlertSound();
  }
}

// Plays whichever sound the user picked for idle alerts (defaults to the focus/
// "time's up" bell, but is independently configurable from the work/break bells).
async function playIdleAlertSound() {
  const { idleAlertSound } = await chrome.storage.sync.get(['idleAlertSound']);
  const file = idleAlertSound || DEFAULT_IDLE_ALERT_SOUND;
  await ensureOffscreenDocument();
  sendToOffscreen({ target: 'offscreen', type: 'playBell', file });
}

// If the user dismisses the alert via the window's own close button (rather than the
// "I'm back" button, which just calls window.close()), make sure we still notice.
chrome.windows.onRemoved.addListener(async (windowId) => {
  const { idleAlertWindowId } = await chrome.storage.session.get(['idleAlertWindowId']);
  if (windowId === idleAlertWindowId) {
    await chrome.storage.session.remove(['idleAlertWindowId']);
  }
});

// ---- Pomodoro session state machine ----
// activeSession (storage.local): {
//   taskId, taskTitle, mode: 'single'|'cycle', phase: 'focus'|'break',
//   durationMinutes, breakMinutes, totalRounds, round,
//   startedAt, phaseStartedAt, endsAt (null = no time limit),
//   paused, pausedAt (null unless paused)
// }

async function startSession(payload) {
  await stopSession({ silent: true });

  const now = Date.now();
  const durationMinutes = payload.durationMinutes ?? null;
  const endsAt = durationMinutes === null ? null : now + durationMinutes * 60000;

  const session = {
    taskId: payload.taskId || null,
    taskTitle: payload.taskTitle || '',
    mode: payload.mode === 'cycle' ? 'cycle' : 'single',
    phase: 'focus',
    durationMinutes,
    breakMinutes: payload.breakMinutes || 5,
    totalRounds: payload.totalRounds ?? null,
    round: 1,
    startedAt: now,
    phaseStartedAt: now,
    endsAt,
    paused: false,
    pausedAt: null
  };

  await chrome.storage.local.set({ activeSession: session });
  await chrome.storage.sync.set({ focusModeEnabled: true });

  if (endsAt !== null) {
    chrome.alarms.create(SESSION_ALARM, { when: endsAt });
  } else {
    chrome.alarms.clear(SESSION_ALARM);
  }

  notify('Focus Session Started', session.taskTitle ? `Focusing on: ${session.taskTitle}` : 'Focus Mode is on. Stay on task!');
  await startOrResumeMusic();
  return session;
}

async function stopSession({ silent = false } = {}) {
  const { activeSession } = await chrome.storage.local.get(['activeSession']);

  if (activeSession) {
    if (activeSession.phase === 'focus') {
      const referenceNow = activeSession.paused ? activeSession.pausedAt : Date.now();
      const elapsedMinutes = Math.round((referenceNow - activeSession.phaseStartedAt) / 60000);
      if (elapsedMinutes > 0) {
        await addFocusTime(elapsedMinutes);
      }
    }
    if (!silent) {
      notify('Focus Session Ended', 'Focus Mode has been turned off.');
    }
  }

  chrome.alarms.clear(SESSION_ALARM);
  await chrome.storage.local.remove(['activeSession']);
  await chrome.storage.sync.set({ focusModeEnabled: false });
  await suspendMusic();
}

async function pauseSession() {
  const { activeSession } = await chrome.storage.local.get(['activeSession']);
  if (!activeSession || activeSession.paused) return activeSession;

  chrome.alarms.clear(SESSION_ALARM);
  const updated = { ...activeSession, paused: true, pausedAt: Date.now() };
  await chrome.storage.local.set({ activeSession: updated });
  await suspendMusic();
  return updated;
}

async function resumeSession() {
  const { activeSession } = await chrome.storage.local.get(['activeSession']);
  if (!activeSession || !activeSession.paused) return activeSession;

  const now = Date.now();
  const pauseDuration = now - activeSession.pausedAt;
  const updated = {
    ...activeSession,
    paused: false,
    pausedAt: null,
    phaseStartedAt: activeSession.phaseStartedAt + pauseDuration,
    startedAt: activeSession.startedAt + pauseDuration
  };

  if (activeSession.endsAt !== null) {
    updated.endsAt = activeSession.endsAt + pauseDuration;
    chrome.alarms.create(SESSION_ALARM, { when: updated.endsAt });
  }

  await chrome.storage.local.set({ activeSession: updated });
  if (updated.phase === 'focus') {
    await startOrResumeMusic();
  }
  return updated;
}

// Called when the current phase's timer runs out
async function advanceSession() {
  const { activeSession } = await chrome.storage.local.get(['activeSession']);
  if (!activeSession) return;

  const now = Date.now();

  if (activeSession.mode === 'single') {
    if (activeSession.durationMinutes) {
      await addFocusTime(activeSession.durationMinutes);
    }
    chrome.alarms.clear(SESSION_ALARM);
    await chrome.storage.local.remove(['activeSession']);
    await chrome.storage.sync.set({ focusModeEnabled: false });
    await suspendMusic();
    await playBell('work');
    notify('Focus Session Complete', activeSession.taskTitle ? `Great work on "${activeSession.taskTitle}"!` : 'Nice work staying focused!');
    return;
  }

  // cycle mode
  if (activeSession.phase === 'focus') {
    await addFocusTime(activeSession.durationMinutes);

    const isLastRound = activeSession.totalRounds !== null && activeSession.round >= activeSession.totalRounds;
    if (isLastRound) {
      chrome.alarms.clear(SESSION_ALARM);
      await chrome.storage.local.remove(['activeSession']);
      await chrome.storage.sync.set({ focusModeEnabled: false });
      await suspendMusic();
      await playBell('work');
      notify('Focus Session Complete', `Finished all ${activeSession.totalRounds} rounds. Great job!`);
      return;
    }

    const endsAt = now + activeSession.breakMinutes * 60000;
    await chrome.storage.local.set({
      activeSession: { ...activeSession, phase: 'break', phaseStartedAt: now, endsAt }
    });
    await chrome.storage.sync.set({ focusModeEnabled: false });
    chrome.alarms.create(SESSION_ALARM, { when: endsAt });
    await suspendMusic();
    await playBell('break');
    notify('Break Time', `Take a ${activeSession.breakMinutes} minute break.`);
  } else {
    const nextRound = activeSession.round + 1;
    const endsAt = now + activeSession.durationMinutes * 60000;
    await chrome.storage.local.set({
      activeSession: { ...activeSession, phase: 'focus', round: nextRound, phaseStartedAt: now, endsAt }
    });
    await chrome.storage.sync.set({ focusModeEnabled: true });
    chrome.alarms.create(SESSION_ALARM, { when: endsAt });
    await playBell('work');
    await startOrResumeMusic();
    notify('Back to Focus', `Round ${nextRound} started.`);
  }
}

// ---- Audio: bell + focus music, played from an offscreen document ----
// (a service worker has no DOM/Audio API of its own)

let creatingOffscreenDocument = null;

async function ensureOffscreenDocument() {
  const has = await chrome.offscreen.hasDocument();
  if (has) {
    if (await pingOffscreenDocument()) return;
    // A document exists but isn't answering a ping — almost certainly a stale document
    // still running an older version of offscreen.js (editing the file on disk doesn't
    // tear down a document that's already running; only closing it does). Replace it
    // instead of leaving every future message to this extension silently fail.
    console.warn('ZeeBlocker: offscreen document unresponsive, recreating it');
    await chrome.offscreen.closeDocument().catch(() => {});
  }

  // Guard against two triggers (e.g. a pause and an alarm) both seeing "no document yet"
  // and racing to create one, which Chrome rejects with "Only a single offscreen document
  // may be created."
  if (!creatingOffscreenDocument) {
    creatingOffscreenDocument = chrome.offscreen.createDocument({
      url: OFFSCREEN_URL,
      reasons: ['AUDIO_PLAYBACK'],
      justification: 'Play focus session bell sounds and background focus music'
    }).catch(error => {
      console.error('ZeeBlocker: failed to create offscreen document', error);
    }).finally(() => {
      creatingOffscreenDocument = null;
    });
  }
  await creatingOffscreenDocument;

  // The document exists now, but its onMessage listener isn't guaranteed to be attached
  // the instant createDocument() resolves. Wait for a real ping/pong instead of hoping a
  // blind retry lands — this also settles once the listener really is ready.
  await pingOffscreenDocument();
}

// Confirms the offscreen document is alive and its listener is actually registered,
// via a real request/response handshake (not a guess based on timing).
function pingOffscreenDocument() {
  return new Promise(resolve => {
    let settled = false;
    const timer = setTimeout(() => {
      if (!settled) {
        settled = true;
        resolve(false);
      }
    }, 300);

    try {
      chrome.runtime.sendMessage({ target: 'offscreen', type: 'ping' }, (response) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        resolve(!chrome.runtime.lastError && !!(response && response.pong));
      });
    } catch (error) {
      if (!settled) {
        settled = true;
        clearTimeout(timer);
        resolve(false);
      }
    }
  });
}

// Fire-and-forget: callers only reach here after ensureOffscreenDocument() has already
// confirmed (via ping) that the document's listener is live, so no response is needed.
function sendToOffscreen(message) {
  chrome.runtime.sendMessage(message);
}

// Offscreen documents only get a small subset of chrome.* APIs — no chrome.storage —
// so this service worker (which has full storage access) resolves which file to play
// and passes it along; the offscreen document just plays whatever file it's told to.

async function playBell(which) {
  const { workBell, breakBell } = await chrome.storage.sync.get(['workBell', 'breakBell']);
  const file = which === 'break' ? (breakBell || DEFAULT_BREAK_BELL) : (workBell || DEFAULT_WORK_BELL);
  await ensureOffscreenDocument();
  sendToOffscreen({ target: 'offscreen', type: 'playBell', file });
}

async function previewSound(file) {
  await ensureOffscreenDocument();
  sendToOffscreen({ target: 'offscreen', type: 'previewSound', file });
}

async function startOrResumeMusic() {
  if (FOCUS_MUSIC_TRACKS.length === 0) return;

  const { focusMusicEnabled, focusMusicVolume } = await chrome.storage.sync.get(['focusMusicEnabled', 'focusMusicVolume']);
  if (focusMusicEnabled === false) return;

  const { musicState } = await chrome.storage.local.get(['musicState']);
  const state = musicState || { trackIndex: 0, positionSeconds: 0 };
  const trackIndex = ((state.trackIndex % FOCUS_MUSIC_TRACKS.length) + FOCUS_MUSIC_TRACKS.length) % FOCUS_MUSIC_TRACKS.length;
  const track = FOCUS_MUSIC_TRACKS[trackIndex];

  await ensureOffscreenDocument();
  sendToOffscreen({
    target: 'offscreen',
    type: 'startOrResumeMusic',
    file: track.file,
    positionSeconds: state.positionSeconds || 0,
    volume: focusMusicVolume ?? DEFAULT_FOCUS_MUSIC_VOLUME
  });
}

async function suspendMusic() {
  const has = await chrome.offscreen.hasDocument();
  if (!has) return;
  sendToOffscreen({ target: 'offscreen', type: 'suspendMusic' });
}

// The offscreen document reports playback position/status back to us every second
// (it has no storage access of its own) so a paused/stopped track resumes where it
// left off, and so the popup's mini player can show live "now playing" info.
async function handleMusicStatusUpdate(status) {
  const trackIndex = Math.max(0, FOCUS_MUSIC_TRACKS.findIndex(t => t.file === status.trackFile));
  await chrome.storage.local.set({
    musicState: { trackIndex, positionSeconds: status.currentTime || 0 },
    musicNowPlaying: {
      trackFile: status.trackFile,
      trackName: (FOCUS_MUSIC_TRACKS[trackIndex] || {}).name || '',
      currentTime: status.currentTime || 0,
      duration: status.duration || 0,
      paused: status.paused,
      trackIndex,
      totalTracks: FOCUS_MUSIC_TRACKS.length
    }
  });
}

// A track finished playing on its own without the proactive near-end crossfade having
// fired (e.g. duration was unknown, or the track is shorter than the fade) — fall back
// to just starting the next one, or looping back to the first once we run out.
async function advanceMusicTrack(finishedTrackFile) {
  if (FOCUS_MUSIC_TRACKS.length === 0) return;
  const finishedIndex = Math.max(0, FOCUS_MUSIC_TRACKS.findIndex(t => t.file === finishedTrackFile));
  const nextIndex = (finishedIndex + 1) % FOCUS_MUSIC_TRACKS.length;
  await chrome.storage.local.set({ musicState: { trackIndex: nextIndex, positionSeconds: 0 } });
  await startOrResumeMusic();
}

// Proactive crossfade: offscreen.js tells us a track is a few seconds from ending,
// we pick the next one and tell it to fade over — no hard cut between songs.
async function handleMusicNearingEnd(finishedTrackFile) {
  if (FOCUS_MUSIC_TRACKS.length === 0) return;
  const finishedIndex = Math.max(0, FOCUS_MUSIC_TRACKS.findIndex(t => t.file === finishedTrackFile));
  const nextIndex = (finishedIndex + 1) % FOCUS_MUSIC_TRACKS.length;
  const track = FOCUS_MUSIC_TRACKS[nextIndex];
  const { focusMusicVolume } = await chrome.storage.sync.get(['focusMusicVolume']);

  await chrome.storage.local.set({ musicState: { trackIndex: nextIndex, positionSeconds: 0 } });
  sendToOffscreen({
    target: 'offscreen',
    type: 'switchTrack',
    file: track.file,
    volume: focusMusicVolume ?? DEFAULT_FOCUS_MUSIC_VOLUME
  });
}

// Manual next/prev from the popup's mini player: crossfade to the relative track.
async function switchMusicTrack(direction) {
  if (FOCUS_MUSIC_TRACKS.length === 0) return;
  const { focusMusicVolume } = await chrome.storage.sync.get(['focusMusicVolume']);
  const { musicState } = await chrome.storage.local.get(['musicState']);
  const state = musicState || { trackIndex: 0, positionSeconds: 0 };
  const currentIndex = ((state.trackIndex % FOCUS_MUSIC_TRACKS.length) + FOCUS_MUSIC_TRACKS.length) % FOCUS_MUSIC_TRACKS.length;
  const nextIndex = ((currentIndex + direction) % FOCUS_MUSIC_TRACKS.length + FOCUS_MUSIC_TRACKS.length) % FOCUS_MUSIC_TRACKS.length;
  const track = FOCUS_MUSIC_TRACKS[nextIndex];

  await chrome.storage.local.set({ musicState: { trackIndex: nextIndex, positionSeconds: 0 } });
  await ensureOffscreenDocument();
  sendToOffscreen({
    target: 'offscreen',
    type: 'switchTrack',
    file: track.file,
    volume: focusMusicVolume ?? DEFAULT_FOCUS_MUSIC_VOLUME
  });
}

// Manual seek from the popup's mini player.
function seekMusic(positionSeconds) {
  sendToOffscreen({ target: 'offscreen', type: 'seekMusic', positionSeconds });
}

chrome.storage.onChanged.addListener(async (changes, area) => {
  if (area === 'sync' && changes.focusMusicVolume) {
    const has = await chrome.offscreen.hasDocument();
    if (has) {
      sendToOffscreen({
        target: 'offscreen',
        type: 'setVolume',
        volume: changes.focusMusicVolume.newValue ?? DEFAULT_FOCUS_MUSIC_VOLUME
      });
    }
  }
});

async function setFocusMusicEnabled(enabled) {
  await chrome.storage.sync.set({ focusMusicEnabled: enabled });
  const { activeSession } = await chrome.storage.local.get(['activeSession']);
  if (activeSession && !activeSession.paused && activeSession.phase === 'focus') {
    if (enabled) {
      await startOrResumeMusic();
    } else {
      await suspendMusic();
    }
  }
}

async function addFocusTime(minutes) {
  const data = await chrome.storage.local.get(['focusMinutes']);
  const currentTime = data.focusMinutes || 0;
  await chrome.storage.local.set({ focusMinutes: currentTime + minutes });
}

function notify(title, message) {
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'icons/icon128.png',
    title: `ZeeBlocker: ${title}`,
    message,
    priority: 1
  });
}

// Block navigation
chrome.webNavigation.onBeforeNavigate.addListener(async (details) => {
  if (details.frameId !== 0) return; // Only handle main frame

  if (!details.url.startsWith('http://') && !details.url.startsWith('https://')) {
    return;
  }

  let url;
  try {
    url = new URL(details.url);
  } catch (error) {
    console.error('Invalid URL:', details.url);
    return;
  }

  const settings = await chrome.storage.sync.get([
    'focusModeEnabled',
    'distractingSites',
    'childSafetyMode',
    'adultSites',
    'parentEmail'
  ]);

  let shouldBlock = false;
  let blockReason = '';

  if (settings.focusModeEnabled) {
    const distractingSites = settings.distractingSites || [];
    if (isUrlInList(url, distractingSites)) {
      shouldBlock = true;
      blockReason = 'focus';
    }
  }

  if (settings.childSafetyMode) {
    const adultSites = settings.adultSites || [];
    if (isUrlInList(url, adultSites)) {
      shouldBlock = true;
      blockReason = 'child-safety';

      if (settings.parentEmail) {
        await sendParentNotification(url.hostname, settings.parentEmail);
      }
    }
  }

  if (shouldBlock) {
    const data = await chrome.storage.local.get(['sitesBlocked']);
    await chrome.storage.local.set({
      sitesBlocked: (data.sitesBlocked || 0) + 1
    });

    chrome.tabs.update(details.tabId, {
      url: chrome.runtime.getURL(`blocked.html?reason=${blockReason}&site=${encodeURIComponent(url.hostname)}`)
    });
  }
});

// Check if URL is in blocklist
function isUrlInList(url, list) {
  const hostname = url.hostname.replace('www.', '');
  return list.some(site => {
    const cleanSite = site.replace('www.', '');
    return hostname === cleanSite || hostname.endsWith('.' + cleanSite);
  });
}

// Send parent notification
async function sendParentNotification(site, parentEmail) {
  notify('Child Safety Alert', `Attempted access to restricted site: ${site}`);

  console.log(`Parent notification would be sent to ${parentEmail} about ${site}`);

  const data = await chrome.storage.local.get(['accessAttempts']);
  const attempts = data.accessAttempts || [];
  attempts.push({
    site,
    timestamp: new Date().toISOString(),
    notified: true
  });
  await chrome.storage.local.set({ accessAttempts: attempts });
}

// Handle messages
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.target === 'offscreen') return; // meant for the offscreen document, not us

  if (request.action === 'startSession') {
    startSession(request.payload).then(session => sendResponse({ session }));
    return true;
  } else if (request.action === 'stopSession') {
    stopSession().then(() => sendResponse({ ok: true }));
    return true;
  } else if (request.action === 'pauseSession') {
    pauseSession().then(session => sendResponse({ session }));
    return true;
  } else if (request.action === 'resumeSession') {
    resumeSession().then(session => sendResponse({ session }));
    return true;
  } else if (request.action === 'setFocusMusicEnabled') {
    setFocusMusicEnabled(request.enabled).then(() => sendResponse({ ok: true }));
    return true;
  } else if (request.action === 'previewSound') {
    previewSound(request.file).then(() => sendResponse({ ok: true }));
    return true;
  } else if (request.action === 'musicStatusUpdate') {
    handleMusicStatusUpdate(request).then(() => sendResponse({ ok: true }));
    return true;
  } else if (request.action === 'musicTrackEnded') {
    advanceMusicTrack(request.trackFile).then(() => sendResponse({ ok: true }));
    return true;
  } else if (request.action === 'musicNearingEnd') {
    handleMusicNearingEnd(request.trackFile).then(() => sendResponse({ ok: true }));
    return true;
  } else if (request.action === 'musicNext') {
    switchMusicTrack(1).then(() => sendResponse({ ok: true }));
    return true;
  } else if (request.action === 'musicPrev') {
    switchMusicTrack(-1).then(() => sendResponse({ ok: true }));
    return true;
  } else if (request.action === 'musicSeek') {
    seekMusic(request.positionSeconds);
    return false;
  } else if (request.action === 'bellFinished') {
    handleBellFinished();
    return false;
  }
});

console.log('ZeeBlocker background service worker loaded');
