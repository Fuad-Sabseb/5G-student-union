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

// In-memory fallback responses when API key is missing
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
    console.warn('[AI Assistant] GEMINI_API_KEY is not configured in environment variables.');
    const reply = getFallbackResponse(message, language);
    return res.json({
      reply,
      isFallback: true,
      note: 'Using offline fallback. Please set GEMINI_API_KEY in your hosting dashboard (Render) environment variables for real-time generative responses.',
    });
  }

  // Official public Gemini model IDs
  const modelCandidates = [
    'gemini-2.0-flash',
    'gemini-1.5-flash',
    'gemini-1.5-flash-8b',
    'gemini-1.5-pro',
    'gemini-pro',
  ];

  const genAI = new GoogleGenerativeAI(apiKey);
  let lastError = null;

  // Format valid chat history
  const formattedHistory = [];
  let lastRole = null;
  for (const item of history || []) {
    if (item && item.text && item.text.trim()) {
      const role = item.sender === 'user' ? 'user' : 'model';
      // Ensure history strictly alternates roles as required by Gemini API
      if (role !== lastRole) {
        formattedHistory.push({
          role,
          parts: [{ text: item.text.trim() }],
        });
        lastRole = role;
      }
    }
  }

  // Ensure history does not end on a 'user' turn before we send a new user message
  if (formattedHistory.length > 0 && formattedHistory[formattedHistory.length - 1].role === 'user') {
    formattedHistory.pop();
  }

  for (const modelName of modelCandidates) {
    try {
      const modelOptions = {
        model: modelName,
      };

      // Older models (like gemini-pro) do not accept systemInstruction in config
      if (modelName !== 'gemini-pro') {
        modelOptions.systemInstruction = SYSTEM_INSTRUCTION;
      }

      const model = genAI.getGenerativeModel(modelOptions);

      // Attempt multi-turn chat first
      try {
        const chat = model.startChat({
          history: formattedHistory,
          generationConfig: {
            maxOutputTokens: 1000,
            temperature: 0.7,
          },
        });

        const result = await chat.sendMessage(message);
        const responseText = result.response.text();

        console.log(`[AI Assistant] Successfully generated response using model: ${modelName}`);
        return res.json({
          reply: responseText,
          isFallback: false,
          modelUsed: modelName,
        });
      } catch (chatErr) {
        // Direct single-turn fallback with prepended system instruction
        const prompt = `${SYSTEM_INSTRUCTION}\n\nStudent (${language}): ${message}`;
        const singleResult = await model.generateContent(prompt);
        const singleText = singleResult.response.text();

        console.log(`[AI Assistant] Generated single-turn response using model: ${modelName}`);
        return res.json({
          reply: singleText,
          isFallback: false,
          modelUsed: modelName,
        });
      }
    } catch (err) {
      console.warn(`[AI Assistant] Model ${modelName} failed (${err.message}). Trying next...`);
      lastError = err;
    }
  }

  // Graceful fallback if all models fail
  console.error('[AI Assistant] All Gemini models failed:', lastError ? lastError.message : 'Unknown error');
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
