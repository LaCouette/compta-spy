import React, { useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DollarSign, TrendingUp, TrendingDown, Receipt, Loader, AlertCircle } from 'lucide-react';
import { useAccountingStore } from '../store/accountingStore';
import { format } from 'date-fns';
import { formatCurrency } from '../utils/formatters';
import DateRangeFilter from './DateRangeFilter';

const StatCard = ({ title, value, icon: Icon, trend, isLoading }: { 
  title: string;
  value: string;
  icon: React.ElementType;
  trend?: 'up' | 'down';
  isLoading?: boolean;
}) => (
  <div className="bg-white rounded-xl p-6 shadow-sm">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        {isLoading ? (
          <div className="flex items-center space-x-2 mt-1">
            <Loader className="w-4 h-4 animate-spin" />
            <span className="text-gray-400">Loading...</span>
          </div>
        ) : (
          <p className="text-2xl font-semibold mt-1">{value}</p>
        )}
      </div>
      <div className={`p-3 rounded-full ${
        trend === 'up' ? 'bg-green-100' : 
        trend === 'down' ? 'bg-red-100' : 
        'bg-blue-100'
      }`}>
        <Icon className={`w-6 h-6 ${
          trend === 'up' ? 'text-green-600' : 
          trend === 'down' ? 'text-red-600' : 
          'text-blue-600'
        }`} />
      </div>
    </div>
  </div>
);

export default function Dashboard() {
  const { summary, dateRange, isLoading, error, setDateRange, fetchNetSales, calculateSummary } = useAccountingStore();
  
  useEffect(() => {
    fetchNetSales().catch(console.error);
  }, [dateRange]);

  const handleDateRangeChange = (startDate: Date, endDate: Date) => {
    setDateRange({ startDate, endDate });
  };

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 p-4">
        <div className="flex items-center">
          <AlertCircle className="h-5 w-5 text-red-400" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error loading data</h3>
            <div className="mt-2 text-sm text-red-700">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  const totalTaxes = summary.servicesTax + summary.incomeTax + summary.mandatoryTraining;

  return (
    <div className="space-y-6">
      <DateRangeFilter 
        onFilterChange={handleDateRangeChange}
        startDate={dateRange.startDate}
        endDate={dateRange.endDate}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Net Sales (Stripe)"
          value={formatCurrency(summary.totalIncome)}
          icon={DollarSign}
          trend="up"
          isLoading={isLoading}
        />
        <StatCard
          title="Net Income"
          value={formatCurrency(summary.netIncome)}
          icon={TrendingUp}
          trend={summary.netIncome > 0 ? 'up' : 'down'}
          isLoading={isLoading}
        />
        <StatCard
          title="Total Expenses"
          value={formatCurrency(summary.totalExpenses)}
          icon={TrendingDown}
          trend="down"
          isLoading={isLoading}
        />
        <StatCard
          title="Total Taxes"
          value={formatCurrency(totalTaxes + summary.totalVAT)}
          icon={Receipt}
          isLoading={isLoading}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Net Sales Volume (Stripe)</h2>
          {isLoading ? (
            <div className="h-[300px] flex items-center justify-center">
              <Loader className="w-8 h-8 animate-spin text-primary-500" />
            </div>
          ) : (
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={[{ date: format(dateRange.startDate, 'MMM dd'), amount: summary.totalIncome }]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Line 
                    type="monotone" 
                    dataKey="amount" 
                    stroke="#0ea5e9" 
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Tax Summary</h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Services Tax (BNC)</p>
              {isLoading ? (
                <div className="flex items-center space-x-2 mt-1">
                  <Loader className="w-4 h-4 animate-spin" />
                  <span className="text-gray-400">Loading...</span>
                </div>
              ) : (
                <p className="text-xl font-semibold">{formatCurrency(summary.servicesTax)}</p>
              )}
            </div>
            <div>
              <p className="text-sm text-gray-500">Income Tax</p>
              {isLoading ? (
                <div className="flex items-center space-x-2 mt-1">
                  <Loader className="w-4 h-4 animate-spin" />
                  <span className="text-gray-400">Loading...</span>
                </div>
              ) : (
                <p className="text-xl font-semibold">{formatCurrency(summary.incomeTax)}</p>
              )}
            </div>
            <div>
              <p className="text-sm text-gray-500">Mandatory Training</p>
              {isLoading ? (
                <div className="flex items-center space-x-2 mt-1">
                  <Loader className="w-4 h-4 animate-spin" />
                  <span className="text-gray-400">Loading...</span>
                </div>
              ) : (
                <p className="text-xl font-semibold">{formatCurrency(summary.mandatoryTraining)}</p>
              )}
            </div>
            <div>
              <p className="text-sm text-gray-500">VAT</p>
              {isLoading ? (
                <div className="flex items-center space-x-2 mt-1">
                  <Loader className="w-4 h-4 animate-spin" />
                  <span className="text-gray-400">Loading...</span>
                </div>
              ) : (
                <p className="text-xl font-semibold">{formatCurrency(summary.totalVAT)}</p>
              )}
            </div>
            <div className="pt-4 border-t">
              <p className="text-sm text-gray-500">Total Tax Liability</p>
              {isLoading ? (
                <div className="flex items-center space-x-2 mt-1">
                  <Loader className="w-4 h-4 animate-spin" />
                  <span className="text-gray-400">Loading...</span>
                </div>
              ) : (
                <p className="text-xl font-semibold">{formatCurrency(totalTaxes + summary.totalVAT)}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}