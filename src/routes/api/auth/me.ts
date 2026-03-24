import { createFileRoute } from "@tanstack/react-router";
import { authMiddleware } from "#/utils/auth-middleware";

export const Route = createFileRoute("/api/auth/me")({
  server: {
    middleware: [authMiddleware],
    handlers: {
      GET: ({ context }) => {
        return Response.json({
          isLoggedIn: true,
          user: context.user,
        });
      },
    },
  },
});
