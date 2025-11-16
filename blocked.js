// Blocked page script

document.addEventListener('DOMContentLoaded', async () => {
  // Get URL parameters
  const params = new URLSearchParams(window.location.search);
  const reason = params.get('reason');
  const site = params.get('site');
  
  // Update site name
  document.getElementById('siteName').textContent = site || 'Unknown Site';
  
  // Update based on reason
  const messages = {
    'focus': {
      icon: '🎯',
      badge: 'Focus Mode Active',
      badgeClass: 'reason-focus',
      message: 'This site is blocked to help you stay focused. Take a deep breath and get back to your important tasks!',
      showTimer: true
    },
    'child-safety': {
      icon: '🛡️',
      badge: 'Restricted Content',
      badgeClass: 'reason-child-safety',
      message: 'This site contains content that is not appropriate. Your parent/guardian has been notified.',
      showParentWarning: true
    },
    'organization': {
      icon: '🏢',
      badge: 'Organization Policy',
      badgeClass: 'reason-organization',
      message: 'This site is blocked per your organization\'s productivity policy.',
      showOrgWarning: true
    }
  };
  
  const config = messages[reason] || messages['focus'];
  
  document.getElementById('icon').textContent = config.icon;
  document.getElementById('reasonBadge').textContent = config.badge;
  document.getElementById('reasonBadge').className = `reason-badge ${config.badgeClass}`;
  document.getElementById('message').textContent = config.message;
  
  if (config.showTimer) {
    document.getElementById('timer').classList.add('visible');
    updateTimer();
  }
  
  if (config.showParentWarning) {
    document.getElementById('parentWarning').style.display = 'block';
  }
  
  if (config.showOrgWarning) {
    document.getElementById('orgWarning').style.display = 'block';
  }
  
  // Event listeners
  document.getElementById('goBackBtn').addEventListener('click', () => {
    window.history.back();
  });
  
  document.getElementById('settingsBtn').addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });
});

// Update timer
async function updateTimer() {
  const data = await chrome.storage.local.get(['focusTimeToday']);
  const minutes = data.focusTimeToday || 0;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  document.getElementById('timerValue').textContent = 
    `${hours}:${mins.toString().padStart(2, '0')}`;
  
  // Update every minute
  setTimeout(updateTimer, 60000);
}

