// Import Dependencies
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { ChartBarIcon, ArrowTrendingUpIcon } from "@heroicons/react/24/outline";

// Local Imports
import { Card } from "@/components/ui";

// ----------------------------------------------------------------------

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"];

const series = [
  { name: "New Tickets", data: [120, 150, 110, 180, 140, 200, 160, 130] },
  { name: "Resolved", data: [100, 130, 105, 160, 135, 180, 150, 125] },
];

// Totals
const totalNew = series[0].data.reduce((a, b) => a + b, 0);
const totalResolved = series[1].data.reduce((a, b) => a + b, 0);
const resolutionRate = Math.round((totalResolved / totalNew) * 100);

const chartConfig: ApexOptions = {
  colors: ["#6366F1", "#10B981"],
  chart: {
    type: "bar",
    height: 300,
    toolbar: { show: false },
    parentHeightOffset: 0,
    fontFamily: "inherit",
  },
  plotOptions: {
    bar: {
      horizontal: false,
      columnWidth: "55%",
      borderRadius: 4,
      borderRadiusApplication: "end",
      borderRadiusWhenStacked: "last",
    },
  },
  dataLabels: { enabled: false },
  stroke: {
    show: true,
    width: 2,
    colors: ["transparent"],
  },
  fill: { opacity: 1 },
  grid: {
    borderColor: "rgba(148, 163, 184, 0.15)",
    strokeDashArray: 4,
    xaxis: { lines: { show: false } },
    yaxis: { lines: { show: true } },
    padding: { left: 8, right: 8 },
  },
  legend: {
    show: true,
    position: "top",
    horizontalAlign: "right",
    fontSize: "11px",
    fontWeight: 500,
    markers: { size: 5, offsetX: -2, strokeWidth: 0 },
    itemMargin: { horizontal: 10 },
    labels: { colors: "#94A3B8" },
  },
  tooltip: {
    shared: true,
    intersect: false,
    y: { formatter: (val: number) => `${val} tickets` },
    style: { fontSize: "12px" },
  },
  xaxis: {
    categories: months,
    axisBorder: { show: false },
    axisTicks: { show: false },
    labels: {
      style: { fontSize: "11px", colors: "#94A3B8" },
    },
  },
  yaxis: {
    min: 0,
    max: 220,
    tickAmount: 4,
    labels: {
      style: { fontSize: "11px", colors: "#94A3B8" },
      formatter: (val: number) => `${val}`,
    },
  },
};

export function IssueTrends() {
  return (
    <Card className="relative h-full overflow-hidden p-4 sm:p-5">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-500 dark:bg-indigo-500/20 dark:text-indigo-400">
              <ChartBarIcon className="size-4" />
            </div>
            <h2 className="dark:text-dark-50 font-semibold text-gray-800">
              Issue Resolution Trends
            </h2>
          </div>
          <p className="dark:text-dark-300 mt-1 text-xs text-gray-500">
            Tracking tickets raised vs resolved globally
          </p>
        </div>

        {/* Mini Summary Badges */}
        <div className="flex flex-wrap gap-2">
          <div className="dark:bg-dark-700/60 flex items-center gap-2 rounded-lg bg-gray-50 px-2.5 py-1.5">
            <span className="size-2 rounded-full bg-indigo-500" />
            <div>
              <p className="dark:text-dark-300 text-[10px] font-medium text-gray-500">
                Raised
              </p>
              <p className="dark:text-dark-100 text-xs font-semibold text-gray-800">
                {totalNew.toLocaleString()}
              </p>
            </div>
          </div>
          <div className="dark:bg-dark-700/60 flex items-center gap-2 rounded-lg bg-gray-50 px-2.5 py-1.5">
            <span className="size-2 rounded-full bg-emerald-500" />
            <div>
              <p className="dark:text-dark-300 text-[10px] font-medium text-gray-500">
                Resolved
              </p>
              <p className="dark:text-dark-100 text-xs font-semibold text-gray-800">
                {totalResolved.toLocaleString()}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 rounded-lg bg-emerald-500/10 px-2.5 py-1.5 dark:bg-emerald-500/20">
            <ArrowTrendingUpIcon className="size-3.5 text-emerald-500 dark:text-emerald-400" />
            <span className="text-xs font-semibold text-emerald-500 dark:text-emerald-400">
              {resolutionRate}%
            </span>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="-mx-2 mt-3">
        <Chart type="bar" height={300} series={series} options={chartConfig} />
      </div>
    </Card>
  );
}