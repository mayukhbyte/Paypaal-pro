// @src-type: app
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ErrorCode,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { execSync } from "child_process";

// MCP Server that connects to existing Mandate API
const server = new Server(
  {
    name: "mandate-spend-firewall",
    version: "1.0.0",
  },
  {
    capabilities: {
      resources: {},
      tools: {},
    },
  }
);

// Base URL for the Mandate API
const API_BASE = "http://localhost:3000/api";

// Helper function to make API calls
async function apiCall(endpoint, method = "GET", data = null) {
  try {
    // Using curl for simplicity in this example
    // In production, you might want to use a proper HTTP client
    let command = `curl -s -X ${method} ${API_BASE}${endpoint}`;
    if (data) {
      command += ` -H "Content-Type: application/json" -d '${JSON.stringify(data)}'`;
    }

    const result = execSync(command, { encoding: "utf8" });
    return JSON.parse(result);
  } catch (error) {
    console.error(`API call failed: ${error.message}`);
    throw new Error(`Failed to connect to Mandate API: ${error.message}`);
  }
}

// Set up resource handlers
server.setRequestHandler(ListResourcesRequestSchema, async () => ({
  resources: [
    {
      uri: "mandate://dashboard",
      name: "Mandate Dashboard",
      description: "Real-time dashboard data for mandates and approvals",
      mimeType: "application/json",
    },
    {
      uri: "mandate://audit-log",
      name: "Audit Log",
      description: "Tamper-evident audit ledger of all transactions",
      mimeType: "application/json",
    },
    {
      uri: "mandate://approvals",
      name: "Approval Queue",
      description: "Pending approvals requiring human review",
      mimeType: "application/json",
    },
  ],
}));

server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const { uri } = request.params;

  try {
    let result;
    switch (uri) {
      case "mandate://dashboard":
        result = await apiCall("/dashboard");
        break;
      case "mandate://audit-log":
        result = await apiCall("/audit");
        break;
      case "mandate://approvals":
        result = await apiCall("/approvals");
        break;
      default:
        throw new Error(
          `Failed to find resource: ${JSON.stringify(request.params.uri)}`
        );
    }

    return {
      contents: [
        {
          uri,
          mimeType: "application/json",
          text: JSON.stringify(result),
        },
      ],
    };
  } catch (error) {
    return {
      contents: [
        {
          uri,
          mimeType: "application/json",
          text: JSON.stringify({ error: error.message }),
        },
      ],
    };
  }
});

// Set up tool handlers
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "list_mandates",
      description: "Inspect active agent budgets, caps, and allowed merchants",
      inputSchema: {
        type: "object",
        properties: {},
      },
    },
    {
      name: "check_mandate",
      description: "Pre-screen candidate purchases without moving funds",
      inputSchema: {
        type: "object",
        properties: {
          mandateId: { type: "string" },
          merchant: { type: "string" },
          amount: { type: "number" },
          category: { type: "string" },
        },
        required: ["mandateId", "merchant", "amount"],
      },
    },
    {
      name: "request_payment",
      description: "Execute in-policy orders via PayPal Sandbox or quarantine to Fiduciary Escrow",
      inputSchema: {
        type: "object",
        properties: {
          mandateId: { type: "string" },
          merchant: { type: "string" },
          amount: { type: "number" },
          description: { type: "string" },
        },
        required: ["mandateId", "merchant", "amount"],
      },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case "list_mandates": {
        const result = await apiCall("/mandates");
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result),
            },
          ],
        };
      }
      case "check_mandate": {
        const { mandateId, merchant, amount, category } = args;
        const result = await apiCall("/guardrails/evaluate", "POST", {
          mandateId,
          merchant,
          amount,
          category,
          recordSpend: false, // Don't actually record spend for pre-check
        });
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result),
            },
          ],
        };
      }
      case "request_payment": {
        const { mandateId, merchant, amount, description } = args;
        // First check if allowed
        const checkResult = await apiCall("/guardrails/evaluate", "POST", {
          mandateId,
          merchant,
          amount,
          category: "" // Empty category for payment request
        });

        if (!checkResult.allowed) {
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify({
                  success: false,
                  message: "Payment blocked by policy",
                  decision: checkResult.decision,
                  reason: checkResult.reason,
                }),
              },
            ],
            isError: true,
          };
        }

        // If allowed, create the PayPal order
        const orderResult = await apiCall("/paypal/create-order", "POST", {
          mandateId,
          merchant,
          amount,
          description: description || `Payment to ${merchant}`
        });

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                success: true,
                message: "Payment request processed",
                orderId: orderResult.id,
                requiresCapture: true,
              }),
            },
          ],
        };
      }
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({ error: error.message }),
        },
      ],
      isError: true,
    };
  }
});

// Set up error handling
server.onerror = (error) => console.error("[MCP Server] Error:", error);

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("[MCP Server] Mandate Spend Firewall MCP Server started");
}

main().catch((error) => {
  console.error("[MCP Server] Fatal error:", error);
  process.exit(1);
});