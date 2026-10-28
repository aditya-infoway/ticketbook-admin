import { useEffect, useState } from "react";
import { Get } from "@/ApiHelper";

// ----------------------------------------------------------------------
// Shared store for the logged-in EMPLOYEE / BRANCH name + profile photo.
// Used by the profile popover (avatar) so it shows the same profile data
// as the General settings page.
//
// Employee login  -> /employee/profile
// Branch login    -> /branch/profile
// ----------------------------------------------------------------------

interface UserProfileSummary {
  token: string;
  userType: string;
  userName: string;
  profilePhoto: string;
}

let cache: UserProfileSummary | null = null;
let loading = false;

const listeners = new Set<() => void>();

const notify = () => {
  listeners.forEach((listener) => listener());
};

const currentToken = () =>
  window.localStorage.getItem("authToken") || "";

const currentUserType = () =>
  window.localStorage.getItem("userType") || "";

const getProfileEndpoint = (userType: string) => {
  switch (userType) {
    case "Employee":
      return "employee/profile";

    case "Branch":
      return "branch/profile";

    default:
      return "";
  }
};

async function load() {
  if (loading) return;

  const userType = currentUserType();
  const endpoint = getProfileEndpoint(userType);

  // No profile API for unsupported user types
  if (!endpoint) {
    cache = null;
    notify();
    return;
  }

  loading = true;

  try {
    const res = await Get(endpoint, {}, false);

    if (res.data?.success) {
      const profileData = res.data?.data || {};

      cache = {
        token: currentToken(),
        userType,

        userName:
          profileData.employeeName ||
          profileData.branchName ||
          profileData.name ||
          "",

        profilePhoto:
          profileData.profilePhoto ||
          profileData.branchLogo ||
          profileData.profileImage ||
          "",
      };

      notify();
    }
  } catch (error) {
    // Keep fallback icon / name
  } finally {
    loading = false;
  }
}

/**
 * Call this after the profile is saved so the avatar/name
 * updates immediately.
 */
export const refreshEmployeeProfile = () => {
  // Clear current cache so the latest profile is fetched
  cache = null;
  return load();
};

/**
 * enabled = true only when Employee or Branch profile
 * should be displayed.
 */
export function useEmployeeProfile(enabled: boolean) {
  const [, forceRender] = useState(0);

  useEffect(() => {
    if (!enabled) return;

    const listener = () => {
      forceRender((n) => n + 1);
    };

    listeners.add(listener);

    const token = currentToken();
    const userType = currentUserType();

    // Load profile when:
    // 1. No cache exists
    // 2. Token changed
    // 3. User type changed
    if (
      !cache ||
      cache.token !== token ||
      cache.userType !== userType
    ) {
      load();
    }

    return () => {
      listeners.delete(listener);
    };
  }, [enabled]);

  if (
    !enabled ||
    !cache ||
    cache.token !== currentToken() ||
    cache.userType !== currentUserType()
  ) {
    return null;
  }

  return {
    ...cache,

    // Keep old property name so existing UI doesn't break
    employeeName: cache.userName,
  };
}