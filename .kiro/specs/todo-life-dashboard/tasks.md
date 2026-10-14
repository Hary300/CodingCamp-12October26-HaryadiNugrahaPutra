# Implementation Plan: Life Dashboard

## Overview

The Life Dashboard is already fully built. This plan covers **verification tasks** —
confirming the existing code satisfies every requirement — plus the one **action task**
still outstanding: publishing the project to GitHub Pages.

Tasks marked `*` are optional verification checks (open the browser and confirm it
works). The GitHub deployment task is required and produces a tangible deliverable.

---

## Tasks

- [x] 1. Verify technical constraints and folder structure
  - [x]* 1.1 Confirm no external libraries or frameworks are used
    - Open `index.html` — verify there are no CDN `<script>` or `<link>` tags pointing
      to third-party URLs.
    - Open `app.js` — verify there are no `import` statements referencing packages.
    - _Requirements: 1.1_
  - [x]* 1.2 Confirm LocalStorage is the only persistence layer
    - Search `app.js` for `storage.get` / `storage.set` — confirm all data reads and
      writes go through these helpers and `localStorage` is the only store used.
    - _Requirements: 1.2_
  - [x]* 1.3 Confirm folder structure matches specification
    - Verify the project root contains exactly: `index.html`, `css/style.css`,
      `js/app.js`, and `README.md`.
    - _Requirements: 3.1, 3.2, 3.3_

- [x] 2. Verify Greeting Widget
  - [x]* 2.1 Confirm clock updates every second
    - Open the dashboard in a browser, watch `#clock` — the seconds digit should
      increment once per second.
    - _Requirements: 4.1, 2.2_
  - [x]* 2.2 Confirm date is displayed in human-readable format
    - Check `#date-display` shows a string like "Friday, January 1, 2025".
    - _Requirements: 4.2_
  - [x]* 2.3 Confirm time-based greeting boundaries
    - In `app.js`, review `getGreeting(hour)` — confirm the four branches cover
      hours 0–11 (morning), 12–16 (afternoon), 17–20 (evening), 21–23 (night).
    - _Requirements: 4.3, 4.4, 4.5, 4.6_
  - [x]* 2.4 Write property test for greeting coverage (Property 1)
    - Set up Vitest (`npm init -y && npm install --save-dev vitest fast-check`).
    - Export `getGreeting` from `app.js` (or copy the pure function to a
      `js/pure-functions.js` test helper).
    - Write a property test using `fc.integer({ min: 0, max: 23 })` asserting
      `getGreeting(hour)` is always one of the four expected strings.
    - Tag: `// Feature: todo-life-dashboard, Property 1: Greeting is time-deterministic`
    - _Requirements: 4.3, 4.4, 4.5, 4.6_

- [ ] 3. Verify Focus Timer
  - [ ]* 3.1 Confirm timer initialises to 25:00
    - Open the dashboard — verify `#timer-display` shows `25:00` on first load.
    - _Requirements: 5.1_
  - [ ]* 3.2 Confirm Start, Stop, and Reset buttons work
    - Click Start — watch the timer count down.
    - Click Stop — confirm the countdown pauses.
    - Click Reset — confirm the display returns to `25:00`.
    - _Requirements: 5.2, 5.3, 5.4_
  - [ ]* 3.3 Confirm timer stops and shows completion message at 00:00
    - In `app.js`, trace the `setInterval` callback — confirm `clearInterval` is
      called and `setTimerLabel` is called with the completion message when
      `timerRemaining === 0`.
    - _Requirements: 5.5_
  - [ ]* 3.4 Write property test for timer formatting (Property 2)
    - Export `formatTime` (or copy it to the test helper file from task 2.4).
    - Write a property test using `fc.integer({ min: 0, max: 1500 })` asserting
      `parseInt(MM) * 60 + parseInt(SS) === input` after splitting the output on `:`.
    - Tag: `// Feature: todo-life-dashboard, Property 2: Timer formatting round-trip`
    - _Requirements: 5.1, 5.2_

- [ ] 4. Verify To-Do List
  - [ ]* 4.1 Confirm adding, editing, completing, and deleting tasks
    - Add a task — confirm it appears in `#todo-list`.
    - Click its checkbox — confirm the text gets a strikethrough style.
    - Click ✏️ — confirm the edit modal opens; change the text and save.
    - Click 🗑 — confirm the task is removed.
    - _Requirements: 6.1, 6.2, 6.3, 6.4_
  - [ ]* 4.2 Confirm tasks persist after page refresh
    - Add a task, reload the page — confirm the task is still there.
    - _Requirements: 6.5_
  - [ ]* 4.3 Confirm empty-state placeholder appears
    - Delete all tasks — verify the "No tasks yet" message is shown.
    - _Requirements: 6.6_
  - [ ]* 4.4 Write property test for duplicate detection (Property 3)
    - Export `isDuplicateTask` (or copy it to the test helper).
    - Write a property test using `fc.array(fc.string())` and `fc.string()`
      asserting the function's result matches a manual `.toLowerCase()` search.
    - Tag: `// Feature: todo-life-dashboard, Property 3: Duplicate detection is case-insensitive`
    - _Requirements: 10.1, 10.2_
  - [ ]* 4.5 Write property test for LocalStorage round-trip (Property 5)
    - Write a property test using
      `fc.array(fc.record({ id: fc.string(), text: fc.string(), done: fc.boolean() }))`
      asserting `storage.get("todos", [])` after `storage.set("todos", tasks)` returns
      a deeply equal array.
    - Tag: `// Feature: todo-life-dashboard, Property 5: LocalStorage round-trip preserves task data`
    - _Requirements: 6.5, 1.2_

- [ ] 5. Verify Quick Links
  - [ ]* 5.1 Confirm adding, opening, and deleting links
    - Add a link with name "GitHub" and URL "github.com" — confirm the chip appears.
    - Click the chip — confirm it opens the URL in a new tab.
    - Click ✕ on the chip — confirm it is removed.
    - _Requirements: 7.1, 7.2, 7.3_
  - [ ]* 5.2 Confirm links persist after page refresh
    - Add a link, reload the page — confirm the chip is still there.
    - _Requirements: 7.4_
  - [ ]* 5.3 Confirm URL normalisation and validation
    - Add a link with URL `example.com` (no scheme) — confirm it is saved as
      `https://example.com`.
    - Try submitting an invalid URL such as `not a url` — confirm an inline error
      appears and no chip is added.
    - _Requirements: 7.5, 7.6_
  - [ ]* 5.4 Confirm empty-state placeholder appears
    - Delete all links — verify the "No links yet" message is shown.
    - _Requirements: 7.7_
  - [ ]* 5.5 Write property test for URL normalisation (Property 4)
    - Write a property test using `fc.webUrl()` asserting that a URL already
      starting with `http://` or `https://` is unchanged, and any other string has
      `https://` prepended exactly once.
    - Tag: `// Feature: todo-life-dashboard, Property 4: URL normalisation idempotent`
    - _Requirements: 7.5_

- [ ] 6. Verify challenge features
  - [ ]* 6.1 Confirm first-visit name modal
    - Clear `localStorage` in DevTools, reload — confirm the name modal opens
      automatically.
    - _Requirements: 9.1_
  - [ ]* 6.2 Confirm greeting updates and name persists
    - Enter a name and save — confirm `#greeting-text` shows the name immediately.
    - Reload — confirm the name is still shown.
    - Click the greeting text — confirm the modal opens so the name can be changed.
    - _Requirements: 9.2, 9.3, 9.4_
  - [ ]* 6.3 Confirm duplicate task prevention
    - Add a task "Read chapter 3".
    - Try adding "read chapter 3" again — confirm the inline error appears and no
      duplicate is added.
    - Try editing an existing task to match another task's text — confirm the edit
      modal also shows the error.
    - _Requirements: 10.1, 10.2_
  - [ ]* 6.4 Confirm light / dark theme toggle and persistence
    - Click the theme toggle — confirm the UI switches colour scheme and the icon
      changes (🌙 ↔ ☀️).
    - Reload — confirm the selected theme is restored.
    - _Requirements: 11.1, 11.2, 11.3_

- [ ] 7. Checkpoint — confirm all verifications pass
  - Ensure all manual checks above pass, ask the user if questions arise.

- [x] 8. Complete GitHub deployment
  - [x] 8.1 Push the repository to GitHub
    - Repository: https://github.com/Hary300/CodingCamp-12October26-HaryadiNugrahaPutra
    - _Requirements: 8.1_
  - [x] 8.2 Enable GitHub Pages
    - Live demo: https://hary300.github.io/CodingCamp-12October26-HaryadiNugrahaPutra/
    - _Requirements: 8.2_

---

## Notes

- Tasks marked with `*` are optional verification checks — they confirm the existing
  implementation is correct and can be skipped if you trust the code.
- Task 8 (GitHub deployment) is the only task that requires new action; everything else
  is already implemented.
- For property tests (tasks 2.4, 3.4, 4.4, 4.5, 5.5), you'll need to extract pure
  functions from `app.js` so they can be imported in a test file. The recommended
  approach is to copy `getGreeting`, `formatTime`, `isDuplicateTask`, the URL
  normalisation logic, and the `storage` helper into a `js/pure-functions.js` file
  and `export` them. Then import them in your test files.
- Run tests with `npx vitest --run` (single-run mode, no watch).

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2", "1.3"] },
    { "id": 1, "tasks": ["2.1", "2.2", "2.3", "3.1", "4.3", "5.4", "6.1"] },
    { "id": 2, "tasks": ["2.4", "3.2", "3.3", "4.1", "5.1", "5.3", "6.2", "6.3", "6.4"] },
    { "id": 3, "tasks": ["3.4", "4.2", "5.2", "4.4", "5.5"] },
    { "id": 4, "tasks": ["4.5"] },
    { "id": 5, "tasks": ["8.1"] },
    { "id": 6, "tasks": ["8.2"] }
  ]
}
```
