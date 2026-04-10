# Group Generator

A fast, polished single-page app for randomly splitting students into balanced groups. Built with React, TypeScript, Vite, and Tailwind CSS.

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Type-check and production build |
| `npm run preview` | Preview production build |
| `npm test` | Run unit tests |

## Features

- Paste or type student names (one per line or comma-separated)
- Choose number of groups (2-10) or students per group
- Fisher-Yates shuffle for fair randomization
- Balanced group sizes (differ by at most 1)
- Save, load, and delete named class lists (localStorage)
- State persists across page refreshes
- Present mode for projector display
- Copy to clipboard, print, export as .txt or .csv
- Fully responsive, keyboard accessible
