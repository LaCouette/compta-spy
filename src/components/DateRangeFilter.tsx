import React from 'react';
import { useForm } from 'react-hook-form';
import { CalendarRange } from 'lucide-react';
import { format } from 'date-fns';

interface DateRangeFilterProps {
  onFilterChange: (startDate: Date, endDate: Date) => void;
  startDate: Date;
  endDate: Date;
}

interface FormData {
  startDate: string;
  endDate: string;
}

export default function DateRangeFilter({ onFilterChange, startDate, endDate }: DateRangeFilterProps) {
  const { register, handleSubmit } = useForm<FormData>({
    defaultValues: {
      startDate: format(startDate, 'yyyy-MM-dd'),
      endDate: format(endDate, 'yyyy-MM-dd')
    }
  });

  const onSubmit = (data: FormData) => {
    onFilterChange(new Date(data.startDate), new Date(data.endDate));
  };

  return (
    <form 
      onSubmit={handleSubmit(onSubmit)}
      className="flex items-center gap-4 bg-white p-4 rounded-lg shadow-sm mb-6"
    >
      <CalendarRange className="w-5 h-5 text-gray-500" />
      <div className="flex items-center gap-4">
        <div>
          <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
            From
          </label>
          <input
            type="date"
            id="startDate"
            {...register('startDate')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
          />
        </div>
        <div>
          <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
            To
          </label>
          <input
            type="date"
            id="endDate"
            {...register('endDate')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
          />
        </div>
      </div>
      <button
        type="submit"
        className="ml-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
      >
        Apply Filter
      </button>
    </form>
  );
}