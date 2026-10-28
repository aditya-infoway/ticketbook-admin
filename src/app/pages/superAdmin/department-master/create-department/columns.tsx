import { ColumnDef } from "@tanstack/react-table";

import {
  SelectCell,
  SelectHeader,
} from "@/components/shared/table/SelectCheckbox";
// NOTE: adjust to where your shared master files live
import { createRowActions } from "../shared/createRowActions";
import { TextCell } from "@/app/pages/dashboards/home/crm-analytics/shared/tableCells";
import { Department, formatDateTime } from "./data";
import { getScopeLabel } from "./options";

const RowActions = createRowActions<Department>("department");

export const columns: ColumnDef<Department>[] = [
  { id: "select", header: SelectHeader, cell: SelectCell, enableSorting: false },
  {
    id: "departmentNo",
    accessorFn: (row) => row.departmentNo || "—",
    header: "Department ID",
    cell: TextCell,
  },
  { id: "code", accessorKey: "code", header: "Code", cell: TextCell },
  { id: "name", accessorKey: "name", header: "Department Name", cell: TextCell },
  {
    id: "type",
    accessorFn: (row) => row.typeName || "—",
    header: "Type",
    cell: TextCell,
  },
  {
    id: "parent",
    accessorFn: (row) => row.parentName || "—",
    header: "Parent Department",
    cell: TextCell,
  },
  {
    id: "scope",
    accessorFn: (row) => getScopeLabel(row.scope),
    header: "Scope",
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
      const isActive = item.status === "Active";
      const meta = table.options.meta as any;

      const handleToggle = () => meta?.toggleStatus?.(item);

      return (
        <button
          type="button"
          onClick={handleToggle}
          className={`focus-visible:ring-primary-500 relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
            isActive ? "bg-primary-500" : "dark:bg-dark-600 bg-gray-300"
          }`}
          title={`Mark as ${isActive ? "Inactive" : "Active"}`}
        >
          <span
            className={`pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
              isActive ? "translate-x-2" : "-translate-x-2"
            }`}
          />
        </button>
      );
    },
  },
  {
    id: "createdBy",
    accessorFn: (row) => row.createdBy || "—",
    header: "Created By",
    cell: TextCell,
  },
  {
    id: "createdAt",
    accessorFn: (row) => formatDateTime(row.createdAt),
    header: "Created At",
    cell: TextCell,
  },
  { id: "actions", header: "Action", cell: RowActions, enableSorting: false },
];

export const exportColumns = [
  { key: "departmentNo" as const, header: "Department ID" },
  { key: "code" as const, header: "Code" },
  { key: "name" as const, header: "Department Name" },
  { key: "typeName" as const, header: "Type" },
  { key: "parentName" as const, header: "Parent Department" },
  { key: "scopeName" as const, header: "Scope" },
  { key: "displayOrder" as const, header: "Display Order" },
  { key: "status" as const, header: "Status" },
  { key: "createdBy" as const, header: "Created By" },
  { key: "createdAtText" as const, header: "Created At" },
];