import type { Handler } from "@netlify/functions";
import path from "path";
import fs from "fs/promises";

// Helper to safely construct file paths
const getContentPath = (...paths: string[]) => {
  return path.join(process.cwd(), 'content', 'knowledge-hub', ...paths);
};

export const handler: Handler = async (event) => {
  const slug = event.queryStringParameters?.slug;

  try {
    // If a slug is provided, fetch a single article
    if (slug) {
      const filePath = getContentPath(`${slug}.json`);
      const data = await fs.readFile(filePath, "utf-8");
      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: data,
      };
    }

    // Otherwise, fetch the list of all articles from the manifest
    const manifestPath = getContentPath('_manifest.json');
    const data = await fs.readFile(manifestPath, "utf-8");
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: data,
    };

  } catch (e: any) {
    console.error(e);
    return { statusCode: 500, body: JSON.stringify({ error: "Could not load content." }) };
  }
};
