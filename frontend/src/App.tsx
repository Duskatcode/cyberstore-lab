import { Link, Route, Routes } from 'react-router';
import { HomePage } from './pages/public/HomePage';
import { ProductsPage } from './pages/public/ProductsPage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';

function App() {
  return (
    <>
      <header className="border-b border-slate-200 px-8 py-4">
        <nav className="mx-auto flex max-w-5xl gap-4">
          <Link to="/" className="font-semibold">
            CyberStore Lab
          </Link>
          <Link to="/products">Productos</Link>
          <Link to="/login">Login</Link>
          <Link to="/register">Registro</Link>
        </nav>
      </header>

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Routes>
    </>
  );
}

export default App;
