# Synesthetica: Projection Explorer

**Author:** Daniel Sandner  
**Date:** September 2025  
**License:** MIT

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

[![Play Online](https://img.shields.io/badge/Play-Online-brightgreen?style=for-the-badge)](https://synesthetica.netlify.app)

---

### Abstract

**Synesthetica** is an interactive experimental environment for the multi-sensory exploration of mathematical functions. It moves beyond the traditional, static Cartesian graph to represent functions as dynamic, multi-dimensional entities through a suite of novel visual **Projection Modes** and auditory **Sonification Engines**. This tool serves as a mathematical instrument, designed for researchers, educators, artists, and the curious to build a deeper, more intuitive understanding of the structures and behaviors hidden within abstract equations.

---

### 1. The Problem: Beyond the Cartesian Veil

For centuries, the Cartesian graph has been the primary tool for visualizing functions. While undeniably powerful, it offers only a single, flattened projection of a function's reality. This static representation often conceals the rich topological, dynamical, and structural properties inherent in the mathematical form. A function is not merely a curve on a plane; it can be a developmental program, a gravitational field, a network topology, or a quantum wavefunction. Synesthetica is an experiment designed to lift this Cartesian veil and explore these alternative realities.

### 2. The Experiment: A Multi-Modal Approach

Synesthetica treats functions as generative entities and provides a laboratory for observing their behavior through different representational frameworks.

#### 2.1 Visual Projection Modes

Instead of a single, fixed graph, the application features a library of **Projection Modes**. Each mode is a distinct algorithm that interprets the function as a set of rules for generating or influencing a dynamic system. This allows the user to perceive the same equation from multiple geometric and physical perspectives.

**Key examples include:**
*   **Topological Fiber Bundle:** Visualizes function continuity as the connectedness of a twisted 3D ribbon.
*   **Phase Space Marble Flow:** Treats the function as a gravitational potential, with simulated marbles revealing its gradient and critical points.
*   **Morphogenetic & Synaptic Growth:** Interprets the function as a developmental program, growing complex, organic structures and networks akin to biological forms.
*   **Fluid Dynamics Field:** Uses the function's derivative to drive a particle-based fluid simulation, making its vector field tangible.

> For a detailed technical and mathematical breakdown of each mode, see the [**Algorithm Chronicle (`algorithms.md`)**](./algorithms.md).

#### 2.2 Auditory Sonification Engines

In parallel with the visual modes, Synesthetica employs a modular system of **Sonification Engines** to translate function properties into rich, informative soundscapes. Sonification here is not a simple mapping of value-to-pitch, but a nuanced approach to revealing different aspects of the function's character through sound.

**Key examples include:**
*   **FM Synthesis:** Uses the function to control the timbral complexity of the sound, translating mathematical roughness into harmonic richness.
*   **Rhythmic Pulses:** Maps the function's value to pulse pitch and its *derivative* (slope) to the rhythmic rate, making its rate of change intuitively audible.
*   **Harmonic Grains:** Interprets the function's shape as a filter or resonator, controlling the amplitude of a harmonic series to produce complex, evolving tones.

> For a deep dive into the audio synthesis techniques and their mappings, see the [**Sonification Engine Chronicle (`sonification.md`)**](./sonification.md).

---

### 3. Core Features

*   **Real-time Mathematical Parser:** Securely evaluates standard JavaScript mathematical expressions with variables for space (`x`), time (`t`), and constants (`a`, `b`, `c`).
*   **Interactive Canvas:** Full touch and mouse support for intuitive rotation and scaling of the visualization.
*   **Extensive Library of Projection Modes:** A diverse collection of generative and analytical visualization algorithms.
*   **Modular Sonification System:** Multiple, distinct audio engines for varied and insightful auditory feedback.
*   **Dynamic Parameter Control:** Fine-grained, real-time control over all visual and auditory parameters.
*   **Workspace Management:** Ability to save and load complete application states to the browser's local storage.

> For a complete project history and future roadmap, including planned features like a hybrid WebGL renderer and advanced preset sharing, see the [**Project Plan (`plan.md`)**](./plan.md).

---

### 4. Author & Contact

This project is curated by Daniel Sandner as part of an ongoing investigation into the intersection of art, science, and technology.

*   **Arts & Science Interconnections:** [sandner.art](https://sandner.art)
*   **Algorithmic Sonification Experiments:** [eigensound.com](https://eigensound.com)

---

### 5. License

This project is licensed under the [MIT License](LICENSE).

Copyright (c) 2025 Daniel Sandner

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT
LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
