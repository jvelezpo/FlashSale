const path = require('path');

/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  images: {
    domains: ['lh3.googleusercontent.com', 's.gravatar.com'],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      return {
        ...config,
        entry() {
          return config.entry().then((entry) => ({
            ...entry,
            // adding custom entry points
            worker: path.resolve(process.cwd(), 'lib/worker.ts'),
            fixtures: path.resolve(process.cwd(), 'lib/fixtures/index.ts'),
          }));
        }
      };
    }
    return config
  }
}
