import { TbPalette } from "react-icons/tb";
import {
  ArrowLeftStartOnRectangleIcon,
  HomeIcon,
  UserIcon as HiUserIcon,
  HashtagIcon,
  ArrowPathRoundedSquareIcon,
  BellIcon,
  BuildingOffice2Icon,
  BuildingStorefrontIcon,
  ChartBarIcon,
  ClockIcon,
  Cog6ToothIcon,
  DocumentMagnifyingGlassIcon,
  PlusCircleIcon,
  ShareIcon,
  ShieldCheckIcon,
  TagIcon,
  TicketIcon,
  UserCircleIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";
import { ElementType } from "react";

import DashboardsIcon from "@/assets/dualicons/dashboards.svg?react";
import SettingIcon from "@/assets/dualicons/setting.svg?react";

// One icon map shared by superAdmin / branch / employee navigation.
export const navigationIcons: Record<string, ElementType> = {
  dashboards: DashboardsIcon,
  logout: ArrowLeftStartOnRectangleIcon,
  "dashboards.home": HomeIcon,

  branchMaster: BuildingStorefrontIcon,
  "branchMaster.list": BuildingStorefrontIcon,

  regionMaster: ShareIcon,
  "regionMaster.list": ShareIcon,

  departmentMaster: BuildingOffice2Icon,
  "departmentMaster.list": BuildingOffice2Icon,

  employeeMaster: UsersIcon,
  "employeeMaster.list": UsersIcon,

  rolePermissionMaster: ShieldCheckIcon,
  "rolePermissionMaster.list": ShieldCheckIcon,

  managerAssignment: UserCircleIcon,
  "managerAssignment.list": UserCircleIcon,

  ticketCategoryMaster: TagIcon,
  "ticketCategoryMaster.list": TagIcon,

  ticketWorkflowMaster: ArrowPathRoundedSquareIcon,
  "ticketWorkflowMaster.list": ArrowPathRoundedSquareIcon,

  slaEscalationMaster: ClockIcon,
  "slaEscalationMaster.list": ClockIcon,

  ticketManagement: TicketIcon,
  "ticketManagement.list": TicketIcon,

  notificationMaster: BellIcon,
  "notificationMaster.list": BellIcon,

  reportsAnalytics: ChartBarIcon,
  "reportsAnalytics.list": ChartBarIcon,

  ticketHistoryAudit: DocumentMagnifyingGlassIcon,
  "ticketHistoryAudit.list": DocumentMagnifyingGlassIcon,

  companySettings: Cog6ToothIcon,
  "companySettings.list": Cog6ToothIcon,

  raiseTicket: PlusCircleIcon,
  "raiseTicket.list": PlusCircleIcon,

  myTickets: TicketIcon,
  "myTickets.list": TicketIcon,

  myTicketHistory: DocumentMagnifyingGlassIcon,
  "myTicketHistory.list": DocumentMagnifyingGlassIcon,

  myNotifications: BellIcon,
  "myNotifications.list": BellIcon,

  // Existing settings icons (kept so settings.ts keeps working)
  settings: SettingIcon,
  "settings.general": HiUserIcon,
  "settings.appearance": TbPalette,
  "settings.prefix": HashtagIcon,
};
