export interface ResolverTeam {
  id: string;
  resolverTeamNo?: string;
  teamName: string;
  departmentId: string;
  departmentName: string;
  teamDescription: string;
  teamLeaderId: string;
  teamLeaderName: string;
  teamMemberIds: string[];
  teamMemberNames: string;
  coverageType: string;
  regionId: string;
  regionName: string;
  assignedBranchIds: string[];
  assignedBranchNames: string;
  assignmentMethod: string;
  teamEmail: string;
  status: "Active" | "Inactive";
  createdBy: string;
  createdAt: string;
}
