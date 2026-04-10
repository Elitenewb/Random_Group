# Group Generator

A fast, polished single-page app for randomly splitting students into balanced groups. Built with React, TypeScript, Vite, and Tailwind CSS.

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## GitHub Pages

Live site: [https://elitenewb.github.io/Random_Group/](https://elitenewb.github.io/Random_Group/)

The production build uses Vite `base: '/Random_Group/'` so asset URLs match the project-page path. Pushes to `main` run [`.github/workflows/deploy-pages.yml`](.github/workflows/deploy-pages.yml), which builds `dist/` and publishes it with **GitHub Actions** (no extra branch to pick).

**One-time Pages setup (recommended):** Repo **Settings** → **Pages** → **Build and deployment** → **Source:** choose **GitHub Actions** (not “Deploy from a branch”). You do **not** select `main` or `gh-pages` here—GitHub uses the workflow artifact. Save, then ensure the **Deploy to GitHub Pages** workflow run completes (Actions tab).

**Why you might only see `main`:** That happens under **Deploy from a branch**, which lists existing branches. A **`gh-pages`** branch only appears after a tool has created it (e.g. a branch-based deploy). With **GitHub Actions** as the source, branch pickers are not used for publishing.

To verify a production build locally: `npm run build && npm run preview`, then open [http://localhost:4173/Random_Group/](http://localhost:4173/Random_Group/).

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
