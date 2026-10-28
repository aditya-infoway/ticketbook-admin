
import { useEffect, useState } from "react";
import { Get } from "@/ApiHelper";

// ----------------------------------------------------------------------
// Small shared store for the logged in EMPLOYEE's name + profile photo.
// Used by the profile popover (avatar) so it shows the same photo as the
// General settings page, and refreshes when the photo is changed.
// ----------------------------------------------------------------------

interface EmployeeProfileSummary {
  token: string; // session this data belongs to
  employeeName: string;
  profilePhoto: string;
}

let cache: EmployeeProfileSummary | null = null;
let loading = false;
const listeners = new Set<() => void>();

const notify = () => listeners.forEach((listener) => listener());
const currentToken = () => window.localStorage.getItem("authToken") || "";

async function load() {
  if (loading) return;
  loading = true;
  try {
    // TODO: confirm the GET route of getMyProfile (mounted on /employee)
    const res = await Get("employee/profile", {}, false);
    if (res.data?.success) {
      cache = {
        token: currentToken(),
        employeeName: res.data.data?.employeeName || "",
        profilePhoto: res.data.data?.profilePhoto || "",
      };
      notify();
    }
  } catch (error) {
    // keep the fallback icon / name
  } finally {
    loading = false;
  }
}

/**
 * Call this after the profile is saved (General settings page) so the
 * avatar in the sidebar updates right away.
 */
export const refreshEmployeeProfile = () => load();

/** `enabled` = only the employee role needs it (super admin has no employee profile). */
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