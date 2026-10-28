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

import { Page } from "@/components/shared/Page";
import { Listbox } from "@/components/shared/form/StyledListbox";
import { DatePicker } from "@/components/shared/form/Datepicker";
import { fuzzyFilter } from "@/utils/react-table/fuzzyFilter";
import {
  Get,
  Post,
  Put,
  Delete,
  toastsuccessmsg,
  toasterrormsg,
} from "@/ApiHelper";
// NOTE: adjust to where your shared master files live
import {
  exportToExcel,
  exportToPdf,
} from "@/app/pages/dashboards/home/crm-analytics/shared/export";
import { MasterTable } from "@/app/pages/dashboards/home/crm-analytics/shared/MasterTable";
import { MasterToolbar } from "@/app/pages/dashboards/home/crm-analytics/shared/MasterToolbar";
import { RoleCategoryDrawer, DrawerMode } from "./RoleCategoryDrawer";
import { columns, exportColumns } from "./Columns";
import {
  RoleCategory,
  emptyRoleCategory,
  formatDate,
  mapApiRoleCategory,
} from "./data";
import { roleCategoryStatusOptions } from "./Options";

interface Option {
  id: string;
  label: string;
}

const ALL: Option = { id: "", label: "All" };

// Backend: app.use("/superadmin/role-category", routes)
const API = {
  list: "superadmin/role-category/list",
  create: "superadmin/role-category/create",
  update: "superadmin/role-category/update",
  delete: "superadmin/role-category/delete",
};

// DatePicker Date[] deta hai -> state me "YYYY-MM-DD" string rakho
const formatDateForApi = (value: Date | undefined): string => {
  if (!value || isNaN(value.getTime())) return "";
  const yyyy = value.getFullYear();
  const mm = String(value.getMonth() + 1).padStart(2, "0");
  const dd = String(value.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

export default function RoleCategoryPage() {
  const [data, setData] = useState<RoleCategory[]>([]);
  const [loading, setLoading] = useState(true);

  const [globalFilter, setGlobalFilter] = useState("");
  // Default sort: Display Order (ascending)
  const [sorting, setSorting] = useState<SortingState>([
    { id: "displayOrder", desc: false },
  ]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<DrawerMode>("create");
  const [editing, setEditing] = useState<RoleCategory | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterFrom, setFilterFrom] = useState("");
  const [filterTo, setFilterTo] = useState("");

  // ---- Fetch role categories ----
  const fetchAll = async () => {
    setLoading(true);
    try {
      const response = await Get(API.list, {}, false);
      if (response.data?.success) {
        setData((response.data.data || []).map(mapApiRoleCategory));
      } else {
        toasterrormsg(
          response.data?.message || "Failed to fetch role categories.",
        );
      }
    } catch {
      toasterrormsg("Something went wrong while fetching role categories.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const statusFilterOptions = [ALL, ...roleCategoryStatusOptions];

  // Code / Name search = toolbar global filter.
  // Status aur Created Date = filter panel.
  const filteredData = useMemo(
    () =>
      data.filter((item) => {
        if (filterStatus && item.status !== filterStatus) return false;

        const created = item.createdAt ? new Date(item.createdAt) : null;
        if (
          filterFrom &&
          (!created || created < new Date(`${filterFrom}T00:00:00`))
        )
          return false;
        if (
          filterTo &&
          (!created || created > new Date(`${filterTo}T23:59:59`))
        )
          return false;

        return true;
      }),
    [data, filterStatus, filterFrom, filterTo],
  );

  const exportRows = filteredData.map((row) => ({
    ...row,
    createdAtText: formatDate(row.createdAt),
  }));

  // ---- Payload (financialYearId + createdBy / createdType Department jaisa) ----
  const buildPayload = (item: RoleCategory, financialYearId: string) => {
    const companyId = localStorage.getItem("companyId");
    return {
      financialYearId: Number(financialYearId),
      ...(companyId ? { companyId: Number(companyId) } : {}),
      roleCategoryCode: item.roleCategoryCode,
      roleCategoryName: item.roleCategoryName,
      description: item.description,
      displayOrder: item.displayOrder ? Number(item.displayOrder) : null,
      status: item.status,
      createdBy: companyId ? Number(companyId) : undefined,
      createdType: "Super Admin",
    };
  };

  // localStorage se financialYearId lo, na mile to error toast
  const getFinancialYearId = (): string | null => {
    const financialYearId = localStorage.getItem("financialYearId");
    if (!financialYearId) {
      toasterrormsg("Financial Year not found. Please select a company year.");
      return null;
    }
    return financialYearId;
  };

  // ---- Save (create / update) ----
  const handleSave = async (item: RoleCategory) => {
    const financialYearId = getFinancialYearId();
    if (!financialYearId) return;

    const payload = buildPayload(item, financialYearId);

    try {
      if (item.id) {
        const response = await Put(
          API.update,
          { roleCategoryId: item.id, ...payload },
          false,
        );
        if (response.data?.success) {
          toastsuccessmsg(
            response.data?.message || "Role category updated successfully.",
          );
          fetchAll();
        } else {
          toasterrormsg(
            response.data?.message || "Failed to update role category.",
          );
        }
      } else {
        const response = await Post(API.create, payload, false);
        if (response.data?.success) {
          toastsuccessmsg(
            response.data?.message || "Role category created successfully.",
          );
          fetchAll();
        } else {
          toasterrormsg(
            response.data?.message || "Failed to create role category.",
          );
        }
      }
    } catch {
      toasterrormsg("Something went wrong while saving the role category.");
    }
  };

  // ---- Activate / Deactivate ----
  const handleToggleStatus = async (row: RoleCategory) => {
    const financialYearId = getFinancialYearId();
    if (!financialYearId) return;

    const nextStatus = row.status === "Active" ? "Inactive" : "Active";
    try {
      const response = await Put(
        API.update,
        {
          roleCategoryId: row.id,
          ...buildPayload({ ...row, status: nextStatus }, financialYearId),
        },
        false,
      );
      if (response.data?.success) {
        toastsuccessmsg(
          response.data?.message ||
            `Role category ${nextStatus === "Active" ? "activated" : "deactivated"} successfully.`,
        );
        setData((prev) =>
          prev.map((item) =>
            item.id === row.id ? { ...item, status: nextStatus } : item,
          ),
        );
      } else {
        toasterrormsg(response.data?.message || "Failed to update status.");
      }
    } catch {
      toasterrormsg("Something went wrong while updating the status.");
    }
  };

  // ---- Delete ----
  const handleDelete = async (row: RoleCategory) => {
    try {
      const response = await Delete(
        API.delete,
        { roleCategoryId: row.id },
        false,
      );
      if (response.data?.success) {
        toastsuccessmsg(
          response.data?.message || "Role category deleted successfully.",
        );
        setData((prev) => prev.filter((item) => item.id !== row.id));
      } else {
        toasterrormsg(
          response.data?.message || "Failed to delete role category.",
        );
      }
    } catch {
      toasterrormsg("Something went wrong while deleting the role category.");
    }
  };

  const handleDeleteMany = async (rows: { original: RoleCategory }[]) => {
    try {
      await Promise.all(
        rows.map((r) =>
          Delete(API.delete, { roleCategoryId: r.original.id }, false),
        ),
      );
      const ids = new Set(rows.map((r) => r.original.id));
      setData((prev) => prev.filter((item) => !ids.has(item.id)));
      setRowSelection({});
      toastsuccessmsg("Selected role categories deleted successfully.");
    } catch {
      toasterrormsg("Something went wrong while deleting role categories.");
    }
  };

  const openDrawer = (mode: DrawerMode, row: RoleCategory | null) => {
    setDrawerMode(mode);
    setEditing(row);
    setDrawerOpen(true);
  };

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { globalFilter, sorting, rowSelection },
    enableRowSelection: true,
    getRowId: (row) => row.id,
    meta: {
      openViewDrawer: (row: RoleCategory) => openDrawer("view", row),
      openEditDrawer: (row: RoleCategory) => openDrawer("edit", row),
      deleteRow: (row: any) => handleDelete(row.original),
      deleteRows: (rows: any) => handleDeleteMany(rows),
      toggleStatus: (row: RoleCategory) => handleToggleStatus(row),
    } as any,
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
    <Page title="Role Category">
      <div className="transition-content w-full pb-5">
        <MasterToolbar
          title="Role Category"
          createLabel="Add Category"
          searchPlaceholder="Search by code or name..."
          table={table}
          showFilters={showFilters}
          onToggleFilters={() => setShowFilters((v) => !v)}
          onCreate={() => openDrawer("create", emptyRoleCategory())}
          onExportExcel={() =>
            exportToExcel(exportRows, exportColumns, "role-categories")
          }
          onExportPdf={() =>
            exportToPdf(
              exportRows,
              exportColumns,
              "Role Category List",
              "role-categories",
            )
          }
          filterPanel={
            <div className="grid gap-4 sm:grid-cols-3">
              <Listbox
                data={statusFilterOptions}
                value={
                  statusFilterOptions.find((i) => i.id === filterStatus) || ALL
                }
                onChange={(item) => setFilterStatus(item.id)}
                label="Status"
                placeholder="All statuses"
                displayField="label"
              />
              <DatePicker
                label="Created From"
                value={filterFrom}
                onChange={(selectedDates: Date[]) =>
                  setFilterFrom(formatDateForApi(selectedDates?.[0]))
                }
                placeholder="Select Date"
              />
              <DatePicker
                label="Created To"
                value={filterTo}
                onChange={(selectedDates: Date[]) =>
                  setFilterTo(formatDateForApi(selectedDates?.[0]))
                }
                placeholder="Select Date"
              />
            </div>
          }
        />

        <MasterTable
          table={table}
          columnCount={columns.length}
          emptyMessage={
            loading
              ? "Loading role categories..."
              : "No role categories found. Click Add Category to add one."
          }
        />
      </div>

      <RoleCategoryDrawer
        isOpen={drawerOpen}
        close={() => setDrawerOpen(false)}
        mode={drawerMode}
        roleCategory={editing}
        categories={data}
        onSave={handleSave}
      />
    </Page>
  );
}