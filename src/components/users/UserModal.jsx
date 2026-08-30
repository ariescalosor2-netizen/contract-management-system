import { useEffect, useState } from "react";
import UserForm from "./UserForm";

function UserModal({
  open,
  onClose,
  onSave,
  user = null,
}) {
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    role: "Administrator",
  });

  useEffect(() => {
    if (user) {
      setForm({
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        password: "",
        role: user.role,
      });
    } else {
      setForm({
        first_name: "",
        last_name: "",
        email: "",
        password: "",
        role: "Administrator",
      });
    }
  }, [user]);

  if (!open) return null;

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = () => {

    if (!form.first_name.trim()) {
      return alert("First name is required.");
    }

    if (!form.last_name.trim()) {
      return alert("Last name is required.");
    }

    if (!form.email.trim()) {
      return alert("Email is required.");
    }

    if (!user && !form.password.trim()) {
      return alert("Password is required.");
    }

    onSave(form);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

      <div className="bg-white rounded-2xl w-[550px] p-7 shadow-xl">

        <div className="flex justify-between items-center mb-6">

          <h2 className="text-2xl font-bold text-slate-800">
            {user ? "Edit User" : "New User"}
          </h2>

          <button
            onClick={onClose}
            className="text-slate-500 hover:text-red-500 text-xl"
          >
            ✕
          </button>

        </div>

        <UserForm
          form={form}
          onChange={handleChange}
          isEdit={!!user}
        />

        <div className="flex justify-end gap-3 mt-8">

          <button
            onClick={onClose}
            className="
              px-5
              py-2.5
              rounded-xl
              border
              border-slate-300
              hover:bg-slate-100
            "
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            className="
              px-6
              py-2.5
              rounded-xl
              bg-blue-600
              hover:bg-blue-700
              text-white
              font-medium
            "
          >
            {user ? "Update User" : "Create User"}
          </button>

        </div>

      </div>

    </div>
  );
}

export default UserModal;