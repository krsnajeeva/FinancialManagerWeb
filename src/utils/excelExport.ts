import * as XLSX from 'xlsx';
import dayjs from 'dayjs';

interface StatisticsExportData {
  transactions: Array<{
    date: string;
    category: string;
    description: string;
    amount: number;
    type: 'income' | 'expense';
  }>;
  filters: {
    period: string;
    dateScope: string;
    transactionType: string;
  };
  summary: {
    totalIncome: number;
    totalExpense: number;
    netBalance: number;
  };
}

interface BudgetExportData {
  budgetSummary: {
    monthYear: string;
    totalIncome: number;
    totalExpenses: number;
    balance: number;
    monthlyBudget: number;
    budgetUsed: number;
    budgetRemaining: number;
    budgetPercentage: number;
  };
  categoryBudgets: Array<{
    category: string;
    budgetAmount: number;
    spent: number;
    remaining: number;
    percentage: number;
  }>;
}

const s2ab = (s: string) => {
  const buf = new ArrayBuffer(s.length);
  const view = new Uint8Array(buf);
  for (let i = 0; i !== s.length; ++i) view[i] = s.charCodeAt(i) & 0xff;
  return buf;
};

const triggerDownload = (wb: XLSX.WorkBook, fileName: string) => {
  const wbout = XLSX.write(wb, { type: 'binary', bookType: 'xlsx' });
  const blob = new Blob([s2ab(wbout)], { type: 'application/octet-stream' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.click();
  window.URL.revokeObjectURL(url);
};

export const excelExportService = {
  exportStatistics: async (data: StatisticsExportData) => {
    try {
      const { transactions, filters, summary } = data;
      const wb = XLSX.utils.book_new();
      const rows: any[][] = [];

      rows.push(['FINANCIAL MANAGER - STATISTICS EXPORT']);
      rows.push([]);

      rows.push(['FILTER DETAILS', '', '', 'FINANCIAL SUMMARY']);
      rows.push(['Export Date', dayjs().format('YYYY-MM-DD HH:mm:ss'), '', 'Total Income', summary.totalIncome]);
      rows.push(['Filter Period', filters.period, '', 'Total Expense', summary.totalExpense]);
      rows.push(['Date Scope', filters.dateScope, '', 'Net Balance', summary.netBalance]);
      rows.push(['Filter Type', filters.transactionType, '', '', '']);
      rows.push([]);

      if (filters.transactionType === 'All') {
        rows.push(['Date', 'Category', 'Description', 'Income Amount (₹)', 'Expense Amount (₹)']);
      } else if (filters.transactionType === 'Income') {
        rows.push(['Date', 'Category', 'Description', 'Income Amount (₹)']);
      } else {
        rows.push(['Date', 'Category', 'Description', 'Expense Amount (₹)']);
      }

      transactions.forEach((tx) => {
        const formattedDate = dayjs(tx.date).format('YYYY-MM-DD');
        const desc = tx.description || tx.category;
        
        if (filters.transactionType === 'All') {
          const incAmt = tx.type === 'income' ? tx.amount : 0;
          const expAmt = tx.type === 'expense' ? tx.amount : 0;
          rows.push([formattedDate, tx.category, desc, incAmt, expAmt]);
        } else {
          rows.push([formattedDate, tx.category, desc, tx.amount]);
        }
      });

      const ws = XLSX.utils.aoa_to_sheet(rows);
      const colWidths = [
        { wch: 15 },
        { wch: 20 },
        { wch: 28 },
        { wch: 18 },
        { wch: 18 },
      ];
      ws['!cols'] = colWidths;

      XLSX.utils.book_append_sheet(wb, ws, 'Statistics');

      const fileName = `FinancialManager_Stats_${dayjs().format('YYYYMMDD_HHmmss')}.xlsx`;
      triggerDownload(wb, fileName);
    } catch (error) {
      console.error('Error exporting statistics to Excel:', error);
    }
  },

  exportBudget: async (data: BudgetExportData) => {
    try {
      const { budgetSummary, categoryBudgets } = data;
      const wb = XLSX.utils.book_new();
      const rows: any[][] = [];

      rows.push([`FINANCIAL MANAGER - BUDGET SUMMARY (${budgetSummary.monthYear})`]);
      rows.push([]);

      rows.push(['MONTHLY SUMMARY', '', '', 'BUDGET TRACKING']);
      rows.push(['Month/Year', budgetSummary.monthYear, '', 'Monthly Budget Limit', budgetSummary.monthlyBudget]);
      rows.push(['Total Income', budgetSummary.totalIncome, '', 'Total Budget Spent', budgetSummary.budgetUsed]);
      rows.push(['Total Expenses', budgetSummary.totalExpenses, '', 'Total Budget Left', budgetSummary.budgetRemaining]);
      rows.push(['Net Balance', budgetSummary.balance, '', 'Overall Budget Used %', `${budgetSummary.budgetPercentage}%`]);
      rows.push([]);

      rows.push(['Category', 'Budget Limit (₹)', 'Spent (₹)', 'Remaining (₹)', 'Usage Percentage (%)']);

      categoryBudgets.forEach((cat) => {
        rows.push([
          cat.category,
          cat.budgetAmount,
          cat.spent,
          cat.remaining,
          `${cat.percentage}%`
        ]);
      });

      const ws = XLSX.utils.aoa_to_sheet(rows);
      const colWidths = [
        { wch: 20 },
        { wch: 18 },
        { wch: 15 },
        { wch: 15 },
        { wch: 22 },
      ];
      ws['!cols'] = colWidths;

      XLSX.utils.book_append_sheet(wb, ws, 'Budget Summary');

      const fileName = `FinancialManager_Budget_${dayjs().format('YYYYMMDD_HHmmss')}.xlsx`;
      triggerDownload(wb, fileName);
    } catch (error) {
      console.error('Error exporting budget to Excel:', error);
    }
  },
};
