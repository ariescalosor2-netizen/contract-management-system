import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import RoleRoute from "./RoleRoute";
import NonRestrictedRoute from "./NonRestrictedRoute";
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import Users from "../pages/Users";
import Contracts from "../pages/Contracts";
import ContractDetails from "../pages/ContractDetails";
import ContractTypes from "../pages/ContractTypes";
import Parties from "../pages/Parties";
import Approvals from "../pages/Approvals";
import Payments from "../pages/Payments";
import Milestones from "../pages/Milestones";
import Amendments from "../pages/Amendments";
import Renewals from "../pages/Renewals";
import Reports from "../pages/Reports";
import Settings from "../pages/Settings";
import RoleHome from "../pages/RoleHome";
import SuperAdminDashboard from "../pages/SuperAdminDashboard";
import SuperAdminOrganizations from "../pages/SuperAdminOrganizations";
import SuperAdminUsers from "../pages/SuperAdminUsers";
import SuperAdminRoles from "../pages/SuperAdminRoles";
import SuperAdminActivity from "../pages/SuperAdminActivity";
import SuperAdminReports from "../pages/SuperAdminReports";
import ViewerDashboard from "../pages/ViewerDashboard";
import ViewerContracts from "../pages/ViewerContracts";
import ViewerContractDetails from "../pages/ViewerContractDetails";
import ViewerParties from "../pages/ViewerParties";
import ViewerReports from "../pages/ViewerReports";

export default function AppRoutes() {
  return <BrowserRouter><Routes>
    <Route path="/login" element={<Login />} />
    <Route element={<ProtectedRoute />}>
      <Route path="/" element={<RoleHome />} />
      <Route element={<NonRestrictedRoute excludedRoles={["Super Admin", "Viewer"]} />}>
        <Route path="/dashboard" element={<Dashboard />} />
      </Route>

      <Route element={<RoleRoute roles={["Super Admin"]} />}>
        <Route path="/super-admin" element={<SuperAdminDashboard />} />
        <Route path="/super-admin/organizations" element={<SuperAdminOrganizations />} />
        <Route path="/super-admin/users" element={<SuperAdminUsers />} />
        <Route path="/super-admin/roles" element={<SuperAdminRoles />} />
        <Route path="/super-admin/activity" element={<SuperAdminActivity />} />
        <Route path="/super-admin/reports" element={<SuperAdminReports />} />
      </Route>

      <Route element={<RoleRoute roles={["Viewer"]} />}>
        <Route path="/viewer" element={<ViewerDashboard />} />
        <Route path="/viewer/contracts" element={<ViewerContracts />} />
        <Route path="/viewer/contracts/:contractId" element={<ViewerContractDetails />} />
        <Route path="/viewer/parties" element={<ViewerParties />} />
        <Route path="/viewer/reports" element={<ViewerReports />} />
      </Route>

      <Route element={<NonRestrictedRoute excludedRoles={["Super Admin", "Viewer"]} />}>
        <Route path="/users" element={<Users />} />
        <Route path="/contracts" element={<Contracts />} />
        <Route path="/contracts/:contractId" element={<ContractDetails />} />
        <Route path="/contract-types" element={<ContractTypes />} />
        <Route path="/parties" element={<Parties />} />
        <Route path="/approvals" element={<Approvals />} />
        <Route path="/payments" element={<Payments />} />
        <Route path="/milestones" element={<Milestones />} />
        <Route path="/amendments" element={<Amendments />} />
        <Route path="/renewals" element={<Renewals />} />
        <Route path="/reports" element={<Reports />} />
      </Route>

      <Route element={<RoleRoute roles={["Super Admin", "Administrator", "Contract Manager", "Finance Officer", "Legal Officer", "Approver"]} />}>
        <Route path="/settings" element={<Settings />} />
      </Route>
    </Route>
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes></BrowserRouter>;
}
