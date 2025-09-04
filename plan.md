# Synesthetica: Projection Explorer - Project Plan & Feature Overview

This document outlines the development phases, implemented features, and future roadmap for the Synesthetica project. It serves as a high-level overview of the application's architecture and capabilities.

---

## Project Vision

Synesthetica aims to transform abstract mathematical functions into rich, multi-sensory experiences. By moving beyond the limitations of the traditional Cartesian graph, it allows users to see, hear, and interact with functions as dynamic, multi-dimensional entities. The core philosophy is to build an intuitive mathematical instrument for exploration, education, and research.

---

## Phase 1: Core Foundation (Implemented ✔️)

This phase established the fundamental building blocks of the application, creating a functional and interactive prototype.

### Key Features Implemented:

*   **Core Rendering Engine:** Built on the HTML5 Canvas 2D API for broad compatibility.
*   **Interactive Visualization:** 3D-like manipulation (drag-to-rotate, pinch-to-zoom).
*   **Dynamic Function Parsing:** Secure, real-time evaluation of JavaScript math expressions.
*   **Modular Projection Architecture:** An extensible system for adding new visualization modes.
*   **Initial Set of Projection Modes:** Fiber Bundle, Quantum Harmonic, Crystal Lattice, Morphogenetic, Phase Choreography, Graph Evolution, Hyperbolic.
*   **Integrated Sonification:** Web Audio API engine to generate sound based on function behavior with safety constraints.
*   **Mobile-First UI/UX:** Header, Side Menu, context-aware Bottom Controls, and Help/Preset modals.

---

## Phase 2: Refinement & Expansion (In Progress 🚀)

This phase focuses on enhancing the existing foundation with performance upgrades, improved usability, and deeper mathematical and artistic capabilities.

### Implemented Features:

*   **UI/UX Enhancements:**
    *   **Rapid Exploration:** Header icons for quick preset access and mode cycling.
    *   **Visual Settings Panel:** Configuration for UI elements like the equation overlay.
    *   **Collapsible Controls:** Bottom panel can be collapsed to maximize viewport on mobile.
    *   **Adaptive Centering:** Visualization automatically centers in the visible area above the controls.
*   **Improved Function Parser:** Gracefully handles incomplete input and provides numerical derivative calculations.
*   **Expanded Algorithm Selection:**
    *   **Fiber Bundle:** Features three distinct algorithms (V0-Points, V1-Line, V2-Ribbon).
    *   **Morphogenetic:** Now has three algorithms (V0-Symmetric, V2-Asymmetric, V3-Biometric).
    *   **Synaptic Growth:** Features three algorithms (V0-Symmetric, V1-Asymmetric, V2-Biometric).
*   **New Projection Modes:**
    *   **Zeta Scattering:** Inspired by the Riemann Hypothesis.
    *   **Persistent Homology:** Visualizes topological data features.
    *   **Phase Space Marble Flow:** Simulates particles rolling along the function curve.
    *   **Fluid Dynamics Function Fields:** Visualizes the function's gradient as a vector field.
    *   **Neural Synapse Patterns:** Visualizes the function as an activation pattern in a neural network.
    *   **Origami Folding Dynamics:** A 2D conceptualization of function-driven paper folding.
    *   **Synaptic Growth:** A hybrid mode combining organic, generative growth with dynamic network formation.
*   **Modular Sonification Engine:**
    *   System to switch between different audio synthesis methods.
    *   **Engines:** FM Synthesis, Harmonic Grains, and Rhythmic Pulses, each with unique parameters.
*   **Workspace Management:**
    *   **Save/Load to Browser:** Ability to save and load the complete application state to/from `localStorage`.

### Planned Features:

*   **Performance Overhaul (Hybrid Renderer):**
    *   **Strategy:** Introduce a WebGL-based renderer (e.g., using Three.js) alongside the existing 2D Canvas renderer. New, graphically intensive modes will be built for WebGL, while existing modes are preserved. The app will switch renderers based on the selected mode.
*   **Advanced Preset Management:**
    *   **Workspace Library:** A dedicated UI to save, load, name, and delete multiple user-created presets.
    *   **Import/Export:** Allow users to share presets as text (JSON) files.
*   **New High-Impact Modes:**
    *   **Spectral Waterfall:** Implement a time-frequency visualization using Web Audio FFT for a dynamic spectrogram.
    *   **Bacterial Colony Growth:** Create a cellular automaton simulation where the function defines nutrient fields.
*   **Enhanced Function Editor:**
    *   Implement syntax highlighting and real-time error checking.
    *   Add support for complex numbers to explore fractals (e.g., `z^2 + c`).

---

## Phase 3: The Synesthetic Ecosystem (Future Vision 🌌)

This phase expands Synesthetica from a tool into a platform for collaborative and educational discovery.

### High-Impact Production Candidates:

*   **Physarum Slime Mold Simulation:** A particle-based simulation of slime mold behavior, where agents deposit and follow a chemoattractant trail. The user's function could define the properties of the environment (e.g., nutrient placement or diffusion rates), leading to complex, emergent network formation.
*   **Topological Data Flow Networks:** Represent a function's composition as a computational graph.
*   **Harmonic Crystal Sonification:** Tightly integrate sonification and 3D visualization of Fourier components.
*   **Image-Based Preset Sharing:**
    *   **Concept:** Embed the JSON preset data directly into the metadata of an exported PNG image.
    *   **Workflow:** A user saves a screenshot, and the app embeds the current state. Another user can drag-and-drop that image onto their app to instantly load the preset.

### Long-Term Goals:

*   **Augmented Reality (AR) Integration:** Use WebXR to project and manipulate the mathematical objects in the user's physical space.
*   **Collaborative Mode:** Implement real-time collaboration for shared exploration.
*   **Educational Journeys:** Create guided tours through key mathematical concepts.
*   **Research & Data Tools:** Allow exporting visualization data for analysis.