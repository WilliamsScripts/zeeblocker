// Popup script for ZeeBlocker — home actions, task/duration picker, live session view

const DURATION_PRESETS = [15, 25, 45, 60];
const BREAK_PRESETS = [5, 10, 15];
const ROUND_PRESETS = [2, 3, 4, null]; // null = repeat until stopped

const RING_RADIUS = 52;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

// Focus score weights: task completion counts for 60 points, accumulated
// focus time counts for 40 (capped once FOCUS_MINUTES_FOR_MAX_SCORE is reached)
const FOCUS_MINUTES_FOR_MAX_SCORE = 600; // 10 hours

const state = {
  selectedTaskId: 'none',
  durationMinutes: 25,
  noLimit: false,
  mode: 'single',
  breakMinutes: BREAK_PRESETS[0],
  totalRounds: ROUND_PRESETS[2],
  tasks: []
};

let sessionTickHandle = null;

document.addEventListener('DOMContentLoaded', async () => {
  renderStaticIcons();
  await loadTheme();
  await loadTasks();
  await loadStats();
  setupEventListeners();
  renderDurationChips();
  renderBreakChips();
  renderRoundChips();
  await loadMusicToggleState();
  await refreshView();
});

chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'local' && changes.activeSession) {
    refreshView();
  }
  if (namespace === 'sync' && changes.tasks) {
    loadTasks();
    loadStats();
  }
  if (namespace === 'local' && (changes.sitesBlocked || changes.focusMinutes)) {
    loadStats();
  }
  if (namespace === 'sync' && changes.focusMusicEnabled) {
    renderMusicToggleIcon(changes.focusMusicEnabled.newValue !== false);
  }
});

// ---- Focus music quick toggle ----
async function loadMusicToggleState() {
  const { focusMusicEnabled } = await chrome.storage.sync.get(['focusMusicEnabled']);
  renderMusicToggleIcon(focusMusicEnabled !== false);
}

function renderMusicToggleIcon(enabled) {
  const btn = document.getElementById('musicToggleBtn');
  btn.innerHTML = renderIcon(enabled ? 'music' : 'music-off', 'icon-sm');
  btn.title = enabled ? 'Focus music on — tap to mute' : 'Focus music off — tap to unmute';
  btn.classList.toggle('active', enabled);
}

async function toggleFocusMusic() {
  const { focusMusicEnabled } = await chrome.storage.sync.get(['focusMusicEnabled']);
  const nextEnabled = focusMusicEnabled === false;
  await chrome.runtime.sendMessage({ action: 'setFocusMusicEnabled', enabled: nextEnabled });
  renderMusicToggleIcon(nextEnabled);
}

// ---- Pause / resume ----
async function togglePauseResume() {
  const { activeSession } = await chrome.storage.local.get(['activeSession']);
  if (!activeSession) return;

  const action = activeSession.paused ? 'resumeSession' : 'pauseSession';
  await chrome.runtime.sendMessage({ action });
  await refreshView();
}

function renderStaticIcons() {
  document.getElementById('brandLogo').innerHTML = `${renderIcon('target', 'icon icon-lg')}<span>ZeeBlocker</span>`;
  document.getElementById('themeToggle').innerHTML = renderIcon('moon', 'icon');
  document.getElementById('settingsBtn').innerHTML = renderIcon('settings', 'icon');

  document.querySelector('#focusNowBtn .action-tile-icon').innerHTML = renderIcon('play', 'icon-lg');
  document.querySelector('#createTaskHomeBtn .action-tile-icon').innerHTML = renderIcon('plus', 'icon-lg');
  document.getElementById('manageBlocklistBtn').innerHTML = `${renderIcon('block', 'icon-sm')}<span>Manage Blocklist</span>`;
  document.getElementById('backToHomeBtn').innerHTML = `${renderIcon('arrow-left', 'icon-sm')}<span>Back</span>`;

  document.getElementById('addTaskBtn').innerHTML = `${renderIcon('plus', 'icon-sm')}<span>New Task</span>`;
  document.getElementById('startBtn').innerHTML = `${renderIcon('play', 'icon')}<span>Start Focus Session</span>`;
  document.getElementById('stopBtn').innerHTML = `${renderIcon('stop', 'icon')}<span>Stop Session</span>`;
  document.getElementById('pauseResumeBtn').innerHTML = `${renderIcon('pause', 'icon')}<span>Pause</span>`;
  document.querySelector('#modeSegmented [data-mode="single"]').innerHTML = `${renderIcon('target', 'icon-sm')}<span>Single session</span>`;
  document.querySelector('#modeSegmented [data-mode="cycle"]').innerHTML = `${renderIcon('repeat', 'icon-sm')}<span>Work / Break</span>`;
}

function setupEventListeners() {
  document.getElementById('themeToggle').addEventListener('click', toggleTheme);
  document.getElementById('settingsBtn').addEventListener('click', () => chrome.runtime.openOptionsPage());

  document.getElementById('focusNowBtn').addEventListener('click', () => showView('configure'));
  document.getElementById('backToHomeBtn').addEventListener('click', () => showView('home'));

  document.getElementById('createTaskHomeBtn').addEventListener('click', openCreateTask);
  document.getElementById('addTaskBtn').addEventListener('click', openCreateTask);

  document.getElementById('manageBlocklistBtn').addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
    setTimeout(() => {
      chrome.runtime.sendMessage({ action: 'navigateToTab', tab: 'blocklist' });
    }, 100);
  });

  document.getElementById('durationSlider').addEventListener('input', (e) => {
    state.durationMinutes = parseInt(e.target.value, 10);
    state.noLimit = false;
    renderDurationChips();
    updateDurationLabel();
  });

  document.querySelectorAll('#modeSegmented button').forEach(btn => {
    btn.addEventListener('click', () => {
      state.mode = btn.dataset.mode;
      document.querySelectorAll('#modeSegmented button').forEach(b => b.classList.toggle('active', b === btn));
      document.getElementById('cycleOptions').classList.toggle('hidden', state.mode !== 'cycle');
    });
  });

  document.getElementById('startBtn').addEventListener('click', startSession);
  document.getElementById('stopBtn').addEventListener('click', stopSession);
  document.getElementById('pauseResumeBtn').addEventListener('click', togglePauseResume);
  document.getElementById('musicToggleBtn').addEventListener('click', toggleFocusMusic);
}

function openCreateTask() {
  chrome.tabs.create({ url: chrome.runtime.getURL('create-task.html') });
}

// ---- Theme ----
async function loadTheme() {
  const data = await chrome.storage.sync.get(['darkMode']);
  applyTheme(data.darkMode || false);
}

function applyTheme(isDark) {
  document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  document.getElementById('themeToggle').innerHTML = renderIcon(isDark ? 'sun' : 'moon', 'icon');
}

async function toggleTheme() {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  applyTheme(!isDark);
  await chrome.storage.sync.set({ darkMode: !isDark });
}

// ---- Duration / break / round chip pickers ----
function renderDurationChips() {
  const container = document.getElementById('durationChips');
  const chips = DURATION_PRESETS.map(min => chipHtml(min, `${min} min`, !state.noLimit && state.durationMinutes === min))
    .concat(chipHtml('nolimit', 'No limit', state.noLimit));
  container.innerHTML = chips.join('');

  container.querySelectorAll('.chip').forEach(chip => {
    chip.addEventListener('click', () => {
      if (chip.dataset.value === 'nolimit') {
        state.noLimit = true;
      } else {
        state.noLimit = false;
        state.durationMinutes = parseInt(chip.dataset.value, 10);
        document.getElementById('durationSlider').value = state.durationMinutes;
      }
      renderDurationChips();
      updateDurationLabel();
    });
  });

  document.getElementById('durationSlider').classList.toggle('disabled', state.noLimit);
  updateDurationLabel();
}

function updateDurationLabel() {
  document.getElementById('durationLabel').textContent = state.noLimit ? 'No limit, stop anytime' : `${state.durationMinutes} min`;
}

function renderBreakChips() {
  const container = document.getElementById('breakChips');
  container.innerHTML = BREAK_PRESETS.map(min => chipHtml(min, `${min} min`, state.breakMinutes === min)).join('');
  container.querySelectorAll('.chip').forEach(chip => {
    chip.addEventListener('click', () => {
      state.breakMinutes = parseInt(chip.dataset.value, 10);
      renderBreakChips();
    });
  });
}

function renderRoundChips() {
  const container = document.getElementById('roundsChips');
  container.innerHTML = ROUND_PRESETS.map(n => chipHtml(n === null ? 'inf' : n, n === null ? '∞' : `${n}`, state.totalRounds === n)).join('');
  container.querySelectorAll('.chip').forEach((chip, i) => {
    chip.addEventListener('click', () => {
      state.totalRounds = ROUND_PRESETS[i];
      renderRoundChips();
    });
  });
}

function chipHtml(value, label, active) {
  return `<button type="button" class="chip${active ? ' active' : ''}" data-value="${value}">${label}</button>`;
}

// ---- Tasks ----
async function loadTasks() {
  const data = await chrome.storage.sync.get(['tasks']);
  state.tasks = data.tasks || [];
  renderTaskPicker();
  renderTaskList();
}

function renderTaskPicker() {
  const container = document.getElementById('taskPicker');
  const noneChecked = state.selectedTaskId === 'none' ? 'checked' : '';

  const items = [`
    <label class="option-card${state.selectedTaskId === 'none' ? ' selected' : ''}" data-task-id="none">
      <input type="radio" name="taskPick" value="none" ${noneChecked}>
      <div>
        <div class="option-title">No task, just focus</div>
        <div class="option-sub">Turn on focus mode without a specific task</div>
      </div>
    </label>
  `].concat(state.tasks.filter(t => !t.completed).map(task => {
    const checked = state.selectedTaskId === task.id ? 'checked' : '';
    return `
      <label class="option-card${state.selectedTaskId === task.id ? ' selected' : ''}" data-task-id="${task.id}">
        <input type="radio" name="taskPick" value="${task.id}" ${checked}>
        <div>
          <div class="option-title">${escapeHtml(task.title)}</div>
          <div class="option-sub">${task.duration ? `${task.duration} min default` : 'No default duration'}</div>
        </div>
      </label>
    `;
  }));

  container.innerHTML = items.join('');

  container.querySelectorAll('.option-card').forEach(card => {
    card.addEventListener('click', () => {
      const taskId = card.dataset.taskId;
      state.selectedTaskId = taskId;
      container.querySelectorAll('.option-card').forEach(c => c.classList.toggle('selected', c === card));
      container.querySelectorAll('input[type="radio"]').forEach(r => { r.checked = r.value === taskId; });

      if (taskId !== 'none') {
        const task = state.tasks.find(t => t.id === taskId);
        if (task && task.duration) {
          state.durationMinutes = task.duration;
          state.noLimit = false;
          document.getElementById('durationSlider').value = Math.min(120, Math.max(5, task.duration));
          renderDurationChips();
        }
      }
    });
  });
}

function renderTaskList() {
  const taskList = document.getElementById('taskList');

  if (state.tasks.length === 0) {
    taskList.innerHTML = `
      <div class="empty-state">
        ${renderIcon('list', 'icon-lg')}
        <div class="empty-state-text">No tasks yet. Create one to get started.</div>
      </div>
    `;
    return;
  }

  const sorted = [...state.tasks].sort((a, b) => (a.completed === b.completed ? 0 : a.completed ? 1 : -1));

  taskList.innerHTML = sorted.map(task => `
    <div class="task-item ${task.completed ? 'completed' : ''}" data-task-id="${task.id}">
      <div class="task-header">
        <div class="task-title">${escapeHtml(task.title)}</div>
        <div class="task-actions">
          <button class="icon-btn complete-btn" title="${task.completed ? 'Mark incomplete' : 'Mark complete'}">${renderIcon('check', 'icon-sm')}</button>
          <button class="icon-btn delete-btn" title="Delete task">${renderIcon('trash', 'icon-sm')}</button>
        </div>
      </div>
      <div class="task-time">${renderIcon('clock', 'icon-sm')} ${task.duration ? `${task.duration} min` : 'No duration set'}</div>
      ${task.description ? `<div class="task-description">${escapeHtml(task.description)}</div>` : ''}
    </div>
  `).join('');

  taskList.querySelectorAll('.complete-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleTaskComplete(e.target.closest('.task-item').dataset.taskId);
    });
  });

  taskList.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      deleteTask(e.target.closest('.task-item').dataset.taskId);
    });
  });
}

async function toggleTaskComplete(taskId) {
  const data = await chrome.storage.sync.get(['tasks']);
  const tasks = data.tasks || [];
  const task = tasks.find(t => t.id === taskId);
  if (task) {
    task.completed = !task.completed;
    await chrome.storage.sync.set({ tasks });
    await loadTasks();
    await loadStats();
  }
}

async function deleteTask(taskId) {
  if (!confirm('Delete this task?')) return;
  const data = await chrome.storage.sync.get(['tasks']);
  const tasks = (data.tasks || []).filter(t => t.id !== taskId);
  await chrome.storage.sync.set({ tasks });
  if (state.selectedTaskId === taskId) state.selectedTaskId = 'none';
  await loadTasks();
}

// ---- Stats + focus score ----
async function loadStats() {
  const data = await chrome.storage.local.get(['sitesBlocked', 'focusMinutes']);
  document.getElementById('blockedCount').textContent = data.sitesBlocked || 0;

  const focusMinutes = data.focusMinutes || 0;
  const hours = Math.floor(focusMinutes / 60);
  const minutes = focusMinutes % 60;
  document.getElementById('focusTime').textContent = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

  const tasksData = await chrome.storage.sync.get(['tasks']);
  const tasks = tasksData.tasks || [];
  const completedCount = tasks.filter(t => t.completed).length;
  document.getElementById('tasksCompleted').textContent = completedCount;

  renderFocusScore(computeFocusScore(tasks, focusMinutes));
}

function computeFocusScore(tasks, focusMinutes) {
  const completionRatio = tasks.length > 0 ? tasks.filter(t => t.completed).length / tasks.length : 0;
  const focusRatio = Math.min(focusMinutes / FOCUS_MINUTES_FOR_MAX_SCORE, 1);
  return Math.round(completionRatio * 60 + focusRatio * 40);
}

function renderFocusScore(score) {
  document.getElementById('scoreValue').textContent = score;

  const ring = document.getElementById('scoreRing');
  ring.style.strokeDasharray = `${RING_CIRCUMFERENCE}`;
  ring.style.strokeDashoffset = `${RING_CIRCUMFERENCE * (1 - score / 100)}`;
}

// ---- Session start/stop ----
async function startSession() {
  const taskId = state.selectedTaskId !== 'none' ? state.selectedTaskId : null;
  const task = taskId ? state.tasks.find(t => t.id === taskId) : null;

  const payload = {
    taskId,
    taskTitle: task ? task.title : '',
    mode: state.mode,
    durationMinutes: state.noLimit ? null : state.durationMinutes,
    breakMinutes: state.breakMinutes,
    totalRounds: state.mode === 'cycle' ? state.totalRounds : null
  };

  await chrome.runtime.sendMessage({ action: 'startSession', payload });
  await refreshView();
}

async function stopSession() {
  await chrome.runtime.sendMessage({ action: 'stopSession' });
  await refreshView();
}

// ---- View switching ----
function showView(name) {
  document.getElementById('homeView').classList.toggle('hidden', name !== 'home');
  document.getElementById('configureView').classList.toggle('hidden', name !== 'configure');
  document.getElementById('sessionView').classList.toggle('hidden', name !== 'session');
}

async function refreshView() {
  const { activeSession } = await chrome.storage.local.get(['activeSession']);

  if (sessionTickHandle) {
    clearInterval(sessionTickHandle);
    sessionTickHandle = null;
  }

  if (activeSession) {
    showView('session');
    updateSessionView(activeSession);
    sessionTickHandle = setInterval(() => updateSessionView(activeSession), 1000);
  } else {
    const current = ['homeView', 'configureView'].find(id => !document.getElementById(id).classList.contains('hidden'));
    showView(current === 'configureView' ? 'configure' : 'home');
  }
}

function updateSessionView(session) {
  const isBreak = session.phase === 'break';
  const phaseEl = document.getElementById('sessionPhase');
  if (session.paused) {
    phaseEl.textContent = 'Paused';
    phaseEl.className = 'badge badge-paused';
  } else {
    phaseEl.textContent = isBreak ? 'Break' : 'Focus';
    phaseEl.className = `badge ${isBreak ? 'badge-break' : 'badge-focus'}`;
  }

  document.getElementById('sessionTaskTitle').textContent = session.taskTitle || (isBreak ? 'Recharge and stretch' : 'Focus session');

  const roundEl = document.getElementById('sessionRound');
  if (session.mode === 'cycle') {
    roundEl.classList.remove('hidden');
    roundEl.textContent = session.totalRounds ? `Round ${session.round} of ${session.totalRounds}` : `Round ${session.round}`;
  } else {
    roundEl.classList.add('hidden');
  }

  const pauseResumeBtn = document.getElementById('pauseResumeBtn');
  pauseResumeBtn.innerHTML = session.paused
    ? `${renderIcon('play', 'icon')}<span>Resume</span>`
    : `${renderIcon('pause', 'icon')}<span>Pause</span>`;

  const ring = document.getElementById('ringFg');
  ring.style.strokeDasharray = `${RING_CIRCUMFERENCE}`;

  if (session.endsAt === null) {
    document.getElementById('sessionTime').textContent = '∞';
    ring.style.strokeDashoffset = '0';
    return;
  }

  // While paused, freeze the countdown at the moment it was paused instead of
  // letting it keep ticking down against the wall clock.
  const now = session.paused ? session.pausedAt : Date.now();
  const totalMs = session.endsAt - session.phaseStartedAt;
  const remainingMs = Math.max(0, session.endsAt - now);
  const fractionElapsed = totalMs > 0 ? 1 - remainingMs / totalMs : 1;

  document.getElementById('sessionTime').textContent = formatDuration(remainingMs);
  ring.style.strokeDashoffset = `${RING_CIRCUMFERENCE * Math.min(1, Math.max(0, fractionElapsed))}`;
}

// ---- Utilities ----
function formatDuration(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
