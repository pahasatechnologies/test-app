import axios, { AxiosInstance, AxiosRequestConfig } from 'axios'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth-config'

class ServerApiClient {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  }

  private async getAuthToken() {
    try {
      const session = await getServerSession(authOptions)
      return session?.accessToken
    } catch {
      return null
    }
  }

  async get(url: string, config?: AxiosRequestConfig) {
    const token = await this.getAuthToken()
    return this.client.get(url, {
      ...config,
      headers: {
        ...config?.headers,
        ...(token && { Authorization: `Bearer ${token}` })
      }
    })
  }

  async post(url: string, data?: any, config?: AxiosRequestConfig) {
    const token = await this.getAuthToken()
    return this.client.post(url, data, {
      ...config,
      headers: {
        ...config?.headers,
        ...(token && { Authorization: `Bearer ${token}` })
      }
    })
  }

  async put(url: string, data?: any, config?: AxiosRequestConfig) {
    const token = await this.getAuthToken()
    return this.client.put(url, data, {
      ...config,
      headers: {
        ...config?.headers,
        ...(token && { Authorization: `Bearer ${token}` })
      }
    })
  }

  async delete(url: string, config?: AxiosRequestConfig) {
    const token = await this.getAuthToken()
    return this.client.delete(url, {
      ...config,
      headers: {
        ...config?.headers,
        ...(token && { Authorization: `Bearer ${token}` })
      }
    })
  }

  // Get session for server components
  async getSession() {
    try {
      return await getServerSession(authOptions)
    } catch {
      return null
    }
  }
}

// Single export for server-side use
export const serverApi = new ServerApiClient()
export default serverApi
