import { NavigationTree } from "@/@types/navigation";
import * as superAdmin from "./superAdmin/baseNavigation";
import * as branch from "./branch/baseNavigation";
import * as employee from "./employee/baseNavigation";
import * as areaManager from "./areaManager/baseNavigation";
import * as branchManager from "./branchManager/baseNavigationObj";
import { getCurrentRole, UserRole } from "./role";

export const getBaseNavigationObj = (
  role: UserRole,
): Record<string, NavigationTree> => {
  switch (role) {
    case "branch":
      return branch.baseNavigationObj;
    case "employee":
      return employee.baseNavigationObj;
    case "areaManager":
      return areaManager.baseNavigationObj;
    case "branchManager":
      return branchManager.baseNavigationObj;
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