import 'server-only';

import { backendFetch } from './backendClient';

/**
 * Returns a consistent 502 response when the BFF cannot reach the backend.
 */
function createBackendUnavailableResponse(): Response {
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

/**
 * Forwards a request to NestJS and returns its response to the browser.
 * Preserves the backend status, response body, content type and Set-Cookie.
 */
export async function forwardBackendRequest(
  path: string,
  init: RequestInit = {},
): Promise<Response> {
  try {
    const backendResponse = await backendFetch(path, init);

    const headers = new Headers({
      'Cache-Control': 'no-store',
    });

    const contentType = backendResponse.headers.get('content-type');
    const setCookie = backendResponse.headers.get('set-cookie');

    if (contentType) {
      headers.set('Content-Type', contentType);
    }

    if (setCookie) {
      headers.set('Set-Cookie', setCookie);
    }

    return new Response(backendResponse.body, {
      status: backendResponse.status,
      headers,
    });
  } catch (error) {
    console.error(`[BFF] ${init.method ?? 'GET'} ${path} failed:`, error);

    return createBackendUnavailableResponse();
  }
}
