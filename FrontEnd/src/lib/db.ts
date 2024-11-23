import { Sale, SaleItem, Product } from '../types';

// const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
const API_URL = 'http://localhost:3000/api';

export const getProducts = async (): Promise<Product[]> => {
  try {
    let url = `${API_URL}/products`;
    const response = await fetch(url);
    console.log(url);
    
    if (!response.ok) {
      throw new Error('Failed to fetch products');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
};

export const addSale = async (total: number, items: Array<{productId: number, quantity: number, price: number}>): Promise<number | null> => {
  try {
    const response = await fetch(`${API_URL}/sales`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ total, items }),
    });

    if (!response.ok) {
      throw new Error('Failed to add sale');
    }

    const data = await response.json();
    return data.saleId;
  } catch (error) {
    console.error('Error adding sale:', error);
    return null;
  }
};

export const getDailySales = async (): Promise<{ date: string, total_transactions: number, total_amount: number }[]> => {
  try {
    const response = await fetch(`${API_URL}/daily-sales`);
    if (!response.ok) {
      throw new Error('Failed to fetch daily sales');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching daily sales:', error);
    return [];
  }
};

export const getTransactions = async (): Promise<Sale[]> => {
  try {
    const response = await fetch(`${API_URL}/transactions`);
    if (!response.ok) {
      throw new Error('Failed to fetch transactions');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return [];
  }
};

export const createProduct = async (product: Omit<Product, 'id' | 'created_at'>): Promise<Product | null> => {
  try {
    const response = await fetch(`${API_URL}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(product),
    });

    if (!response.ok) {
      throw new Error('Failed to create product');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating product:', error);
    return null;
  }
};

export const updateProduct = async (
  id: number,
  updates: { price?: number; stock?: number }
): Promise<Product | null> => {
  try {
    const response = await fetch(`${API_URL}/products/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      throw new Error('Failed to update product');
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating product:', error);
    return null;
  }
};

export const useDatabase = () => {
    return true;
};

// This function is no longer needed as the database is initialized on the backend
// export const initDB = async () => {
//   console.log('Database initialization is handled by the backend.');
// };

// This hook is no longer needed as we're not initializing the database on the frontend
// export const useDatabase = () => {
//   return true; // Always return true as the database is managed by the backend
// };