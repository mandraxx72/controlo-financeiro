/**
 * CONTROLO FINANCEIRO - Charts Module
 * Renders bar and pie charts using Canvas API
 */

const ChartsManager = (function () {
    // Chart colors
    const COLORS = {
        income: '#22c55e',
        incomeDark: '#4ade80',
        expense: '#ef4444',
        expenseDark: '#f87171',
        grid: '#e2e8f0',
        gridDark: '#334155',
        text: '#64748b',
        textDark: '#94a3b8'
    };

    const PIE_COLORS = [
        '#00d4ff', '#0ea5e9', '#8b5cf6', '#ec4899', '#f59e0b',
        '#22c55e', '#14b8a6', '#6366f1', '#f43f5e', '#84cc16',
        '#06b6d4', '#a855f7', '#d946ef', '#f97316', '#10b981'
    ];

    let isDarkTheme = false;

    function getColor(colorName) {
        if (isDarkTheme && COLORS[colorName + 'Dark']) {
            return COLORS[colorName + 'Dark'];
        }
        return COLORS[colorName];
    }

    function clearCanvas(ctx, canvas) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    function setupCanvas(canvas) {
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();

        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;

        const ctx = canvas.getContext('2d');
        ctx.scale(dpr, dpr);

        return {
            ctx,
            width: rect.width,
            height: rect.height
        };
    }

    // Draw Bar Chart
    function drawBarChart(canvasId, data) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;

        const { ctx, width, height } = setupCanvas(canvas);
        clearCanvas(ctx, canvas);

        const padding = { top: 20, right: 20, bottom: 40, left: 60 };
        const chartWidth = width - padding.left - padding.right;
        const chartHeight = height - padding.top - padding.bottom;

        // Find max value
        const maxValue = Math.max(
            ...data.map(d => Math.max(d.income, d.expense)),
            100
        );
        const scale = chartHeight / maxValue;

        // Draw grid lines
        ctx.strokeStyle = getColor('grid');
        ctx.lineWidth = 1;

        const gridLines = 5;
        for (let i = 0; i <= gridLines; i++) {
            const y = padding.top + (chartHeight / gridLines) * i;
            ctx.beginPath();
            ctx.moveTo(padding.left, y);
            ctx.lineTo(width - padding.right, y);
            ctx.stroke();

            // Draw value labels
            const value = maxValue - (maxValue / gridLines) * i;
            ctx.fillStyle = getColor('text');
            ctx.font = '11px Inter, sans-serif';
            ctx.textAlign = 'right';
            ctx.fillText(formatCompact(value), padding.left - 10, y + 4);
        }

        // Draw bars
        const barGroupWidth = chartWidth / data.length;
        const barWidth = barGroupWidth * 0.35;
        const barGap = barGroupWidth * 0.1;

        data.forEach((item, index) => {
            const x = padding.left + index * barGroupWidth + barGap;

            // Income bar
            const incomeHeight = item.income * scale;
            const incomeY = padding.top + chartHeight - incomeHeight;

            ctx.fillStyle = getColor('income');
            roundRect(ctx, x, incomeY, barWidth, incomeHeight, 4);
            ctx.fill();

            // Expense bar
            const expenseHeight = item.expense * scale;
            const expenseY = padding.top + chartHeight - expenseHeight;

            ctx.fillStyle = getColor('expense');
            roundRect(ctx, x + barWidth + 4, expenseY, barWidth, expenseHeight, 4);
            ctx.fill();

            // Month label
            ctx.fillStyle = getColor('text');
            ctx.font = '12px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(
                item.month,
                x + barWidth + 2,
                height - padding.bottom + 20
            );
        });

        // Draw legend
        const legendY = 10;
        const legendX = width - 150;

        // Income legend
        ctx.fillStyle = getColor('income');
        roundRect(ctx, legendX, legendY, 12, 12, 2);
        ctx.fill();
        ctx.fillStyle = getColor('text');
        ctx.font = '12px Inter, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('Receitas', legendX + 18, legendY + 10);

        // Expense legend
        ctx.fillStyle = getColor('expense');
        roundRect(ctx, legendX + 80, legendY, 12, 12, 2);
        ctx.fill();
        ctx.fillStyle = getColor('text');
        ctx.fillText('Despesas', legendX + 98, legendY + 10);
    }

    // Draw Pie Chart
    function drawPieChart(canvasId, legendId, data) {
        const canvas = document.getElementById(canvasId);
        const legendContainer = document.getElementById(legendId);
        if (!canvas) return;

        const { ctx, width, height } = setupCanvas(canvas);
        clearCanvas(ctx, canvas);

        // Clear legend
        if (legendContainer) {
            legendContainer.innerHTML = '';
        }

        if (!data || data.length === 0) {
            // Draw empty state
            ctx.fillStyle = getColor('text');
            ctx.font = '14px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('Sem dados para exibir', width / 2, height / 2);
            return;
        }

        const centerX = width / 2;
        const centerY = height / 2;
        const radius = Math.min(width, height) / 2 - 20;

        // Calculate total
        const total = data.reduce((sum, item) => sum + item.total, 0);

        // Draw slices
        let startAngle = -Math.PI / 2;

        data.forEach((item, index) => {
            const sliceAngle = (item.total / total) * Math.PI * 2;
            const endAngle = startAngle + sliceAngle;
            const color = PIE_COLORS[index % PIE_COLORS.length];

            // Draw slice
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, startAngle, endAngle);
            ctx.closePath();
            ctx.fillStyle = color;
            ctx.fill();

            // Add white border
            ctx.strokeStyle = isDarkTheme ? '#1e293b' : '#ffffff';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Add legend item
            if (legendContainer) {
                const percentage = ((item.total / total) * 100).toFixed(1);
                const legendItem = document.createElement('div');
                legendItem.className = 'legend-item';
                legendItem.innerHTML = `
                    <span class="legend-color" style="background-color: ${color}"></span>
                    <span>${item.category} (${percentage}%)</span>
                `;
                legendContainer.appendChild(legendItem);
            }

            startAngle = endAngle;
        });

        // Draw center hole (donut effect)
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius * 0.5, 0, Math.PI * 2);
        ctx.fillStyle = isDarkTheme ? '#1e293b' : '#f8fafc';
        ctx.fill();

        // Draw total in center
        ctx.fillStyle = getColor('text');
        ctx.font = 'bold 14px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Total', centerX, centerY - 8);
        ctx.font = 'bold 16px Inter, sans-serif';
        ctx.fillStyle = isDarkTheme ? '#f1f5f9' : '#1e293b';
        ctx.fillText(DataManager.formatCurrency(total), centerX, centerY + 12);
    }

    // Helper: Draw rounded rectangle
    function roundRect(ctx, x, y, width, height, radius) {
        if (height < 1) height = 1;
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
    }

    // Helper: Format compact number
    function formatCompact(value) {
        if (value >= 1000) {
            return (value / 1000).toFixed(1) + 'k';
        }
        return value.toFixed(0);
    }

    // Public API
    return {
        setTheme(dark) {
            isDarkTheme = dark;
        },

        updateBarChart(data) {
            drawBarChart('barChart', data);
        },

        updatePieChart(data) {
            drawPieChart('pieChart', 'pieLegend', data);
        },

        refresh() {
            // Get current data and redraw
            const barData = DataManager.getLast6MonthsData();
            this.updateBarChart(barData);

            // Get current month expenses for pie chart
            const now = new Date();
            const pieData = DataManager.getCategorySummary('expense', now.getMonth(), now.getFullYear());
            this.updatePieChart(pieData);
        },

        init() {
            // Initial render
            this.refresh();

            // Redraw on resize
            let resizeTimeout;
            window.addEventListener('resize', () => {
                clearTimeout(resizeTimeout);
                resizeTimeout = setTimeout(() => this.refresh(), 250);
            });
        }
    };
})();

// Export for use in other modules
window.ChartsManager = ChartsManager;
