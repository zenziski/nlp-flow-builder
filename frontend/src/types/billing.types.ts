export interface PaymentMethod {
  cardBrand: string;
  cardLastFour: string;
  holderName: string;
}

export type InvoiceStatus = 'pending' | 'paid' | 'failed' | 'no_usage';

export interface BillingInvoice {
  _id: string;
  organizationId: string;
  periodStart: string;
  periodEnd: string;
  sessionCount: number;
  amountCents: number;
  asaasPaymentId?: string;
  status: InvoiceStatus;
  errorMessage?: string;
  createdAt: string;
}

export interface SavePaymentMethodPayload {
  card: {
    holderName: string;
    number: string;
    expiryMonth: string;
    expiryYear: string;
    ccv: string;
  };
  holderInfo: {
    name: string;
    email: string;
    cpfCnpj: string;
    postalCode: string;
    addressNumber: string;
    phone: string;
  };
}
