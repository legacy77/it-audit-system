/**
 * App — Main Router & Initialization
 */
const App = {
    pages: {
        dashboard: { module: DashboardPage, title: 'Dashboard' },
        planning: { module: PlanningPage, title: 'Perencanaan Audit' },
        fieldwork: { module: FieldworkPage, title: 'Field Audit' },
        reporting: { module: ReportingPage, title: 'Reporting' },
        generate: { module: GeneratePage, title: 'Generate Laporan' },
    },

    currentPage: 'dashboard',

    init() {
        // Set current date
        const dateEl = document.getElementById('current-date');
        if (dateEl) {
            dateEl.textContent = new Date().toLocaleDateString('id-ID', {
                weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
            });
        }

        // Navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const page = item.dataset.page;
                if (page) App.navigate(page);
            });
        });

        // Mobile menu toggle
        document.getElementById('menu-toggle')?.addEventListener('click', () => {
            document.getElementById('sidebar').classList.toggle('open');
        });

        // Modal close
        document.getElementById('modal-close')?.addEventListener('click', Utils.closeModal);
        document.getElementById('modal-overlay')?.addEventListener('click', (e) => {
            if (e.target === e.currentTarget) Utils.closeModal();
        });

        // Escape key to close modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') Utils.closeModal();
        });

        // Handle hash routing
        const hash = window.location.hash.slice(1) || 'dashboard';
        this.navigate(hash);

        window.addEventListener('hashchange', () => {
            const page = window.location.hash.slice(1) || 'dashboard';
            if (page !== this.currentPage) this.navigate(page);
        });
    },

    navigate(page) {
        if (!this.pages[page]) page = 'dashboard';
        this.currentPage = page;
        window.location.hash = page;

        // Update sidebar active state
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.toggle('active', item.dataset.page === page);
        });

        // Update title
        document.getElementById('page-title').textContent = this.pages[page].title;

        // Render page
        const container = document.getElementById('page-content');
        container.innerHTML = this.pages[page].module.render();

        // Initialize page event bindings
        this.pages[page].module.init();

        // Close mobile sidebar
        document.getElementById('sidebar').classList.remove('open');

        // Scroll to top
        container.scrollTop = 0;
    }
};

// Boot
document.addEventListener('DOMContentLoaded', () => App.init());
