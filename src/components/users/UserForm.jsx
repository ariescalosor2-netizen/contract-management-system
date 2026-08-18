function UserForm({
  form,
  onChange,
  isEdit = false,
}) {
  return (
    <div className="space-y-4">

      <div className="grid grid-cols-2 gap-4">

        <input
          name="first_name"
          placeholder="First Name"
          value={form.first_name}
          onChange={onChange}
          className="w-full border rounded-xl px-4 py-3"
        />

        <input
          name="last_name"
          placeholder="Last Name"
          value={form.last_name}
          onChange={onChange}
          className="w-full border rounded-xl px-4 py-3"
        />

      </div>

      <input
        type="email"
        name="email"
        placeholder="Email Address"
        value={form.email}
        onChange={onChange}
        className="w-full border rounded-xl px-4 py-3"
      />

      {!isEdit && (
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={onChange}
          className="w-full border rounded-xl px-4 py-3"
        />
      )}

<select
  name="role"
  value={form.role}
  onChange={onChange}
  className="w-full border rounded-xl px-4 py-3"
>
  <option value="Administrator">Administrator</option>
  <option value="Contract Manager">Contract Manager</option>
  <option value="Finance Officer">Finance Officer</option>
  <option value="Legal Officer">Legal Officer</option>
  <option value="Viewer">Viewer</option>
</select>

    </div>
  );
}

export default UserForm;