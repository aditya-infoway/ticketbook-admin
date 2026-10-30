// src/app/pages/master/contractor-department/ContractorDepartmentPage.tsx
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
import { ContractorDepartmentDrawer } from "./ContractorDepartmentDrawer";
import { columns, exportColumns } from "./columns";
import type { ContractorDepartment } from "../shared/types";
import { Delete, Get, Put, formatDateDDMMYYYY  } from "@/ApiHelper";

export default function ContractorDepartmentPage() {
  const [data, setData] = useState<ContractorDepartment[]>([]);
  const [loading, setLoading] = useState(false);
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editDepartment, setEditDepartment] =
    useState<ContractorDepartment | null>(null);
  const [drawerKey, setDrawerKey] = useState(0);

  const openDrawer = (row: ContractorDepartment | null) => {
    setEditDepartment(row);
    setDrawerKey((k) => k + 1);
    setDrawerOpen(true);
  };

  const fetchAll = async () => {
    setLoading(true);
    try {
      const res: any = await Get(
        "superadmin/contractor-department/list",
        {},
        false,
      );
      const rows: any[] = res?.data?.data ?? [];
      setData(
        rows.map((r) => ({
          ...r,
          id: String(r.contractorDepartmentId ?? r.id),
         createdAt: formatDateDDMMYYYY(r.created || r.createdAt),
        })),
      );
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to load departments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

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
      openEditDrawer: (dept: ContractorDepartment) => openDrawer(dept),

      deleteRow: async (row: any) => {
        const dept = row.original;
        try {
          const res: any = await Delete(
            "superadmin/contractor-department/delete",
            { contractorDepartmentId: dept.id },
            false,
          );
          if (res?.data?.success) {
            toast.success(
              res.data.message || "Department deleted successfully",
            );
            fetchAll();
          } else {
            toast.error(res?.data?.message || "Delete failed");
          }
        } catch (err: any) {
          toast.error(err?.response?.data?.message || "Delete failed");
        }
      },

      toggleStatus: async (dept: ContractorDepartment) => {
        const newStatus = dept.status === "Active" ? "Inactive" : "Active";
        try {
          const res: any = await Put(
            "superadmin/contractor-department/update",
            {
              contractorDepartmentId: dept.id,
              departmentName: dept.departmentName,
              departmentCode: dept.departmentCode,
              description: dept.description,
              status: newStatus,
            },
            false,
          );
          if (res?.data?.success) {
            toast.success(`Department marked as ${newStatus}`);
            fetchAll();
          } else {
            toast.error(res?.data?.message || "Status update failed");
          }
        } catch (err: any) {
          toast.error(err?.response?.data?.message || "Status update failed");
        }
      },
    },
  });

  return (
    <Page title="Contractor Department">
      <div className="transition-content w-full pb-5">
        <MasterToolbar
          title="Contractor Department"
          createLabel="Add Department"
          searchPlaceholder="Search departments..."
          table={table}
          showFilters={false}
          onToggleFilters={() => {}}
          onCreate={() => openDrawer(null)}
          onExportExcel={() =>
            exportToExcel(data, exportColumns, "departments")
          }
          onExportPdf={() =>
            exportToPdf(data, exportColumns, "Department List", "departments")
          }
        />

        <MasterTable
          table={table}
          columnCount={columns.length}
          emptyMessage={
            loading
              ? "Loading departments..."
              : "No departments found. Click Add Department to add one."
          }
        />
      </div>

      <ContractorDepartmentDrawer
        key={drawerKey}
        isOpen={drawerOpen}
        close={() => setDrawerOpen(false)}
        onSaved={fetchAll}
        editDepartment={editDepartment}
      />
    </Page>
  );
}
