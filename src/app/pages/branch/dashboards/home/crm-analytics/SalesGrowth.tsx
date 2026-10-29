// Import Dependencies
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";

// Local Imports
import { Card } from "@/components/ui";

// ----------------------------------------------------------------------

const months = ["Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct"];

const chartConfig: ApexOptions = {
  colors: ["#10B981"],
  chart: {
    stacked: false,
    parentHeightOffset: 0,
    toolbar: { show: false },
  },
  dataLabels: { enabled: false },
  grid: {
    padding: { left: 0, right: 0, top: -28, bottom: -15 },
  },
  stroke: { width: 2, curve: "smooth" },
  tooltip: { shared: true },
  legend: { show: false },
  yaxis: { show: false },
  xaxis: {
    categories: months,
    labels: { show: false },
    axisTicks: { show: false },
    axisBorder: { show: false },
  },
};

// Total employees at the end of each month
const series = [
  {
    name: "Total Employees",
    data: [112, 118, 121, 130, 136, 141, 150],
  },
];

export function EmployeeGrowth() {
  return (
    <Card className="flex flex-col">
      <div className="my-2 flex min-w-0 items-center justify-between px-4">
        <h2 className="dark:text-dark-100 truncate font-medium tracking-wide text-gray-800">
          Employee Growth
        </h2>
        <span className="text-xs">Last 7 months</span>
      </div>
      <p className="grow px-4">
        <span className="this:success text-this dark:text-this-light text-2xl font-semibold">
          150
        </span>{" "}
        <span className="text-xs">+6% vs last month</span>
      </p>
      <div className="ax-transparent-gridline ax-rounded-b-lg">
        <Chart height="120" type="area" series={series} options={chartConfig} />
      </div>
    </Card>
  );
}