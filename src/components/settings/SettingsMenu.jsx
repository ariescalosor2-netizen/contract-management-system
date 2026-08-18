import {
  BiCog,
  BiUser,
  BiBell,
  BiShield,
  BiCloud,
  BiInfoCircle,
} from "react-icons/bi";

const menus = [
  {
    icon: <BiCog />,
    label: "General",
  },
  {
    icon: <BiUser />,
    label: "Users & Roles",
  },
  {
    icon: <BiBell />,
    label: "Notifications",
  },
  {
    icon: <BiShield />,
    label: "Security",
  },
  {
    icon: <BiCloud />,
    label: "Backup & Restore",
  },
  {
    icon: <BiInfoCircle />,
    label: "System Information",
  },
];

function SettingsMenu({
  activeTab,
  setActiveTab,
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">

      {menus.map((menu) => (
        <button
          key={menu.label}
          type="button"
          onClick={() =>
            setActiveTab(menu.label)
          }
          className={`w-full flex items-center gap-3 px-5 py-4 text-left transition ${
            activeTab === menu.label
              ? "bg-blue-50 text-blue-600 font-semibold border-l-4 border-blue-600"
              : "hover:bg-gray-50 text-gray-700"
          }`}
        >
          <span className="text-xl">
            {menu.icon}
          </span>

          <span>
            {menu.label}
          </span>
        </button>
      ))}

    </div>
  );
}

export default SettingsMenu;