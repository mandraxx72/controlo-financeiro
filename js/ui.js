/**
 * CONTROLO FINANCEIRO - UI Module
 * Handles DOM manipulation, events, and user interactions
 */

const Utils = {
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
};

const UIManager = (function () {
    // DOM Elements cache
    let elements = {};

    // Current state
    let currentMonth = new Date().getMonth();
    let currentYear = new Date().getFullYear();
    let editingTransactionId = null;
    let deleteTargetId = null;

    // Initialize DOM elements cache
    function cacheElements() {
        elements = {
            // Sidebar
            sidebar: document.getElementById('sidebar'),
            sidebarToggle: document.getElementById('sidebarToggle'),
            sidebarOverlay: document.getElementById('sidebarOverlay'),
            navItems: document.querySelectorAll('.nav-item'),

            // Mobile
            mobileHeader: document.getElementById('mobileHeader'),
            menuBtn: document.getElementById('menuBtn'),

            // Theme
            themeToggle: document.getElementById('themeToggle'),
            themeToggleMobile: document.getElementById('themeToggleMobile'),

            // Sections
            dashboardSection: document.getElementById('dashboardSection'),
            transactionsSection: document.getElementById('transactionsSection'),
            categoriesSection: document.getElementById('categoriesSection'),
            budgetsSection: document.getElementById('budgetsSection'),

            // Month selector
            prevMonth: document.getElementById('prevMonth'),
            nextMonth: document.getElementById('nextMonth'),
            currentMonthLabel: document.getElementById('currentMonth'),

            // Summary
            totalIncome: document.getElementById('totalIncome'),
            totalExpenses: document.getElementById('totalExpenses'),
            balance: document.getElementById('balance'),

            // Transactions
            recentTransactions: document.getElementById('recentTransactions'),
            transactionsTableBody: document.getElementById('transactionsTableBody'),
            emptyTransactions: document.getElementById('emptyTransactions'),
            filterType: document.getElementById('filterType'),
            filterCategory: document.getElementById('filterCategory'),

            // Export/Backup
            exportCSVBtn: document.getElementById('exportCSVBtn'),
            backupBtn: document.getElementById('backupBtn'),
            restoreBtn: document.getElementById('restoreBtn'),
            restoreFileInput: document.getElementById('restoreFileInput'),

            // Categories
            incomeCategoriesList: document.getElementById('incomeCategoriesList'),
            expenseCategoriesList: document.getElementById('expenseCategoriesList'),
            newIncomeCategory: document.getElementById('newIncomeCategory'),
            newExpenseCategory: document.getElementById('newExpenseCategory'),
            addIncomeCategory: document.getElementById('addIncomeCategory'),
            addExpenseCategory: document.getElementById('addExpenseCategory'),
            categorySummary: document.getElementById('categorySummary'),

            // Budgets
            budgetProgressList: document.getElementById('budgetProgressList'),
            budgetCategory: document.getElementById('budgetCategory'),
            budgetAmount: document.getElementById('budgetAmount'),
            saveBudgetBtn: document.getElementById('saveBudgetBtn'),
            budgetList: document.getElementById('budgetList'),

            // Comparison & Highlights
            comparisonGrid: document.getElementById('comparisonGrid'),
            topExpenseContent: document.getElementById('topExpenseContent'),

            // Transaction Modal
            transactionModal: document.getElementById('transactionModal'),
            modalTitle: document.getElementById('modalTitle'),
            transactionForm: document.getElementById('transactionForm'),
            transactionId: document.getElementById('transactionId'),
            typeRadios: document.querySelectorAll('input[name="type"]'),
            amount: document.getElementById('amount'),
            category: document.getElementById('category'),
            date: document.getElementById('date'),
            note: document.getElementById('note'),
            isRecurring: document.getElementById('isRecurring'),
            recurringOptions: document.getElementById('recurringOptions'),
            frequency: document.getElementById('frequency'),
            closeModal: document.getElementById('closeModal'),
            cancelTransaction: document.getElementById('cancelTransaction'),

            // Delete Modal
            deleteModal: document.getElementById('deleteModal'),
            closeDeleteModal: document.getElementById('closeDeleteModal'),
            cancelDelete: document.getElementById('cancelDelete'),
            confirmDelete: document.getElementById('confirmDelete'),

            // Toast
            toast: document.getElementById('toast'),
            toastMessage: document.getElementById('toastMessage'),

            // Add buttons
            addTransactionBtn: document.getElementById('addTransactionBtn'),
            addTransactionBtn2: document.getElementById('addTransactionBtn2'),
            addFirstTransaction: document.getElementById('addFirstTransaction'),

            // Advanced Filters
            searchQuery: document.getElementById('searchQuery'),
            filterDateFrom: document.getElementById('filterDateFrom'),
            filterDateTo: document.getElementById('filterDateTo'),
            clearFilters: document.getElementById('clearFilters'),

            // Wallets
            walletsList: document.getElementById('walletsList'),
            addWalletBtn: document.getElementById('addWalletBtn'),
            cveCurrency: document.getElementById('cveCurrency'),
            eurCurrency: document.getElementById('eurCurrency'),
            transferFrom: document.getElementById('transferFrom'),
            transferTo: document.getElementById('transferTo'),
            transferAmount: document.getElementById('transferAmount'),
            transferBtn: document.getElementById('transferBtn'),

            // Calendar
            calendarGrid: document.getElementById('calendarGrid'),
            calCurrentMonth: document.getElementById('calCurrentMonth'),
            calPrevMonth: document.getElementById('calPrevMonth'),
            calNextMonth: document.getElementById('calNextMonth'),
            selectedDateTitle: document.getElementById('selectedDateTitle'),
            dayTransactions: document.getElementById('dayTransactions'),
            daySummary: document.getElementById('daySummary'),
            calMonthIncome: document.getElementById('calMonthIncome'),
            calMonthExpense: document.getElementById('calMonthExpense'),
            calMonthBalance: document.getElementById('calMonthBalance'),

            // Predictions
            predictionCard: document.getElementById('predictionCard'),
            predictionValue: document.getElementById('predictionValue'),
            predictionComparisonText: document.getElementById('predictionComparisonText'),
            predictionValue: document.getElementById('predictionValue'),
            predictionComparisonText: document.getElementById('predictionComparisonText'),
            predictionTrendBadge: document.getElementById('predictionTrendBadge'),

            // Form elements for AI
            noteInput: document.getElementById('note'),
            amountInput: document.getElementById('amount'),
            categorySelect: document.getElementById('category'),
            anomalyAlert: document.getElementById('anomalyAlert'),

            // Insights
            insightsGrid: document.getElementById('insightsGrid'),

            // Quick Entry
            quickEntryInput: document.getElementById('quickEntryInput'),
            quickEntryBtn: document.getElementById('quickEntryBtn'),
            quickEntryPreview: document.getElementById('quickEntryPreview')
        };
    }

    // Utility: Debounce function for search input
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Clear all filters
    function clearAllFilters() {
        elements.filterType.value = 'all';
        elements.filterCategory.value = 'all';
        elements.searchQuery.value = '';
        elements.filterDateFrom.value = '';
        elements.filterDateTo.value = '';
        refreshTransactionsTable();
        showToast('Filtros limpos', 'success');
    }

    // Theme management
    function initTheme() {
        const savedTheme = DataManager.getTheme();
        setTheme(savedTheme);
    }

    function setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        DataManager.setTheme(theme);
        ChartsManager.setTheme(theme === 'dark');
        ChartsManager.refresh();
    }

    function toggleTheme() {
        const currentTheme = DataManager.getTheme();
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
    }

    // Sidebar management
    function toggleSidebar() {
        elements.sidebar.classList.toggle('open');
        elements.sidebarOverlay.classList.toggle('active');
    }

    function closeSidebar() {
        elements.sidebar.classList.remove('open');
        elements.sidebarOverlay.classList.remove('active');
    }

    // Section navigation
    function showSection(sectionName) {
        // Hide all sections
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
        });

        // Show target section
        const targetSection = document.getElementById(sectionName + 'Section');
        if (targetSection) {
            targetSection.classList.add('active');
        }

        // Update nav items
        elements.navItems.forEach(item => {
            item.classList.remove('active');
            if (item.dataset.section === sectionName) {
                item.classList.add('active');
            }
        });

        // Close sidebar on mobile
        closeSidebar();

        // Refresh data when showing sections
        if (sectionName === 'dashboard') {
            refreshDashboard();
        } else if (sectionName === 'transactions') {
            refreshTransactionsTable();
        } else if (sectionName === 'categories') {
            refreshCategories();
        } else if (sectionName === 'budgets') {
            refreshBudgets();
        } else if (sectionName === 'wallets') {
            refreshWallets();
        } else if (sectionName === 'calendar') {
            refreshCalendar();
        }
    }

    // Month navigation
    function updateMonthLabel() {
        elements.currentMonthLabel.textContent = DataManager.getMonthName(currentMonth, currentYear);
    }

    function goToPreviousMonth() {
        currentMonth--;
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        }
        updateMonthLabel();
        refreshDashboard();
    }

    function goToNextMonth() {
        currentMonth++;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
        updateMonthLabel();
        refreshDashboard();
    }

    // Dashboard refresh
    function refreshDashboard() {
        const totals = DataManager.getMonthlyTotals(currentMonth, currentYear);

        elements.totalIncome.textContent = DataManager.formatCurrency(totals.income);
        elements.totalExpenses.textContent = DataManager.formatCurrency(totals.expense);
        elements.balance.textContent = DataManager.formatCurrency(totals.balance);

        // Update balance color
        const balanceCard = elements.balance.closest('.summary-card');
        if (totals.balance < 0) {
            elements.balance.style.color = 'var(--color-expense)';
        } else {
            elements.balance.style.color = '';
        }

        // Refresh recent transactions
        refreshRecentTransactions();

        // Refresh charts
        ChartsManager.updateBarChart(DataManager.getLast6MonthsData());
        ChartsManager.updatePieChart(
            DataManager.getCategorySummary('expense', currentMonth, currentYear)
        );

        // Refresh budget progress on dashboard
        refreshBudgetProgress();

        // Refresh predictions (only if showing current month)
        const today = new Date();
        if (currentMonth === today.getMonth() && currentYear === today.getFullYear()) {
            refreshPrediction();
            elements.predictionCard.style.display = 'block';
        } else {
            elements.predictionCard.style.display = 'none';
        }

        // Refresh AI Insights
        refreshInsights();
    }

    // Prediction Logic
    function refreshPrediction() {
        if (!elements.predictionCard) return;

        const projected = DataManager.getSpendingProjection();
        const average = DataManager.getHistoricalAverage(3);
        const totals = DataManager.getMonthlyTotals(currentMonth, currentYear);

        // Display projected value
        elements.predictionValue.textContent = DataManager.formatCurrency(projected);

        if (average === 0) {
            // Not enough data
            elements.predictionTrendBadge.textContent = 'Sem histórico suficiente';
            elements.predictionTrendBadge.className = 'trend-badge';
            elements.predictionComparisonText.textContent = 'Continue usando o app para gerar média';
            return;
        }

        const diffPercent = ((projected - average) / average) * 100;
        const diffAbs = Math.abs(diffPercent).toFixed(0);

        // Update badge and text
        if (currentMonth === new Date().getMonth() && new Date().getDate() === 1 && totals.expense === 0) {
            elements.predictionTrendBadge.textContent = 'Início do mês';
            elements.predictionTrendBadge.className = 'trend-badge';
            elements.predictionComparisonText.textContent = `Média histórica: ${DataManager.formatCurrency(average)}`;
            elements.predictionCard.className = 'prediction-card';
            return;
        }

        if (projected > average) {
            elements.predictionTrendBadge.textContent = `Tendência de Alta (+${diffAbs}%)`;
            elements.predictionTrendBadge.className = 'trend-badge up';
            elements.predictionComparisonText.innerHTML = `Média histórica: <b>${DataManager.formatCurrency(average)}</b>`;

            // Critical if > 20% above average
            if (diffPercent > 20) {
                elements.predictionCard.className = 'prediction-card status-critical';
            } else {
                elements.predictionCard.className = 'prediction-card status-warning';
            }
        } else {
            elements.predictionTrendBadge.textContent = `Tendência de Baixa (-${diffAbs}%)`;
            elements.predictionTrendBadge.className = 'trend-badge down';
            elements.predictionComparisonText.innerHTML = `Média histórica: <b>${DataManager.formatCurrency(average)}</b>`;
            elements.predictionCard.className = 'prediction-card status-good';
        }
    }

    // AI Insights Renderer
    function refreshInsights() {
        if (!elements.insightsGrid || !window.AIManager) return;

        const insights = AIManager.generateInsights();

        if (insights.length === 0) {
            elements.insightsGrid.innerHTML = `
                <div class="insights-empty">
                    Continue usando o app para gerar curiosidades sobre seus gastos 🧠
                </div>
            `;
            return;
        }

        elements.insightsGrid.innerHTML = insights.map(insight => `
            <div class="insight-card">
                <span class="insight-icon">${insight.icon}</span>
                <div class="insight-content">
                    <div class="insight-text">${insight.text}</div>
                    <div class="insight-detail">${insight.detail}</div>
                </div>
            </div>
        `).join('');
    }

    // Budget progress on dashboard
    function refreshBudgetProgress() {
        const progress = DataManager.getBudgetProgress(currentMonth, currentYear);

        if (progress.length === 0) {
            elements.budgetProgressList.innerHTML = `
                <div class="empty-state show">
                    <p>Nenhuma meta definida. <a href="#" onclick="UIManager.goToBudgets(); return false;">Definir metas</a></p>
                </div>
            `;
            return;
        }

        elements.budgetProgressList.innerHTML = progress.map(item => {
            const statusText = item.status === 'exceeded' ? 'Excedido!' :
                item.status === 'warning' ? 'Atenção!' : 'OK';

            return `
                <div class="budget-progress-item">
                    <div class="budget-progress-header">
                        <span class="budget-category-name">${item.category}</span>
                        <span class="budget-values">${DataManager.formatCurrency(item.spent)} / ${DataManager.formatCurrency(item.budget)}</span>
                    </div>
                    <div class="budget-progress-bar">
                        <div class="budget-progress-fill ${item.status}" style="width: ${item.percentage}%"></div>
                    </div>
                    <div class="budget-progress-footer">
                        <span>Restante: ${DataManager.formatCurrency(item.remaining)}</span>
                        <span class="budget-status ${item.status}">${statusText}</span>
                    </div>
                </div>
            `;
        }).join('');

        // Refresh comparison and highlights
        refreshComparison();
        refreshTopExpense();
    }

    // Comparison with previous month
    function refreshComparison() {
        const comparison = DataManager.getMonthlyComparison(currentMonth, currentYear);

        const createItem = (label, data, isExpense = false) => {
            const changeAbs = Math.abs(data.change).toFixed(1);
            const arrowIcon = data.trend === 'up'
                ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="18 15 12 9 6 15"/></svg>'
                : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>';

            // For expenses, down is good (green), up is bad (red)
            const trendClass = isExpense
                ? (data.trend === 'up' ? 'down' : 'up')
                : data.trend;

            return `
                <div class="comparison-item">
                    <span class="comparison-label">${label}</span>
                    <div class="comparison-value">
                        <span class="comparison-change ${trendClass}">
                            ${arrowIcon}
                            ${changeAbs}%
                        </span>
                    </div>
                </div>
            `;
        };

        elements.comparisonGrid.innerHTML =
            createItem('Receitas', comparison.income) +
            createItem('Despesas', comparison.expense, true) +
            createItem('Saldo', comparison.balance);
    }

    // Top expense of the month
    function refreshTopExpense() {
        const top = DataManager.getTopExpense(currentMonth, currentYear);

        if (!top) {
            elements.topExpenseContent.innerHTML = `
                <span class="top-expense-empty">Nenhuma despesa este mês</span>
            `;
            return;
        }

        elements.topExpenseContent.innerHTML = `
            <span class="top-expense-value">${DataManager.formatCurrency(top.amount)}</span>
            <span class="top-expense-category">${top.category}</span>
            <span class="top-expense-date">${DataManager.formatDate(top.date)}${top.note ? ' - ' + top.note : ''}</span>
        `;
    }

    // Wallets management
    function refreshWallets() {
        const wallets = DataManager.getWallets();
        const activeWallet = DataManager.getActiveWallet();

        // Render wallet cards
        elements.walletsList.innerHTML = wallets.map(wallet => {
            const balance = DataManager.getWalletBalance(wallet.id);
            const eurBalance = DataManager.convertCVEtoEUR(balance.balance);
            const isActive = wallet.id === activeWallet.id;

            return `
                <div class="wallet-card ${isActive ? 'active' : ''}" data-wallet-id="${wallet.id}">
                    <div class="wallet-header">
                        <span class="wallet-icon">${wallet.icon}</span>
                        <span class="wallet-name">${wallet.name}</span>
                    </div>
                    <div class="wallet-balance">${DataManager.formatCurrency(balance.balance)}</div>
                    <div class="wallet-balance-eur">${DataManager.formatCurrencyEUR(eurBalance)}</div>
                    <div class="wallet-actions">
                        <button class="btn btn-secondary btn-sm" onclick="UIManager.selectWallet('${wallet.id}')">
                            ${isActive ? '✓ Ativa' : 'Ativar'}
                        </button>
                        ${wallet.id !== 'main' ?
                    `<button class="btn btn-ghost btn-sm" onclick="UIManager.deleteWallet('${wallet.id}')">Excluir</button>`
                    : ''}
                    </div>
                </div>
            `;
        }).join('');

        // Update transfer dropdowns
        const walletOptions = wallets.map(w =>
            `<option value="${w.id}">${w.icon} ${w.name}</option>`
        ).join('');

        elements.transferFrom.innerHTML = walletOptions;
        elements.transferTo.innerHTML = walletOptions;

        // Set different defaults
        if (wallets.length > 1) {
            elements.transferTo.selectedIndex = 1;
        }
    }

    function handleAddWallet() {
        const name = prompt('Nome da nova carteira:');
        if (!name || !name.trim()) return;

        const icons = ['💳', '🏦', '💵', '💰', '🪙', '📱'];
        const icon = icons[Math.floor(Math.random() * icons.length)];

        DataManager.addWallet({ name: name.trim(), icon });
        refreshWallets();
        showToast('Carteira criada com sucesso!', 'success');
    }

    function handleTransfer() {
        const fromId = elements.transferFrom.value;
        const toId = elements.transferTo.value;
        const amount = parseFloat(elements.transferAmount.value);

        if (fromId === toId) {
            showToast('Selecione carteiras diferentes', 'error');
            return;
        }

        if (!amount || amount <= 0) {
            showToast('Insira um valor válido', 'error');
            return;
        }

        const result = DataManager.transferBetweenWallets(fromId, toId, amount);
        if (result) {
            elements.transferAmount.value = '';
            refreshWallets();
            refreshAll();
            showToast('Transferência realizada com sucesso!', 'success');
        } else {
            showToast('Erro ao realizar transferência', 'error');
        }
    }

    function handleCurrencyConvert(direction) {
        if (direction === 'cve') {
            const cve = parseFloat(elements.cveCurrency.value) || 0;
            const eur = DataManager.convertCVEtoEUR(cve);
            elements.eurCurrency.value = eur.toFixed(2);
        } else {
            const eur = parseFloat(elements.eurCurrency.value) || 0;
            const cve = DataManager.convertEURtoCVE(eur);
            elements.cveCurrency.value = cve.toFixed(2);
        }
    }

    // Calendar state
    let calendarMonth = new Date().getMonth();
    let calendarYear = new Date().getFullYear();
    let selectedDate = null;

    // Calendar functions
    function refreshCalendar() {
        // Update month label
        elements.calCurrentMonth.textContent = DataManager.getMonthName(calendarMonth, calendarYear);

        // Get transactions for this month
        const transactions = DataManager.getMonthlyTransactions(calendarMonth, calendarYear);

        // Build transaction map by date
        const txByDate = {};
        transactions.forEach(t => {
            if (!txByDate[t.date]) txByDate[t.date] = [];
            txByDate[t.date].push(t);
        });

        // Calculate calendar grid
        const firstDay = new Date(calendarYear, calendarMonth, 1);
        const lastDay = new Date(calendarYear, calendarMonth + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startDayOfWeek = firstDay.getDay();

        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];

        let html = '';

        // Previous month padding
        const prevMonthLastDay = new Date(calendarYear, calendarMonth, 0).getDate();
        for (let i = startDayOfWeek - 1; i >= 0; i--) {
            html += `<div class="calendar-day other-month"><span class="day-number">${prevMonthLastDay - i}</span></div>`;
        }

        // Current month days
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${calendarYear}-${String(calendarMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayTx = txByDate[dateStr] || [];

            let classes = ['calendar-day'];
            if (dateStr === todayStr) classes.push('today');
            if (selectedDate === dateStr) classes.push('selected');

            let hasIncome = false, hasExpense = false;
            let dayTotal = 0;
            dayTx.forEach(t => {
                if (t.type === 'income') { hasIncome = true; dayTotal += parseFloat(t.amount); }
                else { hasExpense = true; dayTotal -= parseFloat(t.amount); }
            });

            if (hasIncome) classes.push('has-income');
            if (hasExpense) classes.push('has-expense');

            const totalDisplay = dayTx.length > 0 ?
                `<span class="day-total">${dayTotal >= 0 ? '+' : ''}${dayTotal.toFixed(0)}</span>` : '';

            html += `
                <div class="${classes.join(' ')}" onclick="UIManager.selectCalendarDay('${dateStr}')">
                    <span class="day-number">${day}</span>
                    ${totalDisplay}
                </div>
            `;
        }

        // Next month padding
        const remainingCells = 42 - (startDayOfWeek + daysInMonth);
        for (let i = 1; i <= remainingCells && (startDayOfWeek + daysInMonth + i - 1) < 42; i++) {
            html += `<div class="calendar-day other-month"><span class="day-number">${i}</span></div>`;
        }

        elements.calendarGrid.innerHTML = html;

        // Update month summary
        const totals = DataManager.getMonthlyTotals(calendarMonth, calendarYear);
        elements.calMonthIncome.textContent = DataManager.formatCurrency(totals.income);
        elements.calMonthExpense.textContent = DataManager.formatCurrency(totals.expense);
        elements.calMonthBalance.textContent = DataManager.formatCurrency(totals.balance);
    }

    function selectCalendarDay(dateStr) {
        selectedDate = dateStr;
        refreshCalendar();

        // Get transactions for this day
        const transactions = DataManager.getTransactions().filter(t => t.date === dateStr);

        // Update title
        const date = new Date(dateStr + 'T12:00:00');
        elements.selectedDateTitle.textContent = date.toLocaleDateString('pt-PT', {
            weekday: 'long',
            day: 'numeric',
            month: 'long'
        });

        // Render transactions
        if (transactions.length === 0) {
            elements.dayTransactions.innerHTML = '<p class="empty-hint">Nenhuma transação neste dia</p>';
            elements.daySummary.innerHTML = '';
            return;
        }

        let income = 0, expense = 0;
        elements.dayTransactions.innerHTML = transactions.map(t => {
            const sign = t.type === 'income' ? '+' : '-';
            if (t.type === 'income') income += parseFloat(t.amount);
            else expense += parseFloat(t.amount);

            return `
                <div class="day-transaction-item ${t.type}">
                    <div class="day-tx-info">
                        <span class="day-tx-category">${t.category}</span>
                        ${t.note ? `<span class="day-tx-note">${t.note}</span>` : ''}
                    </div>
                    <span class="day-tx-amount">${sign}${DataManager.formatCurrency(t.amount)}</span>
                </div>
            `;
        }).join('');

        // Day summary
        elements.daySummary.innerHTML = `
            ${income > 0 ? `<span class="day-summary-item income">+${DataManager.formatCurrency(income)}</span>` : ''}
            ${expense > 0 ? `<span class="day-summary-item expense">-${DataManager.formatCurrency(expense)}</span>` : ''}
        `;
    }

    function calendarPrevMonth() {
        calendarMonth--;
        if (calendarMonth < 0) {
            calendarMonth = 11;
            calendarYear--;
        }
        selectedDate = null;
        refreshCalendar();
    }

    function calendarNextMonth() {
        calendarMonth++;
        if (calendarMonth > 11) {
            calendarMonth = 0;
            calendarYear++;
        }
        selectedDate = null;
        refreshCalendar();
    }

    // Recent transactions (dashboard)
    function refreshRecentTransactions() {
        const transactions = DataManager.getMonthlyTransactions(currentMonth, currentYear);
        const sorted = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date));
        const recent = sorted.slice(0, 5);

        if (recent.length === 0) {
            elements.recentTransactions.innerHTML = `
                <div class="empty-state show">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                    </svg>
                    <p>Nenhuma transação este mês</p>
                </div>
            `;
            return;
        }

        elements.recentTransactions.innerHTML = recent.map(t => createTransactionItem(t)).join('');
    }

    // Create transaction item HTML
    function createTransactionItem(transaction) {
        const icon = transaction.type === 'income'
            ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>'
            : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg>';

        const sign = transaction.type === 'income' ? '+' : '-';

        return `
            <div class="transaction-item ${transaction.type}" data-id="${transaction.id}">
                <div class="transaction-info">
                    <div class="transaction-icon">${icon}</div>
                    <div class="transaction-details">
                        <span class="transaction-category">${transaction.category}</span>
                        ${transaction.note ? `<span class="transaction-note">${transaction.note}</span>` : ''}
                        <span class="transaction-date">${DataManager.formatDate(transaction.date)}</span>
                    </div>
                </div>
                <span class="transaction-amount">${sign}${DataManager.formatCurrency(transaction.amount)}</span>
                <div class="transaction-actions">
                    <button class="action-btn edit" title="Editar" onclick="UIManager.editTransaction('${transaction.id}')">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                    </button>
                    <button class="action-btn delete" title="Excluir" onclick="UIManager.confirmDeleteTransaction('${transaction.id}')">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        </svg>
                    </button>
                </div>
            </div>
        `;
    }

    // Transactions table
    function refreshTransactionsTable() {
        const transactions = DataManager.getTransactions();
        const filterType = elements.filterType.value;
        const filterCategory = elements.filterCategory.value;
        const searchQuery = elements.searchQuery.value.toLowerCase().trim();
        const dateFrom = elements.filterDateFrom.value;
        const dateTo = elements.filterDateTo.value;

        let filtered = [...transactions];

        // Apply type filter
        if (filterType !== 'all') {
            filtered = filtered.filter(t => t.type === filterType);
        }

        // Apply category filter
        if (filterCategory !== 'all') {
            filtered = filtered.filter(t => t.category === filterCategory);
        }

        // Apply text search (searches note and category)
        if (searchQuery) {
            filtered = filtered.filter(t =>
                (t.note && t.note.toLowerCase().includes(searchQuery)) ||
                t.category.toLowerCase().includes(searchQuery)
            );
        }

        // Apply date range filter
        if (dateFrom) {
            filtered = filtered.filter(t => t.date >= dateFrom);
        }
        if (dateTo) {
            filtered = filtered.filter(t => t.date <= dateTo);
        }

        // Sort by date (newest first)
        filtered.sort((a, b) => new Date(b.date) - new Date(a.date));

        // Update filter category options
        updateFilterCategories();

        if (filtered.length === 0) {
            elements.transactionsTableBody.innerHTML = '';
            elements.emptyTransactions.classList.add('show');
            return;
        }

        elements.emptyTransactions.classList.remove('show');
        elements.transactionsTableBody.innerHTML = filtered.map(t => createTableRow(t)).join('');
    }

    function createTableRow(transaction) {
        const sign = transaction.type === 'income' ? '+' : '-';
        const noteText = transaction.note || '-';

        return `
            <tr data-id="${transaction.id}">
                <td>${DataManager.formatDate(transaction.date)}</td>
                <td>${transaction.category}</td>
                <td>${noteText}</td>
                <td class="amount ${transaction.type}">${sign}${DataManager.formatCurrency(transaction.amount)}</td>
                <td>
                    <div class="transaction-actions">
                        <button class="action-btn edit" title="Editar" onclick="UIManager.editTransaction('${transaction.id}')">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                            </svg>
                        </button>
                        <button class="action-btn delete" title="Excluir" onclick="UIManager.confirmDeleteTransaction('${transaction.id}')">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="3 6 5 6 21 6"/>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                            </svg>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }

    function updateFilterCategories() {
        const categories = DataManager.getCategories();
        const allCategories = [...categories.income, ...categories.expense];
        const unique = [...new Set(allCategories)].sort();

        elements.filterCategory.innerHTML = '<option value="all">Todas Categorias</option>';
        unique.forEach(cat => {
            elements.filterCategory.innerHTML += `<option value="${cat}">${cat}</option>`;
        });
    }

    // Categories management
    function refreshCategories() {
        const categories = DataManager.getCategories();

        // Render income categories
        elements.incomeCategoriesList.innerHTML = categories.income
            .map(cat => createCategoryTag(cat, 'income'))
            .join('');

        // Render expense categories
        elements.expenseCategoriesList.innerHTML = categories.expense
            .map(cat => createCategoryTag(cat, 'expense'))
            .join('');

        // Refresh category summary
        refreshCategorySummary();
    }

    function createCategoryTag(category, type) {
        const isCustom = !DataManager.isDefaultCategory(type, category);
        const customClass = isCustom ? 'custom' : '';
        const removeBtn = isCustom
            ? `<button class="category-remove" onclick="UIManager.removeCategory('${type}', '${category}')">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
               </button>`
            : '';

        return `<span class="category-tag ${customClass}">${category}${removeBtn}</span>`;
    }

    function refreshCategorySummary() {
        const incomeSummary = DataManager.getCategorySummary('income', currentMonth, currentYear);
        const expenseSummary = DataManager.getCategorySummary('expense', currentMonth, currentYear);

        const allSummary = [
            ...incomeSummary.map(s => ({ ...s, type: 'income' })),
            ...expenseSummary.map(s => ({ ...s, type: 'expense' }))
        ].sort((a, b) => b.total - a.total);

        if (allSummary.length === 0) {
            elements.categorySummary.innerHTML = `
                <div class="empty-state show">
                    <p>Sem dados para este mês</p>
                </div>
            `;
            return;
        }

        const totalAll = allSummary.reduce((sum, item) => sum + item.total, 0);

        elements.categorySummary.innerHTML = allSummary.map((item, index) => {
            const percentage = ((item.total / totalAll) * 100).toFixed(1);
            const color = DataManager.getCategoryColor(index);
            const valueClass = item.type === 'income' ? 'income' : 'expense';
            const sign = item.type === 'income' ? '+' : '-';

            return `
                <div class="category-summary-item">
                    <div class="category-summary-info">
                        <span class="category-color" style="background-color: ${color}"></span>
                        <span class="category-name">${item.category}</span>
                    </div>
                    <div class="category-summary-value">
                        <span class="category-total ${valueClass}">${sign}${DataManager.formatCurrency(item.total)}</span>
                        <span class="category-percentage">${percentage}%</span>
                    </div>
                </div>
            `;
        }).join('');
    }

    // Modal management
    function openTransactionModal(transactionId = null) {
        editingTransactionId = transactionId;

        if (transactionId) {
            // Editing existing transaction
            const transaction = DataManager.getTransactionById(transactionId);
            if (!transaction) return;

            elements.modalTitle.textContent = 'Editar Transação';
            elements.transactionId.value = transaction.id;

            // Set type
            elements.typeRadios.forEach(radio => {
                radio.checked = radio.value === transaction.type;
            });

            // Update category options and set value
            updateCategoryOptions(transaction.type);
            elements.category.value = transaction.category;

            elements.amount.value = transaction.amount;
            elements.date.value = transaction.date;
            elements.note.value = transaction.note || '';
        } else {
            // New transaction
            elements.modalTitle.textContent = 'Nova Transação';
            elements.transactionForm.reset();
            elements.transactionId.value = '';
            elements.date.value = new Date().toISOString().split('T')[0];
            elements.typeRadios[0].checked = true;
            updateCategoryOptions('income');
        }

        elements.transactionModal.classList.add('active');
        elements.amount.focus();
    }

    function closeTransactionModal() {
        elements.transactionModal.classList.remove('active');
        editingTransactionId = null;
        elements.transactionForm.reset();
    }

    function updateCategoryOptions(type) {
        const categories = DataManager.getCategories();
        const options = categories[type];

        elements.category.innerHTML = options
            .map(cat => `<option value="${cat}">${cat}</option>`)
            .join('');
    }

    function handleTypeChange(e) {
        updateCategoryOptions(e.target.value);
    }

    function handleTransactionSubmit(e) {
        e.preventDefault();

        const type = document.querySelector('input[name="type"]:checked').value;
        const amount = parseFloat(elements.amount.value);
        const category = elements.category.value;
        const date = elements.date.value;
        const note = elements.note.value.trim();
        const isRecurring = elements.isRecurring.checked;
        const frequency = isRecurring ? elements.frequency.value : null;

        if (!amount || amount <= 0) {
            showToast('Por favor, insira um valor válido', 'error');
            return;
        }

        if (!category) {
            showToast('Por favor, selecione uma categoria', 'error');
            return;
        }

        if (!date) {
            showToast('Por favor, selecione uma data', 'error');
            return;
        }

        const transactionData = {
            type,
            amount,
            category,
            date,
            note,
            isRecurring,
            frequency,
            lastProcessed: isRecurring ? date : null
        };

        if (editingTransactionId) {
            DataManager.updateTransaction(editingTransactionId, transactionData);
            showToast('Transação atualizada com sucesso!', 'success');
        } else {
            DataManager.addTransaction(transactionData);
            showToast(isRecurring ? 'Transação recorrente criada com sucesso!' : 'Transação adicionada com sucesso!', 'success');
        }

        closeTransactionModal();
        refreshAll();
    }

    // Delete confirmation
    function openDeleteModal(transactionId) {
        deleteTargetId = transactionId;
        elements.deleteModal.classList.add('active');
    }

    function closeDeleteModal() {
        elements.deleteModal.classList.remove('active');
        deleteTargetId = null;
    }

    function handleDeleteConfirm() {
        if (deleteTargetId) {
            DataManager.deleteTransaction(deleteTargetId);
            showToast('Transação excluída com sucesso!', 'success');
            closeDeleteModal();
            refreshAll();
        }
    }

    // Add category
    function addCategory(type) {
        const input = type === 'income' ? elements.newIncomeCategory : elements.newExpenseCategory;
        const categoryName = input.value.trim();

        if (!categoryName) {
            showToast('Por favor, insira um nome para a categoria', 'error');
            return;
        }

        if (DataManager.addCategory(type, categoryName)) {
            showToast('Categoria adicionada com sucesso!', 'success');
            input.value = '';
            refreshCategories();
        } else {
            showToast('Esta categoria já existe', 'error');
        }
    }

    // Budgets management
    function refreshBudgets() {
        // Populate category dropdown
        const categories = DataManager.getCategories().expense;
        elements.budgetCategory.innerHTML = categories
            .map(cat => `<option value="${cat}">${cat}</option>`)
            .join('');

        // Render budget list
        const budgets = DataManager.getBudgets();
        const budgetEntries = Object.entries(budgets);

        if (budgetEntries.length === 0) {
            elements.budgetList.innerHTML = `
                <div class="empty-state show">
                    <p>Nenhuma meta definida ainda</p>
                </div>
            `;
            return;
        }

        elements.budgetList.innerHTML = budgetEntries.map(([category, amount]) => `
            <div class="budget-list-item">
                <div class="budget-item-info">
                    <span class="budget-item-category">${category}</span>
                    <span class="budget-item-amount">${DataManager.formatCurrency(amount)} / mês</span>
                </div>
                <div class="budget-item-actions">
                    <button class="action-btn delete" title="Remover" onclick="UIManager.removeBudget('${category}')">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        </svg>
                    </button>
                </div>
            </div>
        `).join('');
    }

    function saveBudget() {
        const category = elements.budgetCategory.value;
        const amount = parseFloat(elements.budgetAmount.value);

        if (!category) {
            showToast('Por favor, selecione uma categoria', 'error');
            return;
        }

        if (!amount || amount <= 0) {
            showToast('Por favor, insira um valor válido', 'error');
            return;
        }

        DataManager.setBudget(category, amount);
        showToast('Meta definida com sucesso!', 'success');
        elements.budgetAmount.value = '';
        refreshBudgets();
        refreshBudgetProgress();
    }

    // Export/Backup functions
    function handleExportCSV() {
        const result = DataManager.exportToCSV();
        if (result) {
            showToast('Dados exportados para CSV com sucesso!', 'success');
        } else {
            showToast('Nenhuma transação para exportar', 'error');
        }
    }

    function handleBackup() {
        DataManager.exportBackup();
        showToast('Backup criado com sucesso!', 'success');
    }

    function handleRestore() {
        elements.restoreFileInput.click();
    }

    function handleRestoreFile(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function (event) {
            const result = DataManager.importBackup(event.target.result);
            if (result.success) {
                showToast(`Backup restaurado! ${result.transactionsCount} transações importadas.`, 'success');
                refreshAll();
            } else {
                showToast(`Erro ao restaurar: ${result.error}`, 'error');
            }
        };
        reader.readAsText(file);
        e.target.value = ''; // Reset file input
    }

    // Toast notifications
    function showToast(message, type = 'info') {
        elements.toast.className = 'toast';
        elements.toastMessage.textContent = message;

        if (type === 'success') {
            elements.toast.classList.add('success');
        } else if (type === 'error') {
            elements.toast.classList.add('error');
        }

        elements.toast.classList.add('show');

        setTimeout(() => {
            elements.toast.classList.remove('show');
        }, 3000);
    }

    // Refresh all data
    function refreshAll() {
        refreshDashboard();
        refreshTransactionsTable();
        refreshCategories();
        refreshBudgets();
    }

    // Event listeners setup
    function setupEventListeners() {
        // Theme toggle
        elements.themeToggle.addEventListener('click', toggleTheme);
        elements.themeToggleMobile.addEventListener('click', toggleTheme);

        // Sidebar
        elements.menuBtn.addEventListener('click', toggleSidebar);
        elements.sidebarOverlay.addEventListener('click', closeSidebar);

        // Navigation
        elements.navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                showSection(item.dataset.section);
            });
        });

        // Month navigation
        elements.prevMonth.addEventListener('click', goToPreviousMonth);
        elements.nextMonth.addEventListener('click', goToNextMonth);

        // Add transaction buttons
        elements.addTransactionBtn.addEventListener('click', () => openTransactionModal());
        elements.addTransactionBtn2.addEventListener('click', () => openTransactionModal());
        elements.addFirstTransaction.addEventListener('click', () => openTransactionModal());

        // Transaction modal
        elements.closeModal.addEventListener('click', closeTransactionModal);
        elements.cancelTransaction.addEventListener('click', closeTransactionModal);
        elements.transactionForm.addEventListener('submit', handleTransactionSubmit);

        // Type radio change
        elements.typeRadios.forEach(radio => {
            radio.addEventListener('change', handleTypeChange);
        });

        // Recurring checkbox toggle
        elements.isRecurring.addEventListener('change', (e) => {
            elements.recurringOptions.style.display = e.target.checked ? 'block' : 'none';
        });

        // Delete modal
        elements.closeDeleteModal.addEventListener('click', closeDeleteModal);
        elements.cancelDelete.addEventListener('click', closeDeleteModal);
        elements.confirmDelete.addEventListener('click', handleDeleteConfirm);

        // Filters
        elements.filterType.addEventListener('change', refreshTransactionsTable);
        elements.filterCategory.addEventListener('change', refreshTransactionsTable);

        // Advanced Filters
        elements.searchQuery.addEventListener('input', debounce(refreshTransactionsTable, 300));
        elements.filterDateFrom.addEventListener('change', refreshTransactionsTable);
        elements.filterDateTo.addEventListener('change', refreshTransactionsTable);
        elements.clearFilters.addEventListener('click', clearAllFilters);

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Alt+N: New transaction
            if (e.altKey && e.key === 'n') {
                e.preventDefault();
                openTransactionModal();
            }
            // Alt+D: Go to Dashboard
            if (e.altKey && e.key === 'd') {
                e.preventDefault();
                showSection('dashboard');
            }
            // Alt+T: Go to Transactions
            if (e.altKey && e.key === 't') {
                e.preventDefault();
                showSection('transactions');
            }
            // Alt+M: Go to Metas
            if (e.altKey && e.key === 'm') {
                e.preventDefault();
                showSection('budgets');
            }
        });

        // Add category
        elements.addIncomeCategory.addEventListener('click', () => addCategory('income'));
        elements.addExpenseCategory.addEventListener('click', () => addCategory('expense'));

        // Enter key for category inputs
        elements.newIncomeCategory.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                addCategory('income');
            }
        });
        elements.newExpenseCategory.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                addCategory('expense');
            }
        });

        // Close modals on overlay click
        elements.transactionModal.addEventListener('click', (e) => {
            if (e.target === elements.transactionModal) {
                closeTransactionModal();
            }
        });
        elements.deleteModal.addEventListener('click', (e) => {
            if (e.target === elements.deleteModal) {
                closeDeleteModal();
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                closeTransactionModal();
                closeDeleteModal();
                closeSidebar();
            }
        });

        // Export/Backup buttons
        elements.exportCSVBtn.addEventListener('click', handleExportCSV);
        elements.backupBtn.addEventListener('click', handleBackup);
        elements.restoreBtn.addEventListener('click', handleRestore);
        elements.restoreFileInput.addEventListener('change', handleRestoreFile);

        // Budget management
        elements.saveBudgetBtn.addEventListener('click', saveBudget);
        elements.budgetAmount.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                saveBudget();
            }
        });

        // Wallet management
        elements.addWalletBtn.addEventListener('click', handleAddWallet);
        elements.transferBtn.addEventListener('click', handleTransfer);
        elements.cveCurrency.addEventListener('input', () => handleCurrencyConvert('cve'));
        elements.eurCurrency.addEventListener('input', () => handleCurrencyConvert('eur'));

        // Calendar navigation
        elements.calPrevMonth.addEventListener('click', calendarPrevMonth);
        elements.calNextMonth.addEventListener('click', calendarNextMonth);

        // AI Features
        if (window.AIManager) {
            // Auto Categorization
            elements.noteInput.addEventListener('input', Utils.debounce((e) => {
                const note = e.target.value;
                const predictedCategory = AIManager.predictCategory(note);

                if (predictedCategory) {
                    // Find option with this text
                    const options = Array.from(elements.categorySelect.options);
                    const match = options.find(opt => opt.text === predictedCategory);

                    if (match) {
                        elements.categorySelect.value = match.value;
                        // Optional: Visual feedback
                        elements.categorySelect.style.borderColor = 'var(--color-primary)';
                        setTimeout(() => elements.categorySelect.style.borderColor = '', 1000);
                    }
                }

            }, 500));

            // Anomaly Detection
            const checkAnomaly = () => {
                const amount = parseFloat(elements.amountInput.value);
                const category = elements.categorySelect.value;
                const type = document.querySelector('input[name="type"]:checked').value;

                if (isNaN(amount) || !category) {
                    elements.anomalyAlert.style.display = 'none';
                    return;
                }

                const anomaly = AIManager.checkAnomaly(amount, category, type);

                if (anomaly) {
                    elements.anomalyAlert.style.display = 'block';
                    elements.anomalyAlert.innerHTML = `⚠️ <strong>Atenção:</strong> Este valor é ${anomaly.diffPercent}% maior que sua média (${DataManager.formatCurrency(anomaly.avg)})`;
                } else {
                    elements.anomalyAlert.style.display = 'none';
                }
            };

            elements.amountInput.addEventListener('input', Utils.debounce(checkAnomaly, 500));
            elements.categorySelect.addEventListener('change', checkAnomaly);
            document.querySelectorAll('input[name="type"]').forEach(r => r.addEventListener('change', checkAnomaly));

            // Quick Entry
            if (elements.quickEntryInput) {
                // Live preview on input
                elements.quickEntryInput.addEventListener('input', Utils.debounce(() => {
                    const text = elements.quickEntryInput.value;
                    const parsed = AIManager.parseNaturalText(text);

                    if (parsed) {
                        elements.quickEntryPreview.style.display = 'flex';
                        elements.quickEntryPreview.innerHTML = `
                            <span class="preview-type ${parsed.type}">${parsed.type === 'income' ? 'Receita' : 'Despesa'}</span>
                            <span class="preview-amount">${DataManager.formatCurrency(parsed.amount)}</span>
                            <span>→</span>
                            <span class="preview-category">${parsed.category}</span>
                            <span style="color: var(--color-text-muted);">(${parsed.date})</span>
                        `;
                    } else {
                        elements.quickEntryPreview.style.display = 'none';
                    }
                }, 300));

                // Submit on button click
                elements.quickEntryBtn.addEventListener('click', () => {
                    const text = elements.quickEntryInput.value;
                    const parsed = AIManager.parseNaturalText(text);

                    if (parsed) {
                        const newTransaction = {
                            id: Date.now().toString(),
                            type: parsed.type,
                            amount: parsed.amount,
                            category: parsed.category,
                            date: parsed.date,
                            note: parsed.note,
                            wallet: DataManager.getActiveWallet()
                        };

                        DataManager.addTransaction(newTransaction);
                        elements.quickEntryInput.value = '';
                        elements.quickEntryPreview.style.display = 'none';
                        refreshDashboard();
                        showNotification('Transação adicionada via texto! ✨', 'success');
                    } else {
                        showNotification('Não consegui entender. Inclua um valor (ex: "Gastei 50 em almoço").', 'error');
                    }
                });

                // Submit on Enter key
                elements.quickEntryInput.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        elements.quickEntryBtn.click();
                    }
                });
            }
        }
    }

    // Public API
    return {
        init() {
            cacheElements();
            initTheme();
            setupEventListeners();
            updateMonthLabel();
            refreshAll();
        },

        // Expose methods for inline handlers
        editTransaction(id) {
            openTransactionModal(id);
        },

        confirmDeleteTransaction(id) {
            openDeleteModal(id);
        },

        removeCategory(type, name) {
            if (DataManager.removeCategory(type, name)) {
                showToast('Categoria removida com sucesso!', 'success');
                refreshCategories();
            }
        },

        removeBudget(category) {
            DataManager.removeBudget(category);
            showToast('Meta removida com sucesso!', 'success');
            refreshBudgets();
            refreshBudgetProgress();
        },

        goToBudgets() {
            showSection('budgets');
        },

        selectWallet(walletId) {
            DataManager.setActiveWallet(walletId);
            refreshWallets();
            showToast('Carteira ativada!', 'success');
        },

        deleteWallet(walletId) {
            if (confirm('Tem certeza que deseja excluir esta carteira?')) {
                if (DataManager.deleteWallet(walletId)) {
                    refreshWallets();
                    showToast('Carteira excluída!', 'success');
                } else {
                    showToast('Não é possível excluir a carteira principal', 'error');
                }
            }
        },

        selectCalendarDay(dateStr) {
            selectCalendarDay(dateStr);
        },

        showToast,
        refreshAll
    };
})();

// Export for use in other modules
window.UIManager = UIManager;
