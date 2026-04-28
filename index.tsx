
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

if (convexUrl) {
  // Full Convex mode — all hooks (useQuery, useConvex, useMutation) work normally
  const convex = new ConvexReactClient(convexUrl);
  root.render(
    <React.StrictMode>
      <ConvexProvider client={convex}>
        <ConvexApp />
      </ConvexProvider>
    </React.StrictMode>
  );
} else {
  // No Convex URL configured — render with static data only, no Convex hooks
  root.render(
    <React.StrictMode>
      <App convexPostsRaw={undefined} />
    </React.StrictMode>
  );
}
