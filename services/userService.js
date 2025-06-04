const db = require("../config/pgdb");

/**
 * Get a user by ID
 * @param {number} id
 * @returns {Promise<Object|null>}
 */
async function getUserById(id) {
  const result = await db.query("SELECT * FROM users WHERE id = $1", [id]);
  return result.rows[0] || null;
}

/**
 * Get all users
 * @returns {Promise<Array>}
 */
async function getAllUsers() {
  const result = await db.query("SELECT * FROM users");
  return result.rows;
}

async function updateUserPortfolio(portfolioUrl, fd) {
  const userValues = [
    fd.name,
    fd.title,
    fd.contact.email,
    fd.contact.phone,
    portfolioUrl,
    fd.skills.join(","),
    fd.experience.years,
    fd.experience.details,
    fd.experience.clients.join(","),
    fd.additional_info.join(","),
  ];

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

  console.log(userId);
  // console.log(fd.testimonials);
  // Insert testimonials if present
  if (Array.isArray(fd.testimonials)) {
    for (const testimonial of fd.testimonials) {
      const { author = null, text = null } = testimonial;
      if (author == null && text == null) continue;
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
  return { userId, ...fd };
}

module.exports = {
  getUserById,
  getAllUsers,
  updateUserPortfolio,
};
