window.ImageManager = {
    async loadImages() {
        const headers = AuthManager.getHeaders();
        if (!headers.Authorization) {
            throw new Error('请先配置认证信息');
        }

        const response = await fetch('/list', { headers });
        
        if (!response.ok) {
            if (AuthManager.handleAuthError(response)) {
                throw new Error('认证失败');
            }
            throw new Error('加载失败');
        }

        return await response.json();
    },

    async uploadFile(file, folder = '') {
        const headers = AuthManager.getHeaders();
        if (!headers.Authorization) {
            throw new Error('请先配置认证信息');
        }

        const path = folder ? `${folder}/${file.name}` : file.name;
        
        const response = await fetch(`/${path}`, {
            method: 'PUT',
            body: file,
            headers
        });

        if (!response.ok) {
            if (AuthManager.handleAuthError(response)) {
                throw new Error('认证失败');
            }
            throw new Error(`上传失败: ${response.statusText}`);
        }

        return true;
    },

    async createFolder(path) {
        const headers = AuthManager.getHeaders();
        if (!headers.Authorization) {
            throw new Error('请先配置认证信息');
        }

        const response = await fetch(`/${path}/`, {
            method: 'PUT',
            headers
        });

        if (!response.ok) {
            if (AuthManager.handleAuthError(response)) {
                throw new Error('认证失败');
            }
            throw new Error('创建文件夹失败');
        }

        return true;
    },

    async deleteImage(id) {
        const headers = AuthManager.getHeaders();
        if (!headers.Authorization) {
            throw new Error('请先配置认证信息');
        }

        const response = await fetch(`/${id}`, {
            method: 'DELETE',
            headers
        });

        if (!response.ok) {
            if (AuthManager.handleAuthError(response)) {
                throw new Error('认证失败');
            }
            throw new Error('删除失败');
        }

        return true;
    },

    getFolders(images) {
        return [...new Set(images.map(img => img.path.split('/')[0]).filter(p => p))];
    },

    filterImagesByFolder(images, folder) {
        if (!folder) {
            return images.filter(img => !img.path.includes('/'));
        }
        return images.filter(img => img.path.startsWith(folder));
    },

    formatBytes(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
};