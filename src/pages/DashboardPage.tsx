import React from 'react';
import Dashboard from '../components/Dashboard';
import ExpenseForm from '../components/ExpenseForm';
import TaxSettings from '../components/TaxSettings';

export default function DashboardPage() {
  return (
    <>
      <Dashboard />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <ExpenseForm />
        <TaxSettings />
      </div>
    </>
  );
}