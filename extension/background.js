// Background service worker for ZeeBlocker
// Simplified version - requires dashboard connection

// Cross-browser compatibility
if (typeof browser !== 'undefined' && typeof chrome === 'undefined') {
  globalThis.chrome = browser
}

// API Configuration
const API_BASE_URL = 'http://localhost:3000' // Change to production URL when deploying

// Initialize extension
chrome.runtime.onInstalled.addListener(async () => {
  console.log('ZeeBlocker installed - Dashboard connection required')
  
  // Set minimal default settings
  const defaultSettings = {
    apiKey: '',
    apiUrl: API_BASE_URL,
    focusModeEnabled: false,
    darkMode: false,
    syncEnabled: false,
    lastSync: null,
    idleTimeThreshold: 10,
    idleCheckEnabled: false,
    // Synced from dashboard
    distractingSites: [],
    adultSites: [],
    profileBlocklists: {}
  }
  
  const existing = await chrome.storage.sync.get(Object.keys(defaultSettings))
  const toSet = {}
  
  for (const [key, value] of Object.entries(defaultSettings)) {
    if (existing[key] === undefined) {
      toSet[key] = value
    }
  }
  
  if (Object.keys(toSet).length > 0) {
    await chrome.storage.sync.set(toSet)
  }
  
  // Initialize daily stats
  await resetDailyStats()
  
  // Set up daily reset alarm
  chrome.alarms.create('dailyReset', { periodInMinutes: 1440 })
  
  // Set up idle check alarm
  chrome.alarms.create('idleCheck', { periodInMinutes: 1 })
  
  // Set up sync alarm (sync every 5 minutes)
  chrome.alarms.create('syncBlocklists', { periodInMinutes: 5 })
  
  // Initial sync if connected
  await syncBlocklists()
})

// Handle alarms
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === 'dailyReset') {
    await resetDailyStats()
  } else if (alarm.name === 'idleCheck') {
    await checkIdleTime()
  } else if (alarm.name === 'syncBlocklists') {
    await syncBlocklists()
  }
})

// Sync blocklists from dashboard API
async function syncBlocklists() {
  try {
    const settings = await chrome.storage.sync.get(['apiKey', 'apiUrl', 'syncEnabled'])
    
    if (!settings.syncEnabled || !settings.apiKey) {
      console.log('⏸️ Sync disabled or no API key - extension requires dashboard connection')
      return
    }

    const apiUrl = settings.apiUrl || API_BASE_URL
    
    console.log('🔄 Syncing blocklists from dashboard...')
    
    // Fetch blocklists from API
    const response = await fetch(`${apiUrl}/api/extension/sync?extensionId=${chrome.runtime.id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${settings.apiKey}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      console.error('❌ Failed to sync:', response.status, response.statusText)
      return
    }

    const data = await response.json()
    
    console.log('✅ Received data from dashboard:', {
      distractingSites: data.blocklists?.personal?.length || 0,
      profiles: data.profiles?.length || 0
    })
    
    // Update local storage with synced data
    await chrome.storage.sync.set({
      distractingSites: data.blocklists?.personal || [],
      profileBlocklists: data.blocklists || {},
      lastSync: new Date().toISOString()
    })

    // Store user info
    if (data.user) {
      await chrome.storage.local.set({
        userEmail: data.user.email,
        subscriptionPlan: data.user.subscription_plan
      })
    }

    console.log('✅ Blocklists synced successfully')
    
    // Register this browser if not already registered
    await registerBrowser(settings.apiKey, apiUrl)
    
  } catch (error) {
    console.error('❌ Error syncing blocklists:', error)
  }
}

// Register browser extension with the API
async function registerBrowser(apiKey, apiUrl) {
  try {
    const browserInfo = await chrome.runtime.getPlatformInfo()
    const manifestData = chrome.runtime.getManifest()
    
    const response = await fetch(`${apiUrl}/api/extension/register`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        browserType: getBrowserType(),
        browserVersion: manifestData.version,
        platform: browserInfo.os
      })
    })

    if (response.ok) {
      console.log('✅ Browser registered with dashboard')
    }
  } catch (error) {
    console.error('❌ Error registering browser:', error)
  }
}

// Detect browser type
function getBrowserType() {
  const userAgent = navigator.userAgent.toLowerCase()
  if (userAgent.includes('firefox')) return 'firefox'
  if (userAgent.includes('edg')) return 'edge'
  if (userAgent.includes('brave')) return 'brave'
  if (userAgent.includes('arc')) return 'arc'
  return 'chrome'
}

// Reset daily stats
async function resetDailyStats() {
  await chrome.storage.local.set({
    blockedToday: 0,
    focusTimeToday: 0,
    lastResetDate: new Date().toDateString()
  })
}

// Check idle time
async function checkIdleTime() {
  const settings = await chrome.storage.sync.get(['idleCheckEnabled', 'idleTimeThreshold'])
  
  if (!settings.idleCheckEnabled) {
    return
  }
  
  const idleState = await chrome.idle.queryState(settings.idleTimeThreshold * 60)
  
  if (idleState === 'idle') {
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon128.png',
      title: 'ZeeBlocker - Idle Detected',
      message: `You've been idle for ${settings.idleTimeThreshold} minutes. Time for a break?`,
      priority: 2
    })
  }
}

// Track focus time
let focusStartTime = null

chrome.storage.onChanged.addListener((changes, namespace) => {
  if (changes.focusModeEnabled && namespace === 'sync') {
    if (changes.focusModeEnabled.newValue) {
      focusStartTime = Date.now()
    } else if (focusStartTime) {
      const focusTime = Math.floor((Date.now() - focusStartTime) / 60000)
      updateFocusTime(focusTime)
      focusStartTime = null
    }
  }
})

async function updateFocusTime(minutes) {
  const data = await chrome.storage.local.get(['focusTimeToday'])
  const currentTime = data.focusTimeToday || 0
  await chrome.storage.local.set({ focusTimeToday: currentTime + minutes })
}

// Block navigation - requires dashboard connection
chrome.webNavigation.onBeforeNavigate.addListener(async (details) => {
  if (details.frameId !== 0) return
  
  // Skip non-http(s) URLs
  if (!details.url.startsWith('http://') && !details.url.startsWith('https://')) {
    return
  }
  
  let url
  try {
    url = new URL(details.url)
  } catch (error) {
    return
  }
  
  const settings = await chrome.storage.sync.get([
    'focusModeEnabled',
    'distractingSites',
    'syncEnabled',
    'apiKey'
  ])
  
  // Extension only works when connected to dashboard
  if (!settings.syncEnabled || !settings.apiKey) {
    return // Don't block if not connected
  }
  
  let shouldBlock = false
  let blockReason = 'focus'
  
  // Check focus mode with synced blocklists
  if (settings.focusModeEnabled) {
    const distractingSites = settings.distractingSites || []
    if (isUrlInList(url, distractingSites)) {
      shouldBlock = true
      blockReason = 'focus'
    }
  }
  
  if (shouldBlock) {
    // Increment blocked count
    const data = await chrome.storage.local.get(['blockedToday'])
    await chrome.storage.local.set({ 
      blockedToday: (data.blockedToday || 0) + 1 
    })
    
    // Log to dashboard
    await logBlockAttempt(url.hostname, settings.apiKey)
    
    // Redirect to blocked page
    chrome.tabs.update(details.tabId, {
      url: chrome.runtime.getURL(`blocked.html?reason=${blockReason}&site=${encodeURIComponent(url.hostname)}`)
    })
  }
})

// Check if URL is in blocklist
function isUrlInList(url, list) {
  const hostname = url.hostname.replace('www.', '')
  return list.some(site => {
    const cleanSite = site.replace('www.', '')
    return hostname === cleanSite || hostname.endsWith('.' + cleanSite)
  })
}

// Log block attempt to dashboard
async function logBlockAttempt(siteUrl, apiKey) {
  try {
    const apiUrl = API_BASE_URL
    
    await fetch(`${apiUrl}/api/blocks/log`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        siteUrl: siteUrl,
        extensionId: chrome.runtime.id
      })
    })
  } catch (error) {
    console.error('Failed to log block attempt:', error)
  }
}

// Handle messages
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'syncNow') {
    syncBlocklists().then(() => {
      sendResponse({ success: true })
    }).catch(error => {
      sendResponse({ success: false, error: error.message })
    })
    return true
  } else if (request.action === 'focusModeChanged') {
    console.log('Focus mode:', request.enabled ? 'ON' : 'OFF')
    sendResponse({ success: true })
  }
})

console.log('🎯 ZeeBlocker background service ready - Dashboard connection required')
