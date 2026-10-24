// Import Dependencies
import { ColumnDef } from "@tanstack/react-table";
import {
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  Transition,
} from "@headlessui/react";
import { EllipsisHorizontalIcon } from "@heroicons/react/20/solid";
import { Fragment } from "react";
import clsx from "clsx";

// Local Imports
import { Avatar, Badge, Button, Checkbox } from "@/components/ui";
import { Employee, EmployeeStatus } from "./data";

// ----------------------------------------------------------------------

export const columns: ColumnDef<Employee>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        indeterminate={table.getIsSomePageRowsSelected()}
        onChange={table.getToggleAllPageRowsSelectedHandler()}
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        disabled={!row.getCanSelect()}
        onChange={row.getToggleSelectedHandler()}
      />
    ),
    enableSorting: false,
  },
  {
    accessorKey: "name",
    header: "Employee",
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <Avatar
          size={9}
          src={row.original.avatar}
          name={row.original.name}
          initialColor="auto"
          classNames={{ display: "rounded-full" }}
        />
        <div>
          <p className="dark:text-dark-100 font-medium text-gray-800">
            {row.original.name}
          </p>
          <p className="dark:text-dark-300 text-xs text-gray-400">
            {row.original.empCode}
          </p>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "department",
    header: "Department",
  },
  {
    accessorKey: "openIssues",
    header: "Issues",
    cell: ({ getValue }) => {
      const count = getValue<number>();
      return count > 0 ? (
        <Badge variant="soft" color="error" className="h-5 rounded-full text-tiny">
          {count} Open
        </Badge>
      ) : (
        <span className="text-gray-400">-</span>
      );
    },
  },
  {
    accessorKey: "pendingRequests",
    header: "Requests",
    cell: ({ getValue }) => {
      const count = getValue<number>();
      return count > 0 ? (
        <Badge variant="soft" color="warning" className="h-5 rounded-full text-tiny">
          {count} Pending
        </Badge>
      ) : (
        <span className="text-gray-400">-</span>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ getValue }) => {
      const active = getValue<EmployeeStatus>() === "active";
      return (
        <Badge
          variant="soft"
          color={active ? "success" : "neutral"}
          className="h-5 gap-1.5 rounded-full text-tiny"
        >
          <span
            className={clsx(
              "size-1.5 rounded-full",
              active ? "bg-success" : "bg-gray-400",
            )}
          />
          {active ? "Active" : "On Leave"}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    header: "Action",
    enableSorting: false,
    cell: ({ row, table }) => (
      <Menu as="div" className="relative inline-block text-left">
        <MenuButton
          as={Button}
          variant="flat"
          isIcon
          className="size-8 rounded-full"
        >
          <EllipsisHorizontalIcon className="size-5" />
        </MenuButton>
        <Transition
          as={Fragment}
          enter="transition ease-out"
          enterFrom="opacity-0 translate-y-2"
          enterTo="opacity-100 translate-y-0"
          leave="transition ease-in"
          leaveFrom="opacity-100 translate-y-0"
          leaveTo="opacity-0 translate-y-2"
        >
          <MenuItems className="dark:border-dark-500 dark:bg-dark-700 absolute z-100 mt-1.5 min-w-[9rem] rounded-lg border border-gray-300 bg-white py-1 shadow-lg shadow-gray-200/50 outline-hidden ltr:right-0 rtl:left-0 dark:shadow-none">
            <MenuItem>
              {({ focus }) => (
                <button
                  className={clsx(
                    "flex h-9 w-full items-center px-3 tracking-wide outline-hidden transition-colors",
                    focus && "dark:bg-dark-600 bg-gray-100",
                  )}
                  onClick={() => table.options.meta?.openEditDrawer?.(row.original)}
                >
                  View
                </button>
              )}
            </MenuItem>
            <MenuItem>
              {({ focus }) => (
                <button
                  className={clsx(
                    "text-error flex h-9 w-full items-center px-3 tracking-wide outline-hidden transition-colors",
                    focus && "dark:bg-dark-600 bg-gray-100",
                  )}
                  onClick={() => table.options.meta?.deleteRow?.(row)}
                >
                  Delete
                </button>
              )}
            </MenuItem>
          </MenuItems>
        </Transition>
      </Menu>
    ),
  },
];

// NOTE: match this shape with the exportColumns in your existing master pages
// (the one used by exportToExcel / exportToPdf).
export const exportColumns = [
  { header: "Employee", accessor: "name" },
  { header: "Code", accessor: "empCode" },
  { header: "Department", accessor: "department" },
  { header: "Open Issues", accessor: "openIssues" },
  { header: "Pending Requests", accessor: "pendingRequests" },
  { header: "Status", accessor: "status" },
];