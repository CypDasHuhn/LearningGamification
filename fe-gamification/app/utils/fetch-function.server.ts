export const fetchFunction = async ({
  url,
  method,
  body,
  request,
}: {
  url: string;
  method: string;
  body?: any;
  request?: Request;
  projectId?: string; // Optional: can be provided directly for client-side usage
}) => {
  // Get projectId from request if available, otherwise use provided projectId
  const BACKEND_URL = (
    process.env.BACKEND_URL || "http://0.0.0.0:8080"
  ).replace(/\/$/, "");

  const isGetOrHead =
    method.toUpperCase() === "GET" || method.toUpperCase() === "HEAD";

  const fetchOptions: RequestInit = {
    method: method,
    headers: {},
  };

  // Only add Content-Type and body for non-GET/HEAD requests
  if (!isGetOrHead && body) {
    fetchOptions.headers = {
      ...fetchOptions.headers,
      "Content-Type": "application/json",
    };
    fetchOptions.body = JSON.stringify(body);
  }

  const response = await fetch(`${BACKEND_URL}${url}`, fetchOptions);

  const responseData = await response.json().catch(() => ({}));
  console.log({ responseData });

  if (!response.ok) {
    // For error responses, include the response data in the error
    const errorMessage =
      responseData?.message ||
      responseData?.error?.message ||
      response.statusText;
    const error = new Error(
      `Ein Fehler ist aufgetreten: ${errorMessage}, ${response.status}`,
    );
    (error as any).status = response.status;
    (error as any).responseData = responseData;
    throw error;
  }

  return { response: responseData };
};
