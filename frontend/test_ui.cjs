const puppeteer = require('puppeteer');

(async () => {
  console.log("Launching browser...");
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  
  try {
    console.log("Navigating to app...");
    await page.goto('http://localhost:5173/');
    
    // Wait for the form to appear
    console.log("Waiting for form...");
    await page.waitForSelector('form', { timeout: 5000 });
    
    console.log("Typing credentials...");
    await page.type('input[type="email"]', 'testing123@example.com');
    await page.type('input[type="password"]', 'password123');
    
    console.log("Clicking Sign In...");
    await page.click('button[type="submit"], form button');
    
    console.log("Waiting for navigation to /customize...");
    await page.waitForNavigation({ waitUntil: 'networkidle0' });
    
    const url = page.url();
    console.log("Current URL after login:", url);
    
    if (url.includes('/customize')) {
      console.log("Successfully reached customize page.");
      
      // Test the back button we fixed
      console.log("Testing back button...");
      await page.click('.fixed.top-\\[30px\\]'); // The back button has this class
      
      await page.waitForNavigation({ waitUntil: 'networkidle0' });
      console.log("URL after clicking back button:", page.url());
    }
    
  } catch (error) {
    console.error("Test failed:", error);
  } finally {
    await browser.close();
  }
})();
