type SupabaseConfig = {
  url: string;
  key: string;
};

export type SupabaseResponse<T> = {
  data: T | null;
  error: Error | null;
};

export type SupabaseQuery = {
  select?: string;
  filters?: Record<string, string | number | boolean | null | undefined>;
  order?: string;
  limit?: number;
  single?: boolean;
};

function getConfig(): SupabaseConfig | null {
  if (typeof window !== "undefined") return null;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = (process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)?.trim();

  if (!url || !key) return null;
  return { url: url.replace(/\/$/, ""), key };
}

export function isSupabaseServerConfigured(): boolean {
  return getConfig() !== null;
}

export function createServerSupabaseClient() {
  const config = getConfig();

  async function request<T>(path: string, init: RequestInit = {}): Promise<SupabaseResponse<T>> {
    if (!config) {
      return { data: null, error: new Error("Supabase is not configured") };
    }

    try {
      const response = await fetch(`${config.url}/rest/v1/${path}`, {
        ...init,
        headers: {
          apikey: config.key,
          Authorization: `Bearer ${config.key}`,
          "Content-Type": "application/json",
          ...(init.headers ?? {}),
        },
        cache: "no-store",
      });

      if (!response.ok) {
        const detail = await response.text();
        return { data: null, error: new Error(`Supabase request failed (${response.status}): ${detail}`) };
      }

      if (response.status === 204) return { data: null, error: null };
      return { data: (await response.json()) as T, error: null };
    } catch (error) {
      return { data: null, error: error instanceof Error ? error : new Error("Supabase request failed") };
    }
  }

  function buildQuery(query: SupabaseQuery = {}) {
    const params = new URLSearchParams({ select: query.select ?? "*" });
    Object.entries(query.filters ?? {}).forEach(([column, value]) => {
      if (value !== undefined) params.set(column, `eq.${value ?? "null"}`);
    });
    if (query.order) params.set("order", query.order);
    if (query.limit) params.set("limit", String(query.limit));
    return params.toString();
  }

  return {
    isConfigured: config !== null,
    from<T>(table: string) {
      return {
        select: (query?: SupabaseQuery) =>
          request<T[]>(`${table}?${buildQuery(query)}`, { headers: { Prefer: query?.single ? "return=representation" : "" } }),
        insert: (value: Partial<T>) =>
          request<T[]>(table, {
            method: "POST",
            headers: { Prefer: "return=representation" },
            body: JSON.stringify(value),
          }),
        update: (value: Partial<T>, filters: Record<string, string>) =>
          request<T[]>(`${table}?${new URLSearchParams(Object.entries(filters).map(([key, item]) => [key, `eq.${item}`]))}`, {
            method: "PATCH",
            headers: { Prefer: "return=representation" },
            body: JSON.stringify(value),
          }),
      };
    },
  };
}
