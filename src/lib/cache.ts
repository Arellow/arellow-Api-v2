import { redis } from "./redis";

export async function swrCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlSeconds = 60
): Promise<T> {
  const cached = await redis.get(key);

  if (cached) {
    // Serve stale data immediately
    const data = JSON.parse(cached) as T;

    // Revalidate in background (non-blocking)
    revalidate(key, fetcher, ttlSeconds);

    return data;
  }

  // If no cache, fetch fresh and store
  const fresh = await fetcher();
  await redis.set(key, JSON.stringify(fresh), "EX", ttlSeconds);
  return fresh;
}

async function revalidate<T>(key: string, fetcher: () => Promise<T>, ttl: number) {
  try {
    const fresh = await fetcher();
    await redis.set(key, JSON.stringify(fresh), "EX", ttl);
  } catch (err) {
    console.warn("Revalidation failed:", err);
  }
}



export function deleteMatchingKeys(pattern: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const stream = redis.scanStream({ match: `*${pattern}*` });
    const keys: string[] = [];

    stream.on('data', (batch: string[]) => {
      keys.push(...batch);
    });

    stream.on('end', async () => {
      try {
        if (keys.length) await redis.del(...keys);
        resolve();
      } catch (err) {
        reject(err);
      }
    });

    stream.on('error', reject);
  });
}
