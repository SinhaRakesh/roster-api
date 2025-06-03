var express = require("express");
var router = express.Router();
const db = require("../config/pgdb");
const { scrapeAgent } = require("../services/scrapper");
const { parserAgent } = require("../services/parserAgent");

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
    const textContent = await scrapeAgent(url);
    const parsedJsonData = await parserAgent(textContent);
    res.send({
      message: "URL Verified Successfully",
      url,
      parsedJsonData,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error scraping portfolio");
  }
});

module.exports = router;
