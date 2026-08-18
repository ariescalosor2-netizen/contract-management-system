import { useEffect, useState } from "react";

import MainLayout from "../layouts/MainLayout";

import StatCard from "../components/dashboard/StatCard";
import StatusChart from "../components/dashboard/StatusChart";
import MonthlyChart from "../components/dashboard/MonthlyChart";
import RecentContracts from "../components/dashboard/RecentContracts";
import UpcomingActivities from "../components/dashboard/UpcomingActivities";

import { getDashboardStats } from "../services/dashboardService";
import { getContracts } from "../services/contractService";

import {
  BiGroup,
  BiFile,
  BiCheckCircle,
  BiTime,
  BiXCircle,
} from "react-icons/bi";


function Dashboard() {

  // ============================================================
  // STATS
  // ============================================================

  const [stats, setStats] = useState({
    total_users: 0,
    total_contracts: 0,
    active_contracts: 0,
    expiring_contracts: 0,
    expired_contracts: 0,
  });


  // ============================================================
  // CONTRACTS
  // ============================================================

  const [contracts, setContracts] = useState([]);


  // ============================================================
  // LOADING
  // ============================================================

  const [loading, setLoading] =
    useState(true);


  // ============================================================
  // ERROR
  // ============================================================

  const [error, setError] =
    useState("");


  // ============================================================
  // LOAD DASHBOARD
  // ============================================================

  useEffect(() => {
    loadDashboard();
  }, []);


  const loadDashboard = async () => {

    try {

      setLoading(true);
      setError("");


      // --------------------------------------------------------
      // LOAD STATS
      // --------------------------------------------------------

      const statsResponse =
        await getDashboardStats();

      console.log(
        "Dashboard stats response:",
        statsResponse
      );


      const statsData =
        statsResponse?.data || {};


      setStats({
        total_users:
          statsData.total_users ?? 0,

        total_contracts:
          statsData.total_contracts ?? 0,

        active_contracts:
          statsData.active_contracts ?? 0,

        expiring_contracts:
          statsData.expiring_contracts ?? 0,

        expired_contracts:
          statsData.expired_contracts ?? 0,
      });


      // --------------------------------------------------------
      // LOAD CONTRACTS
      // --------------------------------------------------------

      const contractsResponse =
        await getContracts();

      console.log(
        "Dashboard contracts response:",
        contractsResponse
      );


      const contractsData =
        contractsResponse?.data || [];


      setContracts(
        Array.isArray(contractsData)
          ? contractsData
          : []
      );


    } catch (err) {

      console.error(
        "Failed to load dashboard:",
        err
      );


      if (
        err.response?.status === 401
      ) {

        setError(
          "Authentication session expired. Please reload the application."
        );

      } else if (
        err.response?.status === 403
      ) {

        setError(
          "You do not have permission to access dashboard data."
        );

      } else {

        setError(
          "Failed to load dashboard data."
        );
      }


    } finally {

      setLoading(false);

    }
  };


  return (
    <MainLayout>

      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="mb-6">

        <h1 className="text-3xl font-bold text-gray-900">
          Dashboard
        </h1>

        <p className="text-gray-500 mt-1">
          Overview of your contract management system.
        </p>

      </div>


      {/* ======================================================
          ERROR
      ====================================================== */}

      {error && (

        <div className="
          mb-6
          rounded-lg
          border
          border-red-200
          bg-red-50
          px-4
          py-3
          text-red-600
        ">

          <div className="
            flex
            items-center
            justify-between
            gap-4
          ">

            <span>
              {error}
            </span>


            <button
              type="button"
              onClick={loadDashboard}
              className="
                font-semibold
                underline
                hover:no-underline
              "
            >
              Retry
            </button>

          </div>

        </div>

      )}


      {/* ======================================================
          STAT CARDS
      ====================================================== */}

      <div className="
        grid
        grid-cols-1
        sm:grid-cols-2
        lg:grid-cols-5
        gap-6
      ">

        {/* TOTAL USERS */}

        <StatCard
          icon={<BiGroup />}
          title="Total Users"
          value={
            loading
              ? "..."
              : stats.total_users
          }
          subtitle="Registered Users"
          iconBg="#EAF2FF"
          iconColor="#2563EB"
          onClick={() => {
            window.location.href =
              "/users";
          }}
        />


        {/* TOTAL CONTRACTS */}

        <StatCard
          icon={<BiFile />}
          title="Total Contracts"
          value={
            loading
              ? "..."
              : stats.total_contracts
          }
          subtitle="All Time"
          iconBg="#EAF2FF"
          iconColor="#2563EB"
          onClick={() => {
            window.location.href =
              "/contracts";
          }}
        />


        {/* ACTIVE CONTRACTS */}

        <StatCard
          icon={<BiCheckCircle />}
          title="Active Contracts"
          value={
            loading
              ? "..."
              : stats.active_contracts
          }
          subtitle="Currently Active"
          iconBg="#E8F9EF"
          iconColor="#22C55E"
          onClick={() => {
            window.location.href =
              "/contracts?status=Active";
          }}
        />


        {/* EXPIRING */}

        <StatCard
          icon={<BiTime />}
          title="Expiring Soon"
          value={
            loading
              ? "..."
              : stats.expiring_contracts
          }
          subtitle="Next 30 Days"
          iconBg="#FFF6E5"
          iconColor="#F59E0B"
          onClick={() => {
            window.location.href =
              "/contracts?filter=expiring";
          }}
        />


        {/* EXPIRED */}

        <StatCard
          icon={<BiXCircle />}
          title="Expired Contracts"
          value={
            loading
              ? "..."
              : stats.expired_contracts
          }
          subtitle="Requires Attention"
          iconBg="#FDECEC"
          iconColor="#EF4444"
          onClick={() => {
            window.location.href =
              "/contracts?status=Expired";
          }}
        />

      </div>


      {/* ======================================================
          CHARTS
      ====================================================== */}

      <div className="
        grid
        grid-cols-1
        lg:grid-cols-2
        gap-6
        mt-8
      ">

        <StatusChart
          contracts={contracts}
          loading={loading}
        />

        <MonthlyChart
          contracts={contracts}
          loading={loading}
        />

      </div>


      {/* ======================================================
          RECENT CONTRACTS + UPCOMING ACTIVITIES
      ====================================================== */}

      <div className="
        grid
        grid-cols-1
        lg:grid-cols-3
        gap-6
        mt-8
      ">

        <div className="lg:col-span-2">

          <RecentContracts
            contracts={contracts}
            loading={loading}
          />

        </div>


        <UpcomingActivities
          contracts={contracts}
          loading={loading}
        />

      </div>

    </MainLayout>
  );
}


export default Dashboard;