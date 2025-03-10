const path = require('path');

describe('HTML Page Test: Telegram Export', () => {
    beforeAll(async () => {
        await page.goto('http://localhost:3200', { waitUntil: 'domcontentloaded' });
    });

    test('Simplified Test 1: Wait for body', async () => {
        await page.waitForSelector('body');
    }, 60000);

    test('Simplified Test 2: Wait for button', async () => {
        await page.waitForSelector('#btn-telegram', { visible: true });
    }, 60000);

    test('Simplified Test 3: Click button', async () => {
        await page.waitForSelector('#btn-telegram', { visible: true });
        await page.click('#btn-telegram');
    }, 60000);

    test('Step 4: Wait for drop area text update', async () => {
        await page.waitForFunction(() => {
            const dropTextElement = document.getElementById('drop-text');
            return dropTextElement.textContent !== 'Loading export script...';
        }, { timeout: 60000 });
    }, 60000);

    test('Step 5: Upload file, clear input and check output', async () => {
        const filePath = path.join(__dirname, 'telegram-export-examle.json');
        const input = await page.$('#file-input');
        await input.uploadFile(filePath);

        const searchInput = await page.$('#search-word');
        await searchInput.click({ clickCount: 3 });
        await searchInput.press('Backspace');

        await new Promise(r => setTimeout(r, 3000));

        const outputText = await page.$eval('#output', el => el.innerText);

        const expectedText = `03/07/2025 10:27:46 AM (Friday)

Test message 42

-----------------------------------

03/07/2025 07:56:41 AM (Friday)



**(File not included. Change data exporting settings to download.)**

-----------------------------------

03/07/2025 09:18:21 AM (Friday)

Thanks a lot 55

-----------------------------------

03/07/2025 10:05:45 PM (Friday)

Curious emoji 77

-----------------------------------

03/07/2025 10:05:45 PM (Friday)

Bold headline 47

Detailed report 88

**photo_ABCDEF@07-03-2025_22-05-45.jpg**

-----------------------------------

03/07/2025 10:13:07 PM (Friday)

Amazing fact 68

-----------------------------------

03/07/2025 10:12:35 PM (Friday)

Random update 33

-----------------------------------

03/07/2025 10:22:38 PM (Friday)

Daily update 99

-----------------------------------

03/08/2025 10:42:20 AM (Saturday)

https://example.com/link99

-----------------------------------

03/09/2025 04:23:21 PM (Sunday)

Test message 77
(ignore 12)

**photo_XYZ123@09-03-2025_16-23-21.jpg**

-----------------------------------

03/09/2025 04:23:52 PM (Sunday)

Quick update 44

-----------------------------------`;
        //console.log(expectedText);
        //console.log(outputText);

        expect(outputText).toBe(expectedText);
    });
});