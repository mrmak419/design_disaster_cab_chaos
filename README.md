# Cab Chaos

Cab Chaos is a unique dual-mode React application built using Vite and Tailwind CSS. The core feature of this application is its ability to toggle between two distinct user experiences: **Chaos Mode** and **Clarity Mode**.

## Features

- **Global Mode Toggle:** Switch seamlessly between Chaos and Clarity modes using `Ctrl + Shift + K`.
- **State Management:** Powered by [Zustand](https://github.com/pmndrs/zustand) for lightweight, fast, and scalable global state.
- **Mapping Capabilities:** Integrates with `leaflet` and `react-leaflet` to render dynamic map components.
- **Simulated Real-World Imperfections:** Utilizes custom hooks like `useDriftingLocation` and `useFakeLag` to intentionally degrade the user experience in "Chaos Mode".
- **Dynamic Routing:** Built-in support for different views using `react-router-dom`.
- **Iconography:** Incorporates scalable vectors from `lucide-react`.

## Project Structure

- `src/components/` - Organizes UI components into `chaos`, `clarity`, and `shared` categories.
- `src/views/` - Dedicated page-level components like `Dashboard.jsx` and `chaosLogin.jsx`.
- `src/store/` - Zustand store declarations (`appStore.js`).
- `src/hooks/` - Contains the custom hooks.
- `src/assets/` - Static assets and resources used throughout the application.

## Prerequisites

- Node.js installed on your machine.
- NPM or another package manager.

## Installation

1. Clone the repository and navigate to the project directory:
   ```bash
   cd cab-chaos
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## Usage

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open your browser and navigate to the localhost URL provided by Vite.

3. **Toggle Modes:** Press `Ctrl + Shift + K` anywhere in the application to toggle between the intense Chaos experience and the streamlined Clarity layout.

## Building for Production

To create a production-ready build, run:
```bash
npm run build
```

This will bundle the application and output the optimized files into the `dist/` directory.

## Linting

To check for code quality and style errors using ESLint, run:
```bash
npm run lint
```
