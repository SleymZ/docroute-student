import type { NextConfig } from "next";

// Security headers for every page. No full Content-Security-Policy yet
// (it would need a list of every script and image host); the one CSP rule
// here only forbids other sites from showing DocRoute inside a frame.
export const securityHeaders = [
  // Nobody can embed the site to trick visitors into clicks (clickjacking).
  { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
  { key: "X-Frame-Options", value: "DENY" },
  // Browsers must not guess file types (an upload cannot run as a script).
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Official sites opened from a route see only "docroute…", never the
  // address with the route answers (citizenship, status) in it.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // The site uses no camera, microphone or location.
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
];

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
