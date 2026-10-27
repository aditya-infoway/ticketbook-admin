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

import { Page } from "@/components/shared/Page";
import { Input } from "@/components/ui";
import { exportToExcel, exportToPdf } from "../shared/export";
import { MasterTable } from "../shared/MasterTable";
import { MasterToolbar } from "../shared/MasterToolbar";
import { EmployeeDataDrawer } from "./EmployeeDataDrawer";
import { columns, exportColumns } from "./columns";
import type { Employee } from "../shared/types";

const seedEmployees: Employee[] = [
  {
    id: "emp1",
    employeeCode: "EMP-001",
    employeeName: "John Doe",
    profilePhoto: "",
    officialEmail: "john@company.com",
    mobileNumber: "9876543210",
    mobileCountryCode: "91",
    alternateContact: "",
    alternateCountryCode: "91",
    employeeTypeId: "et1",
    employeeTypeName: "Full Time",
    designationId: "d1",
    designationName: "Software Engineer",
    dateOfJoining: "2023-01-15",
    employmentStatus: "Active",
    employmentEndDate: "",
    remarks: "",
    additionalDepartments: [],
    roleDataScope: "",
    passwordResetRequired: false,
    createdBy: "System",
    createdAt: "2023-01-15",
  },
];

export default function EmployeePage() {
  const [data, setData] = useState<Employee[]>(seedEmployees);
  const [loading, setLoading] = useState(false);
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editEmployee, setEditEmployee] = useState<Employee | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filterStatus, setFilterStatus] = useState("");

  const fetchAll = async () => {
    setLoading(true);
    try {
      // TODO: API fetch
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
      openEditDrawer: (employee: Employee) => {
        setEditEmployee(employee);
        setDrawerOpen(true);
      },
      deleteRow: (row: any) => {
        const employee = row.original;
        if (
          window.confirm(
            `Are you sure you want to delete ${employee.employeeName}?`,
          )
        ) {
          setData((prev) => prev.filter((b) => b.id !== employee.id));
          toast.success("Employee deleted successfully");
        }
      },
      toggleStatus: (employee: Employee) => {
        const newStatus =
          employee.employmentStatus === "Active" ? "Inactive" : "Active";
        setData((prev) =>
          prev.map((b) =>
            b.id === employee.id ? { ...b, employmentStatus: newStatus } : b,
          ),
        );
        toast.success(`Employee marked as ${newStatus}`);
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
            setEditEmployee(null);
            setDrawerOpen(true);
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
        isOpen={drawerOpen}
        close={() => setDrawerOpen(false)}
        onSaved={fetchAll}
        editEmployee={editEmployee}
      />
    </Page>
  );
}
