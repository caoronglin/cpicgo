const API_BASE_URL = (import.meta.env as any).PROD ? '' : 'http://localhost:8787'

interface ApiResponse<T = any> {
  success?: boolean
  data?: T
  error?: string
}

class ApiClient {
  private baseUrl: string
  private token: string | null

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
    this.token = localStorage.getItem('auth_token')
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`
    const headers = new Headers(options.headers)

    if (this.token) {
      headers.set('Authorization', `Bearer ${this.token}`)
    }

    headers.set('Content-Type', 'application/json')

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return { success: true, data }
    } catch (error) {
      console.error('API request failed:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  // 图片相关API
  async getImages(folder?: string, limit?: number) {
    const params = new URLSearchParams()
    if (folder) params.set('folder', folder)
    if (limit) params.set('limit', limit.toString())
    
    return this.request(`/api/images?${params}`)
  }

  async uploadImage(file: File, folder?: string) {
    const formData = new FormData()
    formData.append('file', file)
    if (folder) formData.append('folder', folder)

    return this.request('/api/images', {
      method: 'POST',
      body: formData,
      // @ts-ignore - FormData works without Content-Type header
      headers: {}
    })
  }

  async deleteImage(key: string) {
    return this.request(`/api/images?key=${encodeURIComponent(key)}`, {
      method: 'DELETE',
    })
  }

  // 文件夹相关API
  async getFolders() {
    return this.request('/api/folders')
  }

  async createFolder(name: string, parent?: string) {
    return this.request('/api/folders', {
      method: 'POST',
      body: JSON.stringify({ name, parent }),
    })
  }

  async deleteFolder(path: string) {
    return this.request('/api/folders', {
      method: 'DELETE',
      body: JSON.stringify({ path }),
    })
  }

  // 统计相关API
  async getStats() {
    return this.request('/api/stats')
  }
}

export const api = new ApiClient(API_BASE_URL)