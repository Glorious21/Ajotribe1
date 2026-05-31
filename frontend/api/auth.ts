const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ??
  'https://ajotribe-backend-fweh.onrender.com';

type ApiResponse = Record<string, unknown>;

function readErrorMessage(data: ApiResponse, fallback: string) {
  if (typeof data.message === 'string') {
    return data.message;
  }

  if (typeof data.error === 'string') {
    return data.error;
  }

  return fallback;
}

async function postJson(path: string, body: Record<string, unknown>) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
  });

  const text = await response.text();
  let data: ApiResponse = {};

  if (text) {
    try {
      data = JSON.parse(text) as ApiResponse;
    } catch {
      const message = response.ok
        ? 'The server returned an invalid response. Please try again.'
        : `Server error (${response.status}). Please try again.`;
      throw new Error(message);
    }
  }

  if (!response.ok) {
    throw new Error(
      readErrorMessage(
        data,
        `Server error (${response.status}). Please try again.`
      )
    );
  }

  return data;
}

export function register(phone: string, password: string) {
  return postJson('/auth/register', { phone, password });
}

export function verifyOtp(phone: string, code: string) {
  return postJson('/auth/verify-otp', { phone, code });
}

export function login(phone: string, password: string) {
  return postJson('/auth/login', { phone, password });
}

export function readAuthToken(data: ApiResponse) {
  return typeof data.token === 'string' ? data.token : null;
}
