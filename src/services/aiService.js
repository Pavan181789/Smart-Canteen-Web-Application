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

  // Try to find the best matching menu item in a question
  findBestMenuMatch: function(question, items) {
    const q = String(question || '').toLowerCase();
    // Tokenize and remove very short tokens
    const tokens = q.split(/[^a-z0-9]+/i).filter(t => t.length >= 3);
    let best = null;
    let bestScore = 0;
    items.forEach(it => {
      const name = String(it.itemName || '').toLowerCase();
      let score = 0;
      tokens.forEach(t => { if (name.includes(t)) score += 1; });
      // small bonus if all tokens appear in some order
      if (tokens.length && tokens.every(t => name.includes(t))) score += 0.5;
      if (score > bestScore) { bestScore = score; best = it; }
    });
    return bestScore >= 1 ? best : null; // require at least one token match
  },

  // Fetch structured nutrition and info for a specific food item
  getFoodInfo: async function(itemName) {
    try {
      const model = getModel();
      const prompt = `You are a nutrition assistant for a campus canteen. 
Provide detailed information about the food item "${itemName}" commonly served in Indian canteens.
Respond ONLY as compact JSON with the following exact schema (no markdown, no commentary):\n
{\n  "name": string,\n  "description": string,\n  "ingredients": string[],\n  "typical_serving_g": number,\n  "macros_per_100g": {\n    "calories_kcal": number,\n    "protein_g": number,\n    "carbs_g": number,\n    "fat_g": number,\n    "fiber_g": number,\n    "sugar_g": number\n  },\n  "benefits": string[],\n  "cautions": string[]\n}\n
Rules:\n- If there is variability, provide reasonable typical values.\n- Keep arrays to 3-7 concise items.\n- Do not include units inside numbers; keep keys self-descriptive.\n- If unknown, estimate based on the most common recipe.`;

      const result = await model.generateContent(prompt);
      let text = result.response.text() || '';
      // Strip code fences if any
      text = text.trim().replace(/^```(json)?/i, '').replace(/```$/i, '').trim();
      try {
        const data = JSON.parse(text);
        return { ok: true, data };
      } catch (e) {
        // Fallback to a friendly paragraph if JSON parsing fails
        const fallback = await this.generateResponse(`Give a concise nutrition overview of ${itemName} including ingredients, macros per 100g, benefits and cautions.`);
        return { ok: false, text: fallback };
      }
    } catch (error) {
      console.error('Error getting food info:', error);
      throw error;
    }
  },

  // ----------------- Helpers: parsing and menu answers -----------------
  parseQuery: function(text) {
    const s = String(text || '').toLowerCase();
    // Use regex word-boundary matching to avoid matching 'ice' in 'rice'
    const sectionPatterns = [
      { re: /\b(tiffin|breakfast)\b/i, val: 'Tiffin' },
      { re: /\blunch\b/i, val: 'Lunch' },
      { re: /\bsnacks?\b/i, val: 'Snacks' },
      { re: /\bdinner\b/i, val: 'Dinner' },
      { re: /\bjuices?\b/i, val: 'Juices' },
      { re: /\bice\s*cream\b/i, val: 'Ice Cream' },
    ];
    let section = null;
    for (const p of sectionPatterns) { if (p.re.test(s)) { section = p.val; break; } }

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
      if (nonVegFiltered.length === 0) {
        const re = /(chicken|egg|mutton|beef|fish|prawn|prawns|shrimp|meat|keema|tandoori|grill|kebab|boti)/i;
        nonVegFiltered = filtered.filter(i => re.test(String(i.itemName || '')));
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

    // Group by sections in fixed order
    const ORDER = ['Tiffin', 'Lunch', 'Snacks', 'Dinner', 'Ice Cream', 'Juices'];
    const grouped = ORDER.map(section => ({
      section,
      items: filtered.filter(i => i.category === section)
    }));

    let header = 'Here are items from the menu';
    if (intent.section) header += ` in ${intent.section}`;
    if (intent.maxPrice != null) header += ` under ₹${intent.maxPrice}`;
    if (intent.minPrice != null) header += ` above ₹${intent.minPrice}`;
    if (intent.vegMode) header += ` (${intent.vegMode})`;

    const lines = [header + ':'];
    grouped.forEach(group => {
      lines.push(`\nItems in ${group.section}`);
      if (group.items.length === 0) {
        lines.push('- None found');
      } else {
        group.items.forEach(i => {
          const vegTag = i.veg === 'veg' ? 'veg' : 'non-veg';
          lines.push(`- ${i.itemName} — ₹${i.cost} (${vegTag})`);
        });
      }
    });

    return lines.join('\n');
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
      const qLower = String(question || '').toLowerCase();
      // Hard-coded canteen hours intents
      if (/\bwhen\s+does\s+the\s+canteen\s+close\b|\bclosing\s*time\b|\bwhat\s*time\s+do\s+you\s+close\b/i.test(qLower)) {
        return 'The canteen closes at 9:00 PM (21:00).';
      }
      if (/\bwhen\s+does\s+the\s+canteen\s+open\b|\bopening\s*time\b|\bwhat\s*time\s+do\s+you\s+open\b/i.test(qLower)) {
        return 'The canteen opens at 8:00 AM.';
      }

      // Item price lookup like: "paneer fried rice cost/price"
      if (/\b(cost|price|rate)\b/i.test(qLower)) {
        const items = await this.loadMenu();
        const match = this.findBestMenuMatch(qLower, items);
        if (match) {
          const vegTag = match.veg === 'veg' ? 'veg' : 'non-veg';
          return `${match.itemName} costs ₹${match.cost} (${vegTag}) [${match.category}].`;
        }
        // fallthrough to normal handling if no match
      }

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
