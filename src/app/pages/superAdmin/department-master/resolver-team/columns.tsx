import { ColumnDef } from "@tanstack/react-table";
import {
  SelectCell,
  SelectHeader,
} from "@/components/shared/table/SelectCheckbox";
import { createRowActions } from "../shared/createRowActions";
import { TextCell } from "../shared/tableCells";
import { ExportColumn } from "../shared/export";
import type { ResolverTeam } from "../shared/types";

const RowActions = createRowActions<ResolverTeam>("resolver team");

export const columns: ColumnDef<ResolverTeam>[] = [
  {
    id: "select",
    header: SelectHeader,
    cell: SelectCell,
    enableSorting: false,
  },
  {
    id: "resolverTeamNo",
    accessorKey: "resolverTeamNo",
    header: "Team ID",
    cell: TextCell,
  },
  {
    id: "teamName",
    accessorKey: "teamName",
    header: "Team Name",
    cell: TextCell,
  },
  {
    id: "departmentName",
    accessorKey: "departmentName",
    header: "Department",
    cell: TextCell,
  },
  {
    id: "teamLeaderName",
    accessorKey: "teamLeaderName",
    header: "Team Leader",
    cell: TextCell,
  },
  {
    id: "teamMemberNames",
    accessorKey: "teamMemberNames",
    header: "Members",
    cell: TextCell,
  },
  {
    id: "coverageType",
    accessorKey: "coverageType",
    header: "Coverage",
    cell: TextCell,
  },
  {
    id: "regionName",
    accessorKey: "regionName",
    header: "Region",
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

export const exportColumns: ExportColumn<ResolverTeam>[] = [
  { key: "resolverTeamNo", header: "Team ID" },
  { key: "teamName", header: "Team Name" },
  { key: "departmentName", header: "Department" },
  { key: "teamLeaderName", header: "Team Leader" },
  { key: "teamMemberNames", header: "Members" },
  { key: "coverageType", header: "Coverage" },
  { key: "regionName", header: "Region" },
  { key: "status", header: "Status" },
];
