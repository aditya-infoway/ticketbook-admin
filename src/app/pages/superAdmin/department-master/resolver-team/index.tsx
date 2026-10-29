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
import { Delete, Get, Put } from "@/ApiHelper";
import { exportToExcel, exportToPdf } from "../shared/export";
import { MasterTable } from "../shared/MasterTable";
import { MasterToolbar } from "../shared/MasterToolbar";
import { ResolverTeamDataDrawer } from "./ResolverTeamDataDrawer";
import { columns, exportColumns } from "./columns";
import type { ResolverTeam } from "../shared/types";

function mapApiTeam(item: any): ResolverTeam {
  return {
    id: String(item.resolverTeamId),
    resolverTeamNo: item.resolverTeamNo ?? "",
    teamCode: item.teamCode ?? "",
    teamName: item.teamName ?? "",
    departmentIds: (item.departmentIds ?? []).map(String),
    departmentNames: item.departmentNames ?? [],
    departmentName: item.departmentName ?? "",
    teamDescription: item.teamDescription ?? "",
    teamLeaderId: item.teamLeaderId ? String(item.teamLeaderId) : "",
    teamLeaderName: item.teamLeaderName ?? "",
    teamMemberIds: (item.teamMemberIds ?? []).map(String),
    teamMemberNames: (item.teamMemberNames ?? []).join(", "),
    coverageType: item.coverageType ?? "All",
    regionId: item.regionId ? String(item.regionId) : "",
    regionName: item.regionName ?? "",
    assignedBranchIds: (item.assignedBranchIds ?? []).map(String),
    assignmentMethod: item.assignmentMethod ?? "Auto",
    teamEmail: item.teamEmail ?? "",
    status: item.status ?? "Active",
    createdBy: item.createdBy ?? "",
    createdAt: item.created ?? "",
  } as unknown as ResolverTeam;
}

export default function ResolverTeamPage() {
  const [data, setData] = useState<ResolverTeam[]>([]);
  const [loading, setLoading] = useState(false);
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editTeam, setEditTeam] = useState<ResolverTeam | null>(null);

  // bump on every open so the drawer remounts and re-reads editTeam
  const [drawerKey, setDrawerKey] = useState(0);
  const openDrawer = (row: ResolverTeam | null) => {
    setEditTeam(row);
    setDrawerKey((k) => k + 1);
    setDrawerOpen(true);
  };

  const [showFilters, setShowFilters] = useState(false);
  const [filterStatus, setFilterStatus] = useState("");

  const fetchAll = async () => {
    setLoading(true);
    try {
      const res: any = await Get("superadmin/resolver-team/list", {}, false);
      const rows: any[] = res?.data?.data ?? [];
      setData(rows.map(mapApiTeam));
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || "Failed to load resolver teams",
      );
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
      openEditDrawer: (team: ResolverTeam) => openDrawer(team),
      deleteRow: async (row: any) => {
        const team = row.original;
        if (
          window.confirm(`Are you sure you want to delete ${team.teamName}?`)
        ) {
          try {
            await Delete(
              "superadmin/resolver-team/delete",
              { resolverTeamId: team.id },
              false,
            );
            toast.success("Resolver team deleted successfully");
            fetchAll();
          } catch (err: any) {
            toast.error(err?.response?.data?.message || "Delete failed");
          }
        }
      },
      toggleStatus: async (team: ResolverTeam) => {
        const newStatus = team.status === "Active" ? "Inactive" : "Active";
        try {
          // update replaces members + branches, so send them back unchanged
          await Put(
            "superadmin/resolver-team/update",
            {
              resolverTeamId: team.id,
              teamCode: (team as any).teamCode,
              teamName: team.teamName,
              teamDescription: team.teamDescription,
              departmentIds: ((team as any).departmentIds || []).map(Number),
              teamLeaderId: team.teamLeaderId
                ? Number(team.teamLeaderId)
                : null,
              teamMemberIds: (team.teamMemberIds || []).map(Number),
              coverageType: team.coverageType,
              regionId: team.regionId ? Number(team.regionId) : null,
              assignedBranchIds: (team.assignedBranchIds || []).map(Number),
              assignmentMethod: team.assignmentMethod,
              teamEmail: team.teamEmail,
              status: newStatus,
            },
            false,
          );
          toast.success(`Team marked as ${newStatus}`);
          fetchAll();
        } catch (err: any) {
          toast.error(err?.response?.data?.message || "Status update failed");
        }
      },
    },
  });

  return (
    <Page title="Resolver Team">
      <div className="transition-content w-full pb-5">
        <MasterToolbar
          title="Resolver Team"
          createLabel="Add Team"
          searchPlaceholder="Search teams..."
          table={table}
          showFilters={showFilters}
          onToggleFilters={() => setShowFilters((v) => !v)}
          onCreate={() => openDrawer(null)}
          onExportExcel={() =>
            exportToExcel(filteredData, exportColumns, "resolver_teams")
          }
          onExportPdf={() =>
            exportToPdf(
              filteredData,
              exportColumns,
              "Resolver Team List",
              "resolver_teams",
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
              ? "Loading resolver teams..."
              : "No resolver teams found. Click Add Team to add one."
          }
        />
      </div>

      <ResolverTeamDataDrawer
        key={drawerKey}
        isOpen={drawerOpen}
        close={() => setDrawerOpen(false)}
        onSaved={fetchAll}
        editTeam={editTeam}
      />
    </Page>
  );
}
