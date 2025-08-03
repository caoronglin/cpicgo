/**
 * 静态资源路由处理器
 */

export const staticRoutes = {
  async handle(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    try {
      // 使用Cloudflare Assets绑定处理静态资源
      let response = await env.ASSETS.fetch(request);
      
      // 如果是HTML文件，注入环境变量
      if (path === '/' || path.endsWith('.html')) {
        response = await this.injectEnvVariables(response, env);
      }
      
      return response;
    } catch (error) {
      console.error('Error serving static asset:', error);
      
      // 备用处理
      if (path === '/') {
        return this.getFallbackHTML();
      }
      
      return new Response('Not Found', { status: 404 });
    }
  },

  async injectEnvVariables(response, env) {
    // 获取原始HTML内容
    let html = await response.text();
    
    // 创建环境变量脚本
    const envScript = `
    <script>
      // 注入环境变量
      const WEB_UPLOAD_ENABLED = ${JSON.stringify(env.WEB_UPLOAD_ENABLED || 'true')};
    </script>
    `;
    
    // 将环境变量脚本注入到HTML中，在</title>标签后插入
    html = html.replace('</title>', `</title>${envScript}`);
    
    // 返回修改后的响应
    return new Response(html, {
      headers: {
        'Content-Type': 'text/html',
        ...response.headers
      }
    });
  },

  getFallbackHTML() {
    return new Response(`
      <!DOCTYPE html>
      <html lang="zh-CN">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>图床服务 - 重构中</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100vh;
            margin: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
          }
          .container {
            text-align: center;
            padding: 2rem;
          }
          h1 {
            font-size: 2.5rem;
            margin-bottom: 1rem;
          }
          p {
            font-size: 1.2rem;
            opacity: 0.8;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>图床服务重构中</h1>
          <p>我们正在升级系统，请稍后再试</p>
        </div>
      </body>
      </html>
    `, {
      headers: { 'Content-Type': 'text/html' }
    });
  }
};