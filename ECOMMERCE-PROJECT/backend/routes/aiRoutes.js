const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const auth = require('../middleware/auth');
const { apiLimiter, aiFeatureLimiter, voiceSearchLimiter } = require('../middleware/rateLimiter');
const { cache, CACHE_DURATIONS } = require('../middleware/cache');
const {
  getRecommendations,
  processVoiceSearch,
  processVisualSearch,
  getSizeRecommendation,
  getRecentOrders
} = require('../controllers/aiController');

// Apply general rate limiting to all routes
router.use(apiLimiter);

// Get personalized recommendations
router.get('/recommendations', 
  auth, 
  aiFeatureLimiter,
  cache(CACHE_DURATIONS.RECOMMENDATIONS),
  getRecommendations
);

// Process voice search
router.post('/voice-search', 
  auth, 
  voiceSearchLimiter,
  upload.single('audio'), 
  processVoiceSearch
);

// Process visual search
router.post('/visual-search', 
  auth, 
  aiFeatureLimiter,
  upload.single('image'), 
  processVisualSearch
);

// Get size recommendations
router.get('/size-recommendation/:productId', 
  auth, 
  aiFeatureLimiter,
  cache(CACHE_DURATIONS.SIZE_RECOMMENDATIONS),
  getSizeRecommendation
);

// Get recent orders for one-click reordering
router.get('/orders/recent', 
  auth, 
  cache(CACHE_DURATIONS.RECENT_ORDERS),
  getRecentOrders
);

module.exports = router; 