// Settings page script

// Fields covered by the batch "Save Settings" button — used to show the unsaved-
// changes reminder banner (deliberately excludes the blocklist add-site inputs,
// which save immediately via their own Add buttons, not this flow).
const SAVE_TRACKED_FIELD_IDS = [
  'darkModeToggle', 'idleCheckToggle', 'idleThreshold', 'idleBellModeSelect', 'idleAlertSoundSelect',
  'childSafetyToggle', 'parentEmail',
  'workBellSelect', 'breakBellSelect', 'focusMusicToggle', 'focusMusicVolume'
];

document.addEventListener('DOMContentLoaded', async () => {
  renderStaticIcons();
  await loadSettings();
  setupEventListeners();
  setupTabs();
});

function renderStaticIcons() {
  document.getElementById('brandLogo').innerHTML = `${renderIcon('target', 'icon icon-lg')}<span>ZeeBlocker Settings</span>`;
  document.getElementById('addSiteBtn').innerHTML = `${renderIcon('plus', 'icon-sm')}<span>Add Site</span>`;
  document.getElementById('addAdultSiteBtn').innerHTML = `${renderIcon('plus', 'icon-sm')}<span>Add Site</span>`;
  document.getElementById('saveBtn').innerHTML = `${renderIcon('check', 'icon-sm')}<span>Save Settings</span>`;
  document.getElementById('previewWorkBellBtn').innerHTML = renderIcon('play', 'icon-sm');
  document.getElementById('previewBreakBellBtn').innerHTML = renderIcon('play', 'icon-sm');
  document.getElementById('previewIdleAlertSoundBtn').innerHTML = renderIcon('play', 'icon-sm');

  document.querySelector('.alert-info').innerHTML = `
    ${renderIcon('info', 'icon-sm')}
    <span><strong>Privacy notice:</strong> enabling this feature means you consent to monitoring and reporting of site access attempts. This complies with COPPA regulations when proper parental consent is obtained.</span>
  `;

  document.querySelectorAll('.tab-btn').forEach(btn => {
    const icon = btn.dataset.icon;
    const label = btn.textContent;
    btn.innerHTML = `${renderIcon(icon, 'icon-sm')}<span>${label}</span>`;
  });
}

// Setup tabs
function setupTabs() {
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabName = btn.dataset.tab;

      tabBtns.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));

      btn.classList.add('active');
      document.getElementById(tabName).classList.add('active');
    });
  });
}

// Setup event listeners
function setupEventListeners() {
  document.getElementById('saveBtn').addEventListener('click', saveSettings);
  document.getElementById('resetBtn').addEventListener('click', resetSettings);

  document.getElementById('addSiteBtn').addEventListener('click', addDistractingSite);
  document.getElementById('addAdultSiteBtn').addEventListener('click', addAdultSite);

  document.getElementById('previewWorkBellBtn').addEventListener('click', () => {
    previewSound(document.getElementById('workBellSelect').value);
  });
  document.getElementById('previewBreakBellBtn').addEventListener('click', () => {
    previewSound(document.getElementById('breakBellSelect').value);
  });
  document.getElementById('previewIdleAlertSoundBtn').addEventListener('click', () => {
    previewSound(document.getElementById('idleAlertSoundSelect').value);
  });

  SAVE_TRACKED_FIELD_IDS.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('input', showUnsavedBanner);
    el.addEventListener('change', showUnsavedBanner);
  });

  chrome.runtime.onMessage.addListener((request) => {
    if (request.action === 'navigateToTab') {
      document.querySelector(`[data-tab="${request.tab}"]`)?.click();
    }
  });
}

// Load settings
async function loadSettings() {
  const settings = await chrome.storage.sync.get([
    'darkMode',
    'idleCheckEnabled',
    'idleTimeThreshold',
    'distractingSites',
    'childSafetyMode',
    'parentEmail',
    'adultSites',
    'workBell',
    'breakBell',
    'focusMusicEnabled',
    'focusMusicVolume',
    'idleAlertBellMode',
    'idleAlertSound'
  ]);

  document.getElementById('darkModeToggle').checked = settings.darkMode || false;
  document.getElementById('idleCheckToggle').checked = settings.idleCheckEnabled || false;
  document.getElementById('idleThreshold').value = settings.idleTimeThreshold || 10;

  if (settings.darkMode) {
    document.documentElement.setAttribute('data-theme', 'dark');
  }

  renderDistractingSites(settings.distractingSites || []);

  document.getElementById('childSafetyToggle').checked = settings.childSafetyMode || false;
  document.getElementById('parentEmail').value = settings.parentEmail || '';
  renderAdultSites(settings.adultSites || []);
  await loadAccessAttempts();

  renderBellOptions();
  document.getElementById('workBellSelect').value = settings.workBell || DEFAULT_WORK_BELL;
  document.getElementById('breakBellSelect').value = settings.breakBell || DEFAULT_BREAK_BELL;
  document.getElementById('focusMusicToggle').checked = settings.focusMusicEnabled !== false;
  const volume = settings.focusMusicVolume ?? DEFAULT_FOCUS_MUSIC_VOLUME;
  document.getElementById('focusMusicVolume').value = Math.round(volume * 100);
  document.getElementById('idleBellModeSelect').value = settings.idleAlertBellMode || DEFAULT_IDLE_ALERT_BELL_MODE;
  document.getElementById('idleAlertSoundSelect').value = settings.idleAlertSound || DEFAULT_IDLE_ALERT_SOUND;

  hideUnsavedBanner();
}

// ---- Unsaved changes reminder ----
function showUnsavedBanner() {
  const banner = document.getElementById('unsavedBanner');
  banner.querySelector('span').textContent = 'You have unsaved changes — scroll down and click Save Settings to keep them.';
  banner.classList.remove('hidden');
}

function hideUnsavedBanner() {
  document.getElementById('unsavedBanner').classList.add('hidden');
}

// Populate the bell dropdowns from the shared sound catalog
function renderBellOptions() {
  document.getElementById('workBellSelect').innerHTML = bellOptionsHtml(WORK_BELL_SOUNDS);
  document.getElementById('breakBellSelect').innerHTML = bellOptionsHtml(BREAK_BELL_SOUNDS);
  document.getElementById('idleAlertSoundSelect').innerHTML = bellOptionsHtml(IDLE_ALERT_SOUNDS);
}

function bellOptionsHtml(sounds) {
  return sounds.map(sound => `<option value="${escapeHtml(sound.file)}">${escapeHtml(sound.name)}</option>`).join('');
}

// Play a bell sound immediately so the user can hear their choice
function previewSound(file) {
  chrome.runtime.sendMessage({ action: 'previewSound', file });
}

// Render distracting sites
function renderDistractingSites(sites) {
  const container = document.getElementById('sitesList');

  if (sites.length === 0) {
    container.innerHTML = '<div class="empty-log">No sites added yet</div>';
    return;
  }

  container.innerHTML = sites.map(site => `
    <div class="site-item">
      <span class="site-name">${escapeHtml(site)}</span>
      <button class="remove-btn" data-site="${escapeHtml(site)}" data-type="distracting">Remove</button>
    </div>
  `).join('');

  container.querySelectorAll('.remove-btn[data-type="distracting"]').forEach(btn => {
    btn.addEventListener('click', () => removeDistractingSite(btn.dataset.site));
  });
}

// Render adult sites
function renderAdultSites(sites) {
  const container = document.getElementById('adultSitesList');

  if (sites.length === 0) {
    container.innerHTML = '<div class="empty-log">No restricted sites added</div>';
    return;
  }

  container.innerHTML = sites.map(site => `
    <div class="site-item">
      <span class="site-name">${escapeHtml(site)}</span>
      <button class="remove-btn" data-site="${escapeHtml(site)}" data-type="adult">Remove</button>
    </div>
  `).join('');

  container.querySelectorAll('.remove-btn[data-type="adult"]').forEach(btn => {
    btn.addEventListener('click', () => removeAdultSite(btn.dataset.site));
  });
}

// Add distracting site
async function addDistractingSite() {
  const input = document.getElementById('newSite');
  const site = input.value.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/$/, '');

  if (!site) {
    showToast('Please enter a valid site', 'error');
    return;
  }

  const settings = await chrome.storage.sync.get(['distractingSites']);
  const sites = settings.distractingSites || [];

  if (sites.includes(site)) {
    showToast('Site already in list', 'error');
    return;
  }

  sites.push(site);
  await chrome.storage.sync.set({ distractingSites: sites });

  input.value = '';
  renderDistractingSites(sites);
  showToast('Site added successfully');
}

// Remove distracting site
async function removeDistractingSite(site) {
  const settings = await chrome.storage.sync.get(['distractingSites']);
  const sites = settings.distractingSites || [];

  const filtered = sites.filter(s => s !== site);
  await chrome.storage.sync.set({ distractingSites: filtered });

  renderDistractingSites(filtered);
  showToast('Site removed');
}

// Add adult site
async function addAdultSite() {
  const input = document.getElementById('newAdultSite');
  const site = input.value.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/$/, '');

  if (!site) {
    showToast('Please enter a valid site', 'error');
    return;
  }

  const settings = await chrome.storage.sync.get(['adultSites']);
  const sites = settings.adultSites || [];

  if (sites.includes(site)) {
    showToast('Site already in list', 'error');
    return;
  }

  sites.push(site);
  await chrome.storage.sync.set({ adultSites: sites });

  input.value = '';
  renderAdultSites(sites);
  showToast('Restricted site added');
}

// Remove adult site
async function removeAdultSite(site) {
  const settings = await chrome.storage.sync.get(['adultSites']);
  const sites = settings.adultSites || [];

  const filtered = sites.filter(s => s !== site);
  await chrome.storage.sync.set({ adultSites: filtered });

  renderAdultSites(filtered);
  showToast('Site removed');
}

// Load access attempts
async function loadAccessAttempts() {
  const data = await chrome.storage.local.get(['accessAttempts']);
  const attempts = data.accessAttempts || [];

  const container = document.getElementById('accessAttempts');

  if (attempts.length === 0) {
    container.innerHTML = '<div class="empty-log">No access attempts logged</div>';
    return;
  }

  container.innerHTML = attempts.slice(-10).reverse().map(attempt => `
    <div class="access-item">
      <div>
        <div class="access-site">${escapeHtml(attempt.site)}</div>
        <div class="access-time">${formatDateTime(attempt.timestamp)}</div>
      </div>
      <div class="access-status">${attempt.notified ? `${renderIcon('check', 'icon-sm')} Notified` : `${renderIcon('close', 'icon-sm')} Not notified`}</div>
    </div>
  `).join('');
}

// Save settings
async function saveSettings() {
  const settings = {
    darkMode: document.getElementById('darkModeToggle').checked,
    idleCheckEnabled: document.getElementById('idleCheckToggle').checked,
    idleTimeThreshold: parseInt(document.getElementById('idleThreshold').value),
    childSafetyMode: document.getElementById('childSafetyToggle').checked,
    parentEmail: document.getElementById('parentEmail').value,
    workBell: document.getElementById('workBellSelect').value,
    breakBell: document.getElementById('breakBellSelect').value,
    focusMusicEnabled: document.getElementById('focusMusicToggle').checked,
    focusMusicVolume: parseInt(document.getElementById('focusMusicVolume').value, 10) / 100,
    idleAlertBellMode: document.getElementById('idleBellModeSelect').value,
    idleAlertSound: document.getElementById('idleAlertSoundSelect').value
  };

  await chrome.storage.sync.set(settings);

  if (settings.darkMode) {
    document.documentElement.setAttribute('data-theme', 'dark');
  } else {
    document.documentElement.removeAttribute('data-theme');
  }

  hideUnsavedBanner();
  showToast('Settings saved successfully!');
}

// Reset settings
async function resetSettings() {
  if (!confirm('Are you sure you want to reset all settings to defaults?')) {
    return;
  }

  const defaultSettings = {
    darkMode: false,
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
    idleTimeThreshold: 10,
    idleCheckEnabled: false,
    workBell: DEFAULT_WORK_BELL,
    breakBell: DEFAULT_BREAK_BELL,
    focusMusicEnabled: DEFAULT_FOCUS_MUSIC_ENABLED,
    focusMusicVolume: DEFAULT_FOCUS_MUSIC_VOLUME,
    idleAlertBellMode: DEFAULT_IDLE_ALERT_BELL_MODE,
    idleAlertSound: DEFAULT_IDLE_ALERT_SOUND
  };

  await chrome.storage.sync.set(defaultSettings);
  await loadSettings();

  showToast('Settings reset to defaults');
}

// Utility functions
function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = `toast ${type} show`;

  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function formatDateTime(isoString) {
  const date = new Date(isoString);
  return date.toLocaleString();
}
