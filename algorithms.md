# Synesthetica: Algorithm Chronicle

This document details the theoretical foundations and practical implementations of the various function representations within the Synesthetica application. It serves as a bridge between the conceptual mathematical ideas and the concrete rendering and sonification algorithms.

---

## 1. Topological Fiber Bundle Visualization

-   **Status:** Implemented (V0, V1 & V2)
-   **Concept:** Functions as cross-sections of fiber bundles over parameter manifolds, revealing global topological properties through local geometric structure.
-   **Implementation Notes:**
    -   **V0 (Point Cloud):** The most direct representation. The function's domain `x` is sampled, and for each sample, a point is drawn at `(x, f(x))`. This forms a 2D point cloud that directly maps to the Cartesian graph, serving as a familiar baseline.
    -   **V1 (Line Strip):** A minimalistic, abstract representation. It maps `f(x)` to a y-position and then uses a "twist" parameter to rotate that point around the central x-axis in 3D space. The result is a single, continuous line that visualizes the function's path through a 3D-projected space. It's computationally cheap and emphasizes the core path of the function.
    -   **V2 (Twisted Ribbon):** This version provides a more tangible surface. It renders a series of small, connected quadrilaterals. For each step along the x-axis, we calculate the center point `(x, y)` and then find points slightly "above" and "below" it along the rotational plane. These endpoints are connected to the corresponding points from the previous step, forming a segment of the ribbon. This method turns a simple line into a tangible, shaded surface that more directly visualizes the concept of a "section" of a fiber bundle. The continuity of the function is perceived as the unbroken connectedness of the ribbon.

## 2. Phase Space Marble Flow

-   **Status:** Implemented
-   **Concept:** Functions as gravitational potentials in 3D space, with particle trajectories revealing dynamical structure through physically intuitive marble-rolling simulation.
-   **Implementation Notes:**
    -   **Algorithm:** This mode implements a 2D physics simulation. The function curve `y = f(x)` is treated as a static, solid surface. A number of "marbles" are initialized with a random horizontal position and velocity.
    -   **Physics:** In each animation frame, a simplified physics step is calculated for each marble:
        1.  **Derivative:** The numerical derivative (slope) of the function is calculated at the marble's current `x` position.
        2.  **Gravity:** The force of gravity is simulated as a constant downward pull. The component of this force parallel to the curve's surface is calculated using the slope (`force = g * sin(atan(slope))`).
        3.  **Velocity:** This force is used to update the marble's horizontal velocity (`vx`).
        4.  **Damping:** The velocity is then reduced by a small damping factor to simulate friction and prevent infinite acceleration.
        5.  **Position:** The marble's `x` position is updated based on its new velocity. Its `y` position is constrained to always be on the function curve `f(x)`.
    -   **Insight:** This provides a powerful physical intuition for the function's properties. Marbles accelerate down steep slopes, slow down on inclines, and come to rest in local minima, making concepts like gradient, critical points, and stability immediately tangible.

## 3. Fluid Dynamics Function Fields

-   **Status:** Implemented (V0, V1, V2)
-   **Concept:** Functions as velocity fields driving fluid simulation, revealing vector field topology through particle system visualization.
-   **Implementation Notes:**
    -   **V0 (Vector Field):** This mode visualizes the function's gradient as a 2D vector field. A large number of particles are scattered randomly. The numerical derivative `f'(x)` (slope) is calculated at each particle's `x` position. This slope is used to deflect the particle's vertical velocity while it moves at a constant horizontal speed. This makes the function's gradient tangible as a "wind" affecting the particles.
    -   **V1 (Vortex Field):** This version treats the center of the screen as a vortex. The function `f(r, t)`, where `r` is the particle's distance from the center, controls the strength of the tangential and radial forces. This creates swirling, galactic patterns where the function defines the spiral arm structure and density.
    -   **V2 (Gravitational Field):** This version simulates a 1D gravitational field. A number of "gravity wells" are placed along the horizontal axis. The function `f(i, t)` controls the "mass" (attractive strength) of the i-th well. Particles are then simulated with their acceleration determined by the summed gravitational pull from all wells, creating a dynamic visualization of an n-body problem where the function modulates the forces.

## 4. Neural Network Synapse Firing Patterns

-   **Status:** Implemented (V0, V1, V2, V3)
-   **Concept:** Functions as synaptic weight patterns in artificial neural networks, with activation patterns creating dynamic "brain-like" visualizations.
-   **Implementation Notes:**
    -   **V0 (Layered):** A classic feed-forward neural network is constructed with layers and neurons in a rigid grid. Signals propagate from the input layer to the output layer. The user's function `f(x)` acts as an activation function, determining probabilistically whether a neuron fires based on its inputs.
    -   **V1 (Circular Topology):** Instead of horizontal layers, neurons are arranged in concentric rings. Signals propagate from the inner rings to the outer rings. This provides a different geometric interpretation of information flow, often creating mandala-like firing patterns.
    -   **V2 (Reactive Nodes):** This version builds on the layered topology of V0 but adds two key dynamic features. First, the initial positions of neurons are offset by a random amount controlled by the **Jitter** parameter (with an increased range for more irregularity), creating a more organic layout. Second, it adds a physical simulation: when a neuron fires, its physical position is displaced by a "recoil" force (with direction controlled by `f(x)`). A spring-like force then pulls the neuron back to its original position. This makes the entire network appear to jiggle and react physically to the flow of information. The signal propagation has been ensured to function correctly with the recoil effect.
    -   **V3 (Geometric Reactive):** This version combines geometric structure with reactive physics. Neurons are arranged in a single, closed polygon (e.g., triangle, pentagon, hexagon), with the number of vertices controlled by a **Nodes** parameter. Signals propagate not between layers, but to adjacent neighbors along the polygon's edges, creating wave-like pulses of energy. This mode also inherits the "Recoil Strength" and "Jitter" parameters from `v2`, causing the entire geometric shape to react physically to the flow of information.

## 5. Origami Folding Dynamics

-   **Status:** Implemented (V0, V1, V2)
-   **Concept:** Functions as crease pattern energy landscapes in origami, revealing fold sequences and mechanical constraints through interactive paper folding simulation.
-   **Implementation Notes:**
    -   **V0 (Linear Strip):** A 1D strip of "paper" is represented as a series of connected segments. The function `f(x, t)` determines the target fold angle for each crease, and the strip dynamically folds in 2D space.
    -   **V1 (Radial Fold):** This version creates a radial pattern of strips originating from the center, like a paper star or mandala. The function `f(x, t)` controls the folding of each arm of the star simultaneously, creating beautiful, symmetric kinetic sculptures.
    -   **V2 (Branched Fold):** This version uses a recursive branching system. A main strip has smaller strips branching off from it. The function controls the folding of the main strip and the branching angle of the sub-strips, creating complex, tree-like paper structures.

## 6. Crystal Lattice

-   **Status:** Implemented (V0, V1, V2, V3)
-   **Concept:** Functions as a field that influences the properties of a regular crystal lattice structure.
-   **Implementation Notes:**
    -   **V0 (Deformation):** The classic implementation. The function `f(x, y, t)` controls the positional displacement of each point in the grid, causing the lattice to warp and deform.
    -   **V1 (Size Modulation):** The function's output `f(x, y, t)` modulates the *size* of the dot drawn at each lattice point. This creates pulsing, breathing, and wave-like patterns of size within the stable crystal structure, visualizing the function as a scalar field.
    -   **V2 (Rotational Field):** The elements at each lattice point are rendered as short lines. The function's output `f(x, y, t)` controls the *rotation angle* of each line. This visualizes the function as a dynamic 2D vector field, creating swirling, vortex-like patterns and showing the curl of the function's gradient.
    -   **V3 (Limited Grid):** This version uses the same deformation logic as V0, but on a fixed-size 17x17 grid that does not scale with the viewport. This provides a more constrained and focused view, reminiscent of the original implementation.

## 7. Synaptic Growth

-   **Status:** Implemented (V0, V1, V2)
-   **Concept:** A hybrid generative mode that uses a recursive branching algorithm to create complex, organic structures. The "synaptic" feature is an interactive effect where branches "fire" with light when they grow in close proximity to each other.
-   **Implementation Notes:**
    -   **Algorithm:** This mode is built on a recursive L-system, similar to the "Morphogenetic" mode, ensuring the creation of complex forms.
        1.  **Recursive Growth:** A function `drawSynapticBranch(...)` is called repeatedly. In each call, it draws a line segment and then calls itself twice for the next level of branches.
        2.  **Function-Driven Angles:** The user's function `f(x, t)` controls the turning angle for the new sub-branches. The input `x` is the current recursion `depth`, allowing the function to create different structures at different scales.
        3.  **Synaptic Firing:** Before a new branch is drawn, its endpoint is calculated. This endpoint is then compared against a list of all previously drawn branch endpoints in the current frame. If the distance is less than the `synapseRadius`, the branch is drawn with a bright, "firing" color.
        4.  **Symmetry Control:** A parameter allows the user to apply symmetry transformations (X-Axis, Y-Axis, Origin), mirroring the entire generative process to create intricate, mandala-like patterns.
    -   **Algorithm Variations:**
        -   **V0 (Symmetric):** The base algorithm where sub-branches grow symmetrically.
        -   **V1 (Asymmetric Growth):** The function's output `f(x,t)` controls the *relative length* of the two new child branches. A positive `f(x)` might cause the left branch to grow longer while the right grows shorter, creating "wind-swept" effects.
        -   **V2 (Biometric Growth):** The function's output `f(x,t)` controls the *relative thickness* of the two new child branches, creating more vein-like, organic structures.
    -   **Insight:** This mode visualizes a function as a complex developmental program. The core recursive growth provides a canvas for observing emergent behavior. The synaptic firing reveals the intricate spatial relationships within the generated form, while the symmetry controls offer a powerful tool for artistic exploration of mathematical structure.

## 8. Quantum Harmonic / Geometric Phase Representation

-   **Status:** Partially Implemented (as Quantum Harmonic)
-   **Concept:** Functions as quantum state evolutions or wavefunctions, with interference patterns and geometric phases encoding functional properties.
-   **Implementation Notes:**
    -   The current "Quantum Harmonic" mode simplifies this concept into a visual interference pattern. It maps the function's output to the y-position of a series of particles, adding a secondary sine wave to create interference.
    -   **Future Work:** A more advanced implementation could involve mapping the function to parameters of a true quantum wavefunction, visualizing the probability density, and sonifying the resulting spectrum. Exploring the Berry connection and geometric phase would require a more complex state-tracking system.

## 9. Morphogenetic Field Dynamics

-   **Status:** Implemented (V0, V2, V3)
-   **Concept:** Functions as reaction-diffusion systems or developmental programs generating spatial patterns and organic forms.
-   **Implementation Notes:**
    -   The current implementations use a recursive L-system (Lindenmayer system) approach. A main "trunk" branches out, and each new branch's properties are determined by the function's value.
    -   **V0 (Symmetric Growth):** The function `f(x, t)` directly controls the branching angle symmetrically for the two new sub-branches. A positive value might cause both branches to spread wide, while a negative value causes them to narrow.
    -   **V2 (Asymmetric Growth):** The function controls the *relative length* of the two new sub-branches. The `asymmetry` parameter sets the maximum effect. For example, a positive `f(x)` value will cause the left branch to grow longer and the right branch to grow shorter, and vice-versa, creating leaning, wind-swept patterns.
    -   **V3 (Biometric):** The function `f(x, t)` controls the *thickness* and *color* of the branches. A higher function value might result in thicker, more vibrantly colored branches, simulating the flow of nutrients or genetic expression. This creates more organic, life-like visual textures.
    -   **Future Work:** A true reaction-diffusion system (like the Gray-Scott model) could be implemented on a 2D grid, with the function `f(x)` setting the initial conditions or modifying the reaction rates (`F` and `k` parameters), which would produce Turing patterns.

## 10. Harmonic Crystallization Sonification

-   **Status:** Partially Implemented (split between "Crystal Lattice" and sonification engine)
-   **Concept:** Functions as harmonic series with crystalline spatial arrangements, revealing frequency relationships through geometric symmetries.
-   **Implementation Notes:**
    -   The "Crystal Lattice" mode implements the visual aspect, deforming a regular grid based on the function's output. The sonification engine is separate but driven by the same function.
    -   **Future Work:** A dedicated "Harmonic Crystal" mode could more tightly integrate these. For a function `f(t)` decomposed into its Fourier series, each harmonic component `(amplitude, frequency, phase)` could be visualized as a point in 3D space, forming a crystal whose geometry directly represents the harmonic structure. The spatial position of each point could then drive a 3D audio source.

## 11. Riemann Zeta Function as Quantum Scattering

-   **Status:** Implemented & Enhanced
-   **Concept:** The zeros of ζ(s) as resonant scattering states in a quantum system, with the critical line as a potential barrier.
-   **Implementation Notes:**
    -   **Visualization:** We plot points symmetrically around a central vertical line, representing the "critical line" where `Re(s) = 1/2`. The y-positions of these points correspond to the known imaginary parts of the first few non-trivial zeros of the Riemann Zeta function. The function `f(x,t)` introduces a small perturbation in the x-direction, causing the points to "scatter" or deviate from the line.
    -   **Animation Enhancement:** To make the visualization more dynamic, the zeros now have a gentle vertical drift and a subtle pulsing size, both modulated by time. This gives the impression of a more active, energetic system, fitting the "quantum scattering" theme.
    -   **Insight:** This provides a visual intuition for the Riemann Hypothesis—that all non-trivial zeros lie on this single line. The user's function creates a "potential field" that deforms this perfect alignment.

## 12. Symplectic Foliation Dynamics

-   **Status:** Partially Implemented (as Phase Choreography)
-   **Concept:** Functions as generators of symplectic flows on phase space, revealing conserved quantities.
-   **Implementation Notes:**
    -   The "Phase Choreography" mode provides a simplified view of this concept, treating the function as a potential field that influences the radius of particles orbiting a central point. It visualizes level sets and orbits in a simplified polar coordinate system.
    -   **Future Work:** A more direct implementation would involve visualizing a vector field derived from the function (e.g., as a Hamiltonian) and tracking particle trajectories within that field to reveal KAM tori, chaotic regions, and other features of phase space.

## 13. Spectral Network Topology

-   **Status:** Implemented (as Graph Evolution)
-   **Concept:** Functions as adjacency operators on infinite graphs, with eigenvalue spectra determining network geometry.
-   **Implementation Notes:**
    -   The "Graph Evolution" mode discretizes this concept. A set of nodes are arranged in a circle, and the function `f(x)` is used to modulate their radius, creating dynamic positions.
    -   An adjacency matrix is then implicitly calculated based on the distance between these moving nodes. If the distance between two nodes is less than a threshold (controlled by the "Connectivity" parameter), an edge is drawn between them.
    -   This directly visualizes how a function's behavior can define a network's topology in real-time.

## 14. Persistent Homology Filtration

-   **Status:** Implemented
-   **Concept:** Functions as filtration parameters for simplicial complexes, revealing topological features that persist across scales.
-   **Implementation Notes:**
    -   **Algorithm:** This mode provides a visual proxy for a Vietoris-Rips filtration. First, a 1D point cloud is generated along the x-axis, with the y-coordinate determined by `f(x)`. A "filtration radius" is then animated, growing and shrinking over time around each point.
    -   **Visualization:** As the radii of two points intersect, an edge (a 1-simplex) is drawn between them. The opacity of the edge is proportional to the degree of overlap, a king connections appear gradually. This process visually reveals the "birth" of connected components (0-dimensional features) and cycles/loops (1-dimensional features) as the filtration value changes.
    -   **Insight:** This makes the abstract concept of topological persistence tangible. Users can see how clusters of points form and merge, and how transient "holes" in the data can appear and disappear, providing a powerful intuition for the shape of the function's graph.

## 15. Conformal Geometric Evolution

-   **Status:** Planned
-   **Concept:** Functions as conformal factors in metric evolution, revealing curvature flows.
-   **Implementation Notes:** This would likely require a 3D engine (WebGL/WebGPU). A base mesh (e.g., a sphere or plane) would be deformed where the function `f(x)` acts as a conformal factor `e^u` that scales the metric locally. The mesh could then be color-coded by its Gaussian curvature.

## 16. Quantum Error Correction Codes

-   **Status:** Planned
-   **Concept:** Functions as error syndromes in quantum codes.
-   **Implementation Notes:** This is a highly abstract concept to visualize. An approach could be to represent qubits as points on a Bloch sphere. A set of "stabilizer" functions would define a protected codespace. The user's function `f(x)` could act as an "error," and the visualization would show how the system attempts to measure the syndrome and apply a correction to return the logical qubit to the codespace.