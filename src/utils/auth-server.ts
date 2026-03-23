import { createServerFn } from "@tanstack/react-start";
import { useAppSession } from "./session";
import { getValidTokens } from "./auth-tokens";

export interface User {
  id: string;
  email: string;
  name: string;
  preferredUsername?: string;
}

export const getCurrentUserFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<{ isLoggedIn: boolean; user?: User } | null> => {
    const session = await useAppSession();
    const data = session.data;

    if (!data?.isLoggedIn) {
      return null;
    }

    const tokens = await getValidTokens();

    if (!tokens) {
      return null;
    }

    return {
      isLoggedIn: true,
      user: data.user,
    };
  },
);
