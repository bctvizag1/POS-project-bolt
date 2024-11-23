import React from 'react';
import { DollarSign, ShoppingBag } from 'lucide-react';

interface DailySummaryProps {
  totalSales: number;
  totalTransactions: number;
}

export default function DailySummary({ totalSales, totalTransactions }: DailySummaryProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-full">
            <DollarSign className="text-blue-600" size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Daily Sales</p>
            <p className="text-xl font-semibold">${totalSales.toFixed(2)}</p>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-green-100 rounded-full">
            <ShoppingBag className="text-green-600" size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Transactions</p>
            <p className="text-xl font-semibold">{totalTransactions}</p>
          </div>
        </div>
      </div>
    </div>
  );
}