import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

// Guards the admin panel (/dashboard/*). Operators are never allowed in here,
// even via direct URL — they're bounced straight to their own /operator module.
export default function ProtectedRoute({ children }) {
  const { isAuthenticated, session, checking } = useAuth();
  if (checking) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (session?.role?.id === "role-operator") return <Navigate to="/operator" replace />;
  return children;
}
