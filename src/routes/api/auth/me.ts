import { createFileRoute } from "@tanstack/react-router";
import { useAppSession } from "#/utils/session";
import { getValidTokens } from "#/utils/auth-tokens";

export const Route = createFileRoute("/api/auth/me")({
  server: {
    handlers: {
      GET: async () => {
        const session = await useAppSession();
        const data = session.data;

        if (!data?.isLoggedIn) {
          return Response.json({ isLoggedIn: false });
        }

        const tokens = await getValidTokens();

        if (!tokens) {
          return Response.json({ isLoggedIn: false });
        }

        return Response.json({
          isLoggedIn: true,
          user: data.user,
        });
      },
    },
  },
});
