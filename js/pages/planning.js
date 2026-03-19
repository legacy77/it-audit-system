/**
 * Perencanaan Audit Page
 */
const PlanningPage = {
    render() {
        const plans = Store.getPlans();

        return `
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:var(--space-6);flex-wrap:wrap;gap:var(--space-4)">
            <div class="search-bar">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <input type="text" id="plan-search" placeholder="Cari audit plan...">
            </div>
            <button class="btn btn-primary" id="btn-add-plan">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                Buat Audit Plan
            </button>
        </div>

        <!-- Risk Matrix Reference -->
        <div class="card" style="margin-bottom:var(--space-6)">
            <div class="card-header">
                <h3 class="card-title">Risk Assessment Matrix (Likelihood × Impact)</h3>
            </div>
            ${Components.riskMatrix()}
            <div style="display:flex;gap:var(--space-4);margin-top:var(--space-3);flex-wrap:wrap">
                <span class="badge badge-critical">Critical (20-25)</span>
                <span class="badge badge-high">High (15-19)</span>
                <span class="badge badge-medium">Medium (10-14)</span>
                <span class="badge badge-low">Low (5-9)</span>
                <span class="badge badge-info">Very Low (1-4)</span>
            </div>
        </div>

        <div class="audit-plans-list" id="plans-list">
            ${plans.length === 0
                ? Components.emptyState('Belum ada audit plan. Buat audit plan pertama Anda.', 'Buat Audit Plan', 'btn-add-plan-empty')
                : plans.map((p, idx) => this._planCard(p, idx)).join('')
            }
        </div>`;
    },

    _planCard(plan, idx) {
        const findings = Store.getFindings(plan.id);
        const completedChecklist = (plan.checklistItems || []).filter(c => c.completed).length;
        const totalChecklist = (plan.checklistItems || []).length;

        return `
        <div class="audit-plan-card" style="animation-delay:${idx * 80}ms" data-id="${plan.id}">
            <div class="plan-card-header">
                <h3 class="plan-card-title">${Utils.escapeHtml(plan.title)}</h3>
                ${Components.badge(Utils.getStatusLabel(plan.status), Utils.getStatusClass(plan.status))}
            </div>
            <p style="font-size:var(--font-sm);color:var(--text-secondary);margin-bottom:var(--space-3)">${Utils.escapeHtml(plan.scope)}</p>
            <div class="plan-card-meta">
                <span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    ${Utils.escapeHtml(plan.auditor)}
                </span>
                <span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                    ${Utils.formatDate(plan.startDate)} — ${Utils.formatDate(plan.endDate)}
                </span>
                <span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
                    ${Utils.escapeHtml(plan.department || '-')}
                </span>
                <span>📋 ${findings.length} Findings</span>
            </div>
            ${totalChecklist > 0 ? `
                <div style="margin-bottom:var(--space-3)">
                    <div style="font-size:var(--font-xs);color:var(--text-muted);margin-bottom:var(--space-2)">Progress Checklist</div>
                    ${Components.progressBar(completedChecklist, totalChecklist)}
                </div>
            ` : ''}
            ${Components.riskMatrixSmall(plan.riskAreas)}
            <div class="plan-actions">
                <button class="btn btn-sm btn-secondary btn-edit-plan" data-id="${plan.id}">✏️ Edit</button>
                <button class="btn btn-sm btn-secondary btn-view-risk" data-id="${plan.id}">📊 Risk Detail</button>
                <button class="btn btn-sm btn-danger btn-delete-plan" data-id="${plan.id}">🗑️ Hapus</button>
            </div>
        </div>`;
    },

    init() {
        // Add plan button
        document.querySelectorAll('#btn-add-plan, #btn-add-plan-empty').forEach(btn => {
            btn?.addEventListener('click', () => PlanningPage.showPlanForm());
        });

        // Search
        document.getElementById('plan-search')?.addEventListener('input', (e) => {
            const q = e.target.value.toLowerCase();
            document.querySelectorAll('.audit-plan-card').forEach(card => {
                const title = card.querySelector('.plan-card-title')?.textContent.toLowerCase() || '';
                card.style.display = title.includes(q) ? '' : 'none';
            });
        });

        // Edit/Delete/View Risk
        document.querySelectorAll('.btn-edit-plan').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                PlanningPage.showPlanForm(btn.dataset.id);
            });
        });

        document.querySelectorAll('.btn-delete-plan').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (confirm('Hapus audit plan ini beserta semua findings?')) {
                    Store.deletePlan(btn.dataset.id);
                    Utils.showToast('Audit plan dihapus', 'success');
                    App.navigate('planning');
                }
            });
        });

        document.querySelectorAll('.btn-view-risk').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                PlanningPage.showRiskDetail(btn.dataset.id);
            });
        });
    },

    showPlanForm(id) {
        const plan = id ? Store.getPlanById(id) : null;
        const isEdit = !!plan;
        const riskAreas = plan ? (plan.riskAreas || []) : [];
        const checklist = plan ? (plan.checklistItems || []) : [];

        const body = `
        <form id="plan-form">
            <div class="form-group">
                <label>Judul Audit</label>
                <input type="text" id="pf-title" value="${Utils.escapeHtml(plan?.title || '')}" required placeholder="Contoh: Audit Keamanan Jaringan">
            </div>
            <div class="form-group">
                <label>Scope / Ruang Lingkup</label>
                <textarea id="pf-scope" placeholder="Deskripsi ruang lingkup audit...">${Utils.escapeHtml(plan?.scope || '')}</textarea>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Auditor</label>
                    <input type="text" id="pf-auditor" value="${Utils.escapeHtml(plan?.auditor || '')}" placeholder="Nama auditor">
                </div>
                <div class="form-group">
                    <label>Department</label>
                    <input type="text" id="pf-department" value="${Utils.escapeHtml(plan?.department || '')}" placeholder="IT, Finance, dll">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Tanggal Mulai</label>
                    <input type="date" id="pf-start" value="${plan?.startDate || ''}">
                </div>
                <div class="form-group">
                    <label>Tanggal Selesai</label>
                    <input type="date" id="pf-end" value="${plan?.endDate || ''}">
                </div>
            </div>
            <div class="form-group">
                <label>Status</label>
                <select id="pf-status">
                    <option value="draft" ${plan?.status === 'draft' ? 'selected' : ''}>Draft</option>
                    <option value="approved" ${plan?.status === 'approved' ? 'selected' : ''}>Approved</option>
                    <option value="in-progress" ${plan?.status === 'in-progress' ? 'selected' : ''}>In Progress</option>
                    <option value="completed" ${plan?.status === 'completed' ? 'selected' : ''}>Completed</option>
                </select>
            </div>

            <!-- Risk Areas -->
            <div style="margin-top:var(--space-4)">
                <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:var(--space-3)">
                    <label style="margin:0">Risk Areas</label>
                    <button type="button" class="btn btn-sm btn-secondary" id="btn-add-risk-area">+ Tambah Area</button>
                </div>
                <div id="risk-areas-container">
                    ${riskAreas.map((ra, i) => this._riskAreaRow(ra, i)).join('')}
                </div>
            </div>

            <!-- Checklist Items -->
            <div style="margin-top:var(--space-5)">
                <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:var(--space-3)">
                    <label style="margin:0">Checklist Audit</label>
                    <button type="button" class="btn btn-sm btn-secondary" id="btn-add-checklist">+ Tambah Item</button>
                </div>
                <div id="checklist-container">
                    ${checklist.map((cl, i) => `
                        <div class="checklist-row" style="display:flex;gap:var(--space-2);margin-bottom:var(--space-2);align-items:center">
                            <input type="text" class="cl-text" value="${Utils.escapeHtml(cl.text)}" placeholder="Item checklist..." style="flex:1">
                            <button type="button" class="btn btn-sm btn-danger btn-remove-cl">✕</button>
                        </div>
                    `).join('')}
                </div>
            </div>
        </form>`;

        const footer = `
            <button class="btn btn-secondary" onclick="Utils.closeModal()">Batal</button>
            <button class="btn btn-primary" id="btn-save-plan">${isEdit ? 'Simpan Perubahan' : 'Buat Plan'}</button>
        `;

        Utils.openModal(isEdit ? 'Edit Audit Plan' : 'Buat Audit Plan Baru', body, footer);

        // Bind events inside modal
        let riskIdx = riskAreas.length;
        document.getElementById('btn-add-risk-area')?.addEventListener('click', () => {
            const container = document.getElementById('risk-areas-container');
            container.insertAdjacentHTML('beforeend', this._riskAreaRow({ area: '', likelihood: 3, impact: 3 }, riskIdx++));
        });

        document.getElementById('btn-add-checklist')?.addEventListener('click', () => {
            const container = document.getElementById('checklist-container');
            container.insertAdjacentHTML('beforeend', `
                <div class="checklist-row" style="display:flex;gap:var(--space-2);margin-bottom:var(--space-2);align-items:center">
                    <input type="text" class="cl-text" placeholder="Item checklist..." style="flex:1">
                    <button type="button" class="btn btn-sm btn-danger btn-remove-cl">✕</button>
                </div>
            `);
        });

        // Remove buttons (delegated)
        document.getElementById('modal-body').addEventListener('click', (e) => {
            if (e.target.classList.contains('btn-remove-ra')) {
                e.target.closest('.risk-area-row')?.remove();
            }
            if (e.target.classList.contains('btn-remove-cl')) {
                e.target.closest('.checklist-row')?.remove();
            }
        });

        // Save
        document.getElementById('btn-save-plan')?.addEventListener('click', () => {
            const title = document.getElementById('pf-title').value.trim();
            if (!title) { Utils.showToast('Judul audit wajib diisi', 'error'); return; }

            // Collect risk areas
            const raRows = document.querySelectorAll('.risk-area-row');
            const newRiskAreas = [];
            raRows.forEach(row => {
                const area = row.querySelector('.ra-area').value.trim();
                const likelihood = parseInt(row.querySelector('.ra-likelihood').value);
                const impact = parseInt(row.querySelector('.ra-impact').value);
                if (area) newRiskAreas.push({ area, likelihood, impact });
            });

            // Collect checklist
            const clRows = document.querySelectorAll('.checklist-row');
            const newChecklist = [];
            clRows.forEach(row => {
                const text = row.querySelector('.cl-text').value.trim();
                if (text) {
                    // Preserve completed status if editing
                    const existing = checklist.find(c => c.text === text);
                    newChecklist.push({
                        id: existing?.id || Utils.generateChecklistId(),
                        text,
                        completed: existing?.completed || false
                    });
                }
            });

            const data = {
                id: plan?.id,
                title,
                scope: document.getElementById('pf-scope').value.trim(),
                auditor: document.getElementById('pf-auditor').value.trim(),
                department: document.getElementById('pf-department').value.trim(),
                startDate: document.getElementById('pf-start').value,
                endDate: document.getElementById('pf-end').value,
                status: document.getElementById('pf-status').value,
                riskAreas: newRiskAreas,
                checklistItems: newChecklist,
            };

            Store.savePlan(data);
            Utils.closeModal();
            Utils.showToast(isEdit ? 'Audit plan diperbarui' : 'Audit plan dibuat', 'success');
            App.navigate('planning');
        });
    },

    _riskAreaRow(ra, idx) {
        return `
        <div class="risk-area-row" style="display:grid;grid-template-columns:1fr 100px 100px auto;gap:var(--space-2);margin-bottom:var(--space-2);align-items:end">
            <div>
                ${idx === 0 ? '<label style="font-size:var(--font-xs)">Area</label>' : ''}
                <input type="text" class="ra-area" value="${Utils.escapeHtml(ra.area)}" placeholder="Nama area risiko">
            </div>
            <div>
                ${idx === 0 ? '<label style="font-size:var(--font-xs)">Likelihood</label>' : ''}
                <select class="ra-likelihood">
                    ${[1,2,3,4,5].map(v => `<option value="${v}" ${ra.likelihood === v ? 'selected' : ''}>${v}</option>`).join('')}
                </select>
            </div>
            <div>
                ${idx === 0 ? '<label style="font-size:var(--font-xs)">Impact</label>' : ''}
                <select class="ra-impact">
                    ${[1,2,3,4,5].map(v => `<option value="${v}" ${ra.impact === v ? 'selected' : ''}>${v}</option>`).join('')}
                </select>
            </div>
            <button type="button" class="btn btn-sm btn-danger btn-remove-ra" style="margin-bottom:2px">✕</button>
        </div>`;
    },

    showRiskDetail(planId) {
        const plan = Store.getPlanById(planId);
        if (!plan) return;

        const riskAreas = plan.riskAreas || [];
        const body = `
        <h3 style="margin-bottom:var(--space-4)">${Utils.escapeHtml(plan.title)}</h3>
        ${riskAreas.length === 0
            ? '<p style="color:var(--text-muted)">Belum ada risk area yang didefinisikan.</p>'
            : `
            <div class="table-wrapper">
                <table>
                    <thead>
                        <tr><th>Area</th><th>Likelihood</th><th>Impact</th><th>Score</th><th>Risk Level</th></tr>
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
                                <td>${Components.badge(risk.level, risk.class)}</td>
                            </tr>`;
                        }).join('')}
                    </tbody>
                </table>
            </div>
            <div style="margin-top:var(--space-5)">
                <h4 style="margin-bottom:var(--space-3)">Risk Matrix</h4>
                ${Components.riskMatrix()}
            </div>
        `}`;

        Utils.openModal('Risk Assessment Detail', body, '<button class="btn btn-secondary" onclick="Utils.closeModal()">Tutup</button>');
    }
};
