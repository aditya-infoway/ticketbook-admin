import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  RowSelectionState,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Delete, Get, Put } from "@/ApiHelper";
import { Page } from "@/components/shared/Page";
import { Input } from "@/components/ui";
import { exportToExcel, exportToPdf } from "../shared/export";
import { MasterTable } from "../shared/MasterTable";
import { MasterToolbar } from "../shared/MasterToolbar";
import { TicketStatusDataDrawer } from "./TicketStatusDataDrawer";
import { columns, exportColumns } from "./columns";
import type { TicketStatus } from "../shared/types";

function mapApiStatus(item: any): TicketStatus {
  return {
    id: String(item.ticketStatusId),
    ticketStatusNo: item.ticketStatusNo ?? "",
    statusCode: item.statusCode ?? "",
    statusName: item.statusName ?? "",
    description: item.description ?? "",
    displayOrder: item.displayOrder ?? 0,
    status: item.status ?? "Active",
    createdBy: item.createdBy ?? "",
    createdAt: item.created ?? "",
  };
}

export default function TicketStatusPage() {
  const [data, setData] = useState<TicketStatus[]>([]);
  const [loading, setLoading] = useState(false);
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editStatus, setEditStatus] = useState<TicketStatus | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filterStatus, setFilterStatus] = useState("");

  // bump on every open so the drawer remounts and re-reads editStatus
  const [drawerKey, setDrawerKey] = useState(0);
  const openDrawer = (row: TicketStatus | null) => {
    setEditStatus(row);
    setDrawerKey((k) => k + 1);
    setDrawerOpen(true);
  };

  const fetchAll = async () => {
    setLoading(true);
    try {
      const res: any = await Get("superadmin/ticket-status/list", {}, false);
      const rows: any[] = res?.data?.data ?? [];
      setData(rows.map(mapApiStatus));
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || "Failed to load ticket statuses",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      if (filterStatus && item.status !== filterStatus) return false;
      return true;
    });
  }, [data, filterStatus]);

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { globalFilter, sorting, rowSelection },
    enableRowSelection: true,
    getRowId: (row) => row.id,
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    meta: {
      openEditDrawer: (status: TicketStatus) => openDrawer(status),
      deleteRow: async (row: any) => {
        const status = row.original;
        try {
          await Delete(
            "superadmin/ticket-status/delete",
            { ticketStatusId: status.id },
            false,
          );
          toast.success("Status deleted successfully");
          fetchAll();
        } catch (err: any) {
          toast.error(err?.response?.data?.message || "Delete failed");
        }
      },
      toggleStatus: async (status: TicketStatus) => {
        try {
          const newStatus = status.status === "Active" ? "Inactive" : "Active";
          await Put(
            "superadmin/ticket-status/update",
            {
              ticketStatusId: status.id,
              statusCode: status.statusCode,
              statusName: status.statusName,
              description: status.description,
              displayOrder: status.displayOrder,
              status: newStatus,
            },
            false,
          );
          toast.success(`Status marked as ${newStatus}`);
          fetchAll();
        } catch (err: any) {
          toast.error(err?.response?.data?.message || "Status update failed");
        }
      },
    },
  });

  return (
    <Page title="Ticket Status Master">
      <div className="transition-content w-full pb-5">
        <MasterToolbar
          title="Ticket Status Master"
          createLabel="Add Status"
          searchPlaceholder="Search statuses..."
          table={table}
          showFilters={showFilters}
          onToggleFilters={() => setShowFilters((v) => !v)}
          onCreate={() => openDrawer(null)}
          onExportExcel={() =>
            exportToExcel(filteredData, exportColumns, "ticket_statuses")
          }
          onExportPdf={() =>
            exportToPdf(
              filteredData,
              exportColumns,
              "Ticket Statuses",
              "ticket_statuses",
            )
          }
          filterPanel={
            <div className="grid gap-4 sm:grid-cols-1">
              <Input
                label="Status"
                placeholder="Active / Inactive"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              />
            </div>
          }
        />

        <MasterTable
          table={table}
          columnCount={columns.length}
          emptyMessage={
            loading
              ? "Loading statuses..."
              : "No statuses found. Click Add Status to add one."
          }
        />
      </div>

      <TicketStatusDataDrawer
        key={drawerKey}
        isOpen={drawerOpen}
        close={() => setDrawerOpen(false)}
        onSaved={fetchAll}
        editStatus={editStatus}
      />
    </Page>
  );
}