import React, { useState } from 'react';
import axios from 'axios';
import { X } from 'lucide-react';
import { Product } from '../types';
import { isAdmin } from '../lib/authService';
import toast from 'react-hot-toast';

interface EditProductProps {
  product: Product;
  onClose: () => void;
  onProductUpdated: () => void;
}

export const EditProduct: React.FC<EditProductProps> = ({
  product,
  onClose,
  onProductUpdated,
}) => {
  const [price, setPrice] = useState(product.price.toString());
  const [stock, setStock] = useState(product.stock.toString());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAdmin()) {
      toast.error('Admin access required');
      return;
    }

    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      await axios.put(`/api/products/${product.id}`, {
        price: parseFloat(price),
        stock: parseInt(stock, 10),
      });

      toast.success('Product updated successfully');
      onProductUpdated();
      onClose();
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 403) {
        toast.error('Admin access required');
      } else {
        console.error('Failed to update product:', err);
        toast.error('Failed to update product');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAdmin()) return null;

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-medium">Edit Product: {product.name}</h2>
          <button 
            type="button"
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4">
          <div className="space-y-4">
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                Price
              </label>
              <input
                type="number"
                id="price"
                step="0.01"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                required
              />
            </div>

            <div>
              <label htmlFor="stock" className="block text-sm font-medium text-gray-700">
                Stock
              </label>
              <input
                type="number"
                id="stock"
                min="0"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                required
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md ${
                  isSubmitting 
                    ? 'opacity-50 cursor-not-allowed' 
                    : 'hover:bg-indigo-700'
                }`}
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
