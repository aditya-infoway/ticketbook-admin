// src/app/pages/area-manager/tickets/TicketPage.tsx
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
import type { CreateTicket } from "./shared/types";
import { Get } from "@/ApiHelper";
import { Button } from "@/components/ui";
import { Combobox } from "@/components/shared/form/StyledCombobox";
import { DatePicker } from "@/components/shared/form/Datepicker";

const mapApiTicket = (r: any): CreateTicket => ({
  ...r,
  id: String(r.ticketId ?? r.id),
});

const EMPTY_FILTERS = {
  branchId: "",
  departmentId: "",
  categoryId: "",
  ticketStatusId: "",
  fromDate: "",
  toDate: "",
};

export default function AreaManagerTicketPage() {
  const [data, setData] = useState<CreateTicket[]>([]);
  const [loading, setLoading] = useState(false);
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);

  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [formData, setFormData] = useState<any | null>(null);

  // Fetch Dropdown Options for filters (Branches, Departments, etc.)
  const fetchFormData = async () => {
    try {
      // Assuming you have an endpoint to get area-manager specific form data
      const res: any = await Get("area-manager/ticket/form-data", {}, false);
      if (res?.data?.success) setFormData(res.data.data);
      else toast.error(res?.data?.message || "Failed to load form data");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to load form data");
    }
  };

  const fetchAll = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([k, v]) => v && params.set(k, v));
      const qs = params.toString();

      // Area manager endpoint to get all tickets for their branches
      const res: any = await Get(
        `area-manager/ticket/list${qs ? `?${qs}` : ""}`,
        {},
        false,
      );
      if (res?.data?.success) {
        setData((res.data.data || []).map(mapApiTicket));
      } else {
        toast.error(res?.data?.message || "Failed to load tickets");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to load tickets");
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

  const formatDate = (date: Date) => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  return (
    <Page title="All Tickets">
      <div className="transition-content w-full pb-5">
        <MasterToolbar
          title="All Tickets"
          searchPlaceholder="Search tickets..."
          table={table}
          showFilters={showFilters}
          onToggleFilters={() => setShowFilters((v) => !v)}
          onExportExcel={() =>
            exportToExcel(data, exportColumns, "area_manager_tickets")
          }
          onExportPdf={() =>
            exportToPdf(
              data,
              exportColumns,
              "All Tickets",
              "area_manager_tickets",
            )
          }
          filterPanel={
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              {/* Branch Filter */}
              <Combobox
                data={formData?.branches || []}
                displayField="label"
                label="Branch"
                value={
                  formData?.branches?.find(
                    (b: any) => b.id === filters.branchId,
                  ) || null
                }
                onChange={(v: any) =>
                  setFilters((f) => ({ ...f, branchId: v?.id || "" }))
                }
                placeholder="Branch"
                searchFields={["label"]}
              />

              <Combobox
                data={formData?.departments || []}
                displayField="label"
                label="Department"
                value={
                  formData?.departments?.find(
                    (d: any) => d.id === filters.departmentId,
                  ) || null
                }
                onChange={(v: any) =>
                  setFilters((f) => ({
                    ...f,
                    departmentId: v?.id || "",
                    categoryId: "",
                  }))
                }
                placeholder="Department"
                searchFields={["label"]}
              />
              <Combobox
                data={(formData?.categories || []).filter(
                  (c: any) =>
                    !filters.departmentId ||
                    c.departmentId === filters.departmentId,
                )}
                displayField="label"
                label="Category"
                value={
                  formData?.categories?.find(
                    (c: any) => c.id === filters.categoryId,
                  ) || null
                }
                onChange={(v: any) =>
                  setFilters((f) => ({ ...f, categoryId: v?.id || "" }))
                }
                placeholder="Category"
                searchFields={["label"]}
              />
              <Combobox
                data={formData?.statuses || []}
                displayField="label"
                label="Status"
                value={
                  formData?.statuses?.find(
                    (s: any) => s.id === filters.ticketStatusId,
                  ) || null
                }
                onChange={(v: any) =>
                  setFilters((f) => ({ ...f, ticketStatusId: v?.id || "" }))
                }
                placeholder="Status"
                searchFields={["label"]}
              />

              <div className="min-w-[200px]">
                <DatePicker
                  label="Date Range"
                  options={{
                    mode: "range",
                    dateFormat: "Y-m-d",
                    defaultDate: filters.fromDate
                      ? filters.toDate
                        ? [filters.fromDate, filters.toDate]
                        : [filters.fromDate]
                      : [],
                  }}
                  placeholder="Filter by Date Range"
                  onChange={(dates: Date[]) => {
                    if (!dates || dates.length === 0) {
                      setFilters((f) => ({ ...f, fromDate: "", toDate: "" }));
                      return;
                    }
                    const from = dates[0] ? formatDate(dates[0]) : "";
                    const to = dates[1] ? formatDate(dates[1]) : "";
                    setFilters((f) => ({ ...f, fromDate: from, toDate: to }));
                  }}
                />
              </div>

              <div className="mt-2 sm:col-span-2 lg:col-span-4 xl:col-span-5">
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
          emptyMessage={loading ? "Loading tickets..." : "No tickets found."}
        />
      </div>
    </Page>
  );
}
