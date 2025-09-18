# Synesthetica: Algorithm Versions Chronicle

This document provides a concise overview of the different algorithms available within each Projection Mode. It details the scientific concept and implementation of each variation, clarifying its purpose and the role of the user-defined function `f(...)`.

---

### 1. Fiber Bundle

-   **V0 (Points):** The classic Cartesian graph, visualized as a point cloud. `f(x, t)` determines the y-position of each point. Serves as a familiar baseline.
-   **V1 (Line):** A minimalistic representation of the function as a single twisted line in 3D space. `f(x, t)` controls the radial distance from a central axis, creating a helix-like path.
-   **V2 (Ribbon):** Extrudes the line from V1 into a surface, creating a twisted 3D ribbon. This provides a more tangible sense of a "section" of a fiber bundle.

### 2. Fluid Field

-   **V0 (Classic):** A simple vector field where `f'(x, t)` (the function's slope) acts as a "wind" deflecting particles moving across the screen.
-   **V1 (Vortex):** `f(r, t)` controls the tangential and radial forces on particles in a central vortex, creating galactic spiral patterns. `r` is the distance from the center.
-   **V2 (Gravity Wells):** `f(i, t)` controls the mass of several gravitational wells. Particles move according to the summed gravitational pull, simulating a dynamic n-body problem.
-   **V3 (Lattice Deformation):** A grid is warped by a vector field derived from `f(x, y, t)`. Visualizes the function's gradient as a stress-strain field on a continuous medium.
-   **V4 (Curl & Divergence):** Scientifically visualizes the vector field's properties. Background color shows local rotation (curl) and expansion/contraction (divergence), while particles trace the flow. `f(x, y, t)` defines the field components.
-   **V5 (Topological Portrait):** Treats `f(x, y, t)` as a potential landscape. Particles flow "downhill" along the gradient, tracing streamlines that reveal the function's critical points (peaks, valleys, saddles).

### 3. Neural Synapses

-   **V0 (Layered):** A classic feed-forward neural network. `f(x, t)` acts as a probabilistic activation function, determining if a neuron fires.
-   **V1 (Circular):** Neurons are arranged in concentric rings. Information flows outwards. `f(x, t)` again controls firing probability.
-   **V2 (Reactive):** A layered network where neurons have physical properties. When a neuron fires, it "recoils" based on `f(x, t)`, causing the network to jiggle in response to information flow.
-   **V3 (Geometric):** Neurons are arranged in a closed polygon. Signals propagate to adjacent neighbors, and `f(x, t)` controls the physical recoil, making the entire shape react to activity.

### 4. Origami Fold

-   **V0 (Linear Strip):** A 1D strip of "paper" is folded in 2D space. `f(x, t)` determines the target fold angle at each crease.
-   **V1 (Radial Fold):** Multiple strips radiate from the center like a paper star. `f(x, t)` controls the folding of each arm simultaneously.
-   **V2 (Branched Fold):** A recursive, tree-like structure. `f(x, t)` controls the folding of the main trunk and the branching angles of sub-strips.

### 5. Event Growth

-   **V0 (Forest):** Function "zero crossings" trigger the growth of tree-like structures. `f(...)` influences branching angles, creating a generative forest.
-   **V1 (Vines):** Zero crossings trigger vines that grow and curve across the screen. `f(...)` controls the curvature of the vine's path.
-   **V2 (Pulse):** Zero crossings send a pulse of energy through a static, pre-generated network, visualizing information propagation.

### 6. Quantum Harmonic

-   **V0 (Interference):** `f(x, t)` defines a primary wave that interferes with a secondary sine wave, creating classic interference patterns.
-   **V1 (Probability Cloud):** `f(x, t)` is treated as a wavefunction `ψ(x)`. The visualization plots a cloud of particles where the density is proportional to `|ψ(x)|²`, the probability of finding a particle at that location.
-   **V2 (Phase Orbits):** `f(x, t)` modulates the parameters of a grid of Lissajous figures, creating a dynamic field of evolving harmonic motion.
-   **V3 (Wave Packet):** Simulates a quantum wave packet moving through a potential energy landscape defined by `f(x, t)`. The packet reflects, refracts, and can even **tunnel** through barriers.

### 7. Crystal Lattice

-   **V0 (Deformation):** `f(x, y, t)` controls the positional displacement of each point in a grid, warping the lattice structure.
-   **V1 (Size Modulation):** `f(x, y, t)` modulates the size of the dot at each lattice point, visualizing the function as a scalar field.
-   **V2 (Rotational Field):** `f(x, y, t)` controls the rotation angle of short lines at each lattice point, visualizing the function as a 2D vector field.
-   **V3 (Limited Grid):** The same deformation as V0, but on a fixed-size grid for a more focused view.

### 8. Morphogenetic

-   **V0 (Symmetric):** `f(x, t)` controls the branching angle of a recursive L-system, creating symmetric, plant-like forms.
-   **V2 (Asymmetric):** `f(x, t)` controls the relative length of the two new sub-branches, creating "wind-swept" or unbalanced growth patterns.
-   **V3 (Biometric):** `f(x, t)` controls the thickness of new branches, simulating nutrient flow and creating more organic, vein-like structures.

### 9. Synaptic Growth

-   **V0 (Symmetric):** Similar to Morphogenetic, but branches that grow close to each other "fire" with light, revealing the network's proximity relationships.
-   **V1 (Asymmetric):** `f(x, t)` controls relative branch length, creating asymmetric structures with synaptic firing.
-   **V2 (Biometric):** `f(x, t)` controls relative branch thickness, creating vein-like structures with synaptic firing.

### 10. Phase Choreography

-   **V0 (Polar Orbits):** Particles orbit a central point. `f(θ, t)` controls their radial distance, directly plotting the function in polar coordinates.
-   **V1 (Lissajous Field):** A grid of Lissajous figures. `f(x, t)` modulates their vertical frequency, creating a field of complex harmonic relationships.
-   **V2 (Phase Portrait):** `f(x, t)` acts as a force field perturbing a damped harmonic oscillator. A cloud of particles traces the flow, revealing attractors and limit cycles.
-   **V3 (Coupled Oscillators):** A ring of oscillators, each influencing its neighbors. `f(i, t)` modulates the natural frequency of each oscillator, exploring emergent synchronization and chaos.

### 11. Graph Evolution

-   **V0 (Dynamic Topology):** `f(i, t)` controls the radial position of nodes. Edges are drawn based on proximity, creating a dynamically changing network.
-   **V1 (Force-Directed):** A physics simulation where nodes repel and edges attract. `f(x, t)` controls the ideal spring length of edges, sculpting the network's geometry.
-   **V2 (Preferential Attachment):** A growing network where new nodes prefer to connect to well-connected existing nodes. `f(x, t)` defines a spatial "attractiveness," guiding the network's growth into specific shapes.
-   **V3 (Small-World):** Simulates the "six degrees of separation" concept. `f(x, t)` controls the probability of "rewiring" local connections into random, long-distance shortcuts, mixing order and chaos.

### 12. Hyperbolic

-   **V0 (Poincaré Depth):** Visualizes points in the Poincaré disk model. `f(r, t)` controls the "height" of points in 3D before they are stereographically projected down to the 2D disk, creating a sense of depth.
-   **V1 (Poincaré Twist):** `f(r, t)` perturbs the angle of points arranged in a spiral, causing the arms to twist and swirl within the disk.
-   **V2 (Upper Half-Plane):** Switches to the upper half-plane model of hyperbolic space. `f(x, t)` creates waves on the plane, where the hyperbolic metric is visualized by objects shrinking as they move higher (further from the x-axis horizon).
-   **V3 (Warped Grid):** A polar grid is rendered in the Poincaré disk. `f(...)` directly warps the radial and angular lines, showing how the function bends the fabric of hyperbolic space.

### 13. Zeta Scattering / Resonant States

-   **V0 (Point Scattering):** Points are plotted at y-coordinates corresponding to the Riemann Zeta zeros. `f(y, t)` perturbs their x-position, "scattering" them off the critical line.
-   **V1 (Resonant String):** Visualizes a string where the Zeta zeros represent its natural resonant frequencies (harmonics). `f(y, t)` "plucks" the string, controlling the amplitude of the standing wave at each harmonic.
-   **V2 (Scattering Landscape):** `f(x, t)` defines a potential energy barrier. Particles with quantized energy levels corresponding to the Zeta zeros are fired at the barrier, showing reflection and transmission.
-   **V3 (Phase Shift Resonances):** A concept from quantum scattering theory. Each Zeta zero is an energy shell. `f(E, t)` controls the "phase shift" of a wave on that shell, creating pulsing interference patterns that reveal resonance strength.

### 14. Persistent Homology

-   **V0 (Classic Graph):** Samples points directly on the function's graph `(x, f(x))` and visualizes the "birth" and "death" of connections and loops as a proximity radius (filtration) changes over time.
-   **V1 (Density Cloud):** `f(x, t)` defines a 2D probability density. A cloud of points is sampled from this density, and the topology of the resulting point cloud is analyzed via filtration.
-   **V2 (Level Set Filtration):** Treats the function as a height map. Visualizes how its "islands" (superlevel sets) merge and form "lakes" (holes) as a water level (filtration value) rises and falls.
-   **V3 (Persistence Barcodes):** The canonical visualization from Topological Data Analysis (TDA). Analyzes a point cloud from the function and plots the "lifespan" of its topological features (connected components, loops) as a series of barcodes.

### 15. Chaotic Attractor

-   **V0 (Lorenz):** The classic "butterfly" attractor. `f(z, t)` subtly modulates the simulation's timestep, influencing the speed and evolution of the attractor's path.
-   **V1 (Rössler):** A simpler, looped attractor. `f(x, t)` directly perturbs one of the core parameters of the system, causing the attractor to warp and deform.
-   **V2 (De Jong):** A 2D discrete map that generates intricate, fractal-like patterns. `f(t)` modulates one of the map's parameters, causing the entire structure to shift and evolve.
