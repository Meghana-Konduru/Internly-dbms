
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function apiRequest(path, options = {}) {
  if (!API_BASE_URL) {
    throw new Error(
      "Backend URL is missing. Check frontend/.env.local"
    );
  }

  const isFormData =
    typeof FormData !== "undefined" &&
    options.body instanceof FormData;

  const token =
    typeof window !== "undefined"
      ? sessionStorage.getItem("internly_access_token")
      : null;

  const headers = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  let body = options.body;

  if (
    body &&
    typeof body === "object" &&
    !isFormData
  ) {
    body = JSON.stringify(body);
  }

  const response = await fetch(
    `${API_BASE_URL.replace(/\/$/, "")}${path}`,
    {
      ...options,
      headers,
      body,
    }
  );

  const contentType = response.headers.get("content-type") || "";
  let data = null;

  if (contentType.includes("application/json")) {
    data = await response.json();
  } else {
    const responseText = await response.text();
    data = responseText || null;
  }

  if (!response.ok) {
    const message =
      data?.detail ||
      data?.message ||
      (typeof data === "string" ? data : null) ||
      `Request failed (${response.status})`;

    throw new Error(message);
  }

  return data;
}
