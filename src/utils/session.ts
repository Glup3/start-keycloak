import { useSession } from "@tanstack/react-start/server";
import * as arctic from "arctic";

export interface SessionData {
  accessToken?: string;
  refreshToken?: string;
  accessTokenExpiresAt?: number;
  user?: {
    id: string;
    email: string;
    name: string;
    preferredUsername?: string;
    roles?: string[];
  };
  isLoggedIn?: boolean;
  codeVerifier?: string;
}

export function decodeJwtRoles(accessToken: string): string[] {
  try {
    const payload = accessToken.split(".")[1];
    const decoded = JSON.parse(Buffer.from(payload, "base64").toString("utf-8"));
    const roles: string[] = [];

    if (decoded.realm_access?.roles) {
      roles.push(...decoded.realm_access.roles);
    }

    const clientId = process.env.KEYCLOAK_CLIENT_ID || "my-client";
    if (decoded.resource_access?.[clientId]?.roles) {
      roles.push(...decoded.resource_access[clientId].roles);
    }

    return roles;
  } catch {
    return [];
  }
}

export function useAppSession() {
  return useSession<SessionData>({
    name: "keycloak_session",
    password:
      process.env.SESSION_SECRET || "complex_password_at_least_32_characters_long_for_security",
    cookie: {
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60,
    },
  });
}

const keycloakConfig = {
  url: process.env.KEYCLOAK_URL || "http://localhost:8080",
  realm: process.env.KEYCLOAK_REALM || "my-realm",
  clientId: process.env.KEYCLOAK_CLIENT_ID || "my-client",
  clientSecret: process.env.KEYCLOAK_CLIENT_SECRET || "",
  redirectUri: process.env.KEYCLOAK_REDIRECT_URI || "http://localhost:3000/api/auth/callback",
};

export function getKeycloakClient() {
  const realmURL = `${keycloakConfig.url}/realms/${keycloakConfig.realm}`;
  return new arctic.KeyCloak(
    realmURL,
    keycloakConfig.clientId,
    keycloakConfig.clientSecret || null,
    keycloakConfig.redirectUri,
  );
}

export function isTokenExpired(expiresAt: number | undefined, bufferSeconds = 60): boolean {
  if (!expiresAt) return true;
  return Date.now() / 1000 > expiresAt - bufferSeconds;
}

export { keycloakConfig };
