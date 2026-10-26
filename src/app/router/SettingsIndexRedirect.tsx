// Import Dependencies
import { Navigate } from "react-router";

// ----------------------------------------------------------------------

/** /settings -> General (every role can open it). */
export default function SettingsIndexRedirect() {
  return <Navigate to="/settings/general" replace />;
}