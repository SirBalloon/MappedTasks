import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.mappedtasks',
  appName: 'MappedTasks',
  webDir: 'dist',
  // The native android/ shell is not committed. Generate it locally with:
  //   npm run cap:add:android
  // then `npm run cap:sync` after each web build.
};

export default config;
