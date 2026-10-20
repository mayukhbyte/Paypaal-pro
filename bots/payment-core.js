/**
 * Mandate | Bot Payment Core
 * Shared payment execution engine for WhatsApp & Telegram bots.
 * Calls the live Mandate backend APIs so all payments flow through
 * the same guardrail → PayPal → SSE pipeline as the web UI.
 */

const http = require('http');
const https = require('https');

const BASE_URL = process.env.BOT_BACKEND_URL || 'http://localhost:3000';

function apiCall(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(`${BASE_URL}${path}`);
    const isHttps = url.protocol === 'https:';
    const lib = isHttps ? https : http;

    const options = {
      hostname: url.hostname,
      port: url.port || (isHttps ? 443 : 80),
      path: url.pathname + url.search,
      method,
      headers: { 'Content-Type': 'application/json' }
    };

    const req = lib.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch { resolve({ raw: data }); }
      });
    });

    req.on('error', reject);
    req.setTimeout(15000, () => { req.destroy(new Error('timeout')); });
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function evaluateGuardrails(mandateId, merchant, amount, category) {
  return apiCall('POST', '/api/guardrails/evaluate', {
    mandateId, merchant, amount: Number(amount), category
  });
}

async function createPayPalOrder(amount, currency, description, mandateId, merchant, source) {
  return apiCall('POST', '/api/paypal/create-order', {
    amount: Number(amount), currency: currency || 'USD',
    description, mandateId, merchant,
    source: source || 'bot'
  });
}

async function capturePayPalOrder(orderId, mandateId, source) {
  return apiCall('POST', `/api/paypal/capture-order/${orderId}`, {
    mandateId,
    source: source || 'bot'
  });
}

async function executePayment({ mandateId, merchant, amount, currency, description, category, source }) {
  const t0 = Date.now();
  const normalizedSource = String(source || 'bot').toLowerCase().includes('whatsapp') ? 'whatsapp_bot' : 'telegram_bot';

  const guard = await evaluateGuardrails(mandateId, merchant, amount, category);
  if (!guard.allowed) {
    return { ok: false, stage: 'guardrail', reason: guard.reason, decision: guard.decision, latency: `${Date.now() - t0}ms` };
  }

  const order = await createPayPalOrder(amount, currency, description || `Payment via ${normalizedSource}`, mandateId, merchant, normalizedSource);
  if (!order.id) {
    return { ok: false, stage: 'create-order', reason: 'PayPal order creation failed', latency: `${Date.now() - t0}ms` };
  }

  const capture = await capturePayPalOrder(order.id, mandateId, normalizedSource);
  const latency = `${((Date.now() - t0) / 1000).toFixed(2)}s`;

  if (capture.status === 'COMPLETED') {
    return {
      ok: true, orderId: order.id, captureId: capture.id, status: 'COMPLETED',
      amount: capture.amount?.value || amount,
      currency: capture.amount?.currency_code || currency || 'USD',
      latency, source: normalizedSource
    };
  }
  return { ok: false, stage: 'capture', reason: `Capture status: ${capture.status}`, orderId: order.id, latency };
}

async function listMandates() { return apiCall('GET', '/api/mandates'); }
async function getVault() { return apiCall('GET', '/api/vault'); }
async function getDashboard() { return apiCall('GET', '/api/dashboard'); }
async function getPendingApprovals() {
  const all = await apiCall('GET', '/api/approvals');
  return (Array.isArray(all) ? all : []).filter(a => a.status === 'pending');
}
async function approveItem(id) {
  return apiCall('POST', `/api/approvals/${id}/approve`, { payload: { approvedViaBot: true } });
}
async function fairshareCalculate(participants, items, context) {
  return apiCall('POST', '/api/fairshare/calculate', { participants, items, context });
}

async function cfoChat(prompt) {
  return apiCall('POST', '/api/ai/cfo-chat', { prompt });
}

module.exports = {
  executePayment, listMandates, getVault, getPendingApprovals,
  approveItem, getDashboard, fairshareCalculate, apiCall, cfoChat
};
