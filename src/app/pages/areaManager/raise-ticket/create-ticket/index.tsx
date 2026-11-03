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
import {
  TicketDataDrawer,
  type TicketFormData,
  type EditTicket,
} from "./TicketDataDrawer";
import { columns, exportColumns } from "./columns";
import type { CreateTicket } from "../shared/types";
import { Get } from "@/ApiHelper";
import { Button } from "@/components/ui";
import { Combobox } from "@/components/shared/form/StyledCombobox";
import { DatePicker } from "@/components/shared/form/Datepicker";

type DrawerMode = "create" | "edit" | "view";

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

// Helper to convert row data to EditTicket for the drawer
const buildEditTicket = (row: any): EditTicket => ({
  id: String(row.id ?? row.ticketId ?? ""),
  ticketNo: row.ticketNo ?? "", // "26-27/001"  → Ticket ID
  ticketCode: row.ticketNumber ?? "", // "01"         → Ticket Number
  departmentId: String(row.departmentId ?? row.departmentid ?? ""),
  categoryId: String(row.categoryId ?? row.categoryid ?? ""),
  subject: row.subject ?? "",
  issueDescription: row.issueDescription ?? row.description ?? "",
  attachmentUrl: row.attachmentUrl ?? row.attachment ?? "",
    statusId: String(row.ticketStatusId ?? row.statusId ?? row.statusid ?? ""),
});

export default function TicketPage() {
  const [data, setData] = useState<CreateTicket[]>([]);
  const [loading, setLoading] = useState(false);
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerKey, setDrawerKey] = useState(0);
  const [drawerMode, setDrawerMode] = useState<DrawerMode>("create");
  const [activeTicket, setActiveTicket] = useState<EditTicket | null>(null);

  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [formData, setFormData] = useState<TicketFormData | null>(null);

  // --- Drawer Handlers ---
  const openCreateDrawer = () => {
    setDrawerMode("create");
    setActiveTicket(null);
    setDrawerKey((k) => k + 1);
    setDrawerOpen(true);
  };

  const openWithDetail = async (row: any, mode: "edit" | "view") => {
    let source = row;
    try {
      // Try to fetch detail if your API supports it. If not, it will fallback to row data.
      const res: any = await Get(`employee/ticket/${row.id}`, {}, false);
      if (res?.data?.success && res.data.data) {
        source = { ...row, ...res.data.data };
      }
    } catch {
      // ignore
    }
    setDrawerMode(mode);
    setActiveTicket(buildEditTicket(source));
    setDrawerKey((k) => k + 1);
    setDrawerOpen(true);
  };

  const openEditDrawer = (row: any) => openWithDetail(row, "edit");
  const openViewDrawer = (row: any) => openWithDetail(row, "view");

  const closeDrawer = () => {
    setDrawerOpen(false);
    setActiveTicket(null);
  };

  // --- Data Fetch ---
  const fetchFormData = async () => {
    try {
      const res: any = await Get("employee/ticket/form-data", {}, false);
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
      const res: any = await Get(
        `employee/ticket/list${qs ? `?${qs}` : ""}`,
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

  // --- Table Config ---
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
      // Yahan change kiya gaya hai: Ab yeh toast nahi, balki drawer open karega
      openEditDrawer: (row: any) => openEditDrawer(row),
      viewRow: (row: any) => openViewDrawer(row),
      deleteRow: () => {
        toast.error("Employees cannot delete tickets.");
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
    <Page title="My Tickets">
      <div className="transition-content w-full pb-5">
        <MasterToolbar
          title="My Tickets"
          createLabel="Create Ticket"
          searchPlaceholder="Search my tickets..."
          table={table}
          showFilters={showFilters}
          onToggleFilters={() => setShowFilters((v) => !v)}
          onCreate={openCreateDrawer}
          onExportExcel={() => exportToExcel(data, exportColumns, "my_tickets")}
          onExportPdf={() =>
            exportToPdf(data, exportColumns, "My Tickets", "my_tickets")
          }
          filterPanel={
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Combobox
                data={formData?.departments || []}
                displayField="label"
                value={
                  formData?.departments.find(
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
                  formData?.categories.find(
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
                  formData?.statuses.find(
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
              ? "Loading tickets..."
              : "No tickets found. Click Create Ticket to add one."
          }
        />
      </div>

      {/* Yahan mode aur ticket props add kiye gaye hain */}
      <TicketDataDrawer
        key={drawerKey}
        isOpen={drawerOpen}
        close={closeDrawer}
        onSaved={fetchAll}
        formData={formData}
        ticket={activeTicket}
        mode={drawerMode}
      />
    </Page>
  );
}
