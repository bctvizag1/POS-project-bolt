import React, { useState, useMemo } from 'react';
import { Edit2, ShoppingCart } from 'lucide-react';
import { Product } from '../types';
import { EditProduct } from './EditProduct';
import SearchBar from './SearchBar';

interface ProductListProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
  isAdmin: boolean;
}

const ProductList: React.FC<ProductListProps> = ({ products, onAddToCart, isAdmin }) => {
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProducts = useMemo(() => {
    if (!searchQuery) return products;
    const query = searchQuery.toLowerCase();
    return products.filter(product => 
      product.name.toLowerCase().includes(query)
    );
  }, [products, searchQuery]);

  return (
    <div className="space-y-4">
      <SearchBar
        value={searchQuery}
        onChange={setSearchQuery}
        onClear={() => setSearchQuery('')}
        placeholder="Search products..."
      />
      
      <div className="bg-white shadow-sm rounded-lg">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="border rounded-lg p-4 flex flex-col justify-between hover:shadow-md transition-shadow"
            >
              <div>
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-medium text-gray-900">{product.name}</h3>
                  {isAdmin && (
                    <button
                      onClick={() => setEditingProduct(product)}
                      className="p-1 text-gray-400 hover:text-gray-500"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <p className="mt-1 text-gray-500">Stock: {product.stock}</p>
                <p className="mt-1 text-xl font-semibold text-gray-900">
                  ${product.price.toFixed(2)}
                </p>
              </div>
              <button
                onClick={() => onAddToCart(product)}
                disabled={product.stock === 0}
                className={`mt-4 w-full inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white
                  ${
                    product.stock === 0
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-indigo-600 hover:bg-indigo-700'
                  }`}
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Add to Cart
              </button>
            </div>
          ))}
        </div>
      </div>

      {editingProduct && (
        <EditProduct
          product={editingProduct}
          onClose={() => setEditingProduct(null)}
          onProductUpdated={() => {
            // Refresh products
            window.location.reload();
          }}
        />
      )}
    </div>
  );
};

export default ProductList;