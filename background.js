// Background service worker for ZeeBlocker

const SESSION_ALARM = 'sessionTick';

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
    idleCheckEnabled: false
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

// Catch up on any session that finished while the service worker was asleep
catchUpSession();

async function catchUpSession() {
  let guard = 0;
  while (guard < 20) {
    const { activeSession } = await chrome.storage.local.get(['activeSession']);
    if (!activeSession || activeSession.endsAt === null || activeSession.endsAt > Date.now()) {
      break;
    }
    await advanceSession();
    guard++;
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
//   startedAt, phaseStartedAt, endsAt (null = no time limit)
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
    endsAt
  };

  await chrome.storage.local.set({ activeSession: session });
  await chrome.storage.sync.set({ focusModeEnabled: true });

  if (endsAt !== null) {
    chrome.alarms.create(SESSION_ALARM, { when: endsAt });
  } else {
    chrome.alarms.clear(SESSION_ALARM);
  }

  notify('Focus Session Started', session.taskTitle ? `Focusing on: ${session.taskTitle}` : 'Focus Mode is on. Stay on task!');
  return session;
}

async function stopSession({ silent = false } = {}) {
  const { activeSession } = await chrome.storage.local.get(['activeSession']);

  if (activeSession) {
    if (activeSession.phase === 'focus') {
      const elapsedMinutes = Math.round((Date.now() - activeSession.phaseStartedAt) / 60000);
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
      notify('Focus Session Complete', `Finished all ${activeSession.totalRounds} rounds. Great job!`);
      return;
    }

    const endsAt = now + activeSession.breakMinutes * 60000;
    await chrome.storage.local.set({
      activeSession: { ...activeSession, phase: 'break', phaseStartedAt: now, endsAt }
    });
    await chrome.storage.sync.set({ focusModeEnabled: false });
    chrome.alarms.create(SESSION_ALARM, { when: endsAt });
    notify('Break Time', `Take a ${activeSession.breakMinutes} minute break.`);
  } else {
    const nextRound = activeSession.round + 1;
    const endsAt = now + activeSession.durationMinutes * 60000;
    await chrome.storage.local.set({
      activeSession: { ...activeSession, phase: 'focus', round: nextRound, phaseStartedAt: now, endsAt }
    });
    await chrome.storage.sync.set({ focusModeEnabled: true });
    chrome.alarms.create(SESSION_ALARM, { when: endsAt });
    notify('Back to Focus', `Round ${nextRound} started.`);
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
  if (request.action === 'startSession') {
    startSession(request.payload).then(session => sendResponse({ session }));
    return true;
  } else if (request.action === 'stopSession') {
    stopSession().then(() => sendResponse({ ok: true }));
    return true;
  }
});

console.log('ZeeBlocker background service worker loaded');
