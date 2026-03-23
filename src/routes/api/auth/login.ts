import { createFileRoute } from '@tanstack/react-router'
import { keycloakConfig } from '#/utils/session'

export const Route = createFileRoute('/api/auth/login')({
  server: {
    handlers: {
      GET: async () => {
        const params = new URLSearchParams({
          client_id: keycloakConfig.clientId,
          redirect_uri: keycloakConfig.redirectUri,
          response_type: 'code',
          scope: 'openid profile email',
        })
        
        const loginUrl = `${keycloakConfig.url}/realms/${keycloakConfig.realm}/protocol/openid-connect/auth?${params.toString()}`
        
        return new Response(null, {
          status: 302,
          headers: {
            Location: loginUrl,
          },
        })
      },
    },
  },
})
