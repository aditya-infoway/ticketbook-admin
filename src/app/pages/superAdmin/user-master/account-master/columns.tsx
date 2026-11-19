import { ColumnDef } from "@tanstack/react-table";
import {
  SelectCell,
  SelectHeader,
} from "@/components/shared/table/SelectCheckbox";
import { TextCell } from "../shared/tableCells";
import { ExportColumn } from "../shared/export";
import { createRowActions } from "../shared/createRowActions";
import type { Account } from "./shared/types";

const RowActions = createRowActions<Account>("account");

export const columns: ColumnDef<Account>[] = [
  {
    id: "select",
    header: SelectHeader,
    cell: SelectCell,
    enableSorting: false,
  },
  {
    id: "accountName",
    accessorKey: "accountName",
    header: "Account Name",
    cell: TextCell,
  },
  {
    id: "groupName",
    accessorKey: "groupName",
    header: "Group",
    cell: TextCell,
  },
  {
    id: "addressLine1",
    accessorKey: "addressLine1",
    header: "Address",
    cell: TextCell,
  },
  {
    id: "city",
    accessorKey: "city",
    header: "City",
    cell: TextCell,
  },
  {
    id: "state",
    accessorKey: "state",
    header: "State",
    cell: TextCell,
  },
  {
    id: "mobile",
    accessorKey: "mobile",
    header: "Number",
    cell: TextCell,
  },
  {
    id: "openingBalance",
    accessorKey: "openingBalance",
    header: "Opening Balance",
    cell: ({ row }) => (
      <span>
        {row.original.openingBalance.toFixed(2)} {row.original.balanceType}
      </span>
    ),
  },
  {
    id: "actions",
    header: "Actions",
    cell: RowActions,
    enableSorting: false,
  },
];

export const exportColumns: ExportColumn<Account>[] = [
  { key: "accountName", header: "Account Name" },
  { key: "groupName", header: "Group" },
  { key: "addressLine1", header: "Address" },
  { key: "city", header: "City" },
  { key: "state", header: "State" },
  { key: "mobile", header: "Number" },
  { key: "openingBalance", header: "Opening Balance" },
];
