import { APP_NAME, ATTRIBUTION_TRACK_API_URL, BASE_APP_ID } from "@/lib/env";

let missingConfigWarned = false;

function warnDev(message) {
  if (process.env.NODE_ENV !== "production") {
    console.warn(`[tracking] ${message}`);
  }
}

export async function trackTransaction(userAddress, txHash, action) {
  if (!BASE_APP_ID || !ATTRIBUTION_TRACK_API_URL) {
    if (!missingConfigWarned) {
      missingConfigWarned = true;
      warnDev(
        "Skipping offchain tracking because NEXT_PUBLIC_BASE_APP_ID or NEXT_PUBLIC_ATTRIBUTION_TRACK_API is missing."
      );
    }
    return;
  }

  if (!userAddress || !txHash) {
    warnDev("Skipping offchain tracking because user address or tx hash is missing.");
    return;
  }

  try {
    const response = await fetch(ATTRIBUTION_TRACK_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      keepalive: true,
      body: JSON.stringify({
        app_id: BASE_APP_ID,
        app_name: APP_NAME,
        user_address: userAddress?.toLowerCase(),
        tx_hash: txHash,
        action,
        timestamp: new Date().toISOString()
      })
    });

    if (!response.ok) {
      warnDev(`Tracking endpoint responded with HTTP ${response.status}.`);
    }
  } catch {
    warnDev("Tracking request failed. Main transaction flow is unaffected.");
  }
}
