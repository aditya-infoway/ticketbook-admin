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
import { exportToExcel, exportToPdf } from "./shared/export";
import { MasterTable } from "./shared/MasterTable";
import { MasterToolbar } from "./shared/MasterToolbar";
import { RegionTypeDataDrawer } from "./RegionTypeDataDrawer";
import { columns, exportColumns } from "./columns";
import type { RegionType } from "./shared/types";
import { Delete, Get, Put } from "../../../../ApiHelper";

export default function RegionTypePage() {
  const [data, setData] = useState<RegionType[]>([]);
  const [loading, setLoading] = useState(false);
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editRegionType, setEditRegionType] = useState<RegionType | null>(null);

  const [showFilters, setShowFilters] = useState(false);
  const [filterStatus, setFilterStatus] = useState("");

  // bump on every open so the drawer remounts and re-reads editRegionType
  const [drawerKey, setDrawerKey] = useState(0);
  const openDrawer = (row: RegionType | null) => {
    setEditRegionType(row);

    setDrawerKey((k) => k + 1);
    setDrawerOpen(true);
  };

  const fetchAll = async () => {
    setLoading(true);
    try {
      // TODO: API fetch
      const res: any = await Get("superadmin/region-type/list", {}, false);
      const rows: any[] = res?.data?.data ?? [];
      setData(
        rows.map((r) => ({
          id: String(r.regionTypeId),
          regionTypeNo: r.regionTypeNo ?? "",
          typeCode: r.typeCode,
          typeName: r.typeName,
          description: r.description ?? "",
          displayOrder: r.displayOrder,
          status: r.status,
          createdBy: r.createdType ?? "",
          createdAt: r.created,
        })),
      );
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || "Failed to load region types",
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
      openEditDrawer: (regionType: RegionType) => openDrawer(regionType),
      deleteRow: async (row: any) => {
        const regionType = row.original;
        {
          try {
            await Delete(
              "superadmin/region-type/delete",
              { regionTypeId: regionType.id },
              false,
            );
            toast.success("Region type deleted successfully");
            fetchAll();
          } catch (err: any) {
            toast.error(err?.response?.data?.message || "Delete failed");
          }
        }
      },
      toggleStatus: async (regionType: RegionType) => {
        const newStatus =
          regionType.status === "Active" ? "Inactive" : "Active";
        try {
          // update validator needs the full payload, not just status
          await Put(
            "superadmin/region-type/update",
            {
              regionTypeId: regionType.id,
              typeCode: regionType.typeCode,
              typeName: regionType.typeName,
              description: regionType.description,
              displayOrder: regionType.displayOrder,
              status: newStatus,
            },
            false,
          );
          toast.success(`Region type marked as ${newStatus}`);
          fetchAll();
        } catch (err: any) {
          toast.error(err?.response?.data?.message || "Status update failed");
        }
      },
    },
  });

  return (
    <Page title="Region / Area Type Master">
      <div className="transition-content w-full pb-5">
        <MasterToolbar
          title="Area Type Master"
          createLabel="Add Region Type"
          searchPlaceholder="Search region types..."
          table={table}
          showFilters={false}
          onToggleFilters={() => setShowFilters((v) => !v)}
          onCreate={() => {
            openDrawer(null);
          }}
          onExportExcel={() =>
            exportToExcel(filteredData, exportColumns, "region_types")
          }
          onExportPdf={() =>
            exportToPdf(
              filteredData,
              exportColumns,
              "Region Type List",
              "region_types",
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
              ? "Loading region types..."
              : "No region types found. Click Add Region Type to add one."
          }
        />
      </div>

      <RegionTypeDataDrawer
        key={drawerKey}
        isOpen={drawerOpen}
        close={() => setDrawerOpen(false)}
        onSaved={fetchAll}
        editRegionType={editRegionType}
      />
    </Page>
  );
}
