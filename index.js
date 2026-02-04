const puppeteer = require('puppeteer-extra')
const request = require('request-promise-native');
const poll = require('promise-poller').default;
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
puppeteer.use(StealthPlugin())

//static value for testing purposes.
const username = "Gretahro";
const password = "9riwfi6ndnfd9";
const email = "Gretahro46@gmx.com";
const day = "13";
const month = "10";
const year = "1992";

const region = "oce";
const url = "https://signup." + region + ".leagueoflegends.com/en/signup/index#/registration";

const chromeOptions = {
  headless:false,
  ignoreDefaultArgs: ['--enable-automation'],
  defaultViewport: null};


async function initiateCaptchaRequest(apiKey) {
  const formData = {
    method: 'hcaptcha',
    sitekey: 'a010c060-9eb5-498c-a7b9-9204c881f9dc',
    key: apiKey,
    pageurl: 'https://signup.lan.leagueoflegends.com/es/signup/index#',
    json: 1
  };
  const response = await request.post('http://2captcha.com/in.php?', {form: formData});
  return JSON.parse(response).request;
}


async function pollForRequestResults(
  key, 
  id, 
  retries = 60, 
  interval = 2000, 
  delay = 15000
) {
  await timeout(delay);
  return poll({
    taskFn: requestCaptchaResults(key, id),
    interval,
    retries
  });
}

function requestCaptchaResults(apiKey, requestId) {
  const url = `http://2captcha.com/res.php?key=${apiKey}&action=get&id=${requestId}&json=1`;
  return async function() {
    return new Promise(async function(resolve, reject){
      const rawResponse = await request.get(url);
      const resp = JSON.parse(rawResponse);
      if (resp.status === 0) return reject(resp.request);
      resolve(resp.request);
    });
  }
}


(async function main() {
  const browser = await puppeteer.launch(chromeOptions);
  const page = await browser.newPage();
  await page.goto(url);
  await page.waitFor(1500);
 // await page.click('button[id="truste-consent-button"]');
  await page.click('INPUT[name=email]');
  await page.type('INPUT[name=email]',email);
  await page.waitForSelector('button');
  await page.keyboard.press('Enter');
  await page.waitForNavigation();
  await page.waitFor(1000);
  await page.select('select[name="dob-day"]', day);
  await page.select('select[name="dob-month"]', month);
  await page.select('select[name="dob-year"]', year);
  await page.waitFor(1000);
  await page.click('select[name="dob-year"]');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Enter');
  await page._frameManager._mainFrame.waitForNavigation();
  await page.waitFor(3000)
  await page.click('INPUT[name="username"]');
  await page.waitFor(500);
  await page.type('INPUT[name="username"]', username );
  await page.click('INPUT[name="password"]');
  await page.type('INPUT[name="password"]', password);
  await page.click('INPUT[name="confirm_password"]',{delay: 20});
  await page.click('INPUT[name="confirm_password"]',{delay: 20});
  await page.type('INPUT[name="confirm_password"]', password);
  await page.waitForSelector("#tou_agree");

  await page.evaluate(() => {
    document.querySelector("#tou_agree").parentElement.click();
  });

await page.waitFor(200);
await page.click('INPUT[name="confirm_password"]',{delay: 20});

const requestId = await initiateCaptchaRequest('5cc98fe20cd463102c82aef4c964adf6');
const response = await pollForRequestResults('5cc98fe20cd463102c82aef4c964adf6', requestId);
await page.evaluate(`document.querySelector('[name=g-recaptcha-response]').innerText='${response}';`);
await page.evaluate(`document.querySelector('[name=h-captcha-response]').innerText='${response}';`);
await page.keyboard.press('Tab');
await page.keyboard.press('Tab');
await page.keyboard.press('Tab');
await page.keyboard.press('Tab');
await page.keyboard.press('Tab');
await page.keyboard.press('Enter');
await page.waitFor(1500);
await page.waitForNavigation();
await page.waitFor(4000);
console.log("checking url");
console.log(page.url());
await page.close();
await browser.close();
console.log("ACC 1 DONE")
  

})()
const timeout = millis => new Promise(resolve => setTimeout(resolve, millis))

