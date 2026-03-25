# AuditPro — Risk-Based IT Audit System

AuditPro adalah platform audit IT berbasis risiko yang dirancang untuk menyederhanakan siklus audit mulai dari perencanaan, pelaksanaan lapangan, hingga pelaporan dan tindak lanjut. Aplikasi ini mengintegrasikan temuan audit dengan kerangka kerja **Governance, Risk, and Compliance (GRC)**.

![AuditPro Dashboard](https://raw.githubusercontent.com/legacy77/it-audit-system/main/img/preview.png) *(Preview Placeholder)*

## 🚀 Fitur Utama

### 1. Audit Planning & Risk Assessment
- Perencanaan audit dengan penentuan ruang lingkup dan area risiko.
- Penilaian risiko (Likelihood & Impact) untuk memprioritaskan area audit.
- Checklist audit yang dapat disesuaikan.

### 2. Field Audit & execution
- Pencatatan temuan (Findings) secara real-time.
- Kategorisasi temuan berdasarkan tingkat keparahan (Critical, High, Medium, Low).
- Unggah bukti (evidence) dan rekomendasi perbaikan.

### 3. Executive Dashboard
- Visualisasi data temuan dalam bentuk grafik dan stat-cards.
- **Risk Heatmap:** Visualisasi profil risiko (Inherent vs Residual) secara grafis.
- **Automated Conclusions:** Ringkasan status audit untuk top manajemen.

### 4. Follow-up Tracking (Auditee Friendly)
- Antarmuka khusus auditee dengan sistem wizard yang mudah digunakan.
- Pemantauan status tindak lanjut (Open, In Progress, Resolved).
- Verifikasi hasil tindak lanjut oleh auditor.

### 5. GRC Integration (Governance, Risk, Compliance)
- **Governance:** Pemetaan kontrol berbasis framework (misal: ISO 27001).
- **Risk Register:** Pengelolaan katalog risiko organisasi.
- **Compliance:** Pelacakan kepatuhan terhadap regulasi (Internal/Eksternal).
- **Deep Mapping:** Integrasi langsung antara temuan audit dengan kontrol dan risiko GRC.

### 6. Professional Reporting
- Export laporan ke format **PDF** secara instan.
- Laporan komprehensif 8-Seksi yang mencakup detail temuan, status tindak lanjut, dan pemetaan GRC.

## 🛠️ Tech Stack
- **Frontend:** Vanilla HTML5, CSS3, JavaScript (Tanpa framework/library berat).
- **Persistence:** LocalStorage (Data tersimpan di browser).
- **Routing:** Hash-based SPA (Single Page Application).
- **Library:** [html2pdf.js](https://github.com/eKoopmans/html2pdf.js) untuk PDF generation.

## 📦 Cara Penggunaan
1. **Clone Repository:**
   ```bash
   git clone https://github.com/legacy77/it-audit-system.git
   ```
2. **Jalankan Secara Lokal:**
   Anda dapat membuka `index.html` langsung di browser atau menggunakan live server lokal.
3. **Deployment:**
   Proyek ini telah dikonfigurasi untuk [Netlify](https://www.netlify.com/). Cukup hubungkan repositori ini ke akun Netlify Anda untuk deployment otomatis.

## 📄 Lisensi
Distributed under the MIT License. See `LICENSE` for more information.

---
Dikembangkan untuk efisiensi audit dan tata kelola IT yang lebih baik.
