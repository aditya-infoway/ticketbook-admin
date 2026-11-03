import { useEffect, useState } from "react";
import { Get } from "@/ApiHelper";
import { getCurrentRole } from "@/app/navigation/role";

// ----------------------------------------------------------------------
// Small shared store for the logged in user's name + profile photo
// (employee, area manager, branch manager). Used by the profile popover
// (avatar) so it shows the same photo as the General settings page, and
// refreshes when the photo is changed.
// ----------------------------------------------------------------------

interface ProfileSummary {
  token: string; // session this data belongs to
  employeeName: string;
  profilePhoto: string;
}

// role -> profile GET route
const PROFILE_API: Record<string, string> = {
  employee: "employee/profile",
  areaManager: "area-manager/profile",
  branchManager: "branch-manager/profile",
};

let cache: ProfileSummary | null = null;
let loading = false;
const listeners = new Set<() => void>();

const notify = () => listeners.forEach((listener) => listener());
const currentToken = () => window.localStorage.getItem("authToken") || "";

async function load() {
  if (loading) return;

  const url = PROFILE_API[getCurrentRole() as string];
  if (!url) return; // superAdmin / branch / unknown role: skip

  loading = true;
  try {
    const res = await Get(url, {}, false);
    if (res.data?.success) {
      const d = res.data.data;
      cache = {
        token: currentToken(),
        // employee -> employeeName, area/branch manager -> name
        employeeName: d?.employeeName ?? d?.name ?? "",
        profilePhoto: d?.profilePhoto || "",
      };
      notify();
    }
  } catch {
    // Keep the fallback icon and name if the API fails.
  } finally {
    loading = false;
  }
}

/**
 * Call this after the profile is saved (General settings page) so the
 * avatar in the sidebar updates right away.
 */
export const refreshEmployeeProfile = () => load();

/** `enabled` = true for employee, areaManager and branchManager roles. */
export function useEmployeeProfile(enabled: boolean) {
  const [, forceRender] = useState(0);

  useEffect(() => {
    if (!enabled) return;

    const listener = () => forceRender((n) => n + 1);
    listeners.add(listener);

    // load once per login session (cache is tied to the auth token)
    if (!cache || cache.token !== currentToken()) load();

    return () => {
      listeners.delete(listener);
    };
  }, [enabled]);

  return enabled && cache && cache.token === currentToken() ? cache : null;
}