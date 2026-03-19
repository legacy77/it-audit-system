/**
 * Reporting Page
 */
const ReportingPage = {
    render() {
        const plans = Store.getPlans();
        const allFindings = Store.getFindings();

        // Aggregated stats
        const severityCounts = { critical: 0, high: 0, medium: 0, low: 0 };
        allFindings.forEach(f => { if (severityCounts[f.severity] !== undefined) severityCounts[f.severity]++; });

        return `
        <!-- Filters -->
        <div class="report-filters">
            <div class="search-bar">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <input type="text" id="finding-search" placeholder="Cari findings...">
            </div>
            <select id="filter-plan">
                <option value="">Semua Audit</option>
                ${plans.map(p => `<option value="${p.id}">${Utils.escapeHtml(p.title)}</option>`).join('')}
            </select>
            <select id="filter-severity">
                <option value="">Semua Severity</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
            </select>
        </div>

        <!-- Summary Cards -->
        <div class="stat-grid">
            ${Components.statCard(
                '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/></svg>',
                allFindings.length, 'Total Findings', 'orange'
            )}
            ${Components.statCard(
                '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
                severityCounts.critical, 'Critical', 'red', 100
            )}
            ${Components.statCard(
                '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>',
                severityCounts.high, 'High', 'orange', 200
            )}
            ${Components.statCard(
                '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
                severityCounts.medium + severityCounts.low, 'Medium & Low', 'yellow', 300
            )}
        </div>

        <div class="dashboard-grid">
            <!-- Risk Heatmap -->
            <div class="card animate-up">
                <div class="card-header">
                    <h3 class="card-title">Risk Heatmap</h3>
                </div>
                ${this._renderHeatmap(plans)}
            </div>

            <!-- Findings per Audit -->
            <div class="card animate-up" style="animation-delay:100ms">
                <div class="card-header">
                    <h3 class="card-title">Findings per Audit</h3>
                </div>
                ${this._renderFindingsPerAudit(plans)}
            </div>
        </div>

        <!-- Findings Table -->
        <div class="card" style="margin-top:var(--space-6)">
            <div class="card-header">
                <h3 class="card-title">Detail Findings</h3>
            </div>
            <div class="table-wrapper" id="findings-table-wrapper">
                <table>
                    <thead>
                        <tr>
                            <th>Title</th>
                            <th>Audit</th>
                            <th>Kategori</th>
                            <th>Severity</th>
                            <th>Tanggal</th>
                        </tr>
                    </thead>
                    <tbody id="findings-tbody">
                        ${allFindings.length === 0
                            ? '<tr><td colspan="5" style="text-align:center;color:var(--text-muted);padding:var(--space-8)">Belum ada findings</td></tr>'
                            : allFindings.map(f => {
                                const plan = plans.find(p => p.id === f.planId);
                                return `
                                <tr class="finding-row" data-plan="${f.planId}" data-severity="${f.severity}" data-title="${Utils.escapeHtml(f.title.toLowerCase())}">
                                    <td style="font-weight:600">${Utils.escapeHtml(f.title)}</td>
                                    <td style="font-size:var(--font-xs)">${Utils.escapeHtml(plan?.title || '-')}</td>
                                    <td>${Utils.escapeHtml(f.category)}</td>
                                    <td>${Components.badge(f.severity.toUpperCase(), Utils.getSeverityClass(f.severity))}</td>
                                    <td style="font-size:var(--font-xs)">${Utils.formatDate(f.createdAt)}</td>
                                </tr>`;
                            }).join('')
                        }
                    </tbody>
                </table>
            </div>
        </div>`;
    },

    _renderHeatmap(plans) {
        // 5x5 heatmap: Likelihood (rows) × Impact (cols)
        const grid = Array.from({length: 5}, () => Array(5).fill(0));
        plans.forEach(p => {
            (p.riskAreas || []).forEach(ra => {
                grid[5 - ra.likelihood][ra.impact - 1]++;
            });
        });

        let html = '<div style="display:grid;grid-template-columns:40px repeat(5, 1fr);gap:2px;font-size:var(--font-xs)">';
        // Header
        html += '<div></div>';
        for (let i = 1; i <= 5; i++) html += `<div style="text-align:center;color:var(--text-muted);padding:4px">I${i}</div>`;
        // Rows
        for (let l = 5; l >= 1; l--) {
            html += `<div style="display:flex;align-items:center;justify-content:center;color:var(--text-muted)">L${l}</div>`;
            for (let i = 1; i <= 5; i++) {
                const score = l * i;
                const risk = Utils.getRiskLevel(score);
                const count = grid[5 - l][i - 1];
                const opacity = count > 0 ? 0.4 + Math.min(count * 0.2, 0.6) : 0.1;
                html += `<div class="heatmap-cell" style="background:${risk.color};opacity:${opacity};color:white;border-radius:var(--radius-sm);aspect-ratio:1;display:flex;align-items:center;justify-content:center" title="L${l}×I${i}=${score} (${count} area)">${count || ''}</div>`;
            }
        }
        html += '</div>';
        html += '<div style="margin-top:var(--space-3);font-size:var(--font-xs);color:var(--text-muted);text-align:center">Impact →  |  ↑ Likelihood</div>';
        return html;
    },

    _renderFindingsPerAudit(plans) {
        if (plans.length === 0) return '<p style="color:var(--text-muted);font-size:var(--font-sm)">Belum ada data</p>';
        const maxFindings = Math.max(...plans.map(p => Store.getFindings(p.id).length), 1);

        return `
        <div class="bar-chart" style="height:180px">
            ${plans.map(p => {
                const count = Store.getFindings(p.id).length;
                return `
                <div class="bar-group">
                    <div class="bar-value">${count}</div>
                    <div class="bar" style="height:${(count/maxFindings)*100}%;background:linear-gradient(180deg,var(--primary-400),var(--primary-700))"></div>
                    <div class="bar-label" title="${Utils.escapeHtml(p.title)}">${Utils.escapeHtml(p.title.length > 12 ? p.title.substring(0, 12) + '…' : p.title)}</div>
                </div>`;
            }).join('')}
        </div>`;
    },

    init() {
        const filterFn = () => {
            const search = (document.getElementById('finding-search')?.value || '').toLowerCase();
            const planFilter = document.getElementById('filter-plan')?.value || '';
            const sevFilter = document.getElementById('filter-severity')?.value || '';

            document.querySelectorAll('.finding-row').forEach(row => {
                const matchPlan = !planFilter || row.dataset.plan === planFilter;
                const matchSev = !sevFilter || row.dataset.severity === sevFilter;
                const matchSearch = !search || row.dataset.title.includes(search);
                row.style.display = matchPlan && matchSev && matchSearch ? '' : 'none';
            });
        };

        document.getElementById('finding-search')?.addEventListener('input', filterFn);
        document.getElementById('filter-plan')?.addEventListener('change', filterFn);
        document.getElementById('filter-severity')?.addEventListener('change', filterFn);
    }
};
