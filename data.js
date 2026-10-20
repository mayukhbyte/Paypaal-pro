// @src-type: library
window.MANDATE_DATA = Object.freeze({
  storageKey: "mandate-agent-console-v2-clean",
  dashboard: {
    vault: 0,
    committed: 0,
    budgetLeft: 0,
    budgetPool: 0,
    railsToday: 0,
    railsDelta: 0,
    paymentsToday: 0,
    blockedCount: 0,
    protected: 0,
    pending: 0,
    autoApprovalRate: 100,
    autoApprovedPayments: 0,
    settlementLatency: "0.00s"
  },
  mandates: [],
  mandateFormPreset: {
    name: "SaaS & Cloud Operations Agent",
    purpose: "Autonomous infrastructure scaling & software licenses",
    totalLimit: 50000,
    resetCycle: "Monthly",
    perTransaction: 15000,
    humanApprovalAbove: 10000,
    categories: ["Cloud Services", "Software", "APIs"],
    domains: ["aws.amazon.com", "openai.com", "github.com", "vercel.com"],
    expiry: "2026-12-31",
    fundingSource: "MAYUKHUPI Vault (Direct INR)"
  },
  approvals: [],
  activity: [],
  fairShare: {
    participants: ["Alice", "Bob", "Charlie"],
    context: "Alice did not drink alcohol. Bob left early. Charlie covered the car rental deposit.",
    items: [
      { name: "Shared food", amount: "", included: ["Alice", "Bob", "Charlie"], paidBy: "" },
      { name: "Alcohol", amount: "", included: ["Bob", "Charlie"], paidBy: "" },
      { name: "Car rental deposit", amount: "", included: ["Alice", "Bob", "Charlie"], paidBy: "Charlie" }
    ]
  },
  concepts: [
    {
      id: "firewall",
      label: "Agent Spend Firewall",
      group: "Core",
      description: "Scoped budget mandates with spend limits, merchant controls, expiry, approve/block/escalate policy decisions, and a PayPal settlement step."
    },
    {
      id: "disputes",
      label: "Autonomous Dispute Resolver",
      group: "Merchant tools",
      description: "Use transaction history and shipping evidence to draft a response and predict win probability."
    },
    {
      id: "procurement",
      label: "Small-business Procurement",
      group: "Merchant tools",
      description: "Compare supplier invoices with purchase orders, flag anomalies, and require human approval before payouts."
    },
    {
      id: "cfo",
      label: "Chat-based Freelancer CFO",
      group: "Merchant tools",
      description: "A WhatsApp or voice agent creates invoices, chases late payers, and reconciles currencies."
    },
    {
      id: "fairshare",
      label: "FairShare",
      group: "Core",
      description: "Upload itemized receipts, account for natural-language context, compute fair splits, and preview PayPal requests for each member."
    },
    {
      id: "inventory",
      label: "Autonomous Inventory Agent",
      group: "Operational Modules",
      description: "ESP32 hardware triggers detect low stock; an agent compares supplier prices and delivery times; a person approves before PayPal Checkout."
    },
    {
      id: "triage",
      label: "Clinical Triage & Medical Billing",
      group: "Operational Modules",
      description: "An offline-capable triage queue represents sensor vitals and severity, with PayPal Invoicing directed to a patient or insurer."
    },
    {
      id: "escrow",
      label: "Agentic Escrow for Developer Bounties",
      group: "Operational Modules",
      description: "Milestone contracts are checked against GitHub commits or pull requests before a verified milestone can release funds via PayPal Payouts."
    }
  ]
});
