/**
 * Field Audit Page
 */
const FieldworkPage = {
    selectedPlanId: null,

    render() {
        const plans = Store.getPlans().filter(p => p.status === 'in-progress' || p.status === 'approved');
        const allPlans = Store.getPlans();

        return `
        <div class="fieldwork-container">
            <!-- Left: Audit Selector -->
            <div>
                <h3 style="font-size:var(--font-base);font-weight:600;margin-bottom:var(--space-4)">Pilih Audit</h3>
                <div class="audit-selector" id="audit-selector">
                    ${allPlans.length === 0
                        ? '<p style="color:var(--text-muted);font-size:var(--font-sm)">Belum ada audit plan</p>'
                        : allPlans.map(p => `
                            <div class="audit-select-item ${this.selectedPlanId === p.id ? 'selected' : ''}" data-id="${p.id}">
                                <h4>${Utils.escapeHtml(p.title)}</h4>
                                <p>${Utils.escapeHtml(p.department || '-')} · ${Components.badge(Utils.getStatusLabel(p.status), Utils.getStatusClass(p.status))}</p>
                            </div>
                        `).join('')
                    }
                </div>
            </div>

            <!-- Right: Fieldwork Panel -->
            <div class="fieldwork-panel" id="fieldwork-panel">
                ${this.selectedPlanId ? this._renderPanel(this.selectedPlanId) : `
                    <div class="empty-state">
                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                        </svg>
                        <p>Pilih audit plan di sebelah kiri untuk memulai field audit</p>
                    </div>
                `}
            </div>
        </div>`;
    },

    _renderPanel(planId) {
        const plan = Store.getPlanById(planId);
        if (!plan) return '<p style="color:var(--text-muted)">Audit plan tidak ditemukan</p>';

        const findings = Store.getFindings(planId);
        const checklist = plan.checklistItems || [];
        const completedCount = checklist.filter(c => c.completed).length;

        return `
        <div class="card" style="margin-bottom:var(--space-5)">
            <div class="card-header">
                <h3 class="card-title">${Utils.escapeHtml(plan.title)}</h3>
                ${Components.badge(Utils.getStatusLabel(plan.status), Utils.getStatusClass(plan.status))}
            </div>
            <p style="font-size:var(--font-sm);color:var(--text-secondary);margin-bottom:var(--space-4)">${Utils.escapeHtml(plan.scope)}</p>
            ${checklist.length > 0 ? `
                <div style="margin-bottom:var(--space-4)">
                    <div style="font-size:var(--font-sm);font-weight:600;margin-bottom:var(--space-3)">Checklist Audit (${completedCount}/${checklist.length})</div>
                    ${Components.progressBar(completedCount, checklist.length)}
                </div>
                <div id="checklist-items">
                    ${checklist.map((cl, i) => `
                        <div class="checklist-item ${cl.completed ? 'completed' : ''}">
                            <input type="checkbox" class="cl-check" data-idx="${i}" ${cl.completed ? 'checked' : ''}>
                            <span style="flex:1;font-size:var(--font-sm)">${Utils.escapeHtml(cl.text)}</span>
                        </div>
                    `).join('')}
                </div>
            ` : '<p style="font-size:var(--font-sm);color:var(--text-muted)">Tidak ada checklist. Edit audit plan untuk menambahkan.</p>'}
        </div>

        <!-- Findings -->
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:var(--space-4)">
            <h3 style="font-size:var(--font-md);font-weight:600">Findings (${findings.length})</h3>
            <button class="btn btn-primary btn-sm" id="btn-add-finding">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                Tambah Finding
            </button>
        </div>

        ${findings.length === 0
            ? '<p style="color:var(--text-muted);font-size:var(--font-sm)">Belum ada finding untuk audit ini.</p>'
            : findings.map(f => `
                <div class="finding-card">
                    <div class="finding-card-header">
                        <h4>${Utils.escapeHtml(f.title)}</h4>
                        <div style="display:flex;gap:var(--space-2);align-items:center">
                            ${Components.badge(f.severity.toUpperCase(), Utils.getSeverityClass(f.severity))}
                            <button class="btn btn-sm btn-secondary btn-edit-finding" data-id="${f.id}" title="Edit">✏️</button>
                            <button class="btn btn-sm btn-danger btn-delete-finding" data-id="${f.id}" title="Hapus">🗑️</button>
                        </div>
                    </div>
                    <div class="finding-detail"><strong>Kategori:</strong> ${Utils.escapeHtml(f.category)}</div>
                    <div class="finding-detail"><strong>Deskripsi:</strong> ${Utils.escapeHtml(f.description)}</div>
                    <div class="finding-detail"><strong>Evidence:</strong> ${Utils.escapeHtml(f.evidence || '-')}</div>
                    <div class="finding-detail"><strong>Rekomendasi:</strong> ${Utils.escapeHtml(f.recommendation)}</div>
                </div>
            `).join('')
        }`;
    },

    init() {
        // Select audit
        document.querySelectorAll('.audit-select-item').forEach(item => {
            item.addEventListener('click', () => {
                FieldworkPage.selectedPlanId = item.dataset.id;
                App.navigate('fieldwork');
            });
        });

        // Checklist toggle
        document.querySelectorAll('.cl-check').forEach(cb => {
            cb.addEventListener('change', () => {
                const plan = Store.getPlanById(FieldworkPage.selectedPlanId);
                if (!plan) return;
                const idx = parseInt(cb.dataset.idx);
                plan.checklistItems[idx].completed = cb.checked;
                Store.updateChecklist(plan.id, plan.checklistItems);
                App.navigate('fieldwork');
            });
        });

        // Add finding
        document.getElementById('btn-add-finding')?.addEventListener('click', () => {
            FieldworkPage.showFindingForm(FieldworkPage.selectedPlanId);
        });

        // Edit finding
        document.querySelectorAll('.btn-edit-finding').forEach(btn => {
            btn.addEventListener('click', () => {
                FieldworkPage.showFindingForm(FieldworkPage.selectedPlanId, btn.dataset.id);
            });
        });

        // Delete finding
        document.querySelectorAll('.btn-delete-finding').forEach(btn => {
            btn.addEventListener('click', () => {
                if (confirm('Hapus finding ini?')) {
                    Store.deleteFinding(btn.dataset.id);
                    Utils.showToast('Finding dihapus', 'success');
                    App.navigate('fieldwork');
                }
            });
        });
    },

    showFindingForm(planId, findingId) {
        const allFindings = Store.getFindings();
        const finding = findingId ? allFindings.find(f => f.id === findingId) : null;
        const isEdit = !!finding;

        const body = `
        <form id="finding-form">
            <div class="form-group">
                <label>Judul Finding</label>
                <input type="text" id="ff-title" value="${Utils.escapeHtml(finding?.title || '')}" required placeholder="Judul temuan audit">
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Kategori</label>
                    <input type="text" id="ff-category" value="${Utils.escapeHtml(finding?.category || '')}" placeholder="Kategori risiko">
                </div>
                <div class="form-group">
                    <label>Severity</label>
                    <select id="ff-severity">
                        <option value="low" ${finding?.severity === 'low' ? 'selected' : ''}>Low</option>
                        <option value="medium" ${finding?.severity === 'medium' ? 'selected' : ''}>Medium</option>
                        <option value="high" ${finding?.severity === 'high' ? 'selected' : ''}>High</option>
                        <option value="critical" ${finding?.severity === 'critical' ? 'selected' : ''}>Critical</option>
                    </select>
                </div>
            </div>
            <div class="form-group">
                <label>Deskripsi</label>
                <textarea id="ff-desc" placeholder="Deskripsi detail temuan...">${Utils.escapeHtml(finding?.description || '')}</textarea>
            </div>
            <div class="form-group">
                <label>Evidence / Bukti</label>
                <textarea id="ff-evidence" placeholder="Bukti pendukung temuan...">${Utils.escapeHtml(finding?.evidence || '')}</textarea>
            </div>
            <div class="form-group">
                <label>Rekomendasi</label>
                <textarea id="ff-rec" placeholder="Rekomendasi perbaikan...">${Utils.escapeHtml(finding?.recommendation || '')}</textarea>
            </div>
        </form>`;

        const footer = `
            <button class="btn btn-secondary" onclick="Utils.closeModal()">Batal</button>
            <button class="btn btn-primary" id="btn-save-finding">${isEdit ? 'Simpan' : 'Tambah Finding'}</button>
        `;

        Utils.openModal(isEdit ? 'Edit Finding' : 'Tambah Finding Baru', body, footer);

        document.getElementById('btn-save-finding')?.addEventListener('click', () => {
            const title = document.getElementById('ff-title').value.trim();
            if (!title) { Utils.showToast('Judul finding wajib diisi', 'error'); return; }

            Store.saveFinding({
                id: finding?.id,
                planId,
                title,
                category: document.getElementById('ff-category').value.trim(),
                severity: document.getElementById('ff-severity').value,
                description: document.getElementById('ff-desc').value.trim(),
                evidence: document.getElementById('ff-evidence').value.trim(),
                recommendation: document.getElementById('ff-rec').value.trim(),
            });

            Utils.closeModal();
            Utils.showToast(isEdit ? 'Finding diperbarui' : 'Finding ditambahkan', 'success');
            App.navigate('fieldwork');
        });
    }
};
