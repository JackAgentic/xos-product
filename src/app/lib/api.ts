export async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem('xos-token');
  const headers: Record<string, string> = {
    ...((options?.headers as Record<string, string>) || {}),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (options?.body) headers['Content-Type'] = 'application/json';

  const res = await fetch(path, { ...options, headers });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `Request failed: ${res.status}`);
  }
  const text = await res.text();
  return text ? JSON.parse(text) : ({} as T);
}
