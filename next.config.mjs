import withPWAInit from '@ducanh2912/next-pwa';

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {},
  /* config options here */
};

const withPWA = withPWAInit({
  dest: 'public',
  customWorkerDir: 'pwa/worker',
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === 'development',
  workboxOptions: {
    disableDevLogs: true,
  },
});

export default withPWA(nextConfig);
