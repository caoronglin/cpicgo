/**
 * 上传相关路由处理器
 */

import { createCORSResponse } from '../utils/cors.js';
import { generateFileName, getFileExtension, isValidImageType } from '../utils/file.js';

export const uploadRoutes = {
  async handle(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    switch (method) {
      case 'POST':
        return await this.handleUpload(request, env);
      case 'GET':
      case 'DELETE':
        return new Response('Method not allowed', { status: 405 });
      default:
        return new Response('Method not allowed', { status: 405 });
    }
  },

  async handleUpload(request, env) {
    try {
      // 检查是否为multipart/form-data请求
      const contentType = request.headers.get('content-type') || '';
      if (!contentType.includes('multipart/form-data')) {
        return createCORSResponse({ error: 'Invalid content type' }, 400);
      }

      // 解析表单数据
      const formData = await request.formData();
      const file = formData.get('file');
      const folder = formData.get('folder') || '';
      
      if (!file) {
        return createCORSResponse({ error: 'No file provided' }, 400);
      }

      // 验证文件类型
      if (!isValidImageType(file.type)) {
        return createCORSResponse({ error: 'Invalid file type' }, 400);
      }

      // 生成文件名
      const extension = getFileExtension(file.name);
      const fileName = generateFileName(file.name, extension);
      
      // 构建存储路径
      const prefix = env.CUSTOM_PATH || 'uploads';
      const key = folder ? `${prefix}/${folder}/${fileName}` : `${prefix}/${fileName}`;

      // 上传到R2存储桶
      await env.image_host_bucket.put(key, file);

      // 确保realDomain不包含协议前缀
      const rawRealDomain = env.CUSTOM_DOMAIN || 'localhost';
      const realDomain = rawRealDomain.replace(/^https?:\/\//, '');
      // 确保cdnDomain不包含协议前缀
      const rawCdnDomain = env.CDN_DOMAIN || realDomain;
      const cdnDomain = rawCdnDomain.replace(/^https?:\/\//, '');
      
      // 构建返回的URL
      const url = `https://${realDomain}/${key}`;
      const cdnUrl = `https://${cdnDomain}/${key}`;

      // 返回上传结果
      return createCORSResponse({
        key,
        url,
        cdnUrl,
        name: fileName,
        size: file.size
      });

    } catch (error) {
      console.error('Error uploading file:', error);
      return createCORSResponse({ error: error.message }, 500);
    }
  }
};