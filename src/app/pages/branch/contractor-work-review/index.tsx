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
import { ReviewDrawer } from "./Reviewdrawer";
import { columns, exportColumns, type ContractorReview } from "./Columns";
import { Get } from "@/ApiHelper";

// Backend sirf file path deta hai -> full URL banao.
// VITE_API_URL apne project ke file-serving base URL se replace kar lena.
const FILE_BASE = (import.meta as any).env?.VITE_API_URL || "";
const toFileUrl = (p?: string | null) =>
  p
    ? /^https?:\/\//.test(p)
      ? p
      : `${FILE_BASE}/${String(p).replace(/^\/+/, "")}`
    : "";

export default function ContractorReviewPage() {
  const [data, setData] = useState<ContractorReview[]>([]);
  const [loading, setLoading] = useState(false);
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerKey, setDrawerKey] = useState(0);
  const [activeWork, setActiveWork] = useState<ContractorReview | null>(null);
  const [contractors, setContractors] = useState<
    { id: string; label: string }[]
  >([]);

  // --- Data Fetch ---
  const fetchFormData = async () => {
    try {
      const res: any = await Get("branch/contractor-review/form-data", {}, false);
      if (res?.data?.success) setContractors(res.data.data?.contractors || []);
      else toast.error(res?.data?.message || "Failed to load contractors");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to load contractors");
    }
  };

  const fetchAll = async () => {
    setLoading(true);
    try {
      const res: any = await Get("branch/contractor-review/list", {}, false);
      if (res?.data?.success) setData(res.data.data || []);
      else toast.error(res?.data?.message || "Failed to load work reviews");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to load work reviews");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFormData();
    fetchAll();
  }, []);

  // --- Handlers ---
  const openReview = (row: ContractorReview) => {
    setActiveWork(row);
    setDrawerKey((k) => k + 1);
    setDrawerOpen(true);
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
      openReview: (row: ContractorReview) => openReview(row),
    } as any,
  });

  return (
    <Page title="Contractor Work Review">
      <div className="transition-content w-full pb-5">
        {/* Create button nahi chahiye -> onCreate nahi diya (MasterToolbar me optional hona chahiye) */}
        <MasterToolbar
          title="Contractor Work Review"
          searchPlaceholder="Search work reviews..."
          table={table}
          showFilters={false}
          onToggleFilters={() => {}}
          onExportExcel={() =>
            exportToExcel(data, exportColumns, "contractor_work_review")
          }
          onExportPdf={() =>
            exportToPdf(
              data,
              exportColumns,
              "Contractor Work Review",
              "contractor_work_review",
            )
          }
        />

        <MasterTable
          table={table}
          columnCount={columns.length}
          emptyMessage={
            loading
              ? "Loading work reviews..."
              : "No contractor work is waiting for review."
          }
        />
      </div>

      <ReviewDrawer
        key={drawerKey}
        isOpen={drawerOpen}
        close={() => setDrawerOpen(false)}
        onSaved={fetchAll}
        work={activeWork}
        contractors={contractors}
        toFileUrl={toFileUrl}
      />
    </Page>
  );
}