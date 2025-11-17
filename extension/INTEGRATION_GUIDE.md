# Extension Integration Guide

This guide explains how to integrate the existing browser extension with the new API backend.

## Overview

The extension needs to be updated to:
1. Authenticate users with the API
2. Fetch blocklists from the API instead of local storage
3. Log block attempts to the API
4. Sync settings in real-time

## Required Changes

### 1. Add API Configuration

Create a new file: `extension/config.js`

```javascript
const API_CONFIG = {
  baseUrl: 'https://yourdomain.com', // Replace with your actual domain
  endpoints: {
    auth: '/api/extension/auth',
    sync: '/api/extension/sync',
    logBlock: '/api/blocks/log',
  }
}
```

### 2. Update background.js

Add these functions to `background.js`:

```javascript
// Authentication state
let authToken = null
let refreshToken = null
let userId = null

// Generate unique extension ID
const EXTENSION_ID = chrome.runtime.id

// Login function
async function loginExtension(email, password) {
  try {
    const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.auth}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
        extensionId: EXTENSION_ID,
        browserType: getBrowserType(),
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Authentication failed')
    }

    const data = await response.json()
    authToken = data.accessToken
    refreshToken = data.refreshToken
    userId = data.userId

    // Store tokens securely
    await chrome.storage.local.set({
      authToken,
      refreshToken,
      userId,
      isAuthenticated: true,
    })

    // Initial sync
    await syncWithAPI()

    return { success: true }
  } catch (error) {
    console.error('Login error:', error)
    return { success: false, error: error.message }
  }
}

// Sync blocklists from API
async function syncWithAPI() {
  try {
    if (!authToken) {
      const stored = await chrome.storage.local.get(['authToken'])
      authToken = stored.authToken
    }

    if (!authToken) {
      throw new Error('Not authenticated')
    }

    const response = await fetch(
      `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.sync}?extensionId=${EXTENSION_ID}`,
      {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      }
    )

    if (!response.ok) {
      throw new Error('Sync failed')
    }

    const data = await response.json()

    // Update local blocklists
    await chrome.storage.sync.set({
      distractingSites: data.blocklists.personal || [],
      profiles: data.profiles || [],
      user: data.user,
      lastSyncTime: new Date().toISOString(),
    })

    console.log('Synced with API successfully')
    return data
  } catch (error) {
    console.error('Sync error:', error)
    throw error
  }
}

// Log block attempt to API
async function logBlockAttempt(siteUrl, profileId = null) {
  try {
    if (!authToken) {
      const stored = await chrome.storage.local.get(['authToken'])
      authToken = stored.authToken
    }

    if (!authToken) {
      console.warn('Not authenticated, block not logged')
      return
    }

    await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.logBlock}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        siteUrl,
        extensionId: EXTENSION_ID,
        profileId,
      }),
    })
  } catch (error) {
    console.error('Failed to log block attempt:', error)
    // Don't fail the blocking if logging fails
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

// Auto-sync every 5 minutes
chrome.alarms.create('autoSync', { periodInMinutes: 5 })

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'autoSync') {
    syncWithAPI().catch(console.error)
  }
  // ... existing alarm handlers
})

// Update existing block handling
// In the webNavigation.onBeforeNavigate listener:
// After determining shouldBlock = true:
if (shouldBlock) {
  // Log to API
  await logBlockAttempt(url.hostname, currentProfileId)
  
  // Existing block code...
  const data = await chrome.storage.local.get(['blockedToday'])
  await chrome.storage.local.set({ 
    blockedToday: (data.blockedToday || 0) + 1 
  })
  
  chrome.tabs.update(details.tabId, {
    url: chrome.runtime.getURL(`blocked.html?reason=${blockReason}&site=${encodeURIComponent(url.hostname)}`)
  })
}
```

### 3. Update popup.html

Add a login section to popup.html (before existing content):

```html
<div id="loginSection" class="hidden">
  <div class="section">
    <h2>🔐 Login to ZeeBlocker</h2>
    <p>Sign in to sync your blocklists across devices</p>
    
    <form id="loginForm">
      <div class="form-group">
        <label>Email</label>
        <input type="email" id="loginEmail" required placeholder="you@example.com">
      </div>
      
      <div class="form-group">
        <label>Password</label>
        <input type="password" id="loginPassword" required placeholder="••••••••">
      </div>
      
      <button type="submit" class="btn btn-primary">Login</button>
      <p class="text-center mt-2">
        <a href="https://yourdomain.com/signup" target="_blank">Create account</a>
      </p>
    </form>
  </div>
</div>

<div id="mainContent" class="hidden">
  <!-- Existing popup content here -->
</div>
```

### 4. Update popup.js

Add authentication handling:

```javascript
// Check authentication status on load
document.addEventListener('DOMContentLoaded', async () => {
  const { isAuthenticated } = await chrome.storage.local.get(['isAuthenticated'])
  
  if (isAuthenticated) {
    document.getElementById('loginSection').classList.add('hidden')
    document.getElementById('mainContent').classList.remove('hidden')
    await loadSettings()
    await loadTasks()
    await loadStats()
  } else {
    document.getElementById('loginSection').classList.remove('hidden')
    document.getElementById('mainContent').classList.add('hidden')
  }
  
  setupEventListeners()
})

// Login form handler
document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
  e.preventDefault()
  
  const email = document.getElementById('loginEmail').value
  const password = document.getElementById('loginPassword').value
  
  const result = await chrome.runtime.sendMessage({
    action: 'login',
    email,
    password,
  })
  
  if (result.success) {
    document.getElementById('loginSection').classList.add('hidden')
    document.getElementById('mainContent').classList.remove('hidden')
    await loadSettings()
    await loadTasks()
    await loadStats()
  } else {
    alert('Login failed: ' + result.error)
  }
})

// Handle login message
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'login') {
    chrome.runtime.sendMessage({
      action: 'performLogin',
      email: request.email,
      password: request.password,
    }, sendResponse)
    return true
  }
})
```

### 5. Add to background.js message handler

```javascript
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'performLogin') {
    loginExtension(request.email, request.password)
      .then(sendResponse)
    return true // Keep channel open for async response
  }
  // ... existing message handlers
})
```

## Browser Compatibility

The extension uses the `chrome.*` API namespace, which is compatible with:
- Chrome
- Edge
- Brave
- Arc
- Opera

For Firefox compatibility, add this to the top of each script file:

```javascript
// Cross-browser compatibility
if (typeof browser !== 'undefined' && typeof chrome === 'undefined') {
  chrome = browser
}
```

## Testing

1. Load the extension in developer mode
2. Click the extension icon
3. Log in with your dashboard credentials
4. The extension will sync your blocklists from the API
5. Try visiting a blocked site - it should be blocked and logged
6. Check your dashboard timeline to see the logged attempt

## Security Notes

- Tokens are stored in `chrome.storage.local` (secure, not synced)
- Always use HTTPS for the API
- Implement token refresh for expired tokens
- Never log sensitive data

## Troubleshooting

**Extension not syncing:**
- Check console for errors
- Verify API URL is correct
- Ensure you're logged in

**Blocks not being logged:**
- Check network tab for failed API requests
- Verify authentication token is present
- Check API logs for errors

**Cross-origin errors:**
- Add your extension ID to CORS whitelist in API
- Ensure manifest.json has correct permissions

