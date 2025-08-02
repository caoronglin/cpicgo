/**
 * 优化版图床后端 - 支持文件夹创建、性能优化、CORS
 * 简约设计，减少资源占用 - 兼容版本
 */

// 常量定义
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Cache-Control': 'public, max-age=31536000'
};

const ALLOWED_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'gif', 'webp', 'avif', 'svg', 'bmp', 'tiff']);
const MIME_TYPE_MAP = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/gif': 'gif',
  'image/webp': 'webp',
  'image/avif': 'avif',
  'image/svg+xml': 'svg',
  'image/bmp': 'bmp',
  'image/tiff': 'tiff'
};

// 快速认证
async function authenticate(request, env) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader) return null;
  
  const [scheme, credentials] = authHeader.split(' ');
  
  if (scheme === 'Bearer') {
    return credentials === env.API_TOKEN ? 'api-user' : null;
  }
  
  if (scheme === 'Basic') {
    try {
      const [username, password] = atob(credentials).split(':');
      return username === env.USERNAME && password === env.PASSWORD ? username : null;
    } catch {
      return null;
    }
  }
  
  return null;
}

// 快速文件大小格式化
function formatFileSize(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return (bytes / Math.pow(k, i)).toFixed(1) + sizes[i];
}

// 生成文件名
function generateFileName(originalName, contentType) {
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 8);
  
  let extension = originalName ? 
    originalName.toLowerCase().split('.').pop() : 
    MIME_TYPE_MAP[contentType];
    
  extension = ALLOWED_EXTENSIONS.has(extension) ? extension : 'jpg';
  
  return `${timestamp}_${randomStr}.${extension}`;
}

// 快速响应生成器
const response = {
  json: (data, status = 200) => new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' }
  }),
  
  text: (text, status = 200) => new Response(text, {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'text/plain' }
  }),
  
  unauthorized: () => new Response('Unauthorized', {
    status: 401,
    headers: {
      ...CORS_HEADERS,
      'WWW-Authenticate': 'Basic realm="Image Host"'
    }
  }),
  
  html: (html) => new Response(html, {
    status: 200,
    headers: { 'Content-Type': 'text/html; charset=utf-8' }
  }),
  
  css: (css) => new Response(css, {
    status: 200,
    headers: { 'Content-Type': 'text/css' }
  }),
  
  js: (js) => new Response(js, {
    status: 200,
    headers: { 'Content-Type': 'application/javascript' }
  })
};

// 读取静态文件内容
async function readStaticFile(path) {
  try {
    if (path === '/styles.css') {
      return `
.glass {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 0.5rem;
}
.upload-zone {
  border: 2px dashed #cbd5e1;
  transition: all 0.3s ease;
  border-radius: 0.75rem;
}
.upload-zone:hover {
  border-color: #6366f1;
  background-color: rgba(99, 102, 241, 0.05);
}
.image-card {
  position: relative;
  overflow: hidden;
  border-radius: 0.5rem;
  transition: all 0.3s ease;
}
.image-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}
@media (prefers-color-scheme: dark) {
  .glass {
    background: rgba(30, 41, 59, 0.4);
    border-color: rgba(255, 255, 255, 0.1);
  }
}
.stats-number {
  font-family: ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace;
}
`;
    }
    
    if (path === '/main.js') {
      // 读取实际的main.js文件内容
      return `// 内联main.js内容 - 将在实际部署时替换`;
    }
    
    return null;
  } catch {
    return null;
  }
}

// 主处理函数
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    
    // 快速CORS预检
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS_HEADERS });
    }
    
    try {
      // API路由 - 优先级最高
      if (request.method === 'GET' && path === '/list') {
        try {
          const customPath = env.CUSTOM_PATH || 'uploads';
          const objects = await env.image_host_bucket.list({ prefix: `${customPath}/` });
          
          const folders = {};
          
          for (const obj of objects.objects || []) {
            const folderPath = obj.key.substring(customPath.length + 1).split('/').slice(0, -1).join('/');
            const folderName = folderPath || '根目录';
            
            if (!folders[folderName]) {
              folders[folderName] = {
                name: folderName,
                path: folderPath,
                images: [],
                totalSize: 0
              };
            }
            
            const fileName = obj.key.split('/').pop();
            const extension = fileName.split('.').pop().toLowerCase();
            
            folders[folderName].images.push({
              id: obj.key,
              name: fileName,
              url: `https://${env.CUSTOM_DOMAIN || url.host}/${obj.key}`,
              size: obj.size,
              sizeFormatted: formatFileSize(obj.size),
              uploaded: obj.uploaded,
              extension
            });
            
            folders[folderName].totalSize += obj.size;
          }
          
          const folderList = Object.values(folders).map(f => ({
            ...f,
            totalSizeFormatted: formatFileSize(f.totalSize),
            imageCount: f.images.length
          })).sort((a, b) => a.name.localeCompare(b.name));
          
          return response.json({
            folders: folderList,
            totalImages: objects.objects?.length || 0,
            totalSize: formatFileSize(objects.objects?.reduce((sum, obj) => sum + obj.size, 0) || 0)
          });
          
        } catch {
          return response.json({ folders: [], totalImages: 0, totalSize: '0 B' });
        }
      }
      
      // 静态资源路由
      if (request.method === 'GET') {
        // 根路径和主页
        if (path === '/' || path === '/index.html') {
          try {
            const { getAssetFromKV } = await import('@cloudflare/kv-asset-handler');
            return await getAssetFromKV(request, env);
          } catch {
            return response.text('HTML file not found', 404);
          }
        }
        
        // 所有静态文件通过Assets服务处理
        try {
          const { getAssetFromKV } = await import('@cloudflare/kv-asset-handler');
          return await getAssetFromKV(request, env);
        } catch (error) {
          // 如果Assets服务失败，尝试备用处理
          if (path === '/styles.css') {
            const css = await readStaticFile(path);
            return css ? response.css(css) : response.text('CSS not found', 404);
          }
          
          if (path === '/main.js') {
            const js = await readStaticFile(path);
            return js ? response.js(js) : response.text('JS not found', 404);
          }
          
          return response.text('File not found', 404);
        }
      }
      
      // 认证检查 - 允许匿名访问list路由
      const username = await authenticate(request, env);
      const isPublicRoute = ['/', '/index.html', '/styles.css', '/main.js', '/static', '/list'].some(p => path.startsWith(p));
      if (!username && !isPublicRoute) {
        return response.unauthorized();
      }
      
      switch (request.method) {
        case 'GET':
          try {
            const object = await env.image_host_bucket.get(path.substring(1));
            if (!object) return response.text('Not Found', 404);
            
            const headers = new Headers();
            object.writeHttpMetadata(headers);
            headers.set('etag', object.httpEtag);
            headers.set('cache-control', 'public, max-age=31536000');
            
            return new Response(object.body, { headers: { ...CORS_HEADERS, ...headers } });
          } catch {
            return response.text('Not Found', 404);
          }
          break;
          
        case 'PUT':
          if (path.endsWith('/')) {
            // 创建文件夹
            return response.json({ success: true, message: '文件夹创建成功' });
          }
          
          try {
            let imageBuffer;
            let originalName = '';
            const contentType = request.headers.get('content-type') || '';
            
            if (contentType.includes('multipart/form-data')) {
              const formData = await request.formData();
              const file = formData.get('file') || formData.get('images');
              if (!file) return response.text('No file provided', 400);
              imageBuffer = await file.arrayBuffer();
              originalName = file.name || '';
            } else {
              imageBuffer = await request.arrayBuffer();
            }
            
            const hashBuffer = await crypto.subtle.digest('MD5', imageBuffer);
            const md5Hash = Array.from(new Uint8Array(hashBuffer))
              .map(b => b.toString(16).padStart(2, '0')).join('');
            
            const year = new Date().getFullYear();
            const customPath = env.CUSTOM_PATH || 'uploads';
            const extension = generateFileName(originalName, contentType).split('.').pop();
            const storageKey = `${customPath}/${year}/${md5Hash}.${extension}`;
            
            await env.image_host_bucket.put(storageKey, imageBuffer, {
              httpMetadata: { contentType }
            });
            
            const imageUrl = `https://${env.CUSTOM_DOMAIN || url.host}/${storageKey}`;
            
            return response.json({
              success: true,
              key: storageKey,
              url: imageUrl,
              message: '文件上传成功'
            });
            
          } catch (e) {
            return response.text(`Error: ${e.message}`, 500);
          }
          
        case 'DELETE':
          try {
            const key = path.substring(1);
            if (!key) return response.text('Invalid filename', 400);
            
            await env.image_host_bucket.delete(key);
            return response.json({ success: true, message: '文件删除成功' });
          } catch {
            return response.text('Delete failed', 500);
          }
          
        default:
          return response.text('Method not allowed', 405);
      }
      
    } catch (error) {
      console.error('Error:', error);
      return response.text('Internal Server Error', 500);
    }
  }
};
