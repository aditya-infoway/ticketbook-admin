// Local Imports
import { Page } from "@/components/shared/Page";
import { StatCards } from "./StatCards";
import { IssueTrends } from "./IssueTrends";
import { TopPerformers } from "./TopPerformers";
import { EmployeeDirectory } from "./EmployeeDirectory";

// ----------------------------------------------------------------------

export default function Dashboards() {
  return (
    <Page title="Dashboards">
      <div className="transition-content w-full space-y-4 px-(--margin-x) pb-8 sm:space-y-5 lg:space-y-6">
        <div className="mt-4 sm:mt-5 lg:mt-6">
          <StatCards />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-3 lg:gap-6">
          <div className="lg:col-span-2">
            <IssueTrends />
          </div>
          <TopPerformers />
        </div>

        <EmployeeDirectory />
      </div>
    </Page>
  );
}