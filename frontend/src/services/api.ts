const API_BASE = '/api';

export async function fetchStatus(apiBase = API_BASE) {
  const res = await fetch(`${apiBase}/status`);
  if (!res.ok) throw new Error('Failed to fetch status');
  return res.json();
}

export async function addTarget(url: string, apiBase = API_BASE) {
  const res = await fetch(`${apiBase}/targets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || 'Failed to add target');
  }
  return res.json();
}

export async function setCheckInterval(interval: number, apiBase = API_BASE) {
  const res = await fetch(`${apiBase}/config/interval`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ interval }),
  });
  if (!res.ok) throw new Error('Failed to set interval');
  return res.json();
}