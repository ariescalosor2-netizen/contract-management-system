function StatCard({
  icon,
  title,
  value,
  subtitle,
  iconBg,
  iconColor,
  onClick,
}) {
  const isClickable =
    typeof onClick === "function";

  const handleKeyDown = (e) => {
    if (!isClickable) {
      return;
    }

    if (
      e.key === "Enter" ||
      e.key === " "
    ) {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <div
      onClick={isClickable ? onClick : undefined}
      role={
        isClickable
          ? "button"
          : undefined
      }
      tabIndex={
        isClickable
          ? 0
          : undefined
      }
      onKeyDown={handleKeyDown}
      className={`bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex items-start gap-4 transition ${
        isClickable
          ? "cursor-pointer hover:shadow-md hover:border-blue-200 hover:-translate-y-0.5"
          : ""
      }`}
    >

      {/* ICON */}

      <div
        className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl shrink-0"
        style={{
          backgroundColor: iconBg,
          color: iconColor,
        }}
      >
        {icon}
      </div>

      {/* CONTENT */}

      <div className="flex-1 min-w-0">

        <h4 className="text-sm text-gray-500">
          {title}
        </h4>

        <h2 className="text-3xl font-bold text-slate-800 mt-1">
          {value}
        </h2>

        <p className="text-xs text-gray-400 mt-2">
          {subtitle}
        </p>

      </div>

    </div>
  );
}

export default StatCard;