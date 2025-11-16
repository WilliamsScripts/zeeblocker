// Background service worker for ZeeBlocker

// Initialize extension
chrome.runtime.onInstalled.addListener(async () => {
  console.log('ZeeBlocker installed');
  
  // Set default settings
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
    idleTimeThreshold: 10, // minutes
    idleCheckEnabled: false,
    jiraIntegration: { enabled: false, apiKey: '', domain: '' },
    clickupIntegration: { enabled: false, apiKey: '' },
    trelloIntegration: { enabled: false, apiKey: '', token: '' }
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
  
  // Initialize daily stats
  await resetDailyStats();
  
  // Set up daily reset alarm
  chrome.alarms.create('dailyReset', { periodInMinutes: 1440 }); // 24 hours
  
  // Set up idle check alarm
  chrome.alarms.create('idleCheck', { periodInMinutes: 1 });
});

// Handle alarms
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === 'dailyReset') {
    await resetDailyStats();
  } else if (alarm.name === 'idleCheck') {
    await checkIdleTime();
  }
});

// Reset daily stats
async function resetDailyStats() {
  await chrome.storage.local.set({
    blockedToday: 0,
    focusTimeToday: 0,
    lastResetDate: new Date().toDateString()
  });
}

// Check idle time
async function checkIdleTime() {
  const settings = await chrome.storage.sync.get(['idleCheckEnabled', 'idleTimeThreshold']);
  
  if (!settings.idleCheckEnabled) {
    return;
  }
  
  const idleState = await chrome.idle.queryState(settings.idleTimeThreshold * 60);
  
  if (idleState === 'idle') {
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon128.png',
      title: 'ZeeBlocker - Idle Detected',
      message: `You've been idle for ${settings.idleTimeThreshold} minutes. Time for a break?`,
      priority: 2
    });
  }
}

// Track focus time
let focusStartTime = null;

chrome.storage.onChanged.addListener((changes, namespace) => {
  if (changes.focusModeEnabled && namespace === 'sync') {
    if (changes.focusModeEnabled.newValue) {
      focusStartTime = Date.now();
    } else if (focusStartTime) {
      const focusTime = Math.floor((Date.now() - focusStartTime) / 60000); // minutes
      updateFocusTime(focusTime);
      focusStartTime = null;
    }
  }
});

async function updateFocusTime(minutes) {
  const data = await chrome.storage.local.get(['focusTimeToday']);
  const currentTime = data.focusTimeToday || 0;
  await chrome.storage.local.set({ focusTimeToday: currentTime + minutes });
}

// Block navigation
chrome.webNavigation.onBeforeNavigate.addListener(async (details) => {
  if (details.frameId !== 0) return; // Only handle main frame
  
  // Skip chrome:// and extension URLs
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
    'organizationMode',
    'parentEmail',
    'organizationEmail'
  ]);
  
  let shouldBlock = false;
  let blockReason = '';
  
  // Check focus mode
  if (settings.focusModeEnabled) {
    const distractingSites = settings.distractingSites || [];
    if (isUrlInList(url, distractingSites)) {
      shouldBlock = true;
      blockReason = 'focus';
    }
  }
  
  // Check child safety mode
  if (settings.childSafetyMode) {
    const adultSites = settings.adultSites || [];
    if (isUrlInList(url, adultSites)) {
      shouldBlock = true;
      blockReason = 'child-safety';
      
      // Send parent notification
      if (settings.parentEmail) {
        await sendParentNotification(url.hostname, settings.parentEmail);
      }
    }
  }
  
  // Check organization mode
  if (settings.organizationMode) {
    const distractingSites = settings.distractingSites || [];
    if (isUrlInList(url, distractingSites)) {
      shouldBlock = true;
      blockReason = 'organization';
    }
  }
  
  if (shouldBlock) {
    // Increment blocked count
    const data = await chrome.storage.local.get(['blockedToday']);
    await chrome.storage.local.set({ 
      blockedToday: (data.blockedToday || 0) + 1 
    });
    
    // Redirect to blocked page
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
  // In a real implementation, this would send an email or push notification
  // For now, we'll create a browser notification and log it
  
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'icons/icon128.png',
    title: 'ZeeBlocker - Child Safety Alert',
    message: `Attempted access to restricted site: ${site}`,
    priority: 2
  });
  
  console.log(`Parent notification would be sent to ${parentEmail} about ${site}`);
  
  // Store the attempt
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
  if (request.action === 'focusModeChanged') {
    // Handle focus mode change
    console.log('Focus mode:', request.enabled);
  } else if (request.action === 'checkExtensionStatus') {
    // Notify organization when extension is disabled
    sendResponse({ enabled: true });
  } else if (request.action === 'syncIntegrations') {
    // Sync with third-party integrations
    syncIntegrations().then(result => sendResponse(result));
    return true; // Keep channel open for async response
  }
});

// Sync with third-party integrations
async function syncIntegrations() {
  const settings = await chrome.storage.sync.get([
    'jiraIntegration',
    'clickupIntegration',
    'trelloIntegration',
    'tasks'
  ]);
  
  const results = { jira: false, clickup: false, trello: false };
  
  // Jira integration
  if (settings.jiraIntegration?.enabled) {
    results.jira = await syncJira(settings.tasks, settings.jiraIntegration);
  }
  
  // ClickUp integration
  if (settings.clickupIntegration?.enabled) {
    results.clickup = await syncClickUp(settings.tasks, settings.clickupIntegration);
  }
  
  // Trello integration
  if (settings.trelloIntegration?.enabled) {
    results.trello = await syncTrello(settings.tasks, settings.trelloIntegration);
  }
  
  return results;
}

async function syncJira(tasks, config) {
  if (!config.apiKey || !config.domain) return false;
  
  try {
    // In a real implementation, this would make API calls to Jira
    console.log('Syncing with Jira:', config.domain);
    return true;
  } catch (error) {
    console.error('Jira sync error:', error);
    return false;
  }
}

async function syncClickUp(tasks, config) {
  if (!config.apiKey) return false;
  
  try {
    // In a real implementation, this would make API calls to ClickUp
    console.log('Syncing with ClickUp');
    return true;
  } catch (error) {
    console.error('ClickUp sync error:', error);
    return false;
  }
}

async function syncTrello(tasks, config) {
  if (!config.apiKey || !config.token) return false;
  
  try {
    // In a real implementation, this would make API calls to Trello
    console.log('Syncing with Trello');
    return true;
  } catch (error) {
    console.error('Trello sync error:', error);
    return false;
  }
}

// Monitor extension disable/enable (for organization mode)
if (chrome.management && chrome.management.onDisabled) {
  chrome.management.onDisabled.addListener(async (info) => {
    if (info.id === chrome.runtime.id) {
      const settings = await chrome.storage.sync.get(['organizationMode', 'organizationEmail']);
      
      if (settings.organizationMode && settings.organizationEmail) {
        // In a real implementation, send notification to organization
        console.log(`Extension disabled - would notify ${settings.organizationEmail}`);
      }
    }
  });
}

console.log('ZeeBlocker background service worker loaded');

