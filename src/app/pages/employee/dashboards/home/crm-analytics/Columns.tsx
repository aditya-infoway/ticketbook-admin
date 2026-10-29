// src/app/(protected)/dashboards/home/TicketColumns.tsx
import { ColumnDef } from "@tanstack/react-table";
import { Badge, Avatar } from "@/components/ui";
import { Ticket, TicketPriority, TicketStatus } from "./data";
import clsx from "clsx";

export const ticketColumns: ColumnDef<Ticket>[] = [
  {
    accessorKey: "ticketId",
    header: "Ticket ID",
    cell: ({ row }) => (
      <span className="font-mono text-xs font-medium text-blue-600 dark:text-blue-400">
        {row.original.ticketId}
      </span>
    ),
  },
  {
    accessorKey: "subject",
    header: "Subject",
    cell: ({ row }) => (
      <div className="max-w-[300px]">
        <p className="truncate font-medium text-gray-800 dark:text-dark-100">
          {row.original.subject}
        </p>
        <p className="text-xs text-gray-500">
          {row.original.createdAt}
        </p>
      </div>
    ),
  },
  {
    accessorKey: "requestedBy",
    header: "Requested By",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Avatar
          size={7}
          src={row.original.requestedBy.avatar}
          name={row.original.requestedBy.name}
          initialColor="auto"
        />
        <div className="flex flex-col">
            <span className="text-xs font-medium">{row.original.requestedBy.name}</span>
            <span className="text-[10px] text-gray-500">{row.original.requestedBy.department}</span>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "priority",
    header: "Priority",
    cell: ({ getValue }) => {
      const priority = getValue<TicketPriority>();
      const color =
        priority === "critical" ? "error" :
        priority === "high" ? "warning" :
        priority === "medium" ? "info" : "neutral";
      
      return (
        <Badge variant="soft" color={color} className="capitalize">
          {priority}
        </Badge>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ getValue }) => {
      const status = getValue<TicketStatus>();
      const active = status === "open" || status === "in-progress";
      return (
        <Badge
          variant="soft"
          color={status === "open" ? "warning" : status === "resolved" ? "success" : "neutral"}
          className="h-5 gap-1.5 rounded-full text-tiny capitalize"
        >
          <span
            className={clsx(
              "size-1.5 rounded-full",
              status === "open" ? "bg-warning" :
              status === "resolved" ? "bg-success" : "bg-gray-400",
            )}
          />
          {status.replace("-", " ")}
        </Badge>
      );
    },
  },
  {
    accessorKey: "assignedTo",
    header: "Assignee",
    cell: ({ getValue }) => (
      <span className="text-xs font-medium">{getValue<string>()}</span>
    ),
  },
];