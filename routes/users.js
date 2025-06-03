var express = require("express");
var router = express.Router();
const db = require("../config/pgdb");
const { scrapePortfolio } = require("../services/scrapper");

/* GET users listing. */
router.get("/", function (req, res, next) {
  res.send("respond with a resource");
});

router.get("/list", async function (req, res, next) {
  try {
    const result = await db.query("SELECT * FROM users");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
  res.end();
});

router.post("/process-portfolio", async function (req, res, next) {
  const { url } = req.body;
  console.log(url, "");

  try {
    const textContent = await scrapePortfolio(url);
    res.send({
      message: "Record Verified Successfully",
      url,
      textContent,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error scraping portfolio");
  }
});

module.exports = router;
