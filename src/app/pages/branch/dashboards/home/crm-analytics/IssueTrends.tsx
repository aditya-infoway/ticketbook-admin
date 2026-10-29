// Import Dependencies
import { 
  CheckCircleIcon, 
  ClockIcon, 
  ExclamationCircleIcon, 
  UserPlusIcon 
} from "@heroicons/react/24/outline";

// Local Imports
import { Card, Avatar } from "@/components/ui";

// ----------------------------------------------------------------------

const activities = [
  {
    id: 1,
    type: "assigned",
    title: "Ticket TKT-8821 assigned to Konnor Guzman",
    desc: "VPN access issue - High Priority",
    time: "10 mins ago",
    icon: UserPlusIcon,
    iconColor: "text-blue-500 bg-blue-500/10 dark:text-blue-400 dark:bg-blue-500/20",
    avatar: "/images/avatar/avatar-18.jpg",
  },
  {
    id: 2,
    type: "resolved",
    title: "Ticket TKT-8823 marked as Resolved",
    desc: "Figma software license request",
    time: "45 mins ago",
    icon: CheckCircleIcon,
    iconColor: "text-emerald-500 bg-emerald-500/10 dark:text-emerald-400 dark:bg-emerald-500/20",
    avatar: "/images/avatar/avatar-11.jpg",
  },
  {
    id: 3,
    type: "critical",
    title: "New Critical Ticket Raised",
    desc: "Email server timeout error (Urgent)",
    time: "1 hr ago",
    icon: ExclamationCircleIcon,
    iconColor: "text-red-500 bg-red-500/10 dark:text-red-400 dark:bg-red-500/20",
    avatar: "/images/avatar/avatar-19.jpg",
  },
  {
    id: 4,
    type: "pending",
    title: "Ticket TKT-8822 is In Progress",
    desc: "Printer issue - 3rd floor",
    time: "2 hrs ago",
    icon: ClockIcon,
    iconColor: "text-amber-500 bg-amber-500/10 dark:text-amber-400 dark:bg-amber-500/20",
    avatar: "/images/avatar/avatar-6.jpg",
  },
];

export function RecentActivity() {
  return (
    <Card className="flex h-full flex-col p-4 sm:p-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="dark:text-dark-50 font-semibold text-gray-800">
            Live Ticket Activity
          </h2>
          <p className="mt-0.5 text-xs text-gray-500 dark:text-dark-300">
            Recent updates from your support team
          </p>
        </div>
        {/* Live Indicator */}
        <div className="flex items-center gap-1.5 rounded-full bg-red-500/10 px-2 py-0.5 text-[10px] font-semibold text-red-500 dark:bg-red-500/20 dark:text-red-400">
          <span className="relative flex size-1.5">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex size-1.5 rounded-full bg-red-500" />
          </span>
          Live
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="mt-5 flex-1 space-y-4">
        {activities.map((item) => {
          const Icon = item.icon;
          return (
            <div 
              key={item.id} 
              className="group relative flex gap-3.5 rounded-lg p-2 transition-colors hover:bg-gray-50 dark:hover:bg-dark-700/40"
            >
              {/* Icon */}
              <div className={`flex size-9 shrink-0 items-center justify-center rounded-full ${item.iconColor}`}>
                <Icon className="size-4.5" />
              </div>

              {/* Content */}
              <div className="flex min-w-0 flex-1 flex-col justify-center">
                <p className="dark:text-dark-100 truncate text-sm font-medium text-gray-800">
                  {item.title}
                </p>
                <p className="dark:text-dark-300 truncate text-xs text-gray-500">
                  {item.desc}
                </p>
                <p className="mt-1 text-[10px] font-medium text-gray-400 dark:text-dark-400">
                  {item.time}
                </p>
              </div>

              {/* Assigned To Avatar */}
              <div className="shrink-0">
                <Avatar
                  size={7}
                  src={item.avatar}
                  name="Agent"
                  initialColor="auto"
                  classNames={{ display: "rounded-full ring-2 ring-white dark:ring-dark-800" }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Button */}
      <div className="mt-4 border-t border-gray-100 pt-4 dark:border-dark-600">
        <button className="w-full rounded-lg bg-gray-50 py-2 text-xs font-semibold text-gray-600 transition-colors hover:bg-gray-100 dark:bg-dark-700/50 dark:text-dark-200 dark:hover:bg-dark-700">
          View All Activity
        </button>
      </div>
    </Card>
  );
}