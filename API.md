# R2 图床服务 API 文档

## 基础信息
- **Base URL**: `https://your-domain.com/api`
- **认证方式**: JWT Bearer Token
- **数据格式**: JSON

## 认证
所有需要认证的接口都需要在请求头中包含：
```
Authorization: Bearer <token>
```

## 接口列表

### 1. 用户认证

#### POST /auth
用户登录获取访问令牌

**请求：**
```json
{
  "username": "string",
  "password": "string"
}
```

**响应：**
```json
{
  "token": "jwt-token-string"
}
```

**状态码：**
- 200: 登录成功
- 401: 用户名或密码错误

### 2. 图片管理

#### GET /images
获取图片列表

**查询参数：**
- `page` (number, optional): 页码，默认1
- `limit` (number, optional): 每页数量，默认50
- `folder` (string, optional): 文件夹名称筛选

**响应：**
```json
{
  "images": [
    {
      "key": "uploads/filename.jpg",
      "name": "original-filename.jpg",
      "url": "https://domain.com/uploads/filename.jpg",
      "cdnUrl": "https://cdn.domain.com/uploads/filename.jpg",
      "size": 102400,
      "uploaded": "2024-01-15T10:30:00Z",
      "folder": "uploads"
    }
  ],
  "total": 100,
  "page": 1,
  "pages": 2
}
```

#### POST /upload
上传图片文件

**Content-Type**: `multipart/form-data`

**表单字段：**
- `file` (file): 图片文件，支持 JPG、PNG、GIF、WebP、SVG

**响应：**
```json
{
  "key": "uploads/filename.jpg",
  "name": "original-filename.jpg",
  "url": "https://domain.com/uploads/filename.jpg",
  "cdnUrl": "https://cdn.domain.com/uploads/filename.jpg",
  "size": 102400,
  "message": "Upload successful"
}
```

**状态码：**
- 200: 上传成功
- 400: 文件格式不支持
- 401: 未认证
- 413: 文件过大

#### DELETE /images/{key}
删除指定图片

**路径参数：**
- `key`: 图片存储路径

**响应：**
```json
{
  "message": "Image deleted successfully"
}
```

### 3. 文件夹管理

#### GET /folders
获取文件夹列表及统计

**响应：**
```json
{
  "folders": [
    {
      "name": "avatars",
      "count": 15,
      "size": 5242880
    }
  ]
}
```

### 4. 统计信息

#### GET /stats
获取系统统计信息

**响应：**
```json
{
  "totalImages": 147,
  "totalSize": 52428800,
  "todayUploads": 5,
  "thisWeekUploads": 23,
  "thisMonthUploads": 89
}
```

## 错误处理

### 错误响应格式
```json
{
  "error": "错误描述信息",
  "code": "ERROR_CODE"
}
```

### 常见状态码
- 200: 成功
- 400: 请求参数错误
- 401: 未认证或令牌无效
- 403: 权限不足
- 404: 资源不存在
- 413: 文件过大
- 500: 服务器内部错误

## 使用示例

### JavaScript (Fetch)
```javascript
// 认证
const auth = await fetch('/api/auth', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username: 'admin', password: 'pass' })
});
const { token } = await auth.json();

// 上传图片
const formData = new FormData();
formData.append('file', fileInput.files[0]);

const upload = await fetch('/api/upload', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: formData
});
const result = await upload.json();

// 获取图片列表
const images = await fetch('/api/images', {
  headers: { 'Authorization': `Bearer ${token}` }
});
const { images: imageList } = await images.json();
```

### cURL
```bash
# 认证
curl -X POST https://api.example.com/api/auth \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"pass"}'

# 上传图片
curl -X POST https://api.example.com/api/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@/path/to/image.jpg"

# 获取图片列表
curl -X GET https://api.example.com/api/images \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Python (requests)
```python
import requests

# 认证
auth = requests.post('/api/auth', json={
    'username': 'admin',
    'password': 'pass'
})
token = auth.json()['token']

# 上传图片
with open('image.jpg', 'rb') as f:
    files = {'file': f}
    headers = {'Authorization': f'Bearer {token}'}
    upload = requests.post('/api/upload', files=files, headers=headers)
    result = upload.json()
    print('图片链接:', result['cdnUrl'] or result['url'])
```