import { withAuth } from 'next-auth/middleware'

export default withAuth(
  function middleware(req) {
    // Add custom logic here if needed
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Check if user has required permissions
        if (req.nextUrl.pathname.startsWith('/admin')) {
          return token?.role === 'admin'
        }
        
        if (req.nextUrl.pathname.startsWith('/dashboard')) {
          return !!token && token.isEmailVerified === true
        }
        
        return true
      },
    },
  }
)

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*', '/wallet/:path*']
}
