/** @type {import('next').NextConfig} */
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

const nextConfig = {
  transpilePackages: [
    'next-intl',
    'use-intl',
    'intl-messageformat',
    '@formatjs/icu-messageformat-parser',
    '@formatjs/fast-memoize',
  ],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "i.ibb.co",
        pathname: "/**",
      },
    ],
  },
};

export default withNextIntl(nextConfig);