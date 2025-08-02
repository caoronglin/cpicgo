/**
 * 图片相关路由处理器
 */

import { createCORSResponse } from '../utils/cors.js';
import { generateFileName, formatFileSize, getFileExtension } from '../utils/file.js';

export const imageRoutes = {
  async handle(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    switch (method) {
      case 'GET':
        return await this.handleList(request, env);
      case 'POST':
        return await this.handleUpload(request, env);
      case 'DELETE':
        return await this.handleDelete(request, env);
      default:
        return new Response('Method not allowed', { status: 405 });
    }
  },

  async handleList(request, env) {
    const url = new URL(request.url);
    const folder = url.searchParams.get('folder') || '';
    const limit = parseInt(url.searchParams.get('limit') || '100');
    const cursor = url.searchParams.get('cursor');

    try {
      const prefix = folder ? `${env.CUSTOM_PATH || 'uploads'}/${folder}/` : `${env.CUSTOM_PATH || 'uploads'}/`;
      
      const options = {
        prefix,
        limit: Math.min(limit, 1000)
      };

      if (cursor) {
        options.cursor = cursor;
      }

      const objects = await env.image_host_bucket.list(options);

      // 确保realDomain不包含协议前缀
      const rawRealDomain = env.CUSTOM_DOMAIN || 'localhost';
      const realDomain = rawRealDomain.replace(/^https?:\/\//, '');
      // 确保cdnDomain不包含协议前缀
      const rawCdnDomain = env.CDN_DOMAIN || realDomain;
      const cdnDomain = rawCdnDomain.replace(/^https?:\/\//, '');
      
      const images = (objects.objects || []).map(obj => ({
        key: obj.key,
        name: obj.key.split('/').pop(),
        url: `https://${realDomain}/${obj.key}`,
        cdnUrl: `https://${cdnDomain}/${obj.key}`,
        size: obj.size,
        sizeFormatted: formatFileSize(obj.size),
        uploaded: obj.uploaded,
        etag: obj.etag
      }));

      return createCORSResponse({
        images,
        truncated: objects.truncated,
        cursor: objects.truncated ? objects.cursor : null,
        total: images.length
      });

    } catch (error) {
      console.error('Error listing images:', error);
      return createCORSResponse({ error: error.message }, 500);
    }
  },

  async handleUpload(request, env) {
    try {
      const contentType = request.headers.get('content-type') || '';
      let fileBuffer;
      let fileName;
      let folder = '';

      if (contentType.includes('multipart/form-data')) {
        const formData = await request.formData();
        const file = formData.get('file') || formData.get('image');
        folder = formData.get('folder') || '';
        
        if (!file) {
          return createCORSResponse({ error: 'No file provided' }, 400);
        }

        fileBuffer = await file.arrayBuffer();
        fileName = file.name || 'unnamed';
      } else {
        fileBuffer = await request.arrayBuffer();
        fileName = `image-${Date.now()}`;
      }

      // 验证文件大小
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (fileBuffer.byteLength > maxSize) {
        return createCORSResponse({ error: 'File too large' }, 413);
      }

      // 生成文件名
      const extension = getFileExtension(fileName);
      const newFileName = generateFileName(fileName, extension);
      const storageKey = folder 
        ? `${env.CUSTOM_PATH || 'uploads'}/${folder}/${newFileName}`
        : `${env.CUSTOM_PATH || 'uploads'}/${newFileName}`;

      // 上传文件
      await env.image_host_bucket.put(storageKey, fileBuffer, {
        httpMetadata: {
          contentType: `image/${extension}`,
          cacheControl: 'public, max-age=31536000'
        }
      });

      const realDomain = env.CUSTOM_DOMAIN || 'localhost';
      // 确保cdnDomain不包含协议前缀
      const rawCdnDomain = env.CDN_DOMAIN || realDomain;
      const cdnDomain = rawCdnDomain.replace(/^https?:\/\//, '');
      
      const imageUrl = `https://${realDomain.replace(/^https?:\/\//, '')}/${storageKey}`;
      const cdnUrl = `https://${cdnDomain}/${storageKey}`;

      return createCORSResponse({
        success: true,
        key: storageKey,
        url: imageUrl,
        cdnUrl: cdnUrl,
        name: newFileName,
        size: fileBuffer.byteLength,
        sizeFormatted: formatFileSize(fileBuffer.byteLength)
      });

    } catch (error) {
      console.error('Error uploading image:', error);
      return createCORSResponse({ error: error.message }, 500);
    }
  },

  async handleDelete(request, env) {
    const url = new URL(request.url);
    const key = url.searchParams.get('key');

    if (!key) {
      return createCORSResponse({ error: 'No key provided' }, 400);
    }

    try {
      await env.image_host_bucket.delete(key);
      return createCORSResponse({ success: true, message: 'Image deleted successfully' });
    } catch (error) {
      console.error('Error deleting image:', error);
      return createCORSResponse({ error: error.message }, 500);
    }
  },

  async handleFileAccess(request, env) {
    const url = new URL(request.url);
    const key = url.pathname.substring(1);

    try {
      const object = await env.image_host_bucket.get(key);
      
      if (!object) {
        return new Response('Not Found', { status: 404 });
      }

      const headers = new Headers();
      object.writeHttpMetadata(headers);
      headers.set('etag', object.httpEtag);
      headers.set('cache-control', 'public, max-age=31536000');

      return new Response(object.body, { headers });

    } catch (error) {
      console.error('Error accessing file:', error);
      return new Response('Internal Server Error', { status: 500 });
    }
  }
};