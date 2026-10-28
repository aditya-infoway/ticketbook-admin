import { NavigationTree } from "@/@types/navigation";
import { settings } from "./settings";
import { UserRole } from "./role";

const SETTINGS_PREFIX: Record<UserRole, string> = {
  superAdmin: "/settings",
  branch: "/branch/settings",
  employee: "/employee/settings",
};

const SETTINGS_ACCESS: Record<UserRole, string[] | "all"> = {
  superAdmin: "all",
  branch: ["general", "appearance"],
  employee: ["general", "appearance"],
};

const rewritePath = (path: string | undefined, prefix: string) =>
  path ? path.replace(/^\/settings/, prefix) : path;

export const getSettings = (role: UserRole): NavigationTree => {
  const prefix = SETTINGS_PREFIX[role];
  const allowed = SETTINGS_ACCESS[role];

  const childs = (settings.childs ?? [])
    .filter((child) => {
      if (allowed === "all") return true;
      const last = child.path?.split("/").filter(Boolean).pop();
      return !!last && allowed.includes(last);
    })
    .map((child) => ({ ...child, path: rewritePath(child.path, prefix) }));

  // root path bhi rewrite hona chahiye, taaki isRouteActive(/employee/settings/general) match kare
return { ...settings, path: rewritePath(settings.path, prefix), childs } as NavigationTree;
};