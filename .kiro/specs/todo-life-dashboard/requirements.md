# Requirements Document

## Introduction

The Life Dashboard is a personal productivity web app built with plain HTML, CSS, and
Vanilla JavaScript. It shows the current time and date, a personalised greeting, a
25-minute focus timer, a to-do list, and a quick-links bar. All data is saved in the
browser's LocalStorage so nothing is lost on page refresh. Three bonus challenges were
also implemented: a custom name in the greeting, duplicate-task prevention, and a
light / dark theme toggle.

This document records the requirements derived from the original assignment and maps
each one to its implementation status in the existing codebase.

**Status legend**
- ✅ Implemented — fully present and working in the code
- ⚠️ Partially implemented — some parts done, something is still missing
- ❌ Missing — not found in the codebase

---

## Glossary

- **Dashboard** — the single-page web application described in this document
- **LocalStorage** — the browser's built-in key-value storage, accessed via `localStorage`
- **Focus_Timer** — the 25-minute countdown timer widget
- **Todo_List** — the task management widget
- **Quick_Links** — the saved-URL chip widget
- **Greeting** — the top-bar text that says "Good morning / afternoon / evening, [name]"
- **Theme_Toggle** — the button that switches between light and dark colour schemes

---

## Requirements

---

### Requirement 1: Technical Constraints

**User Story:** As a developer, I want the project to use only web-native technologies,
so that it works in any browser without a build step or server.

#### Acceptance Criteria

| # | Requirement | Status |
|---|-------------|--------|
| 1.1 | THE Dashboard SHALL be built with HTML, CSS, and Vanilla JavaScript only — no frameworks, no libraries, no backend. | ✅ |
| 1.2 | THE Dashboard SHALL use the browser LocalStorage API as the only persistence layer. | ✅ |
| 1.3 | THE Dashboard SHALL work in Chrome, Firefox, Edge, and Safari as a standalone web page. | ✅ |

**Notes (codebase evidence)**
- `index.html` loads only `css/style.css` and `js/app.js` — no CDN links, no `<script type="module">`, no bundler output.
- `app.js` uses a thin `storage` helper that wraps `localStorage.getItem` / `localStorage.setItem`.
- No Web APIs that are Chrome-only or require a secure context beyond what a static file server provides.

---

### Requirement 2: Non-Functional Requirements

**User Story:** As a user, I want the app to feel fast and look clean, so that I can
focus on my tasks without friction.

#### Acceptance Criteria

| # | Requirement | Status |
|---|-------------|--------|
| 2.1 | THE Dashboard SHALL load without any build or install step — opening `index.html` in a browser is sufficient. | ✅ |
| 2.2 | THE Dashboard SHALL update the clock display every second without noticeable lag. | ✅ |
| 2.3 | THE Dashboard SHALL present a clear visual hierarchy using consistent spacing, typography, and colour tokens. | ✅ |

**Notes (codebase evidence)**
- `setInterval(updateClock, 1000)` drives the clock; no heavy computation blocks the main thread.
- `style.css` defines CSS custom properties (`--bg`, `--text`, `--accent`, etc.) used consistently throughout; the `dashboard` grid uses `auto-fit / minmax` for responsive layout.

---

### Requirement 3: Folder Structure

**User Story:** As a developer, I want a predictable file layout, so that the project is
easy to navigate and review.

#### Acceptance Criteria

| # | Requirement | Status |
|---|-------------|--------|
| 3.1 | THE Dashboard SHALL have exactly one CSS file located at `css/style.css`. | ✅ |
| 3.2 | THE Dashboard SHALL have exactly one JavaScript file located at `js/app.js`. | ✅ |
| 3.3 | THE Dashboard SHALL have one `index.html` at the project root. | ✅ |

---

### Requirement 4: Greeting Widget

**User Story:** As a user, I want to see the current time, date, and a greeting when I
open the dashboard, so that I always know what time it is.

#### Acceptance Criteria

| # | Requirement | Status |
|---|-------------|--------|
| 4.1 | THE Dashboard SHALL display the current time in `HH:MM:SS` format, updated every second. | ✅ |
| 4.2 | THE Dashboard SHALL display the current date in a human-readable format (day name, month name, date, year). | ✅ |
| 4.3 | WHEN the hour is before 12:00, THE Greeting SHALL read "Good morning". | ✅ |
| 4.4 | WHEN the hour is between 12:00 and 16:59, THE Greeting SHALL read "Good afternoon". | ✅ |
| 4.5 | WHEN the hour is between 17:00 and 20:59, THE Greeting SHALL read "Good evening". | ✅ |
| 4.6 | WHEN the hour is 21:00 or later, THE Greeting SHALL read "Good night". | ✅ |

**Notes (codebase evidence)**
- `updateClock()` in `app.js` handles all four criteria above via `getGreeting(h)`.
- Falls back to "friend" when no name is stored.

---

### Requirement 5: Focus Timer

**User Story:** As a user, I want a 25-minute countdown timer, so that I can work in
focused Pomodoro sessions.

#### Acceptance Criteria

| # | Requirement | Status |
|---|-------------|--------|
| 5.1 | THE Focus_Timer SHALL display 25:00 on initial load. | ✅ |
| 5.2 | WHEN the Start button is clicked, THE Focus_Timer SHALL count down one second at a time. | ✅ |
| 5.3 | WHEN the Stop button is clicked, THE Focus_Timer SHALL pause the countdown. | ✅ |
| 5.4 | WHEN the Reset button is clicked, THE Focus_Timer SHALL return to 25:00 and stop. | ✅ |
| 5.5 | WHEN the countdown reaches 00:00, THE Focus_Timer SHALL stop automatically and show a completion message. | ✅ |

**Notes (codebase evidence)**
- `timerStart`, `timerStop`, `timerReset` event listeners in `app.js`; uses `setInterval` / `clearInterval`.
- Guards prevent double-start (`if (timerRunning || timerRemaining === 0) return`).

---

### Requirement 6: To-Do List

**User Story:** As a user, I want to manage a list of tasks that persists across page
reloads, so that I never lose track of what I need to do.

#### Acceptance Criteria

| # | Requirement | Status |
|---|-------------|--------|
| 6.1 | THE Todo_List SHALL let the user add a new task by typing text and submitting the form. | ✅ |
| 6.2 | THE Todo_List SHALL let the user mark a task as done by clicking its checkbox. | ✅ |
| 6.3 | THE Todo_List SHALL let the user edit a task's text via an edit modal. | ✅ |
| 6.4 | THE Todo_List SHALL let the user delete a task. | ✅ |
| 6.5 | THE Todo_List SHALL save all tasks to LocalStorage so they persist after a page refresh. | ✅ |
| 6.6 | WHEN the task list is empty, THE Todo_List SHALL display a placeholder message. | ✅ |

**Notes (codebase evidence)**
- `todos` array is loaded from `storage.get("todos", [])` on startup and written back on every mutation.
- Edit flow uses a `<dialog>` modal (`editModal`) with save / cancel buttons.

---

### Requirement 7: Quick Links

**User Story:** As a user, I want to save and open favourite URLs from the dashboard, so
that I can reach important sites in one click.

#### Acceptance Criteria

| # | Requirement | Status |
|---|-------------|--------|
| 7.1 | THE Quick_Links SHALL let the user add a link by entering a name and a URL. | ✅ |
| 7.2 | WHEN a link chip is clicked, THE Quick_Links SHALL open the URL in a new browser tab. | ✅ |
| 7.3 | THE Quick_Links SHALL let the user delete an individual link. | ✅ |
| 7.4 | THE Quick_Links SHALL save all links to LocalStorage so they persist after a page refresh. | ✅ |
| 7.5 | WHEN a URL is submitted without an `https://` scheme, THE Quick_Links SHALL prepend `https://` automatically. | ✅ |
| 7.6 | WHEN an invalid URL is submitted, THE Quick_Links SHALL show an inline error and not save the link. | ✅ |
| 7.7 | WHEN the link list is empty, THE Quick_Links SHALL display a placeholder message. | ✅ |

**Notes (codebase evidence)**
- Scheme normalisation: `if (!/^https?:\/\//i.test(url)) url = "https://" + url`.
- Validation uses `new URL(url)` inside a try/catch.

---

### Requirement 8: GitHub & Deployment

**User Story:** As a developer, I want the project to be published on GitHub Pages, so
that it can be accessed from any device with a browser.

#### Acceptance Criteria

| # | Requirement | Status |
|---|-------------|--------|
| 8.1 | THE Dashboard source code SHALL be pushed to a GitHub repository. | ⚠️ |
| 8.2 | THE Dashboard SHALL be accessible via a public GitHub Pages URL. | ⚠️ |

**Notes**
- A `.git` folder is present, confirming Git is initialised locally.
- Whether the repository has been pushed and GitHub Pages has been enabled cannot be verified from the source files alone — this must be confirmed in the GitHub web UI.

---

### Requirement 9: Challenge — Custom Name in Greeting

**User Story:** As a user, I want to set my name so that the greeting says "Good morning,
[my name]" instead of "Good morning, friend".

#### Acceptance Criteria

| # | Requirement | Status |
|---|-------------|--------|
| 9.1 | WHEN the app is opened for the first time (no stored name), THE Dashboard SHALL show a modal asking for the user's name. | ✅ |
| 9.2 | WHEN the user saves a name, THE Greeting SHALL display that name immediately. | ✅ |
| 9.3 | WHEN the user clicks the greeting text, THE Dashboard SHALL open the name modal so the name can be changed. | ✅ |
| 9.4 | THE Dashboard SHALL persist the user's name in LocalStorage. | ✅ |

**Notes (codebase evidence)**
- `nameModal.showModal()` is called on `window` load when `!storage.get("userName")`.
- Clicking `greetingEl` re-opens the modal; cursor is set to `pointer` and a tooltip is shown.

---

### Requirement 10: Challenge — Prevent Duplicate Tasks

**User Story:** As a user, I want the app to stop me from adding the same task twice, so
that my list stays clean.

#### Acceptance Criteria

| # | Requirement | Status |
|---|-------------|--------|
| 10.1 | WHEN a task is submitted whose text matches an existing task (case-insensitive), THE Todo_List SHALL reject the submission and show an error message. | ✅ |
| 10.2 | WHEN a task is edited and the new text matches a different existing task (case-insensitive), THE Todo_List SHALL reject the edit and show an error message. | ✅ |

**Notes (codebase evidence)**
- `isDuplicateTask(text, excludeId)` performs `.toLowerCase()` comparison.
- Used in both the add-form submit handler and the edit-save handler.

---

### Requirement 11: Challenge — Light / Dark Mode

**User Story:** As a user, I want to switch between a light and a dark theme, so that the
dashboard is comfortable to use at any time of day.

#### Acceptance Criteria

| # | Requirement | Status |
|---|-------------|--------|
| 11.1 | THE Theme_Toggle SHALL switch the interface between a light and a dark colour scheme when clicked. | ✅ |
| 11.2 | THE Dashboard SHALL persist the selected theme in LocalStorage and restore it on next load. | ✅ |
| 11.3 | THE Theme_Toggle icon SHALL reflect the current theme (moon icon for light mode, sun icon for dark mode). | ✅ |

**Notes (codebase evidence)**
- `applyTheme(theme)` sets `data-theme` on `<html>`, updates the icon, and calls `storage.set("theme", theme)`.
- `style.css` uses `[data-theme="dark"]` overrides for all colour tokens — no JavaScript colour values needed.

---

## Implementation Status Summary

| Area | Status |
|------|--------|
| Technical constraints (TC-1, TC-2, TC-3) | ✅ All met |
| Non-functional requirements (NFR-1, NFR-2, NFR-3) | ✅ All met |
| Folder structure | ✅ Compliant |
| Greeting (clock, date, time-based message) | ✅ Complete |
| Focus Timer (Start / Stop / Reset) | ✅ Complete |
| To-Do List (add, edit, done, delete, persist) | ✅ Complete |
| Quick Links (add, open, delete, persist) | ✅ Complete |
| GitHub push & GitHub Pages | ⚠️ Needs verification |
| Challenge: Custom name | ✅ Complete |
| Challenge: Prevent duplicate tasks | ✅ Complete |
| Challenge: Light / Dark mode | ✅ Complete |
