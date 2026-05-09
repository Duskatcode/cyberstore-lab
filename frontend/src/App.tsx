import { Link, Route, Routes } from 'react-router';
import { CartPage } from './pages/account/CartPage';
import { OrdersPage } from './pages/account/OrdersPage';
import { AdminProductsPage } from './pages/admin/AdminProductsPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { HomePage } from './pages/public/HomePage';
import { ProductsPage } from './pages/public/ProductsPage';
import { SellerProductFormPage } from './pages/seller/SellerProductFormPage';
import { SellerProductsPage } from './pages/seller/SellerProductsPage';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { logout } from './services/auth.service';
import { useAuthStore } from './stores/auth.store';

function App() {
  const user = useAuthStore((state) => state.user);
  const refreshToken = useAuthStore((state) => state.refreshToken);
  const clearSession = useAuthStore((state) => state.clearSession);

  async function handleLogout() {
    if (refreshToken) {
      try {
        await logout(refreshToken);
      } catch {
        // local cleanup still runs
      }
    }

    clearSession();
  }

  return (
    <>
      <header className="border-b border-slate-200 px-8 py-4">
        <nav className="mx-auto flex max-w-6xl items-center gap-4">
          <Link to="/" className="font-semibold">
            CyberStore Lab
          </Link>

          <Link to="/products">Productos</Link>

          {user?.role === 'customer' ? <Link to="/cart">Carrito</Link> : null}
          {user?.role === 'customer' ? <Link to="/orders">Mis pedidos</Link> : null}

          {user?.role === 'seller' ? <Link to="/seller/products">Seller</Link> : null}

          {user?.role === 'admin' ? <Link to="/admin/users">Admin Users</Link> : null}
          {user?.role === 'admin' ? <Link to="/admin/products">Admin Products</Link> : null}

          {!user ? <Link to="/login">Login</Link> : null}
          {!user ? <Link to="/register">Registro</Link> : null}

          <div className="ml-auto flex items-center gap-3 text-sm">
            {user ? (
              <>
                <span>{user.email}</span>
                <span className="rounded bg-slate-100 px-2 py-1 text-xs">{user.role}</span>
                <button className="rounded border px-3 py-1" onClick={handleLogout}>
                  Salir
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
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route
          path="/cart"
          element={
            <ProtectedRoute allowedRoles={['customer']}>
              <CartPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/orders"
          element={
            <ProtectedRoute allowedRoles={['customer']}>
              <OrdersPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/seller/products"
          element={
            <ProtectedRoute allowedRoles={['seller']}>
              <SellerProductsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/seller/products/new"
          element={
            <ProtectedRoute allowedRoles={['seller']}>
              <SellerProductFormPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/seller/products/:id/edit"
          element={
            <ProtectedRoute allowedRoles={['seller']}>
              <SellerProductFormPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/users"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminUsersPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/products"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminProductsPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}

export default App;
