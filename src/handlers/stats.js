/**
 * 统计信息路由处理器
 */

import { createCORSResponse } from '../utils/cors.js';
import { formatFileSize } from '../utils/file.js';

export const statsRoutes = {
  async handle(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    if (path === '/api/stats' && request.method === 'GET') {
      return await this.handleGetStats(request, env);
    }

    return new Response('Endpoint not found', { status: 404 });
  },

  async handleGetStats(request, env) {
    try {
      const prefix = `${env.CUSTOM_PATH || 'uploads'}/`;
      const objects = await env.image_host_bucket.list({ prefix });

      const images = objects.objects || [];
      const totalImages = images.length;
      const totalSize = images.reduce((sum, obj) => sum + obj.size, 0);

      // 按日期统计
      const dailyStats = {};
      images.forEach(obj => {
        const date = new Date(obj.uploaded).toISOString().split('T')[0];
        if (!dailyStats[date]) {
          dailyStats[date] = { count: 0, size: 0 };
        }
        dailyStats[date].count++;
        dailyStats[date].size += obj.size;
      });

      // 按扩展名统计
      const extensionStats = {};
      images.forEach(obj => {
        const extension = obj.key.split('.').pop().toLowerCase();
        if (!extensionStats[extension]) {
          extensionStats[extension] = { count: 0, size: 0 };
        }
        extensionStats[extension].count++;
        extensionStats[extension].size += obj.size;
      });

      // 文件夹统计
      const folderStats = {};
      images.forEach(obj => {
        const parts = obj.key.substring(prefix.length).split('/');
        if (parts.length > 1) {
          const folder = parts[0];
          if (!folderStats[folder]) {
            folderStats[folder] = { count: 0, size: 0 };
          }
          folderStats[folder].count++;
          folderStats[folder].size += obj.size;
        }
      });

      const stats = {
        totalImages,
        totalSize,
        totalSizeFormatted: formatFileSize(totalSize),
        dailyStats: Object.entries(dailyStats).map(([date, data]) => ({
          date,
          count: data.count,
          size: data.size,
          sizeFormatted: formatFileSize(data.size)
        })).sort((a, b) => b.date.localeCompare(a.date)),
        extensionStats: Object.entries(extensionStats).map(([extension, data]) => ({
          extension,
          count: data.count,
          size: data.size,
          sizeFormatted: formatFileSize(data.size)
        })),
        folderStats: Object.entries(folderStats).map(([folder, data]) => ({
          folder,
          count: data.count,
          size: data.size,
          sizeFormatted: formatFileSize(data.size)
        }))
      };

      return createCORSResponse(stats);

    } catch (error) {
      console.error('Error getting stats:', error);
      return createCORSResponse({ error: error.message }, 500);
    }
  }
};