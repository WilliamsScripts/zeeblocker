// Blocked page script

document.addEventListener('DOMContentLoaded', async () => {
  const params = new URLSearchParams(window.location.search);
  const reason = params.get('reason');
  const site = params.get('site');

  document.getElementById('siteName').textContent = site || 'Unknown Site';

  const messages = {
    'focus': {
      icon: 'target',
      badge: 'Focus Mode Active',
      badgeClass: 'reason-focus',
      message: 'This site is blocked to help you stay focused. Take a deep breath and get back to your important task!',
      showTimer: true
    },
    'child-safety': {
      icon: 'shield',
      badge: 'Restricted Content',
      badgeClass: 'reason-child-safety',
      message: 'This site contains content that is not appropriate. Your parent/guardian has been notified.',
      showParentWarning: true
    }
  };

  const config = messages[reason] || messages['focus'];

  document.getElementById('icon').innerHTML = renderIcon(config.icon, 'icon');
  document.getElementById('reasonBadge').innerHTML = `${renderIcon(config.icon, 'icon')}<span>${config.badge}</span>`;
  document.getElementById('reasonBadge').className = `reason-badge ${config.badgeClass}`;
  document.getElementById('message').textContent = config.message;
  document.getElementById('goBackBtn').innerHTML = `${renderIcon('arrow-left', 'icon')}<span>Go Back</span>`;

  if (config.showTimer) {
    document.getElementById('timer').classList.add('visible');
    updateTimer();
  }

  if (config.showParentWarning) {
    const warning = document.getElementById('parentWarning');
    warning.style.display = 'flex';
    warning.innerHTML = `
      ${renderIcon('alert', 'icon')}
      <div>
        <div class="warning-title">Parent Notification Sent</div>
        <div class="warning-text">Your parent/guardian has been notified of this access attempt.</div>
      </div>
    `;
  }

  document.getElementById('goBackBtn').addEventListener('click', () => {
    window.history.back();
  });

  document.getElementById('settingsBtn').addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });
});

// Update timer
async function updateTimer() {
  const data = await chrome.storage.local.get(['focusMinutes']);
  const minutes = data.focusMinutes || 0;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  document.getElementById('timerValue').textContent =
    `${hours}:${mins.toString().padStart(2, '0')}`;

  setTimeout(updateTimer, 60000);
}
