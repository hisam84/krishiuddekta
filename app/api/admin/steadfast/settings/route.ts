import { NextRequest, NextResponse } from "next/server";
import { getDb } from "lib/db/index";
import { getSteadfastConfig, getSteadfastBalance } from "lib/steadfast";

export async function GET() {
  try {
    const config = await getSteadfastConfig();
    let balance = null;

    if (config.apiKey && config.secretKey) {
      try {
        balance = await getSteadfastBalance();
      } catch (e) {
        console.error("Failed to fetch Steadfast balance:", e);
      }
    }

    return NextResponse.json({
      success: true,
      config: {
        apiKey: config.apiKey ? `${config.apiKey.slice(0, 4)}...${config.apiKey.slice(-4)}` : "",
        hasApiKey: Boolean(config.apiKey),
        hasSecretKey: Boolean(config.secretKey),
        baseUrl: config.baseUrl,
        enabled: config.enabled,
      },
      balance,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to load Steadfast settings" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { apiKey, secretKey, baseUrl, enabled } = await req.json();

    const sql = getDb();

    if (apiKey !== undefined) {
      await sql`
        INSERT INTO settings (key, value) VALUES ('steadfast_api_key', ${apiKey})
        ON CONFLICT (key) DO UPDATE SET value = ${apiKey};
      `;
    }

    if (secretKey !== undefined) {
      await sql`
        INSERT INTO settings (key, value) VALUES ('steadfast_secret_key', ${secretKey})
        ON CONFLICT (key) DO UPDATE SET value = ${secretKey};
      `;
    }

    if (baseUrl !== undefined) {
      await sql`
        INSERT INTO settings (key, value) VALUES ('steadfast_base_url', ${baseUrl})
        ON CONFLICT (key) DO UPDATE SET value = ${baseUrl};
      `;
    }

    if (enabled !== undefined) {
      await sql`
        INSERT INTO settings (key, value) VALUES ('steadfast_enabled', ${String(enabled)})
        ON CONFLICT (key) DO UPDATE SET value = ${String(enabled)};
      `;
    }

    return NextResponse.json({
      success: true,
      message: "Steadfast API settings saved successfully",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to save settings" },
      { status: 500 }
    );
  }
}
