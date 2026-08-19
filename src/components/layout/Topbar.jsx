import {
  BiBell,
  BiChevronDown,
  BiMenu,
} from "react-icons/bi";

import argoLogo from "../../assets/argo-logo.png";

function Topbar({ onMenuClick }) {
  return (
    <header className="h-14 w-full bg-[#07162E] border-b border-slate-700 flex items-center justify-between px-4 sm:px-5">

      {/* Left */}
      <div className="flex items-center gap-3">

        {/* Hamburger - Mobile Only */}
        <button
          onClick={onMenuClick}
          className="lg:hidden text-2xl text-white hover:text-blue-300 transition"
          aria-label="Open menu"
        >
          <BiMenu />
        </button>

        <img
          src={argoLogo}
          alt="Argo HQ"
          className="w-9 h-9 rounded-lg object-cover"
        />

        <div className="leading-4">
          <h2 className="text-white text-lg font-semibold">
            Argo <span className="text-slate-300 font-medium">HQ</span>
          </h2>
        </div>

      </div>

      {/* Right */}
      <div className="flex items-center gap-3 sm:gap-5">

        {/* Notification */}
        <button
          className="relative text-xl text-white hover:text-blue-300 transition"
          aria-label="Notifications"
        >
          <BiBell />

          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
            3
          </span>
        </button>

        {/* User */}
        <div className="flex items-center gap-2 sm:gap-3 cursor-pointer">

          <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
            AC
          </div>

          {/* Hide user details on small mobile */}
          <div className="hidden sm:block leading-4">
            <h4 className="text-sm font-semibold text-white">
              Aries Calosor
            </h4>

            <p className="text-[11px] text-slate-300">
              Administrator
            </p>
          </div>

          <BiChevronDown className="text-lg text-white hidden sm:block" />

        </div>

      </div>

    </header>
  );
}

export default Topbar;