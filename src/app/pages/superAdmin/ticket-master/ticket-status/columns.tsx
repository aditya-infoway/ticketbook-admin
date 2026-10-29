import { ColumnDef } from "@tanstack/react-table";
import {
  SelectCell,
  SelectHeader,
} from "@/components/shared/table/SelectCheckbox";
import { createRowActions } from "../shared/createRowActions";
import { TextCell } from "../shared/tableCells";
import { ExportColumn } from "../shared/export";
import type { TicketStatus } from "../shared/types";

const RowActions = createRowActions<TicketStatus>("ticket status");

export const columns: ColumnDef<TicketStatus>[] = [
  {
    id: "select",
    header: SelectHeader,
    cell: SelectCell,
    enableSorting: false,
  },
  {
    id: "ticketStatusNo",
    accessorKey: "ticketStatusNo",
    header: "Status ID",
    cell: TextCell,
  },
  {
    id: "statusCode",
    accessorKey: "statusCode",
    header: "Status Code",
    cell: TextCell,
  },
  {
    id: "statusName",
    accessorKey: "statusName",
    header: "Status Name",
    cell: TextCell,
  },
  {
    id: "description",
    accessorKey: "description",
    header: "Description",
    cell: TextCell,
  },
  {
    id: "displayOrder",
    accessorKey: "displayOrder",
    header: "Display Order",
    cell: TextCell,
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
    id: "actions",
    header: "Action",
    cell: RowActions,
    enableSorting: false,
  },
];

export const exportColumns: ExportColumn<TicketStatus>[] = [
  { key: "ticketStatusNo", header: "Status ID" },
  { key: "statusCode", header: "Status Code" },
  { key: "statusName", header: "Status Name" },
  { key: "description", header: "Description" },
  { key: "displayOrder", header: "Display Order" },
  { key: "status", header: "Status" },
];