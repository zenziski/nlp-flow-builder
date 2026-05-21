import apiClient from './api.client';
import type {
  BillingInvoice,
  PaymentMethod,
  SavePaymentMethodPayload,
} from '../types/billing.types';

export const billingService = {
  async getPaymentMethod(): Promise<PaymentMethod | null> {
    const res = await apiClient.get('/billing/payment-method');
    return res.data.data;
  },

  async savePaymentMethod(payload: SavePaymentMethodPayload): Promise<PaymentMethod> {
    const res = await apiClient.post('/billing/payment-method', payload);
    return res.data.data;
  },

  async removePaymentMethod(): Promise<void> {
    await apiClient.delete('/billing/payment-method');
  },

  async getInvoices(): Promise<BillingInvoice[]> {
    const res = await apiClient.get('/billing/invoices');
    return res.data.data;
  },
};
