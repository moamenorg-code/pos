import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.rms.pos2',
  appName: 'RMS POS2',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;