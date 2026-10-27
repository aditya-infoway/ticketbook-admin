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
import { RoleDrawer, DrawerMode } from "./RoleDrawer";
import { columns, exportColumns } from "./Columns";
import { Role, emptyRole, formatDate, mapApiRole } from "./data";
import {
  dataScopeOptions,
  getRestrictionLabel,
  getScopeLabel,
  roleStatusOptions,
} from "./Options";

interface Option {
  id: string;
  label: string;
}

const ALL: Option = { id: "", label: "All" };

// Backend: app.use("/superadmin/role", routes)
const API = {
  list: "superadmin/role/list",
  create: "superadmin/role/create",
  update: "superadmin/role/update",
  delete: "superadmin/role/delete",
};

export default function RolePage() {
  const [data, setData] = useState<Role[]>([]);
  const [categories, setCategories] = useState<Option[]>([]);
  const [departments, setDepartments] = useState<Option[]>([]);
  const [loading, setLoading] = useState(true);

  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<DrawerMode>("create");
  const [editing, setEditing] = useState<Role | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filterCategory, setFilterCategory] = useState("");
  const [filterScope, setFilterScope] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  // ---- Fetch roles + categories + departments ----
  const fetchAll = async () => {
    setLoading(true);
    try {
      const [roleRes, catRes, deptRes] = await Promise.all([
        Get(API.list, {}, false).catch(() => null),
        Get("superadmin/role-category/list", {}, false).catch(() => null),
        Get("superadmin/department/list", {}, false).catch(() => null),
      ]);

      // Category list backend se Display Order se sorted aati hai
      if (catRes?.data?.success) {
        setCategories(
          (catRes.data.data || []).map((c: any) => ({
            id: String(c.roleCategoryId ?? c.id),
            label: c.roleCategoryCode
              ? `${c.roleCategoryName} (${c.roleCategoryCode})`
              : (c.roleCategoryName ?? ""),
            status: c.status,
          })),
        );
      }

      if (deptRes?.data?.success) {
        setDepartments(
          (deptRes.data.data || []).map((d: any) => ({
            id: String(d.departmentId ?? d.id),
            label: d.departmentCode
              ? `${d.departmentName} (${d.departmentCode})`
              : (d.departmentName ?? ""),
            status: d.status,
          })),
        );
      }

      if (roleRes?.data?.success) {
        setData((roleRes.data.data || []).map(mapApiRole));
      } else {
        toasterrormsg(roleRes?.data?.message || "Failed to fetch roles.");
      }
    } catch {
      toasterrormsg("Something went wrong while fetching roles.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Dropdown me sirf Active items. Edit me purani (ab inactive) category/department
  // bhi dikhe, isliye current role ki selection add kar dete hain.
  const categoryOptions = useMemo(() => {
    const active = categories.filter((c: any) => c.status === "Active");
    const current = categories.find((c) => c.id === editing?.roleCategoryId);
    return current && !active.some((c) => c.id === current.id)
      ? [...active, current]
      : active;
  }, [categories, editing]);

  const departmentOptions = useMemo(() => {
    const selectedIds = new Set(editing?.departmentIds ?? []);
    return departments.filter(
      (d: any) => d.status === "Active" || selectedIds.has(d.id),
    );
  }, [departments, editing]);

  const categoryFilterOptions = [ALL, ...categories];
  const scopeFilterOptions = [ALL, ...dataScopeOptions];
  const statusFilterOptions = [ALL, ...roleStatusOptions];

  const filteredData = useMemo(
    () =>
      data.filter((item) => {
        if (filterCategory && item.roleCategoryId !== filterCategory)
          return false;
        if (filterScope && item.defaultDataScope !== filterScope) return false;
        if (filterStatus && item.status !== filterStatus) return false;
        return true;
      }),
    [data, filterCategory, filterScope, filterStatus],
  );

  const exportRows = filteredData.map((row) => ({
    ...row,
    scopeName: getScopeLabel(row.defaultDataScope),
    restrictionName: getRestrictionLabel(row.departmentRestriction),
    departmentsText:
      row.departmentRestriction === "all"
        ? "All Departments"
        : row.departmentNames.join(", "),
    createdAtText: formatDate(row.createdAt),
  }));

  // ---- Payload (financialYearId + createdBy / createdType) ----
  const getFinancialYearId = (): string | null => {
    const financialYearId = localStorage.getItem("financialYearId");
    if (!financialYearId) {
      toasterrormsg("Financial Year not found. Please select a company year.");
      return null;
    }
    return financialYearId;
  };

  const buildPayload = (item: Role, financialYearId: string) => {
    const companyId = localStorage.getItem("companyId");
    return {
      financialYearId: Number(financialYearId),
      ...(companyId ? { companyId: Number(companyId) } : {}),
      roleCode: item.roleCode,
      roleName: item.roleName,
      roleCategoryId: item.roleCategoryId,
      description: item.description,
      defaultDataScope: item.defaultDataScope,
      departmentRestriction: item.departmentRestriction,
      departmentIds:
        item.departmentRestriction === "selected"
          ? item.departmentIds.map((d) => Number(d))
          : [],
      status: item.status,
      createdBy: companyId ? Number(companyId) : undefined,
      createdType: "Super Admin",
    };
  };

  // ---- Save (create / update) ----
  const handleSave = async (item: Role) => {
    const financialYearId = getFinancialYearId();
    if (!financialYearId) return;

    const payload = buildPayload(item, financialYearId);

    try {
      if (item.id) {
        const response = await Put(
          API.update,
          { roleId: item.id, ...payload },
          false,
        );
        if (response.data?.success) {
          toastsuccessmsg(response.data?.message || "Role updated successfully.");
          fetchAll();
        } else {
          toasterrormsg(response.data?.message || "Failed to update role.");
        }
      } else {
        const response = await Post(API.create, payload, false);
        if (response.data?.success) {
          toastsuccessmsg(response.data?.message || "Role created successfully.");
          fetchAll();
        } else {
          toasterrormsg(response.data?.message || "Failed to create role.");
        }
      }
    } catch {
      toasterrormsg("Something went wrong while saving the role.");
    }
  };

  // ---- Activate / Deactivate ----
  const handleToggleStatus = async (row: Role) => {
    const financialYearId = getFinancialYearId();
    if (!financialYearId) return;

    const nextStatus = row.status === "Active" ? "Inactive" : "Active";
    try {
      const response = await Put(
        API.update,
        {
          roleId: row.id,
          ...buildPayload({ ...row, status: nextStatus }, financialYearId),
        },
        false,
      );
      if (response.data?.success) {
        toastsuccessmsg(
          response.data?.message ||
            `Role ${nextStatus === "Active" ? "activated" : "deactivated"} successfully.`,
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
  const handleDelete = async (row: Role) => {
    try {
      const response = await Delete(API.delete, { roleId: row.id }, false);
      if (response.data?.success) {
        toastsuccessmsg(response.data?.message || "Role deleted successfully.");
        setData((prev) => prev.filter((item) => item.id !== row.id));
      } else {
        toasterrormsg(response.data?.message || "Failed to delete role.");
      }
    } catch {
      toasterrormsg("Something went wrong while deleting the role.");
    }
  };

  const handleDeleteMany = async (rows: { original: Role }[]) => {
    try {
      await Promise.all(
        rows.map((r) => Delete(API.delete, { roleId: r.original.id }, false)),
      );
      const ids = new Set(rows.map((r) => r.original.id));
      setData((prev) => prev.filter((item) => !ids.has(item.id)));
      setRowSelection({});
      toastsuccessmsg("Selected roles deleted successfully.");
    } catch {
      toasterrormsg("Something went wrong while deleting roles.");
    }
  };

  const openDrawer = (mode: DrawerMode, row: Role | null) => {
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
      openViewDrawer: (row: Role) => openDrawer("view", row),
      openEditDrawer: (row: Role) => openDrawer("edit", row),
      deleteRow: (row: any) => handleDelete(row.original),
      deleteRows: (rows: any) => handleDeleteMany(rows),
      toggleStatus: (row: Role) => handleToggleStatus(row),
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
    <Page title="Role">
      <div className="transition-content w-full pb-5">
        <MasterToolbar
          title="Role Master"
          createLabel="Add Role"
          searchPlaceholder="Search by code or name..."
          table={table}
          showFilters={showFilters}
          onToggleFilters={() => setShowFilters((v) => !v)}
          onCreate={() => openDrawer("create", emptyRole())}
          onExportExcel={() => exportToExcel(exportRows, exportColumns, "roles")}
          onExportPdf={() =>
            exportToPdf(exportRows, exportColumns, "Role List", "roles")
          }
          filterPanel={
            <div className="grid gap-4 sm:grid-cols-3">
              <Listbox
                data={categoryFilterOptions}
                value={
                  categoryFilterOptions.find((i) => i.id === filterCategory) ||
                  ALL
                }
                onChange={(item) => setFilterCategory(item.id)}
                label="Role Category"
                placeholder="All categories"
                displayField="label"
              />
              <Listbox
                data={scopeFilterOptions}
                value={
                  scopeFilterOptions.find((i) => i.id === filterScope) || ALL
                }
                onChange={(item) => setFilterScope(item.id)}
                label="Data Scope"
                placeholder="All scopes"
                displayField="label"
              />
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
            </div>
          }
        />

        <MasterTable
          table={table}
          columnCount={columns.length}
          emptyMessage={
            loading
              ? "Loading roles..."
              : "No roles found. Click Add Role to add one."
          }
        />
      </div>

      <RoleDrawer
        isOpen={drawerOpen}
        close={() => setDrawerOpen(false)}
        mode={drawerMode}
        role={editing}
        roles={data}
        categories={categoryOptions}
        departments={departmentOptions}
        onSave={handleSave}
      />
    </Page>
  );
}