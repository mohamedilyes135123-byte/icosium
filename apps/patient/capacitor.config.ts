import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.inaya.patient',
  appName: '3inaya-patient',
  webDir: 'out',
  server: {
    url: 'https://icosium-lssk.vercel.app',
    cleartext: true,
    allowNavigation: ['icosium-lssk.vercel.app']
  }
};

export default config;
