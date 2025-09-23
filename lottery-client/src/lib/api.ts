import axios, { AxiosInstance, AxiosRequestConfig } from 'axios'
import { getSession } from 'next-auth/react'

class ApiClient {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Request interceptor - only works on client
    this.client.interceptors.request.use(
      async (config) => {
        if (typeof window !== 'undefined') {
          const session = await getSession()
          if (session?.accessToken) {
            config.headers.Authorization = `Bearer ${session.accessToken}`
          }
        }
        return config
      },
      (error) => Promise.reject(error)
    )

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401 && typeof window !== 'undefined') {
          window.location.href = '/auth/login'
        }
        return Promise.reject(error)
      }
    )
  }

  async get(url: string, config?: AxiosRequestConfig) {
    return this.client.get(url, config)
  }

  async post(url: string, data?: any, config?: AxiosRequestConfig) {
    return this.client.post(url, data, config)
  }

  async put(url: string, data?: any, config?: AxiosRequestConfig) {
    return this.client.put(url, data, config)
  }

  async delete(url: string, config?: AxiosRequestConfig) {
    return this.client.delete(url, config)
  }
}

// Single export for client-side use
export const api = new ApiClient()
export default api
