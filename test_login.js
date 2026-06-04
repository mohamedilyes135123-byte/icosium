const puppeteer = require('puppeteer');

(async () => {
  console.log("Launching browser...");
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();

  console.log("Navigating to login page...");
  await page.goto('https://3inaya-patient.vercel.app/login', { waitUntil: 'networkidle2' });

  console.log("Typing email and password...");
  await page.type('input[type="email"]', 'patient@test.com');
  await page.type('input[type="password"]', '123456');

  console.log("Clicking submit...");
  await page.click('button[type="submit"]');

  console.log("Waiting for 3 seconds...");
  await new Promise(r => setTimeout(r, 3000));

  console.log("Current URL:", page.url());
  
  // check if there is an error message
  const text = await page.evaluate(() => document.body.innerText);
  if (text.includes('فشل تسجيل الدخول')) {
    console.log("Found error: فشل تسجيل الدخول");
  } else if (text.includes('هذه البوابة مخصصة للمرضى فقط.')) {
    console.log("Found error: هذه البوابة مخصصة للمرضى فقط.");
  } else {
    console.log("No specific error message found.");
  }
  
  const html = await page.evaluate(() => document.body.innerHTML);
  require('fs').writeFileSync('page.html', html);
  console.log("Saved page.html");

  await browser.close();
})();
