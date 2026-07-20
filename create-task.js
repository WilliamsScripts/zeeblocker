// Create Task page script

let useCustom = false;

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('backBtn').innerHTML = renderIcon('arrow-left', 'icon');
  document.getElementById('saveTaskBtn').innerHTML = `${renderIcon('check', 'icon')}<span>Save Task</span>`;

  document.getElementById('taskTitle').focus();

  document.getElementById('backBtn').addEventListener('click', closeTaskPage);
  document.getElementById('cancelTaskBtn').addEventListener('click', closeTaskPage);
  document.getElementById('saveTaskBtn').addEventListener('click', saveTask);

  document.getElementById('durationSlider').addEventListener('input', (e) => {
    document.getElementById('durationDisplay').textContent = `${e.target.value} min`;
  });

  document.getElementById('customToggle').addEventListener('click', () => setCustomMode(true));
  document.getElementById('sliderToggle').addEventListener('click', () => setCustomMode(false));
});

function setCustomMode(custom) {
  useCustom = custom;
  document.getElementById('sliderMode').classList.toggle('hidden', custom);
  document.getElementById('customMode').classList.toggle('hidden', !custom);

  if (custom) {
    document.getElementById('customMinutes').value = document.getElementById('durationSlider').value;
    document.getElementById('customMinutes').focus();
  }
}

async function saveTask() {
  const title = document.getElementById('taskTitle').value.trim();
  const description = document.getElementById('taskDescription').value.trim();

  if (!title) {
    document.getElementById('taskTitle').focus();
    flashInvalid('taskTitle');
    return;
  }

  const duration = useCustom
    ? parseInt(document.getElementById('customMinutes').value, 10)
    : parseInt(document.getElementById('durationSlider').value, 10);

  if (!duration || duration <= 0) {
    flashInvalid(useCustom ? 'customMinutes' : 'durationSlider');
    return;
  }

  const task = {
    id: Date.now().toString(),
    title,
    description,
    duration,
    completed: false,
    createdAt: new Date().toISOString()
  };

  const data = await chrome.storage.sync.get(['tasks']);
  const tasks = data.tasks || [];
  tasks.push(task);
  await chrome.storage.sync.set({ tasks });

  closeTaskPage();
}

function flashInvalid(id) {
  const el = document.getElementById(id);
  el.style.borderColor = 'var(--color-danger)';
  setTimeout(() => { el.style.borderColor = ''; }, 1200);
}

function closeTaskPage() {
  window.close();
}
