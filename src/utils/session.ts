import { useSession } from '@tanstack/react-start/server'

export interface SessionData {
  accessToken?: string
  refreshToken?: string
  user?: {
    id: string
    email: string
    name: string
    preferredUsername?: string
  }
  isLoggedIn?: boolean
}

export function useAppSession() {
  return useSession<SessionData>({
    name: 'keycloak_session',
    password: process.env.SESSION_SECRET || 'complex_password_at_least_32_characters_long_for_security',
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60,
    },
  })
}

export const keycloakConfig = {
  url: process.env.KEYCLOAK_URL || 'http://localhost:8080',
  realm: process.env.KEYCLOAK_REALM || 'my-realm',
  clientId: process.env.KEYCLOAK_CLIENT_ID || 'my-client',
  clientSecret: process.env.KEYCLOAK_CLIENT_SECRET || '',
  redirectUri: process.env.KEYCLOAK_REDIRECT_URI || 'http://localhost:3000/api/auth/callback',
}
