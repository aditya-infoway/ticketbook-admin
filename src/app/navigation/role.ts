export type UserRole = "superAdmin" | "branch" | "employee";

/**
 * TODO: replace with your real auth source (auth context / token decode).
 * It only has to return one of: "superAdmin" | "branch" | "employee".
 */
export function getCurrentRole(): UserRole {
  const stored = localStorage.getItem("role");
  if (stored === "branch" || stored === "employee") return stored;
  return "superAdmin";
}
