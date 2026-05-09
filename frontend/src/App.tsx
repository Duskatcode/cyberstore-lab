import { Link, Route, Routes } from 'react-router';
import { CartPage } from './pages/account/CartPage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { HomePage } from './pages/public/HomePage';
import { ProductsPage } from './pages/public/ProductsPage';
import { SellerProductFormPage } from './pages/seller/SellerProductFormPage';
import { SellerProductsPage } from './pages/seller/SellerProductsPage';
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

          {user?.role === 'seller' ? <Link to="/seller/products">Seller</Link> : null}

          <Link to="/login">Login</Link>

          <div className="ml-auto flex items-center gap-3 text-sm">
            {user ? (
              <>
                <span>{user.email}</span>
                <span className="rounded bg-slate-100 px-2 py-1 text-xs">{user.role}</span>
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

        <Route path="/seller/products" element={<SellerProductsPage />} />
        <Route path="/seller/products/new" element={<SellerProductFormPage />} />
        <Route path="/seller/products/:id/edit" element={<SellerProductFormPage />} />
      </Routes>
    </>
  );
}

export default App;
