/**
 * 文件处理工具函数
 */

export const ALLOWED_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'gif', 'webp', 'avif', 'svg', 'bmp', 'tiff']);

export const MIME_TYPE_MAP = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/gif': 'gif',
  'image/webp': 'webp',
  'image/avif': 'avif',
  'image/svg+xml': 'svg',
  'image/bmp': 'bmp',
  'image/tiff': 'tiff'
};

export function generateFileName(originalName, extension) {
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 8);
  const cleanExtension = extension.replace(/^\./, '');
  
  return `${timestamp}_${randomStr}.${cleanExtension}`;
}

export function formatFileSize(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return (bytes / Math.pow(k, i)).toFixed(1) + sizes[i];
}

export function getFileExtension(filename) {
  const extension = filename.toLowerCase().split('.').pop();
  return ALLOWED_EXTENSIONS.has(extension) ? extension : 'jpg';
}

export function isValidImageType(contentType) {
  return Object.keys(MIME_TYPE_MAP).includes(contentType);
}

export function sanitizeFileName(filename) {
  return filename
    .replace(/[^\w\s.-]/g, '')
    .replace(/\s+/g, '-')
    .toLowerCase();
}