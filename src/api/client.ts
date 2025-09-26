interface RequestConfig {
  maxRetries?: number;
  retryDelay?: number;
  timeout?: number;
}

const DEFAULT_CONFIG: Required<RequestConfig> = {
  maxRetries: 3,
  retryDelay: 1000,
  timeout: 30000,
};

// Helper to implement exponential backoff
function getRetryDelay(attempt: number, baseDelay: number): number {
  return baseDelay * Math.pow(2, attempt) + Math.random() * 1000;
}

// Helper to check if an error is retryable
function isRetryableError(status: number): boolean {
  return status >= 500 || status === 408 || status === 429;
}

// Generic request helper with retry logic
async function makeRequest<T>(
  url: string,
  options: RequestInit,
  config: RequestConfig = {}
): Promise<T> {
  const { maxRetries, retryDelay, timeout } = { ...DEFAULT_CONFIG, ...config };
  let lastError: Error;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const res = await fetch(url, {
        ...options,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        const errorBody = await res.json().catch(() => ({ 
          error: "An unknown error occurred" 
        }));
        
        const error = new Error(errorBody.error || `HTTP ${res.status}: ${res.statusText}`);
        
        // Log error details
        console.error(`[API ERROR] ${options.method || 'GET'} ${url}:`, {
          status: res.status,
          error: errorBody.error,
          attempt: attempt + 1,
          maxRetries: maxRetries + 1,
        });

        // Don't retry on client errors (4xx) except for specific cases
        if (!isRetryableError(res.status) || attempt === maxRetries) {
          throw error;
        }

        lastError = error;
        await new Promise(resolve => setTimeout(resolve, getRetryDelay(attempt, retryDelay)));
        continue;
      }

      return res.json() as Promise<T>;
    } catch (error) {
      if (error instanceof Error) {
        // Handle network errors, timeouts, etc.
        if (error.name === 'AbortError') {
          lastError = new Error(`Request timeout after ${timeout}ms`);
        } else {
          lastError = error;
        }

        console.error(`[API ERROR] ${options.method || 'GET'} ${url}:`, {
          error: error.message,
          attempt: attempt + 1,
          maxRetries: maxRetries + 1,
        });

        // Retry on network errors unless it's the last attempt
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, getRetryDelay(attempt, retryDelay)));
          continue;
        }
      }
      throw lastError || error;
    }
  }

  throw lastError;
}

// Generic GET request helper
export async function apiGet<T>(
  path: string, 
  params?: Record<string, string>,
  config?: RequestConfig
): Promise<T> {
  const qs = params ? "?" + new URLSearchParams(params).toString() : "";
  return makeRequest<T>(`/api/${path}${qs}`, { method: "GET" }, config);
}

// Generic POST request helper
export async function apiPost<T>(
  path: string, 
  body: any,
  config?: RequestConfig
): Promise<T> {
  return makeRequest<T>(`/api/${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }, config);
}
