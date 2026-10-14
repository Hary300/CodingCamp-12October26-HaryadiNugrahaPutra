# 📋 Life Dashboard — To-Do List App

A clean, minimal personal dashboard to help you organize your day. Built with pure HTML, CSS, and Vanilla JavaScript — no frameworks, no backend.

🌐 **Live Demo:** [View on GitHub Pages](https://hary300.github.io/CodingCamp-12September26-HaryadiNugrahaPutra/)

---

## ✨ Features

### Core Features
| Feature | Description |
|---|---|
| 🕐 **Clock & Date** | Live clock with current time, day, and full date |
| 👋 **Greeting** | Time-based greeting (morning / afternoon / evening / night) |
| ⏱ **Focus Timer** | 25-minute Pomodoro timer with Start, Stop, and Reset |
| 📝 **To-Do List** | Add, edit, complete, and delete tasks |
| 🔗 **Quick Links** | Save and open your favorite websites in one click |
| 💾 **Local Storage** | All data persists in the browser — no account needed |

### Bonus Challenges
| Challenge | Description |
|---|---|
| 👤 **Custom Name** | Set your name to personalize the greeting |
| 🚫 **No Duplicates** | Prevents adding the same task twice (case-insensitive) |
| 🌙 **Light / Dark Mode** | Toggle between light and dark themes, saved to local storage |

---

## 🗂 Project Structure

```
├── index.html       # Main HTML structure
├── css/
│   └── style.css    # All styles (CSS variables, layout, components)
└── js/
    └── app.js       # All functionality (clock, timer, todos, links)
```

---

## 🛠 Tech Stack

- **HTML5** — Semantic structure, native `<dialog>` for modals
- **CSS3** — Custom properties, CSS Grid, Flexbox, animations
- **Vanilla JavaScript** — No libraries or frameworks
- **LocalStorage API** — Client-side data persistence

---

## 🚀 How to Run

No installation or build step required.

1. Clone or download this repository
2. Open `index.html` in any modern browser
3. That's it!

```bash
git clone https://github.com/Hary300/CodingCamp-12September26-HaryadiNugrahaPutra.git
cd CodingCamp-12September26-HaryadiNugrahaPutra
# Open index.html in your browser
```

---

## 📖 How to Use

### To-Do List
- Type a task in the input field and click **Add** or press **Enter**
- Click the **checkbox** to mark a task as done
- Click ✏️ to edit a task
- Click 🗑 to delete a task
- Tasks are saved automatically — they stay after you close the browser

### Focus Timer
- Click **Start** to begin the 25-minute session
- Click **Stop** to pause
- Click **Reset** to go back to 25:00

### Quick Links
- Enter a name and URL, then click **Add**
- Click a chip to open the link in a new tab
- Click **✕** on a chip to remove it

### Custom Name
- On first visit, a prompt will ask for your name
- Click on the greeting text anytime to change your name

### Light / Dark Mode
- Click the 🌙 / ☀️ button in the top-right corner to toggle themes

---

## 🌐 Browser Compatibility

| Browser | Supported |
|---|---|
| Chrome | ✅ |
| Firefox | ✅ |
| Edge | ✅ |
| Safari | ✅ |

---

## 👨‍💻 Author

**Haryadi Nugraha Putra**
RevoU CodingCamp — Batch 12, September 26
