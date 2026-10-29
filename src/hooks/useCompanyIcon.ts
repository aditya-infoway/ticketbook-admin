import { useEffect, useState } from "react";
import { Get } from "@/ApiHelper";
import { APP_LOGO } from "@/constants/app";
import { useAuthContext } from "@/app/contexts/auth/context";
import { getCurrentRole } from "@/app/navigation/role";
import { useEmployeeProfile } from "@/hooks/Useemployeeprofile";
import { useBranchProfile } from "@/hooks/useBranchProfile";

let cachedIcon: string | null = null; // null = not fetched yet
const listeners = new Set<(icon: string) => void>();

export async function refreshCompanyIcon() {
  try {
    const companyDetailsId = localStorage.getItem("companyDetailsId");
    if (!companyDetailsId) return;

    const res = await Get(
      "superadmin/company-details",
      { companyDetailsId },
      false,
    );
    if (res.data?.success) {
      cachedIcon = res.data.data?.icon || "";
      try {
        localStorage.setItem("companyLogo", res.data.data?.logo || "");
      } catch {
        // Ignore localStorage write failures when storage is unavailable.
      }
      listeners.forEach((fn) => fn(cachedIcon as string));
    }
  } catch (e) {
    console.error("Failed to load company icon:", e);
  }
}

export function useCompanyIcon() {
  const { user } = useAuthContext();
  const sessionUser = user as any;

  const role = getCurrentRole();
  const isSuperAdmin = role === "superAdmin";
  const isBranch = role === "branch";
  const isEmployee = !isSuperAdmin && !isBranch;

  // Employee / Branch ki apni photo (dono store alag hain)
  const employeeProfile = useEmployeeProfile(isEmployee);
  const branchProfile = useBranchProfile(isBranch);

  const [icon, setIcon] = useState<string>(cachedIcon ?? "");

  useEffect(() => {
    // company-details API sirf super admin token ke liye hai
    if (!isSuperAdmin) return;

    listeners.add(setIcon);
    if (cachedIcon === null) refreshCompanyIcon();
    return () => {
      listeners.delete(setIcon);
    };
  }, [isSuperAdmin]);

  // Employee / Branch: apni photo -> company icon / logo (login response) -> default
  if (isBranch || isEmployee) {
    const ownPhoto = isBranch
      ? branchProfile?.profilePhoto
      : employeeProfile?.profilePhoto;

    return (
      ownPhoto ||
      sessionUser?.companyIcon ||
      sessionUser?.companyLogo ||
      APP_LOGO
    );
  }

  // Super admin: company icon, na ho to default logo
  return icon || APP_LOGO;
}