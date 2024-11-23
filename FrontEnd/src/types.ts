export interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  created_at: string;
}

export interface Sale {
  id: number;
  total: number;
  created_at: string;
  items: SaleItem[];
}

export interface SaleItem {
  id: number;
  sale_id: number;
  product_id: number;
  product_name: string;
  quantity: number;
  price: number;
}

export interface DailySummary {
  date: string;
  total_transactions: number;
  total_amount: number;
}