import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "plus.unsplash.com" },
      { protocol: "https", hostname: "franchisekhoj.com" },
      { protocol: "https", hostname: "gczpkfntgefrktholyqt.supabase.co" },
      
    ],
  },
};

export default nextConfig;
