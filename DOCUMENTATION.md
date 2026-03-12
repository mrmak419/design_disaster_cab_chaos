# Cab Chaos Architecture & Documentation

Cab Chaos differentiates itself by offering a component-driven architecture explicitly designed to handle contrasting application modes. This document serves as a guide for developers working on the application.

## Architecture Overview

The system is built on **React 19** and bundled utilizing **Vite**. The core philosophy allows developers to test features under extreme UI constraints ("Chaos") versus optimal conditions ("Clarity").

### State Management (Zustand)

Global state is orchestrated via **Zustand**.
The primary store resides in `src/store/appStore.js`. It tracks:
- `isChaosMode`: A boolean dictating which interface to render.
- `activeView`: The current active page/component, such as `login` or `dashboard`.

The store is primarily interacted with via the `useAppStore` hook.

### Structural Breakdown

#### Components (`src/components/`)
Components are strictly categorized to manage concerns safely:
- **`chaos/`**: Components that intentionally break standard UX conventions, introduce visual noise, or delay interactions.
- **`clarity/`**: Refined, standard UI components.
- **`shared/`**: Generic UI components (buttons, text fields) utilized seamlessly across both modes.

#### Views (`src/views/`)
Views act as the top-level wrappers for application pages.
- **`Dashboard.jsx`**: The primary dashboard view. Includes map logic using `react-leaflet`.
- **`chaosLogin.jsx`**: A specific login flow explicitly designed for Chaos Mode.

### Real-World Simulation Hooks

The application aims to simulate poor network conditions or hardware limitations natively.
These hooks inside `src/hooks/` are instrumental:
- **`useFakeLag`**: A hook that returns artificially delayed data or extends the lifecycle of pending states.
- **`useDriftingLocation`**: Modifies precise coordinates (e.g., GPS latitude/longitude) with random noise to simulate poor connectivity and drifting tracking, useful on maps.

## Styling System

All styling is managed via **Tailwind CSS**. 
The configuration applies globally through `index.css` and ensures rapid iteration without complex global stylesheets or modular CSS setups.

## Component Routing & The Global Toggle

The root behavior of the application is handled inside `src/App.jsx`.
- **The Mode Switcher**: A global event listener is registered for `keydown` events checking for `Ctrl + Shift + K`. When invoked, `toggleChaosMode` updates the state, instantaneously swapping the Component tree layout.
- **Conditional Rendering**: In Chaos mode, `App.jsx` evaluates the `activeView` to display `chaosLogin` or the `Dashboard`. Conversely, Clarity Mode currently delegates structure for future implementations.

## Future Development Guidelines

1. **Isolation over Globals:** When building for a specific mode, avoid polluting standard HTML tags. Use isolated Tailwind classes.
2. **Accessible Modes:** Ensure the global toggle listener is cleanly mounted and unmounted to avoid memory leaks if relocated from `App.jsx`.
3. **Map Optimizations:** When using `leaflet`, be mindful that rapid unmounting between modes may require explicitly cleaning map tiles to prevent browser memory bloat.
