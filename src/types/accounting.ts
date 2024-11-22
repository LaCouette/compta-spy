export interface Transaction {
  id: string;
  date: Date;
  amount: number;
  description: string;
  category: 'tools' | 'other subscriptions' | 'freelance';
  source: 'stripe' | 'mercury' | 'manual';
  status: 'pending' | 'completed';
  paymentOrigin: string;
}

export interface TaxSettings {
  servicesTaxRate: number;      // BNC - 23.10%
  incomeTaxRate: number;        // Versement liberatoire - 2.20%
  mandatoryTrainingRate: number; // Formation commercant - 0.10%
  vatRate: number;              // TVA
  country: string;
}

export interface AccountingSummary {
  totalIncome: number;
  totalExpenses: number;
  servicesTax: number;
  incomeTax: number;
  mandatoryTraining: number;
  totalVAT: number;
  netIncome: number;
  pendingIncome: number;
}