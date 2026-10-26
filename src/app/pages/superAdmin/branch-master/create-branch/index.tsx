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
import { BranchDataDrawer } from "./BranchDataDrawer";
import { columns, exportColumns } from "./columns";
import type { Branch } from "../shared/types";

const seedBranches: Branch[] = [
  {
    id: "b1",
    branchCode: "BR-001",
    branchName: "Mumbai Central",
    region: "West",
    country: "India",
    countryCode: "IN",
    state: "Maharashtra",
    stateCode: "MH",
    city: "Mumbai",
    fullAddress: "101, Marine Drive",
    pinCode: "400001",
    phoneNumber: 9876543210,
    contactNumber: 9876543210,
    branchEmail: "mumbai@company.com",
    branchManager: "John Doe",
    areaManager: "Jane Smith",
    openingDate: "2022-04-01",
    workingHours: "9-6",
    status: "Active",
    createdBy: "System",
    createdAt: "2024-01-15",
  },
  {
    id: "b2",
    branchCode: "BR-002",
    branchName: "Delhi North",
    region: "North",
    country: "India",
    countryCode: "IN",
    state: "Delhi",
    stateCode: "DL",
    city: "New Delhi",
    fullAddress: "22, Connaught Place",
    pinCode: "110001",
    phoneNumber: 9876543211,
    contactNumber: 9876543211,
    branchEmail: "delhi@company.com",
    branchManager: "Mike Johnson",
    areaManager: "Jane Smith",
    openingDate: "2021-11-10",
    workingHours: "10-7",
    status: "Active",
    createdBy: "System",
    createdAt: "2023-11-10",
  },
];

export default function BranchPage() {
  const [data, setData] = useState<Branch[]>(seedBranches);
  const [loading, setLoading] = useState(false);
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editBranch, setEditBranch] = useState<Branch | null>(null);

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
      if (filterStatus && item.status !== filterStatus) return false;
      return true;
    });
  }, [data, filterStatus]);

  // Setup the table with meta options for the action column
  const table = useReactTable({
    data: filteredData,
    columns, // 👈 Pass the static columns directly
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
    // 👈 This is required for the action buttons to work
    meta: {
      openEditDrawer: (branch: Branch) => {
        setEditBranch(branch);
        setDrawerOpen(true);
      },
      deleteRow: (row: any) => {
        const branch = row.original;
        {
          setData((prev) => prev.filter((b) => b.id !== branch.id));
          toast.success("Branch deleted successfully");
        }
      },
      toggleStatus: (branch: Branch) => {
        const newStatus = branch.status === "Active" ? "Inactive" : "Active";
        setData((prev) =>
          prev.map((b) =>
            b.id === branch.id ? { ...b, status: newStatus } : b,
          ),
        );
        toast.success(`Branch marked as ${newStatus}`);
      },
    },
  });

  return (
    <Page title="Branch Master">
      <div className="transition-content w-full pb-5">
        <MasterToolbar
          title="Branch Master"
          createLabel="Add Branch"
          searchPlaceholder="Search branches..."
          table={table}
          showFilters={false}
          onToggleFilters={() => setShowFilters((v) => !v)}
          onCreate={() => {
            setEditBranch(null);
            setDrawerOpen(true);
          }}
          onExportExcel={() =>
            exportToExcel(filteredData, exportColumns, "branches")
          }
          onExportPdf={() =>
            exportToPdf(filteredData, exportColumns, "Branch List", "branches")
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
              ? "Loading branches..."
              : "No branches found. Click Add Branch to add one."
          }
        />
      </div>

      <BranchDataDrawer
        isOpen={drawerOpen}
        close={() => setDrawerOpen(false)}
        onSaved={fetchAll}
        editBranch={editBranch}
      />
    </Page>
  );
}
