import { API_URL } from "./config";
import { Logger } from "./logger";

export const FB_PIXEL_ID = process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID;

export const pageview = () => {
  if (typeof window !== "undefined" && (window as any).fbq) {
    (window as any).fbq("track", "PageView");
  }
};

// https://developers.facebook.com/docs/facebook-pixel/reference
export const event = (
  name: string,
  options: any = {},
  eventId?: string,
  sendToServer: boolean = true,
) => {
  const id =
    eventId ||
    (typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : Math.random().toString(36).substring(2, 15));

  if (typeof window !== "undefined" && (window as any).fbq) {
    (window as any).fbq("track", name, options, { eventID: id });
  }

  if (sendToServer && typeof window !== "undefined") {
    // Fire and forget server-side CAPI request
    let token = null;
    try {
      token =
        localStorage.getItem("femcart_access_token") ||
        localStorage.getItem("token");
    } catch (error) {
      Logger.warn(
        "Failed to retrieve auth token for Facebook CAPI tracking",
        error,
        "FacebookPixel",
      );
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    fetch(`${API_URL}/api/tracking/facebook`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        eventName: name,
        eventId: id,
        eventSourceUrl: window.location.href,
        customData: options,
      }),
    }).catch((err) =>
      console.error("[CAPI] Failed to send event to server", err),
    );
  }

  return id;
};
