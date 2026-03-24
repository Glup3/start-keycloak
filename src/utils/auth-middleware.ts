import { createMiddleware } from "@tanstack/react-start";
import { getValidTokens } from "./auth-tokens";
import { useAppSession } from "./session";

export const authMiddleware = createMiddleware().server(async ({ next }) => {
  const session = await useAppSession();
  const tokens = await getValidTokens();

  if (!tokens || !session.data.isLoggedIn) {
    throw new Error("Unauthorized");
  }

  return next({
    context: {
      user: session.data.user,
      accessToken: tokens.accessToken,
    },
  });
});
