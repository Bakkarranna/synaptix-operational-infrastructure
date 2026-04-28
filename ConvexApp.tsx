import React from 'react';
import { useQuery } from "convex/react";
import { api } from "./convex/_generated/api";
import App from './App';

// This component lives inside ConvexProvider and safely calls useQuery.
// index.tsx renders this when VITE_CONVEX_URL is set.
const ConvexApp: React.FC = () => {
  const convexPostsRaw = useQuery(api.blog.getPosts);
  return <App convexPostsRaw={convexPostsRaw} />;
};

export default ConvexApp;
