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
import { AssignTicketModal } from "./AssignTicketModal";
import { Page } from "@/components/shared/Page";
import { exportToExcel, exportToPdf } from "../shared/export";
import { MasterTable } from "../shared/MasterTable";
import { MasterToolbar } from "../shared/MasterToolbar";
import { TicketStatusDrawer, type StatusTicket } from "./TicketStatusDrawer";
import { columns, exportColumns, type BranchTicket } from "./Columns";
import { Get } from "@/ApiHelper";
import { Button } from "@/components/ui";
import { Combobox } from "@/components/shared/form/StyledCombobox";
import { DatePicker } from "@/components/shared/form/Datepicker";

// branch/ticket/form-data ka response
interface BranchFormData {
  departments: { id: string; label: string }[];
  categories: { id: string; label: string; departmentId: string }[];
  statuses: { id: string; label: string }[];
}

const EMPTY_FILTERS = {
  departmentId: "",
  categoryId: "",
  ticketStatusId: "",
  fromDate: "",
  toDate: "",
};

// Backend sirf file path deta hai -> full URL banao.
// VITE_API_URL apne project ke file-serving base URL se replace kar lena.
const FILE_BASE = (import.meta as any).env?.VITE_API_URL || "";
const toFileUrl = (p?: string | null) =>
  p
    ? /^https?:\/\//.test(p)
      ? p
      : `${FILE_BASE}/${String(p).replace(/^\/+/, "")}`
    : "";

const mapApiTicket = (r: any): BranchTicket => ({
  ...r,
  id: String(r.ticketId ?? r.id),
});

export default function BranchTicketPage() {
  const [data, setData] = useState<BranchTicket[]>([]);
  const [loading, setLoading] = useState(false);
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  // Status drawer
  const [statusOpen, setStatusOpen] = useState(false);
  const [statusTicket, setStatusTicket] = useState<StatusTicket | null>(null);
  const [assignOpen, setAssignOpen] = useState(false);
  const [assignTicket, setAssignTicket] = useState<any | null>(null);

  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [formData, setFormData] = useState<BranchFormData | null>(null);

  // --- Handlers ---
  const openStatusDrawer = (row: any) => {
    setStatusTicket({
      id: String(row.id),
      ticketNumber: row.ticketNumber,
      ticketNo: row.ticketNo,
      subject: row.subject,
      issueDescription: row.issueDescription,
      employeeName: row.employeeName,
      employeeCode: row.employeeCode,
      branchName: row.branchName,
      contactNumber: row.contactNumber,
      departmentName: row.departmentName,
      categoryName: row.categoryName,
      attachmentUrl: toFileUrl(row.attachment),
      status: row.status,
      statusId: String(row.statusId ?? ""),
    });
    setStatusOpen(true);
  };

  // --- Data Fetch ---
  const fetchFormData = async () => {
    try {
      const res: any = await Get("branch/ticket/form-data", {}, false);
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
        `branch/ticket/list${qs ? `?${qs}` : ""}`,
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

  const openAssignModal = (row: any) => {
    setAssignTicket(row);
    setAssignOpen(true);
  };

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
      openStatusDrawer: (row: any) => openStatusDrawer(row),
      openAssignDrawer: (row: any) => openAssignModal(row),
    } as any,
  });

  const formatDate = (date: Date) => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  return (
    <Page title="Branch Tickets">
      <div className="transition-content w-full pb-5">
        {/*
          NOTE: Branch ko ticket create nahi karna. Agar MasterToolbar me
          createLabel/onCreate required hain to unhe optional bana do
          (ya Create button conditionally render karo).
        */}
        <MasterToolbar
          title="Branch Tickets"
          searchPlaceholder="Search tickets..."
          table={table}
          showFilters={showFilters}
          onToggleFilters={() => setShowFilters((v) => !v)}
          onExportExcel={() =>
            exportToExcel(data, exportColumns, "branch_tickets")
          }
          onExportPdf={() =>
            exportToPdf(data, exportColumns, "Branch Tickets", "branch_tickets")
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
          emptyMessage={loading ? "Loading tickets..." : "No tickets found."}
        />
      </div>

      {/* Ticket details (read-only) + status manage */}
      <TicketStatusDrawer
        isOpen={statusOpen}
        close={() => setStatusOpen(false)}
        onSaved={fetchAll}
        ticket={statusTicket}
        statuses={formData?.statuses || []}
      />

      <AssignTicketModal
        isOpen={assignOpen}
        close={() => setAssignOpen(false)}
        onSaved={fetchAll}
        ticket={assignTicket}
        // TODO: Replace with actual contractors API data
        contractors={[
          {
            id: "1",
            label: "John Doe (Plumbing)",
            departmentName: "Maintenance",
          },
          {
            id: "2",
            label: "Jane Smith (Electrical)",
            departmentName: "Electrical",
          },
        ]}
      />
    </Page>
  );
}
