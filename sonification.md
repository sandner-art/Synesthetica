# Synesthetica: Sonification Engine Chronicle

This document details the various audio generation strategies, or "sonification engines," available within the Synesthetica application. Each engine offers a different way to translate the properties of a mathematical function into sound, providing a unique auditory perspective on its behavior.

---

## Sonification Philosophy

The goal of sonification in Synesthetica is not merely to create sound, but to generate an auditory experience that is deeply coupled with the visual representation and the underlying mathematical structure. A good sonification engine should make function properties like slope, complexity, and periodicity intuitively audible. By offering multiple engines, users can choose the auditory mapping that provides the most insight for a given function or visualization mode.

---

## Standard Engines

### 1. FM Synthesis (Frequency Modulation)

-   **Status:** Implemented
-   **Concept:** A true FM synthesis architecture where the function's output controls the timbre and harmonic complexity of the sound, rather than just its pitch. This allows for rich, evolving, and often non-linear sounds.
-   **Algorithm:**
    1.  Two oscillators are created: a "carrier" (audible) and a "modulator" (inaudible).
    2.  The modulator's output is used to modulate the frequency of the carrier.
    3.  The function `f(x, t)` is used to alter the *frequency* of the modulator oscillator.
    4.  The "Harmonicity" parameter sets the base frequency ratio between the modulator and carrier, defining the core timbre (e.g., harmonic vs. metallic).
    5.  The "FM Depth" parameter controls the *amount* of modulation, affecting the brightness and complexity of the resulting sound.
-   **Auditory Insight:** This engine excels at translating function behavior into timbral change. Smooth functions can produce pure tones or gentle shifts in character, while complex or chaotic functions can generate harsh, dissonant, or bell-like textures. It reveals the function's texture rather than just its value.

### 2. Waveform Synth (Classic Synthesis)

-   **Status:** Implemented
-   **Concept:** The most direct translation of a function's value to pitch, using classic synthesizer waveforms. This engine provides a clear, intuitive, and immediate auditory representation of the function's graph.
-   **Algorithm:**
    1.  A single, primary oscillator is created.
    2.  The user can select the oscillator's waveform: Sine, Square, Triangle, or Sawtooth. Each has a distinct timbral character.
    3.  In each audio frame, the function's value `y = f(x, t)` is calculated.
    4.  This value `y` is mapped directly to a frequency range. A higher value of `y` results in a higher pitch.
    5.  The "Mod Depth" parameter controls how sensitive the pitch is to changes in the function's value.
-   **Auditory Insight:** This engine provides a clear, moment-to-moment representation of the function's magnitude. It's excellent for "tracing" the shape of a function with your ears. Oscillatory functions produce a characteristic vibrato or siren-like sound. The different waveforms allow you to change the "voice" of the function.

### 3. Harmonic Grains (Additive Synthesis)

-   **Status:** Implemented
-   **Concept:** Translates the complexity and shape of the function into the timbre (or harmonic content) of the sound. This is based on the principle of additive synthesis, where complex sounds are built by combining simple sine waves.
-   **Algorithm:**
    1.  A bank of several sine wave oscillators is created. Each oscillator is tuned to a harmonic of a base frequency (e.g., `f`, `2f`, `3f`, `4f`, ...).
    2.  Each oscillator is connected to its own gain node, allowing its individual volume to be controlled.
    3.  To determine the volume of each harmonic, the function's domain is sampled at multiple points. For example, the 1st harmonic's volume might be determined by `f(-1, t)`, the 2nd by `f(-0.5, t)`, the 3rd by `f(0, t)`, and so on.
    4.  The absolute value of the function at each sample point is mapped to the gain of the corresponding harmonic's oscillator.
-   **Auditory Insight:** This engine sonifies the function's overall shape as a tonal texture. Simple functions like a sine wave will primarily activate only a few harmonics, producing a pure, simple tone. A complex, noisy, or jagged function will activate many harmonics at once, producing a bright, rich, and complex timbre. It allows you to "hear" the complexity or "roughness" of a function.

### 4. Rhythmic Pulses (Event-Based)

-   **Status:** Implemented
-   **Concept:** Translates the function's properties into discrete rhythmic events rather than a continuous tone. It maps the function's value to pitch and its *derivative* (slope) to the rate of events.
-   **Algorithm:**
    1.  This engine does not use a continuous oscillator. Instead, it creates short-lived "pulse" oscillators on demand.
    2.  In each audio frame, the function's value `y = f(x, t)` and its numerical derivative `y' = f'(x, t)` are calculated.
    3.  The derivative `|y'|` is mapped to a pulse rate (events per second). A steeper slope results in a faster rhythm.
    4.  The function's value `y` is mapped to a frequency, which will be the pitch of the pulse.
    5.  A timing mechanism checks if enough time has passed since the last pulse (based on the calculated pulse rate). If so, it triggers a new pulse:
        -   A new oscillator is created at the calculated pitch.
        -   It is passed through a gain node with a very fast attack and a short, user-controllable decay, creating a "pluck" or "tick" sound.
        -   The oscillator is scheduled to stop after its sound has decayed.
-   **Auditory Insight:** This engine provides a powerful intuition for the function's rate of change. Flat sections of the function become silent or produce very slow, sparse clicks. Regions with a steep slope, where the function is changing rapidly, are heard as high-speed, rapid-fire bursts of notes. It effectively turns the function's derivative into a perceptible rhythm.

---

## Experimental Engines

### 5. Stochastic Grains (Probabilistic Events)

-   **Status:** Implemented
-   **Concept:** Creates a textural soundscape by generating a cloud of tiny, discrete audio events ("grains"). The function controls the probability and properties of these events, mapping mathematical behavior to controlled randomness.
-   **Algorithm:**
    1.  In each audio frame, the function's value `f(x,t)` and derivative `f'(x,t)` are calculated.
    2.  The absolute value of `f(x,t)` is mapped to a probability value. This probability is checked against a random number to determine if a new grain should be created in the current frame.
    3.  If a grain is created, its pitch is determined by `f(x,t)` and its pitch variance (random deviation) is controlled by the derivative `f'(x,t)`.
    4.  Each grain is a short sine wave with a very fast attack and short decay, creating a "pop" or "click."
-   **Auditory Insight:** This engine excels at sonifying the texture and volatility of a function. Smooth, low-value functions produce a sparse, gentle "rain," while high-value, complex functions produce a dense, crackling storm of sound. The derivative's control over pitch variance means that stable regions sound tonal and calm, while rapidly changing regions sound chaotic and noisy.

### 6. Resonant Body (Spatial Acoustics)

-   **Status:** Implemented
-   **Concept:** Treats the function as the definition of a virtual acoustic space. Sound is processed using convolution with a dynamically changing impulse response (IR). This engine uses a hybrid model, combining a continuous atmospheric sound source with discrete, function-driven pulses to reveal both the overall character and fine-grained structure of the equation.
-   **Algorithm:**
    1.  The core is a `ConvolverNode`, which applies the acoustic properties of an IR to any sound that passes through it.
    2.  **Continuous Excitation:** A continuous sound source provides the base "atmosphere." The user can select between White, Pink, or Brown noise, or load their own audio sample (`.wav`, `.mp3`, `.ogg`). This source is constantly playing through the convolver.
    3.  **Discrete Excitation:** A separate pulse generator creates sharp, rhythmic clicks. The **rate** of these pulses is controlled by the function's derivative `f'(x,t)` (steeper slope = faster pulses). The **loudness** of each pulse is controlled by the function's value `f(x,t)`.
    4.  **Hybrid Model:** An "Excitation Mix" parameter allows the user to blend between the continuous atmosphere and the discrete pulses, offering a wide range of sonic possibilities.
    5.  **Dynamic Space:** The function `f(x,t)` is used to programmatically generate and morph the IR in real-time, controlling properties like the decay time of the reverberation.
-   **Auditory Insight:** This engine provides a deeply physical sense of the function. The continuous sound reveals the overall "size" and "material" of the space defined by the function's magnitude. The discrete pulses highlight moments of rapid change (high derivative), creating a dynamic, responsive soundscape that makes both the function's value and its slope clearly audible.

### 7. Fluid Dynamics (Filtered Noise)

-   **Status:** Implemented
-   **Concept:** Simulates a turbulent, fluid-like soundscape using a filtered noise source. This engine is designed to create cinematic, atmospheric, and textural sounds rather than distinct pitches.
-   **Algorithm:**
    1.  A continuous source of brown noise is generated. Brown noise has a deep, rumbling character, similar to a strong wind or rushing water.
    2.  This noise is passed through a resonant Band-pass Filter. This filter only allows a specific range of frequencies to pass through, creating a "formant" or a sense of a resonant peak in the sound.
    3.  The function's value `f(x, t)` controls the **center frequency** of this filter. As `f(x)` changes, the resonant peak of the fluid sound shifts, simulating changes in pressure or the size of a cavity.
    4.  The function's derivative `f'(x, t)` controls the **Q factor (resonance)** of the filter. A high Q factor creates a very sharp, narrow, whistling resonance. A low Q factor is more muffled. This maps the mathematical "sharpness" of the function to the auditory "turbulence" of the fluid.
-   **Auditory Insight:** This engine provides a highly textural and atmospheric interpretation of the function. Smooth, flat regions of the function create a low, muffled rumble. Steep, rapidly changing regions create high-pitched, resonant, whistling sounds characteristic of high-speed turbulence. It allows the user to hear the function's volatility as a physical, fluid force.

### 8. Acoustic Sculpture (Hybrid Tonal/Spatial)

-   **Status:** Implemented
-   **Concept:** A sophisticated hybrid engine that combines the tonal richness of additive synthesis with the spatial depth of convolution reverb. It sonifies a function by using it to simultaneously define the *timbre* of a sound and the *acoustic space* that sound inhabits.
-   **Algorithm:**
    1.  **Sound Source (Additive Synthesis):** A bank of harmonic oscillators (like the "Harmonic Grains" engine) generates the core sound. The function's value `f(x)` sampled at different points determines the amplitude of each harmonic, creating a rich, evolving, and fundamentally tonal sound source.
    2.  **Sound Space (Convolution Reverb):** This tonal source is then fed through a `ConvolverNode`. The impulse response (IR) for the convolver is generated programmatically in real-time.
    3.  **Multi-dimensional Mapping:** The function's properties are mapped to the IR's acoustic characteristics:
        -   `f(x)` (value) -> Reverb decay time (room size).
        -   `f'(x)` (derivative) -> High-frequency damping (wall material, from reflective to absorptive).
        -   `f(x + c)` (offset value) -> Stereo spread of the reverb.
    4.  **Wet/Dry Mix:** A final parameter allows blending between the raw "source" sound and the reverberated "space" sound.
-   **Auditory Insight:** This is one of the most powerful engines for creating scientifically and artistically valid sonifications. It maps the function's value to timbre (a clear, tonal representation) and its complexity/slope to the characteristics of the acoustic space. A simple sine wave might sound like a pure organ tone in a large hall, while a chaotic function might sound like a dissonant, noisy chord in a small, heavily-damped room. It allows the user to perceive multiple facets of the function's geometry simultaneously.