import { createFileRoute } from '@tanstack/react-router'
import { useAppSession } from '#/utils/session'

export const Route = createFileRoute('/api/auth/logout')({
  server: {
    handlers: {
      GET: async () => {
        const session = await useAppSession()
        await session.clear()
        
        return new Response(null, {
          status: 302,
          headers: {
            Location: '/',
          },
        })
      },
    },
  },
})
