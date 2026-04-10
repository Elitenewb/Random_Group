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

The production build uses Vite `base: '/Random_Group/'` so asset URLs match the project-page path. Pushes to `main` run [`.github/workflows/deploy-pages.yml`](.github/workflows/deploy-pages.yml).

### Settings (once)

**Settings** → **Pages** → **Build and deployment** → **Source:** **GitHub Actions**. Ignore the suggested “Jekyll” / “Static HTML” cards; this repo already has a workflow under `.github/workflows/`.

### Two workflows in the Actions tab (normal)

| Name | What it is |
|------|------------|
| **Deploy to GitHub Pages** | *Your* workflow: installs deps, builds `dist/`, uploads the site. This one must succeed. |
| **pages build deployment** | GitHub’s follow-up job that takes the uploaded artifact and publishes it. It runs after the deploy job succeeds. |

If **Deploy to GitHub Pages** fails at **Install** or **Build**, the site will not update. A common CI pitfall is `NODE_ENV=production` causing `npm ci` to skip **devDependencies** (no Vite/TypeScript); this workflow uses `npm ci --include=dev` to avoid that.

### Branch deploy vs Actions

Under **Deploy from a branch**, you only see branches that exist (often just `main`). This project is set up for **GitHub Actions** as the source, so you do not need a `gh-pages` branch.

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
