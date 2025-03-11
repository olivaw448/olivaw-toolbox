const fs = require('fs');
const path = require('path');

describe('HTML Page Test: Chat Export Parser', () => {
  beforeAll(async () => {
    await page.goto('http://localhost:3200', { waitUntil: 'domcontentloaded' });
  });

  test('Wait for body element', async () => {
    await page.waitForSelector('body');
  }, 60000);

  // Telegram tests
  test('Wait for Telegram button', async () => {
    await page.waitForSelector('#export-type-bar button[data-type="telegram"]', { visible: true });
  }, 60000);

  test('Click Telegram button', async () => {
    await page.waitForSelector('#export-type-bar button[data-type="telegram"]', { visible: true });
    await page.click('#export-type-bar button[data-type="telegram"]');
    console.log("Telegram button clicked");
  }, 60000);

  test('Wait for drop area text update (Telegram)', async () => {
    await page.waitForFunction(() => {
      const dropTextEl = document.getElementById('drop-text');
      return dropTextEl && dropTextEl.textContent !== 'Loading export script...';
    }, { timeout: 60000 });
    console.log("Drop area text updated (Telegram)");
  }, 60000);

  test('Simulate drag and drop file upload and check Telegram output', async () => {
    console.log("Starting Telegram file upload test via drag and drop");

    const filePath = path.resolve(__dirname, 'telegram-export-source.json');
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }
    const fileContent = fs.readFileSync(filePath, 'utf8');
    console.log(`Loaded file content from: ${filePath}`);

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
    console.log("Telegram file processed and output available");

    const outputText = await page.$eval('#output', el => el.innerText);
    const expectedTextFile = path.resolve(__dirname, 'telegram-export-result.txt');
    const expectedText = fs.readFileSync(expectedTextFile, 'utf8');

    expect(outputText.replace(/\r\n/g, '\n').trim())
      .toBe(expectedText.replace(/\r\n/g, '\n').trim());
  }, 60000);

  // WhatsApp tests
  test('Wait for WhatsApp button', async () => {
    await page.waitForSelector('#export-type-bar button[data-type="whatsapp"]', { visible: true });
  }, 60000);

  test('Click WhatsApp button', async () => {
    await page.waitForSelector('#export-type-bar button[data-type="whatsapp"]', { visible: true });
    await page.click('#export-type-bar button[data-type="whatsapp"]');
    console.log("WhatsApp button clicked");
  }, 60000);

  test('Wait for drop area text update (WhatsApp)', async () => {
    await page.waitForFunction(() => {
      const dropTextEl = document.getElementById('drop-text');
      return dropTextEl && dropTextEl.textContent === 'Drag and drop a ZIP or TXT file here or click to select';
    }, { timeout: 60000 });
    console.log("Drop area text updated (WhatsApp)");
  }, 60000);

  test('Simulate drag and drop file upload and check WhatsApp output', async () => {
    console.log("Starting WhatsApp file upload test via drag and drop");

    const filePath = path.resolve(__dirname, 'whatsapp-export-source.txt');
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }
    const fileContent = fs.readFileSync(filePath, 'utf8');
    console.log(`Loaded file content from: ${filePath}`);

    await page.evaluate((content) => {
      const dropArea = document.getElementById('drop-area');
      if (!dropArea) throw new Error("Drop area not found");
      const file = new File([content], "whatsapp-export-source.txt", { type: "text/plain" });
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
    console.log("WhatsApp file processed and output available");

    const outputText = await page.$eval('#output', el => el.innerText);
    const expectedTextFile = path.resolve(__dirname, 'whatsapp-export-result.txt');
    const expectedText = fs.readFileSync(expectedTextFile, 'utf8');

    expect(outputText.replace(/\r\n/g, '\n').trim())
      .toBe(expectedText.replace(/\r\n/g, '\n').trim());
  }, 60000);
});
