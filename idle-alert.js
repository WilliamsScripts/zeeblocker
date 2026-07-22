// Idle alert popup window — shown alongside the native Chrome notification when the
// user has been idle past their configured threshold. Stays open (and, depending on
// the "Idle Alert Bell" setting, keeps the break bell ringing) until dismissed, or
// until background.js closes it automatically once the user becomes active again.

document.addEventListener('DOMContentLoaded', async () => {
  document.getElementById('idleIcon').innerHTML = renderIcon('clock', 'icon-lg');
  document.getElementById('dismissBtn').innerHTML = `${renderIcon('check', 'icon-sm')}<span>I'm back</span>`;

  const { darkMode } = await chrome.storage.sync.get(['darkMode']);
  if (darkMode) {
    document.documentElement.setAttribute('data-theme', 'dark');
  }

  const params = new URLSearchParams(location.search);
  const minutes = parseInt(params.get('minutes'), 10) || 0;
  document.getElementById('idleMessage').textContent =
    `You've been idle for ${minutes} minute${minutes === 1 ? '' : 's'}. Time to stretch, hydrate, or get back to it.`;

  document.getElementById('dismissBtn').addEventListener('click', () => {
    window.close();
  });
});
