import React, { useState } from 'react';
import { useAccountingStore } from '../store/accountingStore';
import { formatCurrency } from '../utils/formatters';
import { format } from 'date-fns';
import { Edit2, Save, X, Plus, RefreshCw } from 'lucide-react';

interface EditableExpense {
  id: string;
  date: string;
  amount: number;
  category: string;
  description: string;
  paymentOrigin: string;
}

export default function ExpensesPage() {
  const { 
    transactions, 
    addTransaction, 
    updateTransaction, 
    deleteTransaction,
    fetchMercuryExpenses,
    isFetchingMercury 
  } = useAccountingStore();
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedExpense, setEditedExpense] = useState<EditableExpense | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newExpense, setNewExpense] = useState<EditableExpense>({
    id: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    amount: 0,
    category: 'tools',
    description: '',
    paymentOrigin: ''
  });

  const handleEdit = (expense: EditableExpense) => {
    setEditingId(expense.id);
    setEditedExpense(expense);
  };

  const handleSave = () => {
    if (editedExpense) {
      updateTransaction({
        ...editedExpense,
        date: new Date(editedExpense.date),
        amount: Number(editedExpense.amount)
      });
      setEditingId(null);
      setEditedExpense(null);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditedExpense(null);
    setIsAddingNew(false);
  };

  const handleAddNew = () => {
    addTransaction({
      ...newExpense,
      date: new Date(newExpense.date),
      amount: Number(newExpense.amount),
      source: 'manual',
      status: 'completed'
    });
    setIsAddingNew(false);
    setNewExpense({
      id: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      amount: 0,
      category: 'tools',
      description: '',
      paymentOrigin: ''
    });
  };

  const handleFetchMercury = () => {
    fetchMercuryExpenses();
  };

  const categories = ['tools', 'other subscriptions', 'freelance'];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Expenses</h1>
        <div className="flex gap-4">
          <button
            onClick={handleFetchMercury}
            disabled={isFetchingMercury}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isFetchingMercury ? 'animate-spin' : ''}`} />
            {isFetchingMercury ? 'Fetching...' : 'Fetch Mercury'}
          </button>
          <button
            onClick={() => setIsAddingNew(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
          >
            <Plus className="w-4 h-4" />
            Add Expense
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Origin</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {/* New expense form row */}
              {isAddingNew && (
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      manual
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="date"
                      value={newExpense.date}
                      onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="number"
                      value={newExpense.amount}
                      onChange={(e) => setNewExpense({ ...newExpense, amount: Number(e.target.value) })}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={newExpense.category}
                      onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    >
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="text"
                      value={newExpense.description}
                      onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="text"
                      value={newExpense.paymentOrigin}
                      onChange={(e) => setNewExpense({ ...newExpense, paymentOrigin: e.target.value })}
                      placeholder="e.g., Mercury Main Account"
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <button
                      onClick={handleAddNew}
                      className="text-primary-600 hover:text-primary-900"
                    >
                      <Save className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleCancel}
                      className="text-red-600 hover:text-red-900"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              )}
              
              {/* Existing transactions */}
              {transactions.map((expense) => (
                <tr key={expense.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      expense.source === 'mercury' 
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {expense.source}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingId === expense.id ? (
                      <input
                        type="date"
                        value={editedExpense?.date}
                        onChange={(e) => setEditedExpense({ ...editedExpense!, date: e.target.value })}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                      />
                    ) : (
                      format(expense.date, 'yyyy-MM-dd')
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingId === expense.id ? (
                      <input
                        type="number"
                        value={editedExpense?.amount}
                        onChange={(e) => setEditedExpense({ ...editedExpense!, amount: Number(e.target.value) })}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                      />
                    ) : (
                      formatCurrency(expense.amount)
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingId === expense.id ? (
                      <select
                        value={editedExpense?.category}
                        onChange={(e) => setEditedExpense({ ...editedExpense!, category: e.target.value })}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                      >
                        {categories.map((cat) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    ) : (
                      expense.category
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingId === expense.id ? (
                      <input
                        type="text"
                        value={editedExpense?.description}
                        onChange={(e) => setEditedExpense({ ...editedExpense!, description: e.target.value })}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                      />
                    ) : (
                      expense.description
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingId === expense.id ? (
                      <input
                        type="text"
                        value={editedExpense?.paymentOrigin}
                        onChange={(e) => setEditedExpense({ ...editedExpense!, paymentOrigin: e.target.value })}
                        placeholder="e.g., Mercury Main Account"
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                      />
                    ) : (
                      expense.paymentOrigin
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    {editingId === expense.id ? (
                      <>
                        <button
                          onClick={handleSave}
                          className="text-primary-600 hover:text-primary-900"
                        >
                          <Save className="w-4 h-4" />
                        </button>
                        <button
                          onClick={handleCancel}
                          className="text-red-600 hover:text-red-900"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      expense.source === 'manual' && (
                        <button
                          onClick={() => handleEdit({
                            ...expense,
                            date: format(expense.date, 'yyyy-MM-dd')
                          })}
                          className="text-primary-600 hover:text-primary-900"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      )
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}