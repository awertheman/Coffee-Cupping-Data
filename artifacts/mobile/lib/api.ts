const DOMAIN = process.env.EXPO_PUBLIC_DOMAIN ?? "";
const BASE_URL = DOMAIN ? `https://${DOMAIN}/api` : "/api";

export interface ScoreAttribute {
  score: number;
  intensity?: number;
  notes?: string;
}

export interface BooleanAttribute {
  score: number;
  notes?: string;
}

export interface Defects {
  taints?: number;
  faults?: number;
  notes?: string;
}

export interface CuppingSession {
  id: number;
  sampleId: string;
  origin?: string;
  variety?: string;
  process?: string;
  roastDate?: string;
  roastLevel?: string;
  cuppingDate?: string;
  cupperName?: string;
  fragranceAroma?: ScoreAttribute;
  flavor?: ScoreAttribute;
  aftertaste?: ScoreAttribute;
  acidity?: ScoreAttribute;
  body?: ScoreAttribute;
  balance?: ScoreAttribute;
  uniformity?: BooleanAttribute;
  cleanCup?: BooleanAttribute;
  sweetness?: BooleanAttribute;
  overall?: ScoreAttribute;
  defects?: Defects;
  finalScore?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type CreateCuppingSession = Omit<CuppingSession, "id" | "createdAt" | "updatedAt">;

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  listCuppings: () => request<CuppingSession[]>("/cuppings"),
  getCupping: (id: number) => request<CuppingSession>(`/cuppings/${id}`),
  createCupping: (data: CreateCuppingSession) =>
    request<CuppingSession>("/cuppings", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateCupping: (id: number, data: CreateCuppingSession) =>
    request<CuppingSession>(`/cuppings/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  deleteCupping: (id: number) =>
    request<void>(`/cuppings/${id}`, { method: "DELETE" }),
};
