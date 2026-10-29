// src/app/(protected)/dashboards/home/Dashboards.tsx
import { Page } from "@/components/shared/Page";
import { StatCards } from "./StatCards";
import { RecentActivity  } from "./IssueTrends"; // Isko ab Bar Chart banayein
import { TopPerformers } from "./TopPerformers"; // Ab ye Pie chart hai
import { TicketDirectory } from "./EmployeeDirectory"; // Recent Tickets Table

export default function Dashboards() {
  return (
    <Page title="Ticket Dashboard">
      <div className="transition-content w-full space-y-4 px-(--margin-x) pb-8 sm:space-y-5 lg:space-y-6">
        
        {/* 1. Top Stats */}
        <div className="mt-4 sm:mt-5 lg:mt-6">
          <StatCards />
        </div>

        {/* 2. Charts Section */}
        <div className="grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-3 lg:gap-6">
          {/* Left: Bar Chart for Trends */}
          <div className="lg:col-span-2">
            <RecentActivity  />
          </div>
          {/* Right: Ticket Distribution Pie Chart */}
          <div>
            <TopPerformers />
          </div>
        </div>

        {/* 3. Recent Tickets Table (Employee Directory ki jagah) */}
        <TicketDirectory />
      </div>
    </Page>
  );
}