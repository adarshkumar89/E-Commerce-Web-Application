const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');
const OpenAI = require('openai');
const tf = require('@tensorflow/tfjs');
const speech = require('@google-cloud/speech');
const vision = require('@google-cloud/vision');

// Initialize AI services
let openai = null;
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });
}

let speechClient = null;
let visionClient = null;

try {
  speechClient = new speech.SpeechClient();
  visionClient = new vision.ImageAnnotatorClient();
} catch (error) {
  console.warn('Warning: Google Cloud services not configured');
}

// Get personalized recommendations
exports.getRecommendations = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    // Get user's browsing history and past orders
    const pastOrders = await Order.find({ user: req.user.id })
      .populate('items.product')
      .sort({ createdAt: -1 })
      .limit(10);

    // Extract product categories and preferences
    const preferences = new Set();
    pastOrders.forEach(order => {
      order.items.forEach(item => {
        preferences.add(item.product.category);
      });
    });

    // Get recommended products based on preferences
    const recommendations = await Product.find({
      category: { $in: Array.from(preferences) }
    })
    .sort({ rating: -1 })
    .limit(8);

    res.json(recommendations);
  } catch (error) {
    console.error('Error getting recommendations:', error);
    res.status(500).json({ message: 'Error getting recommendations' });
  }
};

// Process voice search
exports.processVoiceSearch = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No audio file provided' });
    }

    // Convert audio to text using Google Speech-to-Text
    const [response] = await speechClient.recognize({
      audio: {
        content: req.file.buffer.toString('base64')
      },
      config: {
        encoding: 'LINEAR16',
        sampleRateHertz: 16000,
        languageCode: 'en-US'
      }
    });

    const transcription = response.results
      .map(result => result.alternatives[0].transcript)
      .join('\n');

    res.json({ text: transcription });
  } catch (error) {
    console.error('Error processing voice search:', error);
    res.status(500).json({ message: 'Error processing voice search' });
  }
};

// Process visual search
exports.processVisualSearch = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    // Analyze image using Google Cloud Vision
    const [result] = await visionClient.labelDetection(req.file.buffer);
    const labels = result.labelAnnotations.map(label => label.description);

    // Find similar products based on labels
    const similarProducts = await Product.find({
      $or: [
        { category: { $in: labels } },
        { tags: { $in: labels } }
      ]
    }).limit(8);

    res.json({ similarProducts });
  } catch (error) {
    console.error('Error processing visual search:', error);
    res.status(500).json({ message: 'Error processing visual search' });
  }
};

// Get size recommendations
exports.getSizeRecommendation = async (req, res) => {
  try {
    const { productId } = req.params;
    const user = await User.findById(req.user.id);
    
    // Get user's past orders with size information
    const pastOrders = await Order.find({
      user: req.user.id,
      'items.product': productId
    }).populate('items.product');

    // Analyze size patterns
    let recommendedSize = 'M'; // Default size
    if (pastOrders.length > 0) {
      const sizeCounts = {};
      pastOrders.forEach(order => {
        order.items.forEach(item => {
          if (item.size) {
            sizeCounts[item.size] = (sizeCounts[item.size] || 0) + 1;
          }
        });
      });

      // Get most frequently ordered size
      recommendedSize = Object.entries(sizeCounts)
        .sort((a, b) => b[1] - a[1])[0][0];
    }

    res.json({ recommendedSize });
  } catch (error) {
    console.error('Error getting size recommendation:', error);
    res.status(500).json({ message: 'Error getting size recommendation' });
  }
};

// Get recent orders for one-click reordering
exports.getRecentOrders = async (req, res) => {
  try {
    const recentOrders = await Order.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('items.product');

    res.json(recentOrders);
  } catch (error) {
    console.error('Error getting recent orders:', error);
    res.status(500).json({ message: 'Error getting recent orders' });
  }
}; 