import { useState } from 'react';
import { Product } from '../types';

interface EditProductProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (id: number, updates: { price?: number; stock?: number }) => void;
}

export const EditProduct: React.FC<EditProductProps> = ({ product, isOpen, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    price: product.price.toString(),
    stock: product.stock.toString(),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updates: { price?: number; stock?: number } = {};
    
    if (formData.price !== product.price.toString()) {
      updates.price = Number(formData.price);
    }
    if (formData.stock !== product.stock.toString()) {
      updates.stock = Number(formData.stock);
    }

    if (Object.keys(updates).length > 0) {
      onUpdate(product.id, updates);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-yellow-100 p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-xl font-bold mb-4">Edit Product: {product.name}</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="price" className="block text-lg font-medium text-gray-700">
              Price
            </label>
            <input
              type="number"
              id="price"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              className="mt-1 block w-full p-2 rounded-md border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              min="0"
              step="0.01"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="stock" className="block text-lg font-medium text-gray-700">
              Stock
            </label>
            <input
              type="number"
              id="stock"
              value={formData.stock}
              onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
              className="mt-1 block w-full p-2 rounded-md border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              min="0"
              required
            />
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Update Product
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
