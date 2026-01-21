/**
 * CONTROLO FINANCEIRO - Data Management Module
 * Handles transactions, categories, and localStorage persistence
 */

const DataManager = (function () {
    // Storage keys
    const STORAGE_KEYS = {
        TRANSACTIONS: 'cf_transactions',
        CATEGORIES: 'cf_categories',
        THEME: 'cf_theme',
        BUDGETS: 'cf_budgets',
        WALLETS: 'cf_wallets',
        ACTIVE_WALLET: 'cf_active_wallet',
        SETTINGS: 'cf_settings'
    };

    // Default wallets
    const DEFAULT_WALLETS = [
        { id: 'main', name: 'Carteira Principal', icon: '💰', color: '#00d4ff' }
    ];

    // Exchange rate CVE to EUR
    const CVE_EUR_RATE = 110.265;

    // Default categories
    const DEFAULT_CATEGORIES = {
        income: [
            'Salário',
            'Freelance',
            'Investimentos',
            'Rendimentos',
            'Vendas',
            'Presentes',
            'Reembolsos',
            'Outros'
        ],
        expense: [
            'Alimentação',
            'Transporte',
            'Moradia',
            'Água/Luz/Gás',
            'Internet/Telefone',
            'Saúde',
            'Educação',
            'Lazer',
            'Vestuário',
            'Supermercado',
            'Restaurantes',
            'Assinaturas',
            'Seguros',
            'Impostos',
            'Manutenção',
            'Viagens',
            'Presentes',
            'Outros'
        ]
    };

    // Category colors for charts
    const CATEGORY_COLORS = [
        '#00d4ff', '#0ea5e9', '#8b5cf6', '#ec4899', '#f59e0b',
        '#22c55e', '#14b8a6', '#6366f1', '#f43f5e', '#84cc16',
        '#06b6d4', '#a855f7', '#d946ef', '#f97316', '#10b981',
        '#3b82f6', '#ef4444', '#eab308'
    ];

    // Generate unique ID
    function generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // Load data from localStorage
    function loadData(key, defaultValue) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : defaultValue;
        } catch (error) {
            console.error(`Error loading ${key}:`, error);
            return defaultValue;
        }
    }

    // Save data to localStorage
    function saveData(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error(`Error saving ${key}:`, error);
            return false;
        }
    }

    // Initialize categories if not exists
    function initializeCategories() {
        let categories = loadData(STORAGE_KEYS.CATEGORIES, null);
        if (!categories) {
            categories = {
                income: [...DEFAULT_CATEGORIES.income],
                expense: [...DEFAULT_CATEGORIES.expense]
            };
            saveData(STORAGE_KEYS.CATEGORIES, categories);
        }
        return categories;
    }

    // Public API
    return {
        // Transactions
        getTransactions() {
            return loadData(STORAGE_KEYS.TRANSACTIONS, []);
        },

        getTransactionById(id) {
            const transactions = this.getTransactions();
            return transactions.find(t => t.id === id);
        },

        addTransaction(transaction) {
            const transactions = this.getTransactions();
            const newTransaction = {
                id: generateId(),
                ...transaction,
                createdAt: new Date().toISOString()
            };
            transactions.push(newTransaction);
            saveData(STORAGE_KEYS.TRANSACTIONS, transactions);
            return newTransaction;
        },

        updateTransaction(id, updates) {
            const transactions = this.getTransactions();
            const index = transactions.findIndex(t => t.id === id);
            if (index !== -1) {
                transactions[index] = {
                    ...transactions[index],
                    ...updates,
                    updatedAt: new Date().toISOString()
                };
                saveData(STORAGE_KEYS.TRANSACTIONS, transactions);
                return transactions[index];
            }
            return null;
        },

        deleteTransaction(id) {
            const transactions = this.getTransactions();
            const filtered = transactions.filter(t => t.id !== id);
            saveData(STORAGE_KEYS.TRANSACTIONS, filtered);
            return filtered.length < transactions.length;
        },

        getMonthlyTransactions(month, year) {
            const transactions = this.getTransactions();
            return transactions.filter(t => {
                const date = new Date(t.date);
                return date.getMonth() === month && date.getFullYear() === year;
            });
        },

        getMonthlyTotals(month, year) {
            const transactions = this.getMonthlyTransactions(month, year);
            const totals = { income: 0, expense: 0 };

            transactions.forEach(t => {
                if (t.type === 'income') {
                    totals.income += parseFloat(t.amount);
                } else {
                    totals.expense += parseFloat(t.amount);
                }
            });

            totals.balance = totals.income - totals.expense;
            return totals;
        },

        getCategorySummary(type, month, year) {
            const transactions = this.getMonthlyTransactions(month, year);
            const filtered = transactions.filter(t => t.type === type);
            const summary = {};

            filtered.forEach(t => {
                if (!summary[t.category]) {
                    summary[t.category] = 0;
                }
                summary[t.category] += parseFloat(t.amount);
            });

            // Convert to array and sort by amount
            const result = Object.entries(summary)
                .map(([category, total]) => ({ category, total }))
                .sort((a, b) => b.total - a.total);

            return result;
        },

        getLast6MonthsData() {
            const data = [];
            const now = new Date();

            for (let i = 5; i >= 0; i--) {
                const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
                const month = date.getMonth();
                const year = date.getFullYear();
                const totals = this.getMonthlyTotals(month, year);

                data.push({
                    month: date.toLocaleDateString('pt-BR', { month: 'short' }),
                    year: year,
                    income: totals.income,
                    expense: totals.expense
                });
            }

            return data;
        },

        // Monthly Comparison (vs previous month)
        getMonthlyComparison(month, year) {
            const current = this.getMonthlyTotals(month, year);

            // Get previous month
            let prevMonth = month - 1;
            let prevYear = year;
            if (prevMonth < 0) {
                prevMonth = 11;
                prevYear--;
            }
            const previous = this.getMonthlyTotals(prevMonth, prevYear);

            const calcChange = (curr, prev) => {
                if (prev === 0) return curr > 0 ? 100 : 0;
                return ((curr - prev) / prev) * 100;
            };

            return {
                income: {
                    current: current.income,
                    previous: previous.income,
                    change: calcChange(current.income, previous.income),
                    trend: current.income >= previous.income ? 'up' : 'down'
                },
                expense: {
                    current: current.expense,
                    previous: previous.expense,
                    change: calcChange(current.expense, previous.expense),
                    trend: current.expense <= previous.expense ? 'up' : 'down' // Less expense = good
                },
                balance: {
                    current: current.balance,
                    previous: previous.balance,
                    change: calcChange(current.balance, previous.balance),
                    trend: current.balance >= previous.balance ? 'up' : 'down'
                }
            };
        },

        // Top expense of the month
        getTopExpense(month, year) {
            const transactions = this.getMonthlyTransactions(month, year);
            const expenses = transactions.filter(t => t.type === 'expense');

            if (expenses.length === 0) return null;

            const top = expenses.reduce((max, t) =>
                parseFloat(t.amount) > parseFloat(max.amount) ? t : max
            );

            return {
                category: top.category,
                amount: parseFloat(top.amount),
                note: top.note || '',
                date: top.date
            };
        },

        // Recurring transactions
        getRecurringTransactions() {
            const transactions = this.getTransactions();
            return transactions.filter(t => t.isRecurring);
        },

        processRecurringTransactions() {
            const recurring = this.getRecurringTransactions();
            const today = new Date();
            const createdTransactions = [];

            recurring.forEach(t => {
                if (!t.lastProcessed) return;

                const lastDate = new Date(t.lastProcessed);
                let shouldCreate = false;
                let newDate = new Date(lastDate);

                switch (t.frequency) {
                    case 'daily':
                        newDate.setDate(newDate.getDate() + 1);
                        shouldCreate = newDate <= today;
                        break;
                    case 'weekly':
                        newDate.setDate(newDate.getDate() + 7);
                        shouldCreate = newDate <= today;
                        break;
                    case 'biweekly':
                        newDate.setDate(newDate.getDate() + 14);
                        shouldCreate = newDate <= today;
                        break;
                    case 'monthly':
                        newDate.setMonth(newDate.getMonth() + 1);
                        shouldCreate = newDate <= today;
                        break;
                }

                if (shouldCreate) {
                    // Create the new transaction
                    const newTransaction = this.addTransaction({
                        type: t.type,
                        amount: t.amount,
                        category: t.category,
                        date: newDate.toISOString().split('T')[0],
                        note: t.note ? `${t.note} (Recorrente)` : 'Transação Recorrente',
                        isRecurring: false,
                        sourceRecurringId: t.id
                    });

                    // Update the lastProcessed date of the recurring template
                    this.updateTransaction(t.id, {
                        lastProcessed: newDate.toISOString().split('T')[0]
                    });

                    createdTransactions.push(newTransaction);
                }
            });

            return createdTransactions;
        },

        // Categories
        getCategories() {
            return initializeCategories();
        },

        addCategory(type, categoryName) {
            const categories = this.getCategories();
            const name = categoryName.trim();

            if (!name) return false;
            if (categories[type].includes(name)) return false;

            categories[type].push(name);
            saveData(STORAGE_KEYS.CATEGORIES, categories);
            return true;
        },

        removeCategory(type, categoryName) {
            const categories = this.getCategories();
            const index = categories[type].indexOf(categoryName);

            // Don't remove if it's a default category
            if (DEFAULT_CATEGORIES[type].includes(categoryName)) {
                return false;
            }

            if (index !== -1) {
                categories[type].splice(index, 1);
                saveData(STORAGE_KEYS.CATEGORIES, categories);
                return true;
            }
            return false;
        },

        isDefaultCategory(type, categoryName) {
            return DEFAULT_CATEGORIES[type].includes(categoryName);
        },

        getCategoryColor(index) {
            return CATEGORY_COLORS[index % CATEGORY_COLORS.length];
        },

        // Budgets (Metas)
        getBudgets() {
            return loadData(STORAGE_KEYS.BUDGETS, {});
        },

        setBudget(category, amount) {
            const budgets = this.getBudgets();
            if (amount > 0) {
                budgets[category] = parseFloat(amount);
            } else {
                delete budgets[category];
            }
            saveData(STORAGE_KEYS.BUDGETS, budgets);
            return budgets;
        },

        removeBudget(category) {
            const budgets = this.getBudgets();
            delete budgets[category];
            saveData(STORAGE_KEYS.BUDGETS, budgets);
            return budgets;
        },

        getBudgetProgress(month, year) {
            const budgets = this.getBudgets();
            const expenses = this.getCategorySummary('expense', month, year);
            const progress = [];

            // Get all expense categories
            const categories = this.getCategories().expense;

            categories.forEach(category => {
                const budget = budgets[category] || 0;
                const expenseItem = expenses.find(e => e.category === category);
                const spent = expenseItem ? expenseItem.total : 0;

                if (budget > 0) {
                    const percentage = (spent / budget) * 100;
                    let status = 'ok'; // green
                    if (percentage >= 100) {
                        status = 'exceeded'; // red
                    } else if (percentage >= 80) {
                        status = 'warning'; // yellow
                    }

                    progress.push({
                        category,
                        budget,
                        spent,
                        percentage: Math.min(percentage, 100),
                        remaining: Math.max(budget - spent, 0),
                        status
                    });
                }
            });

            // Sort by percentage (highest first)
            return progress.sort((a, b) => b.percentage - a.percentage);
        },

        // Export/Import
        exportToCSV() {
            const transactions = this.getTransactions();
            if (transactions.length === 0) {
                return null;
            }

            // CSV Header
            const headers = ['Data', 'Tipo', 'Categoria', 'Valor', 'Nota'];
            const rows = [headers.join(';')];

            // CSV Rows
            transactions
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .forEach(t => {
                    const row = [
                        this.formatDate(t.date),
                        t.type === 'income' ? 'Receita' : 'Despesa',
                        t.category,
                        t.amount.toString().replace('.', ','),
                        (t.note || '').replace(/;/g, ',')
                    ];
                    rows.push(row.join(';'));
                });

            const csvContent = rows.join('\n');
            const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = url;
            link.download = `controlo-financeiro-${new Date().toISOString().slice(0, 10)}.csv`;
            link.click();

            URL.revokeObjectURL(url);
            return true;
        },

        exportBackup() {
            const backup = {
                version: '1.0',
                exportDate: new Date().toISOString(),
                transactions: this.getTransactions(),
                categories: this.getCategories(),
                budgets: this.getBudgets(),
                theme: this.getTheme()
            };

            const jsonContent = JSON.stringify(backup, null, 2);
            const blob = new Blob([jsonContent], { type: 'application/json' });
            const url = URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = url;
            link.download = `controlo-financeiro-backup-${new Date().toISOString().slice(0, 10)}.json`;
            link.click();

            URL.revokeObjectURL(url);
            return true;
        },

        importBackup(jsonString) {
            try {
                const backup = JSON.parse(jsonString);

                // Validate backup structure
                if (!backup.transactions || !Array.isArray(backup.transactions)) {
                    throw new Error('Formato de backup inválido');
                }

                // Import data
                saveData(STORAGE_KEYS.TRANSACTIONS, backup.transactions);

                if (backup.categories) {
                    saveData(STORAGE_KEYS.CATEGORIES, backup.categories);
                }

                if (backup.budgets) {
                    saveData(STORAGE_KEYS.BUDGETS, backup.budgets);
                }

                return {
                    success: true,
                    transactionsCount: backup.transactions.length,
                    exportDate: backup.exportDate
                };
            } catch (error) {
                console.error('Import error:', error);
                return {
                    success: false,
                    error: error.message
                };
            }
        },

        // Theme
        getTheme() {
            return loadData(STORAGE_KEYS.THEME, 'light');
        },

        setTheme(theme) {
            saveData(STORAGE_KEYS.THEME, theme);
        },

        // Utility
        formatCurrency(amount) {
            return new Intl.NumberFormat('pt-CV', {
                style: 'decimal',
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }).format(amount) + ' $';
        },

        formatDate(dateString) {
            const date = new Date(dateString);
            return date.toLocaleDateString('pt-PT', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
        },

        getMonthName(month, year) {
            const date = new Date(year, month, 1);
            return date.toLocaleDateString('pt-PT', {
                month: 'long',
                year: 'numeric'
            }).replace(/^\w/, c => c.toUpperCase());
        },

        // --- Prediction & Intelligence ---

        /**
         * Calculates the projected expense for the current month based on daily average
         */
        getSpendingProjection() {
            const today = new Date();
            const currentDay = today.getDate();
            const totalDays = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();

            // Get expenses so far
            const totals = this.getMonthlyTotals(today.getMonth(), today.getFullYear());
            const currentExpense = totals.expense;

            // If it's day 1 or no expenses, projection is current expense
            if (currentDay <= 1 || currentExpense === 0) return currentExpense;

            // Simple projection: (Current / Days_Passed) * Total_Days
            const dailyAverage = currentExpense / currentDay;
            return dailyAverage * totalDays;
        },

        /**
         * Calculates average monthly expense over the last N months
         */
        getHistoricalAverage(months = 3) {
            let totalExpense = 0;
            let count = 0;
            const today = new Date();

            for (let i = 1; i <= months; i++) {
                // Determine past month/year
                let targetMonth = today.getMonth() - i;
                let targetYear = today.getFullYear();

                if (targetMonth < 0) {
                    targetMonth += 12;
                    targetYear--;
                }

                const totals = this.getMonthlyTotals(targetMonth, targetYear);

                // Only count months with activity to avoid skewing average with zero-months
                if (totals.expense > 0) {
                    totalExpense += totals.expense;
                    count++;
                }
            }

            return count === 0 ? 0 : totalExpense / count;
        },

        // Wallets Management
        getWallets() {
            const wallets = loadData(STORAGE_KEYS.WALLETS, null);
            if (!wallets || wallets.length === 0) {
                saveData(STORAGE_KEYS.WALLETS, DEFAULT_WALLETS);
                return DEFAULT_WALLETS;
            }
            return wallets;
        },

        getActiveWallet() {
            const activeId = loadData(STORAGE_KEYS.ACTIVE_WALLET, 'main');
            const wallets = this.getWallets();
            return wallets.find(w => w.id === activeId) || wallets[0];
        },

        setActiveWallet(walletId) {
            saveData(STORAGE_KEYS.ACTIVE_WALLET, walletId);
        },

        addWallet(wallet) {
            const wallets = this.getWallets();
            const newWallet = {
                id: generateId(),
                name: wallet.name,
                icon: wallet.icon || '💳',
                color: wallet.color || '#00d4ff',
                createdAt: new Date().toISOString()
            };
            wallets.push(newWallet);
            saveData(STORAGE_KEYS.WALLETS, wallets);
            return newWallet;
        },

        updateWallet(walletId, updates) {
            const wallets = this.getWallets();
            const index = wallets.findIndex(w => w.id === walletId);
            if (index !== -1) {
                wallets[index] = { ...wallets[index], ...updates };
                saveData(STORAGE_KEYS.WALLETS, wallets);
                return wallets[index];
            }
            return null;
        },

        deleteWallet(walletId) {
            if (walletId === 'main') return false; // Can't delete main wallet
            const wallets = this.getWallets();
            const filtered = wallets.filter(w => w.id !== walletId);
            if (filtered.length < wallets.length) {
                saveData(STORAGE_KEYS.WALLETS, filtered);
                // If deleted wallet was active, switch to main
                if (loadData(STORAGE_KEYS.ACTIVE_WALLET, 'main') === walletId) {
                    this.setActiveWallet('main');
                }
                return true;
            }
            return false;
        },

        getWalletBalance(walletId) {
            const transactions = this.getTransactions().filter(t =>
                !t.walletId || t.walletId === walletId
            );
            let income = 0, expense = 0;
            transactions.forEach(t => {
                if (t.type === 'income') income += parseFloat(t.amount);
                else expense += parseFloat(t.amount);
            });
            return { income, expense, balance: income - expense };
        },

        // Transfer between wallets
        transferBetweenWallets(fromWalletId, toWalletId, amount, note = '') {
            const fromWallet = this.getWallets().find(w => w.id === fromWalletId);
            const toWallet = this.getWallets().find(w => w.id === toWalletId);

            if (!fromWallet || !toWallet || amount <= 0) return null;

            // Create expense from source wallet
            const expenseTransaction = this.addTransaction({
                type: 'expense',
                amount: amount,
                category: 'Transferência',
                date: new Date().toISOString().split('T')[0],
                note: `Transferência para ${toWallet.name}${note ? ': ' + note : ''}`,
                walletId: fromWalletId,
                isTransfer: true
            });

            // Create income for destination wallet
            const incomeTransaction = this.addTransaction({
                type: 'income',
                amount: amount,
                category: 'Transferência',
                date: new Date().toISOString().split('T')[0],
                note: `Transferência de ${fromWallet.name}${note ? ': ' + note : ''}`,
                walletId: toWalletId,
                isTransfer: true
            });

            return { expense: expenseTransaction, income: incomeTransaction };
        },

        // Currency Conversion
        convertCVEtoEUR(amountCVE) {
            return amountCVE / CVE_EUR_RATE;
        },

        convertEURtoCVE(amountEUR) {
            return amountEUR * CVE_EUR_RATE;
        },

        formatCurrencyEUR(amount) {
            return new Intl.NumberFormat('pt-PT', {
                style: 'currency',
                currency: 'EUR'
            }).format(amount);
        },

        getExchangeRate() {
            return CVE_EUR_RATE;
        }
    };
})();

// Export for use in other modules
window.DataManager = DataManager;
