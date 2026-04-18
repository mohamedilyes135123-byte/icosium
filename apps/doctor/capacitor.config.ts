import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.inaya.doctor',
  appName: '3inaya-doctor',
  webDir: 'out',
  server: {
    url: 'https://icosium-zvdk.vercel.app',
    cleartext: true,
    allowNavigation: ['icosium-zvdk.vercel.app']
  }
};

export default config;
