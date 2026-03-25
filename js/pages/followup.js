/**
 * Followup Auditee Page — Tindak Lanjut Temuan
 * User-friendly interface for auditees to track and respond to findings
 */
const FollowupPage = {
    filterStatus: '',
    filterSeverity: '',

    render() {
        const findings = Store.getFindings();
        const followups = Store.getFollowups();
        const plans = Store.getPlans();

        // Stats
        const totalFindings = findings.length;
        const withFollowup = followups.length;
        const resolved = followups.filter(f => f.status === 'resolved' || f.status === 'verified').length;
        const overdue = followups.filter(f => {
            if (f.status === 'resolved' || f.status === 'verified') return false;
            return f.targetDate && new Date(f.targetDate) < new Date();
        }).length;
        const openCount = totalFindings - resolved;
        const resolvedPct = totalFindings > 0 ? Math.round((resolved / totalFindings) * 100) : 0;

        return `
        <!-- Helper Banner -->
        <div class="followup-helper-banner">
            <div class="helper-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            </div>
            <div class="helper-text">
                <strong>Halaman Tindak Lanjut Temuan Audit</strong>
                <p>Di halaman ini Anda dapat melihat semua temuan audit dan memberikan tanggapan tindak lanjut. Klik tombol <strong>"Berikan Tanggapan"</strong> pada setiap temuan untuk mengisi form tindak lanjut.</p>
            </div>
        </div>

        <!-- Stats -->
        <div class="stat-grid">
            ${Components.statCard(
                '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/></svg>',
                totalFindings, 'Total Temuan', 'orange', 0
            )}
            ${Components.statCard(
                '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
                openCount, 'Belum Selesai', 'yellow', 100
            )}
            ${Components.statCard(
                '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
                resolved, 'Sudah Ditindaklanjuti', 'green', 200
            )}
            ${Components.statCard(
                '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>',
                overdue, 'Melewati Tenggat', 'red', 300
            )}
        </div>

        <!-- Progress Overview -->
        <div class="card followup-progress-card animate-up">
            <div class="card-header">
                <h3 class="card-title">Progress Tindak Lanjut Keseluruhan</h3>
                <span class="followup-pct-label">${resolvedPct}% selesai</span>
            </div>
            <div class="followup-big-progress">
                <div class="progress-bar" style="height:12px;border-radius:8px">
                    <div class="progress-fill" style="width:${resolvedPct}%;border-radius:8px;background:linear-gradient(90deg, var(--success), #69db7c)"></div>
                </div>
            </div>
            <div class="followup-progress-legend">
                <span class="legend-item"><span class="legend-dot" style="background:var(--success)"></span> Selesai (${resolved})</span>
                <span class="legend-item"><span class="legend-dot" style="background:var(--warning)"></span> Dalam Proses (${followups.filter(f => f.status === 'in-progress').length})</span>
                <span class="legend-item"><span class="legend-dot" style="background:var(--text-muted)"></span> Belum (${totalFindings - withFollowup + followups.filter(f => f.status === 'open').length})</span>
                ${overdue > 0 ? `<span class="legend-item"><span class="legend-dot" style="background:var(--danger)"></span> Melewati Tenggat (${overdue})</span>` : ''}
            </div>
        </div>

        <!-- Filters -->
        <div class="followup-filters">
            <h3 style="font-size:var(--font-md);font-weight:700;flex:1">Daftar Temuan</h3>
            <select id="followup-filter-status">
                <option value="">Semua Status</option>
                <option value="open" ${this.filterStatus === 'open' ? 'selected' : ''}>Belum Ditindaklanjuti</option>
                <option value="in-progress" ${this.filterStatus === 'in-progress' ? 'selected' : ''}>Dalam Proses</option>
                <option value="resolved" ${this.filterStatus === 'resolved' ? 'selected' : ''}>Selesai</option>
                <option value="overdue" ${this.filterStatus === 'overdue' ? 'selected' : ''}>Melewati Tenggat</option>
            </select>
            <select id="followup-filter-severity">
                <option value="">Semua Prioritas</option>
                <option value="critical" ${this.filterSeverity === 'critical' ? 'selected' : ''}>Perlu Segera Ditangani</option>
                <option value="high" ${this.filterSeverity === 'high' ? 'selected' : ''}>Prioritas Tinggi</option>
                <option value="medium" ${this.filterSeverity === 'medium' ? 'selected' : ''}>Prioritas Sedang</option>
                <option value="low" ${this.filterSeverity === 'low' ? 'selected' : ''}>Prioritas Rendah</option>
            </select>
        </div>

        <!-- Finding Cards -->
        <div class="followup-cards" id="followup-cards">
            ${findings.length === 0
                ? Components.emptyState('Belum ada temuan audit yang perlu ditindaklanjuti.')
                : findings.map((f, index) => this._renderFindingCard(f, plans, followups, index)).join('')
            }
        </div>`;
    },

    _renderFindingCard(finding, plans, followups, index) {
        const plan = plans.find(p => p.id === finding.planId);
        const followup = followups.find(fu => fu.findingId === finding.id);
        const status = followup ? followup.status : 'open';
        const isOverdue = followup && followup.targetDate && new Date(followup.targetDate) < new Date() && status !== 'resolved' && status !== 'verified';
        const severityLabel = Utils.getSeverityLabel(finding.severity);
        const statusLabel = Utils.getFollowupStatusLabel(status);

        const severityIcons = {
            critical: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
            high: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>',
            medium: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
            low: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>'
        };

        // Stepper steps
        const steps = [
            { key: 'open', label: 'Ditemukan', icon: '1' },
            { key: 'in-progress', label: 'Dalam Proses', icon: '2' },
            { key: 'resolved', label: 'Selesai', icon: '3' },
        ];
        const stepIndex = steps.findIndex(s => s.key === status);

        return `
        <div class="followup-card animate-up ${isOverdue ? 'overdue' : ''}" 
             data-status="${status}" data-severity="${finding.severity}" data-overdue="${isOverdue}"
             style="animation-delay:${index * 80}ms">
            <!-- Card Header -->
            <div class="followup-card-header">
                <div class="followup-severity-indicator severity-${finding.severity}">
                    ${severityIcons[finding.severity] || ''}
                    <span>${severityLabel}</span>
                </div>
                <div style="display:flex;gap:var(--space-2);align-items:center">
                    ${isOverdue ? '<span class="badge badge-critical" style="animation:pulse 2s infinite">⚠ TERLAMBAT</span>' : ''}
                    <span class="badge badge-${Utils.getFollowupStatusClass(status)}">${statusLabel}</span>
                </div>
            </div>

            <!-- Finding Info -->
            <h4 class="followup-card-title">${Utils.escapeHtml(finding.title)}</h4>
            <div class="followup-card-meta">
                <span>📋 ${Utils.escapeHtml(plan?.title || '-')}</span>
                <span>📁 ${Utils.escapeHtml(finding.category)}</span>
                <span>📅 ${Utils.formatDate(finding.createdAt)}</span>
            </div>

            <!-- Status Stepper -->
            <div class="followup-stepper">
                ${steps.map((step, i) => `
                    <div class="stepper-step ${i <= stepIndex ? 'active' : ''} ${i === stepIndex ? 'current' : ''}">
                        <div class="stepper-dot">${i <= stepIndex ? '✓' : step.icon}</div>
                        <span class="stepper-label">${step.label}</span>
                    </div>
                    ${i < steps.length - 1 ? `<div class="stepper-line ${i < stepIndex ? 'active' : ''}"></div>` : ''}
                `).join('')}
            </div>

            <!-- Collapsible Detail -->
            <details class="followup-detail">
                <summary>📖 Lihat Detail Temuan</summary>
                <div class="followup-detail-content">
                    <div class="detail-row"><strong>Deskripsi:</strong><p>${Utils.escapeHtml(finding.description)}</p></div>
                    <div class="detail-row"><strong>Bukti:</strong><p>${Utils.escapeHtml(finding.evidence || '-')}</p></div>
                    <div class="detail-row highlight"><strong>💡 Rekomendasi Auditor:</strong><p>${Utils.escapeHtml(finding.recommendation)}</p></div>
                </div>
            </details>

            <!-- Followup Response Section -->
            ${followup && followup.response ? `
                <div class="followup-response-display">
                    <div class="response-header">
                        <span class="response-author">👤 ${Utils.escapeHtml(followup.pic || '-')} <small>(${Utils.escapeHtml(followup.picRole || '')})</small></span>
                        <span class="response-date">${Utils.formatDate(followup.updatedAt)}</span>
                    </div>
                    <div class="response-body">
                        <p><strong>Rencana Tindak Lanjut:</strong> ${Utils.escapeHtml(followup.actionPlan || '-')}</p>
                        <p><strong>Progress:</strong> ${Utils.escapeHtml(followup.response)}</p>
                        <p><strong>Target Selesai:</strong> ${Utils.formatDate(followup.targetDate)}</p>
                        ${followup.completedDate ? `<p><strong>Tanggal Selesai:</strong> ${Utils.formatDate(followup.completedDate)}</p>` : ''}
                    </div>
                </div>
            ` : ''}

            <!-- Action Button -->
            <div class="followup-card-actions">
                ${status !== 'resolved' && status !== 'verified' ? `
                    <button class="btn btn-primary btn-followup-respond" data-finding-id="${finding.id}" data-followup-id="${followup?.id || ''}">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        ${followup ? 'Update Tanggapan' : 'Berikan Tanggapan'}
                    </button>
                ` : `
                    <span class="followup-completed-badge">✅ Tindak lanjut telah selesai</span>
                `}
            </div>
        </div>`;
    },

    init() {
        // Filter handlers
        document.getElementById('followup-filter-status')?.addEventListener('change', (e) => {
            FollowupPage.filterStatus = e.target.value;
            this._applyFilters();
        });

        document.getElementById('followup-filter-severity')?.addEventListener('change', (e) => {
            FollowupPage.filterSeverity = e.target.value;
            this._applyFilters();
        });

        // Respond buttons
        document.querySelectorAll('.btn-followup-respond').forEach(btn => {
            btn.addEventListener('click', () => {
                this.showResponseForm(btn.dataset.findingId, btn.dataset.followupId);
            });
        });
    },

    _applyFilters() {
        const cards = document.querySelectorAll('.followup-card');
        const statusFilter = FollowupPage.filterStatus;
        const sevFilter = FollowupPage.filterSeverity;

        cards.forEach(card => {
            let show = true;
            if (statusFilter === 'overdue') {
                show = card.dataset.overdue === 'true';
            } else if (statusFilter) {
                show = card.dataset.status === statusFilter;
            }
            if (sevFilter && show) {
                show = card.dataset.severity === sevFilter;
            }
            card.style.display = show ? '' : 'none';
        });
    },

    showResponseForm(findingId, followupId) {
        const finding = Store.getFindings().find(f => f.id === findingId);
        const followup = followupId ? Store.getFollowups().find(f => f.id === followupId) : null;
        const isEdit = !!followup;

        const body = `
        <div class="followup-form-helper">
            <p>📝 Silakan isi form di bawah ini untuk memberikan tanggapan tindak lanjut terhadap temuan: <strong>${Utils.escapeHtml(finding?.title || '')}</strong></p>
        </div>
        <form id="followup-form">
            <div class="form-group">
                <label>👤 Nama Penanggung Jawab (PIC)</label>
                <input type="text" id="fu-pic" value="${Utils.escapeHtml(followup?.pic || '')}" placeholder="Contoh: Ahmad Rizky" required>
                <small class="form-hint">Siapa yang bertanggung jawab menindaklanjuti temuan ini?</small>
            </div>
            <div class="form-group">
                <label>💼 Jabatan / Role</label>
                <input type="text" id="fu-pic-role" value="${Utils.escapeHtml(followup?.picRole || '')}" placeholder="Contoh: Network Engineer">
            </div>
            <div class="form-group">
                <label>📋 Rencana Tindak Lanjut</label>
                <textarea id="fu-action-plan" placeholder="Jelaskan langkah-langkah yang akan dilakukan untuk menyelesaikan temuan ini...">${Utils.escapeHtml(followup?.actionPlan || '')}</textarea>
                <small class="form-hint">Apa yang akan dilakukan untuk menyelesaikan temuan ini?</small>
            </div>
            <div class="form-group">
                <label>📊 Progress / Tanggapan</label>
                <textarea id="fu-response" placeholder="Jelaskan progress tindak lanjut saat ini...">${Utils.escapeHtml(followup?.response || '')}</textarea>
                <small class="form-hint">Apa saja yang sudah dilakukan? Berapa persen progresnya?</small>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>📅 Target Penyelesaian</label>
                    <input type="date" id="fu-target-date" value="${followup?.targetDate || ''}">
                </div>
                <div class="form-group">
                    <label>🔄 Status Saat Ini</label>
                    <select id="fu-status">
                        <option value="open" ${(!followup || followup?.status === 'open') ? 'selected' : ''}>Belum Ditindaklanjuti</option>
                        <option value="in-progress" ${followup?.status === 'in-progress' ? 'selected' : ''}>Dalam Proses</option>
                        <option value="resolved" ${followup?.status === 'resolved' ? 'selected' : ''}>Selesai</option>
                    </select>
                </div>
            </div>
        </form>`;

        const footer = `
            <button class="btn btn-secondary" onclick="Utils.closeModal()">Batal</button>
            <button class="btn btn-primary" id="btn-save-followup">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                ${isEdit ? 'Simpan Perubahan' : 'Kirim Tanggapan'}
            </button>
        `;

        Utils.openModal(isEdit ? 'Update Tindak Lanjut' : 'Berikan Tanggapan Tindak Lanjut', body, footer);

        document.getElementById('btn-save-followup')?.addEventListener('click', () => {
            const pic = document.getElementById('fu-pic').value.trim();
            if (!pic) { Utils.showToast('Nama PIC wajib diisi', 'error'); return; }

            const status = document.getElementById('fu-status').value;
            const data = {
                id: followup?.id,
                findingId: findingId,
                pic: pic,
                picRole: document.getElementById('fu-pic-role').value.trim(),
                actionPlan: document.getElementById('fu-action-plan').value.trim(),
                response: document.getElementById('fu-response').value.trim(),
                targetDate: document.getElementById('fu-target-date').value,
                status: status,
            };

            if (status === 'resolved') {
                data.completedDate = new Date().toISOString();
            }

            Store.saveFollowup(data);
            Utils.closeModal();
            Utils.showToast(isEdit ? 'Tindak lanjut diperbarui!' : 'Tanggapan berhasil dikirim!', 'success');
            App.navigate('followup');
        });
    }
};
