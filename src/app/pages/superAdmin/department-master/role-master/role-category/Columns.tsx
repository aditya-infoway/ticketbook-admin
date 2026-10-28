import { ColumnDef } from "@tanstack/react-table";

import {
  SelectCell,
  SelectHeader,
} from "@/components/shared/table/SelectCheckbox";
// NOTE: shared folder ka path apne project ke hisaab se adjust kar lena
import { createRowActions } from "@/app/pages/dashboards/home/crm-analytics/shared/createRowActions";
import { TextCell } from "@/app/pages/dashboards/home/crm-analytics/shared/tableCells";
import { RoleCategory, formatDate } from "./data";

const RowActions = createRowActions<RoleCategory>("role category");

export const columns: ColumnDef<RoleCategory>[] = [
  {
    id: "select",
    header: SelectHeader,
    cell: SelectCell,
    enableSorting: false,
  },
  {
    id: "roleCategoryCode",
    accessorKey: "roleCategoryCode",
    header: "Category Code",
    cell: TextCell,
  },
  {
    id: "roleCategoryName",
    accessorKey: "roleCategoryName",
    header: "Category Name",
    cell: TextCell,
  },
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
    // number ki tarah sort karo, khali (—) wale hamesha end me
    sortingFn: (a, b) => {
      const x = a.original.displayOrder
        ? Number(a.original.displayOrder)
        : Infinity;
      const y = b.original.displayOrder
        ? Number(b.original.displayOrder)
        : Infinity;
      if (x === y) return 0;
      return x - y;
    },
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
  { key: "roleCategoryCode" as const, header: "Category Code" },
  { key: "roleCategoryName" as const, header: "Category Name" },
  { key: "description" as const, header: "Description" },
  { key: "displayOrder" as const, header: "Display Order" },
  { key: "status" as const, header: "Status" },
  { key: "createdAtText" as const, header: "Created Date" },
];