import axios from 'axios';
import { startOfMonth, endOfMonth } from 'date-fns';

const STRIPE_SECRET_KEY = import.meta.env.VITE_STRIPE_SECRET_KEY;
const STRIPE_API_URL = 'https://api.stripe.com/v1/balance_transactions';

interface StripeBalanceTransaction {
  id: string;
  amount: number;
  net: number;
  type: string;
  created: number;
  currency: string;
  status: string;
}

interface StripeResponse {
  data: StripeBalanceTransaction[];
  has_more: boolean;
}

export const getNetSales = async (startDate: Date, endDate: Date): Promise<number> => {
  if (!STRIPE_SECRET_KEY) {
    throw new Error('Stripe secret key is not configured');
  }

  const start = Math.floor(startDate.getTime() / 1000);
  const end = Math.floor(endDate.getTime() / 1000);
  
  let totalNetAmount = 0;
  let hasMore = true;
  let startingAfter: string | undefined;

  while (hasMore) {
    try {
      const params: Record<string, any> = {
        type: 'charge',
        'created[gte]': start,
        'created[lte]': end,
        limit: 100
      };

      if (startingAfter) {
        params.starting_after = startingAfter;
      }

      const response = await axios.get<StripeResponse>(STRIPE_API_URL, {
        headers: {
          'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
        },
        params,
      });

      const { data } = response.data;
      
      // Sum up the net amounts (already accounts for fees, refunds, etc.)
      for (const transaction of data) {
        if (transaction.status === 'available') {
          totalNetAmount += transaction.net / 100; // Convert from cents to euros
        }
      }

      hasMore = response.data.has_more;
      if (hasMore && data.length > 0) {
        startingAfter = data[data.length - 1].id;
      }
    } catch (error) {
      console.error('Error fetching Stripe data:', error);
      throw error;
    }
  }

  return totalNetAmount;
};