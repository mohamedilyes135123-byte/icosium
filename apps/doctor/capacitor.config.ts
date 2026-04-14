import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.inaya.doctor',
  appName: '3inaya-doctor',
  webDir: 'out',
  server: {
    url: 'https://3inaya-doctor.vercel.app',
    cleartext: true
  }
};

export default config;
