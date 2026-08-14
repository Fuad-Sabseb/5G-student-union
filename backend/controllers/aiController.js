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
  
  if (lower.includes('exam') || lower.includes('qormaata') || lower.includes('note') || lower.includes('resource') || lower.includes('sanada')) {
    return lang === 'or'
      ? "Sanadoota barnootaa, qormaatawwan darban, fi qajeelfamoota barattoota haaraa argachuuf gara kutaa 'Madda Barnootaa' (/resources) deemaa. Achitti gosa barnootaa fi muummee keessaniin calaluun buufachuu dandeessu!"
      : "You can find past exams, lecture notes, and freshman handbooks in the **Academic Resources** hub (/resources). You can filter materials by department and category!";
  }

  if (lower.includes('support') || lower.includes('gargaarsa') || lower.includes('help') || lower.includes('rakkoo')) {
    return lang === 'or'
      ? "Gargaarsa addaa ykn rakkoo mooraa keessatti isin mudateef, fuula 'Gargaarsa Barbaadi' (/support) irratti tikkeettii banachuun hoggantoota gamtaatti beeksisuu dandeessu."
      : "For personalized assistance, dorm concerns, or union aid, please open a support ticket under the **Get Support** page (/support). An executive officer will respond directly to your conversation thread!";
  }

  if (lower.includes('member') || lower.includes('miseens') || lower.includes('join') || lower.includes('galmee')) {
    return lang === 'or'
      ? "Miseensa Gamtaa Barattoota Shanan Gibee ta'uuf fuula 'Nutti Makami' (/register) irratti odeeffannoo keessan guutaa. Hoggansi gamtaa galmee keessan mirkaneessee daashboordii keessan isiniif bana."
      : "To join the Shanan Gibe Student Union, register your account at /register. Once submitted, an executive admin will review and approve your active membership!";
  }

  return lang === 'or'
    ? "Akkam! Ani Gargaaraa AI Gamtaa Barattoota Shanan Gibee ti. Waa'ee barnootaa, qormaatawwan darban (/resources), marii hawaasaa (/community), ykn gargaarsa gamtaa (/support) na gaafachuu dandeessu. Maal isin gargaaruu danda'a?"
    : "Hello! I am the GBSG AI Student Assistant. I can help you with campus questions, academic resources (/resources), community discussions (/community), or union support (/support). How can I help you today?";
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

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY_HERE') {
    // Return intelligent fallback response
    const reply = getFallbackResponse(message, language);
    return res.json({
      reply,
      isFallback: true,
      note: 'Using offline union assistant mode. Configure GEMINI_API_KEY in backend/.env for live generative AI responses.',
    });
  }

  const modelCandidates = [
    'gemini-3.1-flash-lite',
    'gemini-3.5-flash-lite',
    'gemini-flash-lite-latest',
    'gemini-flash-latest',
  ];

  const genAI = new GoogleGenerativeAI(apiKey);
  let lastError = null;

  // Format chat history for multi-turn conversations
  const formattedHistory = (history || [])
    .filter((item) => item && item.text && item.text.trim())
    .map((item) => ({
      role: item.sender === 'user' ? 'user' : 'model',
      parts: [{ text: item.text }],
    }));

  for (const modelName of modelCandidates) {
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

      return res.json({
        reply: responseText,
        isFallback: false,
        modelUsed: modelName,
      });
    } catch (err) {
      console.warn(`Model ${modelName} unavailable (${err.message}). Trying next...`);
      lastError = err;
    }
  }

  // Graceful fallback if all models fail
  console.error('All Gemini models failed:', lastError ? lastError.message : 'Unknown error');
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
