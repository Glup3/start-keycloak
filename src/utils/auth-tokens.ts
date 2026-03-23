import { useAppSession, getKeycloakClient, isTokenExpired, keycloakConfig } from "./session";
import * as arctic from "arctic";

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
  accessTokenExpiresAt?: number;
}

export async function getValidTokens(): Promise<AuthTokens | null> {
  const session = await useAppSession();
  const data = session.data;

  if (!data.isLoggedIn || !data.accessToken) {
    return null;
  }

  if (!isTokenExpired(data.accessTokenExpiresAt)) {
    return {
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      accessTokenExpiresAt: data.accessTokenExpiresAt,
    };
  }

  if (!data.refreshToken) {
    return null;
  }

  try {
    const keycloak = getKeycloakClient();
    const tokens = await keycloak.refreshAccessToken(data.refreshToken);

    const newAccessToken = tokens.accessToken();
    const newRefreshToken = tokens.refreshToken();
    const newExpiresAt = tokens.accessTokenExpiresAt();

    await session.update({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken ?? undefined,
      accessTokenExpiresAt: newExpiresAt ? Math.floor(newExpiresAt.getTime() / 1000) : undefined,
    });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken ?? undefined,
      accessTokenExpiresAt: newExpiresAt ? Math.floor(newExpiresAt.getTime() / 1000) : undefined,
    };
  } catch (error) {
    console.error("Token refresh failed:", error);

    if (error instanceof arctic.OAuth2RequestError) {
      await session.clear();
    }

    return null;
  }
}

export async function withAuth<T>(
  fn: (accessToken: string) => Promise<T>,
): Promise<T | { error: "unauthorized"; loginUrl: string }> {
  const tokens = await getValidTokens();

  if (!tokens) {
    return {
      error: "unauthorized",
      loginUrl: keycloakConfig.redirectUri.replace("/api/auth/callback", "/api/auth/login"),
    };
  }

  return fn(tokens.accessToken);
}
