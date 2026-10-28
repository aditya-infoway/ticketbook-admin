// Import Dependencies
import { Link } from "react-router";
import clsx from "clsx";
import { SetStateAction, Dispatch } from "react";

// Local Imports
// import { APP_LOGO } from "@/constants/app";
import { useCompanyIcon } from "@/hooks/useCompanyIcon";
import { Menu } from "./Menu";
import { Item } from "./Menu/item";
import { Profile } from "../../Profile";
import { useThemeContext } from "@/app/contexts/theme/context";
import { useSidebarContext } from "@/app/contexts/sidebar/context"; // ✅ add kiya
import { useAuthContext } from "@/app/contexts/auth/context";
import { getCurrentRole } from "@/app/navigation/role";
import { getSettings } from "@/app/navigation/roleSettings";
import { NavigationTree } from "@/@types/navigation";
import { SegmentPath } from "..";

// ----------------------------------------------------------------------

interface MainPanelProps {
  nav: NavigationTree[];
  setActiveSegmentPath?: Dispatch<SetStateAction<SegmentPath>>;
  activeSegmentPath: SegmentPath;
}

export function MainPanel({
  nav,
  setActiveSegmentPath,
  activeSegmentPath,
}: MainPanelProps) {
  const { cardSkin } = useThemeContext();
  const { isExpanded, open } = useSidebarContext(); // ✅ add kiya
  const { user } = useAuthContext();

  const role = getCurrentRole();
  const settings = getSettings(role);

  // Super admin: icon from the company details (hook).
  // Employee: company icon / logo that came with the login response.
  const companyIcon = useCompanyIcon();
  const sessionUser = user as any;
  const appLogo =
    role === "superAdmin"
      ? companyIcon
      : sessionUser?.companyIcon || sessionUser?.companyLogo || companyIcon;

  const handleSettingsClick = () => {
    setActiveSegmentPath?.(settings.path);
    if (!isExpanded) {
      open();
    }
  };

  return (
    <div className="main-panel">
      <div
        className={clsx(
          "border-gray-150 dark:border-dark-600/80 flex h-full w-full flex-col items-center bg-white ltr:border-r rtl:border-l",
          cardSkin === "shadow" ? "dark:bg-dark-750" : "dark:bg-dark-900",
        )}
      >
        {/* Application Logo */}
        <div className="flex pt-3.5">
          <Link to="/">
            <img
              src={appLogo}
              alt="Ticket Book"
              className="size-10 object-contain"
            />
          </Link>
        </div>

        <Menu
          nav={nav}
          activeSegmentPath={activeSegmentPath}
          setActiveSegmentPath={setActiveSegmentPath}
        />

        {/* Bottom Links */}
        <div className="flex flex-col items-center space-y-3 py-2.5">
          <Item
            id={settings.id}
            component={Link}
            to={settings.childs?.[0]?.path ?? settings.path}
            onClick={handleSettingsClick}
            title="Settings"
            isActive={activeSegmentPath === settings.path}
            icon={settings.icon}
          />
          <Profile />
        </div>
      </div>
    </div>
  );
}