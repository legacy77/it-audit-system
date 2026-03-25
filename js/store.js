/**
 * Data Store — localStorage persistence
 */
const Store = {
    KEYS: {
        AUDIT_PLANS: 'auditpro_plans',
        FINDINGS: 'auditpro_findings',
        ACTIVITIES: 'auditpro_activities',
        FOLLOWUP_ACTIONS: 'auditpro_followups',
        GRC_CONTROLS: 'auditpro_grc_controls',
        GRC_RISKS: 'auditpro_grc_risks',
        GRC_COMPLIANCE: 'auditpro_grc_compliance',
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

    // ===== Followup Actions =====
    getFollowups(findingId) {
        const all = this._get(this.KEYS.FOLLOWUP_ACTIONS);
        return findingId ? all.filter(f => f.findingId === findingId) : all;
    },

    getFollowupByFinding(findingId) {
        return this._get(this.KEYS.FOLLOWUP_ACTIONS).find(f => f.findingId === findingId) || null;
    },

    saveFollowup(followup) {
        const followups = this._get(this.KEYS.FOLLOWUP_ACTIONS);
        const idx = followups.findIndex(f => f.id === followup.id);
        if (idx >= 0) {
            followups[idx] = { ...followups[idx], ...followup, updatedAt: new Date().toISOString() };
        } else {
            followup.id = this.generateId();
            followup.createdAt = new Date().toISOString();
            followup.updatedAt = followup.createdAt;
            followups.push(followup);
        }
        this._set(this.KEYS.FOLLOWUP_ACTIONS, followups);
        const finding = this.getFindings().find(f => f.id === followup.findingId);
        this.addActivity(`Tindak lanjut "${finding?.title || ''}" diperbarui → ${followup.status}`, finding?.planId);
        return followup;
    },

    // ===== GRC Controls =====
    getGRCControls() {
        return this._get(this.KEYS.GRC_CONTROLS);
    },

    saveGRCControl(control) {
        const controls = this._get(this.KEYS.GRC_CONTROLS);
        const idx = controls.findIndex(c => c.id === control.id);
        if (idx >= 0) {
            controls[idx] = { ...controls[idx], ...control, updatedAt: new Date().toISOString() };
        } else {
            control.id = control.id || this.generateId();
            control.createdAt = new Date().toISOString();
            control.updatedAt = control.createdAt;
            controls.push(control);
        }
        this._set(this.KEYS.GRC_CONTROLS, controls);
        return control;
    },

    // ===== GRC Risks =====
    getGRCRisks() {
        return this._get(this.KEYS.GRC_RISKS);
    },

    saveGRCRisk(risk) {
        const risks = this._get(this.KEYS.GRC_RISKS);
        const idx = risks.findIndex(r => r.id === risk.id);
        if (idx >= 0) {
            risks[idx] = { ...risks[idx], ...risk, updatedAt: new Date().toISOString() };
        } else {
            risk.id = risk.id || this.generateId();
            risk.createdAt = new Date().toISOString();
            risk.updatedAt = risk.createdAt;
            risks.push(risk);
        }
        this._set(this.KEYS.GRC_RISKS, risks);
        return risk;
    },

    // ===== GRC Compliance =====
    getGRCCompliance() {
        return this._get(this.KEYS.GRC_COMPLIANCE);
    },

    saveGRCCompliance(item) {
        const items = this._get(this.KEYS.GRC_COMPLIANCE);
        const idx = items.findIndex(c => c.id === item.id);
        if (idx >= 0) {
            items[idx] = { ...items[idx], ...item, updatedAt: new Date().toISOString() };
        } else {
            item.id = item.id || this.generateId();
            item.createdAt = new Date().toISOString();
            item.updatedAt = item.createdAt;
            items.push(item);
        }
        this._set(this.KEYS.GRC_COMPLIANCE, items);
        return item;
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

        // Followup demo data
        const followups = [
            {
                id: 'fu1', findingId: 'f1', status: 'in-progress',
                pic: 'Ahmad Rizky', picRole: 'Network Engineer',
                response: 'Sudah dilakukan review terhadap firewall rules. 10 dari 15 rule sudah diperbaiki. Sisanya sedang dalam proses.',
                targetDate: '2026-04-01',
                actionPlan: 'Review semua firewall rules dan terapkan least privilege. Hapus rules yang tidak diperlukan.',
                createdAt: '2026-03-12T10:00:00Z', updatedAt: '2026-03-20T14:00:00Z',
            },
            {
                id: 'fu2', findingId: 'f2', status: 'open',
                pic: 'Rudi Hartono', picRole: 'System Administrator',
                response: '',
                targetDate: '2026-03-25',
                actionPlan: 'Jadwalkan patching untuk semua server production.',
                createdAt: '2026-03-10T08:00:00Z', updatedAt: '2026-03-10T08:00:00Z',
            },
            {
                id: 'fu3', findingId: 'f4', status: 'resolved',
                pic: 'Dewi Lestari', picRole: 'DBA Manager',
                response: 'Semua akun shared sudah dihapus. Setiap user keuangan sekarang memiliki akun individual dengan RBAC.',
                targetDate: '2026-03-15',
                actionPlan: 'Buat akun individual untuk setiap pengguna finance dan terapkan RBAC.',
                completedDate: '2026-03-14T16:00:00Z',
                createdAt: '2026-02-28T09:00:00Z', updatedAt: '2026-03-14T16:00:00Z',
            },
            {
                id: 'fu4', findingId: 'f5', status: 'in-progress',
                pic: 'Budi Setiawan', picRole: 'IT Operations',
                response: 'DR drill sudah dijadwalkan untuk bulan April. SOP sedang disusun.',
                targetDate: '2026-04-15',
                actionPlan: 'Lakukan DR drill dan dokumentasikan hasilnya.',
                createdAt: '2026-03-05T11:00:00Z', updatedAt: '2026-03-18T10:00:00Z',
            },
        ];

        // GRC demo data
        const grcControls = [
            {
                id: 'gc1', controlId: 'A.5.1', title: 'Information Security Policies',
                framework: 'ISO 27001:2022', domain: 'Governance',
                description: 'Kebijakan keamanan informasi harus didefinisikan, disetujui manajemen, dipublikasikan dan dikomunikasikan.',
                status: 'implemented', linkedFindings: [],
                createdAt: '2026-01-15T08:00:00Z', updatedAt: '2026-03-10T08:00:00Z',
            },
            {
                id: 'gc2', controlId: 'A.8.1', title: 'User Endpoint Devices',
                framework: 'ISO 27001:2022', domain: 'Technology',
                description: 'Informasi yang disimpan, diproses, atau diakses melalui user endpoint devices harus dilindungi.',
                status: 'partial', linkedFindings: ['f2'],
                createdAt: '2026-01-15T08:00:00Z', updatedAt: '2026-03-10T08:00:00Z',
            },
            {
                id: 'gc3', controlId: 'A.8.20', title: 'Network Security',
                framework: 'ISO 27001:2022', domain: 'Technology',
                description: 'Jaringan dan perangkat jaringan harus diamankan, dikelola, dan dikontrol.',
                status: 'partial', linkedFindings: ['f1', 'f3'],
                createdAt: '2026-01-15T08:00:00Z', updatedAt: '2026-03-10T08:00:00Z',
            },
            {
                id: 'gc4', controlId: 'A.5.15', title: 'Access Control',
                framework: 'ISO 27001:2022', domain: 'Governance',
                description: 'Aturan untuk mengontrol akses fisik dan logis ke informasi dan aset terkait harus diterapkan.',
                status: 'not-implemented', linkedFindings: ['f4'],
                createdAt: '2026-01-15T08:00:00Z', updatedAt: '2026-03-10T08:00:00Z',
            },
            {
                id: 'gc5', controlId: 'A.8.13', title: 'Information Backup',
                framework: 'ISO 27001:2022', domain: 'Technology',
                description: 'Salinan cadangan informasi, perangkat lunak, dan sistem harus dipelihara dan diuji secara teratur.',
                status: 'partial', linkedFindings: ['f5'],
                createdAt: '2026-01-15T08:00:00Z', updatedAt: '2026-03-10T08:00:00Z',
            },
            {
                id: 'gc6', controlId: 'A.5.28', title: 'Collection of Evidence',
                framework: 'ISO 27001:2022', domain: 'Governance',
                description: 'Prosedur untuk identifikasi, pengumpulan, perolehan, dan preservasi bukti terkait insiden keamanan informasi harus diterapkan.',
                status: 'not-implemented', linkedFindings: ['f6'],
                createdAt: '2026-01-15T08:00:00Z', updatedAt: '2026-03-10T08:00:00Z',
            },
        ];

        const grcRisks = [
            {
                id: 'gr1', riskId: 'R-001', title: 'Unauthorized Network Access',
                category: 'Technology', owner: 'IT Infrastructure',
                description: 'Risiko akses tidak sah ke jaringan internal melalui konfigurasi firewall yang lemah.',
                inherentLikelihood: 4, inherentImpact: 5,
                residualLikelihood: 3, residualImpact: 4,
                mitigationStatus: 'in-progress', linkedFindings: ['f1', 'f3'],
                controls: ['gc3'], treatment: 'Mitigate',
                createdAt: '2026-01-20T08:00:00Z', updatedAt: '2026-03-10T08:00:00Z',
            },
            {
                id: 'gr2', riskId: 'R-002', title: 'Unpatched Vulnerabilities',
                category: 'Technology', owner: 'IT Operations',
                description: 'Risiko eksploitasi kerentanan pada server yang belum di-patch.',
                inherentLikelihood: 3, inherentImpact: 5,
                residualLikelihood: 3, residualImpact: 5,
                mitigationStatus: 'open', linkedFindings: ['f2'],
                controls: ['gc2'], treatment: 'Mitigate',
                createdAt: '2026-01-20T08:00:00Z', updatedAt: '2026-03-10T08:00:00Z',
            },
            {
                id: 'gr3', riskId: 'R-003', title: 'Data Breach via Shared Credentials',
                category: 'People', owner: 'Finance',
                description: 'Risiko kebocoran data finansial akibat penggunaan shared account.',
                inherentLikelihood: 4, inherentImpact: 4,
                residualLikelihood: 1, residualImpact: 4,
                mitigationStatus: 'resolved', linkedFindings: ['f4'],
                controls: ['gc4'], treatment: 'Mitigate',
                createdAt: '2026-01-20T08:00:00Z', updatedAt: '2026-03-14T16:00:00Z',
            },
            {
                id: 'gr4', riskId: 'R-004', title: 'Data Loss due to Backup Failure',
                category: 'Technology', owner: 'IT Operations',
                description: 'Risiko kehilangan data keuangan jika prosedur DR tidak berfungsi.',
                inherentLikelihood: 2, inherentImpact: 5,
                residualLikelihood: 2, residualImpact: 5,
                mitigationStatus: 'in-progress', linkedFindings: ['f5'],
                controls: ['gc5'], treatment: 'Mitigate',
                createdAt: '2026-01-20T08:00:00Z', updatedAt: '2026-03-10T08:00:00Z',
            },
        ];

        const grcCompliance = [
            {
                id: 'gcomp1', regulation: 'ISO 27001:2022',
                requirement: 'A.5 — Organizational Controls',
                description: 'Kebijakan dan prosedur keamanan informasi organisasi harus didokumentasikan dan dikomunikasikan.',
                status: 'partial', gapCount: 2,
                linkedControls: ['gc1', 'gc4', 'gc6'],
                notes: 'Kebijakan sudah ada namun kontrol akses dan evidence collection belum diterapkan.',
                createdAt: '2026-02-01T08:00:00Z', updatedAt: '2026-03-10T08:00:00Z',
            },
            {
                id: 'gcomp2', regulation: 'ISO 27001:2022',
                requirement: 'A.8 — Technological Controls',
                description: 'Kontrol teknologi untuk keamanan endpoint, jaringan, backup, dan lainnya harus diterapkan.',
                status: 'partial', gapCount: 3,
                linkedControls: ['gc2', 'gc3', 'gc5'],
                notes: 'Network security dan backup masih memerlukan perbaikan signifikan.',
                createdAt: '2026-02-01T08:00:00Z', updatedAt: '2026-03-10T08:00:00Z',
            },
            {
                id: 'gcomp3', regulation: 'PBI/POJK Regulasi IT',
                requirement: 'Standar Minimum Audit Log Retention',
                description: 'Log audit harus disimpan minimal 1 tahun sesuai regulasi OJK.',
                status: 'non-compliant', gapCount: 1,
                linkedControls: ['gc6'],
                notes: 'Retention period saat ini hanya 30 hari, perlu ditingkatkan.',
                createdAt: '2026-02-01T08:00:00Z', updatedAt: '2026-03-10T08:00:00Z',
            },
            {
                id: 'gcomp4', regulation: 'Internal Policy',
                requirement: 'Disaster Recovery Testing',
                description: 'DR drill harus dilakukan minimal setiap 6 bulan.',
                status: 'non-compliant', gapCount: 1,
                linkedControls: ['gc5'],
                notes: 'DR drill belum pernah dilakukan, dijadwalkan April 2026.',
                createdAt: '2026-02-01T08:00:00Z', updatedAt: '2026-03-10T08:00:00Z',
            },
        ];

        this._set(this.KEYS.AUDIT_PLANS, plans);
        this._set(this.KEYS.FINDINGS, findings);
        this._set(this.KEYS.ACTIVITIES, activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
        this._set(this.KEYS.FOLLOWUP_ACTIONS, followups);
        this._set(this.KEYS.GRC_CONTROLS, grcControls);
        this._set(this.KEYS.GRC_RISKS, grcRisks);
        this._set(this.KEYS.GRC_COMPLIANCE, grcCompliance);
    }
};

// Seed demo data on first load
Store.seedDemoData();
