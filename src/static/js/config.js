// 应用配置
const AppConfig = {
    // API配置
    api: {
        baseUrl: 'https://cpicgo.luoxing.workers.dev',
        endpoints: {
            list: '/list',
            upload: '/',
            delete: '/'
        },
        headers: {
            'Content-Type': 'application/json'
        }
    },
    
    // 文件配置
    file: {
        maxSize: 10 * 1024 * 1024, // 10MB
        allowedTypes: [
            'image/jpeg',
            'image/png',
            'image/webp',
            'image/avif',
            'image/svg+xml',
            'image/gif'
        ],
        maxFiles: 10
    },
    
    // UI配置
    ui: {
        animations: {
            duration: 300,
            easing: 'cubic-bezier(0.16, 1, 0.3, 1)'
        },
        notifications: {
            duration: 3000,
            positions: {
                top: '20px',
                right: '20px'
            }
        }
    },
    
    // 存储配置
    storage: {
        keys: {
            apiToken: 'apiToken',
            theme: 'theme',
            currentFolder: 'currentFolder'
        }
    },
    
    // 默认Token
    defaultToken: 'tk_7x8z9a2b3c4d5e6f'
};

// 错误消息配置
const ErrorMessages = {
    network: '网络错误，请检查网络连接',
    upload: '上传失败，请重试',
    delete: '删除失败，请重试',
    load: '加载图片失败，请重试',
    auth: '认证失败，请检查API Token',
    fileType: '不支持的文件类型',
    fileSize: '文件大小超出限制',
    fileCount: '一次最多上传10个文件'
};

// 成功消息配置
const SuccessMessages = {
    upload: '上传成功',
    delete: '删除成功',
    auth: '认证设置已保存',
    folder: '文件夹创建成功'
};

// 导出配置
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AppConfig, ErrorMessages, SuccessMessages };
} else {
    window.AppConfig = AppConfig;
    window.ErrorMessages = ErrorMessages;
    window.SuccessMessages = SuccessMessages;
}