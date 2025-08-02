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
        return new Response('Method not allowed', { status: 405 });
      case 'DELETE':
        return new Response('Method not allowed', { status: 405 });
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
    return new Response('Method not allowed', { status: 405 });
  },

  async handleDeleteFolder(request, env) {
    return new Response('Method not allowed', { status: 405 });
  }
};