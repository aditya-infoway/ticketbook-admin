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
import { RegionDataDrawer } from "./RegionDataDrawer";
import { columns, exportColumns } from "./columns";
import type { Region } from "./shared/types";

const seedRegions: Region[] = [
  {
    id: "r1",
    regionCode: "REG-001",
    regionName: "Mumbai Metro",
    regionTypeId: "rt4",
    regionTypeName: "West Region",
    description: "Metropolitan area of Mumbai",
    country: "India",
    state: "Maharashtra",
    city: "Mumbai",
    displayOrder: 1,
    status: "Active",
    createdBy: "System",
    createdAt: "2024-01-15",
  },
  {
    id: "r2",
    regionCode: "REG-002",
    regionName: "Delhi NCR",
    regionTypeId: "rt1",
    regionTypeName: "North Region",
    description: "National Capital Region",
    country: "India",
    state: "Delhi",
    city: "New Delhi",
    displayOrder: 2,
    status: "Active",
    createdBy: "System",
    createdAt: "2024-01-15",
  },
];

export default function RegionPage() {
  const [data, setData] = useState<Region[]>(seedRegions);
  const [loading, setLoading] = useState(false);
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editRegion, setEditRegion] = useState<Region | null>(null);

  const [showFilters, setShowFilters] = useState(false);
  const [filterStatus, setFilterStatus] = useState("");

  const fetchAll = async () => {
    setLoading(true);
    try {
      // TODO: API fetch
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
      openEditDrawer: (region: Region) => {
        setEditRegion(region);
        setDrawerOpen(true);
      },
      deleteRow: (row: any) => {
        const region = row.original;
        if (
          window.confirm(
            `Are you sure you want to delete ${region.regionName}?`,
          )
        ) {
          setData((prev) => prev.filter((b) => b.id !== region.id));
          toast.success("Region deleted successfully");
        }
      },
      toggleStatus: (region: Region) => {
        const newStatus = region.status === "Active" ? "Inactive" : "Active";
        setData((prev) =>
          prev.map((b) =>
            b.id === region.id ? { ...b, status: newStatus } : b,
          ),
        );
        toast.success(`Region marked as ${newStatus}`);
      },
    },
  });

  return (
    <Page title="Region / Area Master">
      <div className="transition-content w-full pb-5">
        <MasterToolbar
          title="Region / Area Master"
          createLabel="Add Region"
          searchPlaceholder="Search regions..."
          table={table}
          showFilters={false}
          onToggleFilters={() => setShowFilters((v) => !v)}
          onCreate={() => {
            setEditRegion(null);
            setDrawerOpen(true);
          }}
          onExportExcel={() =>
            exportToExcel(filteredData, exportColumns, "regions")
          }
          onExportPdf={() =>
            exportToPdf(filteredData, exportColumns, "Region List", "regions")
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
              ? "Loading regions..."
              : "No regions found. Click Add Region to add one."
          }
        />
      </div>

      <RegionDataDrawer
        isOpen={drawerOpen}
        close={() => setDrawerOpen(false)}
        onSaved={fetchAll}
        editRegion={editRegion}
      />
    </Page>
  );
}
