/**
 * UI组件模块
 * 管理页面UI组件的渲染和交互
 */

class UIManager {
    constructor() {
        this.elements = {};
        this.init();
    }

    /**
     * 初始化UI管理器
     */
    init() {
        this.cacheElements();
        this.bindEvents();
        this.setupTheme();
    }

    /**
     * 缓存DOM元素
     */
    cacheElements() {
        this.elements = {
            // 导航栏
            nav: document.getElementById('nav'),
            themeToggle: document.getElementById('themeToggle'),
            authBtn: document.getElementById('authBtn'),
            
            // 上传区域
            uploadArea: document.getElementById('uploadArea'),
            fileInput: document.getElementById('fileInput'),
            uploadBtn: document.getElementById('uploadBtn'),
            uploadProgress: document.getElementById('uploadProgress'),
            
            // 统计信息
            stats: document.getElementById('stats'),
            totalImages: document.getElementById('totalImages'),
            totalSize: document.getElementById('totalSize'),
            todayUploads: document.getElementById('todayUploads'),
            
            // 文件夹导航
            folderNav: document.getElementById('folderNav'),
            currentFolder: document.getElementById('currentFolder'),
            
            // 搜索和过滤
            searchInput: document.getElementById('searchInput'),
            clearSearch: document.getElementById('clearSearch'),
            
            // 图片网格
            imageGrid: document.getElementById('imageGrid'),
            
            // 空状态
            emptyState: document.getElementById('emptyState'),
            
            // 通知
            notifications: document.getElementById('notifications'),
            
            // 模态框
            authModal: document.getElementById('authModal'),
            folderModal: document.getElementById('folderModal'),
            previewModal: document.getElementById('previewModal')
        };
    }

    /**
     * 绑定事件监听器
     */
    bindEvents() {
        // 主题切换
        if (this.elements.themeToggle) {
            this.elements.themeToggle.addEventListener('click', () => this.toggleTheme());
        }

        // 文件上传
        if (this.elements.uploadArea) {
            this.elements.uploadArea.addEventListener('dragover', (e) => this.handleDragOver(e));
            this.elements.uploadArea.addEventListener('dragleave', (e) => this.handleDragLeave(e));
            this.elements.uploadArea.addEventListener('drop', (e) => this.handleDrop(e));
            this.elements.uploadArea.addEventListener('click', () => this.elements.fileInput.click());
        }

        if (this.elements.fileInput) {
            this.elements.fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        }

        if (this.elements.uploadBtn) {
            this.elements.uploadBtn.addEventListener('click', () => this.handleUpload());
        }

        // 搜索
        if (this.elements.searchInput) {
            this.elements.searchInput.addEventListener('input', 
                Utils.debounce((e) => this.handleSearch(e), 300)
            );
        }

        if (this.elements.clearSearch) {
            this.elements.clearSearch.addEventListener('click', () => this.clearSearch());
        }

        // 认证
        if (this.elements.authBtn) {
            this.elements.authBtn.addEventListener('click', () => this.toggleAuthModal());
        }

        // 键盘事件
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
    }

    /**
     * 设置主题
     */
    setupTheme() {
        const savedTheme = localStorage.getItem(AppConfig.storage.keys.theme) || 'light';
        this.setTheme(savedTheme);
    }

    /**
     * 切换主题
     */
    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        this.setTheme(newTheme);
        localStorage.setItem(AppConfig.storage.keys.theme, newTheme);
        
        stateManager.addNotification(
            newTheme === 'dark' ? '已切换到深色模式' : '已切换到浅色模式',
            'success'
        );
    }

    /**
     * 设置主题
     * @param {string} theme - 主题名称
     */
    setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        
        const icon = this.elements.themeToggle?.querySelector('i');
        if (icon) {
            icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        }
    }

    /**
     * 显示/隐藏元素
     * @param {HTMLElement} element - 元素
     * @param {boolean} show - 是否显示
     */
    toggleElement(element, show) {
        if (element) {
            element.style.display = show ? 'block' : 'none';
        }
    }

    /**
     * 显示加载状态
     * @param {boolean} loading - 是否加载中
     */
    showLoading(loading) {
        if (this.elements.imageGrid) {
            this.elements.imageGrid.innerHTML = loading ? 
                '<div class="loading">加载中...</div>' : '';
        }
    }

    /**
     * 渲染图片网格
     * @param {Array} images - 图片数组
     */
    renderImages(images) {
        if (!this.elements.imageGrid) return;

        if (images.length === 0) {
            this.showEmptyState();
            return;
        }

        this.hideEmptyState();
        
        this.elements.imageGrid.innerHTML = images.map(image => 
            this.renderImageCard(image)
        ).join('');

        // 绑定图片卡片事件
        this.bindImageEvents();
    }

    /**
     * 渲染单个图片卡片
     * @param {Object} image - 图片对象
     * @returns {string} HTML字符串
     */
    renderImageCard(image) {
        const fileName = Utils.getFileName(image.key);
        const fileSize = Utils.formatFileSize(image.size);
        const uploadTime = Utils.formatDate(image.lastModified || image.uploadedAt);
        const previewUrl = image.url || `${ApiClient.baseUrl}/${image.key}`;
        
        return `
            <div class="image-card" data-key="${image.key}">
                <div class="image-container">
                    <img src="${previewUrl}" alt="${fileName}" loading="lazy">
                    <div class="image-overlay">
                        <div class="image-actions">
                            <button class="btn-icon" data-action="preview" title="预览">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="btn-icon" data-action="copy" title="复制链接">
                                <i class="fas fa-copy"></i>
                            </button>
                            <button class="btn-icon" data-action="download" title="下载">
                                <i class="fas fa-download"></i>
                            </button>
                            <button class="btn-icon btn-danger" data-action="delete" title="删除">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
                <div class="image-info">
                    <div class="image-name" title="${fileName}">${fileName}</div>
                    <div class="image-meta">
                        <span>${fileSize}</span>
                        <span>${uploadTime}</span>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * 绑定图片卡片事件
     */
    bindImageEvents() {
        const cards = document.querySelectorAll('.image-card');
        cards.forEach(card => {
            const actions = card.querySelectorAll('[data-action]');
            actions.forEach(action => {
                action.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const key = card.dataset.key;
                    const actionType = action.dataset.action;
                    
                    switch (actionType) {
                        case 'preview':
                            this.showPreview(key);
                            break;
                        case 'copy':
                            this.copyImageUrl(key);
                            break;
                        case 'download':
                            this.downloadImage(key);
                            break;
                        case 'delete':
                            this.deleteImage(key);
                            break;
                    }
                });
            });

            // 双击预览
            card.addEventListener('dblclick', () => {
                this.showPreview(card.dataset.key);
            });
        });
    }

    /**
     * 显示空状态
     */
    showEmptyState() {
        if (this.elements.emptyState) {
            this.elements.emptyState.style.display = 'block';
            this.elements.imageGrid.innerHTML = '';
        }
    }

    /**
     * 隐藏空状态
     */
    hideEmptyState() {
        if (this.elements.emptyState) {
            this.elements.emptyState.style.display = 'none';
        }
    }

    /**
     * 更新统计信息
     * @param {Object} stats - 统计信息
     */
    updateStats(stats) {
        if (this.elements.totalImages) {
            this.elements.totalImages.textContent = stats.totalImages;
        }
        if (this.elements.totalSize) {
            this.elements.totalSize.textContent = Utils.formatFileSize(stats.totalSize);
        }
        if (this.elements.todayUploads) {
            this.elements.todayUploads.textContent = stats.todayUploads;
        }
    }

    /**
     * 渲染文件夹导航
     * @param {Array} folders - 文件夹数组
     */
    renderFolders(folders) {
        if (!this.elements.folderNav) return;

        const currentFolder = StateManager.getCurrentFolder();
        
        let html = '<div class="folder-item" data-folder="">根目录</div>';
        
        folders.forEach(folder => {
            const isActive = folder === currentFolder;
            html += `
                <div class="folder-item ${isActive ? 'active' : ''}" data-folder="${folder}">
                    ${folder}
                </div>
            `;
        });

        this.elements.folderNav.innerHTML = html;

        // 绑定文件夹点击事件
        const folderItems = this.elements.folderNav.querySelectorAll('.folder-item');
        folderItems.forEach(item => {
            item.addEventListener('click', () => {
                const folder = item.dataset.folder;
                stateManager.setCurrentFolder(folder);
            });
        });
    }

    /**
     * 显示上传进度
     * @param {number} progress - 进度百分比
     */
    showUploadProgress(progress) {
        if (this.elements.uploadProgress) {
            this.elements.uploadProgress.style.display = 'block';
            this.elements.uploadProgress.querySelector('.progress-bar').style.width = `${progress}%`;
            this.elements.uploadProgress.querySelector('.progress-text').textContent = `${progress}%`;
        }
    }

    /**
     * 隐藏上传进度
     */
    hideUploadProgress() {
        if (this.elements.uploadProgress) {
            this.elements.uploadProgress.style.display = 'none';
        }
    }

    /**
     * 显示通知
     * @param {Object} notification - 通知对象
     */
    showNotification(notification) {
        if (!this.elements.notifications) return;

        const notificationEl = document.createElement('div');
        notificationEl.className = `notification notification-${notification.type}`;
        notificationEl.innerHTML = `
            <div class="notification-content">
                ${notification.message}
            </div>
            <button class="notification-close" data-id="${notification.id}">
                <i class="fas fa-times"></i>
            </button>
        `;

        this.elements.notifications.appendChild(notificationEl);

        // 绑定关闭按钮事件
        const closeBtn = notificationEl.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            stateManager.removeNotification(notification.id);
        });

        // 3秒后自动移除
        setTimeout(() => {
            notificationEl.remove();
        }, 3000);
    }

    /**
     * 显示预览模态框
     * @param {string} key - 图片key
     */
    showPreview(key) {
        const image = stateManager.getState().images.find(img => img.key === key);
        if (!image) return;

        const previewUrl = image.url || `${ApiClient.baseUrl}/${image.key}`;
        
        if (this.elements.previewModal) {
            this.elements.previewModal.innerHTML = `
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>${Utils.getFileName(image.key)}</h3>
                        <button class="modal-close" data-modal="preview">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        <img src="${previewUrl}" alt="${Utils.getFileName(image.key)}" class="preview-image">
                    </div>
                    <div class="modal-footer">
                        <button class="btn" data-action="copy" data-key="${key}">
                            <i class="fas fa-copy"></i> 复制链接
                        </button>
                        <button class="btn" data-action="download" data-key="${key}">
                            <i class="fas fa-download"></i> 下载
                        </button>
                        <button class="btn btn-danger" data-action="delete" data-key="${key}">
                            <i class="fas fa-trash"></i> 删除
                        </button>
                    </div>
                </div>
            `;
            
            this.elements.previewModal.style.display = 'flex';
            this.bindModalEvents();
        }
    }

    /**
     * 绑定模态框事件
     */
    bindModalEvents() {
        const closeBtns = document.querySelectorAll('[data-modal]');
        closeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const modalName = btn.dataset.modal;
                stateManager.toggleModal(modalName, false);
            });
        });

        // 点击模态框外部关闭
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.style.display = 'none';
                }
            });
        });
    }

    // 事件处理函数
    handleDragOver(e) {
        e.preventDefault();
        e.currentTarget.classList.add('drag-over');
    }

    handleDragLeave(e) {
        e.currentTarget.classList.remove('drag-over');
    }

    handleDrop(e) {
        e.preventDefault();
        e.currentTarget.classList.remove('drag-over');
        
        const files = Array.from(e.dataTransfer.files);
        this.uploadFiles(files);
    }

    handleFileSelect(e) {
        const files = Array.from(e.target.files);
        this.uploadFiles(files);
    }

    handleUpload() {
        this.elements.fileInput.click();
    }

    handleSearch(e) {
        const query = e.target.value;
        stateManager.setSearchQuery(query);
    }

    clearSearch() {
        if (this.elements.searchInput) {
            this.elements.searchInput.value = '';
            stateManager.setSearchQuery('');
        }
    }

    handleKeyDown(e) {
        // ESC键关闭模态框
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal').forEach(modal => {
                modal.style.display = 'none';
            });
        }
    }

    toggleAuthModal() {
        stateManager.toggleModal('auth');
    }

    copyImageUrl(key) {
        const image = stateManager.getState().images.find(img => img.key === key);
        if (image) {
            const url = image.url || `${AppConfig.api.baseUrl}/${image.key}`;
            Utils.copyToClipboard(url);
            stateManager.addNotification('链接已复制到剪贴板', 'success');
        }
    }

    downloadImage(key) {
        const image = stateManager.getState().images.find(img => img.key === key);
        if (image) {
            const url = image.url || `${AppConfig.api.baseUrl}/${image.key}`;
            Utils.downloadFile(url, Utils.getFileName(image.key));
        }
    }

    async deleteImage(key) {
        const confirmed = await this.showConfirmDialog('确定要删除这张图片吗？');
        if (!confirmed) return;

        try {
            await apiClient.deleteImage(key);
            stateManager.removeImage(key);
            stateManager.addNotification('图片删除成功', 'success');
        } catch (error) {
            stateManager.addError('删除失败：' + error.message);
        }
    }

    uploadFiles(files) {
        if (!files || files.length === 0) return;

        // 验证文件
        const validFiles = files.filter(file => {
            if (!Utils.validateFileType(file)) {
                stateManager.addError(`不支持的文件类型：${file.name}`);
                return false;
            }
            
            if (!Utils.validateFileSize(file)) {
                stateManager.addError(`文件过大：${file.name}`);
                return false;
            }
            
            return true;
        });

        if (validFiles.length === 0) return;

        this.uploadMultipleFiles(validFiles);
    }

    async uploadMultipleFiles(files) {
        stateManager.setUploading(true);
        
        try {
            for (let i = 0; i < files.length; i++) {
                const progress = ((i + 1) / files.length) * 100;
                stateManager.setUploading(true, progress);
                
                await this.uploadSingleFile(files[i]);
            }
            
            stateManager.addNotification(`成功上传 ${files.length} 个文件`, 'success');
        } catch (error) {
            stateManager.addError('上传失败：' + error.message);
        } finally {
            stateManager.setUploading(false);
            this.hideUploadProgress();
        }
    }

    async uploadSingleFile(file) {
        try {
            const response = await apiClient.uploadImage(file);
            stateManager.addImage(response);
        } catch (error) {
            throw error;
        }
    }

    showConfirmDialog(message) {
        return new Promise(resolve => {
            const confirmed = confirm(message);
            resolve(confirmed);
        });
    }
}

// 创建单例
UIManager.instance = new UIManager();

// 导出UI管理器
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UIManager;
} else {
    window.UIManager = UIManager;
    window.uiManager = UIManager.instance;
}