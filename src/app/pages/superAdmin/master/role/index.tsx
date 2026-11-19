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
import { roleStatusOptions } from "./Options";

interface Option {
  id: string;
  label: string;
}

const ALL: Option = { id: "", label: "All" };

// Backend: app.use("/superadmin/role", routes)
const API = {
  list: "superadmin/role/list",
  nextNo: "superadmin/role/next-no",
  create: "superadmin/role/create",
  update: "superadmin/role/update",
  delete: "superadmin/role/delete",
  departmentList: "superadmin/department/list",
};

export default function RolePage() {
  const [data, setData] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);

  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<DrawerMode>("create");
  const [editing, setEditing] = useState<Role | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filterStatus, setFilterStatus] = useState("");
  const [nextRoleNo, setNextRoleNo] = useState("");
  const [departments, setDepartments] = useState<Option[]>([]);

  // ---- Fetch roles + categories + departments ----
  const fetchAll = async () => {
    setLoading(true);
    try {
      const roleRes = await Get(API.list, {}, false).catch(() => null);

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


    const fetchDepartments = async () => {
    try {
      const response = await Get(API.departmentList, {}, false);

      if (response?.data?.success) {
        const departmentData = Array.isArray(response.data.data)
          ? response.data.data
          : [];

        setDepartments(
          departmentData.map((item: any) => ({
            id: String(item.departmentId),
            label: item.departmentName,
          })),
        );
      } else {
        toasterrormsg(
          response?.data?.message || "Failed to fetch departments.",
        );
      }
    } catch {
      toasterrormsg("Something went wrong while fetching departments.");
    }
  };

  useEffect(() => {
    fetchAll();
     fetchDepartments();
  }, []);



  // Create drawer khulte hi next Role ID ka preview lao
  useEffect(() => {
    if (!drawerOpen || drawerMode !== "create") return;

    const financialYearId = localStorage.getItem("financialYearId");
    if (!financialYearId) return;

    let active = true;
    setNextRoleNo("");

    Get(API.nextNo, { financialYearId }, false)
      .then((res: any) => {
        if (!active) return;
        if (res?.data?.success) {
          setNextRoleNo(res.data.data?.roleNo || "");
        } else {
          toasterrormsg(res?.data?.message || "Failed to generate Role ID.");
        }
      })
      .catch(() => active && toasterrormsg("Failed to generate Role ID."));

    return () => {
      active = false;
    };
  }, [drawerOpen, drawerMode]);

  const statusFilterOptions = [ALL, ...roleStatusOptions];

  const filteredData = useMemo(
    () =>
      data.filter((item) => {
        if (filterStatus && item.status !== filterStatus) return false;
        return true;
      }),
    [data, filterStatus],
  );

  const exportRows = filteredData.map((row) => ({
    ...row,

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
      roleName: item.roleName,
       departmentId: item.departmentId,
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
          toastsuccessmsg(
            response.data?.message || "Role updated successfully.",
          );
          fetchAll();
        } else {
          toasterrormsg(response.data?.message || "Failed to update role.");
        }
      } else {
        const response = await Post(API.create, payload, false);
        if (response.data?.success) {
          toastsuccessmsg(
            response.data?.message || "Role created successfully.",
          );
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
          searchPlaceholder="Search by ID or name..."
          table={table}
          showFilters={showFilters}
          onToggleFilters={() => setShowFilters((v) => !v)}
          onCreate={() => openDrawer("create", emptyRole())}
          onExportExcel={() =>
            exportToExcel(exportRows, exportColumns, "roles")
          }
          onExportPdf={() =>
            exportToPdf(exportRows, exportColumns, "Role List", "roles")
          }
          filterPanel={
            <div className="grid gap-4 sm:max-w-xs">
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
         departments={departments}
        nextRoleNo={nextRoleNo}
        onSave={handleSave}
      />
    </Page>
  );
}
