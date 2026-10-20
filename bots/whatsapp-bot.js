/**
 * Mandate | WhatsApp Bot
 * ─────────────────────────────────────────────────────────────────────────────
 * Uses whatsapp-web.js (QR code scan — no extra account needed).
 *
 * Commands (send as WhatsApp messages to the bot number):
 *   !pay <mandateId> <merchant> <amount>  — Trigger guarded PayPal payment
 *   !mandates                             — List spend mandates
 *   !vault                                — Vault balance
 *   !dashboard                            — Live Command Centre KPIs
 *   !pending                              — Pending approvals
 *   !approve <id>                         — Approve pending item
 *   !fairshare                            — Start FairShare wizard
 *   !help                                 — Show all commands
 *
 * Setup:
 *   1. Run: node bots/whatsapp-bot.js
 *   2. Scan the QR code that appears in your terminal with WhatsApp
 *      (WhatsApp → Linked Devices → Link a Device)
 *   3. Send !help to your own number to verify it works
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const core = require('./payment-core');

// ─── WA client ───────────────────────────────────────────────────────────────
const client = new Client({
  authStrategy: new LocalAuth({ dataPath: require('path').join(__dirname, '.wa-session') }),
  puppeteer: {
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  }
});

// ─── Wizard sessions (per user) ───────────────────────────────────────────────
const sessions = {};
function getSession(from) {
  if (!sessions[from]) sessions[from] = { step: null, data: {} };
  return sessions[from];
}
function clearSession(from) { sessions[from] = { step: null, data: {} }; }

function money(n) { return `₹${Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`; }

// ─── QR code ──────────────────────────────────────────────────────────────────
client.on('qr', (qr) => {
  console.log('\n📱 Scan this QR code with WhatsApp (Linked Devices → Link a Device):\n');
  qrcode.generate(qr, { small: true });
  console.log('\nWaiting for scan…');
});

client.on('authenticated', () => console.log('✅ WhatsApp authenticated — session saved'));
client.on('auth_failure', (msg) => console.error('❌ Auth failure:', msg));
client.on('ready', () => {
  console.log('🚀 Mandate WhatsApp Bot is ready!');
  console.log('   Send !help to any chat to get started.');
});
client.on('disconnected', (reason) => console.warn('📵 Disconnected:', reason));

// ─── Message handler ──────────────────────────────────────────────────────────
client.on('message', async (msg) => {
  const body = msg.body.trim();
  const from = msg.from;

  // ── !help ──────────────────────────────────────────────────────────────────
  if (body === '!help') {
    return msg.reply(`📋 *Mandate WhatsApp Bot — Commands*

💳 *Payments*
!pay <mandateId> <merchant> <amount>
  → Triggers a guarded PayPal payment
  → Example: !pay mandate-abc AWS 250

💼 *Freelancer CFO*
!cfo <prompt>
  → Autonomous treasury, invoicing, FX parity & reminders
  → Examples:
    !cfo Invoice Acme Corp 2500 EUR
    !cfo Convert 1500 USD to EUR
    !cfo Draft payment reminder for late receivables
    !cfo What is my tax reserve and runway?

📊 *Info*
!mandates   → List active mandates
!vault      → Vault balance & committed spend
!dashboard  → Live Command Centre KPIs
!pending    → Pending approval queue

✅ *Approvals*
!approve <approvalId>

🤝 *FairShare*
!fairshare  → Interactive group expense split

All payments are routed through the real Mandate guardrail → PayPal pipeline.`);
  }

  // ── !cfo / !freelancer <prompt> ────────────────────────────────────────────
  if (body.startsWith('!cfo') || body.startsWith('!freelancer')) {
    const prompt = body.replace(/^!(?:cfo|freelancer)\s*/i, '').trim();
    if (!prompt) {
      return msg.reply(`💼 *Freelancer CFO Treasury Command*\n\nAsk me anything or provide an autonomous treasury directive:\n\n• *!cfo Invoice Acme Corp 2500 EUR* — Create PayPal formal invoice\n• *!cfo Convert 1500 USD to EUR* — Live Google parity currency exchange\n• *!cfo Draft payment reminder for late receivables* — Executive reminder\n• *!cfo What is my tax reserve and runway?* — Treasury overview`);
    }
    await msg.reply(`⚙️ Processing with Freelancer CFO…`);
    try {
      const result = await core.cfoChat(prompt);
      return msg.reply(result.response || '✅ Operation completed by Freelancer CFO.');
    } catch (e) {
      return msg.reply(`❌ Freelancer CFO error: ${e.message}`);
    }
  }

  // ── !mandates ──────────────────────────────────────────────────────────────
  if (body === '!mandates') {
    try {
      const mandates = await core.listMandates();
      if (!Array.isArray(mandates) || mandates.length === 0) {
        return msg.reply('📭 No active mandates. Create one in the Mandate web console.');
      }
      const lines = mandates.map(m => {
        const pct = m.spendLimit > 0 ? Math.round((m.currentSpend / m.spendLimit) * 100) : 0;
        const bar = '█'.repeat(Math.round(pct / 10)) + '░'.repeat(10 - Math.round(pct / 10));
        return `*${m.name}* (${m.id})\n${bar} ${pct}%\nSpent: ${money(m.currentSpend)} / ${money(m.spendLimit)} · ${m.status}`;
      });
      return msg.reply(`🛡️ *Active Mandates (${mandates.length})*\n\n${lines.join('\n\n')}`);
    } catch (e) {
      return msg.reply(`⚠️ Error: ${e.message}`);
    }
  }

  // ── !vault ─────────────────────────────────────────────────────────────────
  if (body === '!vault') {
    try {
      const v = await core.getVault();
      return msg.reply(`💰 *Vault Status*\n\nTotal:     ${money(v.amount || 0)}\nCommitted: ${money(v.committed || 0)}\nAvailable: ${money(v.available || 0)}`);
    } catch (e) { return msg.reply(`⚠️ Error: ${e.message}`); }
  }

  // ── !dashboard ─────────────────────────────────────────────────────────────
  if (body === '!dashboard') {
    try {
      const d = await core.getDashboard();
      return msg.reply(`📊 *Command Centre — Live KPIs*\n\nRails today:       ${d.railsToday || 0}\nPayments today:    ${money(d.paymentsToday || 0)}\nGuardrails fired:  ${d.blockedCount || 0}\nPending review:    ${d.pending || 0}\nAuto-approval:     ${d.autoApprovalRate || 0}%\nSettlement latency: ${d.settlementLatency || 'N/A'}`);
    } catch (e) { return msg.reply(`⚠️ Error: ${e.message}`); }
  }

  // ── !pending ───────────────────────────────────────────────────────────────
  if (body === '!pending') {
    try {
      const items = await core.getPendingApprovals();
      if (items.length === 0) return msg.reply('✅ Approval queue is clear.');
      const lines = items.map(a => `• ${a.id}\n  ${a.title || a.type} — ${money(a.amount || 0)}\n  → !approve ${a.id}`);
      return msg.reply(`⏳ *Pending Approvals (${items.length})*\n\n${lines.join('\n\n')}`);
    } catch (e) { return msg.reply(`⚠️ Error: ${e.message}`); }
  }

  // ── !approve <id> ──────────────────────────────────────────────────────────
  if (body.startsWith('!approve ')) {
    const id = body.replace('!approve ', '').trim();
    try {
      const result = await core.approveItem(id);
      if (result.status === 'approved') {
        return msg.reply(`✅ Approved! Item \`${id}\` approved — pipeline continuing.`);
      }
      return msg.reply(`⚠️ Unexpected status: ${result.status}`);
    } catch (e) { return msg.reply(`❌ Approval failed: ${e.message}`); }
  }

  // ── !pay <mandateId> <merchant> <amount> [currency] ───────────────────────
  const payMatch = body.match(/^!pay\s+(\S+)\s+(\S+)\s+(\d+(?:\.\d+)?)(?:\s+(\S+))?$/i);
  if (payMatch) {
    const [, mandateId, merchant, amountStr, currency = 'USD'] = payMatch;
    const amount = parseFloat(amountStr);
    await msg.reply(`⚙️ Processing payment…\n\nMandate: ${mandateId}\nMerchant: ${merchant}\nAmount: ${money(amount)} ${currency}\n\n_Evaluating guardrails → PayPal…_`);
    try {
      const result = await core.executePayment({
        mandateId, merchant, amount, currency,
        description: `WhatsApp bot payment to ${merchant}`,
        category: 'bot-initiated', source: 'whatsapp_bot'
      });
      if (result.ok) {
        return msg.reply(`✅ *Payment Successful!*\n\nOrder ID:   ${result.orderId}\nCapture ID: ${result.captureId}\nAmount:     ${money(result.amount)} ${result.currency}\nLatency:    ${result.latency}\nChannel:    WhatsApp → Mandate → PayPal`);
      } else {
        return msg.reply(`🚫 *Payment Blocked at ${result.stage}*\n\nReason: ${result.reason}\nDecision: ${result.decision || 'N/A'}\nLatency: ${result.latency}`);
      }
    } catch (e) { return msg.reply(`❌ Payment error: ${e.message}`); }
  }

  // ── !pay (no args) → wizard ────────────────────────────────────────────────
  if (body === '!pay') {
    const session = getSession(from);
    session.step = 'pay_mandate';
    session.data = {};
    try {
      const mandates = await core.listMandates();
      if (!Array.isArray(mandates) || mandates.length === 0) {
        clearSession(from);
        return msg.reply('📭 No mandates found. Create one in the web console first.');
      }
      const list = mandates.map((m, i) => `${i + 1}. ${m.name} (${m.id})`).join('\n');
      session.data.mandateList = mandates;
      return msg.reply(`💳 *New Payment — Step 1/3*\n\nReply with the mandate number:\n\n${list}`);
    } catch (e) {
      clearSession(from);
      return msg.reply(`❌ Error: ${e.message}`);
    }
  }

  // ── !fairshare ─────────────────────────────────────────────────────────────
  if (body === '!fairshare') {
    const session = getSession(from);
    session.step = 'fs_participants';
    session.data = { type: 'fairshare' };
    return msg.reply(`🤝 *FairShare — Group Expense Split*\n\nEnter participant names separated by commas:\nExample: Alice, Bob, Charlie`);
  }

  // ── Wizard step handler ────────────────────────────────────────────────────
  const session = getSession(from);
  if (!session.step) return;

  // Pay wizard
  if (session.step === 'pay_mandate') {
    const idx = parseInt(body) - 1;
    const mandates = session.data.mandateList || [];
    if (isNaN(idx) || idx < 0 || idx >= mandates.length) {
      return msg.reply(`⚠️ Enter a number between 1 and ${mandates.length}`);
    }
    session.data.mandateId = mandates[idx].id;
    session.step = 'pay_merchant';
    return msg.reply(`💳 *Step 2/3* — Merchant name?\nExample: AWS, Stripe, Vercel`);
  }

  if (session.step === 'pay_merchant') {
    session.data.merchant = body;
    session.step = 'pay_amount';
    return msg.reply(`💳 *Step 3/3* — Amount in USD?\nExample: 250 or 49.99`);
  }

  if (session.step === 'pay_amount') {
    const amount = parseFloat(body);
    if (isNaN(amount) || amount <= 0) return msg.reply('⚠️ Enter a valid positive number.');
    session.data.amount = amount;
    const { mandateId, merchant } = session.data;
    clearSession(from);

    await msg.reply(`⚙️ Processing…\nMandate: ${mandateId}\nMerchant: ${merchant}\nAmount: ${money(amount)} USD`);
    try {
      const result = await core.executePayment({
        mandateId, merchant, amount, currency: 'USD',
        description: `WhatsApp bot payment to ${merchant}`,
        category: 'bot-initiated', source: 'whatsapp_bot'
      });
      if (result.ok) {
        return msg.reply(`✅ *Payment Successful!*\n\nOrder: ${result.orderId}\nCapture: ${result.captureId}\nAmount: ${money(result.amount)} ${result.currency}\nLatency: ${result.latency}`);
      } else {
        return msg.reply(`🚫 *Blocked at ${result.stage}*\n\n${result.reason}`);
      }
    } catch (e) { return msg.reply(`❌ Error: ${e.message}`); }
  }

  // FairShare wizard
  if (session.step === 'fs_participants') {
    session.data.participants = body.split(',').map(s => s.trim()).filter(Boolean);
    session.step = 'fs_items';
    return msg.reply(`🤝 Enter items as Name:Price pairs, one per line:\nExample:\nDinner:80\nWine:45\nDessert:22`);
  }

  if (session.step === 'fs_items') {
    const items = body.split('\n').map(line => {
      const [name, price] = line.split(':');
      return { name: (name || '').trim(), price: parseFloat((price || '0').trim()), quantity: 1 };
    }).filter(i => i.name && !isNaN(i.price));

    if (items.length === 0) return msg.reply('⚠️ No valid items. Format: Name:Price per line.');

    const { participants } = session.data;
    clearSession(from);

    try {
      const result = await core.fairshareCalculate(participants, items, 'WhatsApp FairShare');
      const lines = result.settlements.map(s => `• ${s.person}: owes ${money(s.owes)}`);
      return msg.reply(`🤝 *FairShare Result*\n\nTotal: ${money(result.totalAmount)}\nPer person: ${money(result.sharePerPerson)}\n\n${lines.join('\n')}\n\nUse !pay to settle via PayPal`);
    } catch (e) { return msg.reply(`❌ FairShare error: ${e.message}`); }
  }
});

// ─── Initialize ───────────────────────────────────────────────────────────────
client.initialize().catch(err => {
  console.error('❌ WhatsApp client init failed:', err.message);
  if (err.message.includes('puppeteer') || err.message.includes('chromium')) {
    console.error('   Try: npx puppeteer browsers install chrome');
  }
});
