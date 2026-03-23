import { createFileRoute } from "@tanstack/react-router";
import { useAppSession, keycloakConfig, getKeycloakClient } from "#/utils/session";

export const Route = createFileRoute("/api/auth/logout")({
  server: {
    handlers: {
      GET: async () => {
        const session = await useAppSession();
        const data = session.data;

        if (data.refreshToken) {
          try {
            const keycloak = getKeycloakClient();
            await keycloak.revokeToken(data.refreshToken);
          } catch (error) {
            console.error("Failed to revoke token:", error);
          }
        }

        await session.clear();

        const appUrl = new URL(keycloakConfig.redirectUri).origin + "/";

        const logoutUrl = new URL(
          `${keycloakConfig.url}/realms/${keycloakConfig.realm}/protocol/openid-connect/logout`,
        );
        logoutUrl.searchParams.set("post_logout_redirect_uri", appUrl);
        logoutUrl.searchParams.set("client_id", keycloakConfig.clientId);

        return new Response(null, {
          status: 302,
          headers: {
            Location: logoutUrl.toString(),
          },
        });
      },
    },
  },
});
