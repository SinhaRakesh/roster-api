var express = require("express");
var router = express.Router();
const db = require("../config/pgdb");
const { scrapeAgent } = require("../services/scrapper");
const { parserAgent } = require("../services/parserAgent");
const { updateUserPortfolio } = require("../services/userService");

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
  // const parsedJsonData = {
  //   name: "Sonu Choudhary",
  //   title: "VIDEO EDITOR",
  //   contact: {
  //     email: null,
  //     phone: null,
  //     linkedin: null,
  //   },
  //   skills: [
  //     "SHORTS FORM CONTENTS",
  //     "TAKING HEAD VIDEOS",
  //     "STORYTELLING",
  //     "BRANDING",
  //     "MOTION GRAPHICS",
  //   ],
  //   experience: {
  //     years: "5+",
  //     details:
  //       "I specialize in YouTube video editing, crafting high-\nquality content that captivates audiences and drives\nengagement. I’ve had the privilege of working with\ntop creators like Uptin (3M+ followers) and XYZ\nEducation (1M+ subscribers), contributing to content\nthat has amassed over 5 million organic views.",
  //     clients: [
  //       "Uptin Saiidi",
  //       "Dr Maryam Seddigh",
  //       "UP10 Media",
  //       "Ellie MD",
  //       "Ali Taghikhani",
  //     ],
  //   },
  //   testimonials: [
  //     {
  //       author: "Lior Roisman, Founder of GOLD COSMECTICS",
  //       text: "I was blown away by the quality of editing! The storytelling, transitions, and attention to detail were next level. One of our videos even went viral, getting over 1M views in just a few days!",
  //     },
  //     {
  //       author: "Ali Taghikhani CEO and Co-founder at Synapse",
  //       text: "Working with Sonu has completely transformed our video content. His edits are insanely engaging, and the pacing keeps viewers hooked till the very end. Our engagement rates have skyrocketed, and we’ve seen a massive increase in conversions!",
  //     },
  //     {
  //       author: "Dr Maryam Seddigh, Doctor & Content Creator",
  //       text: "Sonu is a high-caliber editor. His eye for detail, creativity, and storytelling skills, whether short-form or long-form videos, are excellent. He understands how to engage audiences and bring a vision to life. I highly recommend Sonu for any video editing role. If you’re looking for someone who can elevate your content - talk to Sonu!",
  //     },
  //     {
  //       author: "Archannath R Gurtu, Founder of Market Men",
  //       text: "I don’t know what kind of editing sorcery Sonu used, but my video went from ‘meh’ to ‘holy sht, this is insane!’ Sonu is brilliant at what he does and is always delivering up to standard.. No wonder he charges what he does. Worth every penny!",
  //     },
  //     {
  //       author: "Hanzel, COO at Ellie MD",
  //       text: "Most editors just cut and paste clips. Sonu actually understands what makes a video work. He knows how to keep people watching, how to add just the right amount of energy, and how to make videos look premium. My brand’s content has never looked better!",
  //     },
  //     {
  //       author: "Rohit Thomas, COO at UP10 Media",
  //       text: "I sent Sonu a mess of raw footage, and somehow, he turned it into a viral-worthy masterpiece. I don’t know what kind of AI or wizardry he used, but I’m not asking questions. I’m just sending more videos!",
  //     },
  //   ],
  //   additional_info: [
  //     "Using INDUSTRY LEVEL SOFTWARE LIKE ADOBE PREMIERE PRO & AFTEREFFECTS",
  //     "UNDERSTANDING OF BRAND CREATION & BASICS",
  //     "Very RELIABLE & MAINTAIN deadlines",
  //   ],
  // };
  try {
    // scrap portfolio html
    const textContent = await scrapeAgent(url);
    // get information (json format) from the htmtcontext using ai/llm
    const parsedJsonData = await parserAgent(textContent);
    // save this data into db
    const dataupdated = await updateUserPortfolio(url, parsedJsonData);
    res.send({
      message: "URL Verified Successfully",
      url,
      parsedJsonData,
      dataupdated,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error scraping portfolio");
  }
});

module.exports = router;
