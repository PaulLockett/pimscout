import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@pimscout/schemas", "@pimscout/temporal-client"],
};

export default nextConfig;
