function SearchBar({
  value,
  onChange,
}) {
  return (
    <input
      type="text"
      placeholder="Search users..."
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="
        flex-1
        border
        border-slate-300
        rounded-xl
        px-4
        py-2.5
        outline-none
        focus:ring-2
        focus:ring-blue-500
      "
    />
  );
}

export default SearchBar;