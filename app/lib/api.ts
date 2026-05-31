import { useAuthStore } from '../store/authStore';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'https://ajotribe-backend-fweh.onrender.com';

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = useAuthStore.getState().token;

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({ error: 'Network error' })) as { error?: string };
    throw new Error(body.error ?? `Request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export const api = {
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  get: <T>(path: string) =>
    request<T>(path, { method: 'GET' }),
};
