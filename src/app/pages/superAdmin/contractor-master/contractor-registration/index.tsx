// src/app/pages/superAdmin/contractor-master/contractor-registration/ContractorRegistrationPage.tsx
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
import { ContractorDrawer } from "./ContractorDrawer";
import { columns, exportColumns } from "./columns";
import type { Contractor } from "../shared/types";
import { Delete, Get, Put } from "@/ApiHelper";

export default function ContractorRegistrationPage() {
  const [data, setData] = useState<Contractor[]>([]);
  const [loading, setLoading] = useState(false);
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editContractor, setEditContractor] = useState<Contractor | null>(null);
  const [drawerKey, setDrawerKey] = useState(0);

  const openDrawer = (row: Contractor | null) => {
    setEditContractor(row);
    setDrawerKey((k) => k + 1);
    setDrawerOpen(true);
  };

  const fetchAll = async () => {
    setLoading(true);
    try {
      const res: any = await Get("superadmin/contractor/list", {}, false);
      const rows: any[] = res?.data?.data ?? [];
      setData(
        rows.map((r) => ({
          ...r,
          id: String(r.contractorId ?? r.id),
          registrationDate: r.created || r.registrationDate,
        })),
      );
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to load contractors");
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
      openEditDrawer: (contractor: Contractor) => openDrawer(contractor),
      
      deleteRow: async (row: any) => {
        const contractor = row.original;
        try {
          const res: any = await Delete(
            "superadmin/contractor/delete",
            { contractorId: contractor.id },
            false,
          );
          if (res?.data?.success) {
            toast.success(res.data.message || "Contractor deleted successfully");
            fetchAll();
          } else {
            toast.error(res?.data?.message || "Delete failed");
          }
        } catch (err: any) {
          toast.error(err?.response?.data?.message || "Delete failed");
        }
      },

      toggleStatus: async (contractor: Contractor) => {
        const newStatus = contractor.status === "Active" ? "Inactive" : "Active";
        try {
          const res: any = await Put(
            "superadmin/contractor/update",
            {
              contractorId: contractor.id,
              contractorName: contractor.contractorName,
              companyName: contractor.companyName,
              mobileNumber: contractor.mobileNumber,
              email: contractor.email,
              specialization: contractor.specialization,
              address: contractor.address,
              areaId: contractor.areaId,
              branchId: contractor.branchId,
              contractorDepartmentId: contractor.contractorDepartmentId, 
              status: newStatus,
            },
            false,
          );
          if (res?.data?.success) {
            toast.success(`Contractor marked as ${newStatus}`);
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
    <Page title="Contractor Registration">
      <div className="transition-content w-full pb-5">
        <MasterToolbar
          title="Contractor Registration"
          createLabel="Register Contractor"
          searchPlaceholder="Search contractors..."
          table={table}
          showFilters={false}
          onToggleFilters={() => {}}
          onCreate={() => openDrawer(null)}
          onExportExcel={() => exportToExcel(data, exportColumns, "contractors")}
          onExportPdf={() => exportToPdf(data, exportColumns, "Contractor List", "contractors")}
        />

        <MasterTable
          table={table}
          columnCount={columns.length}
          emptyMessage={
            loading
              ? "Loading contractors..."
              : "No contractors found. Click Register Contractor to add one."
          }
        />
      </div>

      <ContractorDrawer
        key={drawerKey}
        isOpen={drawerOpen}
        close={() => setDrawerOpen(false)}
        onSaved={fetchAll}
        editContractor={editContractor}
      />
    </Page>
  );
}