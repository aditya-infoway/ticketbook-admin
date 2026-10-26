import { ColumnDef } from "@tanstack/react-table";
import { Switch } from "@headlessui/react";
import clsx from "clsx";

import { createRowActions } from "../shared/createRowActions";
import { TextCell } from "../shared/tableCells";
import { DepartmentType, formatDate } from "./data";

import {
  SelectCell,
  SelectHeader,
} from "@/components/shared/table/SelectCheckbox";
const RowActions = createRowActions<DepartmentType>("department type");

export const columns: ColumnDef<DepartmentType>[] = [
     { id: "select", header: SelectHeader, cell: SelectCell, enableSorting: false },
  { id: "typeCode", accessorKey: "typeCode", header: "Type Code", cell: TextCell },
  { id: "typeName", accessorKey: "typeName", header: "Type Name", cell: TextCell },
  {
    id: "description",
    accessorFn: (row) => row.description || "—",
    header: "Description",
    cell: TextCell,
  },
  {
    id: "displayOrder",
    accessorFn: (row) => row.displayOrder || "—",
    header: "Display Order",
    cell: TextCell,
  },
  {
    id: "status",
    accessorKey: "status",
    header: "Status",
    cell: ({ row, table }) => {
      const item = row.original;
      const active = item.status === "Active";
      const meta = table.options.meta as any;
      return (
        <div className="flex items-center gap-2">
          <Switch
            checked={active}
            onChange={() => meta?.toggleStatus?.(item)}
            className={clsx(
              "relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full outline-hidden transition-colors",
              active ? "bg-green-500" : "dark:bg-dark-500 bg-gray-300",
            )}
          >
            <span
              className={clsx(
                "inline-block size-4 rounded-full bg-white transition-transform",
                active ? "translate-x-[1.125rem]" : "translate-x-0.5",
              )}
            />
          </Switch>
          {/* <span className="text-xs">{active ? "Active" : "Inactive"}</span> */}
        </div>
      );
    },
  },
  {
    id: "createdAt",
    accessorFn: (row) => formatDate(row.createdAt),
    header: "Created Date",
    cell: TextCell,
  },
  {
    id: "actions",
    header: "Actions",
    cell: RowActions,
    enableSorting: false,
  },
];

export const exportColumns = [
  { key: "typeCode" as const, header: "Type Code" },
  { key: "typeName" as const, header: "Type Name" },
  { key: "description" as const, header: "Description" },
  { key: "displayOrder" as const, header: "Display Order" },
  { key: "status" as const, header: "Status" },
  { key: "createdAtText" as const, header: "Created Date" },
];