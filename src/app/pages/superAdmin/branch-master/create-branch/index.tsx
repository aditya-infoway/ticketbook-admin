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
import { Page } from "@/components/shared/Page";
import { Input } from "@/components/ui";
import { exportToExcel, exportToPdf } from "../shared/export";
import { MasterTable } from "../shared/MasterTable";
import { MasterToolbar } from "../shared/MasterToolbar";
import { BranchDataDrawer } from "./BranchDataDrawer";
import { columns, exportColumns } from "./columns";
import type { Branch } from "../shared/types";
import { Delete, Get, Put } from "@/ApiHelper";

export default function BranchPage() {
  const [data, setData] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(false);
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editBranch, setEditBranch] = useState<Branch | null>(null);

  const [showFilters, setShowFilters] = useState(false);
  const [filterStatus, setFilterStatus] = useState("");

  // bump on every open so the drawer remounts and re-reads editBranch
  const [drawerKey, setDrawerKey] = useState(0);
  const openDrawer = (row: Branch | null) => {
    setEditBranch(row);
    setDrawerKey((k) => k + 1);
    setDrawerOpen(true);
  };

  const fetchAll = async () => {
    setLoading(true);
    try {
      const res: any = await Get("superadmin/branch/list", {}, false);
      const rows: any[] = res?.data?.data ?? [];
      setData(
        rows.map((r) => ({
          ...r,
          id: String(r.branchId),
          createdAt: r.created,
        })),
      );
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to load branches");
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

  // Setup the table with meta options for the action column
  const table = useReactTable({
    data: filteredData,
    columns, // 👈 Pass the static columns directly
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
    // 👈 This is required for the action buttons to work
    meta: {
      openEditDrawer: (branch: Branch) => openDrawer(branch),
      deleteRow: async (row: any) => {
        const branch = row.original;
        if (
          window.confirm(
            `Are you sure you want to delete ${branch.branchName}?`,
          )
        ) {
          try {
            await Delete(
              "superadmin/branch/delete",
              { branchId: branch.id },
              false,
            );
            toast.success("Branch deleted successfully");
            fetchAll();
          } catch (err: any) {
            toast.error(err?.response?.data?.message || "Delete failed");
          }
        }
      },

      
      toggleStatus: async (branch: Branch) => {
        const newStatus = branch.status === "Active" ? "Inactive" : "Active";
        try {
          // update validator needs the full payload (password stays unchanged when omitted)
          await Put(
            "superadmin/branch/update",
            {
              branchId: branch.id,
              branchCode: branch.branchCode,
              branchName: branch.branchName,
              regionId: branch.regionId || null,
              country: branch.country,
              state: branch.state,
              city: branch.city,
              fullAddress: branch.fullAddress,
              pinCode: branch.pinCode,
              contactNumber: String(branch.contactNumber || ""),
              phoneNumber: String(branch.phoneNumber || ""),
              branchEmail: branch.branchEmail,
              branchManager: branch.branchManager,
              areaManager: branch.areaManager,
              openingDate: branch.openingDate,
              workingHours: branch.workingHours,
              status: newStatus,
            },
            false,
          );
          toast.success(`Branch marked as ${newStatus}`);
          fetchAll();
        } catch (err: any) {
          toast.error(err?.response?.data?.message || "Status update failed");
        }
      },
    },
  });

  return (
    <Page title="Branch Master">
      <div className="transition-content w-full pb-5">
        <MasterToolbar
          title="Branch Master"
          createLabel="Add Branch"
          searchPlaceholder="Search branches..."
          table={table}
          showFilters={false}
          onToggleFilters={() => setShowFilters((v) => !v)}
          onCreate={() => {
            openDrawer(null);
          }}
          onExportExcel={() =>
            exportToExcel(filteredData, exportColumns, "branches")
          }
          onExportPdf={() =>
            exportToPdf(filteredData, exportColumns, "Branch List", "branches")
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
              ? "Loading branches..."
              : "No branches found. Click Add Branch to add one."
          }
        />
      </div>

      <BranchDataDrawer
        key={drawerKey}
        isOpen={drawerOpen}
        close={() => setDrawerOpen(false)}
        onSaved={fetchAll}
        editBranch={editBranch}
      />
    </Page>
  );
}
