import React, { useState, useEffect, KeyboardEvent } from 'react';
import { Search, X } from 'lucide-react';
import { Product } from '../types';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  placeholder?: string;
  products: Product[];
  onAddToCart: (product: Product) => void;
  onCheckout: () => void;
  onPrint?: () => void;
}

export default function SearchBar({ 
  value, 
  onChange, 
  onClear, 
  placeholder = 'Search products...', 
  products,
  onAddToCart,
  onCheckout,
  onPrint
}: SearchBarProps) {
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(value.toLowerCase())
  );

  useEffect(() => {
    setSelectedIndex(-1);
    setShowSuggestions(value.length > 0);
  }, [value]);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    // Navigation keys
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => 
        prev < filteredProducts.length - 1 ? prev + 1 : prev
      );
      setShowSuggestions(true);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && filteredProducts[selectedIndex]) {
        onAddToCart(filteredProducts[selectedIndex]);
        onClear();
        setShowSuggestions(false);
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      onClear();
    }

    // Shortcuts with Ctrl key
    if (e.ctrlKey) {
      if (e.key === 'p' || e.key === 'P') {
        e.preventDefault();
        onPrint?.();
      } else if (e.key === 'c' || e.key === 'C') {
        e.preventDefault();
        onCheckout();
      }
    }
  };

  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="h-5 w-5 text-gray-400" />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        placeholder={placeholder}
      />
      {value && (
        <button
          onClick={onClear}
          className="absolute inset-y-0 right-0 pr-3 flex items-center"
        >
          <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
        </button>
      )}
      
      {/* Product suggestions dropdown */}
      {showSuggestions && filteredProducts.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg max-h-60 overflow-auto">
          {filteredProducts.map((product, index) => (
            <div
              key={product.id}
              className={`px-4 py-2 cursor-pointer ${
                index === selectedIndex
                  ? 'bg-blue-100 text-blue-900'
                  : 'hover:bg-gray-100'
              }`}
              onClick={() => {
                onAddToCart(product);
                onClear();
                setShowSuggestions(false);
              }}
            >
              <div className="flex justify-between items-center">
                <span className="font-medium">{product.name}</span>
                <span className="text-gray-600">${product.price}</span>
              </div>
              <div className="text-sm text-gray-500">Stock: {product.stock}</div>
            </div>
          ))}
        </div>
      )}

      {/* Keyboard shortcuts help */}
      <div className="absolute right-0 mt-1 text-xs text-gray-500">
        <div>↑↓ to navigate • Enter to add • Esc to clear</div>
        <div>Ctrl+C to checkout • Ctrl+P to print</div>
      </div>
    </div>
  );
}