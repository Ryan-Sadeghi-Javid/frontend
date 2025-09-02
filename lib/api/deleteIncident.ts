export async function deleteIncident(incidentId: string, token: string) {
  const base = process.env.NEXT_PUBLIC_API_BASE;
  const url = `${base}/Prod/incidents/${encodeURIComponent(incidentId)}`;

  const res = await fetch(url, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (res.status === 204) return true;

  let msg = `Failed to delete (HTTP ${res.status})`;
  try {
    const data = await res.json();
    if (data?.error) msg = data.error;
  } catch {}

  throw new Error(msg);
}