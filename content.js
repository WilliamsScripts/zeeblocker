// Content script for ZeeBlocker
// This runs on all pages to check if they should be blocked

(async function() {
  try {
    const url = window.location.href;
    const hostname = window.location.hostname.replace('www.', '');
    
    // Don't block chrome:// or extension pages
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return;
    }
    
    // Don't block if already on blocked page
    if (url.includes('blocked.html')) {
      return;
    }
    
    // Get settings
    const settings = await chrome.storage.sync.get([
      'focusModeEnabled',
      'distractingSites',
      'childSafetyMode',
      'adultSites',
      'organizationMode'
    ]);
    
    let shouldBlock = false;
    let blockReason = '';
    
    // Check focus mode
    if (settings.focusModeEnabled) {
      const distractingSites = settings.distractingSites || [];
      if (isInList(hostname, distractingSites)) {
        shouldBlock = true;
        blockReason = 'focus';
      }
    }
    
    // Check child safety mode
    if (settings.childSafetyMode) {
      const adultSites = settings.adultSites || [];
      if (isInList(hostname, adultSites)) {
        shouldBlock = true;
        blockReason = 'child-safety';
      }
    }
    
    // Check organization mode
    if (settings.organizationMode && blockReason !== 'child-safety') {
      const distractingSites = settings.distractingSites || [];
      if (isInList(hostname, distractingSites)) {
        shouldBlock = true;
        blockReason = 'organization';
      }
    }
    
    if (shouldBlock) {
      // Block the page
      window.location.replace(
        chrome.runtime.getURL(`blocked.html?reason=${blockReason}&site=${encodeURIComponent(hostname)}`)
      );
    }
    
    function isInList(hostname, list) {
      return list.some(site => {
        const cleanSite = site.replace('www.', '');
        return hostname === cleanSite || hostname.endsWith('.' + cleanSite);
      });
    }
  } catch (error) {
    console.error('ZeeBlocker content script error:', error);
  }
})();

