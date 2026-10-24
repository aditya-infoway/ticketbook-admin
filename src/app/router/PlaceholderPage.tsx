// Import Dependencies
import { Cog, Wrench } from "lucide-react";

// Local Imports
import { Page } from "@/components/shared/Page";

// ----------------------------------------------------------------------

/**
 * Temporary "Coming Soon" page used until the real page is built.
 * Replace a route's `element` with the real page when it is ready.
 */
export default function PlaceholderPage({ title }: { title: string }) {
  return (
    <Page title={title}>
      <div className="transition-content flex min-h-[calc(100vh-10rem)] w-full items-center justify-center px-(--margin-x) pb-8">
        <div className="w-full max-w-lg text-center">
          <div className="relative mx-auto flex size-24 items-center justify-center rounded-2xl bg-blue-50 shadow-sm">
            <Cog
              className="animate-spin text-red-600"
              size={48}
              strokeWidth={2}
              style={{ animationDuration: "8s" }}
            />
            <div className="absolute right-2 bottom-2 rounded-full bg-white p-1 shadow">
              <Wrench className="text-red-500" size={18} strokeWidth={2.5} />
            </div>
          </div>

          <div className="mt-8 inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-1">
            <span className="size-2 rounded-full bg-red-500"></span>
            <span className="text-sm font-semibold tracking-wide text-red-500 uppercase">
              Under Construction
            </span>
          </div>

          <h1 className="mt-6 text-5xl font-extrabold text-red-600">
            Coming Soon...!!
          </h1>

          <p className="dark:text-dark-200 mt-6 text-lg leading-8 text-gray-600">
            We are currently working hard behind the scenes to upgrade our
            platform. A brand new experience is just around the corner.
          </p>
        </div>
      </div>
    </Page>
  );
}