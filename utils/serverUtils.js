// Add caching for processed images
const processedImageCache = new Map();

const cache = new Map()

export async function validateAndProcessFile(file) {
  const cacheKey = file.name + file.size;
  if (processedImageCache.has(cacheKey)) {
    return processedImageCache.get(cacheKey);
  }
  // ... existing processing code
  processedImageCache.set(cacheKey, result);
  return result;
}

export async function fetchWithCache(key, fetcher) {
  if (cache.has(key)) {
    return cache.get(key)
  }

  const data = await fetcher()
  cache.set(key, data)
  return data
} 