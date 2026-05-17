export interface Bot {
  _id: string;
  name: string;
  description?: string;
  language: string;
  createdBy: string;
  isActive: boolean;
  settings: {
    confidenceThreshold: number;
    fallbackMessage: string;
    welcomeMessage: string;
    sessionTimeoutMinutes: number;
  };
  clientId?: string;
  clientSecret?: string;
  mainFlowId?: string;
  runtimeBaseUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBotDto {
  name: string;
  description?: string;
  language?: string;
}

export interface UpdateBotDto extends Partial<CreateBotDto> {
  isActive?: boolean;
  settings?: Partial<Bot['settings']>;
}
