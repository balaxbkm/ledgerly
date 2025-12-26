export type PaymentMethod = "Cash" | "Card" | "UPI";

export type ExpenseCategory = string;

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
  isDefault?: boolean;
}

export interface Expense {
  id: string;
  amount: number;
  category: ExpenseCategory;
  paymentMethod: PaymentMethod;
  date: string; // ISO date string
  notes?: string;
}

export type LoanType = "borrowed" | "lent";
export type LoanStatus = "pending" | "paid" | "overdue" | "closed";

export interface Loan {
  id: string;
  personName: string;
  amount: number;
  loanType: LoanType;
  emiAmount?: number;
  interestRate?: number;
  startDate: string; // ISO date string
  dueDate?: string; // ISO date string
  status: LoanStatus;
}

export type Theme = "light" | "dark";

export interface Settings {
  pinHash: string;
  theme: Theme;
}
