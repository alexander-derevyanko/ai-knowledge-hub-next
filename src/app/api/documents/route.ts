import { forwardBackendRequest } from '@/shared/api/backendBff';

const ALLOWED_QUERY_PARAMS = [
  'page',
  'limit',
  'search',
  'category',
  'status',
  'sortBy',
  'sortOrder',
] as const;

export async function GET(request: Request): Promise<Response> {
  const requestUrl = new URL(request.url);
  const backendSearchParams = new URLSearchParams();

  // Forward only supported query parameters to avoid passing arbitrary input.
  for (const key of ALLOWED_QUERY_PARAMS) {
    const value = requestUrl.searchParams.get(key);

    if (value !== null) {
      backendSearchParams.set(key, value);
    }
  }

  const queryString = backendSearchParams.toString();
  const path = `/documents${queryString ? `?${queryString}` : ''}`;

  return forwardBackendRequest(path, {
    method: 'GET',
  });
}

export async function POST(request: Request): Promise<Response> {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return Response.json(
      {
        statusCode: 400,
        message: 'Invalid JSON request body',
      },
      {
        status: 400,
        headers: {
          'Cache-Control': 'no-store',
        },
      },
    );
  }

  return forwardBackendRequest('/documents', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
}
