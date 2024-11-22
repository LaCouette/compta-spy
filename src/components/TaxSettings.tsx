import React from 'react';
import { useForm } from 'react-hook-form';
import { useAccountingStore } from '../store/accountingStore';
import { Settings } from 'lucide-react';

interface TaxSettingsFormData {
  servicesTaxRate: number;
  incomeTaxRate: number;
  mandatoryTrainingRate: number;
  vatRate: number;
  country: string;
}

export default function TaxSettings() {
  const { taxSettings, updateTaxSettings } = useAccountingStore();
  const { register, handleSubmit } = useForm<TaxSettingsFormData>({
    defaultValues: {
      servicesTaxRate: taxSettings.servicesTaxRate * 100,
      incomeTaxRate: taxSettings.incomeTaxRate * 100,
      mandatoryTrainingRate: taxSettings.mandatoryTrainingRate * 100,
      vatRate: taxSettings.vatRate * 100,
      country: taxSettings.country
    }
  });

  const onSubmit = (data: TaxSettingsFormData) => {
    updateTaxSettings({
      ...data,
      servicesTaxRate: data.servicesTaxRate / 100,
      incomeTaxRate: data.incomeTaxRate / 100,
      mandatoryTrainingRate: data.mandatoryTrainingRate / 100,
      vatRate: data.vatRate / 100,
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-xl p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Settings className="w-5 h-5 text-primary-600" />
        <h2 className="text-xl font-semibold">Tax Settings</h2>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Services Tax Rate (BNC) (%)
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            max="100"
            {...register('servicesTaxRate', { 
              required: true,
              valueAsNumber: true,
              min: 0,
              max: 100
            })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Income Tax Rate (Versement liberatoire) (%)
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            max="100"
            {...register('incomeTaxRate', { 
              required: true,
              valueAsNumber: true,
              min: 0,
              max: 100
            })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Mandatory Training Rate (%)
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            max="100"
            {...register('mandatoryTrainingRate', { 
              required: true,
              valueAsNumber: true,
              min: 0,
              max: 100
            })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">VAT Rate (%)</label>
          <input
            type="number"
            step="0.01"
            min="0"
            max="100"
            {...register('vatRate', { 
              required: true,
              valueAsNumber: true,
              min: 0,
              max: 100
            })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Country</label>
          <select
            {...register('country', { required: true })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          >
            <option value="FR">France</option>
            <option value="EU">Other EU Country</option>
          </select>
        </div>

        <button
          type="submit"
          className="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
        >
          Update Settings
        </button>
      </div>
    </form>
  );
}