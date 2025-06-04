const fetch = require("node-fetch");
const db = require("../config/pgdb");
const fs = require("fs");
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

  const prompt = `Extract all relevant user data from the following portfolio web page HTML. Always return ONLY a clean, valid JSON object in the EXACT format below. If any value is missing, set it to null (for objects/strings) or [] (for arrays). Do not include markdown, code blocks, or any extra text. If you cannot extract the data, return null or empty arrays as appropriate.

  Return in this format:
  {
    "name": "",
    "title": "",
    "contact": {
      "email": "",
      "phone": "",
      "linkedin": ""
    },
    "skills": [
    ],
    "experience": {
      "years": "0",
      "details": "",
      "clients": [
      ]
    },
    "testimonials": [
      {
      }
    ],
    "additional_info": [
    ]
  }

  HTML:\n${htmlText}`;

  // const prompt = `Extract all relevant user data (name, contact, skills, experience, education, links, etc.) from the following portfolio web page HTML. Return only a clean, valid JSON object without any markdown or code blocks.\n\nHTML:\n${htmlText}`;

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
    throw new Error(`AGENT API error: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  // The response format may vary; adjust as needed
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
  // console.log(text);

  // Write the text to a file for debugging
  fs.writeFileSync(__dirname + "/agent_output.json", text);

  // const fileContent = fs.readFileSync(__dirname + "/agent_output.json", "utf-8");

  let formattedData = {};
  try {
    const lines = text.split("\n");
    const cleaned = lines.slice(1, -1).join("\n");
    // const data = JSON.parse(cleaned);
    formattedData = JSON.parse(cleaned);
  } catch (e) {
    // Try to extract JSON object from the string
    const match = await text.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        formattedData = JSON.parse(match[0]);
      } catch (e2) {
        throw new Error(
          "Failed to parse extracted JSON object from Gemini API response"
        );
      }
    }
    throw new Error("Agent API did not return a valid JSON object");
  }

  // console.log(formattedData);
  fs.writeFileSync(
    __dirname + "/agent_output.json",
    JSON.stringify(formattedData)
  );

  return formattedData;
}

module.exports = { parserAgent };
