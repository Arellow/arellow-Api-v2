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



export async function deleteMatchingKeys(pattern: string) {
  const stream = redis.scanStream({ match: pattern });
  const pipeline = redis.pipeline();

  stream.on('data', (keys: string[]) => {
    if (keys.length) {
      keys.forEach((key) => pipeline.del(key));
    }
  });

  stream.on('end', async () => {
    await pipeline.exec();
  });
}
