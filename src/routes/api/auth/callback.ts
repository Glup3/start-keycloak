import { createFileRoute } from '@tanstack/react-router'
import { useAppSession, keycloakConfig } from '#/utils/session'

export const Route = createFileRoute('/api/auth/callback')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const session = await useAppSession()
        const url = new URL(request.url)
        const code = url.searchParams.get('code')

        if (!code) {
          return new Response(null, {
            status: 302,
            headers: {
              Location: '/?error=no_code',
            },
          })
        }

        try {
          const tokenResponse = await fetch(
            `${keycloakConfig.url}/realms/${keycloakConfig.realm}/protocol/openid-connect/token`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
              },
              body: new URLSearchParams({
                grant_type: 'authorization_code',
                client_id: keycloakConfig.clientId,
                client_secret: keycloakConfig.clientSecret,
                code,
                redirect_uri: keycloakConfig.redirectUri,
              }).toString(),
            }
          )

          if (!tokenResponse.ok) {
            throw new Error('Failed to exchange code for token')
          }

          const tokens = await tokenResponse.json()

          const userInfoResponse = await fetch(
            `${keycloakConfig.url}/realms/${keycloakConfig.realm}/protocol/openid-connect/userinfo`,
            {
              headers: {
                Authorization: `Bearer ${tokens.access_token}`,
              },
            }
          )

          if (!userInfoResponse.ok) {
            throw new Error('Failed to fetch user info')
          }

          const userInfo = await userInfoResponse.json()

          await session.update({
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token,
            isLoggedIn: true,
            user: {
              id: userInfo.sub,
              email: userInfo.email,
              name: userInfo.name || userInfo.preferred_username || userInfo.email,
              preferredUsername: userInfo.preferred_username,
            },
          })

          return new Response(null, {
            status: 302,
            headers: {
              Location: '/dashboard',
            },
          })
        } catch (error) {
          console.error('Auth callback error:', error)
          return new Response(null, {
            status: 302,
            headers: {
              Location: '/?error=auth_failed',
            },
          })
        }
      },
    },
  },
})
