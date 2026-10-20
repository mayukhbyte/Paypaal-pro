/**
 * Mandate | Telegram Bot
 * ─────────────────────────────────────────────────────────────────────────────
 * Commands:
 *   /start           — Welcome & quick-start guide
 *   /pay             — Initiate a payment (interactive wizard)
 *   /mandates        — List active spend mandates
 *   /vault           — Check vault balance
 *   /dashboard       — Command-centre KPIs
 *   /pending         — List pending approvals
 *   /approve <id>    — Approve a pending item
 *   /fairshare       — Start FairShare session
 *   /help            — Show all commands
 *
 * Setup:
 *   1. Create a bot via @BotFather on Telegram → copy the token
 *   2. Set TELEGRAM_BOT_TOKEN in .env
 *   3. Run: node bots/telegram-bot.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const TelegramBot = require('node-telegram-bot-api');
const core = require('./payment-core');

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;

if (!TOKEN) {
  console.error('\n❌  TELEGRAM_BOT_TOKEN is missing from .env');
  console.error('   → Go to Telegram, open @BotFather, send /newbot, follow the steps,');
  console.error('     then copy the token into your .env as TELEGRAM_BOT_TOKEN=...\n');
  process.exit(1);
}

const bot = new TelegramBot(TOKEN, { polling: true });

// ─── Session state (per-chat wizard) ─────────────────────────────────────────
const sessions = {};

function getSession(chatId) {
  if (!sessions[chatId]) sessions[chatId] = { step: null, data: {} };
  return sessions[chatId];
}
function clearSession(chatId) { sessions[chatId] = { step: null, data: {} }; }

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmt(text) { return text; } // Telegram supports markdown
function money(n) { return `₹${Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`; }

async function sendMsg(chatId, text, opts = {}) {
  return bot.sendMessage(chatId, text, { parse_mode: 'Markdown', ...opts });
}

// ─── /start ───────────────────────────────────────────────────────────────────
bot.onText(/\/start/, async (msg) => {
  const name = msg.from.first_name || 'there';
  await sendMsg(msg.chat.id, `👋 *Hi ${name}!* I'm the *Mandate Finance Bot*.

I connect directly to your *Mandate Command Centre* so you can initiate real PayPal payments, check guardrail status, and manage spend mandates — all from Telegram.

*Quick commands:*
• /pay — Trigger a payment
• /mandates — View spend mandates
• /vault — Vault balance
• /dashboard — Live KPIs
• /pending — Pending approvals
• /help — Full command list`);
});

// ─── /help ────────────────────────────────────────────────────────────────────
bot.onText(/\/help/, async (msg) => {
  await sendMsg(msg.chat.id, `*📋 Mandate Bot — Commands*

💳 *Payments*
/pay \`<mandateId> <merchant> <amount>\`
  → Run a guarded PayPal payment
  → Example: \`/pay mandate-abc AWS 250\`

💼 *Freelancer CFO*
/cfo <prompt> — Autonomous treasury, invoicing, FX parity & reminders
  → Examples:
    /cfo Invoice Acme Corp 2500 EUR
    /cfo Convert 1500 USD to EUR
    /cfo Draft payment reminder for late receivables
    /cfo What is my tax reserve and runway?

📊 *Info*
/mandates — List active mandates
/vault — Vault balance & committed spend
/dashboard — Command-centre live stats
/pending — Pending approval queue
/approve `< approvalId > ` — Approve an item

🤝 *FairShare*
/fairshare — Interactive group expense split

All payments go through the *real guardrail → PayPal pipeline*.`);
});

// ─── /cfo /freelancer ─────────────────────────────────────────────────────────
bot.onText(/\/(?:cfo|freelancer)(?:\s+(.+))?/i, async (msg, match) => {
  const chatId = msg.chat.id;
  const prompt = (match[1] || '').trim();
  if (!prompt) {
    return sendMsg(chatId, `💼 *Freelancer CFO Treasury Command*

I execute autonomous treasury operations directly from Telegram:

• \`/cfo Invoice Acme Corp 2500 EUR\` — Create PayPal formal invoice
• \`/cfo Convert 1500 USD to EUR\` — Live Google parity currency exchange
• \`/cfo Draft payment reminder for late receivables\` — Executive reminder
• \`/cfo What is my tax reserve and runway?\` — Treasury overview`);
  }
  await sendMsg(chatId, `⚙️ *Processing with Freelancer CFO…*`);

  try {
    const result = await core.cfoChat(prompt);
    await sendMsg(chatId, result.response || '✅ Operation completed by Freelancer CFO.');
  } catch (e) {
    await sendMsg(chatId, `❌ Freelancer CFO error: ${e.message}`);
  }
});

// ─── /mandates ────────────────────────────────────────────────────────────────
bot.onText(/\/mandates/, async (msg) => {
  const chatId = msg.chat.id;
  try {
    const mandates = await core.listMandates();
    if (!Array.isArray(mandates) || mandates.length === 0) {
      return sendMsg(chatId, '📭 No active mandates found. Create one in the Mandate web console.');
    }
    const lines = mandates.map(m => {
      const pct = m.spendLimit > 0 ? Math.round((m.currentSpend / m.spendLimit) * 100) : 0;
      const bar = '█'.repeat(Math.round(pct / 10)) + '░'.repeat(10 - Math.round(pct / 10));
      return `*${m.name}* (\`${m.id}\`)\n${bar} ${pct}%\nSpent: ${money(m.currentSpend)} / ${money(m.spendLimit)} · Status: ${m.status}`;
    });
    await sendMsg(chatId, `*🛡️ Active Mandates (${mandates.length})*\n\n${lines.join('\n\n')}`);
  } catch (e) {
    return sendMsg(chatId, `⚠️ Could not fetch mandates: ${e.message}`);
  }
});

// ─── /vault ───────────────────────────────────────────────────────────────────
bot.onText(/\/vault/, async (msg) => {
  const chatId = msg.chat.id;
  try {
    const v = await core.getVault();
    await sendMsg(chatId, `*💰 Vault Status*

• Total:     ${money(v.amount || 0)}
• Committed: ${money(v.committed || 0)}
• Available: ${money(v.available || 0)}`);
  } catch (e) {
    await sendMsg(chatId, `⚠️ Vault error: ${e.message}`);
  }
});

// ─── /dashboard ───────────────────────────────────────────────────────────────
bot.onText(/\/dashboard/, async (msg) => {
  const chatId = msg.chat.id;
  try {
    const d = await core.getDashboard();
    await sendMsg(chatId, `*📊 Command Centre — Live KPIs*

• Rails today:      ${d.railsToday || 0}
• Payments today:   ${money(d.paymentsToday || 0)}
• Guardrails fired: ${d.blockedCount || 0}
• Pending review:   ${d.pending || 0}
• Auto-approval:    ${d.autoApprovalRate || 0}%
• Settlement latency: ${d.settlementLatency || 'N/A'}`);
  } catch (e) {
    await sendMsg(chatId, `⚠️ Dashboard error: ${e.message}`);
  }
});

// ─── /pending ─────────────────────────────────────────────────────────────────
bot.onText(/\/pending/, async (msg) => {
  const chatId = msg.chat.id;
  try {
    const items = await core.getPendingApprovals();
    if (items.length === 0) return sendMsg(chatId, '✅ Approval queue is clear — no pending items.');
    const lines = items.map(a => `• \`${a.id}\` — *${a.title || a.type}* — ${money(a.amount || 0)}\n  Use /approve \`${a.id}\` to approve`);
    await sendMsg(chatId, `*⏳ Pending Approvals (${items.length})*\n\n${lines.join('\n\n')}`);
  } catch (e) {
    await sendMsg(chatId, `⚠️ Error: ${e.message}`);
  }
});

// ─── /approve <id> ────────────────────────────────────────────────────────────
bot.onText(/\/approve (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const id = match[1].trim();
  try {
    const result = await core.approveItem(id);
    if (result.status === 'approved') {
      await sendMsg(chatId, `✅ *Approved!* Item \`${id}\` has been approved and the pipeline will continue.`);
    } else {
      await sendMsg(chatId, `⚠️ Unexpected status: ${result.status}`);
    }
  } catch (e) {
    await sendMsg(chatId, `❌ Approval failed: ${e.message}`);
  }
});

// ─── /pay <mandateId> <merchant> <amount> [currency] ─────────────────────────
bot.onText(/\/pay\s+(\S+)\s+(\S+)\s+(\d+(?:\.\d+)?)(?:\s+(\S+))?/, async (msg, match) => {
  const chatId = msg.chat.id;
  const [, mandateId, merchant, amountStr, currency = 'USD'] = match;
  const amount = parseFloat(amountStr);

  await sendMsg(chatId, `⚙️ *Processing payment…*\n\nMandate: \`${mandateId}\`\nMerchant: ${merchant}\nAmount: ${money(amount)} ${currency}\n\n_Evaluating guardrails → PayPal pipeline…_`);

  try {
    const result = await core.executePayment({
      mandateId, merchant, amount, currency,
      description: `Telegram bot payment to ${merchant}`,
      category: 'bot-initiated',
      source: 'telegram_bot'
    });

    if (result.ok) {
      await sendMsg(chatId, `✅ *Payment Successful!*

• Order ID:   \`${result.orderId}\`
• Capture ID: \`${result.captureId}\`
• Amount:     ${money(result.amount)} ${result.currency}
• Latency:    ${result.latency}
• Channel:    Telegram → Mandate → PayPal`);
    } else {
      await sendMsg(chatId, `🚫 *Payment Blocked at ${result.stage}*

• Reason: ${result.reason}
• Decision: ${result.decision || 'N/A'}
• Latency: ${result.latency}`);
    }
  } catch (e) {
    await sendMsg(chatId, `❌ Payment error: ${e.message}`);
  }
});

// ─── /pay with no args → interactive wizard ───────────────────────────────────
bot.onText(/^\/pay$/, async (msg) => {
  const chatId = msg.chat.id;
  const session = getSession(chatId);
  session.step = 'pay_mandate';
  session.data = {};

  try {
    const mandates = await core.listMandates();
    if (!Array.isArray(mandates) || mandates.length === 0) {
      clearSession(chatId);
      return sendMsg(chatId, '📭 No mandates found. Create one in the web console first.');
    }
    const keyboard = mandates.map(m => [{ text: `${m.name} (${m.id})`, callback_data: `pay_mandate:${m.id}` }]);
    await bot.sendMessage(chatId, '💳 *New Payment — Step 1/3*\n\nSelect a mandate:', {
      parse_mode: 'Markdown',
      reply_markup: { inline_keyboard: keyboard }
    });
  } catch (e) {
    clearSession(chatId);
    await sendMsg(chatId, `❌ Error: ${e.message}`);
  }
});

// ─── /fairshare ───────────────────────────────────────────────────────────────
bot.onText(/\/fairshare/, async (msg) => {
  const chatId = msg.chat.id;
  const session = getSession(chatId);
  session.step = 'fs_participants';
  session.data = { type: 'fairshare' };
  await sendMsg(chatId, `🤝 *FairShare — Group Expense Split*

Enter participant names separated by commas:
_Example: Alice, Bob, Charlie_`);
});

// ─── Callback queries (inline keyboard) ──────────────────────────────────────
bot.on('callback_query', async (query) => {
  const chatId = query.message.chat.id;
  const data = query.data;
  const session = getSession(chatId);

  await bot.answerCallbackQuery(query.id);

  if (data.startsWith('pay_mandate:')) {
    const mandateId = data.split(':')[1];
    session.data.mandateId = mandateId;
    session.step = 'pay_merchant';
    await sendMsg(chatId, `💳 *Step 2/3* — Merchant name?\n\n_Example: AWS, Stripe, Vercel_`);
  }
});

// ─── Text message handler (wizard steps) ─────────────────────────────────────
bot.on('message', async (msg) => {
  if (msg.text && msg.text.startsWith('/')) return; // handled by command handlers
  const chatId = msg.chat.id;
  const session = getSession(chatId);
  const text = (msg.text || '').trim();
  if (!session.step || !text) return;

  // ── Pay wizard ──
  if (session.step === 'pay_merchant') {
    session.data.merchant = text;
    session.step = 'pay_amount';
    return sendMsg(chatId, `💳 *Step 3/3* — Amount in USD?\n\n_Example: 250 or 49.99_`);
  }

  if (session.step === 'pay_amount') {
    const amount = parseFloat(text);
    if (isNaN(amount) || amount <= 0) return sendMsg(chatId, '⚠️ Please enter a valid positive number.');
    session.data.amount = amount;
    const { mandateId, merchant } = session.data;
    clearSession(chatId);

    await sendMsg(chatId, `⚙️ *Processing…*\nMandate: \`${mandateId}\`\nMerchant: ${merchant}\nAmount: ${money(amount)} USD`);

    try {
      const result = await core.executePayment({
        mandateId, merchant, amount, currency: 'USD',
        description: `Telegram bot payment to ${merchant}`,
        category: 'bot-initiated', source: 'telegram_bot'
      });

      if (result.ok) {
        await sendMsg(chatId, `✅ *Payment Successful!*\n\nOrder ID: \`${result.orderId}\`\nCapture: \`${result.captureId}\`\nAmount: ${money(result.amount)} ${result.currency}\nLatency: ${result.latency}`);
      } else {
        await sendMsg(chatId, `🚫 *Blocked at ${result.stage}*\n\n${result.reason}`);
      }
    } catch (e) {
      await sendMsg(chatId, `❌ Error: ${e.message}`);
    }
    return;
  }

  // ── FairShare wizard ──
  if (session.step === 'fs_participants') {
    session.data.participants = text.split(',').map(s => s.trim()).filter(Boolean);
    session.step = 'fs_items';
    return sendMsg(chatId, `🤝 *FairShare — Items*\n\nEnter items as \`Name:Price\` pairs, one per line:\n_Example:_\n\`\`\`\nDinner:80\nWine:45\nDessert:22\n\`\`\``);
  }

  if (session.step === 'fs_items') {
    const items = text.split('\n').map(line => {
      const [name, price] = line.split(':');
      return { name: (name || '').trim(), price: parseFloat((price || '0').trim()), quantity: 1 };
    }).filter(i => i.name && !isNaN(i.price));

    if (items.length === 0) return sendMsg(chatId, '⚠️ No valid items parsed. Format: Name:Price per line.');

    const { participants } = session.data;
    clearSession(chatId);

    try {
      const result = await core.fairshareCalculate(participants, items, 'Telegram FairShare');
      const lines = result.settlements.map(s => `• ${s.person}: owes ${money(s.owes)}`);
      await sendMsg(chatId, `🤝 *FairShare Result*\n\nTotal: ${money(result.totalAmount)}\nPer person: ${money(result.sharePerPerson)}\n\n*Individual shares:*\n${lines.join('\n')}\n\n_Use /pay to settle via PayPal_`);
    } catch (e) {
      await sendMsg(chatId, `❌ FairShare error: ${e.message}`);
    }
  }
});

// ─── Error handling ───────────────────────────────────────────────────────────
bot.on('polling_error', (err) => console.error('[Telegram] Polling error:', err.message));

console.log('🤖 Mandate Telegram Bot started. Waiting for messages…');
console.log('   Commands: /start /pay /mandates /vault /dashboard /pending /approve /fairshare');
