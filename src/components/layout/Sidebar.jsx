import { NavLink, useNavigate } from 'react-router-dom';

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
} from 'react-icons/bi';

import { useAuth } from '../../context/AuthContext';

function Sidebar() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menus = [
    { icon: <BiGridAlt />, name: 'Dashboard', path: '/' },

    // NEW
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

  return (
    <aside className="fixed left-0 top-0 w-60 h-screen bg-[#07162E] text-white flex flex-col">

      {/* Logo */}
      <div className="h-14 flex items-center gap-3 px-5 border-b border-slate-700">

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

      {/* Menu */}
      <div className="flex-1 overflow-y-auto px-3 py-4">

        {menus.map((menu, index) => (
          <NavLink
            key={index}
            to={menu.path}
            end={menu.path === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 transition-all duration-200 ${
                isActive
                  ? 'text-white bg-slate-800'
                  : 'text-slate-300 hover:bg-slate-700 hover:text-white'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div
                  className={`w-1 h-5 rounded-full ${
                    isActive ? 'bg-blue-500' : 'bg-transparent'
                  }`}
                />

                <span className="text-lg">
                  {menu.icon}
                </span>

                <span className="text-sm font-medium">
                  {menu.name}
                </span>
              </>
            )}
          </NavLink>
        ))}

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
  );
}

export default Sidebar;