import { NavigationTree } from "@/@types/navigation";
import { superAdminNavigation } from "./superAdmin";
import { branchNavigation } from "./branch";
import { getEmployeeNavigation } from "./employee";
import { getCurrentRole, getCurrentEmployeeSubRole, UserRole } from "./role";

export type { UserRole } from "./role";

export const getNavigation = (role: UserRole): NavigationTree[] => {
  switch (role) {
    case "branch":
      return branchNavigation;
    case "employee":
      return getEmployeeNavigation(getCurrentEmployeeSubRole());
    default:
      return superAdminNavigation;
  }
};

/**
 * Backwards compatible export: existing code that does
 * `import { navigation } from "@/app/navigation"` keeps working.
 * NOTE: it is resolved once at load time, so reload the app after login
 * or call getNavigation(role) inside the component instead.
 */
export const navigation = getNavigation(getCurrentRole());