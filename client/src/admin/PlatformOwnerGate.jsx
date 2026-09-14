import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

// Guards the platform-owner-only stats page (/dashboard/platform) — bounces
// any other organization straight back to their own dashboard, same as
// ProtectedRoute does for operators on /dashboard/*. The server enforces the
// same rule independently (requirePlatformOwner in middleware/auth.js) —
// this is a UX nicety, not the security boundary.
export default function PlatformOwnerGate({ children }) {
  const { session } = useAuth();
  if (!session?.organization?.isPlatformOwner) return <Navigate to="/dashboard" replace />;
  return children;
}
