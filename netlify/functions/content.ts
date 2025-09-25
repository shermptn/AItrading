import type { Handler } from "@netlify/functions";
import path from "path";
import fs from "fs/promises";

// This corrected path works with Netlify's build process
const getContentPath = (...paths: string[]) => {
  return path.resolve(process.cwd(), 'content', 'knowledge-hub', ...paths);
};

export const handler: Handler = async (event) => {
  const slug = event.queryStringParameters?.slug;

  try {
    if (slug) {
      const filePath = getContentPath(`${slug}.json`);
      const data = await fs.readFile(filePath, "utf-8");
      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: data,
      };
    }

    const manifestPath = getContentPath('_manifest.json');
    const data = await fs.readFile(manifestPath, "utf-8");
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: data,
    };

  } catch (e: any) {
    console.error("Failed to read content file:", e.message);
    return { 
      statusCode: 500, 
      body: JSON.stringify({ error: "Could not load content from path." }) 
    };
  }
};
