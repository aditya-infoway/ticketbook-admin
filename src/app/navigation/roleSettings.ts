import { NavigationTree } from "@/@types/navigation";
import { settings } from "./settings";
import { UserRole } from "./role";

/**
 * Which Settings pages each role can see in the sidebar (matched by path).
 * "all" = no filtering.
 *
 * Keep this in sync with the RoleGuard blocks of the settings routes in
 * router/protected.tsx (the sidebar only hides links, the guard blocks URLs).
 */
export const SETTINGS_ACCESS: Record<UserRole, string[] | "all"> = {
  superAdmin: "all",
  branch: ["/settings/general", "/settings/appearance"],
  employee: ["/settings/general", "/settings/appearance"],
};

export const getSettings = (role: UserRole): NavigationTree => {
  const allowed = SETTINGS_ACCESS[role];
  if (allowed === "all") return settings;

  return {
    ...settings,
    childs: settings.childs?.filter(
      (child) => !!child.path && allowed.includes(child.path),
    ),
  };
};