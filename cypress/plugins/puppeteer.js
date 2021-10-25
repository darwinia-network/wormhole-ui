const puppeteer = require('puppeteer-core');
const fetch = require('node-fetch');

let puppeteerBrowser;
let mainWindow;
let metamaskWindow;
let switchToMetamaskNotificationRetries;

module.exports = {
  puppeteerBrowser: () => {
    return puppeteerBrowser;
  },
  mainWindow: () => {
    return mainWindow;
  },
  metamaskWindow: () => {
    return metamaskWindow;
  },
  init: async () => {
    const debuggerDetails = await fetch('http://localhost:9222/json/version'); //DevSkim: ignore DS137138
    const debuggerDetailsConfig = await debuggerDetails.json();
    const webSocketDebuggerUrl = debuggerDetailsConfig.webSocketDebuggerUrl;

    puppeteerBrowser = await puppeteer.connect({
      browserWSEndpoint: webSocketDebuggerUrl,
      ignoreHTTPSErrors: true,
      defaultViewport: null,
    });
    return puppeteerBrowser.isConnected();
  },
  clear: async () => {
    puppeteerBrowser = null;
  },
  assignWindows: async () => {
    let pages = await puppeteerBrowser.pages();
    for (const page of pages) {
      if (page.url().includes('integration')) {
        mainWindow = page;
      } else if (page.url().includes('extension')) {
        metamaskWindow = page;
      }
    }
    return true;
  },
  getBrowser: async () => {
    return {
      puppeteerBrowser,
    };
  },
  getWindows: async () => {
    return {
      mainWindow,
      metamaskWindow,
    };
  },
  clearWindows: async () => {
    mainWindow = null;
    metamaskWindow = null;
  },
  getActiveTabPage: async () => {
    let pages = await puppeteerBrowser.pages();
    const visiblePages = pages.filter(async (page) => {
      const state = await page.evaluate(() => document.visibilityState);
      // todo: seem to be bugged out with cypress first tab always having visiblityState visible
      return state === 'visible';
    });
    const activeTabPage = visiblePages[0];
    return activeTabPage;
  },
  isMetamaskWindowActive: async () => {
    let activeTabPage = await module.exports.getActiveTabPage();
    if (activeTabPage.url().includes('extension') || activeTabPage.url().includes('notification')) {
      return true;
    } else {
      return false;
    }
  },
  isCypressWindowActive: async () => {
    let activeTabPage = await module.exports.getActiveTabPage();
    if (activeTabPage.url().includes('integration')) {
      return true;
    } else {
      return false;
    }
  },
  switchToCypressWindow: async () => {
    await mainWindow.bringToFront();
    return true;
  },
  switchToMetamaskWindow: async () => {
    await metamaskWindow.bringToFront();
    return true;
  },
  switchToMetamaskNotification: async () => {
    await metamaskWindow.waitForTimeout(500);
    let pages = await puppeteerBrowser.pages();
    for (const page of pages) {
      if (page.url().includes('notification')) {
        switchToMetamaskNotificationRetries = 0;
        await page.bringToFront();
        return page;
      }
    }

    // 24*500ms = 12 seconds in total
    if (switchToMetamaskNotificationRetries < 24) {
      switchToMetamaskNotificationRetries++;
      const page = await module.exports.switchToMetamaskNotification();
      return page;
    } else {
      return false;
    }
  },
  waitFor: async (selector, page = metamaskWindow) => {
    await page.waitForFunction(
      `document.querySelector('${selector}') && document.querySelector('${selector}').clientHeight != 0`,
      { visible: true }
    );
    // puppeteer going too fast breaks metamask in corner cases
    await page.waitForTimeout(300);
  },
  waitAndClick: async (selector, page = metamaskWindow) => {
    await module.exports.waitFor(selector, page);
    await page.evaluate((selector) => document.querySelector(selector).click(), selector);
  },
  waitAndClickByText: async (selector, text, page = metamaskWindow) => {
    await module.exports.waitFor(selector, page);
    await page.evaluate(() => {
      [...document.querySelectorAll(selector)].find((element) => element.textContent === text).click();
    });
  },
  waitAndType: async (selector, value, page = metamaskWindow) => {
    await module.exports.waitFor(selector, page);
    const element = await page.$(selector);
    await element.type(value);
  },
  waitAndGetValue: async (selector, page = metamaskWindow) => {
    await module.exports.waitFor(selector, page);
    const element = await page.$(selector);
    const property = await element.getProperty('value');
    const value = await property.jsonValue();
    return value;
  },
  waitAndSetValue: async (text, selector, page = metamaskWindow) => {
    await module.exports.waitFor(selector, page);
    await page.evaluate((selector) => (document.querySelector(selector).value = ''), selector);
    await page.focus(selector);
    await page.keyboard.type(text);
  },
  waitAndClearWithBackspace: async (selector, page = metamaskWindow) => {
    await module.exports.waitFor(selector, page);
    const inputValue = await page.evaluate(selector, (el) => el.value);
    for (let i = 0; i < inputValue.length; i++) {
      await page.keyboard.press('Backspace');
    }
  },
  waitClearAndType: async (text, selector, page = metamaskWindow) => {
    await module.exports.waitFor(selector, page);
    const input = await page.$(selector);
    /*
    todo: there need to find the real reason

      1) Ethereum to Darwinia
           should launch tx:
         CypressError: `cy.task('confirmMetamaskTransaction')` failed with the following error:

    > Node is either not visible or not an HTMLElement

    https://on.cypress.io/api/task
          at http://localhost:3007/__cypress/runner/cypress_runner.js:158901:78
          at tryCatcher (http://localhost:3007/__cypress/runner/cypress_runner.js:13212:23)
          at Promise._settlePromiseFromHandler (http://localhost:3007/__cypress/runner/cypress_runner.js:11147:31)
          at Promise._settlePromise (http://localhost:3007/__cypress/runner/cypress_runner.js:11204:18)
          at Promise._settlePromise0 (http://localhost:3007/__cypress/runner/cypress_runner.js:11249:10)
          at Promise._settlePromises (http://localhost:3007/__cypress/runner/cypress_runner.js:11325:18)
          at _drainQueueStep (http://localhost:3007/__cypress/runner/cypress_runner.js:7919:12)
          at _drainQueue (http://localhost:3007/__cypress/runner/cypress_runner.js:7912:9)
          at Async.../../node_modules/bluebird/js/release/async.js.Async._drainQueues (http://localhost:3007/__cypress/runner/cypress_runner.js:7928:5)
          at Async.drainQueues (http://localhost:3007/__cypress/runner/cypress_runner.js:7798:14)
      From Your Spec Code:
          at Context.eval (http://localhost:3007/__cypress/tests?p=cypress/support/index.ts:452:15)

      From Node.js Internals:
        Error: Node is either not visible or not an HTMLElement
            at ElementHandle.clickablePoint (/__w/wormhole-ui/wormhole-ui/node_modules/puppeteer-core/src/common/JSHandle.ts:436:13)
            at processTicksAndRejections (internal/process/task_queues.js:95:5)
            at ElementHandle.click (/__w/wormhole-ui/wormhole-ui/node_modules/puppeteer-core/src/common/JSHandle.ts:498:22)
     */
    // await input.click({ clickCount: 3 });
    await input.type(text);
  },
  waitForText: async (selector, text, page = metamaskWindow) => {
    await module.exports.waitFor(selector, page);
    await page.waitForFunction(`document.querySelector('${selector}').innerText.toLowerCase().includes('${text}')`);
  },
};
