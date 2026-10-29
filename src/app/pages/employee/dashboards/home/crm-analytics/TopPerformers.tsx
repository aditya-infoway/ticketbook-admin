// Import Dependencies
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { TicketIcon } from "@heroicons/react/24/outline";

// Local Imports
import { Card } from "@/components/ui";

// ----------------------------------------------------------------------

const ticketData = [
  { name: "Open", value: 48, color: "#F59E0B" },       // Amber
  { name: "In Progress", value: 32, color: "#6366F1" }, // Indigo
  { name: "Resolved", value: 96, color: "#10B981" },    // Emerald
  { name: "Closed", value: 52, color: "#64748B" },      // Slate
];

const totalTickets = ticketData.reduce((sum, item) => sum + item.value, 0);

const chartConfig: ApexOptions = {
  colors: ticketData.map((item) => item.color),
  chart: {
    type: "donut",
    fontFamily: "inherit",
    parentHeightOffset: 0,
  },
  labels: ticketData.map((item) => item.name),
  dataLabels: { enabled: false },
  stroke: {
    width: 0, // Borders hata diye taaki clean aur modern lage
  },
  legend: {
    show: false, // Custom legend use karenge
  },
  tooltip: {
    y: {
      formatter: (val: number) => `${val} tickets`,
    },
  },
  plotOptions: {
    pie: {
      expandOnClick: false,
      donut: {
        size: "75%", // Donut ki thickness
        labels: {
          show: true,
          name: {
            show: true,
            fontSize: "12px",
            color: "#94A3B8",
            offsetY: -4,
          },
          value: {
            show: true,
            fontSize: "28px",
            fontWeight: 700,
            color: "#6366F1", // Primary Indigo color
            offsetY: 6,
            formatter: function (val) {
              return val; // Center mein Total dikhayega
            },
          },
          total: {
            show: true,
            label: "Total Tickets",
            fontSize: "12px",
            color: "#94A3B8",
            formatter: () => totalTickets,
          },
        },
      },
    },
  },
};

const series = ticketData.map((item) => item.value);

export function TopPerformers() {
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
            Ticket Distribution
          </h2>
          <p className="mt-0.5 text-xs text-gray-500 dark:text-dark-300">
            Current status overview
          </p>
        </div>
      </div>

      {/* Donut Chart */}
      <div className="relative mt-2 flex flex-1 items-center justify-center">
        <Chart
          type="donut"
          height={230}
          width={230}
          series={series}
          options={chartConfig}
        />
      </div>

      {/* Custom Legend / Stats Grid */}
      <div className="relative mt-4 grid grid-cols-2 gap-2.5">
        {ticketData.map((item) => {
          const percentage = Math.round((item.value / totalTickets) * 100);
          return (
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
                  {percentage}%
                </span>
                <span className="dark:text-dark-100 text-sm font-semibold text-gray-800">
                  {item.value}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}