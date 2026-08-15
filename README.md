# 🕹️ Modern Tetris (HTML5 Canvas & JavaScript)

[![License: MIT](https://img.shields.io/badge/License-MIT-purple.svg)](https://opensource.org/licenses/MIT)[cite: 1]
[![HTML5](https://img.shields.io/badge/HTML5-Canvas-E34F26?logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)[cite: 1]
[![CSS3](https://img.shields.io/badge/CSS3-Modern%20UI-1572B6?logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)[cite: 1]
[![JavaScript](https://img.shields.io/badge/JavaScript-Vanilla%20ES6+-F7DF1E?logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)[cite: 1]
[![GitHub](https://img.shields.io/badge/GitHub-Profile-181717?logo=github&logoColor=white)](https://github.com/your-username)[cite: 1]

A modern, responsive, and arcade-accurate web implementation of the classic **Tetris** puzzle game. Built from scratch using vanilla HTML5 Canvas, modern CSS, and ES6+ JavaScript—with zero external frameworks or runtime dependencies.

---

## ✨ Features[cite: 1]

* **Super Rotation System (SRS):** Accurate rotation mechanics with full wall-kick tables for standard tetrominoes and the I-piece[cite: 1].
* **7-Bag Random Generator:** Implements the official 7-bag randomizer to prevent piece starvation and ensure fair gameplay[cite: 1].
* **Ghost Piece Target:** Real-time landing projection to help you plan drop placements accurately[cite: 1].
* **Hold Queue & Next Piece:** Dedicated preview canvases to hold strategic pieces and look ahead[cite: 1].
* **Responsive DAS/ARR Input:** Delayed Auto Shift (155ms) and Auto-Repeat Rate (45ms) for precise, competitive-feeling horizontal controls[cite: 1].
* **Dynamic Visual Effects:** Smooth canvas animations, modern dark/glassmorphic UI, and colorful particle bursts on line clears[cite: 1].
* **Progress & Persistence:** Automatic local storage tracking for high scores alongside real-time level and line counters[cite: 1].

---

## 🎮 Controls[cite: 1]

| Action | Primary Key | Secondary Key |
| :--- | :--- | :--- |
| **Move Left / Right** | `←` / `→` | `A` / `D` |[cite: 1]
| **Rotate Clockwise** | `↑` / `W` | — |[cite: 1]
| **Rotate Counter-Clockwise** | `Z` | — |[cite: 1]
| **Soft Drop** | `↓` | `S` |[cite: 1]
| **Hard Drop** | `Space` | — |[cite: 1]
| **Hold Piece** | `C` | — |[cite: 1]
| **Pause / Resume** | `P` | `Esc` |[cite: 1]
| **Start / Restart** | `Enter` | `Space` |[cite: 1]

---

## 📁 Repository Structure[cite: 1]

```text
├── index.html       # Semantic HTML layout and canvas elements[cite: 1]
├── style.css        # Custom CSS, typography, theme variables, and overlays[cite: 1]
├── script.js        # Core game engine, SRS matrix math, loop, and render logic[cite: 1]
├── LICENSE          # MIT License terms and conditions[cite: 1]
└── README.md        # Project overview and documentation[cite: 1]