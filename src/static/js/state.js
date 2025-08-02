/**
 * 状态管理模块
 * 集中管理应用的全局状态
 */

class StateManager {
    constructor() {
        this.state = {
            images: [],
            folders: [],
            currentFolder: '',
            isLoading: false,
            isUploading: false,
            uploadProgress: 0,
            searchQuery: '',
            selectedImages: [],
            stats: {
                totalImages: 0,
                totalSize: 0,
                todayUploads: 0
            },
            modals: {
                auth: false,
                folder: false,
                preview: false
            },
            auth: {
                token: this.getStoredToken()
            },
            errors: [],
            notifications: []
        };
        
        this.listeners = new Set();
    }

    /**
     * 获取存储的Token
     * @returns {string} Token
     */
    getStoredToken() {
        return localStorage.getItem(AppConfig.storage.keys.apiToken) || AppConfig.defaultToken;
    }

    /**
     * 保存Token到存储
     * @param {string} token - Token
     */
    saveToken(token) {
        localStorage.setItem(AppConfig.storage.keys.apiToken, token);
        this.state.auth.token = token;
        this.notify('auth');
    }

    /**
     * 获取当前Token
     * @returns {string} Token
     */
    static getToken() {
        return StateManager.instance.state.auth.token;
    }

    /**
     * 获取当前文件夹
     * @returns {string} 当前文件夹路径
     */
    static getCurrentFolder() {
        return StateManager.instance.state.currentFolder;
    }

    /**
     * 设置当前文件夹
     * @param {string} folder - 文件夹路径
     */
    setCurrentFolder(folder) {
        this.state.currentFolder = folder;
        localStorage.setItem(AppConfig.storage.keys.currentFolder, folder);
        this.notify('folder');
    }

    /**
     * 设置图片列表
     * @param {Array} images - 图片数组
     */
    setImages(images) {
        this.state.images = images;
        this.updateStats();
        this.updateFolders();
        this.notify('images');
    }

    /**
     * 添加图片
     * @param {Object} image - 图片对象
     */
    addImage(image) {
        this.state.images.unshift(image);
        this.updateStats();
        this.updateFolders();
        this.notify('images');
    }

    /**
     * 移除图片
     * @param {string} key - 图片key
     */
    removeImage(key) {
        this.state.images = this.state.images.filter(img => img.key !== key);
        this.updateStats();
        this.updateFolders();
        this.notify('images');
    }

    /**
     * 更新统计信息
     */
    updateStats() {
        this.state.stats.totalImages = this.state.images.length;
        this.state.stats.totalSize = this.state.images.reduce((sum, img) => sum + (img.size || 0), 0);
        this.state.stats.todayUploads = this.state.images.filter(img => 
            Utils.isTodayUpload(img.lastModified || img.uploadedAt)
        ).length;
        
        this.notify('stats');
    }

    /**
     * 更新文件夹列表
     */
    updateFolders() {
        this.state.folders = Utils.getFolders(this.state.images);
        this.notify('folders');
    }

    /**
     * 设置加载状态
     * @param {boolean} loading - 是否加载中
     */
    setLoading(loading) {
        this.state.isLoading = loading;
        this.notify('loading');
    }

    /**
     * 设置上传状态
     * @param {boolean} uploading - 是否上传中
     * @param {number} progress - 上传进度
     */
    setUploading(uploading, progress = 0) {
        this.state.isUploading = uploading;
        this.state.uploadProgress = progress;
        this.notify('upload');
    }

    /**
     * 设置搜索查询
     * @param {string} query - 搜索查询
     */
    setSearchQuery(query) {
        this.state.searchQuery = query;
        this.notify('search');
    }

    /**
     * 获取过滤后的图片
     * @returns {Array} 过滤后的图片数组
     */
    getFilteredImages() {
        let filtered = [...this.state.images];
        
        // 按文件夹过滤
        if (this.state.currentFolder) {
            filtered = filtered.filter(img => 
                img.key.startsWith(this.state.currentFolder + (this.state.currentFolder ? '/' : ''))
            );
        }
        
        // 按搜索查询过滤
        if (this.state.searchQuery) {
            const query = this.state.searchQuery.toLowerCase();
            filtered = filtered.filter(img => 
                img.key.toLowerCase().includes(query) ||
                Utils.getFileName(img.key).toLowerCase().includes(query)
            );
        }
        
        // 按时间排序（最新的在前）
        return filtered.sort((a, b) => 
            new Date(b.lastModified || b.uploadedAt || 0) - 
            new Date(a.lastModified || a.uploadedAt || 0)
        );
    }

    /**
     * 切换模态框
     * @param {string} modal - 模态框名称
     * @param {boolean} show - 是否显示
     */
    toggleModal(modal, show = null) {
        this.state.modals[modal] = show !== null ? show : !this.state.modals[modal];
        this.notify('modal');
    }

    /**
     * 添加错误
     * @param {string} message - 错误消息
     */
    addError(message) {
        const error = {
            id: Utils.generateId(),
            message,
            timestamp: new Date()
        };
        this.state.errors.push(error);
        this.notify('error');
        
        // 3秒后自动移除错误
        setTimeout(() => {
            this.removeError(error.id);
        }, 3000);
    }

    /**
     * 移除错误
     * @param {string} id - 错误ID
     */
    removeError(id) {
        this.state.errors = this.state.errors.filter(error => error.id !== id);
        this.notify('error');
    }

    /**
     * 添加通知
     * @param {string} message - 通知消息
     * @param {string} type - 通知类型（success, error, warning, info）
     */
    addNotification(message, type = 'info') {
        const notification = {
            id: Utils.generateId(),
            message,
            type,
            timestamp: new Date()
        };
        this.state.notifications.push(notification);
        this.notify('notification');
        
        // 3秒后自动移除通知
        setTimeout(() => {
            this.removeNotification(notification.id);
        }, AppConfig.ui.notifications.duration);
    }

    /**
     * 移除通知
     * @param {string} id - 通知ID
     */
    removeNotification(id) {
        this.state.notifications = this.state.notifications.filter(n => n.id !== id);
        this.notify('notification');
    }

    /**
     * 订阅状态变化
     * @param {Function} listener - 监听器函数
     * @returns {Function} 取消订阅函数
     */
    subscribe(listener) {
        this.listeners.add(listener);
        
        return () => {
            this.listeners.delete(listener);
        };
    }

    /**
     * 通知所有监听器
     * @param {string} type - 变化类型
     */
    notify(type) {
        this.listeners.forEach(listener => {
            try {
                listener(type, this.state);
            } catch (error) {
                console.error('状态监听器错误:', error);
            }
        });
    }

    /**
     * 获取当前状态
     * @returns {Object} 当前状态
     */
    getState() {
        return { ...this.state };
    }

    /**
     * 重置状态
     */
    reset() {
        this.state = {
            images: [],
            folders: [],
            currentFolder: '',
            isLoading: false,
            isUploading: false,
            uploadProgress: 0,
            searchQuery: '',
            selectedImages: [],
            stats: {
                totalImages: 0,
                totalSize: 0,
                todayUploads: 0
            },
            modals: {
                auth: false,
                folder: false,
                preview: false
            },
            auth: {
                token: this.getStoredToken()
            },
            errors: [],
            notifications: []
        };
        
        this.notify('reset');
    }
}

// 创建单例
StateManager.instance = new StateManager();

// 导出状态管理器
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StateManager;
} else {
    window.StateManager = StateManager;
    window.stateManager = StateManager.instance;
}