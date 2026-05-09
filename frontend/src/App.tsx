import { useState } from 'react';
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
  const [menuOpen, setMenuOpen] = useState(false);

  const user = useAuthStore((state) => state.user);
  const refreshToken = useAuthStore((state) => state.refreshToken);
  const clearSession = useAuthStore((state) => state.clearSession);

  function closeMenu() {
    setMenuOpen(false);
  }

  async function handleLogout() {
    if (refreshToken) {
      try {
        await logout(refreshToken);
      } catch {
        // Si backend falla, igual se limpia sesión local.
      }
    }

    clearSession();
    closeMenu();
  }

  return (
    <>
      <header className="border-b border-slate-200 bg-white px-4 py-4 md:px-8">
        <nav className="mx-auto max-w-6xl">
          <div className="flex items-center justify-between gap-4">
            <Link
              to="/"
              className="flex items-center gap-2 font-semibold"
              onClick={closeMenu}
            >
              <img
                src="/favicon.svg"
                alt="CyberStore Lab logo"
                className="h-8 w-8 rounded-lg"
              />
              <span>CyberStore Lab</span>
            </Link>

            <button
              className="rounded border border-slate-300 px-3 py-2 text-sm md:hidden"
              onClick={() => setMenuOpen((current) => !current)}
              aria-expanded={menuOpen}
              aria-label="Abrir menú"
            >
              ☰
            </button>

            <div className="hidden items-center gap-4 md:flex">
              <Link to="/products">Productos</Link>

              {user?.role === 'customer' ? <Link to="/cart">Carrito</Link> : null}
              {user?.role === 'customer' ? <Link to="/orders">Mis pedidos</Link> : null}

              {user?.role === 'seller' ? (
                <Link to="/seller/products">Seller</Link>
              ) : null}

              {user?.role === 'admin' ? (
                <Link to="/admin/users">Admin Users</Link>
              ) : null}

              {user?.role === 'admin' ? (
                <Link to="/admin/products">Admin Products</Link>
              ) : null}

              {!user ? <Link to="/login">Login</Link> : null}
              {!user ? <Link to="/register">Registro</Link> : null}
            </div>

            <div className="hidden items-center gap-3 text-sm md:flex">
              {user ? (
                <>
                  <span className="max-w-52 truncate">{user.email}</span>

                  <span className="rounded bg-slate-100 px-2 py-1 text-xs">
                    {user.role}
                  </span>

                  <button className="rounded border px-3 py-1" onClick={handleLogout}>
                    Salir
                  </button>
                </>
              ) : (
                <span className="text-slate-500">Sin sesión</span>
              )}
            </div>
          </div>

          {menuOpen ? (
            <div className="mt-4 grid gap-3 border-t border-slate-200 pt-4 md:hidden">
              <Link to="/products" onClick={closeMenu}>
                Productos
              </Link>

              {user?.role === 'customer' ? (
                <Link to="/cart" onClick={closeMenu}>
                  Carrito
                </Link>
              ) : null}

              {user?.role === 'customer' ? (
                <Link to="/orders" onClick={closeMenu}>
                  Mis pedidos
                </Link>
              ) : null}

              {user?.role === 'seller' ? (
                <Link to="/seller/products" onClick={closeMenu}>
                  Seller
                </Link>
              ) : null}

              {user?.role === 'admin' ? (
                <Link to="/admin/users" onClick={closeMenu}>
                  Admin Users
                </Link>
              ) : null}

              {user?.role === 'admin' ? (
                <Link to="/admin/products" onClick={closeMenu}>
                  Admin Products
                </Link>
              ) : null}

              {!user ? (
                <Link to="/login" onClick={closeMenu}>
                  Login
                </Link>
              ) : null}

              {!user ? (
                <Link to="/register" onClick={closeMenu}>
                  Registro
                </Link>
              ) : null}

              {user ? (
                <div className="rounded-lg bg-slate-50 p-3 text-sm">
                  <p className="truncate">{user.email}</p>
                  <p className="mt-1 text-slate-500">{user.role}</p>

                  <button className="mt-3 rounded border px-3 py-1" onClick={handleLogout}>
                    Salir
                  </button>
                </div>
              ) : (
                <span className="text-sm text-slate-500">Sin sesión</span>
              )}
            </div>
          ) : null}
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
