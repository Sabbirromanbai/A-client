export function getApiUrl(path: string): URL {
  const configuredApiUrl = process.env.NEXT_PUBLIC_API_URL?.trim();

  if (!configuredApiUrl) {
    throw new Error("NEXT_PUBLIC_API_URL is not configured.");
  }

  let baseUrl: URL;
  try {
    baseUrl = new URL(configuredApiUrl);
  } catch {
    throw new Error("NEXT_PUBLIC_API_URL must be an absolute HTTP(S) URL.");
  }

  if (
    !["http:", "https:"].includes(baseUrl.protocol) ||
    (process.env.NODE_ENV === "production" && baseUrl.protocol !== "https:") ||
    baseUrl.username ||
    baseUrl.password ||
    baseUrl.search ||
    baseUrl.hash
  ) {
    throw new Error(
      "NEXT_PUBLIC_API_URL must be an HTTP(S) API origin without a path.",
    );
  }

  if (baseUrl.pathname.replace(/\/+$/, "")) {
    throw new Error(
      "NEXT_PUBLIC_API_URL must be an HTTP(S) API origin without a path.",
    );
  }

  baseUrl.pathname = "/";
  return new URL(path.replace(/^\/+/, ""), baseUrl);
}
