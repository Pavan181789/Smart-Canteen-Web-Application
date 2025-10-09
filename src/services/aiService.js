import { collection, addDoc, serverTimestamp, getDocs, query, where } from 'firebase/firestore';
import { auth, db, app } from '../firebase';
import { getAI, getGenerativeModel, GoogleAIBackend } from 'firebase/ai';

// Initialize Gemini Developer API (client-side via Firebase AI Logic)
let _model;
function getModel() {
  if (!_model) {
    const ai = getAI(app, { backend: new GoogleAIBackend() });
    _model = getGenerativeModel(ai, { model: 'gemini-2.5-flash' });
  }
  return _model;
}

// AI Service for handling chat with Gemini 2.5
export const aiService = {
  // Context memory for the conversation (last 3 messages)
  conversationContext: [],
  // Cache menu in-memory to avoid repeated reads
  menuCache: null,
  
  // Add a message to the conversation context
  addToContext: function(role, content) {
    this.conversationContext.push({ role, content });
    // Keep only the last 3 messages for context
    if (this.conversationContext.length > 3) {
      this.conversationContext.shift();
    }
  },

  // ----------------- Helpers: parsing and menu answers -----------------
  parseQuery: function(text) {
    const s = String(text || '').toLowerCase();
    const sectionMap = {
      tiffin: 'Tiffin',
      breakfast: 'Tiffin',
      lunch: 'Lunch',
      snacks: 'Snacks',
      dinner: 'Dinner',
      juice: 'Juices',
      juices: 'Juices',
      'ice cream': 'Ice Cream',
      ice: 'Ice Cream',
      cream: 'Ice Cream',
    };
    let section = null;
    for (const key of Object.keys(sectionMap)) {
      if (s.includes(key)) { section = sectionMap[key]; break; }
    }

    // Prices: under/below/less than/<=, above/>=/greater than, between A and B
    let maxPrice = null, minPrice = null;
    const between = s.match(/between\s*₹?\s*(\d+)\s*(?:and|to|-)\s*₹?\s*(\d+)/i);
    if (between) {
      minPrice = parseInt(between[1], 10);
      maxPrice = parseInt(between[2], 10);
    } else {
      const under = s.match(/(?:under|below|less than|<=)\s*₹?\s*(\d+)/i);
      if (under) maxPrice = parseInt(under[1], 10);
      const above = s.match(/(?:above|over|greater than|>=)\s*₹?\s*(\d+)/i);
      if (above) minPrice = parseInt(above[1], 10);
    }

    // Veg / Non-veg
    let vegMode = null; // 'veg' | 'nonveg'
    if (/\bveg\b/i.test(s) && !/non\s*-?veg/i.test(s)) vegMode = 'veg';
    if (/non\s*-?veg|chicken|mutton|fish|egg\b/i.test(s)) vegMode = vegMode || 'nonveg';

    const hasFilter = Boolean(section || maxPrice != null || minPrice != null || vegMode);
    return { section, maxPrice, minPrice, vegMode, hasFilter };
  },

  dispatchSection: function(section) {
    try { window.dispatchEvent(new CustomEvent('setMenuSection', { detail: section })); } catch (e) {}
  },
  dispatchVegMode: function(mode) {
    try { window.dispatchEvent(new CustomEvent('setVegMode', { detail: mode })); } catch (e) {}
  },

  classifyVeg: function(name) {
    const n = String(name || '').toLowerCase();
    const nonVegHints = [
      'chicken','egg','mutton','beef','fish','prawn','prawns','shrimp','meat',
      'keema','tandoori','grill','pepper chicken','fried chicken','boti','kebab','kebabs'
    ];
    if (nonVegHints.some(h => n.includes(h))) return 'nonveg';
    return 'veg';
  },

  loadMenu: async function() {
    if (this.menuCache) return this.menuCache;
    const snap = await getDocs(collection(db, 'menu'));
    const items = [];
    snap.forEach(d => {
      items.push({
        id: d.id,
        itemName: d.get('itemName'),
        cost: Number(d.get('cost')),
        thumbnail: d.get('thumbnail'),
        category: d.get('category'),
        veg: d.get('veg') ?? this.classifyVeg(d.get('itemName')),
      });
    });
    this.menuCache = items;
    return items;
  },

  answerFromMenu: async function(intent) {
    const items = await this.loadMenu();
    let filtered = items;
    if (intent.section) filtered = filtered.filter(i => i.category === intent.section);
    if (intent.vegMode === 'veg') filtered = filtered.filter(i => i.veg === 'veg');
    if (intent.vegMode === 'nonveg') {
      let nonVegFiltered = filtered.filter(i => i.veg === 'nonveg');
      // If nothing matched due to missing hints, try a looser name-based match
      if (nonVegFiltered.length === 0) {
        const re = /(chicken|egg|mutton|beef|fish|prawn|prawns|shrimp|meat|keema|tandoori|grill|kebab|boti)/i;
        nonVegFiltered = filtered.filter(i => re.test(String(i.itemName||'')));
      }
      filtered = nonVegFiltered;
    }
    if (intent.minPrice != null) filtered = filtered.filter(i => i.cost >= intent.minPrice);
    if (intent.maxPrice != null) filtered = filtered.filter(i => i.cost <= intent.maxPrice);

    // Personalized weighting using past orders
    const ranking = await this.getPersonalizedRanking(auth.currentUser?.uid);
    filtered = filtered.sort((a, b) => (ranking[b.itemName] || 0) - (ranking[a.itemName] || 0));

    if (filtered.length === 0) {
      return 'I could not find matching items. Try changing the section, price range, or veg mode.';
    }

    const top = filtered.slice(0, 12);
    const bullets = top.map(i => `• ${i.itemName} — ₹${i.cost}${i.veg === 'veg' ? ' (veg)' : ' (non-veg)'} [${i.category}]`).join('\n');
    let header = 'Here are items from the menu';
    if (intent.section) header += ` in ${intent.section}`;
    if (intent.maxPrice != null) header += ` under ₹${intent.maxPrice}`;
    if (intent.minPrice != null) header += ` above ₹${intent.minPrice}`;
    if (intent.vegMode) header += ` (${intent.vegMode})`;
    return `${header}:\n${bullets}`;
  },

  getPersonalizedRanking: async function(uid) {
    try {
      if (!uid) return {};
      const qSnap = await getDocs(query(collection(db, 'orders'), where('uid', '==', uid)));
      const counts = {};
      qSnap.forEach(d => {
        const arr = d.get('orders') || [];
        arr.forEach(item => {
          const name = item?.itemName;
          if (!name) return;
          counts[name] = (counts[name] || 0) + (Number(item?.count) || 1);
        });
      });
      return counts;
    } catch (e) {
      console.warn('personalized ranking error', e);
      return {};
    }
  },
  
  // Get meal recommendations
  getMealRecommendation: async function(preferences) {
    try {
      const prompt = `You are a helpful canteen assistant. 
        Based on the following preferences: ${JSON.stringify(preferences)},
        suggest suitable meal options from our menu. 
        Keep the response concise and friendly.`;
      
      return await this.generateResponse(prompt);
    } catch (error) {
      console.error('Error getting meal recommendation:', error);
      throw error;
    }
  },
  
  // Handle general inquiries
  handleInquiry: async function(question) {
    try {
      // First, try to parse structured filters from the question
      const intent = this.parseQuery(question);
      if (intent.hasFilter) {
        // Answer directly from the Firestore menu
        const text = await this.answerFromMenu(intent);
        // Optionally inform UI to switch section or veg mode
        if (intent.section) this.dispatchSection(intent.section);
        if (intent.vegMode) this.dispatchVegMode(intent.vegMode);
        return text;
      }

      // Otherwise, delegate to the LLM
      const prompt = `You are a helpful canteen assistant.\n` +
        `Answer the following question about our canteen: "${question}"\n` +
        `Keep the response concise and friendly.`;
      return await this.generateResponse(prompt);
    } catch (error) {
      console.error('Error handling inquiry:', error);
      throw error;
    }
  },
  
  // Generate response using Gemini Developer API (client SDK)
  generateResponse: async function(prompt) {
    try {
      // Add the user's prompt to context
      this.addToContext('user', prompt);
      
      // Prepare the full prompt with conversation context
      const contextPrompt = this.conversationContext
        .map(msg => `${msg.role}: ${msg.content}`)
        .join('\n');
      const model = getModel();
      const result = await model.generateContent(contextPrompt);
      const response = result.response.text();
      
      // Add the AI's response to context
      this.addToContext('assistant', response);
      
      // Log the interaction to Firestore
      if (auth.currentUser) {
        await this.logInteraction(prompt, response);
      }
      
      return response;
    } catch (error) {
      console.error('Error generating AI response:', error);
      throw error;
    }
  },
  
  // Log interaction to Firestore
  logInteraction: async function(question, response) {
    try {
      await addDoc(collection(db, 'ai_chats'), {
        userId: auth.currentUser.uid,
        question,
        response,
        timestamp: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error logging interaction:', error);
      // Don't throw to avoid blocking the main flow
    }
  },
  
  // Clear conversation context
  clearContext: function() {
    this.conversationContext = [];
  }
};

export default aiService;
