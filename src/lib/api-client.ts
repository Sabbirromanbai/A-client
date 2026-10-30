import { authClient } from "@/lib/auth-client";

const API_BASE_URL = process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:5000";

export type ApiRequestOptions<TBody = unknown> = Omit<
  RequestInit,
  "body" | "method"
> & {
  body?: TBody;
};

export class ApiClientError extends Error {
  readonly status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
  }
}

async function getJwt(): Promise<string> {
  try {
    const { data, error } = await authClient.token();

    if (error || !data?.token) {
      throw new ApiClientError("Unable to authenticate this request.");
    }

    return data.token;
  } catch {
    throw new ApiClientError("Unable to authenticate this request.");
  }
}

async function request<TResponse, TBody = unknown>(
  method: string,
  path: string,
  options: ApiRequestOptions<TBody> = {},
): Promise<TResponse> {
  const token = await getJwt();
  const { body, headers, ...requestOptions } = options;
  const requestHeaders = new Headers(headers);

  requestHeaders.set("Accept", "application/json");
  requestHeaders.set("Authorization", `Bearer ${token}`);

  if (body !== undefined) {
    requestHeaders.set("Content-Type", "application/json");
  }

  let response: Response;

  try {
    response = await fetch(new URL(path, API_BASE_URL), {
      ...requestOptions,
      body: body === undefined ? undefined : JSON.stringify(body),
      headers: requestHeaders,
      method,
    });
  } catch {
    throw new ApiClientError("The API request could not be completed.");
  }

  if (!response.ok) {
    let message = `The API request failed with status ${response.status}.`;

    try {
      const errorBody: unknown = await response.json();
      if (
        typeof errorBody === "object" &&
        errorBody !== null &&
        "message" in errorBody &&
        typeof errorBody.message === "string"
      ) {
        message = errorBody.message;
      }
    } catch {
      // Keep the status-based message when the API response is not JSON.
    }

    throw new ApiClientError(message, response.status);
  }

  if (response.status === 204) {
    return undefined as TResponse;
  }

  return (await response.json()) as TResponse;
}

export const apiClient = {
  delete: <TResponse>(path: string, options?: ApiRequestOptions) =>
    request<TResponse>("DELETE", path, options),
  get: <TResponse>(path: string, options?: ApiRequestOptions) =>
    request<TResponse>("GET", path, options),
  post: <TResponse, TBody = unknown>(
    path: string,
    body?: TBody,
    options?: Omit<ApiRequestOptions<TBody>, "body">,
  ) => request<TResponse, TBody>("POST", path, { ...options, body }),
  put: <TResponse, TBody = unknown>(
    path: string,
    body?: TBody,
    options?: Omit<ApiRequestOptions<TBody>, "body">,
  ) => request<TResponse, TBody>("PUT", path, { ...options, body }),
};
