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
import { ContractorTicketStatusDrawer } from "./ContractorTicketStatusDrawer";
import { Page } from "@/components/shared/Page";
import { exportToExcel, exportToPdf } from "./shared/export";
import { MasterTable } from "./shared/MasterTable";
import { MasterToolbar } from "./shared/MasterToolbar";
import { columns, exportColumns } from "./columns";
import type { CreateTicket } from "./shared/types";
import { Get } from "@/ApiHelper";
import { Button, Input } from "@/components/ui";
import { Combobox } from "@/components/shared/form/StyledCombobox";
import { DatePicker } from "@/components/shared/form/Datepicker";

const mapApiTicket = (r: any): CreateTicket => ({
  ...r,
  id: String(r.ticketId ?? r.id),
});

const EMPTY_FILTERS = {
  departmentId: "",
  categoryId: "",
  ticketStatusId: "",
  fromDate: "",
  toDate: "",
};

export default function ContractorTicketPage() {
  const [data, setData] = useState<CreateTicket[]>([]);
  const [loading, setLoading] = useState(false);
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState(EMPTY_FILTERS);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);

  // Contractor panel likely still needs dropdowns for filtering
  const [formData, setFormData] = useState<any>(null);

  const fetchFormData = async () => {
    try {
      const res: any = await Get("contractor/ticket/filter-data", {}, false);
      if (res?.data?.success) setFormData(res.data.data);
    } catch (err: any) {
      // Silently fail or toast depending on preference
      console.error("Failed to load filter data");
    }
  };

  const fetchAll = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([k, v]) => v && params.set(k, v));
      const qs = params.toString();

      // Fetch only assigned tickets for this contractor
      const res: any = await Get(
        `employee/contractorticket/ticket/assigned${qs ? `?${qs}` : ""}`,
        {},
        false,
      );
      if (res?.data?.success) {
        setData((res.data.data || []).map(mapApiTicket));
      } else {
        toast.error(res?.data?.message || "Failed to load assigned tickets");
      }
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || "Failed to load assigned tickets",
      );
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
      viewRow: (ticket: CreateTicket) => {
        setSelectedTicket(ticket);
        setDrawerOpen(true);
      },
      deleteRow: () => {
        toast.error("Contractors cannot delete tickets.");
      },
    },
  });

  const formatDate = (date: Date) => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  return (
    <Page title="Assigned Tickets">
      <div className="transition-content w-full pb-5">
        <MasterToolbar
          title="Assigned Tickets"
          // No Create button for contractors
          searchPlaceholder="Search assigned tickets..."
          table={table}
          showFilters={showFilters}
          onToggleFilters={() => setShowFilters((v) => !v)}
          onExportExcel={() =>
            exportToExcel(data, exportColumns, "assigned_tickets")
          }
          onExportPdf={() =>
            exportToPdf(
              data,
              exportColumns,
              "Assigned Tickets",
              "assigned_tickets",
            )
          }
          filterPanel={
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Combobox
                data={formData?.departments || []}
                displayField="label"
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
                  options={{
                    mode: "range",
                    dateFormat: "Y-m-d",
                    defaultDate:
                      filters.fromDate && filters.toDate
                        ? [filters.fromDate, filters.toDate]
                        : [],
                  }}
                  placeholder="Filter by Date Range"
                  onChange={(dates: Date[]) => {
                    if (!dates || dates.length === 0) {
                      setFilters((f) => ({ ...f, fromDate: "", toDate: "" }));
                      return;
                    }
                    setFilters((f) => ({
                      ...f,
                      fromDate: dates[0] ? formatDate(dates[0]) : "",
                      toDate: dates[1] ? formatDate(dates[1]) : "",
                    }));
                  }}
                />
              </div>

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
          emptyMessage={
            loading
              ? "Loading assigned tickets..."
              : "No assigned tickets found."
          }
        />

        <ContractorTicketStatusDrawer
          isOpen={drawerOpen}
          close={() => {
            setDrawerOpen(false);
            setSelectedTicket(null);
          }}
          onSaved={fetchAll}
          ticket={selectedTicket}
        />
      </div>
    </Page>
  );
}
