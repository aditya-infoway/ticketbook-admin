// src/app/(protected)/dashboards/home/Dashboards.tsx
import { Page } from "@/components/shared/Page";
import { StatCards } from "./StatCards";
import { IssueTrends } from "./IssueTrends";
import { TopPerformers } from "./TopPerformers";
import { TicketDirectory } from "./TicketDirectory"; // Naya component import kiya

export default function Dashboards() {
  return (
    <Page title="Employee Ticket Dashboard">
      <div className="transition-content w-full space-y-4 px-(--margin-x) pb-8 sm:space-y-5 lg:space-y-6">
        
        {/* 1. Stats Cards */}
        <div className="mt-4 sm:mt-5 lg:mt-6">
          <StatCards />
        </div>

        {/* 2. Charts Section */}
        <div className="grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-3 lg:gap-6">
          <div className="lg:col-span-2">
            <IssueTrends />
          </div>
          <TopPerformers /> {/* Ensure karein ye Ticket Resolution Rate dikha raha ho */}
        </div>

        {/* 3. Ticket Table */}
        <TicketDirectory />
      </div>
    </Page>
  );
}