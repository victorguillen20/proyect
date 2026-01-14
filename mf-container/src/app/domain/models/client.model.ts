export interface Client {
  clientId?: number;
  name: string;
  gender: string;
  age: number;
  identification: string;
  address: string;
  phone: string;
  password?: string;
  status: boolean;
}
