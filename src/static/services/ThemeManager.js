window.ThemeManager = {
    init() {
        this.applyTheme(this.getStoredTheme() || this.getSystemTheme());
        this.setupAutoTheme();
    },

    getStoredTheme() {
        return localStorage.getItem('theme');
    },

    getSystemTheme() {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    },

    applyTheme(theme) {
        const root = document.documentElement;
        
        if (theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }

        localStorage.setItem('theme', theme);
        this.updateThemeIcon(theme);
    },

    toggle() {
        const currentTheme = this.getStoredTheme() || this.getSystemTheme();
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        this.applyTheme(newTheme);
    },

    updateThemeIcon(theme) {
        const icon = document.querySelector('[data-theme-toggle] i');
        if (icon) {
            icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        }
    },

    setupAutoTheme() {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        mediaQuery.addEventListener('change', (e) => {
            if (!this.getStoredTheme()) {
                this.applyTheme(e.matches ? 'dark' : 'light');
            }
        });
    },

    getCurrentTheme() {
        return this.getStoredTheme() || this.getSystemTheme();
    }
};