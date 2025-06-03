const fetch = require("node-fetch");

/**
 * Parses a portfolio HTML text using Google Gemini API to extract user data.
 * @param {string} htmlText - The HTML text of the portfolio web page.
 * @returns {Promise<Object>} - Extracted user data in JSON format.
 */
async function parserAgent(htmlText) {
  const apiKey = process.env.AGENT_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set in environment variables");
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

  const prompt = `Extract all relevant user data (name, contact, skills, experience, education, links, etc.) from the following portfolio web page HTML. Return the result as a JSON object.\n\nHTML:\n${htmlText}`;

  const body = {
    contents: [
      {
        parts: [
          {
            text: prompt,
          },
        ],
      },
    ],
  };

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  // The response format may vary; adjust as needed
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
  try {
    return JSON.parse(text);
  } catch (e) {
    // If not valid JSON, return the raw text
    return { raw: text };
  }
}

module.exports = { parserAgent };
