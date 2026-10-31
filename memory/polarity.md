
## Approach hero boids v2 spacing variation
Per-bird personal space (pm0 0.55-1.75x, skewed tight) * slow personal drift * travelling 2-sine density wave -> pair separation radius=(sri[i]+sri[j])/2; hard-core push <3.2px; slot jitter +-16% radius, +-0.45rad. Measured (swiftshader): NN CV 0.4-0.8 over time, largest cluster ~100%, 40px-cell density std varies 13-40 across frames. Debug: window.__flockPos(), __flockMs.
