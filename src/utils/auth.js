/**
 * 认证工具函数
 */

export async function authenticate(request, env) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader) return null;

  const [scheme, credentials] = authHeader.split(' ');

  // Bearer token认证
  if (scheme === 'Bearer') {
    return credentials === env.API_TOKEN ? { id: 'api-user', type: 'api' } : null;
  }

  // Basic认证
  if (scheme === 'Basic') {
    try {
      const [username, password] = atob(credentials).split(':');
      if (username === env.USERNAME && password === env.PASSWORD) {
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