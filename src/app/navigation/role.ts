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
/** Employee ke andar ke sub-roles */
export type EmployeeSubRole =
  | "branch_manager"
  | "area_manager"
  | "contractor";

// "Branch Manager" -> "branch_manager"
const normalize = (v: unknown) =>
  String(v ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_");

export function getCurrentEmployeeSubRole(): EmployeeSubRole | null {
  let raw: unknown = localStorage.getItem("employeeRole"); // testing override
  if (!raw) {
    try {
      raw = JSON.parse(localStorage.getItem("user") || "{}").roleName;
    } catch {
      raw = null;
    }
  }

  const value = normalize(raw);
  if (
    value === "branch_manager" ||
    value === "area_manager" ||
    value === "contractor"
  ) {
    return value;
  }
  return null;
}