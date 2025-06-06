const puppeteer = require("puppeteer");
// const product_link = process.argv[2];

async function scrapeAgent(url) {
  // const url = product_link;
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: "domcontentloaded" });
  await new Promise((resolve) => setTimeout(resolve, 5000));

  // console.log("working");
  const textContent = await page.$eval("body", (ele) => ele.innerText);
  // console.log("Extracted Text:", textContent);
  await browser.close();
  await new Promise((resolve) => setTimeout(resolve, 500));
  return textContent;
}

// module.exports the function for use in other files
module.exports = { scrapeAgent };

// Removed scrapeProducts() call as it is undefined
// setInterval(scrapeProducts, 0.25 * 60 * 1000);
