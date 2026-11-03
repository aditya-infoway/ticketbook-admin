// Import Dependencies
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { TicketIcon, ArrowTrendingUpIcon } from "@heroicons/react/24/outline";

// Local Imports
import { Card } from "@/components/ui";

// ----------------------------------------------------------------------

const months = ["Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct"];

const chartConfig: ApexOptions = {
  colors: ["#6366F1"], // Indigo - tickets theme
  chart: {
    stacked: false,
    parentHeightOffset: 0,
    toolbar: { show: false },
    sparkline: { enabled: false },
  },
  dataLabels: { enabled: false },
  grid: {
    padding: { left: 0, right: 0, top: -28, bottom: -15 },
    show: false,
  },
  stroke: { width: 2.5, curve: "smooth" },
  fill: {
    type: "gradient",
    gradient: {
      shadeIntensity: 1,
      opacityFrom: 0.35,
      opacityTo: 0.02,
      stops: [0, 95, 100],
    },
  },
  tooltip: {
    shared: true,
    y: { formatter: (val: number) => `${val} tickets` },
  },
  legend: { show: false },
  yaxis: { show: false },
  xaxis: {
    categories: months,
    labels: { show: false },
    axisTicks: { show: false },
    axisBorder: { show: false },
  },
  markers: {
    size: 0,
    hover: { size: 5 },
  },
};

// Total tickets raised each month
const series = [
  {
    name: "Tickets Raised",
    data: [145, 162, 158, 189, 176, 205, 228],
  },
];

export function TicketGrowth() {
  return (
    <Card className="relative flex flex-col overflow-hidden">
      {/* Decorative background glow */}
      <div className="pointer-events-none absolute -top-16 -right-16 size-40 rounded-full bg-indigo-500/10 blur-2xl" />

      {/* Header */}
      <div className="my-2 flex min-w-0 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-500 dark:bg-indigo-500/20 dark:text-indigo-400">
            <TicketIcon className="size-4" />
          </div>
          <h2 className="dark:text-dark-100 truncate font-medium tracking-wide text-gray-800">
            Ticket Volume
          </h2>
        </div>
        <span className="dark:bg-dark-600 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-500 dark:text-dark-300">
          Last 7 months
        </span>
      </div>

      {/* Value + Trend */}
      <div className="flex items-end justify-between px-4">
        <p className="grow">
          <span className="text-2xl font-semibold text-indigo-500 dark:text-indigo-400">
            228
          </span>{" "}
          <span className="dark:text-dark-300 text-xs text-gray-500">
            tickets this month
          </span>
        </p>
        <span className="inline-flex h-5 items-center gap-1 rounded-full bg-emerald-500/10 px-2 text-tiny font-semibold text-emerald-500 dark:bg-emerald-500/20 dark:text-emerald-400">
          <ArrowTrendingUpIcon className="size-3" />
          +11.2%
        </span>
      </div>

      {/* Chart */}
      <div className="ax-transparent-gridline ax-rounded-b-lg mt-1">
        <Chart height="120" type="area" series={series} options={chartConfig} />
      </div>
    </Card>
  );
}