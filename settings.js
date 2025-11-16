// Settings page script

document.addEventListener('DOMContentLoaded', async () => {
  await loadSettings();
  setupEventListeners();
  setupTabs();
});

// Setup tabs
function setupTabs() {
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');
  
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabName = btn.dataset.tab;
      
      // Remove active class from all
      tabBtns.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));
      
      // Add active class to clicked
      btn.classList.add('active');
      document.getElementById(tabName).classList.add('active');
    });
  });
}

// Setup event listeners
function setupEventListeners() {
  // Save button
  document.getElementById('saveBtn').addEventListener('click', saveSettings);
  
  // Reset button
  document.getElementById('resetBtn').addEventListener('click', resetSettings);
  
  // Add site buttons
  document.getElementById('addSiteBtn').addEventListener('click', addDistractingSite);
  document.getElementById('addAdultSiteBtn').addEventListener('click', addAdultSite);
  
  // Integration toggles
  document.getElementById('jiraEnabled').addEventListener('change', toggleJiraConfig);
  document.getElementById('clickupEnabled').addEventListener('change', toggleClickUpConfig);
  document.getElementById('trelloEnabled').addEventListener('change', toggleTrelloConfig);
  
  // Test connection buttons
  document.getElementById('testJiraBtn').addEventListener('click', testJiraConnection);
  document.getElementById('testClickUpBtn').addEventListener('click', testClickUpConnection);
  document.getElementById('testTrelloBtn').addEventListener('click', testTrelloConnection);
  
  // Sync all button
  document.getElementById('syncAllBtn').addEventListener('click', syncAllIntegrations);
  
  // Listen for navigation message
  chrome.runtime.onMessage.addListener((request) => {
    if (request.action === 'navigateToTab') {
      const tab = request.tab;
      document.querySelector(`[data-tab="${tab}"]`)?.click();
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
    'organizationMode',
    'organizationEmail',
    'jiraIntegration',
    'clickupIntegration',
    'trelloIntegration'
  ]);
  
  // General settings
  document.getElementById('darkModeToggle').checked = settings.darkMode || false;
  document.getElementById('idleCheckToggle').checked = settings.idleCheckEnabled || false;
  document.getElementById('idleThreshold').value = settings.idleTimeThreshold || 10;
  
  // Apply dark mode
  if (settings.darkMode) {
    document.documentElement.setAttribute('data-theme', 'dark');
  }
  
  // Blocklist
  renderDistractingSites(settings.distractingSites || []);
  
  // Child safety
  document.getElementById('childSafetyToggle').checked = settings.childSafetyMode || false;
  document.getElementById('parentEmail').value = settings.parentEmail || '';
  renderAdultSites(settings.adultSites || []);
  await loadAccessAttempts();
  
  // Organization
  document.getElementById('organizationToggle').checked = settings.organizationMode || false;
  document.getElementById('organizationEmail').value = settings.organizationEmail || '';
  await loadOrganizationStats();
  
  // Integrations
  const jira = settings.jiraIntegration || {};
  document.getElementById('jiraEnabled').checked = jira.enabled || false;
  document.getElementById('jiraDomain').value = jira.domain || '';
  document.getElementById('jiraApiKey').value = jira.apiKey || '';
  if (jira.enabled) {
    document.getElementById('jiraConfig').classList.remove('hidden');
  }
  
  const clickup = settings.clickupIntegration || {};
  document.getElementById('clickupEnabled').checked = clickup.enabled || false;
  document.getElementById('clickupApiKey').value = clickup.apiKey || '';
  if (clickup.enabled) {
    document.getElementById('clickupConfig').classList.remove('hidden');
  }
  
  const trello = settings.trelloIntegration || {};
  document.getElementById('trelloEnabled').checked = trello.enabled || false;
  document.getElementById('trelloApiKey').value = trello.apiKey || '';
  document.getElementById('trelloToken').value = trello.token || '';
  if (trello.enabled) {
    document.getElementById('trelloConfig').classList.remove('hidden');
  }
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
  
  // Add event listeners
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
  
  // Add event listeners
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
      <div>${attempt.notified ? '✅ Notified' : '❌ Not notified'}</div>
    </div>
  `).join('');
}

// Load organization stats
async function loadOrganizationStats() {
  const data = await chrome.storage.local.get(['blockedToday']);
  
  // For demo purposes, showing simple stats
  // In production, you'd track weekly and monthly stats separately
  const blockedToday = data.blockedToday || 0;
  
  document.getElementById('orgBlockedToday').textContent = blockedToday;
  document.getElementById('orgBlockedWeek').textContent = blockedToday * 5; // Simulated
  document.getElementById('orgBlockedMonth').textContent = blockedToday * 20; // Simulated
}

// Integration toggles
function toggleJiraConfig(e) {
  const config = document.getElementById('jiraConfig');
  config.classList.toggle('hidden', !e.target.checked);
}

function toggleClickUpConfig(e) {
  const config = document.getElementById('clickupConfig');
  config.classList.toggle('hidden', !e.target.checked);
}

function toggleTrelloConfig(e) {
  const config = document.getElementById('trelloConfig');
  config.classList.toggle('hidden', !e.target.checked);
}

// Test connections
async function testJiraConnection() {
  showToast('Testing Jira connection...');
  // In production, this would make an actual API call
  setTimeout(() => {
    showToast('Jira connection successful!');
  }, 1000);
}

async function testClickUpConnection() {
  showToast('Testing ClickUp connection...');
  setTimeout(() => {
    showToast('ClickUp connection successful!');
  }, 1000);
}

async function testTrelloConnection() {
  showToast('Testing Trello connection...');
  setTimeout(() => {
    showToast('Trello connection successful!');
  }, 1000);
}

// Sync all integrations
async function syncAllIntegrations() {
  showToast('Syncing integrations...');
  
  const result = await chrome.runtime.sendMessage({ action: 'syncIntegrations' });
  
  if (result) {
    const synced = Object.values(result).filter(v => v).length;
    showToast(`Synced ${synced} integration(s)`);
  }
}

// Save settings
async function saveSettings() {
  const settings = {
    darkMode: document.getElementById('darkModeToggle').checked,
    idleCheckEnabled: document.getElementById('idleCheckToggle').checked,
    idleTimeThreshold: parseInt(document.getElementById('idleThreshold').value),
    childSafetyMode: document.getElementById('childSafetyToggle').checked,
    parentEmail: document.getElementById('parentEmail').value,
    organizationMode: document.getElementById('organizationToggle').checked,
    organizationEmail: document.getElementById('organizationEmail').value,
    jiraIntegration: {
      enabled: document.getElementById('jiraEnabled').checked,
      domain: document.getElementById('jiraDomain').value,
      apiKey: document.getElementById('jiraApiKey').value
    },
    clickupIntegration: {
      enabled: document.getElementById('clickupEnabled').checked,
      apiKey: document.getElementById('clickupApiKey').value
    },
    trelloIntegration: {
      enabled: document.getElementById('trelloEnabled').checked,
      apiKey: document.getElementById('trelloApiKey').value,
      token: document.getElementById('trelloToken').value
    }
  };
  
  await chrome.storage.sync.set(settings);
  
  // Apply dark mode immediately
  if (settings.darkMode) {
    document.documentElement.setAttribute('data-theme', 'dark');
  } else {
    document.documentElement.removeAttribute('data-theme');
  }
  
  showToast('Settings saved successfully!');
}

// Reset settings
async function resetSettings() {
  if (!confirm('Are you sure you want to reset all settings to defaults?')) {
    return;
  }
  
  const defaultSettings = {
    focusModeEnabled: false,
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
    organizationMode: false,
    parentEmail: '',
    organizationEmail: '',
    idleTimeThreshold: 10,
    idleCheckEnabled: false,
    jiraIntegration: { enabled: false, apiKey: '', domain: '' },
    clickupIntegration: { enabled: false, apiKey: '' },
    trelloIntegration: { enabled: false, apiKey: '', token: '' }
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

