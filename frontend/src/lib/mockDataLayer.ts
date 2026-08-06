import { Transaction } from './types';
import { MOCK_BILLS, MOCK_GOALS } from './mockData';

// Generate transactions for the last 6 months
export function generateMockTransactions(): Transaction[] {
  const transactions: Transaction[] = [];
  const today = new Date();
  
  let idCounter = 1;

  for (let i = 0; i < 6; i++) {
    const month = new Date(today.getFullYear(), today.getMonth() - i, 15);
    
    // Base salary
    transactions.push({
      id: idCounter++,
      account_id: 1,
      amount: 85000,
      date: new Date(month.getFullYear(), month.getMonth(), 1).toISOString(),
      category: "Salary",
      status: "completed",
      is_flagged_fraud: false
    });

    // Rent
    transactions.push({
      id: idCounter++,
      account_id: 1,
      amount: -25000,
      date: new Date(month.getFullYear(), month.getMonth(), 5).toISOString(),
      category: "Rent",
      status: "completed",
      is_flagged_fraud: false
    });

    // Utilities
    transactions.push({
      id: idCounter++,
      account_id: 1,
      amount: -4500,
      date: new Date(month.getFullYear(), month.getMonth(), 10).toISOString(),
      category: "Utilities",
      status: "completed",
      is_flagged_fraud: false
    });

    // Subscriptions
    let netflixAmount = 649;
    if (i === 0) netflixAmount = 849; // Price hike this month

    transactions.push({
      id: idCounter++,
      account_id: 1,
      amount: -netflixAmount,
      date: new Date(month.getFullYear(), month.getMonth(), 12).toISOString(),
      category: "Subscriptions",
      status: "completed",
      is_flagged_fraud: false
    });

    // Dining - simulate spike in current month (i=0)
    const diningBase = 8000;
    const diningAmount = i === 0 ? diningBase * 1.5 : diningBase + (Math.random() * 1000 - 500);
    
    transactions.push({
      id: idCounter++,
      account_id: 1,
      amount: -Math.round(diningAmount),
      date: new Date(month.getFullYear(), month.getMonth(), 20).toISOString(),
      category: "Dining",
      status: "completed",
      is_flagged_fraud: false
    });

    // Groceries
    const groceriesBase = 12000;
    const groceriesAmount = groceriesBase + (Math.random() * 2000 - 1000);
    transactions.push({
      id: idCounter++,
      account_id: 1,
      amount: -Math.round(groceriesAmount),
      date: new Date(month.getFullYear(), month.getMonth(), 15).toISOString(),
      category: "Groceries",
      status: "completed",
      is_flagged_fraud: false
    });
    
    // Shopping
    transactions.push({
      id: idCounter++,
      account_id: 1,
      amount: -Math.round(3000 + Math.random() * 2000),
      date: new Date(month.getFullYear(), month.getMonth(), 25).toISOString(),
      category: "Shopping",
      status: "completed",
      is_flagged_fraud: false
    });
  }

  // Sort by date descending
  return transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getMockDataLayer() {
  return {
    transactions: generateMockTransactions(),
    bills: MOCK_BILLS,
    goals: MOCK_GOALS
  };
}
