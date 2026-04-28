
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ConvexProvider, ConvexReactClient } from "convex/react";

const convexUrl = import.meta.env.VITE_CONVEX_URL as string | undefined;

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);

if (convexUrl) {
  const convex = new ConvexReactClient(convexUrl);
  root.render(
    <React.StrictMode>
      <ConvexProvider client={convex}>
        <App />
      </ConvexProvider>
    </React.StrictMode>
  );
} else {
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
