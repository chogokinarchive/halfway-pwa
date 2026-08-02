"use client";

import { useEffect } from "react";

/**
 * Registers the service worker after mount. Runs only on the client and
 * never affects rendered markup, so it cannot cause a hydration mismatch.
 */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Registration failures should never break the app.
      });
    }
  }, []);

  return null;
}
