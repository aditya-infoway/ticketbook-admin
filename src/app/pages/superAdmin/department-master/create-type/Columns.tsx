import { ColumnDef } from "@tanstack/react-table";

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