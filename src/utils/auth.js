/**
 * 认证工具函数
 */

export async function authenticate(request, env) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader) return null;

  const [scheme, credentials] = authHeader.split(' ');

  // Bearer token认证（支持前端生成的token和API token）
  if (scheme === 'Bearer') {
    // 如果是API token
    if (credentials === env.API_TOKEN) {
      return { id: 'api-user', type: 'api' };
    }
    
    // 验证前端生成的token（简单验证）
    try {
      const decoded = atob(credentials);
      const [username, timestamp] = decoded.split(':');
      if (username === env.AUTH_USERNAME) {
        return { id: username, type: 'token' };
      }
    } catch {
      return null;
    }
  }

  // Basic认证
  if (scheme === 'Basic') {
    try {
      const [username, password] = atob(credentials).split(':');
      if (username === env.AUTH_USERNAME && password === env.AUTH_PASSWORD) {
        return { id: username, type: 'basic' };
      }
    } catch {
      return null;
    }
  }

  return null;
}

export function createAuthHeaders(realm = 'Image Host') {
  return {
    'WWW-Authenticate': `Bearer realm="${realm}"`
  };
}