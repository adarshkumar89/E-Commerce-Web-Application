const Redis = require('ioredis');
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

// Cache durations in seconds
const CACHE_DURATIONS = {
  RECOMMENDATIONS: 3600, // 1 hour
  SIZE_RECOMMENDATIONS: 86400, // 24 hours
  RECENT_ORDERS: 300 // 5 minutes
};

const cache = (duration) => {
  return async (req, res, next) => {
    if (req.method !== 'GET') {
      return next();
    }

    const key = `cache:${req.originalUrl || req.url}`;

    try {
      const cachedResponse = await redis.get(key);
      
      if (cachedResponse) {
        return res.json(JSON.parse(cachedResponse));
      }

      // Store the original res.json method
      const originalJson = res.json;

      // Override res.json method
      res.json = function(body) {
        redis.setex(key, duration, JSON.stringify(body));
        return originalJson.call(this, body);
      };

      next();
    } catch (error) {
      console.error('Cache error:', error);
      next();
    }
  };
};

module.exports = {
  cache,
  CACHE_DURATIONS
}; 