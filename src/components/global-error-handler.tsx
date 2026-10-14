"use client";

import { useEffect } from "react";

/**
 * Global client-side error and promise rejection handler.
 * Prevents third-party browser extensions (such as Katalon, Shopify App Detector,
 * or extension scripts reading 'M_ID') from triggering noisy unhandled rejections
 * and console errors across any Next.js route in the application.
 */
export function GlobalErrorHandler() {
  useEffect(() => {
    const handleRejection = (event: PromiseRejectionEvent) => {
      const reasonStr = String(
        event.reason?.stack || event.reason?.message || event.reason || ""
      );
      if (
        reasonStr.includes("chrome-extension://") ||
        reasonStr.includes("moz-extension://") ||
        reasonStr.includes("M_ID")
      ) {
        event.preventDefault();
      }
    };

    const handleError = (event: ErrorEvent) => {
      const msg = String(event.message || event.error?.message || "");
      const filename = String(event.filename || "");
      if (
        filename.includes("chrome-extension://") ||
        filename.includes("moz-extension://") ||
        msg.includes("M_ID")
      ) {
        event.preventDefault();
      }
    };

    window.addEventListener("unhandledrejection", handleRejection);
    window.addEventListener("error", handleError);

    return () => {
      window.removeEventListener("unhandledrejection", handleRejection);
      window.removeEventListener("error", handleError);
    };
  }, []);

  return null;
}
