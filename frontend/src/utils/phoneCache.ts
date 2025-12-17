const CACHE_KEY = 'farmer_phone_cache';
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

interface PhoneCache {
  phone: string;
  timestamp: number;
}

export const getCachedPhone = (): string | null => {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;

    const data: PhoneCache = JSON.parse(cached);
    const now = Date.now();
    
    // check if the cache is expired
    if (now - data.timestamp > CACHE_DURATION) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }

    return data.phone;
  } catch (error) {
    console.error('Error reading phone cache:', error);
    return null;
  }
};

export const setCachedPhone = (phone: string): void => {
  try {
    const data: PhoneCache = {
      phone,
      timestamp: Date.now(),
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving phone cache:', error);
  }
};

export const clearCachedPhone = (): void => {
  try {
    localStorage.removeItem(CACHE_KEY);
  } catch (error) {
    console.error('Error clearing phone cache:', error);
  }
};
