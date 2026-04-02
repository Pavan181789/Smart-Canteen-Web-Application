// Debug script for Firebase App Check issues
// Run this in your browser console to troubleshoot App Check

async function debugAppCheck() {
  console.log('🔍 Debugging Firebase App Check...');
  
  try {
    // Check if Firebase is initialized
    if (!window.firebase || !window.firebase.apps) {
      console.error('❌ Firebase not initialized');
      return;
    }
    
    console.log('✅ Firebase initialized');
    
    // Check App Check
    const { appCheck } = await import('./src/firebase.js');
    console.log('✅ App Check imported');
    
    // Try to get a token
    const token = await appCheck.getToken();
    console.log('✅ App Check token obtained:', token.token.substring(0, 20) + '...');
    
    // Test the token by making a simple API call
    const response = await fetch('https://firebasevertexai.googleapis.com/v1beta/projects/my-amrita-eec28/models/gemini-2.5-flash:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Firebase-App-Check-Token': token.token,
      },
      body: JSON.stringify({
        contents: [{
          role: 'user',
          parts: [{ text: 'Hello, test message' }]
        }]
      })
    });
    
    if (response.ok) {
      console.log('✅ API call successful');
    } else {
      console.error('❌ API call failed:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('Error details:', errorText);
    }
    
  } catch (error) {
    console.error('❌ Debug failed:', error);
  }
}

// Auto-run if in browser
if (typeof window !== 'undefined') {
  window.debugAppCheck = debugAppCheck;
  console.log('🔧 Debug function loaded. Run debugAppCheck() in console to test.');
}

export { debugAppCheck };
