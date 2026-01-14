export interface Movement {
  movementId?: number;
  date?: string;
  movementType: string;
  value: number;
  balance?: number;
  movementDetail?: string;
  account?: any;
  accountId?: number;
}
