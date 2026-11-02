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
import { exportToExcel, exportToPdf } from "./shared/export";
import { MasterTable } from "./shared/MasterTable";
import { MasterToolbar } from "./shared/MasterToolbar";
import { AreaManagerDrawer } from "./Drawer";
import { columns, exportColumns } from "./Columns";
import type { AreaManager } from "./shared/types";
import { Delete, Get, Put } from "@/ApiHelper";

export default function AreaManagerListPage() {
  const [data, setData] = useState<AreaManager[]>([]);
  const [loading, setLoading] = useState(false);
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  // Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedManager, setSelectedManager] = useState<AreaManager | null>(
    null,
  );
  const [drawerKey, setDrawerKey] = useState(0);

  const openDrawer = (row: AreaManager | null) => {
    setSelectedManager(row);
    setDrawerKey((k) => k + 1);
    setDrawerOpen(true);
  };
  const [areas, setAreas] = useState<
    { id: string; label: string; active: boolean }[]
  >([]);

  const fetchAreas = async () => {
    try {
      const res: any = await Get("superadmin/region/list", {}, false);
      setAreas(
        (res?.data?.data ?? []).map((r: any) => ({
          id: String(r.regionId),
          label: r.regionName,
          active: r.status === "Active",
        })),
      );
    } catch {
      toast.error("Failed to load areas.");
    }
  };

  const fetchAll = async () => {
    setLoading(true);
    try {
      const res: any = await Get("superadmin/area-manager/list", {}, false);
      if (res?.data?.success) {
        setData(
          (res.data.data ?? []).map((r: any) => ({
            ...r,
            id: String(r.areaManagerId ?? r.id),
          })),
        );
      } else {
        toast.error(res?.data?.message || "Failed to load area managers.");
      }
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || "Failed to load area managers.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAreas();
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
      openEditDrawer: (row: AreaManager) => openDrawer(row),

      deleteRow: async (row: any) => {
        try {
          const res: any = await Delete(
            "superadmin/area-manager/delete",
            { areaManagerId: row.original.id },
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

      toggleStatus: async (m: AreaManager) => {
        const newStatus = m.status === "Active" ? "Inactive" : "Active";
        try {
          const res: any = await Put(
            "superadmin/area-manager/update",
            {
              areaManagerId: m.id,
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
    <Page title="Area Managers">
      <div className="transition-content w-full pb-5">
        <MasterToolbar
          title="Area Managers"
          searchPlaceholder="Search area managers..."
          table={table}
          showFilters={false}
          onToggleFilters={() => {}}
          onExportExcel={() =>
            exportToExcel(data, exportColumns, "area_managers")
          }
          onExportPdf={() =>
            exportToPdf(data, exportColumns, "Area Managers", "area_managers")
          }
          onCreate={() => openDrawer(null)}
          createLabel="Add Area Manager"
        />

        <MasterTable
          table={table}
          columnCount={columns.length}
          emptyMessage={loading ? "Loading..." : "No area managers found."}
        />
      </div>

      {/* Added key prop to force drawer reset on edit/create */}
      <AreaManagerDrawer
        key={drawerKey}
        isOpen={drawerOpen}
        close={() => setDrawerOpen(false)}
        onSaved={fetchAll}
        manager={selectedManager}
        areas={areas.filter(
          (a) => a.active || a.id === selectedManager?.areaId,
        )}
      />
    </Page>
  );
}
