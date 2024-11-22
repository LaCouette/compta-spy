import React from 'react';
import { useForm } from 'react-hook-form';
import { useAccountingStore } from '../store/accountingStore';
import { Plus } from 'lucide-react';

interface ExpenseFormData {
  amount: number;
  description: string;
  date: string;
  category: 'tools' | 'other subscriptions' | 'freelance';
  paymentOrigin: string;
}

export default function ExpenseForm() {
  const { register, handleSubmit, reset } = useForm<ExpenseFormData>({
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      category: 'tools',
      paymentOrigin: ''
    }
  });
  const addTransaction = useAccountingStore(state => state.addTransaction);

  const onSubmit = (data: ExpenseFormData) => {
    addTransaction({
      ...data,
      date: new Date(data.date),
      source: 'manual',
      status: 'completed'
    });
    reset({
      date: new Date().toISOString().split('T')[0],
      category: 'tools',
      paymentOrigin: ''
    });
  };

  const categories = ['tools', 'other subscriptions', 'freelance'];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-xl p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-6">
        <Plus className="w-5 h-5 text-primary-600" />
        <h2 className="text-xl font-semibold">Add Manual Expense</h2>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Date</label>
          <input
            type="date"
            {...register('date', { required: true })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Amount</label>
          <input
            type="number"
            step="0.01"
            {...register('amount', { required: true, valueAsNumber: true })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Category</label>
          <select
            {...register('category', { required: true })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <input
            type="text"
            {...register('description', { required: true })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Payment Origin</label>
          <input
            type="text"
            {...register('paymentOrigin', { required: true })}
            placeholder="e.g., Mercury Main Account"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
        >
          Add Expense
        </button>
      </div>
    </form>
  );
}