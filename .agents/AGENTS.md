<!-- BEGIN:golazo-hub-rules -->
# Next.js & React Best Practices

1. **Client-Side Libraries**: Always dynamically import libraries that access the browser DOM or global `window`/`document` objects (e.g., `html-to-image`, `downloadjs`, charting libraries). Use Next.js `next/dynamic` or dynamic `await import()` inside client-side event handlers to avoid crashing Server-Side Rendering (SSR).
2. **Component Declarations**: NEVER declare nested React components (e.g., defining a functional component inside the body of another functional component). Always extract inner components to the top level or a separate file to prevent React from unnecessarily re-mounting them on every render ("Cannot create components during render" error).
<!-- END:golazo-hub-rules -->
