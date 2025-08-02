/**
 * UI组件模块
 * 管理页面UI组件的渲染和交互
 */
class UIManager {
    constructor() {
        this.elements = {};
        this.isMobileMenuOpen = false;
        this.init();
    }

    /**
     * 初始化UI管理器
     */
    init() {
        this.cacheElements();
        this.bindEvents();
        this.setupTheme();
        this.setupAnimations();
    }

    /**
     * 缓存DOM元素
     */
    cacheElements() {
        this.elements = {
            // 导航栏
            navbar: document.getElementById('navbar'),
            themeToggle: document.getElementById('theme-toggle'),
            authBtn: document.getElementById('auth-btn'),
            createFolderBtn: document.getElementById('create-folder-btn'),
            mobileMenuBtn: document.getElementById('mobile-menu-btn'),
            closeMenuBtn: document.getElementById('close-menu-btn'),
            mobileMenu: document.getElementById('mobile-menu'),
            dashboardBtn: document.getElementById('dashboard-btn'),
            galleryBtn: document.getElementById('gallery-btn'),
            settingsBtn: document.getElementById('settings-btn'),

            // 上传区域
            uploadZone: document.getElementById('upload-zone'),
            fileInput: document.getElementById('file-input'),
            uploadBtn: document.getElementById('upload-btn'),
            pasteBtn: document.getElementById('paste-btn'),
            uploadProgress: document.getElementById('upload-progress'),
            progressBar: document.querySelector('.progress-bar'),
            progressText: document.querySelector('.progress-text'),

            // 统计信息
            totalImages: document.getElementById('totalImages'),
            totalSize: document.getElementById('totalSize'),
            todayUploads: document.getElementById('todayUploads'),

            // 文件夹导航
            folderPath: document.querySelector('.folder-path'),

            // 搜索和过滤
            searchInput: document.getElementById('search-input'),
            folderFilter: document.getElementById('folder-filter'),
            sortFilter: document.getElementById('sort-filter'),

            // 图片网格
            imageGrid: document.getElementById('image-grid'),
            emptyState: document.getElementById('empty-state'),

            // 模态框
            authModal: document.getElementById('auth-modal'),
            authModalContent: document.getElementById('auth-modal-content'),
            cancelAuth: document.getElementById('cancel-auth'),
            saveAuth: document.getElementById('save-auth'),
            authTokenInput: document.getElementById('auth-token-input'),

            folderModal: document.getElementById('folder-modal'),
            folderModalContent: document.getElementById('folder-modal-content'),
            cancelFolder: document.getElementById('cancel-folder'),
            createFolderConfirm: document.getElementById('create-folder-confirm'),
            folderNameInput: document.getElementById('folder-name-input'),

            previewModal: document.getElementById('preview-modal'),
            previewModalContent: document.getElementById('preview-modal-content'),
            closePreview: document.getElementById('close-preview'),
            previewImage: document.getElementById('preview-image'),
            previewTitle: document.getElementById('preview-title'),
            previewSize: document.getElementById('preview-size'),
            previewTime: document.getElementById('preview-time'),
            previewType: document.getElementById('preview-type'),
            previewUrl: document.getElementById('preview-url'),
            copyUrl: document.getElementById('copy-url'),
            downloadImage: document.getElementById('download-image'),
            deleteImage: document.getElementById('delete-image'),

            // 通知
            notifications: document.getElementById('notifications')
        };
    }

    /**
     * 绑定事件监听器
     */
    bindEvents() {
        // 导航栏和菜单事件
        if (this.elements.themeToggle) {
            this.elements.themeToggle.addEventListener('click', () => this.toggleTheme());
        }

        if (this.elements.authBtn) {
            this.elements.authBtn.addEventListener('click', () => this.toggleAuthModal(true));
        }

        if (this.elements.createFolderBtn) {
            this.elements.createFolderBtn.addEventListener('click', () => this.toggleFolderModal(true));
        }

        if (this.elements.mobileMenuBtn && this.elements.closeMenuBtn && this.elements.mobileMenu) {
            this.elements.mobileMenuBtn.addEventListener('click', () => this.toggleMobileMenu(true));
            this.elements.closeMenuBtn.addEventListener('click', () => this.toggleMobileMenu(false));
        }

        // 模态框事件
        if (this.elements.cancelAuth) {
            this.elements.cancelAuth.addEventListener('click', () => this.toggleAuthModal(false));
        }

        if (this.elements.saveAuth) {
            this.elements.saveAuth.addEventListener('click', () => this.saveAuthToken());
        }

        if (this.elements.cancelFolder) {
            this.elements.cancelFolder.addEventListener('click', () => this.toggleFolderModal(false));
        }

        if (this.elements.createFolderConfirm) {
            this.elements.createFolderConfirm.addEventListener('click', () => this.createFolder());
        }

        if (this.elements.closePreview) {
            this.elements.closePreview.addEventListener('click', () => this.togglePreviewModal(false));
        }

        if (this.elements.copyUrl) {
            this.elements.copyUrl.addEventListener('click', () => this.copyPreviewUrl());
        }

        if (this.elements.downloadImage) {
            this.elements.downloadImage.addEventListener('click', () => this.downloadPreviewImage());
        }

        if (this.elements.deleteImage) {
            this.elements.deleteImage.addEventListener('click', () => this.deletePreviewImage());
        }

        // 文件上传事件
        if (this.elements.uploadZone) {
            this.elements.uploadZone.addEventListener('dragover', (e) => this.handleDragOver(e));
            this.elements.uploadZone.addEventListener('dragleave', (e) => this.handleDragLeave(e));
            this.elements.uploadZone.addEventListener('drop', (e) => this.handleDrop(e));
            this.elements.uploadZone.addEventListener('click', () => this.elements.fileInput?.click());
        }

        if (this.elements.fileInput) {
            this.elements.fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        }

        if (this.elements.uploadBtn) {
            this.elements.uploadBtn.addEventListener('click', () => this.elements.fileInput?.click());
        }

        if (this.elements.pasteBtn) {
            this.elements.pasteBtn.addEventListener('click', () => this.handlePaste());
        }

        // 搜索和过滤事件
        if (this.elements.searchInput) {
            this.elements.searchInput.addEventListener('input', 
                Utils.debounce((e) => this.handleSearch(e), 300)
            );
        }

        if (this.elements.folderFilter) {
            this.elements.folderFilter.addEventListener('change', (e) => this.handleFolderFilter(e));
        }

        if (this.elements.sortFilter) {
            this.elements.sortFilter.addEventListener('change', (e) => this.handleSortFilter(e));
        }

        // 键盘事件
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));

        // 点击模态框外部关闭
        document.addEventListener('click', (e) => this.handleOutsideClick(e));

        // 滚动事件
        window.addEventListener('scroll', () => this.handleScroll());
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
        const currentTheme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
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
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
            this.elements.themeToggle?.querySelector('.fa-moon')?.classList.add('hidden');
            this.elements.themeToggle?.querySelector('.fa-sun')?.classList.remove('hidden');
        } else {
            document.documentElement.classList.remove('dark');
            this.elements.themeToggle?.querySelector('.fa-moon')?.classList.remove('hidden');
            this.elements.themeToggle?.querySelector('.fa-sun')?.classList.add('hidden');
        }
    }

    /**
     * 设置动画
     */
    setupAnimations() {
        // 为动画元素添加延迟
        const animatedElements = document.querySelectorAll('.animate-fade-in');
        animatedElements.forEach((el, index) => {
            el.style.animationDelay = `${index * 0.1}s`;
        });
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
     * 切换移动菜单
     * @param {boolean} show - 是否显示
     */
    toggleMobileMenu(show) {
        if (this.elements.mobileMenu) {
            if (show) {
                this.elements.mobileMenu.classList.remove('translate-x-full');
                this.isMobileMenuOpen = true;
            } else {
                this.elements.mobileMenu.classList.add('translate-x-full');
                this.isMobileMenuOpen = false;
            }
        }
    }

    /**
     * 切换认证模态框
     * @param {boolean} show - 是否显示
     */
    toggleAuthModal(show) {
        if (this.elements.authModal && this.elements.authModalContent) {
            if (show) {
                this.elements.authModal.classList.remove('hidden');
                // 延迟添加动画类以触发过渡
                setTimeout(() => {
                    this.elements.authModal.classList.add('show');
                }, 10);
                // 填充已保存的token
                const savedToken = localStorage.getItem(AppConfig.storage.keys.authToken) || '';
                if (this.elements.authTokenInput) {
                    this.elements.authTokenInput.value = savedToken;
                }
            } else {
                this.elements.authModal.classList.remove('show');
                // 等待动画完成后隐藏
                setTimeout(() => {
                    this.elements.authModal.classList.add('hidden');
                }, 300);
            }
        }
    }

    /**
     * 切换文件夹模态框
     * @param {boolean} show - 是否显示
     */
    toggleFolderModal(show) {
        if (this.elements.folderModal && this.elements.folderModalContent) {
            if (show) {
                this.elements.folderModal.classList.remove('hidden');
                // 延迟添加动画类以触发过渡
                setTimeout(() => {
                    this.elements.folderModal.classList.add('show');
                }, 10);
                // 清空输入框
                if (this.elements.folderNameInput) {
                    this.elements.folderNameInput.value = '';
                }
            } else {
                this.elements.folderModal.classList.remove('show');
                // 等待动画完成后隐藏
                setTimeout(() => {
                    this.elements.folderModal.classList.add('hidden');
                }, 300);
            }
        }
    }

    /**
     * 切换预览模态框
     * @param {boolean} show - 是否显示
     * @param {Object} image - 图片对象 (可选)
     */
    togglePreviewModal(show, image = null) {
        if (this.elements.previewModal) {
            if (show && image) {
                this.elements.previewModal.classList.remove('hidden');
                // 设置预览内容
                if (this.elements.previewImage) {
                    this.elements.previewImage.src = image.url || `${AppConfig.api.baseUrl}/${image.key}`;
                    this.elements.previewImage.alt = Utils.getFileName(image.key);
                }
                if (this.elements.previewTitle) {
                    this.elements.previewTitle.textContent = Utils.getFileName(image.key);
                }
                if (this.elements.previewSize) {
                    this.elements.previewSize.textContent = Utils.formatFileSize(image.size);
                }
                if (this.elements.previewTime) {
                    this.elements.previewTime.textContent = Utils.formatDate(image.lastModified || image.uploadedAt);
                }
                if (this.elements.previewType) {
                    const fileExtension = image.key.split('.').pop().toLowerCase();
                    this.elements.previewType.textContent = `${fileExtension.toUpperCase()} 图像`;
                }
                if (this.elements.previewUrl) {
                    this.elements.previewUrl.value = image.url || `${AppConfig.api.baseUrl}/${image.key}`;
                }
                // 存储当前预览的图片key
                this.currentPreviewKey = image.key;
            } else {
                this.elements.previewModal.classList.add('hidden');
                this.currentPreviewKey = null;
            }
        }
    }

    /**
     * 保存认证token
     */
    saveAuthToken() {
        if (this.elements.authTokenInput) {
            const token = this.elements.authTokenInput.value.trim();
            localStorage.setItem(AppConfig.storage.keys.authToken, token);
            apiClient.setAuthToken(token);
            this.toggleAuthModal(false);
            stateManager.addNotification('认证信息已保存', 'success');
        }
    }

    /**
     * 创建文件夹
     */
    createFolder() {
        if (this.elements.folderNameInput) {
            const folderName = this.elements.folderNameInput.value.trim();
            if (!folderName) {
                stateManager.addError('文件夹名称不能为空');
                return;
            }

            const currentFolder = stateManager.getState().currentFolder;
            const fullPath = currentFolder ? `${currentFolder}/${folderName}` : folderName;

            apiClient.createFolder(fullPath)
                .then(() => {
                    this.toggleFolderModal(false);
                    stateManager.addNotification(`文件夹')