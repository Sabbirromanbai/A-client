
import { betterAuth } from "better-auth";
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "@better-auth/mongo-adapter";
import { jwt } from "better-auth/plugins";

const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) {
  throw new Error("MONGODB_URI is required to initialize authentication.");
}

const client = new MongoClient(mongoUri);

const db = client.db(process.env.DB_NAME?.trim() || "goodtogether");

function getBetterAuthBaseUrl() {
  if (process.env.NODE_ENV === "development") {
    return undefined;
  }

  const configuredAuthUrl = process.env.BETTER_AUTH_URL?.trim();
  if (!configuredAuthUrl) {
    throw new Error("BETTER_AUTH_URL is required outside development.");
  }

  let authUrl: URL;
  try {
    authUrl = new URL(configuredAuthUrl);
  } catch {
    throw new Error("BETTER_AUTH_URL must be an absolute HTTP(S) URL.");
  }

  if (
    !["http:", "https:"].includes(authUrl.protocol) ||
    authUrl.username ||
    authUrl.password
  ) {
    throw new Error("BETTER_AUTH_URL must be an absolute HTTP(S) URL.");
  }

  return authUrl.origin;
}

export const auth = betterAuth({
  database: mongodbAdapter(db, {
    client,
  }),

  emailAndPassword: {
    enabled: true,
    minPasswordLength: 6,
  },

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      prompt: "select_account",
    },
  },

  plugins: [
    jwt({
      jwt: {
        definePayload: ({ user }) => ({
          id: user.id,
          email: user.email,
        }),
      },
    }),
  ],

  secret: process.env.BETTER_AUTH_SECRET,

  baseURL: getBetterAuthBaseUrl(),
});
