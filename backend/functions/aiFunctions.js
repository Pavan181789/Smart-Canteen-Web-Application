const functions = require('firebase-functions');
const { VertexAI } = require('@google-cloud/vertexai');
const admin = require('firebase-admin');

// Initialize Vertex AI
const vertexAiOptions = {
  projectId: 'my-amrita-eec28', // Your Firebase project ID
  location: 'us-central1', // Or your preferred region
};

const vertexAi = new VertexAI(vertexAiOptions);
// Use a valid public Gemini model id
// Popular options: 'gemini-2.5-flash', 'gemini-1.5-flash', 'gemini-1.5-pro'
const model = 'gemini-2.5-flash';

// Cloud Function to generate text using Gemini 2.5
exports.generateText = functions.https.onCall(async (data, context) => {
  // Verify the request is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'You must be logged in to use this feature.'
    );
  }

  // Enforce Firebase App Check (context.app exists only if App Check passed)
  if (!context.app) {
    throw new functions.https.HttpsError(
      'failed-precondition',
      'App Check token is missing or invalid.'
    );
  }

  const { prompt, intent, preferences, maxOutputTokens = 1024, temperature = 0.7 } = data || {};

  // Build a richer prompt when intent/preferences provided
  const baseSystem = [
    'You are a helpful canteen assistant for a college canteen in India.',
    'Keep responses concise, friendly, and actionable.',
    'Prices are in INR. If budget provided, respect it.',
    'If asked for timings, answer: Breakfast 8–10:30, Lunch 12–3, Snacks 4–6:30, Dinner 7–9 (customize if different).',
    'If complaint/issue is mentioned, apologize briefly and instruct how to reach staff: "Please share your order ID and issue. We have notified staff; you can also visit the counter."',
  ].join('\n');

  let finalPrompt = prompt;
  if (!finalPrompt && intent) {
    // Map common intents
    switch (intent) {
      case 'special_today':
        finalPrompt = 'What is the special today?';
        break;
      case 'veg_combo_under_budget':
        finalPrompt = `Suggest a veg combo under ₹${preferences?.budget || 100}.`;
        break;
      case 'opening_hours':
        finalPrompt = 'When does the canteen open?';
        break;
      case 'complaint':
        finalPrompt = 'I had an issue with my order';
        break;
      default:
        finalPrompt = 'Help the user with canteen information.';
    }
  }

  const wrappedPrompt = [
    baseSystem,
    preferences ? `User preferences: ${JSON.stringify(preferences)}` : null,
    `User: ${finalPrompt}`,
    'Assistant:',
  ].filter(Boolean).join('\n\n');

  try {
    // Initialize the Gemini model
    const generativeModel = vertexAi.preview.getGenerativeModel({
      model: `projects/${vertexAiOptions.projectId}/locations/${vertexAiOptions.location}/publishers/google/models/${model}`,
      generationConfig: {
        maxOutputTokens,
        temperature,
      },
    });

    // Generate content
    const result = await generativeModel.generateContent({
      contents: [
        {
          role: 'user',
          parts: [{ text: wrappedPrompt }],
        },
      ],
    });

    // Extract and return the generated text
    const response = result.response;
    return { text: response.text() };
  } catch (error) {
    console.error('Error generating text:', {
      message: error?.message,
      code: error?.code,
      name: error?.name,
      stack: error?.stack,
    });
    throw new functions.https.HttpsError(
      'internal',
      'Failed to generate text',
      error.message
    );
  }
});
