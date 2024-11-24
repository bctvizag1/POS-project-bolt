import { useEffect, useState } from 'react';
import { Store, History, Plus, LogIn, LogOut } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import ProductList from './components/ProductList';
import Cart from './components/Cart';
import DailySummary from './components/DailySummary';
import TransactionList from './components/TransactionList';
import { AddProduct } from './components/AddProduct';
import { AdminLogin } from './components/AdminLogin';
import axios from 'axios';
import { isAdmin, logout, initializeAuth } from './lib/authService';
import { Product, Sale, DailySummary as IDailySummary } from './types';

// Configure axios
axios.defaults.baseURL = 'http://localhost:3000';

interface CartItem {
  product: Product;
  quantity: number;
}

interface DailySummaryData {
  totalSales: number;
  totalTransactions: number;
}

function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<Map<number, CartItem>>(new Map());
  const [dailySummary, setDailySummary] = useState<DailySummaryData>({
    totalSales: 0,
    totalTransactions: 0
  });
  const [transactions, setTransactions] = useState<Sale[]>([]);
  const [view, setView] = useState<'pos' | 'transactions' | 'login'>('pos');
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [isAdminUser, setIsAdminUser] = useState(isAdmin());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializeAuth();
    setIsAdminUser(isAdmin());
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      await Promise.all([
        loadProducts(),
        loadDailySummary(),
        loadTransactions()
      ]);
    } catch (error) {
      console.error('Error loading initial data:', error);
      toast.error('Failed to load initial data');
    } finally {
      setIsLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      const response = await axios.get<Product[]>('/api/products');
      setProducts(response.data);
    } catch (error) {
      console.error('Failed to load products:', error);
      toast.error('Failed to load products');
    }
  };

  const loadDailySummary = async () => {
    try {
      const response = await axios.get<IDailySummary[]>('/api/daily-sales');
      const summary = response.data[0];
      if (summary) {
        setDailySummary({
          totalSales: summary.total_amount,
          totalTransactions: summary.total_transactions
        });
      }
    } catch (error) {
      console.error('Failed to load daily summary:', error);
      toast.error('Failed to load daily summary');
    }
  };

  const loadTransactions = async () => {
    try {
      const response = await axios.get<Sale[]>('/api/transactions');
      setTransactions(response.data);
    } catch (error) {
      console.error('Failed to load transactions:', error);
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
      product_id: product.id,
      quantity,
      price: product.price,
    }));

    try {
      await axios.post('/api/sales', { total, items });
      setCart(new Map());
      await Promise.all([
        loadProducts(),
        loadDailySummary(),
        loadTransactions()
      ]);
      toast.success('Sale completed successfully!');
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Failed to process sale');
    }
  };

  const handleAddProduct = async (productData: Omit<Product, 'id' | 'created_at'>) => {
    try {
      await axios.post('/api/products', productData);
      await loadProducts();
      setShowAddProduct(false);
      toast.success('Product added successfully!');
    } catch (error) {
      console.error('Failed to add product:', error);
      toast.error('Failed to add product');
    }
  };

  const handleLogout = () => {
    logout();
    setIsAdminUser(false);
    toast.success('Logged out successfully');
  };

  const handleLoginSuccess = () => {
    setIsAdminUser(true);
    setView('pos');
    toast.success('Logged in as admin');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex space-x-8">
              <button
                onClick={() => setView('pos')}
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  view === 'pos'
                    ? 'border-indigo-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Store className="w-5 h-5 mr-2" />
                POS
              </button>
              <button
                onClick={() => setView('transactions')}
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  view === 'transactions'
                    ? 'border-indigo-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <History className="w-5 h-5 mr-2" />
                Transactions
              </button>
            </div>
            <div className="flex items-center">
              {isAdminUser ? (
                <>
                  <button
                    onClick={() => setShowAddProduct(true)}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mr-4"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Product
                  </button>
                  <button
                    onClick={handleLogout}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-700 hover:text-gray-900 focus:outline-none"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setView('login')}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-700 hover:text-gray-900 focus:outline-none"
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  Admin Login
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {view === 'login' ? (
          <AdminLogin onLoginSuccess={handleLoginSuccess} />
        ) : view === 'pos' ? (
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-8">
              <ProductList 
                products={products} 
                onAddToCart={handleAddToCart} 
                isAdmin={isAdminUser} 
              />
            </div>
            <div className="col-span-4">
              
              <DailySummary summary={dailySummary} />

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

      {showAddProduct && (
        <AddProduct
          isOpen={showAddProduct}
          onClose={() => setShowAddProduct(false)}
          onAdd={handleAddProduct}
        />
      )}

      <Toaster position="top-right" />
    </div>
  );
}

export default App;