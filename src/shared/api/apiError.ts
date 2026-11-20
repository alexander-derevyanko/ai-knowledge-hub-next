interface ApiErrorDetail {
  field: string;
  messages: string[];
}

interface ApiErrorResponse {
  message?: string | string[];
  details?: ApiErrorDetail[];
}

export async function getApiErrorMessage(response: Response): Promise<string> {
  const body = (await response.json().catch(() => null)) as ApiErrorResponse | null;

  if (!body) {
    return `Request failed with status ${response.status}`;
  }

  const message = Array.isArray(body.message) ? body.message.join(', ') : body.message;

  const details = body.details
    ?.flatMap(({ field, messages }) => messages.map((item) => `${field}: ${item}`))
    .join('; ');

  if (message && details) {
    return `${message}: ${details}`;
  }

  if (message) {
    return message;
  }

  return `Request failed with status ${response.status}`;
}
