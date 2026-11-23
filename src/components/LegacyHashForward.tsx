"use client";

import { useEffect } from "react";

// The HelpToPost landing page used to live at amarhelps.com/. Hashes never reach the server, so
// old links such as amarhelps.com/#waitlist are forwarded here, in the browser.
const MOVED = new Set(["#how", "#pricing", "#waitlist"]);

export function LegacyHashForward() {
  useEffect(() => {
    if (MOVED.has(window.location.hash)) window.location.replace(`/helptopost${window.location.hash}`);
  }, []);
  return null;
}
