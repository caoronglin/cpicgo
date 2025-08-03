/**
 * 主请求处理器
 * 路由分发和中间件处理
 */

import { corsHeaders } from '../utils/cors.js';
import { authenticate } from '../utils/auth.js';
import { imageRoutes } from './image.js';
import { folderRoutes } from './folder.js';
import { statsRoutes } from './stats.js';
import { staticRoutes } from './static.js';
import { uploadRoutes } from './upload.js';

export async function handleRequest(request, env, ctx) {
  const url = new URL(request.url);
  const path = url.pathname;
  const method = request.method;

  // 静态资源路由
  if (method === 'GET' && isStaticRoute(path)) {
    return await staticRoutes.handle(request, env);
  }

  // API路由
  if (path.startsWith('/api/')) {
    return await handleAPIRoutes(request, env, ctx);
  }

  // 文件访问路由
  if (method === 'GET' && !path.startsWith('/api/')) {
    return await imageRoutes.handleFileAccess(request, env);
  }

  // 默认404
  return new Response('Not Found', { 
    status: 404,
    headers: corsHeaders
  });
}

async function handleAPIRoutes(request, env, ctx) {
  const url = new URL(request.url);
  const path = url.pathname;
  const method = request.method;

  // 认证检查（除了公开路由）
  const isPublicRoute = ['/api/auth', '/api/list', '/api/stats', '/api/images', '/api/folders'].includes(path) || 
                       (path.startsWith('/api/images') && method === 'GET') || 
                       path.startsWith('/api/folders');
  if (!isPublicRoute) {
    const user = await authenticate(request, env);
    if (!user) {
      return new Response('Unauthorized', {
        status: 401,
        headers: {
          ...corsHeaders,
          'WWW-Authenticate': 'Bearer realm="Image Host"'
        }
      });
    }
  }

  // 路由分发
  switch (true) {
    case path === '/api/auth' && method === 'POST':
      return await handleAuth(request, env);
    case path.startsWith('/api/images'):
      return await imageRoutes.handle(request, env);
    case path.startsWith('/api/folders'):
      return await folderRoutes.handle(request, env);
    case path.startsWith('/api/stats'):
      return await statsRoutes.handle(request, env);
    case path.startsWith('/api/upload'):
      return await uploadRoutes.handle(request, env);
    default:
      return new Response('API endpoint not found', {
        status: 404,
        headers: corsHeaders
      });
  }
}

async function handleAuth(request, env) {
  try {
    const { username, password } = await request.json();
    
    // 验证用户名密码
    if (username === env.AUTH_USERNAME && password === env.AUTH_PASSWORD) {
      // 生成简单token（实际项目中应使用JWT）
      const token = btoa(`${username}:${Date.now()}:${Math.random()}`);
      
      return new Response(JSON.stringify({
        token: token,
        user: { username: username }
      }), {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    
    return new Response(JSON.stringify({
      error: 'Invalid credentials'
    }), {
      status: 401,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      error: 'Invalid request format'
    }), {
      status: 400,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
}

function isStaticRoute(path) {
  return ['/', '/index.html', '/favicon.ico', '/test.html'].includes(path) || 
         path.startsWith('/assets/') ||
         path.endsWith('.css') ||
         path.endsWith('.js') ||
         path.endsWith('.png') ||
         path.endsWith('.jpg') ||
         path.endsWith('.ico') ||
         path.endsWith('.html');
}