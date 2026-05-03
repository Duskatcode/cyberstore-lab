import { Link, Route, Routes } from 'react-router';
import { CartPage } from './pages/account/CartPage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { HomePage } from './pages/public/HomePage';
import { ProductsPage } from './pages/public/ProductsPage';
import { useAuthStore } from './stores/auth.store';

function App() {
  const user = useAuthStore((state) => state.user);
  const clearSession = useAuthStore((state) => state.clearSession);

  return (
    <>
      <header className="border-b border-slate-200 px-8 py-4">
        <nav className="mx-auto flex max-w-5xl items-center gap-4">
          <Link to="/" className="font-semibold">
            CyberStore Lab
          </Link>

          <Link to="/products">Productos</Link>
          <Link to="/cart">Carrito</Link>
          <Link to="/login">Login</Link>

          <div className="ml-auto flex items-center gap-3 text-sm">
            {user ? (
              <>
                <span>{user.email}</span>
                <button className="rounded border px-3 py-1" onClick={clearSession}>
                  Salir local
                </button>
              </>
            ) : (
              <span className="text-slate-500">Sin sesión</span>
            )}
          </div>
        </nav>
      </header>

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Routes>
    </>
  );
}

export default App;
