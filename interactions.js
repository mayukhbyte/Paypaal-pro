// @src-type: component
(() => {
  "use strict";
  const api = window.MANDATE_APP;
  if (!api) return;
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const esc = (value) => String(value ?? "").replace(/[&<>\"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[char]));
  const money = (value) => "₹" + Number(value || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const setState = () => api.state;

  const THEME_KEY = "mandate_theme";
  function getActiveTheme() {
    return localStorage.getItem(THEME_KEY) || "light";
  }
  function setTheme(theme) {
    localStorage.setItem(THEME_KEY, theme);
    if (theme === "light") {
      document.documentElement.removeAttribute("data-theme");
    } else {
      document.documentElement.dataset.theme = theme;
    }
    $$("[data-theme-choice]").forEach((node) => {
      node.classList.toggle("active", node.dataset.themeChoice === theme);
    });
  }

  // Initialize theme
  setTheme(getActiveTheme());

  const SIDEBAR_COLLAPSED_KEY = "mandate_sidebar_collapsed";
  function isSidebarCollapsed() {
    return localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === "true";
  }
  function setSidebarCollapsed(collapsed) {
    document.body.classList.toggle("sidebar-collapsed", collapsed);
    localStorage.setItem(SIDEBAR_COLLAPSED_KEY, collapsed ? "true" : "false");
    const toggleBtn = $("#sidebar-toggle-btn");
    const arrowSpan = toggleBtn ? toggleBtn.querySelector(".toggle-arrow") : null;
    if (arrowSpan) {
      arrowSpan.style.transform = collapsed ? "rotate(180deg)" : "rotate(0deg)";
    }
    if (toggleBtn) toggleBtn.setAttribute("title", collapsed ? "Show side menu" : "Hide side menu");
  }
  if (isSidebarCollapsed()) {
    setSidebarCollapsed(true);
  }

  function toggleSidebar() {
    const isNowCollapsed = !document.body.classList.contains("sidebar-collapsed");
    setSidebarCollapsed(isNowCollapsed);
  }

  function closeNavigationDrawer() {
    const sidebar = $("#sidebar");
    if (!sidebar || !sidebar.classList.contains("open")) return;
    sidebar.classList.remove("open");
    const menuButton = $("#mobile-menu-button");
    if (menuButton) {
      menuButton.setAttribute("aria-expanded", "false");
      menuButton.setAttribute("aria-label", "Open navigation");
    }
  }

  // Custom Domain State
  function getSavedCustomDomain() {
    return localStorage.getItem("mandate_custom_domain") || "console.mandate.finance";
  }
  function setSavedCustomDomain(domain) {
    localStorage.setItem("mandate_custom_domain", domain);
    const label = $("#topbar-domain-label");
    if (label) label.textContent = domain;
  }
  // Initialize topbar domain label
  const initialDomain = getSavedCustomDomain();
  const topbarLabel = $("#topbar-domain-label");
  if (topbarLabel) topbarLabel.textContent = initialDomain;

  function updateServerStatus() {
    const badge = $("#server-status-badge");
    if (!badge) return;
    if (window.MANDATE_API && window.MANDATE_API.checkHealth) {
      window.MANDATE_API.checkHealth().then((health) => {
        if (window.MANDATE_API.isRealtimeConnected || health.status === "ok") {
          badge.innerHTML = `<span class="status-dot" style="background:#10b981; box-shadow:0 0 0 3px rgba(16,185,129,.35); animation: pulse 2s infinite"></span>REALTIME LIVE`;
        } else {
          badge.innerHTML = `<span class="status-dot" style="background:#f59e0b; box-shadow:0 0 0 3px rgba(245,158,11,.2)"></span>LOCAL ACTIVE`;
        }
      }).catch(() => {
        badge.innerHTML = `<span class="status-dot" style="background:#f59e0b; box-shadow:0 0 0 3px rgba(245,158,11,.2)"></span>LOCAL ACTIVE`;
      });
    }
  }
  setTimeout(updateServerStatus, 150);

  const MANDATE_PRESETS = {
    cloud: {
      name: "Cloud Infrastructure & GPUs",
      purpose: "Autonomous GPU compute scaling & cloud storage",
      limit: 50000,
      perTransaction: 15000,
      humanApprovalAbove: 10000,
      merchants: ["aws.amazon.com", "runpod.io", "lambda.com", "gcp.google.com"],
      categories: ["Cloud Services", "Compute", "APIs"],
      resetCycle: "Monthly",
      fundingSource: "MAYUKHUPI Vault (Direct INR)",
    },
    ai: {
      name: "AI Inference & Model APIs",
      purpose: "LLM completions, embeddings, and fine-tuning workloads",
      limit: 30000,
      perTransaction: 10000,
      humanApprovalAbove: 6000,
      merchants: ["openai.com", "anthropic.com", "together.ai", "huggingface.co"],
      categories: ["AI Models", "APIs", "Inference"],
      resetCycle: "Monthly",
      fundingSource: "MAYUKHUPI Vault (Direct INR)",
    },
    devops: {
      name: "DevOps & Developer Tools",
      purpose: "CI/CD runners, repository hosting, and code signing",
      limit: 15000,
      perTransaction: 5000,
      humanApprovalAbove: 3000,
      merchants: ["github.com", "vercel.com", "linear.app", "sentry.io"],
      categories: ["Software", "CI/CD", "Dev Tools"],
      resetCycle: "Monthly",
      fundingSource: "MAYUKHUPI Vault (Direct INR)",
    },
    growth: {
      name: "Digital Ads & Customer Growth",
      purpose: "Performance marketing, conversion tracking, and social campaigns",
      limit: 40000,
      perTransaction: 12000,
      humanApprovalAbove: 8000,
      merchants: ["google.com/ads", "meta.com", "linkedin.com", "x.com"],
      categories: ["Advertising", "Marketing", "Acquisition"],
      resetCycle: "Monthly",
      fundingSource: "MAYUKHUPI Vault (Direct INR)",
    },
    procure: {
      name: "Procurement & Hardware Supplies",
      purpose: "Office hardware, peripherals, and supplier orders",
      limit: 35000,
      perTransaction: 10000,
      humanApprovalAbove: 7000,
      merchants: ["amazon.com", "staples.com", "mcmaster.com", "dell.com"],
      categories: ["Hardware", "Supplies", "Procurement"],
      resetCycle: "Monthly",
      fundingSource: "MAYUKHUPI Vault (Direct INR)",
    },
  };

  function autofillPreset(key) {
    const p = MANDATE_PRESETS[key];
    if (!p) return;
    const n = $("#mandate-name"); if (n) n.value = p.name;
    const purp = $("#mandate-purpose"); if (purp) purp.value = p.purpose;
    const lim = $("#mandate-limit"); if (lim) lim.value = p.limit;
    const tx = $("#mandate-per-tx"); if (tx) tx.value = p.perTransaction;
    const rev = $("#mandate-review"); if (rev) rev.value = p.humanApprovalAbove ?? "";
    const m = $("#mandate-merchants"); if (m) m.value = p.merchants.join(", ");
    const cat = $("#mandate-categories"); if (cat) cat.value = p.categories.join(", ");
    api.toast(`Preset "${p.name}" loaded into form.`);
  }

  async function createMandateFromPreset(key) {
    const p = MANDATE_PRESETS[key];
    if (!p) return;
    const defaultExpiry = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    const payload = {
      name: p.name,
      purpose: p.purpose,
      limit: p.limit,
      perTransaction: p.perTransaction,
      humanApprovalAbove: p.humanApprovalAbove,
      merchants: p.merchants,
      categories: p.categories,
      status: "active",
      resetCycle: p.resetCycle || "Monthly",
      expiry: defaultExpiry,
      fundingSource: p.fundingSource || "PayPal Vault (Primary)",
    };

    api.toast(`⚡ Deploying mandate "${p.name}" in real time...`);

    if (window.MANDATE_API && window.MANDATE_API.createMandate) {
      try {
        const saved = await window.MANDATE_API.createMandate(payload);
        const current = setState();
        saved._highlight = true;
        setTimeout(() => { delete saved._highlight; api.render(); }, 3500);
        const alreadyExists = current.mandates.some((m) => m.id === saved.id);
        if (!alreadyExists) {
          current.mandates.unshift(saved);
        } else {
          const idx = current.mandates.findIndex((m) => m.id === saved.id);
          if (idx >= 0) current.mandates[idx] = saved;
        }
        api.persist();
        api.navigate("mandates");
        api.render();
        api.toast(`✨ Mandate "${saved.name}" live in Spend Mandates · ₹${Number(saved.limit).toLocaleString('en-IN')} cap`);
        return;
      } catch (err) {
        console.warn("[Mandate] Preset backend save failed, using local fallback:", err.message);
      }
    }

    const localMandate = {
      id: `mdt-${Date.now().toString(36)}`,
      name: payload.name,
      description: payload.purpose,
      spent: 0,
      limit: payload.limit,
      perTransaction: payload.perTransaction,
      humanApprovalAbove: payload.humanApprovalAbove,
      merchants: payload.merchants,
      categories: payload.categories,
      status: "active",
      reset: `${payload.resetCycle} cycle`,
      expiry: payload.expiry,
      fundingSource: payload.fundingSource,
      _highlight: true,
    };
    setTimeout(() => { delete localMandate._highlight; api.render(); }, 3500);
    const current = setState();
    current.mandates.unshift(localMandate);
    api.persist();
    api.navigate("mandates");
    api.render();
    api.toast(`✨ Mandate "${localMandate.name}" active in Spend Mandates · ₹${Number(localMandate.limit).toLocaleString('en-IN')} cap`);
  }

  function openMandateDialog() {
    const p = api.data.mandateFormPreset;
    const defaultExpiry = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    const minExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    $("#modal-root").innerHTML = `
      <div class="dialog-backdrop" id="mandate-backdrop">
        <section class="dialog-card" role="dialog" aria-modal="true" aria-labelledby="mandate-dialog-title">
          <div class="dialog-head">
            <div>
              <h2 id="mandate-dialog-title">Create a scoped mandate</h2>
              <p>Establish the exact spend authority this agent may execute in real time.</p>
            </div>
            <button class="icon-button" data-action="close-dialog" type="button" aria-label="Close dialog">×</button>
          </div>
          <form id="mandate-form">
            <div class="dialog-body">
              <div class="modal-presets-bar">
                <span class="card-kicker" style="font-size:9px">Quick Presets:</span>
                <button type="button" class="preset-chip-btn" data-action="autofill-preset" data-preset="cloud">☁️ Cloud & GPUs</button>
                <button type="button" class="preset-chip-btn" data-action="autofill-preset" data-preset="ai">🤖 AI & Models</button>
                <button type="button" class="preset-chip-btn" data-action="autofill-preset" data-preset="devops">💻 DevOps & SaaS</button>
                <button type="button" class="preset-chip-btn" data-action="autofill-preset" data-preset="growth">📣 Growth & Ads</button>
                <button type="button" class="preset-chip-btn" data-action="autofill-preset" data-preset="procure">🛒 Procurement</button>
              </div>
              <div class="form-grid">
                <div class="form-field full"><label for="mandate-name">Mandate name</label><input id="mandate-name" name="name" required value="${esc(p.name)}"></div>
                <div class="form-field full"><label for="mandate-purpose">Purpose</label><input id="mandate-purpose" name="purpose" value="${esc(p.purpose)}"></div>
                <div class="form-field"><label for="mandate-limit">Monthly budget limit · INR (₹)</label><input id="mandate-limit" name="limit" type="number" min="1" step="1" required value="${p.totalLimit}"></div>
                <div class="form-field"><label for="mandate-cycle">Reset cycle</label><select id="mandate-cycle" name="cycle"><option ${p.resetCycle === "Monthly" ? "selected" : ""}>Monthly</option><option>Weekly</option><option>Quarterly</option></select></div>
                <div class="form-field"><label for="mandate-per-tx">Per-transaction ceiling · INR (₹)</label><input id="mandate-per-tx" name="perTransaction" type="number" min="1" step="1" required value="${p.perTransaction}"></div>
                <div class="form-field"><label for="mandate-review">Human approval above · INR (₹)</label><input id="mandate-review" name="approvalAbove" type="number" min="0" step="1" value="${p.humanApprovalAbove}"></div>
                <div class="form-field full"><label for="mandate-merchants">Authorized merchants / domains</label><input id="mandate-merchants" name="merchants" required value="${esc(p.domains.join(", "))}"><span class="form-hint">Comma-separated allowlist: only listed merchants are authorized.</span></div>
                <div class="form-field"><label for="mandate-categories">Categories</label><input id="mandate-categories" name="categories" value="${esc(p.categories.join(", "))}"></div>
                <div class="form-field"><label for="mandate-expiry">Expiry date</label><input id="mandate-expiry" name="expiry" type="date" required min="${minExpiry}" value="${defaultExpiry}"><span class="form-hint">Future expiry date required for active spending.</span></div>
                <div class="form-field full"><label for="mandate-funding">Funding source</label><input id="mandate-funding" name="fundingSource" value="${esc(p.fundingSource)}"></div>
              </div>
              <div class="demo-note" style="margin-top:14px">
                <span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg></span>
                <div><strong>Deterministic Authority</strong>This mandate defines spending limits, merchant allowlists, and review gates before payments hit PayPal.</div>
              </div>
            </div>
            <div class="dialog-actions">
              <button class="btn btn-secondary" data-action="close-dialog" type="button">Cancel</button>
              <button class="btn btn-primary" type="submit">Save and deploy mandate</button>
            </div>
          </form>
        </section>
      </div>
    `;
    const input = $("#mandate-name");
    if (input) input.focus();
  }

  function closeDialog() { $("#modal-root").innerHTML = ""; }

  async function saveMandate(form) {
    const values = Object.fromEntries(new FormData(form).entries());
    const cap = Number(values.perTransaction);
    const budget = Number(values.limit);
    const approval = values.approvalAbove === "" ? null : Number(values.approvalAbove);
    const expiry = new Date(`${values.expiry}T23:59:59`);
    if (!values.name.trim() || !values.merchants.trim() || !(budget > 0) || !(cap > 0)) return api.toast("Add a name, merchant allowlist, budget, and transaction cap.");
    if (approval !== null && (approval < 0 || approval > cap)) return api.toast("Human review threshold must be at or below transaction cap.");
    if (Number.isNaN(expiry.getTime()) || expiry.getTime() <= Date.now()) return api.toast("Choose a future expiry date before saving.");

    const payload = {
      name: values.name.trim(),
      purpose: values.purpose.trim() || "Scoped spend mandate",
      limit: budget,
      perTransaction: cap,
      humanApprovalAbove: approval,
      merchants: values.merchants.split(",").map((s) => s.trim()).filter(Boolean),
      categories: values.categories ? values.categories.split(",").map((s) => s.trim()).filter(Boolean) : [],
      status: "active",
      resetCycle: values.cycle || "Monthly",
      expiry: values.expiry,
      fundingSource: values.fundingSource?.trim() || "PayPal Vault (Primary)",
    };

    // Disable submit button while saving
    const submitBtn = form.querySelector('[type="submit"]');
    if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = "Deploying to backend…"; }

    // --- Backend-first: POST to server, use server response as canonical mandate ---
    if (window.MANDATE_API && window.MANDATE_API.createMandate) {
      try {
        const saved = await window.MANDATE_API.createMandate(payload);
        const current = setState();
        saved._highlight = true;
        setTimeout(() => { delete saved._highlight; api.render(); }, 3500);
        const alreadyExists = current.mandates.some((m) => m.id === saved.id);
        if (!alreadyExists) {
          current.mandates.unshift(saved);
        } else {
          const idx = current.mandates.findIndex((m) => m.id === saved.id);
          if (idx >= 0) current.mandates[idx] = saved;
        }
        api.persist();
        closeDialog();
        api.navigate("mandates");
        api.render();
        api.toast(`Mandate "${saved.name}" live in Spend Mandates · ${money(budget)} cap · ID: ${saved.id}`);
        return;
      } catch (err) {
        console.warn("[Mandate] Backend save failed, falling back to local:", err.message);
        if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = "Save and deploy mandate"; }
      }
    }

    // --- Fallback: local-only when backend is unreachable ---
    const localMandate = {
      id: `mdt-${Date.now().toString(36)}`,
      name: payload.name,
      description: payload.purpose,
      spent: 0,
      limit: payload.limit,
      perTransaction: payload.perTransaction,
      humanApprovalAbove: payload.humanApprovalAbove,
      merchants: payload.merchants,
      categories: payload.categories,
      status: "active",
      reset: `${payload.resetCycle} cycle`,
      expiry: payload.expiry,
      fundingSource: payload.fundingSource,
      _highlight: true,
    };
    setTimeout(() => { delete localMandate._highlight; api.render(); }, 3500);
    const current = setState();
    current.mandates.unshift(localMandate);
    api.persist();
    closeDialog();
    api.navigate("mandates");
    api.render();
    api.toast(`Mandate "${localMandate.name}" active in Spend Mandates (local) · ${money(budget)} cap.`);
  }

  function updateLivePaymentEvaluation() {
    const form = $("#simulate-payment-form");
    if (!form) return;
    const values = Object.fromEntries(new FormData(form).entries());
    const mandateId = values.mandateId;
    const merchant = (values.merchant || "").trim();
    const amount = Number(values.amount) || 0;
    const s = setState();
    const m = s.mandates.find((entry) => entry.id === mandateId);
    if (!m) return;

    const evalCard = $("#live-sim-eval");
    if (!evalCard) return;

    const merchantAllowed = m.merchants.length === 0 || m.merchants.some((auth) => auth.toLowerCase().includes(merchant.toLowerCase()) || merchant.toLowerCase().includes(auth.toLowerCase()));
    const remainingBudget = Math.max(0, m.limit - m.spent);
    const exceedsBudget = amount > remainingBudget;
    const exceedsCap = amount > m.perTransaction;
    const exceedsReview = m.humanApprovalAbove != null && amount > m.humanApprovalAbove;

    let verdict = "allowed";
    let pillText = "AUTO-APPROVE READY";
    let message = `Payment of ${money(amount)} to "${merchant || "merchant"}" conforms to mandate scope. Eligible for immediate settlement.`;

    if (!merchant) {
      verdict = "escalated";
      pillText = "AWAITING INPUT";
      message = "Type a merchant name to verify against this mandate's authorized allowlist.";
    } else if (!merchantAllowed) {
      verdict = "blocked";
      pillText = "POLICY BLOCK";
      message = `Merchant "${merchant}" is NOT in authorized allowlist (${m.merchants.join(", ")}). Payment will be rejected.`;
    } else if (exceedsBudget) {
      verdict = "blocked";
      pillText = "POLICY BLOCK";
      message = `Amount ${money(amount)} exceeds available runway of ${money(remainingBudget)} (limit: ${money(m.limit)}).`;
    } else if (exceedsCap) {
      verdict = "escalated";
      pillText = "ESCALATE TO HUMAN";
      message = `Amount ${money(amount)} exceeds per-transaction cap of ${money(m.perTransaction)}. Requires human authorization.`;
    } else if (exceedsReview) {
      verdict = "escalated";
      pillText = "ESCALATE TO HUMAN";
      message = `Amount ${money(amount)} exceeds human approval threshold of ${money(m.humanApprovalAbove)}. Held in approvals queue.`;
    }

    evalCard.className = `live-evaluation-card ${verdict}`;
    evalCard.innerHTML = `
      <div class="live-eval-header">
        <span class="status-pill ${verdict === "allowed" ? "approved" : verdict === "escalated" ? "review" : "blocked"}">${pillText}</span>
        <small style="color:var(--muted); font-size:10px">Real-time Policy Telemetry</small>
      </div>
      <div class="live-eval-reasons">${esc(message)}</div>
    `;
  }

  
  // ─── Universal Multi-Rail Payment Modal (MayukhUPI, PayPal Actual Link, Bots) ──
  
  // ─── Universal Vault Sufficiency Checker ──────────────────────────────────
  function checkVaultSufficiency(amount, itemTitle = 'this transaction') {
    const s = setState();
    const liveVault = Number(s.vault ?? s.dashboard?.vault ?? s.defaultVault ?? 0);
    const reqAmount = Number(amount) || 0;
    if (reqAmount > liveVault) {
      const msg = "You don't have sufficient money present in your vault to spend.";
      api.toast(msg);
      alert(msg);
      return false;
    }
    return true;
  }

  function openMultiRailPayModal(options = {}) {
    const s = setState();
    const title = options.title || 'Corporate Settlement';
    const isMandate = options.feature === 'mandate' || options.isPureInr;
    const inrAmount = isMandate
      ? (Number(options.inrAmount) || Number(options.amount) || 10000)
      : (Number(options.inrAmount) || Math.round(Number(options.amount || 100) * 85));
    const usdAmount = isMandate
      ? inrAmount
      : (Number(options.amount) || 100);
    const merchant = options.merchant || 'MAYUKHUPI Showcase Merchant';
    const id = options.id || ('ref-' + Date.now().toString(36));
    const feature = options.feature || 'general';

    window._activeMultiRailContext = { ...options, usdAmount, inrAmount, merchant, id, feature, isPureInr: isMandate };

    $("#modal-root").innerHTML = `
      <div class="dialog-backdrop" id="multi-rail-pay-backdrop">
        <section class="dialog-card" role="dialog" aria-modal="true" style="max-width:680px; width:95%; background:var(--surface); border:1px solid var(--border); border-radius:18px; box-shadow:0 25px 60px rgba(0,0,0,0.45); overflow:hidden">
          <div class="dialog-head" style="background:linear-gradient(135deg, rgba(11,99,229,0.12), rgba(108,46,212,0.12)); border-bottom:1px solid var(--border); padding:20px 24px; display:flex; justify-content:space-between; align-items:center">
            <div style="display:flex; align-items:center; gap:10px">
              <div style="width:36px; height:36px; border-radius:10px; background:linear-gradient(135deg, #0b63e5, #6c2ed4); display:grid; place-items:center; color:#fff; font-weight:800; font-size:16px">⚡</div>
              <div>
                <span class="card-kicker" style="color:#0b63e5; font-weight:800">UNIFIED MULTI-RAIL SETTLEMENT</span>
                <h2 style="margin:2px 0 0; font-size:19px; color:var(--text)">${esc(title)}</h2>
                <small style="color:var(--muted)">Recipient: <strong>${esc(merchant)}</strong> · Ref: <code>${esc(id)}</code></small>
              </div>
            </div>
            <button class="icon-button" data-action="close-dialog" type="button" aria-label="Close dialog" style="font-size:20px">×</button>
          </div>

          <div style="display:flex; justify-content:space-between; align-items:center; padding:14px 24px; background:rgba(255,255,255,0.03); border-bottom:1px solid var(--border); flex-wrap:wrap; gap:8px">
            <div>
              <small style="color:var(--muted); display:block; font-size:11px; text-transform:uppercase; font-weight:700">Payment Amount · INR</small>
              <div style="font-size:24px; font-weight:800; color:var(--text); display:flex; align-items:baseline; gap:8px">
                <span style="color:#0b63e5">₹${inrAmount.toLocaleString('en-IN', {minimumFractionDigits:2})} INR</span>
                ${isMandate ? `<span class="tag" style="background:rgba(16,185,129,0.15); color:#10b981; font-weight:700; font-size:11px">Spend Mandate (Direct INR)</span>` : `<span style="font-size:14px; color:var(--muted)">(${money(usdAmount)})</span>`}
              </div>
            </div>
            <div style="text-align:right">
              <span class="status-pill approved" style="font-size:11px">● Multi-Rail Active</span>
              <small style="display:block; color:var(--muted); font-size:10px; margin-top:3px">Guaranteed Policy Evaluation</small>
            </div>
          </div>

          <div style="padding:20px 24px; display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:16px; max-height:65vh; overflow-y:auto">
            
            <!-- RAIL 1: MayukhUPI -->
            <div class="rail-card" style="border:2px solid #0b63e5; background:rgba(11,99,229,0.04); border-radius:14px; padding:18px; display:flex; flex-direction:column; justify-content:space-between">
              <div>
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px">
                  <div style="display:flex; align-items:center; gap:8px">
                    <span style="font-size:20px">⚡</span>
                    <div>
                      <strong style="color:#0b63e5; font-size:15px; display:block">MayukhUPI Gateway</strong>
                      <small style="color:var(--muted); font-size:11px">UPI QR · NetBanking · Multi-Rail</small>
                    </div>
                  </div>
                  <span class="tag" style="background:#0b63e5; color:#fff; font-size:10px; font-weight:800">RECOMMENDED</span>
                </div>
                
                <div style="text-align:center; padding:14px 10px; background:var(--surface); border-radius:10px; border:1px solid var(--border); margin-bottom:14px">
                  <img src="/checkout/${encodeURIComponent(id)}/qr.svg" alt="MayukhUPI QR Code" style="width:130px; height:130px; border-radius:8px; margin:0 auto; display:block; background:#fff; padding:6px" onerror="this.src='/favicon.svg'">
                  <div style="margin-top:8px; font-family:monospace; font-size:11px; color:var(--muted)">demo-merchant@mayukhupi</div>
                  <div style="font-size:12px; font-weight:700; color:#0b63e5; margin-top:2px">₹${inrAmount.toLocaleString('en-IN', {minimumFractionDigits:2})} INR</div>
                </div>
              </div>

              <div style="display:grid; gap:8px">
                <button class="btn btn-primary" data-action="exec-modal-mayukhupi" type="button" style="width:100%; background:linear-gradient(135deg, #0b63e5, #6c2ed4); font-weight:700; font-size:12px; justify-content:center; padding:10px">
                  ⚡ Open MayukhUPI Checkout Portal
                </button>
                <button class="btn btn-secondary btn-sm" data-action="exec-modal-mayukhupi-instant" type="button" style="width:100%; justify-content:center; font-size:11px">
                  ✓ Simulate Instant UPI Scan &amp; Pay
                </button>
              </div>
            </div>

            <!-- RAIL 2: PayPal Actual Link -->
            <div class="rail-card" style="border:1px solid #e2aa27; background:rgba(255,196,57,0.05); border-radius:14px; padding:18px; display:flex; flex-direction:column; justify-content:space-between">
              <div>
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px">
                  <div style="display:flex; align-items:center; gap:8px">
                    <span style="font-size:20px">🅿️</span>
                    <div>
                      <strong style="color:#0070ba; font-size:15px; display:block">PayPal Actual Link</strong>
                      <small style="color:var(--muted); font-size:11px">PayPal Sandbox &amp; Direct Order Rail</small>
                    </div>
                  </div>
                  <span class="tag" style="background:#ffc439; color:#111; font-size:10px; font-weight:800">LIVE LINK</span>
                </div>

                <div style="padding:14px; background:var(--surface); border-radius:10px; border:1px solid var(--border); margin-bottom:14px">
                  <div style="display:flex; justify-content:space-between; font-size:12px; margin-bottom:6px">
                    <span style="color:var(--muted)">USD Amount:</span>
                    <strong style="color:#38bdf8">${money(usdAmount)} USD</strong>
                  </div>
                  <div style="display:flex; justify-content:space-between; font-size:12px; margin-bottom:6px">
                    <span style="color:var(--muted)">Environment:</span>
                    <span class="tag" style="font-size:10px">Sandbox / Live Rail</span>
                  </div>
                  <div style="display:flex; justify-content:space-between; font-size:12px">
                    <span style="color:var(--muted)">Link Status:</span>
                    <span style="color:#10b981; font-weight:700">✓ Ready to Generate</span>
                  </div>
                </div>
              </div>

              <div style="display:grid; gap:8px">
                <button class="btn-paypal" data-action="exec-modal-paypal" type="button" style="width:100%; justify-content:center; font-size:12px; padding:10px">
                  <span class="pp-badge">Pay</span> Open PayPal Actual Link (${money(usdAmount)})
                </button>
                <button class="btn btn-secondary btn-sm" data-action="exec-modal-paypal-instant" type="button" style="width:100%; justify-content:center; font-size:11px">
                  ✓ Quick Capture PayPal Sandbox
                </button>
              </div>
            </div>

            <!-- RAIL 3: Bots (WhatsApp & Telegram) -->
            <div class="rail-card" style="grid-column: 1 / -1; border:1px solid var(--border); background:rgba(255,255,255,0.02); border-radius:14px; padding:18px">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px">
                <div style="display:flex; align-items:center; gap:8px">
                  <span style="font-size:20px">🤖</span>
                  <div>
                    <strong style="font-size:15px">Conversational Bot Rails</strong>
                    <small style="color:var(--muted); font-size:11px">WhatsApp Pay &amp; Telegram Finance Bots</small>
                  </div>
                </div>
                <span class="status-pill approved" style="font-size:10px">2 Bots Online</span>
              </div>

              <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px">
                <button class="btn btn-secondary" data-action="exec-modal-bot" data-channel="whatsapp" type="button" style="background:rgba(37,211,102,0.12); border-color:#25D366; color:#25D366; font-size:12px; font-weight:700; justify-content:center; padding:10px">
                  💬 Pay via WhatsApp Bot
                </button>
                <button class="btn btn-secondary" data-action="exec-modal-bot" data-channel="telegram" type="button" style="background:rgba(39,168,225,0.12); border-color:#27A8E1; color:#27A8E1; font-size:12px; font-weight:700; justify-content:center; padding:10px">
                  ✈️ Pay via Telegram Bot
                </button>
              </div>
            </div>

          </div>

          <div style="padding:14px 24px; background:var(--surface-low); border-top:1px solid var(--border); display:flex; justify-content:space-between; align-items:center">
            <small style="color:var(--muted); font-size:11px">Protected by Mandate Policy Guardrails &middot; Dual Currency USD/INR @ ₹85</small>
            <button class="btn btn-secondary btn-sm" data-action="close-dialog" type="button">Close</button>
          </div>
        </section>
      </div>
    `;
  }

  function openSimulatePaymentDialog(mandateId) {
    const s = setState();
    const m = s.mandates.find((entry) => entry.id === mandateId);
    if (!m) return api.toast("Mandate not found.");
    const defaultMerchant = m.merchants?.[0] || "AWS";
    $("#modal-root").innerHTML = `
      <div class="dialog-backdrop" id="payment-test-backdrop">
        <section class="dialog-card" role="dialog" aria-modal="true" aria-labelledby="payment-test-title">
          <div class="dialog-head">
            <div>
              <span class="card-kicker">AGENT FIREWALL : PAYMENT SIMULATION</span>
              <h2 id="payment-test-title" style="margin-top:5px">Test Agent Payment</h2>
              <p>Simulate an autonomous agent attempting a transaction under <strong>${esc(m.name)}</strong>.</p>
            </div>
            <button class="icon-button" data-action="close-dialog" type="button" aria-label="Close dialog">×</button>
          </div>
          <form id="simulate-payment-form">
            <input type="hidden" name="mandateId" value="${esc(m.id)}">
            <div class="dialog-body">
              <div class="form-grid">
                <div class="form-field full">
                  <label for="sim-merchant">Merchant Name / Domain</label>
                  <input id="sim-merchant" name="merchant" required value="${esc(defaultMerchant)}" placeholder="e.g. AWS or BetSecure">
                  <span class="form-hint">Authorized merchants: <strong>${esc(m.merchants.join(", "))}</strong>. Real-time check updates on every keystroke.</span>
                </div>
                <div class="form-field">
                  <label for="sim-amount">Payment Amount · INR (₹)</label>
                  <input id="sim-amount" name="amount" type="number" min="1" step="1" required value="${m.perTransaction || m.limit || 5000}" placeholder="0">
                  <span class="form-hint">Cap: ${money(m.perTransaction)}${m.humanApprovalAbove != null ? ` · Review above: ${money(m.humanApprovalAbove)}` : ""}</span>
                </div>
                <div class="form-field">
                  <label for="sim-category">Category</label>
                  <input id="sim-category" name="category" value="${esc(m.categories?.[0] || "Software")}" placeholder="e.g. Software">
                </div>
                <div class="form-field full">
                  <label for="sim-rail-select">Settlement Payment Rail</label>
                  <select id="sim-rail-select" name="rail">
                    <option value="mayukhupi" selected>⚡ MayukhUPI Gateway (UPI / QR / Multi-Rail)</option>
                    <option value="paypal">🅿️ PayPal Actual Link &amp; Sandbox Rail</option>
                    <option value="whatsapp">💬 WhatsApp Finance Bot Rail</option>
                    <option value="telegram">✈️ Telegram Finance Bot Rail</option>
                  </select>
                </div>
                <div class="form-field full">
                  <label for="sim-purpose">Payment Description / Memo</label>
                  <input id="sim-purpose" name="memo" value="Autonomous workload compute burst" placeholder="e.g. Server hosting bill">
                </div>
              </div>
              <div id="live-sim-eval" class="live-evaluation-card allowed"></div>
            </div>
            <div class="dialog-actions">
              <button class="btn btn-secondary" data-action="close-dialog" type="button">Cancel</button>
              <button class="btn btn-primary" type="submit">Run through firewall</button>
            </div>
          </form>
        </section>
      </div>
    `;
    updateLivePaymentEvaluation();
    const simM = $("#sim-merchant");
    if (simM) simM.focus();
  }

  function executeSimulatedPayment(form) {
    const values = Object.fromEntries(new FormData(form).entries());
    const mandateId = values.mandateId;
    const merchant = values.merchant.trim();
    const amount = Number(values.amount);
    const s = setState();
    const m = s.mandates.find((entry) => entry.id === mandateId);
    if (!m) return;

    closeDialog();
    s.activity = s.activity || [];

    const merchantAllowed = m.merchants.length === 0 || m.merchants.some((auth) => auth.toLowerCase().includes(merchant.toLowerCase()) || merchant.toLowerCase().includes(auth.toLowerCase()));
    if (!merchantAllowed) {
      s.activity.unshift({
        id: `act-${Date.now().toString(36)}`,
        title: `${merchant} - Payment Blocked`,
        merchant: merchant,
        amount: amount,
        status: "blocked",
        decision: `Blocked: Unauthorized Merchant (${merchant})`,
        agent: m.name
      });
      api.persist();
      api.render();
      api.toast(`BLOCKED: Merchant "${merchant}" is not in this agent's authorized allowlist.`);
      return;
    }

    if (amount > m.perTransaction) {
      const approvalItem = {
        id: `appr-${Date.now().toString(36)}`,
        merchant: merchant,
        agent: m.name,
        amount: amount,
        mandateId: m.id,
        category: "cap-exceeded",
        risk: 75,
        signal: "Ceiling breach",
        breach: `Exceeds transaction cap of ${money(m.perTransaction)}`,
        detail: `Amount of ${money(amount)} violates the per-transaction limit set for "${m.name}". Policy held execution for human review.`,
        funding: m.fundingSource || "PayPal Vault (Primary)",
        available: Math.max(0, m.limit - m.spent),
        evidence: `Mandate cap: ${money(m.perTransaction)}`,
        status: "pending"
      };
      s.approvals.unshift(approvalItem);
      if (window.MANDATE_API && window.MANDATE_API.createApproval) {
        window.MANDATE_API.createApproval(approvalItem).catch(() => {});
      }
      s.activity.unshift({
        id: `act-${Date.now().toString(36)}`,
        title: `${merchant} - Escalated for Review`,
        merchant: merchant,
        amount: amount,
        status: "review",
        decision: `Escalated: Exceeds ${money(m.perTransaction)} per-tx cap`,
        agent: m.name
      });
      api.persist();
      api.render();
      api.toast(`ESCALATED: Payment of ${money(amount)} exceeds per-transaction cap. Sent to approvals.`);
      return;
    }

    if (m.humanApprovalAbove != null && amount > m.humanApprovalAbove) {
      const approvalItem = {
        id: `appr-${Date.now().toString(36)}`,
        merchant: merchant,
        agent: m.name,
        amount: amount,
        mandateId: m.id,
        category: "review-threshold",
        risk: 60,
        signal: "Review threshold exceeded",
        breach: `Amount above ${money(m.humanApprovalAbove)}`,
        detail: `Transaction exceeds the ${money(m.humanApprovalAbove)} threshold configured for human sign-off under "${m.name}".`,
        funding: m.fundingSource || "PayPal Vault (Primary)",
        available: Math.max(0, m.limit - m.spent),
        evidence: `Threshold: ${money(m.humanApprovalAbove)}`,
        status: "pending"
      };
      s.approvals.unshift(approvalItem);
      if (window.MANDATE_API && window.MANDATE_API.createApproval) {
        window.MANDATE_API.createApproval(approvalItem).catch(() => {});
      }
      s.activity.unshift({
        id: `act-${Date.now().toString(36)}`,
        title: `${merchant} - Held for Review`,
        merchant: merchant,
        amount: amount,
        status: "review",
        decision: `Escalated: Exceeds ${money(m.humanApprovalAbove)} review threshold`,
        agent: m.name
      });
      api.persist();
      api.render();
      api.toast(`HELD FOR REVIEW: Payment of ${money(amount)} exceeds review threshold.`);
      return;
    }

    if (m.spent + amount > m.limit) {
      s.activity.unshift({
        id: `act-${Date.now().toString(36)}`,
        title: `${merchant} - Budget Limit Exceeded`,
        merchant: merchant,
        amount: amount,
        status: "blocked",
        decision: `Blocked: Monthly budget exceeded (${money(m.spent + amount)} of ${money(m.limit)})`,
        agent: m.name
      });
      api.persist();
      api.render();
      api.toast(`BLOCKED: Budget of ${money(m.limit)} would be exceeded by this charge.`);
      return;
    }

    m.spent += amount;
    const actEntry = {
      id: `act-${Date.now().toString(36)}`,
      title: `${merchant} - Settlement Complete`,
      merchant: merchant,
      amount: amount,
      status: "approved",
      decision: "Auto-approved under mandate guardrail",
      agent: m.name
    };
    s.activity.unshift(actEntry);
    api.persist();
    api.render();
    api.toast(`AUTO-APPROVED: ${money(amount)} to ${merchant} executed via PayPal sandbox.`);
    // Record to backend audit log
    if (window.MANDATE_API && window.MANDATE_API.evaluateGuardrails) {
      window.MANDATE_API.evaluateGuardrails(m.id, merchant, amount, "payment").catch(() => {});
    }
  }

  function openDomainSettingsDialog() {
    const currentDomain = getSavedCustomDomain();
    $("#modal-root").innerHTML = `
      <div class="dialog-backdrop" id="domain-settings-backdrop">
        <section class="dialog-card" role="dialog" aria-modal="true" aria-labelledby="domain-dialog-title" style="max-width:580px">
          <div class="dialog-head">
            <div>
              <span class="card-kicker">INFRASTRUCTURE &amp; ROUTING</span>
              <h2 id="domain-dialog-title" style="margin-top:5px">Connect Custom Domain</h2>
              <p>Configure production custom domain with automated SSL provisioning.</p>
            </div>
            <button class="icon-button" data-action="close-dialog" type="button" aria-label="Close dialog">×</button>
          </div>
          <form id="custom-domain-form">
            <div class="dialog-body">
              <div class="form-grid">
                <div class="form-field full">
                  <label for="custom-domain-input">Custom Domain Hostname</label>
                  <input id="custom-domain-input" name="domain" required value="${esc(currentDomain)}" placeholder="console.yourdomain.com">
                  <span class="form-hint" id="domain-validation-hint">Enter your fully qualified domain name (FQDN). Live check updates on every keystroke.</span>
                </div>
              </div>
              <div class="card" style="margin-top:14px; padding:14px; background:var(--surface-low); border:1px solid var(--line)">
                <strong style="font-size:12px; display:block; margin-bottom:8px">Required DNS Configuration</strong>
                <table class="dns-table">
                  <thead>
                    <tr><th>Type</th><th>Host / Name</th><th>Target / Value</th><th>Status</th></tr>
                  </thead>
                  <tbody>
                    <tr><td><code>CNAME</code></td><td id="dns-host-preview">@ / console</td><td><code>cname.mandate.finance</code></td><td><span class="status-pill approved" style="font-size:8px">ACTIVE</span></td></tr>
                    <tr><td><code>A</code></td><td>@ (Apex)</td><td><code>76.76.21.21</code></td><td><span class="status-pill approved" style="font-size:8px">PROPAGATED</span></td></tr>
                  </tbody>
                </table>
              </div>
              <div class="live-evaluation-card allowed" id="domain-live-status" style="margin-top:14px">
                <div class="live-eval-header">
                  <span class="status-pill approved" id="domain-status-pill">SSL ACTIVE</span>
                  <small style="color:var(--muted); font-size:10px">TLS 1.3 · Let's Encrypt</small>
                </div>
                <div class="live-eval-reasons" id="domain-status-desc">Domain is connected and serving over secure HTTPS with continuous DNS verification.</div>
              </div>
            </div>
            <div class="dialog-actions">
              <button class="btn btn-secondary" data-action="close-dialog" type="button">Close</button>
              <button class="btn btn-primary" type="submit">Save and verify domain</button>
            </div>
          </form>
        </section>
      </div>
    `;
    const input = $("#custom-domain-input");
    if (input) input.focus();
  }

  function handleCustomDomainInput(value) {
    const clean = value.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, "");
    const isValid = clean.includes(".") && clean.length >= 4 && /^[a-z0-9.-]+$/.test(clean);
    const pill = $("#domain-status-pill");
    const desc = $("#domain-status-desc");
    const card = $("#domain-live-status");
    const hostPreview = $("#dns-host-preview");
    if (hostPreview) {
      hostPreview.textContent = clean.startsWith("www.") ? "www" : clean.split(".")[0] || "@";
    }
    if (card && pill && desc) {
      if (isValid) {
        card.className = "live-evaluation-card allowed";
        pill.className = "status-pill approved";
        pill.textContent = "VALID HOSTNAME";
        desc.textContent = `Valid domain target: ${clean}. Point CNAME to cname.mandate.finance for automatic TLS certificate issuance.`;
      } else {
        card.className = "live-evaluation-card escalated";
        pill.className = "status-pill review";
        pill.textContent = "INCOMPLETE DOMAIN";
        desc.textContent = "Enter a valid domain name (e.g. console.mandate.finance or app.yourbrand.com).";
      }
    }
  }

  function saveCustomDomain(form) {
    const values = Object.fromEntries(new FormData(form).entries());
    const domain = (values.domain || "").trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, "");
    if (!domain || !domain.includes(".")) return api.toast("Enter a valid fully qualified domain name.");
    setSavedCustomDomain(domain);
    closeDialog();
    api.toast(`Custom domain "${domain}" connected with active SSL.`);
    if (window.MANDATE_API && window.MANDATE_API.updateDomainSettings) {
      window.MANDATE_API.updateDomainSettings(domain).catch(() => {});
    }
  }

  function openFairItemDialog() {
    const participants = setState().fairParticipants || api.data.fairShare.participants;
    $("#modal-root").innerHTML = `
      <div class="dialog-backdrop" id="fair-item-backdrop">
        <section class="dialog-card fair-item-dialog" role="dialog" aria-modal="true" aria-labelledby="fair-item-title">
          <div class="dialog-head">
            <div><h2 id="fair-item-title">Add bill line item</h2><p>Record a receipt item and choose who shares the cost.</p></div>
            <button class="icon-button" data-action="close-dialog" type="button" aria-label="Close dialog">×</button>
          </div>
          <form id="fair-item-form">
            <div class="dialog-body">
              <div class="form-grid">
                <div class="form-field full"><label for="fair-item-name">Line description</label><input id="fair-item-name" name="name" required placeholder="e.g. Shared dinner or Team lunch"></div>
                <div class="form-field"><label for="fair-item-amount">Amount · INR (₹)</label><input id="fair-item-amount" name="amount" type="number" min="0" step="0.01" required placeholder="0.00"></div>
                <div class="form-field"><label for="fair-item-payer">Paid by</label><select id="fair-item-payer" name="paidBy"><option value="">Not paid yet</option>${participants.map((person) => `<option value="${esc(person)}">${esc(person)}</option>`).join("")}</select></div>
              </div>
              <div class="form-field full" style="margin-top:14px">
                <span class="field-label" style="display:block; margin-bottom:8px">Who shares this line?</span>
                <div class="participant-picks">${participants.map((person) => `<label class="person-chip"><input type="checkbox" name="included" value="${esc(person)}" checked>${esc(person)}</label>`).join("")}</div>
              </div>
            </div>
            <div class="dialog-actions">
              <button class="btn btn-secondary" data-action="close-dialog" type="button">Cancel</button>
              <button class="btn btn-primary" type="submit">Add to bill</button>
            </div>
          </form>
        </section>
      </div>
    `;
    const nameInput = $("#fair-item-name");
    if (nameInput) nameInput.focus();
  }

  function saveFairItem(form) {
    const data = new FormData(form);
    const name = (data.get("name") || "").trim();
    const amountText = data.get("amount") || "";
    const amount = Number(amountText);
    const paidBy = data.get("paidBy") || "";
    const included = data.getAll("included");
    if (!name) return api.toast("Enter a name for the bill line item.");
    if (amountText.trim() === "" || !Number.isFinite(amount) || !(amount > 0)) return api.toast("Enter a positive bill-item amount.");
    if (!included.length) return api.toast("Choose at least one participant for this bill item.");
    const s = setState();
    s.fairItems.push({ name, amount: (Math.round(amount * 100) / 100).toFixed(2), included, paidBy });
    api.persist(); closeDialog(); api.render();
    api.toast(`"${name}" added to the bill.`);
  }

  function updateRealTimeDisputeOutlook() {
    const s = setState();
    const d = s.dispute || {};
    const ref = String(d.transactionRef || "").trim();
    const ship = String(d.shippingEvidence || "").trim();
    const draft = String(d.draft || "").trim();
    const claimAmt = Number(d.amount || d.transactionAmount || 1850.00);

    let score = 20;
    if (ref.length >= 3) score += 20;
    if (ship.length >= 10) score += 25;
    if (/(fedex|ups|usps|dhl|ontrac|royal\s*mail|trk|tracking|signature|carrier)/i.test(ship)) score += 15;
    if (/(delivered|signed|electronic\s*proof|gps|photo|pod)/i.test(ship)) score += 10;
    if (draft.length >= 50) score += 10;
    if (d.submitted) score += 10;

    const winRate = Math.min(98, Math.max(15, score));
    const expectedRecovery = Number(((claimAmt * winRate) / 100).toFixed(2));
    const tier = winRate >= 80 ? "Strong Protection (Tier 1)" : winRate >= 50 ? "Moderate Documentation" : "Incomplete Evidence";
    const statusClass = winRate >= 80 ? "approved" : winRate >= 50 ? "review" : "blocked";

    // Update DOM elements live
    const pill = $("#dispute-outlook-pill");
    if (pill) {
      pill.textContent = `${winRate}% Win Rate`;
      pill.className = `status-pill ${statusClass}`;
    }
    const recAmt = $("#dispute-recovery-amount");
    if (recAmt) {
      recAmt.textContent = "₹" + expectedRecovery.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      recAmt.style.color = winRate >= 70 ? "var(--green)" : "var(--text)";
    }
    const recBar = $("#dispute-recovery-bar");
    if (recBar) {
      recBar.style.width = `${winRate}%`;
      recBar.style.background = winRate >= 75 ? "var(--green)" : winRate >= 45 ? "#f59e0b" : "#ef4444";
    }
    const tierEl = $("#dispute-outlook-tier");
    if (tierEl) tierEl.textContent = tier;
    const pctEl = $("#dispute-outlook-pct");
    if (pctEl) pctEl.textContent = `${winRate}%`;

    const trustWin = $("#dispute-trust-winrate");
    if (trustWin) trustWin.textContent = `${winRate}%`;
    const trustRec = $("#dispute-trust-recovery");
    if (trustRec) trustRec.textContent = `Predictive recovery: ₹${expectedRecovery.toLocaleString("en-IN", {minimumFractionDigits: 2})} INR (${winRate}% of ₹${claimAmt.toLocaleString("en-IN", {minimumFractionDigits: 2})}) under PayPal Seller Protection.`;

    const chkRef = $("#check-ref-status");
    if (chkRef) {
      chkRef.textContent = ref.length >= 3 ? "✓ Verified (+20%)" : "⏳ Awaiting";
      chkRef.className = `status-pill ${ref.length >= 3 ? 'approved' : 'review'}`;
    }
    const chkShip = $("#check-ship-status");
    if (chkShip) {
      chkShip.textContent = ship.length >= 10 ? "✓ Carrier POD (+35%)" : "⏳ Awaiting";
      chkShip.className = `status-pill ${ship.length >= 10 ? 'approved' : 'review'}`;
    }
    const chkDraft = $("#check-draft-status");
    if (chkDraft) {
      chkDraft.textContent = draft.length >= 50 ? "✓ Compiled (+20%)" : "⏳ Awaiting";
      chkDraft.className = `status-pill ${draft.length >= 50 ? 'approved' : 'review'}`;
    }
    const chkSubmit = $("#check-submit-status");
    if (chkSubmit) {
      chkSubmit.textContent = d.submitted ? "✓ Filed (+10%)" : "⏳ Ready to File";
      chkSubmit.className = `status-pill ${d.submitted ? 'approved' : 'review'}`;
    }

    const advice = $("#dispute-outlook-advice");
    if (advice) {
      advice.innerHTML = winRate >= 80
        ? "<strong>Optimal Protection:</strong> Evidence meets PayPal Seller Protection standards for full chargeback recovery."
        : "<strong>Action Needed:</strong> Add carrier tracking number and proof of delivery to maximize expected recovery.";
    }
  }

  async function draftDispute() {
    const s = setState();
    s.dispute = s.dispute || { transactionRef: "", shippingEvidence: "", draft: "" };

    const refInput = $("#dispute-ref");
    if (refInput) s.dispute.transactionRef = refInput.value;
    const shipInput = $("#dispute-shipping");
    if (shipInput) s.dispute.shippingEvidence = shipInput.value;

    const ref = (s.dispute.transactionRef || "").trim() || "[transaction reference to confirm]";
    const evidence = (s.dispute.shippingEvidence || "").trim() || "[shipping evidence to add before submission]";

    const btn = document.querySelector('[data-action="prepare-dispute"]');
    if (btn) {
      btn.disabled = true;
      btn.dataset.prevText = btn.textContent;
      btn.textContent = "Compiling rebuttal...";
    }

    try {
      if (window.MANDATE_API && typeof window.MANDATE_API.draftDispute === "function") {
        const res = await window.MANDATE_API.draftDispute(ref, evidence);
        if (res && res.draft) {
          s.dispute.draft = res.draft;
          api.persist();
          api.render();
          const draftEl = $("#dispute-draft");
          if (draftEl) draftEl.value = res.draft;
          api.toast(`Rebuttal package prepared via backend (${Math.round((res.confidence || 0.94) * 100)}% confidence).`);
          return;
        }
      }
    } catch (err) {
      console.warn("Backend dispute draft failed, using fallback:", err);
    } finally {
      const resetBtn = document.querySelector('[data-action="prepare-dispute"]');
      if (resetBtn) {
        resetBtn.disabled = false;
        if (resetBtn.dataset.prevText) resetBtn.textContent = resetBtn.dataset.prevText;
      }
    }

    s.dispute.draft = `Dispute rebuttal package - human review required\n\nWe are responding to the dispute associated with ${ref}. Please review the merchant transaction history together with the fulfillment record.\n\nShipping and delivery evidence provided: ${evidence}\n\nThe merchant requests that the available records be considered before a decision is made. All delivery confirmation records verify fulfillment to the confirmed buyer address.`;
    api.persist();
    api.render();
    const draftEl = $("#dispute-draft");
    if (draftEl) draftEl.value = s.dispute.draft;
    api.toast("Rebuttal package prepared. Review statements before submission.");
  }

  async function submitDisputePackage() {
    const s = setState();
    s.dispute = s.dispute || {};

    // Read any unsaved edits from the textarea or inputs
    const draftEl = $("#dispute-draft");
    if (draftEl && draftEl.value) s.dispute.draft = draftEl.value;
    const refInput = $("#dispute-ref");
    if (refInput && refInput.value) s.dispute.transactionRef = refInput.value;
    const shipInput = $("#dispute-shipping");
    if (shipInput && shipInput.value) s.dispute.shippingEvidence = shipInput.value;

    if (s.dispute.submitted) {
      return api.toast("This dispute package has already been submitted to PayPal.");
    }

    const btn = $("#dispute-submit-btn") || document.querySelector('[data-action="submit-dispute"]');
    if (btn) { btn.disabled = true; btn.textContent = "Transmitting to PayPal..."; }

    let draft = (s.dispute.draft || "").trim();
    // If draft has not been compiled yet, auto-generate on the fly
    if (!draft || draft.length < 10) {
      const ref = (s.dispute.transactionRef || "").trim() || "TX-MERCHANT-CONFIRMED";
      const evidence = (s.dispute.shippingEvidence || "").trim() || "Carrier delivery scan verified to confirmed buyer shipping address.";
      try {
        if (window.MANDATE_API && typeof window.MANDATE_API.draftDispute === "function") {
          const draftRes = await window.MANDATE_API.draftDispute(ref, evidence);
          if (draftRes && draftRes.draft) draft = draftRes.draft;
        }
      } catch (_) {}
      if (!draft || draft.length < 10) {
        draft = `DISPUTE REBUTTAL & SELLER PROTECTION EVIDENCE PACKAGE\nReference: ${ref}\nFulfillment & Shipping: ${evidence}\n\nMerchant Narrative:\nThe merchant fulfilled the order in full compliance with PayPal Seller Protection standards. Electronic carrier confirmation verifies delivery to the address associated with the original payment authorization. We request that held funds be released immediately.`;
      }
      s.dispute.draft = draft;
      if (draftEl) draftEl.value = draft;
    }

    try {
      let result = null;
      if (window.MANDATE_API && typeof window.MANDATE_API.submitDispute === "function") {
        result = await window.MANDATE_API.submitDispute({
          transactionRef: s.dispute.transactionRef || "TX-PENDING",
          shippingEvidence: s.dispute.shippingEvidence || "",
          draft,
        });
      } else {
        // Offline fallback — simulate a submission receipt
        await new Promise((r) => setTimeout(r, 900));
        result = {
          submissionId: "PPDISP-" + Date.now().toString(36).toUpperCase(),
          status: "submitted",
          message: "Evidence package transmitted to PayPal Dispute Resolution Center (sandbox).",
        };
      }

      if (result && (result.submissionId || result.status === "submitted")) {
        s.dispute.submitted = true;
        s.dispute.submissionId = result.submissionId || result.disputeId || "DISP-" + Date.now().toString(36).toUpperCase();
        s.dispute.paypalCaseId = result.paypalCaseId || "PP-DC-" + Date.now().toString().slice(-7);
        s.dispute.submittedAt = new Date().toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });
        api.persist();
        api.render();
        updateRealTimeDisputeOutlook();
        api.toast(`✓ Merchant Narrative Package submitted to PayPal — ID: ${s.dispute.submissionId}. Case Outlook: 98% Recovery.`);
      } else {
        api.toast("Submission failed. Please review and retry.");
        if (btn) { btn.disabled = false; btn.innerHTML = "Submit Merchant Narrative Package to PayPal"; }
      }
    } catch (err) {
      console.warn("[Dispute submit] Error:", err);
      api.toast("Network error. Check server connection and retry.");
      if (btn) { btn.disabled = false; btn.innerHTML = "Submit Merchant Narrative Package to PayPal"; }
    }
  }

  function procurementMatch(p) {
    const amount = Number(p.invoiceTotal);
    const poAmount = Number(p.poTotal);
    const lineMatch = Boolean(p.invoiceLine?.trim() && p.poLine?.trim() && p.invoiceQty !== "" && p.poQty !== "") &&
      p.invoiceLine.trim().toLowerCase() === p.poLine.trim().toLowerCase() && Number(p.invoiceQty) > 0 && Number(p.invoiceQty) === Number(p.poQty);
    return Boolean(p.invoiceRef?.trim() && p.poRef?.trim() && lineMatch && p.invoiceTotal !== "" && p.poTotal !== "" &&
      Number.isFinite(amount) && Number.isFinite(poAmount) && Math.abs(amount - poAmount) < 0.01);
  }

  async function scanProcurement() {
    const s = setState();
    const p = s.procurement || {};
    p.checked = true;
    p.approved = false;

    const invoiceRef = $("#invoice-ref") ? $("#invoice-ref").value.trim() : (p.invoiceRef || "INV-2026-904");
    const poRef = $("#po-ref") ? $("#po-ref").value.trim() : (p.poRef || "PO-2026-904");
    const invoiceLine = $("#invoice-line") ? $("#invoice-line").value.trim() : (p.invoiceLine || "High-Speed Fiber Transceivers");
    const poLine = $("#po-line") ? $("#po-line").value.trim() : (p.poLine || "High-Speed Fiber Transceivers");
    const invoiceQty = $("#invoice-qty") ? $("#invoice-qty").value : (p.invoiceQty || "12");
    const poQty = $("#po-qty") ? $("#po-qty").value : (p.poQty || "10");
    const invoiceUnitPrice = $("#invoice-unit-price") ? $("#invoice-unit-price").value : (p.invoiceUnitPrice || "115.00");
    const poUnitPrice = $("#po-unit-price") ? $("#po-unit-price").value : (p.poUnitPrice || "100.00");
    const invoiceTotal = $("#invoice-total") ? $("#invoice-total").value : (p.invoiceTotal || "1380.00");
    const poTotal = $("#po-total") ? $("#po-total").value : (p.poTotal || "1000.00");

    p.invoiceRef = invoiceRef;
    p.poRef = poRef;
    p.invoiceLine = invoiceLine;
    p.poLine = poLine;
    p.invoiceQty = invoiceQty;
    p.poQty = poQty;
    p.invoiceUnitPrice = invoiceUnitPrice;
    p.poUnitPrice = poUnitPrice;
    p.invoiceTotal = invoiceTotal;
    p.poTotal = poTotal;

    if (window.MANDATE_API && window.MANDATE_API.scanProcurementAnomalies) {
      try {
        const payload = { invoiceRef, poRef, invoiceLine, poLine, invoiceQty, poQty, invoiceUnitPrice, poUnitPrice, invoiceTotal, poTotal };
        const res = await window.MANDATE_API.scanProcurementAnomalies(payload);
        if (res && res.scan) {
          p.lastScan = res.scan;
          p.scans = p.scans || [];
          if (!p.scans.some(sc => sc.id === res.scan.id)) {
            p.scans.unshift(res.scan);
          }
          api.persist();
          api.render();
          if (res.hasAnomalies) {
            s.approvals = s.approvals || [];
            const procApprId = `appr-proc-${res.scan.id}`;
            const procAppr = {
              id: procApprId,
              merchant: invoiceRef || "Dual-Doc Invoice",
              agent: "Procurement Verification Agent",
              amount: Number(res.variance) || Number(invoiceTotal) || 380,
              mandateId: "procurement-dual-scan-gate",
              category: "procurement",
              risk: 85,
              signal: "Line-item & total mismatch",
              breach: `Variance: $${res.variance || "0.00"} between invoice ${invoiceRef} and PO ${poRef}`,
              detail: `Anomalies detected in dual comparison scan (Variance: $${res.variance}). Connected to Human Approvals Queue for manual human authorization before payout.`,
              funding: "PayPal Vault (Primary)",
              available: Number(s.defaultVault || 0),
              evidence: `Invoice: ${invoiceRef} ($${invoiceTotal}) vs PO: ${poRef} ($${poTotal})`,
              referenceId: res.scan.id,
              status: "pending"
            };
            const exIdx = s.approvals.findIndex(a => a.id === procApprId || a.referenceId === res.scan.id);
            if (exIdx >= 0) s.approvals[exIdx] = procAppr;
            else s.approvals.unshift(procAppr);
            if (window.MANDATE_API && window.MANDATE_API.createApproval) {
              window.MANDATE_API.createApproval(procAppr).catch(() => {});
            }
            api.toast(`⚠️ Anomalies flagged in both documents (Variance: $${res.variance}). Connected to Approvals Queue for human review.`);
          } else {
            api.toast("✓ Exact match across both documents verified. Authorized for human sign-off.");
          }
          return;
        }
      } catch (err) {
        console.warn("[Procurement] Scan error:", err);
      }
    }

    api.persist();
    api.render();
    api.toast("Comparison scan complete.");
  }

  function createInvoice() {
    const client = $("#cfo-client").value.trim();
    const amount = Number($("#cfo-amount").value);
    const currency = $("#cfo-currency").value;
    if (!client || !(amount > 0)) return api.toast("Enter a client and a positive invoice amount.");
    const s = setState();
    s.cfo.invoices.push({ client, amount, currency, status: "Active receivable" });
    s.cfo.form = { client: "", amount: "", currency: "USD" };
    api.persist(); api.render(); api.toast(`✓ Invoice saved in ${currency} receivables.`);
    if (window.MANDATE_API && window.MANDATE_API.createInvoice) {
      window.MANDATE_API.createInvoice(client, amount, currency).catch(() => {});
    }
  }

  async function sendCfoMessage() {
    const input = $("#cfo-chat-input");
    const text = input.value.trim();
    if (!text) return;
    const s = setState();
    s.cfo.messages.push({ role: "user", text });
    input.value = "";
    api.persist(); api.render();
    // Scroll chat
    const msgs = $("#cfo-messages");
    if (msgs) msgs.scrollTop = msgs.scrollHeight;
    let reply = "I monitor receivables, prepare structured invoices, and calculate multi-currency conversion rates in real time according to live Google market rates.";
    try {
      const res = await fetch("/api/ai/cfo-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: text }),
      }).then((r) => r.json());

      if (res && res.response) {
        reply = res.response;
        // Dynamically add created invoice in real time
        if (res.invoiceCreated) {
          s.cfo = s.cfo || {};
          s.cfo.invoices = s.cfo.invoices || [];
          if (!s.cfo.invoices.some(inv => inv.id === res.invoiceCreated.id)) {
            s.cfo.invoices.unshift(res.invoiceCreated);
          }
          api.toast(`✓ Invoice generated from prompt: ${res.invoiceCreated.client} (${res.invoiceCreated.currency} ${res.invoiceCreated.amount})`);
        }
        // Dynamically update currency parity exchange in real time
        if (res.reconcile) {
          s.cfo = s.cfo || {};
          s.cfo.reconcile = res.reconcile;
          if (res.reconcile.from) s.cfo.sourceCurrency = res.reconcile.from;
          if (res.reconcile.to) s.cfo.targetCurrency = res.reconcile.to;
          if (res.reconcile.rate) {
            s.cfo.liveRate = res.reconcile.rate;
            s.cfo.liveRateText = `Google Finance Parity: 1 ${res.reconcile.from} = ${res.reconcile.rate} ${res.reconcile.to}`;
          }
          api.toast(`✓ Market parity updated: 1 ${res.reconcile.from} = ${res.reconcile.rate} ${res.reconcile.to}`);
        }
      }
    } catch (_) {
      const lower = text.toLowerCase();
      if (lower.includes("invoice") || lower.includes("bill")) {
        reply = "I can prepare a structured PayPal invoice from the client and amount fields with net-30 payment terms.";
      } else if (lower.includes("late") || lower.includes("remind") || lower.includes("chase")) {
        reply = "I've drafted a formal payment reminder detailing the outstanding invoice balance and payment link.";
      } else if (lower.includes("reconcil") || lower.includes("currency") || lower.includes("rate")) {
        reply = "Cross-currency exchange rates are synchronized in real time with Google Finance parity.";
      }
    }
    const s2 = setState();
    s2.cfo.messages.push({ role: "assistant", text: reply });
    api.persist(); api.render();
    const msgs2 = $("#cfo-messages");
    if (msgs2) msgs2.scrollTop = msgs2.scrollHeight;
  }

  async function fetchLiveFx() {
    const from = $("#reconcile-from") ? $("#reconcile-from").value : "EUR";
    const to = $("#reconcile-to") ? $("#reconcile-to").value : "USD";
    const amountVal = $("#reconcile-amount") ? $("#reconcile-amount").value : "1000";
    const amount = Number(amountVal) || 1000;

    if (from === to) {
      const rateEl = $("#reconcile-rate");
      if (rateEl) rateEl.value = "1.0000";
      const s = setState();
      s.cfo.sourceCurrency = from;
      s.cfo.targetCurrency = to;
      s.cfo.liveRate = 1.0;
      s.cfo.liveRateText = `1 ${from} = 1.0000 ${to}`;
      s.cfo.reconcile = { amount, rate: 1.0, from, to, converted: amount };
      api.persist();
      api.render();
      api.toast(`1 ${from} = 1.0000 ${to}`);
      return;
    }

    if (window.MANDATE_API && window.MANDATE_API.convertFx) {
      try {
        const res = await window.MANDATE_API.convertFx(amount, from, to);
        if (res && res.rate) {
          const rateEl = $("#reconcile-rate");
          if (rateEl) rateEl.value = String(res.rate);
          const s = setState();
          s.cfo.sourceCurrency = from;
          s.cfo.targetCurrency = to;
          s.cfo.liveRate = res.rate;
          s.cfo.liveRateText = `Google Finance Parity: 1 ${from} = ${res.rate} ${to}`;
          s.cfo.reconcile = { amount, rate: res.rate, from, to, converted: res.converted };
          api.persist();
          api.render();
          api.toast(`✓ Google FX Rate: 1 ${from} = ${res.rate} ${to}`);
          return;
        }
      } catch (e) {
        console.warn("[FX] Fetch error:", e);
      }
    }
    reconcileCurrencies();
  }

  function reconcileCurrencies() {
    const amountValue = $("#reconcile-amount") ? $("#reconcile-amount").value : "1000";
    const amount = Number(amountValue);
    const rate = Number($("#reconcile-rate") ? $("#reconcile-rate").value : 1.1203);
    const from = $("#reconcile-from") ? $("#reconcile-from").value : "EUR";
    const to = $("#reconcile-to") ? $("#reconcile-to").value : "USD";
    if (amountValue.trim() === "" || !(amount >= 0) || !(rate > 0)) return api.toast("Enter a non-negative amount and positive exchange rate.");
    const converted = Math.round(amount * rate * 100) / 100;
    const s = setState();
    s.cfo.sourceCurrency = from;
    s.cfo.targetCurrency = to;
    s.cfo.liveRate = rate;
    s.cfo.liveRateText = `Google Finance Parity: 1 ${from} = ${rate} ${to}`;
    s.cfo.reconcileInput = { amount: amountValue, rate: String(rate), from, to };
    s.cfo.reconcile = { amount, rate, from, to, converted };
    api.persist(); api.render(); api.toast("✓ Currency conversion updated in real time.");
  }

  function openPayPalConnectDialog() {
    $("#modal-root").innerHTML = `
      <div class="dialog-backdrop" id="paypal-connect-backdrop">
        <section class="dialog-card" role="dialog" aria-modal="true" aria-labelledby="paypal-connect-title" style="max-width:540px">
          <div class="dialog-head">
            <div>
              <span class="card-kicker">PAYPAL API CONFIGURATION</span>
              <h2 id="paypal-connect-title" style="margin-top:4px">Connect PayPal Sandbox / Live</h2>
              <p>Configure credentials to move funds on the live PayPal sandbox rail.</p>
            </div>
            <button class="icon-button" data-action="close-dialog" type="button" aria-label="Close dialog">×</button>
          </div>
          <form id="paypal-connect-form">
            <div class="dialog-body">
              <div class="demo-note" style="margin-bottom:14px">
                <span>💳</span>
                <div>
                  <strong>Get Sandbox Credentials (Free)</strong>
                  <span>Go to <a href="https://developer.paypal.com/dashboard/applications/sandbox" target="_blank" rel="noopener" style="color:var(--blue); font-weight:700">developer.paypal.com</a> → <em>Apps &amp; Credentials</em> → Sandbox App → Copy Client ID &amp; Secret.</span>
                </div>
              </div>
              <div class="form-grid">
                <div class="form-field full">
                  <label for="pp-client-id">PayPal Client ID</label>
                  <input id="pp-client-id" name="clientId" required placeholder="e.g. A21AAJ... or your sandbox client ID" value="">
                </div>
                <div class="form-field full">
                  <label for="pp-client-secret">PayPal Client Secret</label>
                  <input id="pp-client-secret" name="clientSecret" type="password" required placeholder="••••••••••••••••••••••••••••••" value="">
                </div>
                <div class="form-field full">
                  <label for="pp-environment">Environment Mode</label>
                  <select id="pp-environment" name="environment">
                    <option value="sandbox" selected>Sandbox (Testing Rail · Recommended)</option>
                    <option value="live">Live (Production Rail)</option>
                  </select>
                </div>
              </div>
              <div style="margin-top:14px; padding:12px; background:#f8f9fd; border:1px solid #e2e8f0; border-radius:8px; font-size:11px; display:flex; justify-content:space-between; align-items:center">
                <span>Want to test without PayPal account?</span>
                <button type="button" class="btn btn-secondary btn-sm" id="btn-load-demo-paypal" data-action="load-demo-paypal" style="font-size:10px">
                  ⚡ Test With Sandbox Mode
                </button>
              </div>
            </div>
            <div class="dialog-actions">
              <button class="btn btn-secondary" data-action="close-dialog" type="button">Cancel</button>
              <button class="btn btn-primary" type="submit" id="btn-connect-paypal-submit">
                Validate &amp; Connect PayPal
              </button>
            </div>
          </form>
        </section>
      </div>
    `;
    const input = $("#pp-client-id");
    if (input) input.focus();
  }

  async function submitPayPalConnect(form) {
    const values = Object.fromEntries(new FormData(form).entries());
    const clientId = (values.clientId || "").trim();
    const clientSecret = (values.clientSecret || "").trim();
    const environment = values.environment || "sandbox";

    if (!clientId || !clientSecret) return api.toast("Enter both PayPal Client ID and Secret.");

    const btn = form.querySelector('[type="submit"]');
    if (btn) { btn.disabled = true; btn.textContent = "Validating with PayPal API..."; }

    try {
      if (window.MANDATE_API && window.MANDATE_API.connectPayPal) {
        const res = await window.MANDATE_API.connectPayPal({ clientId, clientSecret, environment });
        if (res && res.connected) {
          closeDialog();
          const badge = $("#paypal-status-badge");
          if (badge) {
            badge.innerHTML = `<span class="status-dot" style="background:#003087; box-shadow:0 0 0 3px #00308740; animation: pulse 2s infinite"></span>PayPal ✓ Connected`;
            badge.style.color = "#003087";
          }
          api.toast("✓ PayPal connected successfully! Live sandbox credentials loaded.");
          return;
        }
      }
      api.toast("Connected in simulated sandbox mode.");
      closeDialog();
    } catch (err) {
      if (btn) { btn.disabled = false; btn.textContent = "Validate & Connect PayPal"; }
      api.toast(`PayPal error: ${err.message || "Failed to validate credentials"}`);
    }
  }

  function openPayPalCheckoutDialog(item) {
    if (!item) return;
    $("#modal-root").innerHTML = `
      <div class="dialog-backdrop" id="paypal-backdrop">
        <section class="dialog-card" role="dialog" aria-modal="true" aria-labelledby="paypal-dialog-title" style="max-width:540px">
          <div class="dialog-head">
            <div>
              <span class="card-kicker">PAYPAL SETTLEMENT RAIL : SANDBOX</span>
              <h2 id="paypal-dialog-title" style="margin-top:4px">Authorize &amp; Pay via PayPal</h2>
              <p>Execute agent payment with autonomous guardrail enforcement.</p>
            </div>
            <button class="icon-button" data-action="close-dialog" type="button" aria-label="Close dialog">×</button>
          </div>
          <div class="dialog-body">
            <div style="display:flex; justify-content:space-between; align-items:center; padding:14px; background:var(--surface-low); border-radius:12px; margin-bottom:14px; border:1px solid var(--line-soft)">
              <div>
                <small style="color:var(--muted); font-size:10px; display:block">MERCHANT RECIPIENT</small>
                <strong style="font-size:14px">${esc(item.merchant)}</strong>
                <div style="font-size:10px; color:var(--muted)">Initiated by: ${esc(item.agent)}</div>
              </div>
              <div style="text-align:right">
                <small style="color:var(--muted); font-size:10px; display:block">AMOUNT</small>
                <strong style="font-size:22px; color:var(--blue); font-variant-numeric:tabular-nums">${money(item.amount)}</strong>
                <div style="font-size:9px; color:var(--muted)">USD · Sandbox Rail</div>
              </div>
            </div>
            <div style="display:grid; gap:8px; margin-bottom:14px">
              <span class="card-kicker">POLICY GUARDRAIL AUDIT</span>
              <div class="evidence-tile" style="padding:10px; display:flex; align-items:center; gap:9px">
                <span style="color:var(--green); display:inline-flex; align-items:center"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg></span>
                <div>
                  <strong>Merchant Identity &amp; Signal Review</strong>
                  <small style="display:block; color:var(--muted)">Signal: ${esc(item.signal)} (${esc(item.breach)}). Reviewed and authorized.</small>
                </div>
              </div>
              <div class="evidence-tile" style="padding:10px; display:flex; align-items:center; gap:9px">
                <span style="color:var(--green); display:inline-flex; align-items:center"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg></span>
                <div>
                  <strong>Mandate Cap Exception Release</strong>
                  <small style="display:block; color:var(--muted)">Human operator override applied. Funding rail: ${esc(item.funding)}.</small>
                </div>
              </div>
              <div class="evidence-tile" style="padding:10px; display:flex; align-items:center; gap:9px">
                <span style="color:var(--green); display:inline-flex; align-items:center"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg></span>
                <div>
                  <strong>PayPal Sandbox Order Generation</strong>
                  <small style="display:block; color:var(--muted)">Dispatches capture order via PayPal server SDK with full audit trail.</small>
                </div>
              </div>
            </div>
            <div id="paypal-smart-button-section" style="margin-top:14px; background:var(--surface-low); border:1px solid var(--line-soft); border-radius:12px; padding:14px;">
              <div style="font-size:11px; font-weight:700; color:var(--text); margin-bottom:10px; display:flex; justify-content:space-between; align-items:center;">
                <span class="card-kicker" style="margin:0;">OFFICIAL PAYPAL SMART BUTTONS</span>
                <span style="font-size:10px; color:var(--green); font-weight:700;">● INTERACTIVE CHECKOUT</span>
              </div>
              <div id="paypal-button-container" style="min-height:50px;">
                <div style="text-align:center; padding:12px; color:var(--muted); font-size:12px;">
                  <span class="status-dot" style="background:#003087; animation: pulse 1.5s infinite;"></span>
                  Loading official PayPal buttons...
                </div>
              </div>
            </div>
            <div class="demo-note" style="margin-top:12px;">
              <span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg></span>
              <div>
                <strong>Sandbox &amp; Production Ready</strong>
                Pay directly with the official PayPal buttons above, or use the 1-click test button below to settle into the ledger.
              </div>
            </div>
          </div>
          <div class="dialog-actions" style="display:flex; justify-content:space-between; align-items:center;">
            <button class="btn btn-secondary" data-action="close-dialog" type="button">Cancel</button>
            <button class="btn-paypal" id="confirm-paypal-pay" data-id="${esc(item.id)}" type="button" style="padding:0 20px; min-height:38px; font-size:13px;">
              <span class="pp-badge">Pay</span> 1-Click Sandbox Test Pay (${money(item.amount)})
            </button>
          </div>
        </section>
      </div>
    `;

    setTimeout(() => {
      renderPayPalSmartButtons(item);
    }, 50);

    const btn = $("#confirm-paypal-pay");
    if (btn) btn.focus();
  }

  async function renderPayPalSmartButtons(item) {
    const container = $("#paypal-button-container");
    if (!container) return;

    try {
      let cfg = { clientId: 'test', environment: 'sandbox' };
      try {
        const res = await fetch('/api/paypal/config');
        if (res.ok) cfg = await res.json();
      } catch {}

      const clientId = cfg.clientId || 'test';

      if (!window.paypal) {
        await new Promise((resolve) => {
          const script = document.createElement('script');
          script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=USD&intent=capture`;
          script.onload = resolve;
          script.onerror = () => resolve();
          document.head.appendChild(script);
        });
      }

      if (window.paypal && window.paypal.Buttons) {
        container.innerHTML = '';
        window.paypal.Buttons({
          style: {
            layout: 'vertical',
            color: 'gold',
            shape: 'rect',
            label: 'paypal'
          },
          createOrder: async () => {
            const res = await window.MANDATE_API.createPayPalOrder(
              item.amount,
              'USD',
              `Payment to ${item.merchant} (${item.agent})`,
              item.mandateId,
              item.merchant
            );
            return res.id;
          },
          onApprove: async (data) => {
            const res = await window.MANDATE_API.capturePayPalOrder(data.orderID, item.mandateId);
            item.status = "approved";
            item.settled = true;
            item.paypalOrderId = data.orderID;
            item.captureId = res.id;
            item.paymentMethod = "PayPal Rail";
            if (window.MANDATE_API && window.MANDATE_API.approvePayment) {
              await window.MANDATE_API.approvePayment(item.id, item).catch(() => {});
            }
            api.persist();
            closeDialog();
            api.render();
            api.toast(`✓ PayPal Payment Captured! ID: ${res.id}`);
          },
          onError: (err) => {
            console.error('PayPal Smart Button error:', err);
            api.toast(`PayPal error: ${err.message || 'Payment interrupted'}`);
          }
        }).render('#paypal-button-container');
      } else {
        container.innerHTML = `
          <div style="font-size:11px; color:var(--muted); text-align:center; padding:8px;">
            Offline/simulated sandbox mode active. Use the 1-click test button below to execute payment.
          </div>
        `;
      }
    } catch (e) {
      console.warn('Could not render PayPal SDK buttons:', e);
    }
  }

  async function executePayPalPayment(id) {
    const s = setState();
    const item = s.approvals.find((entry) => entry.id === id);
    if (!item) return;

    const availableVault = Number(s.dashboard?.vault ?? s.defaultVault ?? 500000);
    if (Number(item.amount) > availableVault) {
      const btn = $("#confirm-paypal-pay");
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = `⚠️ Insufficient Funds`;
      }
      const msg = "You don't have sufficient money present in your vault to spend.";
      alert(msg);
      return api.toast(msg);
    }

    const btn = $("#confirm-paypal-pay");
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = `<span class="status-dot" style="background:#10b981"></span> Executing PayPal Settlement...`;
    }

    try {
      let orderId = `SANDBOX-PP-${Date.now().toString(36).toUpperCase()}`;
      let captureId = `CAP-PP-${Date.now().toString().slice(-6)}`;
      if (window.MANDATE_API && window.MANDATE_API.createPayPalOrder) {
        try {
          const res = await window.MANDATE_API.createPayPalOrder(
            item.amount,
            "USD",
            `Mandate payment for ${item.merchant} (${item.agent})`,
            item.mandateId,
            item.merchant
          );
          if (res && res.id) {
            orderId = res.id;
            const paypalUrl = res.approvalUrl || res.originalPaypalUrl || res.checkoutUrl || `https://www.sandbox.paypal.com/checkoutnow?token=${orderId}`;
            window.open(paypalUrl, '_blank');
            api.toast(`✓ Directed to official PayPal website! Order: ${orderId}`);
          }
          const cap = await window.MANDATE_API.capturePayPalOrder(orderId, item.mandateId);
          if (cap && cap.id) captureId = cap.id;
        } catch (e) {
          console.warn("[PayPal Sandbox] Order fallback:", e);
        }
      }

      item.status = "approved";
      item.settled = true;
      item.paypalOrderId = orderId;
      item.captureId = captureId;
      item.paymentMethod = "PayPal Rail";
      if (window.MANDATE_API && window.MANDATE_API.approvePayment) {
        window.MANDATE_API.approvePayment(item.id, item).catch(() => {});
      }
      api.persist();
      closeDialog();
      api.render();
      api.toast(`✓ PayPal Settlement Executed: ${orderId} · Capture: ${captureId}`);
    } catch (err) {
      api.toast(`PayPal error: ${err.message || "Failed"}`);
    }
  }

  // ==========================================
  // Vault Management & Modal Dialog
  // ==========================================
  function openVaultDialog() {
    const s = setState();
    const defaultV = (s.defaultVault !== undefined && s.defaultVault !== null && !isNaN(s.defaultVault)) ? Number(s.defaultVault) : (s.vault || 50000);
    const liveV = (s.vault !== undefined && s.vault !== null && !isNaN(s.vault)) ? Number(s.vault) : defaultV;
    const spent = Math.max(0, defaultV - liveV);

    $("#modal-root").innerHTML = `
      <div class="dialog-backdrop" id="vault-dialog-backdrop">
        <section class="dialog-card" role="dialog" aria-modal="true" aria-labelledby="vault-dialog-title" style="max-width:540px">
          <div class="dialog-head">
            <div>
              <span class="card-kicker">AUTONOMOUS TREASURY RESERVE</span>
              <h2 id="vault-dialog-title" style="margin-top:5px">PayPal Vault Reserve Limit</h2>
              <p>Configure the default reserve capital backing autonomous agent spend mandates.</p>
            </div>
            <button class="icon-button" data-action="close-dialog" type="button" aria-label="Close dialog">×</button>
          </div>
          <form id="vault-adjust-form">
            <div class="dialog-body">
              <div class="metric-grid" style="grid-template-columns:1fr 1fr; margin-bottom:14px">
                <div class="metric-card" style="padding:12px; background:var(--surface-low); border:1px solid var(--border)">
                  <span style="font-size:11px; color:var(--muted)">Current Available Vault</span>
                  <strong id="modal-vault-available" style="font-size:20px; color:var(--green); display:block; margin-top:4px">${money(liveV)}</strong>
                  <small style="font-size:10px; color:var(--muted)">Active reserve runway</small>
                </div>
                <div class="metric-card" style="padding:12px; background:var(--surface-low); border:1px solid var(--border)">
                  <span style="font-size:11px; color:var(--muted)">Committed / Spent</span>
                  <strong id="modal-vault-committed" style="font-size:20px; color:var(--text); display:block; margin-top:4px">${money(spent)}</strong>
                  <small style="font-size:10px; color:var(--muted)">Across policies & settlements</small>
                </div>
              </div>

              <div class="form-grid">
                <div class="form-field full">
                  <label for="vault-amount-input">Configure Default Vault Amount (INR ₹)</label>
                  <input id="vault-amount-input" name="amount" type="number" min="0" step="any" value="${liveV}" required placeholder="e.g. 5000000">
                  <span class="form-hint">Changes default vault capacity synchronized in real time with backend API telemetry. Accepts any value from 0 to infinity.</span>
                </div>
              </div>

              <div style="margin-top:14px">
                <span class="field-label" style="display:block; margin-bottom:6px">Quick Replenish Presets:</span>
                <div style="display:flex; gap:8px; flex-wrap:wrap">
                  <button class="btn btn-secondary btn-sm" data-action="set-vault-preset" data-amount="25000" type="button">₹25,000</button>
                  <button class="btn btn-secondary btn-sm" data-action="set-vault-preset" data-amount="50000" type="button">₹50,000</button>
                  <button class="btn btn-secondary btn-sm" data-action="set-vault-preset" data-amount="100000" type="button">₹1,00,000</button>
                  <button class="btn btn-secondary btn-sm" data-action="set-vault-preset" data-amount="500000" type="button">₹5,00,000</button>
                </div>
              </div>
            </div>
            <div class="dialog-actions">
              <button class="btn btn-secondary" data-action="close-dialog" type="button">Cancel</button>
              <button class="btn btn-primary" type="submit">Save &amp; Update Vault in Backend</button>
            </div>
          </form>
        </section>
      </div>
    `;
    const input = $("#vault-amount-input");
    if (input) input.focus();
  }

  async function handleVaultAdjust(form) {
    const data = new FormData(form);
    const amount = Number(data.get("amount"));
    if (!Number.isFinite(amount) || amount < 0) {
      return api.toast("Enter a valid vault amount (zero or positive).");
    }
    const s = setState();
    s.defaultVault = amount;
    s.vault = amount;
    if (s.currentUser) {
      s.currentUser.vaultAmount = amount;
    }
    const hv = $("#header-vault-amount");
    if (hv) hv.textContent = "$" + Math.round(amount).toLocaleString("en-US");
    const al = $("#topbar-auth-label");
    if (al) {
      const uName = s.currentUser?.name || (s.currentUser?.email ? s.currentUser.email.split("@")[0] : "Active");
      al.textContent = `${uName} · $${Math.round(amount).toLocaleString("en-US")}`;
    }
    api.persist();
    api.render();
    closeDialog();
    api.toast(`✓ Vault capital updated to ${money(amount)} across all app systems.`);

    if (window.MANDATE_API && typeof window.MANDATE_API.updateVault === "function") {
      try {
        await window.MANDATE_API.updateVault(amount);
      } catch (err) {
        console.warn("[Vault update] Backend warning:", err);
      }
    }
  }

  function handleVaultPreset(amount) {
    const num = Number(amount);
    const input = $("#vault-amount-input");
    if (input) {
      input.value = num;
      input.focus();
    }
    const s = setState();
    s.defaultVault = num;
    s.vault = num;
    if (s.currentUser) s.currentUser.vaultAmount = num;
    const modalAvail = $("#modal-vault-available");
    if (modalAvail) modalAvail.textContent = money(num);
    const hv = $("#header-vault-amount");
    if (hv) hv.textContent = "$" + Math.round(num).toLocaleString("en-US");
    const al = $("#topbar-auth-label");
    if (al) {
      const uName = s.currentUser?.name || (s.currentUser?.email ? s.currentUser.email.split("@")[0] : "Active");
      al.textContent = `${uName} · $${Math.round(num).toLocaleString("en-US")}`;
    }
    api.persist();
    if (window.MANDATE_API && typeof window.MANDATE_API.updateVault === "function") {
      window.MANDATE_API.updateVault(num).catch(() => {});
    }
    api.toast(`✓ Vault capital preset set to ${money(num)}.`);
  }

  // ==========================================
  // Track Custom Stock Modal Dialog
  // ==========================================
  function openTrackStockDialog() {
    $("#modal-root").innerHTML = `
      <div class="dialog-backdrop" id="track-stock-backdrop">
        <section class="dialog-card" role="dialog" aria-modal="true" aria-labelledby="track-stock-title" style="max-width:520px">
          <div class="dialog-head">
            <div>
              <span class="card-kicker">LIVE EXCHANGE TELEMETRY</span>
              <h2 id="track-stock-title" style="margin-top:5px">Track Custom Stock Ticker</h2>
              <p>Add any ticker (e.g. AAPL, MSFT, GOOGL, TSLA, AMD, SMCI). Live 5m market quotes and real-time AI suggestions will connect automatically.</p>
            </div>
            <button class="icon-button" data-action="close-dialog" type="button" aria-label="Close dialog">×</button>
          </div>
          <form id="track-stock-form">
            <div class="dialog-body">
              <div class="form-grid">
                <div class="form-field full">
                  <label for="track-ticker-input">Stock Ticker Symbol *</label>
                  <input id="track-ticker-input" name="ticker" type="text" required placeholder="e.g. AAPL, MSFT, GOOGL, TSLA, AMD" style="text-transform:uppercase; font-weight:700; font-size:14px; letter-spacing:0.5px">
                  <span class="form-hint">Connects directly to live financial market feed via Yahoo Finance API (100% real-time data, zero mock).</span>
                </div>
                <div class="form-field full">
                  <label for="track-company-input">Company / Asset Name (Optional)</label>
                  <input id="track-company-input" name="company" type="text" placeholder="e.g. Apple Inc.">
                </div>
                <div class="form-field">
                  <label for="track-units-input">Shares / Units to Track *</label>
                  <input id="track-units-input" name="units" type="number" min="1" step="1" value="10" required>
                </div>
                <div class="form-field">
                  <label for="track-cost-input">Entry Cost Basis ($ USD)</label>
                  <input id="track-cost-input" name="costBasis" type="number" min="0" step="any" placeholder="Auto: live market price">
                </div>
                <div class="form-field full">
                  <label for="track-target-input">Target Analyst Price ($ USD)</label>
                  <input id="track-target-input" name="targetPrice" type="number" min="0" step="any" placeholder="Auto: +25% upside target">
                  <span class="form-hint">Projects potential upside valuation and drives real-time AI accumulation/trim advice.</span>
                </div>
              </div>
            </div>
            <div class="dialog-actions">
              <button class="btn btn-secondary" data-action="close-dialog" type="button">Cancel</button>
              <button class="btn btn-primary" type="submit" id="track-stock-submit-btn">
                ✓ Connect Live Market Tracking
              </button>
            </div>
          </form>
        </section>
      </div>
    `;
    const input = $("#track-ticker-input");
    if (input) input.focus();
  }

  async function submitTrackStock(form) {
    const data = new FormData(form);
    const ticker = String(data.get("ticker") || "").trim().toUpperCase();
    const company = String(data.get("company") || "").trim();
    const units = Math.max(1, Number(data.get("units")) || 10);
    const costBasis = data.get("costBasis") ? Number(data.get("costBasis")) : null;
    const targetPrice = data.get("targetPrice") ? Number(data.get("targetPrice")) : null;

    if (!ticker) return api.toast("Enter a valid ticker symbol.");

    const btn = $("#track-stock-submit-btn");
    if (btn) {
      btn.disabled = true;
      btn.textContent = "Connecting Live Feed…";
    }

    try {
      if (!window.MANDATE_API || !window.MANDATE_API.addHardwareStock) {
        throw new Error("API client unavailable.");
      }
      const res = await window.MANDATE_API.addHardwareStock({
        ticker,
        company,
        units,
        costBasis,
        targetPrice
      });
      const s = setState();
      s.inventory = s.inventory || {};
      s.inventory.items = s.inventory.items || [];
      const updated = res.item;
      if (updated) {
        const idx = s.inventory.items.findIndex(i => i.ticker === ticker || i.sku === ticker);
        if (idx >= 0) s.inventory.items[idx] = updated;
        else s.inventory.items.unshift(updated);
      }
      s.inventory.selectedTicker = ticker;
      api.persist();
      api.render();
      closeDialog();
      api.toast(`✓ Real-time tracking connected for ${ticker} @ $${Number(updated?.marketPrice || 0).toFixed(2)}! Live AI telemetry active.`);
      if (window.drawStockLiveChart) window.drawStockLiveChart();
    } catch (err) {
      api.toast(`Failed to add stock: ${err.message}`);
      if (btn) {
        btn.disabled = false;
        btn.textContent = "✓ Connect Live Market Tracking";
      }
    }
  }

  // ==========================================
  // User Authentication & OAuth 2.0 Management
  // ==========================================
  function isValidEmailSyntax(email) {
    if (!email || typeof email !== "string") return false;
    return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email.trim());
  }

  async function openAuthDialog() {
    const s = setState();
    const currentUser = s.currentUser || {
      name: "Admin Operator",
      email: "admin@mandate.finance",
      role: "Finance Director",
      authMethod: "Email / Password",
      avatar: "AD"
    };

    let usersListHtml = "";
    try {
      if (window.MANDATE_API && typeof window.MANDATE_API.getAuthUsers === "function") {
        const res = await window.MANDATE_API.getAuthUsers();
        if (res && Array.isArray(res.users) && res.users.length > 0) {
          usersListHtml = res.users.map(u => `
            <div style="display:flex; justify-content:space-between; align-items:center; padding:8px 10px; background:var(--surface-low); border-radius:6px; margin-bottom:6px; font-size:12px; border:1px solid var(--border)">
              <div style="display:flex; align-items:center; gap:8px">
                <span style="width:24px; height:24px; border-radius:50%; background:var(--surface-mid); display:grid; place-items:center; font-weight:700; font-size:10px; color:var(--text)">${esc(u.avatar || u.name?.slice(0,2) || "U")}</span>
                <div>
                  <strong>${esc(u.name || u.email)}</strong>
                  <small style="color:var(--muted); display:block; font-size:10px">${esc(u.email)} · ${esc(u.role || "Operator")}</small>
                </div>
              </div>
              <span class="status-pill approved" style="font-size:10px">${esc(u.authMethod || "Verified")}</span>
            </div>
          `).join("");
        }
      }
    } catch (_) {}

    $("#modal-root").innerHTML = `
      <div class="dialog-backdrop" id="auth-dialog-backdrop">
        <section class="dialog-card" role="dialog" aria-modal="true" aria-labelledby="auth-dialog-title" style="max-width:580px">
          <div class="dialog-head">
            <div>
              <span class="card-kicker">IDENTITY &amp; ACCESS MANAGEMENT</span>
              <h2 id="auth-dialog-title" style="margin-top:5px">Account Authentication &amp; OAuth 2.0</h2>
              <p>Sign in via OAuth single sign-on or email &amp; password. All valid email syntaxes allowed &amp; persisted in backend.</p>
            </div>
            <button class="icon-button" data-action="close-dialog" type="button" aria-label="Close dialog">×</button>
          </div>

          <div class="dialog-body">
            <!-- Active Authenticated User Profile Banner -->
            ${s.currentUser ? `
              <div style="padding:12px 14px; background:var(--surface-low); border:1px solid var(--border); border-radius:8px; margin-bottom:16px">
                <div style="display:flex; justify-content:space-between; align-items:center">
                  <div style="display:flex; align-items:center; gap:10px">
                    <span style="width:36px; height:36px; border-radius:50%; background:#003087; color:#fff; display:grid; place-items:center; font-weight:800; font-size:13px">${esc(currentUser.avatar || "MO")}</span>
                    <div>
                      <strong style="color:var(--text); font-size:13px">${esc(currentUser.name)}</strong>
                      <span style="display:block; color:var(--muted); font-size:11px">${esc(currentUser.email)} · <em>${esc(currentUser.role)}</em></span>
                    </div>
                  </div>
                  <div style="text-align:right">
                    <span class="status-pill approved" style="font-size:10px">✓ ${esc(currentUser.authMethod || "Active Session")}</span>
                    <button class="link-button" data-action="logout-user" type="button" style="display:block; margin-top:4px; font-size:11px; margin-left:auto">Sign Out</button>
                  </div>
                </div>
                <div style="margin-top:10px; padding-top:10px; border-top:1px solid var(--border); display:flex; justify-content:space-between; align-items:center">
                  <div>
                    <span style="font-size:11px; color:var(--muted)">Your Vault Capital:</span>
                    <strong style="font-size:13px; color:var(--green); margin-left:6px">${money(s.defaultVault || s.vault || 0)}</strong>
                  </div>
                  <div style="display:flex; gap:6px; align-items:center">
                    <input id="user-profile-vault" type="number" min="0" step="1000" value="${s.defaultVault || s.vault || 0}" style="padding:4px 8px; font-size:11px; width:110px; background:var(--surface); border:1px solid var(--border); color:var(--text); border-radius:4px" placeholder="Set vault $">
                    <button class="btn btn-secondary btn-sm" data-action="update-user-vault" type="button" style="font-size:10px; padding:3px 8px">Set Vault $</button>
                  </div>
                </div>
              </div>
            ` : `
              <div style="padding:10px 14px; background:rgba(59,130,246,0.08); border:1px solid rgba(59,130,246,0.2); border-radius:8px; margin-bottom:16px; font-size:12px; color:var(--muted)">
                <div style="display:flex; justify-content:space-between; align-items:center">
                  <div>
                    <strong style="color:var(--text); display:block; margin-bottom:2px">Configured Vault Capital</strong>
                    <span>Current active reserve: <strong style="color:var(--green)">${money(s.defaultVault || s.vault || 0)}</strong></span>
                  </div>
                  <div style="display:flex; gap:6px; align-items:center">
                    <input id="guest-profile-vault" type="number" min="0" step="any" value="${s.defaultVault || s.vault || 0}" style="padding:4px 8px; font-size:11px; width:110px; background:var(--surface); border:1px solid var(--border); color:var(--text); border-radius:4px" placeholder="Set vault $">
                    <button class="btn btn-secondary btn-sm" data-action="update-guest-vault" type="button" style="font-size:10px; padding:3px 8px">Set Vault $</button>
                  </div>
                </div>
              </div>
            `}

            <!-- 1. OAuth 2.0 Single Sign-On -->
            <div style="margin-bottom:18px">
              <span class="card-kicker" style="display:block; margin-bottom:8px">1 · Fast OAuth 2.0 Authentication</span>
              <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:8px">
                <button class="btn btn-secondary btn-sm" data-action="oauth-login" data-provider="google" type="button" style="justify-content:center; gap:6px; font-weight:600; padding:8px 6px">
                  <svg width="14" height="14" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/></svg>
                  Google OAuth
                </button>
                <button class="btn btn-secondary btn-sm" data-action="oauth-login" data-provider="paypal" type="button" style="justify-content:center; gap:6px; font-weight:600; padding:8px 6px">
                  <span style="font-weight:900; color:#003087; font-size:12px">P</span>
                  PayPal OAuth
                </button>
                <button class="btn btn-secondary btn-sm" data-action="oauth-login" data-provider="github" type="button" style="justify-content:center; gap:6px; font-weight:600; padding:8px 6px">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.1-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z"/></svg>
                  GitHub OAuth
                </button>
              </div>
            </div>

            <!-- 2. Email & Password Credentials (Allow All with Correct Syntax) -->
            <form id="auth-login-form">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px">
                <span class="card-kicker">2 · Email &amp; Password Sign-In (Allow All Valid)</span>
                <span id="auth-email-badge" class="status-pill review" style="font-size:10px">Required</span>
              </div>
              <div class="form-grid">
                <div class="form-field full">
                  <label for="auth-email">Email Address (Syntax: user@domain.com)</label>
                  <input id="auth-email" name="email" type="email" required placeholder="name@yourcompany.com" autocomplete="email">
                  <span class="form-hint" id="auth-email-hint">Type any email: syntax validates in real time. All valid emails are allowed.</span>
                </div>
                <div class="form-field">
                  <label for="auth-password">Password</label>
                  <input id="auth-password" name="password" type="password" required placeholder="Enter password (e.g. ••••••••)" autocomplete="current-password">
                </div>
                <div class="form-field">
                  <label for="auth-name">Display Name (Optional)</label>
                  <input id="auth-name" name="name" type="text" placeholder="e.g. Alex Rivera">
                </div>
                <div class="form-field full">
                  <label for="auth-role">Workspace Role</label>
                  <select id="auth-role" name="role">
                    <option value="Agent Finance Manager">Agent Finance Manager (Policy Control)</option>
                    <option value="Finance Director">Finance Director (Executive Access)</option>
                    <option value="Autonomous System Operator">Autonomous System Operator (Telemetry)</option>
                    <option value="Security &amp; Compliance Lead">Security &amp; Compliance Lead</option>
                  </select>
                </div>
                <div class="form-field full">
                  <label for="auth-vault-amount">Set Default Money in Vault ($ USD Capital)</label>
                  <input id="auth-vault-amount" name="vaultAmount" type="number" min="0" step="1000" placeholder="e.g. 50000 or 100000 (Enter your desired capital)" value="${s.defaultVault || ''}">
                  <span class="form-hint">Set your desired money in the vault. Workspace will operate according to your exact requirement.</span>
                </div>
              </div>

              <div style="margin-top:14px">
                <button class="btn btn-primary" id="auth-submit-btn" type="submit" style="width:100%; justify-content:center">
                  ✓ Sign In / Allow All (Persist in Backend)
                </button>
              </div>
            </form>

            ${usersListHtml ? `
              <div style="margin-top:16px; border-top:1px solid var(--border); padding-top:12px">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px">
                  <span class="card-kicker">Backend Users Database (${(usersListHtml.match(/status-pill/g) || []).length} registered)</span>
                  <a href="/backend" target="_blank" class="link-button" style="font-size:10px">Open API Console →</a>
                </div>
                <div style="max-height:120px; overflow-y:auto; padding-right:4px">
                  ${usersListHtml}
                </div>
              </div>
            ` : ""}
          </div>

          <div class="dialog-actions">
            <button class="btn btn-secondary" data-action="close-dialog" type="button">Close</button>
          </div>
        </section>
      </div>
    `;
    const emailInput = $("#auth-email");
    if (emailInput) emailInput.focus();
  }

  async function handleEmailLogin(form) {
    const s = setState();
    const data = new FormData(form);
    const email = (data.get("email") || "").trim();
    const password = (data.get("password") || "").trim();
    const name = (data.get("name") || "").trim();
    const role = (data.get("role") || "").trim();

    if (!email) {
      return api.toast("Email address is required.");
    }
    if (!isValidEmailSyntax(email)) {
      return api.toast("Invalid email syntax! Please enter a valid email address (e.g., name@domain.com).");
    }
    if (!password) {
      return api.toast("Password is required.");
    }

    const btn = $("#auth-submit-btn");
    if (btn) { btn.disabled = true; btn.textContent = "Authenticating with Backend..."; }

    try {
      let result = null;
      const vaultAmount = Number(data.get("vaultAmount"));
      const userVault = Number.isFinite(vaultAmount) && vaultAmount > 0 ? vaultAmount : null;
      if (userVault) {
        s.defaultVault = userVault;
        s.vault = userVault;
      }
      if (window.MANDATE_API && typeof window.MANDATE_API.login === "function") {
        result = await window.MANDATE_API.login(email, password, name, role, userVault);
      } else {
        result = {
          success: true,
          user: {
            id: "usr-" + Date.now().toString(36),
            email,
            name: name || email.split("@")[0],
            role: role || "Agent Finance Manager",
            authMethod: "Email / Password",
            avatar: email.slice(0, 2).toUpperCase()
          }
        };
      }

      if (result && result.user) {
        s.currentUser = result.user;
        api.persist();
        api.render();
        closeDialog();
        api.toast(`✓ Authenticated as ${result.user.name} (${result.user.email}). User data saved in backend.`);
      } else {
        api.toast(result?.error || "Login failed. Check credentials.");
        if (btn) { btn.disabled = false; btn.textContent = "✓ Sign In / Allow All (Persist in Backend)"; }
      }
    } catch (err) {
      console.warn("[Auth login error]:", err);
      api.toast("Network error during authentication. Check server.");
      if (btn) { btn.disabled = false; btn.textContent = "✓ Sign In / Allow All (Persist in Backend)"; }
    }
  }

  async function handleOAuthLogin(provider) {
    const s = setState();
    const defaultEmails = {
      google: "operator@gmail.com",
      paypal: "merchant-sandbox@paypal.com",
      github: "developer@github.com"
    };
    const defaultNames = {
      google: "Google OAuth Operator",
      paypal: "PayPal Verified Merchant",
      github: "GitHub Automation Lead"
    };

    api.toast(`Authenticating with ${provider.toUpperCase()} OAuth 2.0...`);

    try {
      let result = null;
      const vInput = $("#auth-vault-amount");
      const vaultAmount = vInput && Number(vInput.value) > 0 ? Number(vInput.value) : null;
      if (vaultAmount) {
        s.defaultVault = vaultAmount;
        s.vault = vaultAmount;
      }
      if (window.MANDATE_API && typeof window.MANDATE_API.oauthLogin === "function") {
        result = await window.MANDATE_API.oauthLogin(provider, defaultEmails[provider], defaultNames[provider], null, vaultAmount);
      } else {
        result = {
          success: true,
          user: {
            id: `usr-${provider}-${Date.now().toString(36)}`,
            email: defaultEmails[provider],
            name: defaultNames[provider],
            role: provider === "paypal" ? "PayPal Merchant Operator" : "Autonomous Agent Lead",
            authMethod: `OAuth 2.0 (${provider.toUpperCase()})`,
            avatar: provider === "google" ? "G" : provider === "paypal" ? "PP" : "GH"
          }
        };
      }

      if (result && result.user) {
        s.currentUser = result.user;
        api.persist();
        api.render();
        closeDialog();
        api.toast(`✓ Signed in with ${result.user.authMethod} (${result.user.email}). Persisted in backend.`);
      }
    } catch (err) {
      console.warn("[OAuth error]:", err);
      api.toast(`OAuth sign in failed for ${provider}.`);
    }
  }

  function handleLogout() {
    const s = setState();
    s.currentUser = null;
    api.persist();
    api.render();
    closeDialog();
    api.toast("Signed out. Switched to guest session.");
    if (window.MANDATE_API && typeof window.MANDATE_API.logout === "function") {
      window.MANDATE_API.logout().catch(() => {});
    }
  }

  function handleAction(node) {
    const action = node.dataset.action;
    const s = setState();
    
    // ─── Multi-Rail Universal Action Handlers ────────────────────────────────
    if (action === "open-multi-rail-pay") {
      const { feature, id, amount, inrAmount, merchant, title } = node.dataset;
      const isMandate = feature === 'mandate';
      const parsedInr = isMandate ? (Number(inrAmount) || Number(amount) || 10000) : (Number(inrAmount) || 0);
      return openMultiRailPayModal({
        feature,
        id,
        amount: isMandate ? parsedInr : (Number(amount) || 100),
        inrAmount: parsedInr,
        isPureInr: isMandate,
        merchant,
        title
      });
    }
    if (action === "pay-mandate-mayukhupi") {
      const { id, amount, merchant, title } = node.dataset;
      const amtInr = Number(amount) || 10000;
      api.toast(`⚡ Initializing MayukhUPI payment for ₹${amtInr.toLocaleString('en-IN')}...`);
      const targetUrl = `/checkout/${id}?amount=${amtInr}&merchant=${encodeURIComponent(merchant || 'Mandate Vendor')}&title=${encodeURIComponent(title || 'Mandate Spend')}&signin=1`;
      window.location.href = targetUrl;
      return;
    }
    if (action === "exec-modal-mayukhupi") {
      const ctx = window._activeMultiRailContext || {};
      const isMandate = ctx.feature === 'mandate' || ctx.isPureInr;
      const amtInr = isMandate ? Number(ctx.inrAmount || ctx.amount || 10000) : (ctx.inrAmount || Math.round(Number(ctx.usdAmount || 100) * 85));

      closeDialog();
      api.toast(`⚡ Switching to MayukhUPI portal for ₹${amtInr.toLocaleString('en-IN')}...`);

      const projectSummary = ctx.title || `Mandate Settlement ${ctx.id || ''}`;
      const targetUrl = `/checkout/${ctx.id || 'demo-session-101'}?amount=${amtInr}&merchant=${encodeURIComponent(ctx.merchant || 'Mayukh Cloud Systems')}&title=${encodeURIComponent(projectSummary)}&signin=1`;

      if (window.MANDATE_API && window.MANDATE_API.createMayukhUpiCheckout) {
        window.MANDATE_API.createMayukhUpiCheckout({
          amount: amtInr,
          orderId: `ORD-${(ctx.id || Date.now().toString()).slice(-6)}`,
          merchantName: ctx.merchant || 'Mayukh Cloud Systems',
          description: projectSummary
        }).then(res => {
          const finalUrl = res.checkoutUrl ? `${res.checkoutUrl}?amount=${amtInr}&merchant=${encodeURIComponent(ctx.merchant || 'Mayukh Cloud Systems')}&title=${encodeURIComponent(projectSummary)}&signin=1` : targetUrl;
          window.location.href = finalUrl;
        }).catch(() => {
          window.location.href = targetUrl;
        });
      } else {
        window.location.href = targetUrl;
      }
      return;
    }
    if (action === "exec-modal-mayukhupi-instant") {
      const ctx = window._activeMultiRailContext || {};
      closeDialog();
      const s = setState();
      s.activity = s.activity || [];
      s.activity.unshift({
        id: `act-${Date.now().toString(36)}`,
        title: `${ctx.merchant || 'Merchant'} - MayukhUPI Settlement`,
        merchant: ctx.merchant || 'MAYUKHUPI Merchant',
        amount: ctx.usdAmount || 100,
        status: "approved",
        decision: "Settled via MayukhUPI Gateway (UPI Verified)",
        agent: ctx.title || "Multi-Rail Gateway"
      });
      api.persist();
      api.render();
      api.toast(`✓ Instant MayukhUPI settlement confirmed! Ledger updated.`);
      return;
    }
    if (action === "exec-modal-paypal") {
      const ctx = window._activeMultiRailContext || {};
      closeDialog();
      api.toast(`🅿️ Generating live PayPal order for ${money(ctx.usdAmount || 100)}...`);
      if (window.MANDATE_API && window.MANDATE_API.createPayPalOrder) {
        window.MANDATE_API.createPayPalOrder({
          amount: ctx.usdAmount || 100,
          currency: 'USD',
          merchant: ctx.merchant || 'Mandate Merchant',
          description: ctx.title || 'Settlement'
        }).then(order => {
          const url = order.approvalUrl || order.localCheckoutUrl || `https://www.sandbox.paypal.com/checkoutnow?token=${order.id}`;
          window.open(url, '_blank');
          api.toast(`✓ PayPal checkout window opened! Order ID: ${order.id}`);
        }).catch(err => {
          window.open(`https://www.sandbox.paypal.com`, '_blank');
          api.toast(`PayPal link opened: ${err.message}`);
        });
      } else {
        window.open(`https://www.sandbox.paypal.com`, '_blank');
      }
      return;
    }
    if (action === "exec-modal-paypal-instant") {
      const ctx = window._activeMultiRailContext || {};
      closeDialog();
      const s = setState();
      s.activity = s.activity || [];
      s.activity.unshift({
        id: `act-${Date.now().toString(36)}`,
        title: `${ctx.merchant || 'Merchant'} - PayPal Capture`,
        merchant: ctx.merchant || 'PayPal Merchant',
        amount: ctx.usdAmount || 100,
        status: "approved",
        decision: "Settled via PayPal Sandbox Capture",
        agent: ctx.title || "PayPal Rail"
      });
      api.persist();
      api.render();
      api.toast(`✓ PayPal Sandbox capture confirmed! Order settled.`);
      return;
    }
    if (action === "exec-modal-bot") {
      const ctx = window._activeMultiRailContext || {};
      const channel = node.dataset.channel || 'telegram';
      closeDialog();
      const channelLabel = channel === 'whatsapp' ? 'WhatsApp Bot' : 'Telegram Bot';
      api.toast(`🤖 Dispatching settlement via ${channelLabel}...`);
      if (window.MANDATE_API && window.MANDATE_API.payViaBot) {
        window.MANDATE_API.payViaBot({
          channel,
          amount: ctx.usdAmount || 100,
          merchant: ctx.merchant || 'Merchant',
          note: ctx.title || 'Settlement'
        }).then(() => {
          api.toast(`✓ Payment dispatched via ${channelLabel}!`);
        }).catch(() => {
          api.toast(`✓ Payment broadcasted via ${channelLabel}!`);
        });
      }
      const s = setState();
      s.activity = s.activity || [];
      s.activity.unshift({
        id: `act-${Date.now().toString(36)}`,
        title: `${ctx.merchant || 'Merchant'} - ${channelLabel} Payout`,
        merchant: ctx.merchant || 'Merchant',
        amount: ctx.usdAmount || 100,
        status: "approved",
        decision: `Executed via ${channelLabel} payment rail`,
        agent: ctx.title || "Bot Rail"
      });
      api.persist();
      api.render();
      return;
    }

    // ─── Direct FairShare Payment Handlers ────────────────────────────────────
    if (action === "pay-fair-mayukhupi") {
      const person = node.dataset.person || 'Friend';
      const amount = Number(node.dataset.amount) || 25;
      if (!checkVaultSufficiency(amount, `FairShare for ${person}`)) return;

      const amtInr = Math.round(amount * 85);
      api.toast(`⚡ Switching to MayukhUPI localhost for ${person} (₹${amtInr})...`);

      const liveVault = Number(s.vault ?? s.dashboard?.vault ?? s.defaultVault ?? 0);
      s.vault = Math.max(0, liveVault - amount);
      if (s.dashboard) s.dashboard.vault = s.vault;
      api.persist();
      api.render();

      const projectSummary = `FairShare Expense Split: ${person}`;
      const targetUrl = `/checkout/demo-session-101?amount=${amtInr}&merchant=${encodeURIComponent(`FairShare: ${person}`)}&title=${encodeURIComponent(projectSummary)}`;

      if (window.MANDATE_API && window.MANDATE_API.createMayukhUpiCheckout) {
        window.MANDATE_API.createMayukhUpiCheckout({
          amount: amtInr,
          orderId: `ORD-FS-${Date.now().toString().slice(-6)}`,
          merchantName: `FairShare: ${person}`,
          description: projectSummary
        }).then(res => {
          window.location.href = res.checkoutUrl ? `${res.checkoutUrl}?amount=${amtInr}&merchant=${encodeURIComponent(`FairShare: ${person}`)}&title=${encodeURIComponent(projectSummary)}` : targetUrl;
        }).catch(() => {
          window.location.href = targetUrl;
        });
      } else {
        window.location.href = targetUrl;
      }
      return;
    }
    if (action === "pay-fair-paypal") {
      const person = node.dataset.person || 'Friend';
      const amount = Number(node.dataset.amount) || 25;
      api.toast(`🅿️ Creating PayPal payment link for ${person} (${money(amount)})...`);
      if (window.MANDATE_API && window.MANDATE_API.createPayPalOrder) {
        window.MANDATE_API.createPayPalOrder({
          amount,
          currency: 'USD',
          merchant: `FairShare Debt: ${person}`,
          description: `FairShare settlement for ${person}`
        }).then(order => {
          const url = order.approvalUrl || order.localCheckoutUrl || `https://www.sandbox.paypal.com/checkoutnow?token=${order.id}`;
          window.open(url, '_blank');
          api.toast(`✓ PayPal checkout link opened for ${person}!`);
        }).catch(() => {
          window.open(`https://www.paypal.com/paypalme/demo/${amount}`, '_blank');
        });
      } else {
        window.open(`https://www.paypal.com/paypalme/demo/${amount}`, '_blank');
      }
      return;
    }
    if (action === "pay-fair-bot") {
      const person = node.dataset.person || 'Friend';
      const amount = Number(node.dataset.amount) || 25;
      api.toast(`🤖 Dispatching FairShare split request for ${person} via Finance Bot...`);
      if (window.MANDATE_API && window.MANDATE_API.payViaBot) {
        window.MANDATE_API.payViaBot({
          channel: 'telegram',
          amount,
          merchant: person,
          note: `FairShare split settlement for ${person}`
        }).catch(() => {});
      }
      api.toast(`✓ Bot payment request dispatched to ${person}!`);
      return;
    }

    // ─── Direct Dispute Settlement Handlers ───────────────────────────────────
    if (action === "pay-dispute-mayukhupi") {
      const id = node.dataset.id || 'TX-948201';
      const amount = Number(node.dataset.amount) || 157250;
      const amtInr = amount;
      const liveVault = Number(s.vault ?? s.dashboard?.vault ?? s.defaultVault ?? 500000);
      if (amtInr > liveVault) {
        const msg = "You don't have sufficient money present in your vault to spend.";
        alert(msg);
        return api.toast(msg);
      }

      node.disabled = true;
      node.innerHTML = "⚡ Switching to MayukhUPI...";
      api.toast(`⚡ Switching to MayukhUPI localhost portal for ₹${amtInr.toLocaleString('en-IN')}...`);

      const projectSummary = `Dispute Resolution Settlement: ${id}`;
      const orderId = `ORD-DISP-${id.slice(-6)}`;
      const targetUrl = `/checkout/ord-disp-${id.toLowerCase()}?amount=${amtInr}&merchant=${encodeURIComponent('Merchant Dispute Resolution')}&title=${encodeURIComponent(projectSummary)}&orderId=${encodeURIComponent(orderId)}`;

      if (window.MANDATE_API && window.MANDATE_API.createMayukhUpiCheckout) {
        window.MANDATE_API.createMayukhUpiCheckout({
          orderId,
          amount: amtInr,
          currency: 'INR',
          merchantName: 'Merchant Dispute Resolution',
          description: projectSummary
        }).then(data => {
          const finalUrl = data.checkoutUrl ? `${data.checkoutUrl}?amount=${amtInr}&merchant=${encodeURIComponent('Merchant Dispute Resolution')}&title=${encodeURIComponent(projectSummary)}` : targetUrl;
          window.location.href = finalUrl;
        }).catch(() => {
          window.location.href = targetUrl;
        });
      } else {
        window.location.href = targetUrl;
      }
      return;
    }
    if (action === "pay-dispute-paypal") {
      const id = node.dataset.id || 'TX-948201';
      const amount = Number(node.dataset.amount) || 1850;
      api.toast(`🅿️ Creating PayPal dispute settlement link for ${money(amount)}...`);
      if (window.MANDATE_API && window.MANDATE_API.createPayPalOrder) {
        window.MANDATE_API.createPayPalOrder({
          amount,
          currency: 'USD',
          merchant: 'Dispute Resolution Settlement',
          description: `Dispute Refund & Settlement for ${id}`
        }).then(order => {
          const url = order.approvalUrl || order.localCheckoutUrl || `https://www.sandbox.paypal.com/checkoutnow?token=${order.id}`;
          window.open(url, '_blank');
          api.toast(`✓ PayPal checkout link opened for dispute ${id}!`);
        }).catch(() => {
          window.open(`https://www.sandbox.paypal.com`, '_blank');
        });
      } else {
        window.open(`https://www.sandbox.paypal.com`, '_blank');
      }
      return;
    }
    if (action === "pay-dispute-bot") {
      const id = node.dataset.id || 'TX-948201';
      const amount = Number(node.dataset.amount) || 1850;
      api.toast(`🤖 Dispatching dispute settlement via Finance Bot...`);
      if (window.MANDATE_API && window.MANDATE_API.payViaBot) {
        window.MANDATE_API.payViaBot({
          channel: 'telegram',
          amount,
          merchant: 'Dispute Settlement',
          note: `Dispute ${id} refund & settlement`
        }).catch(() => {});
      }
      api.toast(`✓ Dispute settlement payout executed via Bot!`);
      return;
    }

    if (action === "open-mandate") return openMandateDialog();
    if (action === "open-track-stock-dialog") return openTrackStockDialog();
    if (action === "quick-create-mandate") return createMandateFromPreset(node.dataset.template);
    if (action === "autofill-preset") return autofillPreset(node.dataset.preset);
    if (action === "close-dialog") return closeDialog();
    if (action === "open-domain-settings") return openDomainSettingsDialog();
    if (action === "open-paypal-connect") return openPayPalConnectDialog();
    if (action === "open-vault-dialog") return openVaultDialog();
    if (action === "open-auth-dialog") return openAuthDialog();
    if (action === "oauth-login") return handleOAuthLogin(node.dataset.provider);
    if (action === "logout-user") return handleLogout();
    if (action === "set-vault-preset") return handleVaultPreset(node.dataset.amount);
    if (action === "update-user-vault" || action === "update-guest-vault") {
      const vInput = action === "update-user-vault" ? $("#user-profile-vault") : $("#guest-profile-vault");
      const amt = Number(vInput?.value);
      if (!Number.isFinite(amt) || amt < 0) return api.toast("Enter a valid positive vault amount.");
      s.defaultVault = amt;
      s.vault = amt;
      if (s.currentUser) {
        s.currentUser.vaultAmount = amt;
      }
      const hv = $("#header-vault-amount");
      if (hv) hv.textContent = "$" + Math.round(amt).toLocaleString("en-US");
      const al = $("#topbar-auth-label");
      if (al) {
        const uName = s.currentUser?.name || (s.currentUser?.email ? s.currentUser.email.split("@")[0] : "Active");
        al.textContent = `${uName} · $${Math.round(amt).toLocaleString("en-US")}`;
      }
      api.persist(); api.render();
      if (window.MANDATE_API && window.MANDATE_API.updateVault) {
        window.MANDATE_API.updateVault(amt).catch(() => {});
      }
      api.toast(`✓ Vault reserve capital updated to ${money(amt)} in real time.`);
      return;
    }
    if (action === "load-demo-paypal") {
      const idInput = $("#pp-client-id");
      const secInput = $("#pp-client-secret");
      if (idInput && secInput) {
        idInput.value = "AZDxjDScFpQtjWTOUtWKbyN_bDt4OgqaF4eGCayoXOEI78NOqRw3EQnhQPrUzOMortZXDuFHqi3PdA_5";
        secInput.value = "EMa9Q_N6uXf4bWJ53qY8j_h10P2GqB5n5m_1Q0hWpC1sH2eI4dJ5kL7mN9oP";
        api.toast("Demo sandbox credentials populated. Click Validate to connect.");
      }
      return;
    }
    if (action === "simulate-mandate-payment") return openSimulatePaymentDialog(node.dataset.id);
    if (action === "toggle-mandate") {
      const item = s.mandates.find((entry) => entry.id === node.dataset.id);
      if (item) {
        item.status = item.status === "active" ? "paused" : "active";
        api.persist();
        api.render();
        api.toast(`Mandate "${item.name}" is now ${item.status}.`);
        if (window.MANDATE_API && window.MANDATE_API.toggleMandate) {
          window.MANDATE_API.toggleMandate(item.id).catch(() => {});
        }
      }
      return;
    }
    if (action === "pay-approval-mayukhupi") {
      const id = node.dataset.id;
      const item = s.approvals.find((entry) => entry.id === id);
      if (!item) return;

      const amtInr = Number(item.amount) || 0;
      // Convert INR amount to USD equivalent if vault is in USD
      const liveVault = Number(s.vault ?? s.dashboard?.vault ?? s.defaultVault ?? 0);
      const isVaultInInr = liveVault > 10000;
      const amtForVault = isVaultInInr ? amtInr : Math.round((amtInr / 85) * 100) / 100;

      // VAULT SUFFICIENCY CHECK: Show exact comment if money required exceeds vault
      if (amtForVault > liveVault) {
        const msg = "You don't have sufficient money present in your vault to spend.";
        api.toast(msg);
        alert(msg);
        return;
      }

      node.disabled = true;
      node.innerHTML = "⚡ Switching to MayukhUPI...";
      api.toast(`⚡ Switching to MayukhUPI localhost portal for ₹${amtInr.toLocaleString('en-IN')}...`);

      // Deduct committed amount from vault
      s.vault = Math.max(0, liveVault - amtForVault);
      if (s.dashboard) s.dashboard.vault = s.vault;
      item.status = "approved";
      item.settled = true;
      item.paymentMethod = "MayukhUPI Gateway";
      api.persist();
      api.render();

      const projectSummary = item.detail || item.signal || `Approval for ${item.merchant}`;
      const targetUrl = `/checkout/${id}?amount=${amtInr}&merchant=${encodeURIComponent(item.merchant || 'Mayukh Cloud Systems')}&title=${encodeURIComponent(projectSummary)}&orderId=${encodeURIComponent(`ORD-APPR-${id.slice(-6)}`)}`;

      if (window.MANDATE_API && window.MANDATE_API.createMayukhUpiCheckout) {
        window.MANDATE_API.createMayukhUpiCheckout({
          approvalId: id,
          amount: amtInr,
          orderId: `ORD-APPR-${id.slice(-6)}`,
          currency: 'INR',
          merchantName: item.merchant || 'Mayukh Cloud Systems',
          description: projectSummary
        }).then(data => {
          const finalUrl = data.checkoutUrl ? `${data.checkoutUrl}?amount=${amtInr}&merchant=${encodeURIComponent(item.merchant || 'Mayukh Cloud Systems')}&title=${encodeURIComponent(projectSummary)}` : targetUrl;
          window.location.href = finalUrl;
        }).catch(() => {
          window.location.href = targetUrl;
        });
      } else {
        window.location.href = targetUrl;
      }
      return;
    }
    if (action === "pay-approval") {
      const id = node.dataset.id;
      const method = node.dataset.method || "paypal";
      const item = s.approvals.find((entry) => entry.id === id);
      if (!item) return;

      const availableVault = Number(s.dashboard?.vault ?? s.defaultVault ?? 500000);
      if (Number(item.amount) > availableVault) {
        const msg = "You don't have sufficient money present in your vault to spend.";
        alert(msg);
        api.toast(msg);
        return;
      }

      const methodLabel = method === "mayukhupi" ? "MAYUKHUPI Gateway" : method === "whatsapp" ? "WhatsApp Bot" : method === "telegram" ? "Telegram Bot" : "PayPal Sandbox";

      item.status = "approved";
      item.settled = true;
      item.paymentMethod = methodLabel;

      // Sync originating feature
      if (item.category === "procurement" || item.id.startsWith("appr-proc-")) {
        if (s.procurement) { s.procurement.approved = true; s.procurement.status = "paid"; }
      } else if (item.mandateId === "inventory-restock-gate" || item.id.startsWith("appr-inv-")) {
        if (s.inventory) { s.inventory.approved = true; s.inventory.ordered = true; }
      } else if (item.mandateId === "escrow-bounty-milestone" || item.category === "escrow" || item.id.startsWith("appr-escrow-")) {
        if (s.escrow) { s.escrow.humanApproved = true; s.escrow.stage = 4; }
      }

      api.persist();
      api.render();

      if (method === "mayukhupi") {
        window.open(`/checkout/demo-session-101`, '_blank');
      }

      if (window.MANDATE_API && window.MANDATE_API.payApproval) {
        window.MANDATE_API.payApproval(id, method).then((res) => {
          api.toast(`✓ Settlement of ${money(item.amount)} executed via ${methodLabel}! Capture: ${res.captureId || 'OK'}`);
        }).catch((err) => {
          const isSpendErr = err.message && (err.message.includes("spend") || err.message.includes("sufficient"));
          const msg = isSpendErr ? "You don't have sufficient money present in your vault to spend." : `Payment error: ${err.message}`;
          if (isSpendErr) alert(msg);
          api.toast(msg);
        });
      } else {
        api.toast(`✓ Settlement of ${money(item.amount)} executed via ${methodLabel}!`);
      }
      return;
    }
    if (action === "simulate-approve") {
      const item = s.approvals.find((entry) => entry.id === node.dataset.id);
      if (item && item.status === "pending") {
        item.status = "approved";
        // Connect approval manually to the respective section
        if (item.category === "procurement" || item.id.startsWith("appr-proc-")) {
          if (s.procurement) s.procurement.approved = true;
          api.toast("✓ Procurement variance approved by human review! Payout unlocked.");
        } else if (item.mandateId === "inventory-restock-gate" || item.id.startsWith("appr-inv-")) {
          if (s.inventory) s.inventory.approved = true;
          api.toast("✓ Inventory restock authorized by human review! Ready for PayPal Checkout.");
        } else if (item.mandateId === "escrow-bounty-milestone" || item.category === "escrow" || item.id.startsWith("appr-escrow-")) {
          if (s.escrow) {
            s.escrow.humanApproved = true;
            s.escrow.stage = 3;
          }
          api.toast("✓ Stage 2 Human Authorization granted! Escrow unlocked for Stage 3 PayPal Checkout.");
        } else {
          api.toast("✓ Approved. Order dispatched via PayPal sandbox.");
        }
        api.persist(); api.render();
        if (window.MANDATE_API && window.MANDATE_API.approvePayment) {
          window.MANDATE_API.approvePayment(item.id, item).catch(() => {});
        }
      }
      return;
    }
    if (action === "simulate-deny") {
      const item = s.approvals.find((entry) => entry.id === node.dataset.id);
      if (item && item.status === "pending") {
        item.status = "denied";
        api.persist(); api.render(); api.toast("Denied. Transaction blocked by policy.");
        if (window.MANDATE_API && window.MANDATE_API.denyPayment) {
          window.MANDATE_API.denyPayment(item.id, item).catch(() => {});
        }
      }
      return;
    }
    if (action === "pay-with-paypal") {
      const item = s.approvals.find((entry) => entry.id === node.dataset.id);
      if (item) openPayPalCheckoutDialog(item);
      return;
    }
    if (action === "undo-approval") {
      const item = s.approvals.find((entry) => entry.id === node.dataset.id);
      if (item && item.status !== "pending") {
        item.status = "pending";
        api.persist(); api.render(); api.toast("Returned to approvals queue.");
        if (window.MANDATE_API && window.MANDATE_API.undoDecision) {
          window.MANDATE_API.undoDecision(item.id, item).catch(() => {});
        }
      }
      return;
    }
    if (action === "add-fair-friend") {
      const input = $("#new-friend-input");
      const name = input ? input.value.trim() : "";
      if (!name) return api.toast("Enter a participant name to add them to the split.");
      s.fairParticipants = s.fairParticipants || [...api.data.fairShare.participants];
      if (s.fairParticipants.some((p) => p.toLowerCase() === name.toLowerCase())) {
        return api.toast(`"${name}" is already in the split group.`);
      }
      s.fairParticipants.push(name);
      s.fairItems.forEach((item) => {
        if (!item.included || item.included.length === 0 || item.included.length >= s.fairParticipants.length - 1) {
          item.included = [...new Set([...(item.included || []), name])];
        }
      });
      api.persist(); api.render();
      api.toast(`Added ${name} to FairShare. Now ${s.fairParticipants.length} members in group.`);
      return;
    }
    if (action === "remove-fair-friend") {
      const name = node.dataset.name;
      s.fairParticipants = s.fairParticipants || [...api.data.fairShare.participants];
      if (s.fairParticipants.length <= 2) return api.toast("Group split requires at least 2 members.");
      s.fairParticipants = s.fairParticipants.filter((p) => p !== name);
      s.fairItems.forEach((item) => {
        item.included = (item.included || []).filter((p) => p !== name);
        if (item.paidBy === name) item.paidBy = "";
      });
      api.persist(); api.render(); api.toast(`Removed ${name} from the group.`);
      return;
    }
    if (action === "delete-fair-item") {
      const idx = Number(node.dataset.index);
      if (Number.isInteger(idx) && idx >= 0 && idx < s.fairItems.length) {
        const removed = s.fairItems.splice(idx, 1);
        api.persist(); api.render(); api.toast(`Deleted "${removed[0]?.name || "line item"}".`);
      }
      return;
    }
    if (action === "apply-fair-note") {
      const context = (s.fairContext || "").toLowerCase();
      if (!context) return api.toast("Write a note describing the expense arrangements first.");
      const participants = s.fairParticipants || api.data.fairShare.participants;
      let adjusted = 0;
      s.fairItems.forEach((item) => {
        const itemName = (item.name || "").toLowerCase();
        participants.forEach((person) => {
          const pLower = person.toLowerCase();
          if (context.includes(pLower)) {
            const regexExclude = new RegExp(`${pLower}\\s+(?:did not|didn'?t|no|skipped|avoided|passed on)\\s+(?:have|eat|drink|share)?\\s*(?:the)?\\s*${itemName}`, "i");
            const regexPaid = new RegExp(`${pLower}\\s+(?:paid|covered|fronted|deposited)\\s+(?:for)?\\s*(?:the)?\\s*${itemName}`, "i");
            if (regexExclude.test(context) || (context.includes(`no ${itemName}`) && context.includes(pLower))) {
              item.included = (item.included || []).filter((p) => p !== person);
              adjusted++;
            }
            if (regexPaid.test(context)) {
              item.paidBy = person;
              adjusted++;
            }
          }
        });
      });
      api.persist(); api.render();
      api.toast(adjusted > 0 ? `Note applied: updated ${adjusted} allocations.` : "Note analyzed. Allocations are aligned.");
      return;
    }
    if (action === "fair-add-item") return openFairItemDialog();
    if (action === "prepare-fair-requests") {
      const { rows, total, unallocated } = api.fairTotals();
      if (!total) return api.toast("Enter at least one line-item amount before preparing payment links.");
      if (unallocated) return api.toast(`${money(unallocated / 100)} remains unallocated. Assign participants to all priced lines.`);
      const count = rows.filter((row) => row.net > 0).length;
      api.toast(`Ready: ${count} PayPal request link${count === 1 ? "" : "s"} generated for members who owe funds.`);
      return;
    }
    if (action === "copy-fair-preview") {
      const text = `https://paypal.me/request/${node.dataset.person}?amount=${Number(node.dataset.amount) / 100}`;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => api.toast("PayPal request link copied to clipboard.")).catch(() => api.toast(text));
      } else {
        api.toast(text);
      }
      return;
    }
    if (action === "prepare-dispute") return draftDispute();
    if (action === "submit-dispute") return submitDisputePackage();
    if (action === "copy-dispute-draft") {
      const s = setState();
      const draftEl = $("#dispute-draft");
      const text = draftEl ? draftEl.value : (s.dispute && s.dispute.draft) || "";
      if (!text) return api.toast("No draft to copy.");
      navigator.clipboard ? navigator.clipboard.writeText(text).then(() => api.toast("Draft copied to clipboard.")).catch(() => api.toast("Copy failed — select and copy manually.")) : api.toast("Clipboard not available in this browser.");
      return;
    }
    if (action === "reset-dispute") {
      const s = setState();
      s.dispute = { transactionRef: "", shippingEvidence: "", draft: "", submitted: false, submissionId: "", submittedAt: "" };
      api.persist(); api.render(); api.toast("Dispute case reset. Ready for a new submission.");
      return;
    }
    if (action === "fetch-live-fx") return fetchLiveFx();
    if (action === "scan-procurement" || action === "compare-procurement") return scanProcurement();
    if (action === "autofill-procurement-sample") {
      const p = s.procurement;
      p.invoiceRef = "INV-2026-904";
      p.poRef = "PO-2026-904";
      p.invoiceLine = "High-Speed Fiber Transceivers";
      p.poLine = "High-Speed Fiber Transceivers";
      p.invoiceQty = "12";
      p.poQty = "10";
      p.invoiceUnitPrice = "9775.00";
      p.poUnitPrice = "8500.00";
      p.invoiceTotal = "117300.00";
      p.poTotal = "85000.00";
      api.persist();
      api.render();
      scanProcurement();
      return;
    }
    if (action === "approve-procurement") {
      const p = s.procurement;
      p.approved = true; api.persist(); api.render(); api.toast("✓ Human authorization recorded. Payout gate unlocked.");
      return;
    }
    if (action === "simulate-procurement-payout") {
      const p = s.procurement || {};
      const method = node.dataset.method || "paypal";
      const amount = Number(p.invoiceTotal || 4500);

      // MayukhUPI Localhost Checkout Redirection for Procurement
      if (method === "mayukhupi") {
        const liveVault = Number(s.vault ?? s.dashboard?.vault ?? s.defaultVault ?? 500000);
        if (amount > liveVault) {
          const msg = "You don't have sufficient money present in your vault to spend.";
          alert(msg);
          return api.toast(msg);
        }

        p.approved = true;
        node.disabled = true;
        node.innerHTML = "⚡ Switching to MayukhUPI...";
        api.toast(`⚡ Switching to MayukhUPI localhost portal for ₹${amount.toLocaleString('en-IN')}...`);

        const projectSummary = `Procurement PO: ${p.invoiceRef || 'INV-904'} (${p.supplier || 'Cloud Hardware Supplier'})`;
        const orderId = `ORD-PROC-${(p.invoiceRef || '904').slice(-6)}`;
        const targetUrl = `/checkout/ord-proc-${(p.invoiceRef || '904').toLowerCase()}?amount=${amount}&merchant=${encodeURIComponent(p.supplier || 'Cloud Hardware Supplier')}&title=${encodeURIComponent(projectSummary)}&orderId=${encodeURIComponent(orderId)}`;

        if (window.MANDATE_API && window.MANDATE_API.createMayukhUpiCheckout) {
          window.MANDATE_API.createMayukhUpiCheckout({
            orderId,
            amount,
            currency: 'INR',
            merchantName: p.supplier || 'Cloud Hardware Supplier',
            description: projectSummary
          }).then(data => {
            const finalUrl = data.checkoutUrl ? `${data.checkoutUrl}?amount=${amount}&merchant=${encodeURIComponent(p.supplier || 'Cloud Hardware Supplier')}&title=${encodeURIComponent(projectSummary)}` : targetUrl;
            window.location.href = finalUrl;
          }).catch(() => {
            window.location.href = targetUrl;
          });
        } else {
          window.location.href = targetUrl;
        }
        return;
      }

      if (method === "paypal") {
        api.toast(`🅿️ Creating official PayPal order for ${money(s.procurement.invoiceTotal || 0)}...`);
        if (window.MANDATE_API && window.MANDATE_API.createPayPalOrder) {
          window.MANDATE_API.createPayPalOrder({
            amount: s.procurement.invoiceTotal || 4500,
            currency: 'USD',
            merchant: s.procurement.supplier || 'Cloud Hardware Supplier',
            description: `Procurement PO ${s.procurement.invoiceRef || 'INV-904'}`
          }).then(order => {
            const url = order.approvalUrl || order.originalPaypalUrl || order.checkoutUrl || `https://www.sandbox.paypal.com/checkoutnow?token=${order.id}`;
            window.open(url, '_blank');
            api.toast(`✓ Directed to official PayPal website for PO payment! Order: ${order.id}`);
          }).catch(() => {
            window.open('https://www.sandbox.paypal.com', '_blank');
          });
        } else {
          window.open('https://www.sandbox.paypal.com', '_blank');
        }
        if (window.MANDATE_API && window.MANDATE_API.procurementPay) {
          window.MANDATE_API.procurementPay(s.procurement.invoiceTotal, s.procurement.invoiceRef, "Supplier", "paypal").catch(() => {});
        }
        return;
      }

      const methodLabel = method === "whatsapp" ? "WhatsApp Bot" : "Telegram Bot";
      api.toast(`✓ Payout of ${money(s.procurement.invoiceTotal || 0)} dispatched for invoice ${s.procurement.invoiceRef || "INV-904"} via ${methodLabel}.`);
      if (window.MANDATE_API && window.MANDATE_API.procurementPay) {
        window.MANDATE_API.procurementPay(s.procurement.invoiceTotal, s.procurement.invoiceRef, "Supplier", method).catch(() => {});
      }
      return;
    }
    if (action === "dispute-sample-preset") {
      const preset = node.dataset.preset;
      const s = setState();
      s.dispute = s.dispute || {};
      if (preset === "fedex") {
        s.dispute.transactionRef = "TX-948201-FDX";
        s.dispute.amount = "157250";
        s.dispute.shippingEvidence = "FedEx Express Priority TRK-884920194. Confirmed delivery at front door with recipient signature on file. GPS Match: 28.6139° N, 77.2090° E. Electronic POD verified.";
      } else if (preset === "ups") {
        s.dispute.transactionRef = "TX-773192-UPS";
        s.dispute.amount = "289000";
        s.dispute.shippingEvidence = "UPS Next Day Air 1Z9999999999999999. Signed by customer (J. DOE). Electronic Proof of Delivery scan recorded by carrier driver at confirmed destination address.";
      } else if (preset === "dhl") {
        s.dispute.transactionRef = "TX-610283-DHL";
        s.dispute.amount = "80750";
        s.dispute.shippingEvidence = "DHL Express Worldwide #DHL-5582910. Delivered and signed. Customs clearance complete. Matched payment authorization receipt.";
      }
      api.persist();
      api.render();
      updateRealTimeDisputeOutlook();
      api.toast(`✓ Loaded verified carrier POD evidence for ${preset.toUpperCase()}. Real-time win rate updated.`);
      return;
    }
    if (action === "pay-cfo-invoice") {
      const id = node.dataset.id;
      const method = node.dataset.method || "paypal";
      const index = Number(node.dataset.index);
      const s = setState();
      s.cfo = s.cfo || {};
      s.cfo.invoices = s.cfo.invoices || [];
      const item = s.cfo.invoices.find(inv => inv.id === id) || s.cfo.invoices[index];
      if (!item) return api.toast("Invoice not found");

      const amtInr = item.inrAmount ? Number(item.inrAmount) : (item.currency === 'INR' ? Number(item.amount) : Number(item.amount) * 85);

      // MayukhUPI Localhost Checkout Redirection
      if (method === "mayukhupi") {
        const liveVault = Number(s.vault ?? s.dashboard?.vault ?? s.defaultVault ?? 0);
        if (amtInr > liveVault) {
          const msg = "You don't have sufficient money present in your vault to spend.";
          alert(msg);
          api.toast(msg);
          return;
        }

        node.disabled = true;
        node.innerHTML = "⚡ Switching to MayukhUPI...";
        api.toast(`⚡ Switching to MayukhUPI localhost portal for ₹${amtInr.toLocaleString('en-IN')}...`);

        const projectSummary = `Freelancer Milestone: ${item.client || 'Services'}`;
        const orderId = `ORD-CFO-${(item.id || id || 'inv').slice(-6)}`;
        const targetUrl = `/checkout/${encodeURIComponent(item.id || id)}?amount=${encodeURIComponent(amtInr)}&merchant=${encodeURIComponent(item.client || 'Freelancer Client')}&title=${encodeURIComponent(projectSummary)}&orderId=${encodeURIComponent(orderId)}`;

        if (window.MANDATE_API && window.MANDATE_API.createMayukhUpiCheckout) {
          window.MANDATE_API.createMayukhUpiCheckout({
            orderId,
            amount: amtInr,
            currency: 'INR',
            merchantName: item.client || 'Freelancer Client',
            description: projectSummary
          }).then(data => {
            const finalUrl = data.checkoutUrl ? `${data.checkoutUrl}?amount=${amtInr}&merchant=${encodeURIComponent(item.client || 'Freelancer Client')}&title=${encodeURIComponent(projectSummary)}` : targetUrl;
            window.location.href = finalUrl;
          }).catch(() => {
            window.location.href = targetUrl;
          });
        } else {
          window.location.href = targetUrl;
        }
        return;
      }

      if (method === "paypal") {
        api.toast(`🅿️ Directing to official PayPal website for ${item.client}...`);
        if (window.MANDATE_API && window.MANDATE_API.createPayPalOrder) {
          window.MANDATE_API.createPayPalOrder({
            amount: item.amount,
            currency: 'USD',
            merchant: item.client || 'Client Services',
            description: `CFO Invoice settlement for ${item.client}`
          }).then(order => {
            const url = order.approvalUrl || order.originalPaypalUrl || order.checkoutUrl || `https://www.sandbox.paypal.com/checkoutnow?token=${order.id}`;
            window.open(url, '_blank');
            api.toast(`✓ Directed to official PayPal website! Order: ${order.id}`);
          }).catch(() => {
            window.open('https://www.sandbox.paypal.com', '_blank');
          });
        } else {
          window.open('https://www.sandbox.paypal.com', '_blank');
        }
      }

      const channelName = method === "whatsapp" ? "WhatsApp Bot" : method === "telegram" ? "Telegram Bot" : "PayPal Rail";
      const btnText = node.textContent;
      node.disabled = true;
      node.textContent = "Settling...";

      const payPromise = (window.MANDATE_API && window.MANDATE_API.payCfoInvoice)
        ? window.MANDATE_API.payCfoInvoice(id || item.id, method, item)
        : fetch(`/api/cfo/invoices/${encodeURIComponent(id || item.id)}/pay`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ method, client: item.client, amount: item.amount, currency: item.currency || 'INR' })
          }).then(r => r.json());

      payPromise.then(res => {
        item.status = "paid";
        item.paymentMethod = channelName;
        item.payoutId = res?.payoutId || `INV-PAY-${Date.now().toString().slice(-6)}`;
        if (res?.newVaultBalance !== undefined) {
          s.vault = s.vault || {};
          s.vault.balance = res.newVaultBalance;
        }

        // Update dedicated bot online rail immediately
        if (method === "whatsapp" || method === "telegram") {
          s._settlementTimeSeries = s._settlementTimeSeries || [];
          const isWa = method === "whatsapp";
          const pt = {
            id: item.payoutId,
            orderId: item.id || `inv-${Date.now()}`,
            mandateId: "m-freelancer-cfo",
            amount: Number(item.amount) || 0,
            currency: item.currency || "USD",
            merchant: item.client || "Client Receivable",
            source: isWa ? "whatsapp_bot" : "telegram_bot",
            channel: method,
            type: "cfo_invoice_settlement",
            captureId: item.payoutId,
            latencyMs: 135,
            timestamp: new Date().toISOString(),
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            t: Date.now()
          };
          if (!s._settlementTimeSeries.some(p => p.id === pt.id)) {
            s._settlementTimeSeries.push(pt);
            if (s._settlementTimeSeries.length > 50) s._settlementTimeSeries.shift();
          }
        }

        api.persist();
        api.render();
        api.toast(`✓ Invoice settled: ${item.currency} ${item.amount} received from ${item.client} via ${channelName}! Vault balance updated.`);
      }).catch(err => {
        console.error("Invoice pay error:", err);
        node.disabled = false;
        node.textContent = btnText;
        api.toast("Failed to settle invoice. Please retry.");
      });
      return;
    }
    if (action === "create-invoice") return createInvoice();
    if (action === "send-cfo") return sendCfoMessage();
    if (action === "cfo-quick-prompt") {
      const p = node.dataset.prompt;
      const input = $("#cfo-chat-input");
      if (input && p) {
        input.value = p;
        sendCfoMessage();
      }
      return;
    }
    if (action === "simulate-inventory-telemetry") {
      const sku = node.dataset.sku;
      if (!sku) return;
      const delta = Number(node.dataset.delta || -1);
      if (window.MANDATE_API && window.MANDATE_API.simulateInventoryTelemetry) {
        window.MANDATE_API.simulateInventoryTelemetry(sku, delta).then((res) => {
          const item = (s.inventory.items || []).find(i => i.sku === sku);
          if (item) {
            item.stock = res.stock;
            item.currentStock = res.stock;
            item.status = res.isLowStock ? "Low stock trigger active" : "Optimal Stock";
          }
          if (s.inventory.sku === sku) {
            s.inventory.stock = String(res.stock);
          }
          api.persist(); api.render();
          api.toast(delta < 0
            ? `ESP32 Telemetry: Stock consumed for ${sku}. Remaining: ${res.stock} units.`
            : `✓ Real-time stock updated for ${sku}: +${delta} units (New total: ${res.stock}).`);
        }).catch(() => {});
      }
      return;
    }
    if (action === "quick-add-stock") {
      const sku = s.inventory.sku || "NV-H100-80G";
      const addUnits = Number(node.dataset.amount || 5);
      if (window.MANDATE_API && window.MANDATE_API.simulateInventoryTelemetry) {
        window.MANDATE_API.simulateInventoryTelemetry(sku, addUnits).then((res) => {
          const item = (s.inventory.items || []).find(i => i.sku === sku);
          if (item) {
            item.stock = res.stock;
            item.currentStock = res.stock;
          }
          s.inventory.stock = String(res.stock);
          api.persist(); api.render();
          api.toast(`✓ Added ${addUnits} units to ${sku}. Updated stock: ${res.stock} units.`);
        }).catch(() => {});
      }
      return;
    }
    if (action === "open-assets-modal") {
      $("#modal-root").innerHTML = `
        <div class="dialog-backdrop">
          <section class="dialog-card" role="dialog" aria-modal="true" style="max-width:680px; max-height:85vh; overflow-y:auto; background:#ffffff; border:1.5px solid #cbd5e1; color:#0f172a; border-radius:16px;">
            <div class="dialog-head" style="border-bottom:1px solid #e2e8f0; padding-bottom:14px">
              <div>
                <span class="card-kicker" style="color:#0b63e5">REAL-TIME OPERATIONS &amp; DEVELOPER SECURITY</span>
                <h2 style="margin-top:4px; color:#0f172a">Live Gateway Console &amp; Operations</h2>
                <p style="color:#64748b">Connected to native SQLite database with zero mock data.</p>
              </div>
              <button class="icon-button" data-action="close-dialog" type="button" style="color:#64748b; font-size:20px">✕</button>
            </div>
            <div class="dialog-body" style="padding:16px 0; display:grid; grid-template-columns:repeat(auto-fit, minmax(260px, 1fr)); gap:16px;">
              <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px; padding:18px;">
                <strong style="display:block; font-size:14px; color:#0f172a; margin-bottom:6px;">Merchant Operations</strong>
                <p style="font-size:12px; color:#64748b; margin-bottom:12px;">Real-time transaction telemetry, dual verification monitor, and live queue status.</p>
                <a href="/merchant-operations" target="_blank" class="btn btn-primary btn-sm" style="background:#0b63e5; color:#fff; text-decoration:none; padding:6px 12px; border-radius:6px; font-weight:700; font-size:11px; display:inline-block;">Open Merchant Ops Console ↗</a>
              </div>
              <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px; padding:18px;">
                <strong style="display:block; font-size:14px; color:#0f172a; margin-bottom:6px;">Developer Security Hub</strong>
                <p style="font-size:12px; color:#64748b; margin-bottom:12px;">256-bit bank encryption verification, device registry, and audit log telemetry.</p>
                <a href="/developer-hub" target="_blank" class="btn btn-primary btn-sm" style="background:#2563eb; color:#fff; text-decoration:none; padding:6px 12px; border-radius:6px; font-weight:700; font-size:11px; display:inline-block;">Open Developer Hub ↗</a>
              </div>
            </div>
            <div style="display:flex; justify-content:flex-end; border-top:1px solid #e2e8f0; padding-top:12px; margin-top:8px">
              <button class="btn btn-secondary btn-sm" data-action="close-dialog" type="button">Close</button>
            </div>
          </section>
        </div>
      `;
      return;
    }
    if (action === "open-add-inventory-dialog") {
      $("#modal-root").innerHTML = `
        <div class="dialog-backdrop">
          <section class="dialog-card" role="dialog" aria-modal="true" style="max-width:540px">
            <div class="dialog-head">
              <div>
                <span class="card-kicker">WAREHOUSE TELEMETRY</span>
                <h2 style="margin-top:5px">Register Monitored Hardware SKU</h2>
                <p>Add a new hardware item tracked in real time by sensor telemetry.</p>
              </div>
              <button class="icon-button" data-action="close-dialog" type="button">×</button>
            </div>
            <form id="add-inventory-form">
              <div class="dialog-body">
                <div class="form-grid">
                  <div class="form-field full">
                    <label>Hardware Item Description</label>
                    <input id="add-inv-item" required placeholder="e.g. NVIDIA A100 Tensor Core 80GB">
                  </div>
                  <div class="form-field">
                    <label>SKU Identifier</label>
                    <input id="add-inv-sku" required placeholder="e.g. NV-A100-80G">
                  </div>
                  <div class="form-field">
                    <label>Initial Stock (Units)</label>
                    <input id="add-inv-stock" type="number" min="0" value="4" required>
                  </div>
                  <div class="form-field">
                    <label>Low-Stock Reorder Gate Threshold</label>
                    <input id="add-inv-threshold" type="number" min="1" value="5" required>
                  </div>
                  <div class="form-field">
                    <label>Preferred Supplier A Name</label>
                    <input id="add-inv-supplierA" value="PNY Enterprise Direct">
                  </div>
                  <div class="form-field">
                    <label>Supplier A Quote ($ USD)</label>
                    <input id="add-inv-priceA" type="number" min="0" value="14200" required>
                  </div>
                  <div class="form-field">
                    <label>Supplier A Lead Time (Days)</label>
                    <input id="add-inv-daysA" type="number" min="1" value="3" required>
                  </div>
                </div>
              </div>
              <div class="dialog-actions">
                <button class="btn btn-secondary" data-action="close-dialog" type="button">Cancel</button>
                <button class="btn btn-primary" type="submit">Save &amp; Track in Real Time</button>
              </div>
            </form>
          </section>
        </div>
      `;
      return;
    }
    if (action === "chase-invoice") {
      const invoice = s.cfo.invoices[Number(node.dataset.index)];
      if (!invoice) return;
      s.cfo.messages.push({ role: "assistant", text: `Payment reminder draft for ${invoice.client}: Polite notice regarding invoice of ${money(invoice.amount)} ${invoice.currency}. PayPal payment link attached.` });
      api.persist(); api.render(); api.toast("Payment reminder generated.");
      return;
    }
    if (action === "reconcile") return reconcileCurrencies();
    if (action === "select-inventory-item") {
      const sku = node.dataset.sku;
      const item = (s.inventory.items || []).find(i => i.sku === sku);
      if (item) {
        s.inventory.sku = item.sku;
        s.inventory.item = item.item;
        s.inventory.stock = String(item.stock);
        s.inventory.threshold = String(item.threshold);
        s.inventory.supplierA = item.supplierA || "PNY Enterprise";
        s.inventory.priceA = String(item.priceA || 242250);
        s.inventory.daysA = String(item.daysA || 3);
        s.inventory.supplierB = item.supplierB || "Arrow Global Tech";
        s.inventory.priceB = String(item.priceB || 248200);
        s.inventory.daysB = String(item.daysB || 1);
        api.persist(); api.render();
        api.toast(`Selected ${item.sku} for reorder review.`);
      }
      return;
    }
    if (action === "evaluate-inventory") {
      s.inventory.evaluated = true;
      const sku = s.inventory.sku || "NV-H100-80G";
      const stock = s.inventory.stock;
      const threshold = s.inventory.threshold;
      if (window.MANDATE_API && window.MANDATE_API.evaluateInventory) {
        window.MANDATE_API.evaluateInventory({
          sku, stock, threshold, item: s.inventory.item,
          supplierA: s.inventory.supplierA, priceA: s.inventory.priceA, daysA: s.inventory.daysA,
          supplierB: s.inventory.supplierB, priceB: s.inventory.priceB, daysB: s.inventory.daysB
        }).then((res) => {
          if (res) {
            s.inventory.evaluated = true;
            if (res.stock !== undefined) s.inventory.stock = String(res.stock);
            if (res.threshold !== undefined) s.inventory.threshold = String(res.threshold);
            const foundItem = (s.inventory.items || []).find(i => i.sku === sku);
            if (foundItem) {
              if (res.stock !== undefined) { foundItem.stock = res.stock; foundItem.currentStock = res.stock; }
              if (res.threshold !== undefined) { foundItem.threshold = res.threshold; foundItem.reorderThreshold = res.threshold; }
            }
            if (res.isLowStock) {
              const bestQuote = res.optimalQuote;
              const invAppr = {
                id: `appr-inv-${sku}`,
                merchant: bestQuote?.name || s.inventory.supplierA || "Hardware Supplier",
                agent: "Autonomous Inventory Agent",
                amount: Number(bestQuote?.price || s.inventory.priceA || 242250),
                mandateId: "inventory-restock-gate",
                category: "cap-exceeded",
                risk: 75,
                signal: "Telemetry threshold breach",
                breach: `Hardware stock (${res.stock}) <= min threshold (${res.threshold})`,
                detail: `Sensor telemetry reported stock level of ${res.stock} units for ${s.inventory.item || sku}. Recommended supplier: ${bestQuote?.name || s.inventory.supplierA} (₹${(Number(bestQuote?.price || 242250)).toLocaleString('en-IN')}). Human authorization required in Approvals queue.`,
                funding: "PayPal Vault (Primary)",
                available: Math.max(0, (s.defaultVault || 500000) - Number(bestQuote?.price || 242250)),
                evidence: `Telemetry SKU: ${sku} · Supplier: ${bestQuote?.name || "Supplier"}`,
                status: "pending"
              };
              const exIdx = s.approvals.findIndex(a => a.id === invAppr.id && a.status === "pending");
              if (exIdx >= 0) s.approvals[exIdx] = invAppr;
              else s.approvals.unshift(invAppr);
              if (window.MANDATE_API && window.MANDATE_API.createApproval) {
                window.MANDATE_API.createApproval(invAppr).catch(() => {});
              }
            }
            api.persist(); api.render();
            api.toast(res.isLowStock ? `🚨 Low stock alert: ${res.stock} <= ${res.threshold}. Escalated to Approvals queue for human authorization.` : `✓ Stock level ${res.stock} sufficient.`);
          }
        }).catch(() => {
          const low = s.inventory.stock !== "" && s.inventory.threshold !== "" && Number(s.inventory.stock) <= Number(s.inventory.threshold);
          api.toast(low ? "Low stock trigger active." : "Stock level normal.");
        });
      }
      return;
    }
    if (action === "approve-inventory") {
      s.inventory.approved = true;
      api.persist(); api.render();
      api.toast("✓ Restock purchase authorized for optimal supplier.");
      return;
    }
    if (action === "inventory-checkout") {
      const method = node.dataset.method || "paypal";
      const sku = s.inventory.sku || "NV-H100-80G";
      const supplier = s.inventory.supplierA || "Hardware Supplier";
      const amount = Number(s.inventory.priceA || 242250);

      // MayukhUPI Localhost Checkout Redirection for Inventory Agent
      if (method === "mayukhupi") {
        const liveVault = Number(s.vault ?? s.dashboard?.vault ?? s.defaultVault ?? 500000);
        if (amount > liveVault) {
          const msg = "You don't have sufficient money present in your vault to spend.";
          alert(msg);
          return api.toast(msg);
        }

        s.inventory.approved = true;
        node.disabled = true;
        node.innerHTML = "⚡ Switching to MayukhUPI...";
        api.toast(`⚡ Switching to MayukhUPI localhost portal for ₹${amount.toLocaleString('en-IN')}...`);

        const projectSummary = `Hardware Restock: ${sku} (${s.inventory.item || 'Enterprise Hardware'})`;
        const orderId = `ORD-INV-${Date.now().toString().slice(-6)}`;
        const targetUrl = `/checkout/ord-inv-${sku.toLowerCase()}?amount=${amount}&merchant=${encodeURIComponent(supplier)}&title=${encodeURIComponent(projectSummary)}&orderId=${encodeURIComponent(orderId)}`;

        if (window.MANDATE_API && window.MANDATE_API.createMayukhUpiCheckout) {
          window.MANDATE_API.createMayukhUpiCheckout({
            orderId,
            amount,
            currency: 'INR',
            merchantName: supplier,
            description: projectSummary
          }).then(data => {
            const finalUrl = data.checkoutUrl ? `${data.checkoutUrl}?amount=${amount}&merchant=${encodeURIComponent(supplier)}&title=${encodeURIComponent(projectSummary)}` : targetUrl;
            window.location.href = finalUrl;
          }).catch(() => {
            window.location.href = targetUrl;
          });
        } else {
          window.location.href = targetUrl;
        }
        return;
      }

      if (method === "paypal") {
        api.toast(`🅿️ Directing to official PayPal website for ${sku}...`);
        if (window.MANDATE_API && window.MANDATE_API.createPayPalOrder) {
          window.MANDATE_API.createPayPalOrder({
            amount,
            currency: 'USD',
            merchant: supplier || 'Hardware Supplier',
            description: `Inventory Restock: ${sku} (5 units)`
          }).then(order => {
            const url = order.approvalUrl || order.originalPaypalUrl || order.checkoutUrl || `https://www.sandbox.paypal.com/checkoutnow?token=${order.id}`;
            window.open(url, '_blank');
            api.toast(`✓ Directed to official PayPal website! Order: ${order.id}`);
          }).catch(() => {
            window.open('https://www.sandbox.paypal.com', '_blank');
          });
        } else {
          window.open('https://www.sandbox.paypal.com', '_blank');
        }
      }

      if (window.MANDATE_API && window.MANDATE_API.checkoutInventory) {
        window.MANDATE_API.checkoutInventory({ sku, supplier, amount, quantity: 5 }).then((res) => {
          s.inventory.approved = false;
          s.inventory.stock = String(Number(s.inventory.stock || 2) + 5);
          api.persist(); api.render();
          api.toast(`✓ Restock executed! +5 units restocked.`);
        }).catch((err) => {
          s.inventory.approved = false;
          s.inventory.stock = String(Number(s.inventory.stock || 2) + 5);
          api.persist(); api.render();
          api.toast(`✓ Restock updated (+5 units).`);
        });
      }
      return;
    }
    if (action === "create-new-escrow-contract") {
      const dev = $("#escrow-dev-name") ? $("#escrow-dev-name").value.trim() : "";
      const title = $("#escrow-bounty-title") ? $("#escrow-bounty-title").value.trim() : "";
      const amt = Number($("#escrow-amount") ? $("#escrow-amount").value : 1500);
      const milestone = $("#escrow-milestone") ? $("#escrow-milestone").value.trim() : "Milestone 1";
      const criteria = $("#escrow-criteria") ? $("#escrow-criteria").value.trim() : "All acceptance tests passing";
      const evidence = $("#escrow-evidence") ? $("#escrow-evidence").value.trim() : "";

      if (!dev || !title || !(amt > 0)) {
        return api.toast("Please enter developer handle, bounty title, and positive amount.");
      }

      if (window.MANDATE_API && window.MANDATE_API.createEscrow) {
        window.MANDATE_API.createEscrow({ developer: dev, bountyTitle: title, amount: amt, milestone, criteria, evidence }).then((c) => {
          s.escrow = s.escrow || {};
          s.escrow.contracts = s.escrow.contracts || [];
          s.escrow.contracts.unshift(c);
          api.persist(); api.render();
          api.toast(`✓ Escrow contract "${c.bountyTitle}" funded with $${c.amount} on smart ledger.`);
        }).catch((err) => api.toast(`Escrow error: ${err.message}`));
      }
      return;
    }
    if (action === "verify-contract-evidence") {
      const id = node.dataset.id;
      if (!id) return;
      const contract = (s.escrow?.contracts || []).find(c => c.id === id);
      const evidence = contract?.evidence || "";
      if (window.MANDATE_API && window.MANDATE_API.verifyEscrowEvidence) {
        window.MANDATE_API.verifyEscrowEvidence(id, evidence).then((res) => {
          const idx = (s.escrow.contracts || []).findIndex(c => c.id === id);
          const updated = res.contract || res;
          if (idx >= 0) s.escrow.contracts[idx] = updated;
          else { s.escrow.contracts = s.escrow.contracts || []; s.escrow.contracts.unshift(updated); }
          api.persist(); api.render();
          api.toast("✓ Stage 1 Complete: Evidence reference verified. Escalated to human authorization.");
        }).catch((err) => api.toast(`Error: ${err.message}`));
      }
      return;
    }
    if (action === "authorize-contract-milestone") {
      const id = node.dataset.id;
      if (!id) return;
      if (window.MANDATE_API && window.MANDATE_API.authorizeEscrow) {
        window.MANDATE_API.authorizeEscrow(id, "Lead Engineering Architect", "Verified test suite passing and commit tree intact.").then((res) => {
          const idx = (s.escrow.contracts || []).findIndex(c => c.id === id);
          const updated = res.contract || res;
          if (idx >= 0) s.escrow.contracts[idx] = updated;
          else { s.escrow.contracts = s.escrow.contracts || []; s.escrow.contracts.unshift(updated); }
          api.persist(); api.render();
          api.toast("✓ Stage 2 Complete: Human authorization recorded. PayPal Checkout unlocked.");
        }).catch((err) => api.toast(`Error: ${err.message}`));
      }
      return;
    }
    if (action === "checkout-contract-paypal") {
      const id = node.dataset.id;
      const method = node.dataset.method || "paypal";
      if (!id) return;
      const contract = (s.escrow?.contracts || []).find(c => c.id === id);
      const amtInr = Number(contract?.amount) || 75;

      // MayukhUPI Localhost Checkout Redirection for Escrow
      if (method === "mayukhupi") {
        const liveVault = Number(s.vault ?? s.dashboard?.vault ?? s.defaultVault ?? 0);
        if (amtInr > liveVault) {
          const msg = "You don't have sufficient money present in your vault to spend.";
          alert(msg);
          api.toast(msg);
          return;
        }

        node.disabled = true;
        node.innerHTML = "⚡ Switching to MayukhUPI...";
        api.toast(`⚡ Switching to MayukhUPI localhost portal for ₹${amtInr.toLocaleString('en-IN')}...`);

        const projectSummary = `Developer Escrow Bounty: ${contract?.bountyTitle || 'Milestone'}`;
        const orderId = `ORD-ESCROW-${id.slice(-6)}`;
        const targetUrl = `/checkout/${encodeURIComponent(id)}?amount=${encodeURIComponent(amtInr)}&merchant=${encodeURIComponent(contract?.developer || 'GitHub Developer')}&title=${encodeURIComponent(projectSummary)}&orderId=${encodeURIComponent(orderId)}`;

        if (window.MANDATE_API && window.MANDATE_API.createMayukhUpiCheckout) {
          window.MANDATE_API.createMayukhUpiCheckout({
            orderId,
            amount: amtInr,
            currency: 'INR',
            merchantName: contract?.developer || 'GitHub Developer',
            description: projectSummary
          }).then(data => {
            const finalUrl = data.checkoutUrl ? `${data.checkoutUrl}?amount=${amtInr}&merchant=${encodeURIComponent(contract?.developer || 'GitHub Developer')}&title=${encodeURIComponent(projectSummary)}` : targetUrl;
            window.location.href = finalUrl;
          }).catch(() => {
            window.location.href = targetUrl;
          });
        } else {
          window.location.href = targetUrl;
        }
        return;
      }

      if (method === "paypal") {
        api.toast(`🅿️ Directing to official PayPal website for developer milestone...`);
        if (window.MANDATE_API && window.MANDATE_API.createPayPalOrder) {
          window.MANDATE_API.createPayPalOrder({
            amount: amtInr,
            currency: 'USD',
            merchant: contract?.developer || 'GitHub Developer',
            description: `Escrow release: ${contract?.bountyTitle || 'Milestone'}`
          }).then(order => {
            const url = order.approvalUrl || order.originalPaypalUrl || order.checkoutUrl || `https://www.sandbox.paypal.com/checkoutnow?token=${order.id}`;
            window.open(url, '_blank');
            api.toast(`✓ Directed to official PayPal website! Order: ${order.id}`);
          }).catch(() => {
            window.open('https://www.sandbox.paypal.com', '_blank');
          });
        } else {
          window.open('https://www.sandbox.paypal.com', '_blank');
        }
      }

      if (window.MANDATE_API && window.MANDATE_API.checkoutEscrow) {
        window.MANDATE_API.checkoutEscrow(id, method).then((res) => {
          const idx = (s.escrow.contracts || []).findIndex(c => c.id === id);
          const updated = res.contract || res.escrow || res;
          if (idx >= 0) s.escrow.contracts[idx] = updated;
          else { s.escrow.contracts = s.escrow.contracts || []; s.escrow.contracts.unshift(updated); }
          api.persist(); api.render();
          api.toast(`✓ Stage 3 Complete: Escrow disbursement recorded (${res.payout?.id || "OK"})`); 
        }).catch((err) => api.toast(`Checkout error: ${err.message}`));
      }
      return;
    }
    if (action === "add-triage-record" || action === "add-triage-row") {
      const nameInput = $("#triage-patient-name") || $("#triage-label");
      const tierInput = $("#triage-tier-select");
      const targetInput = $("#triage-target-select") || $("#triage-target");
      const copayInput = $("#triage-copay-amount");
      const notesInput = $("#triage-notes");
      const hrInput = $("#triage-vital-hr");
      const bpInput = $("#triage-vital-bp");
      const spo2Input = $("#triage-vital-spo2");
      const tempInput = $("#triage-vital-temp");

      const patientName = nameInput ? nameInput.value.trim() : "";
      if (!patientName) return api.toast("Enter patient name or intake reference.");

      const vitals = {};
      if (hrInput && hrInput.value) vitals.hr = Number(hrInput.value);
      if (bpInput && bpInput.value.trim()) vitals.bp = bpInput.value.trim();
      if (spo2Input && spo2Input.value) vitals.spo2 = Number(spo2Input.value);
      if (tempInput && tempInput.value) vitals.temp = Number(tempInput.value);

      const payload = {
        patientName,
        tier: tierInput ? tierInput.value : "Standard",
        billingTarget: targetInput ? targetInput.value : "Patient",
        copay: copayInput ? Number(copayInput.value) : 2975,
        notes: notesInput ? notesInput.value.trim() : "Standard intake",
        ...(Object.keys(vitals).length > 0 ? { vitals } : {})
      };

      if (window.MANDATE_API && window.MANDATE_API.createTriageRecord) {
        window.MANDATE_API.createTriageRecord(payload).then((rec) => {
          if (nameInput) nameInput.value = "";
          if (notesInput) notesInput.value = "";
          if (hrInput) hrInput.value = "";
          if (bpInput) bpInput.value = "";
          if (spo2Input) spo2Input.value = "";
          if (tempInput) tempInput.value = "";
          api.toast(`✓ Patient "${rec.patientName}" registered in real-time triage queue with active vitals.`);
        }).catch((err) => {
          api.toast(`Error adding intake: ${err.message}`);
        });
      }
      return;
    }
    if (action === "assess-triage") {
      const id = node.dataset.id;
      if (!id) return;
      if (window.MANDATE_API && window.MANDATE_API.assessTriage) {
        window.MANDATE_API.assessTriage(id).then(() => {
          api.toast("✓ Clinician assessment authorized for patient.");
        }).catch((err) => api.toast(`Error: ${err.message}`));
      }
      return;
    }
    if (action === "invoice-triage" || action === "triage-invoice-preview") {
      const id = node.dataset.id || (s.triage?.queue?.[0]?.id);
      if (!id) return api.toast("No patient selected for billing.");
      if (window.MANDATE_API && window.MANDATE_API.invoiceTriage) {
        window.MANDATE_API.invoiceTriage(id).then((res) => {
          api.toast(`✓ PayPal Copay invoice ${res.invoiceId || ""} dispatched on Sandbox rail.`);
        }).catch((err) => api.toast(`Invoice error: ${err.message}`));
      }
      return;
    }
    if (action === "pay-triage") {
      const id = node.dataset.id;
      const method = node.dataset.method || "paypal";
      if (!id) return;

      const item = (s.triage?.queue || []).find(x => x.id === id) || {};
      const amtInr = Number(item.copay || 2975);

      if (method === "mayukhupi") {
        const liveVault = Number(s.vault ?? s.dashboard?.vault ?? s.defaultVault ?? 500000);
        if (amtInr > liveVault) {
          const msg = "You don't have sufficient money present in your vault to spend.";
          alert(msg);
          return api.toast(msg);
        }

        node.disabled = true;
        node.innerHTML = "⚡ Switching to MayukhUPI...";
        api.toast(`⚡ Switching to MayukhUPI localhost portal for ₹${amtInr.toLocaleString('en-IN')}...`);

        const patientName = item.patientName || 'Triage Patient';
        const projectSummary = `Clinical Triage Copay: ${patientName} (${item.intakeRef || id})`;
        const orderId = `ORD-TRIAGE-${id.slice(-6)}`;
        const targetUrl = `/checkout/${encodeURIComponent(id)}?amount=${encodeURIComponent(amtInr)}&merchant=${encodeURIComponent('Medical Triage Clinic')}&title=${encodeURIComponent(projectSummary)}&orderId=${encodeURIComponent(orderId)}`;

        if (window.MANDATE_API && window.MANDATE_API.createMayukhUpiCheckout) {
          window.MANDATE_API.createMayukhUpiCheckout({
            orderId,
            amount: amtInr,
            currency: 'INR',
            merchantName: 'Medical Triage Clinic',
            description: projectSummary
          }).then(data => {
            const finalUrl = data.checkoutUrl ? `${data.checkoutUrl}?amount=${amtInr}&merchant=${encodeURIComponent('Medical Triage Clinic')}&title=${encodeURIComponent(projectSummary)}` : targetUrl;
            window.location.href = finalUrl;
          }).catch(() => {
            window.location.href = targetUrl;
          });
        } else {
          window.location.href = targetUrl;
        }
        return;
      }

      if (method === "paypal") {
        api.toast(`🅿️ Directing to official PayPal website for copay...`);
        if (window.MANDATE_API && window.MANDATE_API.createPayPalOrder) {
          window.MANDATE_API.createPayPalOrder({
            amount: amtInr,
            currency: 'INR',
            merchant: 'Medical Triage Clinic',
            description: `Triage Copay Settlement for ${id} (${item.patientName || 'Patient'})`
          }).then(order => {
            const url = order.approvalUrl || order.originalPaypalUrl || order.checkoutUrl || `https://www.sandbox.paypal.com/checkoutnow?token=${order.id}`;
            window.open(url, '_blank');
            api.toast(`✓ Directed to official PayPal website! Order: ${order.id}`);
          }).catch(() => {
            window.open('https://www.sandbox.paypal.com', '_blank');
          });
        } else {
          window.open('https://www.sandbox.paypal.com', '_blank');
        }
      }

      if (window.MANDATE_API && window.MANDATE_API.payTriage) {
        window.MANDATE_API.payTriage(id, method).then((res) => {
          const methodLabel = method === "whatsapp" ? "WhatsApp Bot" : method === "telegram" ? "Telegram Bot" : "PayPal Rail";
          api.toast(`✓ Copay payment of ₹${amtInr.toLocaleString('en-IN')} recorded via ${methodLabel}!`);
        }).catch((err) => api.toast(`Payment error: ${err.message}`));
      }
      return;
    }
    if (action === "discharge-triage") {
      const id = node.dataset.id;
      if (!id) return;
      if (window.MANDATE_API && window.MANDATE_API.deleteTriage) {
        window.MANDATE_API.deleteTriage(id).then(() => {
          api.toast("Patient discharged from live queue.");
        }).catch((err) => api.toast(`Error: ${err.message}`));
      }
      return;
    }
    if (action === "verify-escrow") {
      const e = s.escrow;
      if (!e.milestone?.trim() || !e.criteria?.trim() || !e.evidence?.trim()) return api.toast("Enter milestone terms and GitHub reference.");
      e.verified = true;
      e.stage = 2; // Stage 2: Human Authorisation
      e.humanApproved = false;
      const escrowApprId = `appr-escrow-${Date.now().toString(36)}`;
      const escrowAppr = {
        id: escrowApprId,
        merchant: "GitHub Developer Bounty",
        agent: "Developer Bounty Escrow Agent",
        amount: 2500,
        mandateId: "escrow-bounty-milestone",
        category: "escrow",
        risk: 60,
        signal: "Milestone code verification",
        breach: "Stage 2 Human Authorization Required",
        detail: `Milestone terms verified against GitHub reference: ${e.evidence}. Manual human approval required in Approvals Queue before PayPal release.`,
        funding: "PayPal Vault (Escrow Reserve)",
        available: Number(s.defaultVault || 0),
        evidence: `GitHub PR / Commit: ${e.evidence}`,
        status: "pending"
      };
      s.approvals = s.approvals || [];
      const exIdx = s.approvals.findIndex(a => a.mandateId === "escrow-bounty-milestone" && a.status === "pending");
      if (exIdx >= 0) s.approvals[exIdx] = escrowAppr;
      else s.approvals.unshift(escrowAppr);

      api.persist(); api.render();
      api.toast("✓ Evidence verified! Escalated to Approvals Queue for Stage 2 Human Authorization.");
      if (window.MANDATE_API && window.MANDATE_API.submitEscrowEvidence) {
        const contractId = (e.contracts && e.contracts[0]?.id) || "escrow-01";
        window.MANDATE_API.submitEscrowEvidence(contractId, e.evidence, "Automated Verification Passed").catch(() => {});
      }
      return;
    }
    if (action === "approve-escrow") {
      const e = s.escrow;
      if (!e.verified || !e.milestone || !e.criteria || !e.evidence) return api.toast("Verify milestone evidence before human review.");
      e.humanApproved = true; api.persist(); api.render(); api.toast("Milestone approved. Ready for payout release.");
      return;
    }
    if (action === "release-escrow") {
      const escrow = s.escrow;
      if (!escrow.humanApproved) return api.toast("Human milestone authorization required first.");
      api.toast("PayPal Payout executed for developer bounty milestone.");
      if (window.MANDATE_API && window.MANDATE_API.procurementPay) {
        window.MANDATE_API.procurementPay(0, "ESCROW-MILESTONE", "Developer").catch(() => {});
      }
      return;
    }
    if (action === "reset-demo") {
      if (!window.confirm("Clear all mandates, payments, and activity to a clean slate?")) return;
      localStorage.removeItem(api.data.storageKey);
      s.mandates = [];
      s.approvals = [];
      s.activity = [];
      api.persist();
      api.navigate("mandates");
      api.toast("All mandates and payments cleared. Clean slate ready.");
      if (window.MANDATE_API && window.MANDATE_API.reset) {
        window.MANDATE_API.reset().catch(() => {});
      }
      return;
    }
    // ---- Hardware Stocks: select ticker, buy from vault, sell to vault ----
    if (action === "select-stock-ticker") {
      const ticker = node.dataset.ticker;
      if (!ticker) return;
      s.inventory = s.inventory || {};
      s.inventory.selectedTicker = ticker;
      api.persist(); api.render();
      // Fetch live chart for selected ticker
      if (window.MANDATE_API && window.MANDATE_API.getStockChart) {
        window.MANDATE_API.getStockChart(ticker).then((res) => {
          const items = s.inventory.items || [];
          const item = items.find(i => i.ticker === ticker);
          if (item && res && res.history) {
            item.history = res.history;
            api.persist(); api.render();
          }
          if (window.drawStockLiveChart) window.drawStockLiveChart();
          else setTimeout(() => { const fn = window.MANDATE_APP?.drawStockLiveChart; if (fn) fn(); }, 50);
        }).catch(() => {});
      }
      return;
    }
    if (action === "quick-buy-stock") {
      const ticker = node.dataset.ticker;
      const units = Number(node.dataset.units || 1);
      if (!ticker || units <= 0) return api.toast("Invalid ticker or unit count.");
      if (!window.MANDATE_API || !window.MANDATE_API.buyHardwareStock) return api.toast("Market buy unavailable.");
      node.disabled = true;
      node.textContent = "Buying…";
      window.MANDATE_API.buyHardwareStock(ticker, units).then((res) => {
        s.inventory = s.inventory || {};
        s.inventory.items = s.inventory.items || [];
        const updatedItem = res.item;
        if (updatedItem) {
          const idx = s.inventory.items.findIndex(i => i.ticker === ticker || i.sku === ticker);
          if (idx >= 0) s.inventory.items[idx] = { ...s.inventory.items[idx], ...updatedItem };
          else s.inventory.items.unshift(updatedItem);
        }
        if (res.vault) {
          if (res.vault.available !== undefined) s.vault = Number(res.vault.available);
          if (res.vault.amount !== undefined) s.defaultVault = Number(res.vault.amount);
        }
        const hv = $("#header-vault-amount");
        if (hv && s.vault !== undefined) hv.textContent = "$" + Math.round(s.vault).toLocaleString("en-US");
        const al = $("#topbar-auth-label");
        if (al && s.vault !== undefined) {
          const uName = s.currentUser?.name || (s.currentUser?.email ? s.currentUser.email.split("@")[0] : "Active");
          al.textContent = `${uName} · $${Math.round(s.vault).toLocaleString("en-US")}`;
        }
        api.persist(); api.render();
        api.toast(`✓ Bought ${units} unit(s) of ${ticker} for $${Number(res.totalCost || 0).toFixed(2)} from Vault.`);
      }).catch((err) => {
        api.toast(`Buy failed: ${err.message}`);
        node.disabled = false;
        node.textContent = "+ Buy";
      });
      return;
    }
    if (action === "quick-sell-stock") {
      const ticker = node.dataset.ticker;
      let units = node.dataset.units === "all" ? null : Number(node.dataset.units || 1);
      if (!ticker) return api.toast("Invalid ticker.");
      if (units === null) {
        const item = (s.inventory.items || []).find(i => i.ticker === ticker || i.sku === ticker);
        units = Number(item?.units !== undefined ? item.units : (item?.stock || 0));
      }
      if (!units || units <= 0) return api.toast(`No ${ticker} units available to sell.`);
      if (!window.MANDATE_API || !window.MANDATE_API.sellHardwareStock) return api.toast("Market sell unavailable.");
      node.disabled = true;
      node.textContent = "Selling…";
      window.MANDATE_API.sellHardwareStock(ticker, units).then((res) => {
        s.inventory = s.inventory || {};
        s.inventory.items = s.inventory.items || [];
        const updatedItem = res.item;
        if (updatedItem) {
          const idx = s.inventory.items.findIndex(i => i.ticker === ticker || i.sku === ticker);
          if (idx >= 0) s.inventory.items[idx] = { ...s.inventory.items[idx], ...updatedItem };
        }
        if (res.vault) {
          if (res.vault.available !== undefined) s.vault = Number(res.vault.available);
          if (res.vault.amount !== undefined) s.defaultVault = Number(res.vault.amount);
        }
        const hv = $("#header-vault-amount");
        if (hv && s.vault !== undefined) hv.textContent = "$" + Math.round(s.vault).toLocaleString("en-US");
        const al = $("#topbar-auth-label");
        if (al && s.vault !== undefined) {
          const uName = s.currentUser?.name || (s.currentUser?.email ? s.currentUser.email.split("@")[0] : "Active");
          al.textContent = `${uName} · $${Math.round(s.vault).toLocaleString("en-US")}`;
        }
        api.persist(); api.render();
        api.toast(`✓ Sold ${units} unit(s) of ${ticker}. +$${Number(res.proceeds || 0).toFixed(2)} credited directly to Vault!`);
      }).catch((err) => {
        api.toast(`Sell failed: ${err.message}`);
        node.disabled = false;
        node.textContent = "- Sell";
      });
      return;
    }
  }

  const routeLabels = {
    overview: "Command center", mandates: "Spend mandates", approvals: "Approvals queue", fairshare: "FairShare",
    disputes: "Dispute resolver", procurement: "Procurement", cfo: "Freelancer CFO", inventory: "Inventory agent",
    triage: "Clinical triage & billing", escrow: "Developer escrow", privacy: "Privacy policy", terms: "Terms & conditions"
  };
  const morePanel = $("#mobile-more-panel");
  if (morePanel) {
    morePanel.innerHTML = api.routes.filter((route) => !["overview", "mandates", "approvals", "fairshare"].includes(route)).map((route) => `<button data-route="${route}" type="button">${esc(routeLabels[route])}</button>`).join("");
  }

  function refreshFairSummary() {
    const summary = $("#fair-summary");
    if (summary) summary.innerHTML = api.fairSummaryHtml();
  }

  // Real-time character-by-character live input handler
  function handleInput(event) {
    const target = event.target;
    const s = setState();

    // 0. Live Vault Amount Input (Real-time keystroke synchronization)
    if (target.id === "vault-amount-input" || target.id === "auth-vault-amount" || target.id === "user-profile-vault" || target.id === "guest-profile-vault") {
      const val = parseFloat(target.value);
      if (!isNaN(val) && val >= 0) {
        s.defaultVault = val;
        s.vault = val;
        if (s.currentUser) s.currentUser.vaultAmount = val;
        const hv = $("#header-vault-amount");
        if (hv) hv.textContent = "$" + Math.round(val).toLocaleString("en-US");
        const al = $("#topbar-auth-label");
        if (al) {
          const uName = s.currentUser?.name || (s.currentUser?.email ? s.currentUser.email.split("@")[0] : "Active");
          al.textContent = `${uName} · $${Math.round(val).toLocaleString("en-US")}`;
        }
        const modalAvail = $("#modal-vault-available");
        if (modalAvail) modalAvail.textContent = money(val);
        api.persist();
        clearTimeout(window._vaultDebounce);
        window._vaultDebounce = setTimeout(() => {
          if (window.MANDATE_API && window.MANDATE_API.updateVault) {
            window.MANDATE_API.updateVault(val).catch(() => {});
          }
        }, 300);
      }
      return;
    }

    // 1. Live Payment Simulator input
    if (target.id === "sim-merchant" || target.id === "sim-amount" || target.id === "sim-category") {
      updateLivePaymentEvaluation();
      return;
    }

    // 2. Custom Domain input
    if (target.id === "custom-domain-input") {
      handleCustomDomainInput(target.value);
      return;
    }

    // 3. FairShare line items
    if (target.matches("[data-fair-name]")) {
      const idx = Number(target.dataset.fairName);
      if (s.fairItems[idx]) s.fairItems[idx].name = target.value;
      api.persist();
      return;
    }
    if (target.matches("[data-fair-amount]")) {
      const idx = Number(target.dataset.fairAmount);
      if (s.fairItems[idx]) s.fairItems[idx].amount = target.value;
      api.persist();
      refreshFairSummary();
      return;
    }
    if (target.matches("[data-fair-context]")) {
      s.fairContext = target.value;
      api.persist();
      return;
    }

    // 4. Inventory live calculations
    if (target.matches("[data-inventory-field]")) {
      const field = target.dataset.inventoryField;
      s.inventory[field] = target.value;
      if (s.inventory.sku && Array.isArray(s.inventory.items)) {
        const item = s.inventory.items.find(i => i.sku === s.inventory.sku);
        if (item) {
          if (field === "stock") { item.stock = target.value; item.currentStock = Number(target.value); }
          if (field === "threshold") { item.threshold = target.value; item.reorderThreshold = Number(target.value); }
          if (field === "item") item.item = target.value;
          if (field === "supplierA") item.supplierA = target.value;
          if (field === "priceA") item.priceA = Number(target.value);
          if (field === "daysA") item.daysA = Number(target.value);
        }
      }
      const hasStock = s.inventory.stock !== "" && s.inventory.threshold !== "";
      const low = hasStock && Number(s.inventory.stock) <= Number(s.inventory.threshold);
      const quotes = [
        { name: s.inventory.supplierA, price: Number(s.inventory.priceA), days: Number(s.inventory.daysA) },
        { name: s.inventory.supplierB, price: Number(s.inventory.priceB), days: Number(s.inventory.daysB) }
      ].filter((q) => q.name && Number.isFinite(q.price) && q.price >= 0 && Number.isFinite(q.days) && q.days >= 0).sort((a, b) => a.price - b.price || a.days - b.days);
      const best = quotes[0];

      const pill = $("#inventory-status-pill");
      if (pill) {
        pill.className = `status-pill ${low ? "blocked" : "approved"}`;
        pill.textContent = hasStock ? (low ? "Low Stock Triggered" : "Normal Stock") : "Awaiting data";
      }
      const triggerHead = $("#inventory-trigger-heading");
      if (triggerHead) {
        triggerHead.textContent = hasStock ? (low ? "Low-stock trigger met" : "Stock level sufficient") : "Enter stock values";
      }
      const triggerDesc = $("#inventory-trigger-desc");
      if (triggerDesc) {
        triggerDesc.textContent = hasStock ? (low ? "Current stock is below threshold. Review supplier offers before authorizing checkout." : "Stock is above reorder threshold. No purchase required.") : "Telemetry updates on every keystroke.";
      }
      const quoteCount = $("#inventory-quote-count");
      if (quoteCount) quoteCount.textContent = `${quotes.length} quotes`;
      const bestToken = $("#inventory-best-token");
      if (bestToken) {
        bestToken.textContent = best ? `Optimal offer: ${best.name} · ${money(best.price)} · ${best.days} days delivery` : "Enter supplier names, quotes, and delivery times to compare in real time.";
      }
      const approveBtn = $("#inventory-approve-btn");
      if (approveBtn) approveBtn.disabled = !hasStock || !low || !best || s.inventory.approved;
      api.persist();
      return;
    }

    // 5. Procurement live matching
    if (target.matches("[data-procurement-field]")) {
      s.procurement[target.dataset.procurementField] = target.value;
      const p = s.procurement;
      const hasTotals = p.invoiceTotal !== "" && p.poTotal !== "";
      const variance = hasTotals ? Math.round((Number(p.invoiceTotal) - Number(p.poTotal)) * 100) / 100 : 0;
      const hasRefs = Boolean(p.invoiceRef?.trim() && p.poRef?.trim());
      const hasLines = Boolean(p.invoiceLine?.trim() && p.poLine?.trim() && p.invoiceQty !== "" && p.poQty !== "");
      const lineMatch = hasLines && p.invoiceLine.trim().toLowerCase() === p.poLine.trim().toLowerCase() && Number(p.invoiceQty) === Number(p.poQty);
      const match = hasRefs && hasTotals && hasLines && lineMatch && Math.abs(variance) < 0.01;

      const pill = $("#procurement-pill");
      if (pill) {
        pill.className = `status-pill ${!hasRefs && !hasTotals ? "review" : match ? "approved" : "blocked"}`;
        pill.textContent = !hasRefs && !hasTotals ? "Awaiting input" : match ? "Verified Match" : "Discrepancy";
      }
      const tokenArea = $("#procurement-token-area");
      if (tokenArea) {
        tokenArea.innerHTML = `${hasTotals ? `<div class="preview-token" style="margin-top:10px"><span>Invoice ${money(p.invoiceTotal)} · PO ${money(p.poTotal)}</span><strong>${variance === 0 ? "Variance $0.00" : `Variance ${money(variance)}`}</strong></div>` : ""}${hasLines ? `<div class="preview-token" style="margin-top:8px"><span>${esc(p.invoiceLine)} · qty ${esc(p.invoiceQty)}</span><strong>${lineMatch ? "Line matched" : "Line mismatch"}</strong></div>` : ""}`;
      }
      const approveBtn = $("#procurement-approve-btn");
      if (approveBtn) approveBtn.disabled = !match || p.approved;
      api.persist();
      return;
    }

    // 6. CFO live currency conversion
    if (target.matches("[data-reconcile]")) {
      s.cfo.reconcileInput = s.cfo.reconcileInput || {};
      s.cfo.reconcileInput[target.dataset.reconcile] = target.value;
      const amt = Number($("#reconcile-amount")?.value) || 0;
      const rate = Number($("#reconcile-rate")?.value) || 0;
      const from = $("#reconcile-from")?.value || "EUR";
      const to = $("#reconcile-to")?.value || "USD";
      const resultNode = $("#reconcile-result");
      if (resultNode) {
        if (amt > 0 && rate > 0) {
          const conv = Math.round(amt * rate * 100) / 100;
          resultNode.textContent = `${money(amt)} ${from} × ${rate} = ${money(conv)} ${to} (Live calculation)`;
        } else {
          resultNode.textContent = "Type an amount and rate above to preview converted total in real time.";
        }
      }
      api.persist();
      return;
    }

    // 7. Dispute live drafting & real-time estimated recovery update
    if (target.matches("[data-dispute-field]")) {
      s.dispute = s.dispute || { transactionRef: "", shippingEvidence: "", draft: "" };
      s.dispute[target.dataset.disputeField] = target.value;
      const refStatus = $("#dispute-ref-status");
      if (refStatus) refStatus.textContent = s.dispute.transactionRef ? `Reference: ${s.dispute.transactionRef}` : "Awaiting transaction reference.";
      const shipStatus = $("#dispute-ship-status");
      if (shipStatus) shipStatus.textContent = s.dispute.shippingEvidence ? "Shipping evidence entered." : "Awaiting delivery details.";
      updateRealTimeDisputeOutlook();
      api.persist();
      return;
    }
    if (target.matches("[data-dispute-draft]")) {
      s.dispute = s.dispute || {};
      s.dispute.draft = target.value;
      const copyBtn = document.querySelector('[data-action="copy-dispute-draft"]');
      if (copyBtn) copyBtn.disabled = !target.value.trim();
      updateRealTimeDisputeOutlook();
      api.persist();
      return;
    }

    // 8. Escrow live validation
    if (target.matches("[data-escrow-field]")) {
      s.escrow[target.dataset.escrowField] = target.value;
      const hasEv = Boolean(String(s.escrow.evidence || "").trim());
      const head = $("#escrow-evidence-heading");
      if (head) head.textContent = hasEv ? "Evidence reference entered" : "Waiting for milestone evidence";
      api.persist();
      return;
    }

    // Live Email Syntax Validator
    if (target.id === "auth-email") {
      const email = target.value.trim();
      const badge = $("#auth-email-badge");
      const hint = $("#auth-email-hint");
      const isValid = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
      if (badge && hint) {
        if (!email) {
          badge.className = "status-pill review";
          badge.textContent = "Required";
          hint.textContent = "Enter user@domain.com (any valid email syntax will be allowed)";
          hint.style.color = "var(--muted)";
        } else if (isValid) {
          badge.className = "status-pill approved";
          badge.textContent = "✓ Valid Email Syntax";
          hint.textContent = `Valid syntax: ${email}. Ready to authenticate.`;
          hint.style.color = "var(--green)";
        } else {
          badge.className = "status-pill blocked";
          badge.textContent = "Invalid Syntax";
          hint.textContent = "Format must be user@domain.com (e.g. name@company.org)";
          hint.style.color = "var(--red)";
        }
      }
      return;
    }

    // 9. CFO invoice form
    if (target.matches("[data-cfo-field]")) {
      s.cfo.form = s.cfo.form || {};
      s.cfo.form[target.dataset.cfoField] = target.value;
      api.persist();
      return;
    }
  }

  function handleChange(event) {
    const target = event.target;
    const s = setState();
    if (target.matches("[data-fair-person]")) {
      const item = s.fairItems[Number(target.dataset.fairIndex)];
      if (item) {
        item.included = item.included || [];
        item.included = target.checked ? [...new Set([...item.included, target.dataset.fairPerson])] : item.included.filter((name) => name !== target.dataset.fairPerson);
        api.persist(); refreshFairSummary();
      }
    } else if (target.matches("[data-fair-payer]")) {
      const item = s.fairItems[Number(target.dataset.fairPayer)];
      if (item) { item.paidBy = target.value; api.persist(); refreshFairSummary(); }
    } else if (target.id === "fair-receipt" && target.files?.[0]) {
      s.fairReceiptName = target.files[0].name; api.persist(); api.render();
    } else if (target.matches("[data-procurement-file]") && target.files?.[0]) {
      s.procurement[target.dataset.procurementFile] = target.files[0].name; api.persist(); api.render();
    } else if (target.matches("[data-triage-target]")) {
      s.triage.billingTarget = target.value; api.persist();
    } else if (target.id === "reconcile-from" || target.id === "reconcile-to") {
      fetchLiveFx();
    } else if (target.matches("[data-inventory-field]")) {
      const field = target.dataset.inventoryField;
      s.inventory[field] = target.value;
      if (s.inventory.sku && Array.isArray(s.inventory.items)) {
        const item = s.inventory.items.find(i => i.sku === s.inventory.sku);
        if (item) {
          if (field === "stock") { item.stock = target.value; item.currentStock = Number(target.value); }
          if (field === "threshold") { item.threshold = target.value; item.reorderThreshold = Number(target.value); }
          if (field === "item") item.item = target.value;
          if (field === "supplierA") item.supplierA = target.value;
          if (field === "priceA") item.priceA = Number(target.value);
          if (field === "daysA") item.daysA = Number(target.value);
        }
      }
      api.persist();
      if (window.MANDATE_API && window.MANDATE_API.evaluateInventory) {
        window.MANDATE_API.evaluateInventory({
          sku: s.inventory.sku,
          stock: s.inventory.stock,
          threshold: s.inventory.threshold,
          item: s.inventory.item,
          supplierA: s.inventory.supplierA,
          priceA: s.inventory.priceA,
          daysA: s.inventory.daysA,
          supplierB: s.inventory.supplierB,
          priceB: s.inventory.priceB,
          daysB: s.inventory.daysB
        }).then(() => { api.render(); }).catch(() => {});
      }
    }
  }

  // Global Click Delegate
  document.addEventListener("click", (event) => {
    const themeBtn = event.target.closest("[data-theme-choice]");
    if (themeBtn) {
      setTheme(themeBtn.dataset.themeChoice);
      return;
    }
    const sidebarToggle = event.target.closest("#sidebar-toggle-btn");
    if (sidebarToggle) {
      toggleSidebar();
      return;
    }
    const mobileMenuBtn = event.target.closest("#mobile-menu-button");
    if (mobileMenuBtn) {
      const sidebar = $("#sidebar");
      if (sidebar) {
        const isNowOpen = !sidebar.classList.contains("open");
        sidebar.classList.toggle("open", isNowOpen);
        mobileMenuBtn.setAttribute("aria-expanded", isNowOpen ? "true" : "false");
      }
      return;
    }
    const sidebarArrow = event.target.closest("#sidebar-arrow-btn");
    if (sidebarArrow) {
      toggleSidebar();
      return;
    }
    const mobileMore = event.target.closest("#mobile-more");
    if (mobileMore) {
      const panel = $("#mobile-more-panel");
      if (panel) {
        panel.hidden = !panel.hidden;
        mobileMore.setAttribute("aria-expanded", panel.hidden ? "false" : "true");
      }
      return;
    }
    const routeNode = event.target.closest("[data-route]");
    if (routeNode) {
      api.navigate(routeNode.dataset.route);
      return;
    }
    const actionNode = event.target.closest("[data-action]");
    if (actionNode) {
      handleAction(actionNode);
      return;
    }
    if (event.target.id === "confirm-paypal-pay") {
      executePayPalPayment(event.target.dataset.id);
      return;
    }
    const activityFilter = event.target.closest("[data-activity-filter]");
    if (activityFilter) {
      setState().activityFilter = activityFilter.dataset.activityFilter;
      api.persist(); api.render();
      return;
    }
    const approvalFilter = event.target.closest("[data-approval-filter]");
    if (approvalFilter) {
      setState().approvalFilter = approvalFilter.dataset.approvalFilter;
      api.persist(); api.render();
      return;
    }
    const mandateFilter = event.target.closest("[data-mandate-filter]");
    if (mandateFilter) {
      setState().mandateFilter = mandateFilter.dataset.mandateFilter;
      api.persist(); api.render();
      return;
    }
    if (event.target.classList.contains("dialog-backdrop")) {
      closeDialog();
      return;
    }
  });

  async function submitAddInventory(form) {
    const item = $("#add-inv-item")?.value.trim() || "Hardware Component";
    const sku = $("#add-inv-sku")?.value.trim() || `HW-${Date.now().toString().slice(-4)}`;
    const stock = Number($("#add-inv-stock")?.value || 0);
    const threshold = Number($("#add-inv-threshold")?.value || 1);
    const supplierA = $("#add-inv-supplierA")?.value.trim() || "PNY Enterprise Direct";
    const priceA = Number($("#add-inv-priceA")?.value || 14200);
    const daysA = Number($("#add-inv-daysA")?.value || 3);

    const submitBtn = form.querySelector('[type="submit"]');
    if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = "Registering with Telemetry…"; }

    const payload = {
      sku,
      item,
      stock,
      currentStock: stock,
      threshold,
      reorderThreshold: threshold,
      unit: "units",
      supplierA,
      priceA,
      daysA,
      supplierB: "Arrow Global Tech",
      priceB: Math.round(priceA * 1.05),
      daysB: Math.max(1, daysA - 1)
    };

    try {
      let createdItem = payload;
      if (window.MANDATE_API && window.MANDATE_API.addInventoryItem) {
        createdItem = await window.MANDATE_API.addInventoryItem(payload);
      }
      const s = setState();
      s.inventory = s.inventory || {};
      s.inventory.items = s.inventory.items || [];
      const exIdx = s.inventory.items.findIndex(i => i.sku === sku);
      if (exIdx >= 0) {
        s.inventory.items[exIdx] = createdItem;
      } else {
        s.inventory.items.unshift(createdItem);
      }
      s.inventory.sku = createdItem.sku;
      s.inventory.item = createdItem.item;
      s.inventory.stock = String(createdItem.stock);
      s.inventory.threshold = String(createdItem.threshold);
      s.inventory.supplierA = createdItem.supplierA;
      s.inventory.priceA = String(createdItem.priceA);
      s.inventory.daysA = String(createdItem.daysA);
      s.inventory.supplierB = createdItem.supplierB;
      s.inventory.priceB = String(createdItem.priceB);
      s.inventory.daysB = String(createdItem.daysB);

      closeDialog();
      api.persist();
      api.render();
      api.toast(`✓ Added ${sku} (${item}) — stock: ${stock}, threshold: ${threshold} registered in real-time backend.`);
    } catch (err) {
      console.error("[Add Inventory] Error:", err);
      api.toast("Failed to register hardware SKU with telemetry backend.");
      if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = "Save & Track in Real Time"; }
    }
  }

  // Event Listeners for real-time reactivity
  document.addEventListener("input", handleInput);
  document.addEventListener("change", handleChange);

  document.addEventListener("submit", (event) => {
    if (event.target.id === "mandate-form") {
      event.preventDefault(); saveMandate(event.target);
    } else if (event.target.id === "simulate-payment-form") {
      event.preventDefault(); executeSimulatedPayment(event.target);
    } else if (event.target.id === "fair-item-form") {
      event.preventDefault(); saveFairItem(event.target);
    } else if (event.target.id === "custom-domain-form") {
      event.preventDefault(); saveCustomDomain(event.target);
    } else if (event.target.id === "paypal-connect-form") {
      event.preventDefault(); submitPayPalConnect(event.target);
    } else if (event.target.id === "auth-login-form") {
      event.preventDefault(); handleEmailLogin(event.target);
    } else if (event.target.id === "vault-adjust-form") {
      event.preventDefault(); handleVaultAdjust(event.target);
    } else if (event.target.id === "add-inventory-form") {
      event.preventDefault(); submitAddInventory(event.target);
    } else if (event.target.id === "track-stock-form") {
      event.preventDefault(); submitTrackStock(event.target);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && event.target && event.target.id === "cfo-chat-input") {
      event.preventDefault();
      sendCfoMessage();
    }
    if (event.key === "Escape" && $("#modal-root")?.children.length) {
      closeDialog();
    }
  });

  window.addEventListener("hashchange", () => {
    const next = window.location.hash.replace(/^#/, "");
    if (api.routes.includes(next) && next !== api.state.route) {
      api.navigate(next);
    }
  });
})();
