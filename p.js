const puppeteer = require('puppeteer');

(async () => {
  console.log("Launching browser...");
  const browser = await puppeteer.launch({ 
    headless: 'new',
    executablePath: 'C:\\Users\\SCALLETOS\\.cache\\puppeteer\\chrome\\win64-149.0.7827.22\\chrome-win64\\chrome.exe'
  });
  const page = await browser.newPage();

  console.log("Navigating to login page...");
  await page.goto('https://3inaya-patient.vercel.app/login', { waitUntil: 'networkidle2' });

  console.log("Typing email and password...");
  await page.type('input[type="email"]', 'patient@test.com');
  await page.type('input[type="password"]', '123456');

  console.log("Clicking submit...");
  await page.click('button[type="submit"]');

  console.log("Waiting for 4 seconds...");
  await new Promise(r => setTimeout(r, 4000));

  console.log("Current URL:", page.url());
  
  const text = await page.evaluate(() => document.body.innerText);
  console.log("Body includes 'فشل تسجيل الدخول':", text.includes('فشل تسجيل الدخول'));
  console.log("Body includes 'dashboard':", text.toLowerCase().includes('dashboard') || text.includes('الرئيسية'));

  require('fs').writeFileSync('p_out.html', await page.evaluate(() => document.body.innerHTML));

  await browser.close();
})();
