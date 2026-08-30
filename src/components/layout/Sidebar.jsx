import { NavLink, useLocation, useNavigate } from 'react-router-dom';

import {
  BiGridAlt,
  BiUser,
  BiFile,
  BiCategory,
  BiGroup,
  BiCheckShield,
  BiCreditCard,
  BiCalendar,
  BiEdit,
  BiRefresh,
  BiBarChart,
  BiCog,
  BiLogOut,
  BiX,
} from 'react-icons/bi';

import { useAuth } from '../../context/AuthContext';

function Sidebar({ isOpen, onClose }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
    onClose();
  };

  const role = String(user?.role || '').trim().toLowerCase();

  const administratorMenus = [
    { icon: <BiGridAlt />, name: 'Dashboard', path: '/' },
    { icon: <BiUser />, name: 'Users', path: '/users' },
    { icon: <BiFile />, name: 'Contracts', path: '/contracts' },
    { icon: <BiCategory />, name: 'Contract Types', path: '/contract-types' },
    { icon: <BiGroup />, name: 'Parties', path: '/parties' },
    { icon: <BiCheckShield />, name: 'Approvals', path: '/approvals' },
    { icon: <BiCreditCard />, name: 'Payments', path: '/payments' },
    { icon: <BiCalendar />, name: 'Milestones', path: '/milestones' },
    { icon: <BiEdit />, name: 'Amendments', path: '/amendments' },
    { icon: <BiRefresh />, name: 'Renewals', path: '/renewals' },
    { icon: <BiBarChart />, name: 'Reports', path: '/reports' },
    { icon: <BiCog />, name: 'Settings', path: '/settings' },
  ];

  const superAdminMenus = [
    { icon: <BiGridAlt />, name: 'Dashboard', path: '/super-admin' },
    {
      icon: <BiGroup />,
      name: 'Organizations',
      path: '/super-admin/organizations',
    },
    {
      icon: <BiUser />,
      name: 'Users',
      path: '/super-admin/users',
    },
    {
      icon: <BiCheckShield />,
      name: 'Roles & Permissions',
      path: '/super-admin/roles',
    },
    {
      icon: <BiCalendar />,
      name: 'System Activity',
      path: '/super-admin/activity',
    },
    {
      icon: <BiBarChart />,
      name: 'System Reports',
      path: '/super-admin/reports',
    },
  ];

  const viewerMenus = [
    { icon: <BiGridAlt />, name: 'Dashboard', path: '/viewer' },
    { icon: <BiFile />, name: 'Contracts', path: '/viewer/contracts' },
    { icon: <BiGroup />, name: 'Parties', path: '/viewer/parties' },
    { icon: <BiBarChart />, name: 'Reports', path: '/viewer/reports' },
  ];

  const menus =
    role === 'super admin'
      ? superAdminMenus
      : role === 'viewer'
      ? viewerMenus
      : administratorMenus;

  /*
   * ============================================================
   * ACTIVE MENU CHECK
   * ============================================================
   *
   * Dashboard routes must match EXACTLY.
   *
   * Example:
   *
   * /super-admin
   *       -> Dashboard ACTIVE
   *
   * /super-admin/roles
   *       -> Dashboard NOT ACTIVE
   *       -> Roles & Permissions ACTIVE
   *
   * /super-admin/reports
   *       -> Dashboard NOT ACTIVE
   *       -> System Reports ACTIVE
   */

  const isMenuActive = (path) => {
    const currentPath = location.pathname;

    // Dashboard must be an exact match.
    if (
      path === '/' ||
      path === '/super-admin' ||
      path === '/viewer'
    ) {
      return currentPath === path;
    }

    // All other menu items are also matched exactly.
    return currentPath === path;
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed left-0 top-0 w-60 h-screen
          bg-[#07162E] text-white
          flex flex-col
          z-50
          transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
        `}
      >

        {/* Logo */}
        <div className="h-14 flex items-center justify-between px-5 border-b border-slate-700">

          <div className="flex items-center gap-3">

            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center">
              <BiFile className="text-white text-lg" />
            </div>

            <div>
              <h2 className="font-semibold text-base leading-4">
                Contract
              </h2>

              <p className="text-xs text-slate-300">
                Management System
              </p>
            </div>

          </div>

          {/* Close Button - Mobile Only */}
          <button
            onClick={onClose}
            className="lg:hidden text-2xl text-slate-300 hover:text-white"
            aria-label="Close menu"
          >
            <BiX />
          </button>

        </div>

        {/* Menu */}
        <div className="flex-1 overflow-y-auto px-3 py-4">

          {menus.map((menu, index) => {
            const isActive = isMenuActive(menu.path);

            return (
              <NavLink
                key={index}
                to={menu.path}
                onClick={onClose}
                className={`
                  flex items-center gap-3
                  px-3 py-2.5
                  rounded-lg
                  mb-1
                  transition-all duration-200
                  ${
                    isActive
                      ? 'text-white bg-slate-800'
                      : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                  }
                `}
              >

                {/* Active Indicator */}
                <div
                  className={`
                    w-1 h-5 rounded-full
                    ${
                      isActive
                        ? 'bg-blue-500'
                        : 'bg-transparent'
                    }
                  `}
                />

                {/* Icon */}
                <span className="text-lg">
                  {menu.icon}
                </span>

                {/* Menu Name */}
                <span className="text-sm font-medium">
                  {menu.name}
                </span>

              </NavLink>
            );
          })}

        </div>

        {/* Logout */}
        <div className="border-t border-slate-700 p-4">

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 transition-all duration-200 py-2.5 rounded-lg text-sm font-medium"
          >
            <BiLogOut className="text-lg" />
            Logout
          </button>

        </div>

      </aside>
    </>
  );
}

export default Sidebar;