import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.e9e72bf1199f4e01878ee14d3bdd184a',
  appName: 'employee-harmony-toolkit-78',
  webDir: 'dist',
  server: {
    url: 'https://e9e72bf1-199f-4e01-878e-e14d3bdd184a.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    Geolocation: {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 3600000
    }
  }
};

export default config;