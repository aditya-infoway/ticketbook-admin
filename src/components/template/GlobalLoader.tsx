import { useLayoutEffect } from "react";
import { useLocation, useMatches } from "react-router";
import { loaderStore, useLoaderVisible } from "@/utils/loaderStore";
import { SplashScreen } from "@/components/template/SplashScreen";

export function GlobalLoader() {
  const visible = useLoaderVisible();
  const { pathname } = useLocation();
  const matches = useMatches();
  const blocked = matches.some((m) => m.id === "ghost"); // login + select-company

  // runs before the page's own useEffect fetches
  useLayoutEffect(() => {
    loaderStore.markNavigation();
  }, [pathname]);

  if (!visible || blocked) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-white/70 backdrop-blur-sm dark:bg-dark-900/70">
      <SplashScreen />
    </div>
  );
}