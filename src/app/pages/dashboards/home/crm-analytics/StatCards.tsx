// Import Dependencies
import { ArrowTrendingDownIcon, ArrowTrendingUpIcon } from "@heroicons/react/20/solid";

// ----------------------------------------------------------------------

interface Stat {
  label: string;
  value: string;
  trend: string;
  direction: "up" | "down";
  gradient: string; // CSS gradient for the card background
}

const stats: Stat[] = [
  {
    label: "Total Employees",
    value: "1,248",
    trend: "+12 this month",
    direction: "up",
    gradient: "linear-gradient(135deg, #0b86d1 0%, #0a5d9c 100%)",
  },
  {
    label: "Active Issues",
    value: "84",
    trend: "-8% vs last month",
    direction: "down",
    gradient: "linear-gradient(135deg, #ffb300 0%, #ff6d00 100%)",
  },
  {
    label: "Pending Requests",
    value: "156",
    trend: "+15% vs last month",
    direction: "up",
    gradient: "linear-gradient(135deg, #ff2d9a 0%, #f43f5e 100%)",
  },
  {
    label: "Avg Resolution Time",
    value: "2.4 Days",
    trend: "-0.5 days",
    direction: "down",
    gradient: "linear-gradient(135deg, #10b981 0%, #047857 100%)",
  },
];

export function StatCards() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:gap-6 xl:grid-cols-4">
      {stats.map((stat) => {
        const Icon =
          stat.direction === "up" ? ArrowTrendingUpIcon : ArrowTrendingDownIcon;

        return (
          <div
            key={stat.label}
            className="relative flex min-h-28 flex-col justify-between overflow-hidden rounded-xl p-4 text-white shadow-sm sm:p-5"
            style={{ background: stat.gradient }}
          >
            {/* Decorative shape */}
            <div className="pointer-events-none absolute -top-6 -right-6 size-24 rotate-12 rounded-3xl bg-white/15" />

            <div className="relative">
              <p className="text-xs-plus font-medium tracking-wide uppercase">
                {stat.label}
              </p>
              <p className="mt-1 text-3xl font-semibold">{stat.value}</p>
            </div>

            <div className="relative mt-4 flex items-end justify-between gap-2">
              <span className="inline-flex h-5 items-center gap-1 rounded-full bg-white/20 px-2 text-tiny font-medium">
                <Icon className="size-3" />
                {stat.trend}
              </span>
              <button
                type="button"
                className="text-xs font-semibold underline underline-offset-4 hover:opacity-80"
              >
                Get Report
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}