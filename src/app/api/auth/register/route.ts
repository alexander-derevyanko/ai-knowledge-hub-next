import { forwardBackendRequest } from '@/shared/api/backendBff';

export async function POST(request: Request): Promise<Response> {
  const body = await request.text();

  return forwardBackendRequest('/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body,
  });
}
