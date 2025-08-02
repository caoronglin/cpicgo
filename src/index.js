/**
 * 现代化Cloudflare Workers图床服务 - 重构版
 * 采用模块化架构，更好的错误处理和性能优化
 */

import { handleRequest } from './handlers/main.js';
import { corsHeaders } from './utils/cors.js';

// 全局错误处理
const errorHandler = (error, request) => {
  console.error('Global error:', error);
  return new Response(
    JSON.stringify({
      error: 'Internal Server Error',
      message: error.message,
      timestamp: new Date().toISOString()
    }),
    {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    }
  );
};

export default {
  async fetch(request, env, ctx) {
    try {
      // 添加请求日志
      console.log(`${request.method} ${request.url}`);
      
      // CORS预检请求处理
      if (request.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
      }

      // 主请求处理
      return await handleRequest(request, env, ctx);
      
    } catch (error) {
      return errorHandler(error, request);
    }
  }
};
