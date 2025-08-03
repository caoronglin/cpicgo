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
      case 'DELETE':
        return await this.handleDelete(request, env);
      case 'POST':
        return new Response('Method not allowed', { status: 405 });
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
    return new Response('Method not allowed', { status: 405 });
  },

  async handleDelete(request, env) {
    try {
      const url = new URL(request.url);
      const key = url.pathname.substring('/api/images/'.length);
      
      if (!key) {
        return createCORSResponse({ error: 'Image key is required' }, 400);
      }

      // 检查文件是否存在
      const object = await env.image_host_bucket.get(key);
      if (!object) {
        return createCORSResponse({ error: 'Image not found' }, 404);
      }

      // 删除文件
      await env.image_host_bucket.delete(key);

      return createCORSResponse({ 
        message: 'Image deleted successfully',
        key: key 
      });

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