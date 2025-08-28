export async function fetchUserIncidents(token: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE!}/Prod/user-incidents`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch incidents");
  }

  const data = await res.json();

  // 🔍 If body is a stringified array, parse it
  if (typeof data.body === "string") {
    return JSON.parse(data.body);
  }

  // 🔍 If body is already parsed (unlikely), return as-is
  if (Array.isArray(data.body)) {
    return data.body;
  }

  // 🔍 If response is already the array
  if (Array.isArray(data)) {
    return data;
  }

  throw new Error("Unexpected response format");
}
