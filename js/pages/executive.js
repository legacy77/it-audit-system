/**
 * Executive / Top Management Report Page
 */
const ExecutivePage = {
    render() {
        const plans = Store.getPlans();
        const findings = Store.getFindings();
        const followups = Store.getFollowups();
        const totalAudits = plans.length;
        const completedAudits = plans.filter(p => p.status === 'completed').length;
        const totalFindings = findings.length;
        const resolved = followups.filter(f => f.status === 'resolved' || f.status === 'verified').length;
        const resolvedPct = totalFindings > 0 ? Math.round((resolved / totalFindings) * 100) : 0;
        const sevCounts = { critical: 0, high: 0, medium: 0, low: 0 };
        findings.forEach(f => { if (sevCounts[f.severity] !== undefined) sevCounts[f.severity]++; });
        const riskScore = sevCounts.critical * 4 + sevCounts.high * 3 + sevCounts.medium * 2 + sevCounts.low * 1;
        const maxRiskScore = totalFindings * 4;
        const riskPct = maxRiskScore > 0 ? Math.round((riskScore / maxRiskScore) * 100) : 0;
        let riskLevel, riskColor, riskDesc;
        if (riskPct >= 75) { riskLevel = 'CRITICAL'; riskColor = 'var(--risk-critical)'; riskDesc = 'Perlu tindakan segera'; }
        else if (riskPct >= 50) { riskLevel = 'HIGH'; riskColor = 'var(--risk-high)'; riskDesc = 'Perlu perhatian khusus'; }
        else if (riskPct >= 25) { riskLevel = 'MEDIUM'; riskColor = 'var(--risk-medium)'; riskDesc = 'Perlu monitoring'; }
        else { riskLevel = 'LOW'; riskColor = 'var(--risk-low)'; riskDesc = 'Risiko terkendali'; }
        const overdue = followups.filter(f => f.status !== 'resolved' && f.status !== 'verified' && f.targetDate && new Date(f.targetDate) < new Date()).length;
        const today = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

        return `
        <div class="exec-report-header">
            <div class="exec-report-badge">LAPORAN EKSEKUTIF</div>
            <h2 class="exec-report-title">Ringkasan Audit IT — ${today}</h2>
            <p class="exec-report-subtitle">Ringkasan hasil audit IT untuk pengambilan keputusan manajemen.</p>
        </div>
        <div class="exec-kpi-grid">
            ${this._kpiCard('blue', '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>', totalAudits, 'Total Audit', completedAudits+' selesai · '+plans.filter(p=>p.status==='in-progress').length+' aktif', 0)}
            ${this._kpiCard('orange', '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/></svg>', totalFindings, 'Total Temuan', sevCounts.critical+' kritikal · '+sevCounts.high+' tinggi', 100)}
            ${this._kpiCard('green', '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>', resolvedPct+'%', 'Tindak Lanjut', resolved+' dari '+totalFindings+' temuan', 200)}
            <div class="exec-kpi-card animate-up" style="animation-delay:300ms">
                <div class="exec-kpi-icon" style="background:${riskColor}20;color:${riskColor}"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></div>
                <div class="exec-kpi-value" style="color:${riskColor}">${riskLevel}</div>
                <div class="exec-kpi-label">Postur Risiko</div>
                <div class="exec-kpi-detail">${riskDesc}</div>
            </div>
        </div>
        <div class="exec-grid">
            <div class="card animate-up" style="animation-delay:100ms">
                <div class="card-header"><h3 class="card-title">Distribusi Temuan</h3></div>
                <div class="exec-donut-container">
                    ${this._renderDonut(sevCounts, totalFindings)}
                    <div class="exec-donut-legend">
                        <div class="legend-row"><span class="legend-color" style="background:var(--risk-critical)"></span><span>Critical</span><strong>${sevCounts.critical}</strong></div>
                        <div class="legend-row"><span class="legend-color" style="background:var(--risk-high)"></span><span>High</span><strong>${sevCounts.high}</strong></div>
                        <div class="legend-row"><span class="legend-color" style="background:var(--risk-medium)"></span><span>Medium</span><strong>${sevCounts.medium}</strong></div>
                        <div class="legend-row"><span class="legend-color" style="background:var(--risk-low)"></span><span>Low</span><strong>${sevCounts.low}</strong></div>
                    </div>
                </div>
            </div>
            <div class="card animate-up" style="animation-delay:200ms">
                <div class="card-header"><h3 class="card-title">Indikator Risiko</h3></div>
                <div class="exec-gauge-container">
                    <div class="exec-gauge">
                        <div class="gauge-track"></div>
                        <div class="gauge-fill" style="--gauge-pct:${riskPct};--gauge-color:${riskColor}"></div>
                        <div class="gauge-center"><span class="gauge-value" style="color:${riskColor}">${riskPct}%</span><span class="gauge-label">Risk Score</span></div>
                    </div>
                    <div class="gauge-scale"><span style="color:var(--risk-low)">Low</span><span style="color:var(--risk-medium)">Medium</span><span style="color:var(--risk-high)">High</span><span style="color:var(--risk-critical)">Critical</span></div>
                </div>
            </div>
            <div class="card animate-up" style="animation-delay:300ms">
                <div class="card-header"><h3 class="card-title">Progress Tiap Audit</h3></div>
                <div class="exec-audit-progress">
                    ${plans.map(p => { const cl=p.checklistItems||[]; const done=cl.filter(c=>c.completed).length; const pct=cl.length>0?Math.round((done/cl.length)*100):0; return `<div class="exec-audit-item"><div class="exec-audit-info"><span class="exec-audit-name">${Utils.escapeHtml(p.title)}</span><span class="badge badge-${Utils.getStatusClass(p.status)}">${Utils.getStatusLabel(p.status)}</span></div><div class="exec-audit-stats"><span>${Store.getFindings(p.id).length} temuan</span><span>${pct}%</span></div><div class="progress-bar" style="height:8px"><div class="progress-fill" style="width:${pct}%"></div></div></div>`; }).join('')}
                </div>
            </div>
            <div class="card animate-up" style="animation-delay:400ms">
                <div class="card-header"><h3 class="card-title">Status Tindak Lanjut</h3></div>
                ${this._renderFollowupChart(followups, findings)}
            </div>
        </div>
        <div class="card exec-conclusions animate-up" style="animation-delay:500ms">
            <div class="card-header"><h3 class="card-title">📌 Poin Penting untuk Manajemen</h3></div>
            <div class="exec-conclusions-content">${this._genConclusions(sevCounts, overdue, resolvedPct, plans, findings)}</div>
        </div>
        <div class="generate-actions" style="margin-top:var(--space-6)">
            <button class="btn btn-primary btn-lg" id="btn-exec-pdf"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> Export PDF</button>
        </div>`;
    },
    _kpiCard(color, icon, value, label, detail, delay) {
        return `<div class="exec-kpi-card animate-up" style="animation-delay:${delay}ms"><div class="exec-kpi-icon ${color}">${icon}</div><div class="exec-kpi-value">${value}</div><div class="exec-kpi-label">${label}</div><div class="exec-kpi-detail">${detail}</div></div>`;
    },
    _renderDonut(s, total) {
        if (total === 0) return '<div style="text-align:center;padding:var(--space-8);color:var(--text-muted)">Belum ada data</div>';
        const c = ['var(--risk-critical)','var(--risk-high)','var(--risk-medium)','var(--risk-low)'];
        const v = [s.critical, s.high, s.medium, s.low]; let cum = 0; const seg = [];
        v.forEach((val, i) => { if (val > 0) { const p = (val/total)*100; seg.push(`${c[i]} ${cum}% ${cum+p}%`); cum += p; } });
        return `<div class="exec-donut" style="background:conic-gradient(${seg.join(', ')})"><div class="exec-donut-inner"><span class="donut-total">${total}</span><span class="donut-label">Temuan</span></div></div>`;
    },
    _renderFollowupChart(followups, findings) {
        const open = findings.length - followups.length + followups.filter(f => f.status === 'open').length;
        const inp = followups.filter(f => f.status === 'in-progress').length;
        const res = followups.filter(f => f.status === 'resolved' || f.status === 'verified').length;
        const mx = Math.max(open, inp, res, 1);
        return `<div class="exec-followup-chart">
            <div class="exec-hbar-group"><span class="exec-hbar-label">Belum</span><div class="exec-hbar-track"><div class="exec-hbar-fill" style="width:${(open/mx)*100}%;background:var(--text-muted)"></div></div><span class="exec-hbar-value">${open}</span></div>
            <div class="exec-hbar-group"><span class="exec-hbar-label">Proses</span><div class="exec-hbar-track"><div class="exec-hbar-fill" style="width:${(inp/mx)*100}%;background:var(--warning)"></div></div><span class="exec-hbar-value">${inp}</span></div>
            <div class="exec-hbar-group"><span class="exec-hbar-label">Selesai</span><div class="exec-hbar-track"><div class="exec-hbar-fill" style="width:${(res/mx)*100}%;background:var(--success)"></div></div><span class="exec-hbar-value">${res}</span></div>
        </div><div style="font-size:var(--font-xs);color:var(--text-muted);text-align:center;margin-top:var(--space-3)">Total: ${findings.length} · Penyelesaian: ${findings.length>0?Math.round((res/findings.length)*100):0}%</div>`;
    },
    _genConclusions(sev, overdue, resPct, plans, findings) {
        let h = '';
        if (sev.critical > 0) h += `<div class="conclusion-item critical"><span class="conclusion-icon">🔴</span><span>Terdapat <strong>${sev.critical} temuan kritikal</strong> yang memerlukan tindakan segera.</span></div>`;
        if (overdue > 0) h += `<div class="conclusion-item warning"><span class="conclusion-icon">⚠️</span><span><strong>${overdue} tindak lanjut</strong> melewati tenggat waktu.</span></div>`;
        if (resPct >= 80) h += `<div class="conclusion-item success"><span class="conclusion-icon">✅</span><span>Penyelesaian tindak lanjut <strong>${resPct}%</strong> — respon baik.</span></div>`;
        else if (resPct < 50) h += `<div class="conclusion-item warning"><span class="conclusion-icon">⚠️</span><span>Penyelesaian tindak lanjut masih <strong>${resPct}%</strong>. Perlu dipercepat.</span></div>`;
        else h += `<div class="conclusion-item info"><span class="conclusion-icon">📊</span><span>Penyelesaian tindak lanjut <strong>${resPct}%</strong>. Perlu ditingkatkan.</span></div>`;
        const active = plans.filter(p => p.status === 'in-progress').length;
        if (active > 0) h += `<div class="conclusion-item info"><span class="conclusion-icon">📋</span><span><strong>${active} audit</strong> sedang berjalan.</span></div>`;
        const cats = [...new Set(findings.filter(f => f.severity === 'critical' || f.severity === 'high').map(f => f.category))];
        if (cats.length > 0) h += `<div class="conclusion-item info"><span class="conclusion-icon">🎯</span><span>Area risiko utama: <strong>${cats.join(', ')}</strong></span></div>`;
        return h;
    },
    init() {
        document.getElementById('btn-exec-pdf')?.addEventListener('click', () => {
            const el = document.getElementById('page-content');
            if (!el || typeof html2pdf === 'undefined') { Utils.showToast('Tidak dapat generate PDF', 'error'); return; }
            Utils.showToast('Generating PDF...', 'info');
            html2pdf().set({ margin: [10,10,10,10], filename: 'Laporan_Eksekutif_Audit_IT.pdf', image: { type: 'jpeg', quality: 0.98 }, html2canvas: { scale: 2 }, jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' } }).from(el).save().then(() => Utils.showToast('PDF berhasil!', 'success'));
        });
    }
};
