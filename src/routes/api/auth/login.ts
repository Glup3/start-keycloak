import { createFileRoute } from "@tanstack/react-router";
import { useAppSession, getKeycloakClient } from "#/utils/session";
import * as arctic from "arctic";

export const Route = createFileRoute("/api/auth/login")({
  server: {
    handlers: {
      GET: async () => {
        const session = await useAppSession();
        const keycloak = getKeycloakClient();

        const state = arctic.generateState();
        const codeVerifier = arctic.generateCodeVerifier();
        const scopes = ["openid", "profile", "email"];

        const url = keycloak.createAuthorizationURL(state, codeVerifier, scopes);

        await session.update({
          codeVerifier,
        });

        return new Response(null, {
          status: 302,
          headers: {
            Location: url.toString(),
          },
        });
      },
    },
  },
});
