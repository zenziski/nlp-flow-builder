import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';

export interface AsaasCustomer {
  id: string;
  name: string;
  email: string;
}

export interface AsaasCreditCardToken {
  creditCardToken: string;
  creditCardBrand: string;
  /** Last 4 digits */
  creditCardNumber: string;
}

export interface AsaasPayment {
  id: string;
  status: string;
  value: number;
  dueDate: string;
}

@Injectable()
export class AsaasService {
  private readonly http: AxiosInstance;
  private readonly logger = new Logger(AsaasService.name);

  constructor(private readonly configService: ConfigService) {
    const baseURL = configService.get<string>(
      'ASAAS_API_URL',
      'https://sandbox.asaas.com/api/v3',
    );
    const apiKey = configService.get<string>('ASAAS_API_KEY', '');

    this.http = axios.create({
      baseURL,
      headers: {
        access_token: apiKey,
        'Content-Type': 'application/json',
      },
    });
  }

  async createCustomer(data: {
    name: string;
    email: string;
    cpfCnpj: string;
  }): Promise<AsaasCustomer> {
    try {
      const response = await this.http.post<AsaasCustomer>('/customers', data);
      return response.data;
    } catch (err: any) {
      this.logger.error('ASAAS createCustomer failed', err?.response?.data);
      const description = err?.response?.data?.errors?.[0]?.description;
      throw new InternalServerErrorException(
        description ?? 'Failed to create billing customer',
      );
    }
  }

  async tokenizeCreditCard(data: {
    customer: string;
    creditCard: {
      holderName: string;
      number: string;
      expiryMonth: string;
      expiryYear: string;
      ccv: string;
    };
    creditCardHolderInfo: {
      name: string;
      email: string;
      cpfCnpj: string;
      postalCode: string;
      addressNumber: string;
      phone: string;
    };
    remoteIp: string;
  }): Promise<AsaasCreditCardToken> {
    try {
      const response = await this.http.post<AsaasCreditCardToken>(
        '/creditCard/tokenizeCreditCard',
        data,
      );
      return response.data;
    } catch (err: any) {
      this.logger.error('ASAAS tokenizeCreditCard failed', err?.response?.data);
      const description = err?.response?.data?.errors?.[0]?.description;
      throw new InternalServerErrorException(
        description ?? 'Failed to tokenize credit card',
      );
    }
  }

  async createPayment(data: {
    customer: string;
    billingType: 'CREDIT_CARD';
    value: number;
    dueDate: string;
    creditCardToken: string;
    description?: string;
  }): Promise<AsaasPayment> {
    try {
      const response = await this.http.post<AsaasPayment>('/payments', data);
      return response.data;
    } catch (err: any) {
      this.logger.error('ASAAS createPayment failed', err?.response?.data);
      const description = err?.response?.data?.errors?.[0]?.description;
      throw new InternalServerErrorException(
        description ?? 'Failed to create payment',
      );
    }
  }
}
