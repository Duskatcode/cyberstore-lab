import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router';
import { register } from '../../services/auth.service';
import { useAuthStore } from '../../stores/auth.store';

export function RegisterPage() {
  const navigate = useNavigate();
  const setSession = useAuthStore((state) => state.setSession);

  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('CyberStore123!');
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setLoading(true);

    try {
      const response = await register({
        email,
        name,
        password,
      });

      setSession(response.user, response.accessToken, response.refreshToken);
      navigate('/products');
    } catch {
      setMessage('No se pudo registrar el usuario. Revisa email duplicado o datos inválidos.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen p-4 md:p-8">
      <section className="mx-auto max-w-md rounded-2xl border border-slate-200 p-4 md:p-6 shadow-sm">
        <h1 className="text-3xl font-bold">Registro customer</h1>

        <p className="mt-2 text-slate-600">
          Los usuarios registrados públicamente siempre inician como customer.
          Seller y admin solo pueden ser creados o promovidos por un admin.
        </p>

        {message && (
          <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="block">
            <span className="text-sm font-medium">Nombre</span>
            <input
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium">Email</span>
            <input
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium">Password</span>
            <input
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>

          <button
            className="w-full rounded-lg bg-slate-900 px-4 py-2 font-semibold text-white disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Registrando...' : 'Crear cuenta customer'}
          </button>
        </form>
      </section>
    </main>
  );
}
