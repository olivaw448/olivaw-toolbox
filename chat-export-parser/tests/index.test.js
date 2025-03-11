const fs = require('fs');
const path = require('path');

describe('HTML Page Test: Telegram Export', () => {
  beforeAll(async () => {
    await page.goto('http://localhost:3200', { waitUntil: 'domcontentloaded' });
  });

  test('Wait for body', async () => {
    await page.waitForSelector('body');
  }, 60000);

  test('Wait for button', async () => {
    await page.waitForSelector('#btn-telegram', { visible: true });
  }, 60000);

  test('Click button', async () => {
    await page.waitForSelector('#btn-telegram', { visible: true });
    await page.click('#btn-telegram');
    console.log("Test 3: Button clicked");
  }, 60000);

  test('Wait for drop area text update', async () => {
    await page.waitForFunction(() => {
      const dropTextEl = document.getElementById('drop-text');
      return dropTextEl && dropTextEl.textContent !== 'Loading export script...';
    }, { timeout: 60000 });
    console.log("Step 4: Drop area text updated");
  }, 60000);

  test('Simulate drag and drop event for file upload and check output TELEGRAM', async () => {
    console.log("Step 5: Starting file upload test via drag and drop");

    const filePath = path.resolve(__dirname, 'telegram-export-source.json');
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }
    const fileContent = fs.readFileSync(filePath, 'utf8');
    console.log(`File content loaded from: ${filePath}`);

    await page.evaluate((content) => {
      const dropArea = document.getElementById('drop-area');
      if (!dropArea) throw new Error("Drop area not found");

      const file = new File([content], "telegram-export-source.json", { type: "application/json" });
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      const event = new DragEvent('drop', {
        bubbles: true,
        cancelable: true,
        dataTransfer
      });
      dropArea.dispatchEvent(event);
    }, fileContent);

    await page.waitForFunction(() => {
      const output = document.getElementById('output');
      return output && output.style.display === 'block' && output.innerText.trim().length > 0;
    }, { timeout: 60000 });
    console.log("Step 5: File processed and output available");

    const outputText = await page.$eval('#output', el => el.innerText);
    //console.log("Output text:", outputText);

    const expectedTextFile = path.resolve(__dirname, 'telegram-export-result.txt');
    const expectedText = fs.readFileSync(expectedTextFile, 'utf8');

    //console.log("File expected text:", expectedText);

    expect(outputText.replace(/\r\n/g, '\n').trim())
  .toBe(expectedText.replace(/\r\n/g, '\n').trim());

  }, 60000);

  test('Click button', async () => {
    await page.waitForSelector('#btn-whatsapp', { visible: true });
    await page.click('#btn-whatsapp');
    console.log("Test 3: Button clicked");
  }, 60000);

  test('Wait for drop area text update to Whatsapp text', async () => {
    await page.waitForFunction(() => {
      const dropTextEl = document.getElementById('drop-text');
      return dropTextEl && dropTextEl.textContent === 'Drag and drop a ZIP or TXT file here or click to select';
    }, { timeout: 60000 });
    console.log("Step 4: Drop area text updated");
  }, 60000);

  test('Simulate drag and drop event for file upload and check output WHATSAPP', async () => {

    const filePath = path.resolve(__dirname, 'whatsapp-export-source.txt');
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }
    const fileContent = fs.readFileSync(filePath, 'utf8');
    console.log(`File content loaded from: ${filePath}`);

    await page.evaluate((content) => {
      const dropArea = document.getElementById('drop-area');
      if (!dropArea) throw new Error("Drop area not found");

      const file = new File([content], "whatsapp-export-source.txt", { type: "application/json" });
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      const event = new DragEvent('drop', {
        bubbles: true,
        cancelable: true,
        dataTransfer
      });
      dropArea.dispatchEvent(event);
    }, fileContent);

    await page.waitForFunction(() => {
      const output = document.getElementById('output');
      return output && output.style.display === 'block' && output.innerText.trim().length > 0;
    }, { timeout: 60000 });
    console.log("Step 5: File processed and output available");

    const outputText = await page.$eval('#output', el => el.innerText);
    //console.log("Output text:", outputText);

    const expectedTextFile = path.resolve(__dirname, 'whatsapp-export-result.txt');
    const expectedText = fs.readFileSync(expectedTextFile, 'utf8');

    //console.log("File expected text:", expectedText);

    expect(outputText.replace(/\r\n/g, '\n').trim())
  .toBe(expectedText.replace(/\r\n/g, '\n').trim());

  }, 60000);

});
