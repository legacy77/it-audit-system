/**
 * Dashboard Page
 */
const DashboardPage = {
    render() {
        const plans = Store.getPlans();
        const findings = Store.getFindings();
        const activities = Store.getActivities();

        // Stats
        const totalPlans = plans.length;
        const activePlans = plans.filter(p => p.status === 'in-progress').length;
        const totalFindings = findings.length;
        const criticalFindings = findings.filter(f => f.severity === 'critical').length;
        const highFindings = findings.filter(f => f.severity === 'high').length;

        // Risk distribution
        const riskCounts = { critical: 0, high: 0, medium: 0, low: 0, veryLow: 0 };
        plans.forEach(p => {
            (p.riskAreas || []).forEach(ra => {
                const score = Utils.calculateRiskScore(ra.likelihood, ra.impact);
                const risk = Utils.getRiskLevel(score);
                if (risk.class === 'critical') riskCounts.critical++;
                else if (risk.class === 'high') riskCounts.high++;
                else if (risk.class === 'medium') riskCounts.medium++;
                else if (risk.class === 'low') riskCounts.low++;
                else riskCounts.veryLow++;
            });
        });

        const maxRisk = Math.max(riskCounts.critical, riskCounts.high, riskCounts.medium, riskCounts.low, riskCounts.veryLow, 1);

        return `
        <div class="stat-grid">
            ${Components.statCard(
                '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>',
                totalPlans, 'Total Audit Plan', 'blue', 0
            )}
            ${Components.statCard(
                '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
                activePlans, 'Audit Aktif', 'yellow', 100
            )}
            ${Components.statCard(
                '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
                totalFindings, 'Total Findings', 'orange', 200
            )}
            ${Components.statCard(
                '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
                criticalFindings, 'Temuan Kritikal', 'red', 300
            )}
        </div>

        <div class="dashboard-grid">
            <!-- Risk Distribution -->
            <div class="card animate-up">
                <div class="card-header">
                    <h3 class="card-title">Distribusi Risiko</h3>
                </div>
                <div class="bar-chart">
                    <div class="bar-group">
                        <div class="bar-value">${riskCounts.critical}</div>
                        <div class="bar" style="height:${(riskCounts.critical/maxRisk)*100}%;background:var(--risk-critical)"></div>
                        <div class="bar-label">Critical</div>
                    </div>
                    <div class="bar-group">
                        <div class="bar-value">${riskCounts.high}</div>
                        <div class="bar" style="height:${(riskCounts.high/maxRisk)*100}%;background:var(--risk-high)"></div>
                        <div class="bar-label">High</div>
                    </div>
                    <div class="bar-group">
                        <div class="bar-value">${riskCounts.medium}</div>
                        <div class="bar" style="height:${(riskCounts.medium/maxRisk)*100}%;background:var(--risk-medium)"></div>
                        <div class="bar-label">Medium</div>
                    </div>
                    <div class="bar-group">
                        <div class="bar-value">${riskCounts.low}</div>
                        <div class="bar" style="height:${(riskCounts.low/maxRisk)*100}%;background:var(--risk-low)"></div>
                        <div class="bar-label">Low</div>
                    </div>
                    <div class="bar-group">
                        <div class="bar-value">${riskCounts.veryLow}</div>
                        <div class="bar" style="height:${(riskCounts.veryLow/maxRisk)*100}%;background:var(--risk-very-low)"></div>
                        <div class="bar-label">Very Low</div>
                    </div>
                </div>
            </div>

            <!-- Findings by Severity -->
            <div class="card animate-up" style="animation-delay:100ms">
                <div class="card-header">
                    <h3 class="card-title">Findings per Severity</h3>
                </div>
                <div style="display:flex;flex-direction:column;gap:var(--space-4)">
                    ${this._severityRow('Critical', criticalFindings, totalFindings, 'var(--risk-critical)')}
                    ${this._severityRow('High', highFindings, totalFindings, 'var(--risk-high)')}
                    ${this._severityRow('Medium', findings.filter(f => f.severity === 'medium').length, totalFindings, 'var(--risk-medium)')}
                    ${this._severityRow('Low', findings.filter(f => f.severity === 'low').length, totalFindings, 'var(--risk-low)')}
                </div>
            </div>

            <!-- Audit Status Overview -->
            <div class="card animate-up" style="animation-delay:200ms">
                <div class="card-header">
                    <h3 class="card-title">Status Audit</h3>
                </div>
                <div style="display:flex;flex-direction:column;gap:var(--space-3)">
                    ${plans.map(p => `
                        <div style="display:flex;align-items:center;justify-content:space-between;padding:var(--space-3) 0;border-bottom:1px solid var(--border-muted)">
                            <div>
                                <div style="font-size:var(--font-sm);font-weight:600">${Utils.escapeHtml(p.title)}</div>
                                <div style="font-size:var(--font-xs);color:var(--text-muted)">${Utils.escapeHtml(p.department || '')}</div>
                            </div>
                            ${Components.badge(Utils.getStatusLabel(p.status), Utils.getStatusClass(p.status))}
                        </div>
                    `).join('')}
                    ${plans.length === 0 ? '<p style="color:var(--text-muted);font-size:var(--font-sm)">Belum ada audit plan</p>' : ''}
                </div>
            </div>

            <!-- Recent Activity -->
            <div class="card animate-up" style="animation-delay:300ms">
                <div class="card-header">
                    <h3 class="card-title">Aktivitas Terkini</h3>
                </div>
                <div class="timeline">
                    ${activities.slice(0, 6).map((act, i) => `
                        <div class="timeline-item">
                            <div class="timeline-dot" style="background:rgba(92,124,250,0.15);color:var(--primary-400)">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                            </div>
                            <div class="timeline-content">
                                <div class="timeline-title">${Utils.escapeHtml(act.description)}</div>
                                <div class="timeline-desc">${Utils.timeAgo(act.timestamp)}</div>
                            </div>
                        </div>
                    `).join('')}
                    ${activities.length === 0 ? '<p style="color:var(--text-muted);font-size:var(--font-sm);padding:var(--space-4)">Belum ada aktivitas</p>' : ''}
                </div>
            </div>
        </div>`;
    },

    _severityRow(label, count, total, color) {
        const pct = total > 0 ? Math.round((count / total) * 100) : 0;
        return `
        <div>
            <div style="display:flex;justify-content:space-between;margin-bottom:var(--space-1)">
                <span style="font-size:var(--font-sm);font-weight:500">${label}</span>
                <span style="font-size:var(--font-sm);color:var(--text-muted)">${count}</span>
            </div>
            <div class="progress-bar">
                <div class="progress-fill" style="width:${pct}%;background:${color}"></div>
            </div>
        </div>`;
    },

    init() {
        // No event bindings needed for dashboard
    }
};
