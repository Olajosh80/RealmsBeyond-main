import axios from 'axios';

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

export interface PaystackInitializeResponse {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

export const paystackApi = axios.create({
  baseURL: 'https://api.paystack.co',
  headers: {
    Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
    'Content-Type': 'application/json',
  },
});

export async function initializeTransaction(
  email: string,
  amount: number,
  metadata: any
): Promise<PaystackInitializeResponse> {
  const response = await paystackApi.post('/transaction/initialize', {
    email,
    amount: amount * 100, // Paystack amount is in kobo (NGN * 100)
    metadata,
    callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success`,
  });

  return response.data;
}

export async function verifyTransaction(reference: string) {
  const response = await paystackApi.get(`/transaction/verify/${reference}`);
  return response.data;
}
