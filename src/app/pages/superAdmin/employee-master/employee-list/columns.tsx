import { ColumnDef } from "@tanstack/react-table";
import {
  SelectCell,
  SelectHeader,
} from "@/components/shared/table/SelectCheckbox";
import { createRowActions } from "../shared/createRowActions";
import { TextCell } from "../shared/tableCells";
import { ExportColumn } from "../shared/export";
import type { Employee } from "../shared/types";

const RowActions = createRowActions<Employee>("employee");

export const columns: ColumnDef<Employee>[] = [
  {
    id: "select",
    header: SelectHeader,
    cell: SelectCell,
    enableSorting: false,
  },
  {
    id: "employeeName",
    accessorKey: "employeeName",
    header: "Employee Name",
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <div className="dark:bg-dark-700 h-8 w-8 shrink-0 overflow-hidden rounded-full bg-gray-100">
          {row.original.profilePhoto ? (
            <img
              src={row.original.profilePhoto}
              alt="Avatar"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs font-medium text-gray-500">
              {row.original.employeeName?.charAt(0) || "E"}
            </div>
          )}
        </div>
        <div className="flex flex-col">
          <span className="font-medium text-gray-900 dark:text-gray-100">
            {row.original.employeeName}
          </span>
          <span className="text-xs text-gray-500">
            {row.original.employeeCode}
          </span>
        </div>
      </div>
    ),
  },
  {
    id: "designationName",
    accessorKey: "designationName",
    header: "Designation",
    cell: TextCell,
  },
  {
    id: "employeeNo",
    accessorKey: "employeeNo",
    header: "Employee ID",
    cell: TextCell,
  },
  {
    id: "employeeTypeName",
    accessorKey: "employeeTypeName",
    header: "Type",
    cell: TextCell,
  },
  {
    id: "roleName",
    accessorKey: "roleName",
    header: "Role",
    cell: TextCell,
  },
  {
    id: "mobileNumber",
    accessorKey: "mobileNumber",
    header: "Mobile",
    cell: ({ row }) => (
      <span className="text-sm">
        {row.original.mobileCountryCode
          ? `+${row.original.mobileCountryCode} `
          : ""}
        {row.original.mobileNumber || "—"}
      </span>
    ),
  },
  {
    id: "officialEmail",
    accessorKey: "officialEmail",
    header: "Email",
    cell: TextCell,
  },
  {
    id: "dateOfJoining",
    accessorKey: "dateOfJoining",
    header: "DOJ",
    cell: TextCell,
  },
  {
    id: "status",
    accessorKey: "employmentStatus",
    header: "Status",
    cell: ({ row, table }) => {
      const isActive = row.original.employmentStatus === "Active";

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
    id: "actions",
    header: "Action",
    cell: RowActions,
    enableSorting: false,
  },
];

export const exportColumns: ExportColumn<Employee>[] = [
  { key: "employeeNo", header: "Employee ID" },
  { key: "employeeCode", header: "Employee Code" },
  { key: "employeeName", header: "Employee Name" },
   { key: "roleName", header: "Role" },
  { key: "designationName", header: "Designation" },
  { key: "employeeTypeName", header: "Employee Type" },
  { key: "officialEmail", header: "Email" },
  { key: "mobileNumber", header: "Mobile" },
  { key: "dateOfJoining", header: "Date of Joining" },
  { key: "employmentStatus", header: "Status" },
];
