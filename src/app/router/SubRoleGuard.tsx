import { Navigate, Outlet } from "react-router";
import { EmployeeSubRole, getCurrentEmployeeSubRole } from "@/app/navigation/role";

export default function SubRoleGuard({ allow }: { allow: EmployeeSubRole }) {
  return getCurrentEmployeeSubRole() === allow ? (
    <Outlet />
  ) : (
    <Navigate to="/dashboards/home" replace />
  );
}