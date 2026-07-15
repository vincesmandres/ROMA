type BrowserConfig = {
  url: string;
  key: string;
};

export function getBrowserSupabaseConfig(): BrowserConfig | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();

  if (!url || !key) return null;
  return { url: url.replace(/\/$/, ""), key };
}

export function isSupabaseBrowserConfigured(): boolean {
  return getBrowserSupabaseConfig() !== null;
}

export async function browserSupabaseFetch<T>(path: string, init: RequestInit = {}) {
  const config = getBrowserSupabaseConfig();
  if (!config) return { data: null as T | null, error: new Error("Supabase is not configured") };

  try {
    const response = await fetch(`${config.url}/rest/v1/${path}`, {
      ...init,
      headers: {
        apikey: config.key,
        Authorization: `Bearer ${config.key}`,
        "Content-Type": "application/json",
        ...(init.headers ?? {}),
      },
    });

    if (!response.ok) return { data: null as T | null, error: new Error(`Supabase request failed (${response.status})`) };
    return { data: (await response.json()) as T, error: null };
  } catch (error) {
    return { data: null as T | null, error: error instanceof Error ? error : new Error("Supabase request failed") };
  }
}
