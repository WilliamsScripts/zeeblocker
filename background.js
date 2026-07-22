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
    focusMusicVolume: DEFAULT_FOCUS_MUSIC_VOLUME
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
    notify('Idle Detected', `You've been idle for ${settings.idleTimeThreshold} minutes. Time for a break?`);
  }
}

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

// The offscreen document reports playback position back to us (it has no storage
// access of its own to persist it) so a paused/stopped track resumes where it left off.
async function saveMusicPosition(trackFile, positionSeconds) {
  const trackIndex = Math.max(0, FOCUS_MUSIC_TRACKS.findIndex(t => t.file === trackFile));
  await chrome.storage.local.set({
    musicState: { trackIndex, positionSeconds: positionSeconds || 0 }
  });
}

// A track finished playing on its own: advance to the next one, or loop back to the
// first ("start afresh") once we run out.
async function advanceMusicTrack(finishedTrackFile) {
  if (FOCUS_MUSIC_TRACKS.length === 0) return;
  const finishedIndex = Math.max(0, FOCUS_MUSIC_TRACKS.findIndex(t => t.file === finishedTrackFile));
  const nextIndex = (finishedIndex + 1) % FOCUS_MUSIC_TRACKS.length;
  await chrome.storage.local.set({ musicState: { trackIndex: nextIndex, positionSeconds: 0 } });
  await startOrResumeMusic();
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
  } else if (request.action === 'musicPositionUpdate') {
    saveMusicPosition(request.trackFile, request.positionSeconds);
    return false;
  } else if (request.action === 'musicTrackEnded') {
    advanceMusicTrack(request.trackFile).then(() => sendResponse({ ok: true }));
    return true;
  }
});

console.log('ZeeBlocker background service worker loaded');
