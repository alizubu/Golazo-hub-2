'use client';

export default function GlobalError({ error, reset }) {
  return (
    <html lang="en">
      <body style={{ backgroundColor: '#06080F', color: '#fff', fontFamily: 'sans-serif', margin: 0 }}>
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ backgroundColor: '#18181b', padding: '2rem', borderRadius: '12px', border: '1px solid #27272a', maxWidth: '500px', width: '100%', textAlign: 'center' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Critical System Error</h2>
            <p style={{ color: '#a1a1aa', marginBottom: '1.5rem' }}>A fatal error occurred that prevents the page from rendering entirely.</p>
            
            <div style={{ backgroundColor: '#000', padding: '1rem', borderRadius: '8px', border: '1px solid #3f3f46', textAlign: 'left', marginBottom: '1.5rem', overflowX: 'auto' }}>
              <p style={{ color: '#f87171', fontFamily: 'monospace', fontSize: '0.875rem' }}>{error.message}</p>
            </div>

            <button 
              onClick={() => reset()}
              style={{ backgroundColor: '#fbbf24', color: '#000', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '9999px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              Try to recover
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
