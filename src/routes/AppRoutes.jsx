import {
  BrowserRouter,
  Navigate,
  Routes,
  Route,
} from "react-router-dom";

import ProtectedRoute from "./ProtectedRoute";

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

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>

        {/* LOGIN */}
        <Route
          path="/login"
          element={<Login />}
        />

        {/* PROTECTED ROUTES */}
        <Route element={<ProtectedRoute />}>

          {/* DASHBOARD */}
          <Route
            path="/"
            element={<Dashboard />}
          />

          <Route
            path="/dashboard"
            element={<Dashboard />}
          />

          {/* USERS */}
          <Route
            path="/users"
            element={<Users />}
          />

          {/* CONTRACTS */}
          <Route
            path="/contracts"
            element={<Contracts />}
          />

          <Route
            path="/contracts/:contractId"
            element={<ContractDetails />}
          />

          {/* CONTRACT TYPES */}
          <Route
            path="/contract-types"
            element={<ContractTypes />}
          />

          {/* PARTIES */}
          <Route
            path="/parties"
            element={<Parties />}
          />

          {/* APPROVALS */}
          <Route
            path="/approvals"
            element={<Approvals />}
          />

          {/* PAYMENTS */}
          <Route
            path="/payments"
            element={<Payments />}
          />

          {/* MILESTONES */}
          <Route
            path="/milestones"
            element={<Milestones />}
          />

          {/* AMENDMENTS */}
          <Route
            path="/amendments"
            element={<Amendments />}
          />

          {/* RENEWALS */}
          <Route
            path="/renewals"
            element={<Renewals />}
          />

          {/* REPORTS */}
          <Route
            path="/reports"
            element={<Reports />}
          />

          {/* SETTINGS */}
          <Route
            path="/settings"
            element={<Settings />}
          />

        </Route>

        {/* FALLBACK */}
        <Route
          path="*"
          element={
            <Navigate
              to="/"
              replace
            />
          }
        />

      </Routes>
    </BrowserRouter>
  );
}