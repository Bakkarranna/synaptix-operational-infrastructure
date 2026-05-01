
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import ConvexApp from './ConvexApp';
import { ConvexProvider, ConvexReactClient } from "convex/react";

const convexUrl = import.meta.env.VITE_CONVEX_URL as string | undefined;

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);

if (!convexUrl) {
  // Missing Convex URL - rendering clear error instead of a white screen crash
  root.render(
    <React.StrictMode>
      <div style={{ padding: '2rem', fontFamily: 'monospace', background: '#0a0a0a', color: '#ff5630', minHeight: '100vh' }}>
        <h1 style={{ color: '#fff', marginBottom: '1rem' }}>Configuration Error</h1>
        <p style={{ fontSize: '16px', lineHeight: '1.5', color: '#e0e0e0' }}>
          <strong>VITE_CONVEX_URL</strong> is not defined in your environment variables.
        </p>
        <p style={{ fontSize: '14px', marginTop: '1rem', color: '#a0a0a0' }}>
          If you are running locally, make sure you have a <code>.env.local</code> file with this variable.<br/>
          If you are hosted on Vercel, add <code>VITE_CONVEX_URL</code> to your Project Settings &gt; Environment Variables.
        </p>
      </div>
    </React.StrictMode>
  );
} else {
  // Full Convex mode
  const convex = new ConvexReactClient(convexUrl);
  root.render(
    <React.StrictMode>
      <ConvexProvider client={convex}>
        <ConvexApp />
      </ConvexProvider>
    </React.StrictMode>
  );
}
