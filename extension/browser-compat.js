/**
 * Cross-Browser Compatibility Layer
 * 
 * This file provides compatibility wrappers for different browsers.
 * Include this at the top of your background.js and other scripts.
 */

// Firefox uses 'browser' namespace, Chrome uses 'chrome'
// This makes Firefox extensions work with Chrome API calls
if (typeof browser !== 'undefined' && typeof chrome === 'undefined') {
  window.chrome = browser
}

/**
 * Browser Detection Utilities
 */
const BrowserDetect = {
  isFirefox: () => typeof browser !== 'undefined' && browser.runtime,
  isChrome: () => typeof chrome !== 'undefined' && chrome.runtime && !navigator.userAgent.includes('Edg'),
  isEdge: () => navigator.userAgent.includes('Edg'),
  isBrave: async () => {
    if (navigator.brave && navigator.brave.isBrave) {
      return await navigator.brave.isBrave()
    }
    return false
  },
  isArc: () => navigator.userAgent.includes('Arc'),
  isOpera: () => navigator.userAgent.includes('OPR'),
  
  getBrowserName: async () => {
    if (BrowserDetect.isFirefox()) return 'firefox'
    if (await BrowserDetect.isBrave()) return 'brave'
    if (BrowserDetect.isArc()) return 'arc'
    if (BrowserDetect.isEdge()) return 'edge'
    if (BrowserDetect.isOpera()) return 'opera'
    if (BrowserDetect.isChrome()) return 'chrome'
    return 'unknown'
  }
}

/**
 * Storage API Compatibility
 * 
 * Chrome and Firefox have slightly different promise/callback handling
 */
const BrowserStorage = {
  // Get items from storage
  async get(keys) {
    return new Promise((resolve, reject) => {
      chrome.storage.sync.get(keys, (result) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError)
        } else {
          resolve(result)
        }
      })
    })
  },

  // Set items in storage
  async set(items) {
    return new Promise((resolve, reject) => {
      chrome.storage.sync.set(items, () => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError)
        } else {
          resolve()
        }
      })
    })
  },

  // Remove items from storage
  async remove(keys) {
    return new Promise((resolve, reject) => {
      chrome.storage.sync.remove(keys, () => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError)
        } else {
          resolve()
        }
      })
    })
  },

  // Local storage variants
  local: {
    async get(keys) {
      return new Promise((resolve, reject) => {
        chrome.storage.local.get(keys, (result) => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError)
          } else {
            resolve(result)
          }
        })
      })
    },

    async set(items) {
      return new Promise((resolve, reject) => {
        chrome.storage.local.set(items, () => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError)
          } else {
            resolve()
          }
        })
      })
    },
  }
}

/**
 * Notifications API Compatibility
 */
const BrowserNotifications = {
  async create(notificationId, options) {
    return new Promise((resolve, reject) => {
      chrome.notifications.create(notificationId, options, (id) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError)
        } else {
          resolve(id)
        }
      })
    })
  }
}

/**
 * Tabs API Compatibility
 */
const BrowserTabs = {
  async query(queryInfo) {
    return new Promise((resolve, reject) => {
      chrome.tabs.query(queryInfo, (tabs) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError)
        } else {
          resolve(tabs)
        }
      })
    })
  },

  async update(tabId, updateProperties) {
    return new Promise((resolve, reject) => {
      chrome.tabs.update(tabId, updateProperties, (tab) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError)
        } else {
          resolve(tab)
        }
      })
    })
  }
}

/**
 * Runtime API Compatibility
 */
const BrowserRuntime = {
  async sendMessage(message) {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(message, (response) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError)
        } else {
          resolve(response)
        }
      })
    })
  },

  getURL(path) {
    return chrome.runtime.getURL(path)
  },

  get id() {
    return chrome.runtime.id
  }
}

/**
 * Manifest Version Detection
 */
const ManifestVersion = {
  get() {
    return chrome.runtime.getManifest().manifest_version
  },

  isV3() {
    return this.get() === 3
  },

  isV2() {
    return this.get() === 2
  }
}

/**
 * Service Worker / Background Page Detection
 */
const BackgroundContext = {
  isServiceWorker() {
    return typeof ServiceWorkerGlobalScope !== 'undefined' && 
           self instanceof ServiceWorkerGlobalScope
  },

  isBackgroundPage() {
    return !this.isServiceWorker()
  }
}

/**
 * Export for use in other files
 */
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    BrowserDetect,
    BrowserStorage,
    BrowserNotifications,
    BrowserTabs,
    BrowserRuntime,
    ManifestVersion,
    BackgroundContext,
  }
}

console.log('Browser compatibility layer loaded')

