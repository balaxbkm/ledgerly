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

export type LoanTransactionType = "payment" | "lending" | "interest";

export interface LoanTransaction {
  id: string;
  date: string;
  amount: number;
  type: LoanTransactionType;
  note?: string;
}

export interface Loan {
  id: string;
  personName: string;
  amount: number; // Principal Amount
  loanType: LoanType;
  emiAmount?: number;
  interestRate?: number;
  repaymentType?: "one-time" | "emi";
  tenureMonths?: number;
  paidAmount?: number; // Total amount paid back
  history?: LoanTransaction[];
  startDate: string; // ISO date string
  dueDate?: string; // ISO date string
  status: LoanStatus;
}

export type Theme = "light" | "dark";

export interface Settings {
  pinHash: string;
  theme: Theme;
}
