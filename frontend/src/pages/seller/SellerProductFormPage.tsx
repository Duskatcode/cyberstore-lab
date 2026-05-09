import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { getProducts } from '../../services/products.service';
import {
  createSellerProduct,
  getSellerProducts,
  updateSellerProduct,
} from '../../services/seller-products.service';
import { useAuthStore } from '../../stores/auth.store';
import type { Category, Product, ProductType } from '../../types/product.types';

type FormState = {
  name: string;
  slug: string;
  description: string;
  type: ProductType;
  categoryId: string;
  priceCents: string;
  currency: string;
  stock: string;
  imageUrl: string;
};

const initialForm: FormState = {
  name: '',
  slug: '',
  description: '',
  type: 'physical',
  categoryId: '',
  priceCents: '0',
  currency: 'COP',
  stock: '0',
  imageUrl: '',
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

export function SellerProductFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  const [form, setForm] = useState<FormState>(initialForm);
  const [publicProducts, setPublicProducts] = useState<Product[]>([]);
  const [sellerProducts, setSellerProducts] = useState<Product[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(Boolean(id));
  const isEditing = Boolean(id);

  const categories = useMemo(() => {
    const map = new Map<string, Category>();

    for (const product of publicProducts) {
      if (product.category) {
        map.set(product.category.id, product.category);
      }
    }

    return Array.from(map.values());
  }, [publicProducts]);

  useEffect(() => {
    async function loadData() {
      try {
        const [products, mine] = await Promise.all([
          getProducts(),
          getSellerProducts(),
        ]);

        setPublicProducts(products);
        setSellerProducts(mine);

        if (!id) {
          const firstCategoryId = products.find((product) => product.category)?.category?.id;

          if (firstCategoryId) {
            setForm((current) => ({
              ...current,
              categoryId: firstCategoryId,
            }));
          }

          return;
        }

        const product = mine.find((item) => item.id === id);

        if (!product) {
          setMessage('No se encontró el producto o no pertenece al seller actual.');
          return;
        }

        setForm({
          name: product.name,
          slug: product.slug,
          description: product.description ?? '',
          type: product.type,
          categoryId: product.categoryId,
          priceCents: String(product.priceCents),
          currency: product.currency,
          stock: String(product.stock),
          imageUrl: product.imageUrl ?? '',
        });
      } catch {
        setMessage('No se pudo cargar la información del producto.');
      } finally {
        setLoading(false);
      }
    }

    void loadData();
  }, [id]);

  function updateField<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handleNameChange(value: string) {
    setForm((current) => ({
      ...current,
      name: value,
      slug: current.slug ? current.slug : slugify(value),
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);

    const payload = {
      name: form.name.trim(),
      slug: form.slug.trim(),
      description: form.description.trim() || undefined,
      type: form.type,
      categoryId: form.categoryId,
      priceCents: Number(form.priceCents),
      currency: form.currency.trim() || 'COP',
      stock: Number(form.stock),
      imageUrl: form.imageUrl.trim() || undefined,
    };

    if (!payload.name || !payload.slug || !payload.categoryId) {
      setMessage('Nombre, slug y categoría son obligatorios.');
      return;
    }

    if (!Number.isInteger(payload.priceCents) || payload.priceCents < 0) {
      setMessage('El precio debe ser un entero mayor o igual a 0.');
      return;
    }

    if (!Number.isInteger(payload.stock) || payload.stock < 0) {
      setMessage('El stock debe ser un entero mayor o igual a 0.');
      return;
    }

    try {
      if (id) {
        await updateSellerProduct(id, payload);
        setMessage('Producto actualizado.');
      } else {
        await createSellerProduct(payload);
        setMessage('Producto creado como draft.');
      }

      navigate('/seller/products');
    } catch {
      setMessage('No se pudo guardar el producto. Revisa slug duplicado, categoría o permisos.');
    }
  }

  if (!user) {
    return (
      <main className="min-h-screen p-8">
        <section className="mx-auto max-w-3xl">
          <h1 className="text-3xl font-bold">Seller product form</h1>
          <p className="mt-4 text-slate-600">Debes iniciar sesión como seller.</p>
          <Link className="mt-4 inline-block rounded-lg bg-slate-900 px-4 py-2 text-white" to="/login">
            Ir a login
          </Link>
        </section>
      </main>
    );
  }

  if (user.role !== 'seller') {
    return (
      <main className="min-h-screen p-8">
        <section className="mx-auto max-w-3xl">
          <h1 className="text-3xl font-bold">Acceso denegado</h1>
          <p className="mt-4 text-slate-600">Esta sección requiere rol seller.</p>
        </section>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="min-h-screen p-8">
        <section className="mx-auto max-w-3xl">
          <p>Cargando...</p>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-8">
      <section className="mx-auto max-w-3xl">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">
              {isEditing ? 'Editar producto' : 'Crear producto'}
            </h1>
            <p className="mt-2 text-slate-600">
              Los productos nuevos quedan como draft hasta enviarlos a revisión.
            </p>
          </div>

          <Link to="/seller/products" className="rounded border border-slate-300 px-4 py-2">
            Volver
          </Link>
        </div>

        {message && (
          <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-5 rounded-2xl border border-slate-200 p-6">
          <label className="block">
            <span className="text-sm font-medium">Nombre</span>
            <input
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              value={form.name}
              onChange={(event) => handleNameChange(event.target.value)}
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium">Slug</span>
            <input
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              value={form.slug}
              onChange={(event) => updateField('slug', slugify(event.target.value))}
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium">Descripción</span>
            <textarea
              className="mt-1 min-h-24 w-full rounded-lg border border-slate-300 px-3 py-2"
              value={form.description}
              onChange={(event) => updateField('description', event.target.value)}
            />
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="text-sm font-medium">Tipo</span>
              <select
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                value={form.type}
                onChange={(event) => updateField('type', event.target.value as ProductType)}
              >
                <option value="physical">physical</option>
                <option value="digital">digital</option>
              </select>
            </label>

            <label className="block">
              <span className="text-sm font-medium">Categoría</span>
              <select
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                value={form.categoryId}
                onChange={(event) => updateField('categoryId', event.target.value)}
              >
                <option value="">Selecciona categoría</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <label className="block">
              <span className="text-sm font-medium">Precio en centavos</span>
              <input
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                type="number"
                min="0"
                step="1"
                value={form.priceCents}
                onChange={(event) => updateField('priceCents', event.target.value)}
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium">Moneda</span>
              <input
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                value={form.currency}
                onChange={(event) => updateField('currency', event.target.value)}
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium">Stock</span>
              <input
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                type="number"
                min="0"
                step="1"
                value={form.stock}
                onChange={(event) => updateField('stock', event.target.value)}
              />
            </label>
          </div>

          <label className="block">
            <span className="text-sm font-medium">Image URL</span>
            <input
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              value={form.imageUrl}
              onChange={(event) => updateField('imageUrl', event.target.value)}
              placeholder="/assets/products/hardware/example/cover.webp"
            />
          </label>

          <button className="w-full rounded-lg bg-slate-900 px-4 py-2 font-semibold text-white">
            {isEditing ? 'Guardar cambios' : 'Crear producto'}
          </button>
        </form>

        {sellerProducts.length > 0 && (
          <p className="mt-4 text-xs text-slate-500">
            Productos cargados del seller actual: {sellerProducts.length}
          </p>
        )}
      </section>
    </main>
  );
}
