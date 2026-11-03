import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Page } from "@/components/shared/Page";
import { exportToExcel, exportToPdf } from "./shared/export";
import { MasterTable } from "./shared/MasterTable";
import { MasterToolbar } from "./shared/MasterToolbar";
import { columns, exportColumns } from "./columns";
import type { Branch } from "./shared/types";
import { Get } from "@/ApiHelper";
import { Button } from "@/components/ui";
import { Combobox } from "@/components/shared/form/StyledCombobox";

const mapApiBranch = (r: any): Branch => ({
  id: String(r.id ?? r.branchId),
  branchId: r.branchId ?? r.branch_id ?? "",
  branchCode: r.branchCode ?? r.branch_code ?? "",
  branchName: r.branchName ?? r.branch_name ?? "",
  region: r.region ?? "",
  country: r.country ?? "India",
  state: r.state ?? "",
  city: r.city ?? "",
  contactNumber: r.contactNumber ?? r.contact ?? r.contact_number ?? "",
  phoneNumber: r.phoneNumber ?? r.phone_number ?? "",
  email: r.email ?? "",
  branchManager: r.branchManager ?? r.branch_manager ?? "",
  areaManager: r.areaManager ?? r.area_manager ?? "",
  openingDate: r.openingDate ?? r.opening_date ?? "",
  workingHours: r.workingHours ?? r.working_hours ?? "",
  status: r.status === "Inactive" || r.status === false ? "Inactive" : "Active",
  postalCode: r.postalCode ?? r.postal_code ?? "",
  fullAddress: r.fullAddress ?? r.full_address ?? "",
  profilePhoto: r.profilePhoto ?? r.profile_photo ?? null,
  createdAt: r.createdAt ?? r.created_at,
  updatedAt: r.updatedAt ?? r.updated_at,
});

const EMPTY_FILTERS = {
  region: "",
  status: "",
  city: "",
};

export default function BranchPage() {
  const [data, setData] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(false);
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [formData, setFormData] = useState<any | null>(null);

  const fetchFormData = async () => {
    try {
      const res: any = await Get("branch-master/form-data", {}, false);
      if (res?.data?.success) setFormData(res.data.data);
    } catch (err: any) {
      // silent
    }
  };

  const fetchAll = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([k, v]) => v && params.set(k, v));
      const qs = params.toString();
      const res: any = await Get(
        `branch-master/list${qs ? `?${qs}` : ""}`,
        {},
        false,
      );
      if (res?.data?.success) {
        setData((res.data.data || []).map(mapApiBranch));
      } else {
        toast.error(res?.data?.message || "Failed to load branches");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to load branches");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFormData();
  }, []);

  useEffect(() => {
    fetchAll();
  }, [filters]);

  const table = useReactTable({
    data,
    columns,
    state: { globalFilter, sorting },
    enableRowSelection: false,
    getRowId: (row) => row.id,
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <Page title="Branch Master">
      <div className="transition-content w-full pb-5">
        <MasterToolbar
          title="Branch Master"
          searchPlaceholder="Search branches..."
          table={table}
          showFilters={showFilters}
          onToggleFilters={() => setShowFilters((v) => !v)}
          onExportExcel={() =>
            exportToExcel(data, exportColumns, "branch_master")
          }
          onExportPdf={() =>
            exportToPdf(data, exportColumns, "Branch Master", "branch_master")
          }
          filterPanel={
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Combobox
                data={formData?.regions || []}
                displayField="label"
                value={
                  formData?.regions?.find(
                    (r: any) =>
                      r.id === filters.region || r.label === filters.region,
                  ) || null
                }
                onChange={(v: any) =>
                  setFilters((f) => ({
                    ...f,
                    region: v?.id || v?.label || "",
                  }))
                }
                placeholder="Region"
                searchFields={["label"]}
              />
              <Combobox
                data={[
                  { id: "Active", label: "Active" },
                  { id: "Inactive", label: "Inactive" },
                ]}
                displayField="label"
                value={
                  filters.status
                    ? { id: filters.status, label: filters.status }
                    : null
                }
                onChange={(v: any) =>
                  setFilters((f) => ({ ...f, status: v?.id || "" }))
                }
                placeholder="Status"
                searchFields={["label"]}
              />
              <Combobox
                data={formData?.cities || []}
                displayField="label"
                value={
                  formData?.cities?.find(
                    (c: any) =>
                      c.id === filters.city || c.label === filters.city,
                  ) || null
                }
                onChange={(v: any) =>
                  setFilters((f) => ({
                    ...f,
                    city: v?.id || v?.label || "",
                  }))
                }
                placeholder="City"
                searchFields={["label"]}
              />

              <div className="mt-2 sm:col-span-2 lg:col-span-4">
                <Button
                  variant="outlined"
                  color="secondary"
                  type="button"
                  onClick={() => {
                    setFilters(EMPTY_FILTERS);
                    setGlobalFilter("");
                  }}
                >
                  Reset Filters
                </Button>
              </div>
            </div>
          }
        />

        <MasterTable
          table={table}
          columnCount={columns.length}
          emptyMessage={loading ? "Loading branches..." : "No branches found."}
        />
      </div>
    </Page>
  );
}
