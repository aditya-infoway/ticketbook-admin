import { NavigationTree } from "@/@types/navigation";
import { contractorNavigation } from "./contractor";
import { EmployeeSubRole } from "../role";

// Record<EmployeeSubRole, ...> hone se: role.ts me naya sub-role add karoge aur yaha
// uska navigation bhoologe to TypeScript error dikha dega.
const navigationBySubRole: Record<EmployeeSubRole, NavigationTree[]> = {
  contractor: contractorNavigation,
};

export const getEmployeeNavigation = (
  subRole: EmployeeSubRole | null,
): NavigationTree[] => (subRole ? (navigationBySubRole[subRole] ?? []) : []);