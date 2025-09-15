// Simple client-side cache for API responses
interface CacheEntry {
  data: any;
  timestamp: number;
  expires: number;
}

class SimpleCache {
  private cache = new Map<string, CacheEntry>();
  private defaultTTL = 5 * 60 * 1000; // 5 minutes

  set(key: string, data: any, ttl?: number): void {
    const now = Date.now();
    const entry: CacheEntry = {
      data,
      timestamp: now,
      expires: now + (ttl || this.defaultTTL)
    };
    this.cache.set(key, entry);
  }

  get(key: string): any | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const now = Date.now();
    if (now > entry.expires) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    const now = Date.now();
    if (now > entry.expires) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  clear(): void {
    this.cache.clear();
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clearExpired(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expires) {
        this.cache.delete(key);
      }
    }
  }

  size(): number {
    this.clearExpired();
    return this.cache.size;
  }
}

export const apiCache = new SimpleCache();

// Cache keys
export const CACHE_KEYS = {
  INSTITUTES_DETAILED: 'institutes_detailed',
  INSTITUTES: 'institutes',
  THERAPISTS: (instituteId: string) => `therapists_${instituteId}`,
  REVIEWS: (instituteId: string) => `reviews_${instituteId}`,
  BUSINESS_HOURS: (instituteId: string) => `business_hours_${instituteId}`,
};

// Helper function to wrap API calls with caching
export function withCache<T>(
  key: string,
  apiCall: () => Promise<T>,
  ttl?: number
): Promise<T> {
  return new Promise(async (resolve, reject) => {
    try {
      // Check cache first
      const cached = apiCache.get(key);
      if (cached) {
        resolve(cached);
        return;
      }

      // Call API and cache result
      const result = await apiCall();
      apiCache.set(key, result, ttl);
      resolve(result);
    } catch (error) {
      reject(error);
    }
  });
}

// Helper function to invalidate cache keys
export function invalidateCache(keys: string | string[]): void {
  const keysToInvalidate = Array.isArray(keys) ? keys : [keys];
  keysToInvalidate.forEach(key => apiCache.delete(key));
}

// Helper function to clear all cache (useful for testing)
export function clearAllCache(): void {
  apiCache.clear();
}
