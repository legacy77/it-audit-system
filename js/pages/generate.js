/**
 * Generate Laporan / Report Generation Page
 */
const GeneratePage = {
    render() {
        const plans = Store.getPlans();

        return `
        <div style="margin-bottom:var(--space-6)">
            <div class="form-row" style="max-width:600px">
                <div class="form-group">
                    <label>Pilih Audit Plan</label>
                    <select id="gen-plan-select">
                        <option value="">-- Pilih Audit --</option>
                        ${plans.map(p => `<option value="${p.id}">${Utils.escapeHtml(p.title)}</option>`).join('')}
                    </select>
                </div>
            </div>
        </div>

        <div class="generate-actions" id="gen-actions" style="display:none">
            <button class="btn btn-primary btn-lg" id="btn-export-pdf">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                Export ke PDF
            </button>
            <button class="btn btn-secondary btn-lg" id="btn-print">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
                Print
            </button>
        </div>

        <div id="report-preview-container">
            <div class="empty-state">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                </svg>
                <p>Pilih audit plan untuk preview laporan</p>
            </div>
        </div>`;
    },

    _generateReport(planId) {
        const plan = Store.getPlanById(planId);
        if (!plan) return '';

        const findings = Store.getFindings(planId);
        const followups = Store.getFollowups();
        const grcControls = Store.getGRCControls();
        const riskAreas = plan.riskAreas || [];
        const checklist = plan.checklistItems || [];
        const completedChecklist = checklist.filter(c => c.completed).length;

        // Severity stats
        const sevCounts = { critical: 0, high: 0, medium: 0, low: 0 };
        findings.forEach(f => { if (sevCounts[f.severity] !== undefined) sevCounts[f.severity]++; });

        const today = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

        return `
        <div class="report-preview" id="report-pdf-content">
            <!-- Cover -->
            <div class="report-cover">
                <p style="font-size:12px;color:#a0aec0;text-transform:uppercase;letter-spacing:2px;margin-bottom:8px">Laporan Hasil Audit</p>
                <h1>${Utils.escapeHtml(plan.title)}</h1>
                <p class="subtitle">Risk-Based IT Audit Report</p>
                <div class="date">${today}</div>
                <div style="margin-top:20px;font-size:13px;color:#718096">
                    <div>Auditor: ${Utils.escapeHtml(plan.auditor || '-')}</div>
                    <div>Department: ${Utils.escapeHtml(plan.department || '-')}</div>
                    <div>Periode: ${Utils.formatDate(plan.startDate)} — ${Utils.formatDate(plan.endDate)}</div>
                </div>
            </div>

            <!-- Executive Summary -->
            <h2>1. Executive Summary</h2>
            <p>${Utils.escapeHtml(plan.scope)}</p>
            <p style="margin-top:8px">Audit ini mengidentifikasi <strong>${findings.length} temuan</strong> dengan rincian sebagai berikut:</p>
            <table style="width:100%;margin:12px 0">
                <thead>
                    <tr><th>Severity</th><th style="text-align:center">Jumlah</th></tr>
                </thead>
                <tbody>
                    <tr><td style="color:#e03131;font-weight:600">Critical</td><td style="text-align:center">${sevCounts.critical}</td></tr>
                    <tr><td style="color:#f76707;font-weight:600">High</td><td style="text-align:center">${sevCounts.high}</td></tr>
                    <tr><td style="color:#fab005;font-weight:600">Medium</td><td style="text-align:center">${sevCounts.medium}</td></tr>
                    <tr><td style="color:#40c057;font-weight:600">Low</td><td style="text-align:center">${sevCounts.low}</td></tr>
                </tbody>
            </table>

            <!-- Risk Assessment -->
            <h2>2. Risk Assessment</h2>
            ${riskAreas.length === 0
                ? '<p>Tidak ada risk area yang didefinisikan.</p>'
                : `
                <table style="width:100%">
                    <thead>
                        <tr><th>Area Risiko</th><th style="text-align:center">Likelihood</th><th style="text-align:center">Impact</th><th style="text-align:center">Score</th><th>Risk Level</th></tr>
                    </thead>
                    <tbody>
                        ${riskAreas.map(ra => {
                            const score = Utils.calculateRiskScore(ra.likelihood, ra.impact);
                            const risk = Utils.getRiskLevel(score);
                            return `
                            <tr>
                                <td>${Utils.escapeHtml(ra.area)}</td>
                                <td style="text-align:center">${ra.likelihood}</td>
                                <td style="text-align:center">${ra.impact}</td>
                                <td style="text-align:center;font-weight:700">${score}</td>
                                <td style="color:${risk.color};font-weight:600">${risk.level}</td>
                            </tr>`;
                        }).join('')}
                    </tbody>
                </table>
            `}

            <!-- Audit Progress -->
            <h2>3. Progress Audit</h2>
            <p>Status: <strong>${Utils.getStatusLabel(plan.status)}</strong></p>
            ${checklist.length > 0 ? `
                <p>Checklist selesai: ${completedChecklist} dari ${checklist.length} item (${Math.round(completedChecklist/checklist.length*100)}%)</p>
                <table style="width:100%">
                    <thead>
                        <tr><th>No</th><th>Item</th><th style="text-align:center">Status</th></tr>
                    </thead>
                    <tbody>
                        ${checklist.map((cl, i) => `
                            <tr>
                                <td>${i + 1}</td>
                                <td>${Utils.escapeHtml(cl.text)}</td>
                                <td style="text-align:center;color:${cl.completed ? '#40c057' : '#fa5252'}">${cl.completed ? '✓ Selesai' : '✕ Belum'}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            ` : '<p>Tidak ada checklist yang didefinisikan.</p>'}

            <!-- Detail Findings -->
            <h2>4. Detail Temuan</h2>
            ${findings.length === 0
                ? '<p>Tidak ada temuan yang tercatat.</p>'
                : findings.map((f, i) => `
                    <h3>4.${i + 1}. ${Utils.escapeHtml(f.title)}</h3>
                    <table style="width:100%">
                        <tr><td style="width:120px;font-weight:600">Severity</td><td style="color:${Utils.getRiskLevel(f.severity === 'critical' ? 20 : f.severity === 'high' ? 15 : f.severity === 'medium' ? 10 : 5).color};font-weight:600">${f.severity.toUpperCase()}</td></tr>
                        <tr><td style="font-weight:600">Kategori</td><td>${Utils.escapeHtml(f.category)}</td></tr>
                        <tr><td style="font-weight:600">Deskripsi</td><td>${Utils.escapeHtml(f.description)}</td></tr>
                        <tr><td style="font-weight:600">Evidence</td><td>${Utils.escapeHtml(f.evidence || '-')}</td></tr>
                        <tr><td style="font-weight:600">Rekomendasi</td><td>${Utils.escapeHtml(f.recommendation)}</td></tr>
                    </table>
                `).join('')
            }

            <!-- Status Tindak Lanjut -->
            <h2>5. Status Tindak Lanjut</h2>
            ${findings.length === 0
                ? '<p>Tidak ada temuan.</p>'
                : `
                <table style="width:100%">
                    <thead>
                        <tr><th>No</th><th>Temuan</th><th>PIC</th><th>Status</th><th>Target</th></tr>
                    </thead>
                    <tbody>
                        ${findings.map((f, i) => {
                            const fu = followups.find(x => x.findingId === f.id);
                            return `
                            <tr>
                                <td>${i + 1}</td>
                                <td>${Utils.escapeHtml(f.title)}</td>
                                <td>${Utils.escapeHtml(fu?.pic || '-')}</td>
                                <td style="font-weight:600;color:${fu?.status === 'resolved' || fu?.status === 'verified' ? '#40c057' : fu?.status === 'in-progress' ? '#fab005' : '#868e96'}">${Utils.getFollowupStatusLabel(fu?.status || 'open')}</td>
                                <td>${fu?.targetDate ? Utils.formatDate(fu.targetDate) : '-'}</td>
                            </tr>`;
                        }).join('')}
                    </tbody>
                </table>
            `}

            <!-- GRC Mapping -->
            <h2>6. Pemetaan GRC (Kontrol)</h2>
            ${grcControls.length === 0
                ? '<p>Belum ada pemetaan kontrol GRC.</p>'
                : `
                <table style="width:100%">
                    <thead>
                        <tr><th>Control ID</th><th>Nama Kontrol</th><th>Framework</th><th>Status</th><th>Temuan Terkait</th></tr>
                    </thead>
                    <tbody>
                        ${grcControls.map(c => {
                            const linkedFromFindings = findings.filter(f => (f.grcControls || []).includes(c.id));
                            const linkedFromControl = (c.linkedFindings || []).map(fid => findings.find(f => f.id === fid)).filter(Boolean);
                            const allLinked = [...new Map([...linkedFromFindings, ...linkedFromControl].map(f => [f.id, f])).values()];
                            
                            if (allLinked.length === 0) return '';

                            return `
                            <tr>
                                <td style="font-weight:600">${Utils.escapeHtml(c.controlId)}</td>
                                <td>${Utils.escapeHtml(c.title)}</td>
                                <td>${Utils.escapeHtml(c.framework)}</td>
                                <td style="font-weight:600;color:${c.status === 'implemented' ? '#40c057' : c.status === 'partial' ? '#fab005' : '#e03131'}">${Utils.getGRCControlStatusLabel(c.status)}</td>
                                <td>${allLinked.map(f => Utils.escapeHtml(f.title)).join(', ')}</td>
                            </tr>`;
                        }).join('')}
                        ${grcControls.every(c => !findings.some(f => (f.grcControls||[]).includes(c.id)) && !c.linkedFindings.some(fid => findings.find(f => f.id === fid))) ? '<tr><td colspan="5" style="text-align:center;color:#a0aec0">Tidak ada kontrol terkait temuan audit ini</td></tr>' : ''}
                    </tbody>
                </table>
            `}

            <!-- GRC Risk Mapping -->
            <h2>7. Pemetaan Risiko GRC</h2>
            ${grcRisks.length === 0
                ? '<p>Belum ada pemetaan risiko GRC.</p>'
                : `
                <table style="width:100%">
                    <thead>
                        <tr><th>Risk ID</th><th>Nama Risiko</th><th>Category</th><th>Risk Level</th><th>Temuan Terkait</th></tr>
                    </thead>
                    <tbody>
                        ${grcRisks.map(r => {
                            const linkedFromFindings = findings.filter(f => (f.grcRisks || []).includes(r.id));
                            const linkedFromRisk = (r.linkedFindings || []).map(fid => findings.find(f => f.id === fid)).filter(Boolean);
                            const allLinked = [...new Map([...linkedFromFindings, ...linkedFromRisk].map(f => [f.id, f])).values()];
                            
                            if (allLinked.length === 0) return '';
                            
                            const score = r.residualLikelihood * r.residualImpact;
                            const rk = Utils.getRiskLevel(score);

                            return `
                            <tr>
                                <td style="font-weight:600">${Utils.escapeHtml(r.riskId)}</td>
                                <td>${Utils.escapeHtml(r.title)}</td>
                                <td>${Utils.escapeHtml(r.category)}</td>
                                <td style="color:${rk.color};font-weight:600">${rk.level}</td>
                                <td>${allLinked.map(f => Utils.escapeHtml(f.title)).join(', ')}</td>
                            </tr>`;
                        }).join('')}
                    </tbody>
                </table>
            `}

            <!-- Recommendations Summary -->
            <h2>8. Ringkasan Rekomendasi</h2>
            ${findings.length === 0
                ? '<p>Tidak ada rekomendasi.</p>'
                : `
                <table style="width:100%">
                    <thead>
                        <tr><th>No</th><th>Temuan</th><th>Severity</th><th>Rekomendasi</th></tr>
                    </thead>
                    <tbody>
                        ${findings.map((f, i) => `
                            <tr>
                                <td>${i + 1}</td>
                                <td>${Utils.escapeHtml(f.title)}</td>
                                <td style="font-weight:600">${f.severity.toUpperCase()}</td>
                                <td>${Utils.escapeHtml(f.recommendation)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `}

            <!-- Footer -->
            <div style="margin-top:40px;padding-top:20px;border-top:2px solid #e2e8f0;text-align:center;font-size:11px;color:#a0aec0">
                <p>Dokumen ini dihasilkan oleh AuditPro — Risk-Based IT Audit System</p>
                <p>Generated: ${today}</p>
            </div>
        </div>`;
    },

    init() {
        document.getElementById('gen-plan-select')?.addEventListener('change', (e) => {
            const planId = e.target.value;
            const container = document.getElementById('report-preview-container');
            const actions = document.getElementById('gen-actions');

            if (planId) {
                container.innerHTML = GeneratePage._generateReport(planId);
                actions.style.display = 'flex';
            } else {
                container.innerHTML = `
                    <div class="empty-state">
                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                        <p>Pilih audit plan untuk preview laporan</p>
                    </div>`;
                actions.style.display = 'none';
            }
        });

        // Export PDF
        document.getElementById('btn-export-pdf')?.addEventListener('click', () => {
            const element = document.getElementById('report-pdf-content');
            if (!element) { Utils.showToast('Pilih audit plan terlebih dahulu', 'warning'); return; }

            if (typeof html2pdf === 'undefined') {
                Utils.showToast('Library html2pdf belum dimuat. Coba refresh halaman.', 'error');
                return;
            }

            Utils.showToast('Generating PDF...', 'info');

            const plan = Store.getPlanById(document.getElementById('gen-plan-select').value);
            const filename = `Laporan_Audit_${(plan?.title || 'Report').replace(/\s+/g, '_')}.pdf`;

            html2pdf().set({
                margin: [10, 10, 10, 10],
                filename: filename,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2, useCORS: true },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
                pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
            }).from(element).save().then(() => {
                Utils.showToast('PDF berhasil di-generate!', 'success');
            }).catch(() => {
                Utils.showToast('Gagal generate PDF', 'error');
            });
        });

        // Print
        document.getElementById('btn-print')?.addEventListener('click', () => {
            const element = document.getElementById('report-pdf-content');
            if (!element) { Utils.showToast('Pilih audit plan terlebih dahulu', 'warning'); return; }

            const w = window.open('', '_blank');
            w.document.write(`
                <html><head><title>Laporan Audit</title>
                <style>
                    body { font-family: 'Inter', sans-serif; color: #1a1a2e; padding: 20px; }
                    table { width: 100%; border-collapse: collapse; margin: 12px 0; }
                    th, td { padding: 8px 12px; border: 1px solid #e2e8f0; text-align: left; font-size: 12px; }
                    th { background: #edf2f7; font-weight: 600; }
                    h1 { font-size: 24px; text-align: center; }
                    h2 { font-size: 18px; border-bottom: 2px solid #4263eb; padding-bottom: 8px; margin: 24px 0 16px; }
                    h3 { font-size: 14px; margin: 16px 0 8px; }
                    p { font-size: 13px; line-height: 1.7; }
                    @media print { body { padding: 0; } }
                </style>
                </head><body>${element.innerHTML}</body></html>
            `);
            w.document.close();
            w.print();
        });
    }
};
