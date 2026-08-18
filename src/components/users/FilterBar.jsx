function FilterBar({
  role,
  status,
  onRoleChange,
  onStatusChange,
}) {
  return (
    <>
      <select
        value={role}
        onChange={(e) => onRoleChange(e.target.value)}
        className="
          border
          border-slate-300
          rounded-xl
          px-4
          py-2.5
        "
      >
        <option value="">All Roles</option>
        <option value="Administrator">Administrator</option>
        <option value="Manager">Manager</option>
        <option value="Staff">Staff</option>
      </select>

      <select
        value={status}
        onChange={(e) => onStatusChange(e.target.value)}
        className="
          border
          border-slate-300
          rounded-xl
          px-4
          py-2.5
        "
      >
        <option value="">All Status</option>
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
      </select>
    </>
  );
}

export default FilterBar;