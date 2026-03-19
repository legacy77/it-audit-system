/**
 * Reusable Component Helpers
 */
const Components = {
    statCard(iconSvg, value, label, colorClass, delay = 0) {
        return `
        <div class="stat-card" style="animation-delay:${delay}ms">
            <div class="stat-icon ${colorClass}">${iconSvg}</div>
            <div class="stat-info">
                <div class="stat-value">${value}</div>
                <div class="stat-label">${label}</div>
            </div>
        </div>`;
    },

    badge(text, type) {
        return `<span class="badge badge-${type}">${Utils.escapeHtml(text)}</span>`;
    },

    riskBadge(score) {
        const risk = Utils.getRiskLevel(score);
        return `<span class="badge badge-${risk.class}">${risk.level} (${score})</span>`;
    },

    emptyState(message, buttonText, buttonId) {
        return `
        <div class="empty-state">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
            </svg>
            <p>${message}</p>
            ${buttonText ? `<button class="btn btn-primary" id="${buttonId}">${buttonText}</button>` : ''}
        </div>`;
    },

    riskMatrixSmall(riskAreas) {
        if (!riskAreas || riskAreas.length === 0) return '<p style="color:var(--text-muted);font-size:var(--font-sm)">Belum ada risk area</p>';
        return `
        <div class="plan-risk-summary">
            ${riskAreas.map(ra => {
                const score = Utils.calculateRiskScore(ra.likelihood, ra.impact);
                const risk = Utils.getRiskLevel(score);
                return `<span class="badge badge-${risk.class}" title="${ra.area}: L=${ra.likelihood} × I=${ra.impact}">${Utils.escapeHtml(ra.area)}: ${risk.level}</span>`;
            }).join('')}
        </div>`;
    },

    progressBar(completed, total) {
        const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
        return `
        <div style="display:flex;align-items:center;gap:var(--space-3)">
            <div class="progress-bar" style="flex:1">
                <div class="progress-fill" style="width:${pct}%"></div>
            </div>
            <span style="font-size:var(--font-xs);color:var(--text-muted);white-space:nowrap">${completed}/${total} (${pct}%)</span>
        </div>`;
    },

    // Full interactive Risk Matrix (5×5)
    riskMatrix() {
        const levels = [5, 4, 3, 2, 1];
        const getCell = (l, i) => {
            const score = l * i;
            const risk = Utils.getRiskLevel(score);
            return `<div class="risk-matrix-cell risk-cell-${risk.class}" title="L${l} × I${i} = ${score}">${score}</div>`;
        };

        let html = '<div class="risk-matrix">';
        // Header row
        html += '<div class="risk-matrix-cell risk-matrix-header">L / I</div>';
        for (let i = 1; i <= 5; i++) {
            html += `<div class="risk-matrix-cell risk-matrix-header">${i}</div>`;
        }
        // Data rows
        for (const l of levels) {
            html += `<div class="risk-matrix-cell risk-matrix-header">${l}</div>`;
            for (let i = 1; i <= 5; i++) {
                html += getCell(l, i);
            }
        }
        html += '</div>';
        return html;
    }
};
