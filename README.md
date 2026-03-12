#  Go Cab - Impetus Design Challenge

Welcome to the **LocalHost** project repository! This project is being developed as part of the **Impetus** event.

The core theme of this project is to design and build an interface for a cab booking platform where users can seamlessly book rides, track drivers, and manage their trip details.

##  The Challenge

The event is structured around two contrasting design philosophies:

### Round 1: Chaos (The Anti-UI)

The goal here is to design a deliberately frustrating user experience to understand common pitfalls.

* **Confusing UI:** Complex ride selection and booking steps.
* **Misleading UX:** Hidden pricing or confusing payment options.
* **Information Hiding:** Hard-to-find driver or trip details.
* **Maze Navigation:** Poor navigation flows between screens.

### Round 2: Clarity (The Ideal UI)

The goal is to resolve the chaos and deliver a flawless, user-centric design.

* **Simple Flow:** Clear and straightforward ride booking.
* **Transparency:** Honest pricing and an easy payment process.
* **Accessibility:** Easy access to driver and trip details.
* **Smooth UX:** Intuitive navigation and an overall smooth user experience.

##  Tech Stack

Based on our current setup, the project utilizes a modern frontend stack:

* **React.js** (Library for building UIs)
* **Vite** (Next-generation frontend tooling for fast builds)
* **Tailwind CSS** (Utility-first CSS framework for rapid styling)
* **State Management** (Custom store implementation)


  ### Project Structure
```text
design impetus
├── impetus
│   ├── index.html
│   ├── package.json
│   ├── public
│   │   └── vite.svg
│   └── src
│       ├── counter.js
│       ├── javascript.svg
│       ├── main.js
│       └── style.css
└── localhost
    ├── index.html
    ├── package.json
    ├── postcss.config.js
    ├── public
    │   └── vite.svg
    ├── README.md
    ├── src
    │   ├── App.css
    │   ├── App.jsx
    │   ├── assets
    │   │   └── react.svg
    │   ├── components
    │   │   ├── chaos
    │   │   │   ├── ConfusingCheckout.jsx
    │   │   │   ├── DriftingMapPin.jsx
    │   │   │   └── SurgePricingDisplay.jsx
    │   │   └── clarity
    │   │       ├── AccurateMap.jsx
    │   │       ├── CleanCheckout.jsx
    │   │       └── TransparentPricing.jsx
    │   ├── hooks
    │   │   ├── useDriftingLocation.js
    │   │   └── useFakeLag.js
    │   ├── index.css
    │   ├── main.jsx
    │   ├── store
    │   │   └── appStore.js
    │   └── views
    │       └── Dashboard.jsx
    ├── tailwind.config.js
    └── vite.config.js
```





##  Current Status: Work in Progress

**This project is currently under active development!** We are continuously building out the interfaces for both the "Chaos" and "Clarity" rounds. Expect frequent updates, new components, and UI/UX refinements in the coming days.

##  Getting Started

To run this project locally, follow these steps:

1. **Clone the repository:**
```bash
git clone https://github.com/mrmak419/localhost

```


2. **Navigate to the project directory:**
```bash
cd cab-chaos

```


3. **Install the dependencies:**
```bash
npm install

```


4. **Start the development server:**
```bash
npm run dev

