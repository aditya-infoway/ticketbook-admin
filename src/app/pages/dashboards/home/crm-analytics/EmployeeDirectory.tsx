// Import Dependencies
import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  RowSelectionState,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { useState } from "react";

// Local Imports
import { Input } from "@/components/ui";
import { fuzzyFilter } from "@/utils/react-table/fuzzyFilter";
import { toastsuccessmsg } from "@/ApiHelper";
import { MasterTable } from "../crm-analytics/shared/MasterTable";
import { columns } from "./Columns";
import { Employee, initialEmployees } from "./data";

// ----------------------------------------------------------------------

export function EmployeeDirectory() {
  const [data, setData] = useState<Employee[]>(initialEmployees);

  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  // TODO: connect with API (Delete("employee/delete", ...)) like enquiry source page
  const handleDeleteOne = (row: Employee) => {
    setData((prev) => prev.filter((item) => item.id !== row.id));
    toastsuccessmsg("Employee deleted successfully.");
  };

  const handleDeleteMany = (rows: { original: Employee }[]) => {
    const ids = new Set(rows.map((r) => r.original.id));
    setData((prev) => prev.filter((item) => !ids.has(item.id)));
    setRowSelection({});
    toastsuccessmsg("Selected employees deleted successfully.");
  };

  const table = useReactTable({
    data,
    columns,
    state: { globalFilter, sorting, rowSelection },
    enableRowSelection: true,
    getRowId: (row) => row.id,
    meta: {
      openEditDrawer: (row: Employee) => {
        // TODO: open employee drawer / navigate to employee profile
        console.log("view employee", row);
      },
      deleteRow: (row) => handleDeleteOne(row.original),
      deleteRows: (rows) => handleDeleteMany(rows),
    },
    filterFns: { fuzzy: fuzzyFilter },
    globalFilterFn: fuzzyFilter,
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div>
      {/* Simple header: title + search only (no Filter / Excel / PDF / Add buttons) */}
      <div className="px-(--margin-x) pt-4">
        <h2 className="dark:text-dark-50 text-xl font-medium tracking-wide text-gray-800">
          Employee Directory
        </h2>
        <div className="mt-4 max-w-sm">
          <Input
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            prefix={<MagnifyingGlassIcon className="size-4" />}
            classNames={{
              input: "ring-primary-500/50 h-9 text-sm focus:ring-3",
            }}
            placeholder="Search employees..."
          />
        </div>
      </div>

      <MasterTable
        table={table}
        columnCount={columns.length}
        emptyMessage="No employees found."
      />
    </div>
  );
}