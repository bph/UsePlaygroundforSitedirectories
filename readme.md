# WordPress Playground Screenshot Automation

This project allows you to automate screenshots of a WordPress Playground instance using Node.js, Express, and Playwright.

## Architecture Diagram

```mermaid
sequenceDiagram
    participant User as User (Browser)
    participant Server as Node.js Server (Express + Playwright)
    participant Playwright as Playwright (Headless Browser)
    participant WP as WordPress Playground (iframe)

    User->>Server: GET /screenshot
    Server->>Playwright: Launch browser, open /index.html
    Playwright->>WP: Load Playground in iframe
    WP-->>Playwright: Render site (may take 20s)
    Playwright->>Playwright: Wait for #wp-playground iframe
    Playwright->>Playground: Wait for <body> in iframe
    Playwright->>Playground: Wait extra 20s for full load
    Playwright->>Playwright: Take screenshot of iframe
    Playwright->>Server: Return screenshot
    Server->>User: Send screenshot as HTTP response
    Note over Server: Also saves screenshot to /screenshots directory
    User->>User: (Optional) Download or display screenshot

    User->>Server: (Optional) Open /index.html for manual testing
    User->>User: Click "Take Screenshot" button (triggers /screenshot)
```

## Usage

- Start the server: `node server.js`
- Open `index.html` in your browser for manual testing, or call `/screenshot` for automated screenshots.
