const asyncHandler = require('express-async-handler');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const SYSTEM_INSTRUCTION = `You are the official AI Student Assistant for Gamtaa Barattoota Shanan Gibee (GBSG) — Shanan Gibe Student Union at Jimma University (JU).

Your core mission:
1. Provide accurate, uplifting, and helpful guidance to university students.
2. Support students with academic questions, study strategies, past exams location (under /resources), freshman survival tips, and campus guides.
3. Assist with Union information: GBSG mission, 5 pillars (Unite, Uplift, Teach, Preserve, Welcome), leadership structure, membership approval, and community discussions (/community).
4. Direct students with official grievances, emergency aid, or sensitive needs to submit a formal ticket on the Support page (/support).
5. Communicate fluently and naturally in the language the student uses: Afaan Oromoo, English, or Amharic.

Tone & Style:
- Warm, polite, encouraging, structured, and student-first.
- Use clear bullet points when listing steps or tips.
- Maintain an encouraging and respectful academic tone.
`;

// In-memory model cache to avoid calling listModels on every single user prompt
let cachedActiveModels = null;
let lastModelFetchTime = 0;
const CACHE_TTL = 15 * 60 * 1000; // 15 minutes

/**
 * Dynamically discover available active models for this specific API key from Google API
 */
async function discoverAvailableModels(apiKey) {
  const now = Date.now();
  if (cachedActiveModels && now - lastModelFetchTime < CACHE_TTL) {
    return cachedActiveModels;
  }

  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    if (res.ok) {
      const data = await res.json();
      const available = (data.models || [])
        .filter((m) => m.supportedGenerationMethods && m.supportedGenerationMethods.includes('generateContent'))
        .map((m) => m.name.replace(/^models\//, ''));

      if (available.length > 0) {
        console.log(`[AI Assistant] Discovered ${available.length} active models from Google API:`, available);

        // Sort: flash first, then pro, then others
        available.sort((a, b) => {
          const aFlash = a.includes('flash');
          const bFlash = b.includes('flash');
          if (aFlash && !bFlash) return -1;
          if (!aFlash && bFlash) return 1;
          return 0;
        });

        cachedActiveModels = available;
        lastModelFetchTime = now;
        return available;
      }
    } else {
      const errText = await res.text();
      console.warn(`[AI Assistant] ListModels HTTP ${res.status}:`, errText);
    }
  } catch (e) {
    console.warn(`[AI Assistant] Could not query ListModels (${e.message}). Using candidate list.`);
  }

  // Fallback candidate list covering latest 2026/2025/2024 model releases
  return [
    'gemini-2.5-flash',
    'gemini-2.5-pro',
    'gemini-2.0-flash-001',
    'gemini-2.0-flash-lite',
    'gemini-2.0-flash-lite-preview-02-05',
    'gemini-flash-latest',
    'gemini-pro-latest',
    'gemini-1.5-flash-latest',
    'gemini-1.5-pro-latest',
    'gemini-2.0-flash',
    'gemini-1.5-flash',
    'gemini-1.5-pro',
  ];
}

// In-memory fallback responses when API key is missing or offline
const getFallbackResponse = (message, lang) => {
  const lower = (message || '').toLowerCase();

  if (
    lower.includes('exam') ||
    lower.includes('qormaata') ||
    lower.includes('note') ||
    lower.includes('resource') ||
    lower.includes('sanada')
  ) {
    return lang === 'or'
      ? "Sanadoota barnootaa, qormaatawwan darban, fi qajeelfamoota barattoota haaraa argachuuf gara kutaa 'Madda Barnootaa' (/resources) deemaa. Achitti gosa barnootaa fi muummee keessaniin calaluun buufachuu dandeessu!"
      : 'You can find past exams, lecture notes, and freshman handbooks in the **Academic Resources** hub (/resources). You can filter materials by department and category!';
  }

  if (
    lower.includes('support') ||
    lower.includes('gargaarsa') ||
    lower.includes('help') ||
    lower.includes('rakkoo')
  ) {
    return lang === 'or'
      ? "Gargaarsa addaa ykn rakkoo mooraa keessatti isin mudateef, fuula 'Gargaarsa Barbaadi' (/support) irratti tikkeettii banachuun hoggantoota gamtaatti beeksisuu dandeessu."
      : 'For personalized assistance, dorm concerns, or union aid, please open a support ticket under the **Get Support** page (/support). An executive officer will respond directly to your conversation thread!';
  }

  if (
    lower.includes('member') ||
    lower.includes('miseens') ||
    lower.includes('join') ||
    lower.includes('galmee')
  ) {
    return lang === 'or'
      ? "Miseensa Gamtaa Barattoota Shanan Gibee ta'uuf fuula 'Nutti Makami' (/register) irratti odeeffannoo keessan guutaa. Hoggansi gamtaa galmee keessan mirkaneessee daashboordii keessan isiniif bana."
      : 'To join the Shanan Gibe Student Union, register your account at /register. Once submitted, an executive admin will review and approve your active membership!';
  }

  return lang === 'or'
    ? "Akkam! Ani Gargaaraa AI Gamtaa Barattoota Shanan Gibee ti. Waa'ee barnootaa, qormaatawwan darban (/resources), marii hawaasaa (/community), ykn gargaarsa gamtaa (/support) na gaafachuu dandeessu. Maal isin gargaaruu danda'a?"
    : 'Hello! I am the GBSG AI Student Assistant. I can help you with campus questions, academic resources (/resources), community discussions (/community), or union support (/support). How can I help you today?';
};

// @desc    Process AI chat conversation with Gemini API
// @route   POST /api/ai/chat
// @access  Public / Protected
const handleAIChat = asyncHandler(async (req, res) => {
  const { message, history = [], language = 'en' } = req.body;

  if (!message || !message.trim()) {
    res.status(400);
    throw new Error('Message content is required');
  }

  const rawKey = process.env.GEMINI_API_KEY || '';
  const apiKey = rawKey.trim().replace(/^"|"$/g, '');

  if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY_HERE') {
    console.warn('[AI Assistant] GEMINI_API_KEY is not configured.');
    const reply = getFallbackResponse(message, language);
    return res.json({
      reply,
      isFallback: true,
      note: 'Please configure GEMINI_API_KEY in your hosting dashboard (Render) environment variables.',
    });
  }

  // 1. Discover or get active models from Google API
  const modelCandidates = await discoverAvailableModels(apiKey);
  const genAI = new GoogleGenerativeAI(apiKey);
  let lastError = null;

  // Format valid chat history with alternating roles
  const formattedHistory = [];
  let lastRole = null;
  for (const item of history || []) {
    if (item && item.text && item.text.trim()) {
      const role = item.sender === 'user' ? 'user' : 'model';
      if (role !== lastRole) {
        formattedHistory.push({
          role,
          parts: [{ text: item.text.trim() }],
        });
        lastRole = role;
      }
    }
  }

  // Remove trailing user message from history if any
  if (formattedHistory.length > 0 && formattedHistory[formattedHistory.length - 1].role === 'user') {
    formattedHistory.pop();
  }

  // 2. Iterate through discovered model candidates
  for (const modelName of modelCandidates) {
    // Strategy A: Native SDK with startChat
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: SYSTEM_INSTRUCTION,
      });

      const chat = model.startChat({
        history: formattedHistory,
        generationConfig: {
          maxOutputTokens: 1000,
          temperature: 0.7,
        },
      });

      const result = await chat.sendMessage(message);
      const responseText = result.response.text();

      console.log(`[AI Assistant] Responded successfully via SDK using model: ${modelName}`);
      return res.json({
        reply: responseText,
        isFallback: false,
        modelUsed: modelName,
      });
    } catch (sdkErr) {
      console.warn(`[AI Assistant] SDK model ${modelName} failed (${sdkErr.message}). Trying Direct REST...`);
      lastError = sdkErr;
    }

    // Strategy B: Direct REST generateContent API
    try {
      const restPayload = {
        system_instruction: {
          parts: [{ text: SYSTEM_INSTRUCTION }],
        },
        contents: [
          ...formattedHistory,
          {
            role: 'user',
            parts: [{ text: message }],
          },
        ],
        generationConfig: {
          maxOutputTokens: 1000,
          temperature: 0.7,
        },
      };

      const restRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(restPayload),
        }
      );

      if (restRes.ok) {
        const data = await restRes.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          console.log(`[AI Assistant] Responded successfully via Direct REST using model: ${modelName}`);
          return res.json({
            reply: text,
            isFallback: false,
            modelUsed: modelName,
          });
        }
      } else {
        const errorData = await restRes.text();
        console.warn(`[AI Assistant] Direct REST ${modelName} HTTP ${restRes.status}:`, errorData);
      }
    } catch (restErr) {
      console.warn(`[AI Assistant] Direct REST ${modelName} exception:`, restErr.message);
      lastError = restErr;
    }
  }

  // Graceful fallback if all model candidates fail
  console.error('[AI Assistant] All models failed:', lastError ? lastError.message : 'Unknown error');
  const reply = getFallbackResponse(message, language);
  res.json({
    reply,
    isFallback: true,
    errorNotice: 'AI service temporarily in offline mode: ' + (lastError ? lastError.message : ''),
  });
});

module.exports = {
  handleAIChat,
};
