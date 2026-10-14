# Design Document — Life Dashboard

## Overview

The Life Dashboard is a **single-page static web application** built with plain HTML, CSS,
and Vanilla JavaScript. There is no build step, no framework, no server, and no external
dependencies — opening `index.html` in any modern browser is enough to run the app.

All user data (tasks, links, name, theme preference) is stored entirely in the browser's
`localStorage`. The page never makes a network request.

### Goals the design must satisfy

- Every widget (clock, timer, to-dos, links) works independently but shares a single JS
  file and a single CSS file.
- Data persists across page refreshes via `localStorage`.
- The UI switches between light and dark themes using a CSS `data-theme` attribute.
- Three optional challenges are implemented: custom greeting name, duplicate-task
  prevention, and light/dark mode toggle.

---

## Architecture

```
┌─────────────────────────────────────────────────┐
│                 Browser (client only)            │
│                                                 │
│  index.html ──loads──► css/style.css            │
│       │                                         │
│       └────loads──────► js/app.js               │
│                              │                  │
│                              ▼                  │
│                       localStorage              │
│                   (todos, quickLinks,            │
│                    userName, theme)              │
└─────────────────────────────────────────────────┘
```

There is no backend, no API, and no build pipeline. The three files are the entire app.

### Data flow (simplified)

```
User interaction
      │
      ▼
Event listener (app.js)
      │
      ├─► Update in-memory state (let todos = [...], let links = [...])
      ├─► Persist to localStorage  (storage.set)
      └─► Re-render DOM            (renderTodos / renderLinks / renderTimer …)
```

State is always written to `localStorage` immediately after every mutation so there is
never a gap between in-memory state and persisted state.

---

## File / Folder Structure

```
project-root/
├── index.html          # Single HTML file — markup, modals, script/style links
├── css/
│   └── style.css       # All styling — design tokens, layout, component styles
└── js/
    └── app.js          # All JavaScript — state, logic, DOM manipulation
```

All three files are intentionally kept at one level of depth for simplicity.

---

## Components and Interfaces

### 3.1 HTML Structure

`index.html` is divided into four logical regions:

```
<html data-theme="light">          ← theme attribute lives here
  <head>                           ← meta, title, stylesheet link
  <body>
    <header class="topbar">        ← greeting text + theme toggle button
    <section class="hero">         ← large clock + date display
    <main class="dashboard">       ← CSS grid containing the three widget cards
      <section #todo-section>      ← To-Do List widget
      <section #timer-section>     ← Focus Timer widget
      <section #links-section>     ← Quick Links widget
    <dialog #name-modal>           ← modal: set / change greeting name
    <dialog #edit-modal>           ← modal: edit an existing to-do task
    <script src="js/app.js">
```

Semantic elements (`<header>`, `<main>`, `<section>`, `<dialog>`) are used throughout.
All interactive elements have `aria-label` attributes for accessibility.

#### Key IDs referenced by JavaScript

| Element ID | Purpose |
|---|---|
| `clock` | Updated every second with `HH:MM:SS` |
| `date-display` | Updated every second with day/month/year |
| `greeting-text` | Shows time-based greeting + user name |
| `theme-toggle` | Button that flips light ↔ dark |
| `theme-icon` | `<span>` inside the toggle — shows 🌙 or ☀️ |
| `timer-display` | Large countdown readout |
| `timer-label` | Status text below the timer |
| `timer-start/stop/reset` | Timer control buttons |
| `todo-form` | Form that adds a new task |
| `todo-input` | Text input for new tasks |
| `todo-error` | Inline error message area for the to-do form |
| `todo-list` | `<ul>` that holds rendered task items |
| `link-form` | Form that adds a new quick link |
| `link-name` / `link-url` | Inputs for the link form |
| `link-error` | Inline error message for the link form |
| `links-grid` | `<div>` that holds rendered link chips |
| `name-modal` | `<dialog>` for greeting name entry |
| `name-input` | Text input inside the name modal |
| `edit-modal` | `<dialog>` for editing a task |
| `edit-input` | Text input inside the edit modal |
| `edit-error` | Inline error message inside the edit modal |

---

### 3.2 CSS Design System

#### Design tokens (CSS custom properties)

All colours and shared values are defined as CSS variables on `:root` (light mode) and
overridden under `[data-theme="dark"]`. No colour values appear anywhere else in the
stylesheet.

```css
:root {
  --bg:          #f0f2f5;   /* page background         */
  --surface:     #ffffff;   /* card / topbar background */
  --surface-alt: #f7f8fa;   /* input / todo-item bg    */
  --border:      #e2e5ea;   /* all border colours      */
  --text:        #1a1c20;   /* primary text            */
  --text-muted:  #6b7280;   /* secondary/placeholder   */
  --accent:      #4f46e5;   /* buttons, links, timer   */
  --accent-hover:#4338ca;
  --accent-light:#eef2ff;   /* chip backgrounds        */
  --danger:      #ef4444;   /* error text, delete btn  */
  --success:     #22c55e;
  --radius:      12px;      /* border-radius token     */
  --shadow:      0 2px 12px rgba(0,0,0,.08);
  --transition:  .2s ease;
}
```

Switching to dark mode is a single attribute change on `<html>`:

```js
document.documentElement.setAttribute("data-theme", "dark");
```

The `[data-theme="dark"]` block in `style.css` then overrides every token — no JavaScript
colour values are needed.

#### Layout system

| Class | Technique | Purpose |
|---|---|---|
| `.dashboard` | CSS Grid (`auto-fit / minmax(320px, 1fr)`) | Responsive three-column widget grid |
| `.input-row` | Flexbox | Side-by-side input + button rows |
| `.timer-controls` | Flexbox, `justify-content: center` | Centred timer buttons |
| `.links-grid` | Flexbox, `flex-wrap: wrap` | Wrapping link chip row |
| `.todo-list` | Flexbox column | Scrollable task list (max-height 380px) |
| `.modal` | `position: fixed; inset: 0; margin: auto` | Centred dialog overlay |

#### Component classes

| Class | What it styles |
|---|---|
| `.card` | Each widget container (background, border, radius, shadow) |
| `.btn`, `.btn--primary/secondary/ghost/danger/icon` | All button variants |
| `.input` | Shared text input style with focus ring |
| `.todo-item`, `.todo-item--done` | Individual task rows + strikethrough state |
| `.link-chip` | Pill-shaped saved-link button |
| `.modal`, `.modal__content`, `.modal__actions` | Dialog layout |
| `.error-msg` | Red inline validation text |
| `.timer-display` | Large accent-coloured countdown number |
| `.hero__clock` | Giant clock font with `clamp()` sizing |

---

### 3.3 JavaScript Architecture

`app.js` is a single file organised into six clearly-commented sections:

| Section | Responsibility |
|---|---|
| **1 — LocalStorage helpers** | `storage.get` / `storage.set` wrappers with try/catch |
| **2 — DOM references** | All `getElementById` calls centralised via `const $ = id => document.getElementById(id)` |
| **3 — Clock, Date & Greeting** | `updateClock()` called every second via `setInterval` |
| **4 — Theme** | `applyTheme(theme)` sets attribute, updates icon, persists |
| **5 — Custom Name** | Modal open/save/cancel + greeting click-to-edit |
| **6 — Focus Timer** | Start / Stop / Reset with `setInterval` / `clearInterval` |
| **7 — To-Do List** | CRUD operations + duplicate check + `renderTodos()` |
| **8 — Quick Links** | Add / Delete + URL normalisation + `renderLinks()` |

#### Key functions

```
storage.get(key, fallback)
  └─ JSON.parse(localStorage.getItem(key)) or fallback on error

storage.set(key, value)
  └─ localStorage.setItem(key, JSON.stringify(value))

getGreeting(hour) → string
  └─ Pure function: hour → "Good morning/afternoon/evening/night"

updateClock()
  └─ Reads Date(), writes clockEl, dateEl, greetingEl
  └─ Called by setInterval every 1 000 ms

applyTheme(theme)
  └─ Sets data-theme on <html>, updates icon emoji, calls storage.set

formatTime(seconds) → "MM:SS"
  └─ Pure function: seconds → zero-padded time string

isDuplicateTask(text, excludeId?) → boolean
  └─ Case-insensitive search of todos array; excludes current task on edit

addTodo(text)      → mutates todos, saveTodos(), renderTodos()
toggleTodo(id)     → mutates todos, saveTodos(), renderTodos()
deleteTodo(id)     → mutates todos, saveTodos(), renderTodos()

renderTodos()
  └─ Clears todoList innerHTML, appends a <li> per todo (or empty placeholder)

renderLinks()
  └─ Clears linksGrid innerHTML, appends a .link-chip div per link (or empty placeholder)
```

---

## Data Models

All persistent state lives in `localStorage`. There are four keys:

### `"todos"` — array of task objects

```js
// Type: Array<{ id: string, text: string, done: boolean }>
[
  { id: "1718000000000", text: "Read chapter 3", done: false },
  { id: "1718000001234", text: "Do the laundry",  done: true  }
]
```

- `id` — `Date.now().toString()` at creation time; used as a stable key
- `text` — the task description (max 120 characters, enforced by `maxlength`)
- `done` — toggled by the checkbox; drives the `todo-item--done` CSS class

### `"quickLinks"` — array of link objects

```js
// Type: Array<{ id: string, name: string, url: string }>
[
  { id: "1718000002000", name: "GitHub",  url: "https://github.com" },
  { id: "1718000002500", name: "MDN",     url: "https://developer.mozilla.org" }
]
```

- `id` — same `Date.now()` pattern as todos
- `name` — display label (max 40 characters)
- `url` — always stored with `https://` scheme (normalised before saving)

### `"userName"` — string

```js
// Type: string  (empty string "" = no name set)
"Haryadi"
```

Shown in the greeting: `"Good morning, Haryadi 👋"`. Falls back to `"friend"` when empty.

### `"theme"` — string

```js
// Type: "light" | "dark"
"dark"
```

Applied at startup via `applyTheme(storage.get("theme", "light"))`.

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Greeting is time-deterministic

*For any* hour value in the range 0–23, `getGreeting(hour)` SHALL return exactly one of
`"Good morning"`, `"Good afternoon"`, `"Good evening"`, or `"Good night"`, and the
mapping SHALL be total (every valid hour produces a result).

**Validates: Requirements 4.3, 4.4, 4.5, 4.6**

---

### Property 2: Timer formatting round-trip

*For any* integer number of seconds in the range 0–1500 (25 minutes),
`formatTime(seconds)` SHALL produce a string in the form `"MM:SS"` where `MM` and `SS`
are zero-padded integers, and `(parseInt(MM) * 60 + parseInt(SS))` SHALL equal the
original seconds value.

**Validates: Requirements 5.1, 5.2**

---

### Property 3: Duplicate detection is case-insensitive

*For any* task list and any text string, if `isDuplicateTask(text)` returns `true`, then
there EXISTS a task in the list whose `text.toLowerCase()` equals `text.toLowerCase()`.
Conversely, if it returns `false`, NO such task exists (excluding the `excludeId` task
when provided).

**Validates: Requirements 10.1, 10.2**

---

### Property 4: URL normalisation idempotent

*For any* URL string that already starts with `http://` or `https://`, the scheme-prepend
logic SHALL leave it unchanged. *For any* URL string that does NOT start with a scheme,
the result SHALL start with `"https://"` followed by the original string.

**Validates: Requirements 7.5**

---

### Property 5: LocalStorage round-trip preserves task data

*For any* array of task objects written via `storage.set("todos", tasks)`, a subsequent
`storage.get("todos", [])` SHALL return an array that is deeply equal to the original
(same ids, texts, and done states).

**Validates: Requirements 6.5, 1.2**

---

## Error Handling

| Scenario | Handling |
|---|---|
| Empty task submission | `todoError` message shown; task not added |
| Duplicate task (add) | `todoError` message shown; task not added |
| Duplicate task (edit) | `editError` message shown; edit not saved |
| Empty link name or URL | `linkError` message shown; link not added |
| Invalid URL format | `new URL(url)` throws; `linkError` message shown |
| URL missing scheme | `https://` prepended automatically before validation |
| `localStorage` write failure | `console.warn` logged; UI continues normally (graceful degradation) |
| `localStorage` read / parse failure | `storage.get` returns the provided `fallback` value |
| Timer already running (double-start) | Guard `if (timerRunning || timerRemaining === 0) return` prevents double interval |
| Timer Stop when not running | Guard `if (!timerRunning) return` no-ops silently |

All user-facing errors are shown as inline messages in `.error-msg` elements that sit
directly below their associated form. The `role="alert"` and `aria-live="polite"`
attributes ensure screen readers announce the messages.

---

## Testing Strategy

Because this is an existing implementation being documented, the testing strategy
describes how the app's logic can be verified rather than prescribing a TDD setup from
scratch.

### Unit tests — pure functions

The following functions have no DOM or `localStorage` dependency and can be unit-tested
with any JS test runner (e.g. Vitest):

| Function | What to test |
|---|---|
| `getGreeting(hour)` | All four boundary hours (0, 12, 17, 21) and surrounding values |
| `formatTime(seconds)` | 0 → `"00:00"`, 60 → `"01:00"`, 1500 → `"25:00"`, 90 → `"01:30"` |
| `isDuplicateTask(text, excludeId)` | Match, no-match, case variants, excludeId exclusion |
| URL normalisation logic | String with scheme, without scheme, mixed-case scheme |

### Property-based tests

Use a library such as [fast-check](https://github.com/dubzzz/fast-check) (JavaScript).
Each test should run a minimum of 100 iterations.

| Property | Generator | Assertion |
|---|---|---|
| **Property 1** (greeting total) | `fc.integer({ min: 0, max: 23 })` | result is one of the four strings |
| **Property 2** (timer round-trip) | `fc.integer({ min: 0, max: 1500 })` | `parseInt(MM)*60 + parseInt(SS) === input` |
| **Property 3** (duplicate case-insensitive) | `fc.array(fc.string())`, `fc.string()` | `isDuplicateTask` result matches manual `.toLowerCase()` search |
| **Property 4** (URL normalisation) | `fc.webUrl()` (with/without scheme) | scheme-prepend is idempotent and always produces `https://` prefix when absent |
| **Property 5** (localStorage round-trip) | `fc.array(fc.record({ id: fc.string(), text: fc.string(), done: fc.boolean() }))` | `storage.get` after `storage.set` returns deeply equal array |

Tag format for each test:
```
// Feature: todo-life-dashboard, Property N: <property_text>
```

### Integration / smoke tests

| Check | How |
|---|---|
| Page loads without JS errors | Open `index.html` in a browser, check DevTools console |
| Clock updates every second | Watch `#clock` for one second in the browser |
| Theme toggle persists on reload | Toggle theme, reload, verify `data-theme` attribute |
| Tasks persist on reload | Add a task, reload, verify it is still in the list |
| Links persist on reload | Add a link, reload, verify the chip is still present |
| Modal opens on first visit (no name stored) | Clear `localStorage`, reload, verify modal appears |

---

## Event Flow

This section traces how each user interaction moves through the system — from DOM event
to state change to re-render.

### Clock / Date / Greeting — passive polling

```
window load
  └─► setInterval(updateClock, 1000) registered
        Every second:
          └─► new Date()
          └─► write clockEl.textContent
          └─► write dateEl.textContent
          └─► storage.get("userName") → write greetingEl.textContent
```

The clock never triggers a state mutation; it only reads.

---

### Theme toggle

```
User clicks #theme-toggle button
  └─► read current data-theme from <html>
  └─► compute next theme ("light" ↔ "dark")
  └─► applyTheme(nextTheme)
        ├─► document.documentElement.setAttribute("data-theme", theme)
        ├─► themeIcon.textContent = "☀️" or "🌙"
        └─► storage.set("theme", theme)
```

---

### Set / change greeting name

```
First visit (no stored userName):
  window load → storage.get("userName") is falsy
    └─► nameModal.showModal()

User clicks greeting text:
  └─► nameInput.value = current stored name
  └─► nameModal.showModal()

User clicks Save (or presses Enter):
  └─► storage.set("userName", trimmed value)
  └─► nameModal.close()
  └─► updateClock()   ← re-renders greeting immediately

User clicks Cancel (or presses Escape):
  └─► nameModal.close()   ← no state change
```

---

### Focus Timer

```
User clicks Start:
  guard: if (timerRunning || timerRemaining === 0) return
  └─► timerRunning = true
  └─► setTimerLabel("Stay focused! 💪")
  └─► timerInterval = setInterval(() => {
          timerRemaining--
          renderTimer()          ← writes timerDisplay.textContent
          if (timerRemaining === 0) {
            clearInterval(timerInterval)
            timerRunning = false
            setTimerLabel("Session complete! 🎉")
          }
      }, 1000)

User clicks Stop:
  guard: if (!timerRunning) return
  └─► clearInterval(timerInterval)
  └─► timerRunning = false
  └─► setTimerLabel("Paused. Resume when ready.")

User clicks Reset:
  └─► clearInterval(timerInterval)
  └─► timerRunning = false
  └─► timerRemaining = TIMER_TOTAL (1500)
  └─► renderTimer()
  └─► setTimerLabel("Ready to focus?")
```

Timer state (`timerRemaining`, `timerRunning`) is **not** persisted to localStorage —
it resets to 25:00 on every page load by design.

---

### Add a to-do task

```
User types text, submits #todo-form
  └─► text = todoInput.value.trim()
  ├─► if (!text)           → todoError = "Task cannot be empty."  [stop]
  ├─► if isDuplicateTask() → todoError = "This task already exists." [stop]
  └─► todoError = ""
  └─► addTodo(text)
        ├─► todos.push({ id: Date.now(), text, done: false })
        ├─► saveTodos()   → storage.set("todos", todos)
        └─► renderTodos() → rebuild #todo-list DOM
  └─► todoInput.value = ""
  └─► todoInput.focus()
```

---

### Toggle a task done/undone

```
User clicks checkbox on a task
  └─► toggleTodo(id)
        ├─► todos = todos.map(t => t.id === id ? { ...t, done: !t.done } : t)
        ├─► saveTodos()
        └─► renderTodos()
```

---

### Edit a task

```
User clicks ✏️ on a task
  └─► openEditModal(id)
        ├─► editingId = id
        ├─► editInput.value = todo.text
        └─► editModal.showModal()

User clicks Save in edit modal:
  └─► text = editInput.value.trim()
  ├─► if (!text)                    → editError = "Task cannot be empty." [stop]
  ├─► if isDuplicateTask(text, id)  → editError = "Another task …" [stop]
  └─► todos = todos.map(t => t.id === editingId ? { ...t, text } : t)
  └─► saveTodos()
  └─► renderTodos()
  └─► editModal.close()
  └─► editingId = null

User clicks Cancel:
  └─► editModal.close()
  └─► editingId = null
```

---

### Delete a task

```
User clicks 🗑 on a task
  └─► deleteTodo(id)
        ├─► todos = todos.filter(t => t.id !== id)
        ├─► saveTodos()
        └─► renderTodos()
```

---

### Add a quick link

```
User fills name + URL, submits #link-form
  └─► name = linkName.value.trim(), url = linkUrl.value.trim()
  ├─► if (!name || !url)          → linkError = "Both fields required." [stop]
  └─► normalise URL
        if (!/^https?:\/\//i.test(url)) url = "https://" + url
  ├─► try { new URL(url) }
      catch → linkError = "Please enter a valid URL." [stop]
  └─► linkError = ""
  └─► links.push({ id: Date.now(), name, url })
  └─► saveLinks() → storage.set("quickLinks", links)
  └─► renderLinks() → rebuild #links-grid DOM
  └─► linkName.value = "", linkUrl.value = "", linkName.focus()
```

---

### Delete a quick link

```
User clicks ✕ on a link chip
  └─► e.preventDefault()   ← stops anchor navigation
  └─► links = links.filter(l => l.id !== link.id)
  └─► saveLinks()
  └─► renderLinks()
```
