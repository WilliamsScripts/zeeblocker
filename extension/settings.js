// Settings page script - Simplified version

// Cross-browser compatibility
if (typeof browser !== 'undefined' && typeof chrome === 'undefined') {
  globalThis.chrome = browser
}

document.addEventListener('DOMContentLoaded', async () => {
  await loadSettings()
  setupEventListeners()
})

// Setup event listeners
function setupEventListeners() {
  // Save button
  document.getElementById('saveBtn').addEventListener('click', saveSettings)
  
  // Reset button
  document.getElementById('resetBtn').addEventListener('click', resetSettings)
  
  // Disconnect button
  document.getElementById('disconnectBtn').addEventListener('click', handleDisconnect)

  // Sync toggle - show/hide status
  document.getElementById('syncEnabledToggle').addEventListener('change', updateSyncStatus)

  // Idle check toggle - show/hide threshold
  document.getElementById('idleCheckToggle').addEventListener('change', toggleIdleThreshold)
}

// Load settings
async function loadSettings() {
  const settings = await chrome.storage.sync.get([
    'apiKey',
    'syncEnabled',
    'lastSync',
    'darkMode',
    'idleCheckEnabled',
    'idleTimeThreshold'
  ])
  
  // Dashboard sync settings
  document.getElementById('apiKey').value = settings.apiKey || ''
  document.getElementById('syncEnabledToggle').checked = settings.syncEnabled || false
  
  // General settings
  document.getElementById('darkModeToggle').checked = settings.darkMode || false
  document.getElementById('idleCheckToggle').checked = settings.idleCheckEnabled || false
  document.getElementById('idleThreshold').value = settings.idleTimeThreshold || 10
  
  // Apply dark mode
  if (settings.darkMode) {
    document.documentElement.setAttribute('data-theme', 'dark')
  }

  // Update sync status display
  updateSyncStatus()

  // Show/hide idle threshold based on toggle
  toggleIdleThreshold()

  // Display last sync info
  if (settings.syncEnabled && settings.lastSync) {
    displaySyncStatus(settings.lastSync, true)
  }
}

// Update sync status visibility
function updateSyncStatus() {
  const syncEnabled = document.getElementById('syncEnabledToggle').checked
  const syncStatus = document.getElementById('syncStatus')
  
  if (syncEnabled) {
    syncStatus.classList.remove('hidden')
    checkConnection()
  } else {
    syncStatus.classList.add('hidden')
  }
}

// Check connection status
async function checkConnection() {
  const apiKey = document.getElementById('apiKey').value.trim()
  const syncStatusIcon = document.getElementById('syncStatusIcon')
  const syncStatusText = document.getElementById('syncStatusText')
  const syncStatusDetails = document.getElementById('syncStatusDetails')

  if (!apiKey) {
    syncStatusIcon.textContent = '⚠️'
    syncStatusText.textContent = 'No API key entered'
    syncStatusDetails.textContent = 'Enter your API key to connect'
    return
  }

  if (!apiKey.startsWith('zbk_')) {
    syncStatusIcon.textContent = '❌'
    syncStatusText.textContent = 'Invalid API key'
    syncStatusDetails.textContent = 'API key should start with zbk_'
    return
  }

  // Get last sync info
  const { lastSync } = await chrome.storage.sync.get(['lastSync'])
  
  if (lastSync) {
    displaySyncStatus(lastSync, true)
  } else {
    syncStatusIcon.textContent = '⏳'
    syncStatusText.textContent = 'Ready to sync'
    syncStatusDetails.textContent = 'Save settings to start syncing'
  }
}

// Display sync status
function displaySyncStatus(lastSyncISO, isConnected) {
  const syncStatusIcon = document.getElementById('syncStatusIcon')
  const syncStatusText = document.getElementById('syncStatusText')
  const syncStatusDetails = document.getElementById('syncStatusDetails')

  if (!isConnected) {
    syncStatusIcon.textContent = '⏸️'
    syncStatusText.textContent = 'Sync disabled'
    syncStatusDetails.textContent = ''
    return
  }

  const lastSyncDate = new Date(lastSyncISO)
  const now = new Date()
  const diffMinutes = Math.floor((now - lastSyncDate) / (1000 * 60))

  if (diffMinutes < 1) {
    syncStatusIcon.textContent = '✅'
    syncStatusText.textContent = 'Synced just now'
    syncStatusDetails.textContent = 'Your blocklists are up to date'
  } else if (diffMinutes < 10) {
    syncStatusIcon.textContent = '✅'
    syncStatusText.textContent = `Synced ${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`
    syncStatusDetails.textContent = 'Your blocklists are up to date'
  } else if (diffMinutes < 60) {
    syncStatusIcon.textContent = '⚠️'
    syncStatusText.textContent = `Last sync: ${diffMinutes} minutes ago`
    syncStatusDetails.textContent = 'Next sync scheduled within 5 minutes'
  } else {
    const hours = Math.floor(diffMinutes / 60)
    syncStatusIcon.textContent = '⚠️'
    syncStatusText.textContent = `Last sync: ${hours} hour${hours !== 1 ? 's' : ''} ago`
    syncStatusDetails.textContent = 'Check your internet connection'
  }
}

// Toggle idle threshold visibility
function toggleIdleThreshold() {
  const idleCheckEnabled = document.getElementById('idleCheckToggle').checked
  const idleThresholdGroup = document.getElementById('idleThresholdGroup')
  
  if (idleCheckEnabled) {
    idleThresholdGroup.style.display = 'block'
  } else {
    idleThresholdGroup.style.display = 'none'
  }
}

// Save settings
async function saveSettings() {
  const apiKey = document.getElementById('apiKey').value.trim()
  const syncEnabled = document.getElementById('syncEnabledToggle').checked

  // Validate API key if sync is enabled
  if (syncEnabled && !apiKey) {
    showToast('Please enter an API key to enable sync', 'error')
    return
  }

  if (syncEnabled && !apiKey.startsWith('zbk_')) {
    showToast('Invalid API key format. Should start with zbk_', 'error')
    return
  }

  const settings = {
    apiKey: apiKey,
    syncEnabled: syncEnabled,
    darkMode: document.getElementById('darkModeToggle').checked,
    idleCheckEnabled: document.getElementById('idleCheckToggle').checked,
    idleTimeThreshold: parseInt(document.getElementById('idleThreshold').value) || 10
  }
  
  try {
    await chrome.storage.sync.set(settings)
    
    // Apply dark mode immediately
    if (settings.darkMode) {
      document.documentElement.setAttribute('data-theme', 'dark')
    } else {
      document.documentElement.removeAttribute('data-theme')
    }
    
    // Trigger sync if enabled
    if (settings.syncEnabled) {
      chrome.runtime.sendMessage({ action: 'syncNow' })
    }
    
    showToast('Settings saved successfully!', 'success')
    
    // Update sync status display
    updateSyncStatus()
  } catch (error) {
    console.error('Error saving settings:', error)
    showToast('Failed to save settings', 'error')
  }
}

// Reset settings
async function resetSettings() {
  if (!confirm('Are you sure you want to reset all settings to defaults? This will NOT disconnect your browser.')) {
    return
  }
  
  const defaultSettings = {
    darkMode: false,
    idleTimeThreshold: 10,
    idleCheckEnabled: false
  }
  
  await chrome.storage.sync.set(defaultSettings)
  await loadSettings()
  
  showToast('Settings reset to defaults', 'success')
}

// Handle disconnect
async function handleDisconnect() {
  if (!confirm('Are you sure you want to disconnect this browser? You will need to enter your API key again to reconnect.')) {
    return
  }

  try {
    // Clear connection settings
    await chrome.storage.sync.set({
      apiKey: '',
      syncEnabled: false,
      lastSync: null
    })

    // Clear local cache
    await chrome.storage.local.remove(['userEmail'])

    showToast('Browser disconnected successfully', 'success')
    
    // Reload settings
    setTimeout(() => {
      window.location.reload()
    }, 1500)
  } catch (error) {
    console.error('Error disconnecting:', error)
    showToast('Failed to disconnect', 'error')
  }
}

// Utility functions
function showToast(message, type = 'success') {
  const toast = document.getElementById('toast')
  toast.textContent = message
  toast.className = `toast ${type} show`
  
  setTimeout(() => {
    toast.classList.remove('show')
  }, 3000)
}
