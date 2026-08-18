# Performance Notes — Premium Clarity 3.0

The glass effect is intentionally concentrated in navigation, the proof explorer, the photo frame and a few focused panels. Content cards use mostly opaque surfaces to reduce blur cost and keep text clear.

The live website refresh is progressive: the page includes a real static fallback first, then quietly asks the same website for the newest Insights item. There is no `Checking…` state and the page never waits for that request before becoming useful.

The shared JavaScript is small and dependency-free. Core content, navigation, evidence links and CTAs work without JavaScript.
