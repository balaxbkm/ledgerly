import { Expense, Loan } from "../types";

export const SAMPLE_LOANS: Omit<Loan, "id">[] = [
    {
        loanType: "lent",
        personName: "Rahul",
        amount: 5000,
        startDate: new Date(new Date().setDate(new Date().getDate() - 10)).toISOString(),
        dueDate: new Date(new Date().setDate(new Date().getDate() + 20)).toISOString(), // Due in 20 days
        status: "pending",
        interestRate: 2,
    },
    {
        loanType: "borrowed",
        personName: "HDFC Bank",
        amount: 50000,
        startDate: new Date(new Date().setDate(new Date().getDate() - 60)).toISOString(),
        dueDate: new Date(new Date().setDate(new Date().getDate() + 300)).toISOString(),
        status: "pending",
    },
    {
        loanType: "lent",
        personName: "Priya",
        amount: 2000,
        startDate: new Date(new Date().setDate(new Date().getDate() - 5)).toISOString(),
        status: "paid",
        interestRate: 0,
    },
    {
        loanType: "borrowed",
        personName: "Amit",
        amount: 1000,
        startDate: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString(),
        dueDate: new Date(new Date().setDate(new Date().getDate() + 5)).toISOString(),
        status: "pending",
    },
    {
        loanType: "lent",
        personName: "Karthik",
        amount: 10000,
        startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString(),
        dueDate: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString(), // Overdue by 1 day
        status: "pending",
        interestRate: 5,
    }
];

export const SAMPLE_EXPENSES: Omit<Expense, "id">[] = [
    {
        amount: 1500,
        category: "Food",
        date: new Date().toISOString(),
        paymentMethod: "UPI",
        notes: "Grocery shopping",
    },
    {
        amount: 2500,
        category: "Fuel",
        date: new Date().toISOString(),
        paymentMethod: "Card",
        notes: "Petrol for car",
    },
    {
        amount: 12000,
        category: "Rent",
        date: new Date(new Date().setDate(1)).toISOString(), // 1st of current month
        paymentMethod: "UPI",
        notes: "Apartment Rent",
    },
    {
        amount: 800,
        category: "Entertainment",
        date: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString(), // Yesterday
        paymentMethod: "Cash",
        notes: "Movie night",
    },
    {
        amount: 350,
        category: "Food",
        date: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString(), // Yesterday
        paymentMethod: "UPI",
        notes: "Lunch",
    },
    {
        amount: 5000,
        category: "Shopping",
        date: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString(),
        paymentMethod: "Card",
        notes: "New clothes",
    },
    {
        amount: 200,
        category: "Medical",
        date: new Date(new Date().setDate(new Date().getDate() - 3)).toISOString(),
        paymentMethod: "Cash",
        notes: "Medicines",
    },
    {
        amount: 1500,
        category: "Bills",
        date: new Date(new Date().setDate(new Date().getDate() - 5)).toISOString(),
        paymentMethod: "UPI",
        notes: "Electricity Bill",
    },
    {
        amount: 10000,
        category: "Investment",
        date: new Date(new Date().setDate(new Date().getDate() - 10)).toISOString(),
        paymentMethod: "UPI",
        notes: "SIP",
    },
    {
        amount: 15000,
        category: "Education",
        date: new Date(new Date().setDate(new Date().getDate() - 15)).toISOString(),
        paymentMethod: "UPI",
        notes: "Course Fee",
    },
    {
        amount: 1999,
        category: "Shopping",
        date: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString(),
        paymentMethod: "Card",
        notes: "Headphones",
    },
    {
        amount: 450,
        category: "Food",
        date: new Date().toISOString(),
        paymentMethod: "UPI",
        notes: "Dinner with friends",
    },
    {
        amount: 5000,
        category: "EMI",
        date: new Date(new Date().setDate(5)).toISOString(),
        paymentMethod: "Card",
        notes: "Phone EMI",
    },
    {
        amount: 120,
        category: "Stationery",
        date: new Date().toISOString(),
        paymentMethod: "Cash",
        notes: "Stationery",
    }
];
