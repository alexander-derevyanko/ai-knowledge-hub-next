import { backendFetch } from '@/shared/api/backendClient';

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

  for (const key of ALLOWED_QUERY_PARAMS) {
    const value = requestUrl.searchParams.get(key);

    if (value !== null) {
      backendSearchParams.set(key, value);
    }
  }

  const queryString = backendSearchParams.toString();
  const path = `/documents${queryString ? `?${queryString}` : ''}`;

  try {
    const backendResponse = await backendFetch(path, {
      method: 'GET',
    });

    const headers = new Headers({
      'Cache-Control': 'no-store',
    });

    const contentType = backendResponse.headers.get('content-type');

    if (contentType) {
      headers.set('Content-Type', contentType);
    }

    return new Response(backendResponse.body, {
      status: backendResponse.status,
      headers,
    });
  } catch (error) {
    console.error('[BFF] GET /api/documents failed:', error);

    return Response.json(
      {
        statusCode: 502,
        code: 'BACKEND_UNAVAILABLE',
        message: 'The backend service is temporarily unavailable',
      },
      {
        status: 502,
        headers: {
          'Cache-Control': 'no-store',
        },
      },
    );
  }
}
