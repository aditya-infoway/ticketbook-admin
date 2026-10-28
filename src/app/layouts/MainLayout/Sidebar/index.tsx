// Import Dependencies
import { useMemo, useState } from "react";
import { useLocation } from "react-router";
// Local Imports
import { useBreakpointsContext } from "@/app/contexts/breakpoint/context";
import { useSidebarContext } from "@/app/contexts/sidebar/context";
import { getNavigation } from "@/app/navigation";
import { getCurrentRole } from "@/app/navigation/role";
import { getSettings } from "@/app/navigation/roleSettings";
import { useDidUpdate } from "@/hooks";
import { isRouteActive } from "@/utils/isRouteActive";
import { MainPanel } from "./MainPanel";
import { PrimePanel } from "./PrimePanel";
// ----------------------------------------------------------------------

export type SegmentPath = string | undefined;
export function Sidebar() {
  const { pathname } = useLocation();
  const { name, lgAndDown } = useBreakpointsContext();
  const { isExpanded, close } = useSidebarContext();

  // Menus + settings depend on the logged in role (superAdmin / branch / employee).
  // The Sidebar mounts after login, so it always reads the fresh role.
  const role = getCurrentRole();
  const navigation = useMemo(() => getNavigation(role), [role]);
  const settings = useMemo(() => getSettings(role), [role]);

  // Segments that can appear in PrimePanel but aren't part of the main visible nav list
  const allSegments = useMemo(
    () => [...navigation, settings],
    [navigation, settings],
  );

  const initialSegment = useMemo(
    () => allSegments.find((item) => isRouteActive(item.path, pathname)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
  const [activeSegmentPath, setActiveSegmentPath] = useState<SegmentPath>(
    initialSegment?.path,
  );
  const currentSegment = useMemo(() => {
    return allSegments.find((item) => item.path === activeSegmentPath);
  }, [activeSegmentPath, allSegments]);
  useDidUpdate(() => {
    const activePath = allSegments.find((item) =>
      isRouteActive(item.path, pathname),
    )?.path;
    setActiveSegmentPath(activePath);
  }, [pathname]);
  useDidUpdate(() => {
    if (lgAndDown && isExpanded) close();
  }, [name]);
  return (
    <>
      <MainPanel
        nav={navigation}
        activeSegmentPath={activeSegmentPath}
        setActiveSegmentPath={setActiveSegmentPath}
      />
      <PrimePanel
        close={close}
        currentSegment={currentSegment}
        pathname={pathname}
      />
    </>
  );
}