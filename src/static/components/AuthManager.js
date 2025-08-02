window.AuthManager = {
    init() {
        this.updateStatus();
    },

    getHeaders() {
        const authType = localStorage.getItem('authType') || 'token';
        const headers = {};

        if (authType === 'basic') {
            const username = localStorage.getItem('username');
            const password = localStorage.getItem('password');
            if (username && password) {
                headers['Authorization'] = 'Basic ' + btoa(username + ':' + password);
            }
        } else {
            const token = localStorage.getItem('apiToken');
            if (token) headers['Authorization'] = 'Bearer ' + token;
        }

        return headers;
    },

    isAuthenticated() {
        const authType = localStorage.getItem('authType') || 'token';
        return authType === 'basic' 
            ? !!(localStorage.getItem('username') && localStorage.getItem('password'))
            : !!localStorage.getItem('apiToken');
    },

    updateStatus() {
        const status = document.getElementById('auth-status');
        if (status) {
            status.className = `ml-2 w-2 h-2 rounded-full inline-block ${this.isAuthenticated() ? 'bg-green-500' : 'bg-red-500'}`;
        }
    },

    handleAuthError(response) {
        if (response.status === 401) {
            NotificationService.error('认证失败，请检查您的认证信息');
            return true;
        }
        return false;
    },

    saveBasicAuth(username, password) {
        if (!username || !password) {
            NotificationService.error('用户名和密码不能为空');
            return false;
        }

        localStorage.setItem('authType', 'basic');
        localStorage.setItem('username', username);
        localStorage.setItem('password', password);
        this.updateStatus();
        NotificationService.success('用户名密码认证已保存');
        return true;
    },

    generateNewToken() {
        const token = 'tk_' + Math.random().toString(36).substr(2, 16);
        localStorage.setItem('apiToken', token);
        localStorage.setItem('authType', 'token');
        this.updateStatus();
        NotificationService.success('新Token已生成');
        return token;
    },

    copyToken() {
        const token = localStorage.getItem('apiToken');
        if (token) {
            navigator.clipboard.writeText(token);
            NotificationService.success('Token已复制');
        }
    },

    switchToTokenAuth() {
        localStorage.setItem('authType', 'token');
        this.updateStatus();
        NotificationService.success('已切换到API Token认证');
    },

    logout() {
        localStorage.removeItem('username');
        localStorage.removeItem('password');
        localStorage.removeItem('apiToken');
        this.updateStatus();
        NotificationService.success('已退出登录');
    }
};