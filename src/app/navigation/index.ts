import { NavigationTree } from "@/@types/navigation";
import { superAdminNavigation } from "./superAdmin";
import { branchNavigation } from "./branch";
import { employeeNavigation } from "./employee";
import { getCurrentRole, UserRole } from "./role";

export type { UserRole } from "./role";

export const getNavigation = (role: UserRole): NavigationTree[] => {
  switch (role) {
    case "branch":
      return branchNavigation;
    case "employee":
      return employeeNavigation;
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
