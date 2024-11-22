import axios from 'axios';
import { Transaction } from '../types/accounting';

const BASE_URL = 'https://api.mercury.com/api/v1';

const ALLOWED_COUNTERPARTIES = [
  'adsparo', 'fliki.ai', 'foreplay.co', 'www.ppspy.com', 'adspy',
  'peeksta', 'shopision', 'pipi ads', 'helium 10', 'niche scraper pro',
  'midjourney', 'wlspy.com', 'minea (eds ag)', 'klaviyo', 'afterlib',
  'mpp invoice', 'kalodata', 'sell the trend corp', 'dropship',
  'dropispy.com', 'adnosaur', 'lemsqzy winninghunter', 'canva',
  'play.ht', 'openai', 'submagic.co', 'invideo', 'sublaunch',
  'vidyo.ai', 'jasper.ai', 'webflow', 'cutout.pro',
  'amazon web services', 'runway unlimited plan', 'copyai', 'jungle scout'
].map(s => s.toLowerCase());

interface MercuryConfig {
  name: string;
  apiKey: string;
  accountIds: string[];
}

const MERCURY_ACCOUNTS: MercuryConfig[] = [
  {
    name: 'ONIL',
    apiKey: import.meta.env.VITE_MERCURY_ONIL_API_KEY,
    accountIds: import.meta.env.VITE_MERCURY_ONIL_ACCOUNT_IDS.split(',')
  },
  {
    name: 'GOLDEN',
    apiKey: import.meta.env.VITE_MERCURY_GOLDEN_API_KEY,
    accountIds: import.meta.env.VITE_MERCURY_GOLDEN_ACCOUNT_IDS.split(',')
  }
];

interface MercuryTransaction {
  id: string;
  amount: string;
  status: string;
  counterpartyName?: string;
  counterpartyId?: string;
  bankDescription?: string;
  externalMemo?: string;
  note?: string;
  postedAt?: string;
  createdAt: string;
}

class MercuryError extends Error {
  constructor(message: string, public details?: any) {
    super(message);
    this.name = 'MercuryError';
  }
}

const getHeaders = (apiKey: string) => ({
  'Authorization': `Bearer ${apiKey}`,
  'Content-Type': 'application/json'
});

const matchesAllowedCounterparty = (counterparty: string): boolean => {
  if (!counterparty) return false;
  const counterpartyLower = counterparty.toLowerCase();
  return ALLOWED_COUNTERPARTIES.some(allowed => counterpartyLower.includes(allowed));
};

const isValidTransaction = (transaction: MercuryTransaction): boolean => {
  const amount = parseFloat(transaction.amount);
  if (amount >= 0) return false;

  if (transaction.status?.toLowerCase() !== 'sent') return false;

  const counterparty = transaction.counterpartyName || 
                      transaction.counterpartyId || 
                      transaction.bankDescription;
  if (!matchesAllowedCounterparty(counterparty || '')) return false;

  const transactionDate = new Date(transaction.postedAt || transaction.createdAt);
  const daysOld = (Date.now() - transactionDate.getTime()) / (1000 * 60 * 60 * 24);
  if (daysOld > 30) return false;

  return true;
};

const transformMercuryTransaction = (transaction: MercuryTransaction, accountName: string): Transaction => ({
  id: transaction.id,
  date: new Date(transaction.postedAt || transaction.createdAt),
  amount: Math.abs(parseFloat(transaction.amount)),
  description: transaction.externalMemo || 
              transaction.bankDescription || 
              transaction.note || 
              'No description',
  category: 'tools',
  source: 'mercury',
  status: 'completed',
  paymentOrigin: `Mercury ${accountName}`
});

const fetchAccountTransactions = async (account: MercuryConfig): Promise<Transaction[]> => {
  const transactions: Transaction[] = [];

  try {
    for (const accountId of account.accountIds) {
      const response = await axios.get<{ transactions: MercuryTransaction[] }>(
        `${BASE_URL}/account/${accountId}/transactions`,
        { headers: getHeaders(account.apiKey) }
      );

      if (response.status === 200 && Array.isArray(response.data.transactions)) {
        const validTransactions = response.data.transactions
          .filter(isValidTransaction)
          .map(t => transformMercuryTransaction(t, account.name));
        
        transactions.push(...validTransactions);
      }
    }

    return transactions;
  } catch (error) {
    throw new MercuryError(
      `Failed to fetch transactions for ${account.name}`,
      error instanceof Error ? error.message : String(error)
    );
  }
};

export const fetchMercuryTransactions = async (): Promise<Transaction[]> => {
  try {
    const allTransactionsPromises = MERCURY_ACCOUNTS.map(fetchAccountTransactions);
    const allTransactions = await Promise.all(allTransactionsPromises);
    
    return allTransactions
      .flat()
      .sort((a, b) => b.date.getTime() - a.date.getTime());
  } catch (error) {
    if (error instanceof MercuryError) {
      throw error;
    }
    throw new MercuryError('Failed to fetch Mercury transactions', error);
  }
};