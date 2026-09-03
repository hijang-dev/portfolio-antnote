import { apiFetch } from './client';

export interface HealthResponse {
  status: string;
  database: string;
  timestamp: string;
}

export function getHealth() {
  return apiFetch<HealthResponse>('/health');
}
