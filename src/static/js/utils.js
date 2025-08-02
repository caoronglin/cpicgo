/**
 * 工具函数模块
 * 包含格式化、验证、通知等通用工具
 */

class Utils {
    /**
     * 格式化文件大小
     * @param {number} bytes - 字节数
     * @returns {string} 格式化后的文件大小
     */
    static formatFileSize(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    /**
     * 格式化日期
     * @param {string|Date} date - 日期字符串或Date对象
     * @returns {string} 格式化后的日期
     */
    static formatDate(date) {
        const d = new Date(date);
        const now = new Date();
        const diffTime = Math.abs(now - d);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) return '今天';
        if (diffDays === 2) return '昨天';
        if (diffDays <= 7) return `${diffDays}天前`;
        
        return d.toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    }

    /**
     * 验证文件类型
     * @param {File} file - 文件对象
     * @returns {boolean} 是否允许的文件类型
     */
    static validateFileType(file) {
        return AppConfig.file.allowedTypes.includes(file.type);
    }

    /**
     * 验证文件大小
     * @param {File} file - 文件对象
     * @returns {boolean} 文件大小是否合法
     */
    static validateFileSize(file) {
        return file.size <= AppConfig.file.maxSize;
    }

    /**
     * 从文件路径中提取文件名
     * @param {string} path - 文件路径
     * @returns {string} 文件名
     */
    static getFileName(path) {
        return path.split('/').pop();
    }

    /**
     * 从文件路径中提取文件夹
     * @param {string} path - 文件路径
     * @returns {string} 文件夹路径
     */
    static getFolderPath(path) {
        const parts = path.split('/');
        return parts.length > 1 ? parts.slice(0, -1).join('/') : '';
    }

    /**
     * 防抖函数
     * @param {Function} func - 要执行的函数
     * @param {number} wait - 等待时间（毫秒）
     * @returns {Function} 防抖后的函数
     */
    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    /**
     * 节流函数
     * @param {Function} func - 要执行的函数
     * @param {number} limit - 时间限制（毫秒）
     * @returns {Function} 节流后的函数
     */
    static throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    /**
     * 生成唯一ID
     * @returns {string} 唯一ID
     */
    static generateId() {
        return Math.random().toString(36).substr(2, 9);
    }

    /**
     * 复制到剪贴板
     * @param {string} text - 要复制的文本
     * @returns {Promise<boolean>} 是否成功
     */
    static async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (err) {
            console.error('复制失败:', err);
            return false;
        }
    }

    /**
     * 下载文件
     * @param {string} url - 文件URL
     * @param {string} filename - 文件名
     */
    static downloadFile(url, filename) {
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    /**
     * 创建图片预览URL
     * @param {File} file - 文件对象
     * @returns {string} 预览URL
     */
    static createImagePreview(file) {
        return URL.createObjectURL(file);
    }

    /**
     * 清理预览URL
     * @param {string} url - 预览URL
     */
    static revokeImagePreview(url) {
        URL.revokeObjectURL(url);
    }

    /**
     * 检查是否是今日上传
     * @param {string|Date} date - 上传日期
     * @returns {boolean} 是否是今日上传
     */
    static isTodayUpload(date) {
        const uploadDate = new Date(date);
        const today = new Date();
        return uploadDate.toDateString() === today.toDateString();
    }

    /**
     * 构建文件夹树结构
     * @param {Array} images - 图片数组
     * @returns {Object} 文件夹树
     */
    static buildFolderTree(images) {
        const tree = {};
        
        images.forEach(image => {
            const parts = image.key.split('/');
            let current = tree;
            
            parts.forEach((part, index) => {
                if (index === parts.length - 1) {
                    // 文件节点
                    current[part] = image;
                } else {
                    // 文件夹节点
                    if (!current[part]) {
                        current[part] = {};
                    }
                    current = current[part];
                }
            });
        });
        
        return tree;
    }

    /**
     * 获取文件夹列表
     * @param {Array} images - 图片数组
     * @returns {Array} 文件夹列表
     */
    static getFolders(images) {
        const folders = new Set();
        
        images.forEach(image => {
            const path = this.getFolderPath(image.key);
            if (path) {
                let currentPath = '';
                path.split('/').forEach(folder => {
                    currentPath += (currentPath ? '/' : '') + folder;
                    folders.add(currentPath);
                });
            }
        });
        
        return Array.from(folders).sort();
    }

    /**
     * 转义HTML
     * @param {string} text - 原始文本
     * @returns {string} 转义后的文本
     */
    static escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * 截断文本
     * @param {string} text - 原始文本
     * @param {number} maxLength - 最大长度
     * @returns {string} 截断后的文本
     */
    static truncateText(text, maxLength = 20) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength - 3) + '...';
    }
}

// 导出工具类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Utils;
} else {
    window.Utils = Utils;
}