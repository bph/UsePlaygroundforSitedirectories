   // This file is part of <your project name>
   // Copyright (C) 2025 Birgit Pauli-Haack
   //
   // This program is free software: you can redistribute it and/or modify
   // it under the terms of the GNU General Public License as published by
   // the Free Software Foundation, either version 3 of the License, or
   // (at your option) any later version.
   //
   // This program is distributed in the hope that it will be useful,
   // but WITHOUT ANY WARRANTY; without even the implied warranty of
   // MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
   // GNU General Public License for more details.
   //
   // You should have received a copy of the GNU General Public License
   // along with this program.  If not, see <https://www.gnu.org/licenses/>.



const express = require('express');
const { chromium } = require('playwright');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;

// Create screenshots directory if it doesn't exist
const screenshotsDir = path.join(__dirname, 'screenshots');
if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir);
}

// Enable CORS
app.use(cors());

// Serve static files from the current directory
app.use(express.static('.'));

// Screenshot endpoint
app.get('/screenshot', async (req, res) => {
    let browser;
    try {
        // Support debug mode via query parameter
        const headless = req.query.debug !== 'true';
        browser = await chromium.launch({ headless });
        const context = await browser.newContext();
        const page = await context.newPage();

        // Always load the local index.html
        await page.goto('http://localhost:3000/index.html', { waitUntil: 'domcontentloaded', timeout: 30000 });
        await page.waitForSelector('#wp-playground', { timeout: 30000, state: 'attached' });

        const iframeElement = await page.$('#wp-playground');
        if (!iframeElement) throw new Error('Iframe not found');
        const frame = await iframeElement.contentFrame();

        // Wait for the body to appear, then wait extra for Playground to finish
        await frame.waitForSelector('body', { timeout: 60000 });
        await frame.waitForTimeout(20000); // Wait 20 seconds for Playground to finish

        const screenshot = await iframeElement.screenshot({ type: 'png', timeout: 30000 });

        // Save screenshot to file (optional, keep if you want)
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `screenshot-${timestamp}.png`;
        const filepath = path.join(screenshotsDir, filename);
        fs.writeFileSync(filepath, screenshot);

        res.set('Content-Type', 'image/png');
        res.send(screenshot);
        await browser.close();
    } catch (error) {
        if (browser) await browser.close();
        res.status(500).json({ error: error.message });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
}); 