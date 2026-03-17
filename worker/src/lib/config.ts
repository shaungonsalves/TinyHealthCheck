import fs from 'fs/promises';

export interface WorkerConfig {
    redis: { host: string; port: number };
    checkInterval: number;      // in milliseconds
    maxReconnectAttempts: number; // for SSE? Not used in worker, but kept for consistency
    logLevel: string;
}

let cachedConfig: WorkerConfig | null = null;

export async function loadConfig(): Promise<WorkerConfig> {
    if (cachedConfig) {
        return cachedConfig;
    }
    const configPath = process.env.CONFIG_PATH || '/app/config/worker.json';
    const data = await fs.readFile(configPath, 'utf-8');
    const parsed: WorkerConfig = JSON.parse(data);
    cachedConfig = parsed;
    return parsed;
}