/**
 * Utility Functions
 */
const Utils = {
    // Risk calculation: Likelihood × Impact
    calculateRiskScore(likelihood, impact) {
        return likelihood * impact;
    },

    getRiskLevel(score) {
        if (score >= 20) return { level: 'Critical', class: 'critical', color: '#e03131' };
        if (score >= 15) return { level: 'High', class: 'high', color: '#f76707' };
        if (score >= 10) return { level: 'Medium', class: 'medium', color: '#fab005' };
        if (score >= 5) return { level: 'Low', class: 'low', color: '#40c057' };
        return { level: 'Very Low', class: 'info', color: '#339af0' };
    },

    getSeverityClass(severity) {
        const map = { critical: 'critical', high: 'high', medium: 'medium', low: 'low' };
        return map[severity] || 'info';
    },

    getStatusClass(status) {
        const map = {
            draft: 'draft',
            approved: 'approved',
            'in-progress': 'in-progress',
            completed: 'completed'
        };
        return map[status] || 'draft';
    },

    getStatusLabel(status) {
        const map = {
            draft: 'Draft',
            approved: 'Approved',
            'in-progress': 'In Progress',
            completed: 'Completed'
        };
        return map[status] || status;
    },

    formatDate(dateStr) {
        if (!dateStr) return '-';
        const d = new Date(dateStr);
        return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    },

    formatDateTime(dateStr) {
        if (!dateStr) return '-';
        const d = new Date(dateStr);
        return d.toLocaleDateString('id-ID', {
            day: 'numeric', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    },

    timeAgo(dateStr) {
        const now = new Date();
        const d = new Date(dateStr);
        const diff = Math.floor((now - d) / 1000);
        if (diff < 60) return 'Baru saja';
        if (diff < 3600) return `${Math.floor(diff / 60)} menit lalu`;
        if (diff < 86400) return `${Math.floor(diff / 3600)} jam lalu`;
        if (diff < 604800) return `${Math.floor(diff / 86400)} hari lalu`;
        return Utils.formatDate(dateStr);
    },

    escapeHtml(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    },

    // Toast notification
    showToast(message, type = 'success') {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        const icons = {
            success: '✓',
            error: '✕',
            warning: '⚠',
            info: 'ℹ'
        };
        toast.innerHTML = `<span style="font-weight:700">${icons[type] || ''}</span> ${Utils.escapeHtml(message)}`;
        container.appendChild(toast);
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(20px)';
            toast.style.transition = 'all 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    },

    // Modal helpers
    openModal(title, bodyHtml, footerHtml) {
        document.getElementById('modal-title').textContent = title;
        document.getElementById('modal-body').innerHTML = bodyHtml;
        document.getElementById('modal-footer').innerHTML = footerHtml || '';
        document.getElementById('modal-overlay').classList.add('active');
    },

    closeModal() {
        document.getElementById('modal-overlay').classList.remove('active');
    },

    // Generate unique checklist id
    generateChecklistId() {
        return 'cl_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    }
};
