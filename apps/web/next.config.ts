import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  transpilePackages: ["@pimscout/schemas", "@pimscout/temporal-client"],
};

export default nextConfig;
