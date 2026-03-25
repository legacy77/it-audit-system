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
            ${Components.statCard('<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8-10 8 10z"/></svg>', total, 'Total Kontrol', 'blue')}
            ${Components.statCard('<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>', implemented, 'Diterapkan', 'green', 100)}
            ${Components.statCard('<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>', partial, 'Sebagian', 'yellow', 200)}
            ${Components.statCard('<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>', notImpl, 'Belum Diterapkan', 'red', 300)}
        </div>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--space-4)">
            <h3 style="font-size:var(--font-md);font-weight:700">Daftar Kontrol Framework</h3>
            <button class="btn btn-primary btn-sm" id="btn-add-control">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                Tambah Kontrol
            </button>
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
                        <div style="display:flex;gap:var(--space-2);align-items:center">
                            <span class="badge badge-${Utils.getGRCControlStatusClass(c.status)}">${Utils.getGRCControlStatusLabel(c.status)}</span>
                            <button class="btn btn-sm btn-secondary btn-edit-control" data-id="${c.id}">✏️</button>
                            <button class="btn btn-sm btn-danger btn-delete-control" data-id="${c.id}">🗑️</button>
                        </div>
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
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--space-4)">
            <h3 style="font-size:var(--font-md);font-weight:700">Risk Register Management</h3>
            <button class="btn btn-primary btn-sm" id="btn-add-risk">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                Tambah Risiko
            </button>
        </div>
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
                        <div style="display:flex;gap:var(--space-2);align-items:center">
                            <span class="badge badge-${r.mitigationStatus==='resolved'?'completed':r.mitigationStatus==='in-progress'?'in-progress':'critical'}">${r.mitigationStatus==='resolved'?'Resolved':r.mitigationStatus==='in-progress'?'In Progress':'Open'}</span>
                            <button class="btn btn-sm btn-secondary btn-edit-risk" data-id="${r.id}">✏️</button>
                            <button class="btn btn-sm btn-danger btn-delete-risk" data-id="${r.id}">🗑️</button>
                        </div>
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
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--space-4)">
            <h3 style="font-size:var(--font-md);font-weight:700">Compliance Tracking</h3>
            <button class="btn btn-primary btn-sm" id="btn-add-compliance">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                Tambah Requirement
            </button>
        </div>
        <div class="grc-compliance-list">
            ${items.map(item => {
                const linked = (item.linkedControls||[]).map(cid => controls.find(c => c.id === cid)).filter(Boolean);
                return `
                <div class="grc-compliance-card animate-up">
                    <div class="grc-control-header">
                        <div><span class="grc-control-id">${Utils.escapeHtml(item.regulation)}</span><h4>${Utils.escapeHtml(item.requirement)}</h4></div>
                        <div style="display:flex;gap:var(--space-2);align-items:center">
                            <span class="badge badge-${Utils.getComplianceStatusClass(item.status)}">${Utils.getComplianceStatusLabel(item.status)}</span>
                            <button class="btn btn-sm btn-secondary btn-edit-compliance" data-id="${item.id}">✏️</button>
                            <button class="btn btn-sm btn-danger btn-delete-compliance" data-id="${item.id}">🗑️</button>
                        </div>
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

        // Add Handlers
        document.getElementById('btn-add-control')?.addEventListener('click', () => this.showControlForm());
        document.getElementById('btn-add-risk')?.addEventListener('click', () => this.showRiskForm());
        document.getElementById('btn-add-compliance')?.addEventListener('click', () => this.showComplianceForm());

        // Edit Handlers
        document.querySelectorAll('.btn-edit-control').forEach(btn => btn.addEventListener('click', () => this.showControlForm(btn.dataset.id)));
        document.querySelectorAll('.btn-edit-risk').forEach(btn => btn.addEventListener('click', () => this.showRiskForm(btn.dataset.id)));
        document.querySelectorAll('.btn-edit-compliance').forEach(btn => btn.addEventListener('click', () => this.showComplianceForm(btn.dataset.id)));

        // Delete Handlers
        document.querySelectorAll('.btn-delete-control').forEach(btn => btn.addEventListener('click', () => { if(confirm('Hapus kontrol ini?')) { Store._set(Store.KEYS.GRC_CONTROLS, Store.getGRCControls().filter(c => c.id !== btn.dataset.id)); App.navigate('grc'); } }));
        document.querySelectorAll('.btn-delete-risk').forEach(btn => btn.addEventListener('click', () => { if(confirm('Hapus risiko ini?')) { Store._set(Store.KEYS.GRC_RISKS, Store.getGRCRisks().filter(r => r.id !== btn.dataset.id)); App.navigate('grc'); } }));
        document.querySelectorAll('.btn-delete-compliance').forEach(btn => btn.addEventListener('click', () => { if(confirm('Hapus requirement ini?')) { Store._set(Store.KEYS.GRC_COMPLIANCE, Store.getGRCCompliance().filter(i => i.id !== btn.dataset.id)); App.navigate('grc'); } }));
    },

    showControlForm(id) {
        const controls = Store.getGRCControls();
        const findings = Store.getFindings();
        const control = id ? controls.find(c => c.id === id) : null;
        const body = `
        <form id="control-form">
            <div class="form-row">
                <div class="form-group"><label>Control ID</label><input type="text" id="gc-controlId" value="${control?.controlId||''}" placeholder="e.g. A.8.20"></div>
                <div class="form-group"><label>Title</label><input type="text" id="gc-title" value="${control?.title||''}" placeholder="Nama Kontrol"></div>
            </div>
            <div class="form-row">
                <div class="form-group"><label>Framework</label><input type="text" id="gc-framework" value="${control?.framework||'ISO 27001:2022'}"></div>
                <div class="form-group"><label>Domain</label><select id="gc-domain">
                    <option value="Governance" ${control?.domain==='Governance'?'selected':''}>Governance</option>
                    <option value="Technology" ${control?.domain==='Technology'?'selected':''}>Technology</option>
                    <option value="People" ${control?.domain==='People'?'selected':''}>People</option>
                    <option value="Process" ${control?.domain==='Process'?'selected':''}>Process</option>
                </select></div>
            </div>
            <div class="form-group"><label>Description</label><textarea id="gc-desc">${control?.description||''}</textarea></div>
            <div class="form-group"><label>Status</label><select id="gc-status">
                <option value="implemented" ${control?.status==='implemented'?'selected':''}>Implemented</option>
                <option value="partial" ${control?.status==='partial'?'selected':''}>Partial</option>
                <option value="not-implemented" ${control?.status==='not-implemented'?'selected':''}>Not Implemented</option>
            </select></div>
            <div class="form-group"><label>Linked Findings (IDs separated by comma)</label><input type="text" id="gc-linked" value="${(control?.linkedFindings||[]).join(', ')}" placeholder="f1, f2, ..."></div>
        </form>`;
        Utils.openModal(id?'Edit Control':'Tambah Kontrol GRC', body, `
            <button class="btn btn-secondary" onclick="Utils.closeModal()">Batal</button>
            <button class="btn btn-primary" id="btn-save-control">Simpan</button>
        `);
        document.getElementById('btn-save-control').addEventListener('click', () => {
            const data = {
                id: control?.id,
                controlId: document.getElementById('gc-controlId').value,
                title: document.getElementById('gc-title').value,
                framework: document.getElementById('gc-framework').value,
                domain: document.getElementById('gc-domain').value,
                description: document.getElementById('gc-desc').value,
                status: document.getElementById('gc-status').value,
                linkedFindings: document.getElementById('gc-linked').value.split(',').map(s => s.trim()).filter(Boolean)
            };
            Store.saveGRCControl(data);
            Utils.closeModal();
            App.navigate('grc');
        });
    },

    showRiskForm(id) {
        const risks = Store.getGRCRisks();
        const risk = id ? risks.find(r => r.id === id) : null;
        const body = `
        <form id="risk-form">
            <div class="form-row">
                <div class="form-group"><label>Risk ID</label><input type="text" id="gr-riskId" value="${risk?.riskId||''}" placeholder="e.g. R-001"></div>
                <div class="form-group"><label>Title</label><input type="text" id="gr-title" value="${risk?.title||''}" placeholder="Nama Risiko"></div>
            </div>
            <div class="form-row">
                <div class="form-group"><label>Category</label><input type="text" id="gr-category" value="${risk?.category||''}"></div>
                <div class="form-group"><label>Owner</label><input type="text" id="gr-owner" value="${risk?.owner||''}"></div>
            </div>
            <div class="form-group"><label>Description</label><textarea id="gr-desc">${risk?.description||''}</textarea></div>
            <div class="form-row">
                <div class="form-group"><label>Inherent L (1-5)</label><input type="number" id="gr-inhL" min="1" max="5" value="${risk?.inherentLikelihood||3}"></div>
                <div class="form-group"><label>Inherent I (1-5)</label><input type="number" id="gr-inhI" min="1" max="5" value="${risk?.inherentImpact||3}"></div>
            </div>
            <div class="form-row">
                <div class="form-group"><label>Residual L (1-5)</label><input type="number" id="gr-resL" min="1" max="5" value="${risk?.residualLikelihood||2}"></div>
                <div class="form-group"><label>Residual I (1-5)</label><input type="number" id="gr-resI" min="1" max="5" value="${risk?.residualImpact||2}"></div>
            </div>
            <div class="form-row">
                <div class="form-group"><label>Mitigation Status</label><select id="gr-status">
                    <option value="open" ${risk?.mitigationStatus==='open'?'selected':''}>Open</option>
                    <option value="in-progress" ${risk?.mitigationStatus==='in-progress'?'selected':''}>In Progress</option>
                    <option value="resolved" ${risk?.mitigationStatus==='resolved'?'selected':''}>Resolved</option>
                </select></div>
                <div class="form-group"><label>Treatment</label><select id="gr-treatment">
                    <option value="Mitigate" ${risk?.treatment==='Mitigate'?'selected':''}>Mitigate</option>
                    <option value="Transfer" ${risk?.treatment==='Transfer'?'selected':''}>Transfer</option>
                    <option value="Avoid" ${risk?.treatment==='Avoid'?'selected':''}>Avoid</option>
                    <option value="Accept" ${risk?.treatment==='Accept'?'selected':''}>Accept</option>
                </select></div>
            </div>
            <div class="form-group"><label>Linked Findings (IDs)</label><input type="text" id="gr-linked" value="${(risk?.linkedFindings||[]).join(', ')}"></div>
            <div class="form-group"><label>Controls (IDs)</label><input type="text" id="gr-controls" value="${(risk?.controls||[]).join(', ')}"></div>
        </form>`;
        Utils.openModal(id?'Edit Risk':'Tambah Risiko GRC', body, `
            <button class="btn btn-secondary" onclick="Utils.closeModal()">Batal</button>
            <button class="btn btn-primary" id="btn-save-risk">Simpan</button>
        `);
        document.getElementById('btn-save-risk').addEventListener('click', () => {
            const data = {
                id: risk?.id,
                riskId: document.getElementById('gr-riskId').value,
                title: document.getElementById('gr-title').value,
                category: document.getElementById('gr-category').value,
                owner: document.getElementById('gr-owner').value,
                description: document.getElementById('gr-desc').value,
                inherentLikelihood: parseInt(document.getElementById('gr-inhL').value),
                inherentImpact: parseInt(document.getElementById('gr-inhI').value),
                residualLikelihood: parseInt(document.getElementById('gr-resL').value),
                residualImpact: parseInt(document.getElementById('gr-resI').value),
                mitigationStatus: document.getElementById('gr-status').value,
                treatment: document.getElementById('gr-treatment').value,
                linkedFindings: document.getElementById('gr-linked').value.split(',').map(s => s.trim()).filter(Boolean),
                controls: document.getElementById('gr-controls').value.split(',').map(s => s.trim()).filter(Boolean)
            };
            Store.saveGRCRisk(data);
            Utils.closeModal();
            App.navigate('grc');
        });
    },

    showComplianceForm(id) {
        const items = Store.getGRCCompliance();
        const item = id ? items.find(i => i.id === id) : null;
        const body = `
        <form id="compliance-form">
            <div class="form-row">
                <div class="form-group"><label>Regulation</label><input type="text" id="gcp-reg" value="${item?.regulation||''}" placeholder="e.g. ISO 27001"></div>
                <div class="form-group"><label>Requirement</label><input type="text" id="gcp-req" value="${item?.requirement||''}" placeholder="Label Persyaratan"></div>
            </div>
            <div class="form-group"><label>Description</label><textarea id="gcp-desc">${item?.description||''}</textarea></div>
            <div class="form-row">
                <div class="form-group"><label>Status</label><select id="gcp-status">
                    <option value="compliant" ${item?.status==='compliant'?'selected':''}>Compliant</option>
                    <option value="partial" ${item?.status==='partial'?'selected':''}>Partial</option>
                    <option value="non-compliant" ${item?.status==='non-compliant'?'selected':''}>Non-Compliant</option>
                </select></div>
                <div class="form-group"><label>Gap Count</label><input type="number" id="gcp-gap" value="${item?.gapCount||0}"></div>
            </div>
            <div class="form-group"><label>Notes</label><textarea id="gcp-notes">${item?.notes||''}</textarea></div>
            <div class="form-group"><label>Linked Controls (IDs)</label><input type="text" id="gcp-linked" value="${(item?.linkedControls||[]).join(', ')}"></div>
        </form>`;
        Utils.openModal(id?'Edit Compliance':'Tambah Persyaratan Kepatuhan', body, `
            <button class="btn btn-secondary" onclick="Utils.closeModal()">Batal</button>
            <button class="btn btn-primary" id="btn-save-compliance">Simpan</button>
        `);
        document.getElementById('btn-save-compliance').addEventListener('click', () => {
            const data = {
                id: item?.id,
                regulation: document.getElementById('gcp-reg').value,
                requirement: document.getElementById('gcp-req').value,
                description: document.getElementById('gcp-desc').value,
                status: document.getElementById('gcp-status').value,
                gapCount: parseInt(document.getElementById('gcp-gap').value),
                notes: document.getElementById('gcp-notes').value,
                linkedControls: document.getElementById('gcp-linked').value.split(',').map(s => s.trim()).filter(Boolean)
            };
            Store.saveGRCCompliance(data);
            Utils.closeModal();
            App.navigate('grc');
        });
    }
};
