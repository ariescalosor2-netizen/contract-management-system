import { useEffect, useMemo, useState } from "react";
import { BiBuilding, BiEdit, BiPlus, BiUser, BiCheckCircle, BiX } from "react-icons/bi";
import MainLayout from "../layouts/MainLayout";
import { createOrganization, getOrganizations, updateOrganization } from "../services/superAdminService";

const empty = {
  name: "",
  code: "",
  status: "Active",
  admin_first_name: "",
  admin_last_name: "",
  admin_email: "",
  admin_password: "",
};

function StatCard({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-2xl text-blue-600"><Icon /></div>
      </div>
    </div>
  );
}

export default function SuperAdminOrganizations() {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await getOrganizations();
      setRows(response?.data || []);
    } catch (e) {
      setError(e.response?.data?.detail || "Failed to load organizations.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const stats = useMemo(() => ({
    total: rows.length,
    active: rows.filter((r) => String(r.status).toLowerCase() === "active").length,
    users: rows.reduce((sum, r) => sum + Number(r.user_count || 0), 0),
  }), [rows]);

  const openCreate = () => {
    setEditing(null);
    setForm(empty);
    setError("");
    setSuccess("");
    setOpen(true);
  };

  const openEdit = (row) => {
    setEditing(row);
    setForm({ name: row.name || "", code: row.code || "", status: row.status || "Active", ...empty, name: row.name || "", code: row.code || "", status: row.status || "Active" });
    setError("");
    setSuccess("");
    setOpen(true);
  };

  const close = () => {
    if (saving) return;
    setOpen(false);
    setEditing(null);
    setForm(empty);
  };

const submit = async (event) => {
  event.preventDefault();
  setSaving(true);
  setError("");
  setSuccess("");

  try {
    if (editing) {
      await updateOrganization(editing.id, {
        name: form.name,
        code: form.code,
        status: form.status,
      });

      setOpen(false);
      setEditing(null);
      setForm(empty);
      await load();

      setSuccess("Organization updated successfully.");
    } else {
      const response = await createOrganization({
        name: form.name,
        code: form.code,
        status: form.status,
        admin_first_name: form.admin_first_name,
        admin_last_name: form.admin_last_name,
        admin_email: form.admin_email,
        admin_password: form.admin_password,
      });

      const admin = response?.data?.initial_admin;

      setOpen(false);
      setEditing(null);
      setForm(empty);
      await load();

      if (admin) {
        setSuccess(
          `Organization created successfully. Administrator account: ${admin.email}`
        );
      } else {
        setSuccess(
          "Organization created, but no Initial Administrator was created."
        );
      }
    }
  } catch (e) {
    setError(
      e.response?.data?.detail ||
      e.response?.data?.message ||
      "Unable to save organization."
    );
  } finally {
    setSaving(false);
  }
};

  return (
    <MainLayout>
      <div className="mb-7 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
            <BiBuilding /> Platform administration
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Organizations</h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-500">Create and manage isolated organization workspaces and their initial Administrator accounts.</p>
        </div>
        <button onClick={openCreate} className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700">
          <BiPlus className="text-lg" /> New Organization
        </button>
      </div>

      {error && <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</div>}
      {success && <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">{success}</div>}

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard icon={BiBuilding} label="Organizations" value={stats.total} />
        <StatCard icon={BiCheckCircle} label="Active" value={stats.active} />
        <StatCard icon={BiUser} label="Organization Users" value={stats.users} />
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-6 py-5">
          <h2 className="font-semibold text-slate-900">Registered Organizations</h2>
          <p className="mt-1 text-sm text-slate-500">Each organization has its own users and operational contract data.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-400">
              <tr><th className="px-6 py-4">Organization</th><th className="px-6 py-4">Code</th><th className="px-6 py-4">Users</th><th className="px-6 py-4">Status</th><th className="px-6 py-4 text-right">Action</th></tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-t border-slate-100 transition hover:bg-slate-50/70">
                  <td className="px-6 py-4"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600"><BiBuilding /></div><div><p className="font-semibold text-slate-900">{row.name}</p><p className="text-xs text-slate-400">Created {row.created_at ? new Date(row.created_at).toLocaleDateString() : "—"}</p></div></div></td>
                  <td className="px-6 py-4"><span className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">{row.code}</span></td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-700">{row.user_count ?? 0}</td>
                  <td className="px-6 py-4"><span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${String(row.status).toLowerCase() === "active" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}><span className="h-1.5 w-1.5 rounded-full bg-current" />{row.status}</span></td>
                  <td className="px-6 py-4 text-right"><button onClick={() => openEdit(row)} className="rounded-lg border border-slate-200 p-2 text-slate-500 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600" title="Edit organization"><BiEdit size={18} /></button></td>
                </tr>
              ))}
              {!loading && !rows.length && <tr><td colSpan="5" className="px-6 py-14 text-center"><BiBuilding className="mx-auto mb-2 text-3xl text-slate-300" /><p className="font-medium text-slate-600">No organizations yet</p><p className="mt-1 text-sm text-slate-400">Create the first organization to begin onboarding an Administrator.</p></td></tr>}
              {loading && <tr><td colSpan="5" className="px-6 py-14 text-center text-sm text-slate-400">Loading organizations…</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
              <div><h2 className="text-xl font-bold text-slate-900">{editing ? "Edit Organization" : "Create Organization"}</h2><p className="mt-1 text-sm text-slate-500">{editing ? "Update organization information." : "Set up the workspace and its initial Administrator."}</p></div>
              <button onClick={close} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"><BiX size={22} /></button>
            </div>
            <form onSubmit={submit} className="space-y-6 p-6">
              <section>
                <div className="mb-3 flex items-center gap-2"><BiBuilding className="text-blue-600" /><h3 className="font-semibold text-slate-900">Organization information</h3></div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <label className="text-sm font-medium text-slate-700">Organization name<input required className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="ABC Corporation" /></label>
                  <label className="text-sm font-medium text-slate-700">Organization code<input required className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-3 uppercase outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="ABC-001" /></label>
                  <label className="text-sm font-medium text-slate-700">Status<select className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}><option>Active</option><option>Inactive</option></select></label>
                </div>
              </section>

              {!editing && <section className="rounded-2xl border border-blue-100 bg-blue-50/60 p-5">
                <div className="mb-4 flex items-center gap-2"><BiUser className="text-blue-600" /><div><h3 className="font-semibold text-slate-900">Initial Administrator</h3><p className="text-xs text-slate-500">This account will be linked automatically to the new organization.</p></div></div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <input required className="rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" placeholder="First name" value={form.admin_first_name} onChange={(e) => setForm({ ...form, admin_first_name: e.target.value })} />
                  <input required className="rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" placeholder="Last name" value={form.admin_last_name} onChange={(e) => setForm({ ...form, admin_last_name: e.target.value })} />
                  <input required type="email" className="rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 sm:col-span-2" placeholder="admin@company.com" value={form.admin_email} onChange={(e) => setForm({ ...form, admin_email: e.target.value })} />
                  <input required minLength={8} type="password" className="rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 sm:col-span-2" placeholder="Temporary password (8+ characters)" value={form.admin_password} onChange={(e) => setForm({ ...form, admin_password: e.target.value })} />
                </div>
              </section>}

              <div className="flex justify-end gap-3 border-t border-slate-100 pt-5"><button type="button" onClick={close} className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50">Cancel</button><button disabled={saving} className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50">{saving ? "Saving…" : editing ? "Save Changes" : "Create Organization"}</button></div>
            </form>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
