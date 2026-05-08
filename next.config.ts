import type { NextConfig } from 'next';

const remoteOrigin =
  process.env.NEXT_PUBLIC_REMOTE_ORIGIN ?? 'http://localhost:3003';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  transpilePackages: ['@gsrosa/nexploring-ui'],
  eslint: {
    ignoreDuringBuilds: true,
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Cache-Control', value: 'no-store' },
        ],
      },
    ];
  },
  webpack(config, { isServer, webpack }) {
    if (!isServer) {
      config.output.publicPath = `${remoteOrigin}/_next/`;
      config.output.uniqueName = 'nexploringUser';

      config.output.chunkLoadingGlobal = 'webpackChunk_nexploring_user';
      config.plugins.push(
        new webpack.container.ModuleFederationPlugin({
          name: 'userApp',
          filename: 'static/chunks/remoteEntry.js',
          runtime: false,
          exposes: {
            './App': './src/remote/app.tsx',
            './Skeleton': './src/skeleton.tsx',
            './ProfileLayout': './src/remote/profile-layout.tsx',
            './ProfilePage': './src/remote/profile-page.tsx',
            './PasswordPage': './src/remote/password-page.tsx',
            './UserPreferencesPage': './src/remote/user-preferences-page.tsx',
            './ProfileAboutPage': './src/remote/profile-page.tsx',
            './ProfilePasswordPage': './src/remote/password-page.tsx',
            './ProfilePreferencesPage': './src/remote/user-preferences-page.tsx',
          },
          shared: {
            react: {
              singleton: true,
              requiredVersion: '^19.0.0',
              strictVersion: false,
              eager: false,
            },
            'react-dom': {
              singleton: true,
              requiredVersion: '^19.0.0',
              strictVersion: false,
              eager: false,
            },
            '@gsrosa/nexploring-ui': {
              singleton: true,
              requiredVersion: false,
              strictVersion: false,
            },
            'lucide-react': {
              singleton: true,
              requiredVersion: '^1.7.0',
              strictVersion: false,
            },
            'react-router-dom': {
              singleton: true,
              requiredVersion: '^7.0.0',
              strictVersion: false,
            },
            '@tanstack/react-query': {
              singleton: true,
              requiredVersion: '^5.0.0',
              strictVersion: false,
            },
            '@trpc/client': {
              singleton: true,
              requiredVersion: '^11.0.0',
              strictVersion: false,
            },
            '@trpc/react-query': {
              singleton: true,
              requiredVersion: '^11.0.0',
              strictVersion: false,
            },
          },
        }),
      );
    }

    return config;
  },
};

export default nextConfig;
