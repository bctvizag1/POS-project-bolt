import React, { useEffect, useState } from 'react';
import { Store, History, Plus } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import ProductList from './components/ProductList';
import Cart from './components/Cart';
import DailySummary from './components/DailySummary';
import TransactionList from './components/TransactionList';
import { AddProduct } from './components/AddProduct';
import { useDatabase, getProducts, addSale, getDailySales, getTransactions, createProduct } from './lib/db';
import { Product, DailySummary as DailySummaryType, Sale } from './types';

function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<Map<number, { product: Product; quantity: number }>>(
    new Map()
  );
  const [dailySummary, setDailySummary] = useState<DailySummaryType | null>(null);
  const [transactions, setTransactions] = useState<Sale[]>([]);
  const [view, setView] = useState<'pos' | 'transactions'>('pos');
  const [showAddProduct, setShowAddProduct] = useState(false);
  const isDBReady = useDatabase();

  useEffect(() => {
    if (isDBReady) {
      loadProducts();
      loadDailySummary();
      loadTransactions();
    }
  }, [isDBReady]);

  const loadProducts = async () => {
    try {
      const productList = await getProducts();
      setProducts(productList);
    } catch (error) {
      toast.error('Failed to load products');
    }
  };

  const loadDailySummary = async () => {
    try {
      const summaryList = await getDailySales();
      const summary = summaryList[0] || { total_amount: 0, total_transactions: 0 };
      setDailySummary(summary);
    } catch (error) {
      toast.error('Failed to load daily summary');
    }
  };

  const loadTransactions = async () => {
    try {
      const transactionList = await getTransactions();
      setTransactions(transactionList);
    } catch (error) {
      toast.error('Failed to load transactions');
    }
  };

  const handleAddToCart = (product: Product) => {
    const newCart = new Map(cart);
    const existing = newCart.get(product.id);

    if (existing) {
      if (existing.quantity >= product.stock) {
        toast.error('Not enough stock');
        return;
      }
      newCart.set(product.id, {
        product,
        quantity: existing.quantity + 1,
      });
    } else {
      newCart.set(product.id, { product, quantity: 1 });
    }

    setCart(newCart);
    toast.success(`Added ${product.name} to cart`);
  };

  const handleRemoveFromCart = (productId: number) => {
    const newCart = new Map(cart);
    const existing = newCart.get(productId);

    if (existing && existing.quantity > 1) {
      newCart.set(productId, {
        product: existing.product,
        quantity: existing.quantity - 1,
      });
    } else {
      newCart.delete(productId);
    }

    setCart(newCart);
  };

  const handleCheckout = async () => {
    if (cart.size === 0) {
      toast.error('Cart is empty');
      return;
    }

    const total = Array.from(cart.values()).reduce(
      (sum, { product, quantity }) => sum + product.price * quantity,
      0
    );

    const items = Array.from(cart.values()).map(({ product, quantity }) => ({
      productId: product.id,
      quantity,
      price: product.price,
    }));

    try {
      await addSale(total, items);
      setCart(new Map());
      await loadProducts();
      await loadDailySummary();
      await loadTransactions();
      toast.success('Sale completed successfully!');
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Failed to process sale');
    }
  };

  const handleAddProduct = async (product: Omit<Product, 'id' | 'created_at'>) => {
    try {
      const newProduct = await createProduct(product);
      if (newProduct) {
        await loadProducts(); // Reload products after adding
        toast.success('Product added successfully!');
      } else {
        throw new Error('Failed to create product');
      }
    } catch (error) {
      toast.error('Failed to add product');
    }
  };

  if (!isDBReady) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-gray-600">Initializing database...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Store className="text-blue-600" size={24} />
              <h1 className="text-xl font-semibold">Modern POS System</h1>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => setShowAddProduct(true)}
                className="px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-700"
              >
                <Plus size={20} className="inline-block mr-2" />
                Add Product
              </button>
              <button
                onClick={() => setView('pos')}
                className={`px-4 py-2 rounded-md ${
                  view === 'pos'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Store size={20} className="inline-block mr-2" />
                POS
              </button>
              <button
                onClick={() => setView('transactions')}
                className={`px-4 py-2 rounded-md ${
                  view === 'transactions'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <History size={20} className="inline-block mr-2" />
                Transactions
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-6">
          {dailySummary && (
            <DailySummary
              totalSales={dailySummary.total_amount}
              totalTransactions={dailySummary.total_transactions}
            />
          )}
        </div>

        {view === 'pos' ? (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3">
              <ProductList
                products={products}
                cart={cart}
                onAddToCart={handleAddToCart}
                onRemoveFromCart={handleRemoveFromCart}
                onProductUpdate={loadProducts}
              />
            </div>
            <div className="lg:col-span-1">
              <Cart
                cart={cart}
                onRemoveFromCart={handleRemoveFromCart}
                onCheckout={handleCheckout}
              />
            </div>
          </div>
        ) : (
          <TransactionList transactions={transactions} />
        )}
      </main>
      <Toaster position="top-right" />
      <AddProduct
        isOpen={showAddProduct}
        onClose={() => setShowAddProduct(false)}
        onAdd={handleAddProduct}
      />
    </div>
  );
}

export default App;