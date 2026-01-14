export interface Account {
  accountNumber?: number;
  accountType: string;
  initialBalance: number;
  status: boolean;
  client?: any;
  clientId?: number;
  clientIdentification?: string;
}

