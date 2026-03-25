/**
 * Dashboard Page — Integrated with Followup & GRC
 */
const DashboardPage = {
    render() {
        const plans = Store.getPlans();
        const findings = Store.getFindings();
        const activities = Store.getActivities();
        const followups = Store.getFollowups();
        const grcControls = Store.getGRCControls();
        const grcCompliance = Store.getGRCCompliance();

        // Stats
        const totalPlans = plans.length;
        const activePlans = plans.filter(p => p.status === 'in-progress').length;
        const totalFindings = findings.length;
        const criticalFindings = findings.filter(f => f.severity === 'critical').length;
        const highFindings = findings.filter(f => f.severity === 'high').length;

        // Followup stats
        const resolved = followups.filter(f => f.status === 'resolved' || f.status === 'verified').length;
        const resolvedPct = totalFindings > 0 ? Math.round((resolved / totalFindings) * 100) : 0;
        const overdue = followups.filter(f => {
            if (f.status === 'resolved' || f.status === 'verified') return false;
            return f.targetDate && new Date(f.targetDate) < new Date();
        }).length;

        // GRC compliance score
        const implControls = grcControls.filter(c => c.status === 'implemented').length;
        const partControls = grcControls.filter(c => c.status === 'partial').length;
        const grcScore = grcControls.length > 0
            ? Math.round(((implControls * 100 + partControls * 50) / (grcControls.length * 100)) * 100)
            : 0;
        const nonCompliant = grcCompliance.filter(c => c.status === 'non-compliant').length;

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

            <!-- Followup Progress (NEW) -->
            <div class="card animate-up" style="animation-delay:100ms">
                <div class="card-header">
                    <h3 class="card-title">Progress Tindak Lanjut</h3>
                    <a href="#followup" style="font-size:var(--font-xs);color:var(--primary-400)">Lihat detail →</a>
                </div>
                <div style="text-align:center;margin-bottom:var(--space-4)">
                    <div style="font-size:var(--font-3xl);font-weight:800;color:${resolvedPct >= 70 ? 'var(--success)' : resolvedPct >= 40 ? 'var(--warning)' : 'var(--danger)'}">${resolvedPct}%</div>
                    <div style="font-size:var(--font-xs);color:var(--text-muted)">Temuan Ditindaklanjuti</div>
                </div>
                <div class="progress-bar" style="height:10px;margin-bottom:var(--space-4)">
                    <div class="progress-fill" style="width:${resolvedPct}%;background:linear-gradient(90deg, var(--success), #69db7c)"></div>
                </div>
                <div style="display:flex;justify-content:space-between;font-size:var(--font-xs);color:var(--text-muted)">
                    <span>✅ Selesai: ${resolved}</span>
                    <span>⏳ Proses: ${followups.filter(f => f.status === 'in-progress').length}</span>
                    <span style="color:${overdue > 0 ? 'var(--danger)' : 'var(--text-muted)'}">⚠ Terlambat: ${overdue}</span>
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

            <!-- GRC Compliance Score (NEW) -->
            <div class="card animate-up" style="animation-delay:300ms">
                <div class="card-header">
                    <h3 class="card-title">GRC Overview</h3>
                    <a href="#grc" style="font-size:var(--font-xs);color:var(--primary-400)">Lihat detail →</a>
                </div>
                <div style="display:flex;flex-direction:column;gap:var(--space-4)">
                    <div>
                        <div style="display:flex;justify-content:space-between;margin-bottom:var(--space-2)">
                            <span style="font-size:var(--font-sm);font-weight:600">Skor Kepatuhan Kontrol</span>
                            <span style="font-size:var(--font-sm);font-weight:800;color:${grcScore >= 70 ? 'var(--success)' : grcScore >= 40 ? 'var(--warning)' : 'var(--danger)'}">${grcScore}%</span>
                        </div>
                        <div class="progress-bar" style="height:8px">
                            <div class="progress-fill" style="width:${grcScore}%;background:${grcScore >= 70 ? 'var(--success)' : grcScore >= 40 ? 'var(--warning)' : 'var(--danger)'}"></div>
                        </div>
                    </div>
                    <div style="display:flex;gap:var(--space-3);flex-wrap:wrap;font-size:var(--font-xs)">
                        <span class="badge badge-completed">✓ ${implControls} Diterapkan</span>
                        <span class="badge badge-in-progress">◑ ${partControls} Sebagian</span>
                        <span class="badge badge-critical">✕ ${grcControls.filter(c => c.status === 'not-implemented').length} Belum</span>
                    </div>
                    ${nonCompliant > 0 ? `
                        <div style="background:rgba(224,49,49,0.08);padding:var(--space-3);border-radius:var(--radius-sm);border-left:3px solid var(--danger);font-size:var(--font-xs)">
                            ⚠️ <strong>${nonCompliant} regulasi</strong> belum terpenuhi
                        </div>
                    ` : '<div style="font-size:var(--font-xs);color:var(--success)">✅ Semua regulasi terpenuhi</div>'}
                </div>
            </div>

            <!-- Findings by Severity -->
            <div class="card animate-up" style="animation-delay:400ms">
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

            <!-- Recent Activity -->
            <div class="card animate-up" style="animation-delay:500ms">
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
