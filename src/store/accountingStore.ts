import { create } from 'zustand';
import { Transaction, TaxSettings, AccountingSummary } from '../types/accounting';
import { startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { getNetSales } from '../services/stripe';
import { fetchMercuryTransactions } from '../services/mercury';

interface DateRange {
  startDate: Date;
  endDate: Date;
}

interface AccountingStore {
  transactions: Transaction[];
  taxSettings: TaxSettings;
  summary: AccountingSummary;
  dateRange: DateRange;
  isLoading: boolean;
  error: string | null;
  isFetchingMercury: boolean;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  updateTransaction: (transaction: Transaction) => void;
  deleteTransaction: (id: string) => void;
  updateTaxSettings: (settings: TaxSettings) => void;
  setDateRange: (range: DateRange) => void;
  fetchNetSales: () => Promise<void>;
  fetchMercuryExpenses: () => Promise<void>;
  calculateSummary: () => void;
  setError: (error: string | null) => void;
}

export const useAccountingStore = create<AccountingStore>((set, get) => ({
  transactions: [],
  taxSettings: {
    servicesTaxRate: 0.231,      // 23.10%
    incomeTaxRate: 0.022,        // 2.20%
    mandatoryTrainingRate: 0.001, // 0.10%
    vatRate: 0.20,               // 20%
    country: 'FR'
  },
  dateRange: {
    startDate: startOfMonth(new Date()),
    endDate: endOfMonth(new Date())
  },
  isLoading: false,
  error: null,
  isFetchingMercury: false,
  summary: {
    totalIncome: 0,
    totalExpenses: 0,
    servicesTax: 0,
    incomeTax: 0,
    mandatoryTraining: 0,
    totalVAT: 0,
    netIncome: 0,
    pendingIncome: 0
  },
  
  setError: (error) => set({ error }),
  
  addTransaction: (transaction) => {
    const newTransaction = {
      ...transaction,
      id: crypto.randomUUID()
    };
    
    set((state) => ({
      transactions: [...state.transactions, newTransaction]
    }));
    get().calculateSummary();
  },
  
  updateTransaction: (transaction) => {
    set((state) => ({
      transactions: state.transactions.map((t) => 
        t.id === transaction.id ? transaction : t
      )
    }));
    get().calculateSummary();
  },
  
  deleteTransaction: (id) => {
    set((state) => ({
      transactions: state.transactions.filter((t) => t.id !== id)
    }));
    get().calculateSummary();
  },
  
  updateTaxSettings: (settings) => {
    set({ taxSettings: settings });
    get().calculateSummary();
  },

  setDateRange: (range) => {
    set({ dateRange: range });
    get().fetchNetSales();
  },

  fetchNetSales: async () => {
    const { dateRange } = get();
    set({ isLoading: true, error: null });

    try {
      const netSales = await getNetSales(dateRange.startDate, dateRange.endDate);
      
      set((state) => ({
        summary: {
          ...state.summary,
          totalIncome: netSales
        }
      }));
      
      get().calculateSummary();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch net sales';
      set({ error: errorMessage });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchMercuryExpenses: async () => {
    set({ isFetchingMercury: true, error: null });

    try {
      const mercuryTransactions = await fetchMercuryTransactions();
      
      set((state) => ({
        transactions: [
          ...state.transactions.filter(t => t.source !== 'mercury'),
          ...mercuryTransactions
        ]
      }));
      
      get().calculateSummary();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch Mercury transactions';
      set({ error: errorMessage });
    } finally {
      set({ isFetchingMercury: false });
    }
  },
  
  calculateSummary: () => {
    const { transactions, taxSettings, summary, dateRange } = get();
    
    // Filter transactions by date range
    const filteredExpenses = transactions.filter(t => 
      isWithinInterval(t.date, { start: dateRange.startDate, end: dateRange.endDate })
    );
    
    const calculatedSummary: AccountingSummary = {
      ...summary,
      servicesTax: summary.totalIncome * taxSettings.servicesTaxRate,
      incomeTax: summary.totalIncome * taxSettings.incomeTaxRate,
      mandatoryTraining: summary.totalIncome * taxSettings.mandatoryTrainingRate,
      totalVAT: summary.totalIncome * taxSettings.vatRate,
      totalExpenses: filteredExpenses.reduce((sum, t) => sum + t.amount, 0),
      pendingIncome: 0
    };
    
    calculatedSummary.netIncome = 
      calculatedSummary.totalIncome - 
      calculatedSummary.totalExpenses - 
      calculatedSummary.servicesTax -
      calculatedSummary.incomeTax -
      calculatedSummary.mandatoryTraining -
      calculatedSummary.totalVAT;
    
    set({ summary: calculatedSummary });
  }
}));