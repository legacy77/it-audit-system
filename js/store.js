/**
 * Data Store — localStorage persistence
 */
const Store = {
    KEYS: {
        AUDIT_PLANS: 'auditpro_plans',
        FINDINGS: 'auditpro_findings',
        ACTIVITIES: 'auditpro_activities',
    },

    _get(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : [];
        } catch {
            return [];
        }
    },

    _set(key, data) {
        localStorage.setItem(key, JSON.stringify(data));
    },

    // ===== Audit Plans =====
    getPlans() {
        return this._get(this.KEYS.AUDIT_PLANS);
    },

    savePlan(plan) {
        const plans = this.getPlans();
        const idx = plans.findIndex(p => p.id === plan.id);
        if (idx >= 0) {
            plans[idx] = { ...plans[idx], ...plan, updatedAt: new Date().toISOString() };
        } else {
            plan.id = this.generateId();
            plan.createdAt = new Date().toISOString();
            plan.updatedAt = plan.createdAt;
            plan.status = plan.status || 'draft';
            plan.checklistItems = plan.checklistItems || [];
            plans.push(plan);
        }
        this._set(this.KEYS.AUDIT_PLANS, plans);
        this.addActivity(`Audit plan "${plan.title}" ${idx >= 0 ? 'diperbarui' : 'dibuat'}`, plan.id);
        return plan;
    },

    deletePlan(id) {
        const plans = this.getPlans().filter(p => p.id !== id);
        this._set(this.KEYS.AUDIT_PLANS, plans);
        // Also delete findings
        const findings = this.getFindings().filter(f => f.planId !== id);
        this._set(this.KEYS.FINDINGS, findings);
    },

    getPlanById(id) {
        return this.getPlans().find(p => p.id === id);
    },

    // ===== Findings =====
    getFindings(planId) {
        const all = this._get(this.KEYS.FINDINGS);
        return planId ? all.filter(f => f.planId === planId) : all;
    },

    saveFinding(finding) {
        const findings = this._get(this.KEYS.FINDINGS);
        const idx = findings.findIndex(f => f.id === finding.id);
        if (idx >= 0) {
            findings[idx] = { ...findings[idx], ...finding, updatedAt: new Date().toISOString() };
        } else {
            finding.id = this.generateId();
            finding.createdAt = new Date().toISOString();
            finding.updatedAt = finding.createdAt;
            findings.push(finding);
        }
        this._set(this.KEYS.FINDINGS, findings);
        this.addActivity(`Finding "${finding.title}" ditambahkan`, finding.planId);
        return finding;
    },

    deleteFinding(id) {
        const findings = this._get(this.KEYS.FINDINGS).filter(f => f.id !== id);
        this._set(this.KEYS.FINDINGS, findings);
    },

    // ===== Activities =====
    getActivities() {
        return this._get(this.KEYS.ACTIVITIES).slice(0, 20);
    },

    addActivity(description, planId) {
        const activities = this._get(this.KEYS.ACTIVITIES);
        activities.unshift({
            id: this.generateId(),
            description,
            planId,
            timestamp: new Date().toISOString()
        });
        // Keep only last 50
        this._set(this.KEYS.ACTIVITIES, activities.slice(0, 50));
    },

    // ===== Checklist =====
    updateChecklist(planId, checklistItems) {
        const plans = this.getPlans();
        const plan = plans.find(p => p.id === planId);
        if (plan) {
            plan.checklistItems = checklistItems;
            plan.updatedAt = new Date().toISOString();
            this._set(this.KEYS.AUDIT_PLANS, plans);
        }
    },

    // ===== Helpers =====
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
    },

    // ===== Seed Demo Data =====
    seedDemoData() {
        if (this.getPlans().length > 0) return;

        const plans = [
            {
                id: 'demo1',
                title: 'Audit Keamanan Jaringan',
                scope: 'Evaluasi keamanan infrastruktur jaringan perusahaan meliputi firewall, IDS/IPS, dan segmentasi jaringan.',
                auditor: 'Dhika Pratama',
                department: 'IT Infrastructure',
                startDate: '2026-03-01',
                endDate: '2026-04-15',
                status: 'in-progress',
                riskAreas: [
                    { area: 'Firewall Configuration', likelihood: 4, impact: 5 },
                    { area: 'Network Segmentation', likelihood: 3, impact: 4 },
                    { area: 'Access Control', likelihood: 4, impact: 4 },
                    { area: 'Patch Management', likelihood: 3, impact: 3 },
                ],
                checklistItems: [
                    { id: 'c1', text: 'Review konfigurasi firewall', completed: true },
                    { id: 'c2', text: 'Periksa segmentasi jaringan', completed: true },
                    { id: 'c3', text: 'Evaluasi policy access control', completed: false },
                    { id: 'c4', text: 'Cek status patching', completed: false },
                    { id: 'c5', text: 'Review log monitoring', completed: false },
                ],
                createdAt: '2026-02-20T08:00:00Z',
                updatedAt: '2026-03-15T10:00:00Z',
            },
            {
                id: 'demo2',
                title: 'Audit Sistem Informasi Keuangan',
                scope: 'Audit terhadap sistem ERP keuangan, termasuk kontrol akses, integritas data, dan kepatuhan regulasi.',
                auditor: 'Sari Indah',
                department: 'Finance',
                startDate: '2026-02-15',
                endDate: '2026-03-30',
                status: 'completed',
                riskAreas: [
                    { area: 'Data Integrity', likelihood: 3, impact: 5 },
                    { area: 'User Access Management', likelihood: 4, impact: 4 },
                    { area: 'Backup & Recovery', likelihood: 2, impact: 5 },
                    { area: 'Regulatory Compliance', likelihood: 3, impact: 5 },
                ],
                checklistItems: [
                    { id: 'c6', text: 'Verifikasi integritas data keuangan', completed: true },
                    { id: 'c7', text: 'Review user access matrix', completed: true },
                    { id: 'c8', text: 'Cek prosedur backup', completed: true },
                    { id: 'c9', text: 'Evaluasi kepatuhan regulasi', completed: true },
                ],
                createdAt: '2026-02-10T08:00:00Z',
                updatedAt: '2026-03-28T14:00:00Z',
            },
            {
                id: 'demo3',
                title: 'Audit Aplikasi Web E-Commerce',
                scope: 'Penilaian keamanan dan performa aplikasi e-commerce meliputi OWASP Top 10, autentikasi, dan penanganan data sensitif.',
                auditor: 'Budi Santoso',
                department: 'Development',
                startDate: '2026-04-01',
                endDate: '2026-05-15',
                status: 'draft',
                riskAreas: [
                    { area: 'SQL Injection', likelihood: 3, impact: 5 },
                    { area: 'Authentication', likelihood: 4, impact: 5 },
                    { area: 'Data Encryption', likelihood: 2, impact: 5 },
                    { area: 'Session Management', likelihood: 3, impact: 4 },
                ],
                checklistItems: [
                    { id: 'c10', text: 'Penetration testing OWASP Top 10', completed: false },
                    { id: 'c11', text: 'Review mekanisme autentikasi', completed: false },
                    { id: 'c12', text: 'Cek enkripsi data sensitif', completed: false },
                    { id: 'c13', text: 'Evaluasi session handling', completed: false },
                ],
                createdAt: '2026-03-15T08:00:00Z',
                updatedAt: '2026-03-15T08:00:00Z',
            },
        ];

        const findings = [
            {
                id: 'f1', planId: 'demo1', title: 'Firewall rule terlalu permisif',
                description: 'Ditemukan beberapa rule firewall yang mengizinkan akses ANY-ANY pada port non-standar.',
                category: 'Keamanan Jaringan', severity: 'high',
                recommendation: 'Terapkan prinsip least privilege pada semua firewall rule. Review dan hapus rule yang tidak diperlukan.',
                evidence: 'Screenshot konfigurasi firewall menunjukkan 15 rule dengan source/destination ANY.',
                createdAt: '2026-03-05T09:00:00Z', updatedAt: '2026-03-05T09:00:00Z',
            },
            {
                id: 'f2', planId: 'demo1', title: 'Patch OS server belum update',
                description: 'Sebanyak 8 dari 20 server production belum menerapkan security patch terbaru (> 90 hari).',
                category: 'Patch Management', severity: 'critical',
                recommendation: 'Segera terapkan patch keamanan terbaru dan buat jadwal patching rutin bulanan.',
                evidence: 'Scan vulnerability assessment menunjukkan CVE-2025-XXXX belum di-patch.',
                createdAt: '2026-03-08T11:00:00Z', updatedAt: '2026-03-08T11:00:00Z',
            },
            {
                id: 'f3', planId: 'demo1', title: 'Tidak ada network segmentation untuk IoT',
                description: 'Perangkat IoT berada di subnet yang sama dengan server production tanpa isolasi.',
                category: 'Network Segmentation', severity: 'high',
                recommendation: 'Implementasikan VLAN terpisah untuk perangkat IoT dengan firewall rules ketat.',
                evidence: 'Topology jaringan menunjukkan IoT devices di subnet 10.0.1.0/24 bersama production servers.',
                createdAt: '2026-03-10T14:00:00Z', updatedAt: '2026-03-10T14:00:00Z',
            },
            {
                id: 'f4', planId: 'demo2', title: 'Shared account untuk akses database',
                description: 'Tim keuangan menggunakan satu akun bersama untuk mengakses database ERP.',
                category: 'User Access Management', severity: 'high',
                recommendation: 'Buat akun individual untuk setiap pengguna dengan role-based access control.',
                evidence: 'Log audit database menunjukkan semua query berasal dari satu akun "finance_user".',
                createdAt: '2026-02-25T10:00:00Z', updatedAt: '2026-02-25T10:00:00Z',
            },
            {
                id: 'f5', planId: 'demo2', title: 'Backup recovery belum pernah diuji',
                description: 'Prosedur disaster recovery untuk database keuangan belum pernah diuji sejak implementasi.',
                category: 'Backup & Recovery', severity: 'medium',
                recommendation: 'Lakukan DR drill minimal setiap 6 bulan dan dokumentasikan hasilnya.',
                evidence: 'Wawancara dengan DBA mengonfirmasi bahwa tidak ada catatan DR test.',
                createdAt: '2026-03-01T13:00:00Z', updatedAt: '2026-03-01T13:00:00Z',
            },
            {
                id: 'f6', planId: 'demo2', title: 'Log audit tidak di-retain cukup lama',
                description: 'Retention period log audit hanya 30 hari, tidak memenuhi standar minimum 1 tahun.',
                category: 'Regulatory Compliance', severity: 'medium',
                recommendation: 'Perpanjang retention period log audit minimal 1 tahun sesuai regulasi yang berlaku.',
                evidence: 'Konfigurasi syslog menunjukkan maxretain=30 days.',
                createdAt: '2026-03-05T09:30:00Z', updatedAt: '2026-03-05T09:30:00Z',
            },
        ];

        const activities = [
            { id: 'a1', description: 'Audit plan "Audit Keamanan Jaringan" dibuat', planId: 'demo1', timestamp: '2026-02-20T08:00:00Z' },
            { id: 'a2', description: 'Audit plan "Audit Sistem Informasi Keuangan" dibuat', planId: 'demo2', timestamp: '2026-02-10T08:00:00Z' },
            { id: 'a3', description: 'Finding "Firewall rule terlalu permisif" ditambahkan', planId: 'demo1', timestamp: '2026-03-05T09:00:00Z' },
            { id: 'a4', description: 'Finding "Shared account untuk akses database" ditambahkan', planId: 'demo2', timestamp: '2026-02-25T10:00:00Z' },
            { id: 'a5', description: 'Finding "Patch OS server belum update" ditambahkan', planId: 'demo1', timestamp: '2026-03-08T11:00:00Z' },
            { id: 'a6', description: 'Audit "Sistem Informasi Keuangan" selesai', planId: 'demo2', timestamp: '2026-03-28T14:00:00Z' },
            { id: 'a7', description: 'Audit plan "Audit Aplikasi Web E-Commerce" dibuat', planId: 'demo3', timestamp: '2026-03-15T08:00:00Z' },
        ];

        this._set(this.KEYS.AUDIT_PLANS, plans);
        this._set(this.KEYS.FINDINGS, findings);
        this._set(this.KEYS.ACTIVITIES, activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
    }
};

// Seed demo data on first load
Store.seedDemoData();
