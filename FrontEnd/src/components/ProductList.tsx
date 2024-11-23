import React, { useState, useMemo } from 'react';
import { Plus, Minus, Edit } from 'lucide-react';
import { Product } from '../types';
import SearchBar from './SearchBar';
import { EditProduct } from './EditProduct';
import { updateProduct } from '../lib/db';
import toast from 'react-hot-toast';

interface ProductListProps {
  products: Product[];
  cart: Map<number, { product: Product; quantity: number }>;
  onAddToCart: (product: Product) => void;
  onRemoveFromCart: (productId: number) => void;
  onProductUpdate: () => void;
}

const ProductList: React.FC<ProductListProps> = ({ products, cart, onAddToCart, onRemoveFromCart, onProductUpdate }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return products;
    
    const query = searchQuery.toLowerCase();
    return products.filter(product => 
      product.name.toLowerCase().includes(query)
    );
  }, [products, searchQuery]);

  const handleUpdateProduct = async (id: number, updates: { price?: number; stock?: number }) => {
    const result = await updateProduct(id, updates);
    if (result) {
      toast.success('Product updated successfully!');
      onProductUpdate();
    } else {
      toast.error('Failed to update product');
    }
  };

  return (
    <div className="space-y-4">
      <div className="mb-6">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          onClear={() => setSearchQuery('')}
        />
      </div>

      {filteredProducts.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No products found</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredProducts.map((product) => {
            const cartItem = cart.get(product.id);
            const quantity = cartItem?.quantity || 0;

            return (
              <div
                key={product.id}
                className="bg-white rounded-lg shadow-md p-4 flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-semibold">{product.name}</h3>
                    <button
                      onClick={() => setEditingProduct(product)}
                      className="p-1 text-gray-600 hover:text-blue-600"
                    >
                      <Edit size={18} />
                    </button>
                  </div>
                  <p className="text-gray-600">Price: ${product.price}</p>
                  <p className="text-gray-600">Stock: {product.stock}</p>
                </div>

                <div className="flex items-center justify-between mt-4">
                  {quantity > 0 && (
                    <button
                      onClick={() => onRemoveFromCart(product.id)}
                      className="p-1 text-red-600 hover:bg-red-100 rounded"
                    >
                      <Minus size={20} />
                    </button>
                  )}
                  {quantity > 0 && <span className="text-lg">{quantity}</span>}
                  <button
                    onClick={() => onAddToCart(product)}
                    className="p-1 text-green-600 hover:bg-green-100 rounded ml-auto"
                    disabled={quantity >= product.stock}
                  >
                    <Plus size={20} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {editingProduct && (
        <EditProduct
          product={editingProduct}
          isOpen={true}
          onClose={() => setEditingProduct(null)}
          onUpdate={handleUpdateProduct}
        />
      )}
    </div>
  );
};

export default ProductList;