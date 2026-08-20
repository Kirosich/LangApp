import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const ok = await login(username, password);
      if (ok) {
        navigate('/', { replace: true });
      } else {
        setError('Неверный логин или пароль');
      }
    } catch {
      setError('Не удалось связаться с сервером');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-svh flex items-center justify-center px-4 bg-neutral-950">
      <form onSubmit={handleSubmit} className="w-full max-w-sm bg-neutral-900 rounded-2xl p-6 shadow-xl border border-neutral-800">
        <h1 className="text-xl font-semibold text-neutral-100 mb-6 text-center">Langapp</h1>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-neutral-400 mb-1">Логин</label>
            <input
              autoFocus
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-lg bg-neutral-800 border border-neutral-700 px-3 py-2 text-neutral-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              autoComplete="username"
            />
          </div>
          <div>
            <label className="block text-sm text-neutral-400 mb-1">Пароль</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg bg-neutral-800 border border-neutral-700 px-3 py-2 text-neutral-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              autoComplete="current-password"
            />
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium py-2 transition-colors"
          >
            {loading ? 'Проверка…' : 'Войти'}
          </button>
        </div>
      </form>
    </div>
  );
}
