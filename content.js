// Content script for ZeeBlocker
// Blocks distracting/restricted pages and shows a live session countdown overlay

(async function () {
  try {
    const url = window.location.href;
    const hostname = window.location.hostname.replace('www.', '');

    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return;
    }

    if (url.includes('blocked.html')) {
      return;
    }

    await checkAndBlock(hostname);
    initSessionOverlay();
  } catch (error) {
    console.error('ZeeBlocker content script error:', error);
  }
})();

async function checkAndBlock(hostname) {
  const settings = await chrome.storage.sync.get([
    'focusModeEnabled',
    'distractingSites',
    'childSafetyMode',
    'adultSites'
  ]);

  let shouldBlock = false;
  let blockReason = '';

  if (settings.focusModeEnabled) {
    const distractingSites = settings.distractingSites || [];
    if (isInList(hostname, distractingSites)) {
      shouldBlock = true;
      blockReason = 'focus';
    }
  }

  if (settings.childSafetyMode) {
    const adultSites = settings.adultSites || [];
    if (isInList(hostname, adultSites)) {
      shouldBlock = true;
      blockReason = 'child-safety';
    }
  }

  if (shouldBlock) {
    window.location.replace(
      chrome.runtime.getURL(`blocked.html?reason=${blockReason}&site=${encodeURIComponent(hostname)}`)
    );
  }
}

function isInList(hostname, list) {
  return list.some(site => {
    const cleanSite = site.replace('www.', '');
    return hostname === cleanSite || hostname.endsWith('.' + cleanSite);
  });
}

// ---- Session overlay widget (bottom-left, live countdown) ----

let overlayHost = null;
let overlayShadow = null;
let overlayTickHandle = null;

function initSessionOverlay() {
  const setup = () => {
    chrome.storage.local.get(['activeSession']).then(({ activeSession }) => {
      renderOverlay(activeSession || null);
    });
  };

  if (document.body) {
    setup();
  } else {
    document.addEventListener('DOMContentLoaded', setup, { once: true });
  }

  chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'local' && changes.activeSession) {
      renderOverlay(changes.activeSession.newValue || null);
    }
  });
}

function renderOverlay(session) {
  if (!session) {
    removeOverlay();
    return;
  }
  if (!document.body) return;

  if (!overlayHost) {
    overlayHost = document.createElement('div');
    overlayHost.style.cssText = 'all:initial;position:fixed;left:16px;bottom:16px;z-index:2147483647;';
    document.documentElement.appendChild(overlayHost);
    overlayShadow = overlayHost.attachShadow({ mode: 'closed' });
    overlayShadow.innerHTML = overlayTemplate();
    overlayShadow.getElementById('zb-stop').addEventListener('click', () => {
      chrome.runtime.sendMessage({ action: 'stopSession' });
    });
  }

  updateOverlay(session);

  if (overlayTickHandle) clearInterval(overlayTickHandle);
  overlayTickHandle = setInterval(() => updateOverlay(session), 1000);
}

function updateOverlay(session) {
  if (!overlayShadow) return;
  const shadow = overlayShadow;
  const isBreak = session.phase === 'break';

  shadow.getElementById('zb-widget').setAttribute('data-phase', session.phase);
  shadow.getElementById('zb-title').textContent = session.taskTitle || (isBreak ? 'Break' : 'Focus session');

  let status = isBreak ? 'Break' : 'Focus';
  if (session.mode === 'cycle') {
    status += session.totalRounds ? ` · Round ${session.round}/${session.totalRounds}` : ` · Round ${session.round}`;
  }
  shadow.getElementById('zb-status').textContent = status;

  const timeEl = shadow.getElementById('zb-time');
  if (session.endsAt === null) {
    timeEl.textContent = 'No limit';
  } else {
    const remainingMs = Math.max(0, session.endsAt - Date.now());
    timeEl.textContent = formatDuration(remainingMs);
  }
}

function removeOverlay() {
  if (overlayTickHandle) {
    clearInterval(overlayTickHandle);
    overlayTickHandle = null;
  }
  if (overlayHost) {
    overlayHost.remove();
    overlayHost = null;
    overlayShadow = null;
  }
}

function formatDuration(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function overlayTemplate() {
  const clockIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>';
  const stopIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" width="13" height="13"><rect x="5" y="5" width="14" height="14" rx="2"/></svg>';

  return `
    <style>
      #zb-widget {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        display: flex;
        align-items: center;
        gap: 10px;
        background: #0f172a;
        color: #f1f5f9;
        padding: 10px 12px;
        border-radius: 14px;
        box-shadow: 0 12px 32px rgba(0,0,0,0.35);
        border: 1px solid rgba(255,255,255,0.08);
        min-width: 190px;
        animation: zb-in 220ms ease;
      }
      #zb-widget[data-phase="break"] { border-color: rgba(52,211,153,0.4); }
      @keyframes zb-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
      #zb-clock {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background: rgba(79,70,229,0.25);
        color: #a5b4fc;
        flex-shrink: 0;
      }
      #zb-widget[data-phase="break"] #zb-clock { background: rgba(52,211,153,0.2); color: #6ee7b7; }
      #zb-text { display: flex; flex-direction: column; min-width: 0; flex: 1; }
      #zb-title { font-size: 12px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 130px; }
      #zb-status-row { display: flex; align-items: baseline; gap: 6px; font-size: 11px; color: #94a3b8; }
      #zb-time { font-variant-numeric: tabular-nums; font-weight: 700; color: #f1f5f9; }
      #zb-stop {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 26px;
        height: 26px;
        border-radius: 8px;
        border: none;
        background: rgba(255,255,255,0.08);
        color: #f1f5f9;
        cursor: pointer;
        flex-shrink: 0;
      }
      #zb-stop:hover { background: rgba(248,113,113,0.3); color: #fecaca; }
    </style>
    <div id="zb-widget" role="status" aria-live="polite">
      <div id="zb-clock">${clockIcon}</div>
      <div id="zb-text">
        <div id="zb-title">Focus session</div>
        <div id="zb-status-row">
          <span id="zb-status">Focus</span>
          <span>·</span>
          <span id="zb-time">--:--</span>
        </div>
      </div>
      <button id="zb-stop" title="Stop session" aria-label="Stop session">${stopIcon}</button>
    </div>
  `;
}
