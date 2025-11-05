/**
 * Minimal API helper for sample fetch calls.
 * Components can import these helpers and replace the base URL or adapt headers to their backend.
 */

export const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || '';

export async function apiGet(path: string, opts: RequestInit = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) },
    ...opts,
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`GET ${path} failed: ${res.status} ${txt}`);
  }
  return res.json();
}

export async function apiPost(path: string, body: unknown, opts: RequestInit = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) },
    body: JSON.stringify(body),
    ...opts,
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`POST ${path} failed: ${res.status} ${txt}`);
  }
  return res.json();
}

export async function apiPut(path: string, body: unknown, opts: RequestInit = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) },
    body: JSON.stringify(body),
    ...opts,
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`PUT ${path} failed: ${res.status} ${txt}`);
  }
  return res.json();
}

export async function apiDelete(path: string, opts: RequestInit = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) },
    ...opts,
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`DELETE ${path} failed: ${res.status} ${txt}`);
  }
  return res.json();
}
