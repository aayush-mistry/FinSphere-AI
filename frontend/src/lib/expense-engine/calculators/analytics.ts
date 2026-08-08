import { Expense, CategoryComparison, ExpenseCategoryGroup, ExpenseFixedVariable } from '../types';

export const generateCategoryAnalytics = (
  currentExpenses: Expense[], 
  previousExpenses: Expense[]
): CategoryComparison[] => {
  const currentTotal = currentExpenses.reduce((sum, e) => sum + Math.abs(e.amount), 0);
  
  // Group current expenses by category name
  const currentByCategory = new Map<string, Expense[]>();
  for (const e of currentExpenses) {
    const cat = e.expenseCategory.name;
    if (!currentByCategory.has(cat)) currentByCategory.set(cat, []);
    currentByCategory.get(cat)!.push(e);
  }

  // Group previous expenses by category name
  const previousByCategory = new Map<string, number>();
  for (const e of previousExpenses) {
    const cat = e.expenseCategory.name;
    previousByCategory.set(cat, (previousByCategory.get(cat) || 0) + Math.abs(e.amount));
  }

  const analytics: CategoryComparison[] = [];

  for (const [categoryName, expenses] of currentByCategory.entries()) {
    const categoryTotalAmount = expenses.reduce((sum, e) => sum + Math.abs(e.amount), 0);
    const percentageOfTotal = currentTotal > 0 ? (categoryTotalAmount / currentTotal) * 100 : 0;
    const previousPeriodAmount = previousByCategory.get(categoryName) || 0;
    
    let percentageChange = 0;
    if (previousPeriodAmount > 0) {
      percentageChange = ((categoryTotalAmount - previousPeriodAmount) / previousPeriodAmount) * 100;
    } else if (categoryTotalAmount > 0) {
      percentageChange = 100; // Infinity in math, but 100% for display
    }

    let trend: 'UP' | 'DOWN' | 'FLAT' = 'FLAT';
    if (percentageChange > 1) trend = 'UP';
    else if (percentageChange < -1) trend = 'DOWN';

    // Assume all expenses in this group have same group and type
    const firstExpense = expenses[0];

    analytics.push({
      category: categoryName,
      group: firstExpense.expenseCategory.group,
      type: firstExpense.expenseCategory.type,
      totalAmount: categoryTotalAmount,
      percentageOfTotal,
      transactionCount: expenses.length,
      averageTransactionAmount: expenses.length > 0 ? categoryTotalAmount / expenses.length : 0,
      previousPeriodAmount,
      percentageChange,
      trend
    });
  }

  // Add categories that existed in previous period but not current
  for (const [categoryName, amount] of previousByCategory.entries()) {
    if (!currentByCategory.has(categoryName)) {
      // Find a matching expense in previous to get the group/type
      const prevExp = previousExpenses.find(e => e.expenseCategory.name === categoryName);
      if (prevExp) {
        analytics.push({
          category: categoryName,
          group: prevExp.expenseCategory.group,
          type: prevExp.expenseCategory.type,
          totalAmount: 0,
          percentageOfTotal: 0,
          transactionCount: 0,
          averageTransactionAmount: 0,
          previousPeriodAmount: amount,
          percentageChange: -100,
          trend: 'DOWN'
        });
      }
    }
  }

  // Sort by total amount descending
  return analytics.sort((a, b) => b.totalAmount - a.totalAmount);
};
