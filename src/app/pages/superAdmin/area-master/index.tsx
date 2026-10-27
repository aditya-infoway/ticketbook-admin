// file: region index.tsx (RegionPage)
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
// import { toast } from "sonner";

import { Page } from "@/components/shared/Page";
// import { Input } from "@/components/ui";
import { Listbox } from "@/components/shared/form/StyledListbox";
import { fuzzyFilter } from "@/utils/react-table/fuzzyFilter";
import {
  Get,
  // Post,
  Put,
  Delete,
  toastsuccessmsg,
  toasterrormsg,
} from "@/ApiHelper";
import { exportToExcel, exportToPdf } from "./shared/export";
import { MasterTable } from "./shared/MasterTable";
import { MasterToolbar } from "./shared/MasterToolbar";
import { RegionDataDrawer } from "./RegionDataDrawer";
import { columns, exportColumns } from "./columns";
import type { Region } from "./shared/types";

// Map API -> Region
function mapApiRegionToRegion(item: any): Region {
  return {
    id: String(item.regionId ?? item.id),
    regionCode: item.regionCode ?? "",
    regionName: item.regionName ?? "",
    regionTypeId: item.regionTypeId ? String(item.regionTypeId) : "",
    regionTypeName: item.regionTypeName ?? item.regionType?.typeName ?? "",
    description: item.description ?? "",
    country: item.country ?? "",
    state: item.state ?? "",
    city: item.city ?? "",
    displayOrder: item.displayOrder ?? 0,
    status: item.status ?? "Active",
    createdBy: item.createdBy ?? "",
    createdAt: item.createdAt ?? "",
  };
}

const ALL: { id: string; label: string } = { id: "", label: "All" };

const STATUS_OPTIONS = [
  { id: "Active", label: "Active" },
  { id: "Inactive", label: "Inactive" },
];

const API = {
  list: "superadmin/region/list",
  create: "superadmin/region/create",
  update: "superadmin/region/update",
  delete: "superadmin/region/delete",
};

export default function RegionPage() {
  const [data, setData] = useState<Region[]>([]);
  const [loading, setLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editRegion, setEditRegion] = useState<Region | null>(null);

  const [showFilters, setShowFilters] = useState(false);
  const [filterStatus, setFilterStatus] = useState("");

  // ---- Fetch regions (list API) ----
  const fetchAll = async () => {
    setLoading(true);
    try {
      const financialYearId = localStorage.getItem("financialYearId");
      const companyId = localStorage.getItem("companyId");

      const res = await Get(
        API.list,
        {
          ...(financialYearId ? { financialYearId } : {}),
          ...(companyId ? { companyId } : {}),
        },
        false,
      );

      if (res?.data?.success) {
        const list = res.data.data || [];
        setData(list.map(mapApiRegionToRegion));
      } else {
        toasterrormsg(res?.data?.message || "Failed to fetch regions.");
      }
    } catch (error) {
      console.error("Region list error:", error);
      toasterrormsg("Something went wrong while fetching regions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      if (filterStatus && item.status !== filterStatus) return false;
      return true;
    });
  }, [data, filterStatus]);

  // ---- Save (create / update) via API ----
  // const handleSave = async (region: Region) => {
  //   // Region drawer abhi khud onSubmit me API call karta hai.
  //   // Agar aap yahan centralized save chaho to ise use kar sakte ho.
  //   // Filhaal drawer khud handle karta hai -> onSaved => fetchAll.
  // };

  // ---- Delete one ----
  const handleDeleteOne = async (region: Region) => {
    try {
      const response = await Delete(
        API.delete,
        { regionId: region.id },
        false,
      );
      if (response.data?.success) {
        toastsuccessmsg(
          response.data?.message || "Region deleted successfully.",
        );
        setData((prev) => prev.filter((b) => b.id !== region.id));
      } else {
        toasterrormsg(response.data?.message || "Failed to delete region.");
      }
    } catch {
      toasterrormsg("Something went wrong while deleting the region.");
    }
  };

  // ---- Delete many ----
  const handleDeleteMany = async (rows: { original: Region }[]) => {
    try {
      await Promise.all(
        rows.map((r) =>
          Delete(API.delete, { regionId: r.original.id }, false),
        ),
      );
      const ids = new Set(rows.map((r) => r.original.id));
      setData((prev) => prev.filter((item) => !ids.has(item.id)));
      setRowSelection({});
      toastsuccessmsg("Selected regions deleted successfully.");
    } catch {
      toasterrormsg("Something went wrong while deleting regions.");
    }
  };

  // ---- Toggle status via API ----
  const handleToggleStatus = async (region: Region) => {
    const newStatus = region.status === "Active" ? "Inactive" : "Active";
    const financialYearId = localStorage.getItem("financialYearId");
    const companyId = localStorage.getItem("companyId");

    try {
      const response = await Put(
        API.update,
        {
          regionId: region.id,
          ...(financialYearId
            ? { financialYearId: Number(financialYearId) }
            : {}),
          ...(companyId ? { companyId: Number(companyId) } : {}),
          regionCode: region.regionCode,
          regionName: region.regionName,
          description: region.description,
          regionTypeId: region.regionTypeId
            ? Number(region.regionTypeId)
            : null,
          country: region.country,
          state: region.state,
          city: region.city,
          displayOrder: region.displayOrder
            ? Number(region.displayOrder)
            : null,
          status: newStatus,
          createdBy: companyId ? Number(companyId) : undefined,
          createdType: "Super Admin",
        },
        false,
      );
      if (response.data?.success) {
        toastsuccessmsg(
          response.data?.message || `Region marked as ${newStatus}`,
        );
        setData((prev) =>
          prev.map((b) =>
            b.id === region.id ? { ...b, status: newStatus } : b,
          ),
        );
      } else {
        toasterrormsg(response.data?.message || "Failed to update status.");
      }
    } catch {
      toasterrormsg("Something went wrong while updating the status.");
    }
  };

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { globalFilter, sorting, rowSelection },
    enableRowSelection: true,
    getRowId: (row) => row.id,
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    filterFns: { fuzzy: fuzzyFilter },
    globalFilterFn: fuzzyFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    meta: {
      openEditDrawer: (region: Region) => {
        setEditRegion(region);
        setDrawerOpen(true);
      },
      deleteRow: (row: any) => handleDeleteOne(row.original),
      deleteRows: (rows: any) => handleDeleteMany(rows),
      toggleStatus: (region: Region) => handleToggleStatus(region),
    } as any,
  });

  return (
    <Page title="Region / Area Master">
      <div className="transition-content w-full pb-5">
        <MasterToolbar
          title="Region / Area Master"
          createLabel="Add Region"
          searchPlaceholder="Search regions..."
          table={table}
          showFilters={showFilters}
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
              <Listbox
                data={[ALL, ...STATUS_OPTIONS]}
                value={
                  [ALL, ...STATUS_OPTIONS].find(
                    (i) => i.id === filterStatus,
                  ) || ALL
                }
                onChange={(item) => setFilterStatus(item.id)}
                label="Status"
                placeholder="All statuses"
                displayField="label"
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