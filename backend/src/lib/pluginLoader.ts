import { readdir } from "fs/promises";
import path from "path";
import { pathToFileURL } from "url";
import type { FastifyInstance } from "fastify";

export async function loadRoutes(app: FastifyInstance, routesDir: string) {
  const fullPath = path.join(process.cwd(), "src", routesDir);
  const files = await readdir(fullPath);

  for (const file of files) {
    if (!file.endsWith(".ts") && !file.endsWith(".js")) continue;

    const fileUrl = pathToFileURL(path.join(fullPath, file)).href;
    const plugin = await import(fileUrl);

    // Use filename (without extension) as route prefix
    const prefix = "/" + file.replace(/\.(ts|js)$/, "");
    app.register(plugin.default, { prefix });
  }
}