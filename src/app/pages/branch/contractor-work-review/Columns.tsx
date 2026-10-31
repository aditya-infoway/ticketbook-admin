import { ColumnDef } from "@tanstack/react-table";
import { EyeIcon } from "@heroicons/react/24/outline";
import {
  SelectCell,
  SelectHeader,
} from "@/components/shared/table/SelectCheckbox";
import { TextCell } from "../shared/tableCells";
import { ExportColumn } from "../shared/export";

export type ContractorReview = {
  id: string;
  ticketId: string;
  ticketNo: string;
  ticketNumber: string;
  ticketTitle: string;
  branchName: string;
  departmentName: string;
  contractorId: string;
  contractorName: string;
  completionDate: string;
  completionRemarks: string;
  attachments: string[];
  status: string;
};

// Action: Review (drawer me details + reassign)
function ReviewActions({ row, table }: any) {
  const meta = table.options.meta as any;
  return (
    <button
      type="button"
      title="Review"
      onClick={() => meta?.openReview?.(row.original)}
      className="text-primary-600 hover:bg-primary-50 dark:hover:bg-dark-600 inline-flex cursor-pointer items-center gap-1 rounded-md px-2 py-1 text-xs font-medium"
    >
      <EyeIcon className="size-4" />
      Review
    </button>
  );
}

export const columns: ColumnDef<ContractorReview>[] = [
  {
    id: "select",
    header: SelectHeader,
    cell: SelectCell,
    enableSorting: false,
  },
  {
    id: "ticketNumber",
    accessorKey: "ticketNumber",
    header: "Ticket ID",
    cell: TextCell,
  },
  {
    id: "ticketTitle",
    accessorKey: "ticketTitle",
    header: "Ticket Title",
    cell: TextCell,
  },
  {
    id: "branchName",
    accessorKey: "branchName",
    header: "Branch",
    cell: TextCell,
  },
  {
    id: "departmentName",
    accessorKey: "departmentName",
    header: "Department",
    cell: TextCell,
  },
  {
    id: "contractorName",
    accessorKey: "contractorName",
    header: "Contractor",
    cell: TextCell,
  },
  {
    id: "completionDate",
    accessorKey: "completionDate",
    header: "Completion Date",
    cell: TextCell,
  },
  {
    id: "completionRemarks",
    accessorKey: "completionRemarks",
    header: "Completion Remarks",
    cell: TextCell,
  },
  {
    id: "attachments",
    accessorFn: (r) => r.attachments?.length || 0,
    header: "Attachments",
    cell: (info) => {
      const n = info.getValue<number>();
      return (
        <span className="text-xs text-gray-600 dark:text-gray-300">
          {n ? `${n} file${n > 1 ? "s" : ""}` : "-"}
        </span>
      );
    },
    enableSorting: false,
  },
  {
    id: "status",
    accessorKey: "status",
    header: "Status",
    cell: (info) => (
      <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
        {info.getValue<string>() || "Submitted for Review"}
      </span>
    ),
    enableSorting: false,
  },
  {
    id: "actions",
    header: "Action",
    cell: ReviewActions,
    enableSorting: false,
  },
];

export const exportColumns: ExportColumn<ContractorReview>[] = [
  { key: "ticketNumber", header: "Ticket ID" },
  { key: "ticketTitle", header: "Ticket Title" },
  { key: "branchName", header: "Branch" },
  { key: "departmentName", header: "Department" },
  { key: "contractorName", header: "Contractor" },
  { key: "completionDate", header: "Completion Date" },
  { key: "completionRemarks", header: "Completion Remarks" },
  { key: "status", header: "Status" },
];