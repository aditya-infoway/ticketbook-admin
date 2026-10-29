// Import Dependencies
import { Link } from "react-router";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";

// Local Imports
import { Button } from "@/components/ui";
import { BrandLogo } from "@/components/shared/BrandLogo";
import { useSidebarContext } from "@/app/contexts/sidebar/context";
import { useBreakpointsContext } from "@/app/contexts/breakpoint/context";

// ----------------------------------------------------------------------

export function Header() {
  const { close } = useSidebarContext();
  const { lgAndDown } = useBreakpointsContext();

  return (
    <header
      className={clsx(
        "flex items-center justify-between gap-3 border-b border-gray-200 bg-white px-4 py-4 dark:border-dark-600 dark:bg-dark-900",
      )}
    >
      <Link to="/" className="flex min-w-0 items-center gap-3">
        <BrandLogo photoClassName="size-8" logoClassName="h-8" />
      </Link>

      {lgAndDown && (
        <Button
          onClick={close}
          variant="flat"
          isIcon
          className="size-6 rounded-full"
        >
          <ChevronLeftIcon className="size-5 rtl:rotate-180" />
        </Button>
      )}
    </header>
  );
}