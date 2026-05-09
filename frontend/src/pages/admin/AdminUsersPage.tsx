import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import {
  createAdminUser,
  getAdminUsers,
  updateAdminUserRole,
  updateAdminUserStatus,
  type AdminUser,
} from '../../services/admin-users.service';
import { useAuthStore } from '../../stores/auth.store';
import type { UserRole, UserStatus } from '../../types/auth.types';

type FormState = {
  email: string;
  name: string;
  password: string;
  role: UserRole;
  status: UserStatus;
};

const initialForm: FormState = {
  email: '',
  name: '',
  password: 'CyberStore123!',
  role: 'customer',
  status: 'active',
};

export function AdminUsersPage() {
  const user = useAuthStore((state) => state.user);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [form, setForm] = useState<FormState>(initialForm);
  const [message, setMessage] = useState<string | null>(null);
  const [showOnlyActive, setShowOnlyActive] = useState(false);

  async function loadUsers() {
    try {
      const data = await getAdminUsers();
      setUsers(data);
    } catch {
      setMessage('No se pudieron cargar usuarios. Verifica que estés logueado como admin.');
    }
  }

  useEffect(() => {
    void loadUsers();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);

    try {
      await createAdminUser(form);
      setForm(initialForm);
      setMessage('Usuario creado correctamente.');
      await loadUsers();
    } catch {
      setMessage('No se pudo crear el usuario. Revisa email duplicado o permisos.');
    }
  }

  async function handleRoleChange(userId: string, role: UserRole) {
    try {
      await updateAdminUserRole(userId, role);
      setMessage('Rol actualizado.');
      await loadUsers();
    } catch {
      setMessage('No se pudo actualizar el rol.');
    }
  }

  async function handleStatusChange(userId: string, status: UserStatus) {
    try {
      await updateAdminUserStatus(userId, status);
      setMessage('Estado actualizado.');
      await loadUsers();
    } catch {
      setMessage('No se pudo actualizar el estado.');
    }
  }

  if (!user) {
    return (
      <main className="min-h-screen p-8">
        <section className="mx-auto max-w-6xl">
          <h1 className="text-3xl font-bold">Admin Users</h1>
          <p className="mt-4 text-slate-600">Debes iniciar sesión como admin.</p>
        </section>
      </main>
    );
  }

  if (user.role !== 'admin') {
    return (
      <main className="min-h-screen p-8">
        <section className="mx-auto max-w-6xl">
          <h1 className="text-3xl font-bold">Acceso denegado</h1>
          <p className="mt-4 text-slate-600">Esta sección requiere rol admin.</p>
        </section>
      </main>
    );
  }

  const visibleUsers = showOnlyActive
    ? users.filter((item) => item.status === 'active')
    : users;

  return (
    <main className="min-h-screen p-8">
      <section className="mx-auto max-w-6xl">
        <h1 className="text-3xl font-bold">Administración de usuarios</h1>
        <p className="mt-2 text-slate-600">
          Crea usuarios como customer, seller o admin. También puedes cambiar roles y estados.
        </p>

        {message && (
          <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm">
            {message}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="mt-8 grid gap-4 rounded-2xl border border-slate-200 p-6 md:grid-cols-2"
        >
          <label className="block">
            <span className="text-sm font-medium">Email</span>
            <input
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              value={form.email}
              onChange={(event) =>
                setForm((current) => ({ ...current, email: event.target.value }))
              }
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium">Nombre</span>
            <input
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              value={form.name}
              onChange={(event) =>
                setForm((current) => ({ ...current, name: event.target.value }))
              }
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium">Password inicial</span>
            <input
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              type="text"
              value={form.password}
              onChange={(event) =>
                setForm((current) => ({ ...current, password: event.target.value }))
              }
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium">Rol</span>
            <select
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              value={form.role}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  role: event.target.value as UserRole,
                }))
              }
            >
              <option value="customer">customer</option>
              <option value="seller">seller</option>
              <option value="admin">admin</option>
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-medium">Estado</span>
            <select
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              value={form.status}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  status: event.target.value as UserStatus,
                }))
              }
            >
              <option value="active">active</option>
              <option value="blocked">blocked</option>
              <option value="suspended">suspended</option>
              <option value="pending_verification">pending_verification</option>
            </select>
          </label>

          <div className="flex items-end">
            <button className="w-full rounded-lg bg-slate-900 px-4 py-2 font-semibold text-white">
              Crear usuario
            </button>
          </div>
        </form>

        <div className="mt-8 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Usuarios</h2>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={showOnlyActive}
              onChange={(event) => setShowOnlyActive(event.target.checked)}
            />
            Solo activos
          </label>
        </div>

        <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="p-4">Usuario</th>
                <th className="p-4">Rol</th>
                <th className="p-4">Estado</th>
                <th className="p-4">Creado</th>
              </tr>
            </thead>

            <tbody>
              {visibleUsers.map((item) => (
                <tr key={item.id} className="border-t border-slate-200">
                  <td className="p-4">
                    <div className="font-semibold">{item.name}</div>
                    <div className="text-xs text-slate-500">{item.email}</div>
                  </td>

                  <td className="p-4">
                    <select
                      className="rounded border border-slate-300 px-2 py-1"
                      value={item.role.name}
                      onChange={(event) =>
                        void handleRoleChange(item.id, event.target.value as UserRole)
                      }
                    >
                      <option value="customer">customer</option>
                      <option value="seller">seller</option>
                      <option value="admin">admin</option>
                    </select>
                  </td>

                  <td className="p-4">
                    <select
                      className="rounded border border-slate-300 px-2 py-1"
                      value={item.status}
                      onChange={(event) =>
                        void handleStatusChange(item.id, event.target.value as UserStatus)
                      }
                    >
                      <option value="active">active</option>
                      <option value="blocked">blocked</option>
                      <option value="suspended">suspended</option>
                      <option value="pending_verification">pending_verification</option>
                    </select>
                  </td>

                  <td className="p-4 text-slate-500">
                    {new Date(item.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
