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
import { EmployeeTypeDataDrawer } from "./EmployeeTypeDataDrawer";
import { columns, exportColumns } from "./columns";
import type { EmployeeType } from "../shared/types";

export default function EmployeeTypePage() {
  const [data, setData] = useState<EmployeeType[]>([]);
  const [loading, setLoading] = useState(false);
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editEmployeeType, setEditEmployeeType] = useState<EmployeeType | null>(
    null,
  );

  const [showFilters, setShowFilters] = useState(false);
  const [filterStatus, setFilterStatus] = useState("");

  const fetchAll = async () => {
    setLoading(true);
    try {
      const res: any = await Get("superadmin/employee-type/list", {}, false);
      const rows: any[] = res?.data?.data ?? [];
      setData(
        rows.map((r) => ({
          id: String(r.employeeTypeId),
          employeeTypeNo: r.employeeTypeNo ?? "",
          typeCode: r.typeCode,
          typeName: r.typeName,
          description: r.description ?? "",
          displayOrder: r.displayOrder,
          status: r.status,
          createdBy: r.createdBy ?? "",
          createdAt: r.created,
        })),
      );
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || "Failed to load employee types",
      );
    } finally {
      setLoading(false);
    }
  };

  // bump on every open so the drawer remounts and re-reads editEmployeeType
  const [drawerKey, setDrawerKey] = useState(0);
  const openDrawer = (row: EmployeeType | null) => {
    setEditEmployeeType(row);
    setDrawerKey((k) => k + 1);
    setDrawerOpen(true);
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
      openEditDrawer: (employeeType: EmployeeType) => openDrawer(employeeType),
      deleteRow: async (row: any) => {
        const employeeType = row.original;
        if (
          window.confirm(
            `Are you sure you want to delete ${employeeType.typeName}?`,
          )
        ) {
          try {
            await Delete(
              "superadmin/employee-type/delete",
              { employeeTypeId: employeeType.id },
              false,
            );
            toast.success("Employee type deleted successfully");
            fetchAll();
          } catch (err: any) {
            toast.error(err?.response?.data?.message || "Delete failed");
          }
        }
      },
      toggleStatus: async (employeeType: EmployeeType) => {
        const newStatus =
          employeeType.status === "Active" ? "Inactive" : "Active";
        try {
          // update validator needs the full payload, not just status
          await Put(
            "superadmin/employee-type/update",
            {
              employeeTypeId: employeeType.id,
              typeCode: employeeType.typeCode,
              typeName: employeeType.typeName,
              description: employeeType.description,
              displayOrder: employeeType.displayOrder,
              status: newStatus,
            },
            false,
          );
          toast.success(`Employee type marked as ${newStatus}`);
          fetchAll();
        } catch (err: any) {
          toast.error(err?.response?.data?.message || "Status update failed");
        }
      },
    },
  });

  return (
    <Page title="Employee Type Master">
      <div className="transition-content w-full pb-5">
        <MasterToolbar
          title="Employee Type Master"
          createLabel="Add Employee Type"
          searchPlaceholder="Search employee types..."
          table={table}
          showFilters={showFilters}
          onToggleFilters={() => setShowFilters((v) => !v)}
          onCreate={() => {
            openDrawer(null);
          }}
          onExportExcel={() =>
            exportToExcel(filteredData, exportColumns, "employee_types")
          }
          onExportPdf={() =>
            exportToPdf(
              filteredData,
              exportColumns,
              "Employee Type List",
              "employee_types",
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
              ? "Loading employee types..."
              : "No employee types found. Click Add Employee Type to add one."
          }
        />
      </div>

      <EmployeeTypeDataDrawer
        key={drawerKey}
        isOpen={drawerOpen}
        close={() => setDrawerOpen(false)}
        onSaved={fetchAll}
        editEmployeeType={editEmployeeType}
      />
    </Page>
  );
}
