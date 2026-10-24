import { NavigationTree } from "@/@types/navigation";
import * as superAdmin from "./superAdmin/baseNavigation";
import * as branch from "./branch/baseNavigation";
import * as employee from "./employee/baseNavigation";
import { getCurrentRole, UserRole } from "./role";

export const getBaseNavigationObj = (
  role: UserRole,
): Record<string, NavigationTree> => {
  switch (role) {
    case "branch":
      return branch.baseNavigationObj;
    case "employee":
      return employee.baseNavigationObj;
    default:
      return superAdmin.baseNavigationObj;
  }
};

export const getBaseNavigation = (role: UserRole): NavigationTree[] =>
  Array.from(Object.values(getBaseNavigationObj(role)));

/**
 * Backwards compatible exports (resolved once at load time, see index.ts).
 */
export const baseNavigationObj = getBaseNavigationObj(getCurrentRole());
export const baseNavigation = getBaseNavigation(getCurrentRole());
