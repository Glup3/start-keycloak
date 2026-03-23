import { createFileRoute } from "@tanstack/react-router";
import { useAppSession, getKeycloakClient } from "#/utils/session";
import * as arctic from "arctic";

export const Route = createFileRoute("/api/auth/callback")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const session = await useAppSession();
        const url = new URL(request.url);
        const code = url.searchParams.get("code");
        const state = url.searchParams.get("state");
        const storedCodeVerifier = session.data.codeVerifier;

        if (!code || !state || !storedCodeVerifier) {
          return new Response(null, {
            status: 302,
            headers: {
              Location: "/?error=invalid_request",
            },
          });
        }

        const keycloak = getKeycloakClient();

        try {
          const tokens = await keycloak.validateAuthorizationCode(code, storedCodeVerifier);
          const accessToken = tokens.accessToken();
          const refreshToken = tokens.refreshToken();
          const accessTokenExpiresAt = tokens.accessTokenExpiresAt();

          const userInfoResponse = await fetch(
            `${process.env.KEYCLOAK_URL || "http://localhost:8080"}/realms/${process.env.KEYCLOAK_REALM || "my-realm"}/protocol/openid-connect/userinfo`,
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            },
          );

          if (!userInfoResponse.ok) {
            throw new Error("Failed to fetch user info");
          }

          const userInfo = await userInfoResponse.json();

          await session.update({
            accessToken,
            refreshToken: refreshToken ?? undefined,
            accessTokenExpiresAt: accessTokenExpiresAt
              ? Math.floor(accessTokenExpiresAt.getTime() / 1000)
              : undefined,
            isLoggedIn: true,
            codeVerifier: undefined,
            user: {
              id: userInfo.sub,
              email: userInfo.email,
              name: userInfo.name || userInfo.preferred_username || userInfo.email,
              preferredUsername: userInfo.preferred_username,
            },
          });

          return new Response(null, {
            status: 302,
            headers: {
              Location: "/dashboard",
            },
          });
        } catch (error) {
          console.error("Auth callback error:", error);
          if (error instanceof arctic.OAuth2RequestError) {
            console.error("OAuth2 error code:", error.code);
          }
          return new Response(null, {
            status: 302,
            headers: {
              Location: "/?error=auth_failed",
            },
          });
        }
      },
    },
  },
});
