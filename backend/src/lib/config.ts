import fs from 'fs/promises';

export interface Config {
  redis: { host: string; port: number };
  server: { port: number; host: string };
  logLevel: string;
}

let cachedConfig: Config | null = null;

export async function loadConfig(): Promise<Config> {
  if (cachedConfig) {
    return cachedConfig; // TypeScript now knows cachedConfig is Config
  }
  const configPath = process.env.CONFIG_PATH || '/app/config/backend.json';
  const data = await fs.readFile(configPath, 'utf-8');
  const parsed: Config = JSON.parse(data);
  cachedConfig = parsed;
  return parsed;
}