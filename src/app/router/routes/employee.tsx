import { RouteObject } from "react-router";
import { branchManagerRoutes } from "./branchManager";
import { areaManagerRoutes } from "./areaManager";
// import { contractorRoutes } from "./contractor";

export const employeeRoutes: RouteObject[] = [
  ...branchManagerRoutes,
  ...areaManagerRoutes,
  // ...contractorRoutes,
];
