// Import Dependencies
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";

// Local Imports
import { Card } from "@/components/ui";

// ----------------------------------------------------------------------

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"];

const series = [
  { name: "New Issues", data: [120, 150, 110, 180, 140, 200, 160, 130] },
  { name: "Resolved", data: [100, 130, 105, 160, 135, 180, 150, 125] },
];

const chartConfig: ApexOptions = {
  colors: ["#6366F1", "#10B981"],
  chart: {
    type: "area",
    height: 300,
    toolbar: { show: false },
    parentHeightOffset: 0,
    zoom: { enabled: false },
  },
  dataLabels: { enabled: false },
  stroke: { width: 2, curve: "smooth" },
  fill: {
    type: "gradient",
    gradient: {
      shadeIntensity: 1,
      opacityFrom: 0.25,
      opacityTo: 0.02,
      stops: [0, 95, 100],
    },
  },
  grid: {
    borderColor: "rgba(148, 163, 184, 0.25)",
    strokeDashArray: 4,
    xaxis: { lines: { show: false } },
  },
  legend: {
    show: true,
    position: "top",
    horizontalAlign: "right",
    fontSize: "11px",
    markers: { size: 5, offsetX: -2 },
    itemMargin: { horizontal: 8 },
  },
  tooltip: { shared: true, intersect: false },
  xaxis: {
    categories: months,
    axisBorder: { show: false },
    axisTicks: { show: false },
    labels: { style: { fontSize: "11px" } },
  },
  yaxis: {
    min: 100,
    max: 200,
    tickAmount: 5,
    labels: { style: { fontSize: "11px" } },
  },
};

export function IssueTrends() {
  return (
    <Card className="h-full p-4 sm:p-5">
      <h2 className="dark:text-dark-50 font-semibold text-gray-800">
        Issue Resolution Trends
      </h2>
      <p className="mt-0.5 text-xs">Tracking issues raised vs resolved globally</p>
      <div className="-mx-2 mt-2">
        <Chart type="area" height={300} series={series} options={chartConfig} />
      </div>
    </Card>
  );
}