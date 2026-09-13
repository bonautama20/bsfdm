import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

// Guards the Operator module (/operator/*). Any authenticated user may view it
// (e.g. an admin checking the field experience), but logged-out users are bounced to login.
export default function OperatorRoute({ children }) {
  const { isAuthenticated, checking } = useAuth();
  if (checking) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}
