import type { Handler } from "@netlify/functions";
import path from "path";
import fs from "fs/promises";

// Enhanced logging utility
const log = (level: 'info' | 'warn' | 'error', message: string, data?: any) => {
  const timestamp = new Date().toISOString();
  const logEntry = { timestamp, level, message, ...(data && { data }) };
  console.log(JSON.stringify(logEntry));
};

// This corrected path works with Netlify's build process
const getContentPath = (...paths: string[]) => {
  return path.resolve(process.cwd(), 'content', 'knowledge-hub', ...paths);
};

// Validate slug format
function isValidSlug(slug: string): boolean {
  return /^[a-zA-Z0-9-_]+$/.test(slug) && slug.length <= 100;
}

export const handler: Handler = async (event) => {
  const requestId = Math.random().toString(36).substr(2, 9);
  log('info', 'Content request started', { requestId, method: event.httpMethod });

  try {
    const slug = event.queryStringParameters?.slug;
    
    if (slug) {
      // Validate slug
      if (!isValidSlug(slug)) {
        log('warn', 'Invalid slug format', { requestId, slug });
        return { 
          statusCode: 400, 
          body: JSON.stringify({ error: "Invalid slug format" }) 
        };
      }

      log('info', 'Loading specific content', { requestId, slug });

      try {
        const filePath = getContentPath(`${slug}.json`);
        const data = await fs.readFile(filePath, "utf-8");
        
        // Validate JSON
        const parsedData = JSON.parse(data);
        
        log('info', 'Content loaded successfully', { requestId, slug, size: data.length });

        return { 
          statusCode: 200, 
          headers: { 
            "Content-Type": "application/json",
            "Cache-Control": "public, max-age=3600" // Cache for 1 hour
          }, 
          body: data 
        };
      } catch (fileError: any) {
        if (fileError.code === 'ENOENT') {
          log('warn', 'Content file not found', { requestId, slug });
          return { 
            statusCode: 404, 
            body: JSON.stringify({ error: "Content not found" }) 
          };
        } else if (fileError instanceof SyntaxError) {
          log('error', 'Invalid JSON in content file', { requestId, slug, error: fileError.message });
          return { 
            statusCode: 500, 
            body: JSON.stringify({ error: "Content file corrupted" }) 
          };
        } else {
          throw fileError;
        }
      }
    } else {
      // Load manifest
      log('info', 'Loading content manifest', { requestId });

      try {
        const manifestPath = getContentPath('_manifest.json');
        const data = await fs.readFile(manifestPath, "utf-8");
        
        // Validate JSON
        const parsedData = JSON.parse(data);
        
        log('info', 'Manifest loaded successfully', { requestId, size: data.length });

        return { 
          statusCode: 200, 
          headers: { 
            "Content-Type": "application/json",
            "Cache-Control": "public, max-age=1800" // Cache for 30 minutes
          }, 
          body: data 
        };
      } catch (fileError: any) {
        if (fileError.code === 'ENOENT') {
          log('warn', 'Manifest file not found', { requestId });
          return { 
            statusCode: 404, 
            body: JSON.stringify({ error: "Content manifest not found" }) 
          };
        } else if (fileError instanceof SyntaxError) {
          log('error', 'Invalid JSON in manifest file', { requestId, error: fileError.message });
          return { 
            statusCode: 500, 
            body: JSON.stringify({ error: "Manifest file corrupted" }) 
          };
        } else {
          throw fileError;
        }
      }
    }
  } catch (error: any) {
    log('error', 'Content request failed', { 
      requestId, 
      error: error.message,
      stack: error.stack 
    });

    return { 
      statusCode: 500, 
      body: JSON.stringify({ error: "Could not load content file." }) 
    };
  }
};
