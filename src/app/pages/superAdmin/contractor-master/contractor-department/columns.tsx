// src/app/pages/superAdmin/contractor-master/contractor-department/columns.tsx
import { ColumnDef } from "@tanstack/react-table";
import {
  SelectCell,
  SelectHeader,
} from "@/components/shared/table/SelectCheckbox";
import { createRowActions } from "../shared/createRowActions"; // ensure path is right
import { TextCell } from "../shared/tableCells";
import { ExportColumn } from "../shared/export";
import type { ContractorDepartment } from "../shared/types";

const RowActions = createRowActions<ContractorDepartment>("department");

export const columns: ColumnDef<ContractorDepartment>[] = [
  {
    id: "select",
    header: SelectHeader,
    cell: SelectCell,
    enableSorting: false,
  },

  {
    id: "departmentNo",
    accessorKey: "departmentNo",
    header: "Department ID",
    cell: TextCell,
  },
  {
    id: "departmentName",
    accessorKey: "departmentName",
    header: "Department Name",
    cell: TextCell,
  },
  {
    id: "departmentCode",
    accessorKey: "departmentCode",
    header: "Code",
    cell: TextCell,
  },
  {
    id: "description",
    accessorKey: "description",
    header: "Description",
    cell: (info) => (
      <span
        className="block max-w-[250px] truncate"
        title={info.getValue<string>()}
      >
        {info.getValue<string>() || "-"}
      </span>
    ),
  },
  {
    id: "status",
    accessorKey: "status",
    header: "Status",
    cell: ({ row, table }) => {
      const isActive = row.original.status === "Active";

      const handleToggle = () => {
        (table.options.meta as any)?.toggleStatus?.(row.original);
      };

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
    enableSorting: false,
  },
  {
    id: "createdAt",
    accessorKey: "createdAt",
    header: "Created Date",
    cell: TextCell,
  },
  {
    id: "actions",
    header: "Action",
    cell: RowActions,
    enableSorting: false,
  },
];

// 👇 Fixed Export columns
export const exportColumns: ExportColumn<ContractorDepartment>[] = [
  { key: "departmentNo", header: "Department ID" },
  { key: "departmentName", header: "Department Name" },
  { key: "departmentCode", header: "Code" },
  { key: "description", header: "Description" },
  { key: "status", header: "Status" },
  { key: "createdAt", header: "Created Date" },
];
