import { getDb } from "./db/index";

export interface SteadfastConfig {
  apiKey: string;
  secretKey: string;
  baseUrl: string;
  enabled: boolean;
}

export interface CreateSteadfastOrderPayload {
  invoice: string;
  recipient_name: string;
  recipient_phone: string;
  recipient_address: string;
  cod_amount: number;
  note?: string;
}

export interface SteadfastConsignment {
  consignment_id: number | string;
  invoice: string;
  tracking_code: string;
  recipient_name: string;
  recipient_phone: string;
  recipient_address: string;
  cod_amount: number;
  status: string;
  created_at?: string;
}

export interface SteadfastCreateOrderResponse {
  status: number;
  message?: string;
  consignment?: SteadfastConsignment;
  errors?: Record<string, string[]>;
}

export async function getSteadfastConfig(): Promise<SteadfastConfig> {
  let apiKey = process.env.STEADFAST_API_KEY || "";
  let secretKey = process.env.STEADFAST_SECRET_KEY || "";
  let baseUrl = process.env.STEADFAST_BASE_URL || "https://portal.steadfast.com.bd/api/v1";
  let enabled = true;

  try {
    const sql = getDb();
    const rows = await sql`
      SELECT key, value FROM settings 
      WHERE key IN ('steadfast_api_key', 'steadfast_secret_key', 'steadfast_base_url', 'steadfast_enabled');
    `;

    for (const row of rows) {
      if (row.key === "steadfast_api_key" && row.value) apiKey = row.value;
      if (row.key === "steadfast_secret_key" && row.value) secretKey = row.value;
      if (row.key === "steadfast_base_url" && row.value) baseUrl = row.value;
      if (row.key === "steadfast_enabled") enabled = row.value === "true";
    }
  } catch (err) {
    console.error("Error reading Steadfast settings from database:", err);
  }

  return { apiKey, secretKey, baseUrl, enabled };
}

export async function createSteadfastOrder(
  payload: CreateSteadfastOrderPayload
): Promise<SteadfastCreateOrderResponse> {
  const config = await getSteadfastConfig();

  if (!config.apiKey || !config.secretKey) {
    throw new Error("Steadfast API Key or Secret Key is not configured. Please set them in Admin Settings.");
  }

  const res = await fetch(`${config.baseUrl}/create_order`, {
    method: "POST",
    headers: {
      "Api-Key": config.apiKey,
      "Secret-Key": config.secretKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      invoice: String(payload.invoice),
      recipient_name: payload.recipient_name,
      recipient_phone: payload.recipient_phone,
      recipient_address: payload.recipient_address,
      cod_amount: payload.cod_amount,
      note: payload.note || "Order from Krishi Uddokta Store",
    }),
  });

  const data = await res.json();
  return data;
}

export async function getSteadfastDeliveryStatus(identifier: {
  consignment_id?: string;
  invoice?: string;
  tracking_code?: string;
}) {
  const config = await getSteadfastConfig();

  if (!config.apiKey || !config.secretKey) {
    throw new Error("Steadfast API Key or Secret Key is not configured.");
  }

  let endpoint = "";
  if (identifier.consignment_id) {
    endpoint = `${config.baseUrl}/status_by_cid/${identifier.consignment_id}`;
  } else if (identifier.invoice) {
    endpoint = `${config.baseUrl}/status_by_invoice/${identifier.invoice}`;
  } else if (identifier.tracking_code) {
    endpoint = `${config.baseUrl}/status_by_trackingcode/${identifier.tracking_code}`;
  } else {
    throw new Error("Missing consignment_id, invoice, or tracking_code for status lookup.");
  }

  const res = await fetch(endpoint, {
    method: "GET",
    headers: {
      "Api-Key": config.apiKey,
      "Secret-Key": config.secretKey,
    },
  });

  const data = await res.json();
  return data;
}

export async function getSteadfastBalance() {
  const config = await getSteadfastConfig();

  if (!config.apiKey || !config.secretKey) {
    return { status: 400, message: "Steadfast credentials not configured", current_balance: 0 };
  }

  const res = await fetch(`${config.baseUrl}/get_balance`, {
    method: "GET",
    headers: {
      "Api-Key": config.apiKey,
      "Secret-Key": config.secretKey,
    },
  });

  const data = await res.json();
  return data;
}
