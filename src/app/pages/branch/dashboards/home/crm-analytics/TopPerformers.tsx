// Import Dependencies
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { TicketIcon } from "@heroicons/react/24/outline";
import { useState, useEffect } from "react"; // Apex error se bachne ke liye

// Local Imports
import { Card } from "@/components/ui";

// ----------------------------------------------------------------------

const ticketData = [
  { name: "Resolved", value: 96, color: "#10B981" },
  { name: "Closed", value: 52, color: "#64748B" },
  { name: "Open", value: 48, color: "#F59E0B" },
  { name: "In Progress", value: 32, color: "#6366F1" },
];

const totalTickets = ticketData.reduce((sum, item) => sum + item.value, 0);

const chartConfig: ApexOptions = {
  chart: {
    type: "radialBar",
    fontFamily: "inherit",
    parentHeightOffset: 0,
    toolbar: { show: false },
  },
  colors: ticketData.map((item) => item.color),
  plotOptions: {
    radialBar: {
      hollow: {
        margin: 10,
        size: "30%", // Center ka size
      },
      track: {
        background: "rgba(148, 163, 184, 0.1)",
        strokeWidth: "100%",
        margin: 6, // Rings ke beech ka gap
      },
      dataLabels: {
        show: true,
        name: {
          fontSize: "11px",
          color: "#94A3B8",
          offsetY: -4,
        },
        value: {
          fontSize: "14px",
          fontWeight: 600,
          color: "#94A3B8",
          offsetY: 4,
          formatter: function (val) {
            return val + "%";
          },
        },
        total: {
          show: true,
          label: "Total",
          color: "#6366F1",
          fontSize: "16px",
          fontWeight: 700,
          formatter: function () {
            return totalTickets.toString();
          },
        },
      },
    },
  },
  stroke: { lineCap: "round" },
  labels: ticketData.map((item) => item.name),
  legend: { show: false }, // Custom legend use karenge
  tooltip: {
    y: {
      formatter: (val: number) => `${val}%`,
    },
  },
};

// Values ko percentage mein convert kiya (taaki ring 100% tak bhare)
const series = ticketData.map((item) =>
  Math.round((item.value / totalTickets) * 100)
);

export function TopPerformers() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <Card className="relative flex h-full flex-col overflow-hidden p-4 sm:p-5">
      {/* Decorative Glow */}
      <div className="pointer-events-none absolute -top-10 -right-10 size-32 rounded-full bg-indigo-500/10 blur-2xl" />

      {/* Header */}
      <div className="relative flex items-center gap-2">
        <div className="flex size-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-500 dark:bg-indigo-500/20 dark:text-indigo-400">
          <TicketIcon className="size-4" />
        </div>
        <div>
          <h2 className="dark:text-dark-50 font-semibold text-gray-800">
            Ticket Status Rings
          </h2>
          <p className="mt-0.5 text-xs text-gray-500 dark:text-dark-300">
            Current queue breakdown
          </p>
        </div>
      </div>

      {/* Radial Chart */}
      <div className="relative flex flex-1 items-center justify-center">
        {mounted ? (
          <Chart
            type="radialBar"
            height={260}
            width={260}
            series={series}
            options={chartConfig}
          />
        ) : (
          <div className="h-[260px] w-[260px] animate-pulse rounded-full bg-gray-100 dark:bg-dark-700" />
        )}
      </div>

      {/* Custom Legend Grid */}
      <div className="relative mt-2 grid grid-cols-2 gap-2.5">
        {ticketData.map((item, index) => (
          <div
            key={item.name}
            className="dark:bg-dark-700/60 flex items-center justify-between rounded-lg bg-gray-50 p-2.5 transition-colors hover:bg-gray-100 dark:hover:bg-dark-700"
          >
            <div className="flex min-w-0 items-center gap-2">
              <span
                className="size-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="dark:text-dark-200 truncate text-xs font-medium text-gray-700">
                {item.name}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-medium text-gray-400 dark:text-dark-400">
                {series[index]}%
              </span>
              <span className="dark:text-dark-100 text-sm font-semibold text-gray-800">
                {item.value}
              </span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}