import { useEffect, useState } from "react";
import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Page } from "@/components/shared/Page";
import { MasterToolbar } from "../shared/MasterToolbar"; // Adjust paths
import { MasterTable } from "../shared/MasterTable";
import { columns, exportColumns } from "./columns";
import { exportToExcel, exportToPdf } from "../shared/export";
import { Account, emptyAccount } from "./shared/types";
import { useNavigate,} from "react-router";

export default function AccountPage() {
  const navigate = useNavigate();
  const [data, setData] = useState<Account[]>([]);
  const [loading, setLoading] = useState(false);
  const [globalFilter, setGlobalFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Dummy data for now - replace with API call
  useEffect(() => {
    setLoading(true);
    // Example API: Get("superadmin/account/list").then(...)
    setTimeout(() => {
      setData([
        {
          ...emptyAccount(),
          id: "1",
          accountName: "AJEETBHAI",
          groupName: "Sundry Debtors",
          city: "Rajkot",
          state: "Gujarat",
          mobile: "9081540775",
        },
        {
          ...emptyAccount(),
          id: "2",
          accountName: "MANTHAN ENTERPRISE",
          groupName: "Sundry Debtors",
          city: "Rajkot",
          state: "Gujarat",
          mobile: "9081540712",
        },
      ]);
      setLoading(false);
    }, 500);
  }, []);

  const table = useReactTable({
    data,
    columns,
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    meta: {
      openEditDrawer: (row: Account) => {
        navigate(`/user-master/account-master/edit/${row.id}`);
      },
      deleteRow: async (row: any) => {
        // Implement delete logic
        console.log("Delete", row.original);
      },
    },
  });

  return (
    <Page title="Account">
      <div className="transition-content w-full pb-5">
        <MasterToolbar
          title="Account"
          createLabel="Create Account"
          searchPlaceholder="Search accounts..."
          table={table}
          showFilters={showFilters}
          onToggleFilters={() => setShowFilters((v) => !v)}
          onCreate={() => navigate("/user-master/account-master/create")} // 👈 Redirects to new page
          onExportExcel={() => exportToExcel(data, exportColumns, "accounts")}
          onExportPdf={() =>
            exportToPdf(data, exportColumns, "Account List", "accounts")
          }
        />
        <MasterTable
          table={table}
          columnCount={columns.length}
          emptyMessage={loading ? "Loading..." : "No accounts found."}
        />
      </div>
    </Page>
  );
}
