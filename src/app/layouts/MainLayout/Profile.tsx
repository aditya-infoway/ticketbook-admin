// Import Dependencies
import {
  Popover,
  PopoverButton,
  PopoverPanel,
  Transition,
} from "@headlessui/react";
import {
  ArrowLeftStartOnRectangleIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";
import { TbUser } from "react-icons/tb";
import { Link } from "react-router";

// Local Imports
import { Avatar, Button } from "@/components/ui";
import { APP_FAVICON, APP_NAME, ColorType } from "@/constants/app";

import { useAuthContext } from "@/app/contexts/auth/context";
import { GHOST_ENTRY_PATH } from "@/constants/app";
import { getCurrentRole } from "@/app/navigation/role";
import { getSettings } from "@/app/navigation/roleSettings";
import { useEmployeeProfile } from "../../../hooks/Useemployeeprofile";
import { useNavigate } from "react-router";
import { useEffect, useMemo, useState } from "react";
import { Get } from "@/ApiHelper";

// Define Link Types
interface LinkItem {
  id: string;
  title: string;
  description: string;
  to: string;
  Icon: React.ElementType;
  color: ColorType;
}

// ----------------------------------------------------------------------

export function Profile() {
  const { logout, user } = useAuthContext();
  const navigate = useNavigate();

  const role = getCurrentRole();
  const isSuperAdmin = role === "superAdmin";

  // Employee: company / name come from the login response (kept in `user`).
  // Super admin: fetched from company details (needs the company token).
  const sessionUser = user as any;

  // Employee: own name + profile photo (same data as the General settings page)
  const employeeProfile = useEmployeeProfile(!isSuperAdmin);

  const [companyName, setCompanyName] = useState(
    sessionUser?.companyName || "Company Name",
  );
  const [companyLogo, setCompanyLogo] = useState("");
  const [companyIcon, setCompanyIcon] = useState("");

  useEffect(() => {
    // company-details API is for the super admin token only
    if (!isSuperAdmin) return;

    const fetchCompanyName = async () => {
      try {
        const companyDetailsId = localStorage.getItem("companyDetailsId");

        if (!companyDetailsId) {
          return;
        }

        const response = await Get(
          "superadmin/company-details",
          { companyDetailsId },
          false,
        );

        if (response.data?.success) {
          const d = response.data.data;
          setCompanyName(d?.companyName || "Company Name");
          setCompanyLogo(d?.logo || "");
          setCompanyIcon(d?.icon || "");
        }
      } catch (error) {
        console.error("Failed to fetch company name:", error);
      }
    };

    fetchCompanyName();
  }, [isSuperAdmin]);

  // Links follow the settings segment of the role, so they always match the
  // paths of the sidebar: /settings/..., /branch/settings/..., /employee/settings/...
  const { profilePath, settingsPath } = useMemo(() => {
    const segment = getSettings(role);
    const find = (key: string) =>
      segment.childs?.find((child) => child.path?.endsWith(`/${key}`))?.path;

    const fallback = segment.path || "/settings";

    return {
      profilePath: find("general") || find("profile") || fallback,
      settingsPath: find("appearance") || fallback,
    };
  }, [role]);

  const links: LinkItem[] = [
    {
      id: "1",
      title: isSuperAdmin ? "Profile" : "My Profile",
      description: "Your profile Setting",
      to: profilePath,
      Icon: TbUser,
      color: "warning",
    },
    {
      id: "5",
      title: "Settings",
      description: "Webapp settings",
      to: settingsPath,
      Icon: Cog6ToothIcon,
      color: "success",
    },
  ];

  const handleLogout = async (close: () => void) => {
    try {
      await logout();
      close();
      navigate(GHOST_ENTRY_PATH);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // Super admin: logo from company details.
  // Employee: own profile photo -> company icon / logo -> default icon.
  const employeePhoto = employeeProfile?.profilePhoto || "";
  const logoSrc = isSuperAdmin
    ? companyIcon || companyLogo || APP_FAVICON
    : employeePhoto ||
      sessionUser?.companyIcon ||
      sessionUser?.companyLogo ||
      APP_FAVICON;

  // a real photo should fill the circle, logos / icons stay fully visible
  const imageClass = employeePhoto ? "object-cover" : "object-contain";

  // Super admin -> company name / "Company Profile"
  // Employee    -> own name / company name
  const displayName = isSuperAdmin
    ? companyName || "Company Name"
    : employeeProfile?.employeeName || sessionUser?.employeeName || "My Profile";
  const subtitle = isSuperAdmin
    ? "Company Profile"
    : sessionUser?.companyName || companyName;

  return (
    <Popover className="relative">
      <PopoverButton
        as={Avatar}
        size={12}
        role="button"
        src={logoSrc}
        alt={displayName || APP_NAME}
        classNames={{ image: `${imageClass} ${employeePhoto ? "" : "p-0.5"}` }}
        className="cursor-pointer"
      />

      <Transition
        enter="duration-200 ease-out"
        enterFrom="translate-x-2 opacity-0"
        enterTo="translate-x-0 opacity-100"
        leave="duration-200 ease-out"
        leaveFrom="translate-x-0 opacity-100"
        leaveTo="translate-x-2 opacity-0"
      >
        <PopoverPanel
          anchor={{ to: "right end", gap: 12 }}
          className="border-gray-150 shadow-soft dark:border-dark-600 dark:bg-dark-700 z-70 flex w-64 flex-col rounded-lg border bg-white transition dark:shadow-none"
        >
          {({ close }) => (
            <>
              {/* User Info */}
              <div className="dark:bg-dark-800 flex items-center gap-4 rounded-t-lg bg-gray-100 px-4 py-5">
                <Avatar
                  size={14}
                  src={logoSrc}
                  alt={displayName || APP_NAME}
                  classNames={{ image: `${imageClass} ${employeePhoto ? "" : "p-1"}` }}
                />

                <div className="min-w-0">
                  <Link
                    className="hover:text-primary-600 focus:text-primary-600 dark:text-dark-100 dark:hover:text-primary-400 dark:focus:text-primary-400 block truncate text-base font-medium text-gray-700"
                    to={profilePath}
                    onClick={() => close()}
                  >
                    {displayName}
                  </Link>

                  <p className="dark:text-dark-300 mt-0.5 truncate text-xs text-gray-400">
                    {subtitle}
                  </p>
                </div>
              </div>

              {/* Navigation Links */}
              <div className="flex flex-col pt-2 pb-5">
                {links.map((link) => (
                  <Link
                    key={link.id}
                    to={link.to}
                    onClick={() => close()}
                    className="group dark:hover:bg-dark-600 dark:focus:bg-dark-600 flex items-center gap-3 px-4 py-2 tracking-wide outline-hidden transition-all hover:bg-gray-100 focus:bg-gray-100"
                  >
                    <Avatar
                      size={8}
                      initialColor={link.color}
                      classNames={{ display: "rounded-lg" }}
                    >
                      <link.Icon className="size-4.5" />
                    </Avatar>

                    <div>
                      <h2 className="group-hover:text-primary-600 group-focus:text-primary-600 dark:text-dark-100 dark:group-hover:text-primary-400 dark:group-focus:text-primary-400 font-medium text-gray-800 transition-colors">
                        {link.title}
                      </h2>

                      <div className="dark:text-dark-300 truncate text-xs text-gray-400">
                        {link.description}
                      </div>
                    </div>
                  </Link>
                ))}

                {/* Logout Button */}
                <div className="px-4 pt-4">
                  <Button
                    type="button"
                    className="w-full gap-2"
                    onClick={() => handleLogout(close)}
                  >
                    <ArrowLeftStartOnRectangleIcon className="size-4.5" />
                    <span>Logout</span>
                  </Button>
                </div>
              </div>
            </>
          )}
        </PopoverPanel>
      </Transition>
    </Popover>
  );
}