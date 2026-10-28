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
import { EmployeeDataDrawer } from "./EmployeeDataDrawer";
import { columns, exportColumns } from "./columns";
import type { Employee } from "../shared/types";

function mapApiEmployee(item: any): Employee {
  return {
    id: String(item.employeeId),
    employeeNo: item.employeeNo ?? "",
    employeeCode: item.employeeCode ?? "",
    employeeName: item.employeeName ?? "",
    profilePhoto: item.profilePhoto ?? "",
    officialEmail: item.officialEmail ?? "",
    mobileCountryCode: item.mobileCountryCode ?? "",
    mobileNumber: item.mobileNumber ?? "",
    alternateCountryCode: item.alternateCountryCode ?? "",
    alternateContact: item.alternateContact ?? "",
    employeeTypeId: item.employeeTypeId ? String(item.employeeTypeId) : "",
    employeeTypeName: item.employeeTypeName ?? "",
    designationId: item.designationId ? String(item.designationId) : "",
    designationName: item.designationName ?? "",
    dateOfJoining: item.dateOfJoining ?? "",
    employmentStatus: item.employmentStatus ?? "Active",
    employmentEndDate: item.employmentEndDate ?? "",
    remarks: item.remarks ?? "",
    roleCategoryId: item.roleCategoryId ? String(item.roleCategoryId) : "",
    roleCategoryName: item.roleCategoryName ?? "",
    roleId: item.roleId ? String(item.roleId) : "",
    roleName: item.roleName ?? "",
    roleDataScope: item.roleDataScope ?? "",
    additionalDepartments: (item.additionalDepartments ?? []).map(String),
    passwordResetRequired: false,
    createdBy: item.createdBy ?? "",
    createdAt: item.created ?? "",
  } as Employee;
}

export default function EmployeePage() {
  const [data, setData] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editEmployee, setEditEmployee] = useState<Employee | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filterStatus, setFilterStatus] = useState("");

  // bump on every open so the drawer remounts and re-reads editEmployee
  const [drawerKey, setDrawerKey] = useState(0);
  const openDrawer = (row: Employee | null) => {
    setEditEmployee(row);
    setDrawerKey((k) => k + 1);
    setDrawerOpen(true);
  };

  const fetchAll = async () => {
    setLoading(true);
    try {
      const res: any = await Get("superadmin/employee/list", {}, false);
      const rows: any[] = res?.data?.data ?? [];
      setData(rows.map(mapApiEmployee));
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to load employees");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      if (filterStatus && item.employmentStatus !== filterStatus) return false;
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
      openEditDrawer: (employee: Employee) => openDrawer(employee),
      deleteRow: async (row: any) => {
        const employee = row.original;
        {
          try {
            await Delete(
              "superadmin/employee/delete",
              { employeeId: employee.id },
              false,
            );
            toast.success("Employee deleted successfully");
            fetchAll();
          } catch (err: any) {
            toast.error(err?.response?.data?.message || "Delete failed");
          }
        }
      },
      toggleStatus: async (employee: Employee) => {
        const newStatus =
          employee.employmentStatus === "Active" ? "Inactive" : "Active";
        try {
          // update replaces departments + designation, so send them back unchanged
          await Put(
            "superadmin/employee/update",
            {
              employeeId: employee.id,
              employeeCode: employee.employeeCode,
              employeeName: employee.employeeName,
              officialEmail: employee.officialEmail,
              mobileCountryCode: employee.mobileCountryCode,
              mobileNumber: employee.mobileNumber,
              alternateCountryCode: employee.alternateCountryCode,
              alternateContact: employee.alternateContact,
              employeeTypeId: employee.employeeTypeId
                ? Number(employee.employeeTypeId)
                : null,
              designationId: employee.designationId
                ? Number(employee.designationId)
                : null,
              dateOfJoining: employee.dateOfJoining,
              employmentStatus: newStatus,
              employmentEndDate: employee.employmentEndDate,
              remarks: employee.remarks,
              roleCategoryId: employee.roleCategoryId
                ? Number(employee.roleCategoryId)
                : null,
              roleId: employee.roleId ? Number(employee.roleId) : null,
              additionalDepartments: (employee.additionalDepartments || []).map(
                Number,
              ),
            },
            false,
          );
          toast.success(`Employee marked as ${newStatus}`);
          fetchAll();
        } catch (err: any) {
          toast.error(err?.response?.data?.message || "Status update failed");
        }
      },
    },
  });

  return (
    <Page title="Employee List">
      <div className="transition-content w-full pb-5">
        <MasterToolbar
          title="Employee List"
          createLabel="Add Employee"
          searchPlaceholder="Search employees..."
          table={table}
          showFilters={showFilters}
          onToggleFilters={() => setShowFilters((v) => !v)}
          onCreate={() => {
            openDrawer(null);
          }}
          onExportExcel={() =>
            exportToExcel(filteredData, exportColumns, "employees")
          }
          onExportPdf={() =>
            exportToPdf(
              filteredData,
              exportColumns,
              "Employee List",
              "employees",
            )
          }
          filterPanel={
            <div className="grid gap-4 sm:grid-cols-1">
              <Input
                label="Employment Status"
                placeholder="Active / Resigned / Terminated..."
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
              ? "Loading employees..."
              : "No employees found. Click Add Employee to add one."
          }
        />
      </div>

      <EmployeeDataDrawer
        key={drawerKey}
        isOpen={drawerOpen}
        close={() => setDrawerOpen(false)}
        onSaved={fetchAll}
        editEmployee={editEmployee}
      />
    </Page>
  );
}
