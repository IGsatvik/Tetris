# 🕹️ Modern Tetris (HTML5 Canvas & JavaScript)

[![Live Demo](https://img.shields.io/badge/Demo-Play%20Online-brightgreen?logo=googlechrome&logoColor=white)](https://your-username.github.io/your-repository-name/)
[![License: MIT](https://img.shields.io/badge/License-MIT-purple.svg)](https://opensource.org/licenses/MIT)
[![HTML5](https://img.shields.io/badge/HTML5-Canvas-E34F26?logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
[![CSS3](https://img.shields.io/badge/CSS3-Modern%20UI-1572B6?logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-Vanilla%20ES6+-F7DF1E?logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![GitHub](https://img.shields.io/badge/GitHub-Profile-181717?logo=github&logoColor=white)](https://github.com/your-username)

A modern, responsive, and arcade-accurate web implementation of the classic **Tetris** puzzle game. Built from scratch using vanilla HTML5 Canvas, modern CSS, and ES6+ JavaScript—with zero external frameworks or runtime dependencies.

### 🌐 [Click Here to Play the Live Demo](https://your-username.github.io/your-repository-name/)

---

## ✨ Features

* **Super Rotation System (SRS):** Accurate rotation mechanics with full wall-kick tables for standard tetrominoes and the I-piece.
* **7-Bag Random Generator:** Implements the official 7-bag randomizer to prevent piece starvation and ensure fair gameplay.
* **Ghost Piece Target:** Real-time landing projection to help you plan drop placements accurately.
* **Hold Queue & Next Piece:** Dedicated preview canvases to hold strategic pieces and look ahead.
* **Responsive DAS/ARR Input:** Delayed Auto Shift (155ms) and Auto-Repeat Rate (45ms) for precise, competitive-feeling horizontal controls.
* **Dynamic Visual Effects:** Smooth canvas animations, modern dark/glassmorphic UI, and colorful particle bursts on line clears.
* **Progress & Persistence:** Automatic local storage tracking for high scores alongside real-time level and line counters.

---

## 🎮 Controls

| Action | Primary Key | Secondary Key |
| :--- | :--- | :--- |
| **Move Left / Right** | `←` / `→` | `A` / `D` |
| **Rotate Clockwise** | `↑` / `W` | — |
| **Rotate Counter-Clockwise** | `Z` | — |
| **Soft Drop** | `↓` | `S` |
| **Hard Drop** | `Space` | — |
| **Hold Piece** | `C` | — |
| **Pause / Resume** | `P` | `Esc` |
| **Start / Restart** | `Enter` | `Space` |

---

## 📁 Repository Structure

```text
├── index.html       # Semantic HTML layout and canvas elements
├── style.css        # Custom CSS, typography, theme variables, and overlays
├── script.js        # Core game engine, SRS matrix math, loop, and render logic
├── LICENSE          # MIT License terms and conditions
└── README.md        # Project overview and documentation