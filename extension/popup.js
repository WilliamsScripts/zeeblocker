// Popup script for ZeeBlocker Extension

// Cross-browser compatibility
if (typeof browser !== 'undefined' && typeof chrome === 'undefined') {
  globalThis.chrome = browser
}

// DOM Elements
let notConnectedView, connectedView, apiKeyInput, connectBtn
let focusModeToggle, blockedCount, focusTime, syncStatus, userEmail, settingsBtn
let addTaskBtn, addTaskForm, taskTitleInput, taskTimeInput, saveTaskBtn, cancelTaskBtn, taskList

document.addEventListener('DOMContentLoaded', async () => {
  // Initialize DOM references
  notConnectedView = document.getElementById('notConnectedView')
  connectedView = document.getElementById('connectedView')
  apiKeyInput = document.getElementById('apiKeyInput')
  connectBtn = document.getElementById('connectBtn')
  focusModeToggle = document.getElementById('focusModeToggle')
  blockedCount = document.getElementById('blockedCount')
  focusTime = document.getElementById('focusTime')
  syncStatus = document.getElementById('syncStatus')
  userEmail = document.getElementById('userEmail')
  settingsBtn = document.getElementById('settingsBtn')
  
  // Task elements
  addTaskBtn = document.getElementById('addTaskBtn')
  addTaskForm = document.getElementById('addTaskForm')
  taskTitleInput = document.getElementById('taskTitleInput')
  taskTimeInput = document.getElementById('taskTimeInput')
  saveTaskBtn = document.getElementById('saveTaskBtn')
  cancelTaskBtn = document.getElementById('cancelTaskBtn')
  taskList = document.getElementById('taskList')

  // Setup event listeners
  connectBtn?.addEventListener('click', handleConnect)
  focusModeToggle?.addEventListener('change', handleFocusModeToggle)
  settingsBtn?.addEventListener('click', () => {
    chrome.runtime.openOptionsPage()
  })
  
  // Task event listeners
  addTaskBtn?.addEventListener('click', showAddTaskForm)
  saveTaskBtn?.addEventListener('click', handleSaveTask)
  cancelTaskBtn?.addEventListener('click', hideAddTaskForm)

  // Load initial state
  await loadState()
})

async function loadState() {
  try {
    const settings = await chrome.storage.sync.get([
      'apiKey',
      'syncEnabled',
      'focusModeEnabled',
      'lastSync',
      'tasks'
    ])

    const localData = await chrome.storage.local.get([
      'blockedToday',
      'focusTimeToday',
      'userEmail'
    ])

    // Check if connected
    const isConnected = settings.apiKey && settings.syncEnabled

    if (!isConnected) {
      showNotConnectedView()
    } else {
      showConnectedView(settings, localData)
    }
  } catch (error) {
    console.error('Error loading state:', error)
    showNotConnectedView()
  }
}

function showNotConnectedView() {
  notConnectedView.classList.remove('hidden')
  connectedView.classList.add('hidden')
}

function showConnectedView(settings, localData) {
  notConnectedView.classList.add('hidden')
  connectedView.classList.remove('hidden')

  // Update UI with current state
  if (focusModeToggle) {
    focusModeToggle.checked = settings.focusModeEnabled || false
  }

  if (blockedCount) {
    blockedCount.textContent = localData.blockedToday || 0
  }

  if (focusTime) {
    const minutes = localData.focusTimeToday || 0
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    focusTime.textContent = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  if (syncStatus && settings.lastSync) {
    const lastSyncDate = new Date(settings.lastSync)
    const now = new Date()
    const diffMinutes = Math.floor((now - lastSyncDate) / (1000 * 60))
    
    if (diffMinutes < 1) {
      syncStatus.textContent = '✅ Synced just now'
      syncStatus.className = 'sync-text success'
    } else if (diffMinutes < 10) {
      syncStatus.textContent = `✅ Synced ${diffMinutes}m ago`
      syncStatus.className = 'sync-text success'
    } else {
      syncStatus.textContent = `🔄 Last sync: ${diffMinutes}m ago`
      syncStatus.className = 'sync-text warning'
    }
  } else {
    syncStatus.textContent = '⏳ Waiting for sync...'
    syncStatus.className = 'sync-text'
  }

  // Show email if available
  if (userEmail && localData.userEmail) {
    userEmail.textContent = localData.userEmail
  }

  // Render tasks
  renderTasks(settings.tasks || [])
}

async function handleConnect() {
  const apiKey = apiKeyInput.value.trim()

  if (!apiKey) {
    showToast('Please enter your API key', 'error')
    return
  }

  if (!apiKey.startsWith('zbk_')) {
    showToast('Invalid API key format. Should start with zbk_', 'error')
    return
  }

  try {
    connectBtn.disabled = true
    connectBtn.textContent = 'Connecting...'

    // Save API key and enable sync
    await chrome.storage.sync.set({
      apiKey: apiKey,
      syncEnabled: true
    })

    // Trigger immediate sync
    const response = await chrome.runtime.sendMessage({ 
      action: 'syncNow' 
    })

    if (response && response.success) {
      showToast('Successfully connected!', 'success')
      // Reload state to show connected view
      setTimeout(() => loadState(), 1000)
    } else {
      throw new Error(response?.error || 'Connection failed')
    }
  } catch (error) {
    console.error('Connection error:', error)
    showToast(error.message || 'Failed to connect. Please check your API key.', 'error')
    connectBtn.disabled = false
    connectBtn.textContent = 'Connect to Dashboard'
  }
}

async function handleFocusModeToggle() {
  const enabled = focusModeToggle.checked

  try {
    await chrome.storage.sync.set({ focusModeEnabled: enabled })
    
    // Notify background script
    chrome.runtime.sendMessage({
      action: 'focusModeChanged',
      enabled: enabled
    })

    showToast(
      enabled ? '🎯 Focus mode enabled' : 'Focus mode disabled',
      'success'
    )
  } catch (error) {
    console.error('Error toggling focus mode:', error)
    showToast('Failed to update focus mode', 'error')
    // Revert toggle
    focusModeToggle.checked = !enabled
  }
}

// Task Management Functions
function showAddTaskForm() {
  addTaskForm.classList.remove('hidden')
  taskTitleInput.focus()
}

function hideAddTaskForm() {
  addTaskForm.classList.add('hidden')
  taskTitleInput.value = ''
  taskTimeInput.value = ''
}

async function handleSaveTask() {
  const title = taskTitleInput.value.trim()
  const time = taskTimeInput.value

  if (!title) {
    showToast('Please enter a task title', 'error')
    return
  }

  try {
    const settings = await chrome.storage.sync.get(['tasks'])
    const tasks = settings.tasks || []

    const newTask = {
      id: Date.now().toString(),
      title: title,
      time: time || '',
      completed: false,
      createdAt: new Date().toISOString()
    }

    tasks.push(newTask)
    await chrome.storage.sync.set({ tasks })

    renderTasks(tasks)
    hideAddTaskForm()
    showToast('Task added!', 'success')
  } catch (error) {
    console.error('Error saving task:', error)
    showToast('Failed to save task', 'error')
  }
}

async function toggleTask(taskId) {
  try {
    const settings = await chrome.storage.sync.get(['tasks'])
    const tasks = settings.tasks || []

    const task = tasks.find(t => t.id === taskId)
    if (task) {
      task.completed = !task.completed
      await chrome.storage.sync.set({ tasks })
      renderTasks(tasks)
    }
  } catch (error) {
    console.error('Error toggling task:', error)
  }
}

async function deleteTask(taskId) {
  try {
    const settings = await chrome.storage.sync.get(['tasks'])
    const tasks = settings.tasks || []

    const filtered = tasks.filter(t => t.id !== taskId)
    await chrome.storage.sync.set({ tasks: filtered })
    renderTasks(filtered)
    showToast('Task deleted', 'success')
  } catch (error) {
    console.error('Error deleting task:', error)
    showToast('Failed to delete task', 'error')
  }
}

function renderTasks(tasks) {
  if (!tasks || tasks.length === 0) {
    taskList.innerHTML = `
      <div class="empty-tasks">
        No tasks yet. Add one to get started!
      </div>
    `
    return
  }

  // Sort: incomplete first, then by time
  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1
    }
    return (a.time || '').localeCompare(b.time || '')
  })

  taskList.innerHTML = sortedTasks.map(task => `
    <div class="task-item ${task.completed ? 'completed' : ''}">
      <input 
        type="checkbox" 
        class="task-checkbox" 
        ${task.completed ? 'checked' : ''}
        data-task-id="${task.id}"
      >
      <div class="task-content">
        <div class="task-title">${escapeHtml(task.title)}</div>
        ${task.time ? `<div class="task-time">⏰ ${task.time}</div>` : ''}
      </div>
      <button class="task-delete" data-task-id="${task.id}">🗑️</button>
    </div>
  `).join('')

  // Add event listeners
  taskList.querySelectorAll('.task-checkbox').forEach(checkbox => {
    checkbox.addEventListener('change', (e) => {
      toggleTask(e.target.dataset.taskId)
    })
  })

  taskList.querySelectorAll('.task-delete').forEach(button => {
    button.addEventListener('click', (e) => {
      deleteTask(e.target.dataset.taskId)
    })
  })
}

function escapeHtml(text) {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

function showToast(message, type = 'info') {
  const toast = document.getElementById('toast')
  if (!toast) return

  toast.textContent = message
  toast.className = `toast ${type} show`

  setTimeout(() => {
    toast.classList.remove('show')
  }, 3000)
}
