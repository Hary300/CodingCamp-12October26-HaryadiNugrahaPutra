/**
 * app.js — Life Dashboard
 * Single-file vanilla JS for: Clock/Greeting, Focus Timer, To-Do List, Quick Links
 * Challenges: Custom name · Duplicate task prevention · Light/Dark mode
 */

/* ============================================================
   LocalStorage Helpers
   ============================================================ */
const storage = {
  get(key, fallback = null) {
    try {
      const raw = localStorage.getItem(key);
      return raw !== null ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn("localStorage write failed:", e);
    }
  },
};

/* ============================================================
   DOM References
   ============================================================ */
const $ = (id) => document.getElementById(id);

const clockEl       = $("clock");
const dateEl        = $("date-display");
const greetingEl    = $("greeting-text");
const themeToggle   = $("theme-toggle");
const themeIcon     = $("theme-icon");

// Timer
const timerDisplay  = $("timer-display");
const timerLabel    = $("timer-label");
const timerStart    = $("timer-start");
const timerStop     = $("timer-stop");
const timerReset    = $("timer-reset");

// To-Do
const todoForm      = $("todo-form");
const todoInput     = $("todo-input");
const todoError     = $("todo-error");
const todoList      = $("todo-list");

// Quick Links
const linkForm      = $("link-form");
const linkName      = $("link-name");
const linkUrl       = $("link-url");
const linkError     = $("link-error");
const linksGrid     = $("links-grid");

// Modals
const nameModal     = $("name-modal");
const nameInput     = $("name-input");
const nameSave      = $("name-save");
const nameCancel    = $("name-cancel");

const editModal     = $("edit-modal");
const editInput     = $("edit-input");
const editError     = $("edit-error");
const editSave      = $("edit-save");
const editCancel    = $("edit-cancel");

/* ============================================================
   1. Clock, Date & Greeting
   ============================================================ */
const DAYS   = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const MONTHS = ["January","February","March","April","May","June",
                "July","August","September","October","November","December"];

function pad(n) { return String(n).padStart(2, "0"); }

function getGreeting(hour) {
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  if (hour < 21) return "Good evening";
  return "Good night";
}

function updateClock() {
  const now   = new Date();
  const h     = now.getHours();
  const m     = now.getMinutes();
  const s     = now.getSeconds();

  // Clock
  clockEl.textContent = `${pad(h)}:${pad(m)}:${pad(s)}`;

  // Date
  dateEl.textContent = `${DAYS[now.getDay()]}, ${MONTHS[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`;

  // Greeting (rebuilt every minute to avoid stale greeting at boundary)
  const name = storage.get("userName", "");
  greetingEl.textContent = `${getGreeting(h)}, ${name || "friend"} 👋`;
}

setInterval(updateClock, 1000);
updateClock();

/* ============================================================
   2. Theme — Challenge: Light / Dark mode
   ============================================================ */
function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  themeIcon.textContent = theme === "dark" ? "☀️" : "🌙";
  storage.set("theme", theme);
}

// Init theme from storage
applyTheme(storage.get("theme", "light"));

themeToggle.addEventListener("click", () => {
  const current = document.documentElement.getAttribute("data-theme");
  applyTheme(current === "dark" ? "light" : "dark");
});

/* ============================================================
   3. Custom Name — Challenge: Custom name in greeting
   ============================================================ */
// Show name modal on first visit (no stored name)
window.addEventListener("load", () => {
  if (!storage.get("userName")) {
    nameModal.showModal();
  }
});

// Also allow editing name by clicking the greeting
greetingEl.style.cursor = "pointer";
greetingEl.title = "Click to change your name";
greetingEl.addEventListener("click", () => {
  nameInput.value = storage.get("userName", "");
  nameModal.showModal();
  // Focus the input after a short delay (modal animation)
  setTimeout(() => nameInput.focus(), 80);
});

nameSave.addEventListener("click", () => {
  const val = nameInput.value.trim();
  storage.set("userName", val);
  nameModal.close();
  updateClock();
});

nameCancel.addEventListener("click", () => {
  nameModal.close();
});

nameInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") nameSave.click();
  if (e.key === "Escape") nameCancel.click();
});

/* ============================================================
   4. Focus Timer (25-minute Pomodoro)
   ============================================================ */
const TIMER_TOTAL = 25 * 60; // seconds
let timerRemaining = TIMER_TOTAL;
let timerInterval  = null;
let timerRunning   = false;

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${pad(m)}:${pad(s)}`;
}

function renderTimer() {
  timerDisplay.textContent = formatTime(timerRemaining);
}

function setTimerLabel(text) {
  timerLabel.textContent = text;
}

timerStart.addEventListener("click", () => {
  if (timerRunning || timerRemaining === 0) return;
  timerRunning = true;
  setTimerLabel("Stay focused! 💪");
  timerInterval = setInterval(() => {
    timerRemaining--;
    renderTimer();
    if (timerRemaining === 0) {
      clearInterval(timerInterval);
      timerRunning = false;
      setTimerLabel("Session complete! Take a break 🎉");
    }
  }, 1000);
});

timerStop.addEventListener("click", () => {
  if (!timerRunning) return;
  clearInterval(timerInterval);
  timerRunning = false;
  setTimerLabel("Paused. Resume when ready.");
});

timerReset.addEventListener("click", () => {
  clearInterval(timerInterval);
  timerRunning   = false;
  timerRemaining = TIMER_TOTAL;
  renderTimer();
  setTimerLabel("Ready to focus?");
});

/* ============================================================
   5. To-Do List
   ============================================================ */
let todos = storage.get("todos", []); // [{ id, text, done }]
let editingId = null; // id of task being edited

function saveTodos() {
  storage.set("todos", todos);
}

function createTodoItem(todo) {
  const li = document.createElement("li");
  li.className = `todo-item${todo.done ? " todo-item--done" : ""}`;
  li.dataset.id = todo.id;

  // Checkbox
  const checkbox = document.createElement("input");
  checkbox.type    = "checkbox";
  checkbox.checked = todo.done;
  checkbox.setAttribute("aria-label", `Mark "${todo.text}" as done`);
  checkbox.addEventListener("change", () => toggleTodo(todo.id));

  // Text
  const span = document.createElement("span");
  span.className    = "todo-item__text";
  span.textContent  = todo.text;

  // Actions
  const actions = document.createElement("div");
  actions.className = "todo-item__actions";

  const editBtn = document.createElement("button");
  editBtn.className = "btn btn--ghost";
  editBtn.style.cssText = "padding:.3rem .55rem;font-size:.8rem;";
  editBtn.textContent   = "✏️";
  editBtn.setAttribute("aria-label", `Edit "${todo.text}"`);
  editBtn.addEventListener("click", () => openEditModal(todo.id));

  const delBtn = document.createElement("button");
  delBtn.className  = "btn btn--danger";
  delBtn.textContent = "🗑";
  delBtn.setAttribute("aria-label", `Delete "${todo.text}"`);
  delBtn.addEventListener("click", () => deleteTodo(todo.id));

  actions.append(editBtn, delBtn);
  li.append(checkbox, span, actions);
  return li;
}

function renderTodos() {
  todoList.innerHTML = "";
  if (todos.length === 0) {
    const empty = document.createElement("li");
    empty.style.cssText = "text-align:center;color:var(--text-muted);padding:.75rem;font-size:.9rem;";
    empty.textContent   = "No tasks yet. Add one above!";
    todoList.appendChild(empty);
    return;
  }
  todos.forEach((t) => todoList.appendChild(createTodoItem(t)));
}

function addTodo(text) {
  const id = Date.now().toString();
  todos.push({ id, text, done: false });
  saveTodos();
  renderTodos();
}

function toggleTodo(id) {
  todos = todos.map((t) => t.id === id ? { ...t, done: !t.done } : t);
  saveTodos();
  renderTodos();
}

function deleteTodo(id) {
  todos = todos.filter((t) => t.id !== id);
  saveTodos();
  renderTodos();
}

// Challenge: Prevent duplicate tasks (case-insensitive)
function isDuplicateTask(text, excludeId = null) {
  return todos.some(
    (t) => t.text.toLowerCase() === text.toLowerCase() && t.id !== excludeId
  );
}

// Add task form
todoForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = todoInput.value.trim();

  if (!text) {
    todoError.textContent = "Task cannot be empty.";
    return;
  }
  if (isDuplicateTask(text)) {
    todoError.textContent = "This task already exists.";
    return;
  }

  todoError.textContent = "";
  addTodo(text);
  todoInput.value = "";
  todoInput.focus();
});

todoInput.addEventListener("input", () => { todoError.textContent = ""; });

// Edit modal
function openEditModal(id) {
  const todo = todos.find((t) => t.id === id);
  if (!todo) return;
  editingId         = id;
  editInput.value   = todo.text;
  editError.textContent = "";
  editModal.showModal();
  setTimeout(() => editInput.focus(), 80);
}

editSave.addEventListener("click", () => {
  const text = editInput.value.trim();

  if (!text) {
    editError.textContent = "Task cannot be empty.";
    return;
  }
  if (isDuplicateTask(text, editingId)) {
    editError.textContent = "Another task with this name already exists.";
    return;
  }

  todos = todos.map((t) => t.id === editingId ? { ...t, text } : t);
  saveTodos();
  renderTodos();
  editModal.close();
  editingId = null;
});

editCancel.addEventListener("click", () => {
  editModal.close();
  editingId = null;
});

editInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") editSave.click();
  if (e.key === "Escape") editCancel.click();
});

editInput.addEventListener("input", () => { editError.textContent = ""; });

// Initial render
renderTodos();

/* ============================================================
   6. Quick Links
   ============================================================ */
let links = storage.get("quickLinks", []); // [{ id, name, url }]

function saveLinks() {
  storage.set("quickLinks", links);
}

function renderLinks() {
  linksGrid.innerHTML = "";
  if (links.length === 0) {
    const empty = document.createElement("p");
    empty.style.cssText = "color:var(--text-muted);font-size:.88rem;";
    empty.textContent   = "No links yet. Add one above!";
    linksGrid.appendChild(empty);
    return;
  }

  links.forEach((link) => {
    const chip = document.createElement("div");
    chip.className = "link-chip";

    const anchor = document.createElement("a");
    anchor.href            = link.url;
    anchor.target          = "_blank";
    anchor.rel             = "noopener noreferrer";
    anchor.className       = "link-chip__label";
    anchor.textContent     = link.name;
    anchor.style.cssText   = "color:inherit;text-decoration:none;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;";

    const delBtn = document.createElement("button");
    delBtn.className    = "link-chip__delete";
    delBtn.textContent  = "✕";
    delBtn.setAttribute("aria-label", `Remove ${link.name}`);
    delBtn.addEventListener("click", (e) => {
      e.preventDefault();
      links = links.filter((l) => l.id !== link.id);
      saveLinks();
      renderLinks();
    });

    chip.append(anchor, delBtn);
    linksGrid.appendChild(chip);
  });
}

linkForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = linkName.value.trim();
  let   url  = linkUrl.value.trim();

  if (!name || !url) {
    linkError.textContent = "Both name and URL are required.";
    return;
  }

  // Normalise URL — prepend https:// if missing scheme
  if (!/^https?:\/\//i.test(url)) {
    url = "https://" + url;
  }

  // Basic URL validation
  try {
    new URL(url);
  } catch {
    linkError.textContent = "Please enter a valid URL.";
    return;
  }

  linkError.textContent = "";
  links.push({ id: Date.now().toString(), name, url });
  saveLinks();
  renderLinks();
  linkName.value = "";
  linkUrl.value  = "";
  linkName.focus();
});

linkName.addEventListener("input", () => { linkError.textContent = ""; });
linkUrl.addEventListener("input",  () => { linkError.textContent = ""; });

// Initial render
renderLinks();
