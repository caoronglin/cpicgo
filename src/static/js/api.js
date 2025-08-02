/**
 * API模块
 * 处理所有与后端的通信
 */

class ApiClient {
    constructor() {
        this.baseUrl = AppConfig.api.baseUrl;
        this.defaultHeaders = {
            'Content-Type': 'application/json'
        };
    }

    /**
     * 获取请求头
     * @param {Object} customHeaders - 自定义头
     * @returns {Object} 合并后的头
     */
    getHeaders(customHeaders = {}) {
        const token = StateManager.getToken();
        return {
            ...this.defaultHeaders,
            ...customHeaders,
            ...(token && { 'Authorization': `Bearer ${token}` })
        };
    }

    /**
     * 处理API响应
     * @param {Response} response - fetch响应
     * @returns {Promise<Object>} 响应数据
     * @throws {Error} 如果响应不是OK
     */
    async handleResponse(response) {
        if (!response.ok) {
            let errorMessage = ErrorMessages.network;
            
            try {
                const errorData = await response.json();
                errorMessage = errorData.message || errorMessage;
            } catch (e) {
                // 如果无法解析JSON，使用默认错误消息
                switch (response.status) {
                    case 401:
                        errorMessage = ErrorMessages.auth;
                        break;
                    case 413:
                        errorMessage = ErrorMessages.fileSize;
                        break;
                    case 415:
                        errorMessage = ErrorMessages.fileType;
                        break;
                    case 429:
                        errorMessage = '请求过于频繁，请稍后再试';
                        break;
                    case 500:
                        errorMessage = '服务器错误，请稍后再试';
                        break;
                }
            }
            
            throw new Error(errorMessage);
        }
        
        return response.json();
    }

    /**
     * 获取图片列表
     * @returns {Promise<Array>} 图片列表
     */
    async getImages() {
        try {
            const response = await fetch(this.baseUrl + AppConfig.api.endpoints.list, {
                method: 'GET',
                headers: this.getHeaders()
            });
            
            const data = await this.handleResponse(response);
            return data.objects || [];
        } catch (error) {
            console.error('获取图片列表失败:', error);
            throw error;
        }
    }

    /**
     * 上传图片
     * @param {File} file - 文件对象
     * @param {string} fileName - 文件名（包含路径）
     * @param {Function} onProgress - 进度回调
     * @returns {Promise<Object>} 上传结果
     */
    async uploadImage(file, fileName, onProgress = null) {
        try {
            // 验证文件
            if (!Utils.validateFileType(file)) {
                throw new Error(ErrorMessages.fileType);
            }
            
            if (!Utils.validateFileSize(file)) {
                throw new Error(ErrorMessages.fileSize);
            }

            const formData = new FormData();
            formData.append('file', file);

            const xhr = new XMLHttpRequest();
            
            return new Promise((resolve, reject) => {
                xhr.upload.addEventListener('progress', (event) => {
                    if (event.lengthComputable && onProgress) {
                        const percentComplete = Math.round((event.loaded / event.total) * 100);
                        onProgress(percentComplete);
                    }
                });

                xhr.addEventListener('load', () => {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        try {
                            const response = JSON.parse(xhr.responseText);
                            resolve(response);
                        } catch (e) {
                            resolve({ success: true });
                        }
                    } else {
                        reject(new Error(ErrorMessages.upload));
                    }
                });

                xhr.addEventListener('error', () => {
                    reject(new Error(ErrorMessages.network));
                });

                xhr.open('PUT', `${this.baseUrl}/${fileName}`);
                xhr.setRequestHeader('Authorization', `Bearer ${StateManager.getToken()}`);
                xhr.send(formData);
            });
        } catch (error) {
            console.error('上传图片失败:', error);
            throw error;
        }
    }

    /**
     * 批量上传图片
     * @param {Array} files - 文件数组
     * @param {Function} onProgress - 进度回调
     * @returns {Promise<Array>} 上传结果数组
     */
    async uploadImages(files, onProgress = null) {
        if (files.length > AppConfig.file.maxFiles) {
            throw new Error(ErrorMessages.fileCount);
        }

        const results = [];
        let completed = 0;

        for (const file of files) {
            try {
                const fileName = StateManager.getCurrentFolder() 
                    ? `${StateManager.getCurrentFolder()}/${file.name}` 
                    : file.name;
                
                const result = await this.uploadImage(file, fileName, (progress) => {
                    if (onProgress) {
                        const overallProgress = ((completed * 100) + progress) / files.length;
                        onProgress(Math.round(overallProgress));
                    }
                });
                
                results.push({ success: true, file: file.name, result });
                completed++;
            } catch (error) {
                results.push({ success: false, file: file.name, error: error.message });
                completed++;
            }
        }

        return results;
    }

    /**
     * 删除图片
     * @param {string} fileName - 文件名（包含路径）
     * @returns {Promise<Object>} 删除结果
     */
    async deleteImage(fileName) {
        try {
            const response = await fetch(`${this.baseUrl}/${fileName}`, {
                method: 'DELETE',
                headers: this.getHeaders()
            });
            
            return this.handleResponse(response);
        } catch (error) {
            console.error('删除图片失败:', error);
            throw error;
        }
    }

    /**
     * 创建文件夹
     * @param {string} folderName - 文件夹名称
     * @returns {Promise<Object>} 创建结果
     */
    async createFolder(folderName) {
        try {
            // 创建一个空文件作为文件夹标记
            const folderPath = StateManager.getCurrentFolder() 
                ? `${StateManager.getCurrentFolder()}/${folderName}/.folder` 
                : `${folderName}/.folder`;
            
            const response = await fetch(`${this.baseUrl}/${folderPath}`, {
                method: 'PUT',
                headers: this.getHeaders({
                    'Content-Type': 'text/plain'
                }),
                body: ''
            });
            
            return this.handleResponse(response);
        } catch (error) {
            console.error('创建文件夹失败:', error);
            throw error;
        }
    }

    /**
     * 检查连接状态
     * @returns {Promise<boolean>} 是否可连接
     */
    async checkConnection() {
        try {
            await this.getImages();
            return true;
        } catch (error) {
            console.error('连接检查失败:', error);
            return false;
        }
    }

    /**
     * 获取文件信息
     * @param {string} fileName - 文件名
     * @returns {Promise<Object>} 文件信息
     */
    async getFileInfo(fileName) {
        try {
            const response = await fetch(`${this.baseUrl}/${fileName}`, {
                method: 'HEAD',
                headers: this.getHeaders()
            });
            
            if (response.ok) {
                return {
                    size: parseInt(response.headers.get('content-length') || '0'),
                    type: response.headers.get('content-type') || 'unknown',
                    lastModified: response.headers.get('last-modified')
                };
            }
            
            throw new Error('无法获取文件信息');
        } catch (error) {
            console.error('获取文件信息失败:', error);
            throw error;
        }
    }
}

// 创建API客户端实例
const apiClient = new ApiClient();

// 导出API客户端
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ApiClient, apiClient };
} else {
    window.ApiClient = ApiClient;
    window.apiClient = apiClient;
}