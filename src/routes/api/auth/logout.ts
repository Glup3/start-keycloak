import { createFileRoute } from '@tanstack/react-router'
import { useAppSession, keycloakConfig } from '#/utils/session'

export const Route = createFileRoute('/api/auth/logout')({
  server: {
    handlers: {
      GET: async () => {
        const session = await useAppSession()
        await session.clear()
        
        const appUrl = new URL(keycloakConfig.redirectUri).origin + '/'
        
        const logoutUrl = new URL(
          `${keycloakConfig.url}/realms/${keycloakConfig.realm}/protocol/openid-connect/logout`
        )
        logoutUrl.searchParams.set('post_logout_redirect_uri', appUrl)
        logoutUrl.searchParams.set('client_id', keycloakConfig.clientId)
        
        return new Response(null, {
          status: 302,
          headers: {
            Location: logoutUrl.toString(),
          },
        })
      },
    },
  },
})
