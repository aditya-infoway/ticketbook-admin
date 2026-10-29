import { useEffect, useState } from "react";
import { Get } from "@/ApiHelper";

// ----------------------------------------------------------------------
// Small shared store for the logged in BRANCH's name + profile photo.
// Used by the profile popover (avatar) so it shows the same photo as the
// General settings page, and refreshes when the photo is changed.
// ----------------------------------------------------------------------

interface BranchProfileSummary {
  token: string; // session this data belongs to
  branchName: string;
  profilePhoto: string;
}

let cache: BranchProfileSummary | null = null;
let loading = false;
const listeners = new Set<() => void>();

const notify = () => listeners.forEach((listener) => listener());
const currentToken = () => window.localStorage.getItem("authToken") || "";

async function load() {
  if (loading) return;

  loading = true;

  try {
    // GET /branch/profile (getMyBranchProfile)
    const res = await Get("branch/profile", {}, false);

    if (res.data?.success) {
      cache = {
        token: currentToken(),
        branchName: res.data.data?.branchName || "",
        profilePhoto: res.data.data?.profilePhoto || "",
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
export const refreshBranchProfile = () => load();

/** `enabled` = only the branch role needs it. */
export function useBranchProfile(enabled: boolean) {
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