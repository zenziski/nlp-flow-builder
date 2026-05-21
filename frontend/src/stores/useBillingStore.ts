import { create } from 'zustand';
import { toast } from 'sonner';
import { billingService } from '../services/billing.service';
import type {
  BillingInvoice,
  PaymentMethod,
  SavePaymentMethodPayload,
} from '../types/billing.types';

interface BillingState {
  paymentMethod: PaymentMethod | null;
  invoices: BillingInvoice[];
  isLoading: boolean;
  isSaving: boolean;

  fetchPaymentMethod: () => Promise<void>;
  fetchInvoices: () => Promise<void>;
  savePaymentMethod: (payload: SavePaymentMethodPayload) => Promise<void>;
  removePaymentMethod: () => Promise<void>;
}

export const useBillingStore = create<BillingState>((set) => ({
  paymentMethod: null,
  invoices: [],
  isLoading: false,
  isSaving: false,

  async fetchPaymentMethod() {
    set({ isLoading: true });
    try {
      const paymentMethod = await billingService.getPaymentMethod();
      set({ paymentMethod });
    } catch {
      toast.error('Failed to load payment method');
    } finally {
      set({ isLoading: false });
    }
  },

  async fetchInvoices() {
    try {
      const invoices = await billingService.getInvoices();
      set({ invoices });
    } catch {
      toast.error('Failed to load invoices');
    }
  },

  async savePaymentMethod(payload) {
    set({ isSaving: true });
    try {
      const paymentMethod = await billingService.savePaymentMethod(payload);
      set({ paymentMethod });
      toast.success('Payment method saved');
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ?? 'Failed to save payment method';
      toast.error(msg);
      throw err;
    } finally {
      set({ isSaving: false });
    }
  },

  async removePaymentMethod() {
    set({ isSaving: true });
    try {
      await billingService.removePaymentMethod();
      set({ paymentMethod: null });
      toast.success('Payment method removed');
    } catch {
      toast.error('Failed to remove payment method');
    } finally {
      set({ isSaving: false });
    }
  },
}));
