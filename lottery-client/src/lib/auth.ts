import { signIn, signOut, useSession } from 'next-auth/react'
import api from './api'

export const authService = {
  async signup(data: {
    fullName: string;
    email: string;
    username: string;
    location?: string;
    password: string;
    confirmPassword: string;
    referredBy?: string;
  }) {
    const response = await api.post('/auth/signup', data)
    return response.data
  },

  async verifyOTP(email: string, otp: string) {
    const response = await api.post('/auth/verify-otp', { email, otp })
    return response.data
  },

  async login(email: string, password: string) {
    const result = await signIn('credentials', {
      email,
      password,
      redirect: false
    })
    
    if (result?.error) {
      throw new Error(result.error)
    }
    
    return result
  },

  async logout() {
    await signOut({ redirect: true, callbackUrl: '/' })
  },

  async resendOTP(email: string) {
    const response = await api.post('/auth/resend-otp', { email })
    return response.data
  }
}

// Custom hook for authentication
export function useAuth() {
  const { data: session, status } = useSession()
  
  return {
    user: session?.user,
    isAuthenticated: status === 'authenticated',
    isLoading: status === 'loading',
    accessToken: session?.accessToken,
    session
  }
}

// Type guard for authenticated session
export function isAuthenticatedSession(session: any) {
  return !!(session?.user?.id && session.accessToken)
}
