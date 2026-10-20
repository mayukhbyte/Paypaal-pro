// @src-type: library
/**
 * Mandate | API Client with Real-Time Server-Sent Events (SSE)
 * ============================================================
 * Bridges the frontend state machine with the Express backend.
 * Provides live bi-directional state synchronization via SSE stream.
 */
(() => {
  "use strict";

  const getBaseUrl = () => {
    if (typeof window === "undefined") return "http://localhost:3000";
    if (window.MANDATE_BACKEND_URL) return window.MANDATE_BACKEND_URL;
    const { protocol, hostname, port, origin } = window.location;
    if (protocol.startsWith("http")) {
      if (port === "3000" || port === "5000" || port === "8080") {
        return origin;
      }
      if (hostname === "localhost" || hostname === "127.0.0.1") {
        return `http://${hostname}:3000`;
      }
      return origin;
    }
    return "http://localhost:3000";
  };

  const BASE = getBaseUrl();
  let backendOnline = false;
  let isRealtimeConnected = false;
  let eventSource = null;
  const eventListeners = new Set();
  let reconnectTimer = null;

  async function request(path, options = {}) {
    try {
      const resp = await fetch(`${BASE}${path}`, {
        headers: { "Content-Type": "application/json", ...options.headers },
        ...options,
      });
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ error: resp.statusText }));
        throw new Error(err.error || resp.statusText);
      }
      return await resp.json();
    } catch (err) {
      console.warn(`[API] ${path} failed:`, err.message);
      throw err;
    }
  }

  // Health check: determine if backend is available
  async function checkHealth() {
    try {
      const data = await request("/api/health");
      backendOnline = data.status === "ok";
      return data;
    } catch {
      backendOnline = false;
      return { status: "offline", paypalConnected: false };
    }
  }

  function updateServerBadge(statusText, color, pulse = true) {
    const badge = document.getElementById("server-status-badge");
    if (!badge) return;
    badge.innerHTML = `<span class="status-dot" style="background:${color}; box-shadow:0 0 0 3px ${color}40; ${pulse ? "animation: pulse 2s infinite" : ""}"></span>${statusText}`;
  }

  function emitRealtimeEvent(type, data) {
    eventListeners.forEach((fn) => {
      try { fn(type, data); } catch (e) { console.error("[SSE Listener]", e); }
    });
    try {
      window.dispatchEvent(new CustomEvent("mandate:sse", { detail: { type, data } }));
    } catch (_) {}
  }

  function subscribe(listener) {
    eventListeners.add(listener);
    return () => eventListeners.delete(listener);
  }

  function connectRealtime() {
    if (eventSource && eventSource.readyState === EventSource.OPEN) return;
    if (eventSource) {
      try { eventSource.close(); } catch (_) {}
    }

    try {
      eventSource = new EventSource(`${BASE}/api/events`);

      eventSource.onopen = () => {
        isRealtimeConnected = true;
        backendOnline = true;
        updateServerBadge("REALTIME LIVE", "#10b981", true);
        console.log("%c[Mandate Realtime] Connected to SSE live stream at " + BASE, "color:#10b981; font-weight:bold");
      };

      eventSource.onerror = () => {
        isRealtimeConnected = false;
        if (eventSource) {
          try { eventSource.close(); } catch (_) {}
          eventSource = null;
        }
        updateServerBadge("RECONNECTING...", "#f59e0b", false);
        if (!reconnectTimer) {
          reconnectTimer = setTimeout(() => {
            reconnectTimer = null;
            connectRealtime();
          }, 3000);
        }
      };

      const eventTypes = [
        "init",
        "dashboard",
        "mandate_created",
        "mandate_updated",
        "mandate_deleted",
        "approval_created",
        "approval_updated",
        "order_created",
        "order_captured",
        "audit_entry",
        "invoice_created",
        "domain_updated",
        "triage_created",
        "triage_updated",
        "triage_deleted",
        "vitals_tick",
        "paypal_status",
        "inventory_updated",
        "inventory_evaluated",
        "escrow_updated",
        "procurement_scanned",
        "vault_updated",
        "user_authenticated",
        "reset",
        // Real-time settlement pipeline events
        "settlement_stage",
        "settlement_complete",
        "settlement_metric",
        "bot_message",
        "inventory_stocks_tick",
      ];

      eventTypes.forEach((type) => {
        eventSource.addEventListener(type, (evt) => {
          try {
            const data = JSON.parse(evt.data);
            emitRealtimeEvent(type, data);
          } catch (err) {
            console.error(`[Mandate Realtime] Failed parsing ${type}:`, err);
          }
        });
      });
    } catch (err) {
      console.warn("[Mandate Realtime] EventSource initialization failed:", err.message);
    }
  }

  // ---------- Dashboard ----------
  async function getDashboard() {
    return request("/api/dashboard");
  }

  // ---------- Mandates ----------
  async function getMandates() {
    return request("/api/mandates");
  }

  async function createMandate(data) {
    return request("/api/mandates", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async function toggleMandate(id) {
    return request(`/api/mandates/${id}/toggle`, { method: "PATCH" });
  }

  async function deleteMandate(id) {
    return request(`/api/mandates/${id}`, { method: "DELETE" });
  }

  // ---------- Guardrails ----------
  async function evaluateGuardrails(mandateId, merchant, amount, category, recordSpend = true) {
    return request("/api/guardrails/evaluate", {
      method: "POST",
      body: JSON.stringify({ mandateId, merchant, amount, category, recordSpend }),
    });
  }

  // ---------- Approvals ----------
  async function getApprovals(filter) {
    const qs = filter && filter !== "all" ? `?filter=${filter}` : "";
    return request(`/api/approvals${qs}`);
  }

  async function createApproval(approvalData) {
    return request("/api/approvals", {
      method: "POST",
      body: JSON.stringify(approvalData),
    });
  }

  async function approvePayment(id, payload) {
    return request(`/api/approvals/${id}/approve`, {
      method: "POST",
      body: payload ? JSON.stringify(payload) : undefined,
    });
  }

  async function denyPayment(id, payload) {
    return request(`/api/approvals/${id}/deny`, {
      method: "POST",
      body: payload ? JSON.stringify(payload) : undefined,
    });
  }

  async function payApproval(id, method = "paypal") {
    return request(`/api/approvals/${id}/pay`, {
      method: "POST",
      body: JSON.stringify({ method }),
    });
  }

  async function undoDecision(id, payload) {
    return request(`/api/approvals/${id}/undo`, {
      method: "POST",
      body: payload ? JSON.stringify(payload) : undefined,
    });
  }

  // ---------- PayPal ----------
  async function createPayPalOrder(amountOrObj, currency, description, mandateId, merchant) {
    let payload = {};
    if (typeof amountOrObj === 'object' && amountOrObj !== null) {
      payload = { ...amountOrObj };
    } else {
      payload = { amount: amountOrObj, currency, description, mandateId, merchant };
    }
    return request("/api/paypal/create-order", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  async function capturePayPalOrder(orderId, mandateId) {
    return request(`/api/paypal/capture-order/${orderId}`, {
      method: "POST",
      body: JSON.stringify({ mandateId }),
    });
  }

  // ---------- FairShare ----------
  async function calculateFairShare(participants, items, context) {
    return request("/api/fairshare/calculate", {
      method: "POST",
      body: JSON.stringify({ participants, items, context }),
    });
  }

  async function sendFairShareRequests(sessionId) {
    return request("/api/fairshare/send-requests", {
      method: "POST",
      body: JSON.stringify({ sessionId }),
    });
  }

  // ---------- CFO ----------
  async function createInvoice(client, amount, currency) {
    return request("/api/cfo/invoices", {
      method: "POST",
      body: JSON.stringify({ client, amount, currency }),
    });
  }

  async function getInvoices() {
    return request("/api/cfo/invoices");
  }

  async function reconcileCurrencies(amount, rate, from, to) {
    return request("/api/cfo/reconcile", {
      method: "POST",
      body: JSON.stringify({ amount, rate, from, to }),
    });
  }

  // ---------- Procurement ----------
  async function compareProcurement(data) {
    return request("/api/procurement/compare", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async function procurementPay(amount, invoiceRef, supplier) {
    return request("/api/procurement/pay", {
      method: "POST",
      body: JSON.stringify({ amount, invoiceRef, supplier }),
    });
  }

  // ---------- Audit Log ----------
  async function getAuditLog(filters = {}) {
    const params = new URLSearchParams();
    if (filters.action) params.set("action", filters.action);
    if (filters.decision) params.set("decision", filters.decision);
    if (filters.limit) params.set("limit", String(filters.limit));
    if (filters.offset) params.set("offset", String(filters.offset));
    const qs = params.toString();
    return request(`/api/audit${qs ? "?" + qs : ""}`);
  }

  // ---------- Custom Domain ----------
  async function getDomainSettings() {
    return request("/api/settings/domain");
  }

  async function updateDomainSettings(domain) {
    return request("/api/settings/domain", {
      method: "POST",
      body: JSON.stringify({ domain }),
    });
  }

  // ---------- Reset ----------
  async function resetDemo() {
    return request("/api/reset", { method: "POST" });
  }

  // ---------- Dispute & AI ----------
  async function draftDispute(transactionRef, shippingEvidence, extras = {}) {
    return request("/api/ai/draft-dispute", {
      method: "POST",
      body: JSON.stringify({ transactionRef, shippingEvidence, ...extras }),
    });
  }

  async function submitDispute(data) {
    return request("/api/ai/submit-dispute", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // ---------- Public API ----------
  window.MANDATE_API = {
    get isOnline() { return backendOnline; },
    get isRealtimeConnected() { return isRealtimeConnected; },
    get baseUrl() { return BASE; },
    request,
    connectRealtime,
    subscribe,
    checkHealth,
    getDashboard,
    getMandates,
    createMandate,
    toggleMandate,
    deleteMandate,
    evaluateGuardrails,
    getApprovals,
    createApproval,
    approvePayment,
    denyPayment,
    undoDecision,
    payApproval,
    createPayPalOrder,
    capturePayPalOrder,
    async createMayukhUpiCheckout(data) {
      return request("/api/mayukhupi/create-checkout", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    async settleFairShare(data) {
      return request("/api/fairshare/settle", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    async settleDispute(data) {
      return request("/api/disputes/settle", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    calculateFairShare,
    sendFairShareRequests,
    createInvoice,
    getInvoices,
    reconcileCurrencies,
    compareProcurement,
    procurementPay,
    draftDispute,
    submitDispute,
    calculateDisputeOutlook,
    cfoChat,
    async payCfoInvoice(id, method = 'paypal', invoiceData = {}) {
      return request(`/api/cfo/invoices/${encodeURIComponent(id)}/pay`, {
        method: 'POST',
        body: JSON.stringify({ method, ...invoiceData }),
      });
    },
    // ---------- Clinical Triage & Billing ----------
    async getTriageQueue() {
      return request("/api/triage");
    },
    async createTriageRecord(data) {
      return request("/api/triage", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    async assessTriage(id) {
      return request(`/api/triage/${id}/assess`, { method: "POST" });
    },
    async invoiceTriage(id) {
      return request(`/api/triage/${id}/invoice`, { method: "POST" });
    },
    async payTriage(id, method = 'paypal') {
      return request(`/api/triage/${id}/pay`, { method: 'POST', body: JSON.stringify({ method }) });
    },

    async deleteTriage(id) {
      return request(`/api/triage/${id}`, { method: "DELETE" });
    },

    // ---------- Real-Time Currency Conversion & Google FX Parity ----------
    async getRates(base = "USD") {
      return request(`/api/rates?base=${encodeURIComponent(base)}`);
    },
    async convertFx(amount, from = "EUR", to = "USD") {
      return request("/api/fx/convert", {
        method: "POST",
        body: JSON.stringify({ amount, from, to }),
      });
    },

    // ---------- Inventory Agent ----------
    async getInventory() {
      return request("/api/inventory");
    },
    async evaluateInventory(data) {
      return request("/api/inventory/evaluate", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    async checkoutInventory(data) {
      return request("/api/inventory/checkout", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    async addInventoryItem(data) {
      return request("/api/inventory/items", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    async simulateInventoryTelemetry(sku, delta = -1) {
      return request("/api/inventory/telemetry", {
        method: "POST",
        body: JSON.stringify({ sku, delta }),
      });
    },
    async getHardwareStocks() {
      return request("/api/inventory/stocks");
    },
    async getStockChart(ticker) {
      return request(`/api/inventory/stocks/${encodeURIComponent(ticker)}/chart`);
    },
    async buyHardwareStock(ticker, units = 1) {
      return request("/api/inventory/stocks/buy", {
        method: "POST",
        body: JSON.stringify({ ticker, units }),
      });
    },
    async sellHardwareStock(ticker, units = 1) {
      return request("/api/inventory/stocks/sell", {
        method: "POST",
        body: JSON.stringify({ ticker, units }),
      });
    },
    async addHardwareStock(data) {
      return request("/api/inventory/stocks/add", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    async getStockAISuggestion(ticker) {
      return request(`/api/inventory/stocks/${encodeURIComponent(ticker)}/ai-suggestion`);
    },

    // ---------- Developer Escrow (3-Stage Workflow) ----------
    async getEscrow() {
      return request("/api/escrow");
    },
    async createEscrow(data) {
      return request("/api/escrow", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    async verifyEscrowEvidence(id, evidence) {
      return request(`/api/escrow/${id}/evidence`, {
        method: "POST",
        body: JSON.stringify({ evidence }),
      });
    },
    async authorizeEscrow(id, reviewer, reviewNotes) {
      return request(`/api/escrow/${id}/authorize`, {
        method: "POST",
        body: JSON.stringify({ reviewer, reviewNotes }),
      });
    },
    async checkoutEscrow(id, payMethod = "paypal") {
      return request(`/api/escrow/${id}/checkout`, { method: "POST", body: JSON.stringify({ method: payMethod }) });
    },

    // ---------- Procurement Dual-Document Anomaly Scanner ----------
    async scanProcurementAnomalies(data) {
      return request("/api/procurement/scan", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    async getProcurementScans() {
      return request("/api/procurement/scans");
    },

    // ---------- PayPal Connect ----------
    async connectPayPal(credentials) {
      return request("/api/paypal/connect", {
        method: "POST",
        body: JSON.stringify(credentials),
      });
    },

    // ---------- Vault Management ----------
    async getVault() {
      return request("/api/vault");
    },
    async updateVault(amount) {
      return request("/api/vault", {
        method: "POST",
        body: JSON.stringify({ amount: Number(amount) }),
      });
    },

    // ---------- User Authentication & OAuth 2.0 ----------
    async login(email, password, name = "", role = "", vaultAmount = null) {
      return request("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password, name, role, vaultAmount }),
      });
    },
    async oauthLogin(provider, email = "", name = "", role = "", vaultAmount = null) {
      return request("/api/auth/oauth", {
        method: "POST",
        body: JSON.stringify({ provider, email, name, role, vaultAmount }),
      });
    },
    async getAuthUsers() {
      return request("/api/auth/users");
    },
    async getAuthMe() {
      return request("/api/auth/me");
    },
    async logout(token = "") {
      return request("/api/auth/logout", {
        method: "POST",
        body: JSON.stringify({ token }),
      });
    },

    // ---------- Real-Time Settlement & Bots ----------
    async getSettlementTimeSeries() {
      return request("/api/settlement/timeseries");
    },
    async getBotsStatus() {
      return request("/api/bots/status");
    },
    async payViaBot(params) {
      return request("/api/bot-pay", {
        method: "POST",
        body: JSON.stringify(params),
      });
    },
    async sendBotCommand(params) {
      return request("/api/bots/command", {
        method: "POST",
        body: JSON.stringify(params),
      });
    },

    // ---------- Public API ----------
    getAuditLog,
    getDomainSettings,
    updateDomainSettings,
    resetDemo,
    reset: resetDemo,
  };

  // Update PayPal sandbox badge based on connection mode
  function updatePayPalBadge(paypalConnected) {
    const badge = document.getElementById("paypal-status-badge");
    if (!badge) return;
    if (paypalConnected) {
      badge.innerHTML = `<span class="status-dot" style="background:#003087; box-shadow:0 0 0 3px #00308740; animation: pulse 2s infinite"></span>PayPal âœ“ Connected`;
      badge.style.color = "#003087";
    } else {
      badge.innerHTML = `<span class="status-dot" style="background:#f59e0b; box-shadow:0 0 0 3px rgba(245,158,11,.2)"></span>PayPal Simulated`;
      badge.style.color = "";
    }
  }

  async function calculateDisputeOutlook(data) {
    return request("/api/ai/dispute-outlook", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async function cfoChat(prompt) {
    return request("/api/ai/cfo-chat", {
      method: "POST",
      body: JSON.stringify({ prompt }),
    });
  }

  // Start real-time connection and check health
  checkHealth().then((health) => {
    updatePayPalBadge(health.paypalConnected);
    if (health.status === "ok") {
      connectRealtime();
    } else {
      updateServerBadge("LOCAL ACTIVE", "#10b981", false);
    }
  }).catch(() => {
    updateServerBadge("LOCAL ACTIVE", "#10b981", false);
  });
})();

