import { IndianRupee, ShoppingBag } from 'lucide-react';

interface DailySummaryProps {
  summary?: {
    totalSales: number;
    totalTransactions: number;
  };
}

export default function DailySummary({ summary }: DailySummaryProps) {
  const totalSales = summary?.totalSales ?? 0;
  const totalTransactions = summary?.totalTransactions ?? 0;

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-full">
            <IndianRupee className="text-blue-600" size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Daily Sales</p>
            <p className="text-xl font-semibold">Rs. {totalSales.toFixed(2)}</p>
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