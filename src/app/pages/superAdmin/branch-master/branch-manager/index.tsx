import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  RowSelectionState,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Page } from "@/components/shared/Page";
import { exportToExcel, exportToPdf } from "../shared/export";
import { MasterTable } from "../shared/MasterTable";
import { MasterToolbar } from "../shared/MasterToolbar";
import { BranchManagerDrawer } from "./BranchManagerDrawer";
import { columns, exportColumns } from "./Columns";
import type { BranchManager } from "../shared/types";
import { Delete, Get, Put } from "@/ApiHelper";

export default function BranchManagerListPage() {
  const [data, setData] = useState<BranchManager[]>([]);
  const [loading, setLoading] = useState(false);
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedManager, setSelectedManager] = useState<BranchManager | null>(
    null,
  );
  const [drawerKey, setDrawerKey] = useState(0);

  const openDrawer = (row: BranchManager | null) => {
    setSelectedManager(row);
    setDrawerKey((k) => k + 1);
    setDrawerOpen(true);
  };

  const fetchAll = async () => {
    setLoading(true);
    try {
      const res: any = await Get("superadmin/branch-manager/list", {}, false);
      if (res?.data?.success) {
        setData(
          (res.data.data ?? []).map((r: any) => ({
            ...r,
            id: String(r.branchManagerId ?? r.id),
          })),
        );
      } else {
        toast.error(res?.data?.message || "Failed to load branch managers.");
      }
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || "Failed to load branch managers.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const table = useReactTable({
    data,
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
      // 👇 This matches the exact key your createRowActions uses
      openEditDrawer: (row: BranchManager) => openDrawer(row),

      deleteRow: async (row: any) => {
        try {
          const res: any = await Delete(
            "superadmin/branch-manager/delete",
            { branchManagerId: row.original.id },
            false,
          );
          if (res?.data?.success) {
            toast.success(res.data.message || "Deleted successfully");
            fetchAll();
          } else {
            toast.error(res?.data?.message || "Delete failed");
          }
        } catch (err: any) {
          toast.error(err?.response?.data?.message || "Delete failed");
        }
      },
      toggleStatus: async (m: BranchManager) => {
        const newStatus = m.status === "Active" ? "Inactive" : "Active";
        try {
          const res: any = await Put(
            "superadmin/branch-manager/update",
            {
              branchManagerId: m.id,
              name: m.name,
              gender: m.gender,
              status: newStatus,
              mobileNumber: m.mobileNumber,
              alternateMobile: m.alternateMobile,
              email: m.email,
              address: m.address,
              city: m.city,
              state: m.state,
              pinCode: m.pinCode,
              areaId: m.areaId,
              branchId: m.branchId,
              reportingTo: m.reportingTo,
              description: m.description,
              joiningDate: m.joiningDate,
            },
            false,
          );
          if (res?.data?.success) {
            toast.success(`Status changed to ${newStatus}`);
            fetchAll();
          } else {
            toast.error(res?.data?.message || "Status update failed");
          }
        } catch (err: any) {
          toast.error(err?.response?.data?.message || "Status update failed");
        }
      },
    } as any,
  });

  return (
    <Page title="Branch Managers">
      <div className="transition-content w-full pb-5">
        <MasterToolbar
          title="Branch Managers"
          searchPlaceholder="Search branch managers..."
          table={table}
          showFilters={false}
          onToggleFilters={() => {}}
          onExportExcel={() =>
            exportToExcel(data, exportColumns, "branch_managers")
          }
          onExportPdf={() =>
            exportToPdf(
              data,
              exportColumns,
              "Branch Managers",
              "branch_managers",
            )
          }
          onCreate={() => openDrawer(null)}
          createLabel="Add Branch Manager"
        />

        <MasterTable
          table={table}
          columnCount={columns.length}
          emptyMessage={loading ? "Loading..." : "No branch managers found."}
        />
      </div>

      <BranchManagerDrawer
        key={drawerKey}
        isOpen={drawerOpen}
        close={() => setDrawerOpen(false)}
        onSaved={fetchAll}
        manager={selectedManager}
      />
    </Page>
  );
}
