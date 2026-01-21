/**
 * AI Manager
 * Handles smart features like auto-categorization and insights
 */
const AIManager = (function () {

    // Auto-Categorization Logic
    function predictCategory(note) {
        if (!note || note.length < 3) return null;

        const transactions = DataManager.getTransactions();
        const normalize = str => str.toLowerCase().trim();
        const target = normalize(note);

        // Map words to categories
        const wordMap = {};

        transactions.forEach(t => {
            if (!t.note) return;
            const tNote = normalize(t.note);

            // Check for keyword matches
            if (tNote.includes(target) || target.includes(tNote)) {
                if (!wordMap[t.category]) wordMap[t.category] = 0;
                wordMap[t.category]++;
            }
        });

        // Find best match
        let bestCategory = null;
        let maxCount = 0;

        for (const [category, count] of Object.entries(wordMap)) {
            if (count > maxCount) {
                maxCount = count;
                bestCategory = category;
            }
        }

        // Only return if we have some confidence (at least 1 previous match)
        return maxCount >= 1 ? bestCategory : null;
    }

    // Anomaly Detection
    function checkAnomaly(amount, category, type) {
        if (!amount || !category || type !== 'expense') return null;

        const transactions = DataManager.getTransactions();
        const categoryTx = transactions.filter(t => t.type === 'expense' && t.category === category);

        if (categoryTx.length < 5) return null; // Need history

        // Calculate Average
        const total = categoryTx.reduce((sum, t) => sum + parseFloat(t.amount), 0);
        const avg = total / categoryTx.length;

        // Threshold: 50% above average
        const threshold = avg * 1.5;

        if (amount > threshold) {
            const diffPercent = ((amount - avg) / avg) * 100;
            return {
                isAnomaly: true,
                avg: avg,
                diffPercent: diffPercent.toFixed(0)
            };
        }

        return null;
    }

    // Behavioral Insights Generator
    function generateInsights() {
        const transactions = DataManager.getTransactions();
        const expenses = transactions.filter(t => t.type === 'expense');

        if (expenses.length < 5) return []; // Need enough data

        const insights = [];
        const dayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

        // 1. Most expensive day of the week
        const dayTotals = {};
        const dayCounts = {};
        expenses.forEach(t => {
            const day = new Date(t.date).getDay();
            dayTotals[day] = (dayTotals[day] || 0) + parseFloat(t.amount);
            dayCounts[day] = (dayCounts[day] || 0) + 1;
        });

        let maxDay = 0, maxAvg = 0;
        for (const [day, total] of Object.entries(dayTotals)) {
            const avg = total / dayCounts[day];
            if (avg > maxAvg) {
                maxAvg = avg;
                maxDay = parseInt(day);
            }
        }
        insights.push({
            icon: '📅',
            text: `Seu dia mais gastador é <strong>${dayNames[maxDay]}</strong>`,
            detail: `Média de ${DataManager.formatCurrency(maxAvg)} por ${dayNames[maxDay].toLowerCase()}`
        });

        // 2. Top category
        const categoryTotals = {};
        expenses.forEach(t => {
            categoryTotals[t.category] = (categoryTotals[t.category] || 0) + parseFloat(t.amount);
        });
        const topCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0];
        if (topCategory) {
            const percent = ((topCategory[1] / expenses.reduce((s, t) => s + parseFloat(t.amount), 0)) * 100).toFixed(0);
            insights.push({
                icon: '🏆',
                text: `<strong>${topCategory[0]}</strong> é sua maior categoria`,
                detail: `${percent}% dos seus gastos`
            });
        }

        // 3. Weekend vs Weekday spending
        let weekendTotal = 0, weekdayTotal = 0;
        expenses.forEach(t => {
            const day = new Date(t.date).getDay();
            if (day === 0 || day === 6) weekendTotal += parseFloat(t.amount);
            else weekdayTotal += parseFloat(t.amount);
        });
        const total = weekendTotal + weekdayTotal;
        if (total > 0) {
            const weekendPct = ((weekendTotal / total) * 100).toFixed(0);
            if (weekendPct > 30) {
                insights.push({
                    icon: '🌴',
                    text: `<strong>${weekendPct}%</strong> dos seus gastos são no fim de semana`,
                    detail: 'Sábado e Domingo'
                });
            }
        }

        // 4. Number of transactions trend (this month vs last)
        const now = new Date();
        const thisMonthTx = expenses.filter(t => {
            const d = new Date(t.date);
            return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        }).length;

        let lastMonth = now.getMonth() - 1;
        let lastYear = now.getFullYear();
        if (lastMonth < 0) { lastMonth = 11; lastYear--; }

        const lastMonthTx = expenses.filter(t => {
            const d = new Date(t.date);
            return d.getMonth() === lastMonth && d.getFullYear() === lastYear;
        }).length;

        if (lastMonthTx > 0 && thisMonthTx > lastMonthTx) {
            const diff = ((thisMonthTx - lastMonthTx) / lastMonthTx * 100).toFixed(0);
            insights.push({
                icon: '📈',
                text: `Este mês você tem <strong>${diff}% mais transações</strong>`,
                detail: `${thisMonthTx} transações vs ${lastMonthTx} no mês passado`
            });
        }

        return insights.slice(0, 3); // Return max 3 insights
    }

    // Natural Language Parser for Quick Transaction Entry
    function parseNaturalText(text) {
        if (!text || text.length < 3) return null;

        const result = {
            type: 'expense', // Default to expense
            amount: null,
            category: null,
            note: text,
            date: new Date().toISOString().split('T')[0] // Today
        };

        // Detect type: "recebi", "ganhei" → income
        const incomeKeywords = /\b(recebi|ganhei|entrada|salário|pagamento|rendimento)\b/i;
        if (incomeKeywords.test(text)) {
            result.type = 'income';
        }

        // Extract amount: "50", "50€", "50$", "R$50", "50,00", "50.00"
        const amountMatch = text.match(/[\$€]?\s*(\d+[.,]?\d*)\s*[\$€]?/);
        if (amountMatch) {
            result.amount = parseFloat(amountMatch[1].replace(',', '.'));
        }

        // Date keywords: "ontem", "hoje", "anteontem"
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const dayBeforeYesterday = new Date();
        dayBeforeYesterday.setDate(dayBeforeYesterday.getDate() - 2);

        if (/\bontem\b/i.test(text)) {
            result.date = yesterday.toISOString().split('T')[0];
        } else if (/\banteontem\b/i.test(text)) {
            result.date = dayBeforeYesterday.toISOString().split('T')[0];
        }

        // Category detection from keywords
        const categoryKeywords = {
            'Alimentação': /\b(comida|almoço|jantar|refeição|restaurante|lanche|café|mercado|supermercado|pingo doce|continente)\b/i,
            'Transporte': /\b(uber|táxi|taxi|gasolina|combustível|autocarro|metro|transporte|bolt)\b/i,
            'Saúde': /\b(farmácia|médico|hospital|consulta|remédio|medicamento)\b/i,
            'Entretenimento': /\b(cinema|netflix|spotify|jogo|diversão|festa|bar|discoteca)\b/i,
            'Compras': /\b(roupa|sapato|shopping|loja|compra|presente)\b/i,
            'Educação': /\b(curso|livro|escola|faculdade|aula|formação)\b/i,
            'Assinaturas': /\b(assinatura|subscrição|mensal|plano|streaming)\b/i,
            'Contas': /\b(luz|água|gás|internet|telefone|renda|aluguel|conta)\b/i
        };

        for (const [category, regex] of Object.entries(categoryKeywords)) {
            if (regex.test(text)) {
                result.category = category;
                break;
            }
        }

        // Use AI prediction if no category detected
        if (!result.category && result.note) {
            result.category = predictCategory(result.note);
        }

        // Fallback category
        if (!result.category) {
            result.category = result.type === 'income' ? 'Outros' : 'Outros';
        }

        // Only return if we at least got an amount
        return result.amount ? result : null;
    }

    return {
        predictCategory,
        checkAnomaly,
        generateInsights,
        parseNaturalText
    };
})();

// Export
window.AIManager = AIManager;
