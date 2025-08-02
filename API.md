# Cpicgo API 文档

## 基础信息

- **Base URL**: `https://your-worker.your-subdomain.workers.dev`
- **协议**: HTTPS
- **数据格式**: JSON
- **认证**: Basic Auth 或 Bearer Token

## 认证方式

### 1. Basic Auth
用于Web界面访问，通过用户名密码进行认证。

**请求头格式**:
```
Authorization: Basic base64(username:password)
```

**示例**:
```bash
curl -u username:password https://your-domain.com/
```

### 2. Bearer Token
用于API访问，通过令牌进行认证。

**请求头格式**:
```
Authorization: Bearer your-api-token
```

**示例**:
```bash
curl -H "Authorization: Bearer tk_xxx..." https://your-domain.com/
```

## API 端点

### 1. 获取图片列表

**GET** `/list`

获取存储桶中的所有图片列表。

**请求参数**:
- `prefix` (可选): 文件夹前缀，用于筛选特定文件夹的图片
- `limit` (可选): 返回结果数量限制，默认1000
- `cursor` (可选): 分页游标

**响应示例**:
```json
{
  "objects": [
    {
      "key": "folder/image1.jpg",
      "size": 102400,
      "etag": "\"d41d8cd98f00b204e9800998ecf8427e\"",
      "lastModified": "2024-01-15T10:30:00.000Z"
    }
  ],
  "truncated": false,
  "cursor": null
}
```

### 2. 上传图片

**PUT** `/{path}/{filename}`

上传图片到指定路径。

**请求头**:
- `Content-Type`: 图片MIME类型
- `Authorization`: 认证信息

**支持的图片格式**:
- image/jpeg
- image/png
- image/gif
- image/webp
- image/svg+xml

**请求示例**:
```bash
curl -X PUT \
  -H "Authorization: Bearer tk_xxx..." \
  -H "Content-Type: image/jpeg" \
  --data-binary @photo.jpg \
  https://your-domain.com/albums/2024/photo.jpg
```

**响应示例**:
```json
{
  "success": true,
  "message": "文件上传成功",
  "url": "https://your-domain.com/albums/2024/photo.jpg"
}
```

### 3. 获取图片

**GET** `/{path}/{filename}`

获取指定图片。

**请求参数**:
- `w` (可选): 宽度，自动按比例缩放
- `h` (可选): 高度，自动按比例缩放
- `q` (可选): 质量，1-100，默认85
- `f` (可选): 格式转换，如webp、avif

**示例**:
```bash
# 获取原图
curl https://your-domain.com/albums/photo.jpg

# 获取缩略图
curl https://your-domain.com/albums/photo.jpg?w=300&h=200&q=80&f=webp
```

### 4. 删除图片

**DELETE** `/{path}/{filename}`

删除指定图片。

**请求示例**:
```bash
curl -X DELETE \
  -H "Authorization: Bearer tk_xxx..." \
  https://your-domain.com/albums/2024/photo.jpg
```

**响应示例**:
```json
{
  "success": true,
  "message": "文件删除成功"
}
```

### 5. 创建文件夹

**POST** `/mkdir`

创建新的文件夹。

**请求体**:
```json
{
  "folder": "path/to/new/folder"
}
```

**请求示例**:
```bash
curl -X POST \
  -H "Authorization: Bearer tk_xxx..." \
  -H "Content-Type: application/json" \
  -d '{"folder":"albums/2024"}' \
  https://your-domain.com/mkdir
```

## 错误处理

### 状态码说明

| 状态码 | 描述 |
|--------|------|
| 200 | 请求成功 |
| 400 | 请求参数错误 |
| 401 | 认证失败 |
| 403 | 权限不足 |
| 404 | 资源不存在 |
| 413 | 文件过大 |
| 415 | 不支持的文件类型 |
| 500 | 服务器内部错误 |

### 错误响应格式

```json
{
  "success": false,
  "error": "错误描述",
  "code": "ERROR_CODE"
}
```

### 常见错误示例

**401 Unauthorized**:
```json
{
  "success": false,
  "error": "认证信息无效",
  "code": "AUTH_FAILED"
}
```

**413 Payload Too Large**:
```json
{
  "success": false,
  "error": "文件大小超过限制",
  "code": "FILE_TOO_LARGE"
}
```

**415 Unsupported Media Type**:
```json
{
  "success": false,
  "error": "不支持的文件类型",
  "code": "INVALID_FILE_TYPE"
}
```

## 使用示例

### JavaScript (浏览器)

```javascript
// 上传图片
async function uploadImage(file, path) {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch(`https://your-domain.com/${path}`, {
    method: 'PUT',
    headers: {
      'Authorization': 'Bearer your-api-token'
    },
    body: file
  });
  
  return response.json();
}

// 使用示例
const fileInput = document.getElementById('fileInput');
fileInput.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  const result = await uploadImage(file, 'uploads/' + file.name);
  console.log('上传成功:', result);
});
```

### Python

```python
import requests

# 配置
API_TOKEN = 'your-api-token'
BASE_URL = 'https://your-domain.com'

# 上传图片
def upload_image(file_path, remote_path):
    headers = {
        'Authorization': f'Bearer {API_TOKEN}'
    }
    
    with open(file_path, 'rb') as f:
        response = requests.put(
            f'{BASE_URL}/{remote_path}',
            headers=headers,
            data=f
        )
    
    return response.json()

# 获取图片列表
def get_image_list():
    headers = {
        'Authorization': f'Bearer {API_TOKEN}'
    }
    
    response = requests.get(f'{BASE_URL}/list', headers=headers)
    return response.json()

# 使用示例
result = upload_image('local.jpg', 'uploads/image.jpg')
print('上传结果:', result)
```

### Node.js

```javascript
const fs = require('fs');
const axios = require('axios');

const API_TOKEN = 'your-api-token';
const BASE_URL = 'https://your-domain.com';

// 上传图片
async function uploadImage(localPath, remotePath) {
  const imageBuffer = fs.readFileSync(localPath);
  
  const response = await axios.put(
    `${BASE_URL}/${remotePath}`,
    imageBuffer,
    {
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Content-Type': 'image/jpeg'
      }
    }
  );
  
  return response.data;
}

// 获取图片列表
async function getImageList() {
  const response = await axios.get(`${BASE_URL}/list`, {
    headers: {
      'Authorization': `Bearer ${API_TOKEN}`
    }
  });
  
  return response.data;
}

// 使用示例
uploadImage('./local.jpg', 'uploads/image.jpg')
  .then(result => console.log('上传成功:', result))
  .catch(error => console.error('上传失败:', error));
```

## 限制说明

- **文件大小**: 单个文件最大100MB
- **文件类型**: 仅支持图片格式（JPEG、PNG、GIF、WebP、SVG）
- **请求频率**: 每分钟最多1000次请求
- **存储容量**: 受Cloudflare R2存储限制

## 最佳实践

1. **认证安全**: 定期更换API Token，不要在客户端暴露敏感信息
2. **文件命名**: 使用有意义的文件路径和名称，避免特殊字符
3. **图片优化**: 上传前压缩图片，使用适当的格式
4. **错误处理**: 实现重试机制，处理网络异常
5. **缓存策略**: 利用CDN缓存，合理设置缓存头

## 技术支持

如有问题，请通过以下方式联系：
- GitHub Issues: [创建Issue](https://github.com/your-repo/issues)
- 邮件: support@your-domain.com