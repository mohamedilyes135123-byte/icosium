import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.inaya.patient',
  appName: '3inaya-patient',
  webDir: 'out',
  server: {
    url: 'https://3inaya-patient.vercel.app',
    cleartext: true
  }
};

export default config;
