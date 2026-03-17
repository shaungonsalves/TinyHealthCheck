export interface HealthStatus {
  url: string;
  up: boolean;
  latency: number | null;
  lastChecked: string;
}
