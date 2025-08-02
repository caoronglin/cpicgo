/**
 * 文件夹相关路由处理器
 */

import { createCORSResponse } from '../utils/cors.js';

export const folderRoutes = {
  async handle(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    switch (method) {
      case 'GET':
        return await this.handleListFolders(request, env);
      case 'POST':
        return await this.handleCreateFolder(request, env);
      case 'DELETE':
        return await this.handleDeleteFolder(request, env);
      default:
        return new Response('Method not allowed', { status: 405 });
    }
  },

  async handleListFolders(request, env) {
    try {
      const prefix = `${env.CUSTOM_PATH || 'uploads'}/`;
      const objects = await env.image_host_bucket.list({ prefix });

      const folders = new Set();
      
      (objects.objects || []).forEach(obj => {
        const relativePath = obj.key.substring(prefix.length);
        const folderPath = relativePath.split('/').slice(0, -1).join('/');
        if (folderPath) {
          folders.add(folderPath);
        }
      });

      const folderList = Array.from(folders).map(folder => ({
        name: folder.split('/').pop(),
        path: folder,
        fullPath: `${prefix}${folder}/`
      }));

      return createCORSResponse({
        folders: folderList.sort((a, b) => a.name.localeCompare(b.name))
      });

    } catch (error) {
      console.error('Error listing folders:', error);
      return createCORSResponse({ error: error.message }, 500);
    }
  },

  async handleCreateFolder(request, env) {
    try {
      const { name, parent = '' } = await request.json();

      if (!name || typeof name !== 'string') {
        return createCORSResponse({ error: 'Invalid folder name' }, 400);
      }

      const sanitizedName = name.replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').toLowerCase();
      const folderPath = parent 
        ? `${env.CUSTOM_PATH || 'uploads'}/${parent}/${sanitizedName}/`
        : `${env.CUSTOM_PATH || 'uploads'}/${sanitizedName}/`;

      // 创建文件夹标记文件
      await env.image_host_bucket.put(`${folderPath}.folder`, new ArrayBuffer(0), {
        httpMetadata: {
          contentType: 'text/plain'
        }
      });

      return createCORSResponse({
        success: true,
        name: sanitizedName,
        path: folderPath,
        message: 'Folder created successfully'
      });

    } catch (error) {
      console.error('Error creating folder:', error);
      return createCORSResponse({ error: error.message }, 500);
    }
  },

  async handleDeleteFolder(request, env) {
    try {
      const { path } = await request.json();

      if (!path) {
        return createCORSResponse({ error: 'No folder path provided' }, 400);
      }

      // 获取文件夹内所有文件
      const objects = await env.image_host_bucket.list({ prefix: path });
      
      // 删除所有文件
      const deletePromises = (objects.objects || []).map(obj => 
        env.image_host_bucket.delete(obj.key)
      );

      await Promise.all(deletePromises);

      return createCORSResponse({
        success: true,
        message: 'Folder deleted successfully',
        deletedCount: objects.objects?.length || 0
      });

    } catch (error) {
      console.error('Error deleting folder:', error);
      return createCORSResponse({ error: error.message }, 500);
    }
  }
};