/**
 * GRC (Governance, Risk, Compliance) Integration Page
 */
const GRCPage = {
    activeTab: 'governance',
    render() {
        return `
        <div class="grc-header">
            <div class="grc-header-text">
                <h2 class="grc-title">Governance, Risk & Compliance</h2>
                <p class="grc-subtitle">Integrasi temuan audit dengan framework GRC untuk tata kelola yang lebih baik.</p>
            </div>
        </div>
        <div class="tabs grc-tabs">
            <button class="tab-item ${this.activeTab==='governance'?'active':''}" data-tab="governance">🏛️ Governance</button>
            <button class="tab-item ${this.activeTab==='risk'?'active':''}" data-tab="risk">⚠️ Risk Register</button>
            <button class="tab-item ${this.activeTab==='compliance'?'active':''}" data-tab="compliance">📋 Compliance</button>
        </div>
        <div id="grc-tab-content">${this._renderTab()}</div>`;
    },
    _renderTab() {
        if (this.activeTab === 'governance') return this._renderGovernance();
        if (this.activeTab === 'risk') return this._renderRisk();
        return this._renderCompliance();
    },
    _renderGovernance() {
        const controls = Store.getGRCControls();
        const findings = Store.getFindings();
        const implemented = controls.filter(c => c.status === 'implemented').length;
        const partial = controls.filter(c => c.status === 'partial').length;
        const notImpl = controls.filter(c => c.status === 'not-implemented').length;
        const total = controls.length;
        const score = total > 0 ? Math.round(((implemented * 100 + partial * 50) / (total * 100)) * 100) : 0;
        return `
        <div class="stat-grid">
            ${Components.statCard('<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>', total, 'Total Kontrol', 'blue')}
            ${Components.statCard('<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>', implemented, 'Diterapkan', 'green', 100)}
            ${Components.statCard('<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>', partial, 'Sebagian', 'yellow', 200)}
            ${Components.statCard('<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>', notImpl, 'Belum Diterapkan', 'red', 300)}
        </div>
        <div class="card animate-up" style="margin-bottom:var(--space-5)">
            <div class="card-header"><h3 class="card-title">Skor Kepatuhan Kontrol</h3><span style="font-size:var(--font-2xl);font-weight:800;color:${score>=70?'var(--success)':score>=40?'var(--warning)':'var(--danger)'}">${score}%</span></div>
            <div class="progress-bar" style="height:12px"><div class="progress-fill" style="width:${score}%;background:${score>=70?'var(--success)':score>=40?'var(--warning)':'var(--danger)'}"></div></div>
        </div>
        <div class="grc-controls-list">
            ${controls.map(c => {
                const linked = c.linkedFindings.map(fid => findings.find(f => f.id === fid)).filter(Boolean);
                return `
                <div class="grc-control-card animate-up">
                    <div class="grc-control-header">
                        <div><span class="grc-control-id">${Utils.escapeHtml(c.controlId)}</span><h4>${Utils.escapeHtml(c.title)}</h4></div>
                        <span class="badge badge-${Utils.getGRCControlStatusClass(c.status)}">${Utils.getGRCControlStatusLabel(c.status)}</span>
                    </div>
                    <p class="grc-control-desc">${Utils.escapeHtml(c.description)}</p>
                    <div class="grc-control-meta"><span>📚 ${Utils.escapeHtml(c.framework)}</span><span>🏷️ ${Utils.escapeHtml(c.domain)}</span></div>
                    ${linked.length > 0 ? `<div class="grc-linked-findings"><strong>Temuan Terkait:</strong>${linked.map(f => `<span class="badge badge-${Utils.getSeverityClass(f.severity)}" title="${Utils.escapeHtml(f.title)}">${Utils.escapeHtml(f.title)}</span>`).join('')}</div>` : '<div class="grc-no-findings">✅ Tidak ada temuan terkait</div>'}
                </div>`;
            }).join('')}
        </div>`;
    },
    _renderRisk() {
        const risks = Store.getGRCRisks();
        const findings = Store.getFindings();
        const controls = Store.getGRCControls();
        return `
        <div class="dashboard-grid" style="margin-bottom:var(--space-6)">
            <div class="card animate-up">
                <div class="card-header"><h3 class="card-title">Risk Heatmap — Inherent Risk</h3></div>
                ${this._renderHeatmap(risks, 'inherent')}
            </div>
            <div class="card animate-up" style="animation-delay:100ms">
                <div class="card-header"><h3 class="card-title">Risk Heatmap — Residual Risk</h3></div>
                ${this._renderHeatmap(risks, 'residual')}
            </div>
        </div>
        <div class="grc-risk-list">
            ${risks.map(r => {
                const inhScore = r.inherentLikelihood * r.inherentImpact;
                const resScore = r.residualLikelihood * r.residualImpact;
                const inhRisk = Utils.getRiskLevel(inhScore);
                const resRisk = Utils.getRiskLevel(resScore);
                const linked = r.linkedFindings.map(fid => findings.find(f => f.id === fid)).filter(Boolean);
                const ctrl = r.controls.map(cid => controls.find(c => c.id === cid)).filter(Boolean);
                return `
                <div class="grc-risk-card animate-up">
                    <div class="grc-risk-header">
                        <div><span class="grc-control-id">${Utils.escapeHtml(r.riskId)}</span><h4>${Utils.escapeHtml(r.title)}</h4></div>
                        <span class="badge badge-${r.mitigationStatus==='resolved'?'completed':r.mitigationStatus==='in-progress'?'in-progress':'critical'}">${r.mitigationStatus==='resolved'?'Resolved':r.mitigationStatus==='in-progress'?'In Progress':'Open'}</span>
                    </div>
                    <p class="grc-control-desc">${Utils.escapeHtml(r.description)}</p>
                    <div class="grc-risk-scores">
                        <div class="risk-score-box"><span class="risk-score-label">Inherent</span><span class="badge badge-${inhRisk.class}">${inhRisk.level} (${inhScore})</span></div>
                        <div class="risk-arrow">→</div>
                        <div class="risk-score-box"><span class="risk-score-label">Residual</span><span class="badge badge-${resRisk.class}">${resRisk.level} (${resScore})</span></div>
                        <div class="risk-score-box"><span class="risk-score-label">Treatment</span><span class="badge badge-info">${r.treatment}</span></div>
                    </div>
                    <div class="grc-control-meta"><span>📁 ${Utils.escapeHtml(r.category)}</span><span>👤 ${Utils.escapeHtml(r.owner)}</span></div>
                    ${ctrl.length > 0 ? `<div class="grc-linked-findings"><strong>Kontrol:</strong>${ctrl.map(c => `<span class="badge badge-${Utils.getGRCControlStatusClass(c.status)}">${Utils.escapeHtml(c.controlId+' — '+c.title)}</span>`).join('')}</div>` : ''}
                    ${linked.length > 0 ? `<div class="grc-linked-findings"><strong>Temuan:</strong>${linked.map(f => `<span class="badge badge-${Utils.getSeverityClass(f.severity)}">${Utils.escapeHtml(f.title)}</span>`).join('')}</div>` : ''}
                </div>`;
            }).join('')}
        </div>`;
    },
    _renderHeatmap(risks, type) {
        const grid = Array.from({length:5}, () => Array(5).fill(0));
        risks.forEach(r => {
            const l = type === 'inherent' ? r.inherentLikelihood : r.residualLikelihood;
            const i = type === 'inherent' ? r.inherentImpact : r.residualImpact;
            grid[5-l][i-1]++;
        });
        let h = '<div style="display:grid;grid-template-columns:40px repeat(5,1fr);gap:2px;font-size:var(--font-xs)">';
        h += '<div></div>'; for (let i=1;i<=5;i++) h += `<div style="text-align:center;color:var(--text-muted);padding:4px">I${i}</div>`;
        for (let l=5;l>=1;l--) {
            h += `<div style="display:flex;align-items:center;justify-content:center;color:var(--text-muted)">L${l}</div>`;
            for (let i=1;i<=5;i++) {
                const s = l*i; const rk = Utils.getRiskLevel(s); const cnt = grid[5-l][i-1];
                const op = cnt > 0 ? 0.4+Math.min(cnt*0.2,0.6) : 0.1;
                h += `<div class="heatmap-cell" style="background:${rk.color};opacity:${op};color:white;border-radius:var(--radius-sm);aspect-ratio:1;display:flex;align-items:center;justify-content:center" title="L${l}×I${i}=${s} (${cnt})">${cnt||''}</div>`;
            }
        }
        h += '</div><div style="margin-top:var(--space-3);font-size:var(--font-xs);color:var(--text-muted);text-align:center">Impact → | ↑ Likelihood</div>';
        return h;
    },
    _renderCompliance() {
        const items = Store.getGRCCompliance();
        const controls = Store.getGRCControls();
        const compliant = items.filter(i => i.status === 'compliant').length;
        const partial = items.filter(i => i.status === 'partial').length;
        const nonCompliant = items.filter(i => i.status === 'non-compliant').length;
        const totalGaps = items.reduce((sum, i) => sum + (i.gapCount || 0), 0);
        return `
        <div class="stat-grid">
            ${Components.statCard('<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>', items.length, 'Total Regulasi', 'blue')}
            ${Components.statCard('<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>', compliant, 'Patuh', 'green', 100)}
            ${Components.statCard('<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>', nonCompliant, 'Tidak Patuh', 'red', 200)}
            ${Components.statCard('<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/></svg>', totalGaps, 'Total Gap', 'orange', 300)}
        </div>
        <div class="grc-compliance-list">
            ${items.map(item => {
                const linked = (item.linkedControls||[]).map(cid => controls.find(c => c.id === cid)).filter(Boolean);
                return `
                <div class="grc-compliance-card animate-up">
                    <div class="grc-control-header">
                        <div><span class="grc-control-id">${Utils.escapeHtml(item.regulation)}</span><h4>${Utils.escapeHtml(item.requirement)}</h4></div>
                        <span class="badge badge-${Utils.getComplianceStatusClass(item.status)}">${Utils.getComplianceStatusLabel(item.status)}</span>
                    </div>
                    <p class="grc-control-desc">${Utils.escapeHtml(item.description)}</p>
                    ${item.gapCount > 0 ? `<div class="grc-gap-indicator"><span class="gap-count">${item.gapCount}</span><span>Gap ditemukan</span></div>` : '<div class="grc-no-findings">✅ Tidak ada gap</div>'}
                    ${item.notes ? `<div class="grc-notes"><strong>Catatan:</strong> ${Utils.escapeHtml(item.notes)}</div>` : ''}
                    ${linked.length > 0 ? `<div class="grc-linked-findings"><strong>Kontrol Terkait:</strong>${linked.map(c => `<span class="badge badge-${Utils.getGRCControlStatusClass(c.status)}">${Utils.escapeHtml(c.controlId+' — '+c.title)}</span>`).join('')}</div>` : ''}
                </div>`;
            }).join('')}
        </div>`;
    },
    init() {
        document.querySelectorAll('.grc-tabs .tab-item').forEach(tab => {
            tab.addEventListener('click', () => {
                GRCPage.activeTab = tab.dataset.tab;
                App.navigate('grc');
            });
        });
    }
};
