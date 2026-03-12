
# Design Impetus Workspace

This repository contains two separate frontend projects under the same workspace.  
Both are built with Vite, but one is a bare‑bones template and the other is a React application used for prototype work.

---

## 1. `impetus` (Vanilla Vite template)

- Standard Vite starter created with `npm create vite@latest`.
- Uses plain JavaScript, HTML and CSS.
- Files of interest:
  - `index.html` – entry point.
  - `src/main.js` – mounts a simple counter demo.
  - `src/counter.js` – helper for the button.
- Purpose: boilerplate / experiment playground.  No additional business logic is present.

### Commands
```sh
cd impetus
npm install
npm run dev     # start development server on http://localhost:5173
npm run build   # production build
npm run preview # serve the built assets locally
```

---

## 2. `localhost` ("Cab Chaos" React application)

A React prototype that simulates ride‑hailing UI concepts.  It is configured with
TailwindCSS, Leaflet for maps, and Zustand for lightweight state.

### Architecture & code overview
- **Dependencies** (see `package.json`):
  - `react`, `react-dom`, `react-router-dom` – core React stack.
  - `leaflet` & `react-leaflet` – interactive maps.
  - `zustand` – global store.
  - `tailwindcss` with PostCSS for styling.
- **Source layout** (only the meaningful directories are listed):
  - `src/components/chaos` – placeholder components illustrating intentionally confusing
    UX (currently empty stubs).
  - `src/components/clarity` – the opposite set of components promoting clean, clear
    interactions (also empty at the moment).
  - `src/hooks` – custom React hooks such as `useDriftingLocation` and `useFakeLag`.
  - `src/store/appStore.js` – Zustand store definition.
  - `src/views/Dashboard.jsx` – main view component for the prototype.

> **Note:** Many of the component and hook files are currently empty; they exist as
> scaffolding for future implementation. No runtime logic is shipped yet.

### Running the app
```sh
cd localhost
npm install
npm run dev         # launches Vite dev server (default port 5173)
npm run lint        # run ESLint over the source
npm run build        # create production bundle
npm run preview      # preview the production build
```

The development server will open the React application at `http://localhost:5173`.

### Editing & extending
- Add components under `src/components/*` and update routing if needed.
- Implement hooks in `src/hooks` to simulate behavior (e.g. map pin drift or fake
  network lag).
- Use the Zustand store for shared state across views.

---

## General notes
- Both projects use the same Node/npm toolchain; installing dependencies in each
  subdirectory is required.
- The codebase currently contains many placeholders; the README reflects what
  actually exists rather than listing every empty file.
- Remove or ignore this file at your discretion when the workspace evolves.

---
