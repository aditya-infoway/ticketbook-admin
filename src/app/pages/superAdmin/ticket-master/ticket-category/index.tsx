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
import { Delete, Get, Put } from "@/ApiHelper";
import { Page } from "@/components/shared/Page";
import { Input } from "@/components/ui";
import { exportToExcel, exportToPdf } from "../shared/export";
import { MasterTable } from "../shared/MasterTable";
import { MasterToolbar } from "../shared/MasterToolbar";
import { TicketCategoryDataDrawer } from "./TicketCategoryDataDrawer";
import { columns, exportColumns } from "./columns";
import type { TicketCategory } from "../shared/types";

function mapApiCategory(item: any): TicketCategory {
  return {
    id: String(item.ticketCategoryId),
    ticketCategoryNo: item.ticketCategoryNo ?? "",
    categoryCode: item.categoryCode ?? "",
    categoryName: item.categoryName ?? "",
    departmentId: item.departmentId ? String(item.departmentId) : "",
    departmentName: item.departmentName ?? "",
    description: item.description ?? "",
    defaultResolverTeamId: item.defaultResolverTeamId
      ? String(item.defaultResolverTeamId)
      : "",
    defaultResolverTeamName: item.defaultResolverTeamName ?? "",
    displayOrder: item.displayOrder ?? 0,
    status: item.status ?? "Active",
    createdBy: item.createdBy ?? "",
    createdAt: item.created ?? "",
  } as TicketCategory;
}

export default function TicketCategoryPage() {
  const [data, setData] = useState<TicketCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editCategory, setEditCategory] = useState<TicketCategory | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filterStatus, setFilterStatus] = useState("");

  // bump on every open so the drawer remounts and re-reads editCategory
  const [drawerKey, setDrawerKey] = useState(0);
  const openDrawer = (row: TicketCategory | null) => {
    setEditCategory(row);
    setDrawerKey((k) => k + 1);
    setDrawerOpen(true);
  };

  const fetchAll = async () => {
    setLoading(true);
    try {
      const res: any = await Get("superadmin/ticket-category/list", {}, false);
      const rows: any[] = res?.data?.data ?? [];
      setData(rows.map(mapApiCategory));
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || "Failed to load ticket categories",
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
      openEditDrawer: (category: TicketCategory) => openDrawer(category),
      deleteRow: async (row: any) => {
        const category = row.original;
        {
          try {
            await Delete(
              "superadmin/ticket-category/delete",
              { ticketCategoryId: category.id },
              false,
            );
            toast.success("Category deleted successfully");
            fetchAll();
          } catch (err: any) {
            toast.error(err?.response?.data?.message || "Delete failed");
          }
        }
      },
      toggleStatus: async (category: TicketCategory) => {
        try {
          const newStatus = category.status === "Active" ? "Inactive" : "Active";
          // update validator needs the full payload, not just status
          await Put(
            "superadmin/ticket-category/update",
            {
              ticketCategoryId: category.id,
              categoryCode: category.categoryCode,
              categoryName: category.categoryName,
              description: category.description,
              departmentId: Number(category.departmentId),
              defaultResolverTeamId: category.defaultResolverTeamId
                ? Number(category.defaultResolverTeamId)
                : null,
              displayOrder: category.displayOrder,
              status: newStatus,
            },
            false,
          );
          toast.success(`Category marked as ${newStatus}`);
          fetchAll();
        } catch (err: any) {
          toast.error(err?.response?.data?.message || "Status update failed");
        }
      },
    },
  });

  return (
    <Page title="Ticket Category Master">
      <div className="transition-content w-full pb-5">
        <MasterToolbar
          title="Ticket Category Master"
          createLabel="Add Category"
          searchPlaceholder="Search categories..."
          table={table}
          showFilters={showFilters}
          onToggleFilters={() => setShowFilters((v) => !v)}
          onCreate={() => {
            openDrawer(null);
          }}
          onExportExcel={() =>
            exportToExcel(filteredData, exportColumns, "ticket_categories")
          }
          onExportPdf={() =>
            exportToPdf(
              filteredData,
              exportColumns,
              "Ticket Categories",
              "ticket_categories",
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
              ? "Loading categories..."
              : "No categories found. Click Add Category to add one."
          }
        />
      </div>

      <TicketCategoryDataDrawer
       key={drawerKey}
        isOpen={drawerOpen}
        close={() => setDrawerOpen(false)}
        onSaved={fetchAll}
        editCategory={editCategory}
      />
    </Page>
  );
}
