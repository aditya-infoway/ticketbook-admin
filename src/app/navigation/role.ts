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

// AuthProvider.completeAuth() ye value localStorage "role" me rakhta hai
export function getCurrentRole(): UserRole {
  const stored = localStorage.getItem("role");
  if (PANEL_ROLES.includes(stored as UserRole)) return stored as UserRole;
  return "superAdmin";
}

/**
 * Employee ke andar ke sub-roles (sirf "employee" login ke liye).
 * Area Manager / Branch Manager ab alag login hain, isliye yaha nahi hain.
 * NAYA SUB-ROLE AAYE TO: yaha ek naam add karo, phir
 *   1) navigation/employee/index.ts me uska navigation
 *   2) router/routes/employeeSubRoles.tsx me uske routes
 */
export const EMPLOYEE_SUB_ROLES = ["contractor"] as const;
export type EmployeeSubRole = (typeof EMPLOYEE_SUB_ROLES)[number];

// "Site Contractor" -> "site_contractor"
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
  // exact match pehle, phir "naam me role ka word ho" (jaise "site_contractor")
  const exact = EMPLOYEE_SUB_ROLES.find((r) => r === value);
  if (exact) return exact;
  return EMPLOYEE_SUB_ROLES.find((r) => value.includes(r)) ?? null;
}