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
export type LoanStatus = "pending" | "paid" | "overdue" | "closed" | "written-off";

export interface Loan {
  id: string;
  personName: string;
  amount: number;
  loanType: LoanType;
  emiAmount?: number;
  interestRate?: number;
  repaymentType?: "one-time" | "emi";
  tenureMonths?: number;
  startDate: string; // ISO date string
  dueDate?: string; // ISO date string
  lastInterestAppliedDate?: string; // ISO date string for tracking monthly interest
  fixedInterestAmount?: number; // Fixed interest amount added upfront for one-time loans
  lastEmiPaymentDate?: string; // ISO date string to track if EMI is paid for current month
  partPaymentCount?: number; // Track number of partial payments made
  status: LoanStatus;
  undoData?: {
    timestamp: string;
    previousStatus: LoanStatus;
    previousAmount: number;
    actionType: "status_change" | "payment" | "write_off";
  };
  history?: {
    id: string;
    action: "payment" | "status_change" | "creation" | "edit" | "undo";
    date: string;
    description: string;
    amount?: number;
  }[];
  notes?: string;
}

export type Theme = "light" | "dark";

export interface Settings {
  pinHash: string;
  theme: Theme;
}
