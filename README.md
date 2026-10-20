# Mandate Pro | Autonomous Agent Finance, Multi-Rail Treasury & MayukhUPI Gateway

[![Vercel Deployment](https://img.shields.io/badge/Vercel-Live%20Production-black?logo=vercel)](https://paypaal-mandate.vercel.app)
[![Node.js](https://img.shields.io/badge/Node.js-v18%2B-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5.x-blue.svg)](https://expressjs.com/)
[![PayPal Live SDK](https://img.shields.io/badge/PayPal-Real--Time%20Orders%20%26%20Capture-003087.svg)](https://developer.paypal.com/)
[![MayukhUPI PG](https://img.shields.io/badge/MayukhUPI-Self--Hosted%20Gateway%20V2-0b63e5.svg)]()
[![Market Parity](https://img.shields.io/badge/Market-Live%20Google%20FX%20%26%20Yahoo%20Finance-00c853.svg)]()
[![Multi-Channel Bots](https://img.shields.io/badge/Bots-Telegram%20%26%20WhatsApp%20Rails-25D366.svg)]()
[![Currency](https://img.shields.io/badge/Currency-Native%20INR%20(%E2%82%B9)-ff9933.svg)]()
[![License](https://img.shields.io/badge/License-MIT-black.svg)](LICENSE)

> **Mandate Pro** is an enterprise-grade autonomous financial operations hub, scoped treasury control center, and sovereign payment gateway suite. It unifies **PayPal's Official Real-Time API**, the **MayukhUPI Self-Hosted Multi-Rail Gateway**, **Live Google Currency Parity**, **Yahoo Finance Market Telemetry**, **Conversational AI CFO Treasury Ops**, **Clinical Emergency Triage & Billing**, **Multi-Factor AI Stock Trading Signals**, **AI Neural Dispute Arbitration**, and **Autonomous Telegram & WhatsApp Settlement Bots** into a seamless, high-performance financial operating system.

---

## 🌐 Live Deployments & Endpoints

- **Live Production URL**: [https://paypaal-mandate.vercel.app](https://paypaal-mandate.vercel.app)
- **Localhost Development**: `http://localhost:3000`
- **MayukhUPI Checkout Drawer**: `http://localhost:3000/checkout/:id`
- **MayukhUPI Showcase Store**: `http://localhost:3000/mayukhupi/store`
- **Merchant Operations Console**: `http://localhost:3000/#merchant-ops`
- **Developer Security Dark Hub**: `http://localhost:3000/#developer-hub`
- **Interactive API Backend Tester**: `http://localhost:3000/backend`

---

## 🌟 Flagship Features & Real-Time Modules

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                 MANDATE PRO COMMAND CENTER                             │
├───────────────────────────────┬───────────────────────────────┬────────────────────────┤
│   MayukhUPI Sovereign PG      │   Clinical Triage & Billing   │   AI Neural Dispute    │
│   • SQLite Ledger V2          │   • Sensor Vitals Streaming   │   • Win Rate Predictor │
│   • UPI PIN & QR Deep Links   │   • 1-Click MayukhUPI Copay   │   • Carrier POD Inject │
│   • Merchant Operations Hub   │   • Automated Tier Invoicing  │   • Sec. 11 Statutory  │
├───────────────────────────────┼───────────────────────────────┼────────────────────────┤
│   Freelancer AI CFO & FX      │   Live Stocks & AI Signals    │   Multi-Rail Bots      │
│   • Google Parity Engine      │   • Yahoo Finance Intraday    │   • WhatsApp Webhook   │
│   • SGD/EUR/USD to INR Conv.  │   • 10-Factor RSI/SMA Rules   │   • Telegram Commands  │
│   • Natural Language Treasury │   • Real-Time Vault Sync      │   • Instant Receipts   │
└───────────────────────────────┴───────────────────────────────┴────────────────────────┘
```

---

### 1. ⚡ MayukhUPI PG: Sovereign Self-Hosted Multi-Rail Payment Gateway
A full-stack, enterprise-grade, self-hosted payment gateway suite built for zero-dependency local sovereignty and instant UPI settlement:
- **Unified Split-View & Drawer Checkout (`/checkout/:id`)**:
  - Side-by-side merchant order summaries, dynamic live QR code generation (`/checkout/:id/qr.svg`), and deep-link intents for Google Pay, PhonePe, Paytm, BHIM, and native UPI apps.
  - Multi-rail checkout tabs supporting **UPI**, **PayPal Cross-Rail**, **Cash on Delivery (Doorstep Cash)**, and **Cash at Counter (Till)**.
- **SQLite Sovereign Ledger (`YouPI-PG-main/data/youpi_pg.sqlite`)**:
  - Complete relational schema storing merchants, payment sessions, bank observations, device bindings, and customer KYC records.
  - Automatic banking observer feed (`payment_observations`) recording sender VPA, bank reference number (UTR), and fingerprint hashes.
- **Interactive Verification & Receipt Engine**:
  - Real-time UPI PIN authentication dialog with cryptographic transaction hashing (`SHA256`).
  - Automated generation of file-backed JSON ledger logs (`/data/payments/payment_*.json`) and printable HTML receipts (`/data/payments/receipt_*.html`).
- **Real-Time Merchant Operations Console & Developer Hub**:
  - Live transaction stream, webhook logs, and dispute telemetry.
  - Cryptographic security suite with API key management, 256-bit bank encryption validation, and device binding (`MAYUKHUPI_V2_ECDSA` protocol).

---

### 2. 🏥 Clinical Triage & Emergency Patient Copay Billing
Engineered for medical facilities, trauma centers, and autonomous clinic operations:
- **Real-Time Patient Intake Queue (`#triage`)**:
  - Live sensor vitals streaming: **Heart Rate (HR)**, **Blood Pressure (BP)**, **Oxygen Saturation (SpO2)**, and **Body Temperature**.
  - Intelligent triage tier classification: **Critical** (₹12,750), **Urgent** (₹6,375), and **Standard** (₹2,975).
- **Automated Workflow Pipeline**:
  - `Awaiting Assessment` ➔ `Clinician Assessed` ➔ `Invoice Dispatched` ➔ `Copay Paid`.
- **1-Click Localhost MayukhUPI Settlement**:
  - Clicking **"⚡ Pay with MayukhUPI"** checks vault sufficiency, generates a checkout session, and seamlessly redirects to the localhost MayukhUPI PG portal (`/checkout/:id`).
  - Settlement updates the patient record to `Copay Paid` via `MayukhUPI Gateway` and issues an audit receipt (`CAP-MAYUKH-...`) with instant SSE broadcast.
- **Omni-Channel Redundancy**:
  - Alternate direct settlement rails via **PayPal Sandbox Rail**, **WhatsApp Medical Bot**, and **Telegram Clinical Rail**.

---

### 3. 🇮🇳 100% Native INR (₹) Financial Architecture & Dynamic Vault
Complete eradication of arbitrary USD denominations in favor of a true Indian Rupee standard:
- **Native INR Denomination Everywhere**:
  - Procurement agreed & unit rates, Dispute Resolver claim values and recovery calculations, Stock buy/sell cost basis, FairShare splits, and Triage copays operate natively in **₹ INR**.
- **Dynamic Operational Vault (₹0 to Infinity)**:
  - Supports any custom capital threshold from zero to infinity.
  - Built-in sufficiency safeguards: transactions exceeding available vault funds trigger immediate, helpful alerts (`"You don't have sufficient money present in your vault to spend."`).
  - Pre-configured quick-topup presets (₹25,000, ₹50,000, ₹1,00,000, ₹5,00,000).

---

### 4. 💼 Freelancer AI CFO: Live Google Currency Parity & Conversational Treasury
- **Real-Time Google Currency Parity Engine (`/api/rates` & `/api/fx/convert`)**:
  - Live market rates with zero bank markup across **EUR, USD, GBP, INR, JPY, CAD, AUD, CHF, SGD**.
  - Automatic cross-currency normalization: converts foreign invoices (e.g. `5,643 SGD` converted to `₹4,18,592.90 INR` at live Google parity) so operators can settle foreign claims domestically via MayukhUPI or PayPal.
- **Conversational AI Treasury Agent (`/api/ai/cfo-chat`)**:
  - *"Invoice Acme Corp for ₹50,000"* ➔ automatically creates active receivable records.
  - *"Market parity 5000 EUR to INR"* ➔ dynamically calculates conversions and updates interactive cards.
  - *"Draft reminder for overdue invoices"* ➔ drafts professional collection emails with integrated payment links.
  - Calculates self-employment tax reserves (28%) and runway projections.

---

### 5. 📈 Real-Time Stocks & Multi-Factor AI Trading Advisor
- **100% Zero-Mock Market Data**:
  - Intraday 5-minute price series, highs, lows, and volume fetched directly from live **Yahoo Finance** market charts.
  - Add any custom stock ticker (`NVDA`, `AAPL`, `MSFT`, `TSLA`, `GOOGL`, etc.) to track quotes in real time.
- **Interactive High-Definition Canvas Chart**:
  - Canvas-rendered dynamic gradient area charts with live crosshairs and intraday session statistics.
- **10-Factor AI Stock Trading Engine**:
  - Analyzes **RSI (Relative Strength Index)**, **intraday SMA**, **day change %**, and **unrealized P&L bands**.
  - Delivers actionable intelligence: `BUY DIP / ACCUMULATE`, `TRIM / TAKE PROFIT`, `STOP-LOSS CAUTION`, or `ACCUMULATE / RIDE TREND`.
- **Instantaneous Vault Balance Synchronization**:
  - Buying shares deducts cost basis directly from the operational vault balance.
  - Selling shares liquidates holdings and credits proceeds immediately back to the vault with real-time SSE telemetry.

---

### 6. ⚖️ AI Neural Dispute Arbitrator & PayPal Seller Protection Console
- **High-Tech Cyber/Fintech HUD**:
  - Dark glassmorphism command console with animated scanlines, active status LEDs, and sub-30ms endpoint latency telemetry.
- **1-Click Proof of Delivery (POD) Preset Injection**:
  - Ingests verified tracking references, electronic signature scans, and GPS stamps (`⚡ FedEx Express POD`, `⚡ UPS Signature POD`, `⚡ DHL Express Geostamp`).
- **Predictive Win-Rate & Capital Recovery Engine**:
  - Real-time win probability estimation (up to **98%**) and projected recovery calculation:
    $$\text{Estimated Recovery} = \frac{\text{Disputed Claim (INR)} \times \text{Win Rate \%}}{100}$$
- **Statutory Legal Rebuttal Synthesizer**:
  - Synthesizes comprehensive legal defense filings invoking **PayPal Seller Protection Policy (Section 11)** with verified carrier POD records and submits them directly to the dispute rail.

---

### 7. 🤖 Multi-Channel Autonomous Bot Settlement Rails
- **Telegram Bot (`bots/telegram-bot.js`)**:
  - Interactive bot commands: `/mandates`, `/balance`, `/stocks`, `/pay` with inline keyboards, webhook callbacks, and instant transaction notifications.
- **WhatsApp Cloud Bot (`bots/whatsapp-bot.js`)**:
  - Remote executive authorizations, emergency budget alerts, and invoice settlement webhooks.
- **Bidirectional Telemetry**:
  - Every bot settlement logs cryptographic audit receipts, credits the treasury vault, and broadcasts live events across the frontend via Server-Sent Events (SSE).

---

### 8. 🛡️ Scoped Spend Mandates & Human Approvals Queue
- **Deterministic Spend Limits**: Per-transaction and monthly limits across autonomous AI agents.
- **Vendor Whitelisting**: Strict merchant restrictions (AWS, GitHub, Cloudflare, OpenAI) with automated policy enforcement (`/api/guardrails/evaluate`).
- **Human-in-the-Loop Queue**: Suspicious transactions, milestone completions, and high-value approvals are routed to human operators for 1-click authorization or rejection.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Cloud Hosting** | **Vercel Serverless Functions** (`@vercel/node`), Production Edge CDN |
| **Backend Core** | Node.js (v18+), Express 5, CORS, Dotenv, CommonJS |
| **Payment Rails** | `@paypal/paypal-server-sdk`, MayukhUPI Self-Hosted Gateway (`YouPI-PG`), SQLite (`node:sqlite`) |
| **Market Intelligence** | Yahoo Finance Real-Time API, Open Exchange Rates / Google Parity API |
| **Messaging & Bots** | `node-telegram-bot-api`, `whatsapp-web.js` / WhatsApp Cloud Webhook |
| **Real-Time Transport** | Server-Sent Events (SSE) `/api/events`, bidirectional state synchronization |
| **Frontend UI** | Vanilla JavaScript (ES6+), Semantic HTML5, Zero heavy client bundle overhead |
| **Styling & HUD** | Vanilla CSS3 Design System, Cyberpunk Glassmorphism, Responsive Mobile Drawers |

---

## 📂 Project Architecture

```
├── server.js               # Express 5 core, live FX parity, Yahoo Finance quotes, PayPal & MayukhUPI routes
├── api-client.js           # Robust client REST wrapper with SSE event subscriptions
├── app.js                  # Modular view renderers for all 10 domain consoles & navigation
├── interactions.js         # Event listeners, modal controllers, checkout redirects, keystroke bindings
├── styles.css              # Universal design system, high-tech HUD cards, animations, responsive CSS
├── backend.html            # Interactive API Developer Console & Live Endpoint Tester
├── index.html              # Main application shell with theme toggles & topbar
├── vercel.json             # Vercel deployment configuration, serverless routing & asset inclusion
├── bots/
│   ├── telegram-bot.js     # Telegram Bot settlement rail and command listeners
│   ├── whatsapp-bot.js     # WhatsApp Bot webhook engine and notification dispatcher
│   └── payment-core.js     # Shared bot payment routing and PayPal bridging
├── YouPI-PG-main/          # Sovereign MayukhUPI Payment Gateway suite
│   ├── apps/
│   │   ├── checkout-portal/# Split-view & mobile checkout drawer UI (checkout.html, QR generator)
│   │   ├── coin-wallet-store/ # MAYUKHUPI showcase store
│   │   └── merchant-admin/ # Real-Time Merchant Operations Console & Developer Security Hub
│   ├── data/               # SQLite database (youpi_pg.sqlite)
│   └── packages/           # Merchant SDK & client integration scripts
├── data/
│   └── payments/           # File-backed JSON transaction logs & printable HTML receipts
└── .env                    # Environment variables (PayPal credentials, bot tokens, port)
```

---

## 🚀 Quickstart Guide

### 1. Prerequisites
- **Node.js** v18.0.0 or higher
- **npm** v9.0.0 or higher
- **Git**

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/mayukhbyte/Paypaal-pro.git
cd Paypaal-pro

# Install dependencies
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root directory:
```env
PORT=3000
PAYPAL_CLIENT_ID=your_paypal_sandbox_client_id
PAYPAL_CLIENT_SECRET=your_paypal_sandbox_client_secret
PAYPAL_ENVIRONMENT=sandbox

# Optional Bot Tokens
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
TELEGRAM_BOT_USERNAME=MandateFinanceBot
WHATSAPP_TOKEN=your_whatsapp_cloud_api_token
```
*(If PayPal credentials are not provided, the server operates in high-fidelity mock sandbox mode automatically).*

### 4. Running Locally
```bash
# Start local server
npm start

# Or with live reload
npm run dev
```
Visit **[http://localhost:3000](http://localhost:3000)** in your browser.

### 5. Deploying to Vercel
The repository includes a ready-to-deploy [`vercel.json`](vercel.json) configuration:
```bash
# Preview deployment
npx vercel --yes

# Deploy to production
npx vercel --prod --yes
```

---

## 🔌 API Reference

| Endpoint | Method | Description |
|---|---|---|
| `/api/mayukhupi/create-checkout` | `POST` | Create a MayukhUPI checkout session (order ID, amount INR, merchant name) |
| `/checkout/:id` | `GET` | Render the MayukhUPI split-view & mobile checkout portal |
| `/api/v1/checkout/:id/confirm-upi` | `POST` | Authenticate UPI PIN, assign UTR, update SQLite ledger, and issue receipt |
| `/api/v1/checkout/:id/confirm-paypal` | `POST` | Confirm cross-rail PayPal settlement within MayukhUPI checkout |
| `/api/triage` | `GET`, `POST` | List patient queue or intake a new patient with vitals |
| `/api/triage/:id/assess` | `POST` | Authorize clinical triage assessment |
| `/api/triage/:id/invoice` | `POST` | Dispatch copay invoice in INR |
| `/api/triage/:id/pay` | `POST` | Settle patient copay via MayukhUPI, PayPal, WhatsApp, or Telegram |
| `/api/rates` | `GET` | Retrieve live Google Finance & interbank currency parity quotes |
| `/api/fx/convert` | `POST` | Real-time currency parity conversion (SGD, EUR, USD, GBP ➔ INR) |
| `/api/ai/cfo-chat` | `POST` | Conversational CFO operations (invoice creation, parity math, reminders) |
| `/api/cfo/invoices/:id/pay` | `POST` | Settle client invoice via MayukhUPI, PayPal, or messaging bots |
| `/api/inventory/stocks` | `GET`, `POST` | Fetch live Yahoo Finance stock quotes or register custom ticker |
| `/api/inventory/stocks/:ticker/ai-suggestion` | `GET` | Multi-factor AI trading recommendations (RSI, SMA, P&L bands) |
| `/api/inventory/stocks/buy` | `POST` | Purchase shares and deduct cost basis from Vault in real time |
| `/api/inventory/stocks/sell` | `POST` | Liquidate shares and deposit proceeds back into Vault |
| `/api/ai/dispute-outlook` | `POST` | Calculate win probability and projected recovery in INR |
| `/api/ai/draft-dispute` | `POST` | Synthesize statutory legal rebuttal (PayPal Seller Protection Sec. 11) |
| `/api/ai/submit-dispute` | `POST` | Transmit dispute package to PayPal Resolution Center |
| `/api/procurement/scan` | `POST` | Dual-document invoice vs purchase order comparison scanner |
| `/api/escrow/:id/checkout` | `POST` | Release milestone developer escrow payout |
| `/api/events` | `GET` | Server-Sent Events (SSE) live telemetry stream |

---

## 📄 License
This project is licensed under the **MIT License**. Built for sovereign autonomous agent financial operations.
