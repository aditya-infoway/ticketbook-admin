import { useEffect, useState } from "react";
import clsx from "clsx";

import { APP_LOGO } from "@/constants/app";
import { Get } from "@/ApiHelper";
import { useAuthContext } from "@/app/contexts/auth/context";
import { getCurrentRole } from "@/app/navigation/role";
import { useEmployeeProfile } from "@/hooks/Useemployeeprofile";
import { useBranchProfile } from "@/hooks/useBranchProfile";

interface BrandLogoProps {
  /** photo ka size, jaise "size-10" (header) ya "size-8" (sidebar) */
  photoClassName?: string;
  /** company / TicketBook logo ka size, jaise "h-10 w-auto" */
  logoClassName?: string;
  /** photo ke saath naam dikhana hai ya nahi */
  showName?: boolean;
}

// Header aur sidebar dono me BrandLogo hai, isliye company logo ek hi baar fetch ho
let companyLogoCache: { id: string; logo: string } | null = null;

export function BrandLogo({
  photoClassName = "size-10",
  logoClassName = "h-10 w-auto",
  showName = true,
}: BrandLogoProps) {
  const { user } = useAuthContext();
  const sessionUser = user as any;

  const role = getCurrentRole();
  const isSuperAdmin = role === "superAdmin";
  const isBranch = role === "branch";
  const isEmployee = !isSuperAdmin && !isBranch;

  // Employee / Branch store alag hain, aur sirf apne role ke liye chalte hain
  const employeeProfile = useEmployeeProfile(isEmployee);
  const branchProfile = useBranchProfile(isBranch);

  // Super admin ka company logo (Profile.tsx jaisi API)
  const [companyLogo, setCompanyLogo] = useState(() => {
    const id = localStorage.getItem("companyDetailsId") || "";
    return companyLogoCache && companyLogoCache.id === id
      ? companyLogoCache.logo
      : "";
  });

  useEffect(() => {
    if (!isSuperAdmin) return;

    const companyDetailsId = localStorage.getItem("companyDetailsId");
    if (!companyDetailsId) return;
    if (companyLogoCache && companyLogoCache.id === companyDetailsId) return;

    (async () => {
      try {
        const res = await Get(
          "superadmin/company-details",
          { companyDetailsId },
          false,
        );
        if (res.data?.success) {
          const logo = res.data.data?.logo || "";
          companyLogoCache = { id: companyDetailsId, logo };
          setCompanyLogo(logo);
        }
      } catch {
        // fallback: APP_LOGO
      }
    })();
  }, [isSuperAdmin]);

  const photo = isBranch
    ? branchProfile?.profilePhoto || ""
    : isEmployee
      ? employeeProfile?.profilePhoto || ""
      : "";

  const name = isBranch
    ? branchProfile?.branchName || ""
    : isEmployee
      ? employeeProfile?.employeeName || ""
      : "";

  // Employee / Branch ke liye company ka logo login response se (user me)
  const sessionCompanyLogo = sessionUser?.companyLogo || "";

  // Photo hai to photo (naam ke saath)
  if (photo) {
    return (
      <div className="flex min-w-0 items-center gap-2.5">
        <img
          src={photo}
          alt={name || "Profile"}
          className={clsx("shrink-0 rounded-full object-cover", photoClassName)}
        />
        {showName && name && (
          <span className="dark:text-dark-100 max-w-40 truncate text-base font-semibold text-gray-800">
            {name}
          </span>
        )}
      </div>
    );
  }

  // Photo nahi: company logo, wo bhi nahi to TicketBook logo
  const logoSrc = isSuperAdmin
    ? companyLogo || APP_LOGO
    : sessionCompanyLogo || APP_LOGO;

  return (
    <img
      src={logoSrc}
      alt="Logo"
      className={clsx("object-contain", logoClassName)}
    />
  );
}