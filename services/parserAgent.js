const fetch = require("node-fetch");
const db = require("../config/pgdb");
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
  console.log(text);

  let formattedData = {};
  try {
    formattedData = JSON.parse(text);
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

  // update data into database
  // Insert user
  const userFields = [
    "name",
    "title",
    "email",
    "mobile",
    "portfolio_link",
    "skill_summary",
    "experience_years",
    "experience_details",
    "experience_clients",
    "additional_info",
  ];
  const userValues = userFields.map((f) => formattedData[f] ?? null);
  // Ensure JSON fields are stringified
  // userValues[8] = userValues[8] ? JSON.stringify(userValues[8]) : null; // experience_clients
  // userValues[9] = userValues[9] ? JSON.stringify(userValues[9]) : null; // additional_info

  const insertUserQuery = `
    INSERT INTO users (
      name, title, email, mobile, portfolio_link, skill_summary, experience_years, experience_details, experience_clients, additional_info
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
    RETURNING id
  `;
  let userId = 0;
  try {
    const userRes = await db.query(insertUserQuery, userValues);
    userId = userRes.rows[0].id;
  } catch (err) {
    throw new Error("Failed to insert user: " + err.message);
  }

  // Insert testimonials if present
  if (Array.isArray(formattedData.testimonials)) {
    for (const testimonial of formattedData.testimonials) {
      const { author = null, text = null } = testimonial;
      try {
        await db.query(
          `INSERT INTO testimonials (user_id, author, text) VALUES ($1, $2, $3)`,
          [userId, author, text]
        );
      } catch (err) {
        // Optionally log or handle testimonial insert errors
        console.error("Failed to insert testimonial:", err.message);
      }
    }
  }
  // Optionally, you can return the userId or the inserted data
  return { userId, ...formattedData };
}

module.exports = { parserAgent };
