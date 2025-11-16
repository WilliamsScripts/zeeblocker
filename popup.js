// Initialize popup
document.addEventListener('DOMContentLoaded', async () => {
  await loadSettings();
  await loadTasks();
  await loadStats();
  setupEventListeners();
});

// Event Listeners
function setupEventListeners() {
  // Theme toggle
  document.getElementById('themeToggle').addEventListener('click', toggleTheme);
  
  // Focus mode toggle
  document.getElementById('focusModeToggle').addEventListener('change', toggleFocusMode);
  
  // Settings button
  document.getElementById('settingsBtn').addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });
  
  // Task management
  document.getElementById('addTaskBtn').addEventListener('click', showAddTaskForm);
  document.getElementById('saveTaskBtn').addEventListener('click', saveTask);
  document.getElementById('cancelTaskBtn').addEventListener('click', hideAddTaskForm);
  
  // Quick actions
  document.getElementById('manageBlocklistBtn').addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
    setTimeout(() => {
      chrome.runtime.sendMessage({ action: 'navigateToTab', tab: 'blocklist' });
    }, 100);
  });
  
  document.getElementById('integrationsBtn').addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
    setTimeout(() => {
      chrome.runtime.sendMessage({ action: 'navigateToTab', tab: 'integrations' });
    }, 100);
  });
}

// Load settings
async function loadSettings() {
  const data = await chrome.storage.sync.get(['focusModeEnabled', 'darkMode']);
  
  // Focus mode
  const focusModeEnabled = data.focusModeEnabled || false;
  document.getElementById('focusModeToggle').checked = focusModeEnabled;
  updateFocusStatus(focusModeEnabled);
  
  // Dark mode
  const darkMode = data.darkMode || false;
  if (darkMode) {
    document.documentElement.setAttribute('data-theme', 'dark');
    document.querySelector('.theme-icon').textContent = '☀️';
  }
}

// Toggle theme
async function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  
  document.documentElement.setAttribute('data-theme', newTheme);
  document.querySelector('.theme-icon').textContent = newTheme === 'dark' ? '☀️' : '🌙';
  
  await chrome.storage.sync.set({ darkMode: newTheme === 'dark' });
}

// Toggle focus mode
async function toggleFocusMode(e) {
  const enabled = e.target.checked;
  await chrome.storage.sync.set({ focusModeEnabled: enabled });
  updateFocusStatus(enabled);
  
  // Notify background script
  chrome.runtime.sendMessage({ 
    action: 'focusModeChanged', 
    enabled: enabled 
  });
  
  // Show notification
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'icons/icon128.png',
    title: 'ZeeBlocker',
    message: `Focus Mode ${enabled ? 'enabled' : 'disabled'}`,
    priority: 1
  });
}

function updateFocusStatus(enabled) {
  const statusText = document.getElementById('focusStatus');
  statusText.textContent = enabled ? 'On' : 'Off';
  statusText.style.color = enabled ? 'var(--success)' : 'var(--text-secondary)';
}

// Task management
function showAddTaskForm() {
  document.getElementById('addTaskForm').classList.remove('hidden');
  document.getElementById('taskTitle').focus();
}

function hideAddTaskForm() {
  document.getElementById('addTaskForm').classList.add('hidden');
  clearTaskForm();
}

function clearTaskForm() {
  document.getElementById('taskTitle').value = '';
  document.getElementById('taskStartTime').value = '';
  document.getElementById('taskEndTime').value = '';
  document.getElementById('taskDescription').value = '';
}

async function saveTask() {
  const title = document.getElementById('taskTitle').value.trim();
  const startTime = document.getElementById('taskStartTime').value;
  const endTime = document.getElementById('taskEndTime').value;
  const description = document.getElementById('taskDescription').value.trim();
  
  if (!title) {
    alert('Please enter a task title');
    return;
  }
  
  if (!startTime || !endTime) {
    alert('Please select start and end times');
    return;
  }
  
  const task = {
    id: Date.now().toString(),
    title,
    startTime,
    endTime,
    description,
    completed: false,
    createdAt: new Date().toISOString()
  };
  
  const data = await chrome.storage.sync.get(['tasks']);
  const tasks = data.tasks || [];
  tasks.push(task);
  
  await chrome.storage.sync.set({ tasks });
  
  hideAddTaskForm();
  await loadTasks();
}

async function loadTasks() {
  const data = await chrome.storage.sync.get(['tasks']);
  const tasks = data.tasks || [];
  
  const taskList = document.getElementById('taskList');
  
  if (tasks.length === 0) {
    taskList.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📝</div>
        <div class="empty-state-text">No tasks yet. Add your first task!</div>
      </div>
    `;
    return;
  }
  
  // Sort tasks by start time
  tasks.sort((a, b) => a.startTime.localeCompare(b.startTime));
  
  taskList.innerHTML = tasks.map(task => `
    <div class="task-item ${task.completed ? 'completed' : ''}" data-task-id="${task.id}">
      <div class="task-header">
        <div class="task-title">${escapeHtml(task.title)}</div>
        <div class="task-actions">
          <button class="task-btn complete-btn" title="${task.completed ? 'Mark incomplete' : 'Mark complete'}">
            ${task.completed ? '↩️' : '✓'}
          </button>
          <button class="task-btn delete-btn" title="Delete task">🗑️</button>
        </div>
      </div>
      <div class="task-time">
        ⏰ ${formatTime(task.startTime)} - ${formatTime(task.endTime)}
      </div>
      ${task.description ? `<div class="task-description">${escapeHtml(task.description)}</div>` : ''}
    </div>
  `).join('');
  
  // Add event listeners
  document.querySelectorAll('.complete-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const taskId = e.target.closest('.task-item').dataset.taskId;
      toggleTaskComplete(taskId);
    });
  });
  
  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const taskId = e.target.closest('.task-item').dataset.taskId;
      deleteTask(taskId);
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
  if (!confirm('Are you sure you want to delete this task?')) {
    return;
  }
  
  const data = await chrome.storage.sync.get(['tasks']);
  const tasks = data.tasks || [];
  
  const filteredTasks = tasks.filter(t => t.id !== taskId);
  await chrome.storage.sync.set({ tasks: filteredTasks });
  
  await loadTasks();
}

// Load stats
async function loadStats() {
  const data = await chrome.storage.local.get(['blockedToday', 'focusTimeToday', 'tasks']);
  
  // Blocked sites today
  const blockedToday = data.blockedToday || 0;
  document.getElementById('blockedToday').textContent = blockedToday;
  
  // Focus time
  const focusTime = data.focusTimeToday || 0;
  const hours = Math.floor(focusTime / 60);
  const minutes = focusTime % 60;
  document.getElementById('focusTime').textContent = hours > 0 ? `${hours}h` : `${minutes}m`;
  
  // Tasks completed
  const tasks = data.tasks || [];
  const completedCount = tasks.filter(t => t.completed).length;
  document.getElementById('tasksCompleted').textContent = completedCount;
}

// Utility functions
function formatTime(time) {
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Listen for updates
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (changes.tasks) {
    loadTasks();
  }
  if (changes.blockedToday || changes.focusTimeToday) {
    loadStats();
  }
});

