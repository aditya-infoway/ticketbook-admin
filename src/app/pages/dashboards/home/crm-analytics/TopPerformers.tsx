// Local Imports
import { Avatar, Card } from "@/components/ui";

// ----------------------------------------------------------------------

const performers = [
  { id: 1, name: "Travis Fuller", department: "Engineering", rate: 98, avatar: "/images/avatar/avatar-5.jpg" },
  { id: 2, name: "Konnor Guzman", department: "Sales", rate: 95, avatar: "/images/avatar/avatar-18.jpg" },
  { id: 3, name: "Alfredo Elliott", department: "Marketing", rate: 92, avatar: "/images/avatar/avatar-6.jpg" },
  { id: 4, name: "Samantha Shelton", department: "HR", rate: 89, avatar: "/images/avatar/avatar-11.jpg" },
];

export function TopPerformers() {
  return (
    <Card className="h-full p-4 sm:p-5">
      <h2 className="dark:text-dark-50 font-semibold text-gray-800">
        Top Performers
      </h2>
      <p className="mt-0.5 text-xs">Highest resolution rate</p>

      <ul className="mt-6 space-y-5">
        {performers.map((p) => (
          <li key={p.id} className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <Avatar
                size={9}
                src={p.avatar}
                name={p.name}
                initialColor="auto"
                classNames={{ display: "rounded-full" }}
              />
              <div className="min-w-0">
                <p className="dark:text-dark-100 truncate text-sm font-medium text-gray-800">
                  {p.name}
                </p>
                <p className="dark:text-dark-300 truncate text-xs text-gray-400">
                  {p.department}
                </p>
              </div>
            </div>
            <span className="this:success text-this dark:text-this-light text-sm font-semibold">
              {p.rate}%
            </span>
          </li>
        ))}
      </ul>
    </Card>
  );
}