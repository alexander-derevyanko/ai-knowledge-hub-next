import { forwardBackendRequest } from '@/shared/api/backendBff';

export async function POST(): Promise<Response> {
  return forwardBackendRequest('/auth/logout', {
    method: 'POST',
  });
}
