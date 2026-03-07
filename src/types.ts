export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  date: string;
  type: TransactionType;
  category: string;
}

export interface UserProfile {
  name: string;
  avatarUrl: string;
}

export interface FinancialStatus {
  label: string;
  color: string;
  bgColor: string;
  icon: string;
}
