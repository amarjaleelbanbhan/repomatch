/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    // workspace packages (e.g. @repomatch/matcher) use TS's "moduleResolution: bundler"
    // convention of importing "./foo.js" for source files that are actually "./foo.ts";
    // webpack needs to be told explicitly to try .ts/.tsx before .js for those specifiers.
    config.resolve.extensionAlias = {
      ".js": [".ts", ".tsx", ".js"],
    };
    return config;
  },
};

export default nextConfig;
