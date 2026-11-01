
import { createAuthClient } from "better-auth/react";
import { jwtClient } from "better-auth/client/plugins";

const configuredAuthUrl = process.env.NEXT_PUBLIC_BETTER_AUTH_URL?.trim();

export const authClient = createAuthClient({
  baseURL: configuredAuthUrl
    ? new URL(configuredAuthUrl).origin
    : typeof window !== "undefined"
      ? window.location.origin
      : undefined,
  plugins: [jwtClient()],
});
