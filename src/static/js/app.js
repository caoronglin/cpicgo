/**
 * 主应用模块
 * 应用的入口点，负责初始化和协调各个模块
 */

class App {
    constructor() {
        this.isInitialized = false;
        this.init();
    }

    /**
     * 初始化应用
     */
    async init() {
        try {
            console.log('🚀 初始化应用...');
            
            // 等待DOM加载完成
            if (document.readyState === 'loading') {
                await new Promise(resolve => {
                    document.addEventListener('DOMContentLoaded', resolve);
                });
            }

            // 初始化各个模块
            await this.initializeModules();
            
            // 绑定状态监听器
            this.bindStateListeners();
            
            // 加载初始数据
            await this.loadInitialData();
            
            this.isInitialized = true;
            console.log('✅ 应用初始化完成');
            
            // 显示欢迎通知
            stateManager.addNotification('欢迎使用图床管理系统', 'success');
            
        } catch (error) {
            console.error('❌ 应用初始化失败:', error);
            stateManager.addError('应用初始化失败：' + error.message);
        }
    }

    /**
     * 初始化各个模块
     */
    async initializeModules() {
        // 确保所有模块已加载
        if (!window.stateManager || !window.uiManager) {
            throw new Error('模块加载失败');
        }

        // 设置API客户端的基础URL
        ApiClient.baseUrl = AppConfig.api.baseUrl;
        
        console.log('✅ 模块初始化完成');
    }

    /**
     * 绑定状态监听器
     */
    bindStateListeners() {
        // 监听图片数据变化
        stateManager.subscribe((type, state) => {
            switch (type) {
                case 'images':
                    this.handleImagesChange(state);
                    break;
                case 'stats':
                    this.handleStatsChange(state);
                    break;
                case 'folders':
                    this.handleFoldersChange(state);
                    break;
                case 'loading':
                    this.handleLoadingChange(state);
                    break;
                case 'upload':
                    this.handleUploadChange(state);
                    break;
                case 'search':
                    this.handleSearchChange(state);
                    break;
                case 'notification':
                    this.handleNotificationChange(state);
                    break;
                case 'error':
                    this.handleErrorChange(state);
                    break;
                case 'folder':
                    this.handleFolderChange(state);
                    break;
            }
        });
    }

    /**
     * 加载初始数据
     */
    async loadInitialData() {
        try {
            stateManager.setLoading(true);
            
            // 加载图片列表
            const images = await apiClient.getImages();
            stateManager.setImages(images);
            
            // 恢复当前文件夹
            const savedFolder = localStorage.getItem(AppConfig.storage.keys.currentFolder) || '';
            stateManager.setCurrentFolder(savedFolder);
            
            console.log('✅ 初始数据加载完成');
            
        } catch (error) {
            console.error('❌ 加载初始数据失败:', error);
            stateManager.addError('加载数据失败：' + error.message);
        } finally {
            stateManager.setLoading(false);
        }
    }

    /**
     * 处理图片数据变化
     * @param {Object} state - 当前状态
     */
    handleImagesChange(state) {
        const filteredImages = stateManager.getFilteredImages();
        uiManager.renderImages(filteredImages);
    }

    /**
     * 处理统计信息变化
     * @param {Object} state - 当前状态
     */
    handleStatsChange(state) {
        uiManager.updateStats(state.stats);
    }

    /**
     * 处理文件夹变化
     * @param {Object} state - 当前状态
     */
    handleFoldersChange(state) {
        uiManager.renderFolders(state.folders);
    }

    /**
     * 处理加载状态变化
     * @param {Object} state - 当前状态
     */
    handleLoadingChange(state) {
        uiManager.showLoading(state.isLoading);
    }

    /**
     * 处理上传状态变化
     * @param {Object} state - 当前状态
     */
    handleUploadChange(state) {
        if (state.isUploading) {
            uiManager.showUploadProgress(state.uploadProgress);
        } else {
            uiManager.hideUploadProgress();
        }
    }

    /**
     * 处理搜索变化
     * @param {Object} state - 当前状态
     */
    handleSearchChange(state) {
        const filteredImages = stateManager.getFilteredImages();
        uiManager.renderImages(filteredImages);
    }

    /**
     * 处理文件夹变化
     * @param {Object} state - 当前状态
     */
    handleFolderChange(state) {
        const filteredImages = stateManager.getFilteredImages();
        uiManager.renderImages(filteredImages);
        
        if (uiManager.elements.currentFolder) {
            uiManager.elements.currentFolder.textContent = state.currentFolder || '根目录';
        }
    }

    /**
     * 处理通知变化
     * @param {Object} state - 当前状态
     */
    handleNotificationChange(state) {
        const lastNotification = state.notifications[state.notifications.length - 1];
        if (lastNotification) {
            uiManager.showNotification(lastNotification);
        }
    }

    /**
     * 处理错误变化
     * @param {Object} state - 当前状态
     */
    handleErrorChange(state) {
        const lastError = state.errors[state.errors.length - 1];
        if (lastError) {
            // 显示错误通知
            stateManager.addNotification(lastError.message, 'error');
        }
    }

    /**
     * 刷新数据
     */
    async refreshData() {
        try {
            stateManager.setLoading(true);
            
            const images = await apiClient.getImages();
            stateManager.setImages(images);
            
            stateManager.addNotification('数据已刷新', 'success');
            
        } catch (error) {
            stateManager.addError('刷新数据失败：' + error.message);
        } finally {
            stateManager.setLoading(false);
        }
    }

    /**
     * 获取应用信息
     * @returns {Object} 应用信息
     */
    getAppInfo() {
        return {
            version: '1.0.0',
            name: 'R2图床管理系统',
            initialized: this.isInitialized,
            modules: {
                state: !!window.stateManager,
                ui: !!window.uiManager,
                api: !!window.ApiClient,
                utils: !!window.Utils
            }
        };
    }

    /**
     * 销毁应用
     */
    destroy() {
        // 清理资源
        stateManager.reset();
        console.log('🗑️ 应用已销毁');
    }
}

/**
 * 全局错误处理
 */
window.addEventListener('error', (event) => {
    console.error('全局错误:', event.error);
    if (window.stateManager) {
        stateManager.addError('发生未知错误：' + event.error.message);
    }
});

/**
 * 未处理的Promise拒绝
 */
window.addEventListener('unhandledrejection', (event) => {
    console.error('未处理的Promise拒绝:', event.reason);
    if (window.stateManager) {
        stateManager.addError('网络请求失败：' + (event.reason.message || '未知错误'));
    }
});

/**
 * 页面可见性变化
 */
document.addEventListener('visibilitychange', () => {
    if (!document.hidden && window.app && window.app.isInitialized) {
        // 页面重新可见时刷新数据
        console.log('页面重新可见，刷新数据...');
        window.app.refreshData();
    }
});

/**
 * 注册全局方法
 */
window.App = App;
window.app = new App();

// 开发工具
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    window.debug = {
        stateManager: window.stateManager,
        uiManager: window.uiManager,
        ApiClient: window.ApiClient,
        Utils: window.Utils,
        app: window.app
    };
    
    console.log('🔧 开发模式已启用');
    console.log('可用调试对象:', Object.keys(window.debug));
}

// 导出App类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = App;
}