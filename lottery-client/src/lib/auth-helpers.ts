import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth-config'
import { redirect } from 'next/navigation'

// Get session in server components
export async function getSession() {
  return await getServerSession(authOptions)
}

// Require authentication in server components
export async function requireAuth() {
  const session = await getSession()
  
  if (!session) {
    redirect('/auth/login')
  }
  
  return session
}

// Require admin role in server components  
export async function requireAdmin() {
  const session = await requireAuth()
  
  if (session.user.role !== 'admin') {
    redirect('/unauthorized')
  }
  
  return session
}

// Check if user is authenticated (returns boolean)
export async function isAuthenticated() {
  const session = await getSession()
  return !!session
}
