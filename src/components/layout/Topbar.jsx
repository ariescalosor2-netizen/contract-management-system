import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  BiBell,
  BiChevronDown,
  BiMenu,
  BiUser,
  BiCog,
  BiLogOut,
} from "react-icons/bi";

import argoLogo from "../../assets/argo-logo.png";
import { useAuth } from "../../context/AuthContext";

function Topbar({ onMenuClick }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);

  const profileRef = useRef(null);
  const notificationRef = useRef(null);

  // ============================================================
  // USER DATA
  // ============================================================

  const firstName = user?.first_name || "";
  const lastName = user?.last_name || "";

  const fullName =
    `${firstName} ${lastName}`.trim() ||
    user?.name ||
    "User";

  const email =
    user?.email ||
    "No email available";

  const role =
    user?.role ||
    "User";

  const initials =
    `${firstName?.charAt(0) || ""}${lastName?.charAt(0) || ""}`
      .toUpperCase() ||
    fullName
      .split(" ")
      .map((name) => name.charAt(0))
      .slice(0, 2)
      .join("")
      .toUpperCase();

  // ============================================================
  // NOTIFICATIONS
  // ============================================================

  /*
    The notification count is intentionally NOT hardcoded.

    If your system later stores notifications in localStorage,
    you can use "argo_notifications".

    Example:
    [
      {
        id: 1,
        title: "New approval request",
        message: "Contract #CMS-001 requires approval.",
        read: false
      }
    ]
  */

  const [notifications, setNotifications] = useState(() => {
    try {
      const saved =
        localStorage.getItem("argo_notifications");

      return saved
        ? JSON.parse(saved)
        : [];
    } catch {
      return [];
    }
  });

  const unreadCount = notifications.filter(
    (notification) => !notification.read
  ).length;

  // ============================================================
  // CLOSE DROPDOWNS WHEN CLICKING OUTSIDE
  // ============================================================

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target)
      ) {
        setProfileOpen(false);
      }

      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setNotificationOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  // ============================================================
  // HANDLERS
  // ============================================================

  const handleProfileClick = () => {
    setNotificationOpen(false);
    setProfileOpen((prev) => !prev);
  };

  const handleNotificationClick = () => {
    setProfileOpen(false);
    setNotificationOpen((prev) => !prev);
  };

  const handleSettings = () => {
    setProfileOpen(false);
    navigate("/settings");
  };

  const handleLogout = () => {
    setProfileOpen(false);
    logout();
    navigate("/login");
  };

  return (
    <header className="h-14 w-full bg-[#07162E] border-b border-slate-700 flex items-center justify-between px-4 sm:px-5 relative z-40">

      {/* ======================================================
          LEFT
      ====================================================== */}

      <div className="flex items-center gap-3 min-w-0">

        {/* Hamburger - Mobile Only */}
        <button
          type="button"
          onClick={onMenuClick}
          className="lg:hidden text-2xl text-white hover:text-blue-300 transition flex-shrink-0"
          aria-label="Open menu"
        >
          <BiMenu />
        </button>

        {/* ARGO LOGO */}
        <img
          src={argoLogo}
          alt="Argo HQ"
          className="w-9 h-9 rounded-lg object-cover flex-shrink-0"
        />

        <div className="leading-4">
          <h2 className="text-white text-lg font-semibold whitespace-nowrap">
            Argo{" "}
            <span className="text-slate-300 font-medium">
              HQ
            </span>
          </h2>
        </div>

      </div>

      {/* ======================================================
          RIGHT
      ====================================================== */}

      <div className="flex items-center gap-3 sm:gap-5">

        {/* ====================================================
            NOTIFICATIONS
        ==================================================== */}

        <div
          ref={notificationRef}
          className="relative"
        >

          <button
            type="button"
            onClick={handleNotificationClick}
            className="relative text-xl text-white hover:text-blue-300 transition p-1"
            aria-label="Notifications"
          >
            <BiBell />

            {/* Only show badge when there are unread notifications */}
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 flex items-center justify-center rounded-full bg-red-500 text-[10px] font-semibold text-white">
                {unreadCount > 99
                  ? "99+"
                  : unreadCount}
              </span>
            )}
          </button>

          {/* Notification Dropdown */}
          {notificationOpen && (
            <div className="absolute right-0 top-11 w-80 max-w-[calc(100vw-2rem)] bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden">

              <div className="px-4 py-3 border-b border-slate-200">

                <div className="flex items-center justify-between">

                  <h3 className="font-semibold text-slate-800">
                    Notifications
                  </h3>

                  {unreadCount > 0 && (
                    <span className="text-xs text-blue-600 font-medium">
                      {unreadCount} unread
                    </span>
                  )}

                </div>

              </div>

              {notifications.length === 0 ? (

                <div className="px-5 py-8 text-center">

                  <BiBell className="mx-auto text-3xl text-slate-300 mb-2" />

                  <p className="text-sm text-slate-500">
                    No new notifications.
                  </p>

                </div>

              ) : (

                <div className="max-h-80 overflow-y-auto">

                  {notifications.map(
                    (notification) => (
                      <div
                        key={notification.id}
                        className={`px-4 py-3 border-b border-slate-100 hover:bg-slate-50 ${
                          !notification.read
                            ? "bg-blue-50/50"
                            : ""
                        }`}
                      >

                        <p className="text-sm font-semibold text-slate-800">
                          {notification.title}
                        </p>

                        <p className="text-xs text-slate-500 mt-1">
                          {notification.message}
                        </p>

                      </div>
                    )
                  )}

                </div>

              )}

            </div>
          )}

        </div>

        {/* ====================================================
            USER PROFILE
        ==================================================== */}

        <div
          ref={profileRef}
          className="relative"
        >

          <button
            type="button"
            onClick={handleProfileClick}
            className="flex items-center gap-2 sm:gap-3 cursor-pointer hover:bg-slate-800 rounded-lg px-1.5 py-1 transition"
            aria-label="Open profile menu"
          >

            {/* Avatar */}
            <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold flex-shrink-0">
              {initials}
            </div>

            {/* User Details */}
            <div className="hidden sm:block leading-4 text-left max-w-40">

              <h4 className="text-sm font-semibold text-white truncate">
                {fullName}
              </h4>

              <p className="text-[11px] text-slate-300 truncate">
                {role}
              </p>

            </div>

            <BiChevronDown
              className={`text-lg text-white hidden sm:block transition-transform ${
                profileOpen
                  ? "rotate-180"
                  : ""
              }`}
            />

          </button>

          {/* ==================================================
              PROFILE DROPDOWN
          ================================================== */}

          {profileOpen && (
            <div className="absolute right-0 top-12 w-64 max-w-[calc(100vw-2rem)] bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden">

              {/* Account Information */}
              <div className="px-4 py-4 border-b border-slate-200">

                <div className="flex items-center gap-3">

                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                    {initials}
                  </div>

                  <div className="min-w-0">

                    <p className="font-semibold text-slate-800 truncate">
                      {fullName}
                    </p>

                    <p className="text-xs text-slate-500 truncate">
                      {email}
                    </p>

                    <p className="text-xs text-blue-600 mt-0.5">
                      {role}
                    </p>

                  </div>

                </div>

              </div>

              {/* Account */}
              <div className="py-1">

                <button
                  type="button"
                  onClick={() => {
                    setProfileOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition"
                >

                  <BiUser className="text-lg" />

                  <span>
                    My Account
                  </span>

                </button>

                {/* Settings */}
                <button
                  type="button"
                  onClick={handleSettings}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition"
                >

                  <BiCog className="text-lg" />

                  <span>
                    Settings
                  </span>

                </button>

              </div>

              {/* Logout */}
              <div className="border-t border-slate-200 py-1">

                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition"
                >

                  <BiLogOut className="text-lg" />

                  <span>
                    Logout
                  </span>

                </button>

              </div>

            </div>
          )}

        </div>

      </div>

    </header>
  );
}

export default Topbar;