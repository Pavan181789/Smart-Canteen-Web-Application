// Fallback AI service for when App Check fails
// Provides basic responses without requiring AI API calls

export const fallbackAI = {
  // Basic food information database
  foodDatabase: {
    'chicken puff': {
      name: 'Chicken Puff',
      description: 'Flaky pastry filled with spiced chicken mixture',
      ingredients: ['puff pastry', 'chicken', 'onions', 'spices', 'herbs'],
      typical_serving_g: 120,
      macros_per_100g: {
        calories_kcal: 280,
        protein_g: 12,
        carbs_g: 22,
        fat_g: 16,
        fiber_g: 1,
        sugar_g: 2
      },
      benefits: ['Good protein source', 'Satisfying snack'],
      cautions: ['High in calories', 'Contains refined flour']
    },
    'idly': {
      name: 'Idly',
      description: 'Steamed rice and lentil cake, a traditional South Indian breakfast',
      ingredients: ['rice', 'urad dal', 'fermentation culture', 'water'],
      typical_serving_g: 100,
      macros_per_100g: {
        calories_kcal: 120,
        protein_g: 4,
        carbs_g: 25,
        fat_g: 0.5,
        fiber_g: 2,
        sugar_g: 0
      },
      benefits: ['Light and easily digestible', 'Fermented food', 'Low fat'],
      cautions: ['High in carbohydrates']
    },
    'coffee': {
      name: 'Coffee',
      description: 'Brewed coffee beverage',
      ingredients: ['coffee beans', 'water', 'milk (optional)', 'sugar (optional)'],
      typical_serving_g: 240,
      macros_per_100g: {
        calories_kcal: 5,
        protein_g: 0.3,
        carbs_g: 1,
        fat_g: 0.1,
        fiber_g: 0,
        sugar_g: 0
      },
      benefits: ['Boosts energy', 'Contains antioxidants'],
      cautions: ['Contains caffeine', 'May cause sleep issues if consumed late']
    },
    'egg puff': {
      name: 'Egg Puff',
      description: 'Flaky pastry filled with spiced egg mixture',
      ingredients: ['puff pastry', 'egg', 'onions', 'spices', 'herbs'],
      typical_serving_g: 110,
      macros_per_100g: {
        calories_kcal: 250,
        protein_g: 8,
        carbs_g: 20,
        fat_g: 14,
        fiber_g: 1,
        sugar_g: 2
      },
      benefits: ['Good protein source', 'Satisfying snack'],
      cautions: ['High in calories', 'Contains refined flour']
    }
  },

  // Get food info from database
  getFoodInfo: function(itemName) {
    const key = itemName.toLowerCase();
    const food = this.foodDatabase[key];
    
    if (food) {
      return { ok: true, data: food };
    }
    
    // Return a generic response if not found
    return { 
      ok: false, 
      text: `I don't have detailed nutrition information for "${itemName}" available right now. Please ask our staff at the counter for more details.` 
    };
  },

  // Generate basic responses
  generateResponse: function(prompt) {
    const lowerPrompt = prompt.toLowerCase();
    
    // Canteen hours
    if (lowerPrompt.includes('when') && lowerPrompt.includes('close')) {
      return 'The canteen closes at 9:00 PM (21:00).';
    }
    if (lowerPrompt.includes('when') && lowerPrompt.includes('open')) {
      return 'The canteen opens at 8:00 AM.';
    }
    
    // Generic helpful responses
    if (lowerPrompt.includes('hello') || lowerPrompt.includes('hi')) {
      return 'Hello! I\'m here to help you with our canteen menu and services. How can I assist you today?';
    }
    
    if (lowerPrompt.includes('thank')) {
      return 'You\'re welcome! Enjoy your meal!';
    }
    
    // Default fallback
    return 'I apologize, but the AI service is temporarily unavailable. Please ask our staff at the counter for assistance with your request.';
  },

  // Handle inquiries with fallback
  handleInquiry: async function(question) {
    try {
      // Try the basic response first
      const response = this.generateResponse(question);
      return response;
    } catch (error) {
      console.error('Fallback AI error:', error);
      return 'I apologize, but I\'m having trouble processing your request. Please ask our staff at the counter for assistance.';
    }
  }
};

export default fallbackAI;
