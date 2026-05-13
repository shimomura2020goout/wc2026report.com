"use client";

import { AppProgressBar } from "next-nprogress-bar";

export default function RouteProgressBar() {
  return (
    <AppProgressBar
      height="3px"
      color="#fbbf24"
      options={{ showSpinner: false }}
      shallowRouting
    />
  );
}
