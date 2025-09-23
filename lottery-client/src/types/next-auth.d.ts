import NextAuth, { DefaultSession, DefaultUser } from 'next-auth'
import { JWT, DefaultJWT } from 'next-auth/jwt'

declare module 'next-auth' {
  interface Session {
    accessToken?: string
    user: {
      id: string
      role: string
      username: string
      isEmailVerified: boolean
      referralCode: string
    } & DefaultSession['user']
  }

  interface User extends DefaultUser {
    id: string
    username: string
    role: string
    isEmailVerified: boolean
    referralCode: string
    accessToken: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    accessToken?: string
    role?: string
    username?: string
    isEmailVerified?: boolean
    referralCode?: string
  }
}
