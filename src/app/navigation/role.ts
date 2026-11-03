export type UserRole =
  | "superAdmin"
  | "branch"
  | "employee"
  | "areaManager"
  | "branchManager";

const PANEL_ROLES: UserRole[] = [
  "branch",
  "employee",
  "areaManager",
  "branchManager",
];

// Normalize whatever is stored in localStorage to the exact UserRole strings
function normalizeRole(value: string | null): UserRole | null {
  if (!value) return null;

  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ""); // remove spaces, underscores, hyphens

  switch (normalized) {
    case "superadmin":
      return "superAdmin";
    case "branch":
      return "branch";
    case "employee":
      return "employee";
    case "areamanager":
      return "areaManager";
    case "branchmanager":
      return "branchManager";
    default:
      return null;
  }
}

/**
 * Returns one of the exact UserRole values.
 */
export function getCurrentRole(): UserRole {
  const stored = localStorage.getItem("role");
  const role = normalizeRole(stored);

  if (role && PANEL_ROLES.includes(role)) {
    return role;
  }

  // Fallback
  return "superAdmin";
}
